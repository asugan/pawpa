# Repository Guidelines

## Project Structure & Module Organization

- `app/`: Expo Router routes (e.g. `app/(tabs)/`, `app/(auth)/`).
- `components/`: reusable UI and feature components (e.g. `components/forms/`, `components/ui/`).
- `lib/`: shared “platform” code (API client in `lib/api/`, services in `lib/services/`, schemas in `lib/schemas/`, theme in `lib/theme/`, query hooks in `lib/hooks/`).
- `hooks/`: feature-level hooks (form logic typically lives here).
- `stores/`: client/UI state via Zustand (keep server state in TanStack Query hooks).
- `assets/`, `locales/`: images and i18n resources.
- `android/`: native Android project (generated/managed via Expo).
- `__tests__/`: test helpers/fixtures (no runner wired by default).
- `docs/`: deployment notes and status docs.

## Build, Test, and Development Commands

- `npm start`: start the Expo dev server.
- `npm run android` / `npm run ios`: run the native app via Expo Dev Client.
- `npm run web`: run in the browser.
- `npm run lint`: run ESLint (Expo flat config).
- `npm run reset-project`: reset to a clean state (see `scripts/reset-project.js`).
- `npx tsc --noEmit`: typecheck (TypeScript `strict` is enabled).

## Coding Style & Naming Conventions

- Language: TypeScript + React Native (Expo). Prefer functional components and hooks.
- Naming: `PetForm.tsx`/`PetFormProps` (PascalCase), `usePetForm` (hooks), `petService` (camelCase instances).
- Imports: React → libraries → `@/` absolute imports → relative imports. Path alias: `@/*` (see `tsconfig.json`).
- State: server data in TanStack Query hooks (`lib/hooks/`); UI state in Zustand stores (`stores/`).

## Testing Guidelines

No automated test command is configured in `package.json`. Until a runner is added, validate changes with `npm run lint` and `npx tsc --noEmit`. If you introduce tests, place them under `__tests__/` and include the scripts/config in the same PR.

## Commit & Pull Request Guidelines

History follows a loose Conventional Commits style (e.g. `feat(finance): ...`, `fix(home): ...`, `refactor: ...`). Keep commits small and scoped.

PRs should include: a short description, linked issue/spec (if any), screenshots for UI changes, and i18n updates for user-facing strings (update `locales/` rather than hardcoding).
