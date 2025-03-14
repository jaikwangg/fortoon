import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/constant/constants'
import { File } from 'buffer'
import { z } from 'zod'

export const putUserProfilePic = z.object({
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

export type putUserProfilePicSceme = z.infer<typeof putUserProfilePic>;