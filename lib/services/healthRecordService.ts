import { BaseService } from './baseService';
import { healthRecords, type HealthRecord, type NewHealthRecord } from '../../db';
import { eq, and, desc } from 'drizzle-orm';
import { ApiResponse, CreateHealthRecordInput, UpdateHealthRecordInput } from '../types';

/**
 * Health Record Service - Tüm sağlık kayıtları operasyonlarını yönetir
 */
export class HealthRecordService extends BaseService {
  /**
   * Yeni sağlık kaydı oluşturur
   */
  async createHealthRecord(data: CreateHealthRecordInput): Promise<ApiResponse<HealthRecord>> {
    try {
      const id = `health_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newRecord: NewHealthRecord = {
        id,
        ...data,
        date: new Date(data.date),
        nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : null,
      };

      const [record] = await this.db.insert(healthRecords).values(newRecord).returning();

      console.log('✅ Health record created successfully:', record.id);
      return {
        success: true,
        data: record,
        message: 'Sağlık kaydı başarıyla oluşturuldu',
      };
    } catch (error) {
      console.error('❌ Create health record error:', error);
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
      const records = await this.db
        .select()
        .from(healthRecords)
        .where(eq(healthRecords.petId, petId))
        .orderBy(desc(healthRecords.date));

      console.log(`✅ ${records.length} health records loaded successfully`);
      return {
        success: true,
        data: records,
        message: `${records.length} sağlık kaydı başarıyla yüklendi`,
      };
    } catch (error) {
      console.error('❌ Get health records error:', error);
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
      const [record] = await this.db
        .select()
        .from(healthRecords)
        .where(eq(healthRecords.id, id));

      if (!record) {
        return {
          success: false,
          error: 'Sağlık kaydı bulunamadı',
        };
      }

      console.log('✅ Health record loaded successfully:', record.id);
      return {
        success: true,
        data: record,
        message: 'Sağlık kaydı başarıyla yüklendi',
      };
    } catch (error) {
      console.error('❌ Get health record error:', error);
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
        date: data.date ? new Date(data.date) : undefined,
        nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : undefined,
      };

      const [record] = await this.db
        .update(healthRecords)
        .set(updateData)
        .where(eq(healthRecords.id, id))
        .returning();

      if (!record) {
        return {
          success: false,
          error: 'Güncellenecek sağlık kaydı bulunamadı',
        };
      }

      console.log('✅ Health record updated successfully:', record.id);
      return {
        success: true,
        data: record,
        message: 'Sağlık kaydı başarıyla güncellendi',
      };
    } catch (error) {
      console.error('❌ Update health record error:', error);
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
      const [existingRecord] = await this.db
        .select()
        .from(healthRecords)
        .where(eq(healthRecords.id, id));

      if (!existingRecord) {
        return {
          success: false,
          error: 'Silinecek sağlık kaydı bulunamadı',
        };
      }

      await this.db.delete(healthRecords).where(eq(healthRecords.id, id));

      console.log('✅ Health record deleted successfully:', id);
      return {
        success: true,
        message: 'Sağlık kaydı başarıyla silindi',
      };
    } catch (error) {
      console.error('❌ Delete health record error:', error);
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
      const vaccinations = await this.db
        .select()
        .from(healthRecords)
        .where(
          and(
            eq(healthRecords.petId, petId),
            eq(healthRecords.type, 'vaccination')
          )
        )
        .orderBy(desc(healthRecords.date));

      console.log(`✅ ${vaccinations.length} vaccinations loaded successfully`);
      return {
        success: true,
        data: vaccinations,
        message: `${vaccinations.length} aşı kaydı bulundu`,
      };
    } catch (error) {
      console.error('❌ Get vaccinations error:', error);
      return {
        success: false,
        error: 'Aşı kayıtları yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Yaklaşan randevuları/aşları getirir
   */
  async getUpcomingRecords(petId: string): Promise<ApiResponse<HealthRecord[]>> {
    try {
      const now = new Date();
      const upcoming = await this.db
        .select()
        .from(healthRecords)
        .where(
          and(
            eq(healthRecords.petId, petId),
            eq(healthRecords.nextDueDate, now.getTime())
          )
        )
        .orderBy(healthRecords.nextDueDate);

      console.log(`✅ ${upcoming.length} upcoming records loaded successfully`);
      return {
        success: true,
        data: upcoming,
        message: `${upcoming.length} yaklaşan kayıt bulundu`,
      };
    } catch (error) {
      console.error('❌ Get upcoming records error:', error);
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
      const records = await this.db
        .select()
        .from(healthRecords)
        .where(
          and(
            eq(healthRecords.petId, petId),
            eq(healthRecords.type, type)
          )
        )
        .orderBy(desc(healthRecords.date));

      console.log(`✅ ${records.length} ${type} records loaded successfully`);
      return {
        success: true,
        data: records,
        message: `${records.length} adet ${type} kaydı bulundu`,
      };
    } catch (error) {
      console.error('❌ Get health records by type error:', error);
      return {
        success: false,
        error: 'Sağlık kayıtları yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }
}

// Singleton instance
export const healthRecordService = new HealthRecordService();