#!/bin/bash

rm -rf backend/static/frontend

# frontend
cd frontend
bun run build
cd ../

# backend
mv frontend/dist backend/static/frontend
cd backend
uv run fastapi run --host 0.0.0.0
cd ../
