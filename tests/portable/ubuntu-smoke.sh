#!/usr/bin/env bash
# Integration test on a disposable Ubuntu user/session, with prebuilt local assets.
set -euo pipefail
assets="${1:?Pass a directory containing the Ubuntu tarball and SHA256SUMS}"
installer="${2:?Pass the install/ubuntu.sh path}"
port="${ACADEMY_TEST_PORT:-18092}"
conflict_port="$((port + 1))"
work="$(mktemp -d /tmp/academy-install-test.XXXXXXXX)"
stub_pid=''
cleanup() { [[ -z "$stub_pid" ]] || kill "$stub_pid" 2>/dev/null || true; rm -rf -- "$work"; }
trap cleanup EXIT
ACADEMY_RELEASE_DIR="$assets" ACADEMY_PORT="$port" bash "$installer"
ACADEMY_RELEASE_DIR="$assets" ACADEMY_PORT="$port" bash "$installer"
mkdir "$work/corrupt"
cp "$assets/SHA256SUMS" "$work/corrupt/"
head -c 32 "$assets/agentic-academy-v0.1.0-ubuntu.tar.gz" > "$work/corrupt/agentic-academy-v0.1.0-ubuntu.tar.gz"
if ACADEMY_RELEASE_DIR="$work/corrupt" ACADEMY_PORT="$port" bash "$installer"; then
    echo 'ERROR: corrupted archive was accepted' >&2; exit 1
fi
python3 -m http.server "$conflict_port" --bind 127.0.0.1 --directory "$work" > "$work/stub.log" 2>&1 &
stub_pid=$!
sleep 0.5
kill -0 "$stub_pid"
if ACADEMY_RELEASE_DIR="$assets" ACADEMY_PORT="$conflict_port" bash "$installer"; then
    echo 'ERROR: occupied port was accepted' >&2; exit 1
fi
python3 - "$port" <<'PY'
import json, sys, time, urllib.request
for attempt in range(10):
    try:
        with urllib.request.urlopen(f'http://127.0.0.1:{sys.argv[1]}/api/health', timeout=1) as response:
            health = json.load(response)
        assert health['mode'] == 'portable' and health['version'] == '0.1.0'
        break
    except Exception:
        if attempt == 9:
            raise
        time.sleep(0.3)
PY
echo 'PASS: install, repeat install, checksum rejection, occupied-port detection and rollback.'
