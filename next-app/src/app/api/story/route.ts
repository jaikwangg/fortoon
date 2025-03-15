import { dbConnection } from "@/db/dbConnector";
import { verifyToken } from "@/backend_lib/auth/auth.cookie";
import { formDataToJsonObject } from "@/backend_lib/parsers";
import { postStoryScheme } from "@/schemes/story.scheme";
import { IStandardResponse } from "@/types/IApiCommunication";
import { GenericRowDataPacket } from "@/types/IRowDataPacket";
// import { IUser } from "@/types/IUser";
// import { mkdirSync } from "fs";
// import { RowDataPacket } from "mysql2";
// import { NextApiRequest } from "next";
import { NextRequest, NextResponse } from "next/server";
import { uploadImage } from "@/backend_lib/image_uploading/image_upload.lib";
import { validateGenreIds } from "@/backend_lib/genre.lib";



export async function GET(req: NextRequest) {
    // const verifiedRes = await verifyToken(req);
    // if (verifiedRes.status !== 200) {
    //     return NextResponse.json({
    //         msg: verifiedRes.msg
    //     }, { status: verifiedRes.status });
    // }

    // Step 1: Retrieve all stories
    let [storyRs,] = await dbConnection.query<GenericRowDataPacket<any>[]>(
        `
        SELECT * 
        FROM Story s
        `
    );

    // Step 2: Use Promise.all with map to handle asynchronous chapter and genre fetching
    const ret = await Promise.all(storyRs.map(async (s) => {
        const storyId = s.sId;

        // Fetch chapters for the current story
        let [chapterRs,] = await dbConnection.query<GenericRowDataPacket<any>[]>(
            `
                SELECT * 
                FROM Chapter c
                WHERE c.storyId = ?  
            `,
            [storyId]
        );

        // Fetch genres for the current story
        let [genreRs,] = await dbConnection.query<GenericRowDataPacket<any>[]>(
            `
                SELECT g.gId, g.genreName 
                FROM Genre g
                JOIN StoryGenre sg ON g.gId = sg.genreId
                WHERE sg.storyId = ?
            `,
            [storyId]
        );

        // Return the story object along with its chapters and genres
        return {
            ...s,
            chapters: chapterRs,
            genres: genreRs
        };
    }));

    const stdRes: IStandardResponse = {
        data: ret
    };

    return NextResponse.json(stdRes, {
        status: 200
    });
}


export async function POST(req: NextRequest) {

    let stdRes: IStandardResponse = {
    }

    const verifiedRes = await verifyToken(req);
    // console.log(verifiedRes)
    if (verifiedRes.status !== 200) {
        return NextResponse.json({
            msg: verifiedRes.msg
        }, { status: verifiedRes.status });
    }
    const authorId = verifiedRes.data.uId


    let parsed = null
    let formData: FormData
    try {
        formData = await req.formData()
        if (formData === undefined) {
            stdRes = {
                msg: "need formData"
            }
            console.log(stdRes)
            return NextResponse.json(stdRes, {
                status: 400
            })
        }
        // console.log(typeof formData
        // console.log(formData)
        // console.log(formData.get("age"))
        const jsonObject = formDataToJsonObject(formData)
        
        // Parse genreIds from FormData
        const genreIdsStr = formData.get("genreIds") as string
        if (genreIdsStr) {
            jsonObject.genreIds = JSON.parse(genreIdsStr).map(Number)
        }

        // console.log(jsonObject)
        
        parsed = postStoryScheme.safeParse(jsonObject)
        // console.log(parsed.data?.genreIds)

        const coverImage = formData.get("coverImage") as File
        const curr = new Date()
        const filename = `storyCover-${curr.toString()}-${coverImage.name}`
        console.log("**************")
        console.log(`${filename}`.bgRed)

        if (!parsed.success) {
            stdRes = {
                msg: "Invalid parsing data",
                msg2: parsed.error.issues
            };
            // console.log(parsed.error)
            // console.log("ready to return")
            return NextResponse.json(stdRes, { status: 400 });
        }

        const newGenreIds = parsed.data.genreIds;
        console.log(newGenreIds)
        // Step 4: Validate that the provided genreIds exist in the Genre table
        const validation = await validateGenreIds(newGenreIds);
        console.log(validation)

        if (!validation.valid) {
            stdRes = {
                msg: "Invalid genre IDs detected",
                msg2: `The following genre IDs are not valid and do not exist in the Genre table: ${validation.invalidIds.join(", ")}`
            };
            return NextResponse.json(stdRes, { status: 400 });
        }

        await uploadImage(coverImage, filename)


        try {
            // Start a transaction
            await dbConnection.beginTransaction();

            // Insert the story
            const [result] = await dbConnection.execute(`
                INSERT INTO Story (
                    authorId,
                    title,
                    introduction,
                    coverImageUrl
                )
                VALUES (?, ?, ?, ?)
            `, [authorId, parsed.data.title, parsed.data.introduction, filename]);

            // console.log(result)
            // Get the newly inserted story ID
            const storyId = (result as any).insertId;


            // If we have valid genres, insert them
            const genreIds = parsed.data.genreIds;
            // console.log(genreIds)
            // Insert genre relationships
            for (const genreId of genreIds) {
                const sql = `INSERT INTO StoryGenre (storyId, genreId) VALUES (?, ?)`;
                console.log(sql)
                const [rs] = await dbConnection.execute(sql, [storyId, genreId]);
                console.log(rs)
            }

            // Commit the transaction
            await dbConnection.commit();

            stdRes = {
                msg: "Successfully created a story with genres.",
                data: { storyId }
            }
            return NextResponse.json(stdRes, {
                status: 200
            })

        } catch (error: any) {
            // Rollback the transaction in case of error
            await dbConnection.rollback();

            console.error(`${error}`.bgRed)
            stdRes = {
                msg: "error creating new Story",
            }
            const sqlState = error.sqlState
            const sqlMessage = error.sqlMessage

            // stdRes.msg2 = sqlMessage

            switch (sqlState) {
                case '23000':
                    stdRes.msg2 = "Duplicated Key title, try to change the name of story."
                    break;

                default:
                    stdRes.msg2 = error.sqlMessage
                    break;
            }

            return NextResponse.json(stdRes, {
                status: 500
            })

        }

    } catch (error: any) {
        // console.error(error)
        stdRes = {
            msg2: "fail parse data",
            msg: error
        }
        return NextResponse.json(stdRes, {
            status: 500
        })
    }




}