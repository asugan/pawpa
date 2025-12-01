import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProtectedRoute } from '@/components/subscription';
import EmptyState from "@/components/EmptyState";
import HealthOverview from "@/components/HealthOverview";
import LoadingSpinner from "@/components/LoadingSpinner";
import PetCard from "@/components/PetCard";
import StatCard from "@/components/StatCard";
import { UpcomingEventsSection } from "@/components/UpcomingEventsSection";
import { NextFeedingWidget } from "@/components/feeding/NextFeedingWidget";
import { FinancialOverview } from "@/components/home/FinancialOverview";
import { HomeHeader } from "@/components/home/HomeHeader";
import { Text } from "@/components/ui";
import { getPetUpcomingEvents, getPetUpcomingVaccinations, useHomeData } from "@/lib/hooks/useHomeData";
import { useTheme } from "@/lib/theme";

export default function HomeScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  
  // Tüm mantık useHomeData hook'unda toplandı
  const { user, layout, data, financial, status } = useHomeData();

  if (status.isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (status.error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="alert-circle"
          title={t("common.error")}
          description={t("common.loadingError")}
          actionLabel={t("common.retry")}
          onAction={() => status.refetch()}
        />
      </SafeAreaView>
    );
  }

  return (
    <ProtectedRoute featureName={t('navigation.home')}>
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView
        style={[styles.scrollView, { padding: layout.scrollPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <HomeHeader 
          user={user} 
          petsCount={data.pets?.length || 0} 
          eventsCount={data.todayEvents?.length || 0} 
        />

        {/* Stats Dashboard */}
        <View style={layout.layoutMode === 'horizontal-scroll' ? styles.statsScrollView : styles.statsGrid}>
            {layout.layoutMode === 'horizontal-scroll' ? (
               <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.statsContainer}
                >
                  <StatCard
                    title={t("home.totalPets")}
                    value={data.pets?.length || 0}
                    icon="paw"
                    color={theme.colors.primary}
                    onPress={() => router.push("/(tabs)/pets")}
                  />
                  <StatCard
                    title={t("events.today")}
                    value={data.todayEvents?.length || 0}
                    icon="calendar"
                    color={theme.colors.primary}
                    onPress={() => router.push("/(tabs)/calendar")}
                  />
                  <StatCard
                    title={t("health.upcomingVaccinations")}
                    value={data.upcomingVaccinations?.length || 0}
                    icon="needle"
                    color={theme.colors.primary}
                    onPress={() => router.push("/(tabs)/health")}
                  />
                </ScrollView>
            ) : (
              <>
                <StatCard
                  title={t("home.totalPets")}
                  value={data.pets?.length || 0}
                  icon="paw"
                  color={theme.colors.primary}
                  onPress={() => router.push("/(tabs)/pets")}
                  flexGrow
                />
                <StatCard
                  title={t("events.today")}
                  value={data.todayEvents?.length || 0}
                  icon="calendar"
                  color={theme.colors.primary}
                  onPress={() => router.push("/(tabs)/calendar")}
                  flexGrow
                />
                <StatCard
                  title={t("health.upcomingVaccinations")}
                  value={data.upcomingVaccinations?.length || 0}
                  icon="needle"
                  color={theme.colors.primary}
                  onPress={() => router.push("/(tabs)/health")}
                  flexGrow
                />
              </>
            )}
        </View>

        {/* My Pets Section */}
        <View style={styles.section}>
          <Text variant="titleLarge" style={[styles.sectionTitle, { color: theme.colors.onBackground }]}>
            {t("home.myPets")}
          </Text>

          {data.pets && data.pets.length > 0 ? (
            <View style={styles.petList}>
              {data.pets.map((pet) => (
                <View key={pet.id} style={styles.petCardWrapper}>
                  <PetCard
                    pet={pet}
                    onPress={() => router.push(`/pet/${pet.id}`)}
                    upcomingEvents={getPetUpcomingEvents(pet.id, data.todayEvents)}
                    upcomingVaccinations={getPetUpcomingVaccinations(pet.id, data.upcomingVaccinations)}
                    showActions={false}
                  />
                </View>
              ))}
              
              {/* Add Pet Button */}
              <TouchableOpacity
                onPress={() => router.push("/pet/add")}
                style={[styles.addPetButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}
              >
                <View style={[styles.addPetIconContainer, { backgroundColor: theme.colors.surfaceVariant }]}>
                  <Ionicons name="add" size={24} color={theme.colors.onSurfaceVariant} />
                </View>
                <Text variant="titleMedium" style={{ color: theme.colors.onSurfaceVariant }}>
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

        <View style={styles.section}>
          <NextFeedingWidget />
        </View>

        <HealthOverview healthRecords={data.allHealthRecords || []} />

        {data.pets && data.pets.length > 0 && (
          <FinancialOverview 
            monthlyExpense={financial.monthlyExpense}
            monthlyBudget={financial.monthlyBudget}
            expensePercentage={financial.expensePercentage}
          />
        )}

        <UpcomingEventsSection />
      </ScrollView>

        <TouchableOpacity
          onPress={() => router.push("/pet/add")}
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        >
          <Ionicons name="add" size={32} color="#FFFFFF" />
        </TouchableOpacity>
      </SafeAreaView>
    </ProtectedRoute>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  statsScrollView: { marginBottom: 24 },
  statsContainer: { gap: 12, paddingHorizontal: 0 },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontWeight: "600", marginBottom: 16 },
  petList: { gap: 12 },
  petCardWrapper: { width: "100%" },
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
