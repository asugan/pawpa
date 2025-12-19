import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, View, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme";
import { usePets } from "@/lib/hooks/usePets";
import { useEmergencyProfile } from "@/hooks/useEmergencyProfile";
import { Card, Text, TextInput, Button, Chip, Banner, Snackbar } from "@/components/ui";
import { useTranslation } from "react-i18next";

type EmergencyFormState = {
  allergies: string;
  conditions: string;
  medications: string;
  vetName: string;
  vetPhone: string;
  vetAddress: string;
  notes: string;
};

const initialState: EmergencyFormState = {
  allergies: "",
  conditions: "",
  medications: "",
  vetName: "",
  vetPhone: "",
  vetAddress: "",
  notes: "",
};

export default function EmergencyScreen() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { data: pets = [] } = usePets();
  const [selectedPetId, setSelectedPetId] = useState<string | undefined>();
  const { profile, loading, stale, save, refresh } = useEmergencyProfile(selectedPetId);
  const [form, setForm] = useState<EmergencyFormState>(initialState);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ visible: false, message: "" });

  useEffect(() => {
    if (!selectedPetId && pets.length > 0) {
      setSelectedPetId(pets[0]._id);
    }
  }, [pets, selectedPetId]);

  useEffect(() => {
    if (profile) {
      setForm({
        allergies: profile.allergies || "",
        conditions: profile.conditions || "",
        medications: profile.medications || "",
        vetName: profile.vetName || "",
        vetPhone: profile.vetPhone || "",
        vetAddress: profile.vetAddress || "",
        notes: profile.notes || "",
      });
    } else {
      setForm(initialState);
    }
  }, [profile]);

  const handleChange = (key: keyof EmergencyFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!selectedPetId) return;
    setSaving(true);
    await save({
      petId: selectedPetId,
      ...form,
    });
    setSaving(false);
    setSnackbar({ visible: true, message: t("emergency.saved", "Emergency info saved") });
  };

  const callVet = () => {
    if (form.vetPhone) {
      Linking.openURL(`tel:${form.vetPhone}`);
    } else {
      setSnackbar({ visible: true, message: t("emergency.noVetPhone", "No vet phone set") });
    }
  };

  const openLocation = () => {
    if (form.vetAddress) {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(form.vetAddress)}`;
      Linking.openURL(url);
    } else {
      setSnackbar({ visible: true, message: t("emergency.noAddress", "No address set") });
    }
  };

  const PetSelector = useMemo(() => (
    <View style={styles.petChips}>
      {pets.map((pet) => (
        <Chip
          key={pet._id}
          selected={selectedPetId === pet._id}
          onPress={() => setSelectedPetId(pet._id)}
        >
          {pet.name}
        </Chip>
      ))}
    </View>
  ), [pets, selectedPetId]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="titleLarge" style={{ fontWeight: "700" }}>
          {t("emergency.title", "Emergency")}
        </Text>
        <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>
          {t("emergency.subtitle", "Offline-ready profile, vet contacts, quick actions.")}
        </Text>
      </View>

      <View style={styles.section}>
        <Text variant="labelMedium" style={{ marginBottom: 8 }}>
          {t("emergency.choosePet", "Choose pet")}
        </Text>
        {PetSelector}
      </View>

      {stale && (
        <Banner
          visible
          icon="cloud-off-outline"
          actions={[
            { label: t("common.refresh", "Refresh"), onPress: () => refresh() },
          ]}
        >
          {t("emergency.stale", "Data older than 24h. Refresh or update manually.")}
        </Banner>
      )}

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <Text variant="titleMedium" style={styles.cardTitle}>
          {t("emergency.healthProfile", "Health profile")}
        </Text>
        <TextInput
          label={t("emergency.allergies", "Allergies")}
          value={form.allergies}
          onChangeText={(text) => handleChange("allergies", text)}
          style={styles.input}
        />
        <TextInput
          label={t("emergency.conditions", "Chronic conditions")}
          value={form.conditions}
          onChangeText={(text) => handleChange("conditions", text)}
          style={styles.input}
        />
        <TextInput
          label={t("emergency.medications", "Medications")}
          value={form.medications}
          onChangeText={(text) => handleChange("medications", text)}
          multiline
          style={styles.input}
        />
        <TextInput
          label={t("emergency.notes", "Notes")}
          value={form.notes}
          onChangeText={(text) => handleChange("notes", text)}
          multiline
          style={styles.input}
        />
      </Card>

      <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={2}>
        <Text variant="titleMedium" style={styles.cardTitle}>
          {t("emergency.vetInfo", "Vet contact")}
        </Text>
        <TextInput
          label={t("emergency.vetName", "Vet name")}
          value={form.vetName}
          onChangeText={(text) => handleChange("vetName", text)}
          style={styles.input}
        />
        <TextInput
          label={t("emergency.vetPhone", "Vet phone")}
          value={form.vetPhone}
          keyboardType="phone-pad"
          onChangeText={(text) => handleChange("vetPhone", text)}
          style={styles.input}
        />
        <TextInput
          label={t("emergency.vetAddress", "Clinic address")}
          value={form.vetAddress}
          onChangeText={(text) => handleChange("vetAddress", text)}
          style={styles.input}
        />
        <View style={styles.actionRow}>
          <Button icon="phone" mode="contained" onPress={callVet} style={styles.actionButton}>
            {t("emergency.callVet", "Call vet")}
          </Button>
          <Button
            icon="map-marker"
            mode="outlined"
            onPress={openLocation}
            style={styles.actionButton}
          >
            {t("emergency.openMaps", "Open maps")}
          </Button>
        </View>
      </Card>

      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving || loading}
        style={styles.saveButton}
      >
        {t("common.save", "Save")}
      </Button>

      <Snackbar
        visible={snackbar.visible}
        message={snackbar.message}
        onDismiss={() => setSnackbar({ visible: false, message: "" })}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  section: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  petChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 12,
    borderRadius: 12,
  },
  cardTitle: {
    marginBottom: 8,
    fontWeight: "700",
  },
  input: {
    marginBottom: 10,
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
  },
  saveButton: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
});
