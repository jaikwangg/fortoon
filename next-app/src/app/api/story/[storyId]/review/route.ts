import { RowDataPacket } from 'mysql2';
import { verifyToken } from '@/backend_lib/auth/auth.cookie';
import { ErrorMessage, GetErrorMesage } from '@/constant/error_message';
import { IStandardResponse } from '@/types/IApiCommunication';
import { NextRequest, NextResponse } from 'next/server';
import { createReviewSchema } from '@/schemes/review.story.scheme';
import { createReview, getExistingReview, getReviewsWithReviewersByStoryId, updateReview } from '@/backend_lib/story/review/review.story.lib';
import { getStoryById } from '@/backend_lib/story/story.lib';



export async function GET(req: NextRequest, { params }: { params: { storyId: string } }) {
    const stdRes: IStandardResponse = {};

    const storyId = parseInt(params.storyId);

    try {
        // Step 1: Retrieve reviews and associated reviewers for the specified story
        const reviews = await getReviewsWithReviewersByStoryId(storyId);

        // Step 2: Check if reviews exist
        if (reviews.length === 0) {
            stdRes.msg = "No reviews found for this story.";
            return NextResponse.json(stdRes, { status: 404 });
        }

        // Step 3: Return success response with reviews and reviewer data
        stdRes.msg = "Reviews retrieved successfully.";
        stdRes.data = reviews;

        return NextResponse.json(stdRes, { status: 200 });

    } catch (error: any) {
        stdRes.msg = "Error retrieving reviews.";
        stdRes.msg2 = error.message;
        console.error(stdRes);
        return NextResponse.json(stdRes, { status: 500 });
    }
}

export async function POST(req: NextRequest, { params }: { params: { storyId: string } }) {
    const stdRes: IStandardResponse = {};

    // Verify the user's token
    const verifiedRes = await verifyToken(req);
    if (verifiedRes.status !== 200) {
        return NextResponse.json(verifiedRes, { status: verifiedRes.status });
    }

    const userId = verifiedRes.data.uId; // Get the authenticated user's ID
    const storyId = parseInt(params.storyId);

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

        const rating = formData.get('rating') ? parseInt(formData.get('rating') as string) : null;
        const review = formData.get('review') as string;

        // Validate incoming data using Zod
        createReviewSchema.parse({
            rating,
            review,
            storyId,
            reviewerId: userId
        });

        // Step 1: Retrieve the story to check ownership
        const story = await getStoryById(storyId);
        if (!story) {
            stdRes.msg = "Story not found.";
            return NextResponse.json(stdRes, { status: 404 });
        }

        // Step 2: Ensure the reviewer is not the owner of the story
        if (story.authorId === userId) {
            stdRes.msg = "You cannot review your own story.";
            return NextResponse.json(stdRes, { status: 400 });
        }

        // Step 3: Check if the user has already reviewed this story
        const existingReview = await getExistingReview(storyId, userId);
        if (existingReview) {
            stdRes.msg = "You have already reviewed this story.";
            return NextResponse.json(stdRes, { status: 400 });
        }

        // Step 4: Create the review
        let reviewId: number;
        try {
            reviewId = await createReview(rating ?? 0, review, userId, storyId);
            console.log(`Review created successfully with ID: ${reviewId}`);
        } catch (error: any) {
            stdRes.msg = "Error creating review.";
            stdRes.msg2 = error.message;
            console.error(stdRes);
            return NextResponse.json(stdRes, { status: 500 });
        }

        // Step 5: Return success response with the created review ID
        stdRes.msg = "Review created successfully";
        stdRes.data = { reviewId };

        return NextResponse.json(stdRes, { status: 201 });

    } catch (error: any) {
        stdRes.msg = "Error creating review.";
        stdRes.msg2 = error;
        console.error(stdRes);
        return NextResponse.json(stdRes, { status: 500 });
    }
}



export async function PUT(req: NextRequest, { params }: { params: { storyId: string } }) {
    const stdRes: IStandardResponse = {};

    // Verify the user's token
    const verifiedRes = await verifyToken(req);
    if (verifiedRes.status !== 200) {
        return NextResponse.json(verifiedRes, { status: verifiedRes.status });
    }

    const userId = verifiedRes.data.uId; // Get the authenticated user's ID
    const storyId = parseInt(params.storyId);

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

        const rating = formData.get('rating') ? parseInt(formData.get('rating') as string) : null;
        const review = formData.get('review') as string;

        // Validate incoming data using Zod
        createReviewSchema.parse({
            rating,
            review,
            storyId,
            reviewerId: userId
        });

        // Step 1: Retrieve the existing review
        const existingReview = await getExistingReview(storyId, userId);
        if (!existingReview) {
            stdRes.msg = "Review not found.";
            return NextResponse.json(stdRes, { status: 404 });
        }

        // Step 2: Ensure the user is the owner of the review
        if (existingReview.reviewerId !== userId) {
            stdRes.msg = "You cannot update someone else's review.";
            return NextResponse.json(stdRes, { status: 403 });
        }

        // Step 3: Update the review in the database
        try {
            await updateReview(existingReview.rsId, rating ?? 0, review);
            stdRes.msg = "Review updated successfully";
            return NextResponse.json(stdRes, { status: 200 });
        } catch (error: any) {
            stdRes.msg = "Error updating review.";
            stdRes.msg2 = error.message;
            console.error(stdRes);
            return NextResponse.json(stdRes, { status: 500 });
        }

    } catch (error: any) {
        stdRes.msg = "Error updating review.";
        stdRes.msg2 = error;
        console.error(stdRes);
        return NextResponse.json(stdRes, { status: 500 });
    }
}