"""MVP metadata and static hosting. Never executes learner code."""
import json
from typing import Literal
from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

ROOT = Path(__file__).resolve().parent.parent
app = FastAPI(title="Agentic Academy API", version="0.1.0", docs_url="/api/docs", openapi_url="/api/openapi.json", redoc_url=None)

@app.middleware("http")
async def security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["Referrer-Policy"] = "same-origin"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if request.url.path in ("/", "/python-worker.js"):
        response.headers["Cache-Control"] = "no-cache"
    return response

@app.get("/api/health")
def health():
    return {"status": "ok", "version": "0.1.0", "python_execution": "browser-worker", "tutor_enabled": False, "progress_storage": "localStorage"}

@app.get("/api/curriculum")
def curriculum(language: Literal['en', 'ru'] = 'en'):
    return json.loads((ROOT / "backend" / f"curriculum.{language}.json").read_text(encoding="utf-8"))

@app.post("/api/tutor/{operation}")
def tutor(operation: str):
    operations = {"explain_error", "give_hint", "explain_concept", "generate_similar_exercise", "review_solution"}
    if operation not in operations:
        return JSONResponse({"detail": "Unknown tutor operation"}, status_code=404)
    return JSONResponse({"detail": "The AI tutor is not configured yet. Use the authored lesson hints."}, status_code=501)

app.mount("/", StaticFiles(directory=ROOT / "dist", html=True), name="academy")
