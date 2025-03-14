import { dbConnection } from "@/db/dbConnector";
import { RowDataPacket } from "mysql2";

interface ReviewRow extends RowDataPacket {
    rsId: number;
    rating: number;
    review: string;
    reviewerId: number;
    storyId: number;
    reviewDatetime: Date;
}

export async function getExistingReview(storyId: number, reviewerId: number): Promise<ReviewRow | null> {
    const query = `
        SELECT * FROM ReviewStory
        WHERE storyId = ? AND reviewerId = ?
        LIMIT 1
    `;

    const [rows] = await dbConnection.query<ReviewRow[]>(query, [storyId, reviewerId]);

    // Return the review row if it exists, otherwise return null
    return rows.length > 0 ? rows[0] : null;
}

export async function createReview(rating: number, review: string, reviewerId: number, storyId: number): Promise<number> {
    const query = `
        INSERT INTO ReviewStory (rating, review, reviewerId, storyId, reviewDatetime)
        VALUES (?, ?, ?, ?, NOW())
    `;

    const [result] = await dbConnection.query(query, [rating, review, reviewerId, storyId]);

    // Return the inserted review ID
    return (result as any).insertId;
}

export async function updateReview(rsId: number, rating: number, review: string): Promise<void> {
    const query = `
        UPDATE ReviewStory
        SET rating = ?, review = ?
        WHERE rsId = ?
    `;

    try {
        await dbConnection.query(query, [rating, review, rsId]);
        console.log(`Review with ID ${rsId} updated successfully.`);
    } catch (error: any) {
        console.error(`Error updating review with ID ${rsId}:`, error.message);
        throw new Error('Failed to update review.'); // Re-throw or handle the error as needed
    }
}


// Function to get reviews and associated reviewers by storyId
export async function getReviewsWithReviewersByStoryId(storyId: number): Promise<RowDataPacket[]> {
    const query = `
        SELECT 
            rs.rsId,
            rs.rating,
            rs.review,
            rs.reviewDatetime,
            u.uId AS reviewerId,
            u.username,  -- Adjust this field according to your User table structure
            u.email      -- Include other fields as needed
        FROM 
            ReviewStory AS rs
        JOIN 
            User AS u ON rs.reviewerId = u.uId  -- Adjust table name and join condition as necessary
        WHERE 
            rs.storyId = ?
    `;

    const [rows] = await dbConnection.query<RowDataPacket[]>(query, [storyId]);
    return rows; // Return the list of reviews with reviewer data
}