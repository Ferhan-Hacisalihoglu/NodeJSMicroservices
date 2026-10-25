import { config } from 'dotenv';
import express from 'express';
import { resolve } from 'node:path';
import { AppError, errorHandler, httpLogger, logger, requireGatewaySecret, successRequest } from 'shared';
import attachmentsRouter from './routers/media.routers';



config({path: resolve(process.cwd(), '.env')});
config({path: resolve(process.cwd(), '../../.env')});

const PORT = process.env.MEDIA_PORT || 3003;

const app = express();

app.use(httpLogger)

app.get("/health", (_req, res) => {
    successRequest(res, {service: "media-service"})
});

app.use("/tasks", requireGatewaySecret, attachmentsRouter);

app.use((_req, _res, next) => {
    next(new AppError("Route not found", 404));
});

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Media Service is now running on port ${PORT}`)
});