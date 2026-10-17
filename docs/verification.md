# Verification

[Русский](ru/verification.md)

The original MVP was verified on October 17, 2026 using Windows, Node.js 24.19, pnpm 11.25, Google Chrome, and an Ubuntu backend with Python 3.14.4.

The baseline checks passed: TypeScript and production build; eight unit tests; 15 reference solutions and 49 cases in real Pyodide; two end-to-end scenarios covering syntax/runtime errors, incorrect/correct answers, timeout recovery, reset, hints, history, reload, and mobile navigation. A deployed browser check passed all three tests of the first exercise. Backend smoke checks covered health, metadata, frontend, WASM MIME, headers, and reserved tutor status codes.

Localization verification: 11 unit tests passed; all 15 references passed in both catalogs (98 test executions); both original browser scenarios passed in English, and a third scenario verified Russian switching, persistence after reload, translated theory and exercises, unchanged drafts, retained hints, and shared results. TypeScript and the production build passed. Previous LAN deployment checks do not imply that the server has automatically received later repository changes.

Browser evaluation is not tamper-proof certification. External access, TLS, secure server assessment, LLM integration, and cross-device synchronization remain outside the MVP. E2E screenshots are generated in the ignored `test-results/` folder.

## Portable v0.1.0 release

The Windows x64 ZIP was extracted into a directory containing spaces and started with `start.cmd` using its bundled Python 3.14.8. All four browser scenarios and HTTP smoke checks passed against the packaged host. Six standard-library Python tests cover portable-host routes, MIME types, metadata validation, disabled directory listing, and unavailable tutor endpoints. The existing 11 frontend unit tests passed.

On Ubuntu 26.04 LTS, the installer was tested with local release assets: initial install, repeat install, rejection of a deliberately truncated archive, detection of another process occupying the port, and restoration of the previous healthy user-service configuration. The installer uses a separate service from the original FastAPI deployment.
