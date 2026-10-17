"""Read-only smoke checks against a running Academy host (standard library)."""
import json
import sys
from urllib.request import Request, urlopen
from urllib.error import HTTPError

base = sys.argv[1].rstrip("/")
with urlopen(base + "/api/health", timeout=10) as response:
    assert json.load(response)["python_execution"] == "browser-worker"
with urlopen(base + "/api/curriculum", timeout=10) as response:
    metadata = json.load(response)
    assert len(metadata["exercises"]) == 15
    assert metadata["weeks"] == 26
with urlopen(base + "/", timeout=10) as response:
    assert b"<div id=\"root\">" in response.read()
    assert response.headers["X-Content-Type-Options"] == "nosniff"
with urlopen(Request(base + "/pyodide/pyodide.asm.wasm", method="HEAD"), timeout=10) as response:
    assert "application/wasm" in response.headers["Content-Type"]
for path, status in [("/api/tutor/explain_error", 501), ("/api/tutor/unknown", 404)]:
    try:
        urlopen(Request(base + path, data=b"{}", headers={"Content-Type": "application/json"}), timeout=10)
        raise AssertionError("Unexpected successful tutor response")
    except HTTPError as error:
        assert error.code == status
print("PASS: health, curriculum, frontend, WASM MIME, security headers, disabled tutor and unknown operation.")
