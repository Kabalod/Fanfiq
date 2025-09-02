# Fanfiq — Development Guide

This document provides detailed instructions for developers working on the Fanfiq project. For a high-level overview, see `README.md`.

## Getting Started

1.  **Prerequisites:** Docker, Node.js (>=18), Python (>=3.11).
2.  **Setup:**
    *   Clone the repository.
    *   Copy `env.example` to `.env` and configure for your local setup.
    *   Run `docker compose -f infra/docker-compose.yml up -d` to start PostgreSQL and Redis.
    *   Install frontend dependencies: `cd frontend && npm install`.
    *   Install backend dependencies: `pip install -r backend/api/requirements.txt`.
    *   Install parser dependencies: `pip install -r parsers/ficbook/requirements.txt`, etc. for each parser.

## Backend Development

*   **Running the API:**
    ```bash
    alembic -c backend/api/alembic.ini upgrade head
    uvicorn backend.api.app.main:app --host 127.0.0.1 --port 58090 --reload
    ```
*   **Running Parser Workers (Prefect):**
    *   Each parser is a separate service. To run one locally, you'll need to start a Prefect agent pointing to the correct pool (e.g., `ficbook-pool`).
    *   The flows are defined in `parsers/{service_name}/worker.py`.
*   **Database Migrations:**
    *   Modify SQLAlchemy models in `backend/api/db/models.py`.
    *   Generate a new migration: `alembic -c backend/api/alembic.ini revision --autogenerate -m "Your migration message"`.
    *   Apply migrations: `alembic -c backend/api/alembic.ini upgrade head`.

## Frontend Development

*   **Running the dev server:**
    ```bash
    cd frontend
    npm run dev
    ```
    The app will be available at http://localhost:3000.
*   **Component Structure:**
    *   UI primitives are from `shadcn/ui` and located in `src/components/ui`.
    *   Composed components are organized by feature in `src/components/{search,results,reader,layout,common,states}`.
*   **State Management:**
    *   Server state is managed via `tanstack-query` (`@/lib/api/client.ts`).
    *   Search filter state is synced with the URL via `useRouter` and `useSearchParams` in `HomePage`.
*   **Styling:** Tailwind CSS is used for all styling. Global styles and theme variables are in `src/app/globals.css`.

## Deployment (Railway)

The project is configured for a multi-service deployment on Railway.

### Services

1.  **api (FastAPI):**
    *   **Builder:** Dockerfile
    *   **Root Directory:** `.`
    *   **Dockerfile Path:** `Dockerfile`
    *   **Start Command:** (Optional, defined in Dockerfile) `sh -lc "PYTHONPATH=/app python -m uvicorn backend.api.app.main:app --host 0.0.0.0 --port ${PORT:-58090}"`
2.  **parsers/ficbook, parsers/authortoday, parsers/litnet, parsers/fanficsme:**
    *   **Builder:** Dockerfile
    *   **Root Directory:** `.`
    *   **Dockerfile Path:** `parsers/{service_name}/Dockerfile`
    *   **Start Command:** (Defined in Dockerfile, e.g., `prefect worker start --pool fanficsme-pool`)
3.  **frontend (Next.js):**
    *   **Builder:** Dockerfile
    *   **Root Directory:** `frontend`
    *   **Dockerfile Path:** `Dockerfile`

### Environment Variables

*   All services require `DATABASE_URL` and `REDIS_URL` linked from the Railway plugins.
*   `api` and parser services require `PYTHONPATH=/app`.
*   `api` requires `ALLOWED_ORIGINS` set to the public URL of the frontend service.
*   `frontend` requires `NEXT_PUBLIC_API_URL` set to the public URL of the api service.

See `env.example` for a complete list of variables.
