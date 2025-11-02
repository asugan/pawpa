import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, FAB, useTheme, Snackbar, Chip, Banner } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { usePets } from '../../lib/hooks/usePets';
import { useBudgets, useBudgetAlerts, useBudgetStatuses, useCreateBudget, useUpdateBudget, useDeleteBudget } from '../../lib/hooks/useBudgets';
import BudgetCard from '../../components/BudgetCard';
import BudgetFormModal from '../../components/BudgetFormModal';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useTranslation } from 'react-i18next';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { CreateBudgetLimitInput, BudgetLimit } from '../../lib/types';
import { LAYOUT } from '../../constants';

export default function BudgetsScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  const [selectedPetId, setSelectedPetId] = useState<string | undefined>();
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetLimit | undefined>();

  // Fetch pets
  const { data: pets = [], isLoading: petsLoading } = usePets();

  // Fetch budgets for selected pet
  const { data: budgetsData, isLoading: budgetsLoading, refetch } = useBudgets(selectedPetId);

  // Fetch budget alerts
  const { data: alerts = [] } = useBudgetAlerts(selectedPetId);

  // Fetch all budget statuses
  const { data: statuses = [] } = useBudgetStatuses(selectedPetId);

  // Mutations
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const deleteBudget = useDeleteBudget();

  const budgets = budgetsData?.budgetLimits || [];

  const showSnackbar = (message: string) => {
    setSnackbarMessage(message);
    setSnackbarVisible(true);
  };

  const handleAddBudget = () => {
    if (!selectedPetId) {
      showSnackbar(t('budgets.selectPetFirst', 'Please select a pet first'));
      return;
    }
    setEditingBudget(undefined);
    setModalVisible(true);
  };

  const handleEditBudget = (budget: BudgetLimit) => {
    setEditingBudget(budget);
    setModalVisible(true);
  };

  const handleDeleteBudget = (budget: BudgetLimit) => {
    Alert.alert(
      t('budgets.deleteBudget', 'Delete Budget'),
      t('budgets.deleteConfirmation', 'Are you sure you want to delete this budget limit?'),
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
              await deleteBudget.mutateAsync(budget.id);
              showSnackbar(t('budgets.deleteSuccess', 'Budget deleted successfully'));
            } catch (error) {
              showSnackbar(t('budgets.deleteError', 'Failed to delete budget'));
            }
          },
        },
      ]
    );
  };

  const handleSubmitBudget = async (data: CreateBudgetLimitInput) => {
    try {
      if (editingBudget) {
        await updateBudget.mutateAsync({ id: editingBudget.id, data });
        showSnackbar(t('budgets.updateSuccess', 'Budget updated successfully'));
      } else {
        await createBudget.mutateAsync(data);
        showSnackbar(t('budgets.createSuccess', 'Budget created successfully'));
      }
      setModalVisible(false);
      setEditingBudget(undefined);
    } catch (error) {
      showSnackbar(
        editingBudget
          ? t('budgets.updateError', 'Failed to update budget')
          : t('budgets.createError', 'Failed to create budget')
      );
    }
  };

  if (petsLoading) {
    return <LoadingSpinner />;
  }

  if (pets.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="wallet"
          title={t('budgets.noPets', 'No pets found')}
          description={t('budgets.addPetFirst', 'Please add a pet first to set budgets')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="headlineMedium" style={styles.title}>
          {t('budgets.title', 'Budgets')}
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

        {/* Alert Banner */}
        {selectedPetId && alerts.length > 0 && (
          <Banner
            visible={true}
            icon={({ size }) => (
              <MaterialCommunityIcons
                name="alert-circle"
                size={size}
                color={theme.colors.error}
              />
            )}
            style={[styles.alertBanner, { backgroundColor: theme.colors.errorContainer }]}
          >
            <Text variant="bodyMedium" style={{ color: theme.colors.error, fontWeight: '600' }}>
              {t('budgets.alertsFound', {
                count: alerts.length,
                defaultValue: `You have ${alerts.length} budget alert(s)!`,
              })}
            </Text>
          </Banner>
        )}
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={budgetsLoading}
            onRefresh={refetch}
            colors={[theme.colors.primary]}
          />
        }
      >
        {!selectedPetId ? (
          <EmptyState
            icon="paw"
            title={t('budgets.selectPet', 'Select a pet')}
            description={t('budgets.selectPetMessage', 'Choose a pet to view budgets')}
          />
        ) : budgets.length === 0 ? (
          <EmptyState
            icon="wallet-outline"
            title={t('budgets.noBudgets', 'No budgets yet')}
            description={t('budgets.noBudgetsMessage', 'Set budget limits to track your spending')}
          />
        ) : (
          <View style={styles.budgetList}>
            {budgets.map((budget) => {
              // Find budget status from statuses array
              const status = statuses.find((s) => s.budgetLimit.id === budget.id) || null;

              return (
                <BudgetCard
                  key={budget.id}
                  budget={budget}
                  status={status}
                  onEdit={() => handleEditBudget(budget)}
                  onDelete={() => handleDeleteBudget(budget)}
                />
              );
            })}
          </View>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={handleAddBudget}
        label={t('budgets.addBudget', 'Add Budget')}
      />

      {selectedPetId && (
        <BudgetFormModal
          visible={modalVisible}
          petId={selectedPetId}
          budget={editingBudget}
          onDismiss={() => {
            setModalVisible(false);
            setEditingBudget(undefined);
          }}
          onSubmit={handleSubmitBudget}
          isSubmitting={createBudget.isPending || updateBudget.isPending}
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
  alertBanner: {
    marginTop: 8,
    borderRadius: 12,
  },
  content: {
    flex: 1,
  },
  budgetList: {
    padding: 16,
    paddingBottom: LAYOUT.FAB_OFFSET,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
});
