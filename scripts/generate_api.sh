#!/bin/bash
packages=$(find ./fields/* ./forms/* ./layouts/* ./lists/* ./modals/* ./packages/* ./previews/* ! -name "*generator-panneau*" -maxdepth 0 -type d)

for package in $packages; do
    name=$(basename $package)
    directory=$(dirname $package | sed -e "s/\.\///g")
    mkdir -p docs/api/$directory
    ./node_modules/.bin/jsdoc "$package/src/" -r -c jsdoc.json -d docs/api/$directory/$name
    # react-docgen --out="docs/api/$directory/$name.json" --pretty --extension=jsx --ignore="__stories__" $package/src/
done
