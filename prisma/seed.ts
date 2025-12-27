import { PrismaClient } from '@prisma/client'
import { departments, initialDoctors, initialSchedules } from '../src/lib/mock-data'

const prisma = new PrismaClient()

async function main() {
    console.log('Start seeding ...')

    // 1. Seed Departments
    for (const dept of departments) {
        await prisma.department.upsert({
            where: { id: dept.id },
            update: {},
            create: {
                id: dept.id,
                name: dept.name,
                description: dept.description,
                icon: dept.icon,
            },
        })
    }

    // 2. Seed Doctors & Specialties
    for (const doc of initialDoctors) {
        // Create doctor
        const createdDoctor = await prisma.doctor.upsert({
            where: { id: doc.id },
            update: {},
            create: {
                id: doc.id,
                name: doc.name,
                title: doc.title,
                departmentId: doc.department,
                introduction: doc.introduction,
                imageUrl: doc.imageUrl,
                isAvailable: doc.isAvailable ?? true,
            }
        })

        // Handle Specialties
        for (const specName of doc.specialties) {
            // Find or create specialty
            // Note: This simple logic might create duplicates if not careful, but upsert helps.
            // However, managing the many-to-many relation in seeding usually requires connecting.
            // Simplest way: Try to find specialty by name, if not exist create. Then connect to doctor.

            const specialty = await prisma.specialty.findFirst({ where: { name: specName } }) ??
                await prisma.specialty.create({ data: { name: specName } })

            // Connect
            await prisma.doctor.update({
                where: { id: createdDoctor.id },
                data: {
                    specialties: {
                        connect: { id: specialty.id }
                    }
                }
            })
        }
    }

    // 3. Seed Schedules (Re-generate dates relative to today for valid demo)
    // We can reuse the logic from mock-data but need to adapt to Prisma

    // Since we imported `initialSchedules`, they have hardcoded dates generated at runtime of the import.
    // Ideally, we regenerate them here to ensure they are fresh "Next 2 weeks" from the moment we seed.

    const { addDays, format } = require("date-fns");

    // Clear old schedules for cleanliness if re-seeding? Maybe better not to delete all in production but for dev it is fine.
    // await prisma.schedule.deleteMany({}) 

    const doctorIds = initialDoctors.map(d => d.id)
    const timeSlots = [
        { slot: 'Morning', start: '09:00', end: '12:00' },
        { slot: 'Afternoon', start: '14:00', end: '17:00' },
        { slot: 'Evening', start: '18:00', end: '21:00' }
    ];

    const today = new Date();

    for (const doctorId of doctorIds) {
        for (let i = 0; i < 14; i++) {
            const currentDate = addDays(today, i);
            const dayOfWeek = currentDate.getDay();

            if (dayOfWeek === 0) continue;

            for (const slot of timeSlots) {
                if (Math.random() > 0.4) {
                    const scheduleId = `${doctorId}-${format(currentDate, 'yyyyMMdd')}-${slot.slot}`;

                    // Upsert schedule
                    await prisma.schedule.upsert({
                        where: { id: scheduleId },
                        update: {},
                        create: {
                            id: scheduleId,
                            date: currentDate,
                            timeSlot: slot.slot,
                            startTime: slot.start,
                            endTime: slot.end,
                            maxPatients: 30,
                            currentPatients: Math.floor(Math.random() * 5),
                            isAvailable: true,
                            doctorId: doctorId
                        }
                    })
                }
            }
        }
    }

    console.log('Seeding finished.')
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
