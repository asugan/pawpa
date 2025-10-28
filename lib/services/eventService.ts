import { BaseService } from './baseService';
import { events, type Event, type NewEvent } from '../../db';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { ApiResponse, CreateEventInput, UpdateEventInput } from '../types';

/**
 * Event Service - Tüm olay ve aktivite operasyonlarını yönetir
 */
export class EventService extends BaseService {
  /**
   * Yeni olay oluşturur
   */
  async createEvent(data: CreateEventInput): Promise<ApiResponse<Event>> {
    try {
      const id = `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newEvent: NewEvent = {
        id,
        ...data,
        startTime: new Date(data.startTime),
        endTime: data.endTime ? new Date(data.endTime) : null,
        reminder: data.reminder || false,
      };

      const [event] = await this.db.insert(events).values(newEvent).returning();

      console.log('✅ Event created successfully:', event.id);
      return {
        success: true,
        data: event,
        message: 'Olay başarıyla oluşturuldu',
      };
    } catch (error) {
      console.error('❌ Create event error:', error);
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
      const petEvents = await this.db
        .select()
        .from(events)
        .where(eq(events.petId, petId))
        .orderBy(desc(events.startTime));

      console.log(`✅ ${petEvents.length} events loaded successfully`);
      return {
        success: true,
        data: petEvents,
        message: `${petEvents.length} olay başarıyla yüklendi`,
      };
    } catch (error) {
      console.error('❌ Get events error:', error);
      return {
        success: false,
        error: 'Olaylar yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Yaklaşan olayları getirir
   */
  async getUpcomingEvents(petId: string): Promise<ApiResponse<Event[]>> {
    try {
      const now = new Date();
      const upcoming = await this.db
        .select()
        .from(events)
        .where(
          and(
            eq(events.petId, petId),
            gte(events.startTime, now.getTime())
          )
        )
        .orderBy(events.startTime);

      console.log(`✅ ${upcoming.length} upcoming events loaded successfully`);
      return {
        success: true,
        data: upcoming,
        message: `${upcoming.length} yaklaşan olay bulundu`,
      };
    } catch (error) {
      console.error('❌ Get upcoming events error:', error);
      return {
        success: false,
        error: 'Yaklaşan olaylar yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * ID'ye göre tek bir olay getirir
   */
  async getEventById(id: string): Promise<ApiResponse<Event>> {
    try {
      const [event] = await this.db
        .select()
        .from(events)
        .where(eq(events.id, id));

      if (!event) {
        return {
          success: false,
          error: 'Olay bulunamadı',
        };
      }

      console.log('✅ Event loaded successfully:', event.id);
      return {
        success: true,
        data: event,
        message: 'Olay başarıyla yüklendi',
      };
    } catch (error) {
      console.error('❌ Get event error:', error);
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
        startTime: data.startTime ? new Date(data.startTime) : undefined,
        endTime: data.endTime ? new Date(data.endTime) : undefined,
      };

      const [event] = await this.db
        .update(events)
        .set(updateData)
        .where(eq(events.id, id))
        .returning();

      if (!event) {
        return {
          success: false,
          error: 'Güncellenecek olay bulunamadı',
        };
      }

      console.log('✅ Event updated successfully:', event.id);
      return {
        success: true,
        data: event,
        message: 'Olay başarıyla güncellendi',
      };
    } catch (error) {
      console.error('❌ Update event error:', error);
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
      const [existingEvent] = await this.db
        .select()
        .from(events)
        .where(eq(events.id, id));

      if (!existingEvent) {
        return {
          success: false,
          error: 'Silinecek olay bulunamadı',
        };
      }

      await this.db.delete(events).where(eq(events.id, id));

      console.log('✅ Event deleted successfully:', id);
      return {
        success: true,
        message: 'Olay başarıyla silindi',
      };
    } catch (error) {
      console.error('❌ Delete event error:', error);
      return {
        success: false,
        error: 'Olay silinemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Tarihe göre olayları getirir
   */
  async getEventsByDateRange(petId: string, startDate: Date, endDate: Date): Promise<ApiResponse<Event[]>> {
    try {
      const rangeEvents = await this.db
        .select()
        .from(events)
        .where(
          and(
            eq(events.petId, petId),
            gte(events.startTime, startDate.getTime()),
            lte(events.startTime, endDate.getTime())
          )
        )
        .orderBy(desc(events.startTime));

      console.log(`✅ ${rangeEvents.length} events in date range loaded successfully`);
      return {
        success: true,
        data: rangeEvents,
        message: `${rangeEvents.length} olay tarihe göre bulundu`,
      };
    } catch (error) {
      console.error('❌ Get events by date range error:', error);
      return {
        success: false,
        error: 'Tarihe göre olaylar yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Türe göre olayları filtreler
   */
  async getEventsByType(petId: string, type: string): Promise<ApiResponse<Event[]>> {
    try {
      const typeEvents = await this.db
        .select()
        .from(events)
        .where(
          and(
            eq(events.petId, petId),
            eq(events.type, type)
          )
        )
        .orderBy(desc(events.startTime));

      console.log(`✅ ${typeEvents.length} ${type} events loaded successfully`);
      return {
        success: true,
        data: typeEvents,
        message: `${typeEvents.length} adet ${type} olayı bulundu`,
      };
    } catch (error) {
      console.error('❌ Get events by type error:', error);
      return {
        success: false,
        error: 'Olaylar yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }

  /**
   * Hatırlatıcıları getirir
   */
  async getEventsWithReminders(petId: string): Promise<ApiResponse<Event[]>> {
    try {
      const reminderEvents = await this.db
        .select()
        .from(events)
        .where(
          and(
            eq(events.petId, petId),
            eq(events.reminder, true)
          )
        )
        .orderBy(desc(events.startTime));

      console.log(`✅ ${reminderEvents.length} events with reminders loaded successfully`);
      return {
        success: true,
        data: reminderEvents,
        message: `${reminderEvents.length} hatırlatıcılı olay bulundu`,
      };
    } catch (error) {
      console.error('❌ Get events with reminders error:', error);
      return {
        success: false,
        error: 'Hatırlatıcılar yüklenemedi. Lütfen tekrar deneyin.',
      };
    }
  }
}

// Singleton instance
export const eventService = new EventService();