import { config } from 'dotenv';
import express from 'express';
import { resolve } from 'node:path';
import { AppError, errorHandler, httpLogger, logger, successRequest } from 'shared';

config({path: resolve(process.cwd(), '.env')});
config({path: resolve(process.cwd(), '../../.env')});

const PORT = process.env.AUTH_PORT || 3001;

const app = express();

app.use(httpLogger);
app.use(express.json());

app.get("/health", (req, res) => {
    successRequest(res, {service: "auth-service"})
});

app.use((_req, res, next) => {
    next(new AppError("Route not found",404))
});

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`Auth service is now running on port ${PORT}`);
});

