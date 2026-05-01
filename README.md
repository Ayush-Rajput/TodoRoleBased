# Team Task Manager

A full-stack project management app with authentication, project teams, task assignment, status tracking, dashboard metrics, validations, relational data, and admin/member role-based access control.

## Tech Stack

- React + Vite + Tailwind CSS
- Node.js + Express REST API
- PostgreSQL + Prisma ORM
- JWT authentication with bcrypt password hashing
- Railway-ready deployment configuration

## Local Setup

```bash
npm install
cp .env.example .env
npx prisma migrate dev --name init
npm run seed
npm run dev
```

Seeded users:

- `admin@example.com` / `password123`
- `member@example.com` / `password123`

## Railway Deployment

1. Push this repository to GitHub.
2. Create a new Railway project from the GitHub repo.
3. Add a Railway PostgreSQL database.
4. Set these variables in Railway:
   - `DATABASE_URL` from the Railway PostgreSQL plugin
   - `JWT_SECRET` to a long random string
   - `NODE_ENV=production`
5. Railway will run:

```bash
npm run migrate && npm start
```

The frontend is built into `dist/public` and served by Express in production.

## API Overview

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/dashboard`
- `GET /api/projects`
- `POST /api/projects`
- `GET /api/projects/:projectId`
- `PATCH /api/projects/:projectId`
- `DELETE /api/projects/:projectId`
- `POST /api/projects/:projectId/members`
- `DELETE /api/projects/:projectId/members/:userId`
- `POST /api/projects/:projectId/tasks`
- `PATCH /api/projects/:projectId/tasks/:taskId`
- `DELETE /api/projects/:projectId/tasks/:taskId`

## Submission Checklist

- Live URL: deploy on Railway and add the public URL here.
- GitHub repo: push this project and add the repo URL here.
- README: included.
- Demo video: record a 2-5 minute walkthrough showing signup/login, project creation, adding members, creating tasks, status updates, dashboard, and role restrictions.
