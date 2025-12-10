import { useAuth } from "@/lib/auth";
import { useUserBudgetStatus } from "@/lib/hooks/useUserBudget";
import { useTodayEvents } from "@/lib/hooks/useEvents";
import { useExpenseStats } from "@/lib/hooks/useExpenses";
import {
  useAllPetsHealthRecords,
  useUpcomingVaccinations,
} from "@/lib/hooks/useHealthRecords";
import { usePets } from "@/lib/hooks/usePets";
import { useResponsiveSize } from "@/lib/hooks/useResponsiveSize";
import { UserBudgetStatus, Event, HealthRecord } from "@/lib/types";

export const useHomeData = () => {
  const { user } = useAuth();
  const { isMobile, scrollPadding, layoutMode } = useResponsiveSize();

  // Data fetching
  const {
    data: pets,
    isLoading: petsLoading,
    error: petsError,
    refetch: refetchPets,
  } = usePets();
  const { data: todayEvents, isLoading: eventsLoading } = useTodayEvents();
  const { data: upcomingVaccinations, isLoading: vaccinationsLoading } =
    useUpcomingVaccinations();
  const { data: expenseStats } = useExpenseStats();
  const { data: budgetStatus } = useUserBudgetStatus();

  // Derived Data
  const petIds = (pets || []).map((p) => p.id);
  const { data: allHealthRecords } = useAllPetsHealthRecords(petIds);

  // Financial Calculations
  const monthlyExpense = expenseStats?.total || 0;
  const monthlyBudget = budgetStatus?.budget?.amount || 800;
  const expensePercentage =
    monthlyBudget > 0 ? (monthlyExpense / monthlyBudget) * 100 : 0;

  const isLoading = petsLoading || eventsLoading || vaccinationsLoading;

  return {
    user,
    layout: { isMobile, scrollPadding, layoutMode },
    data: {
      pets,
      todayEvents,
      upcomingVaccinations,
      allHealthRecords,
    },
    financial: {
      monthlyExpense,
      monthlyBudget,
      expensePercentage,
    },
    status: {
      isLoading,
      error: petsError,
      refetch: refetchPets,
    },
  };
};

// Helper Functions (Logic)
export const getPetUpcomingEvents = (petId: string, events?: Event[]) => {
  if (!events) return 0;
  return events.filter((event) => event.petId === petId).length;
};

export const getPetUpcomingVaccinations = (
  petId: string,
  vaccinations?: HealthRecord[]
) => {
  if (!vaccinations) return 0;
  return vaccinations.filter((vaccination) => vaccination.petId === petId)
    .length;
};
