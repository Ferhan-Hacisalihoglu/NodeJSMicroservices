


export type TaskStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CANCELLED";

export type Task = {
    id: string;
    title: string;
    status: TaskStatus;
    createdBy: string;
    createdAt: Date;
    updatedAt: Date;
}
