#!/bin/bash

cd backend
go run . &
cd ..
python3 -m http.server 8000