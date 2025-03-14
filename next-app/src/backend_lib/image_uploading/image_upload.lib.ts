import { IStandardResponse } from '@/types/IApiCommunication';
import { v2 as cloudinary } from 'cloudinary';

// Configuration
// console.log(process.env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const uploadImage = async (file: File, filename: string): Promise<IStandardResponse> => {
    let stdRes: IStandardResponse = {};
    // console.log(file)

    try {
          // Remove file extension from filename
        // const filenameWithoutExtension = filename.replace(/\.[^/.]+$/, "");
        const exts = ['jpg', 'png', 'jpeg', 'avif', 'webp', 'jpeg']
        exts.forEach(ext => {
            filename = filename.replace(`.${ext}`, '')
        });

        // Convert file to base64 for uploading
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64File = buffer.toString('base64');

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(`data:image/jpeg;base64,${base64File}`, {
            public_id: filename,
        });

        let msg = `Successfully uploaded image named [${filename}] to Cloudinary`.green;
        stdRes.status = 200;
        stdRes.msg = msg;
        stdRes.data = {
            newFilename: filename
        };
        console.log(msg);
        console.log(uploadResult);
    } catch (error) {
        console.error(`${error}`.red);
        stdRes.msg = 'Error uploading file to Cloudinary';
        stdRes.msg2 = error;
        stdRes.status = 500;
    }

    return stdRes;
};

// * example response

// {
//     next-app  |   asset_id: '019a19153987ca3bf8d182d320a97cb2',
//     next-app  |   public_id: 'user-Mon Oct 14 2024 10:01:42 GMT+0000 (Coordinated Universal Time)-image.png',
//     next-app  |   version: 1728900105,
//     next-app  |   version_id: 'fe005053bcb068d1afe6f162bca49591',
//     next-app  |   signature: '49dc61d18eb0334d150dcf952e2f590c9ff02fb4',
//     next-app  |   width: 883,
//     next-app  |   height: 545,
//     next-app  |   format: 'png',
//     next-app  |   resource_type: 'image',
//     next-app  |   created_at: '2024-10-14T10:01:45Z',
//     next-app  |   tags: [],
//     next-app  |   bytes: 591844,
//     next-app  |   type: 'upload',
//     next-app  |   etag: '23989c49bcea42dca9d570e3abb35a36',
//     next-app  |   placeholder: false,
//     next-app  |   url: 'http://res.cloudinary.com/da9a5vaz8/image/upload/v1728900105/user-Mon%20Oct%2014%202024%2010:01:42%20GMT%2B0000%20%28Coordinated%20Universal%20Time%29-image.png.png',
//     next-app  |   secure_url: 'https://res.cloudinary.com/da9a5vaz8/image/upload/v1728900105/user-Mon%20Oct%2014%202024%2010:01:42%20GMT%2B0000%20%28Coordinated%20Universal%20Time%29-image.png.png',
//     next-app  |   asset_folder: '',
//     next-app  |   display_name: 'user-Mon Oct 14 2024 10:01:42 GMT+0000 (Coordinated Universal Time)-image.png',
//     next-app  |   api_key: '894758581668446'
//     next-app  | }