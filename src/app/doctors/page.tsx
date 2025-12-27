"use client";


import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useHospital } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Stethoscope, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";


function DoctorsContent() {
    const { doctors, departments } = useHospital();
    const searchParams = useSearchParams();
    const initialDept = searchParams?.get("dept") || "all";


    const [activeDept, setActiveDept] = useState(initialDept);
    const [searchTerm, setSearchTerm] = useState("");


    const filteredDoctors = doctors.filter(doc => {
        const matchesDept = activeDept === "all" || doc.department === activeDept;
        const matchesSearch = doc.name.includes(searchTerm) || doc.specialties.some(s => s.includes(searchTerm));
        return matchesDept && matchesSearch;
    });


    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-16">
            <div className="container px-4 md:px-6 mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <h1 className="text-4xl font-bold text-slate-900 mb-4">專業醫療團隊</h1>
                    <p className="text-lg text-slate-600">
                        我們擁有經驗豐富的專科醫師陣容，以視病猶親的態度，提供您最專業的醫療照護。
                    </p>
                </div>

export default function DoctorsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DoctorsContent />
    </Suspense>
  );
                }
