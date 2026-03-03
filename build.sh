#!/bin/bash
set -e

echo "Building WASM module..."
cd wasm
wasm-pack build --target web --release --out-dir ../js/pkg

echo "Building TS wrapper..."
cd ../js
npm install
npm run build
echo "Build complete."
