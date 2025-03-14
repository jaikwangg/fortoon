import { verifyByTokenValue } from "@/backend_lib/auth/auth.cookie";
import { IStandardResponse } from "@/types/IApiCommunication";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
    const cookie = req.cookies.get('token')
    console.log(cookie)
    if (cookie != null) {
        const decryptedObject = verifyByTokenValue(cookie.value)
        // console.log(decryptedObject)
        const stdRes: IStandardResponse = {
            msg: `Success Login by Cookie, Welcome ${decryptedObject.username}`,
            data: decryptedObject
        }
        return NextResponse.json(stdRes, { status: 200 })
    }

    return NextResponse.json({
        msg: "No Cookie named 'token' for auto login."
    }, { status: 401 })
}