# Deployment Guide (Render + Vercel + Docker Hub)

Repo: [github.com/SuryaPrakash4477/Ethara_AI_TA](https://github.com/SuryaPrakash4477/Ethara_AI_TA)

## 1. Backend + database on Render (~10 min)

1. Sign in at [render.com](https://render.com) with GitHub.
2. **New** → **Blueprint** → select **Ethara_AI_TA**.
3. Apply the blueprint (`render.yaml` creates PostgreSQL + Docker API).
4. Wait until **inventory-api** is **Live**. Copy its URL, e.g. `https://inventory-api-xxxx.onrender.com`.
5. Test: open `https://<your-api>/health` and `https://<your-api>/docs`.

## 2. Frontend on Vercel (~5 min)

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New Project** → import **Ethara_AI_TA**.
3. Set **Root Directory** to `frontend`.
4. **Environment Variables** → add:
   - `VITE_API_URL` = your Render API URL (no trailing slash), e.g. `https://inventory-api-xxxx.onrender.com`
5. Deploy. Copy the Vercel URL, e.g. `https://ethara-ai-ta.vercel.app`.

## 3. Docker Hub image (assessment deliverable)

```powershell
cd c:\Users\ASUS\Ethara_AI_TA
docker login
docker build -t suryaprakash4477/inventory-backend:latest ./backend
docker push suryaprakash4477/inventory-backend:latest
```

Image link: `https://hub.docker.com/r/suryaprakash4477/inventory-backend`

## 4. Update SUBMISSION.md

Fill in your live URLs in `SUBMISSION.md` and push to GitHub.

## One-click Render (alternative)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https://github.com/SuryaPrakash4477/Ethara_AI_TA)

After Render is live, complete Vercel step 2 with that API URL.
