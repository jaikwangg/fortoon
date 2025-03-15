import { dbConnection } from '@/db/dbConnector';
import { verifyToken } from '@/backend_lib/auth/auth.cookie';
import { uploadImage } from '@/backend_lib/image_uploading/image_upload.lib';
import { hasReadPermission } from '@/backend_lib/story/chapter_permission.lib';
import { IStandardResponse } from '@/types/IApiCommunication';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
// import { MissingSlotContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(req: NextRequest, { params }: { params: {
        storyId: string } 
}) {
    const { storyId } = params;

    const stdRes: IStandardResponse = {};

    // Verify the user's token
    const verifiedRes = await verifyToken(req);
    const userId = verifiedRes.status === 200 ? verifiedRes.data.uId : null; // Get userId only if verified

    // Fetch chapters for the current story
    let [chapterRs] = await dbConnection.query<RowDataPacket[]>(`
        SELECT * 
        FROM Chapter c
        WHERE c.storyId = ?  
    `, [storyId]);

    // Process chapters and check read permissions
    const chaptersWithImages = await Promise.all(chapterRs.map(async (chap) => {
        const chapterId = chap.cId;

        // Initialize images as an empty array
        let images: any[] = [];

        // If the user is authenticated, check if they have read permission
        if (userId) {
            const isReadable = await hasReadPermission(userId, chapterId);
            if (isReadable) {
                // Fetch images if the user has permission
                let [imageRs] = await dbConnection.query<RowDataPacket[]>(`
                    SELECT imageSequenceNumber, url
                    FROM ChapterImage ci
                    WHERE ci.chapterId = ?  
                `, [chapterId]);
                images = imageRs; // Set images if user has permission
            }
        }

        // Return the chapter data with images (or empty array if no access)
        return {
            ...chap,
            images // Will be an empty array if user doesn't have access
        };
    }));

    // Filter out chapters without images for anonymous users
    const validChapters = chaptersWithImages.filter(chapter => chapter.images.length > 0 || userId === null);

    const data = {
        storyId,
        chapters: validChapters // Include chapters with or without images
    };

    return NextResponse.json(data, { status: 200 });
}


type TReqParams =  {
    params: {
        storyId: string
    }
}


// NOTE Create Whole Story by MANY CHAPTERS IMAGE
export async function POST(req: NextRequest, { params }: TReqParams ) {
    const { storyId } = params;

    const verifiedRes = await verifyToken(req)
    if (verifiedRes.status != 200) {
        // console.log(verifiedRes)
        return NextResponse.json({
            msg: verifiedRes.msg
        }, { status: verifiedRes.status });
    }
    const stdRes : IStandardResponse  = {}

    const userIdFromCookie = verifiedRes.data.uId
    



    let formData : FormData
    try {
        formData = await req.formData()
    } catch (error) {
        stdRes.msg = `Content-Type was not one of "multipart/form-data" or "application/x-www-form-urlencoded`
        stdRes.msg2 = error
        console.error(stdRes)
        return NextResponse.json(stdRes, { status: 400 });
    }
    const images = formData.getAll("imageChapterFiles")

    const price = formData.get("price")
    if (!price) {
        stdRes.msg = "Required price."
        return NextResponse.json(stdRes, { status: 400 });
    }
    let priceNumber : Number | null
    try {
        priceNumber = Number(price)
    } catch (error) {
        stdRes.msg = "Price must be a number."
        return NextResponse.json(stdRes, { status: 400 });        
    }


    // images = images as File[]
    // console.log(images)
    for (let index = 0; index < images.length; index++) {
        const img = images[index];
        if (!(img as File)) {
            stdRes.msg = "A element in imageChapterFiles is not File type."
            return NextResponse.json(stdRes, { status: 400 });
        }
    }
    if (images.length == 0) {
        stdRes.msg = "Required imageChapterFiles (list of image chapter)."
        return NextResponse.json(stdRes, { status: 400 });
    }



    
    // console.log(verifiedRes)
    const [rowCountExistedStory] = await dbConnection.query<RowDataPacket[]>(
        `SELECT count(*) as storyCount
        from Story
        where sId = ${storyId}
        `,
    );
    const storyCount : Number = rowCountExistedStory[0].storyCount
    // console.log()
    if (storyCount == 0) {
        stdRes.msg = `Unfound story so can not create chapters.`
        return NextResponse.json(stdRes, { status: 400 });
    }


    const [rowCheckPermissionToWriteStory] = await dbConnection.query<RowDataPacket[]>(
        `SELECT count(*) as ownedStoryCount
        from Story
        where authorId = ${userIdFromCookie}
        and sId = ${storyId}
        `,
    );
    const ownedStoryCount : Number = rowCheckPermissionToWriteStory[0].ownedStoryCount
    console.log(rowCheckPermissionToWriteStory)
    if (ownedStoryCount == 0) {
        stdRes.msg = `You are not Author of this Story, No Allowd Create Chapters`
        return NextResponse.json(stdRes, { status: 400 });
    }

    const chapterName = formData.get("chapterName")

    if (!chapterName) {
        stdRes.msg = "Require chapterName."
        return NextResponse.json(stdRes, { status: 400 });
    }


    const [rs] = await dbConnection.query<ResultSetHeader>(`
            INSERT INTO Chapter (
                name,
                storyId,
                chapterSequence,
                price
            )
            SELECT 
                "${chapterName}",
                "${storyId}",
                COALESCE(MAX(c.chapterSequence), 0) + 1,
                ${priceNumber}
            FROM Chapter c
            WHERE c.storyId = ${storyId}
        ` 
    )
    const chapterId = rs.insertId;  // Get the newly created chapter's ID
    try {
        const curr = new Date()

        // await uploadImage(parsed.coverImage, filename)
        // Prepare values for bulk insert
        // const chapterImageValues = images.map(
        

        const chapterImageValues = await Promise.all(images.map(async (img, index) => {
            // return  `(${chapterId}, ${index + 1}), {}`
            const file = img as File
            const imageName = `chapter-img-${curr.toString()}-${file.name}`

            // const file 
            // const x = img as File
            // x.streamo
            // const file = img as File



            const xStdRes = await uploadImage(file, imageName)
            const filename = xStdRes.data.newFilename
                // (_, index) => 

            // return `(${chapterId}, ${index + 1}, '${imageName}')`; // Assuming uploadResult has a `url` property
            return `(${chapterId}, ${index + 1}, '${filename}')`;
        }))
    
        // Perform the batch insert
        const [rsChapterImage] = await dbConnection.query<ResultSetHeader>(`
            INSERT INTO ChapterImage (chapterId, imageSequenceNumber, url)
            VALUES ${chapterImageValues}
        `);
        console.log(rsChapterImage)
    
        stdRes.msg = `Chapter '${chapterName}' created in Story ${storyId} with ${images.length} images.`;
        return NextResponse.json(stdRes, { status: 200 });
    } catch (error:any) {
        // Catch any errors that occur during the insertion
        console.error(error)
        stdRes.msg = `Error while inserting chapter images: ${error.message}`;
        console.error("Error during ChapterImage insert:", error);
    
        return NextResponse.json(stdRes, { status: 500 });
    }

}