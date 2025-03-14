import { dbConnection } from "@/db/dbConnector";
import { verifyToken } from "@/backend_lib/auth/auth.cookie";
import { IStandardResponse } from "@/types/IApiCommunication";
import { GenericRowDataPacket } from "@/types/IRowDataPacket";
import { NextRequest, NextResponse } from "next/server";
import { 
    fetchStoryDetails, 
    fetchStoryChapters, 
    fetchStoryGenres, 
    processChaptersWithImages 
} from '../../../story/[storyId]/story.id.helper';
export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    const stdRes: IStandardResponse = {};

    try {
        const userId = parseInt(params.userId);
        const verifiedRes = await verifyToken(request);
        const isOwnUser = verifiedRes.status === 200 && verifiedRes.data?.uId === userId;
        const isAnonymous = verifiedRes.status !== 200;

        // First get all story IDs for this user
        const [storyIds] = await dbConnection.query<GenericRowDataPacket<any>[]>(`
            SELECT sId FROM Story WHERE authorId = ? ORDER BY postedDatetime DESC
        `, [userId]);

        if (!storyIds || storyIds.length === 0) {
            stdRes.msg = "No stories found for this user.";
            return NextResponse.json(stdRes, { status: 404 });
        }

        // Process each story with its details, chapters, and genres
        const processedStories = await Promise.all(storyIds.map(async (story) => {
            const storyId = story.sId.toString();
            const details = await fetchStoryDetails(storyId);
            const chapters = await fetchStoryChapters(storyId);
            const genres = await fetchStoryGenres(storyId);
            
            const processedChapters = await processChaptersWithImages(
                chapters, 
                isAnonymous, 
                verifiedRes.status === 200 ? verifiedRes.data?.uId.toString() : null
            );

            return {
                ...details[0],
                chapters: processedChapters,
                genres: genres.map(g => g.genreName),
                isOwner: isOwnUser
            };
        }));

        stdRes.msg = "Stories retrieved successfully.";
        stdRes.data = processedStories 

        return NextResponse.json(stdRes, { status: 200 });

    } catch (error: any) {
        stdRes.msg = "Error retrieving stories.";
        stdRes.msg2 = error.message;
        console.error(stdRes);
        return NextResponse.json(stdRes, { status: 500 });
    }
}

