#!/usr/bin/env python3
"""
Startup script for Erlessed HMS Integration Microservice
Runs the FastAPI service on port 8001 alongside the main Express server
"""

import uvicorn
import sys
import os
from pathlib import Path

# Add the hms_integration directory to Python path
sys.path.append(str(Path(__file__).parent))

if __name__ == "__main__":
    # Set environment variables for HMS service
    os.environ.setdefault("HMS_SECRET_KEY", "erlessed-hms-integration-2024")
    
    # Start the FastAPI HMS integration service
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8001,
        reload=True,
        log_level="info"
    )