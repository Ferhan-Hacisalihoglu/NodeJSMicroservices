import type { Request, NextFunction, Response } from "express";
import { AppError } from "../errors/AppError";



export function requireGatewaySecret( req: Request, _res: Response, next: NextFunction) {
    const expected = process.env.GATEWAY_SECRET;

    if (!expected) {
        return next(new AppError("GATEWAY_SECRET is not configured",500));
    }

    const incoming = req.header("x-gateway-secret");

    if (!incoming || incoming !== expected) {
        return next(new AppError("Forbidden",403));
    }

    next();
}