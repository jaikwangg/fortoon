import { NextRequest, NextResponse } from "next/server";
import { ResultSetHeader  } from "mysql2";
import { dbConnection } from "@/db/dbConnector";
import { IStandardResponse } from "@/types/IApiCommunication";
import { formDataToJsonObject } from "@/backend_lib/parsers";
import { uploadImage } from "@/backend_lib/image_uploading/image_upload.lib";
import { CreateUserScheme } from "@/schemes/user.scheme";
import { setJwtTokenCookie } from "@/backend_lib/auth/login.lib";

// Define a custom interface for database errors
interface DatabaseError extends Error {
    code?: string;
  }
  

export async function POST(req: NextRequest) {
    let stdRes: IStandardResponse = {};
    let parsed = null;

    // Try to parse the formData and JSON object
    let formData: FormData;
    try {
        formData = await req.formData();

        if (!formData) {
            stdRes = { msg: "Need formData" };
            return NextResponse.json(stdRes, { status: 400 });
        }

        // Convert formData to a JSON object
        const jsonObject = formDataToJsonObject(formData);

        // Validate and parse the data using Zod schema
        parsed = CreateUserScheme.parse(jsonObject);
    } catch (error: unknown) {
        let errorMessage = "An unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        stdRes = {
            msg: "Fail to parse data",
            msg2: errorMessage,
        };
        return NextResponse.json(stdRes, { status: 500 });
    }

    // If parsing failed, don't proceed
    if (!parsed) {
        return;
    }

    let filename = null;

    // Handle profilePic as optional
    const profilePic = formData.get("profilePic") as File | null;
    if (profilePic) {
        const curr = new Date();
        filename = `user-${curr.toISOString()}-${profilePic.name}`;
        await uploadImage(profilePic, filename); // Upload the image only if provided
    }

    try {
        // Insert the user into the database
        const [result] = await dbConnection.execute<ResultSetHeader>(`
            INSERT INTO User (
                username,
                password,
                displayName,
                sex,
                email,
                age,
                profilePicUrl
            )
            VALUES (
                '${parsed.username}',
                '${parsed.password}',
                '${parsed.displayName}',
                '${parsed.sex}',
                '${parsed.email}',
                '${parsed.age}',
                ${filename ? `'${filename}'` : 'NULL'}  -- Set profilePicUrl to null if no file was uploaded
            );
        `);

        stdRes = {
            msg: `Register Success, You're welcome ${parsed.username} :D`,
        };

        const userId = result.insertId;
        let response = NextResponse.json(stdRes);
        response = setJwtTokenCookie({ username: parsed.username, uId: userId }, response);
        return response;

    } catch (error: unknown) {
        let errorMessage = "An unknown error occurred";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        
        // Check if the error has a 'code' property and it's 'ER_DUP_ENTRY'
        if (error instanceof Error && (error as DatabaseError).code === 'ER_DUP_ENTRY') {
            stdRes = {
            msg: "Duplicate entry error: A user with this field already exists.",
            msg2: errorMessage,
            };
            return NextResponse.json(stdRes, { status: 409 });
        }

        console.log(error);

        stdRes = {
            msg: "Error creating new User",
            msg2: errorMessage,
        };
        return NextResponse.json(stdRes, { status: 500 });
    }
}