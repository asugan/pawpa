# PawPa Agent Guidelines

## Build, Lint & Test Commands
- **Start Dev Server**: `npm start` (runs Expo dev server)
- **Run on Platform**: `npm run android` or `npm run ios`
- **Lint Code**: `npm run lint` (uses `expo lint` with `eslint-config-expo`)
- **Type Check**: `npx tsc --noEmit` (Verify TypeScript types)
- **Testing**: No automated test scripts are currently configured.

## Code Style & Conventions
- **Imports**: Use `@/` path alias for project root (e.g., `import { useAuth } from "@/lib/auth"`).
- **Formatting**: Follow Prettier/ESLint standards. 
- **TypeScript**: Strict mode enabled. Use explicit types (e.g., `ApiResponse<T>` for API data).
- **Naming**:
  - Components: PascalCase (e.g., `PetCard.tsx`).
  - Functions/Hooks: camelCase (e.g., `usePetForm.ts`, `apiClient`).
  - Folders: Generally lowercase/kebab-case (except grouped routes `(tabs)`).
- **Architecture**:
  - **Navigation**: Expo Router (file-based routing in `app/`).
  - **State**: Zustand (client state) & TanStack Query (server state).
  - **Data Layer**: Axios client (`lib/api/client.ts`) -> Service methods -> Custom Hooks.
- **Styling**: Use `StyleSheet.create` combined with `useTheme()` from `@/lib/theme`.
- **Error Handling**: Throw `ApiError` for network issues. Handle UI errors via boundaries or `isError` states.
