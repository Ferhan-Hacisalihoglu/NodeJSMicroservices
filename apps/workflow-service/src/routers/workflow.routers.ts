import { Router } from "express";
import * as workflowController from "../controllers/workflow.controller";


const router = Router();

router.get("/:taskId", workflowController.listWorkflowByTicketId);



export default router;