import jwt from 'jsonwebtoken';
import { JWTPayload } from '../types/auth.type';



function extractjwtSecret(): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error("JWT_SECRET is not set");
    }

    return secret;
}

export function signToken(payload: JWTPayload): string { 
    const expiresIn = process.env.JWT_EXPIRES_IN;

    return jwt.sign(payload, extractjwtSecret(),{
        expiresIn: expiresIn as jwt.SignOptions["expiresIn"]
    });
}
