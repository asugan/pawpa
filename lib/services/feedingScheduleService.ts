import { api, ApiError } from '../api/client';
import { ENV } from '../config/env';
import type { FeedingSchedule, CreateFeedingScheduleInput, UpdateFeedingScheduleInput, ApiResponse } from '../types';

/**
 * Feeding Schedule Service - Tüm besleme programı API operasyonlarını yönetir
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

// Singleton instance
export const feedingScheduleService = new FeedingScheduleService();