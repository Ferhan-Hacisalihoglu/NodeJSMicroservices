import { Request, Response, NextFunction } from "express";
import * as taskService from "../services/task.service";
import { AppError, successRequest } from "shared";



function requireIdentity(req: Request) {
    const userId = req.header("x-user-id");
    const role = req.header("x-user-role");

    if (!role || !userId) {
        throw new AppError("Missing user identity", 401);
    }

    return {userId, role};
}

export async function createTask( req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, role } = requireIdentity(req);

        const task = await taskService.createTask(req.body, userId);

        successRequest(res, task, 201);
    } catch (error) {
        next(error);
    }
}

export async function listTasks( req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, role } = requireIdentity(req);

        const tasks = await taskService.listTasks(userId, role);

        successRequest(res, { tasks });
    } catch (error) {
        next(error);
    }
}

export async function getSingleTask( req: Request, res: Response, next: NextFunction) {
    try {
        const { userId, role } = requireIdentity(req);
        const id = String(req.params.id);

        const task = await taskService.getSingleTask(id, userId, role);

        successRequest(res, { task });
    } catch (error) {
        next(error);
    }
}

export async function deleteSingleTask( req: Request, res: Response, next: NextFunction) {
    try {
        const {role} = requireIdentity(req);
        const id = String(req.params.id);
        const deletedResult = await taskService.deleteSingleTask(id, role);
        successRequest(res, deletedResult);
    } catch (error) {
        next(error);
    }
}
