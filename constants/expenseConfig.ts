import { ExpenseCategory } from '@/lib/types';

export const EXPENSE_CATEGORY_CONFIG: Record<ExpenseCategory, { icon: string; color: string }> = {
  food: { icon: 'food', color: 'primary' },
  premium_food: { icon: 'food-variant', color: 'tertiary' },
  veterinary: { icon: 'hospital-box', color: 'error' },
  vaccination: { icon: 'needle', color: 'secondary' },
  medication: { icon: 'pill', color: 'inversePrimary' },
  grooming: { icon: 'content-cut', color: 'tertiaryContainer' },
  toys: { icon: 'soccer', color: 'primaryContainer' },
  accessories: { icon: 'shopping', color: 'secondaryContainer' },
  training: { icon: 'school', color: 'surfaceVariant' },
  insurance: { icon: 'shield-check', color: 'outline' },
  emergency: { icon: 'alert-circle', color: 'errorContainer' },
  other: { icon: 'dots-horizontal', color: 'surface' },
};

export const getExpenseCategoryConfig = (category: ExpenseCategory) => {
  return EXPENSE_CATEGORY_CONFIG[category] || EXPENSE_CATEGORY_CONFIG.other;
};
