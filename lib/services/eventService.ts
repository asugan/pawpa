import { api, ApiError } from '../api/client';
import { ENV } from '../config/env';
import type { Event, CreateEventInput, UpdateEventInput, ApiResponse } from '../types';

/**
 * Event Service - Tüm olay ve aktivite API operasyonlarını yönetir
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

// Singleton instance
export const eventService = new EventService();