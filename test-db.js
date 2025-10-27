const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');

    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Test: Count all tables
    const petCount = await prisma.pet.count();
    const healthRecordCount = await prisma.healthRecord.count();
    const eventCount = await prisma.event.count();
    const feedingScheduleCount = await prisma.feedingSchedule.count();

    console.log(`📊 Database Statistics:`);
    console.log(`   - Pets: ${petCount}`);
    console.log(`   - Health Records: ${healthRecordCount}`);
    console.log(`   - Events: ${eventCount}`);
    console.log(`   - Feeding Schedules: ${feedingScheduleCount}`);

    console.log('🎉 All database tests passed successfully!');

  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
    console.log('✅ Database disconnected');
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testDatabase();
}

module.exports = { testDatabase };