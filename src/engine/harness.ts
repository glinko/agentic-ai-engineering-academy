import type {TestCase} from '../types';
// Data is JSON-encoded twice: neither code nor tests can escape the Python literal.
export function buildHarness(code:string, tests:TestCase[]):string {
 const payload = JSON.stringify(JSON.stringify({code,tests}));
 return `
import ast as _ast, json as _json, io as _io, traceback as _traceback, contextlib as _contextlib, time as _time
_payload = _json.loads(${payload})
class _LimitedIO(_io.StringIO):
    def write(self, text):
        remaining = max(0, 20000 - self.tell())
        if remaining:
            super().write(text[:remaining])
        return len(text)
_out, _err = _LimitedIO(), _LimitedIO()
_started = _time.perf_counter()
_result = {'stdout': '', 'stderr': '', 'tests': [], 'duration_ms': 0}
try:
    _tree = _ast.parse(_payload['code'], filename='solution.py')
    if not _payload['tests']:
        with _contextlib.redirect_stdout(_out), _contextlib.redirect_stderr(_err):
            exec(compile(_tree, 'solution.py', 'exec'), {'__name__': '__main__'})
    for _case in _payload['tests']:
        _namespace = {'__name__': '__main__'}
        _case_tree = _ast.parse(_payload['code'], filename='solution.py')
        # Replace only the initial assignment of declared inputs. The rest of
        # the student's algorithm is unchanged; every test has a fresh scope.
        _overrides = {}
        for _node in _ast.parse(_case.get('setup', '')).body:
            if isinstance(_node, _ast.Assign):
                for _target in _node.targets:
                    if isinstance(_target, _ast.Name):
                        _overrides[_target.id] = _node.value
        for _node in _case_tree.body:
            if isinstance(_node, _ast.Assign):
                for _target in _node.targets:
                    if isinstance(_target, _ast.Name) and _target.id in _overrides:
                        _node.value = _overrides.pop(_target.id)
        _ast.fix_missing_locations(_case_tree)
        if _overrides:
            raise ValueError('Keep the initial input variables: ' + ', '.join(_overrides))
        try:
            with _contextlib.redirect_stdout(_out), _contextlib.redirect_stderr(_err):
                exec(compile(_case_tree, 'solution.py', 'exec'), _namespace)
                _actual = eval(_case['expression'], _namespace)
            _passed = _actual == _case['expected']
            _result['tests'].append({'name': _case['name'], 'passed': bool(_passed), 'actual': repr(_actual)[:2000], 'expected': repr(_case['expected'])[:2000]})
        except Exception:
            _result['tests'].append({'name': _case['name'], 'passed': False, 'error': _traceback.format_exc(limit=4)[-4000:]})
except Exception as _exception:
    _result['error'] = _traceback.format_exc(limit=4)[-4000:]
    _result['kind'] = 'syntax' if isinstance(_exception, SyntaxError) else 'runtime'
_result['stdout'] = _out.getvalue()
_result['stderr'] = _err.getvalue()
_result['duration_ms'] = round((_time.perf_counter() - _started) * 1000)
_json.dumps(_result, ensure_ascii=False)
`;
}
