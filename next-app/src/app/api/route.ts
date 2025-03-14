import { NextResponse } from "next/server";
import { dbConnection } from "../../db/dbConnector";

export function GET () {

    // dbConnection

    return NextResponse.json({
        test: "test route base."
    })
}