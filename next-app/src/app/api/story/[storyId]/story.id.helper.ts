import { ResultSetHeader } from 'mysql2';
import { dbConnection } from "@/db/dbConnector";
import { RowDataPacket } from 'mysql2';
import { hasReadPermission } from '@/backend_lib/story/chapter_permission.lib';

// Helper function to update story details
export async function updateStoryDetails(
    storyId: number, 
    title: string | null, 
    introduction: string | null, 
    coverImageUrl: string | null
) {
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (title) {
        updateFields.push("title = ?");
        updateValues.push(title);
    }

    if (introduction) {
        updateFields.push("introduction = ?");
        updateValues.push(introduction);
    }

    if (coverImageUrl) {
        updateFields.push("coverImageUrl = ?");
        updateValues.push(coverImageUrl);
    }

    if (updateFields.length > 0) {
        updateValues.push(storyId); // Add storyId as the last parameter for the WHERE clause
        const query = `UPDATE Story SET ${updateFields.join(", ")} WHERE sId = ?`;
        await dbConnection.execute<ResultSetHeader>(query, updateValues);
    }
}

export async function fetchStoryDetails(storyId: string) {
    const [rs] = await dbConnection.query<RowDataPacket[]>(`
        SELECT 
            s.*,
            u.displayName AS authorDisplayName
        FROM 
            User u 
        JOIN
            Story s ON u.uId = s.authorId
        WHERE 
            s.sId = ?
    `, [storyId]);
    
    return rs;
}

export async function fetchStoryChapters(storyId: string) {
    const [chapterRs] = await dbConnection.query<RowDataPacket[]>(`
        SELECT * 
        FROM Chapter c
        WHERE c.storyId = ?  
    `, [storyId]);
    
    return chapterRs;
}

export async function fetchStoryGenres(storyId: string) {
    const [genreRs] = await dbConnection.query<RowDataPacket[]>(`
        SELECT g.gId, g.genreName 
        FROM Genre g
        JOIN StoryGenre sg ON g.gId = sg.genreId
        WHERE sg.storyId = ?
    `, [storyId]);
    
    return genreRs;
}

export async function fetchChapterImages(chapterId: number) {
    const [imageRs] = await dbConnection.query<RowDataPacket[]>(`
        SELECT imageSequenceNumber, url
        FROM ChapterImage ci
        WHERE ci.chapterId = ?  
    `, [chapterId]);
    
    return imageRs;
}

export async function processChaptersWithImages(chapters: RowDataPacket[], isAnonymous: boolean, userId: string | null) {
    return Promise.all(chapters.map(async (chap) => {
        const chapterId = chap.cId;
        let images: any[] = [];

        if (isAnonymous && chap.price === 0) {
            images = await fetchChapterImages(chapterId);
        }
        else if (userId) {
            const isReadable = await hasReadPermission(userId, chapterId);
            if (isReadable) {
                images = await fetchChapterImages(chapterId);
            }
        }

        return {
            ...chap,
            images
        };
    }));
}

export async function checkStoryOwnership(storyId: number, userId: string) {
    const [ownershipCheckRes] = await dbConnection.execute<RowDataPacket[]>(`
        SELECT * FROM Story WHERE sId = ? AND authorId = ?
    `, [storyId, userId]);

    return ownershipCheckRes.length > 0;
}


