import { dbConnection } from "@/db/dbConnector";
import { verifyToken } from "@/backend_lib/auth/auth.cookie";
import { IStandardResponse } from "@/types/IApiCommunication";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest, { params }: { params: { chapterId: string } }) {
    const { chapterId } = params;

    // Verify the user's token
    const verifiedRes = await verifyToken(req);
    if (verifiedRes.status !== 200) {
        return NextResponse.json({ msg: verifiedRes.msg }, { status: verifiedRes.status });
    }

    const userId = verifiedRes.data.uId; // Assuming `verifyToken` returns the user ID.

    let stdRes: IStandardResponse = {};
    
    try {
        // Fetch the chapter's price and storyId
        const [chapterResult] = await dbConnection.query<RowDataPacket[]>(`
            SELECT price, storyId FROM Chapter WHERE cId = ?
        `, [chapterId]);
        // console.log(chapterResult)

        if (chapterResult.length == 0) {
            return NextResponse.json({ msg: "Chapter not found" }, { status: 404 });
        }

        const { price: chapterPrice, storyId } = chapterResult[0];

        // Check if the story belongs to the same user (prevent buying own story's chapter)
        const [storyResult] = await dbConnection.query<RowDataPacket[]>(`
            SELECT authorId FROM Story WHERE sId = ?
        `, [storyId]);

        if (storyResult.length && storyResult[0].authorId === userId) {
            return NextResponse.json({ msg: "You cannot purchase a chapter from your own story" }, { status: 409 });
        }

        // Check if the chapter is free
        if (chapterPrice === 0) {
            return NextResponse.json({ msg: "This chapter is free. No need to purchase.", msg2: "Free Chapter"}, { status: 409 });
        }

        // Check if the user already has access to the chapter
        const [permissionResult] = await dbConnection.query<RowDataPacket[]>(`
            SELECT * FROM StoryChapterPermission WHERE chapterId = ? AND userId = ?
        `, [chapterId, userId]);

        if (permissionResult.length > 0) {
            // console.log(permissionResult)
            return NextResponse.json({ msg: "Chapter already purchased or accessible" }, { status: 400 });
        }

        // Fetch user's current credit
        const [userResult] = await dbConnection.query<RowDataPacket[]>(`
            SELECT credit FROM User WHERE uId = ?
        `, [userId]);

        const userCredit = userResult[0].credit;

        // Check if user has enough credits
        if (userCredit < chapterPrice) {
            return NextResponse.json({ msg: "Insufficient credits" }, { status: 400 });
        }

        // Deduct chapter price from user's credits
        await dbConnection.execute(`
            UPDATE User SET credit = credit - ? WHERE uId = ?
        `, [chapterPrice, userId]);

        // Fetch the author's current credit
        const authorId = storyResult[0].authorId; // Get the author's ID
        const [authorResult] = await dbConnection.query<RowDataPacket[]>(`
            SELECT credit FROM User WHERE uId = ?
        `, [authorId]);

        // Credit the author's account
        const authorCredit = authorResult[0].credit + chapterPrice;

        await dbConnection.execute(`
            UPDATE User SET credit = ? WHERE uId = ?
        `, [authorCredit, authorId]);

        // Grant access to the chapter
        await dbConnection.execute(`
            INSERT INTO StoryChapterPermission (chapterId, userId) VALUES (?, ?)
        `, [chapterId, userId]);

        stdRes = { msg: "Chapter purchased successfully" };
        return NextResponse.json(stdRes, { status: 200 });
    } catch (error: any) {
        console.error("Error processing chapter purchase:", error);
        stdRes = { msg: "Error processing chapter purchase", msg2: error.message };
        return NextResponse.json(stdRes, { status: 500 });
    }
}