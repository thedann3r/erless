#!/bin/bash
cd "$(dirname "$0")"
echo "Starting Employer Dashboard Server..."
PORT=3001 node server.js