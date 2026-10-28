import { config } from 'dotenv';
import { resolve } from 'node:path';
import { httpLogger, logger, successRequest, errorHandler, AppError, requireGatewaySecret } from 'shared';
import express from 'express';
import taskRouter from './routers/task.routes';
import { initKafka } from './kafka';


config({path: resolve(process.cwd(), '.env')});
config({path: resolve(process.cwd(), '../../.env')});

const PORT = process.env.TASK_PORT || 3002;

const app = express();

app.use(httpLogger);
app.use(express.json());

app.get("/health", (_req, res) => {
    successRequest(res, {service: "task-service"})
});

app.use("/tasks", requireGatewaySecret, taskRouter);

app.use((_req, _res, next) => {
    next(new AppError("Route not found", 404));
});

app.use(errorHandler);

async function initStartUp(){
    try{
        await initKafka();
    } catch(error){
        logger.error({error}, "kafka producer init failed");
    }

    app.listen(PORT, () => {
    logger.info(`Task service is now running on port ${PORT}`);
    });
}

initStartUp();