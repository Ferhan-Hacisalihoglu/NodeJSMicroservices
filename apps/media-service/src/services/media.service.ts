import { AppError } from "shared";
import * as attachmentRepo from "../repositories/media.repo";
import { uploadBuffer } from "../utils/stroage";
import { convertToPublicTask } from "../utils/media.utils";



async function assertTaskAccess(taskId: string, userId: string, role: string) {
    const task = await attachmentRepo.findTaskAccess(taskId);

    if (!task) {
        throw new AppError("Task not found", 404);
    }

    if (role !== "ADMIN" && task.created_by !== userId) {
        throw new AppError("Forbidden", 403);
    }
}

export async function uploadAttachment( input: {
    taskId: string;
    userId: string;
    role: string;
    file? : Express.Multer.File;
}){
    if (!input.file) {
        throw new AppError("Image file is required", 400);
    }

    await assertTaskAccess(input.taskId, input.userId, input.role);

    const uploaded = await uploadBuffer(
        input.file.buffer,
        input.file.mimetype as "image/jpeg"
    )

    const attachment = await attachmentRepo.createAttachment({
        taskId: input.taskId,
        imageUrl: uploaded.imageUrl,
        publicId: uploaded.publicId,
        uploadedBy: input.userId
    })

    return convertToPublicTask(attachment);
}

export async function listAttachments(input: {taskId: string;userId: string;role: string;}) {
    await assertTaskAccess(input.taskId, input.userId, input.role);
    const rows = await attachmentRepo.listByTaskId(input.taskId);

    return rows.map(convertToPublicMediaAttachment);
}





