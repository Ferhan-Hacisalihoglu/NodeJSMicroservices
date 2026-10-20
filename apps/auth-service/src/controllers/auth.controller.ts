import type { Request, Response, NextFunction } from "express";
import * as authService from "../services/auth.service";
import { AppError, successRequest  } from "shared";


export async function register(
    req: Request,
    res: Response,
    next: NextFunction
) {
    try {
        const user = await authService.register(req.body);
        successRequest(res, { user },201);
    } catch (error) {
        next(error)
    }
}


export async function login(req: Request, res: Response, next: NextFunction) {
    try{
        const result = await authService.login(req.body);
        successRequest(res, result, 200);
    } catch(error){
        next(error)
    }
}


export async function getMe(req: Request, res: Response, next: NextFunction) {
    try {
        const userID = req.header("x-user-id");
        if (!userID){
            throw new AppError("Missing x-user-id header", 401)
        }

        const user = await authService.getMe(userID);
        successRequest(res, { user });
    } catch (error) {
        next(error)
    }
}

