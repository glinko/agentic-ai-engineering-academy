#!/usr/bin/env bash
set -euo pipefail
academy_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
exec python3 "$academy_dir/server.py" "$@"
