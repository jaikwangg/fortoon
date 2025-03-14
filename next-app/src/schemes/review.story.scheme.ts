import { z } from 'zod';

export const createReviewSchema = z.object({
    rating: z
        .number()
        .int()
        .min(1, { message: 'Rating must be at least 1.' })
        .max(5, { message: 'Rating cannot be more than 5.' }),
    review: z
        .string()
        .min(5, { message: 'Review must be at least 5 characters long.' })
        .max(500, { message: 'Review cannot exceed 500 characters.' }),
    reviewerId: z.number().int(),
    storyId: z.number().int(),
});