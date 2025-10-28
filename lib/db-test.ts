import { db, pets, healthRecords, events, feedingSchedules } from '../db';
import { count } from 'drizzle-orm';

export async function runDatabaseTest() {
  console.log('🔍 Testing database connection...');

  try {
    console.log('📊 Testing database operations...');

    // Test: Count pets
    const [petCount] = await db.select({ count: count() }).from(pets);
    console.log(`✅ Found ${petCount.count} pets in database`);

    // Test: Count health records
    const [healthRecordCount] = await db.select({ count: count() }).from(healthRecords);
    console.log(`✅ Found ${healthRecordCount.count} health records in database`);

    // Test: Count events
    const [eventCount] = await db.select({ count: count() }).from(events);
    console.log(`✅ Found ${eventCount.count} events in database`);

    // Test: Count feeding schedules
    const [feedingScheduleCount] = await db.select({ count: count() }).from(feedingSchedules);
    console.log(`✅ Found ${feedingScheduleCount.count} feeding schedules in database`);

    console.log('🎉 All database tests passed successfully!');

    return true;
  } catch (error) {
    console.error('❌ Database operations test failed:', error);
    return false;
  }
}

// Export sample data creation function for testing
export async function createSamplePet() {
  try {
    const id = `pet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const [samplePet] = await db.insert(pets).values({
      id,
      name: 'Fındık',
      type: 'cat',
      breed: 'British Shorthair',
      birthDate: new Date('2022-01-15'),
      weight: 4.5,
      gender: 'female',
    }).returning();

    console.log('🐱 Sample pet created:', samplePet);
    return samplePet;
  } catch (error) {
    console.error('❌ Failed to create sample pet:', error);
    return null;
  }
}