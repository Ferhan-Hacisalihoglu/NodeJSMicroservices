import { Request, Response, NextFunction } from 'express';
import { AppError, successRequest } from "shared";
import * as attachmentService from "../services/media.service";


async function requireIdentity(req: Request) {
    const userId = req.header("x-user-id");
    const role = req.header("x-user-role");

    if (!role || !userId) {
        throw new AppError("Missing user identity", 401);
    }

    return {userId, role};
}

export async function uploadAttachment( req: Request, res: Response, next: NextFunction ) {
    try {
       const {userId, role} = requireIdentity(req);
       const taskId = String(req.params.taskId);
       const attachment = await attachmentService.uploadAttachment({taskId, userId, role, file: req.file});

       successRequest(res, {attachment}, 201);
    } catch (error) {
        next(error);
    }
}

export async function listAttachments( req: Request, res: Response, next: NextFunction ) {
    try{
        const {userId, role} = requireIdentity(req);
        const taskId = String(req.params.taskId);
        const extractAttachments = await attachmentService.listAttachments({taskId, userId, role});
        successRequest(res, {attachments: extractAttachments});
    } catch (error) {
        next(error);
    }
}


