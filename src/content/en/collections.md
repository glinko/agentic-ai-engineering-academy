# Lists and dictionaries

A **list** is an ordered, mutable collection. A **dictionary (dict)** stores values by key. Together, they represent messages, tasks, and search results.

```python
tools = ["search", "fetch"]
tools.append("memory")
message = {"id": 1, "priority": "high"}
print(message["id"])
```

`append()` adds an item at the end and returns `None`. Do not assign its return value back to the list variable.

## Copies and references

`updated = tools` makes two names refer to the same list. Changes through either name affect that list. `tools.copy()` makes a separate shallow copy. Nested mutable objects may require a deeper copy.

## Reading dictionaries safely

`message["priority"]` raises `KeyError` when the key is missing. `message.get("priority")` returns `None` instead. You can provide a default: `message.get("priority", "normal")`.

```python
urgent_ids = []
for message in messages:
    if message.get("priority") == "high":
        urgent_ids.append(message["id"])
```

The loop preserves the original order. In the checkpoint, you will combine variables, strings, conditions, loops, and collections into a report for your future Research Assistant.
