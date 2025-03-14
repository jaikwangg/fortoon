import { RowDataPacket } from 'mysql2';
import { verifyToken } from '@/backend_lib/auth/auth.cookie';
import { uploadImage } from '@/backend_lib/image_uploading/image_upload.lib';
import { ErrorMessage, GetErrorMesage } from '@/constant/error_message';
import { createPostSchema } from '@/schemes/post.scheme';
import { IStandardResponse } from '@/types/IApiCommunication';
import { NextRequest, NextResponse } from 'next/server';
import { addImagesToPost, createPost, deleteAllImagesForPost, filterHiddenPostData, getParentPostById, structurePosts, } from './post.helper';
import { getAllPosts } from './post.helper';
import { ConstructionIcon } from 'lucide-react';
import { checkChapterExists } from '@/backend_lib/story/chapter_permission.lib';



export async function GET(req: NextRequest) {
    const stdRes: IStandardResponse = {};

    try {
        // Get user ID from token if available (optional authentication)
        let userId: number | null = null;
        const verifiedRes = await verifyToken(req);
        if (verifiedRes.status === 200) {
            userId = verifiedRes.data.uId;
        }

        // Step 1: Retrieve all posts and likes from the database
        const posts = await getAllPosts(userId);

        if (!posts || posts.length === 0) {
            stdRes.msg = "No posts found.";
            return NextResponse.json(stdRes, { status: 404 });
        }

        // Step 2: Structure posts into a tree format and filter hidden post data
        const structuredPosts = structurePosts(posts).map(post => filterHiddenPostData(post));

        // Step 3: Return the structured posts in the response
        stdRes.msg = "Posts retrieved successfully.";
        stdRes.data = { posts: structuredPosts };

        return NextResponse.json(stdRes, { status: 200 });
    } catch (error: any) {
        stdRes.msg = "Error retrieving posts.";
        stdRes.msg2 = error.message;
        console.error(stdRes);
        return NextResponse.json(stdRes, { status: 500 });
    }
}




export async function POST(req: NextRequest) {
    const stdRes: IStandardResponse = {};

    // Verify the user's token
    const verifiedRes = await verifyToken(req);
    if (verifiedRes.status !== 200) {
        return NextResponse.json(verifiedRes, { status: verifiedRes.status });
    }

    const userId = verifiedRes.data.uId; // Get the authenticated user's ID

    try {
        // Parse formData from the request
        let formData;
        try {
            formData = await req.formData();
        } catch (error: any) {
            stdRes.msg = GetErrorMesage(ErrorMessage.EXPECTED_CONTENT_TYPE_IS_FORM_DATA);
            console.error(`${error}`);
            return NextResponse.json(stdRes, { status: 400 });
        }

        const files = formData.getAll('images') as File[];
        const title = formData.get('title') as string;
        const content = formData.get('content') as string;
        const parentPostId = formData.get('parentPostId') ? parseInt(formData.get('parentPostId') as string) : null;
        const postType = formData.get('postType') as string;
        let refId = formData.get('refId') ? parseInt(formData.get('refId') as string) : null;

        // Validate postType and refId
        if (postType === 'story' || postType === 'chapter') {
            if (!refId) {
                stdRes.msg = `refId is required when postType is '${postType}'.`;
                return NextResponse.json(stdRes, { status: 400 });
            }
        } else if (postType === 'community') {
            if (refId !== null) {
                stdRes.msg = "Do not input refId when postType is 'community'.";
                return NextResponse.json(stdRes, { status: 400 });
            }
            refId = null; // Ensure refId is null when postType is 'community'
        } else {
            stdRes.msg = "Invalid postType. Allowed values are 'story', 'chapter', or 'community'.";
            return NextResponse.json(stdRes, { status: 400 });
        }

        // Validate incoming data using Zod
        createPostSchema.parse({
            title,
            content,
            parentPostId,
            images: files,
            postType,
            refId,
        });

        // Step 1: Verify that the parent post exists if a parentPostId is provided
        if (parentPostId !== null) {
            const parentPostExists = await getParentPostById(parentPostId);
            if (!parentPostExists) {
                stdRes.msg = "Parent post not found.";
                return NextResponse.json(stdRes, { status: 400 });
            }

            // Verify parent and child post types must match
            if (postType === 'chapter') {
                if (parentPostExists.postType !== postType) {
                    stdRes.msg = `Child post type must match the parent post type. Parent post is of type '${parentPostExists.postType}'.`;
                    return NextResponse.json(stdRes, { status: 400 });
                }
            }
        }

        // Step 2: Check if refId is valid if postType is 'chapter'
        if (postType === 'chapter' && refId !== null) {
            const chapterExists = await checkChapterExists(refId);
            if (!chapterExists) {
                stdRes.msg = `Invalid refId: No chapter found with ID ${refId}.`;
                return NextResponse.json(stdRes, { status: 400 });
            }
        }

        // Step 3: Create the post
        let postId: number;
        try {
            postId = await createPost(title, content, parentPostId, userId, postType, refId);
            console.log(`Post created successfully with ID: ${postId}`);
        } catch (error: any) {
            stdRes.msg = "Error creating post.";
            stdRes.msg2 = error;
            console.error(stdRes);
            return NextResponse.json(stdRes, { status: 500 });
        }

        // Step 4: Upload images to Cloudinary and save URLs
        const uploadedImageUrls = await Promise.all(files.map(async (file) => {
            const filename = `post-image-${new Date().toISOString()}-${file.name}`;
            await uploadImage(file, filename);
            return filename;
        }));

        // Step 5: Insert the uploaded image URLs into the PostImage table
        if (uploadedImageUrls.length > 0) {
            await addImagesToPost(postId, uploadedImageUrls);
        } else {
            console.info("No images to upload in the Post.");
        }

        // Step 6: Return success response with the created post ID
        stdRes.msg = "Post created successfully";
        stdRes.data = { postId };

        return NextResponse.json(stdRes, { status: 201 });

    } catch (error: any) {
        stdRes.msg = "Error creating post.";
        stdRes.msg2 = error;
        console.error(stdRes);
        return NextResponse.json(stdRes, { status: 500 });
    }
}