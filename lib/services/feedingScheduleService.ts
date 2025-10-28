import { BaseService } from './baseService';
import { feedingSchedules, type FeedingSchedule, type NewFeedingSchedule } from '../../db';
import { eq, and, desc } from 'drizzle-orm';
import { ApiResponse, CreateFeedingScheduleInput, UpdateFeedingScheduleInput } from '../types';

/**
 * Feeding Schedule Service - Tüm besleme programı operasyonlarını yönetir
 */
export class FeedingScheduleService extends BaseService {
  /**
   * Yeni besleme programı oluşturur
   */
  async createFeedingSchedule(data: CreateFeedingScheduleInput): Promise<ApiResponse<FeedingSchedule>> {
    try {
      const id = `feed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newSchedule: NewFeedingSchedule = {
        id,
        ...data,
        isActive: data.isActive !== undefined ? data.isActive : true,
      };

      const [schedule] = await this.db.insert(feedingSchedules).values(newSchedule).returning();

      console.log('✅ Feeding schedule created successfully:', schedule.id);
      return {
        success: true,
        data: schedule,
        message: 'Besleme programı başarıyla oluşturuldu',
      };
    } catch (error) {
      console.error('❌ Create feeding schedule error:', error);
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
      const schedules = await this.db
        .select()
        .from(feedingSchedules)
        .where(eq(feedingSchedules.petId, petId))
        .orderBy(desc(feedingSchedules.createdAt));

      console.log(`✅ ${schedules.length} feeding schedules loaded successfully`);
      return {
        success: true,
        data: schedules,
        message: `${schedules.length} besleme programı başarıyla yüklendi`,
      };
    } catch (error) {
      console.error('❌ Get feeding schedules error:', error);
      return {
        success: false,
        error: 'Besleme programları yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Aktif besleme programlarını getirir
   */
  async getActiveFeedingSchedules(petId: string): Promise<ApiResponse<FeedingSchedule[]>> {
    try {
      const activeSchedules = await this.db
        .select()
        .from(feedingSchedules)
        .where(
          and(
            eq(feedingSchedules.petId, petId),
            eq(feedingSchedules.isActive, true)
          )
        )
        .orderBy(feedingSchedules.time);

      console.log(`✅ ${activeSchedules.length} active feeding schedules loaded successfully`);
      return {
        success: true,
        data: activeSchedules,
        message: `${activeSchedules.length} aktif besleme programı bulundu`,
      };
    } catch (error) {
      console.error('❌ Get active feeding schedules error:', error);
      return {
        success: false,
        error: 'Aktif besleme programları yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * ID'ye göre tek bir besleme programı getirir
   */
  async getFeedingScheduleById(id: string): Promise<ApiResponse<FeedingSchedule>> {
    try {
      const [schedule] = await this.db
        .select()
        .from(feedingSchedules)
        .where(eq(feedingSchedules.id, id));

      if (!schedule) {
        return {
          success: false,
          error: 'Besleme programı bulunamadı',
        };
      }

      console.log('✅ Feeding schedule loaded successfully:', schedule.id);
      return {
        success: true,
        data: schedule,
        message: 'Besleme programı başarıyla yüklendi',
      };
    } catch (error) {
      console.error('❌ Get feeding schedule error:', error);
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
      const [schedule] = await this.db
        .update(feedingSchedules)
        .set(data)
        .where(eq(feedingSchedules.id, id))
        .returning();

      if (!schedule) {
        return {
          success: false,
          error: 'Güncellenecek besleme programı bulunamadı',
        };
      }

      console.log('✅ Feeding schedule updated successfully:', schedule.id);
      return {
        success: true,
        data: schedule,
        message: 'Besleme programı başarıyla güncellendi',
      };
    } catch (error) {
      console.error('❌ Update feeding schedule error:', error);
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
      const [existingSchedule] = await this.db
        .select()
        .from(feedingSchedules)
        .where(eq(feedingSchedules.id, id));

      if (!existingSchedule) {
        return {
          success: false,
          error: 'Silinecek besleme programı bulunamadı',
        };
      }

      await this.db.delete(feedingSchedules).where(eq(feedingSchedules.id, id));

      console.log('✅ Feeding schedule deleted successfully:', id);
      return {
        success: true,
        message: 'Besleme programı başarıyla silindi',
      };
    } catch (error) {
      console.error('❌ Delete feeding schedule error:', error);
      return {
        success: false,
        error: 'Besleme programı silinemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Besleme programını aktif/pasif yapar
   */
  async toggleFeedingSchedule(id: string): Promise<ApiResponse<FeedingSchedule>> {
    try {
      const [schedule] = await this.db
        .select()
        .from(feedingSchedules)
        .where(eq(feedingSchedules.id, id));

      if (!schedule) {
        return {
          success: false,
          error: 'Besleme programı bulunamadı',
        };
      }

      const [updatedSchedule] = await this.db
        .update(feedingSchedules)
        .set({ isActive: !schedule.isActive })
        .where(eq(feedingSchedules.id, id))
        .returning();

      console.log('✅ Feeding schedule toggled successfully:', updatedSchedule.id);
      return {
        success: true,
        data: updatedSchedule,
        message: `Besleme programı başarıyla ${updatedSchedule.isActive ? 'aktifleştirildi' : 'pasifleştirildi'}`,
      };
    } catch (error) {
      console.error('❌ Toggle feeding schedule error:', error);
      return {
        success: false,
        error: 'Besleme programı durumu değiştirilemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Belirli bir gün için besleme programlarını getirir
   */
  async getFeedingSchedulesForDay(petId: string, dayOfWeek: string): Promise<ApiResponse<FeedingSchedule[]>> {
    try {
      const daySchedules = await this.db
        .select()
        .from(feedingSchedules)
        .where(
          and(
            eq(feedingSchedules.petId, petId),
            eq(feedingSchedules.isActive, true),
            eq(feedingSchedules.days, dayOfWeek)
          )
        )
        .orderBy(feedingSchedules.time);

      console.log(`✅ ${daySchedules.length} feeding schedules for ${dayOfWeek} loaded successfully`);
      return {
        success: true,
        data: daySchedules,
        message: `${daySchedules.length} besleme programı ${dayOfWeek} günü için bulundu`,
      };
    } catch (error) {
      console.error('❌ Get feeding schedules for day error:', error);
      return {
        success: false,
        error: 'Günlük besleme programları yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Mama türüne göre besleme programlarını filtreler
   */
  async getFeedingSchedulesByFoodType(petId: string, foodType: string): Promise<ApiResponse<FeedingSchedule[]>> {
    try {
      const foodTypeSchedules = await this.db
        .select()
        .from(feedingSchedules)
        .where(
          and(
            eq(feedingSchedules.petId, petId),
            eq(feedingSchedules.foodType, foodType)
          )
        )
        .orderBy(desc(feedingSchedules.createdAt));

      console.log(`✅ ${foodTypeSchedules.length} ${foodType} feeding schedules loaded successfully`);
      return {
        success: true,
        data: foodTypeSchedules,
        message: `${foodTypeSchedules.length} adet ${foodType} besleme programı bulundu`,
      };
    } catch (error) {
      console.error('❌ Get feeding schedules by food type error:', error);
      return {
        success: false,
        error: 'Mama türüne göre besleme programları yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }
}

// Singleton instance
export const feedingScheduleService = new FeedingScheduleService();