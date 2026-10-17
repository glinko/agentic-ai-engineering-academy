"""Portable host boundaries and API behavior; no external dependencies."""
import functools
import importlib.util
import json
from pathlib import Path
import tempfile
import threading
import unittest
from urllib.error import HTTPError
from urllib.request import Request, urlopen

spec = importlib.util.spec_from_file_location('academy_portable', Path(__file__).parents[2] / 'portable' / 'server.py')
portable = importlib.util.module_from_spec(spec)
spec.loader.exec_module(portable)


class PortableServerTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temp = tempfile.TemporaryDirectory()
        cls.root = Path(cls.temp.name)
        (cls.root / 'dist' / 'pyodide').mkdir(parents=True)
        (cls.root / 'dist' / 'index.html').write_text('<h1>Academy</h1>')
        (cls.root / 'dist' / 'pyodide' / 'test.wasm').write_bytes(b'\x00asm')
        (cls.root / 'metadata').mkdir()
        (cls.root / 'version.json').write_text('{"version":"0.1.0"}')
        for language in ['en', 'ru']:
            (cls.root / 'metadata' / f'curriculum.{language}.json').write_text(json.dumps({'language': language}))
        (cls.root / 'private.txt').write_text('not a web asset')
        cls.server = portable.ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(portable.AcademyHandler, root=cls.root))
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.base = f'http://127.0.0.1:{cls.server.server_port}'

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join()
        cls.temp.cleanup()

    def fetch(self, path, method='GET'):
        return urlopen(Request(self.base + path, method=method), timeout=3)

    def test_frontend_and_headers(self):
        with self.fetch('/') as response:
            self.assertEqual(response.read(), b'<h1>Academy</h1>')
            self.assertEqual(response.headers['Cache-Control'], 'no-cache')
            self.assertEqual(response.headers['X-Content-Type-Options'], 'nosniff')

    def test_health_and_head(self):
        with self.fetch('/api/health') as response:
            health = json.load(response)
            self.assertEqual(health['mode'], 'portable')
            self.assertEqual(health['version'], '0.1.0')
        with self.fetch('/api/health', 'HEAD') as response:
            self.assertEqual(response.read(), b'')

    def test_localized_metadata(self):
        with self.fetch('/api/curriculum?language=ru') as response:
            self.assertEqual(json.load(response)['language'], 'ru')
        with self.assertRaises(HTTPError) as error:
            self.fetch('/api/curriculum?language=../../private')
        self.assertEqual(error.exception.code, 422)

    def test_wasm_mime(self):
        with self.fetch('/pyodide/test.wasm') as response:
            self.assertEqual(response.headers['Content-Type'], 'application/wasm')

    def test_sources_and_directory_listing_are_not_exposed(self):
        for path, expected in [('/private.txt', 404), ('/metadata/curriculum.en.json', 404), ('/pyodide/', 403), ('/api/execute', 404)]:
            with self.subTest(path=path):
                with self.assertRaises(HTTPError) as error:
                    self.fetch(path)
                self.assertEqual(error.exception.code, expected)

    def test_tutor_is_explicitly_unavailable(self):
        with self.assertRaises(HTTPError) as error:
            self.fetch('/api/tutor/explain_error', 'POST')
        self.assertEqual(error.exception.code, 501)


if __name__ == '__main__':
    unittest.main()
