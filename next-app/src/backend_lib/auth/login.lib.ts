import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

// Secret key for JWT (store this securely, e.g., in an env variable)
const JWT_SECRET = process.env.JWT_SECRET || "";
const JWT_EXPIRATION = "3h"; // 1 hour

/**
 * Create a JWT token and set it as an HTTP-only cookie.
 * 
 * @param userPayload The payload to include in the JWT (e.g., username, userId).
 * @param response The NextResponse object to set the cookie on.
 * @returns The NextResponse object with the JWT cookie set.
 */
// export function setJwtTokenCookie(userPayload: {username: string, uId: number}, response: NextResponse): NextResponse<any> {
// todo : also append data of user (include password and all)
export function setJwtTokenCookie(userPayload: any, response: NextResponse): NextResponse<any> {
    // Create a JWT token
    const token = jwt.sign(userPayload, JWT_SECRET, {
        expiresIn: JWT_EXPIRATION,
    });

    // Set the token in an HTTP-only cookie
    response.cookies.set("token", token, {
        httpOnly: true, // Prevent access from JavaScript
        secure: process.env.NODE_ENV === "production", // Set `secure` flag in production
        maxAge: 60 * 60, // 1 hour expiration
        path: "/", // Token is valid site-wide
    });

    return response;
}