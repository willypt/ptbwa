#!/usr/bin/env bash
# Local dev server for buanawisesa-site.
# Usage:  ./serve.sh          (defaults to port 8000)
#         ./serve.sh 8080     (custom port)
#
# Requires python3, which ships with macOS.

set -euo pipefail

PORT="${1:-8000}"
HOST="localhost"

cd "$(dirname "$0")"

echo "Serving $(pwd)"
echo "→ http://${HOST}:${PORT}/index.html"
echo "  http://${HOST}:${PORT}/kotak.html"
echo "  http://${HOST}:${PORT}/bulat.html"
echo
echo "Press Ctrl-C to stop."
echo

exec python3 -m http.server "${PORT}" --bind "${HOST}"
