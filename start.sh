#!/bin/zsh
lsof -ti:3000,8080 | xargs kill -9 2>/dev/null
pkill -f "go run \.|python3.*http\.server"

sleep 2

cd backend && go run . &
cd .. && python3 start.py