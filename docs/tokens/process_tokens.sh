#!/bin/bash

set -euo pipefail

PADDING=60
QUALITY=85

while getopts "p:q:" opt; do
  case ${opt} in
  p) PADDING=$OPTARG ;;
  q) QUALITY=$OPTARG ;;
  esac
done

# Remove options from positional parameters
shift $((OPTIND - 1))

IFS=$'\n'
for file in $*; do
  # Extract filename without extension
  filename=$(basename -- "$file")
  target="${filename%.*}.webp"

  if [ -f "$target" ]; then
    echo "$target already exists"
    continue
  fi

  echo "creating $target"
  # Process image
  magick "$file" \
    \( +clone -fill black -draw "color 0,0 reset" \
    -fill white -draw "circle %[fx:w/2],%[fx:h/2] %[fx:w/2],$PADDING" \
    -alpha off \
    \) \
    -alpha off -compose CopyOpacity -composite \
    -trim +repage -resize 512x512 \
    -quality $QUALITY \
    "$target"
done
