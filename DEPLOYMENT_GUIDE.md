# Deployment Guide: Smart Complaint & Issue Tracking System

This guide provides step-by-step instructions for deploying the system to production using **Render** for the backend (Django) and **Cloudflare Pages** for the frontend (React).

---

## 🚀 1. Backend Deployment (Render)

### Prerequisites
- A GitHub repository with your code.
- A [Render](https://render.com/) account.

### Steps
1. **Create a New Web Service**:
   - Log in to your Render Dashboard.
   - Click **New +** and select **Web Service**.
   - Connect your GitHub account and select the `PROJECT-CLOUDREGEX` repository.

2. **Configure General Settings**:
   - **Name**: `civic-pulse-backend` (or any name you prefer).
   - **Root Directory**: `complaint_system` (This is where `manage.py` and `requirements.txt` are located).
   - **Environment**: `Python 3`.
   - **Region**: Choose the one closest to your users.
   - **Branch**: `main`.

3. **Configure Build & Start Commands**:
   - **Build Command**: `pip install -r requirements.txt && python manage.py collectstatic --no-input && python manage.py migrate`
   - **Start Command**: `gunicorn config.wsgi:application`

4. **Add Environment Variables**:
   Go to the **Environment** tab and add the following:
   - `SECRET_KEY`: *[Generate a secure random string]*
   - `DEBUG`: `False`
   - `ALLOWED_HOSTS`: `civic-pulse-backend.onrender.com` (Render will also automatically use the `RENDER_EXTERNAL_HOSTNAME` env var if your `settings.py` supports it).
   - `CSRF_TRUSTED_ORIGINS`: `https://civic-pulse-backend.onrender.com,https://civic-pulse.pages.dev`
   - `EMAIL_BACKEND`: `django.core.mail.backends.smtp.EmailBackend`
   - `EMAIL_HOST`: `smtp.gmail.com`
   - `EMAIL_PORT`: `587`
   - `EMAIL_USE_TLS`: `True`
   - `EMAIL_HOST_USER`: *[Your Gmail]*
   - `EMAIL_HOST_PASSWORD`: *[Your App Password]*

5. **Deploy**:
   - Click **Create Web Service**. Render will build and deploy your backend.

---

## 🌐 2. Frontend Deployment (Cloudflare Pages)

### Prerequisites
- A [Cloudflare](https://dash.cloudflare.com/) account.

### Steps
1. **Navigate to Pages**:
   - In the Cloudflare Dashboard, go to **Workers & Pages**.
   - Click **Create application** > **Pages** > **Connect to Git**.
   - Select your GitHub repository.

2. **Configure Build Settings**:
   - **Project name**: `civic-pulse`
   - **Production branch**: `main`
   - **Framework preset**: `Vite`
   - **Root directory**: `complaint_system/frontend`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

3. **Add Environment Variables (Crucial)**:
   - In the **Settings** or during setup, add:
   - `VITE_API_URL`: `https://civic-pulse-backend.onrender.com` (Use your actual Render URL).

4. **Deploy**:
   - Click **Save and Deploy**. Cloudflare will build your React app and host it at `https://civic-pulse.pages.dev`.

---

## 🔗 3. Final Integration

### Update Backend CORS
Once your frontend is live at `https://civic-pulse.pages.dev`, ensure your Backend's `CSRF_TRUSTED_ORIGINS` and `CORS_ALLOWED_ORIGINS` are updated to include this URL.

### Update README
Update the links in your `README.md` to point to the live URLs instead of `localhost`.
