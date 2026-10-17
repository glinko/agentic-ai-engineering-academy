# Architecture

[Русский](ru/architecture.md)

```text
React UI → PythonRunner → dedicated Web Worker → Pyodide / Python
    │             │                                  │
    │             └── structured ExecutionResult ← JSON
    └── versioned localStorage

FastAPI → dist/ + /api/health + /api/curriculum
Future TutorProvider → server adapter → local or cloud LLM
```

## Modules

- `src/i18n.ts` and `src/locales/ru.json`: English source messages, Russian translations, interpolation, and language preference.
- `src/content/index.ts`: selects English or Russian content by language.
- `src/content/en/`: English theory, exercise catalog, lesson metadata, and examples.
- `src/content/ru.ts`, root content Markdown, and `exercises.json`: Russian catalog.
- `src/content/solutions.json`: separate reference implementations, not imported into the UI.
- `src/engine/harness.ts`: generates a Python test harness from JSON data.
- `src/engine/runner.ts`: manages Worker initialization, execution, deadlines, and cancellation.
- `public/python-worker.js`: loads self-hosted Pyodide and executes the harness.
- `src/engine/progress.ts`: validates and persists versioned progress.
- `src/tutor/provider.ts`: future server-backed tutor contract.
- `backend/main.py`: optional static hosting and metadata API.

## Execution

Every run starts a fresh Worker. Initialization is limited to 60 seconds and execution to five seconds for the entire test suite. The main thread terminates the Worker even when Python is stuck in an infinite loop. Editing code or changing exercises cancels old runs; stale results are not recorded against a new exercise.

Run executes the program once. Check parses it with Python ast for each test, substitutes the first top-level assignment of each declared input, executes it in a fresh namespace, evaluates the test expression, and compares the result with the expected Python value. This is a contract for the current input-variable exercises, not a universal Python-project runner.

stdout/stderr are bounded to 20,000 characters each; tracebacks and result representations are truncated. A separate hard memory quota is not implemented. Functions, files, async services, and projects should add new harness implementations behind the same ExecutionResult contract.

## Localization and progress

English is the default. Russian is an explicit persistent selection. The document language, page title, accessible editor label, interface, theory, exercises, hints, examples, and date formatting follow the selection. Exercise IDs and test semantics remain identical across catalogs. Switching languages preserves saved student code rather than translating or overwriting it. Python exception names and tracebacks remain technical output.

## Trust boundary

Tests determine correctness independently of an LLM, but all browser state is controlled by the learner. Tests and results can be inspected or modified. This is local educational checking, not secure certification. Pyodide has JavaScript interop; a Worker does not protect same-origin secrets, privileged APIs, or the network. Never embed API keys in the frontend.

Reference solutions are separate from starter code and absent from the primary frontend imports, but they are visible in the repository. Hidden tests require a protected server runner with process/container isolation, CPU/RAM quotas, restricted networking and filesystem access, and disposal after each run. Never exec learner code inside the main FastAPI process.

## AI extension

TutorProvider declares explain_error, give_hint, explain_concept, generate_similar_exercise, and review_solution. No provider is currently connected; the API returns 501. Generated tasks require a real server-side validation pipeline that executes reference implementations and tests before publication. The current ValidatedExercise shape and canPublish helper are not that pipeline.

## Primary references

- [Python Tutorial](https://docs.python.org/3/tutorial/)
- [Pyodide Web Workers](https://pyodide.org/en/0.28.3/usage/webworker.html)
- [pytest](https://docs.pytest.org/en/stable/)
- [FastAPI static files](https://fastapi.tiangolo.com/tutorial/static-files/)
- [Uvicorn deployment](https://www.uvicorn.org/deployment/)

The MVP evaluates Python expressions directly. pytest is planned for advanced exercises and is not loaded in the browser.
