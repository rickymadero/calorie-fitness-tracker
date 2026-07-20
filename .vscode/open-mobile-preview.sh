#!/usr/bin/env bash
# Opens Cursor Simple Browser at Evolve mobile preview (port 3000).
set -euo pipefail
URL="${1:-http://127.0.0.1:3000/dev/preview}"
ENC=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1], safe=''))" "$URL")
open "cursor://vscode.simple-browser/show?url=${ENC}" 2>/dev/null || open "vscode://vscode.simple-browser/show?url=${ENC}" 2>/dev/null || true
