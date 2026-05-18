#!/usr/bin/env bash
# Local dev server for buanawisesa-site.
# Usage:  ./serve.sh          (defaults to port 8000)
#         ./serve.sh 8080     (custom port)
#
# Requires python3, which ships with macOS.
#
# Serves extensionless URLs (/kotak -> kotak.html) the same way GitHub
# Pages does, so local preview matches production.

set -euo pipefail

PORT="${1:-8000}"
HOST="localhost"

cd "$(dirname "$0")"

echo "Serving $(pwd)"
echo "→ http://${HOST}:${PORT}/"
echo "  http://${HOST}:${PORT}/kotak"
echo "  http://${HOST}:${PORT}/bulat"
echo
echo "Press Ctrl-C to stop."
echo

exec python3 - "$PORT" "$HOST" <<'PY'
import os, sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

port, host = int(sys.argv[1]), sys.argv[2]


class Handler(SimpleHTTPRequestHandler):
    def translate_path(self, path):
        fs_path = super().translate_path(path)
        # Mirror GitHub Pages: serve <name>.html for an extensionless URL.
        if (not os.path.exists(fs_path)
                and not os.path.splitext(fs_path)[1]
                and os.path.isfile(fs_path + ".html")):
            return fs_path + ".html"
        return fs_path


ThreadingHTTPServer((host, port), Handler).serve_forever()
PY
