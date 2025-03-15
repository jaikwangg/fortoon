import { dbConnection } from "@/db/dbConnector";
import { verifyToken } from "@/backend_lib/auth/auth.cookie";
// import { hasReadPermission } from '@/backend_lib/story/chapter_permission.lib';
import { IStandardResponse } from "@/types/IApiCommunication";
import { GenericRowDataPacket } from "@/types/IRowDataPacket";
import { NextRequest, NextResponse } from "next/server";
import { processChaptersWithImages } from '../[storyId]/story.id.helper';

export async function GET(req: NextRequest) {
    const verifiedRes = await verifyToken(req);
    if (verifiedRes.status !== 200) {
        return NextResponse.json({
            msg: verifiedRes.msg
        }, { status: verifiedRes.status });
    }
    
    const userId = verifiedRes.data.uId;
    const isAnonymous = false;

    try {
        // Get all stories that have permissions
        let [accessibleStories,] = await dbConnection.query<GenericRowDataPacket<any>[]>(
            `
            SELECT DISTINCT s.* 
            FROM Story s
            JOIN Chapter c ON s.sId = c.storyId
            JOIN StoryChapterPermission scp ON c.cId = scp.chapterId
            WHERE scp.userId = ?
            `,
            [userId]
        );

        // Filter stories and fetch details
        const ret = await Promise.all(
            accessibleStories.map(async (story) => {
                const storyId = story.sId;

                // Fetch chapters
                let [chapters,] = await dbConnection.query<GenericRowDataPacket<any>[]>(
                    `
                    SELECT DISTINCT c.* 
                    FROM Chapter c
                    JOIN StoryChapterPermission scp ON c.cId = scp.chapterId
                    WHERE c.storyId = ? AND scp.userId = ?
                    ORDER BY c.chapterSequence
                    `,
                    [storyId, userId]
                );

                // Process chapters with images using the existing helper function
                const chaptersWithImages = await processChaptersWithImages(chapters, isAnonymous, userId);
                // console.log(chaptersWithImages)

                // Fetch genres
                let [genres,] = await dbConnection.query<GenericRowDataPacket<any>[]>(
                    `
                    SELECT g.gId, g.genreName 
                    FROM Genre g
                    JOIN StoryGenre sg ON g.gId = sg.genreId
                    WHERE sg.storyId = ?
                    `,
                    [storyId]
                );

                return {
                    ...story,
                    chapters: chaptersWithImages,
                    genres
                };
            })
        );

        const stdRes: IStandardResponse = {
            data: ret
        };

        return NextResponse.json(stdRes, {
            status: 200
        });

    } catch (error: any) {
        console.error(error);
        return NextResponse.json({
            msg: "Error fetching accessible stories",
            msg2: error.message
        }, {
            status: 500
        });
    }
}