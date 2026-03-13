#!/bin/bash

# PM2 Startup Script for Job Ready FastAPI
# Usage: pm2 start pm2-start.sh --name jobready-api

cd "$(dirname "$0")"

# Activate virtual environment
source venv/bin/activate

# Run uvicorn with production settings
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port 5050 \
    --workers 4 \
    --log-level info
