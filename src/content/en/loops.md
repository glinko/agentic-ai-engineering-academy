# Loops

A **loop** repeats an action: processes messages, adds costs, or checks tool results. `for` iterates over a sequence.

```python
total = 0
for tokens in [12, 8, 20]:
    total += tokens
print(total)  # 40
```

`total` is an **accumulator**. Initialize it **before** the loop. Resetting it inside the loop loses the previous result. An empty list executes the loop body zero times.

## Conditions inside loops

```python
slow_count = 0
for latency in [120, 1500, 1000]:
    if latency > 1000:
        slow_count += 1
```

Indentation expresses nesting. `range(3)` produces 0, 1, and 2. `while condition` repeats while its condition is true: update the values that the condition depends on.

## Stopping early

`break` exits the loop; `continue` skips to the next iteration. For budget checks, examine the next expense **before** adding it. If it does not fit, use `break`. Skipping it and searching for a cheaper item would implement a different algorithm.

The exercise runner stops infinite loops at its time limit. After stopping, it creates a fresh environment so your next run can work independently.
