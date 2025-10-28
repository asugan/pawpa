# Prisma → Drizzle + Expo-SQLite Migration Guide

## 📋 Overview

This document provides a comprehensive migration guide for transitioning the PawPa app from Prisma ORM to Drizzle ORM with Expo-SQLite integration. This migration is necessary because Prisma doesn't support React Native environments.

## 🎯 Why Migrate?

### Current Issues with Prisma
- **Platform Incompatibility**: Prisma doesn't work in React Native environments
- **Bundle Size**: Heavy dependencies increase app size
- **Performance**: Not optimized for mobile SQLite operations

### Benefits of Drizzle + Expo-SQLite
- **React Native Compatible**: Native SQLite support through Expo
- **Lightweight**: Smaller bundle size
- **Better Performance**: Direct SQLite access
- **Type Safety**: Excellent TypeScript support
- **Expo Integration**: Seamless integration with Expo ecosystem

## 📊 Current State Analysis

### Existing Prisma Schema
```prisma
// Location: prisma/schema.prisma
model Pet {
  id           Int      @id @default(autoincrement())
  name         String
  type         String
  breed        String?
  birthDate    DateTime
  weight       Float?
  gender       String?
  profilePhoto String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  healthRecords HealthRecord[]
  events       Event[]
  feedingSchedules FeedingSchedule[]
}

model HealthRecord {
  id          Int      @id @default(autoincrement())
  petId       Int
  type        String
  title       String
  description String?
  date        DateTime
  vetName     String?
  cost        Float?
  notes       String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  pet         Pet      @relation(fields: [petId], references: [id], onDelete: Cascade)
}

model Event {
  id          Int      @id @default(autoincrement())
  petId       Int
  title       String
  description String?
  startTime   DateTime
  endTime     DateTime?
  type        String
  isCompleted Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  pet         Pet      @relation(fields: [petId], references: [id], onDelete: Cascade)
}

model FeedingSchedule {
  id             Int      @id @default(autoincrement())
  petId          Int
  name           String
  time           String
  days           String
  foodType       String?
  portionSize    Float?
  instructions   String?
  isActive       Boolean  @default(true)
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
  pet            Pet      @relation(fields: [petId], references: [id], onDelete: Cascade)
}
```

### Current Implementation Status
- ✅ Database client setup (`lib/prisma.ts`)
- ✅ PetService implementation (`lib/services/petService.ts`)
- ✅ TypeScript types (`lib/types.ts`)
- ✅ Database testing utilities
- ❌ HealthRecordService (missing)
- ❌ EventService (missing)
- ❌ FeedingScheduleService (missing)

### Current Data
- Existing SQLite database (`dev.db`) with sample data
- Proper relationships with CASCADE deletion
- Well-structured schema ready for migration

## 🚀 Migration Roadmap

### Phase 1: Dependencies & Setup (15-20 minutes)

#### 1.1 Install Drizzle Dependencies
```bash
npm install drizzle-orm drizzle-kit expo-sqlite @types/sqlite3
```

#### 1.2 Remove Prisma Dependencies
```bash
npm uninstall @prisma/client prisma
```

#### 1.3 Update Package.json Scripts
```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate:sqlite",
    "db:migrate": "drizzle-kit migrate:sqlite",
    "db:push": "drizzle-kit push:sqlite",
    "db:studio": "drizzle-kit studio",
    "db:reset": "rm -rf dev.db && npm run db:push",
    "db:seed": "npx tsx lib/seed.ts"
  }
}
```

#### 1.4 Create Drizzle Configuration
Create `drizzle.config.ts`:
```typescript
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './db/schema.ts',
  out: './drizzle',
  driver: 'expo-sqlite',
  dbCredentials: {
    url: './dev.db',
  },
});
```

### Phase 2: Schema Conversion (20-30 minutes)

#### 2.1 Create Database Directory Structure
```
db/
├── schema.ts          # Drizzle schema definitions
├── index.ts          # Database client setup
└── migrations/       # Migration files
```

#### 2.2 Convert Prisma Schema to Drizzle
Create `db/schema.ts`:
```typescript
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Pets table
export const pets = sqliteTable('pets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  breed: text('breed'),
  birthDate: integer('birth_date', { mode: 'timestamp' }).notNull(),
  weight: real('weight'),
  gender: text('gender'),
  profilePhoto: text('profile_photo'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Health records table
export const healthRecords = sqliteTable('health_records', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  petId: integer('pet_id').notNull().references(() => pets.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  date: integer('date', { mode: 'timestamp' }).notNull(),
  vetName: text('vet_name'),
  cost: real('cost'),
  notes: text('notes'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Events table
export const events = sqliteTable('events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  petId: integer('pet_id').notNull().references(() => pets.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  startTime: integer('start_time', { mode: 'timestamp' }).notNull(),
  endTime: integer('end_time', { mode: 'timestamp' }),
  type: text('type').notNull(),
  isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Feeding schedules table
export const feedingSchedules = sqliteTable('feeding_schedules', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  petId: integer('pet_id').notNull().references(() => pets.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  time: text('time').notNull(),
  days: text('days').notNull(),
  foodType: text('food_type'),
  portionSize: real('portion_size'),
  instructions: text('instructions'),
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

// Relations
export const petsRelations = relations(pets, ({ many }) => ({
  healthRecords: many(healthRecords),
  events: many(events),
  feedingSchedules: many(feedingSchedules),
}));

export const healthRecordsRelations = relations(healthRecords, ({ one }) => ({
  pet: one(pets, {
    fields: [healthRecords.petId],
    references: [pets.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  pet: one(pets, {
    fields: [events.petId],
    references: [pets.id],
  }),
}));

export const feedingSchedulesRelations = relations(feedingSchedules, ({ one }) => ({
  pet: one(pets, {
    fields: [feedingSchedules.petId],
    references: [pets.id],
  }),
}));
```

#### 2.3 Create Database Client
Create `db/index.ts`:
```typescript
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import * as schema from './schema';

// Open the database
const expo = openDatabaseSync('dev.db');

// Create Drizzle instance
export const db = drizzle(expo, { schema });

// Export schema for convenience
export * from './schema';
```

### Phase 3: Services Migration (30-40 minutes)

#### 3.1 Create Base Service Class
Create `lib/services/baseService.ts`:
```typescript
import { db } from '../db';

export abstract class BaseService {
  protected db = db;
}
```

#### 3.2 Migrate PetService
Update `lib/services/petService.ts`:
```typescript
import { BaseService } from './baseService';
import { pets, type Pet, type NewPet } from '../../db';
import { eq } from 'drizzle-orm';

export class PetService extends BaseService {
  async getAll(): Promise<Pet[]> {
    return await this.db.select().from(pets);
  }

  async getById(id: number): Promise<Pet | undefined> {
    const [pet] = await this.db.select().from(pets).where(eq(pets.id, id));
    return pet;
  }

  async create(data: NewPet): Promise<Pet> {
    const [pet] = await this.db.insert(pets).values(data).returning();
    return pet;
  }

  async update(id: number, data: Partial<NewPet>): Promise<Pet> {
    const [pet] = await this.db
      .update(pets)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(pets.id, id))
      .returning();
    return pet;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(pets).where(eq(pets.id, id));
  }

  async search(query: string): Promise<Pet[]> {
    return await this.db
      .select()
      .from(pets)
      .where(eq(pets.name, `%${query}%`));
  }
}
```

#### 3.3 Create HealthRecordService
Create `lib/services/healthRecordService.ts`:
```typescript
import { BaseService } from './baseService';
import { healthRecords, pets, type HealthRecord, type NewHealthRecord } from '../../db';
import { eq, and } from 'drizzle-orm';

export class HealthRecordService extends BaseService {
  async getByPetId(petId: number): Promise<HealthRecord[]> {
    return await this.db
      .select()
      .from(healthRecords)
      .where(eq(healthRecords.petId, petId));
  }

  async create(data: NewHealthRecord): Promise<HealthRecord> {
    const [record] = await this.db.insert(healthRecords).values(data).returning();
    return record;
  }

  async update(id: number, data: Partial<NewHealthRecord>): Promise<HealthRecord> {
    const [record] = await this.db
      .update(healthRecords)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(healthRecords.id, id))
      .returning();
    return record;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(healthRecords).where(eq(healthRecords.id, id));
  }

  async getVaccinations(petId: number): Promise<HealthRecord[]> {
    return await this.db
      .select()
      .from(healthRecords)
      .where(
        and(
          eq(healthRecords.petId, petId),
          eq(healthRecords.type, 'vaccination')
        )
      );
  }

  async getUpcoming(petId: number): Promise<HealthRecord[]> {
    const now = new Date();
    return await this.db
      .select()
      .from(healthRecords)
      .where(
        and(
          eq(healthRecords.petId, petId),
          eq(healthRecords.date, now)
        )
      );
  }
}
```

#### 3.4 Create EventService
Create `lib/services/eventService.ts`:
```typescript
import { BaseService } from './baseService';
import { events, type Event, type NewEvent } from '../../db';
import { eq, and, gte, lte } from 'drizzle-orm';

export class EventService extends BaseService {
  async getByPetId(petId: number): Promise<Event[]> {
    return await this.db
      .select()
      .from(events)
      .where(eq(events.petId, petId));
  }

  async getUpcoming(petId: number): Promise<Event[]> {
    const now = new Date();
    return await this.db
      .select()
      .from(events)
      .where(
        and(
          eq(events.petId, petId),
          gte(events.startTime, now),
          eq(events.isCompleted, false)
        )
      );
  }

  async create(data: NewEvent): Promise<Event> {
    const [event] = await this.db.insert(events).values(data).returning();
    return event;
  }

  async update(id: number, data: Partial<NewEvent>): Promise<Event> {
    const [event] = await this.db
      .update(events)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return event;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(events).where(eq(events.id, id));
  }

  async markCompleted(id: number): Promise<Event> {
    const [event] = await this.db
      .update(events)
      .set({ isCompleted: true, updatedAt: new Date() })
      .where(eq(events.id, id))
      .returning();
    return event;
  }

  async getByDateRange(petId: number, startDate: Date, endDate: Date): Promise<Event[]> {
    return await this.db
      .select()
      .from(events)
      .where(
        and(
          eq(events.petId, petId),
          gte(events.startTime, startDate),
          lte(events.startTime, endDate)
        )
      );
  }
}
```

#### 3.5 Create FeedingScheduleService
Create `lib/services/feedingScheduleService.ts`:
```typescript
import { BaseService } from './baseService';
import { feedingSchedules, type FeedingSchedule, type NewFeedingSchedule } from '../../db';
import { eq, and } from 'drizzle-orm';

export class FeedingScheduleService extends BaseService {
  async getByPetId(petId: number): Promise<FeedingSchedule[]> {
    return await this.db
      .select()
      .from(feedingSchedules)
      .where(
        and(
          eq(feedingSchedules.petId, petId),
          eq(feedingSchedules.isActive, true)
        )
      );
  }

  async create(data: NewFeedingSchedule): Promise<FeedingSchedule> {
    const [schedule] = await this.db.insert(feedingSchedules).values(data).returning();
    return schedule;
  }

  async update(id: number, data: Partial<NewFeedingSchedule>): Promise<FeedingSchedule> {
    const [schedule] = await this.db
      .update(feedingSchedules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(feedingSchedules.id, id))
      .returning();
    return schedule;
  }

  async delete(id: number): Promise<void> {
    await this.db.delete(feedingSchedules).where(eq(feedingSchedules.id, id));
  }

  async toggleActive(id: number): Promise<FeedingSchedule> {
    const [schedule] = await this.db
      .update(feedingSchedules)
      .set({ isActive: !feedingSchedules.isActive, updatedAt: new Date() })
      .where(eq(feedingSchedules.id, id))
      .returning();
    return schedule;
  }

  async getActiveForDay(petId: number, dayOfWeek: string): Promise<FeedingSchedule[]> {
    return await this.db
      .select()
      .from(feedingSchedules)
      .where(
        and(
          eq(feedingSchedules.petId, petId),
          eq(feedingSchedules.isActive, true),
          eq(feedingSchedules.days, dayOfWeek)
        )
      );
  }
}
```

### Phase 4: Data Migration (15-20 minutes)

#### 4.1 Create Data Export Script
Create `scripts/export-prisma-data.js`:
```javascript
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function exportData() {
  try {
    const pets = await prisma.pet.findMany({
      include: {
        healthRecords: true,
        events: true,
        feedingSchedules: true,
      },
    });

    const exportData = {
      pets: pets.map(pet => ({
        ...pet,
        birthDate: pet.birthDate.toISOString(),
        createdAt: pet.createdAt.toISOString(),
        updatedAt: pet.updatedAt.toISOString(),
        healthRecords: pet.healthRecords.map(record => ({
          ...record,
          date: record.date.toISOString(),
          createdAt: record.createdAt.toISOString(),
          updatedAt: record.updatedAt.toISOString(),
        })),
        events: pet.events.map(event => ({
          ...event,
          startTime: event.startTime.toISOString(),
          endTime: event.endTime?.toISOString(),
          createdAt: event.createdAt.toISOString(),
          updatedAt: event.updatedAt.toISOString(),
        })),
        feedingSchedules: pet.feedingSchedules.map(schedule => ({
          ...schedule,
          createdAt: schedule.createdAt.toISOString(),
          updatedAt: schedule.updatedAt.toISOString(),
        })),
      })),
    };

    fs.writeFileSync('migration-data.json', JSON.stringify(exportData, null, 2));
    console.log('Data exported successfully to migration-data.json');
  } catch (error) {
    console.error('Export failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

exportData();
```

#### 4.2 Create Data Import Script
Create `scripts/import-drizzle-data.ts`:
```typescript
import { db } from '../db';
import { pets, healthRecords, events, feedingSchedules } from '../db/schema';
import fs from 'fs';

interface MigrationData {
  pets: any[];
}

async function importData() {
  try {
    const rawData = fs.readFileSync('migration-data.json', 'utf8');
    const data: MigrationData = JSON.parse(rawData);

    console.log('Starting data migration...');

    for (const petData of data.pets) {
      // Insert pet
      const [pet] = await db.insert(pets).values({
        name: petData.name,
        type: petData.type,
        breed: petData.breed,
        birthDate: new Date(petData.birthDate),
        weight: petData.weight,
        gender: petData.gender,
        profilePhoto: petData.profilePhoto,
      }).returning();

      console.log(`Imported pet: ${pet.name}`);

      // Insert health records
      if (petData.healthRecords?.length > 0) {
        await db.insert(healthRecords).values(
          petData.healthRecords.map((record: any) => ({
            petId: pet.id,
            type: record.type,
            title: record.title,
            description: record.description,
            date: new Date(record.date),
            vetName: record.vetName,
            cost: record.cost,
            notes: record.notes,
          }))
        );
        console.log(`Imported ${petData.healthRecords.length} health records`);
      }

      // Insert events
      if (petData.events?.length > 0) {
        await db.insert(events).values(
          petData.events.map((event: any) => ({
            petId: pet.id,
            title: event.title,
            description: event.description,
            startTime: new Date(event.startTime),
            endTime: event.endTime ? new Date(event.endTime) : null,
            type: event.type,
            isCompleted: event.isCompleted,
          }))
        );
        console.log(`Imported ${petData.events.length} events`);
      }

      // Insert feeding schedules
      if (petData.feedingSchedules?.length > 0) {
        await db.insert(feedingSchedules).values(
          petData.feedingSchedules.map((schedule: any) => ({
            petId: pet.id,
            name: schedule.name,
            time: schedule.time,
            days: schedule.days,
            foodType: schedule.foodType,
            portionSize: schedule.portionSize,
            instructions: schedule.instructions,
            isActive: schedule.isActive,
          }))
        );
        console.log(`Imported ${petData.feedingSchedules.length} feeding schedules`);
      }
    }

    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

importData();
```

### Phase 5: Cleanup & Optimization (10-15 minutes)

#### 5.1 Remove Prisma Files
```bash
rm -rf prisma/
rm lib/prisma.ts
rm migration-data.json
```

#### 5.2 Update Type Definitions
Update `lib/types.ts`:
```typescript
// Remove Prisma types and use Drizzle types
export type { Pet, HealthRecord, Event, FeedingSchedule } from '../db/schema';
export type { NewPet, NewHealthRecord, NewEvent, NewFeedingSchedule } from '../db/schema';
```

#### 5.3 Update App Initialization
Update main app files to use new database:
```typescript
// In your app initialization
import { db } from './db';

// Test database connection
console.log('Database initialized successfully');
```

## ⚠️ Risk Assessment & Mitigation

### High Risk Items
- **Data Loss**: Always backup existing database before migration
- **Schema Mismatch**: Double-check field types and constraints

### Medium Risk Items
- **Service Compatibility**: Test all CRUD operations after migration
- **Performance**: Monitor query performance after migration

### Low Risk Items
- **Bundle Size**: Should decrease after removing Prisma
- **Type Safety**: Drizzle provides excellent TypeScript support

## ✅ Migration Checklist

### Pre-Migration
- [ ] Backup existing database
- [ ] Document current data structure
- [ ] Test data export script
- [ ] Review dependencies

### Phase 1: Setup
- [ ] Install Drizzle dependencies
- [ ] Remove Prisma dependencies
- [ ] Update package.json scripts
- [ ] Create Drizzle config

### Phase 2: Schema
- [ ] Create Drizzle schema
- [ ] Set up database client
- [ ] Generate migration files
- [ ] Test schema creation

### Phase 3: Services
- [ ] Migrate PetService
- [ ] Create HealthRecordService
- [ ] Create EventService
- [ ] Create FeedingScheduleService
- [ ] Update service imports

### Phase 4: Data
- [ ] Export existing data
- [ ] Import to Drizzle
- [ ] Verify data integrity
- [ ] Test all operations

### Phase 5: Cleanup
- [ ] Remove Prisma files
- [ ] Update type definitions
- [ ] Clean up unused imports
- [ ] Update documentation

### Post-Migration
- [ ] Test all CRUD operations
- [ ] Verify data relationships
- [ ] Check app performance
- [ ] Update team documentation

## 🛠️ Common Drizzle Commands

```bash
# Generate migration files
npm run db:generate

# Apply migrations
npm run db:migrate

# Push schema changes (development)
npm run db:push

# Open Drizzle Studio
npm run db:studio

# Reset database
npm run db:reset

# Seed database
npm run db:seed
```

## 📚 Additional Resources

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Expo SQLite Documentation](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Drizzle + Expo SQLite Guide](https://orm.drizzle.team/docs/get-started/expo-sqlite)

## 🆘 Troubleshooting

### Common Issues

1. **Date Handling**: Drizzle stores dates as timestamps - ensure proper conversion
2. **Boolean Values**: SQLite stores booleans as integers (0/1)
3. **Relations**: Ensure proper foreign key constraints
4. **Migration Conflicts**: Drop and recreate if schema conflicts occur

### Performance Tips

1. Use indexes for frequently queried fields
2. Batch operations for multiple inserts/updates
3. Consider connection pooling for high-traffic scenarios
4. Monitor query performance with Drizzle Studio

---

**Estimated Total Time: 1.5 - 2 hours**
**Risk Level: Low-Medium**
**Backup Required: Yes**

This migration guide provides a step-by-step approach to successfully transition from Prisma to Drizzle with Expo-SQLite while maintaining data integrity and app functionality.