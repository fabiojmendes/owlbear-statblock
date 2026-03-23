#!/bin/bash

# Configuration variables
REPO_URL="https://github.com/fabiojmendes/owlbear-statblock"
RAW_BASE_URL="https://raw.githubusercontent.com/fabiojmendes/owlbear-statblock/master"
BLOB_BASE_URL="$REPO_URL/blob/master"
MANIFEST_URL="https://statblock.juzam.pro/manifest.json"

# Extract data from manifest
TITLE=$(jq -r '.name' public/manifest.json)
DESCRIPTION=$(jq -r '.description' public/manifest.json)
LEARN_MORE=$(jq -r '.homepage_url' public/manifest.json)

# Create store.md and write the frontmatter
cat <<EOF >./docs/store.md
---
title: $TITLE
description: $DESCRIPTION
author: Fabio Mendes
image: $RAW_BASE_URL/docs/images/hero.png
icon: $RAW_BASE_URL/public/store-icon.svg
tags:
  - content-pack
  - automation
manifest: $MANIFEST_URL
learn-more: $LEARN_MORE
---
EOF

# Use sed to replace image links and document links and append to store.md
sed \
  -e "1d" \
  -e "s|!\[\([^]]*\)\](docs/images/\([^)]*\))|![\1]($RAW_BASE_URL/docs/images/\2)|g" \
  -e "s|!\[\([^]]*\)\](\./docs/images/\([^)]*\))|![\1]($RAW_BASE_URL/docs/images/\2)|g" \
  -e "s|\[\([^]]*\)\](\./docs/\([^)]*\.md\))|[\1]($BLOB_BASE_URL/docs/\2)|g" \
  -e "s|\[\([^]]*\)\](docs/\([^)]*\.md\))|[\1]($BLOB_BASE_URL/docs/\2)|g" \
  -e "s|\[\([^]]*\)\](\./\([^)]*\.md\))|[\1]($BLOB_BASE_URL/\2)|g" \
  README.md >>./docs/store.md

echo "Created store.md successfully."
