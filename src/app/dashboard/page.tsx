"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DEMO_ORG_ID } from "@/lib/constants";
import { Users, Briefcase, CheckCircle, TrendingUp, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalCandidates: 0,
    activeJobs: 0,
    totalHired: 0
  });
  
  const [topMatches, setTopMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);

      // 1. TOPLAM ADAY SAYISI
      const { count: candidateCount } = await supabase
        .from("candidates")
        .select("*", { count: "exact", head: true }) // head: true sadece sayıyı getirir, veriyi değil (performans için)
        .eq("organization_id", DEMO_ORG_ID);

      // 2. AÇIK POZİSYONLAR
      const { count: openJobCount } = await supabase
        .from("job_openings")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", DEMO_ORG_ID)
        .eq("status", "open");

      // 3. İŞE ALINANLAR (Kapanmış ve Sebebi 'Hired' olanlar)
      const { count: hiredCount } = await supabase
        .from("job_openings")
        .select("*", { count: "exact", head: true })
        .eq("organization_id", DEMO_ORG_ID)
        .eq("status", "closed")
        .eq("close_reason", "hired");

      setStats({
        totalCandidates: candidateCount || 0,
        activeJobs: openJobCount || 0,
        totalHired: hiredCount || 0
      });

      // 4. SON EŞLEŞMELER (Puanı yüksek olanlar)
      // İlişkili tablolardan Aday Adı ve Pozisyon Başlığını çekiyoruz
      const { data: matches } = await supabase
        .from("matches")
        .select(`
            match_score,
            ai_reason,
            created_at,
            candidates(full_name),
            job_openings(
                positions(title)
            )
        `)
        .order("match_score", { ascending: false }) // En yüksek puanlılar
        .limit(5);

      if (matches) setTopMatches(matches);
      
      setLoading(false);
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* BAŞLIK */}
      <div>
        <h2 className="text-3xl font-bold text-slate-800">Dashboard</h2>
        <p className="text-slate-500">Welcome back, here is your recruitment overview.</p>
      </div>

      {/* KPI KARTLARI (GERÇEK VERİ) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: CANDIDATES */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Total Candidates</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">
                    {loading ? "..." : stats.totalCandidates}
                </h3>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                <Users size={24} />
            </div>
        </div>

        {/* CARD 2: ACTIVE JOBS */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Active Recruitments</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">
                    {loading ? "..." : stats.activeJobs}
                </h3>
            </div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                <Briefcase size={24} />
            </div>
        </div>

        {/* CARD 3: HIRES */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">Successful Hires</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">
                    {loading ? "..." : stats.totalHired}
                </h3>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                <CheckCircle size={24} />
            </div>
        </div>
      </div>

      {/* ALT BÖLÜM: TOP MATCHES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SOL: EN İYİ EŞLEŞMELER LİSTESİ */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="text-blue-600" size={20}/> Top AI Recommendations
                </h3>
                <Link href="/dashboard/open-positions">
                    <Button variant="ghost" size="sm" className="text-xs">View All</Button>
                </Link>
             </div>
             
             <div className="divide-y divide-slate-50">
                {loading ? (
                    <div className="p-6 text-center text-slate-400">Loading AI data...</div>
                ) : topMatches.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 italic">No matches generated yet. Start a recruitment to see results.</div>
                ) : (
                    topMatches.map((match, i) => (
                        <div key={i} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4">
                            {/* Puan Yuvarlağı */}
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 
                                ${match.match_score >= 80 ? 'border-green-500 text-green-700 bg-green-50' : 
                                  match.match_score >= 50 ? 'border-yellow-500 text-yellow-700 bg-yellow-50' : 
                                  'border-red-500 text-red-700 bg-red-50'}`}>
                                {match.match_score}
                            </div>
                            
                            <div className="flex-1">
                                <div className="font-semibold text-slate-800">
                                    {match.candidates?.full_name || "Unknown Candidate"}
                                </div>
                                <div className="text-xs text-slate-500">
                                    Recommended for <span className="font-medium text-slate-700">{match.job_openings?.positions?.title}</span>
                                </div>
                            </div>
                            
                            <div className="hidden md:block w-1/3 text-xs text-slate-400 truncate" title={match.ai_reason}>
                                {match.ai_reason}
                            </div>

                            <Link href="/dashboard/open-positions">
                                <ArrowRight size={16} className="text-slate-300 hover:text-blue-600 cursor-pointer"/>
                            </Link>
                        </div>
                    ))
                )}
             </div>
          </div>

          {/* SAĞ: HIZLI AKSİYONLAR (STATİK) */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl shadow-lg p-6 text-white flex flex-col justify-between">
             <div>
                <div className="w-12 h-12 bg-white/10 rounded-lg flex items-center justify-center mb-4">
                    <Star className="text-yellow-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">Upgrade Your Pool</h3>
                <p className="text-slate-300 text-sm mb-6">
                    You can add more candidates to get better AI matches. Upload PDFs in bulk.
                </p>
             </div>
             <Link href="/dashboard/candidates">
                <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold">
                    Upload Candidates
                </Button>
             </Link>
          </div>
      </div>
    </div>
  );
}