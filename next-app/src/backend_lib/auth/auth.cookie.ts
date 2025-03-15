// import { RowDataPacket } from 'mysql2';
import { IStandardResponse } from '../../types/IApiCommunication';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
// import { jwtVerify, JWTPayload } from 'jose';
// import { dbConnection } from '@/db/dbConnector';

// const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'super-secret-key');
const JWT_SECRET =process.env.JWT_SECRET  || "sec"

export const verifyByTokenValue = (tokenValue: string) => {
    const  payload : any = jwt.verify(tokenValue, JWT_SECRET)
    return payload
}

export async function verifyToken(req: NextRequest): Promise<IStandardResponse> {
    // Get the cookie from the request
    const cookie = req.cookies.get('token')?.value;;
    // console.log(cookie);

    // Check if the cookie is present
    if (!cookie) {
        return {
            status: 401,
            msg: 'No cookie token provided',
        };
    }

    try {
        // Verify the token
        // const  payload = jwt.verify(cookie, JWT_SECRET);
        const payload = verifyByTokenValue(cookie)
        // console.log(payload)
        return {
            status: 200,
            msg: 'Token verified successfully',
            data: payload, // Pass the decoded token
        };
    } catch (error : any) {
        console.error('Token verification failed:', error);
        return {
            status: 403,
            msg: 'Invalid cookie token',
            msg2: error.message, // Optionally include error details
        };
    }
}


