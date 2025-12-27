"use client";

import { useState } from "react";
import { useHospital } from "@/lib/store";
import { Doctor, Schedule, Department } from "@/types";
import { format } from "date-fns";
import { zhTW } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Activity, ArrowLeft, ArrowRight, Calendar, Check, Clock, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const steps = ["選擇科別", "選擇醫師", "選擇時間", "填寫資料", "完成掛號"];

export default function RegisterPage() {
    const { doctors, departments, getSchedulesByDoctor, addAppointment } = useHospital();

    const [currentStep, setCurrentStep] = useState(0);
    const [selectedDept, setSelectedDept] = useState<string>("");
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);

    const [patientForm, setPatientForm] = useState({
        name: "",
        idNumber: "",
        birthDate: "",
        phone: ""
    });

    const nextStep = () => setCurrentStep((p) => Math.min(p + 1, steps.length - 1));
    const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 0));

    const availableDoctors = doctors.filter(d => d.department === selectedDept);

    // Get future schedules for selected doctor
    const availableSchedules = selectedDoctor
        ? getSchedulesByDoctor(selectedDoctor.id)
            .filter(s => new Date(s.date) >= new Date())
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        : [];

    const handleRegister = () => {
        if (!selectedSchedule || !patientForm.name) return;

        addAppointment({
            id: `apt-${Date.now()}`,
            scheduleId: selectedSchedule.id,
            patient: patientForm,
            status: 'Confirmed',
            createdAt: new Date()
        });

        nextStep();
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12">
            <div className="container px-4 max-w-4xl mx-auto">

                {/* Progress Bar */}
                <div className="mb-12 relative">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-200 -translate-y-1/2 rounded-full" />
                    <div
                        className="absolute top-1/2 left-0 h-1 bg-primary -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
                        style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
                    />
                    <div className="relative flex justify-between">
                        {steps.map((step, i) => (
                            <div key={i} className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 transition-all duration-300 z-10 ${i <= currentStep ? "bg-primary border-white text-white shadow-md" : "bg-white border-slate-200 text-slate-400"
                                    }`}>
                                    {i < currentStep ? <Check className="w-5 h-5" /> : i + 1}
                                </div>
                                <span className={`text-xs font-medium mt-2 absolute -bottom-6 w-20 text-center transition-colors ${i <= currentStep ? "text-primary" : "text-slate-400"
                                    }`}>{step}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="mt-8 min-h-[400px]">
                    <AnimatePresence mode="wait">

                        {/* STEP 1: Department Selection */}
                        {currentStep === 0 && (
                            <motion.div
                                key="step0"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                                {departments.map((dept) => (
                                    <Card
                                        key={dept.id}
                                        className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group"
                                        onClick={() => { setSelectedDept(dept.id); nextStep(); }}
                                    >
                                        <CardContent className="p-6 flex items-center gap-6">
                                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500 group-hover:bg-primary group-hover:text-white transition-colors">
                                                <Activity className="w-8 h-8" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">{dept.name}</h3>
                                                <p className="text-slate-500 text-sm mt-1 line-clamp-2">{dept.description}</p>
                                            </div>
                                            <ArrowRight className="w-5 h-5 ml-auto text-slate-300 group-hover:text-primary" />
                                        </CardContent>
                                    </Card>
                                ))}
                            </motion.div>
                        )}

                        {/* STEP 2: Doctor Selection */}
                        {currentStep === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-2 mb-6 text-slate-500 bg-white p-3 rounded-lg shadow-sm w-fit cursor-pointer hover:text-primary" onClick={prevStep}>
                                    <ArrowLeft className="w-4 h-4" /> 回到科別選擇
                                </div>

                                <h2 className="text-2xl font-bold text-slate-900 mb-6">請選擇 {departments.find(d => d.id === selectedDept)?.name} 醫師</h2>

                                {availableDoctors.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-xl">
                                        <p className="text-slate-500">目前該科別暫無醫師排班。</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {availableDoctors.map((doc) => (
                                            <Card
                                                key={doc.id}
                                                className="cursor-pointer hover:border-primary hover:shadow-lg transition-all group overflow-hidden"
                                                onClick={() => { setSelectedDoctor(doc); nextStep(); }}
                                            >
                                                <div className="aspect-[4/3] relative bg-slate-100">
                                                    <img src={doc.imageUrl} className="w-full h-full object-cover" alt={doc.name} />
                                                </div>
                                                <CardContent className="p-4">
                                                    <h3 className="text-lg font-bold">{doc.name} 醫師</h3>
                                                    <p className="text-primary text-sm mb-2">{doc.title}</p>
                                                    <p className="text-slate-500 text-xs line-clamp-2">{doc.specialties.join("、")}</p>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* STEP 3: Time Selection */}
                        {currentStep === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <div className="flex items-center gap-2 mb-6 text-slate-500 bg-white p-3 rounded-lg shadow-sm w-fit cursor-pointer hover:text-primary" onClick={prevStep}>
                                    <ArrowLeft className="w-4 h-4" /> 重新選擇醫師
                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 mb-6 flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100 flex-shrink-0">
                                        <img src={selectedDoctor?.imageUrl} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">{selectedDoctor?.name} 醫師</h2>
                                        <p className="text-slate-500">{departments.find(d => d.id === selectedDept)?.name} | 門診時刻表</p>
                                    </div>
                                </div>

                                {availableSchedules.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-xl">
                                        <p className="text-slate-500">該醫師近期無可預約診次。</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {availableSchedules.map((schedule) => (
                                            <Card
                                                key={schedule.id}
                                                className={`cursor-pointer transition-all border-l-4 ${schedule.currentPatients >= schedule.maxPatients
                                                        ? "opacity-50 pointer-events-none border-l-slate-300"
                                                        : "hover:shadow-md hover:translate-x-1 border-l-primary"
                                                    }`}
                                                onClick={() => { setSelectedSchedule(schedule); nextStep(); }}
                                            >
                                                <CardContent className="p-4 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-bold text-lg text-slate-800">
                                                            {format(new Date(schedule.date), 'MM/dd (eeee)', { locale: zhTW })}
                                                        </p>
                                                        <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                                                            <Clock className="w-4 h-4" />
                                                            <span>{schedule.timeSlot === 'Morning' ? '上午' : schedule.timeSlot === 'Afternoon' ? '下午' : '夜間'} {schedule.startTime}</span>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className={`text-sm font-bold ${schedule.currentPatients >= schedule.maxPatients ? 'text-red-500' : 'text-emerald-600'}`}>
                                                            {schedule.currentPatients >= schedule.maxPatients ? '額滿' : '可預約'}
                                                        </span>
                                                        <p className="text-xs text-slate-400 mt-1">
                                                            已掛 {schedule.currentPatients}/{schedule.maxPatients}
                                                        </p>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                )}
                            </motion.div>
                        )}

                        {/* STEP 4: Patient Info */}
                        {currentStep === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="max-w-2xl mx-auto"
                            >
                                <div className="flex items-center gap-2 mb-6 text-slate-500 cursor-pointer hover:text-primary" onClick={prevStep}>
                                    <ArrowLeft className="w-4 h-4" /> 重選時間
                                </div>

                                <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                                    <div className="bg-primary/5 p-6 border-b border-primary/10">
                                        <h2 className="text-xl font-bold text-primary flex items-center gap-2">
                                            <Calendar className="w-5 h-5" /> 預約資訊確認
                                        </h2>
                                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <p className="text-slate-500">預約醫師</p>
                                                <p className="font-medium">{selectedDoctor?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">看診科別</p>
                                                <p className="font-medium">{departments.find(d => d.id === selectedDept)?.name}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">看診日期</p>
                                                <p className="font-medium text-lg text-slate-900">
                                                    {selectedSchedule && format(new Date(selectedSchedule.date), 'yyyy/MM/dd (eeee)', { locale: zhTW })}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">時段</p>
                                                <p className="font-medium">
                                                    {selectedSchedule?.timeSlot === 'Morning' ? '上午' : selectedSchedule?.timeSlot === 'Afternoon' ? '下午' : '夜間'}
                                                    ({selectedSchedule?.startTime})
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-8 space-y-6">
                                        <h3 className="font-bold text-lg border-b pb-2 mb-4">填寫基本資料</h3>

                                        <div className="grid gap-2">
                                            <Label htmlFor="p-name">姓名</Label>
                                            <Input
                                                id="p-name"
                                                placeholder="請輸入真實姓名"
                                                value={patientForm.name}
                                                onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="p-id">身分證字號</Label>
                                            <Input
                                                id="p-id"
                                                placeholder="A123456789"
                                                value={patientForm.idNumber}
                                                onChange={(e) => setPatientForm({ ...patientForm, idNumber: e.target.value.toUpperCase() })}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="p-birth">出生年月日</Label>
                                            <Input
                                                id="p-birth"
                                                type="date"
                                                value={patientForm.birthDate}
                                                onChange={(e) => setPatientForm({ ...patientForm, birthDate: e.target.value })}
                                            />
                                        </div>

                                        <div className="grid gap-2">
                                            <Label htmlFor="p-phone">手機號碼</Label>
                                            <Input
                                                id="p-phone"
                                                placeholder="0912345678"
                                                value={patientForm.phone}
                                                onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                                            />
                                        </div>

                                        <Button
                                            size="lg"
                                            className="w-full mt-6 text-lg h-12"
                                            onClick={handleRegister}
                                            disabled={!patientForm.name || !patientForm.idNumber || !patientForm.phone}
                                        >
                                            確認掛號
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* STEP 5: Success */}
                        {currentStep === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center max-w-lg mx-auto bg-white p-12 rounded-3xl shadow-xl border border-slate-100"
                            >
                                <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="w-12 h-12" />
                                </div>
                                <h2 className="text-3xl font-bold text-slate-900 mb-2">掛號成功！</h2>
                                <p className="text-slate-500 mb-8">您的預約已完成，請準時報到。</p>

                                <div className="bg-slate-50 rounded-xl p-6 text-left space-y-3 mb-8">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">預約號碼</span>
                                        <span className="font-bold text-2xl text-primary"># {Math.floor(Math.random() * 50) + 1}</span>
                                    </div>
                                    <div className="flex justify-between border-t border-slate-200 pt-3">
                                        <span className="text-slate-500">醫師</span>
                                        <span className="font-medium">{selectedDoctor?.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">時間</span>
                                        <span className="font-medium">
                                            {selectedSchedule && format(new Date(selectedSchedule.date), 'MM/dd')} {selectedSchedule?.timeSlot === 'Morning' ? '早' : '午'}
                                        </span>
                                    </div>
                                </div>

                                <Button asChild variant="outline" className="w-full">
                                    <a href="/">返回首頁</a>
                                </Button>
                            </motion.div>
                        )}

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
