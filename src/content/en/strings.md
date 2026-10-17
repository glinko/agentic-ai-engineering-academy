# Strings and operations

A **string (str)** holds text: an instruction, a URL, or a message. Write strings in single or double quotes. Strings are immutable: their methods return new values.

```python
raw = "  RESEARCH  "
command = raw.strip().lower()
print(command)  # research
```

`strip()` removes whitespace from the edges, `lower()` converts letters to lowercase, and `upper()` converts them to uppercase. You can chain methods. `strip()` preserves spaces inside the text.

## Formatting

An **f-string** starts with `f` before its opening quote. Expressions in braces are replaced with their values.

```python
agent = "Research"
count = 3
message = f"Agent {agent}: {count} tasks"
print(message)
```

`len(text)` returns the number of characters. `text[0]` selects the first character; `text[:5]` selects the first five. Indexing an empty string raises `IndexError`. Within a string, `\n` represents a newline.

## Order matters

To measure a cleaned prompt, call `strip()` before `len()`. Remember the empty-input case: a string containing only spaces becomes an empty string after stripping.
