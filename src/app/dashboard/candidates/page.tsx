"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthProvider"; // <-- YENİ BEYİN
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Loader2, UploadCloud, MapPin, Briefcase, Trash2, Edit2, Phone, Mail, FileText, Sparkles, Save } from "lucide-react";

type ExperienceItem = {
  title: string;
  company: string;
  years: string;
};

type Candidate = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  resume_url: string;
  summary: string;
  skills: string[];
  experience: ExperienceItem[];
  ai_analysis: string;
  created_at: string;
  parsed_data?: { location?: string };
};

export default function CandidatesPage() {
  const { orgId } = useAuth(); // <-- DİNAMİK ID
  
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false); 
  const [formData, setFormData] = useState<Partial<Candidate>>({});

  const fetchCandidates = async () => {
    if (!orgId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("candidates")
      .select("*")
      .eq("organization_id", orgId) // <-- KENDİ ŞİRKETİMİZ
      .order("created_at", { ascending: false });
    
    if (data) setCandidates(data);
    setLoading(false);
  };

  useEffect(() => { fetchCandidates(); }, [orgId]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    if (!orgId) return alert("Organization ID not found. Please relogin.");

    const file = e.target.files[0];
    if (file.type !== "application/pdf") { alert("Please upload PDF."); return; }

    setUploading(true);
    const formPayload = new FormData();
    formPayload.append("file", file);
    formPayload.append("orgId", orgId); 

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error("Session expired. Please login again.");

      const response = await fetch("/api/parse-cv", { 
        method: "POST", 
        body: formPayload,
        headers: { Authorization: `Bearer ${session.access_token}` }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Upload failed");
      fetchCandidates(); 
    } catch (error: any) {
      alert("Upload Error: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleReAnalyze = async () => {
    if (!selectedCandidate) return;
    if(!confirm("Bu CV'yi tekrar AI analizine sokmak istiyor musunuz? Mevcut veriler güncellenecektir.")) return;

    setIsReanalyzing(true);
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error("Session expired. Please login again.");

        const response = await fetch("/api/re-analyze-cv", {
            method: "POST",
            headers: { Authorization: `Bearer ${session.access_token}` },
            body: JSON.stringify({
                candidateId: selectedCandidate.id,
                resumeUrl: selectedCandidate.resume_url
            })
        });
        const result = await response.json();
        
        if (result.success) {
            const updatedCandidate = { ...selectedCandidate, ...result.data };
            setSelectedCandidate(updatedCandidate);
            setFormData(updatedCandidate);
            alert("Analiz tamamlandı! Veriler güncellendi.");
            fetchCandidates(); 
        } else {
            alert("Hata: " + result.error);
        }
    } catch (err: any) {
        alert("Bağlantı hatası: " + err.message);
    } finally {
        setIsReanalyzing(false);
    }
  };

  const openProfile = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setFormData(candidate);
    setIsEditMode(false);
    setIsDialogOpen(true);
  };

  const openEditProfile = (e: React.MouseEvent, candidate: Candidate) => {
    e.stopPropagation();
    setSelectedCandidate(candidate);
    setFormData(candidate);
    setIsEditMode(true);
    setIsDialogOpen(true);
  };

  const handleSaveChanges = async () => {
    if (!selectedCandidate || !formData) return;
    const { error } = await supabase.from("candidates").update({
            full_name: formData.full_name,
            email: formData.email,
            phone: formData.phone,
            summary: formData.summary,
            ai_analysis: formData.ai_analysis,
        }).eq("id", selectedCandidate.id);

    if (error) { alert("Error updating: " + error.message); } else { setIsDialogOpen(false); setIsEditMode(false); fetchCandidates(); }
  };

  const handleDelete = async (e: React.MouseEvent, id: string, resumeUrl: string) => {
    e.stopPropagation();
    if (!confirm("Delete this candidate completely?")) return;
    const { error } = await supabase.from("candidates").delete().eq("id", id);
    if (error) return alert("Delete failed: " + error.message);
    if (resumeUrl) {
        const path = resumeUrl.split("/resumes/")[1];
        if (path) await supabase.storage.from("resumes").remove([path]);
    }
    setCandidates(candidates.filter(c => c.id !== id));
  };

  if (loading && candidates.length === 0) {
    return <div className="p-12 text-center text-slate-400"><Loader2 className="animate-spin inline mr-2"/> Loading candidates...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Candidate Pool</h2>
          <p className="text-slate-500">Manage and analyze your talent pool.</p>
        </div>
        <div className="relative">
          <input type="file" accept=".pdf" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={uploading} />
          <Button className="bg-blue-600 hover:bg-blue-700 text-white pl-4 pr-6 py-6 shadow-lg">
            {uploading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />}
            {uploading ? "Analyzing CV..." : "Upload New CV"}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="col-span-4 pl-2">Candidate Name</div>
          <div className="col-span-3">Role / Summary</div>
          <div className="col-span-3">Location</div>
          <div className="col-span-2 text-right pr-2">Actions</div>
        </div>

        {candidates.length === 0 && !loading && <div className="p-12 text-center text-slate-400">No candidates found.</div>}

        <div className="divide-y divide-slate-100">
          {candidates.map((candidate) => (
            <div key={candidate.id} onClick={() => openProfile(candidate)} className="group grid grid-cols-12 gap-4 p-4 items-center hover:bg-blue-50/50 transition-all cursor-pointer relative">
              <div className="col-span-4 flex items-center gap-3 pl-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm border border-slate-200 group-hover:bg-white group-hover:text-blue-600">
                  {candidate.full_name ? candidate.full_name.charAt(0) : "?"}
                </div>
                <div><p className="font-semibold text-slate-800 group-hover:text-blue-700">{candidate.full_name || "Unknown"}</p><p className="text-xs text-slate-400">{candidate.email}</p></div>
              </div>
              <div className="col-span-3 text-sm text-slate-600 truncate" title={candidate.summary}>{candidate.summary || "No summary"}</div>
              <div className="col-span-3 flex items-center gap-2 text-sm text-slate-600"><MapPin size={14} className="text-slate-400" />{candidate.parsed_data?.location || "Unknown"}</div>
              <div className="col-span-2 flex justify-end gap-2 pr-2">
                <Button variant="ghost" size="icon" onClick={(e) => openEditProfile(e, candidate)} className="text-slate-400 hover:text-blue-600"><Edit2 size={16} /></Button>
                <Button variant="ghost" size="icon" onClick={(e) => handleDelete(e, candidate.id, candidate.resume_url)} className="text-slate-400 hover:text-red-600"><Trash2 size={16} /></Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="!max-w-[95vw] !w-[95vw] h-[95vh] p-0 gap-0 overflow-hidden flex flex-col">
          <DialogTitle className="hidden">Candidate Profile Detail</DialogTitle>
          {selectedCandidate && (
             <div className="flex flex-col h-full">
                 <div className="bg-slate-900 text-white p-8 shrink-0 relative overflow-hidden shadow-md z-10">
                    <div className="absolute top-0 right-0 p-4 opacity-10"><Sparkles size={150} /></div>
                    <div className="flex justify-between items-start relative z-10">
                        <div className="flex gap-6 items-center">
                            <div className="w-24 h-24 rounded-2xl bg-white/10 flex items-center justify-center text-4xl font-bold backdrop-blur-sm border border-white/20 shadow-lg">
                                {selectedCandidate.full_name?.charAt(0)}
                            </div>
                            <div className="space-y-2">
                                {isEditMode ? (
                                    <Input className="bg-white/10 border-white/20 text-white font-bold text-2xl h-12 w-96" value={formData.full_name || ""} onChange={(e) => setFormData({...formData, full_name: e.target.value})}/>
                                ) : (
                                    <h2 className="text-3xl font-bold tracking-tight">{selectedCandidate.full_name}</h2>
                                )}
                                <div className="flex flex-wrap gap-6 text-sm text-slate-300 font-medium">
                                    <div className="flex items-center gap-2"><MapPin size={16}/> {selectedCandidate.parsed_data?.location || "Konum Yok"}</div>
                                    <div className="flex items-center gap-2">
                                        <Mail size={16}/> 
                                        {isEditMode ? <Input className="h-7 w-56 bg-white/10 border-white/20 text-white text-xs" value={formData.email || ""} onChange={e=>setFormData({...formData, email: e.target.value})}/> : selectedCandidate.email}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Phone size={16}/>
                                        {isEditMode ? <Input className="h-7 w-40 bg-white/10 border-white/20 text-white text-xs" value={formData.phone || ""} onChange={e=>setFormData({...formData, phone: e.target.value})}/> : (selectedCandidate.phone || "N/A")}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-3">
                             <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-400" onClick={handleReAnalyze} disabled={isReanalyzing}>
                                 {isReanalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Sparkles className="mr-2 h-4 w-4" />}
                                 {isReanalyzing ? "Analyzing..." : "Re-Analyze with AI"}
                             </Button>
                             {!isEditMode && <Button size="sm" variant="secondary" onClick={() => setIsEditMode(true)}><Edit2 size={14} className="mr-2" /> Edit</Button>}
                             {isEditMode && <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={handleSaveChanges}><Save size={14} className="mr-2" /> Save</Button>}
                             <Button size="sm" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" onClick={() => window.open(selectedCandidate.resume_url, '_blank')}><FileText size={14} className="mr-2" /> CV</Button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 bg-slate-50 p-8 overflow-y-auto">
                    <div className="grid grid-cols-12 gap-8">
                        <div className="col-span-12 lg:col-span-4 space-y-6">
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg"><Briefcase size={20} className="text-blue-600"/> Summary</h4>
                                {isEditMode ? <Textarea className="text-sm text-slate-600 min-h-[150px] leading-relaxed" value={formData.summary || ""} onChange={(e) => setFormData({...formData, summary: e.target.value})}/> : <p className="text-sm text-slate-600 leading-relaxed text-justify">{selectedCandidate.summary || "No summary available."}</p>}
                            </div>
                            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                                <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2 text-lg"><Sparkles size={20} className="text-purple-600"/> Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {selectedCandidate.skills && selectedCandidate.skills.length > 0 ? selectedCandidate.skills.map((skill, i) => <Badge key={i} variant="secondary" className="px-3 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 text-sm">{skill}</Badge>) : <span className="text-sm text-slate-400 italic">No skills parsed yet. Click 'Re-Analyze'.</span>}
                                </div>
                            </div>
                        </div>
                        <div className="col-span-12 lg:col-span-8 space-y-6">
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100 shadow-sm">
                                <h4 className="font-bold text-blue-900 mb-3 flex items-center gap-2 text-lg"><Sparkles size={20} className="text-blue-600"/> Competalent AI Insight</h4>
                                {isEditMode ? <Textarea className="bg-white/80 border-blue-200 min-h-[80px]" value={formData.ai_analysis || ""} onChange={(e) => setFormData({...formData, ai_analysis: e.target.value})}/> : <p className="text-base text-blue-800 italic leading-relaxed">"{selectedCandidate.ai_analysis || "No AI analysis generated yet."}"</p>}
                            </div>
                            <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm min-h-[300px]">
                                <h4 className="font-bold text-slate-800 mb-6 text-xl border-b pb-4">Work Experience</h4>
                                <div className="space-y-8">
                                    {selectedCandidate.experience && selectedCandidate.experience.length > 0 ? selectedCandidate.experience.map((exp, i) => (
                                        <div key={i} className="flex gap-6 relative group">
                                            {i !== selectedCandidate.experience.length - 1 && <div className="absolute left-[20px] top-10 bottom-[-32px] w-0.5 bg-slate-200 group-hover:bg-blue-200 transition-colors"></div>}
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 border-2 border-slate-200 z-10 shadow-sm group-hover:border-blue-400 transition-colors"><Briefcase size={18} className="text-slate-400 group-hover:text-blue-600" /></div>
                                            <div className="flex-1"><h5 className="font-bold text-slate-800 text-lg">{exp.title}</h5><div className="text-base text-slate-600 font-medium mb-1">{exp.company}</div><span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full inline-block">{exp.years}</span></div>
                                        </div>
                                    )) : <div className="text-center py-12 text-slate-400"><Briefcase className="mx-auto h-12 w-12 mb-3 opacity-30" /><p className="text-lg">No experience record found.</p><Button variant="link" onClick={handleReAnalyze} className="text-indigo-600">Try Re-Analyze</Button></div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
             </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
