import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
} from "react-native";
import { Text, FAB, Snackbar, Chip, Card, SegmentedButtons, Button } from "@/components/ui";
import { useTheme } from "@/lib/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { usePets } from "../../lib/hooks/usePets";
import {
  useExpenses,
  useExpenseStats,
  useCreateExpense,
  useUpdateExpense,
  useDeleteExpense,
  expenseKeys,
  useExportExpensesCSV,
  useExportExpensesPDF,
  useExportVetSummaryPDF,
} from "../../lib/hooks/useExpenses";
import {
  useUserBudget,
  useUserBudgetStatus,
  useSetUserBudget,
  useDeleteUserBudget,
  useBudgetAlertNotifications,
} from "../../lib/hooks/useUserBudget";
import { useQueryClient } from "@tanstack/react-query";
import ExpenseCard from "../../components/ExpenseCard";
import ExpenseFormModal from "../../components/ExpenseFormModal";
import UserBudgetCard from "../../components/UserBudgetCard";
import UserBudgetFormModal from "../../components/UserBudgetFormModal";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { useTranslation } from "react-i18next";
import {
  CreateExpenseInput,
  Expense,
  SetUserBudgetInput,
  UserBudget,
} from "../../lib/types";
import { LAYOUT } from "../../constants";
import { ENV } from "../../lib/config/env";
import { ProtectedRoute } from "@/components/subscription";
import { BudgetInsights } from "@/components/BudgetInsights";
import { expenseService } from "@/lib/services/expenseService";

type FinanceTabValue = 'budget' | 'expenses';

export default function FinanceScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  // Tab state
  const [activeTab, setActiveTab] = useState<FinanceTabValue>('budget');

  // Shared state - default to undefined to show all pets
  const [selectedPetId, setSelectedPetId] = useState<string | undefined>();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  // Expenses state
  const [expenseModalVisible, setExpenseModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [page, setPage] = useState(1);
  const [allExpenses, setAllExpenses] = useState<Expense[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Budget state
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<UserBudget | undefined>();

  // Fetch pets
  const { data: pets = [], isLoading: petsLoading } = usePets();

  // Fetch expenses
  const {
    data: expensesData = { expenses: [], total: 0 },
    isLoading: expensesLoading,
    isFetching: expensesFetching,
  } = useExpenses(selectedPetId, {
    page,
    limit: ENV.DEFAULT_LIMIT,
  });

  // Fetch expense stats
  const { data: expenseStats } = useExpenseStats({ petId: selectedPetId });

  // Fetch user budget (new simplified system)
  const { data: budget, isLoading: budgetLoading } = useUserBudget();
  const { data: budgetStatus } = useUserBudgetStatus();
  useBudgetAlertNotifications();

  // Mutations
  const createExpenseMutation = useCreateExpense();
  const updateExpenseMutation = useUpdateExpense();
  const deleteExpenseMutation = useDeleteExpense();
  const setBudgetMutation = useSetUserBudget();
  const deleteBudgetMutation = useDeleteUserBudget();
  const exportCsvMutation = useExportExpensesCSV();
  const exportPdfMutation = useExportExpensesPDF();
  const exportVetSummaryMutation = useExportVetSummaryPDF();

  // Effects for pagination
  useEffect(() => {
    if (expensesData?.expenses) {
      if (page === 1) {
        setAllExpenses(expensesData.expenses);
      } else {
        setAllExpenses((prev) => [...prev, ...expensesData.expenses]);
      }
      setHasMore(expensesData.expenses.length >= ENV.DEFAULT_LIMIT);
    }
  }, [expensesData, page]);

  // Expense handlers
  const handleAddExpense = () => {
    setEditingExpense(undefined);
    setExpenseModalVisible(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setExpenseModalVisible(true);
  };

  const handleDeleteExpense = (expense: Expense) => {
    Alert.alert(t("expenses.deleteExpense"), t("expenses.deleteConfirmation"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteExpenseMutation.mutateAsync(expense._id);
            setSnackbarMessage(t("expenses.deleteSuccess"));
            setSnackbarVisible(true);
          } catch {
            setSnackbarMessage(t("expenses.deleteError"));
            setSnackbarVisible(true);
          }
        },
      },
    ]);
  };

  const handleExpenseFormSubmit = async (data: CreateExpenseInput) => {
    try {
      if (editingExpense) {
        await updateExpenseMutation.mutateAsync({
          _id: editingExpense._id,
          data,
        });
        setSnackbarMessage(t("expenses.updateSuccess"));
      } else {
        await createExpenseMutation.mutateAsync(data);
        setSnackbarMessage(t("expenses.createSuccess"));
      }
      setExpenseModalVisible(false);
      setEditingExpense(undefined);
      setSnackbarVisible(true);
    } catch {
      setSnackbarMessage(
        editingExpense ? t("expenses.updateError") : t("expenses.createError")
      );
      setSnackbarVisible(true);
    }
  };

  // Budget handlers (new simplified system)
  const handleSetBudget = () => {
    setEditingBudget(budget || undefined);
    setBudgetModalVisible(true);
  };

  const handleEditBudget = () => {
    if (budget) {
      setEditingBudget(budget);
      setBudgetModalVisible(true);
    }
  };

  const handleDeleteBudget = () => {
    if (!budget) return;

    Alert.alert(t("budgets.deleteBudget"), t("budgets.deleteConfirmation"), [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("common.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            await deleteBudgetMutation.mutateAsync();
            setSnackbarMessage(t("budgets.deleteSuccess"));
            setSnackbarVisible(true);
          } catch {
            setSnackbarMessage(t("budgets.deleteError"));
            setSnackbarVisible(true);
          }
        },
      },
    ]);
  };

  const handleBudgetFormSubmit = async (data: SetUserBudgetInput) => {
    try {
      await setBudgetMutation.mutateAsync(data);
      setBudgetModalVisible(false);
      setEditingBudget(undefined);
      setSnackbarMessage(t("budgets.budgetSetSuccess"));
      setSnackbarVisible(true);
    } catch {
      setSnackbarMessage(t("budgets.budgetSetError"));
      setSnackbarVisible(true);
    }
  };

  const handleExportCsv = async () => {
    try {
      await exportCsvMutation.mutateAsync({
        petId: selectedPetId,
      });
      setSnackbarMessage(t("expenses.exportSuccess", "Export completed"));
      setSnackbarVisible(true);
    } catch (error) {
      setSnackbarMessage(
        error instanceof Error ? error.message : t("expenses.exportError", "Export failed")
      );
      setSnackbarVisible(true);
    }
  };

  const handleExportPdf = async () => {
    try {
      const uri = await exportPdfMutation.mutateAsync({
        petId: selectedPetId,
      });
      const shareResult = await expenseService.sharePdf(uri, t("expenses.exportTitle", "Expenses PDF"));
      if (!shareResult.success) {
        setSnackbarMessage(
          typeof shareResult.error === "string"
            ? shareResult.error
            : t("expenses.exportError", "Export failed")
        );
      } else {
        setSnackbarMessage(t("expenses.exportSuccess", "Export completed"));
      }
      setSnackbarVisible(true);
    } catch (error) {
      setSnackbarMessage(
        error instanceof Error ? error.message : t("expenses.exportError", "Export failed")
      );
      setSnackbarVisible(true);
    }
  };

  const handleVetSummary = async () => {
    if (!selectedPetId) {
      setSnackbarMessage(t("expenses.selectPetForSummary", "Select a pet to export summary"));
      setSnackbarVisible(true);
      return;
    }
    try {
      const uri = await exportVetSummaryMutation.mutateAsync(selectedPetId);
      const shareResult = await expenseService.sharePdf(uri, t("expenses.vetSummaryTitle", "Vet Summary PDF"));
      if (!shareResult.success) {
        setSnackbarMessage(
          typeof shareResult.error === "string"
            ? shareResult.error
            : t("expenses.exportError", "Export failed")
        );
      } else {
        setSnackbarMessage(t("expenses.exportSuccess", "Export completed"));
      }
      setSnackbarVisible(true);
    } catch (error) {
      setSnackbarMessage(
        error instanceof Error ? error.message : t("expenses.exportError", "Export failed")
      );
      setSnackbarVisible(true);
    }
  };

  // Load more handler
  const handleLoadMoreExpenses = () => {
    if (!expensesFetching && hasMore) {
      setPage((prev) => prev + 1);
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
          title={t("expenses.noPets")}
          description={t("expenses.addPetFirst")}
          icon="dog"
        />
      );
    }

    return (
      <View style={styles.petSelector}>
        <Text
          variant="labelMedium"
          style={{ color: theme.colors.onSurfaceVariant, marginBottom: 8 }}
        >
          {t("expenses.selectPet")}
        </Text>
        <View style={styles.petChips}>
          <Chip
            selected={!selectedPetId}
            onPress={() => setSelectedPetId(undefined)}
            textStyle={{ fontSize: 12 }}
          >
            {t("common.all")}
          </Chip>
          {pets.map((pet) => (
            <Chip
              key={pet._id}
              selected={selectedPetId === pet._id}
              onPress={() => setSelectedPetId(pet._id)}
              textStyle={{ fontSize: 12 }}
            >
              {pet.name}
            </Chip>
          ))}
        </View>
      </View>
    );
  };

  // Render budget tab content
  const renderBudgetContent = () => {
    if (budgetLoading) {
      return <LoadingSpinner />;
    }

    return (
      <View style={styles.content}>
        <View style={styles.budgetSection}>
          {/* EmptyState - shown when no budget exists */}
          {(!budget || (typeof budget === 'object' && Object.keys(budget).length === 0)) && (
            <EmptyState
              title={t("budgets.noBudgetSet", "No Budget Set")}
              description={t(
                "budgets.setBudgetDescription",
                "Set a monthly budget to track your pet expenses"
              )}
              icon="wallet"
              buttonText={t("budgets.setBudget", "Set Budget")}
              onButtonPress={handleSetBudget}
            />
          )}

          {/* Budget Card with Actions - shown when budget exists */}
          {budget && budgetStatus && (
            <UserBudgetCard
              budget={budget}
              status={budgetStatus}
              onEdit={handleEditBudget}
              onDelete={handleDeleteBudget}
            />
          )}

          {budgetStatus && (
            <BudgetInsights status={budgetStatus} />
          )}

          <View style={styles.exportRow}>
            <Button
              mode="outlined"
              icon="file-download"
              loading={exportCsvMutation.isPending}
              onPress={handleExportCsv}
              style={styles.exportButton}
            >
              {t("expenses.exportCsv", "Export CSV")}
            </Button>
            <Button
              mode="outlined"
              icon="file-pdf-box"
              loading={exportPdfMutation.isPending}
              onPress={handleExportPdf}
              style={styles.exportButton}
            >
              {t("expenses.exportPdf", "Export PDF")}
            </Button>
          </View>
          <Button
            mode="contained"
            icon="hospital"
            loading={exportVetSummaryMutation.isPending}
            onPress={handleVetSummary}
            disabled={!selectedPetId}
          >
            {t("expenses.vetSummary", "Vet summary PDF")}
          </Button>
        </View>
      </View>
    );
  };

  // Render expenses tab content
  const renderExpensesContent = () => (
    <View style={styles.content}>
      {renderPetSelector()}
      <View style={styles.expensesSection}>
        {renderExpensesList()}
      </View>
    </View>
  );

  // Render expenses list with responsive grid
  const renderExpensesList = () => {
    if (expensesLoading && page === 1) {
      return <LoadingSpinner />;
    }

    if (allExpenses.length === 0 && page === 1) {
      return (
        <EmptyState
          title={t("expenses.noExpenses")}
          description={t("expenses.noExpensesMessage")}
          icon="cash"
          buttonText={t("expenses.addExpense")}
          onButtonPress={handleAddExpense}
        />
      );
    }

    return (
      <ScrollView
        style={styles.expensesScroll}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || expensesFetching}
            onRefresh={async () => {
              setRefreshing(true);
              setPage(1);

              // Don't clear allExpenses immediately - let placeholderData handle it

              // Invalidate specific query instead of all expenses
              const queryKey = expenseKeys.list({
                petId: selectedPetId,
                page: 1,
                limit: ENV.DEFAULT_LIMIT
              });

              await queryClient.invalidateQueries({ queryKey });
              await queryClient.refetchQueries({ queryKey });
              setRefreshing(false);
            }}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >=
            contentSize.height - 100;
          if (isCloseToBottom) {
            handleLoadMoreExpenses();
          }
        }}
        scrollEventThrottle={400}
      >
        {expenseStats && (
          <Card
            style={[
              styles.statsCard,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.statsContent}>
              <Text
                variant="titleMedium"
                style={{ color: theme.colors.onSurface }}
              >
                {t("expenses.totalSpent")}: {expenseStats.total || 0}{" "}
                {expenseStats.byCurrency?.[0]?.currency || "TRY"}
              </Text>
              <Text
                variant="bodyMedium"
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                {t("expenses.average")}: {expenseStats.average || 0}{" "}
                {expenseStats.byCurrency?.[0]?.currency || "TRY"}
              </Text>
            </View>
          </Card>
        )}

        <View style={styles.expensesGrid}>
          {allExpenses.map((expense) => (
            <ExpenseCard
              key={expense._id}
              expense={expense}
              onEdit={() => handleEditExpense(expense)}
              onDelete={() => handleDeleteExpense(expense)}
            />
          ))}
        </View>

        {expensesFetching && page > 1 && <LoadingSpinner />}
      </ScrollView>
    );
  };

  return (
    <ProtectedRoute featureName={t("subscription.features.expenses")}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <View style={styles.header}>
          <Text
            variant="titleLarge"
            style={{ color: theme.colors.onBackground }}
          >
            {t("finance.title")}
          </Text>
        </View>

        <View style={styles.tabsContainer}>
          <SegmentedButtons
            value={activeTab}
            onValueChange={(value) => setActiveTab(value as FinanceTabValue)}
            buttons={[
              {
                value: 'budget',
                label: t('finance.budget', 'Budget'),
                icon: 'wallet'
              },
              {
                value: 'expenses',
                label: t('finance.expenses', 'Expenses'),
                icon: 'receipt'
              }
            ]}
          />
        </View>

        {activeTab === 'budget' ? renderBudgetContent() : renderExpensesContent()}

        {/* Conditional FABs */}
        {activeTab === 'budget' && budget && (typeof budget === 'object' && Object.keys(budget).length > 0) && (
          <FAB
            icon="pencil"
            style={{ ...styles.fab, backgroundColor: theme.colors.primary }}
            onPress={handleSetBudget}
          />
        )}
        {activeTab === 'expenses' && (
          <FAB
            icon="add"
            style={{ ...styles.fab, backgroundColor: theme.colors.primary }}
            onPress={handleAddExpense}
          />
        )}

        {/* Modals */}
        <ExpenseFormModal
          visible={expenseModalVisible}
          expense={editingExpense}
          petId={editingExpense?.petId}
          onDismiss={() => {
            setExpenseModalVisible(false);
            setEditingExpense(undefined);
          }}
          onSubmit={handleExpenseFormSubmit}
        />

        <UserBudgetFormModal
          visible={budgetModalVisible}
          budget={editingBudget}
          onDismiss={() => {
            setBudgetModalVisible(false);
            setEditingBudget(undefined);
          }}
          onSubmit={handleBudgetFormSubmit}
          isSubmitting={setBudgetMutation.isPending}
        />

        {/* Snackbar */}
        <Snackbar
          visible={snackbarVisible}
          message={snackbarMessage}
          onDismiss={() => setSnackbarVisible(false)}
          duration={3000}
          action={{
            label: t("common.close"),
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
  tabsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  petSelector: {
    padding: 16,
    paddingBottom: 8,
  },
  petChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  content: {
    flex: 1,
  },
  budgetSection: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  expensesSection: {
    flex: 1,
  },
  expensesScroll: {
    flex: 1,
  },
  expensesGrid: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontWeight: "600",
  },
  setBudgetButton: {
    marginTop: 8,
  },
  listContainer: {
    paddingBottom: LAYOUT.TAB_BAR_HEIGHT,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 2,
  },
  statsContent: {
    padding: 16,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
  exportRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 12,
    marginBottom: 8,
  },
  exportButton: {
    flex: 1,
  },
});
