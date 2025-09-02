# Fanfiq — MVP

This document provides a high-level overview of the Fanfiq project, its architecture, and how to get it running. For detailed development guidelines, see `DEVELOPMENT.md`.

## Quick Start

1.  **Environment:** Copy `env.example` to `.env` and fill in the variables for local development. For production on Railway, set these in the service variables.
2.  **Infrastructure:**
    ```bash
    docker compose -f infra/docker-compose.yml up -d
    ```
3.  **Backend:**
    ```bash
    # (Requires Python >= 3.11)
    pip install -r backend/api/requirements.txt
    alembic -c backend/api/alembic.ini upgrade head
    uvicorn backend.api.app.main:app --host 127.0.0.1 --port 58090
    ```
4.  **Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    Open http://localhost:3000 in your browser.

## Deployment (Railway)

The project is configured for seamless deployment on Railway.

1.  **Fork** this repository.
2.  **Create a new project** on Railway and select "Deploy from GitHub repo".
3.  Railway will automatically detect the services based on the Dockerfiles.
4.  **Configure services:**
    *   **api:**
        *   Root Directory: `.`
        *   Dockerfile Path: `Dockerfile`
    *   **workers:**
        *   Root Directory: `.`
        *   Dockerfile Path: `workers/Dockerfile`
    *   **parsers/ficbook, parsers/authortoday, parsers/litnet:**
        *   Root Directory: `.`
        *   Dockerfile Path: `parsers/{service_name}/Dockerfile`
    *   **frontend:**
        *   Root Directory: `frontend`
        *   Dockerfile Path: `Dockerfile`
5.  **Add Variables:** Link the database and Redis plugins, and set `NEXT_PUBLIC_API_URL` for the frontend. See `env.example` for the full list.

## Architecture

*   **Monorepo:** A single repository containing all services.
*   **Services:**
    *   `api`: FastAPI backend providing a JSON API.
    *   `parsers/*`: Independent Prefect worker services for each supported site.
    *   `frontend`: Next.js (app router) with TypeScript and Tailwind CSS.
*   **Data Stores:**
    *   PostgreSQL: Main database with Full-Text Search extensions.
    *   Redis: Caching and message broker for Prefect.

## Frontend MVP Features

*   **Search & Filtering:** A comprehensive search page with multi-select filters, word count range, and sorting.
*   **URL State Sync:** Search filters are synced with the URL for shareable links.
*   **Reader:** A clean, themeable (light/dark/sepia) reader with chapter navigation.
*   **Performance:**
    *   **Virtualized list** for smooth scrolling through thousands of results.
    *   **Safe HTML rendering** with `dompurify`.
*   **Accessibility:** Hotkeys for search (`/`) and filters (`f`).
*   **Error Handling:** Custom 404 and error pages.

## Backend Features

*   **FastAPI:** Modern, fast web framework for building APIs.
*   **SQLAlchemy & Alembic:** ORM and database migrations.
*   **Prefect:** Modern dataflow orchestration for parsing jobs.
*   **Parsers:** Ficbook, Author.Today, Litnet, and Fanfics.me parsers with support for authentication.
