# Node.js Microservices

![Node.js](https://img.shields.io/badge/Node.js-20%2B-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-7.0-3178C6?logo=typescript&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169E1?logo=postgresql&logoColor=white)
![Apache Kafka](https://img.shields.io/badge/Apache_Kafka-4.3.1-231F20?logo=apachekafka&logoColor=white)
![MinIO](https://img.shields.io/badge/MinIO-S3%20Compatible-C72E49?logo=minio&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Authentication-000000?logo=jsonwebtokens&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-Validation-3E67B1?logo=zod&logoColor=white)


A TypeScript-based microservices project that exposes task management,
authentication, file attachments, and task workflows as separate services.
Clients do not communicate with the services directly; they go through the
API Gateway.

## Architecture

```text
Client
   |
   v
API Gateway (:3000)
   |-- Auth Service     (:3001)
   |-- Task Service     (:3002)
   |-- Media Service    (:3003)
   `-- Workflow Service (:3004)

Infrastructure:
  PostgreSQL   : database
  MinIO        : S3-compatible object storage for task images
  Apache Kafka : inter-service event communication
```

### Services

| Service | Responsibility |
| --- | --- |
| `api-gateway` | Single entry point, routing, CORS, Helmet, and rate limiting |
| `auth-service` | User registration, login, and JWT-based authentication |
| `task-service` | Creating, listing, viewing, and deleting tasks |
| `media-service` | Attaching images to tasks and listing attachments |
| `workflow-service` | Listing task workflow events |
| `shared` | Shared database pool, JWT, Kafka, logger, error, and validation helpers |

## Requirements

- Node.js 20 or higher
- npm
- Docker Desktop and Docker Compose

## Installation

```bash
npm install
```

Create a `.env` file in the root directory. Do not share the `.env` file in the
repository, and do not use the example passwords or secret values in production.

At a minimum, the following variables must be defined:

```dotenv
PORT=3000
AUTH_PORT=3001
TASK_PORT=3002
MEDIA_PORT=3003
WORKFLOW_PORT=3004

AUTH_SERVICE_URL=http://localhost:3001
TASK_SERVICE_URL=http://localhost:3002
MEDIA_SERVICE_URL=http://localhost:3003
WORKFLOW_SERVICE_URL=http://localhost:3004

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=microservices
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/microservices

JWT_SECRET=change-this-in-development
JWT_EXPIRES_IN=1d
GATEWAY_SECRET=change-this-in-development

MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=change-this-in-development
S3_BUCKET=task-media
MINIO_HOST=localhost
MINIO_API_PORT=9000
MINIO_CONSOLE_PORT=9001
MINIO_URL=http://localhost:9000
MINIO_REGION=us-east-1

KAFKA_BROKER=localhost:9092
LOG_LEVEL=info
```

Cloudinary variables are only required if you choose a storage strategy
configured with Cloudinary.

## Starting the infrastructure

PostgreSQL and MinIO:

```bash
docker compose up -d
```

Kafka:

```bash
npm run kafka:up
npm run kafka:topics
```

To follow Kafka logs and to stop Kafka:

```bash
npm run kafka:logs
npm run kafka:down
```

To check the status of PostgreSQL and MinIO:

```bash
docker compose ps
```

The MinIO API is available at `http://localhost:9000` and the management
console at `http://localhost:9001`. The bucket is created by the `minio-init`
service using the `S3_BUCKET` value in `.env`.

## Database migrations

Migration files must be run in order:

```bash
npm run db:migrate -- sql/001-users.sql
npm run db:migrate -- sql/002-tasks.sql
npm run db:migrate -- sql/003-attachments.sql
npm run db:migrate -- sql/004-workflow.sql
npm run db:migrate -- sql/005-sample-data.sql
```

The last migration adds sample users and tasks:

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@example.com` | `password` |
| User | `user@example.com` | `password` |

These credentials are for development/testing only and must not be used in
production.

## Running the application

To start all services, Kafka, and the Kafka topics:

```bash
npm run dev:all
```

To run the services individually:

```bash
npm run dev:api-gateway
npm run dev:auth
npm run dev:task
npm run dev:media
npm run dev:workflow
```

By default, the gateway runs at `http://localhost:3000`. In development mode,
TypeScript files are watched with `tsx watch`.

## API

The recommended address for all client requests is `http://localhost:3000`.
The gateway adds the required service identity headers to backend requests
itself.

### Authentication

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/auth/register` | Registers a user (`name`, `email`, `password`) |
| `POST` | `/auth/login` | Logs in and returns a JWT (`email`, `password`) |
| `GET` | `/auth/me` | Returns the authenticated user's information |

For protected endpoints, the JWT must be sent in the following header:

```http
Authorization: Bearer <token>
```

### Tasks

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/tasks` | Creates a task (`title`, at least 5 characters) |
| `GET` | `/tasks` | Lists the user's tasks |
| `GET` | `/tasks/:id` | Returns task details |
| `DELETE` | `/tasks/:id` | Deletes a task |

Example of creating a task:

```bash
curl -X POST http://localhost:3000/tasks ^
  -H "Authorization: Bearer <token>" ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Review authentication flow\"}"
```

### Media attachments

| Method | Endpoint | Description |
| --- | --- | --- |
| `POST` | `/tasks/:taskId/attachments` | Uploads an image in the `image` field |
| `GET` | `/tasks/:taskId/attachments` | Lists the images attached to the task |

The uploaded file must be an image and must not exceed 5 MB.

### Workflow

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `http://localhost:3004/api/workflow/:taskId` | Lists the task's workflow events from the workflow service |

The workflow routing in the gateway is configured under the `/workflows` path.
When using it through the gateway, verify that the request path matches the
relevant gateway rule; the Postman examples in the repository reference the
`/tasks/:taskId/workflow` path.

### Health checks

```text
GET /health
```

The gateway responds with `api-gateway`, while the services' direct health
endpoints report their respective service names. The services' direct
endpoints are located at `http://localhost:3001/health`, `:3002/health`,
`:3003/health`, and `:3004/health`, respectively.

## Postman

Ready-made requests are located under `postman/collections`:

- `authenctication`: register, login, and current user requests
- `tasks`: task, media attachment, and workflow requests

Import the requests into Postman, first obtain a token with the register/login
request, and use that token in protected requests.

## Project structure

```text
apps/
  api-gateway/
  auth-service/
  media-service/
  task-service/
  workflow-service/
packages/
  shared/
sql/
docker/
postman/
scripts/
```

## Development notes

- Backend services only accept gateway requests that carry the
  `x-gateway-secret` header.
- The gateway has a rate limit of 100 requests per client in a 15-minute
  window.
- The task and media services run as Kafka producers, and the workflow service
  runs as a Kafka consumer.
- `docker compose down -v` also deletes the PostgreSQL and MinIO volumes; this
  command permanently removes development data.
