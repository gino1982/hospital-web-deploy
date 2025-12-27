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
          <h1 className="text-4xl font-bold text-slate-900 mb-4">Medical Team</h1>
        </div>
        <div className="mb-12 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search..."
                className="pl-10 h-12 bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setActiveDept("all")} variant={activeDept === "all" ? "default" : "outline"}>All</Button>
              {departments.map(d => <Button key={d.id} onClick={() => setActiveDept(d.name)} variant={activeDept === d.name ? "default" : "outline"}>{d.name}</Button>)}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id}>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold">{doctor.name}</h3>
                <p className="text-primary">{doctor.title}</p>
                <div className="mt-4 pt-4 border-t">
                  <Link href={"/register?doctor=" + doctor.id}>
                    <Button className="w-full">Register Now</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DoctorsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DoctorsContent />
    </Suspense>
  );
}
