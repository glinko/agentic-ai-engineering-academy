#!/usr/bin/env python3
"""Dependency-free local host for packaged Academy releases; no code execution API."""
import argparse
import functools
import json
import os
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import threading
from urllib.parse import parse_qs, urlsplit
import webbrowser

ROOT = Path(__file__).resolve().parent


class AcademyHandler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, '.wasm': 'application/wasm', '.js': 'text/javascript', '.mjs': 'text/javascript'}

    def __init__(self, *args, root=ROOT, **kwargs):
        self.root = Path(root).resolve()
        super().__init__(*args, directory=str(self.root / 'dist'), **kwargs)

    def end_headers(self):
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('X-Frame-Options', 'DENY')
        self.send_header('Referrer-Policy', 'same-origin')
        self.send_header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
        if urlsplit(self.path).path in ('/', '/index.html', '/python-worker.js'):
            self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def json_response(self, value, status=200):
        data = json.dumps(value, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        if self.command != 'HEAD':
            self.wfile.write(data)

    def api(self):
        url = urlsplit(self.path)
        if url.path == '/api/health':
            version = json.loads((self.root / 'version.json').read_text(encoding='utf-8'))['version']
            self.json_response({'status': 'ok', 'version': version, 'mode': 'portable', 'pid': os.getpid(), 'python_execution': 'browser-worker', 'tutor_enabled': False, 'progress_storage': 'localStorage'})
        elif url.path == '/api/curriculum':
            language = parse_qs(url.query).get('language', ['en'])[0]
            if language not in ('en', 'ru'):
                self.json_response({'detail': 'Language must be en or ru'}, 422)
            else:
                self.json_response(json.loads((self.root / 'metadata' / f'curriculum.{language}.json').read_text(encoding='utf-8')))
        else:
            self.json_response({'detail': 'Not found'}, 404)

    def do_GET(self):
        if urlsplit(self.path).path.startswith('/api/'):
            self.api()
        else:
            super().do_GET()

    def do_HEAD(self):
        if urlsplit(self.path).path.startswith('/api/'):
            self.api()
        else:
            super().do_HEAD()

    def do_POST(self):
        path = urlsplit(self.path).path
        operations = {'explain_error', 'give_hint', 'explain_concept', 'generate_similar_exercise', 'review_solution'}
        if path.startswith('/api/tutor/') and path.rsplit('/', 1)[-1] in operations:
            self.json_response({'detail': 'The AI tutor is not configured yet. Use the authored lesson hints.'}, 501)
        else:
            self.json_response({'detail': 'Not found'}, 404)

    def send_head(self):
        # Serve only dist; never expose runtime, metadata files or sibling source.
        path = Path(self.translate_path(self.path)).resolve()
        if not path.is_relative_to((self.root / 'dist').resolve()):
            self.send_error(404)
            return None
        return super().send_head()

    def list_directory(self, path):
        self.send_error(403, 'Directory listing disabled')
        return None


def main():
    parser = argparse.ArgumentParser(description='Agentic Academy local server')
    parser.add_argument('--host', default=os.environ.get('ACADEMY_HOST', '127.0.0.1'))
    parser.add_argument('--port', type=int, default=os.environ.get('ACADEMY_PORT', '8090'))
    parser.add_argument('--open', action='store_true', help='Open the default browser after starting')
    parser.add_argument('--no-open', action='store_false', dest='open', help='Do not open a browser (headless or automated launch)')
    args = parser.parse_args()
    if not (ROOT / 'dist' / 'index.html').is_file():
        parser.exit(1, 'Missing dist/index.html. Extract the entire release archive before starting.\n')
    try:
        server = ThreadingHTTPServer((args.host, args.port), functools.partial(AcademyHandler, root=ROOT))
    except OSError as error:
        parser.exit(1, f'Cannot start server: {error}. Try --port 8091 if the port is in use.\n')
    host = '127.0.0.1' if args.host == '0.0.0.0' else args.host
    address = f'http://{host}:{server.server_port}/'
    print(f'Agentic Academy: {address}\nPress Ctrl+C to stop.', flush=True)
    if args.open:
        threading.Timer(0.5, lambda: webbrowser.open(address)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\nStopping Academy.', flush=True)
    finally:
        server.server_close()


if __name__ == '__main__':
    main()
