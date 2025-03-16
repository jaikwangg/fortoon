import { NextRequest, NextResponse } from 'next/server';
import { ResultSetHeader } from 'mysql2';
import { verifyToken } from '@/backend_lib/auth/auth.cookie';
import { IStandardResponse } from '@/types/IApiCommunication';
import { dbConnection } from '@/db/dbConnector';
import { checkPostExisted, countPostLikes,  } from '@/backend_lib/post/post.lib';

export async function GET(req: NextRequest, { params }: { params: { postId: string } }) {
    const postId = parseInt(params.postId, 10); // Extract and parse postId from request params
    const isPostExisted = await checkPostExisted(postId)
    const stdRes : IStandardResponse = {}

    if (isPostExisted) {
        const likeCount = await countPostLikes(postId)
        stdRes.msg = "Post liked count retrieved successfully."
        stdRes.data = {
            likeCount
        }
        stdRes.status = 200
    } else {
        stdRes.msg = `Post not existed.`
        stdRes.status = 404
    }
    return NextResponse.json(stdRes, {status: stdRes.status})
}

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
    const stdRes: IStandardResponse = {};

    // Step 1: Verify the user's token
    const verifiedRes = await verifyToken(req);
    if (verifiedRes.status !== 200) {
        return NextResponse.json(verifiedRes, { status: verifiedRes.status });
    }

    const userId = verifiedRes.data.uId; // Get the authenticated user's ID
    const postId = parseInt(params.postId, 10); // Extract and parse postId from request params

    // console.log(postId)
    // Step 2: Check if the post exists
    try {
        // const [post] = await dbConnection.query<RowDataPacket[]>('SELECT pId FROM Post WHERE pId = ?', [postId]);
        const isPostExisted = await checkPostExisted(postId)
        // console.log(post[0])
        // if (!post.length) {
        if (!isPostExisted) {
            stdRes.msg = `Post with ID ${postId} not found.`;
            return NextResponse.json(stdRes, { status: 404 });
        }
    } catch (error: unknown) {
        let errorMessage = "An unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        stdRes.msg = 'Error checking post existence.';
        stdRes.msg2 = errorMessage;
        return NextResponse.json(stdRes, { status: 500 });
    }


    // Step 3: Attempt to add the like if it doesn't already exist
    // console.log(userId)
    // console.log(postId)
    try {
        await dbConnection.query(
            'INSERT INTO PostInteraction (postId, likerId) VALUES (?, ?)',
            [postId, userId]
        );
        stdRes.msg = 'Post liked successfully.';
        return NextResponse.json(stdRes, { status: 201 });
    } catch (error: any) {
        if (error.code === 'ER_DUP_ENTRY') {
            stdRes.msg = 'You have already liked this post.';
            return NextResponse.json(stdRes, { status: 400 });
        }
        stdRes.msg = 'Error liking the post.';
        stdRes.msg2 = error.message;
        return NextResponse.json(stdRes, { status: 500 });
    }
}


// DELETE method to unlike a post
export async function DELETE(req: NextRequest, { params }: { params: { postId: string } }) {
    const stdRes: IStandardResponse = {};

    // Step 1: Verify the user's token
    const verifiedRes = await verifyToken(req);
    if (verifiedRes.status !== 200) {
        return NextResponse.json(verifiedRes, { status: verifiedRes.status });
    }

    const userId = verifiedRes.data.uId; // Get the authenticated user's ID
    const postId = parseInt(params.postId, 10); // Extract and parse postId from request params

    // Step 2: Check if the post exists
    const isPostExisted = await checkPostExisted(postId)
    if (!isPostExisted) {
        stdRes.msg = 'Post to delete not found';
        return NextResponse.json(stdRes, { status: 404 });
    }

    // Step 3: Attempt to remove the like
    try {
        const [result, ] = await dbConnection.query<ResultSetHeader>(
            'DELETE FROM PostInteraction WHERE postId = ? AND likerId = ?',
            [postId, userId]
        );

        if (result.affectedRows === 0) {
            stdRes.msg = 'You have not liked this post.';
            return NextResponse.json(stdRes, { status: 400 });
        }

        stdRes.msg = 'Post unliked successfully.';
        return NextResponse.json(stdRes, { status: 200 });
    } catch (error: any) {
        stdRes.msg = 'Error unliking the post.';
        stdRes.msg2 = error.message;
        return NextResponse.json(stdRes, { status: 500 });
    }
}