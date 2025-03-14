import { dbConnection } from "@/db/dbConnector";
import { verifyToken } from "@/backend_lib/auth/auth.cookie";
import { IStandardResponse } from "@/types/IApiCommunication";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    // Verify the user's token
    const verifiedRes = await verifyToken(req);
    if (verifiedRes.status !== 200) {
        return NextResponse.json({ msg: verifiedRes.msg }, { status: verifiedRes.status });
    }

    const userId = verifiedRes.data.uId; // Assuming `verifyToken` returns the user ID.
    const { amount } = await req.json(); // Get the deposit amount from the request body

    let stdRes: IStandardResponse = {};

    // Validate input
    if (!amount || typeof amount !== 'number' || amount <= 0) {
        return NextResponse.json({ msg: "Invalid deposit amount." }, { status: 400 });
    }

    // Fetch current user balance
    const [userResult] = await dbConnection.query<RowDataPacket[]>(`
            SELECT credit FROM User WHERE uId = ?
        `, [userId]);

    const currentCredit = userResult[0].credit;

    // Update user's credit with the deposit amount
    await dbConnection.execute(`
            UPDATE User SET credit = credit + ? WHERE uId = ?
        `, [amount, userId]);

    const data = { newBalance: currentCredit + amount }
    stdRes = { msg: "Deposit successful.", data };
    return NextResponse.json(stdRes, { status: 200 })
}