// Pet Types
export const PET_TYPES = {
  DOG: 'dog',
  CAT: 'cat',
  BIRD: 'bird',
  RABBIT: 'rabbit',
  HAMSTER: 'hamster',
  FISH: 'fish',
  REPTILE: 'reptile',
  OTHER: 'other',
} as const;

export const PET_GENDERS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other',
} as const;

// Health Record Types
export const HEALTH_RECORD_TYPES = {
  VACCINATION: 'vaccination',
  CHECKUP: 'checkup',
  MEDICATION: 'medication',
  SURGERY: 'surgery',
  DENTAL: 'dental',
  GROOMING: 'grooming',
  OTHER: 'other',
} as const;

// Event Types
export const EVENT_TYPES = {
  FEEDING: 'feeding',
  EXERCISE: 'exercise',
  GROOMING: 'grooming',
  PLAY: 'play',
  TRAINING: 'training',
  VET_VISIT: 'vet_visit',
  WALK: 'walk',
  BATH: 'bath',
  OTHER: 'other',
} as const;

// Days of the week
export const DAYS_OF_WEEK = {
  MONDAY: 'monday',
  TUESDAY: 'tuesday',
  WEDNESDAY: 'wednesday',
  THURSDAY: 'thursday',
  FRIDAY: 'friday',
  SATURDAY: 'saturday',
  SUNDAY: 'sunday',
} as const;

// Turkish labels for UI
export const PET_TYPE_LABELS = {
  [PET_TYPES.DOG]: 'Köpek',
  [PET_TYPES.CAT]: 'Kedi',
  [PET_TYPES.BIRD]: 'Kuş',
  [PET_TYPES.RABBIT]: 'Tavşan',
  [PET_TYPES.HAMSTER]: 'Hamster',
  [PET_TYPES.FISH]: 'Balık',
  [PET_TYPES.REPTILE]: 'Sürüngen',
  [PET_TYPES.OTHER]: 'Diğer',
};

export const GENDER_LABELS = {
  [PET_GENDERS.MALE]: 'Erkek',
  [PET_GENDERS.FEMALE]: 'Dişi',
  [PET_GENDERS.OTHER]: 'Diğer',
};

export const HEALTH_RECORD_TYPE_LABELS = {
  [HEALTH_RECORD_TYPES.VACCINATION]: 'Aşı',
  [HEALTH_RECORD_TYPES.CHECKUP]: 'Kontrol',
  [HEALTH_RECORD_TYPES.MEDICATION]: 'İlaç',
  [HEALTH_RECORD_TYPES.SURGERY]: 'Ameliyat',
  [HEALTH_RECORD_TYPES.DENTAL]: 'Diş',
  [HEALTH_RECORD_TYPES.GROOMING]: 'Bakım',
  [HEALTH_RECORD_TYPES.OTHER]: 'Diğer',
};

export const EVENT_TYPE_LABELS = {
  [EVENT_TYPES.FEEDING]: 'Besleme',
  [EVENT_TYPES.EXERCISE]: 'Egzersiz',
  [EVENT_TYPES.GROOMING]: 'Bakım',
  [EVENT_TYPES.PLAY]: 'Oyun',
  [EVENT_TYPES.TRAINING]: 'Eğitim',
  [EVENT_TYPES.VET_VISIT]: 'Veteriner',
  [EVENT_TYPES.WALK]: 'Yürüyüş',
  [EVENT_TYPES.BATH]: 'Banyo',
  [EVENT_TYPES.OTHER]: 'Diğer',
};

export const DAY_LABELS = {
  [DAYS_OF_WEEK.MONDAY]: 'Pazartesi',
  [DAYS_OF_WEEK.TUESDAY]: 'Salı',
  [DAYS_OF_WEEK.WEDNESDAY]: 'Çarşamba',
  [DAYS_OF_WEEK.THURSDAY]: 'Perşembe',
  [DAYS_OF_WEEK.FRIDAY]: 'Cuma',
  [DAYS_OF_WEEK.SATURDAY]: 'Cumartesi',
  [DAYS_OF_WEEK.SUNDAY]: 'Pazar',
};

// Common arrays for dropdowns
export const PET_TYPE_OPTIONS = Object.entries(PET_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const GENDER_OPTIONS = Object.entries(GENDER_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const HEALTH_RECORD_TYPE_OPTIONS = Object.entries(HEALTH_RECORD_TYPE_LABELS).map(
  ([value, label]) => ({
    value,
    label,
  })
);

export const EVENT_TYPE_OPTIONS = Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => ({
  value,
  label,
}));

export const DAY_OPTIONS = Object.entries(DAY_LABELS).map(([value, label]) => ({
  value,
  label,
}));