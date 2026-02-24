---
name: code-style-update
model: 'sonnet'
description: "Adds or updates code style rules in the project's .claude/rules/code-style.md file. Use when the user invokes /code-style-update with free-form rule text, or pastes existing rules to record. Automatically generates a label and formats each rule atomically. Updates existing rules if the label already exists."
---

# Code Style Update

Append one or more rule entries to `.claude/rules/code-style.md`.

## Entry format

Each rule is written as:

```
#### <Label>

<Rule body in 1–3 sentences.>
```

Blank line between entries.

## Workflow

1. Receive the argument (free-form text describing one or more rules).
2. Split into individual atomic rules — each rule is a single concept. If the input already uses heading markers (`####`) treat each heading block as one rule.
3. For each rule:
    - **Generate a label**: concise title-case phrase (3–6 words) that names the convention. If the input already has a label/heading, use it verbatim.
    - **Distill the body**: condense to 1–3 clear sentences. Preserve any inline code examples.
    - Format as shown above.
4. Read `.claude/rules/code-style.md` and extract all existing `####` entries (label + body).
5. For each incoming rule, determine the action by checking in order:
    - **Exact label match** → update that entry's body in place.
    - **Semantic match** → if the incoming rule clearly covers the same concept as an existing entry (even with a different label), update that entry's body in place. Keep the existing label.
    - **No match** → append as a new entry after the last line.
6. Write the file back.
7. Confirm with a summary, e.g. "Added: **Foo**. Updated: **Bar**, **Baz**."

## Constraints

- Each rule body: 1–3 sentences maximum.
- Only touch the body of an updated entry — do not reformat its heading or surrounding entries.
