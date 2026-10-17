# Verification

[Русский](ru/verification.md)

The original MVP was verified on October 17, 2026 using Windows, Node.js 24.19, pnpm 11.25, Google Chrome, and an Ubuntu backend with Python 3.14.4.

The baseline checks passed: TypeScript and production build; eight unit tests; 15 reference solutions and 49 cases in real Pyodide; two end-to-end scenarios covering syntax/runtime errors, incorrect/correct answers, timeout recovery, reset, hints, history, reload, and mobile navigation. A deployed browser check passed all three tests of the first exercise. Backend smoke checks covered health, metadata, frontend, WASM MIME, headers, and reserved tutor status codes.

Localization verification: 11 unit tests passed; all 15 references passed in both catalogs (98 test executions); both original browser scenarios passed in English, and a third scenario verified Russian switching, persistence after reload, translated theory and exercises, unchanged drafts, retained hints, and shared results. TypeScript and the production build passed. Previous LAN deployment checks do not imply that the server has automatically received later repository changes.

Browser evaluation is not tamper-proof certification. External access, TLS, secure server assessment, LLM integration, and cross-device synchronization remain outside the MVP. E2E screenshots are generated in the ignored `test-results/` folder.
