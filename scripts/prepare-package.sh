#!/bin/bash

set -Eeuo pipefail
trap 'echo "Error: command failed in ${FUNCNAME[0]:-main} at line ${LINENO}." >&2' ERR

# Help
usage() {
    echo "Usage: $0 [--types|-t]"
}

# Transform long options to short ones
for arg in "$@"; do
    shift
    case "$arg" in
        "--help") set -- "$@" "-h" ;;
        "--types") set -- "$@" "-t" ;;
        *)        set -- "$@" "$arg"
    esac
done

# Set defaults
types=false
languages="en fr"

# Get options
while getopts 'is?t?h' c
do
    case $c in
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
    rm -rf dist
    rm -rf types
}

build_rollup() {
    echo "Building JS with rollup..."
    if [ -f ./rollup.config.js ]; then
        ../../node_modules/.bin/rollup --bundleConfigAsCjs --config ./rollup.config.js
    else
        ../../node_modules/.bin/rollup --bundleConfigAsCjs --config ../../rollup.config.js
    fi
}

build_types() {
    echo "Building types with tsc..."
    mkdir -p ./types/

    ts_entries=()
    while IFS= read -r dist_file; do
        rel_path="${dist_file#dist/}"
        rel_path="${rel_path%.*}"

        ts_path="src/${rel_path}.ts"
        tsx_path="src/${rel_path}.tsx"

        if [ -f "$ts_path" ]; then
            ts_entries+=("$ts_path")
            continue
        fi
        if [ -f "$tsx_path" ]; then
            ts_entries+=("$tsx_path")
        fi
    done < <(find dist -type f \( -name "*.js" -o -name "*.mjs" -o -name "*.jsx" \) 2>/dev/null | sort)

    unique_ts_entries=()
    if [ ${#ts_entries[@]} -gt 0 ]; then
        while IFS= read -r line; do
            if [ -n "$line" ]; then
                unique_ts_entries+=("$line")
            fi
        done < <(printf '%s\n' "${ts_entries[@]}" | awk '!seen[$0]++')
    fi

    if [ ${#unique_ts_entries[@]} -eq 0 ] && [ -f "src/index.ts" ]; then
        unique_ts_entries+=("src/index.ts")
    fi

    if [ ${#unique_ts_entries[@]} -eq 0 ]; then
        echo "No TypeScript entrypoints found from es directory."
        return 0
    fi

    echo "TypeScript entrypoints:"
    for entry in "${unique_ts_entries[@]}"; do
        echo "  - $entry"
    done

    ../../node_modules/.bin/tsc "${unique_ts_entries[@]}" --declaration --emitDeclarationOnly --allowJs --jsx "react-jsx" --declarationDir "types" --listEmittedFiles --noCheck

    echo "Bundling types with rollup..."
    if [ -f ./rollup.config.dts.js ]; then
        ../../node_modules/.bin/rollup --config ./rollup.config.dts.js
    else
        ../../node_modules/.bin/rollup --config ../../rollup.config.dts.js
    fi

    echo "Cleaning up types..."
    rm -rf types
}

copy_css() {
    echo "Copying css..."
    mkdir -p ./assets/css/
    cp dist/styles.css ./assets/css/styles.css
    rm -f dist/styles.css
}

# Build
export NODE_ENV=production
clean
build_rollup
if [ "$types" = true ]; then build_types; fi
if [ -f ./dist/styles.css ]; then copy_css; fi
