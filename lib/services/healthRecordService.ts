import { api, ApiError } from '../api/client';
import { ENV } from '../config/env';
import type { HealthRecord, CreateHealthRecordInput, UpdateHealthRecordInput, ApiResponse } from '../types';

/**
 * Health Record Service - Tüm sağlık kayıtları API operasyonlarını yönetir
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

// Singleton instance
export const healthRecordService = new HealthRecordService();