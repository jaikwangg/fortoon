import { File } from 'buffer';
import { z } from 'zod';

// Zod schema to validate the incoming formData

export const createPostSchema = z.object({
    title: z.string().min(1, "Title is required").max(50),
    content: z.string().min(1, "Content is required").max(400),
    parentPostId: z.number().positive().optional().nullable(),
    // parentPostId: z.string(),
    images: z.array(z.instanceof(File)).max(4, "You can upload up to 4 images").nullable(),
});


export const updatePostScheme = z.object({
    title: z.string().max(50).nullable().optional(),
    content: z.string().max(400).nullable().optional(),
    parentPostId: z.number().positive().nullable().optional(),
    hidden: z.enum(['true', 'false']).nullable().optional(),
    // hidden: z.boolean().nullable().optional(),
    images: z.array(z.instanceof(File)).max(4, "You can upload up to 4 images").nullable().optional()
});

