import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { ReminderPresetKey } from '@/constants/reminders';

export type EventLocalStatus = 'pending' | 'completed' | 'cancelled' | 'missed';

interface EventStatusMeta {
  status: EventLocalStatus;
  updatedAt: string;
}

interface EventReminderState {
  reminderIds: Record<string, string[]>;
  statuses: Record<string, EventStatusMeta>;
  presetSelections: Record<string, ReminderPresetKey>;
  quietHours: {
    startHour: number;
    endHour: number;
  };
  setReminderIds: (eventId: string, ids: string[]) => void;
  clearReminderIds: (eventId: string) => void;
  markCompleted: (eventId: string) => void;
  markCancelled: (eventId: string) => void;
  markMissed: (eventId: string) => void;
  resetStatus: (eventId: string) => void;
  setPresetSelection: (eventId: string, preset: ReminderPresetKey) => void;
  clearPresetSelection: (eventId: string) => void;
}

const defaultQuietHours = {
  startHour: 22,
  endHour: 8,
};

export const useEventReminderStore = create<EventReminderState>()(
  persist(
    (set) => ({
      reminderIds: {},
      statuses: {},
      presetSelections: {},
      quietHours: defaultQuietHours,
      setReminderIds: (eventId, ids) =>
        set((state) => ({
          reminderIds: { ...state.reminderIds, [eventId]: ids },
        })),
      clearReminderIds: (eventId) =>
        set((state) => {
          const updatedReminders = { ...state.reminderIds };
          delete updatedReminders[eventId];
          return { reminderIds: updatedReminders };
        }),
      markCompleted: (eventId) =>
        set((state) => ({
          statuses: {
            ...state.statuses,
            [eventId]: { status: 'completed', updatedAt: new Date().toISOString() },
          },
        })),
      markCancelled: (eventId) =>
        set((state) => ({
          statuses: {
            ...state.statuses,
            [eventId]: { status: 'cancelled', updatedAt: new Date().toISOString() },
          },
        })),
      markMissed: (eventId) =>
        set((state) => ({
          statuses: {
            ...state.statuses,
            [eventId]: { status: 'missed', updatedAt: new Date().toISOString() },
          },
        })),
      resetStatus: (eventId) =>
        set((state) => {
          const updatedStatuses = { ...state.statuses };
          delete updatedStatuses[eventId];
          return { statuses: updatedStatuses };
        }),
      setPresetSelection: (eventId, preset) =>
        set((state) => ({
          presetSelections: { ...state.presetSelections, [eventId]: preset },
        })),
      clearPresetSelection: (eventId) =>
        set((state) => {
          const updatedPresets = { ...state.presetSelections };
          delete updatedPresets[eventId];
          return { presetSelections: updatedPresets };
        }),
    }),
    {
      name: 'event-reminders-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        reminderIds: state.reminderIds,
        statuses: state.statuses,
        presetSelections: state.presetSelections,
        quietHours: state.quietHours,
      }),
    }
  )
);
