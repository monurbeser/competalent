"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DEMO_ORG_ID } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, CheckCircle, XCircle, User, Briefcase, Clock, Archive } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";

type ClosedJob = {
  id: string;
  position_title: string;
  created_at: string;
  closed_at: string;
  close_reason: "hired" | "cancelled";
  hired_candidate_name?: string;
};

export default function ClosedPositionsPage() {
  const [closedJobs, setClosedJobs] = useState<ClosedJob[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClosedJobs = async () => {
    setLoading(true);
    
    // Sadece 'closed' statüsündeki ilanları çek
    // İlişkili tablolardan Pozisyon Adını ve Aday Adını al
    const { data, error } = await supabase
      .from("job_openings")
      .select(`
        id,
        created_at,
        closed_at,
        close_reason,
        positions(title),
        candidates(full_name)
      `)
      .eq("organization_id", DEMO_ORG_ID)
      .eq("status", "closed")
      .order("closed_at", { ascending: false });

    if (error) {
      console.error("Error:", error);
    } else {
      // Veriyi düzleştir
      const formatted = data.map((job: any) => ({
        id: job.id,
        position_title: job.positions?.title || "Unknown Position",
        created_at: job.created_at,
        closed_at: job.closed_at || job.created_at, // Eğer tarih yoksa oluşturma tarihini baz al
        close_reason: job.close_reason,
        hired_candidate_name: job.candidates?.full_name
      }));
      setClosedJobs(formatted);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClosedJobs();
  }, []);

  // İki tarih arasındaki gün farkını hesapla
  const calculateDuration = (start: string, end: string) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return diffDays;
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
            <Archive size={24} />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Closed Positions Archive</h2>
            <p className="text-slate-500">History of your past recruitments and hires.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="w-[250px]">Position</TableHead>
              <TableHead>Timeline</TableHead>
              <TableHead>Outcome</TableHead>
              <TableHead>Hired Candidate</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={4} className="h-24 text-center"><Loader2 className="animate-spin inline mr-2"/> Loading archive...</TableCell></TableRow>
            ) : closedJobs.length === 0 ? (
               <TableRow><TableCell colSpan={4} className="h-32 text-center text-slate-400">No closed positions found yet.</TableCell></TableRow>
            ) : (
              closedJobs.map((job) => (
                <TableRow key={job.id} className="group hover:bg-slate-50/50">
                  {/* POZİSYON ADI */}
                  <TableCell>
                    <div className="font-bold text-slate-800 flex items-center gap-2">
                        <Briefcase size={16} className="text-slate-400"/>
                        {job.position_title}
                    </div>
                    <div className="text-xs text-slate-400 mt-1 pl-6">ID: {job.id.slice(0,6)}</div>
                  </TableCell>
                  
                  {/* ZAMAN ÇİZELGESİ */}
                  <TableCell>
                    <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                            <Calendar size={14} className="text-green-600"/> 
                            Opened: {new Date(job.created_at).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                            <Calendar size={14} className="text-red-400"/> 
                            Closed: {new Date(job.closed_at).toLocaleDateString()}
                        </div>
                        <Badge variant="outline" className="mt-1 font-normal text-xs text-slate-500 bg-slate-50">
                            <Clock size={10} className="mr-1"/> 
                            Duration: {calculateDuration(job.created_at, job.closed_at)} days
                        </Badge>
                    </div>
                  </TableCell>

                  {/* SONUÇ (HIRED / CANCELLED) */}
                  <TableCell>
                    {job.close_reason === 'hired' ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 px-3 py-1">
                            <CheckCircle size={14} className="mr-1"/> Position Filled
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 border-gray-200 px-3 py-1">
                            <XCircle size={14} className="mr-1"/> Cancelled
                        </Badge>
                    )}
                  </TableCell>

                  {/* İŞE ALINAN KİŞİ */}
                  <TableCell>
                    {job.close_reason === 'hired' && job.hired_candidate_name ? (
                        <div className="flex items-center gap-3 bg-blue-50 p-2 rounded-lg border border-blue-100 w-fit pr-4">
                            <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-bold text-xs">
                                {job.hired_candidate_name.charAt(0)}
                            </div>
                            <div>
                                <div className="font-bold text-slate-800 text-sm">{job.hired_candidate_name}</div>
                                <div className="text-[10px] text-blue-600 font-medium">Successfully Hired</div>
                            </div>
                        </div>
                    ) : (
                        <span className="text-slate-400 text-sm italic">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}