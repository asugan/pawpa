import { api, ApiError } from '../api/client';
import { ENV } from '../config/env';
import type { Pet, CreatePetInput, UpdatePetInput, ApiResponse } from '../types';

/**
 * Date utility functions for safe date handling
 */

/**
 * Type guard function to safely check if a value is a Date object
 */
function isDate(value: any): value is Date {
  return value instanceof Date && !isNaN(value.getTime());
}

/**
 * Converts a date value to ISO string format
 * Handles Date objects, strings, null, and undefined
 */
function convertDateToISOString(dateValue: Date | string | null | undefined): string | undefined {
  if (!dateValue) {
    return undefined;
  }

  if (isDate(dateValue)) {
    return dateValue.toISOString();
  }

  // If it's already a string, return as-is (assuming it's already ISO format)
  if (typeof dateValue === 'string') {
    return dateValue;
  }

  return undefined;
}

/**
 * Pet Service - Tüm pet API operasyonlarını yönetir
 */
export class PetService {
  /**
   * Yeni pet oluşturur
   */
  async createPet(data: CreatePetInput): Promise<ApiResponse<Pet>> {
    try {
      // Clean up the data before sending to API
      const cleanedData = {
        ...data,
        birthDate: convertDateToISOString(data.birthDate),
        profilePhoto: data.profilePhoto || undefined,
      };

      const response = await api.post<Pet>(ENV.ENDPOINTS.PETS, cleanedData);

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
      // Clean up the data before sending to API
      const updateData = {
        ...data,
        birthDate: convertDateToISOString(data.birthDate),
        profilePhoto: data.profilePhoto || undefined,
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

// Singleton instance
export const petService = new PetService();