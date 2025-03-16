import { dbConnection } from '@/db/dbConnector';
import { verifyToken } from '@/backend_lib/auth/auth.cookie';
import { IStandardResponse } from '@/types/IApiCommunication';
import { NextRequest, NextResponse } from 'next/server';
import { checkUserOwnPost } from '../../post.helper';

export async function GET(req: NextRequest, { params }: { params: { postId: string } }) {
    const { postId } = params;
    const stdRes: IStandardResponse = {};

    // Verify the user's token
    const verifiedRes = await verifyToken(req);
    if (verifiedRes.status !== 200) {
        return NextResponse.json(verifiedRes, { status: verifiedRes.status });
    }

    const userId = verifiedRes.data.uId;

    try {
        // Check if post exists and belongs to user
        const hasPermission = await checkUserOwnPost(postId, userId);
        if (!hasPermission) {
            stdRes.msg = "Post not found or you don't have permission.";
            return NextResponse.json(stdRes, { status: 403 });
        }

        // Update post to hidden
        await dbConnection.execute(`
            UPDATE Post SET hidden = true WHERE pId = ?
        `, [postId]);

        stdRes.msg = "Post hidden successfully";
        return NextResponse.json(stdRes, { status: 200 });

    } catch (error: unknown) {
        let errorMessage = "An unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        stdRes.msg = "Error hiding post";
        stdRes.msg2 = errorMessage;
        return NextResponse.json(stdRes, { status: 500 });
    }
}



export async function DELETE(req: NextRequest, { params }: { params: { postId: string } }) {
    const { postId } = params;
    const stdRes: IStandardResponse = {};

    // Verify the user's token
    const verifiedRes = await verifyToken(req);
    if (verifiedRes.status !== 200) {
        return NextResponse.json(verifiedRes, { status: verifiedRes.status });
    }

    const userId = verifiedRes.data.uId;

    try {
        // Check if post exists and belongs to user
        const hasPermission = await checkUserOwnPost(postId, userId);
        if (!hasPermission) {
            stdRes.msg = "Post not found or you don't have permission.";
            return NextResponse.json(stdRes, { status: 403 });
        }

        // Update post to unhidden
        await dbConnection.execute(`
            UPDATE Post SET hidden = false WHERE pId = ?
        `, [postId]);

        stdRes.msg = "Post unhidden successfully";
        return NextResponse.json(stdRes, { status: 200 });

    } catch (error: unknown) {
        let errorMessage = "An unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        stdRes.msg = "Error unhiding post";
        stdRes.msg2 = errorMessage;
        return NextResponse.json(stdRes, { status: 500 });
    }
}