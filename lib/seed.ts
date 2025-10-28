import { db, pets, healthRecords, events, feedingSchedules } from '../db';

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await db.delete(feedingSchedules);
    await db.delete(events);
    await db.delete(healthRecords);
    await db.delete(pets);

    // Create sample pets
    const pet1Id = `pet_${Date.now()}_1`;
    const pet2Id = `pet_${Date.now()}_2`;

    const [pet1] = await db.insert(pets).values({
      id: pet1Id,
      name: 'Fındık',
      type: 'cat',
      breed: 'British Shorthair',
      birthDate: new Date('2022-01-15'),
      weight: 4.5,
      gender: 'female',
    }).returning();

    const [pet2] = await db.insert(pets).values({
      id: pet2Id,
      name: 'Max',
      type: 'dog',
      breed: 'Golden Retriever',
      birthDate: new Date('2021-05-20'),
      weight: 32.0,
      gender: 'male',
    }).returning();

    console.log(`✅ Created ${pet1.name} (${pet1.type})`);
    console.log(`✅ Created ${pet2.name} (${pet2.type})`);

    // Create sample health records
    const [health1] = await db.insert(healthRecords).values({
      id: `health_${Date.now()}_1`,
      petId: pet1Id,
      type: 'vaccination',
      title: 'Kuduz Aşısı',
      description: 'Yıllık kuduz aşısı yapıldı',
      date: new Date('2024-01-10'),
      veterinarian: 'Dr. Ayşe Yılmaz',
      clinic: 'PawPa Veteriner Kliniği',
      cost: 150.0,
      nextDueDate: new Date('2025-01-10'),
    }).returning();

    await db.insert(healthRecords).values({
      id: `health_${Date.now()}_2`,
      petId: pet2Id,
      type: 'checkup',
      title: 'Genel Kontrol',
      description: 'Genel sağlık kontrolü, aşılar güncel',
      date: new Date('2024-02-15'),
      veterinarian: 'Dr. Mehmet Kaya',
      clinic: 'PawPa Veteriner Kliniği',
      cost: 200.0,
    });

    console.log(`✅ Created health record: ${health1.title}`);

    // Create sample events
    const [event1] = await db.insert(events).values({
      id: `event_${Date.now()}_1`,
      petId: pet1Id,
      title: 'Tüy Bakımı',
      description: 'Aylık tüy kesimi ve bakım',
      type: 'grooming',
      startTime: new Date('2024-12-01T14:00:00'),
      endTime: new Date('2024-12-01T15:30:00'),
      location: 'Pet Grooming Salon',
      reminder: true,
    }).returning();

    console.log(`✅ Created event: ${event1.title}`);

    // Create sample feeding schedules
    const [schedule1] = await db.insert(feedingSchedules).values({
      id: `feed_${Date.now()}_1`,
      petId: pet1Id,
      time: '08:00',
      foodType: 'Kuru Kedi Maması',
      amount: '1 su bardağı',
      days: '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]',
      isActive: true,
    }).returning();

    await db.insert(feedingSchedules).values({
      id: `feed_${Date.now()}_2`,
      petId: pet2Id,
      time: '07:00',
      foodType: 'Kuru Köpek Maması',
      amount: '2 su bardağı',
      days: '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]',
      isActive: true,
    });

    console.log(`✅ Created feeding schedule: ${schedule1.time} - ${schedule1.foodType}`);

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Seeded Data Summary:');
    console.log('- Pets: 2');
    console.log('- Health Records: 2');
    console.log('- Events: 1');
    console.log('- Feeding Schedules: 2');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

export { seedDatabase };