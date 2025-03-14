import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/constant/constants'
import { numericString } from '@/backend_lib/parsers';
import { File } from 'buffer';
import { z } from 'zod'
import { zfd } from "zod-form-data"

export const postStoryScheme = z.object({
    title: z.string(),
    introduction: z.string(),

    coverImage: z
        .instanceof(File)
        .refine(
            (file) => file.size <= MAX_FILE_SIZE,
            `Image size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB.`
        )
        .refine(
            (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
            `Only the following image types are allowed: ${ACCEPTED_IMAGE_TYPES.join(
                ", "
            )}.`
        )
        // .optional()
        // .nullable(),
    ,genreIds: z.preprocess((val) => {
        // Handle string input by parsing it
        if (typeof val === 'string') {
            try {
                return JSON.parse(val).map(Number);
            } catch {
                return [];
            }
        }
        // If it's already an array, return it
        return Array.isArray(val) ? val.map(Number) : [];
    }, z.array(z.number())),
})

export type TPostStoryScheme = z.infer<typeof postStoryScheme>;


export const updateStorySchema = z.object({
    title: z.string().max(100).nullable().optional(),
    introduction: z.string().max(1000).nullable().optional(),
    coverImage: z.any().refine((file) => file instanceof File || file === null, {
        message: "coverImage must be a file or null",
    }).nullable().optional(),
    genreIds: z.preprocess((val) => {
        // Handle string input by parsing it
        if (typeof val === 'string') {
            try {
                return JSON.parse(val).map(Number);
            } catch {
                return [];
            }
        }
        return Array.isArray(val) ? val.map(Number) : [];
    }, z.array(z.number())).optional().nullable(),
    
});