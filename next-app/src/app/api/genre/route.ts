import { dbConnection } from "@/db/dbConnector";
import { IStandardResponse } from "@/types/IApiCommunication";
import { NextResponse } from "next/server";

export const GET = async () => {
    const stdRes : IStandardResponse  = {}

    const [rs, ] = await dbConnection.query("select * from Genre")

    stdRes.msg = "Success retrived Genres";
    stdRes.data = rs
    return NextResponse.json(stdRes, { status: 200 });
}