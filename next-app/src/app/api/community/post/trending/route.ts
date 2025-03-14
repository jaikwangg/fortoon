import { verifyToken } from '@/backend_lib/auth/auth.cookie';
import { IStandardResponse } from '@/types/IApiCommunication';
import { NextRequest, NextResponse } from 'next/server';
import { filterHiddenPostData, structurePosts } from '../post.helper';
import { RowDataPacket } from 'mysql2';
import { dbConnection } from '@/db/dbConnector';

export async function GET(req: NextRequest) {
    const stdRes: IStandardResponse = {};

    try {
        // Get user ID from token if available (optional authentication)
        let userId: number | null = null;
        const verifiedRes = await verifyToken(req);
        if (verifiedRes.status === 200) {
            userId = verifiedRes.data.uId;
        }

        // Get trending posts (posts with most likes in the last 7 days)
        const [posts] = await dbConnection.query<RowDataPacket[]>(`
            SELECT 
                p.*,
                COUNT(DISTINCT l.id) as likeCount,
                GROUP_CONCAT(DISTINCT pi.imageUrl) as imageUrls,
                ${userId ? '(SELECT COUNT(*) FROM PostInteraction WHERE postId = p.id AND userId = ?) > 0' : 'FALSE'} as isLiked
            FROM Post p
            LEFT JOIN PostInteraction l ON p.id = l.postId AND l.createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            LEFT JOIN PostImage pi ON p.id = pi.postId
            GROUP BY p.id
            ORDER BY likeCount DESC, p.createdAt DESC
            LIMIT 20
        `, userId ? [userId] : []);

        if (!posts || posts.length === 0) {
            stdRes.msg = "No trending posts found.";
            return NextResponse.json(stdRes, { status: 404 });
        }

        // Structure posts and filter hidden data
        const structuredPosts = structurePosts(posts).map(post => filterHiddenPostData(post));

        stdRes.msg = "Trending posts retrieved successfully.";
        stdRes.data = { posts: structuredPosts };

        return NextResponse.json(stdRes, { status: 200 });
    } catch (error: any) {
        stdRes.msg = "Error retrieving trending posts.";
        stdRes.msg2 = error.message;
        console.error(stdRes);
        return NextResponse.json(stdRes, { status: 500 });
    }
}