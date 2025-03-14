import { dbConnection } from "@/db/dbConnector";
import { IStandardResponse } from "@/types/IApiCommunication";
import { NextRequest, NextResponse } from "next/server";
import { RowDataPacket } from "mysql2";
import { verifyToken } from "@/backend_lib/auth/auth.cookie";

export async function GET(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    const stdRes: IStandardResponse = {};

    try {
        const userId = parseInt(params.userId);
        const verifiedRes = await verifyToken(request);
        const isOwnUser = verifiedRes.status === 200 && verifiedRes.data?.uId === userId;

        // Fetch user data with selected fields
        const [userData] = await dbConnection.query<RowDataPacket[]>(
            `SELECT 
                uId,
                username,
                displayName,
                profilePicUrl
             FROM User 
             WHERE uId = ?`,
            [userId]
        );

        if (!userData || userData.length === 0) {
            stdRes.msg = "User not found";
            return NextResponse.json(stdRes, { status: 404 });
        }

        // Add additional user information
        const processedUser = {
            ...userData[0],
            isOwnProfile: isOwnUser
        };

        stdRes.msg = "User retrieved successfully";
        stdRes.data = processedUser;

        return NextResponse.json(stdRes, { status: 200 });

    } catch (error: any) {
        stdRes.msg = "Error retrieving user data";
        stdRes.msg2 = error.message;
        console.error(stdRes);
        return NextResponse.json(stdRes, { status: 500 });
    }
}