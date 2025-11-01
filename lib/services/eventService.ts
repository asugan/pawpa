import { api, ApiError } from '../api/client';
import { ENV } from '../config/env';
import type { Event, CreateEventInput, UpdateEventInput, ApiResponse } from '../types';

/**
 * Event Service - Tüm event API operasyonlarını yönetir
 */
export class EventService {
  /**
   * Yeni event oluşturur
   */
  async createEvent(data: CreateEventInput): Promise<ApiResponse<Event>> {
    try {
      const response = await api.post<Event>(ENV.ENDPOINTS.EVENTS, data);

      console.log('✅ Event created successfully:', response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: 'Event başarıyla oluşturuldu',
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
        error: 'Event oluşturulamadı. Lütfen bilgileri kontrol edip tekrar deneyin.',
      };
    }
  }

  /**
   * Tüm eventleri listeler
   */
  async getEvents(): Promise<ApiResponse<Event[]>> {
    try {
      const response = await api.get<Event[]>(ENV.ENDPOINTS.EVENTS);

      console.log(`✅ ${response.data?.length || 0} events loaded successfully`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} event başarıyla yüklendi`,
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
        error: 'Eventler yüklenemedi. Lütfen internet bağlantınızı kontrol edin.',
      };
    }
  }

  /**
   * Pet ID'ye göre eventleri getirir
   */
  async getEventsByPetId(petId: string): Promise<ApiResponse<Event[]>> {
    try {
      const response = await api.get<Event[]>(ENV.ENDPOINTS.EVENTS_BY_PET(petId));

      console.log(`✅ ${response.data?.length || 0} events loaded for pet ${petId}`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} event başarıyla yüklendi`,
      };
    } catch (error) {
      console.error('❌ Get events by pet error:', error);
      if (error instanceof ApiError) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Eventler yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * ID'ye göre tek bir event getirir
   */
  async getEventById(id: string): Promise<ApiResponse<Event>> {
    try {
      const response = await api.get<Event>(ENV.ENDPOINTS.EVENT_BY_ID(id));

      console.log('✅ Event loaded successfully:', response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: 'Event başarıyla yüklendi',
      };
    } catch (error) {
      console.error('❌ Get event error:', error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: 'Event bulunamadı',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Event yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Event bilgilerini günceller
   */
  async updateEvent(id: string, data: UpdateEventInput): Promise<ApiResponse<Event>> {
    try {
      const response = await api.put<Event>(ENV.ENDPOINTS.EVENT_BY_ID(id), data);

      console.log('✅ Event updated successfully:', response.data?.id);
      return {
        success: true,
        data: response.data!,
        message: 'Event başarıyla güncellendi',
      };
    } catch (error) {
      console.error('❌ Update event error:', error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: 'Güncellenecek event bulunamadı',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Event güncellenemedi. Lütfen bilgileri kontrol edip tekrar deneyin.',
      };
    }
  }

  /**
   * Event siler
   */
  async deleteEvent(id: string): Promise<ApiResponse<void>> {
    try {
      await api.delete(ENV.ENDPOINTS.EVENT_BY_ID(id));

      console.log('✅ Event deleted successfully:', id);
      return {
        success: true,
        message: 'Event başarıyla silindi',
      };
    } catch (error) {
      console.error('❌ Delete event error:', error);
      if (error instanceof ApiError) {
        if (error.status === 404) {
          return {
            success: false,
            error: 'Silinecek event bulunamadı',
          };
        }
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'Event silinemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Tarihe göre calendar eventlerini getirir
   */
  async getEventsByDate(date: string): Promise<ApiResponse<Event[]>> {
    try {
      const response = await api.get<Event[]>(ENV.ENDPOINTS.EVENTS_BY_DATE(date));

      console.log(`✅ ${response.data?.length || 0} events loaded for date ${date}`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} event bulundu`,
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
        error: 'Calendar eventleri yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Yaklaşan eventleri getirir
   */
  async getUpcomingEvents(): Promise<ApiResponse<Event[]>> {
    try {
      const response = await api.get<Event[]>(ENV.ENDPOINTS.UPCOMING_EVENTS);

      console.log(`✅ ${response.data?.length || 0} upcoming events loaded`);
      return {
        success: true,
        data: response.data || [],
        message: `${response.data?.length || 0} yaklaşan event bulundu`,
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
        error: 'Yaklaşan eventler yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Bugünün eventlerini getirir
   */
  async getTodayEvents(): Promise<ApiResponse<Event[]>> {
    try {
      const response = await api.get<Event[]>(ENV.ENDPOINTS.TODAY_EVENTS);

      console.log(`✅ ${response.data?.length || 0} today events loaded`);
      return {
        success: true,
        data: response.data || [],
        message: `Bugün için ${response.data?.length || 0} event bulundu`,
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
        error: 'Bugünün eventleri yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }
}

// Singleton instance
export const eventService = new EventService();
