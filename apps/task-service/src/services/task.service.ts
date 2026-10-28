import { CreateTaskInput } from "../schemas/task.schemas";
import * as taskRepo from "../repositories/task.repositories";
import { convertToPublicTask } from "../utils/task.utils";
import { AppError } from "shared";
import { publishTaskEvent } from "../kafka";


export async function createTask(input: CreateTaskInput, userId: string) {
    const newlyCreatedTask = await taskRepo.createTask({
        title: input.title,
        created_by: userId
    })

    await publishTaskEvent(newlyCreatedTask.id, userId);
    return convertToPublicTask(newlyCreatedTask);
}

export async function listTasks(userId: string, role: string) {
    if (!userId || !role) {
        throw new AppError("Missing user identity", 401);
    }

    const tasks = await taskRepo.listTasks({ userId, role });

    return tasks.map(convertToPublicTask);
}

export async function getSingleTask(taskId: string, userId: string, role: string) {
    const task = await taskRepo.findSingleTaskById(taskId);

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    if (role !== "ADMIN" && task.created_by !== userId ) {
        throw new AppError("Forbidden", 403);
    }

    return convertToPublicTask(task);
}

export async function deleteSingleTask(id: string, role: string) {
    if (role !== "ADMIN") {
        throw new AppError("Forbidden", 403);
    }

    const task = await taskRepo.findSingleTaskById(id);

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    await taskRepo.deleteSingleTaskById(id);

    return {id};
}