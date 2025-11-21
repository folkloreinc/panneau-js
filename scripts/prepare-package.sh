#!/bin/bash

# Help
usage() {
    echo "Usage: $0 [--scss|-s] [--types|-t]"
}

# Transform long options to short ones
for arg in "$@"; do
    shift
    case "$arg" in
        "--help") set -- "$@" "-h" ;;
        "--scss") set -- "$@" "-s" ;;
        "--types") set -- "$@" "-t" ;;
        *)        set -- "$@" "$arg"
    esac
done

# Set defaults
scss=false
types=false
languages="en fr"

# Get options
while getopts 'is?t?h' c
do
    case $c in
        s) scss=true ;;
        t) types=true ;;
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
    rm -rf types
}

build_rollup() {
    echo "Building JS with rollup..."
    if [ -f ./rollup.config.js ]; then
        ../../node_modules/.bin/rollup --config ./rollup.config.js --bundleConfigAsCjs
    else
        ../../node_modules/.bin/rollup --config ../../rollup.config.js --bundleConfigAsCjs
    fi
}

build_types() {
    echo "Building types with tsc..."
    mkdir -p ./types/
    ../../node_modules/.bin/tsc "src/index.js" --declaration --emitDeclarationOnly --allowJs --jsx "react-jsx" --declarationDir "types" --listEmittedFiles --noCheck
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
if [ "$types" = true ]; then build_types; fi
if [ -f ./es/styles.css ]; then copy_css; fi
if [ "$scss" = true ]; then copy_scss; fi
