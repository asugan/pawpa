import { useEffect, useState, useCallback } from "react";
import { emergencyProfileService, EmergencyProfile } from "@/lib/services/emergencyProfileService";

export function useEmergencyProfile(petId?: string) {
  const [profile, setProfile] = useState<EmergencyProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [stale, setStale] = useState(false);

  const load = useCallback(async () => {
    if (!petId) return;
    setLoading(true);
    const result = await emergencyProfileService.getProfile(petId);
    setProfile(result.profile);
    setStale(result.isStale);
    setLoading(false);
  }, [petId]);

  const save = useCallback(
    async (data: Omit<EmergencyProfile, "updatedAt">) => {
      const saved = await emergencyProfileService.saveProfile(data);
      setProfile(saved);
      setStale(false);
      return saved;
    },
    []
  );

  useEffect(() => {
    void load();
  }, [load]);

  return {
    profile,
    loading,
    stale,
    refresh: load,
    save,
  };
}
