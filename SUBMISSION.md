# Submission Checklist

Fill in the live URLs after deploying (see README **Cloud Deployment Guide**).

| Deliverable | Status | Link |
|-------------|--------|------|
| GitHub repository | ✅ Code in repo | _Add your public GitHub URL_ |
| Docker Hub backend image | ⏳ Manual step | _e.g. `https://hub.docker.com/r/<username>/inventory-backend`_ |
| Live backend API | ⏳ Deploy to Render / Railway / Fly.io | _e.g. `https://your-api.onrender.com`_ |
| Live frontend | ⏳ Deploy to Vercel / Netlify | _e.g. `https://your-app.vercel.app`_ |

## Deploy backend (Render example)

1. Push this repo to GitHub.
2. Create a PostgreSQL database on Render (or Supabase).
3. New **Web Service** → Docker → root/context: `backend`, Dockerfile: `backend/Dockerfile`.
4. Environment: `DATABASE_URL=<your-postgres-url>`.
5. Push the same image to Docker Hub: `docker build -t <user>/inventory-backend ./backend && docker push <user>/inventory-backend`.

## Deploy frontend (Vercel example)

1. Import repo, set **Root Directory** to `frontend`.
2. Build: `npm run build`, Output: `dist`.
3. Environment: `VITE_API_URL=https://your-api.onrender.com` (no trailing slash).
4. Redeploy after backend URL is known.
