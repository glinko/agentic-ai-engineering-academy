# Windows and Ubuntu releases

## Windows 10/11, x64

1. Download `agentic-academy-v0.1.0-windows-x64.zip` from [Releases](https://github.com/glinko/agentic-ai-engineering-academy/releases/latest).
2. Extract the **entire** archive into a folder. Do not run the launcher inside the ZIP viewer.
3. Double-click `agentic-academy/start.cmd`.

The launcher starts a small local server and opens http://127.0.0.1:8090/. Python is bundled; Node.js, npm, Docker, administrator permissions, and a separate Python installation are not needed. Keep the console open while studying. Press Ctrl+C to stop.

If port 8090 is occupied, run `start.cmd --port 8091` from a terminal. Windows ARM64 and 32-bit packages are not included in this release. The runtime comes from the official Python 3.14.8 embeddable distribution; its upstream checksum is pinned in the build script. Unsigned launcher files may be subject to normal Windows download controls.

## Ubuntu one-line installation

```sh
curl -fsSL https://raw.githubusercontent.com/glinko/agentic-ai-engineering-academy/v0.1.0/install/ubuntu.sh | bash
```

Requires Ubuntu 22.04/24.04/26.04 with Python 3.10+, curl, and sha256sum. No pip packages, Node.js, Docker, or root access are needed. On a minimal image, install missing prerequisites first: `sudo apt-get install python3 curl ca-certificates`.

The installer downloads a prebuilt archive over HTTPS, verifies it against SHA256SUMS, and installs it under `~/.local/share/agentic-academy/releases/v0.1.0`. `current` points to the active release. A launcher is written to `~/.local/bin/agentic-academy`.

If a user systemd session is available, `agentic-academy-portable.service` is enabled and started. If not, installation still succeeds and prints a manual start command. By default the host is **127.0.0.1**, so only this computer can access it. Open http://127.0.0.1:8090/ in your browser. For a remote Ubuntu server, either use an SSH tunnel or explicitly opt in to trusted-LAN access.

To review the script before running it:

```sh
curl -fsSLo install-academy.sh https://raw.githubusercontent.com/glinko/agentic-ai-engineering-academy/v0.1.0/install/ubuntu.sh
less install-academy.sh
bash install-academy.sh
```

### Options

```sh
# Different port; environment assignments apply to bash, not curl.
curl -fsSL https://raw.githubusercontent.com/glinko/agentic-ai-engineering-academy/v0.1.0/install/ubuntu.sh | ACADEMY_PORT=8091 bash

# Explicitly allow access from a trusted LAN.
curl -fsSL https://raw.githubusercontent.com/glinko/agentic-ai-engineering-academy/v0.1.0/install/ubuntu.sh | ACADEMY_HOST=0.0.0.0 bash

# Install files and launcher without starting a service.
curl -fsSL https://raw.githubusercontent.com/glinko/agentic-ai-engineering-academy/v0.1.0/install/ubuntu.sh | ACADEMY_AUTOSTART=0 bash
```

`ACADEMY_VERSION` selects a published stable version. `ACADEMY_RELEASE_DIR` selects a local directory containing the Ubuntu archive and SHA256SUMS for offline installation. Both archives are architecture-independent on Linux because they use the system Python; the bundled browser runtime is WebAssembly. Only the Windows runtime is tied to x64.

### Service controls

```sh
systemctl --user status agentic-academy-portable
systemctl --user restart agentic-academy-portable
systemctl --user stop agentic-academy-portable
journalctl --user -u agentic-academy-portable -n 30
```

For service operation after logout and at boot, an administrator may need to enable user lingering: `sudo loginctl enable-linger "$USER"`. The installer does not change this system setting. Its service name and installation directory are separate from the original FastAPI deployment.

### Updates and rollback

Run the installer for a newer published version using the same host and port options. Existing version directories are immutable: the installer refuses a different archive under an existing version. A failed health check restores the previous service configuration when one exists. Old releases are retained.

For manual rollback, point `~/.local/share/agentic-academy/current` at the previous release directory and restart the user service. Browser progress does not live in these directories. To uninstall, stop and disable the user service, then remove its unit, launcher, and install folder. This does not erase browser progress.

## Portable/manual Linux use

Download and extract `agentic-academy-v0.1.0-ubuntu.tar.gz`, then run:

```sh
cd agentic-academy
bash start.sh
```

`bash start.sh --host 0.0.0.0 --port 8091` explicitly opts in to LAN access. The host is for personal learning or a trusted LAN, not a public internet production service. The optional FastAPI backend remains available separately for future integrations.

## Progress and offline behavior

Lessons, the editor, and browser Python are bundled and work without a runtime CDN or AI API. Optional Google Fonts fall back to system fonts offline. Progress is saved in browser localStorage for the exact origin. Keep the same host, port, and browser to retain it across updates. Changing the origin creates a separate store. Removing program files does not clear browser storage.

## Integrity and licenses

Release assets include SHA256SUMS. Check the desired archive against it (`sha256sum --check` on Ubuntu or `Get-FileHash -Algorithm SHA256 <file>` on Windows). Hashes catch corruption but are not an independent authenticity signature; download both files from the official repository.

Project code is MIT licensed. Releases retain npm license notices, the Pyodide MPL-2.0 license/source link, and the Python license. Windows runtime files retain the upstream Python license.

## Building and publishing a release

On a Windows x64 packaging machine with Node.js, pnpm, Git, and the system tar command:

```sh
pnpm install --frozen-lockfile
pnpm build
node scripts/build-release.mjs
```

The script downloads the pinned official Windows Python ZIP, checks its SHA-256, packages the self-hosted frontend and a dependency-free server for both platforms, collects license notices, and writes archives plus SHA256SUMS to the ignored `.release/` directory. Do not commit bundled runtime binaries.

After tests pass and the source commit is pushed, `scripts/publish-release.mjs` creates the version tag, uploads assets to a draft, verifies their digests, and only then publishes the release. It will not overwrite an existing published release. Repository visibility changes require the explicit `CONFIRM_PUBLIC_RELEASE=yes` setting.

macOS packaging is planned; no macOS compatibility claim is made for v0.1.0.
