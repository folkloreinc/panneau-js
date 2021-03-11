#!/bin/bash

# Help
usage() {
    echo "Usage: $0 [--scss|-s]"
}

# Transform long options to short ones
for arg in "$@"; do
    shift
    case "$arg" in
        "--help") set -- "$@" "-h" ;;
        "--scss") set -- "$@" "-s" ;;
        *)        set -- "$@" "$arg"
    esac
done

# Set defaults
scss=false
languages="en fr"

# Get options
while getopts 'is?h' c
do
    case $c in
        s) scss=true ;;
        h) usage; exit 0 ;;
        ?) usage >&2; exit 1 ;;
    esac
done

# Build methods
clean() {
    echo "Cleaning..."
    rm -rf scss
    rm -rf assets
    rm -rf lib
    rm -rf es
}

build_rollup() {
    echo "Building JS with rollup..."
    if [ -f ./rollup.config.js ]; then
        ../../node_modules/.bin/rollup --config ./rollup.config.js
    else
        ../../node_modules/.bin/rollup --config ../../rollup.config.js
    fi
}

copy_css() {
    echo "Copying css..."
    mkdir -p ./assets/css/
    cp es/styles.css ./assets/css/styles.css
    rm -f es/styles.css
    rm -f lib/styles.css
}

copy_scss() {
    echo "Copying scss..."
    mkdir -p ./scss/
    find ./src -type f -name "*.scss" ! -name "*.module.scss" ! -name "*.global.scss" -exec cp {} ./scss/ \;
}

# Build
export NODE_ENV=production
clean
build_rollup
if [ -f ./es/styles.css ]; then copy_css; fi
if [ "$scss" = true ]; then copy_scss; fi
