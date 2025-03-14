import { dbConnection } from "@/db/dbConnector";
import { verifyToken } from "@/backend_lib/auth/auth.cookie";
import { IStandardResponse } from "@/types/IApiCommunication";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // Verify the user's token
    const verifiedRes = await verifyToken(req);
    if (verifiedRes.status !== 200) {
        return NextResponse.json({ msg: verifiedRes.msg }, { status: verifiedRes.status });
    }

    const userId = verifiedRes.data.uId;
    let stdRes: IStandardResponse = {};

    // Fetch user's current balance
    const [userResult] = await dbConnection.query<RowDataPacket[]>(`
            SELECT credit FROM User WHERE uId = ?
        `, [userId]);

    if (!userResult[0]) {
        return NextResponse.json({ msg: "User not found." }, { status: 404 });
    }

    const currentCredit = userResult[0].credit;
    
    stdRes = { 
        msg: "Balance retrieved successfully.", 
        data: { balance: currentCredit } 
    };
    return NextResponse.json(stdRes, { status: 200 });
}