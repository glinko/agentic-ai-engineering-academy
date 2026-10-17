# Conditions and logic

An agent must decide whether to call a tool, retry a request, or ask for approval. A **condition** is an expression that evaluates to `True` or `False`.

```python
if balance >= cost:
    action = "run"
else:
    action = "stop"
```

End the condition with a colon. Use consistent indentation, usually four spaces, for its block. `elif` introduces another branch. Only the first matching branch runs.

## Comparisons

`==` checks equality; `!=` checks inequality. `<`, `>`, `<=`, and `>=` compare values. `=` assigns a value: do not confuse it with `==`. You can check a range with `200 <= status < 300`.

## Logical operators

`and` requires both conditions to hold; `or` requires at least one. `not` reverses a Boolean value.

```python
allowed = is_authenticated and (not is_dangerous or approved)
```

Parentheses make the grouping explicit. Test boundary values: an exactly sufficient balance, status 299, and status 300. Boundaries are a common source of mistakes.
