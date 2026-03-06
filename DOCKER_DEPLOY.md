# Docker Deployment Guide

## 🚀 Quick Start

### **Prerequisites**
- Docker installed
- Docker Compose installed
- Your backend `.env` file configured

---

## 📦 Files Created

1. **`backend/Dockerfile`** - Builds the Flask app container
2. **`docker-compose.yml`** - Runs the Flask app
3. **`backend/requirements.txt`** - Updated with all dependencies

---

## 🔧 Setup Steps

### **1. Ensure `.env` file exists**

Make sure `backend/.env` has all required variables:

```env
MONGO_URL=mongodb://mongo_root:Vadodara55@72.62.79.188:27017/app_db?authSource=admin
DB_NAME=flyr_clone
GEMINI_API_KEY=AIzaSyD75sjOZ7t7zNuFB_fyNc3lAKQvffLMdZE
JWT_SECRET=super_secret_key
GOOGLE_CLIENT_ID=685666908473-hv64jrps35fgb8g7rh0n2os7mrchumf1.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=685666908473-hdngte9tj98te8jkj4goq5c805qnrrn9.apps.googleusercontent.com
GOOGLE_APPLICATION_CREDENTIALS=flyr-service-account.json
ANDROID_PACKAGE_NAME=com.anonymous.flyrclone
```

### **2. Ensure service account JSON exists**

Make sure `backend/flyr-service-account.json` is present (for Google Play IAP).

---

## 🏗️ Build and Run

### **Build the Docker image:**

```bash
docker-compose build
```

### **Start the container:**

```bash
docker-compose up -d
```

### **Check logs:**

```bash
docker-compose logs -f flask_app
```

### **Stop the container:**

```bash
docker-compose down
```

---

## 🌐 Access Your Backend

Once running, your backend will be available at:
- **Local:** http://localhost:5000
- **Network:** http://YOUR_SERVER_IP:5000

Test it:
```bash
curl http://localhost:5000
```

Expected response:
```json
{"status": "Gemini image backend running"}
```

---

## 📱 Update Your App

After deploying, update your app's backend URL:

**In `src/services/api.ts`:**

```typescript
export const backendURL = 'http://YOUR_SERVER_IP:5000';
```

Replace `YOUR_SERVER_IP` with your actual server IP or domain.

---

## 🔄 Rebuild After Code Changes

When you update your backend code:

```bash
docker-compose down
docker-compose build
docker-compose up -d
```

Or rebuild and restart in one command:

```bash
docker-compose up -d --build
```

---

## 🐛 Troubleshooting

### **Container won't start:**

Check logs:
```bash
docker-compose logs flask_app
```

### **Port 5000 already in use:**

Change port in `docker-compose.yml`:
```yaml
ports:
  - "8000:5000"  # Use port 8000 instead
```

### **Environment variables not loading:**

Verify `backend/.env` exists and has correct values.

### **Service account error:**

Ensure `backend/flyr-service-account.json` exists and is valid.

---

## 🎯 For Production Deployment

### **Option 1: Deploy to VPS (DigitalOcean, AWS, etc.)**

1. SSH into your server
2. Install Docker and Docker Compose
3. Clone your repository
4. Copy `.env` and service account JSON
5. Run `docker-compose up -d`
6. Configure firewall to allow port 5000
7. Use your server IP in the app

### **Option 2: Use a Domain**

1. Point your domain to server IP
2. Update backend URL to: `http://yourdomain.com:5000`
3. Or set up Nginx reverse proxy for HTTPS

### **Option 3: Use Nginx Reverse Proxy (Recommended)**

Add nginx service to `docker-compose.yml` for HTTPS and better security.

---

## 📊 Docker Commands Reference

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start containers in background |
| `docker-compose down` | Stop and remove containers |
| `docker-compose logs -f` | View live logs |
| `docker-compose ps` | List running containers |
| `docker-compose restart` | Restart containers |
| `docker-compose build` | Rebuild images |

---

## ✅ Deployment Checklist

- [ ] `backend/.env` file configured
- [ ] `backend/flyr-service-account.json` present
- [ ] Docker and Docker Compose installed
- [ ] Built Docker image: `docker-compose build`
- [ ] Started container: `docker-compose up -d`
- [ ] Verified backend is running: `curl http://localhost:5000`
- [ ] Updated app's `backendURL` to server IP
- [ ] Tested purchase flow with new backend URL
- [ ] Updated Google Play webhook URL (if using RTDN)

---

## 🎉 You're Done!

Your backend is now running in Docker and ready to handle:
- ✅ Image generation requests
- ✅ Google Play purchase verification
- ✅ User authentication
- ✅ Credit management

**Next:** Update Google Play Console webhook URL to your new backend URL!
