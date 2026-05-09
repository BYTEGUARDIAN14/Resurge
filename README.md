# Resurge

A premium, offline-first sobriety companion for iOS. All sensitive data is stored only on the device — the backend serves only curated public content (quotes, milestones, brain timeline) which is cached permanently on first launch.

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 |
| Yarn | 1.22.x |
| Python | 3.10+ |
| Expo CLI | bundled via `yarn` |
| EAS CLI | `npm install -g eas-cli` |
| Xcode | ≥ 15 (Mac, for iOS builds) |

---

## Project structure

```
waste/
├── backend/          FastAPI — serves quotes, milestones, brain timeline
└── frontend/         Expo (React Native) — the iOS/Android app
```

---

## 1 · Run the backend locally

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Copy and fill in environment variables
copy .env.example .env        # Windows
# cp .env.example .env        # macOS/Linux

# Edit .env — set MONGO_URL and DB_NAME
# Example: MONGO_URL=mongodb://localhost:27017  DB_NAME=resurge

# Start the server (port 8000)
uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000/api`.

> **Note:** The frontend is **offline-first** — on the very first launch it fetches all content from the backend and caches it permanently. After that, the backend is never contacted again and the app works 100% offline.

---

## 2 · Run the frontend locally

```bash
cd frontend

# Install dependencies
yarn install

# Copy environment file
copy .env.example .env        # Windows
# cp .env.example .env        # macOS/Linux

# Edit .env if needed (defaults to http://localhost:8000)
# EXPO_PUBLIC_BACKEND_URL=http://localhost:8000

# Start Metro bundler
yarn start
```

Press `i` to open in iOS Simulator, `a` for Android emulator, or scan the QR code with the **Expo Go** app on your phone.

---

## 3 · Build for TestFlight (EAS)

### One-time setup

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Log in to your Expo account (create one at expo.dev if needed)
eas login

# Link this project to your Expo account (run from frontend/)
cd frontend
eas init --id <your-expo-project-id>
```

Then open `eas.json` and fill in your Apple credentials in the `submit` block:

```json
"appleId": "your@apple.com",
"ascAppId": "YOUR_ASC_APP_ID",   // App Store Connect App ID
"appleTeamId": "YOUR_TEAM_ID"    // 10-character Apple Team ID
```

### Build for TestFlight (iOS)

```bash
cd frontend

# Build a TestFlight-ready .ipa (runs in EAS cloud, no Mac required)
eas build --platform ios --profile preview
```

EAS will prompt you to sign in with your Apple ID and handle provisioning automatically.

### Submit to TestFlight

```bash
eas submit --platform ios --profile preview --latest
```

This uploads the most recent `preview` build to App Store Connect. Open TestFlight on your iPhone to install.

### Build Android APK

```bash
cd frontend

# Build a standalone .apk that can be installed directly without the Play Store
eas build --platform android --profile preview
```

When the build finishes, it will provide a QR code and a link to download the `.apk`.

### Production build (App Store / Play Store)

```bash
eas build --platform all --profile production
```

---

## 4 · Run backend tests

```bash
cd backend
.venv\Scripts\activate

# Run against local server (make sure uvicorn is running first)
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000 pytest tests/ -v
```

---

## Environment variables

### `backend/.env`

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `DB_NAME` | MongoDB database name | `resurge` |

### `frontend/.env`

| Variable | Description | Default |
|----------|-------------|---------|
| `EXPO_PUBLIC_BACKEND_URL` | Backend base URL for first-launch cache seed | `http://localhost:8000` |

---

## Offline behaviour

- **First launch with backend running** → all quotes, milestones, and brain timeline are fetched and stored in AsyncStorage permanently.
- **First launch without backend** → hardcoded fallback content (identical to backend data) is used.
- **Every subsequent launch** → AsyncStorage only, no network calls to the backend.
