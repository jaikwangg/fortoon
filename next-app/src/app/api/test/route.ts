import { uploadImage } from "@/backend_lib/image_uploading/image_upload.lib";
import { NextRequest, NextResponse } from "next/server";

export async function  POST (req: NextRequest) {

    const formData = await req.formData()
    const file = formData.get("file") as File

    const xres = await uploadImage(file, "testimgage")

    return NextResponse.json({
        test: "test test /api/test",
        more: xres
    })
}