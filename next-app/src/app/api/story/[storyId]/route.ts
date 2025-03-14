import { dbConnection } from '@/db/dbConnector';
import { verifyToken } from '@/backend_lib/auth/auth.cookie';
import { hasReadPermission } from '@/backend_lib/story/chapter_permission.lib';
import { IStandardResponse } from '@/types/IApiCommunication';
import { RowDataPacket } from 'mysql2';
import { NextRequest, NextResponse } from 'next/server';
import { ErrorMessage, GetErrorMesage } from '@/constant/error_message';
import { updateStorySchema } from '@/schemes/story.scheme';
import { 
    fetchStoryDetails, 
    fetchStoryChapters, 
    fetchStoryGenres, 
    processChaptersWithImages, 
    updateStoryDetails,
    checkStoryOwnership
} from './story.id.helper';
import { uploadImage } from '@/backend_lib/image_uploading/image_upload.lib';
import { setStandardImageName } from '@/backend_lib/image_uploading/image_namer.lib';
import { validateGenreIds } from '@/backend_lib/genre.lib';


export async function GET(req: NextRequest, { params }: { params: { storyId: string } }) {
    const { storyId } = params;
    const stdRes: IStandardResponse = {};

    // Verify the user's token
    const verifiedRes = await verifyToken(req);
    const isAnonymous = verifiedRes.status !== 200;
    const userId = verifiedRes.status === 200 ? verifiedRes.data.uId : null;

    // Step 1: Fetch the story details
    const rs = await fetchStoryDetails(storyId);
    if (rs.length === 0) {
        stdRes.msg = "Story not found";
        return NextResponse.json(stdRes, { status: 404 });
    }

    // Step 2-4: Fetch and process all story data
    const chapters = await fetchStoryChapters(storyId);
    const genres = await fetchStoryGenres(storyId);
    const chaptersWithImages = await processChaptersWithImages(chapters, isAnonymous, userId);

    // Step 5: Combine story, chapters, and genres into the response
    const data = {
        ...rs[0],
        chapters: chaptersWithImages,
        genres: genres
    };

    return NextResponse.json(data, { status: 200 });
}



export async function PUT(req: NextRequest, { params }: { params: { storyId: string } }) {
    const { storyId } = params;
    const storyIdNumber = Number(storyId);
    
    const stdRes: IStandardResponse = {};

    // Verify the user's token
    const verifiedRes = await verifyToken(req);
    if (verifiedRes.status !== 200) {
        return NextResponse.json(verifiedRes, { status: verifiedRes.status });
    }

    const userId = verifiedRes.data.uId; // Get the authenticated user's ID

    try {
        // Parse formData from the request
        let formData;
        try {
            formData = await req.formData();
        } catch (error: any) {
            stdRes.msg = GetErrorMesage(ErrorMessage.EXPECTED_CONTENT_TYPE_IS_FORM_DATA);
            return NextResponse.json(stdRes, { status: 400 });
        }


        const title = formData.get('title') as string | null;
        const introduction = formData.get('introduction') as string | null;
        const coverImage = formData.get('coverImage') as File | null; // Expecting a File for coverImage
        const genreIds = formData.get('genreIds') as string | null;
        // Validate the input using Zod, checking if coverImage is a file
        const parsed = updateStorySchema.parse({
            title,
            introduction,
            coverImage, // Zod should validate this as a file (optional)
            genreIds
        });
        // parsed.genreIds

        console.log(genreIds);

        // console.log(parsed.genreIds);

        // Step 1: Check if the story exists and fetch the owner
        const [storyCheckRes] = await dbConnection.execute<RowDataPacket[]>(`
            SELECT * FROM Story WHERE sId = ?
        `, [storyIdNumber]);

        if (storyCheckRes.length === 0) {
            stdRes.msg = "Story not found.";
            return NextResponse.json(stdRes, { status: 404 });
        }

        // Step 2: Check if the user is the owner of the story
        const [ownershipCheckRes] = await dbConnection.execute<RowDataPacket[]>(`
            SELECT * FROM Story WHERE sId = ? AND authorId = ?
        `, [storyIdNumber, userId]);

        if (ownershipCheckRes.length === 0) {
            stdRes.msg = "You don't have permission to update this story.";
            return NextResponse.json(stdRes, { status: 403 });
        }

        // Step 3: Handle coverImage upload
        let filename = "";
        if (coverImage && coverImage instanceof File && coverImage.size > 0) {
            try {
                filename = setStandardImageName(coverImage.name, "storyCover");
                const uploadRes = await uploadImage(coverImage, filename);
                
                if (!uploadRes.data?.newFilename) {
                    throw new Error('Failed to get upload filename');
                }
                
                filename = uploadRes.data.newFilename;
            } catch (error: any) {
                console.error('Image upload error:', error);
                throw new Error('Failed to upload image');
            }
        }

        // Parse and validate genreIds
        let genreIdArray: number[] = [];
        if (genreIds) {
            genreIdArray = JSON.parse(genreIds).map(Number);
            const validation = await validateGenreIds(genreIdArray);
            if (!validation.valid) {
                stdRes.msg = "Invalid genre IDs detected";
                stdRes.msg2 = `The following genre IDs are not valid: ${validation.invalidIds.join(", ")}`;
                return NextResponse.json(stdRes, { status: 400 });
            }
        }

        // console.log(genreIdArray);

        // Start transaction for atomic updates
        await dbConnection.beginTransaction();

        try {
            // Update story details
            await updateStoryDetails(storyIdNumber, title, introduction, filename);

            // Update genres if provided
            if (genreIdArray.length > 0) {
                // Remove existing genre associations
                await dbConnection.execute(`
                    DELETE FROM StoryGenre 
                    WHERE storyId = ?
                `, [storyIdNumber]);

                // Insert new genre associations
                for (const genreId of genreIdArray) {
                    await dbConnection.execute(`
                        INSERT INTO StoryGenre (storyId, genreId) 
                        VALUES (?, ?)
                    `, [storyIdNumber, genreId]);
                }
            }

            await dbConnection.commit();
            stdRes.msg = "Story updated successfully";
            return NextResponse.json(stdRes, { status: 200 });

        } catch (error) {
            await dbConnection.rollback();
            throw error;
        }

    } catch (error: any) {
        stdRes.msg = "Error updating story.";
        stdRes.msg2 = error.message;
        console.log(stdRes);
        return NextResponse.json(stdRes, { status: 500 });
    }
}



// delete story
export async function DELETE(req: NextRequest, { params }: { params: { storyId: string } }) {
    const { storyId } = params;
    const storyIdNumber = Number(storyId);
    const stdRes: IStandardResponse = {};

    // Verify the user's token
    const verifiedRes = await verifyToken(req);
    if (verifiedRes.status !== 200) {
        return NextResponse.json(verifiedRes, { status: verifiedRes.status });
    }

    const userId = verifiedRes.data.uId;

    try {
        const isOwner = await checkStoryOwnership(storyIdNumber, userId);
        if (!isOwner) {
            stdRes.msg = "Story not found or you don't have permission to delete it.";
            return NextResponse.json(stdRes, { status: 403 });
        }

        await dbConnection.execute(`
            DELETE FROM Story WHERE sId = ?
        `, [storyIdNumber]);

        stdRes.msg = "Story deleted successfully";
        return NextResponse.json(stdRes, { status: 200 });

    } catch (error: any) {
        stdRes.msg = "Error deleting story.";
        stdRes.msg2 = error.message;
        console.error(error);
        return NextResponse.json(stdRes, { status: 500 });
    }
}