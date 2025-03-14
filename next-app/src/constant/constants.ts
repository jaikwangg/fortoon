// const AMAZON_BUCKET_URL : string = process.env.AMAZON_BUCKET_URL ?? ""

// if (!AMAZON_BUCKET_URL) {
//     throw new Error("Need AMAZON_BUCKET_URL environment variable for image management")
// }

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 3MB in bytes
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];

export  {MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES}
