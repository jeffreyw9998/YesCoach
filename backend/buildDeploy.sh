#!/bin/bash

# This script is used to build and deploy the application to the server

# Install all dependencies with pip

git pull origin backend
pip install -r requirements.txt


# Shut down services running on port 8000 with ss command

sudo fuser -k 8000/tcp

# Run the application

# Restart nginx

sudo systemctl restart nginx

python3 -m uvicorn main:app --workers 4 &

