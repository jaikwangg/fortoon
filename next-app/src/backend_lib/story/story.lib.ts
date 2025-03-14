import { dbConnection } from "@/db/dbConnector";
import { RowDataPacket } from "mysql2";

export async function getStoryById(storyId: number): Promise<{ authorId: number } | null> {
    const query = `
        SELECT authorId FROM Story
        WHERE sId = ?
        LIMIT 1
    `;

    const [rows] = await dbConnection.query<RowDataPacket[]>(query, [storyId]);

    if (rows.length > 0) {
        return rows[0] as { authorId: number };
    }

    return null; // Story not found
}

export async function checkStoryExists(storyId: number): Promise<boolean> {
    const query = `
        SELECT COUNT(*) as count 
        FROM Story 
        WHERE sId = ?
        LIMIT 1
    `;

    const [rows] = await dbConnection.query<RowDataPacket[]>(query, [storyId]);
    return (rows[0] as { count: number }).count > 0;
}