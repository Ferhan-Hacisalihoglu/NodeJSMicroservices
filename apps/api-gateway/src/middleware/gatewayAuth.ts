import { NextFunction, Request, Response } from "express";
import { AppError, verifyToken } from "shared";
import { isPublicRoute, getAllowedRoles } from "../rbac";



const IDENTITY_HEADERS = [
    "x-user-id",
    "x-user-role",
    "x-gateway-secret"
] as const;

function stripIdentityHeaders(req: Request) {
    for (const header of IDENTITY_HEADERS) {
        delete req.headers[header];
    }
}

function attachGatewaySecret(req: Request) {
    const secret = process.env.GATEWAY_SECRET;

    if (!secret) {
        throw new AppError("GATEWAY_SECRET is not set/configured/missing", 500);
    }

    req.headers["x-gateway-secret"] = secret;
}

function requestPath(req: Request){
    const combined = `${req.baseUrl}${req.path}`;

    if (combined.length > 1 && combined.endsWith("/")) {
        return combined.slice(0, 1);
    }

    return combined || "/";
}

function attachUserHeader(req: Request, userID: string, role: string) {
    req.headers["x-user-id"] = userID;
    req.headers["x-user-role"] = role;
}

export function gatewayAuth(req: Request, _res: Response, next: NextFunction) {
    try {
        stripIdentityHeaders(req);
        attachGatewaySecret(req);

        const path = requestPath(req);

        if (isPublicRoute(req.method, path)) {
            return next();
        }

        const authHeader = req.header("authorization");

        if (!authHeader?.startsWith("Bearer ")) {
            throw new AppError("Missing or invalid auth token", 401);
        }

        const token = authHeader.slice("Bearer ".length).trim();
        const payload = verifyToken(token);

        const allowedRoles = getAllowedRoles(req.method, path);

        if (!allowedRoles) {
            throw new AppError("Route not found", 404);
        }

        if (!allowedRoles.includes(payload.role)) {
            throw new AppError("Forbidden, you do not have access to this route", 403);
        }

        attachUserHeader(req, payload.userId, payload.role);
        next();
    } catch (error) {
        if (error instanceof AppError) {
            return next(error);
        }

        return next(new AppError("Invalid or expired token", 401));
    }
}





