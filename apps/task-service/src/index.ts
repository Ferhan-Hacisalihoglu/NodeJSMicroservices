import { config } from 'dotenv';
import { resolve } from 'node:path';
import { httpLogger, logger, successRequest, errorHandler, AppError, requireGatewaySecret } from 'shared';
import express from 'express';
import taskRouter from './routers/task.routes';


config({path: resolve(process.cwd(), '.env')});
config({path: resolve(process.cwd(), '../../.env')});

const PORT = process.env.TASK_PORT || 3002;

const app = express();

app.use(httpLogger);
app.use(express.json());

app.use("/tasks", requireGatewaySecret, taskRouter);

app.get("/health", (_req, res) => {
    successRequest(res, {service: "auth-service"})
});

app.use((_req, _res, next) => {
    next(new AppError("Route not found", 404));
});

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Task service is now running on port ${PORT}`);
});
