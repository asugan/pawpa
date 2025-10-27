import { prisma, testDatabaseConnection } from './prisma';

export async function runDatabaseTest() {
  console.log('🔍 Testing database connection...');

  const isConnected = await testDatabaseConnection();

  if (isConnected) {
    console.log('📊 Testing database operations...');

    try {
      // Test: Count pets
      const petCount = await prisma.pet.count();
      console.log(`✅ Found ${petCount} pets in database`);

      // Test: Count health records
      const healthRecordCount = await prisma.healthRecord.count();
      console.log(`✅ Found ${healthRecordCount} health records in database`);

      // Test: Count events
      const eventCount = await prisma.event.count();
      console.log(`✅ Found ${eventCount} events in database`);

      // Test: Count feeding schedules
      const feedingScheduleCount = await prisma.feedingSchedule.count();
      console.log(`✅ Found ${feedingScheduleCount} feeding schedules in database`);

      console.log('🎉 All database tests passed successfully!');

      return true;
    } catch (error) {
      console.error('❌ Database operations test failed:', error);
      return false;
    }
  }

  return false;
}

// Export sample data creation function for testing
export async function createSamplePet() {
  try {
    const samplePet = await prisma.pet.create({
      data: {
        name: 'Fındık',
        type: 'cat',
        breed: 'British Shorthair',
        birthDate: new Date('2022-01-15'),
        weight: 4.5,
        gender: 'female',
      },
    });

    console.log('🐱 Sample pet created:', samplePet);
    return samplePet;
  } catch (error) {
    console.error('❌ Failed to create sample pet:', error);
    return null;
  }
}