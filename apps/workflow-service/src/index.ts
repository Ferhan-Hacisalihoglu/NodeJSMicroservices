import { config } from 'dotenv';
import { resolve } from 'node:path';
import express from 'express';
import { AppError, errorHandler, httpLogger, logger, requireGatewaySecret, successRequest } from 'shared';
import workflowRouter from './routers/workflow.routers';
import { startKafka } from './services/workflow.service';



config({path: resolve(process.cwd(), '.env')});
config({path: resolve(process.cwd(), '../../.env')});

const PORT = process.env.WORKFLOW_PORT || 3004;

const app = express();

app.use(httpLogger);
app.use(express.json());

app.get("/health", (_req, res) => {
    successRequest(res, {service: "workflow-service"})
});

app.use("/api/workflow", requireGatewaySecret, workflowRouter);

app.use((_req, _res, next) => {
    next(new AppError("Route not found", 404));
});

app.use(errorHandler);

async function initStart(){
    try{
        await startKafka();
    } catch (error) {
        logger.error({ error }, "kafka consumer init failed");
    }

    app.listen(PORT, () => {
        logger.info(`Workflow service is now running on port ${PORT}`);
    });
}

initStart();
