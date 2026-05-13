#!/usr/bin/env bash
# build.sh — inline products.json into index.html / kotak.html / bulat.html
# so they render fully statically (no fetch round-trip needed at runtime).
#
# Why: the deployed pages can render their content from `window.__PRODUCTS__`
# instead of fetch('products.json'). This means the catalog works on file://,
# loads slightly faster, and is friendlier for search-engine crawlers.
#
# Idempotent: re-running replaces the previously-inlined block.
# No Jekyll required — `.nojekyll` stays.
#
# Usage:  ./build.sh
# Run after editing products.json or any HTML template, then commit.

set -euo pipefail

cd "$(dirname "$0")"

if [[ ! -f products.json ]]; then
  echo "build.sh: products.json not found" >&2
  exit 1
fi

python3 - <<'PY'
import json, pathlib, re

DATA = pathlib.Path('products.json').read_text().strip()
# Validate it's real JSON so we don't inline garbage.
json.loads(DATA)

START = '<!-- BUILD:DATA -->'
END   = '<!-- /BUILD:DATA -->'
INLINE = f'{START}\n  <script>window.__PRODUCTS__ = {DATA};</script>\n  {END}\n  '

EXISTING = re.compile(re.escape(START) + r'.*?' + re.escape(END) + r'\n\s*', re.DOTALL)
MARKER = '<script src="script.js" defer></script>'

files = ['index.html', 'kotak.html', 'bulat.html']
for name in files:
    p = pathlib.Path(name)
    html = p.read_text()
    if MARKER not in html:
        print(f'  skip {name}: no <script src="script.js"> tag')
        continue
    # Strip previously-inlined block (idempotent).
    html = EXISTING.sub('', html)
    # Insert the new block immediately before the script.js tag.
    html = html.replace(MARKER, INLINE + MARKER, 1)
    p.write_text(html)
    print(f'  built {name}')
PY

echo
echo "Done. Inlined products.json into index.html / kotak.html / bulat.html."
echo "Commit the result and push to deploy."
