# Code Style

#### Prefer Default Zod Error Messages

Do not override Zod's built-in error messages unless the default is genuinely unclear to end users. Omit `{ error: '...' }` on standard constraints like `.min()`, `.max()`, and `.positive()`.

#### Dialog State With useDialog Hook

Always use `useDialog` from `@src/hooks/use-dialog.ts` to manage dialog state. Name the destructured tuple values using the pattern `show<DialogType>Dialog`, `open<DialogType>Dialog`, `close<DialogType>Dialog`, `mount<DialogType>Dialog` — for example: `const [showCreateOrderDialog, openCreateOrderDialog, closeCreateOrderDialog, mountCreateOrderDialog] = useDialog();`.
