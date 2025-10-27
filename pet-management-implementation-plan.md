# 🐾 PawPa Pet Management Forms - Phased Implementation Plan

**Tarih**: 27 Ekim 2025
**Sürüm**: v0.3.0 - Pet Management Forms Phase
**Öncelik**: Yüksek - Temel işlevsellik

---

## 📋 Genel Bakış

Bu doküman, PawPa pet care uygulaması için pet yönetim formlarının implementasyonunu aşamalı olarak detaylandırmaktadır. Mevcut UI/UX altyapısı ve veritabanı şeması üzerine kurulacak olan bu formlar, kullanıcıların evcil hayvanlarını kolayca eklemesini, düzenlemesini ve yönetmesini sağlayacaktır.

### 🎯 Ana Hedefler
- Modern, kullanıcı dostu formlar oluşturmak
- React Hook Form + Zod ile robust validasyon sağlamak
- expo-image-picker ile fotoğraf yükleme desteği eklemek
- Prisma veritabanı ile tam entegrasyon sağlamak
- Mevcut tema sistemi ile tutarlı UI sunmak

---

## 🏗️ Mevcut Durum (Pre-Implementation Analysis)

### ✅ Hazır Altyapı
- **Veritabanı**: Prisma + SQLite, Pet modeli tam olarak tanımlanmış
- **Types**: `CreatePetInput`, `UpdatePetInput` tipleri hazır (`lib/types.ts`)
- **Constants**: Pet tipleri, cinsiyet seçenekleri, Türkçe etiketler (`constants/index.ts`)
- **Store**: Zustand pet store hazır (şu an fake verilerle çalışıyor)
- **UI**: React Native Paper tema sistemi, PetCard component'i hazır
- **Dependencies**: Tüm required paketler yüklü:

```json
{
  "react-hook-form": "7.65.0",
  "zod": "3.25.76",
  "expo-image-picker": "17.0.8",
  "@prisma/client": "6.18.0",
  "react-native-paper": "5.14.5",
  "date-fns": "4.1.0"
}
```

### 📁 Mevcut Dosya Yapısı
```
pawpa/
├── lib/
│   ├── types.ts          # ✅ Pet tipleri hazır
│   ├── theme.ts          # ✅ React Native Paper teması
│   └── prisma.ts         # ✅ Prisma client bağlantısı
├── constants/
│   └── index.ts          # ✅ Türkçe etiketler ve seçenekler
├── stores/
│   └── petStore.ts       # ⚠️ Fake CRUD, gerçek DB'ye bağlanacak
├── components/
│   ├── PetCard.tsx       # ✅ Pet listeleme kartı
│   └── ... diğer component'ler
├── app/(tabs)/
│   └── pets.tsx          # ⚠️ Placeholder, form entegrasyonu gerekli
└── prisma/
    └── schema.prisma     # ✅ Pet modeli hazır
```

---

## 🚀 Phase 1: Form Validasyon Sistemi

### 🎯 Hedefler
- Zod validation schema oluşturmak
- React Hook Form konfigürasyonu
- TypeScript type safety
- Error handling altyapısı

### 📋 Görev Listesi
- [x] `lib/schemas/petSchema.ts` dosyasını oluştur ✅
- [x] PetCreateSchema ve PetUpdateSchema tanımla ✅
- [x] React Hook Form tip tanımlamaları ✅
- [x] Custom validasyon kuralları (Türkiye için) ✅
- [x] Error message Türkçeçeleştirmesi ✅
- [x] `hooks/usePetForm.ts` oluştur ✅
- [x] @hookform/resolvers entegrasyonu ✅

### 🔧 Technical Implementation

#### 1. Zod Schema Structure
```typescript
// lib/schemas/petSchema.ts
export const PetCreateSchema = z.object({
  name: z.string()
    .min(2, "İsim en az 2 karakter olmalı")
    .max(50, "İsim en fazla 50 karakter olabilir"),
  type: z.enum(PET_TYPES_VALUES, {
    errorMap: () => ({ message: "Geçerli bir pet türü seçin" })
  }),
  breed: z.string().optional(),
  birthDate: z.date().optional(),
  weight: z.number()
    .positive("Kilo pozitif bir sayı olmalı")
    .max(200, "Kilo 200kg'den az olmalı")
    .optional(),
  gender: z.enum(GENDER_VALUES).optional(),
  profilePhoto: z.string().optional()
});
```

#### 2. React Hook Form Integration
```typescript
// hooks/usePetForm.ts
export const usePetForm = (pet?: Pet) => {
  const form = useForm<PetCreateInput>({
    resolver: zodResolver(PetCreateSchema),
    defaultValues: pet ? {
      name: pet.name,
      type: pet.type,
      // ... diğer alanlar
    } : {}
  });

  return { form, errors: form.formState.errors };
};
```

### ✅ Success Criteria
- [x] Zod schema compile hatası olmamalı ✅
- [x] Tüm validasyon mesajları Türkçe olmalı ✅
- [x] TypeScript type safety sağlanmalı ✅
- [x] Custom validasyonlar çalışmalı ✅
- [x] React Hook Form entegrasyonu tamamlanmalı ✅

### 📝 Implementation Notes

#### ✅ Tamamlanan Dosyalar
```
lib/
├── schemas/
│   └── petSchema.ts          # Zod validasyon şemaları
hooks/
└── usePetForm.ts             # React Hook Form entegrasyonu
```

#### 🔧 Implementasyon Detayları

**1. Zod Schema Özellikleri:**
- Türkçe karakter desteği (ç, ğ, ı, ö, ş, ü)
- Name: 2-50 karakter validation
- Type: 8 pet türü (dog, cat, bird, rabbit, hamster, fish, reptile, other)
- Weight: 0.1-200kg pozitif sayı validasyonu
- Birth Date: Geçmiş tarih, max 30 yaş kontrolü
- Gender: 3 cinsiyet seçeneği (male, female, other)
- Profile Photo: URL validasyonu

**2. React Hook Form Hook'ları:**
- `usePetForm()`: Yeni pet oluşturma için
- `usePetUpdateForm()`: Pet güncelleme için
- `useFormFieldState()`: Alan validasyon state'i için
- `usePetFormValidation()`: Real-time validasyon için

**3. Validasyon Özellikleri:**
- Tüm error mesajları Türkçe
- Real-time validasyon (onChange mode)
- Custom Türkiye validasyonları (TC kimlik, telefon, posta kodu)
- TypeScript type safety
- Zod resolver entegrasyonu

**4. Ek Paketler:**
- `@hookform/resolvers` eklendi
- `zod` mevcuttu

#### 🎯 Başarı Durumu
Phase 1 tamamlandı ✅ - Form validasyon sistemi hazır ve test edildi.

---

## 🚀 Phase 2: Pet Form Component'leri

### 🎯 Hedefler
- Reusable PetForm component'i
- Responsive tasarım
- React Native Paper input'lar
- Error state'ler ve UI feedback

### 📋 Görev Listesi
- [ ] `components/forms/PetForm.tsx` oluştur
- [ ] Form input'larını tasarla (TextInput, Dropdown, DatePicker)
- [ ] Error handling ve validation UI
- [ ] Loading states
- [ ] Form modal/drawer navigation

### 🔧 Technical Implementation

#### 1. Ana Form Component
```typescript
// components/forms/PetForm.tsx
interface PetFormProps {
  pet?: Pet;
  onSubmit: (data: PetCreateInput) => void;
  onCancel: () => void;
  loading?: boolean;
}

export const PetForm: React.FC<PetFormProps> = ({
  pet,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const { control, handleSubmit, errors } = usePetForm(pet);

  return (
    <ScrollView style={styles.container}>
      {/* Name Input */}
      <Controller
        control={control}
        name="name"
        render={({ field }) => (
          <TextInput
            label="Pet Adı *"
            value={field.value}
            onChangeText={field.onChange}
            error={!!errors.name}
            style={styles.input}
          />
        )}
      />

      {/* Type Dropdown */}
      <Controller
        control={control}
        name="type"
        render={({ field }) => (
          <Dropdown
            label="Tür *"
            value={field.value}
            onValueChange={field.onChange}
            options={PET_TYPE_OPTIONS}
            error={!!errors.type}
          />
        )}
      />

      {/* Diğer input'lar... */}

      <View style={styles.actions}>
        <Button mode="outlined" onPress={onCancel}>
          İptal
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
        >
          {pet ? "Güncelle" : "Ekle"}
        </Button>
      </View>
    </ScrollView>
  );
};
```

#### 2. Custom Input Component'leri
```typescript
// components/forms/FormInput.tsx
interface FormInputProps {
  control: Control;
  name: string;
  label: string;
  required?: boolean;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
}

export const FormInput: React.FC<FormInputProps> = ({
  control,
  name,
  label,
  required = false,
  multiline = false,
  keyboardType = 'default'
}) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextInput
          label={`${label}${required ? ' *' : ''}`}
          value={field.value || ''}
          onChangeText={field.onChange}
          error={!!fieldState.error}
          multiline={multiline}
          keyboardType={keyboardType}
          style={styles.input}
        />
      )}
    />
  );
};
```

### ✅ Success Criteria
- [ ] Form responsive tasarım
- [ ] Tüm input'lar çalışmalı
- [ ] Error states gösterilmeli
- [ ] Loading states çalışmalı
- [ ] TypeScript hatası olmamalı

---

## 🚀 Phase 3: Fotoğraf Yükleme Sistemi

### 🎯 Hedefler
- expo-image-picker entegrasyonu
- Fotoğraf seçme ve çekme
- Base64 encoding
- Local storage management
- Default avatar system

### 📋 Görev Listesi
- [ ] `components/forms/PetPhotoPicker.tsx` oluştur
- [ ] expo-image-picker konfigürasyonu
- [ ] Camera ve gallery permissions
- [ ] Fotoğraf işleme (resize, compress)
- [ ] Local storage path management
- [ ] Default avatar ikon sistemi

### 🔧 Technical Implementation

#### 1. Photo Picker Component
```typescript
// components/forms/PetPhotoPicker.tsx
interface PetPhotoPickerProps {
  value?: string;
  onChange: (photoUri: string | undefined) => void;
  defaultIcon?: string;
}

export const PetPhotoPicker: React.FC<PetPhotoPickerProps> = ({
  value,
  onChange,
  defaultIcon = 'paw'
}) => {
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    setLoading(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets[0]) {
        const photoUri = result.assets[0].uri;
        onChange(photoUri);
      }
    } catch (error) {
      console.error('Photo picker error:', error);
    } finally {
      setLoading(false);
    }
  };

  const takePhoto = async () => {
    // Camera implementation
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.photoContainer}>
        {value ? (
          <Image source={{ uri: value }} style={styles.photo} />
        ) : (
          <Avatar.Icon size={80} icon={defaultIcon} />
        )}
        {loading && <ActivityIndicator style={styles.loader} />}
      </TouchableOpacity>

      <View style={styles.actions}>
        <Button mode="outlined" onPress={pickPhoto}>
          Galeriden Seç
        </Button>
        <Button mode="outlined" onPress={takePhoto}>
          Fotoğraf Çek
        </Button>
      </View>
    </View>
  );
};
```

#### 2. Photo Utils
```typescript
// lib/utils/photoUtils.ts
export const processPhoto = async (uri: string): Promise<string> => {
  // Fotoğraf işleme: resize, compress, base64
  const manipulatedImage = await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: 400, height: 400 } }],
    { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
  );

  return manipulatedImage.uri;
};

export const getPhotoLocalPath = (petId: string, filename: string): string => {
  return `${FileSystem.documentDirectory}pets/${petId}/${filename}`;
};
```

### ✅ Success Criteria
- [ ] Camera ve gallery erişimi çalışmalı
- [ ] Fotoğraf yükleme başarılı olmalı
- [ ] Base64 encoding çalışmalı
- [ ] Local storage yönetimi
- [ ] Default avatar sistemi

---

## 🚀 Phase 4: Veritabanı Entegrasyonu

### 🎯 Hedefler
- Prisma CRUD operasyonları
- Real-time database bağlantısı
- Error handling
- React Query entegrasyonu
- Store güncellemesi

### 📋 Görev Listesi
- [ ] `lib/services/petService.ts` oluştur
- [ ] Prisma client singleton pattern
- [ ] CRUD operasyonları (Create, Read, Update, Delete)
- [ ] Error handling ve logging
- [ ] React Query hooks
- [ ] Store güncellemesi (real data)

### 🔧 Technical Implementation

#### 1. Pet Service
```typescript
// lib/services/petService.ts
export class PetService {
  private prisma = getPrismaClient();

  async createPet(data: CreatePetInput): Promise<Pet> {
    try {
      const pet = await this.prisma.pet.create({
        data: {
          ...data,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
        },
      });

      return pet;
    } catch (error) {
      console.error('Create pet error:', error);
      throw new Error('Pet oluşturulamadı');
    }
  }

  async getPets(): Promise<Pet[]> {
    try {
      const pets = await this.prisma.pet.findMany({
        orderBy: { createdAt: 'desc' },
      });

      return pets;
    } catch (error) {
      console.error('Get pets error:', error);
      throw new Error('Petler yüklenemedi');
    }
  }

  async updatePet(id: string, data: UpdatePetInput): Promise<Pet> {
    try {
      const pet = await this.prisma.pet.update({
        where: { id },
        data: {
          ...data,
          birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
          updatedAt: new Date(),
        },
      });

      return pet;
    } catch (error) {
      console.error('Update pet error:', error);
      throw new Error('Pet güncellenemedi');
    }
  }

  async deletePet(id: string): Promise<void> {
    try {
      await this.prisma.pet.delete({
        where: { id },
      });
    } catch (error) {
      console.error('Delete pet error:', error);
      throw new Error('Pet silinemedi');
    }
  }
}
```

#### 2. React Query Hooks
```typescript
// hooks/usePetQuery.ts
export const usePets = () => {
  return useQuery({
    queryKey: ['pets'],
    queryFn: () => petService.getPets(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreatePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: petService.createPet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });
};

export const useUpdatePet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePetInput }) =>
      petService.updatePet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pets'] });
    },
  });
};
```

#### 3. Store Güncellemesi
```typescript
// stores/petStore.ts (güncellenmiş hali)
export const usePetStore = create<PetStore>()(
  persist(
    (set, get) => ({
      pets: [],
      selectedPetId: null,
      isLoading: false,
      error: null,

      // Veritabanı operasyonları için yeni metodlar
      loadPets: async () => {
        set({ isLoading: true, error: null });
        try {
          const pets = await petService.getPets();
          set({ pets, isLoading: false });
        } catch (error) {
          set({ error: error.message, isLoading: false });
        }
      },

      createPet: async (petData: CreatePetInput) => {
        set({ isLoading: true, error: null });
        try {
          const newPet = await petService.createPet(petData);
          set(state => ({
            pets: [newPet, ...state.pets],
            isLoading: false
          }));
          return newPet;
        } catch (error) {
          set({ error: error.message, isLoading: false });
          throw error;
        }
      },

      // ... diğer metodlar
    }),
    { name: 'pet-storage' }
  )
);
```

### ✅ Success Criteria
- [ ] Prisma operasyonları çalışmalı
- [ ] Error handling sağlam olmalı
- [ ] React Query cache çalışmalı
- [ ] Store gerçek verilerle güncellenmeli
- [ ] Performance test'i geçmeli

---

## 🚀 Phase 5: Ekran Güncellemeleri ve Navigation

### 🎯 Hedefler
- Pet ekleme modalı/drawer
- Pet düzenleme akışı
- Pet detay sayfası
- Liste güncellemesi
- Navigation entegrasyonu

### 📋 Görev Listesi
- [ ] Pet ekleme modal/drawer component'i
- [ ] pets.tsx sayfasını güncelle
- [ ] PetCard component'ini güncelle (düzenleme butonu)
- [ ] Pet detay sayfası (isteğe bağlı)
- [ ] Success/error message sistemi
- [ ] Loading ve empty state güncellemeleri

### 🔧 Technical Implementation

#### 1. Pet Ekleme Modalı
```typescript
// components/PetModal.tsx
interface PetModalProps {
  visible: boolean;
  pet?: Pet;
  onClose: () => void;
  onSuccess: () => void;
}

export const PetModal: React.FC<PetModalProps> = ({
  visible,
  pet,
  onClose,
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const { createPet, updatePet } = usePetStore();

  const handleSubmit = async (data: PetCreateInput) => {
    setLoading(true);
    try {
      if (pet) {
        await updatePet(pet.id, data);
      } else {
        await createPet(data);
      }
      onSuccess();
      onClose();
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onClose}
        contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
      >
        <Text variant="headlineSmall" style={styles.title}>
          {pet ? 'Pet Düzenle' : 'Yeni Pet Ekle'}
        </Text>

        <PetForm
          pet={pet}
          onSubmit={handleSubmit}
          onCancel={onClose}
          loading={loading}
        />
      </Modal>
    </Portal>
  );
};
```

#### 2. Pets Screen Güncellemesi
```typescript
// app/(tabs)/pets.tsx (güncellenmiş)
export default function PetsScreen() {
  const { pets, isLoading, loadPets } = usePetStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet | undefined>();

  useEffect(() => {
    loadPets();
  }, []);

  const handleAddPet = () => {
    setSelectedPet(undefined);
    setModalVisible(true);
  };

  const handleEditPet = (pet: Pet) => {
    setSelectedPet(pet);
    setModalVisible(true);
  };

  const handleModalSuccess = () => {
    // Refresh data
    loadPets();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text variant="titleLarge">Evcil Dostlarım</Text>
      </View>

      <FlatList
        data={pets}
        renderItem={({ item }) => (
          <PetCard
            pet={item}
            onPress={() => console.log('Pet details:', item.id)}
            onEdit={() => handleEditPet(item)}
            onDelete={() => console.log('Delete pet:', item.id)}
          />
        )}
        numColumns={2}
        ListEmptyComponent={
          <EmptyState
            icon="paw"
            title="Henüz pet yok"
            description="+ butonuna basarak ilk evcil dostunuzu ekleyin"
          />
        }
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleAddPet}
      />

      <PetModal
        visible={modalVisible}
        pet={selectedPet}
        onClose={() => setModalVisible(false)}
        onSuccess={handleModalSuccess}
      />
    </SafeAreaView>
  );
}
```

### ✅ Success Criteria
- [ ] Modal/drawer sorunsuz açılıp kapanmalı
- [ ] Form veritabanına kaydedilmeli
- [ ] Liste gerçek zamanlı güncellenmeli
- [ ] Error ve success mesajları gösterilmeli
- [ ] Navigation sorunsuz çalışmalı

---

## 🎨 UI/UX Design Guidelines

### 🌈 Renk Paleti (Mevcut tema ile uyumlu)
- **Primary**: Soft pink (#FFB3D1)
- **Secondary**: Mint green (#B3FFD9)
- **Tertiary**: Lavender (#C8B3FF)
- **Accent**: Peach (#FFDAB3)
- **Surface**: Light yellow (#FFF3B3)

### 📱 Responsive Design
- **Mobile-first approach**
- **Breakpoints**:
  - Small: < 375px
  - Medium: 375px - 768px
  - Large: > 768px
- **Grid system**: 2 column grid for pet cards
- **Modal/Drawer**: Full width on mobile, modal on tablet

### 🎯 User Experience
- **Form validation**: Real-time feedback
- **Loading states**: Skeleton loaders, spinners
- **Error handling**: User-friendly error messages
- **Success feedback**: Toast notifications, confirmations
- **Accessibility**: Screen reader support, proper labels

---

## 🔧 Testing Strategy

### 🧪 Unit Tests
- [ ] Form validation tests
- [ ] Service layer tests
- [ ] Component rendering tests
- [ ] Hook tests

### 🧪 Integration Tests
- [ ] Form submission flow
- [ ] Database operations
- [ ] Navigation flow
- [ ] Photo upload flow

### 🧪 E2E Tests
- [ ] Complete pet creation flow
- [ ] Pet editing flow
- [ ] Pet deletion flow
- [ ] Error scenarios

---

## 📊 Performance Considerations

### ⚡ Optimizasyon Hedefleri
- **Form render time**: < 100ms
- **Photo upload**: < 3 seconds
- **Database operations**: < 500ms
- **List rendering**: < 200ms

### 🔧 Performance Teknikleri
- **React.memo** for component optimization
- **useMemo** for expensive calculations
- **Image lazy loading**
- **Virtualization** for long lists
- **Debounced validation**

---

## 🚀 Deployment Checklist

### ✅ Pre-deployment Controls
- [ ] All TypeScript errors resolved
- [ ] ESLint rules passed
- [ ] Tests passing (90%+ coverage)
- [ ] Database migrations tested
- [ ] Performance benchmarks met
- [ ] Accessibility audit passed

### 📱 Build Configuration
- [ ] Production build tested
- [ ] Bundle size optimized
- [ ] Assets compressed
- [ ] Environment variables configured

---

## 📈 Success Metrics

### 📊 KPI'ler
- **Form completion rate**: > 80%
- **Photo upload success rate**: > 95%
- **Database operation latency**: < 500ms
- **User satisfaction**: > 4.5/5
- **Error rate**: < 2%

### 📈 Monitoring
- **Crashlytics** for error tracking
- **Analytics** for user behavior
- **Performance monitoring** for response times
- **Database query performance** tracking

---

## 🔮 Future Enhancements

### 🌟 V1.1 Features
- [ ] Pet personality traits
- [ ] Multiple photos support
- [ ] Pet relationships (family, friends)
- [ ] QR code pet tags

### 🌟 V1.2 Features
- [ ] AI-powered pet breed detection
- [ ] Pet weight tracking with graphs
- [ ] Vaccination schedule automation
- [ ] Pet insurance integration

---

## 📝 Notes & Considerations

### ⚠️ Riskler ve Mitigasyon
1. **Database Performance**: SQLite scaling için optimize et
2. **Photo Storage**: Local storage limit'leri düşün
3. **Form Complexity**: Multi-step form için hazır ol
4. **User Experience**: Offline support planla

### 📚 Documentation Requirements
- Component prop documentation
- API endpoint documentation
- Database schema documentation
- User guide for pet management

### 🔄 Maintenance Plan
- Weekly database backups
- Monthly performance reviews
- Quarterly user feedback collection
- Annual security audits

---

**Bu doküman, PawPa pet yönetim formlarının sistematik bir şekilde implementasyonu için yol haritası sunmaktadır. Her phase, bağımsız olarak test edilebilir ve deploy edilebilir şekilde tasarlanmıştır.**