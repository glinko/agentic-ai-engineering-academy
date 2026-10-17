#!/usr/bin/env bash
# Install the prebuilt portable release for the current user. No sudo or npm.
set -euo pipefail
version="${ACADEMY_VERSION:-v0.1.0}"
port="${ACADEMY_PORT:-8090}"
host="${ACADEMY_HOST:-127.0.0.1}"
root="$HOME/.local/share/agentic-academy"
service="agentic-academy-portable.service"
[[ "$version" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo 'Invalid ACADEMY_VERSION' >&2; exit 1; }
[[ "$port" =~ ^[0-9]+$ ]] && (( port > 0 && port < 65536 )) || { echo 'Invalid ACADEMY_PORT' >&2; exit 1; }
[[ "$(uname -s)" == Linux ]] || { echo 'This installer supports Ubuntu/Linux. Use the Windows ZIP on Windows.' >&2; exit 1; }
command -v python3 >/dev/null || { echo 'Python 3.10+ is required. Run: sudo apt-get install python3' >&2; exit 1; }
python3 - "$host" <<'PY'
import ipaddress, sys
if sys.version_info < (3, 10):
    raise SystemExit('Python 3.10+ is required.')
if ipaddress.ip_address(sys.argv[1]).version != 4:
    raise SystemExit('ACADEMY_HOST must be an IPv4 address.')
PY
for command in curl sha256sum; do
    command -v "$command" >/dev/null || { echo "Missing $command. Install it with apt." >&2; exit 1; }
done
archive="agentic-academy-${version}-ubuntu.tar.gz"
work="$(mktemp -d "${TMPDIR:-/tmp}/agentic-academy.XXXXXXXX")"
trap 'rm -rf -- "$work"' EXIT
base="https://github.com/glinko/agentic-ai-engineering-academy/releases/download/$version"
for file in "$archive" SHA256SUMS; do
    if [[ -n "${ACADEMY_RELEASE_DIR:-}" ]]; then
        cp -- "$ACADEMY_RELEASE_DIR/$file" "$work/$file"
    else
        curl --proto '=https' --tlsv1.2 -fLsS --retry 3 "$base/$file" -o "$work/$file"
    fi
done
awk -v name="$archive" 'NF == 2 && $2 == name { print }' "$work/SHA256SUMS" > "$work/checksum"
[[ "$(wc -l < "$work/checksum")" -eq 1 ]] || { echo 'Missing or ambiguous release checksum' >&2; exit 1; }
(cd "$work" && sha256sum --check checksum)
digest="$(cut -d ' ' -f 1 "$work/checksum")"
python3 - "$work/$archive" "$work/extracted" <<'PY'
import pathlib, sys, tarfile
destination = pathlib.Path(sys.argv[2])
destination.mkdir()
with tarfile.open(sys.argv[1], 'r:gz') as archive:
    for member in archive.getmembers():
        path = pathlib.PurePosixPath(member.name)
        if path.is_absolute() or '..' in path.parts or not path.parts or path.parts[0] != 'agentic-academy' or not (member.isfile() or member.isdir()):
            raise SystemExit('Unsafe release archive member: ' + member.name)
    archive.extractall(destination)
PY
release="$root/releases/$version"
mkdir -p "$root/releases" "$HOME/.local/bin"
if [[ -e "$release" ]]; then
    [[ -f "$release/.archive-sha256" && "$(cat "$release/.archive-sha256")" == "$digest" ]] || { echo 'A different package already occupies this release directory; refusing to overwrite it.' >&2; exit 1; }
else
    mv -- "$work/extracted/agentic-academy" "$release"
    printf '%s\n' "$digest" > "$release/.archive-sha256"
fi
[[ ! -e "$root/current" || -L "$root/current" ]] || { echo 'current must be a symbolic link.' >&2; exit 1; }
previous="$(readlink "$root/current" 2>/dev/null || true)"
ln -sfn "$release" "$root/current"
python_bin="$(command -v python3)"
printf '#!/usr/bin/env bash\nexec %q %q "$@"\n' "$python_bin" "$root/current/server.py" > "$HOME/.local/bin/agentic-academy"
chmod +x "$HOME/.local/bin/agentic-academy"
if [[ "${ACADEMY_AUTOSTART:-1}" == 0 ]]; then
    printf 'Installed %s. Start with: %s/.local/bin/agentic-academy\n' "$version" "$HOME"
    exit 0
fi
if ! command -v systemctl >/dev/null || ! systemctl --user show-environment >/dev/null 2>&1; then
    printf 'Installed %s. A user systemd session is unavailable. Start manually:\n%s/.local/bin/agentic-academy --host %s --port %s\n' "$version" "$HOME" "$host" "$port"
    exit 0
fi
unit="$HOME/.config/systemd/user/$service"
mkdir -p "$(dirname "$unit")"
[[ ! -f "$unit" ]] || cp -- "$unit" "$work/previous.service"
cat > "$unit" <<UNIT
[Unit]
Description=Agentic Academy portable local server
After=network.target

[Service]
Type=simple
WorkingDirectory=$root/current
ExecStart="$python_bin" "$root/current/server.py" --host $host --port $port
Restart=on-failure
RestartSec=3
NoNewPrivileges=true
PrivateTmp=true
UMask=0077

[Install]
WantedBy=default.target
UNIT
restore_service() {
    systemctl --user stop "$service" || true
    if [[ -n "$previous" && -f "$work/previous.service" ]]; then
        ln -sfn "$previous" "$root/current"
        cp -- "$work/previous.service" "$unit"
        systemctl --user daemon-reload
        systemctl --user restart "$service" || true
    fi
}
if ! systemctl --user daemon-reload || ! systemctl --user enable "$service" || ! systemctl --user restart "$service"; then
    restore_service
    echo 'Could not start the user service. Inspect its journal or launch the installed server manually.' >&2
    exit 1
fi
check_host="$host"
[[ "$host" != 0.0.0.0 ]] || check_host=127.0.0.1
for attempt in {1..10}; do
    service_pid="$(systemctl --user show "$service" --property MainPID --value)"
    if python3 - "$check_host" "$port" "${version#v}" "$service_pid" <<'PY'
import json, sys, urllib.request
try:
    with urllib.request.urlopen(f'http://{sys.argv[1]}:{sys.argv[2]}/api/health', timeout=1) as response:
        health = json.load(response)
    assert health['mode'] == 'portable' and health['version'] == sys.argv[3]
    assert int(sys.argv[4]) > 0 and health['pid'] == int(sys.argv[4])
except Exception:
    raise SystemExit(1)
PY
    then
        printf '\nInstalled and started %s: http://%s:%s/\n' "$version" "$check_host" "$port"
        printf 'Service: systemctl --user status %s\n' "$service"
        printf 'To keep running after logout/reboot, an administrator can enable linger: sudo loginctl enable-linger %s\n' "$(id -un)"
        exit 0
    fi
    sleep 0.5
done
echo 'The new service did not become healthy. Restoring the previous service configuration.' >&2
restore_service
echo 'Check port availability or run: journalctl --user -u agentic-academy-portable -n 30' >&2
exit 1
