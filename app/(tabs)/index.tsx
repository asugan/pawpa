import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { Button, FAB, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

// Data hooks
import { useTodayEvents } from "@/lib/hooks/useEvents";
import { useUpcomingVaccinations } from "@/lib/hooks/useHealthRecords";
import { usePets } from "@/lib/hooks/usePets";

// Components
import EmptyState from "@/components/EmptyState";
import HealthOverview from "@/components/HealthOverview";
import LoadingSpinner from "@/components/LoadingSpinner";
import NetworkStatusBadge from "@/components/NetworkStatusBadge";
import PetCard from "@/components/PetCard";
import StatCard from "@/components/StatCard";
import { NextFeedingWidget } from "@/components/feeding/NextFeedingWidget";

export default function HomeScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const router = useRouter();

  // Data fetching with hooks
  const { data: pets, isLoading: petsLoading, error: petsError } = usePets();
  const { data: todayEvents, isLoading: eventsLoading } = useTodayEvents();
  const { data: upcomingVaccinations, isLoading: vaccinationsLoading } =
    useUpcomingVaccinations();

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
          onAction={() => window.location.reload()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text
              variant="headlineMedium"
              style={[styles.title, { color: theme.colors.onBackground }]}
            >
              PawPa
            </Text>
            <NetworkStatusBadge />
          </View>
          <Text
            variant="bodyLarge"
            style={[styles.greeting, { color: theme.colors.onBackground }]}
          >
            {getGreetingMessage()}!
          </Text>
          <Text
            variant="bodyMedium"
            style={[styles.subtitle, { color: theme.colors.onSurfaceVariant }]}
          >
            {getDynamicSubtitle(pets?.length || 0, todayEvents?.length || 0)}
          </Text>
        </View>

        {/* Statistics Dashboard */}
        <View style={styles.statsContainer}>
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
            color={theme.colors.secondary}
            onPress={() => router.push("/(tabs)/calendar")}
          />
          <StatCard
            title={t("health.upcomingVaccinations")}
            value={upcomingVaccinations?.length || 0}
            icon="needle"
            color={theme.colors.tertiary}
            onPress={() => router.push("/(tabs)/health")}
          />
        </View>

        {/* My Pets Section */}
        <View style={styles.petsSection}>
          <View style={styles.sectionHeader}>
            <Text
              variant="titleLarge"
              style={[
                styles.sectionTitle,
                { color: theme.colors.onBackground },
              ]}
            >
              {t("home.myPets")}
            </Text>
            <Button
              mode="text"
              onPress={() => router.push("/pet/add")}
              compact
              textColor={theme.colors.primary}
            >
              {t("pets.add")}
            </Button>
          </View>

          {pets && pets.length > 0 ? (
            <View style={styles.petGrid}>
              {pets.map((pet) => (
                <View key={pet.id} style={styles.petCardWrapper}>
                  <PetCard
                    pet={pet}
                    onPress={() => router.push(`/pet/${pet.id}`)}
                    onEdit={() => router.push(`/pet/${pet.id}/edit`)}
                    upcomingEvents={getPetUpcomingEvents(pet.id, todayEvents)}
                    upcomingVaccinations={getPetUpcomingVaccinations(
                      pet.id,
                      upcomingVaccinations
                    )}
                    showActions={false}
                  />
                </View>
              ))}
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
          todayEvents={todayEvents || []}
          upcomingVaccinations={upcomingVaccinations || []}
        />

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <Text
            variant="titleLarge"
            style={[styles.sectionTitle, { color: theme.colors.onBackground }]}
          >
            {t("home.quickActions")}
          </Text>
          <View style={styles.actionButtons}>
            <Pressable
              style={[
                styles.quickActionButton,
                { backgroundColor: theme.colors.primaryContainer },
              ]}
              onPress={() => router.push("/pet/add")}
            >
              <MaterialCommunityIcons
                name="plus"
                size={24}
                color={theme.colors.onPrimaryContainer}
              />
              <Text
                variant="bodyMedium"
                style={[
                  styles.quickActionText,
                  { color: theme.colors.onPrimaryContainer },
                ]}
              >
                {t("pets.addNewPet")}
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.quickActionButton,
                { backgroundColor: theme.colors.secondaryContainer },
              ]}
              onPress={() => router.push("/health/add")}
            >
              <MaterialCommunityIcons
                name="medical-bag"
                size={24}
                color={theme.colors.onSecondaryContainer}
              />
              <Text
                variant="bodyMedium"
                style={[
                  styles.quickActionText,
                  { color: theme.colors.onSecondaryContainer },
                ]}
              >
                {t("health.addRecord")}
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.quickActionButton,
                { backgroundColor: theme.colors.tertiaryContainer },
              ]}
              onPress={() => router.push("/(tabs)/calendar")}
            >
              <MaterialCommunityIcons
                name="calendar-plus"
                size={24}
                color={theme.colors.onTertiaryContainer}
              />
              <Text
                variant="bodyMedium"
                style={[
                  styles.quickActionText,
                  { color: theme.colors.onTertiaryContainer },
                ]}
              >
                {t("events.addEvent")}
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => router.push("/pet/add")}
      />
    </SafeAreaView>
  );
}

// Helper functions
const getGreetingMessage = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

const getDynamicSubtitle = (petsCount: number, eventsCount: number) => {
  if (petsCount === 0) return "Start by adding your first pet";
  if (eventsCount === 0) return "No scheduled activities for today";
  if (eventsCount === 1) return "You have 1 activity today";
  return `You have ${eventsCount} activities today`;
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
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 8,
  },
  title: {
    fontWeight: "bold",
  },
  greeting: {
    textAlign: "center",
    marginBottom: 4,
  },
  subtitle: {
    textAlign: "center",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  petsSection: {
    marginBottom: 24,
  },
  widgetSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontWeight: "600",
  },
  petGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  petCardWrapper: {
    width: "48%",
    marginBottom: 12,
  },
  quickActionsContainer: {
    marginBottom: 80, // Space for FAB
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    gap: 8,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
