# Code Style

#### Dialog State With useDialog Hook

Always use `useDialog` from `@src/hooks/use-dialog.ts` to manage dialog state. Name the destructured tuple values using the pattern `show<DialogType>Dialog`, `open<DialogType>Dialog`, `close<DialogType>Dialog`, `mount<DialogType>Dialog` — for example: `const [showCreateOrderDialog, openCreateOrderDialog, closeCreateOrderDialog, mountCreateOrderDialog] = useDialog();`.
