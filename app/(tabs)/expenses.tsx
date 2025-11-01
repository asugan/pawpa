import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, FAB, useTheme, Snackbar, Chip } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePets } from '../../lib/hooks/usePets';
import { useExpenses, useExpenseStats, useCreateExpense, useUpdateExpense, useDeleteExpense } from '../../lib/hooks/useExpenses';
import ExpenseCard from '../../components/ExpenseCard';
import ExpenseFormModal from '../../components/ExpenseFormModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CreateExpenseInput, Expense } from '../../lib/types';

export default function ExpensesScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [selectedPetId, setSelectedPetId] = useState<string | undefined>();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();

  // Fetch pets
  const { data: pets = [], isLoading: petsLoading } = usePets();

  // Fetch expenses for selected pet
  const { data: expensesData, isLoading: expensesLoading, refetch } = useExpenses(
    selectedPetId,
    {}
  );

  // Fetch expense stats
  const { data: stats } = useExpenseStats({ petId: selectedPetId });

  // Mutations
  const createExpense = useCreateExpense();
  const updateExpense = useUpdateExpense();
  const deleteExpense = useDeleteExpense();

  const expenses = expensesData?.expenses || [];

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleAddExpense = () => {
    if (!selectedPetId) {
      showSnackbar(t('expenses.selectPetFirst', 'Please select a pet first'));
      return;
    }
    setEditingExpense(undefined);
    setModalVisible(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setModalVisible(true);
  };

  const handleDeleteExpense = (expense: Expense) => {
    Alert.alert(
      t('expenses.deleteExpense', 'Delete Expense'),
      t('expenses.deleteConfirmation', 'Are you sure you want to delete this expense?'),
      [
        {
          text: t('common.cancel', 'Cancel'),
          style: 'cancel',
        },
        {
          text: t('common.delete', 'Delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense.mutateAsync(expense.id);
              showSnackbar(t('expenses.deleteSuccess', 'Expense deleted successfully'));
            } catch (error) {
              showSnackbar(t('expenses.deleteError', 'Failed to delete expense'));
            }
          },
        },
      ]
    );
  };

  const handleSubmitExpense = async (data: CreateExpenseInput) => {
    try {
      if (editingExpense) {
        await updateExpense.mutateAsync({ id: editingExpense.id, data });
        showSnackbar(t('expenses.updateSuccess', 'Expense updated successfully'));
      } else {
        await createExpense.mutateAsync(data);
        showSnackbar(t('expenses.createSuccess', 'Expense created successfully'));
      }
      setModalVisible(false);
      setEditingExpense(undefined);
    } catch (error) {
      showSnackbar(
        editingExpense
          ? t('expenses.updateError', 'Failed to update expense')
          : t('expenses.createError', 'Failed to create expense')
      );
    }
  };

  const formatCurrency = (amount: number, currency: string): string => {
    const currencySymbols: Record<string, string> = {
      TRY: '₺',
      USD: '$',
      EUR: '€',
      GBP: '£',
    };

    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${amount.toFixed(2)}`;
  };

  if (petsLoading) {
    return <LoadingSpinner />;
  }

  if (pets.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="cash-multiple"
          title={t('expenses.noPets', 'No pets found')}
          message={t('expenses.addPetFirst', 'Please add a pet first to track expenses')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          {t('expenses.title', 'Expenses')}
        </Text>

        {/* Pet Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.petSelector}
          contentContainerStyle={styles.petSelectorContent}
        >
          {pets.map((pet) => (
            <Chip
              key={pet.id}
              selected={selectedPetId === pet.id}
              onPress={() => setSelectedPetId(pet.id)}
              style={styles.petChip}
              showSelectedCheck
            >
              {pet.name}
            </Chip>
          ))}
        </ScrollView>

        {/* Stats Summary */}
        {selectedPetId && stats && (
          <View style={[styles.statsCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="cash-multiple" size={20} color={theme.colors.primary} />
              <Text variant="bodySmall" style={styles.statLabel}>
                {t('expenses.totalSpent', 'Total Spent')}
              </Text>
              <Text variant="titleMedium" style={[styles.statValue, { color: theme.colors.primary }]}>
                {stats.byCurrency.map((c) => formatCurrency(c.total, c.currency)).join(', ')}
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="chart-bar" size={20} color={theme.colors.secondary} />
              <Text variant="bodySmall" style={styles.statLabel}>
                {t('expenses.totalExpenses', 'Total Expenses')}
              </Text>
              <Text variant="titleMedium" style={[styles.statValue, { color: theme.colors.secondary }]}>
                {stats.count}
              </Text>
            </View>
            <View style={styles.statItem}>
              <MaterialCommunityIcons name="calculator" size={20} color={theme.colors.tertiary} />
              <Text variant="bodySmall" style={styles.statLabel}>
                {t('expenses.average', 'Average')}
              </Text>
              <Text variant="titleMedium" style={[styles.statValue, { color: theme.colors.tertiary }]}>
                {formatCurrency(stats.average, stats.byCurrency[0]?.currency || 'TRY')}
              </Text>
            </View>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={expensesLoading}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
          />
        }
      >
        {!selectedPetId ? (
          <EmptyState
            icon="paw"
            title={t('expenses.selectPet', 'Select a pet')}
            message={t('expenses.selectPetMessage', 'Choose a pet to view expenses')}
          />
        ) : expenses.length === 0 ? (
          <EmptyState
            icon="cash-remove"
            title={t('expenses.noExpenses', 'No expenses yet')}
            message={t('expenses.noExpensesMessage', 'Start tracking your pet expenses')}
          />
        ) : (
          <View style={styles.expenseList}>
            {expenses.map((expense) => (
              <ExpenseCard
                key={expense.id}
                expense={expense}
                onEdit={() => handleEditExpense(expense)}
                onDelete={() => handleDeleteExpense(expense)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddExpense}
        label={t('expenses.addExpense', 'Add Expense')}
      />

      {selectedPetId && (
        <ExpenseFormModal
          visible={modalVisible}
          petId={selectedPetId}
          expense={editingExpense}
          onDismiss={() => {
            setModalVisible(false);
            setEditingExpense(undefined);
          }}
          onSubmit={handleSubmitExpense}
          isSubmitting={createExpense.isPending || updateExpense.isPending}
        />
      )}

      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 16,
  },
  petSelector: {
    marginBottom: 12,
  },
  petSelectorContent: {
    gap: 8,
  },
  petChip: {
    marginRight: 8,
  },
  statsCard: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    marginTop: 4,
    opacity: 0.7,
    textAlign: 'center',
  },
  statValue: {
    fontWeight: 'bold',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  expenseList: {
    padding: 16,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
