import { Request, Response, NextFunction } from "express";
import { AppError, successRequest } from "shared";
import * as workflowService from "../services/workflow.service";



function requireIdentity(req: Request) {
    const userId = req.header("x-user-id");
    const role = req.header("x-user-role");

    if (!role || !userId) {
        throw new AppError("Missing user identity", 401);
    }

    return {userId, role};
}

export async function listWorkflowByTicketId( req: Request, res: Response, next: NextFunction) {
    try{
        const {userId, role} = requireIdentity(req);
        const taskId = String(req.params.taskId);
        const workflow = await workflowService.listWorkflowByTicketId(taskId, userId, role);
        successRequest(res, {workflow});
    } catch (error) {
        next(error);
    }
}