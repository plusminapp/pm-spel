#!/bin/bash

set -a
. ./.env
set +a

# Build de builder image voor pm-spel
docker build --platform="linux/amd64" -f Dockerfile.builder -t plusmin/pm-spel-builder:latest .