import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/lib/theme';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import CustomTabHeader from '@/components/CustomTabHeader';
import { useSubscription } from '@/lib/hooks/useSubscription';

export default function TabLayout() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { isProUser, isTrialActive } = useSubscription();

  // Determine if user has Pro access or active trial
  const isProOrTrial = isProUser || isTrialActive;

  // Base tab bar height (without safe area)
  const TAB_BAR_HEIGHT = 60;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurface,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
          paddingBottom: insets.bottom,
          height: TAB_BAR_HEIGHT + insets.bottom,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
        sceneStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      {/* Always accessible tabs */}
      <Tabs.Screen
        name="index"
        options={{
          title: t('navigation.home'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" size={size} color={color} />
          ),
          headerTitle: () => <CustomTabHeader pageTitle="Home" />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('navigation.settings'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
          headerTitle: () => <CustomTabHeader pageTitle={t('settings.settings')} />,
        }}
      />

      {/* Pro-only tabs - hidden for non-Pro users */}
      <Tabs.Protected guard={isProOrTrial}>
        <Tabs.Screen
          name="pets"
          options={{
            title: t('navigation.pets'),
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="paw" size={size} color={color} />
            ),
            headerTitle: () => <CustomTabHeader pageTitle={t('pets.myPets')} />,
          }}
        />
        <Tabs.Screen
          name="health"
          options={{
            title: t('navigation.health'),
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="heart" size={size} color={color} />
            ),
            headerTitle: () => <CustomTabHeader pageTitle={t('health.healthRecords')} />,
          }}
        />
        <Tabs.Screen
          name="calendar"
          options={{
            title: t('navigation.calendar'),
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="calendar" size={size} color={color} />
            ),
            headerTitle: () => <CustomTabHeader pageTitle={t('calendar.calendar')} />,
          }}
        />
        <Tabs.Screen
          name="feeding"
          options={{
            title: t('navigation.feeding'),
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="bowl" size={size} color={color} />
            ),
            headerTitle: () => <CustomTabHeader pageTitle={t('feedingSchedule.title')} />,
          }}
        />
        <Tabs.Screen
          name="expenses"
          options={{
            title: t('navigation.expenses'),
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="cash-multiple" size={size} color={color} />
            ),
            headerTitle: () => <CustomTabHeader pageTitle={t('expenses.title')} />,
          }}
        />
        <Tabs.Screen
          name="budgets"
          options={{
            title: t('navigation.budgets'),
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons name="wallet" size={size} color={color} />
            ),
            headerTitle: () => <CustomTabHeader pageTitle={t('budgets.title')} />,
          }}
        />
      </Tabs.Protected>
    </Tabs>
  );
}