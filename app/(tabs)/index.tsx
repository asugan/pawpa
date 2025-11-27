import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, View, TouchableOpacity, Image } from "react-native";
import { Button, Text } from "@/components/ui";
import { useTheme } from "@/lib/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

// Auth hook
import { useAuth } from "@/lib/auth";

// Data hooks
import { useTodayEvents } from "@/lib/hooks/useEvents";
import { useExpenseStats } from "@/lib/hooks/useExpenses";
import { useBudgetStatuses } from "@/lib/hooks/useBudgets";
import { useUpcomingVaccinations } from "@/lib/hooks/useHealthRecords";
import { usePets } from "@/lib/hooks/usePets";
import { useResponsiveSize } from "@/lib/hooks/useResponsiveSize";

// Components
import BudgetOverview from "@/components/BudgetOverview";
import EmptyState from "@/components/EmptyState";
import ExpenseOverview from "@/components/ExpenseOverview";
import HealthOverview from "@/components/HealthOverview";
import LoadingSpinner from "@/components/LoadingSpinner";
import PetCard from "@/components/PetCard";
import StatCard from "@/components/StatCard";
import UpcomingEventsSection from "@/components/UpcomingEventsSection";
import { NextFeedingWidget } from "@/components/feeding/NextFeedingWidget";

export default function HomeScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const { isMobile, scrollPadding, layoutMode } = useResponsiveSize();
  const { user } = useAuth();

  // Data fetching with hooks
  const { data: pets, isLoading: petsLoading, error: petsError, refetch: refetchPets } = usePets();
  const { data: todayEvents, isLoading: eventsLoading } = useTodayEvents();
  const { data: upcomingVaccinations, isLoading: vaccinationsLoading } =
    useUpcomingVaccinations();
  const { data: expenseStats } = useExpenseStats();
  const { data: budgetStatuses } = useBudgetStatuses();

  // Calculate financial overview data
  const monthlyExpense = expenseStats?.total || 0;
  const monthlyBudget = budgetStatuses?.reduce((sum: number, b: any) => sum + (b.limit || 0), 0) || 800;
  const expensePercentage = monthlyBudget > 0 ? (monthlyExpense / monthlyBudget) * 100 : 0;

  // Loading state
  if (petsLoading || eventsLoading || vaccinationsLoading) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  // Error state
  if (petsError) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        <EmptyState
          icon="alert-circle"
          title={t("common.error")}
          description={t("common.loadingError")}
          actionLabel={t("common.retry")}
          onAction={() => refetchPets()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        style={[styles.scrollView, { padding: scrollPadding }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header with Profile and Notification */}
        <View style={styles.topHeader}>
          <TouchableOpacity style={[styles.avatarContainer, { borderColor: theme.colors.primary }]}>
            {user?.image ? (
              <Image source={{ uri: user.image }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={24} color={theme.colors.primary} />
              </View>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={28} color={theme.colors.onBackground} />
          </TouchableOpacity>
        </View>

        {/* Greeting Section */}
        <View style={styles.header}>
          <Text
            variant="headlineMedium"
            style={[styles.greeting, { color: theme.colors.onBackground }]}
          >
            {t("home.greeting")}, {user?.name || 'User'}!
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            {getDynamicSubtitle(pets?.length || 0, todayEvents?.length || 0)}
          </Text>
        </View>

        {/* Statistics Dashboard - Responsive Layout */}
        {layoutMode === 'horizontal-scroll' ? (
          // Mobile: Horizontal scroll layout
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statsScrollView}
            contentContainerStyle={styles.statsContainer}
            scrollEventThrottle={16}
          >
            <StatCard
              title={t("home.totalPets")}
              value={pets?.length || 0}
              icon="paw"
              color={theme.colors.primary}
              onPress={() => router.push("/(tabs)/pets")}
            />
            <StatCard
              title={t("events.today")}
              value={todayEvents?.length || 0}
              icon="calendar"
              color={theme.colors.primary}
              onPress={() => router.push("/(tabs)/calendar")}
            />
            <StatCard
              title={t("health.upcomingVaccinations")}
              value={upcomingVaccinations?.length || 0}
              icon="needle"
              color={theme.colors.primary}
              onPress={() => router.push("/(tabs)/health")}
            />
          </ScrollView>
        ) : (
          // Tablet/Desktop: Grid layout - full width 3 columns
          <View style={styles.statsGrid}>
            <StatCard
              title={t("home.totalPets")}
              value={pets?.length || 0}
              icon="paw"
              color={theme.colors.primary}
              onPress={() => router.push("/(tabs)/pets")}
              flexGrow
            />
            <StatCard
              title={t("events.today")}
              value={todayEvents?.length || 0}
              icon="calendar"
              color={theme.colors.primary}
              onPress={() => router.push("/(tabs)/calendar")}
              flexGrow
            />
            <StatCard
              title={t("health.upcomingVaccinations")}
              value={upcomingVaccinations?.length || 0}
              icon="needle"
              color={theme.colors.primary}
              onPress={() => router.push("/(tabs)/health")}
              flexGrow
            />
          </View>
        )}

        {/* My Pets Section */}
        <View style={styles.petsSection}>
          <Text
            variant="titleLarge"
            style={[
              styles.sectionTitle,
              { color: theme.colors.onBackground },
            ]}
          >
            {t("home.myPets")}
          </Text>

          {pets && pets.length > 0 ? (
            <View style={styles.petList}>
              {pets.map((pet) => (
                <View key={pet.id} style={styles.petCardWrapper}>
                  <PetCard
                    pet={pet}
                    onPress={() => router.push(`/pet/${pet.id}`)}
                    upcomingEvents={getPetUpcomingEvents(pet.id, todayEvents)}
                    upcomingVaccinations={getPetUpcomingVaccinations(
                      pet.id,
                      upcomingVaccinations
                    )}
                    showActions={false}
                  />
                </View>
              ))}

              {/* Add New Pet Button */}
              <TouchableOpacity
                onPress={() => router.push("/pet/add")}
                style={[
                  styles.addPetButton,
                  { backgroundColor: theme.colors.surface, borderColor: '#4B5563' }
                ]}
              >
                <View style={[styles.addPetIconContainer, { backgroundColor: '#4B5563' }]}>
                  <Ionicons name="add" size={24} color="#9CA3AF" />
                </View>
                <Text
                  variant="titleMedium"
                  style={[styles.addPetText, { color: theme.colors.onSurfaceVariant }]}
                >
                  {t("pets.addNewPet")}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <EmptyState
              icon="paw"
              title={t("home.noPetsYet")}
              description={t("pets.addFirstPetDescription")}
              actionLabel={t("pets.addFirstPet")}
              onAction={() => router.push("/pet/add")}
            />
          )}
        </View>

        {/* Next Feeding Widget */}
        <View style={styles.widgetSection}>
          <NextFeedingWidget />
        </View>

        {/* Health Overview Section */}
        <HealthOverview
          upcomingVaccinations={upcomingVaccinations || []}
        />

        {/* Financial Overview Section */}
        {pets && pets.length > 0 && (
          <View style={[styles.financialCard, { backgroundColor: theme.colors.surface, borderColor: '#4B5563' }]}>
            <Text variant="titleMedium" style={[styles.financialTitle, { color: theme.colors.onSurface }]}>
              {t("home.financialOverview")}
            </Text>

            <View style={styles.financialRow}>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
                {t("finance.monthlyExpenses")}
              </Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                {monthlyExpense.toFixed(0)}₺ / <Text style={{ color: theme.colors.onSurfaceVariant }}>{monthlyBudget.toFixed(0)}₺</Text>
              </Text>
            </View>

            <View style={[styles.progressBarContainer, { backgroundColor: '#4B5563' }]}>
              <View style={[styles.progressBar, {
                backgroundColor: expensePercentage > 80 ? theme.colors.error : theme.colors.accent,
                width: `${Math.min(expensePercentage, 100)}%`
              }]} />
            </View>
          </View>
        )}

        {/* Upcoming Events Section */}
        <UpcomingEventsSection />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => router.push("/pet/add")}
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

// Helper functions
const getGreetingMessage = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning ☀️";
  if (hour < 18) return "Good afternoon 🌤️";
  return "Good evening 🌙";
};

const getDynamicSubtitle = (petsCount: number, eventsCount: number) => {
  if (petsCount === 0) return "Start by adding your first pet 🐕";
  if (eventsCount === 0) return "No scheduled activities for today 📅";
  if (eventsCount === 1) return "You have 1 activity today ✨";
  return `You have ${eventsCount} activities today 🎉`;
};

const getPetUpcomingEvents = (petId: string, events?: any[]) => {
  if (!events) return 0;
  return events.filter((event) => event.petId === petId).length;
};

const getPetUpcomingVaccinations = (petId: string, vaccinations?: any[]) => {
  if (!vaccinations) return 0;
  return vaccinations.filter((vaccination) => vaccination.petId === petId)
    .length;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarPlaceholder: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    marginBottom: 16,
  },
  greeting: {
    fontWeight: "bold",
    marginBottom: 4,
  },
  subtitle: {
  },
  statsScrollView: {
    marginBottom: 24,
  },
  statsContainer: {
    gap: 12,
    paddingHorizontal: 0,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  petsSection: {
    marginBottom: 24,
  },
  widgetSection: {
    marginBottom: 24,
  },
  financialCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
  },
  financialTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  financialRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressBarContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 16,
  },
  petList: {
    gap: 12,
  },
  petCardWrapper: {
    width: "100%",
  },
  addPetButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 16,
  },
  addPetIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  addPetText: {
    fontWeight: "500",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    elevation: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});
