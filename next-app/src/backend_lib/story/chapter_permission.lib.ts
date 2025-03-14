import { dbConnection } from '@/db/dbConnector';
import { RowDataPacket } from 'mysql2';

export async function hasReadPermission(readerId: string, chapterId: string): Promise<boolean> {
    // First, check if the chapter is free or if reader is the owner
    const [chapterResult] = await dbConnection.query<RowDataPacket[]>(`
        SELECT c.price, s.authorId 
        FROM Chapter c
        JOIN Story s ON c.storyId = s.sId
        WHERE c.cId = ?
    `, [chapterId]);

    // If chapter not found, return false
    if (chapterResult.length === 0) {
        return false; 
    }

    const { price, authorId } = chapterResult[0];

    // If reader is the author, grant permission
    if (authorId === readerId) {
        return true;
    }

    // If the chapter is free, grant permission
    if (price === 0) {
        return true;
    }

    // Now check the permission from the StoryChapterPermission table
    const [permissionResult] = await dbConnection.query<RowDataPacket[]>(`
        SELECT * FROM StoryChapterPermission 
        WHERE chapterId = ? AND userId = ?
    `, [chapterId, readerId]);

    return permissionResult.length > 0; // If there's a record, the user has permission
}

// Helper function to check if the Chapter exists
export async function checkChapterExists(refId: number) {
    const [rows]: [RowDataPacket[], any] = await dbConnection.execute(`
        SELECT * FROM Chapter WHERE cId = ?
    `, [refId]);
    return rows.length > 0;
}