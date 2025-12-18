import AsyncStorage from "@react-native-async-storage/async-storage";

export interface EmergencyProfile {
  petId: string;
  allergies?: string;
  conditions?: string;
  medications?: string;
  vetName?: string;
  vetPhone?: string;
  vetAddress?: string;
  notes?: string;
  updatedAt: string;
}

const STORAGE_KEY = "emergency-profile";
const TTL_HOURS = 24;

export class EmergencyProfileService {
  private storageKey(petId: string): string {
    return `${STORAGE_KEY}:${petId}`;
  }

  async saveProfile(profile: Omit<EmergencyProfile, "updatedAt">): Promise<EmergencyProfile> {
    const payload: EmergencyProfile = {
      ...profile,
      updatedAt: new Date().toISOString(),
    };
    await AsyncStorage.setItem(this.storageKey(profile.petId), JSON.stringify(payload));
    return payload;
  }

  async getProfile(petId: string): Promise<{ profile: EmergencyProfile | null; isStale: boolean }> {
    const raw = await AsyncStorage.getItem(this.storageKey(petId));
    if (!raw) {
      return { profile: null, isStale: true };
    }

    const parsed: EmergencyProfile = JSON.parse(raw);
    const updatedAt = new Date(parsed.updatedAt);
    const hoursDiff = (Date.now() - updatedAt.getTime()) / 1000 / 3600;
    const isStale = hoursDiff > TTL_HOURS;

    return { profile: parsed, isStale };
  }

  async clearProfile(petId: string): Promise<void> {
    await AsyncStorage.removeItem(this.storageKey(petId));
  }
}

export const emergencyProfileService = new EmergencyProfileService();
