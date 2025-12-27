"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Doctor, Schedule, Department, Appointment } from "@/types";
import {
    getDoctorsAction,
    getDepartmentsAction,
    getSchedulesAction,
    getAppointmentsAction,
    addDoctorAction,
    deleteDoctorAction as deleteDoctorServer,
    addScheduleAction,
    deleteScheduleAction as deleteScheduleServer,
    createAppointmentAction
} from "@/lib/actions";

interface HospitalContextType {
    doctors: Doctor[];
    schedules: Schedule[];
    departments: Department[];
    appointments: Appointment[];
    isLoading: boolean;
    addDoctor: (doctor: Doctor) => Promise<void>;
    updateDoctor: (doctor: Doctor) => void;
    deleteDoctor: (id: string) => Promise<void>;
    addSchedule: (schedule: Schedule) => Promise<void>;
    deleteSchedule: (id: string) => Promise<void>;
    addAppointment: (appointment: Appointment) => Promise<void>;
    getSchedulesByDoctor: (doctorId: string) => Schedule[];
    getSchedulesByDate: (date: Date) => Schedule[];
}

const HospitalContext = createContext<HospitalContextType | undefined>(undefined);

export function HospitalProvider({ children }: { children: React.ReactNode }) {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load initial data from Server Actions
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [docs, depts, scheds, appts] = await Promise.all([
                    getDoctorsAction(),
                    getDepartmentsAction(),
                    getSchedulesAction(),
                    getAppointmentsAction()
                ]);

                setDoctors(docs);
                setDepartments(depts);
                setSchedules(scheds);
                setAppointments(appts);
            } catch (error) {
                console.error("Failed to fetch initial data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const addDoctor = async (doctor: Doctor) => {
        // Optimistic update
        setDoctors((prev) => [...prev, doctor]);
        try {
            await addDoctorAction(doctor);
        } catch (e) {
            console.error("Failed to add doctor", e);
            // Rollback
            setDoctors((prev) => prev.filter(d => d.id !== doctor.id));
        }
    };

    const updateDoctor = (doctor: Doctor) => {
        setDoctors((prev) => prev.map((d) => (d.id === doctor.id ? doctor : d)));
        // TODO: Implement server update action
    };

    const deleteDoctor = async (id: string) => {
        const prevDoctors = [...doctors];
        setDoctors((prev) => prev.filter((d) => d.id !== id));
        try {
            await deleteDoctorServer(id);
        } catch (e) {
            console.error(e);
            setDoctors(prevDoctors);
        }
    };

    const addSchedule = async (schedule: Schedule) => {
        setSchedules((prev) => [...prev, schedule]);
        try {
            await addScheduleAction(schedule);
        } catch (e) {
            console.error(e);
            setSchedules((prev) => prev.filter(s => s.id !== schedule.id));
        }
    };

    const deleteSchedule = async (id: string) => {
        const prevSchedules = [...schedules];
        setSchedules((prev) => prev.filter((s) => s.id !== id));
        try {
            await deleteScheduleServer(id);
        } catch (e) {
            console.error(e);
            setSchedules(prevSchedules);
        }
    };

    const addAppointment = async (appointment: Appointment) => {
        setAppointments((prev) => [...prev, appointment]);
        // Also update current patients count in schedule optimistically
        setSchedules((prev) => prev.map(s => {
            if (s.id === appointment.scheduleId) {
                return { ...s, currentPatients: s.currentPatients + 1 };
            }
            return s;
        }));

        try {
            await createAppointmentAction(appointment);
        } catch (e) {
            console.error(e);
            // Rollback? Complicated for nested update, simplifying for demo
        }
    };

    const getSchedulesByDoctor = (doctorId: string) => {
        return schedules.filter((s) => s.doctorId === doctorId);
    };

    const getSchedulesByDate = (date: Date) => {
        return schedules.filter((s) =>
            new Date(s.date).getDate() === date.getDate() &&
            new Date(s.date).getMonth() === date.getMonth() &&
            new Date(s.date).getFullYear() === date.getFullYear()
        );
    };

    return (
        <HospitalContext.Provider
            value={{
                doctors,
                schedules,
                departments,
                appointments,
                isLoading,
                addDoctor,
                updateDoctor,
                deleteDoctor,
                addSchedule,
                deleteSchedule,
                addAppointment,
                getSchedulesByDoctor,
                getSchedulesByDate,
            }}
        >
            {children}
        </HospitalContext.Provider>
    );
}

export function useHospital() {
    const context = useContext(HospitalContext);
    if (context === undefined) {
        throw new Error("useHospital must be used within a HospitalProvider");
    }
    return context;
}
