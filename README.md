# Team Task Manager

## Live URL

- Frontend: [https://zonal-essence-production-3a8e.up.railway.app](https://zonal-essence-production-3a8e.up.railway.app)
- Backend: [https://team-task-manager-production-f625.up.railway.app](https://team-task-manager-production-f625.up.railway.app)

## Tech Stack

- Frontend: React.js (Vite), Tailwind CSS, Axios, React Router
- Backend: Node.js, Express.js
- Database: PostgreSQL with Prisma ORM
- Authentication: JWT + bcrypt
- Hosting/Deployment: Railway (backend + frontend + PostgreSQL)

## Features

- User registration and login with hashed passwords and JWT auth
- Protected routes with automatic 401 redirect to `/login`
- Project creation and listing for authenticated users
- Project membership with admin/member roles
- Admin-only member management (add/remove by email)
- Task creation with project assignment, assignee, due date, priority, and status
- Admin-only task edit/delete with membership checks
- Member-only task status updates for assigned tasks
- Dashboard metrics: total tasks, status distribution, overdue tasks, tasks per user
- Inline form validation on frontend before API calls
- Consistent API response format: `{ success, data, message }`
- Responsive Tailwind UI with loading states and error handling

## Local Setup

### Backend

```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=https://team-task-manager-production-f625.up.railway.app
```

## API Documentation

### Response Format

All endpoints return:

```json
{
  "success": true,
  "data": {},
  "message": ""
}
```

### Auth Routes (`/api/auth`)

- `POST /register` - Register user with `name`, `email`, `password` and return JWT
- `POST /login` - Authenticate with `email`, `password` and return JWT

### Project Routes (`/api/projects`) [Protected]

- `POST /` - Create project; creator is added as `ADMIN`
- `GET /` - Get all projects for authenticated user
- `GET /:id` - Get single project with members and tasks
- `POST /:id/members` - Admin only; add member by email
- `DELETE /:id/members/:userId` - Admin only; remove project member

### Task Routes (`/api/tasks`) [Protected]

- `POST /` - Admin creates task (`title`, `description`, `dueDate`, `priority`, `projectId`, `assignedTo`)
- `GET /project/:id` - Get all tasks for a project
- `GET /:id` - Get single task details by task id
- `PATCH /:id/status` - Assigned member updates own task status only
- `PATCH /:id` - Admin updates task fields
- `DELETE /:id` - Admin deletes task

### Dashboard Route (`/api/dashboard`) [Protected]

- `GET /` - Returns:
  - `totalTasks`
  - `tasksByStatus: { todo, inProgress, done }`
  - `tasksPerUser: [{ userName, count }]`
  - `overdueTasks`: due date in past and status not done

## Deployment Steps

1. Create an account at [railway.app](https://railway.app)
2. Create a new Railway project
3. Add PostgreSQL plugin and copy `DATABASE_URL`
4. Deploy backend service from `backend` directory
5. In backend Railway variables, add:
  - `DATABASE_URL`
  - `JWT_SECRET`
  - `PORT=5000`
6. Ensure backend service points to:
  - Root Directory: `backend`
  - Build Command: `npx prisma generate`
  - Start Command: `sh -c "npx prisma migrate deploy && npm start"`
7. Run database migrations in Railway backend shell (optional if using the start command above):
  ```bash
   npx prisma migrate deploy
  ```
8. Deploy frontend service from `frontend` directory
9. Ensure frontend service points to:
  - Root Directory: `frontend`
  - Build Command: `npm run build`
  - Start Command: `npm run preview -- --host 0.0.0.0 --port $PORT`
10. Set frontend variable:
  - `VITE_API_URL=https://team-task-manager-production-f625.up.railway.app`
11. Confirm backend health route and API routes work
12. Verify frontend auth, project flows, task flows, and dashboard stats on live URL

## Railway Configuration

### Backend `Procfile`

```procfile
web: node server.js
```

### Backend scripts (`backend/package.json`)

- `start`: `node server.js`
- `build`: `prisma generate && prisma migrate deploy`

### Frontend scripts (`frontend/package.json`)

- `build`: `vite build`

## Notes

- `frontend/vite.config.js` includes Railway host allowlist support for preview deployments.
- Initial Prisma migration files are committed in `backend/prisma/migrations` and required for table creation.

