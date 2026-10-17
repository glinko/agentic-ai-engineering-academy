# Variables and data types

Every agent works with data: tool names, request limits, and permission flags. A **variable** is a name associated with a value. Create one with `=`.

```python
agent_name = "Research"  # str — a string
max_steps = 5             # int — a whole number
temperature = 0.7         # float — a decimal number
is_active = True          # bool — a Boolean value
```

Python infers the type automatically. `type(max_steps)` shows its type, and `print(max_steps)` displays its value. Names are case-sensitive: `Agent` and `agent` are different variables. Use descriptive names in `snake_case`.

## Arithmetic and type conversion

`+`, `-`, `*`, and `/` perform arithmetic. `/` returns a floating-point result, `//` rounds division down, and `%` returns the remainder. Parentheses control the order of operations.

APIs often return numbers as strings. `int("42")` converts a string to an integer, `float("0.5")` converts it to a floating-point number, and `str(42)` converts a number to text. Adding strings joins them: `"12" + "8"` produces `"128"`, not `20`.

## Before you practice

Each exercise already defines its input variables. Use those variables in your calculations: the checker substitutes different inputs. A fixed answer that only fits the initial example will not pass every test.
