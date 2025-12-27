"use server";

import { prisma } from "@/lib/prisma";
import { Doctor, Schedule, Department, Appointment, Patient } from "@/types";
import { revalidatePath } from "next/cache";

// --- Doctors ---

export async function getDoctorsAction(): Promise<Doctor[]> {
    const doctors = await prisma.doctor.findMany({
        include: {
            specialties: true,
            department: true
        }
    });

    return doctors.map(doc => ({
        id: doc.id,
        name: doc.name,
        department: doc.departmentId, // Frontend expects ID string currently
        title: doc.title,
        specialties: doc.specialties.map(s => s.name),
        imageUrl: doc.imageUrl,
        introduction: doc.introduction,
        isAvailable: doc.isAvailable
    }));
}

export async function addDoctorAction(data: Doctor): Promise<Doctor> {
    // 1. Handle specialties (find or create)
    // For simplicity, we assume they are passed as strings
    const specialtyConnects = [];
    if (data.specialties) {
        for (const name of data.specialties) {
            const spec = await prisma.specialty.findFirst({ where: { name } })
                ?? await prisma.specialty.create({ data: { name } });
            specialtyConnects.push({ id: spec.id });
        }
    }

    const newDoc = await prisma.doctor.create({
        data: {
            id: data.id, // We allow client-gen ID for now, or could let DB handle it
            name: data.name,
            title: data.title,
            introduction: data.introduction,
            imageUrl: data.imageUrl,
            departmentId: data.department,
            isAvailable: data.isAvailable ?? true,
            specialties: {
                connect: specialtyConnects
            }
        },
        include: { specialties: true }
    });

    revalidatePath('/doctors');
    revalidatePath('/admin/doctors');

    return {
        ...newDoc,
        department: newDoc.departmentId,
        specialties: newDoc.specialties.map(s => s.name),
    };
}

export async function deleteDoctorAction(id: string) {
    await prisma.doctor.delete({
        where: { id }
    });
    revalidatePath('/doctors');
    revalidatePath('/admin/doctors');
}

// --- Schedules ---

export async function getSchedulesAction(): Promise<Schedule[]> {
    const schedules = await prisma.schedule.findMany();
    // Prisma DateTime is Date object, which matches our Type.
    // ENUM mapping might be needed if I used enum in schema, but I used string there too.

    return schedules.map(s => ({
        id: s.id,
        doctorId: s.doctorId,
        date: s.date,
        timeSlot: s.timeSlot as 'Morning' | 'Afternoon' | 'Evening',
        startTime: s.startTime,
        endTime: s.endTime,
        maxPatients: s.maxPatients,
        currentPatients: s.currentPatients,
        isAvailable: s.isAvailable
    }));
}

export async function addScheduleAction(data: Schedule) {
    await prisma.schedule.create({
        data: {
            id: data.id,
            date: data.date,
            timeSlot: data.timeSlot,
            startTime: data.startTime,
            endTime: data.endTime,
            maxPatients: data.maxPatients,
            currentPatients: data.currentPatients,
            isAvailable: data.isAvailable,
            doctorId: data.doctorId
        }
    });
    revalidatePath('/schedule');
    revalidatePath('/admin/schedule');
}

export async function deleteScheduleAction(id: string) {
    await prisma.schedule.delete({ where: { id } });
    revalidatePath('/schedule');
    revalidatePath('/admin/schedule');
}

// --- Departments ---

export async function getDepartmentsAction(): Promise<Department[]> {
    return await prisma.department.findMany();
}

// --- Appointments ---

export async function getAppointmentsAction(): Promise<Appointment[]> {
    const appts = await prisma.appointment.findMany();
    return appts.map(a => ({
        id: a.id,
        scheduleId: a.scheduleId,
        status: a.status as 'Pending' | 'Confirmed' | 'Cancelled',
        createdAt: a.createdAt,
        patient: {
            name: a.patientName,
            idNumber: a.patientIdNumber,
            birthDate: a.patientBirthDate,
            phone: a.patientPhone,
            email: a.patientEmail || undefined
        }
    }));
}

export async function createAppointmentAction(appt: Appointment) {
    // 1. Create Appointment
    const newAppt = await prisma.appointment.create({
        data: {
            id: appt.id,
            status: appt.status,
            createdAt: appt.createdAt,
            patientName: appt.patient.name,
            patientIdNumber: appt.patient.idNumber,
            patientBirthDate: appt.patient.birthDate,
            patientPhone: appt.patient.phone,
            patientEmail: appt.patient.email,
            scheduleId: appt.scheduleId
        }
    });

    // 2. Update Schedule count
    await prisma.schedule.update({
        where: { id: appt.scheduleId },
        data: {
            currentPatients: {
                increment: 1
            }
        }
    });

    revalidatePath('/register');
    revalidatePath('/admin');
    return newAppt;
}
