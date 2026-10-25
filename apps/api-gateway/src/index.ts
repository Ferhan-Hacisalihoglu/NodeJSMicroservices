import { config } from 'dotenv';
import { resolve } from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit, { MINUTE } from 'express-rate-limit';
import { AppError, errorHandler, httpLogger, logger, successRequest } from 'shared';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { gatewayAuth } from './middleware/gatewayAuth';



config({ path: resolve(process.cwd(), '.env') });
config({ path: resolve(process.cwd(), '../../.env') });

const PORT = process.env.PORT || 3000;

const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const TASK_SERVICE_URL = process.env.TASK_SERVICE_URL || 'http://localhost:3002';
const MEDIA_SERVICE_URL = process.env.MEDIA_SERVICE_URL || 'http://localhost:3003';

const app = express();

// secure defaults http headers
app.use(helmet());
app.use(cors());
app.use(
    rateLimit({
        windowMs: 15 * MINUTE,
        limit: 100,
        standardHeaders: true,
        legacyHeaders: false,
    }),
);

app.use(httpLogger)

app.use("/health", (_req, res) => {
    successRequest(res, { status: "api-gateway" });
});

app.use(
    "/auth",
    gatewayAuth,

    createProxyMiddleware({
        target: AUTH_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: (path) => `/auth${path}`,
    })
)

const taskProxy = createProxyMiddleware({
        target: TASK_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: (currentPath) => `/tasks${currentPath}`,
});

const mediaProxy = createProxyMiddleware({
    target: MEDIA_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: (path) => `/tasks${path}`,   
})

app.use(
    "/tasks",
    gatewayAuth,
    (req, res, next) => {
        if (req.path.includes("/attachments")) {
            return mediaProxy(req, res, next);
        }

    return taskProxy(req, res, next);
})

app.use((_req, _res, next) => {
    next(new AppError("Route not found",404));
})

app.use(errorHandler);

app.listen(PORT, () => {
    logger.info(`API Gateway running on port ${PORT}`);
});

