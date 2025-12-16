import { api, ApiError, ApiResponse } from '../api/client';
import { ENV } from '../config/env';
import type { HealthRecord, CreateHealthRecordInput, UpdateHealthRecordInput } from '../types';

/**
 * Health Record Service - Tüm health record API operasyonlarını yönetir
 */
export class HealthRecordService {
  /**
   * Yeni health record oluşturur
   */
  async createHealthRecord(data: CreateHealthRecordInput): Promise<ApiResponse<HealthRecord>> {
    try {
      const response = await api.post<HealthRecord>(ENV.ENDPOINTS.HEALTH_RECORDS, data);

      console.log('✅ Health record created successfully:', response.data?._id);
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
   * Tüm health recordları listeler
   */
  async getHealthRecords(): Promise<ApiResponse<HealthRecord[]>> {
    try {
      const response = await api.get<HealthRecord[]>(ENV.ENDPOINTS.HEALTH_RECORDS);

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
        error: 'Sağlık kayıtları yüklenemedi. Lütfen internet bağlantınızı kontrol edin.',
      };
    }
  }

  /**
   * Pet ID'ye göre health recordları getirir
   */
  async getHealthRecordsByPetId(petId: string): Promise<ApiResponse<HealthRecord[]>> {
    try {
      const response = await api.get<HealthRecord[]>(ENV.ENDPOINTS.HEALTH_RECORDS_BY_PET(petId));

      console.log(`✅ ${response.data?.length || 0} health records loaded for pet ${petId}`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} sağlık kaydı başarıyla yüklendi`,
      };
    } catch (error) {
      console.error('❌ Get health records by pet error:', error);
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
   * ID'ye göre tek bir health record getirir
   */
  async getHealthRecordById(id: string): Promise<ApiResponse<HealthRecord>> {
    try {
      const response = await api.get<HealthRecord>(ENV.ENDPOINTS.HEALTH_RECORD_BY_ID(id));

      console.log('✅ Health record loaded successfully:', response.data?._id);
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
   * Health record bilgilerini günceller
   */
  async updateHealthRecord(id: string, data: UpdateHealthRecordInput): Promise<ApiResponse<HealthRecord>> {
    try {
      const response = await api.put<HealthRecord>(ENV.ENDPOINTS.HEALTH_RECORD_BY_ID(id), data);

      console.log('✅ Health record updated successfully:', response.data?._id);
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
   * Health record siler
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
   * Yaklaşan aşıları getirir
   */
  async getUpcomingVaccinations(): Promise<ApiResponse<HealthRecord[]>> {
    try {
      const response = await api.get<HealthRecord[]>(ENV.ENDPOINTS.UPCOMING_VACCINATIONS);

      console.log(`✅ ${response.data?.length || 0} upcoming vaccinations loaded`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} yaklaşan aşı bulundu`,
      };
    } catch (error) {
      console.error('❌ Get upcoming vaccinations error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Yaklaşan aşılar yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Pet ID'ye göre aşıları getirir
   */
  async getVaccinations(petId: string): Promise<ApiResponse<HealthRecord[]>> {
    try {
      const response = await this.getHealthRecordsByPetId(petId);
      if (!response.success) {
        return response;
      }
      const vaccinations = (response.data || []).filter((record: HealthRecord) => record.type === 'vaccination');

      console.log(`✅ ${vaccinations.length} vaccinations loaded for pet ${petId}`);
      return {
        success: true,
        data: vaccinations,
        message: `${vaccinations.length} aşı kaydı bulundu`,
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
   * Yaklaşan sağlık kayıtlarını getirir (aşı ve randevular)
   */
  async getUpcomingRecords(): Promise<ApiResponse<HealthRecord[]>> {
    try {
      // Backend'de bu endpoint yoksa upcoming vaccinations'ı kullanabiliriz
      const response = await this.getUpcomingVaccinations();

      return response;
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
   * Pet ID ve tip'e göre sağlık kayıtlarını getirir
   */
  async getHealthRecordsByType(petId: string, type: string): Promise<ApiResponse<HealthRecord[]>> {
    try {
      const response = await this.getHealthRecordsByPetId(petId);
      if (!response.success) {
        return response;
      }
      const filteredRecords = (response.data || []).filter((record: HealthRecord) => record.type === type);

      console.log(`✅ ${filteredRecords.length} ${type} records loaded for pet ${petId}`);
      return {
        success: true,
        data: filteredRecords,
        message: `${filteredRecords.length} ${type} kaydı bulundu`,
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
