#!/bin/bash
export NODE_ENV=production

languages=$(jq -r '.supportedLocales | join(" ")' ./package.json)
languages_pattern=$(jq -r '.supportedLocales | join("|")' ./package.json)

echo "Building intl..."

./scripts/extract.js '../../!(node_modules)/!(intl)/src/**/*.+(js|jsx)' ./lang/messages.json

for lang in $languages
do
    if [ "$lang" = "en" ]; then
        ./scripts/json2po.js --default ./lang/messages.json ./lang/$lang.po
    else
        ./scripts/json2po.js ./lang/messages.json ./lang/$lang.po
    fi
    ./scripts/po2json.js ./lang/$lang.po ./lang/$lang.json
done

./scripts/compile.js --ast "./lang/+($languages_pattern).json" ./locale
