import { BaseService } from './baseService';
import { pets, type Pet, type NewPet } from '../../db';
import { eq, like, desc } from 'drizzle-orm';
import { ApiResponse, CreatePetInput, UpdatePetInput } from '../types';

/**
 * Pet Service - Tüm pet veritabanı operasyonlarını yönetir
 */
export class PetService extends BaseService {
  /**
   * Yeni pet oluşturur
   */
  async createPet(data: CreatePetInput): Promise<ApiResponse<Pet>> {
    try {
      const id = `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newPet: NewPet = {
        id,
        ...data,
        birthDate: data.birthDate ? (data.birthDate instanceof Date ? data.birthDate : new Date(data.birthDate)) : null,
      };

      const [pet] = await this.db.insert(pets).values(newPet).returning();

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
      const allPets = await this.db.select().from(pets).orderBy(desc(pets.createdAt));

      console.log(`✅ ${allPets.length} pets loaded successfully`);
      return {
        success: true,
        data: allPets,
        message: `${allPets.length} pet başarıyla yüklendi`,
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
      const [pet] = await this.db.select().from(pets).where(eq(pets.id, id));

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
      const updateData = {
        ...data,
        birthDate: data.birthDate ? (data.birthDate instanceof Date ? data.birthDate : new Date(data.birthDate)) : undefined,
        updatedAt: new Date(),
      };

      const [pet] = await this.db
        .update(pets)
        .set(updateData)
        .where(eq(pets.id, id))
        .returning();

      if (!pet) {
        return {
          success: false,
          error: 'Güncellenecek pet bulunamadı',
        };
      }

      console.log('✅ Pet updated successfully:', pet.id);
      return {
        success: true,
        data: pet,
        message: 'Pet başarıyla güncellendi',
      };
    } catch (error) {
      console.error('❌ Update pet error:', error);
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
      const [existingPet] = await this.db.select().from(pets).where(eq(pets.id, id));

      if (!existingPet) {
        return {
          success: false,
          error: 'Silinecek pet bulunamadı',
        };
      }

      await this.db.delete(pets).where(eq(pets.id, id));

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
      const petsByType = await this.db
        .select()
        .from(pets)
        .where(eq(pets.type, type))
        .orderBy(desc(pets.createdAt));

      console.log(`✅ ${petsByType.length} pets of type ${type} loaded successfully`);
      return {
        success: true,
        data: petsByType,
        message: `${petsByType.length} adet ${type} türünde pet bulundu`,
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
      const foundPets = await this.db
        .select()
        .from(pets)
        .where(like(pets.name, `%${query}%`))
        .orderBy(desc(pets.createdAt));

      console.log(`✅ ${foundPets.length} pets found for query: ${query}`);
      return {
        success: true,
        data: foundPets,
        message: `${foundPets.length} pet bulundu`,
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
      const allPets = await this.db.select().from(pets);

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
      return {
        success: false,
        error: 'İstatistikler yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }
}

// Singleton instance
export const petService = new PetService();