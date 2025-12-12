# To-Do Frontend (React)

A minimal, modern React frontend for the To-Do app. It connects to a backend API (default http://localhost:3001) to provide full CRUD with loading/error states.

## Features
- List, add, edit, delete, and toggle completion of tasks
- Loading and error states
- Theme toggle (light/dark)
- Configurable API base URL via environment variable

## Configuration
Create a `.env` file in this directory (same level as `package.json`) and set:

```
REACT_APP_API_BASE_URL=http://localhost:3001
```

If not provided, the app defaults to `http://localhost:3001`.

Note: Ensure the backend enables CORS for the frontend origin (e.g., http://localhost:3000). The frontend issues requests with `mode: 'cors'` and JSON headers.

## Scripts

- `npm start` — Runs the app on http://localhost:3000
- `npm test` — Test runner
- `npm run build` — Production build

## Backend Contract
The app expects a REST API:
- GET `/tasks` -> `[ { id, title, completed } ]`
- POST `/tasks` body `{ title }` -> created task
- PUT `/tasks/:id` body `{ title }` -> updated task
- PATCH `/tasks/:id` body `{ completed }` -> updated task
- DELETE `/tasks/:id` -> 204 or confirmation

Adjust `src/api.js` if your backend differs.

## Styling
Lightweight styles live in `src/App.css` and follow a modern blue-accent theme. You can adjust CSS variables for branding.
