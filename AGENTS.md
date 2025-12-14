<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# AGENTS.md

## Code Search & Documentation Tools

### mgrep Usage (ALWAYS USE INSTEAD OF grep)

mgrep is the preferred semantic search tool for this codebase. Never use grep or ripgrep.

**Basic Usage:**
```bash
# Find hook implementations
mgrep "How are CRUD hooks implemented?" lib/hooks/

# Find form validation patterns  
mgrep "What form validation patterns are used?" components/forms/

# Find API error handling patterns
mgrep "How are API errors handled?" lib/api/

# Find component usage examples
mgrep "Show me Button component usage" components/ui/

# Limit results to top 5
mgrep -m 5 "How are query keys created?" lib/hooks/core/

# Search across entire codebase
mgrep "How is authentication implemented?"
```

**When to Use mgrep:**
- ✅ Finding implementation patterns and examples
- ✅ Understanding architecture decisions
- ✅ Locating similar code across features
- ✅ Searching for best practices in the codebase
- ✅ Finding usage examples of components/hooks/services

**When NOT to Use mgrep:**
- ❌ Finding exact file paths (use Glob tool)
- ❌ Reading specific file contents (use Read tool)
- ❌ Simple file existence checks (use List tool)
- ❌ Searching for exact string matches in a single file

### context7 MCP Usage (Plan Mode Only)

When in plan mode, use context7 to get fresh documentation for libraries before making implementation decisions.

**Two-Step Process:**

1. **Resolve Library ID First:**
   ```bash
   # Research React Native
   context7_resolve-library-id "react-native"
   
   # Research TanStack Query
   context7_resolve-library-id "@tanstack/react-query"
   
   # Research Zustand
   context7_resolve-library-id "zustand"
   
   # Research Better Auth
   context7_resolve-library-id "better-auth"
   ```

2. **Get Documentation:**
   ```bash
   # Get React Native hooks documentation
   context7_get-library-docs "/react-native/docs" mode="code" topic="hooks"
   
   # Get TanStack Query patterns
   context7_get-library-docs "/tanstack/react-query" mode="info" topic="optimistic-updates"
   
   # Get Zustand best practices
   context7_get-library-docs "/zustand" mode="info" topic="state-management"
   
   # Get Better Auth integration examples
   context7_get-library-docs "/better-auth" mode="code" topic="expo"
   ```

**When to Use context7:**
- ✅ Researching library APIs before implementation
- ✅ Understanding best practices for integrations
- ✅ Finding code examples for complex features
- ✅ Validating architectural decisions
- ✅ Only in plan mode, not during execution

**When NOT to Use context7:**
- ❌ During code execution/implementations
- ❌ For searching local codebase (use mgrep instead)
- ❌ When you already have working patterns in the codebase

## Architecture Patterns

### Query Keys Pattern
- **Location**: `lib/hooks/core/createQueryKeys.ts`
- **Usage**: Use `createQueryKeys` factory for all resources
- **Structure**: 
  - `resource.all` → `['resource']`
  - `resource.lists()` → `['resource', 'list']`
  - `resource.list(filters)` → `['resource', 'list', { filters }]`
  - `resource.details()` → `['resource', 'detail']`
  - `resource.detail(id)` → `['resource', 'detail', id]`
  - `resource.search(query)` → `['resource', 'search', query]`

**Example:**
```typescript
// Create query keys
const petKeys = createQueryKeys('pets');

// Use in hooks
export function usePets(filters: PetFilters = {}) {
  return useQuery({
    queryKey: petKeys.list(filters),
    queryFn: () => petService.getPets(filters),
  });
}
```

### Form Development Pattern
- **Form Hooks**: Create in `hooks/use{Feature}Form.ts` (NOT in lib/hooks/)
- **Validation**: Use Zod schemas from `lib/schemas/`
- **Components**: Use smart form components from `components/forms/`
- **Pattern**: React Hook Form + Zod resolver + smart components

**Example Structure:**
```
hooks/
  usePetForm.ts          # Form logic
lib/schemas/
  petSchema.ts           # Zod validation
components/forms/
  PetForm.tsx            # Form component
  SmartInput.tsx         # Reusable inputs
```

### Service Layer Pattern
- **Location**: `lib/services/{feature}Service.ts`
- **Response Format**: Always return `ApiResponse<T>`
- **Error Handling**: Use `ApiError` class with status codes
- **Logging**: Use ✅/❌ emoji prefixes for success/errors
- **Data Cleanup**: Normalize data before API calls

**Example:**
```typescript
async createPet(data: CreatePetInput): Promise<ApiResponse<Pet>> {
  try {
    const cleanedData = {
      ...data,
      birthDate: normalizeToISOString(data.birthDate),
    };
    const response = await api.post<Pet>(ENV.ENDPOINTS.PETS, cleanedData);
    console.log('✅ Pet created successfully:', response.data?.id);
    return { success: true, data: response.data!, message: 'Pet created' };
  } catch (error) {
    console.error('❌ Create pet error:', error);
    if (error instanceof ApiError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: 'Failed to create pet' };
  }
}
```

### State Management Separation
- **Server State**: TanStack Query hooks in `lib/hooks/`
  - Use `useQuery` for data fetching
  - Use `useMutation` for mutations
  - Implement optimistic updates
  - Use `createQueryKeys` for cache management

- **Client UI State**: Zustand stores in `stores/`
  - Theme state: `themeStore.ts`
  - Language state: `languageStore.ts`
  - UI state: `petStore.ts`, `subscriptionStore.ts`
  - Auth state: `authStore.ts`

**Rule**: Never mix server and client state in the same store

### API Client Pattern
- **Location**: `lib/api/client.ts`
- **Features**: 
  - Axios instance with interceptors
  - Auth token handling via `authClient`
  - Request/response logging in dev mode
  - Standardized error handling

### Cache Configuration
- **Location**: `lib/config/queryConfig.ts`
- **Cache Times**: Use predefined constants
  - `CACHE_TIMES.IMMUTABLE` (24 hours)
  - `CACHE_TIMES.LONG` (15 minutes)
  - `CACHE_TIMES.MEDIUM` (5 minutes)
  - `CACHE_TIMES.SHORT` (2 minutes)
  - `CACHE_TIMES.VERY_SHORT` (30 seconds)

### Environment Configuration
- **Location**: `lib/config/env.ts`
- **Usage**: Centralized environment variables
- **Pattern**: Use `__DEV__` flag for dev/prod switching
- **Endpoints**: All API endpoints defined in `ENV.ENDPOINTS`

## Build/Lint/Commands

```bash
# Development
npm start                    # Start Expo dev server
npm run android              # Run on Android device/emulator
npm run ios                  # Run on iOS simulator/device
npm run web                  # Run in web browser

# Code Quality
npm run lint                 # Run ESLint (Expo config)

# Project Management
npm run reset-project        # Reset project to clean state
```

**Note**: No test framework is currently configured. TypeScript strict mode is enabled.

## Code Style Guidelines

### TypeScript
- Strict mode enabled (`tsconfig.json`)
- Centralized types in `lib/types.ts`
- Zod schemas for runtime validation in `lib/schemas/`
- Interface names: PascalCase (e.g., `PetFormProps`)
- Type aliases: PascalCase (e.g., `ButtonMode`)

### Imports
- Path alias: `@/*` maps to root directory
- Import order: React → Libraries → Absolute imports (`@/`) → Relative imports
- Group imports by type with blank lines between groups

### Components
- Functional components with TypeScript interfaces
- Props interfaces named `{ComponentName}Props`
- Use `React.FC<Props>` type annotation
- Consistent prop naming: `onSubmit`, `onCancel`, `loading`, `testID`

### Naming Conventions
- **Components**: PascalCase (e.g., `PetForm`, `Button`)
- **Functions**: camelCase (e.g., `usePetForm`, `handleSubmit`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `CACHE_TIMES`, `ENV`)
- **Hooks**: camelCase starting with 'use' (e.g., `usePets`, `useTheme`)
- **Services**: PascalCase with 'Service' suffix (e.g., `PetService`)

### Error Handling
- Use custom `ApiError` class from `lib/api/client.ts`
- Wrap API calls in try/catch blocks
- Return user-friendly messages in Turkish/English
- Use i18n for all user-facing messages
- Log errors with context (e.g., '❌ Create pet error:')

### State Management
- **Zustand**: Client-side state (theme, language, UI state)
- **TanStack Query**: Server state with custom hooks in `lib/hooks/`
- Use query keys factory pattern (`createQueryKeys`)
- Implement optimistic updates for mutations

### Forms
- React Hook Form with Zod resolvers
- Form hooks in `hooks/use{Feature}Form.ts`
- Reusable form components in `components/forms/`
- Smart components handle validation and formatting

### Styling
- React Native StyleSheet
- Theme system: `lib/theme/colors.ts`, `useTheme()` hook
- Consistent spacing: 4, 8, 12, 16, 24, 32
- Use theme colors: `theme.colors.primary`, `theme.colors.background`
- Border radius: `theme.roundness`

### Internationalization
- i18next with namespaces
- Translation keys: `feature.component.description`
- Support for Turkish and English
- Use `useTranslation()` hook, never hardcode strings

### File Organization
- Feature-based structure
- Co-locate related files
- Reusable UI components in `components/ui/`
- Feature components in `components/{feature}/`
- Screens in `app/{feature}/` or `app/(tabs)/`

### API Integration
- Service layer pattern in `lib/services/`
- Axios client with interceptors in `lib/api/client.ts`
- Consistent response format: `{ success, data, message, error }`
- Mobile-optimized TanStack Query config in `lib/config/queryConfig.ts`


<!-- CLAVIX:START -->
# Clavix - Prompt Improvement Assistant

Clavix is installed in this project. Use the following slash commands:

- `/clavix:improve [prompt]` - Optimize prompts with smart depth auto-selection
- `/clavix:prd` - Generate a PRD through guided questions
- `/clavix:start` - Start conversational mode for iterative refinement
- `/clavix:summarize` - Extract optimized prompt from conversation

**When to use:**
- **Standard depth**: Quick cleanup for simple, clear prompts
- **Comprehensive depth**: Thorough analysis for complex requirements
- **PRD mode**: Strategic planning with architecture and business impact

Clavix automatically selects the appropriate depth based on your prompt quality.

For more information, run `clavix --help` in your terminal.
<!-- CLAVIX:END -->
