"use client";

import { useState } from "react";
import { useHospital } from "@/lib/store";
import { Schedule } from "@/types";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Clock, User } from "lucide-react";

export default function SchedulePage() {
    const { doctors, schedules, addSchedule, deleteSchedule } = useHospital();
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    // Schedule form state for the selected date
    const [slots, setSlots] = useState({
        Morning: { active: false, max: 30, start: "09:00", end: "12:00" },
        Afternoon: { active: false, max: 30, start: "14:00", end: "17:00" },
        Evening: { active: false, max: 30, start: "18:00", end: "21:00" },
    });

    // When date or doctor changes, load existing schedules
    const updateFormFromSchedule = (date: Date, docId: string) => {
        // Reset defaults first
        const newSlots = {
            Morning: { active: false, max: 30, start: "09:00", end: "12:00" },
            Afternoon: { active: false, max: 30, start: "14:00", end: "17:00" },
            Evening: { active: false, max: 30, start: "18:00", end: "21:00" },
        };

        if (!docId || !date) {
            setSlots(newSlots);
            return;
        }

        const existingSchedules = schedules.filter(s =>
            s.doctorId === docId &&
            s.date.getDate() === date.getDate() &&
            s.date.getMonth() === date.getMonth() &&
            s.date.getFullYear() === date.getFullYear()
        );

        existingSchedules.forEach(s => {
            if (s.timeSlot in newSlots) {
                newSlots[s.timeSlot as keyof typeof newSlots] = {
                    active: true,
                    max: s.maxPatients,
                    start: s.startTime,
                    end: s.endTime
                };
            }
        });

        setSlots(newSlots);
    };

    const handleDateSelect = (date: Date | undefined) => {
        setSelectedDate(date);
        if (date && selectedDoctorId) {
            updateFormFromSchedule(date, selectedDoctorId);
        }
    };

    const handleDoctorSelect = (docId: string) => {
        setSelectedDoctorId(docId);
        if (selectedDate && docId) {
            updateFormFromSchedule(selectedDate, docId);
        }
    }

    const handleSave = () => {
        if (!selectedDate || !selectedDoctorId) return;

        // First delete existing schedules for this day/doctor to avoid duplicates
        // In a real app, we might update ID-wise, but here replacing is easier
        const existing = schedules.filter(s =>
            s.doctorId === selectedDoctorId &&
            s.date.getDate() === selectedDate.getDate() &&
            s.date.getMonth() === selectedDate.getMonth() &&
            s.date.getFullYear() === selectedDate.getFullYear()
        );
        existing.forEach(s => deleteSchedule(s.id));

        // Add new schedules based on form
        Object.entries(slots).forEach(([slotName, data]) => {
            if (data.active) {
                const newSchedule: Schedule = {
                    id: `${selectedDoctorId}-${format(selectedDate, 'yyyyMMdd')}-${slotName}`,
                    doctorId: selectedDoctorId,
                    date: selectedDate,
                    timeSlot: slotName as 'Morning' | 'Afternoon' | 'Evening',
                    startTime: data.start,
                    endTime: data.end,
                    maxPatients: data.max,
                    currentPatients: 0,
                    isAvailable: true
                };
                addSchedule(newSchedule);
            }
        });

        // Provide feedback (simple alert for now)
        alert("排班已更新！");
    };

    return (
        <div className="space-y-8 h-full">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">門診排程</h2>
                <p className="text-slate-500 mt-1">設定醫師的看診時段。</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-full">
                {/* Left Panel: Controls */}
                <div className="lg:col-span-4 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>1. 選擇醫師</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Select onValueChange={handleDoctorSelect} value={selectedDoctorId}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="請選擇醫師" />
                                </SelectTrigger>
                                <SelectContent>
                                    {doctors.map(d => (
                                        <SelectItem key={d.id} value={d.id}>{d.name} ({d.title})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardContent>
                    </Card>

                    <Card className={!selectedDoctorId ? "opacity-50 pointer-events-none" : ""}>
                        <CardHeader>
                            <CardTitle>2. 選擇日期</CardTitle>
                        </CardHeader>
                        <CardContent className="flex justify-center">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                className="rounded-md border shadow-sm"
                                locale={zhTW}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Right Panel: Time Slots configuration */}
                <div className="lg:col-span-8">
                    <Card className={`h-full ${!selectedDoctorId || !selectedDate ? "opacity-50 pointer-events-none" : ""}`}>
                        <CardHeader>
                            <CardTitle className="flex justify-between items-center">
                                <span>3. 設定時段 - {selectedDate ? format(selectedDate, 'yyyy年MM月dd日 (eeee)', { locale: zhTW }) : ''}</span>
                                <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
                                    <Check className="w-4 h-4 mr-2" />
                                    儲存排班
                                </Button>
                            </CardTitle>
                            <CardDescription>
                                勾選啟用的時段，並設定看診時間與人數上限。
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {(['Morning', 'Afternoon', 'Evening'] as const).map(slot => (
                                <div key={slot} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                                    <div className="flex items-center gap-4 min-w-[150px]">
                                        <Switch
                                            checked={slots[slot].active}
                                            onCheckedChange={(checked) => setSlots({
                                                ...slots,
                                                [slot]: { ...slots[slot], active: checked }
                                            })}
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-800">
                                                {slot === 'Morning' ? '上午診' : slot === 'Afternoon' ? '下午診' : '夜診'}
                                            </span>
                                            <span className="text-xs text-slate-500">
                                                {slots[slot].start} - {slots[slot].end}
                                            </span>
                                        </div>
                                    </div>

                                    {slots[slot].active && (
                                        <div className="flex-1 flex gap-4 w-full sm:w-auto animate-in fade-in slide-in-from-left-4 duration-300">
                                            <div className="grid gap-2 flex-1">
                                                <Label htmlFor={`${slot}-start`} className="text-xs">開始時間</Label>
                                                <Input
                                                    id={`${slot}-start`}
                                                    value={slots[slot].start}
                                                    onChange={(e) => setSlots({
                                                        ...slots,
                                                        [slot]: { ...slots[slot], start: e.target.value }
                                                    })}
                                                    className="h-8"
                                                />
                                            </div>
                                            <div className="grid gap-2 flex-1">
                                                <Label htmlFor={`${slot}-end`} className="text-xs">結束時間</Label>
                                                <Input
                                                    id={`${slot}-end`}
                                                    value={slots[slot].end}
                                                    onChange={(e) => setSlots({
                                                        ...slots,
                                                        [slot]: { ...slots[slot], end: e.target.value }
                                                    })}
                                                    className="h-8"
                                                />
                                            </div>
                                            <div className="grid gap-2 w-24">
                                                <Label htmlFor={`${slot}-max`} className="text-xs">人數上限</Label>
                                                <Input
                                                    id={`${slot}-max`}
                                                    type="number"
                                                    value={slots[slot].max}
                                                    onChange={(e) => setSlots({
                                                        ...slots,
                                                        [slot]: { ...slots[slot], max: parseInt(e.target.value) || 0 }
                                                    })}
                                                    className="h-8"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
