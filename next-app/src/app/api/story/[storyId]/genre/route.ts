import { dbConnection } from "@/db/dbConnector";
import { verifyToken } from "@/backend_lib/auth/auth.cookie";
import { genreUpdateSchema, validateGenreIds } from "@/backend_lib/genre.lib";
import { IStandardResponse } from "@/types/IApiCommunication";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";


export async function PUT(req: NextRequest, { params }: { params: { storyId: string } }) {
    let stdRes: IStandardResponse = {};

    try {
        // Step 1: Verify the user's token
        const verifiedRes = await verifyToken(req);
        if (verifiedRes.status !== 200) {
            stdRes = { msg: verifiedRes.msg };
            return NextResponse.json(stdRes, { status: verifiedRes.status });
        }

        const userId = verifiedRes.data?.uId;
        const { storyId } = params;

        // Step 2: Parse the incoming JSON data and validate it with Zod
        const body = await req.json();

        // Validate the incoming data using Zod
        const parsed = genreUpdateSchema.safeParse(body);

        if (!parsed.success) {
            stdRes = {
                msg: "Invalid genre data",
                msg2: parsed.error.issues
            };
            return NextResponse.json(stdRes, { status: 400 });
        }

        const newGenreIds = parsed.data.genreIds;

        // Step 3: Validate that the story exists and is owned by the authenticated user
        const [storyRs] = await dbConnection.query<any[]>(
            `SELECT authorId FROM Story WHERE sId = ?`,
            [storyId]
        );

        if (storyRs.length === 0) {
            stdRes = { msg: "Story not found" };
            return NextResponse.json(stdRes, { status: 404 });
        }

        const story = storyRs[0];
        if (story.authorId !== userId) {
            stdRes = { msg: "Unauthorized: You are not the owner of this story" };
            return NextResponse.json(stdRes, { status: 403 });
        }

        // Step 4: Validate that the provided genreIds exist in the Genre table
        const validation = await validateGenreIds(newGenreIds);
        if (!validation.valid) {
            stdRes = {
                msg: "Invalid genre IDs detected",
                msg2: `The following genre IDs are not valid and do not exist in the Genre table: ${validation.invalidIds.join(", ")}`
            };
            return NextResponse.json(stdRes, { status: 400 });
        }

        // Step 5: Retrieve the current genre IDs for the story
        const [currentGenresRs] = await dbConnection.query<any[]>(
            `SELECT genreId FROM StoryGenre WHERE storyId = ?`,
            [storyId]
        );
        const currentGenreIds = currentGenresRs.map(row => row.genreId);

        // Step 6: Determine genres to be added and removed
        const genresToAdd = newGenreIds.filter(genreId => !currentGenreIds.includes(genreId));
        const genresToRemove = currentGenreIds.filter(genreId => !newGenreIds.includes(genreId));

        // Step 7: Add new genres (if any)
        if (genresToAdd.length > 0) {
            const insertValues = genresToAdd.map(genreId => `(${storyId}, ${genreId})`).join(", ");
            await dbConnection.execute(
                `INSERT INTO StoryGenre (storyId, genreId) VALUES ${insertValues}`
            );
        }

        // Step 8: Remove old genres (if any)
        if (genresToRemove.length > 0) {
            const deleteValues = genresToRemove.map(genreId => genreId).join(", ");
            await dbConnection.execute(
                `DELETE FROM StoryGenre WHERE storyId = ? AND genreId IN (${deleteValues})`,
                [storyId]
            );
        }

        stdRes = { msg: "Successfully updated the genres" };
        return NextResponse.json(stdRes, { status: 200 });

    } catch (error: any) {
        console.error("Error while updating genres:", error);
        stdRes = { msg: "Error updating genres", msg2: error.message };
        return NextResponse.json(stdRes, { status: 500 });
    }
}