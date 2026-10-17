AGENTIC AI ENGINEERING ACADEMY

Windows 10/11 x64:
  Extract the entire ZIP into a folder, then double-click start.cmd.
  A small local server starts and opens your default browser.
  No Python, Node.js, npm, Docker, or administrator rights are required.
  Keep the console open while studying; Ctrl+C stops the server.
  If port 8090 is occupied: start.cmd --port 8091

Ubuntu 22.04/24.04/26.04 (Python 3.10+):
  Extract the archive and run: bash start.sh
  Open http://127.0.0.1:8090/
  For managed installation and updates, see docs/distribution.md in the repository.

The UI, Python runtime and lessons are included; no API keys or AI account are needed.
English is the default. Use the header selector for Russian.
Your progress is saved in your browser for the exact host and port you use.
Changing the port or hostname creates a separate progress store.
Deleting the program folder does not clear browser progress.
Optional web fonts fall back to system fonts without internet.

The server binds to 127.0.0.1 by default. For a trusted LAN, pass --host 0.0.0.0.
This personal learning host is not intended as a public internet production server.
Learner Python executes in a browser Web Worker, never in this server process.
The AI tutor and cross-device progress synchronization are not implemented.

Project: https://github.com/glinko/agentic-ai-engineering-academy
Project license: MIT (see LICENSE)
Bundled third-party components: see THIRD_PARTY_NOTICES.md and licenses/.
Windows Python runtime: runtime/LICENSE.txt.
