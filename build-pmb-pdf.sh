#!/bin/bash
set -e

PROJECT_FOLDER="${PROJECT_FOLDER:-$HOME/io.vliet/plusmin}"

pushd "${PWD}/public/docs/spel/"
./genereer.sh
popd
