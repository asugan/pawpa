# PawPa - Kod Stili ve Konvansiyonlar

## TypeScript Kuralları

### Strict Mode
- **Strict type checking**: Aktif (`"strict": true`)
- **Type annotations**: Her fonksiyon için zorunlu
- **Interface vs Type**: Interface tercih edilir (genişletilebilirlik için)
- **Any kullanımı**: Yasak (strict mode)

### Path Aliases
```typescript
// tsconfig.json
"paths": {
  "@/*": ["./*"]
}

// Kullanım
import { usePets } from '@/lib/hooks/usePets';
import { PetCard } from '@/components/PetCard';
```

## Dosya İsimlendirme

### Genel Kurallar
- **Components**: PascalCase - `PetCard.tsx`, `HealthOverview.tsx`
- **Hooks**: camelCase + 'use' prefix - `usePets.ts`, `useDeviceLanguage.ts`
- **Services**: camelCase + 'Service' suffix - `petService.ts`, `healthRecordService.ts`
- **Stores**: camelCase + 'Store' suffix - `themeStore.ts`, `languageStore.ts`
- **Utils**: camelCase - `dateUtils.ts`, `colorUtils.ts`
- **Types**: PascalCase veya camelCase - `types.ts`, `PetTypes.ts`

### Routing (Expo Router)
- **Layout files**: `_layout.tsx`
- **Index files**: `index.tsx`
- **Dynamic routes**: `[id].tsx`, `[slug].tsx`
- **Groups**: `(tabs)/`, `(auth)/`

## Component Patterns

### Component Yapısı
```typescript
// 1. Imports (grouped)
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Card, Text } from 'react-native-paper';

// 2. Types/Interfaces
interface PetCardProps {
  pet: Pet;
  onEdit?: (pet: Pet) => void;
  onDelete?: (id: number) => void;
}

// 3. Component
export const PetCard: React.FC<PetCardProps> = ({ pet, onEdit, onDelete }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Hooks
  // Event handlers
  // Render

  return (
    // JSX
  );
};

// 4. Styles (StyleSheet.create)
const styles = StyleSheet.create({
  container: { /* ... */ },
  // ...
});

// 5. Default export (optional)
export default PetCard;
```

### Hooks Kullanımı
- **Custom hooks**: `use` prefix ile başlamalı
- **TanStack Query**: Server state için tercih edilir
- **Zustand**: Client state için kullanılır
- **Hook sırası**: React hooks → custom hooks → event handlers

## Naming Conventions

### Variables & Functions
```typescript
// camelCase
const petData = usePets();
const handleSubmit = () => {};
const isLoading = false;

// Boolean: is/has/should prefix
const isActive = true;
const hasPhoto = false;
const shouldRefresh = true;
```

### Constants
```typescript
// UPPER_SNAKE_CASE (global constants)
const API_BASE_URL = 'https://api.example.com';
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// PascalCase (enums)
enum PetType {
  Dog = 'dog',
  Cat = 'cat',
  Bird = 'bird',
}
```

### Types & Interfaces
```typescript
// PascalCase
interface Pet {
  id: number;
  name: string;
  type: PetType;
}

type PetFilters = {
  type?: PetType;
  search?: string;
};
```

## Styling Patterns

### StyleSheet Usage
```typescript
// React Native StyleSheet.create()
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  // Theme-aware dynamic styles
  card: {
    backgroundColor: theme.colors.surface,
  },
});
```

### Theme System
```typescript
// lib/theme.ts kullanımı
import { useTheme } from 'react-native-paper';

const theme = useTheme();
// theme.colors.primary
// theme.colors.surface
// theme.colors.onSurface
```

## Import Organization

### Import Sırası
1. React & React Native
2. Third-party libraries
3. Internal modules (@/ alias)
4. Relative imports
5. Types (son)

```typescript
// 1. React
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';

// 2. Third-party
import { Card, Button } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

// 3. Internal (@/)
import { usePets } from '@/lib/hooks/usePets';
import { PetCard } from '@/components/PetCard';

// 4. Relative
import { helper } from './utils';

// 5. Types
import type { Pet } from '@/lib/types';
```

## Code Quality Rules

### ESLint
- **Config**: `eslint-config-expo` base
- **Auto-fix**: Mümkün olduğunda
- **Ignored**: `dist/*`

### Best Practices
- **No any**: TypeScript strict mode
- **No unused variables**: ESLint kuralı
- **Explicit return types**: Fonksiyonlarda zorunlu
- **Props destructuring**: Component parametrelerinde tercih edilir
- **Early returns**: Guard clauses kullan

### Performance
- **Memoization**: React.memo, useMemo, useCallback uygun yerlerde
- **Lazy loading**: Büyük componentler için React.lazy
- **Optimize re-renders**: Gereksiz render'ları önle

## Internationalization (i18n)

### Translation Keys
```typescript
// Snake_case with namespaces
t('pets.list.title')
t('health.vaccination.upcoming')
t('common.save')
t('errors.network.offline')
```

### Usage Pattern
```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
return <Text>{t('pets.add.title')}</Text>;
```

## State Management Patterns

### TanStack Query (Server State)
```typescript
// Custom hook pattern
export const usePets = (filters?: PetFilters) => {
  return useQuery({
    queryKey: petKeys.list(filters),
    queryFn: () => petService.getPets(filters),
  });
};
```

### Zustand (Client State)
```typescript
// Store pattern
interface ThemeStore {
  mode: 'light' | 'dark';
  setMode: (mode: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      mode: 'light',
      setMode: (mode) => set({ mode }),
    }),
    { name: 'theme-storage' }
  )
);
```

## Error Handling

### API Errors
```typescript
// ApiErrorBoundary kullanımı
<ApiErrorBoundary>
  <Component />
</ApiErrorBoundary>
```

### Try-Catch Pattern
```typescript
try {
  const result = await apiCall();
  return result;
} catch (error) {
  console.error('Error:', error);
  // User-friendly error handling
}
```

## Comments & Documentation

### JSDoc Comments
```typescript
/**
 * Pet kartı bileşeni
 * @param pet - Evcil hayvan verisi
 * @param onEdit - Düzenleme callback'i
 * @param onDelete - Silme callback'i
 */
export const PetCard: React.FC<PetCardProps> = ({ ... }) => { };
```

### Inline Comments
```typescript
// Sadece karmaşık logic için
// Açıklayıcı değişken isimleri kullan, gereksiz comment'ten kaçın
```
