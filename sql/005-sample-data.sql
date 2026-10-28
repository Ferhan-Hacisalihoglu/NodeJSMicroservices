BEGIN;

-- Sample credentials:
-- admin@example.com / password
-- user@example.com / password
INSERT INTO users (id, name, email, password_hash, role)
VALUES
    (
        '00000000-0000-0000-0000-000000000001',
        'Sample Admin',
        'admin@example.com',
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'ADMIN'
    ),
    (
        '00000000-0000-0000-0000-000000000002',
        'Sample User',
        'user@example.com',
        '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
        'USER'
    )
ON CONFLICT (email) DO NOTHING;

INSERT INTO tasks (id, title, status, created_by, created_at, updated_at)
VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        'Review authentication flow',
        'OPEN',
        '00000000-0000-0000-0000-000000000002',
        '2026-01-15T10:00:00Z',
        '2026-01-15T10:00:00Z'
    ),
    (
        '10000000-0000-0000-0000-000000000002',
        'Prepare production deployment',
        'IN_PROGRESS',
        '00000000-0000-0000-0000-000000000001',
        '2026-01-16T09:30:00Z',
        '2026-01-17T14:15:00Z'
    ),
    (
        '10000000-0000-0000-0000-000000000003',
        'Close completed support request',
        'CLOSED',
        '00000000-0000-0000-0000-000000000002',
        '2026-01-18T08:45:00Z',
        '2026-01-19T16:20:00Z'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO attachments (id, task_id, image_url, public_id, uploaded_by)
VALUES
    (
        '20000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        'http://localhost:9000/task-media/sample-auth-flow.jpg',
        'support-tasks/sample-auth-flow.jpg',
        '00000000-0000-0000-0000-000000000002'
    ),
    (
        '20000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000002',
        'http://localhost:9000/task-media/sample-deployment.jpg',
        'support-tasks/sample-deployment.jpg',
        '00000000-0000-0000-0000-000000000001'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO task_workflows (id, task_id, event_type, message, created_by)
VALUES
    (
        '30000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        'task.created',
        'Task created by the sample user.',
        '00000000-0000-0000-0000-000000000002'
    ),
    (
        '30000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000002',
        'task.created',
        'Task created for deployment tracking.',
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        '30000000-0000-0000-0000-000000000003',
        '10000000-0000-0000-0000-000000000002',
        'task.status_changed',
        'Deployment work started.',
        '00000000-0000-0000-0000-000000000001'
    ),
    (
        '30000000-0000-0000-0000-000000000004',
        '10000000-0000-0000-0000-000000000003',
        'task.status_changed',
        'Support request marked as closed.',
        '00000000-0000-0000-0000-000000000002'
    )
ON CONFLICT (id) DO NOTHING;

COMMIT;
