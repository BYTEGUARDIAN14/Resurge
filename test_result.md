# Test Results

This file tracks manual and automated test outcomes for Resurge.

## Backend Tests

Run with:
```bash
cd backend
EXPO_PUBLIC_BACKEND_URL=http://localhost:8000 pytest tests/ -v
```

## Frontend

Run locally with:
```bash
cd frontend
yarn start
```

## Notes

- All backend tests hit `EXPO_PUBLIC_BACKEND_URL` (defaults to `http://localhost:8000` if not set).
- Frontend is offline-first: after the first launch with the backend running, all content is served from AsyncStorage.