# Momentum AI — Production Deployment & Checklist Guide

This document describes how to deploy Momentum AI to production environments—specifically Google Cloud Run—and provides a comprehensive production checklist for DevOps and Security engineers.

---

## 🛠️ Deployment on Google Cloud Run

Momentum AI is containerized and ready to deploy as a stateless, highly scalable service on Google Cloud Run. It is configured to run on Port `3000` behind a secure HTTPS container contract.

### Prerequisites
1. Installed Google Cloud SDK (`gcloud`).
2. Configured billing on your Google Cloud Project.
3. Enabled the Artifact Registry and Cloud Run APIs:
   ```bash
   gcloud services enable artifactregistry.googleapis.com run.googleapis.com
   ```

---

### Step-by-Step Deployment Pipeline

#### Step 1: Create a Secure Artifact Repository
Initialize an Artifact Registry repository to host your production container builds securely:
```bash
gcloud artifacts repositories create momentum-repo \
    --repository-format=docker \
    --location=us-central1 \
    --description="Momentum AI Production Container Repo"
```

#### Step 2: Build and Tag Container using Cloud Build
Submit a build task to containerize your code using our optimized production `Dockerfile`:
```bash
gcloud builds submit --tag us-central1-docker.pkg.dev/[PROJECT_ID]/momentum-repo/momentum-app:latest .
```

#### Step 3: Deploy to Cloud Run with Secret Injections
Deploy the container with environment variables and secure memory bounds:
```bash
gcloud run deploy momentum-app \
    --image us-central1-docker.pkg.dev/[PROJECT_ID]/momentum-repo/momentum-app:latest \
    --region us-central1 \
    --platform managed \
    --allow-unauthenticated \
    --set-env-vars="NODE_ENV=production,GEMINI_API_KEY=YOUR_GEMINI_KEY" \
    --memory=512Mi \
    --cpu=1 \
    --max-instances=10
```

*Note: For maximum enterprise security, prefer storing `GEMINI_API_KEY` inside **Google Secret Manager** and referencing it via Cloud Run secrets mounting:*
```bash
--update-secrets="GEMINI_API_KEY=gemini-key-secret:latest"
```

---

## 🛡️ Production Verification Checklist

Follow this strict compliance audit checklist prior to moving any deployments to customer-facing traffic.

### 🔒 1. API Security & Access Controls
- [x] **No exposed API Secrets**: The frontend strictly proxies all API operations through our server endpoints. No API keys are visible to the client browser devtools.
- [x] **Secure Session Cookies**: Custom session cookies use `HttpOnly`, `SameSite=Lax`, and `Secure` attributes to block Cross-Site Scripting (XSS) and Session Hijacking.
- [x] **Isolate Request Scope**: Implemented `AsyncLocalStorage` request-scoped execution. Global session leaks are fully mitigated.
- [x] **Strict CORS Declarations**: Standard API router blocks requests originating from outside authorized domain prefixes.

### ⚙️ 2. Performance & Resource Allocation
- [x] **Bundle Compilations**: The production bundler maps our Express controller and agent pipeline into a single optimized `dist/server.cjs` file, resulting in near-instant container boots.
- [x] **Vite Assets Minimization**: React production assets are compiled, minified, compressed, and served with optimal cache headers.
- [x] **Debounced Resizes**: Dynamic UI canvases (like the Task Dependency Graph) use `ResizeObserver` with custom debouncing routines to protect memory threads from continuous layouts.

### ⚡ 3. Google Workspace Handshake Safeguards
- [x] **Lazy API Clients**: Google Calendar and Gmail clients initialize on-demand rather than at module load. If a user hasn't authed, other dashboard interfaces degrade gracefully without throwing server crashes.
- [x] **Token Encryption**: Stored tokens are scoped strictly to the current user's profile and are never cached globally.
- [x] **Scopes Minimized**: Integration scopes request only the absolute minimum read/write permissions required to complete the user's tasks.
