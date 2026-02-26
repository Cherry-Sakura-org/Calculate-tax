# Architecture

This is a React 19 SPA bundled with **Rspack** (not Vite or webpack). The bundler config is in `rspack.config.ts` and uses the built-in `swc-loader` for TypeScript/TSX transpilation with React Fast Refresh in development.

Entry point: `src/main.tsx` → `src/App.tsx`

## Key dependencies

- **UI**: MUI v7 (`@mui/material`, `@mui/icons-material`) with Emotion
- **Data fetching**: TanStack React Query v5 (with devtools)
- **Routing**: React Router v7
- **Forms**: React Hook Form + Zod for validation
- **Tables**: TanStack Table v8
- **Dates**: Luxon
- **Notifications**: react-toastify
- **Number formatting**: react-number-format

## src/ structure

```
src/
  api/        # API client functions and hooks
  components/ # Shared/reusable UI components
  shared/     # Shared constants, configs, utilities
  types/      # TypeScript type definitions
  utils/      # Utility functions
```
