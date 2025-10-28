import { prisma } from '../prisma';
import { Pet, CreatePetInput, UpdatePetInput, ApiResponse } from '../types';

/**
 * Pet Service - Tüm pet veritabanı operasyonlarını yönetir
 */
export class PetService {
  /**
   * Yeni pet oluşturur
   */
  async createPet(data: CreatePetInput): Promise<ApiResponse<Pet>> {
    try {
      const pet = await prisma.pet.create({
        data: {
          ...data,
          birthDate: data.birthDate ? new Date(data.birthDate) : null,
        },
      });

      console.log('✅ Pet created successfully:', pet.id);
      return {
        success: true,
        data: pet,
        message: 'Pet başarıyla oluşturuldu',
      };
    } catch (error) {
      console.error('❌ Create pet error:', error);
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
      const pets = await prisma.pet.findMany({
        orderBy: { createdAt: 'desc' },
      });

      console.log(`✅ ${pets.length} pets loaded successfully`);
      return {
        success: true,
        data: pets,
        message: `${pets.length} pet başarıyla yüklendi`,
      };
    } catch (error) {
      console.error('❌ Get pets error:', error);
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
      const pet = await prisma.pet.findUnique({
        where: { id },
      });

      if (!pet) {
        return {
          success: false,
          error: 'Pet bulunamadı',
        };
      }

      console.log('✅ Pet loaded successfully:', pet.id);
      return {
        success: true,
        data: pet,
        message: 'Pet başarıyla yüklendi',
      };
    } catch (error) {
      console.error('❌ Get pet error:', error);
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
      const pet = await prisma.pet.update({
        where: { id },
        data: {
          ...data,
          birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
          updatedAt: new Date(),
        },
      });

      console.log('✅ Pet updated successfully:', pet.id);
      return {
        success: true,
        data: pet,
        message: 'Pet başarıyla güncellendi',
      };
    } catch (error) {
      console.error('❌ Update pet error:', error);

      // Record not found hatası için özel mesaj
      if (error instanceof Error && error.message.includes('Record to update not found')) {
        return {
          success: false,
          error: 'Güncellenecek pet bulunamadı',
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
      // Önce pet'in var olup olmadığını kontrol et
      const existingPet = await prisma.pet.findUnique({
        where: { id },
      });

      if (!existingPet) {
        return {
          success: false,
          error: 'Silinecek pet bulunamadı',
        };
      }

      await prisma.pet.delete({
        where: { id },
      });

      console.log('✅ Pet deleted successfully:', id);
      return {
        success: true,
        message: 'Pet başarıyla silindi',
      };
    } catch (error) {
      console.error('❌ Delete pet error:', error);
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
      const pets = await prisma.pet.findMany({
        where: { type },
        orderBy: { createdAt: 'desc' },
      });

      console.log(`✅ ${pets.length} pets of type ${type} loaded successfully`);
      return {
        success: true,
        data: pets,
        message: `${pets.length} adet ${type} türünde pet bulundu`,
      };
    } catch (error) {
      console.error('❌ Get pets by type error:', error);
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
      const pets = await prisma.pet.findMany({
        where: {
          name: {
            contains: query,
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      console.log(`✅ ${pets.length} pets found for query: ${query}`);
      return {
        success: true,
        data: pets,
        message: `${pets.length} pet bulundu`,
      };
    } catch (error) {
      console.error('❌ Search pets error:', error);
      return {
        success: false,
        error: 'Arama yapılırken hata oluştu. Lütfen tekrar deneyin.',
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
      const pets = await prisma.pet.findMany();

      const byType: Record<string, number> = {};
      const byGender: Record<string, number> = {};
      let totalAge = 0;

      pets.forEach(pet => {
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

      const averageAge = pets.length > 0 ? totalAge / pets.length : 0;

      console.log('✅ Pet stats calculated successfully');
      return {
        success: true,
        data: {
          total: pets.length,
          byType,
          byGender,
          averageAge: Math.round(averageAge * 10) / 10, // 1 decimal basamak
        },
        message: 'Pet istatistikleri başarıyla hesaplandı',
      };
    } catch (error) {
      console.error('❌ Get pet stats error:', error);
      return {
        success: false,
        error: 'İstatistikler yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }
}

// Singleton instance
export const petService = new PetService();