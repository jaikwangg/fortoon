import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        // Create a new response
        const response = NextResponse.json({
            message: "Successfully signed out"
        });

        // Get the cookie store
        const cookieStore = cookies();

        // Clear the JWT token by setting an expired cookie
        cookieStore.set('token', '', {
            expires: new Date(0), // Set to epoch time to immediately expire
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });

        return response;

    } catch (error) {
        console.error("Signout error:", error);
        return NextResponse.json({
            error: "Error processing signout request",
            details: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}