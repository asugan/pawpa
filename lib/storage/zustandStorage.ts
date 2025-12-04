import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Custom storage adapter for Zustand persistence using AsyncStorage
 * Fixes "Unable to update item" warnings in React Native/Expo
 * Ensures proper JSON serialization/deserialization
 */

export const zustandStorage = {
  getItem: async (name: string) => {
    try {
      const value = await AsyncStorage.getItem(name);
      if (value === null) return null;
      
      // Parse the JSON string back to an object
      try {
        return JSON.parse(value);
      } catch (parseError) {
        // If parsing fails, return the raw value (backward compatibility)
        console.warn(`[zustandStorage] Failed to parse item "${name}", returning raw value:`, parseError);
        return value;
      }
    } catch (error) {
      console.warn(`[zustandStorage] Failed to get item "${name}":`, error);
      return null;
    }
  },

  setItem: async (name: string, value: any) => {
    try {
      // Ensure the value is a JSON string
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      await AsyncStorage.setItem(name, serializedValue);
      console.log(`[zustandStorage] Successfully set item "${name}"`);
    } catch (error) {
      console.warn(`[zustandStorage] Failed to set item "${name}":`, error);
      // Don't throw - allow app to continue without storage
    }
  },

  removeItem: async (name: string) => {
    try {
      await AsyncStorage.removeItem(name);
      console.log(`[zustandStorage] Successfully removed item "${name}"`);
    } catch (error) {
      console.warn(`[zustandStorage] Failed to remove item "${name}":`, error);
      // Don't throw - allow app to continue without storage
    }
  },
};

/**
 * Helper function to check if storage is available
 * Useful for debugging storage issues
 */
export const isStorageAvailable = async (): Promise<boolean> => {
  try {
    const testKey = '@pawpa/storage-test';
    await AsyncStorage.setItem(testKey, 'test');
    await AsyncStorage.removeItem(testKey);
    console.log('[zustandStorage] Storage is available and working');
    return true;
  } catch (error) {
    console.warn('[zustandStorage] Storage is not available:', error);
    return false;
  }
};

/**
 * Clear all Zustand storage items (useful for debugging)
 */
export const clearAllZustandStorage = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const zustandKeys = keys.filter(key => key.includes('-storage'));
    await AsyncStorage.multiRemove(zustandKeys);
    console.log(`[zustandStorage] Cleared ${zustandKeys.length} storage items`);
  } catch (error) {
    console.warn('[zustandStorage] Failed to clear storage:', error);
  }
};
