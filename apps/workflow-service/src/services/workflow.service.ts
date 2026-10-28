import { createKafkaConsumer, logger, TOPICS } from "shared";
import { runConsumer } from "shared";
import { DomainEvent } from "../utils/types";
import * as workflowRepo from "../repository/workflow.repository";
import { AppError } from "shared";
import { convertToPublicWorkflow } from "../utils/workflow.utils";



async function handleDomainEvent(rowData: DomainEvent) {
    if (!rowData.eventType || !rowData.taskId || !rowData.userId) {
        logger.warn({ rowData }, "invlalid domain event");
        return;
    }

    const workflow = await workflowRepo.createWorkflow({
        taskId: rowData.taskId,
        eventType: rowData.eventType,
        message: rowData.message || "",
        createdBy: rowData.userId
    });

    logger.info({ 
        workflowId: workflow.id, eventType: workflow.event_type
     }, "workflow created");
} 


export async function startKafka(){
    const consumer = await createKafkaConsumer(
        "workflow-service",
        "workflow-service-group",
    );

    void runConsumer(consumer, [TOPICS.TASK_EVENTS],
        async ({message}) => {
            const value = message.value?.toString();

            if (!value) return;

            try {
                await handleDomainEvent(JSON.parse(value) as DomainEvent);
            } catch (error) {
                logger.error({ error }, "workflow consumer failed");
            }
        }        
    );

}

export async function listWorkflowByTicketId(taskId: string, userId: string, role: string) {
    const task = await workflowRepo.findTaskOwner(taskId);
    
    if (!task) {
        throw new AppError("Task not found", 404);
    }

    if (role !== "ADMIN" && task.created_by !== userId) {
        throw new AppError("Forbidden", 403);
    }

    const rows = await workflowRepo.listWorkflowByTicketId(taskId);

    return rows.map(convertToPublicWorkflow);
}




