# Submission Checklist

Fill in the live URLs after deploying (see README **Cloud Deployment Guide**).

| Deliverable | Status | Link |
|-------------|--------|------|
| GitHub repository | ✅ Published | https://github.com/SuryaPrakash4477/Ethara_AI_TA |
| Docker Hub backend image | ⏳ Manual step | _e.g. `https://hub.docker.com/r/<username>/inventory-backend`_ |
| Live backend API | ⏳ Deploy to Render / Railway / Fly.io | _e.g. `https://your-api.onrender.com`_ |
| Live frontend | ⏳ Deploy to Vercel / Netlify | _e.g. `https://your-app.vercel.app`_ |

## Quick deploy

See **[DEPLOY.md](./DEPLOY.md)** for full steps.

| Step | Platform | Action |
|------|----------|--------|
| 1 | [Render](https://render.com/deploy?repo=https://github.com/SuryaPrakash4477/Ethara_AI_TA) | Blueprint deploy (`render.yaml`) |
| 2 | [Vercel](https://vercel.com/new) | Import repo, root `frontend`, set `VITE_API_URL` |
| 3 | [Docker Hub](https://hub.docker.com/) | `docker push suryaprakash4477/inventory-backend` |
