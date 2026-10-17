# Writing lessons and exercises

[Русский](ru/authoring.md)

1. Add English theory under `src/content/en/<lesson_id>.md` and Russian theory under `src/content/<lesson_id>.md`.
2. Register matching lesson IDs, three executable examples, and common pitfalls in both lesson catalogs.
3. Add three exercises to both JSON catalogs. Keep exercise IDs, input contracts, test expressions, and expected values identical.
4. Store references separately in `src/content/solutions.json`.
5. Run unit, content, production-build, and relevant browser checks.

## Exercise format

```json
{
  "id": "unique-id",
  "lesson_id": "variables",
  "title": "Token total",
  "difficulty": "Intermediate",
  "learning_objectives": ["Convert strings to integers"],
  "theory": "variables",
  "description": "Calculate total from input_tokens and output_tokens.",
  "starter_code": "input_tokens = '12'\noutput_tokens = '8'\ntotal = 0\nprint(total)",
  "public_tests": [
    {"name": "Different inputs", "setup": "input_tokens = '7'\noutput_tokens = '3'", "expression": "total", "expected": 10}
  ],
  "hints": ["First hint", "Second hint", "Third hint"],
  "explanation": "Convert both strings with int() before adding them.",
  "estimated_minutes": 15
}
```

`theory` links to a lesson ID. `reference_solution` is intentionally stored separately as an id → Python-code mapping. Difficulty values are language-independent: Beginner, Intermediate, Checkpoint; the UI translates their labels. Normal exercises have three progressive hints. Checkpoints have an empty hints array and provide no help. The explanation is revealed after passing.

## Input contract

Declare each input using a separate top-level assignment before calculations. Test setup contains only input assignments. Do not combine input and output assignments or use chained assignments. The checker substitutes the first assignment for each declared input while preserving the student's algorithm. Learners must retain these input declarations.

`expression` is evaluated after execution in the same namespace. `expected` must be JSON-compatible. Use `value is True` when Boolean identity matters, and `[value, type(value).__name__]` when an integer type matters. For floating-point results, put a tolerance check in the expression.

Provide at least three reproducible cases, including empty inputs and relevant boundaries. Avoid network requests, randomness, and current time. Validate the reference and representative wrong algorithms. A changed exercise contract needs a new ID or a progress migration; otherwise an old completion remains valid.

## Interface messages

Use `translate(language, 'English source message', values)` or the App helper. Add the Russian equivalent to `src/locales/ru.json`. Use named placeholders such as `{number}` for variable text. Do not translate by mutating rendered DOM. Keep saved learner code untouched when changing the language.
