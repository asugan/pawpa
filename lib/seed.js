const sqlite3 = require('sqlite3').verbose();

// Connect to database
const db = new sqlite3.Database('./dev.db');

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM feeding_schedules', (err) => err ? reject(err) : resolve());
    });
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM events', (err) => err ? reject(err) : resolve());
    });
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM health_records', (err) => err ? reject(err) : resolve());
    });
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM pets', (err) => err ? reject(err) : resolve());
    });

    console.log('🧹 Cleared existing data');

    // Create sample pets
    const pet1Id = `pet_${Date.now()}_1`;
    const pet2Id = `pet_${Date.now()}_2`;

    const now = Date.now();

    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO pets (id, name, type, breed, birth_date, weight, gender, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [pet1Id, 'Fındık', 'cat', 'British Shorthair', '2022-01-15', 4.5, 'female', now, now],
        (err) => err ? reject(err) : resolve()
      );
    });

    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO pets (id, name, type, breed, birth_date, weight, gender, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [pet2Id, 'Max', 'dog', 'Golden Retriever', '2021-05-20', 32.0, 'male', now, now],
        (err) => err ? reject(err) : resolve()
      );
    });

    console.log('✅ Created pets: Fındık (cat), Max (dog)');

    // Create sample health records
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO health_records (id, pet_id, type, title, description, date, veterinarian, clinic, cost, next_due_date, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [`health_${now}_1`, pet1Id, 'vaccination', 'Kuduz Aşısı', 'Yıllık kuduz aşısı yapıldı', '2024-01-10', 'Dr. Ayşe Yılmaz', 'PawPa Veteriner Kliniği', 150.0, '2025-01-10', now],
        (err) => err ? reject(err) : resolve()
      );
    });

    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO health_records (id, pet_id, type, title, description, date, veterinarian, clinic, cost, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [`health_${now}_2`, pet2Id, 'checkup', 'Genel Kontrol', 'Genel sağlık kontrolü, aşılar güncel', '2024-02-15', 'Dr. Mehmet Kaya', 'PawPa Veteriner Kliniği', 200.0, now],
        (err) => err ? reject(err) : resolve()
      );
    });

    console.log('✅ Created health records');

    // Create sample events
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO events (id, pet_id, title, description, type, start_time, end_time, location, reminder, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [`event_${now}_1`, pet1Id, 'Tüy Bakımı', 'Aylık tüy kesimi ve bakım', 'grooming', new Date('2024-12-01T14:00:00').getTime(), new Date('2024-12-01T15:30:00').getTime(), 'Pet Grooming Salon', 1, now],
        (err) => err ? reject(err) : resolve()
      );
    });

    console.log('✅ Created event: Tüy Bakımı');

    // Create sample feeding schedules
    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO feeding_schedules (id, pet_id, time, food_type, amount, days, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [`feed_${now}_1`, pet1Id, '08:00', 'Kuru Kedi Maması', '1 su bardağı', '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', 1, now],
        (err) => err ? reject(err) : resolve()
      );
    });

    await new Promise((resolve, reject) => {
      db.run(
        `INSERT INTO feeding_schedules (id, pet_id, time, food_type, amount, days, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [`feed_${now}_2`, pet2Id, '07:00', 'Kuru Köpek Maması', '2 su bardağı', '["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]', 1, now],
        (err) => err ? reject(err) : resolve()
      );
    });

    console.log('✅ Created feeding schedules');

    console.log('🎉 Database seeding completed successfully!');
    console.log('\n📊 Seeded Data Summary:');
    console.log('- Pets: 2 (Fındık the cat, Max the dog)');
    console.log('- Health Records: 2');
    console.log('- Events: 1');
    console.log('- Feeding Schedules: 2');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    db.close();
  }
}

seedDatabase();