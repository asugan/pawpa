import { api, ApiError } from '../api/client';
import { ENV } from '../config/env';
import type { FeedingSchedule, CreateFeedingScheduleInput, UpdateFeedingScheduleInput, ApiResponse } from '../types';

/**
 * Feeding Schedule Service - Tüm feeding schedule API operasyonlarını yönetir
 */
export class FeedingScheduleService {
  /**
   * Yeni feeding schedule oluşturur
   */
  async createFeedingSchedule(data: CreateFeedingScheduleInput): Promise<ApiResponse<FeedingSchedule>> {
    try {
      const response = await api.post<FeedingSchedule>(ENV.ENDPOINTS.FEEDING_SCHEDULES, data);

      console.log('✅ Feeding schedule created successfully:', response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: 'Beslenme takvimi başarıyla oluşturuldu',
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
        error: 'Beslenme takvimi oluşturulamadı. Lütfen bilgileri kontrol edip tekrar deneyin.',
      };
    }
  }

  /**
   * Tüm feeding scheduleleri listeler
   */
  async getFeedingSchedules(): Promise<ApiResponse<FeedingSchedule[]>> {
    try {
      const response = await api.get<FeedingSchedule[]>(ENV.ENDPOINTS.FEEDING_SCHEDULES);

      console.log(`✅ ${response.data?.length || 0} feeding schedules loaded successfully`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} beslenme takvimi başarıyla yüklendi`,
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
        error: 'Beslenme takvimleri yüklenemedi. Lütfen internet bağlantınızı kontrol edin.',
      };
    }
  }

  /**
   * Pet ID'ye göre feeding scheduleleri getirir
   */
  async getFeedingSchedulesByPetId(petId: string): Promise<ApiResponse<FeedingSchedule[]>> {
    try {
      const response = await api.get<FeedingSchedule[]>(ENV.ENDPOINTS.FEEDING_SCHEDULES_BY_PET(petId));

      console.log(`✅ ${response.data?.length || 0} feeding schedules loaded for pet ${petId}`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} beslenme takvimi başarıyla yüklendi`,
      };
    } catch (error) {
      console.error('❌ Get feeding schedules by pet error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Beslenme takvimleri yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * ID'ye göre tek bir feeding schedule getirir
   */
  async getFeedingScheduleById(id: string): Promise<ApiResponse<FeedingSchedule>> {
    try {
      const response = await api.get<FeedingSchedule>(ENV.ENDPOINTS.FEEDING_SCHEDULE_BY_ID(id));

      console.log('✅ Feeding schedule loaded successfully:', response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: 'Beslenme takvimi başarıyla yüklendi',
      };
    } catch (error) {
      console.error('❌ Get feeding schedule error:', error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: 'Beslenme takvimi bulunamadı',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Beslenme takvimi yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Feeding schedule bilgilerini günceller
   */
  async updateFeedingSchedule(id: string, data: UpdateFeedingScheduleInput): Promise<ApiResponse<FeedingSchedule>> {
    try {
      const response = await api.put<FeedingSchedule>(ENV.ENDPOINTS.FEEDING_SCHEDULE_BY_ID(id), data);

      console.log('✅ Feeding schedule updated successfully:', response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: 'Beslenme takvimi başarıyla güncellendi',
      };
    } catch (error) {
      console.error('❌ Update feeding schedule error:', error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: 'Güncellenecek beslenme takvimi bulunamadı',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Beslenme takvimi güncellenemedi. Lütfen bilgileri kontrol edip tekrar deneyin.',
      };
    }
  }

  /**
   * Feeding schedule siler
   */
  async deleteFeedingSchedule(id: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(ENV.ENDPOINTS.FEEDING_SCHEDULE_BY_ID(id));

      console.log('✅ Feeding schedule deleted successfully:', id);
      return {
        success: true,
        message: 'Beslenme takvimi başarıyla silindi',
      };
    } catch (error) {
      console.error('❌ Delete feeding schedule error:', error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: 'Silinecek beslenme takvimi bulunamadı',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Beslenme takvimi silinemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Aktif feeding scheduleleri getirir
   */
  async getActiveFeedingSchedules(): Promise<ApiResponse<FeedingSchedule[]>> {
    try {
      const response = await api.get<FeedingSchedule[]>(ENV.ENDPOINTS.ACTIVE_FEEDING_SCHEDULES);

      console.log(`✅ ${response.data?.length || 0} active feeding schedules loaded`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} aktif beslenme takvimi bulundu`,
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
        error: 'Aktif beslenme takvimleri yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Bugünün feeding scheduleleri getirir
   */
  async getTodayFeedingSchedules(): Promise<ApiResponse<FeedingSchedule[]>> {
    try {
      const response = await api.get<FeedingSchedule[]>(ENV.ENDPOINTS.TODAY_FEEDING_SCHEDULES);

      console.log(`✅ ${response.data?.length || 0} today feeding schedules loaded`);
      return {
        success: true,
        data: response.data || [],
        message: `Bugün için ${response.data?.length || 0} beslenme takvimi bulundu`,
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
        error: 'Bugünün beslenme takvimleri yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Sonraki beslenme zamanını getirir
   */
  async getNextFeeding(): Promise<ApiResponse<FeedingSchedule | null>> {
    try {
      const response = await api.get<FeedingSchedule | null>(ENV.ENDPOINTS.NEXT_FEEDING);

      console.log('✅ Next feeding loaded successfully');
      return {
        success: true,
        data: response.data || null,
        message: response.data ? 'Sonraki beslenme zamanı bulundu' : 'Planlanmış beslenme bulunamadı',
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
        error: 'Sonraki beslenme zamanı yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Pet'e ait aktif beslenme takvimlerini getirir
   */
  async getActiveFeedingSchedulesByPet(petId: string): Promise<ApiResponse<FeedingSchedule[]>> {
    try {
      const response = await this.getFeedingSchedulesByPetId(petId);
      if (!response.success) {
        return response;
      }
      const activeSchedules = (response.data || []).filter((schedule: FeedingSchedule) => schedule.isActive);

      console.log(`✅ ${activeSchedules.length} active schedules loaded for pet ${petId}`);
      return {
        success: true,
        data: activeSchedules,
        message: `${activeSchedules.length} aktif beslenme takvimi bulundu`,
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
        error: 'Aktif beslenme takvimleri yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Beslenme takvimini aktif/pasif hale getirir
   */
  async toggleFeedingSchedule(id: string, isActive: boolean): Promise<ApiResponse<FeedingSchedule>> {
    try {
      const response = await this.updateFeedingSchedule(id, { isActive });

      console.log(`✅ Feeding schedule toggled successfully: ${id}`);
      return response;
    } catch (error) {
      console.error('❌ Toggle feeding schedule error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Beslenme takvimi durumu değiştirilemedi. Lütfen tekrar deneyin.',
      };
    }
  }
}

// Singleton instance
export const feedingScheduleService = new FeedingScheduleService();
