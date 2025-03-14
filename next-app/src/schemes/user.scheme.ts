import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/constant/constants'
import { ESex } from '@/types/ISex'
import { File } from 'buffer'
// import { File } from 'buffer'
import { z } from 'zod'
import { zfd } from "zod-form-data"

export const CreateUserScheme = z.object({
    username: z.string().min(4),
    password: z.string().min(8),
    displayName: z.string().min(4),
    sex: z.nativeEnum(ESex),
    email: z.string().email(),
    age: z
        .string()
        .refine(value => !isNaN(Number(value)), {
            message: "Age must be a number",
        })
        .transform(value => Number(value)) // Convert string to number
        .refine(value => value > 5, {
            message: "Age must be greater than 5",
        }),
    profilePic: z
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
        ).optional()
})

export type TCreateUserScheme = z.infer<typeof CreateUserScheme>;

// Zod validation for non-image fields (optional since some fields may not be sent)
export const userSettingsSchema = z.object({
    displayName: z.string().min(1, "Display name is required").max(100, "Display name is too long").optional(),
    username: z.string().min(1, "Username is required").max(100, "Username is too long").optional(),
});


