/**
 * Unified Services Module
 *
 * Bu modül, PawPa uygulamasının tüm API operasyonlarını tek bir yerden yönetir.
 * Pet, sağlık kaydı, olay ve besleme programı servislerini içerir.
 *
 * Tüm servisler benzer yapıya sahiptir:
 * - try-catch blokları ile hata yönetimi
 * - ApiResponse formatında dönüşler
 * - Konsol logları ile takip
 * - ApiError instance kontrolü
 */

import { api, ApiError } from './api/client';
import { ENV } from './config/env';
import type {
  Pet,
  CreatePetInput,
  UpdatePetInput,
  HealthRecord,
  CreateHealthRecordInput,
  UpdateHealthRecordInput,
  Event,
  CreateEventInput,
  UpdateEventInput,
  FeedingSchedule,
  CreateFeedingScheduleInput,
  UpdateFeedingScheduleInput,
  ApiResponse
} from './types';

// ============================================================================
// PET SERVICE
// ============================================================================

/**
 * Pet Service - Tüm pet API operasyonlarını yönetir
 * CRUD operasyonları, arama, fotoğraf yükleme ve istatistikler
 */
export class PetService {
  /**
   * Yeni pet oluşturur
   */
  async createPet(data: CreatePetInput): Promise<ApiResponse<Pet>> {
    try {
      const response = await api.post<Pet>(ENV.ENDPOINTS.PETS, {
        ...data,
        birthDate: data.birthDate || null,
      });

      console.log('✅ Pet created successfully:', response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: 'Pet başarıyla oluşturuldu',
      };
    } catch (error) {
      console.error('❌ Create pet error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Pet oluşturulamadı. Lütfen bilgileri kontrol edip tekrar deneyin.',
      };
    }
  }

  /**
   * Tüm petleri listeler (en yeni başa)
   */
  async getPets(): Promise<ApiResponse<Pet[]>> {
    try {
      const response = await api.get<Pet[]>(ENV.ENDPOINTS.PETS);

      console.log(`✅ ${response.data?.length || 0} pets loaded successfully`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} pet başarıyla yüklendi`,
      };
    } catch (error) {
      console.error('❌ Get pets error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Petler yüklenemedi. Lütfen internet bağlantınızı kontrol edin.',
      };
    }
  }

  /**
   * ID'ye göre tek bir pet getirir
   */
  async getPetById(id: string): Promise<ApiResponse<Pet>> {
    try {
      const response = await api.get<Pet>(ENV.ENDPOINTS.PET_BY_ID(id));

      console.log('✅ Pet loaded successfully:', response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: 'Pet başarıyla yüklendi',
      };
    } catch (error) {
      console.error('❌ Get pet error:', error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: 'Pet bulunamadı',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Pet yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Pet bilgilerini günceller
   */
  async updatePet(id: string, data: UpdatePetInput): Promise<ApiResponse<Pet>> {
    try {
      const updateData = {
        ...data,
        birthDate: data.birthDate || undefined,
      };

      const response = await api.put<Pet>(ENV.ENDPOINTS.PET_BY_ID(id), updateData);

      console.log('✅ Pet updated successfully:', response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: 'Pet başarıyla güncellendi',
      };
    } catch (error) {
      console.error('❌ Update pet error:', error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: 'Güncellenecek pet bulunamadı',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Pet güncellenemedi. Lütfen bilgileri kontrol edip tekrar deneyin.',
      };
    }
  }

  /**
   * Pet siler
   */
  async deletePet(id: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(ENV.ENDPOINTS.PET_BY_ID(id));

      console.log('✅ Pet deleted successfully:', id);
      return {
        success: true,
        message: 'Pet başarıyla silindi',
      };
    } catch (error) {
      console.error('❌ Delete pet error:', error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: 'Silinecek pet bulunamadı',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Pet silinemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Petleri türe göre filtreler
   */
  async getPetsByType(type: string): Promise<ApiResponse<Pet[]>> {
    try {
      const response = await api.get<Pet[]>(ENV.ENDPOINTS.PETS, { type });

      console.log(`✅ ${response.data?.length || 0} pets of type ${type} loaded successfully`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} adet ${type} türünde pet bulundu`,
      };
    } catch (error) {
      console.error('❌ Get pets by type error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Petler yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Pet arama (isime göre)
   */
  async searchPets(query: string): Promise<ApiResponse<Pet[]>> {
    try {
      const response = await api.get<Pet[]>(ENV.ENDPOINTS.PETS, { search: query });

      console.log(`✅ ${response.data?.length || 0} pets found for query: ${query}`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} pet bulundu`,
      };
    } catch (error) {
      console.error('❌ Search pets error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Arama yapılırken hata oluştu. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Pet fotoğrafı yükler
   */
  async uploadPetPhoto(id: string, photoUri: string): Promise<ApiResponse<Pet>> {
    try {
      const formData = new FormData();
      formData.append('photo', {
        uri: photoUri,
        type: 'image/jpeg',
        name: 'pet-photo.jpg',
      } as any);

      const response = await api.upload<Pet>(ENV.ENDPOINTS.PET_PHOTO(id), formData);

      console.log('✅ Pet photo uploaded successfully:', response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: 'Pet fotoğrafı başarıyla yüklendi',
      };
    } catch (error) {
      console.error('❌ Upload pet photo error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Pet fotoğrafı yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Pet istatistiklerini getirir
   */
  async getPetStats(): Promise<ApiResponse<{
    total: number;
    byType: Record<string, number>;
    byGender: Record<string, number>;
    averageAge: number;
  }>> {
    try {
      // Backend'de bu endpoint olabilir ya da tüm petleri çekip hesaplayabiliriz
      const allPetsResponse = await api.get<Pet[]>(ENV.ENDPOINTS.PETS);
      const allPets = allPetsResponse.data || [];

      const byType: Record<string, number> = {};
      const byGender: Record<string, number> = {};
      let totalAge = 0;

      allPets.forEach(pet => {
        // Tür sayımı
        byType[pet.type] = (byType[pet.type] || 0) + 1;

        // Cinsiyet sayımı
        if (pet.gender) {
          byGender[pet.gender] = (byGender[pet.gender] || 0) + 1;
        }

        // Yaş hesaplama
        if (pet.birthDate) {
          const birthDate = new Date(pet.birthDate);
          const now = new Date();
          const ageInYears = (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
          totalAge += ageInYears;
        }
      });

      const averageAge = allPets.length > 0 ? totalAge / allPets.length : 0;

      console.log('✅ Pet stats calculated successfully');
      return {
        success: true,
        data: {
          total: allPets.length,
          byType,
          byGender,
          averageAge: Math.round(averageAge * 10) / 10, // 1 decimal basamak
        },
        message: 'Pet istatistikleri başarıyla hesaplandı',
      };
    } catch (error) {
      console.error('❌ Get pet stats error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'İstatistikler yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }
}

// ============================================================================
// HEALTH RECORD SERVICE
// ============================================================================

/**
 * Health Record Service - Tüm sağlık kayıtları API operasyonlarını yönetir
 * CRUD operasyonları, aşı kayıtları ve yaklaşan randevular
 */
export class HealthRecordService {
  /**
   * Yeni sağlık kaydı oluşturur
   */
  async createHealthRecord(data: CreateHealthRecordInput): Promise<ApiResponse<HealthRecord>> {
    try {
      const recordData = {
        ...data,
        date: data.date,
        nextDueDate: data.nextDueDate || null,
      };

      const response = await api.post<HealthRecord>(ENV.ENDPOINTS.HEALTH_RECORDS, recordData);

      console.log('✅ Health record created successfully:', response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: 'Sağlık kaydı başarıyla oluşturuldu',
      };
    } catch (error) {
      console.error('❌ Create health record error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Sağlık kaydı oluşturulamadı. Lütfen bilgileri kontrol edip tekrar deneyin.',
      };
    }
  }

  /**
   * Pet'e ait tüm sağlık kayıtlarını listeler
   */
  async getHealthRecordsByPetId(petId: string): Promise<ApiResponse<HealthRecord[]>> {
    try {
      const response = await api.get<HealthRecord[]>(ENV.ENDPOINTS.HEALTH_RECORDS_BY_PET(petId));

      console.log(`✅ ${response.data?.length || 0} health records loaded successfully`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} sağlık kaydı başarıyla yüklendi`,
      };
    } catch (error) {
      console.error('❌ Get health records error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Sağlık kayıtları yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * ID'ye göre tek bir sağlık kaydı getirir
   */
  async getHealthRecordById(id: string): Promise<ApiResponse<HealthRecord>> {
    try {
      const response = await api.get<HealthRecord>(ENV.ENDPOINTS.HEALTH_RECORD_BY_ID(id));

      console.log('✅ Health record loaded successfully:', response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: 'Sağlık kaydı başarıyla yüklendi',
      };
    } catch (error) {
      console.error('❌ Get health record error:', error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: 'Sağlık kaydı bulunamadı',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Sağlık kaydı yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Sağlık kaydı günceller
   */
  async updateHealthRecord(id: string, data: UpdateHealthRecordInput): Promise<ApiResponse<HealthRecord>> {
    try {
      const updateData = {
        ...data,
        date: data.date || undefined,
        nextDueDate: data.nextDueDate || undefined,
      };

      const response = await api.put<HealthRecord>(ENV.ENDPOINTS.HEALTH_RECORD_BY_ID(id), updateData);

      console.log('✅ Health record updated successfully:', response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: 'Sağlık kaydı başarıyla güncellendi',
      };
    } catch (error) {
      console.error('❌ Update health record error:', error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: 'Güncellenecek sağlık kaydı bulunamadı',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Sağlık kaydı güncellenemedi. Lütfen bilgileri kontrol edip tekrar deneyin.',
      };
    }
  }

  /**
   * Sağlık kaydı siler
   */
  async deleteHealthRecord(id: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(ENV.ENDPOINTS.HEALTH_RECORD_BY_ID(id));

      console.log('✅ Health record deleted successfully:', id);
      return {
        success: true,
        message: 'Sağlık kaydı başarıyla silindi',
      };
    } catch (error) {
      console.error('❌ Delete health record error:', error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: 'Silinecek sağlık kaydı bulunamadı',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Sağlık kaydı silinemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Pet'e ait aşı kayıtlarını getirir
   */
  async getVaccinations(petId: string): Promise<ApiResponse<HealthRecord[]>> {
    try {
      const response = await api.get<HealthRecord[]>(ENV.ENDPOINTS.HEALTH_RECORDS_BY_PET(petId), { type: 'vaccination' });

      console.log(`✅ ${response.data?.length || 0} vaccinations loaded successfully`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} aşı kaydı bulundu`,
      };
    } catch (error) {
      console.error('❌ Get vaccinations error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Aşı kayıtları yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Yaklaşan randevuları/aşları getirir
   */
  async getUpcomingRecords(): Promise<ApiResponse<HealthRecord[]>> {
    try {
      const response = await api.get<HealthRecord[]>(ENV.ENDPOINTS.UPCOMING_VACCINATIONS);

      console.log(`✅ ${response.data?.length || 0} upcoming records loaded successfully`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} yaklaşan kayıt bulundu`,
      };
    } catch (error) {
      console.error('❌ Get upcoming records error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Yaklaşan kayıtlar yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Türe göre sağlık kayıtlarını filtreler
   */
  async getHealthRecordsByType(petId: string, type: string): Promise<ApiResponse<HealthRecord[]>> {
    try {
      const response = await api.get<HealthRecord[]>(ENV.ENDPOINTS.HEALTH_RECORDS_BY_PET(petId), { type });

      console.log(`✅ ${response.data?.length || 0} ${type} records loaded successfully`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} adet ${type} kaydı bulundu`,
      };
    } catch (error) {
      console.error('❌ Get health records by type error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Sağlık kayıtları yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }
}

// ============================================================================
// EVENT SERVICE
// ============================================================================

/**
 * Event Service - Tüm olay ve aktivite API operasyonlarını yönetir
 * CRUD operasyonları, takvim görünümleri ve zaman filtreleme
 */
export class EventService {
  /**
   * Yeni olay oluşturur
   */
  async createEvent(data: CreateEventInput): Promise<ApiResponse<Event>> {
    try {
      const eventData = {
        ...data,
        startTime: data.startTime,
        endTime: data.endTime || null,
        reminder: data.reminder || false,
      };

      const response = await api.post<Event>(ENV.ENDPOINTS.EVENTS, eventData);

      console.log('✅ Event created successfully:', response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: 'Olay başarıyla oluşturuldu',
      };
    } catch (error) {
      console.error('❌ Create event error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Olay oluşturulamadı. Lütfen bilgileri kontrol edip tekrar deneyin.',
      };
    }
  }

  /**
   * Pet'e ait tüm olayları listeler
   */
  async getEventsByPetId(petId: string): Promise<ApiResponse<Event[]>> {
    try {
      const response = await api.get<Event[]>(ENV.ENDPOINTS.EVENTS_BY_PET(petId));

      console.log(`✅ ${response.data?.length || 0} events loaded successfully`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} olay başarıyla yüklendi`,
      };
    } catch (error) {
      console.error('❌ Get events error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Olaylar yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * ID'ye göre tek bir olay getirir
   */
  async getEventById(id: string): Promise<ApiResponse<Event>> {
    try {
      const response = await api.get<Event>(ENV.ENDPOINTS.EVENT_BY_ID(id));

      console.log('✅ Event loaded successfully:', response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: 'Olay başarıyla yüklendi',
      };
    } catch (error) {
      console.error('❌ Get event error:', error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: 'Olay bulunamadı',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Olay yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Olay günceller
   */
  async updateEvent(id: string, data: UpdateEventInput): Promise<ApiResponse<Event>> {
    try {
      const updateData = {
        ...data,
        startTime: data.startTime || undefined,
        endTime: data.endTime || undefined,
      };

      const response = await api.put<Event>(ENV.ENDPOINTS.EVENT_BY_ID(id), updateData);

      console.log('✅ Event updated successfully:', response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: 'Olay başarıyla güncellendi',
      };
    } catch (error) {
      console.error('❌ Update event error:', error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: 'Güncellenecek olay bulunamadı',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Olay güncellenemedi. Lütfen bilgileri kontrol edip tekrar deneyin.',
      };
    }
  }

  /**
   * Olay siler
   */
  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(ENV.ENDPOINTS.EVENT_BY_ID(id));

      console.log('✅ Event deleted successfully:', id);
      return {
        success: true,
        message: 'Olay başarıyla silindi',
      };
    } catch (error) {
      console.error('❌ Delete event error:', error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: 'Silinecek olay bulunamadı',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Olay silinemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Belirli bir tarihteki olayları getirir
   */
  async getEventsByDate(date: string): Promise<ApiResponse<Event[]>> {
    try {
      const response = await api.get<Event[]>(ENV.ENDPOINTS.EVENTS_BY_DATE(date));

      console.log(`✅ ${response.data?.length || 0} events for ${date} loaded successfully`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} olay bulundu`,
      };
    } catch (error) {
      console.error('❌ Get events by date error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Olaylar yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Yaklaşan olayları getirir
   */
  async getUpcomingEvents(): Promise<ApiResponse<Event[]>> {
    try {
      const response = await api.get<Event[]>(ENV.ENDPOINTS.UPCOMING_EVENTS);

      console.log(`✅ ${response.data?.length || 0} upcoming events loaded successfully`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} yaklaşan olay bulundu`,
      };
    } catch (error) {
      console.error('❌ Get upcoming events error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Yaklaşan olaylar yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Bugünkü olayları getirir
   */
  async getTodayEvents(): Promise<ApiResponse<Event[]>> {
    try {
      const response = await api.get<Event[]>(ENV.ENDPOINTS.TODAY_EVENTS);

      console.log(`✅ ${response.data?.length || 0} today's events loaded successfully`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} bugünkü olay bulundu`,
      };
    } catch (error) {
      console.error('❌ Get today events error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Bugünkü olaylar yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Türüne göre olayları filtreler
   */
  async getEventsByType(petId: string, type: string): Promise<ApiResponse<Event[]>> {
    try {
      const response = await api.get<Event[]>(ENV.ENDPOINTS.EVENTS_BY_PET(petId), { type });

      console.log(`✅ ${response.data?.length || 0} ${type} events loaded successfully`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} adet ${type} olayı bulundu`,
      };
    } catch (error) {
      console.error('❌ Get events by type error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Olaylar yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }
}

// ============================================================================
// FEEDING SCHEDULE SERVICE
// ============================================================================

/**
 * Feeding Schedule Service - Tüm besleme programı API operasyonlarını yönetir
 * CRUD operasyonları, zamanlama kontrolleri ve aktif/pasif yönetimi
 */
export class FeedingScheduleService {
  /**
   * Yeni besleme programı oluşturur
   */
  async createFeedingSchedule(data: CreateFeedingScheduleInput): Promise<ApiResponse<FeedingSchedule>> {
    try {
      const scheduleData = {
        ...data,
        isActive: data.isActive !== undefined ? data.isActive : true,
      };

      const response = await api.post<FeedingSchedule>(ENV.ENDPOINTS.FEEDING_SCHEDULES, scheduleData);

      console.log('✅ Feeding schedule created successfully:', response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: 'Besleme programı başarıyla oluşturuldu',
      };
    } catch (error) {
      console.error('❌ Create feeding schedule error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Besleme programı oluşturulamadı. Lütfen bilgileri kontrol edip tekrar deneyin.',
      };
    }
  }

  /**
   * Pet'e ait tüm besleme programlarını listeler
   */
  async getFeedingSchedulesByPetId(petId: string): Promise<ApiResponse<FeedingSchedule[]>> {
    try {
      const response = await api.get<FeedingSchedule[]>(ENV.ENDPOINTS.FEEDING_SCHEDULES_BY_PET(petId));

      console.log(`✅ ${response.data?.length || 0} feeding schedules loaded successfully`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} besleme programı başarıyla yüklendi`,
      };
    } catch (error) {
      console.error('❌ Get feeding schedules error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Besleme programları yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * ID'ye göre tek bir besleme programı getirir
   */
  async getFeedingScheduleById(id: string): Promise<ApiResponse<FeedingSchedule>> {
    try {
      const response = await api.get<FeedingSchedule>(ENV.ENDPOINTS.FEEDING_SCHEDULE_BY_ID(id));

      console.log('✅ Feeding schedule loaded successfully:', response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: 'Besleme programı başarıyla yüklendi',
      };
    } catch (error) {
      console.error('❌ Get feeding schedule error:', error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: 'Besleme programı bulunamadı',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Besleme programı yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Besleme programı günceller
   */
  async updateFeedingSchedule(id: string, data: UpdateFeedingScheduleInput): Promise<ApiResponse<FeedingSchedule>> {
    try {
      const response = await api.put<FeedingSchedule>(ENV.ENDPOINTS.FEEDING_SCHEDULE_BY_ID(id), data);

      console.log('✅ Feeding schedule updated successfully:', response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: 'Besleme programı başarıyla güncellendi',
      };
    } catch (error) {
      console.error('❌ Update feeding schedule error:', error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: 'Güncellenecek besleme programı bulunamadı',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Besleme programı güncellenemedi. Lütfen bilgileri kontrol edip tekrar deneyin.',
      };
    }
  }

  /**
   * Besleme programı siler
   */
  async deleteFeedingSchedule(id: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(ENV.ENDPOINTS.FEEDING_SCHEDULE_BY_ID(id));

      console.log('✅ Feeding schedule deleted successfully:', id);
      return {
        success: true,
        message: 'Besleme programı başarıyla silindi',
      };
    } catch (error) {
      console.error('❌ Delete feeding schedule error:', error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: 'Silinecek besleme programı bulunamadı',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Besleme programı silinemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Aktif besleme programlarını getirir
   */
  async getActiveFeedingSchedules(): Promise<ApiResponse<FeedingSchedule[]>> {
    try {
      const response = await api.get<FeedingSchedule[]>(ENV.ENDPOINTS.ACTIVE_FEEDING_SCHEDULES);

      console.log(`✅ ${response.data?.length || 0} active feeding schedules loaded successfully`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} aktif besleme programı bulundu`,
      };
    } catch (error) {
      console.error('❌ Get active feeding schedules error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Aktif besleme programları yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Bugünkü besleme programlarını getirir
   */
  async getTodayFeedingSchedules(): Promise<ApiResponse<FeedingSchedule[]>> {
    try {
      const response = await api.get<FeedingSchedule[]>(ENV.ENDPOINTS.TODAY_FEEDING_SCHEDULES);

      console.log(`✅ ${response.data?.length || 0} today's feeding schedules loaded successfully`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} bugünkü besleme programı bulundu`,
      };
    } catch (error) {
      console.error('❌ Get today feeding schedules error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Bugünkü besleme programları yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Sonraki besleme zamanını getirir
   */
  async getNextFeeding(): Promise<ApiResponse<FeedingSchedule[]>> {
    try {
      const response = await api.get<FeedingSchedule[]>(ENV.ENDPOINTS.NEXT_FEEDING);

      console.log(`✅ Next feeding schedule loaded successfully`);
      return {
        success: true,
        data: response.data || [],
        message: 'Sonraki besleme zamanı başarıyla getirildi',
      };
    } catch (error) {
      console.error('❌ Get next feeding error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Sonraki besleme zamanı yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Besleme programını aktif/pasif hale getirir
   */
  async toggleFeedingSchedule(id: string, isActive: boolean): Promise<ApiResponse<FeedingSchedule>> {
    try {
      const response = await api.put<FeedingSchedule>(ENV.ENDPOINTS.FEEDING_SCHEDULE_BY_ID(id), { isActive });

      console.log(`✅ Feeding schedule ${isActive ? 'activated' : 'deactivated'} successfully:`, response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: `Besleme programı başarıyla ${isActive ? 'aktifleştirildi' : 'pasifleştirildi'}`,
      };
    } catch (error) {
      console.error('❌ Toggle feeding schedule error:', error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: 'Besleme programı bulunamadı',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Besleme programı durumu değiştirilemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Pet'e ait aktif besleme programlarını getirir
   */
  async getActiveFeedingSchedulesByPet(petId: string): Promise<ApiResponse<FeedingSchedule[]>> {
    try {
      const response = await api.get<FeedingSchedule[]>(ENV.ENDPOINTS.FEEDING_SCHEDULES_BY_PET(petId), { isActive: true });

      console.log(`✅ ${response.data?.length || 0} active feeding schedules for pet loaded successfully`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} aktif besleme programı bulundu`,
      };
    } catch (error) {
      console.error('❌ Get active feeding schedules by pet error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Aktif besleme programları yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }
}

// ============================================================================
// SERVICE INSTANCES
// ============================================================================

// Singleton instances
export const petService = new PetService();
export const healthRecordService = new HealthRecordService();
export const eventService = new EventService();
export const feedingScheduleService = new FeedingScheduleService();