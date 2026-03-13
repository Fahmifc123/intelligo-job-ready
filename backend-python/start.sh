#!/bin/bash

# Job Ready FastAPI Startup Script
# Usage: ./start.sh [dev|prod]

MODE=${1:-prod}
HOST=${HOST:-0.0.0.0}
PORT=${PORT:-5050}

echo "Starting Job Ready API..."
echo "Mode: $MODE"
echo "Host: $HOST"
echo "Port: $PORT"

# Check if virtual environment exists, if not create it
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -q -r requirements.txt

# Create logs directory if not exists
mkdir -p logs

# Run based on mode
if [ "$MODE" = "dev" ]; then
    echo "Starting in DEVELOPMENT mode (with auto-reload)..."
    uvicorn app.main:app \
        --host $HOST \
        --port $PORT \
        --reload \
        --log-level debug
else
    echo "Starting in PRODUCTION mode..."
    uvicorn app.main:app \
        --host $HOST \
        --port $PORT \
        --workers 4 \
        --log-level info \
        --access-log \
        --error-logfile logs/error.log
fi
