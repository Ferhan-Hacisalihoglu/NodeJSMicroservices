import {Request, Response, NextFunction} from 'express';
import { AppError } from './AppError';

export function errorHandler(
    err: unknown,
    _req: Request,
    res: Response,
    _next: NextFunction
) {

    if ( err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: false,
            message: err.message
        })
    }

    // logger

    return res.status(500).json({
        error: true,
        message: 'Internal Server Error'
    })
}




