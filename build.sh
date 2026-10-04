#!/usr/bin/env bash
# Rebuilds the three minified files of the extension from source/ and checks that the
# result is byte-for-byte identical to extension/ (the files published on the Chrome
# Web Store). Requires Node.js. Usage: bash build.sh
set -euo pipefail
cd "$(dirname "$0")"
OUT=$(mktemp -d)
for f in content background chart; do
  npx --yes terser@5.51.2 "source/$f.js" -c -m --comments false -o "$OUT/$f.js"
  if cmp -s "$OUT/$f.js" "extension/$f.js"; then echo "OK    $f.js is identical to the published file"; else echo "DIFF  $f.js"; exit 1; fi
done
echo
echo "Checking every published file against SHA256SUMS.txt:"
(cd extension && sha256sum -c ../SHA256SUMS.txt)
