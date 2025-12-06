import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, FAB, Snackbar, Chip, Button, Card } from '@/components/ui';
import { useTheme } from '@/lib/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePets } from '../../lib/hooks/usePets';
import { useExpenses, useExpenseStats, useCreateExpense, useUpdateExpense, useDeleteExpense } from '../../lib/hooks/useExpenses';
import { useBudgets, useBudgetAlerts, useCreateBudget, useUpdateBudget, useDeleteBudget } from '../../lib/hooks/useBudgets';
import { useQueryClient } from '@tanstack/react-query';
import ExpenseCard from '../../components/ExpenseCard';
import BudgetCard from '../../components/BudgetCard';
import ExpenseFormModal from '../../components/ExpenseFormModal';
import BudgetFormModal from '../../components/BudgetFormModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CreateExpenseInput, Expense, CreateBudgetLimitInput, BudgetLimit } from '../../lib/types';
import { LAYOUT } from '../../constants';
import { ENV } from '../../lib/config/env';
import { ProtectedRoute } from '@/components/subscription';

type FinanceTabValue = 'expenses' | 'budgets';

export default function FinanceScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<FinanceTabValue>('expenses');

  // Shared state
  const [selectedPetId, setSelectedPetId] = useState<string | undefined>();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Expenses state
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [page, setPage] = useState(1);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [hasMore, setHasMore] = useState(true);

  // Budgets state
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetLimit | undefined>();
  const [budgetPage, setBudgetPage] = useState(1);
  const [allBudgets, setAllBudgets] = useState<BudgetLimit[]>([]);
  const [budgetsHasMore, setBudgetsHasMore] = useState(true);

  // Fetch pets
  const { data: pets = [], isLoading: petsLoading } = usePets();

  // Fetch expenses
  const { data: expensesData, isLoading: expensesLoading, isFetching: expensesFetching } = useExpenses(
    selectedPetId,
    {
      page,
      limit: ENV.DEFAULT_LIMIT,
    }
  );

  // Fetch expense stats
  const { data: expenseStats } = useExpenseStats({ petId: selectedPetId });

  // Fetch budgets
  const { data: budgetsData, isLoading: budgetsLoading, isFetching: budgetsFetching } = useBudgets(selectedPetId, {
    page: budgetPage,
    limit: ENV.DEFAULT_LIMIT,
  });

  // Fetch budget alerts
  const { data: budgetAlerts = [] } = useBudgetAlerts(selectedPetId);

  // Mutations
  const createExpenseMutation = useCreateExpense();
  const updateExpenseMutation = useUpdateExpense();
  const deleteExpenseMutation = useDeleteExpense();
  const createBudgetMutation = useCreateBudget();
  const updateBudgetMutation = useUpdateBudget();
  const deleteBudgetMutation = useDeleteBudget();

  // Effects for pagination
  useEffect(() => {
    if (expensesData?.expenses) {
      if (page === 1) {
        setAllExpenses(expensesData.expenses);
      } else {
        setAllExpenses(prev => [...prev, ...expensesData.expenses]);
      }
      setHasMore(expensesData.expenses.length >= ENV.DEFAULT_LIMIT);
    }
  }, [expensesData, page]);

  useEffect(() => {
    if (budgetsData?.budgetLimits) {
      if (budgetPage === 1) {
        setAllBudgets(budgetsData.budgetLimits);
      } else {
        setAllBudgets(prev => [...prev, ...budgetsData.budgetLimits]);
      }
      setBudgetsHasMore(budgetsData.budgetLimits.length >= ENV.DEFAULT_LIMIT);
    }
  }, [budgetsData, budgetPage]);

  // Reset pagination when pet changes
  useEffect(() => {
    setPage(1);
    setAllExpenses([]);
    setHasMore(true);
    setBudgetPage(1);
    setAllBudgets([]);
    setBudgetsHasMore(true);
  }, [selectedPetId]);

  // Expense handlers
  const handleAddExpense = () => {
    if (selectedPetId) {
      setEditingExpense(undefined);
      setExpenseModalVisible(true);
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseModalVisible(true);
  };

  const handleDeleteExpense = (expense: Expense) => {
    Alert.alert(
      t('expenses.deleteExpense'),
      t('expenses.deleteConfirmation'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpenseMutation.mutateAsync(expense.id);
              setSnackbarMessage(t('expenses.deleteSuccess'));
              setSnackbarVisible(true);
            } catch {
              setSnackbarMessage(t('expenses.deleteError'));
              setSnackbarVisible(true);
            }
          },
        },
      ]
    );
  };

  const handleExpenseFormSubmit = async (data: CreateExpenseInput) => {
    try {
      if (editingExpense) {
        await updateExpenseMutation.mutateAsync({ id: editingExpense.id, data });
        setSnackbarMessage(t('expenses.updateSuccess'));
      } else {
        await createExpenseMutation.mutateAsync(data);
        setSnackbarMessage(t('expenses.createSuccess'));
      }
      setExpenseModalVisible(false);
      setEditingExpense(undefined);
      setSnackbarVisible(true);
    } catch {
      setSnackbarMessage(editingExpense ? t('expenses.updateError') : t('expenses.createError'));
      setSnackbarVisible(true);
    }
  };

  // Budget handlers
  const handleAddBudget = () => {
    if (selectedPetId) {
      setEditingBudget(undefined);
      setBudgetModalVisible(true);
    }
  };

  const handleEditBudget = (budget: BudgetLimit) => {
    setEditingBudget(budget);
    setBudgetModalVisible(true);
  };

  const handleDeleteBudget = (budget: BudgetLimit) => {
    Alert.alert(
      t('budgets.deleteBudget'),
      t('budgets.deleteConfirmation'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteBudgetMutation.mutateAsync(budget.id);
              setSnackbarMessage(t('budgets.deleteSuccess'));
              setSnackbarVisible(true);
            } catch {
              setSnackbarMessage(t('budgets.deleteError'));
              setSnackbarVisible(true);
            }
          },
        },
      ]
    );
  };

  const handleBudgetFormSubmit = async (data: CreateBudgetLimitInput) => {
    try {
      if (editingBudget) {
        await updateBudgetMutation.mutateAsync({ id: editingBudget.id, data });
        setSnackbarMessage(t('budgets.updateSuccess'));
      } else {
        await createBudgetMutation.mutateAsync(data);
        setSnackbarMessage(t('budgets.createSuccess'));
      }
      setBudgetModalVisible(false);
      setEditingBudget(undefined);
      setSnackbarVisible(true);
    } catch {
      setSnackbarMessage(editingBudget ? t('budgets.updateError') : t('budgets.createError'));
      setSnackbarVisible(true);
    }
  };

  // Load more handlers
  const handleLoadMoreExpenses = () => {
    if (!expensesFetching && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  const handleLoadMoreBudgets = () => {
    if (!budgetsFetching && budgetsHasMore) {
      setBudgetPage(prev => prev + 1);
    }
  };

  // Render pet selector
  const renderPetSelector = () => {
    if (petsLoading) {
      return <LoadingSpinner />;
    }

    if (pets.length === 0) {
      return (
        <EmptyState
          title={t('expenses.noPets')}
          description={t('expenses.addPetFirst')}
          icon="dog"
        />
      );
    }

    return (
      <View style={styles.petSelector}>
        <Text variant="labelMedium" style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}>
          {t('expenses.selectPet')}
        </Text>
        <View style={styles.petChips}>
          <Chip
            selected={!selectedPetId}
            onPress={() => setSelectedPetId(undefined)}
            textStyle={{ fontSize: 12 }}
          >
            {t('common.all')}
          </Chip>
          {pets.map((pet) => (
            <Chip
              key={pet.id}
              selected={selectedPetId === pet.id}
              onPress={() => setSelectedPetId(pet.id)}
              textStyle={{ fontSize: 12 }}
            >
              {pet.name}
            </Chip>
          ))}
        </View>
      </View>
    );
  };

  // Render expenses content
  const renderExpensesContent = () => {
    if (!selectedPetId) {
      return (
        <EmptyState
          title={t('expenses.selectPet')}
          description={t('expenses.selectPetMessage')}
          icon="paw"
        />
      );
    }

    if (expensesLoading && page === 1) {
      return <LoadingSpinner />;
    }

    if (allExpenses.length === 0 && page === 1) {
      return (
        <EmptyState
          title={t('expenses.noExpenses')}
          description={t('expenses.noExpensesMessage')}
          icon="cash"
          buttonText={t('expenses.addExpense')}
          onButtonPress={handleAddExpense}
        />
      );
    }

    return (
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={expensesFetching}
            onRefresh={() => {
              setPage(1);
              setAllExpenses([]);
              queryClient.invalidateQueries({ queryKey: ['expenses'] });
            }}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
          if (isCloseToBottom) {
            handleLoadMoreExpenses();
          }
        }}
        scrollEventThrottle={400}
      >
        {expenseStats && (
          <Card style={[styles.statsCard, { backgroundColor: theme.colors.surface }]}>
            <View style={styles.statsContent}>
              <Text variant="titleMedium" style={{ color: theme.colors.onSurface }}>
                {t('expenses.totalSpent')}: {expenseStats.total || 0} {expenseStats.byCurrency?.[0]?.currency || 'TRY'}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>
                {t('expenses.average')}: {expenseStats.average || 0} {expenseStats.byCurrency?.[0]?.currency || 'TRY'}
              </Text>
            </View>
          </Card>
        )}

        {allExpenses.map((expense) => (
          <ExpenseCard
            key={expense.id}
            expense={expense}
            onEdit={() => handleEditExpense(expense)}
            onDelete={() => handleDeleteExpense(expense)}
          />
        ))}

        {expensesFetching && page > 1 && <LoadingSpinner />}
      </ScrollView>
    );
  };

  // Render budgets content
  const renderBudgetsContent = () => {
    if (!selectedPetId) {
      return (
        <EmptyState
          title={t('budgets.selectPet')}
          description={t('budgets.selectPetMessage')}
          icon="paw"
        />
      );
    }

    if (budgetsLoading && budgetPage === 1) {
      return <LoadingSpinner />;
    }

    if (allBudgets.length === 0 && budgetPage === 1) {
      return (
        <EmptyState
          title={t('budgets.noBudgets')}
          description={t('budgets.noBudgetsMessage')}
          icon="wallet"
          buttonText={t('budgets.addBudget')}
          onButtonPress={handleAddBudget}
        />
      );
    }

    return (
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={budgetsFetching}
            onRefresh={() => {
              setBudgetPage(1);
              setAllBudgets([]);
              queryClient.invalidateQueries({ queryKey: ['budgets'] });
            }}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 100;
          if (isCloseToBottom) {
            handleLoadMoreBudgets();
          }
        }}
        scrollEventThrottle={400}
      >
        {budgetAlerts.length > 0 && (
          <Card style={[styles.alertCard, { backgroundColor: theme.colors.errorContainer }]}>
            <View style={styles.alertContent}>
              <MaterialCommunityIcons name="alert" size={20} color={theme.colors.error} />
              <Text variant="bodyMedium" style={{ color: theme.colors.onErrorContainer, marginLeft: 8 }}>
                {t('budgets.alertsFound', { count: budgetAlerts.length })}
              </Text>
            </View>
          </Card>
        )}

        {allBudgets.map((budget) => (
          <BudgetCard
            key={budget.id}
            budget={budget}
            onEdit={() => handleEditBudget(budget)}
            onDelete={() => handleDeleteBudget(budget)}
          />
        ))}

        {budgetsFetching && budgetPage > 1 && <LoadingSpinner />}
      </ScrollView>
    );
  };

  return (
    <ProtectedRoute featureName={t('subscription.features.expenses')}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <Text variant="titleLarge" style={{ color: theme.colors.onBackground }}>
            {t('finance.title')}
          </Text>
        </View>

        <View style={styles.segmentedContainer}>
          <View style={styles.buttonGroup}>
            <Button
              mode={activeTab === 'expenses' ? 'contained' : 'outlined'}
              onPress={() => setActiveTab('expenses')}
              style={[styles.tabButton, activeTab === 'expenses' && styles.activeTabButton]}
            >
              {t('expenses.title')}
            </Button>
            <Button
              mode={activeTab === 'budgets' ? 'contained' : 'outlined'}
              onPress={() => setActiveTab('budgets')}
              style={[styles.tabButton, activeTab === 'budgets' && styles.activeTabButton]}
            >
              {t('budgets.title')}
            </Button>
          </View>
        </View>

        {renderPetSelector()}

        <View style={styles.content}>
          {activeTab === 'expenses' ? renderExpensesContent() : renderBudgetsContent()}
        </View>

        {/* FABs */}
        {selectedPetId && (
          <>
            {activeTab === 'expenses' && (
              <FAB
                icon="add"
                style={{ ...styles.fab, backgroundColor: theme.colors.primary }}
                onPress={handleAddExpense}
              />
            )}

            {activeTab === 'budgets' && (
              <FAB
                icon="add"
                style={{ ...styles.fab, backgroundColor: theme.colors.secondary }}
                onPress={handleAddBudget}
              />
            )}
          </>
        )}

        {/* Modals */}
        <ExpenseFormModal
          visible={expenseModalVisible}
          expense={editingExpense}
          petId={selectedPetId || ''}
          onDismiss={() => {
            setExpenseModalVisible(false);
            setEditingExpense(undefined);
          }}
          onSubmit={handleExpenseFormSubmit}
        />

        <BudgetFormModal
          visible={budgetModalVisible}
          budget={editingBudget}
          petId={selectedPetId || ''}
          onDismiss={() => {
            setBudgetModalVisible(false);
            setEditingBudget(undefined);
          }}
          onSubmit={handleBudgetFormSubmit}
        />

        {/* Snackbar */}
        <Snackbar
          visible={snackbarVisible}
          message={snackbarMessage}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{
            label: t('common.close'),
            onPress: () => setSnackbarVisible(false),
          }}
        />
      </SafeAreaView>
    </ProtectedRoute>
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
  segmentedContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tabButton: {
    flex: 1,
    borderRadius: 0,
  },
  activeTabButton: {
    zIndex: 1,
  },
  petSelector: {
    padding: 16,
    paddingBottom: 8,
  },
  petChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: LAYOUT.TAB_BAR_HEIGHT,
  },
  statsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  statsContent: {
    padding: 16,
  },
  alertCard: {
    marginBottom: 16,
    elevation: 2,
  },
  alertContent: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});