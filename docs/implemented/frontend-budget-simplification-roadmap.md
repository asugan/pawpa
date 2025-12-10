# Budget Simplification Roadmap - Frontend

## 🎯 Hedef

Mevcut karmaşık budget UI'ını basitleştirmek:

- Her pet için tek aylık overall budget setup
- Category selection kaldır
- Period selection kaldır (sadece monthly)
- Multi-currency desteği koru
- Basit alert threshold slider

## 📊 Mevcut Durum Analizi

### Current UI Components

```
components/
├── BudgetCard.tsx (294 lines) - Complex card with category support
├── BudgetFormModal.tsx (81 lines) - Modal with category/period selection
├── forms/BudgetForm.tsx (~200 lines) - Complex form with many fields
└── home/FinancialOverview.tsx (290 lines) - Complex budget alerts display
```

### Mevcut Karmaşıklıklar

1. **BudgetCard**: Category icon, period chip, complex alert logic
2. **BudgetForm**: Category picker, period selector, multiple validation rules
3. **FinancialOverview**: Multiple budget alerts, complex progress bars
4. **Finance Tab**: Separate expenses/budgets tabs with pet selection

## 🔄 Yeni Basitleştirilmiş Sistem

### Yeni UI Component'leri

```
components/
├── PetBudgetCard.tsx (yeni) - Simple card with just amount & progress
├── PetBudgetForm.tsx (yeni) - Simple form: amount + currency + alert threshold
└── home/SimpleBudgetOverview.tsx (yeni) - Clean single budget display
```

## 🚀 Implementasyon Adımları

### Phase 1: Type Definitions Güncellemeleri

#### Yeni Budget Types

```typescript
// lib/types.ts - Yeni basitleştirilmiş tipler
export interface PetBudget {
  id: string;
  userId: string;
  petId: string;
  amount: number;
  currency: Currency;
  alertThreshold: number; // 0.1 - 1.0 arası
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PetBudgetStatus {
  budget: PetBudget;
  currentSpending: number;
  percentage: number;
  remainingAmount: number;
  isAlert: boolean;
}

export interface SetPetBudgetInput {
  amount: number;
  currency: Currency;
  alertThreshold?: number; // default 0.8
  isActive?: boolean; // default true
}

// Eski tipler kaldırılacak
// ❌ BudgetLimit, BudgetAlert, BudgetStatus (complex versions)
```

### Phase 2: Yeni Basit Component'ler

#### Simple PetBudgetCard

```typescript
// components/PetBudgetCard.tsx
interface PetBudgetCardProps {
  budget: PetBudget;
  status?: PetBudgetStatus | null;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

const PetBudgetCard: React.FC<PetBudgetCardProps> = ({
  budget,
  status,
  onPress,
  onEdit,
  onDelete,
}) => {
  // Simple display:
  // - Budget amount (no category icon)
  // - Progress bar (no period chip)
  // - Simple alert (if percentage > threshold)
  // - Edit/Delete actions
};
```

#### Simple PetBudgetForm

```typescript
// components/PetBudgetForm.tsx
interface PetBudgetFormProps {
  petId: string;
  initialData?: PetBudget;
  onSubmit: (data: SetPetBudgetInput) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const PetBudgetForm: React.FC<PetBudgetFormProps> = ({
  petId,
  initialData,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  // Only 3 fields:
  // 1. Amount input (with currency picker)
  // 2. Alert threshold slider (0% - 100%)
  // 3. Active switch (optional)
};
```

#### Simple Budget Overview

```typescript
// components/home/SimpleBudgetOverview.tsx
interface SimpleBudgetOverviewProps {
  petId: string;
}

const SimpleBudgetOverview: React.FC<SimpleBudgetOverviewProps> = ({
  petId,
}) => {
  // Single budget display:
  // - Monthly budget amount
  // - Current spending
  // - Simple progress bar
  // - Alert if needed
};
```

### Phase 3: Hooks Güncellemeleri

#### Yeni Pet Budget Hooks

```typescript
// lib/hooks/usePetBudgets.ts
export function usePetBudget(petId?: string) {
  return useConditionalQuery<PetBudget | null>({
    queryKey: petBudgetKeys.detail(petId!),
    queryFn: () => petBudgetService.getBudgetByPetId(petId!),
    enabled: !!petId,
    defaultValue: null,
  });
}

export function usePetBudgetStatus(petId?: string) {
  return useConditionalQuery<PetBudgetStatus | null>({
    queryKey: petBudgetKeys.status(petId!),
    queryFn: () => petBudgetService.getBudgetStatus(petId!),
    enabled: !!petId,
    defaultValue: null,
  });
}

export function useSetPetBudget() {
  return useMutation({
    mutationFn: ({ petId, data }: { petId: string; data: SetPetBudgetInput }) =>
      petBudgetService.setPetBudget(petId, data),
  });
}

export function useDeletePetBudget() {
  return useMutation({
    mutationFn: (petId: string) => petBudgetService.deletePetBudget(petId),
  });
}
```

### Phase 4: Service Layer Güncellemeleri

#### Yeni Pet Budget Service

```typescript
// lib/services/petBudgetService.ts
class PetBudgetService {
  async getBudgetByPetId(petId: string): Promise<ApiResponse<PetBudget>> {
    // Simple API call to new backend endpoint
  }

  async setPetBudget(
    petId: string,
    data: SetPetBudgetInput
  ): Promise<ApiResponse<PetBudget>> {
    // UPSERT operation - creates or updates
  }

  async deletePetBudget(petId: string): Promise<ApiResponse<void>> {
    // Simple delete operation
  }

  async getBudgetStatus(petId: string): Promise<ApiResponse<PetBudgetStatus>> {
    // Get budget with current spending status
  }
}
```

### Phase 5: UI/UX Basitleştirmeleri

#### Ana Sayfa Güncellemesi

```typescript
// app/(tabs)/index.tsx - Güncellenmiş bölüm
{data.pets && data.pets.length > 0 && (
  <SimpleBudgetOverview
    petId={data.pets[0]?.id} // First pet's budget
  />
)}
```

#### Finance Tab Basitleştirmesi

```typescript
// app/(tabs)/finance.tsx - Yeni yapı
export default function FinanceScreen() {
  // No more expenses/budgets tabs
  // Single unified view:
  // - Pet selector at top
  // - Budget overview card
  // - Recent expenses list
  // - Single FAB for adding expenses

  return (
    <SafeAreaView>
      <PetSelector />
      <BudgetOverview />
      <ExpensesList />
      <AddExpenseFAB />
    </SafeAreaView>
  );
}
```

## 🗂️ File Structure Changes

### Yeni Dosyalar

```
components/
├── PetBudgetCard.tsx (yeni)
├── PetBudgetForm.tsx (yeni)
├── PetBudgetFormModal.tsx (yeni)
└── home/
    └── SimpleBudgetOverview.tsx (yeni)

lib/
├── hooks/
│   └── usePetBudgets.ts (yeni)
└── services/
    └── petBudgetService.ts (yeni)
```

### Güncellenecek Dosyalar

```
app/(tabs)/index.tsx (budget component değişikliği)
app/(tabs)/finance.tsx (tamamen yeniden tasarım)
lib/types.ts (yeni budget tipleri)
lib/hooks/useHomeData.ts (budget data fetching)
```

### Kaldırılacak Dosyalar

```
components/BudgetCard.tsx
components/BudgetFormModal.tsx
components/forms/BudgetForm.tsx
components/home/FinancialOverview.tsx
lib/hooks/useBudgets.ts
lib/services/budgetService.ts
hooks/useBudgetForm.ts
```

## 🎨 UI/UX İyileştirmeleri

### Budget Setup Flow

**Eski Flow** (6 adım):

1. Open finance tab
2. Switch to budgets tab
3. Select pet
4. Click add budget
5. Fill form (category, period, amount, currency, threshold)
6. Save

**Yeni Flow** (3 adım):

1. Open finance tab
2. Click "Set Budget" button
3. Enter amount + adjust alert slider + save

### Budget Display

**Eksi Display**:

- Multiple budget cards
- Category icons
- Period chips
- Complex alerts

**Yeni Display**:

- Single clean card
- Just amount & progress
- Simple alert badge

### Mobile Optimizations

```typescript
// Thumb-friendly form elements
const formStyles = StyleSheet.create({
  amountInput: {
    fontSize: 24, // Large input
    padding: 16,
    textAlign: "center",
  },
  slider: {
    height: 40, // Tappable slider
    marginVertical: 20,
  },
  saveButton: {
    paddingVertical: 16, // Easy to tap
  },
});
```

## 🔄 Migration Strategy

### Step 1: Parallel Development

1. Yeni component'leri yan tarafta geliştir
2. Eski component'leri çalışır tut
3. Feature flag ile yeni UI'ı test et

### Step 2: Gradual Replacement

```typescript
// Feature flag implementation
const useNewBudgetUI = true; // Feature flag

const BudgetComponent = useNewBudgetUI
  ? SimpleBudgetOverview
  : FinancialOverview;
```

### Step 3: Full Migration

1. Eski component'leri kaldır
2. Import'ları güncelle
3. Test et ve deploy et

## 📱 Component Tasarımları

### SimpleBudgetOverview Component

```typescript
const SimpleBudgetOverview: React.FC<{ petId: string }> = ({ petId }) => {
  const { data: budget } = usePetBudget(petId);
  const { data: status } = usePetBudgetStatus(petId);

  if (!budget) {
    return (
      <Card>
        <EmptyState
          title="No Budget Set"
          description="Set a monthly budget to track expenses"
          buttonText="Set Budget"
          onButtonPress={() => setShowBudgetForm(true)}
        />
      </Card>
    );
  }

  return (
    <Pressable onPress={() => router.push('/budget/edit')}>
      <Card>
        <View style={styles.header}>
          <Text variant="titleMedium">Monthly Budget</Text>
          <Text variant="bodySmall">{budget.currency}</Text>
        </View>

        <Text variant="headlineLarge" style={styles.amount}>
          {formatCurrency(budget.amount, budget.currency)}
        </Text>

        {status && (
          <>
            <ProgressBar
              progress={Math.min(status.percentage / 100, 1)}
              color={status.isAlert ? theme.colors.error : theme.colors.primary}
            />
            <Text variant="bodySmall">
              {formatCurrency(status.currentSpending, budget.currency)} spent
              {status.remainingAmount >= 0
                ? ` • ${formatCurrency(status.remainingAmount, budget.currency)} left`
                : ` • ${formatCurrency(Math.abs(status.remainingAmount), budget.currency)} over`
              }
            </Text>
          </>
        )}

        {status?.isAlert && (
          <Badge style={styles.alertBadge}>
            Budget Alert: {status.percentage.toFixed(0)}% used
          </Badge>
        )}
      </Card>
    </Pressable>
  );
};
```

### PetBudgetForm Component

```typescript
const PetBudgetForm: React.FC<PetBudgetFormProps> = ({
  petId,
  initialData,
  onSubmit,
  onCancel,
}) => {
  const { control, handleSubmit, watch } = useForm<SetPetBudgetInput>({
    defaultValues: {
      amount: initialData?.amount || 0,
      currency: initialData?.currency || 'TRY',
      alertThreshold: initialData?.alertThreshold || 0.8,
      isActive: initialData?.isActive ?? true,
    },
  });

  const amount = watch('amount');
  const alertThreshold = watch('alertThreshold');

  return (
    <View style={styles.container}>
      <Text variant="titleMedium">Set Monthly Budget</Text>

      // Amount Input with Currency
      <SmartCurrencyInput
        name="amount"
        control={control}
        label="Monthly Budget Amount"
        placeholder="0.00"
      />

      // Alert Threshold Slider
      <View style={styles.sliderSection}>
        <Text variant="bodyMedium">Alert When Budget Reaches:</Text>
        <Slider
          value={alertThreshold}
          onValueChange={(value) => setValue('alertThreshold', value)}
          minimumValue={0.5}
          maximumValue={1.0}
          step={0.05}
        />
        <Text variant="bodySmall">{Math.round(alertThreshold * 100)}%</Text>
      </View>

      // Active Switch
      <SmartSwitch
        name="isActive"
        label="Active Budget"
        description="Inactive budgets won't generate alerts"
      />

      // Form Actions
      <FormActions
        onCancel={onCancel}
        onSubmit={handleSubmit(onSubmit)}
        submitLabel="Set Budget"
      />
    </View>
  );
};
```

## ⚠️ Riskler ve Çözümleri

### Risk 1: User Data Loss

- **Çözüm**: Migration sırasında mevcut budget'ları koru
- **Çözüm**: Category-specific budget'ları kullanıcıya bilgilendir

### Risk 2: User Confusion

- **Çözüm**: In-app tutorial ekle
- **Çözüm**: Migration notification göster

### Risk 3: Feature Parity Loss

- **Çözüm**: Essential feature'ları koru (currency, alerts)
- **Çözüm**: User feedback loop ile iyileştir

## 📋 Test Planı

### Component Tests

- [ ] PetBudgetCard rendering
- [ ] PetBudgetForm validation
- [ ] SimpleBudgetOverview states

### Integration Tests

- [ ] Budget creation flow
- [ ] Budget editing flow
- [ ] Alert generation
- [ ] Currency switching

### E2E Tests

- [ ] Complete budget setup
- [ ] Expense tracking against budget
- [ ] Alert notification
- [ ] Multi-pet budget management

## 🚀 Deployment Plan

### Phase 1: Component Development

1. Yeni component'leri geliştir
2. Unit test'leri yaz
3. Storybook'da test et

### Phase 2: Integration

1. Service layer'ı güncelle
2. Hook'ları entegre et
3. Screen'leri güncelle

### Phase 3: Testing & QA

1. Manual testing
2. User acceptance testing
3. Performance testing

### Phase 4: Deployment

1. Feature flag ile gradual rollout
2. Monitor performance
3. Full rollout

## 📊 Success Metrics

- **Setup Time**: Budget creation süresinin %70 azalması (3 dakikadan 1 dakikaya)
- **UI Simplicity**: Component sayısının %60 azalması
- **User Engagement**: Budget setup completion rate'in %85+ olması
- **Support Tickets**: Budget-related support ticket'ların %50 azalması

---

**Not**: Bu frontend roadmap, backend roadmap ile paralel olarak uygulanmalıdır. Her iki tarafın da aynı anda hazır olması gerekir.
