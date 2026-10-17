#!/usr/bin/env bash
set -euo pipefail
academy_root="$HOME/agentic-academy"
release="$academy_root/releases/$1"
case "$release" in "$academy_root"/releases/*) ;; *) exit 1;; esac
test -f "$release/dist/index.html"
test -f "$release/backend/main.py"
"$academy_root/.venv/bin/python" -m pip install -r "$release/backend/requirements.txt"
"$academy_root/.venv/bin/python" -m pip freeze > "$release/backend/requirements.lock.txt"
if test -L "$academy_root/current"; then
    readlink "$academy_root/current" > "$academy_root/previous-release"
fi
ln -sfn "$release" "$academy_root/current"
mkdir -p "$HOME/.config/systemd/user"
cp "$release/deploy/agentic-academy.service" "$HOME/.config/systemd/user/agentic-academy.service"
systemctl --user daemon-reload
systemctl --user enable --now agentic-academy.service
systemctl --user restart agentic-academy.service
for attempt in 1 2 3 4 5; do
    if curl --fail --silent http://192.168.88.122:8090/api/health; then
        printf '\nAcademy is running.\n'
        exit 0
    fi
    sleep 1
done
systemctl --user status agentic-academy.service --no-pager
exit 1
