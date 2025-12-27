"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, Clock, Star, Users, Activity, Baby, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { useHospital } from "@/lib/store";

export default function Home() {
  const { doctors, departments } = useHospital();

  // Animation variants
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2953&auto=format&fit=crop')"
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-teal-900/90 to-teal-800/40 backdrop-blur-[2px]" />
        </div>

        <div className="container relative z-10 px-4 md:px-6">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-3xl space-y-6"
          >
            <motion.div variants={fadeIn}>
              <Badge className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-md border-none px-4 py-1.5 text-sm uppercase tracking-wider mb-4">
                專業 • 主動 • 用心
              </Badge>
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              守護您與家人的健康<br />
              <span className="text-accent">我們一直都在</span>
            </motion.h1>

            <motion.p variants={fadeIn} className="text-lg md:text-xl text-slate-100 max-w-2xl leading-relaxed">
              四季台安醫院引進尖端醫療設備，匯聚頂尖醫療團隊，為南台灣民眾提供醫學中心等級的專業照護。我們不僅治療疾病，更在乎您的感受。
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-wrap gap-4 pt-4">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-accent text-accent-foreground hover:bg-white hover:text-primary transition-all shadow-lg hover:shadow-xl">
                  立即掛號 <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-white/30 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
                  了解更多
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="absolute bottom-0 left-0 right-0 z-20 hidden lg:block"
        >
          <div className="container mx-auto px-6 pb-6">
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-t-2xl shadow-2xl border-t-4 border-primary group hover:-translate-y-2 transition-transform duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-teal-50 rounded-xl text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">門診時間</h3>
                    <p className="text-slate-500 text-sm">週一至週六<br />早 09:00 - 晚 21:00</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-t-2xl shadow-2xl border-t-4 border-accent group hover:-translate-y-2 transition-transform duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-cyan-50 rounded-xl text-accent-foreground group-hover:bg-accent group-hover:text-white transition-colors">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">專業團隊</h3>
                    <p className="text-slate-500 text-sm">由醫學中心主任級醫師<br />親自為您看診</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/95 backdrop-blur-sm p-6 rounded-t-2xl shadow-2xl border-t-4 border-pink-400 group hover:-translate-y-2 transition-transform duration-300">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-pink-50 rounded-xl text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-colors">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">急診照護</h3>
                    <p className="text-slate-500 text-sm">24小時婦產科急診<br />全年無休</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Departments Section */}
      <section className="py-24 bg-slate-50">
        <div className="container px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">全方位的醫療服務</h2>
            <p className="text-slate-600 text-lg">我們提供多元且專業的診療科別，滿足不同年齡層與性別的健康需求</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {departments.map((dept, index) => (
              <motion.div
                key={dept.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full border-none shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-primary to-accent" />
                  <CardContent className="p-8 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 text-primary group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                      {/* Using generic icons based on mapping or fallback */}
                      <Activity className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-3">{dept.name}</h3>
                    <p className="text-slate-500 leading-relaxed mb-6">
                      {dept.description}
                    </p>
                    <Button variant="ghost" className="mt-auto text-primary hover:text-primary-foreground hover:bg-primary group-hover:translate-x-1 transition-all">
                      了解詳情 <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Doctors Section */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">優質醫療團隊</h2>
              <p className="text-slate-600 text-lg">匯聚各專科領域權威醫師，提供值得信賴的醫療品質</p>
            </div>
            <Link href="/doctors">
              <Button variant="outline" className="hidden md:flex">
                查看所有醫師 <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {doctors.slice(0, 4).map((doctor, index) => (
              <motion.div
                key={doctor.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative"
              >
                <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 relative shadow-md">
                  {/* Fallback image if needed */}
                  <img
                    src={doctor.imageUrl}
                    alt={doctor.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-accent font-medium text-sm mb-1">{doctor.title}</p>
                    <h3 className="text-2xl font-bold mb-2">{doctor.name} 醫師</h3>
                    <p className="text-slate-300 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                      {doctor.introduction}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden">
            <Link href="/doctors">
              <Button variant="outline" className="w-full">
                查看所有醫師 <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        <div className="container relative z-10 px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">準備好預約看診了嗎？</h2>
          <p className="text-teal-100 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            透過我們的線上掛號系統，您可以輕鬆查詢醫師門診時間並完成預約，省去現場排隊的等待時間。
          </p>
          <Link href="/register">
            <Button size="lg" className="h-16 px-10 text-xl rounded-full bg-white text-primary hover:bg-slate-100 hover:scale-105 transition-all shadow-2xl">
              立即前往掛號
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
