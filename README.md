# Agentic AI Engineering Academy

[English](README.md) · [Русский](README.ru.md)

A working, bilingual learning platform for aspiring Agentic AI engineers. Learn through **short theory → runnable example → independent solution → automated tests → feedback → project**.

The MVP includes **5 Python lessons, 15 exercises, 15 runnable examples, and 49 test cases**. English is the default; switch to Russian using the language selector in the header. Your language preference persists across visits. Drafts, attempts, hints, and completion remain shared across languages.

## Quick start

Requires Node.js 22.12+ (tested on 24.19) and pnpm 11.

```sh
pnpm install
pnpm dev
```

Open http://localhost:5173. If pnpm is unavailable, use `npm install` and `npm run dev`.

```sh
pnpm build
pnpm preview
```

The production build is written to `dist/`; preview uses port 4173. Development and build scripts copy Pyodide from the installed package into `public/pyodide/`. Python, WebAssembly, and the standard library are self-hosted, with no runtime CDN dependency. Dependency installation requires internet access. Optional Google Fonts fall back to system fonts when unavailable.

## Learning experience

- Overview, learning path, lesson, exercise workspace, and project milestones.
- Variables and types; strings; conditions; loops; lists and dictionaries.
- CodeMirror 6 with Python highlighting, Run, Check, progressive hints, and Reset.
- Structured public-test results, stdout/stderr, tracebacks, and attempt history.
- One checkpoint per lesson without hints; complete all three exercises to unlock the next lesson.
- Responsive layout, light/dark themes, and persistent English/Russian selection.

**Run** executes your code once. **Check** tests it against different inputs, including boundary cases. **Reset** restores starter code while preserving attempt history and completed status. You can revisit completed lessons.

Inside the editor, **Tab** indents by four spaces and **Shift+Tab** removes one indentation level, including for selected lines. To move focus out of the editor with the keyboard, press **Escape**, then **Tab**.

## Progress

Progress is stored in localStorage on the current browser and origin. It records drafts, viewed theory, hint usage, up to 100 attempts per exercise, test results, approximate active practice time, and a next-day review date. Switching languages does not change exercise IDs or discard drafts. New drafts use the selected language; existing drafts retain their exact text.

The timer counts ten-second intervals while the practice page is visible. Review scheduling at 1/3/7/14 days is planned, not implemented. There are no accounts or cross-device synchronization. Clearing browser data removes progress; different hosts and ports have separate storage. Storage failures display a warning.

## Architecture

| Component | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite |
| Editor | CodeMirror 6 |
| Python | Pyodide 0.28.3 / Python 3.13, dedicated Web Worker |
| Content | Markdown + versioned JSON, English/Russian catalogs |
| Verification | Python expressions evaluated against public test cases |
| Progress | Versioned localStorage |
| Optional host/API | FastAPI + Uvicorn |

Each execution starts a fresh Worker. Initialization has a 60-second deadline; execution has a five-second deadline. Infinite loops are stopped by terminating the Worker, and users can stop execution manually. Output is bounded. Backend hosting is optional; the learning experience works without an AI provider.

Browser checks are educational, **not tamper-proof assessment**. Learners can inspect tests and modify browser state. A Worker is not an OS security boundary, Pyodide supports JavaScript interop, and no separate hard memory quota is enforced. Do not place secrets or privileged APIs on the learning origin. Hidden tests and advanced server exercises require a separate isolated runner.

## Tests

```sh
pnpm test
pnpm test:content
pnpm test:e2e
```

Unit tests cover Worker lifecycle, deadlines, cancellation, result completeness, storage, and content contracts. Content validation executes reference solutions in real Pyodide. Browser tests cover correct/incorrect code, syntax/runtime errors, infinite loops, reruns, reset, hints, reload, mobile layout, and language switching.

E2E uses an installed Google Chrome. Alternatively, run `pnpm exec playwright install chromium` and remove `channel: 'chrome'` from `playwright.config.ts`. Screenshots are written to the ignored `test-results/` directory.

## Optional backend

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r backend/requirements.txt
pnpm build
.venv/bin/python -m uvicorn backend.main:app --host 127.0.0.1 --port 8090
```

- `GET /api/health`: runtime capabilities.
- `GET /api/curriculum?language=en` (or `ru`): localized exercise metadata.
- `/api/docs`: API documentation.
- `POST /api/tutor/<operation>`: reserved adapter endpoints, currently HTTP 501.

The backend serves `dist/` and metadata. It **does not execute learner Python** or store progress. TutorProvider defines future server-backed operations; no LLM keys belong in browser code.

`deploy/agentic-academy.service` and `deploy/install.sh` support a user-level systemd deployment. Set the bind address to your server before installation. Releases live under `~/agentic-academy/releases/`, `current` points to the active release, and `.venv` is separate. The installer records the previous release, freezes installed dependencies, and restarts the service. A shared venv means code rollback does not automatically roll back dependencies.

```sh
systemctl --user status agentic-academy
journalctl --user -u agentic-academy -n 50
python3 scripts/smoke-backend.py http://your-server:8090
```

The supplied service is intended for a trusted LAN. Internet deployment requires HTTPS, access controls, and a protected runner before introducing server-side execution.

## Publishing to GitHub

The helper creates a **private** repository named `agentic-ai-engineering-academy` in the authenticated account, scans intended files for credentials, commits the source, pushes `main`, and verifies the remote commit. It refuses to overwrite an unrelated nonempty repository. Set `GITHUB_REPOSITORY_NAME` to choose a different name.

In PowerShell 7:

```powershell
$env:GITHUB_TOKEN = Read-Host 'GitHub token' -MaskInput
try { node scripts/publish-github.mjs } finally { Remove-Item Env:GITHUB_TOKEN }
```

The token needs permission to create repositories and push source. It is used only in process memory and child-process environment; it is never written into the remote URL, repository files, or Git credential storage. The script requires network access to GitHub.

## Documentation

- [Architecture and trust boundaries](docs/architecture.md)
- [Writing lessons and exercises](docs/authoring.md)
- [Sprint scope and next steps](docs/sprint.md)
- [Verification notes](docs/verification.md)

The UI shows the **26-week, 12-stage roadmap**. Only the first five Python lessons are implemented. AI tutoring, generated exercises, server-side hidden tests, advanced projects, authentication, and synchronization are future work.
