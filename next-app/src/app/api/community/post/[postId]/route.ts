import { verifyToken } from '@/backend_lib/auth/auth.cookie';
import { uploadImage } from '@/backend_lib/image_uploading/image_upload.lib';
import { ErrorMessage, GetErrorMesage } from '@/constant/error_message';
import { dbConnection } from '@/db/dbConnector';
import { updatePostScheme } from '@/schemes/post.scheme';
import { IStandardResponse } from '@/types/IApiCommunication';
import { NextRequest, NextResponse } from 'next/server';
import { addImagesToPost, deleteAllImagesForPost } from '../post.helper';
import { ResultSetHeader, RowDataPacket } from 'mysql2';

export async function PUT(req: NextRequest, { params }: { params: { postId: string } }) {
    const { postId } = params;
    const postIdNumber = Number(postId)

    const stdRes: IStandardResponse  = {}

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
            console.error(`${error}`.red);
            return NextResponse.json(stdRes, { status: 400 });
        }

        const title = formData.get('title') as string | null;
        const content = formData.get('content') as string | null;
        const hidden = formData.get('hidden') as string | null;
        const files = formData.getAll('images') as File[];

        // Validate incoming data using Zod
        updatePostScheme.parse({
            title,
            content,
            hidden,
            images: files,
        });

        // Step 1: Check if the post exists
        const [postCheckRes] = await dbConnection.execute<RowDataPacket[]>(`
            SELECT * FROM Post WHERE pId = ?
        `, [postIdNumber]);

        if (postCheckRes.length === 0) {
            stdRes.msg = "Post not found.";
            return NextResponse.json(stdRes, { status: 404 });
        }

        // Step 2: Check if the user is the owner of the post
        const [ownershipCheckRes] = await dbConnection.execute<RowDataPacket[]>(`
            SELECT * FROM Post WHERE pId = ? AND posterId = ?
        `, [postIdNumber, userId]);

        if (ownershipCheckRes.length === 0) {
            stdRes.msg = "You don't have permission to update this post.";
            return NextResponse.json(stdRes, { status: 403 });
        }

        // Step 3: Conditionally build the update query based on the provided data
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (title) {
            updateFields.push("title = ?");
            updateValues.push(title);
        }

        console.log(hidden)

        if (hidden != null) {
            updateFields.push("hidden = ?");
            updateValues.push(hidden == "true"  ? "1" : "0" );
        }

        if (content) {
            updateFields.push("content = ?");
            updateValues.push(content);
        }

        if (updateFields.length > 0) {
            // Add the postId and userId to the values
            updateValues.push(postIdNumber, userId);

            // Construct the query dynamically
            const updateQuery = `
                UPDATE Post
                SET ${updateFields.join(", ")}
                WHERE pId = ? AND posterId = ?
            `;

            await dbConnection.execute<ResultSetHeader>(updateQuery, updateValues);
        }

        // Step 4: Conditionally delete old images and upload new ones
        if (files.length > 0) {
            // Delete all old images for this post
            await deleteAllImagesForPost(postIdNumber);

            // Upload new images to Cloudinary and save URLs
            const uploadedImageUrls = await Promise.all(files.map(async (file) => {
                const filename = `post-image-${new Date().toISOString()}-${file.name}`;
                await uploadImage(file, filename);
                return filename;
            }));

            // Insert the uploaded image URLs into the PostImage table
            await addImagesToPost(postIdNumber, uploadedImageUrls);
        }

        // Step 5: Return success response indicating the post was updated
        stdRes.msg = "Post updated successfully";
        return NextResponse.json(stdRes, { status: 200 });

    } catch (error: any) {
        stdRes.msg = "Error updating post.";
        stdRes.msg2 = error;
        console.log(stdRes);
        return NextResponse.json(stdRes, { status: 500 });
    }
}