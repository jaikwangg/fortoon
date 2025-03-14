import { dbConnection } from '@/db/dbConnector';
import { verifyToken } from '@/backend_lib/auth/auth.cookie';
import { uploadImage } from '@/backend_lib/image_uploading/image_upload.lib';
import { IStandardResponse } from '@/types/IApiCommunication';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';
import { setStandardImageName } from '@/backend_lib/image_uploading/image_namer.lib';

// todo : GET request to get chapter data  if have all permissions to read  or he is the author
export async function GET(req: NextRequest, { params }: { params: { chapterId: string, storyId: string } }) {
    const { chapterId, storyId } = params;
    const stdRes: IStandardResponse = {};

    // Verify user token
    const verifiedRes = await verifyToken(req);
    const userIdFromCookie = verifiedRes.data?.uId;

    try {
        // Get chapter data with author information and check permissions
        const [chapterData] = await dbConnection.query<RowDataPacket[]>(`
            SELECT 
                c.*,
                s.authorId,
                CASE 
                    WHEN s.authorId = ? THEN true
                    WHEN c.price = 0 THEN true
                    ELSE false
                END as hasAccess
            FROM Chapter c
            JOIN Story s ON c.storyId = s.sId
            WHERE c.cId = ? AND c.storyId = ?
        `, [userIdFromCookie, chapterId, storyId]);

        if (chapterData.length === 0) {
            stdRes.msg = "Chapter not found";
            return NextResponse.json(stdRes, { status: 404 });
        }

        const chapter = chapterData[0];
        
        if (!chapter.hasAccess) {
            stdRes.msg = "You don't have permission to view this chapter";
            return NextResponse.json(stdRes, { status: 403 });
        }

        // Get chapter images
        const [chapterImages] = await dbConnection.query<RowDataPacket[]>(`
            SELECT imageSequenceNumber, url
            FROM ChapterImage
            WHERE chapterId = ?
            ORDER BY imageSequenceNumber
        `, [chapterId]);

        stdRes.data = {
            ...chapter,
            images: chapterImages
        };
        
        return NextResponse.json(stdRes, { status: 200 });

    } catch (error: any) {
        console.error('Error fetching chapter:', error);
        stdRes.msg = `Error fetching chapter: ${error.message}`;
        stdRes.msg2 = error;
        return NextResponse.json(stdRes, { status: 500 });
    }
} 


export async function PUT(req: NextRequest, { params }: { params: { chapterId: string } }) {
    const { chapterId } = params;
    const stdRes: IStandardResponse = {};

    // Verify user token
    const verifiedRes = await verifyToken(req);
    if (verifiedRes.status !== 200) {
        return NextResponse.json({
            msg: verifiedRes.msg
        }, { status: verifiedRes.status });
    }
    const userIdFromCookie = verifiedRes.data.uId;

    // Parse form data
    let formData: FormData;
    try {
        formData = await req.formData();
    } catch (error) {
        stdRes.msg = `Content-Type was not one of "multipart/form-data" or "application/x-www-form-urlencoded"`;
        stdRes.msg2 = error;
        console.error(stdRes);
        return NextResponse.json(stdRes, { status: 400 });
    }

    // Get form entries and organize them by sequence
    const entries = Array.from(formData.entries());
    const imageEntries: { sequence: number, type: 'url' | 'file', value: string | File }[] = [];

    // Process each entry to maintain sequence
    entries.forEach(([key, value], index) => {
        if (key === 'imageChapterFiles') {
            imageEntries.push({
                sequence: index,
                type: 'file',
                value: value as File
            });
        } else if (key.startsWith('existingImages')) {
            imageEntries.push({
                sequence: index,
                type: 'url',
                value: value as string
            });
        }
    });

    console.log('Processed image entries:', imageEntries);

    // Sort by sequence number
    imageEntries.sort((a, b) => a.sequence - b.sequence);

    // Get optional fields
    const chapterName = formData.get("chapterName") as string | null;
    const price = formData.get("price") as string | null;

    // Build update query dynamically based on provided fields
    let updateFields: string[] = [];
    let updateValues: any[] = [];

    if (chapterName !== null) {
        updateFields.push('name = ?');
        updateValues.push(chapterName);
    }

    if (price !== null) {
        let priceNumber: number | null = null;
        try {
            priceNumber = Number(price);
            updateFields.push('price = ?');
            updateValues.push(priceNumber);
        } catch (error) {
            console.warn('Invalid price format, skipping price update');
        }
    }

    try {
        await dbConnection.beginTransaction();

        // Only update chapter details if there are fields to update
        if (updateFields.length > 0) {
            updateValues.push(chapterId);
            await dbConnection.query<ResultSetHeader>(`
                UPDATE Chapter 
                SET ${updateFields.join(', ')}
                WHERE cId = ?
            `, updateValues);
        }

        // Delete existing images
        await dbConnection.query(`
            DELETE FROM ChapterImage 
            WHERE chapterId = ?
        `, [chapterId]);

        // Process all images maintaining sequence
        const processedImages = await Promise.all(
            imageEntries.map(async (entry) => {
                if (entry.type === 'url') {
                    return {
                        sequence: entry.sequence,
                        url: entry.value as string
                    };
                } else {
                    const file = entry.value as File;
                    const imageName = setStandardImageName(file.name, 'chapterImage');
                    const uploadResult = await uploadImage(file, imageName);
                    
                    if (!uploadResult.data?.newFilename) {
                        throw new Error('Failed to upload image');
                    }

                    return {
                        sequence: entry.sequence,
                        url: uploadResult.data.newFilename
                    };
                }
            })
        );

        // Insert images with their correct sequence
        if (processedImages.length > 0) {
            const values = processedImages.map(img => 
                `(${chapterId}, ${img.sequence}, ${dbConnection.escape(img.url)})`
            ).join(',');

            await dbConnection.query<ResultSetHeader>(`
                INSERT INTO ChapterImage (chapterId, imageSequenceNumber, url)
                VALUES ${values}
            `);
        }

        await dbConnection.commit();

        stdRes.msg = `Chapter updated successfully with ${processedImages.length} images`;
        return NextResponse.json(stdRes, { status: 200 });

    } catch (error: any) {
        await dbConnection.rollback();
        
        console.error('Error updating chapter:', error);
        stdRes.msg = `Error updating chapter: ${error.message}`;
        stdRes.msg2 = error;
        return NextResponse.json(stdRes, { status: 500 });
    }
}












export async function DELETE(req: NextRequest, { params }: { params: { chapterId: string } }) {
    const { chapterId } = params;
    const stdRes: IStandardResponse = {};

    // Verify user token
    const verifiedRes = await verifyToken(req);
    if (verifiedRes.status !== 200) {
        return NextResponse.json({
            msg: verifiedRes.msg
        }, { status: verifiedRes.status });
    }
    const userIdFromCookie = verifiedRes.data.uId;

    // Validate chapter ownership
    const [chapterOwnership] = await dbConnection.query<RowDataPacket[]>(`
        SELECT s.authorId 
        FROM Chapter c
        JOIN Story s ON c.storyId = s.sId
        WHERE c.cId = ?
    `, [chapterId]);

    if (chapterOwnership.length === 0) {
        stdRes.msg = "Chapter not found";
        return NextResponse.json(stdRes, { status: 404 });
    }

    if (chapterOwnership[0].authorId !== userIdFromCookie) {
        stdRes.msg = "You don't have permission to delete this chapter";
        return NextResponse.json(stdRes, { status: 403 });
    }

    try {
        // Start transaction
        await dbConnection.beginTransaction();

        // Delete chapter images
        await dbConnection.query(`
            DELETE FROM ChapterImage 
            WHERE chapterId = ?
        `, [chapterId]);

        // Delete chapter
        await dbConnection.query(`
            DELETE FROM Chapter 
            WHERE cId = ?
        `, [chapterId]);

        // Commit transaction
        await dbConnection.commit();

        stdRes.msg = "Chapter deleted successfully";
        return NextResponse.json(stdRes, { status: 200 });

    } catch (error: any) {
        // Rollback transaction on error
        await dbConnection.rollback();
        
        console.error('Error deleting chapter:', error);
        stdRes.msg = `Error deleting chapter: ${error.message}`;
        stdRes.msg2 = error;
        return NextResponse.json(stdRes, { status: 500 });
    }
}
