"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DEMO_ORG_ID } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, ChevronDown, ChevronUp, Sparkles, 
  Trash2, Edit2, CheckCircle, Ban, Search
} from "lucide-react";

// --- TİP TANIMLARI ---

type JobOpening = {
  id: string;
  position_id: string;
  position_title: string;
  target_date: string;
  highlighted_skills: string[];
  description: string;
  status: string;
  matches?: MatchResult[]; 
  isOpen?: boolean; // UI State
};

type MatchResult = {
  candidate_id: string;
  full_name: string;
  match_score: number;
  ai_reason: string;
};

type CandidateSimple = {
  id: string;
  full_name: string;
  summary: string;
};

export default function OpenPositionsPage() {
  const [openings, setOpenings] = useState<JobOpening[]>([]);
  const [loading, setLoading] = useState(true);
  
  // --- CREATE / EDIT STATE ---
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);

  const [positions, setPositions] = useState<any[]>([]);
  const [selectedPosId, setSelectedPosId] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [description, setDescription] = useState("");
  const [availableSkills, setAvailableSkills] = useState<string[]>([]); 
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false); 

  // --- CLOSE JOB STATE ---
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [closingJobId, setClosingJobId] = useState<string | null>(null);
  const [closeReason, setCloseReason] = useState<"hired" | "cancelled">("hired");
  
  // Autocomplete State
  const [candidateSearchTerm, setCandidateSearchTerm] = useState("");
  const [candidateSearchResults, setCandidateSearchResults] = useState<CandidateSimple[]>([]);
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateSimple | null>(null);

  // 1. VERİLERİ GETİR (Sadece Açık İlanlar)
  const fetchData = async () => {
    setLoading(true);
    
    const { data: jobs } = await supabase
      .from("job_openings")
      .select(`*, positions(title)`)
      .eq("organization_id", DEMO_ORG_ID)
      .eq("status", "open") 
      .order("created_at", { ascending: false });

    const formattedJobs: JobOpening[] = jobs?.map((j: any) => ({
      id: j.id,
      position_id: j.position_id,
      position_title: j.positions?.title,
      target_date: j.target_date,
      highlighted_skills: j.highlighted_skills || [],
      description: j.description,
      status: j.status,
      matches: [],
      isOpen: false 
    })) || [];

    setOpenings(formattedJobs);
    
    const { data: posList } = await supabase.from("positions").select("id, title").eq("organization_id", DEMO_ORG_ID);
    if (posList) setPositions(posList);
    
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  // --- YARDIMCI FONKSİYONLAR ---

  const handlePositionSelect = async (posId: string) => {
    setSelectedPosId(posId);
    const { data } = await supabase
      .from("position_competencies")
      .select("competencies(name)")
      .eq("position_id", posId);
    
    if (data) {
        setAvailableSkills(data.map((d: any) => d.competencies.name));
    } else {
        setAvailableSkills([]);
    }
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
        setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else {
        setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // --- CRUD İŞLEMLERİ ---

  // 1. KAYDETME (Yeni veya Düzenleme)
  const handleSaveOpening = async () => {
    if (!selectedPosId || !targetDate) return;
    setIsAnalyzing(true); 

    try {
        let savedJobId = editingJobId;

        if (isEditMode && editingJobId) {
            // GÜNCELLEME
            const { error } = await supabase.from("job_openings").update({
                position_id: selectedPosId,
                target_date: targetDate,
                description: description,
                highlighted_skills: selectedSkills,
            }).eq("id", editingJobId);
            if (error) throw error;
        } else {
            // YENİ EKLEME
            const { data: newJob, error } = await supabase.from("job_openings").insert([{
                organization_id: DEMO_ORG_ID,
                position_id: selectedPosId,
                target_date: targetDate,
                description: description,
                highlighted_skills: selectedSkills,
                status: 'open'
            }]).select().single();
            if (error) throw error;
            savedJobId = newJob.id;
        }

        // AI Analizini Tetikle
        const posTitle = positions.find(p => p.id === selectedPosId)?.title;
        await fetch("/api/match-candidates", {
            method: "POST",
            body: JSON.stringify({
                openingId: savedJobId,
                positionTitle: posTitle,
                description: description,
                skills: selectedSkills,
                targetDate
            })
        });

        closeWizard();
        fetchData(); 

    } catch (err: any) {
        alert("Hata: " + err.message);
    } finally {
        setIsAnalyzing(false);
    }
  };

  // 2. SİLME
  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); 
    if (!confirm("Are you sure you want to delete this job opening?")) return;

    const { error } = await supabase.from("job_openings").delete().eq("id", id);
    if (error) alert("Error: " + error.message);
    else fetchData();
  };

  // 3. WIZARD AÇMA/KAPAMA
  const openEditWizard = async (e: React.MouseEvent, job: JobOpening) => {
    e.stopPropagation();
    setIsEditMode(true);
    setEditingJobId(job.id);
    
    await handlePositionSelect(job.position_id); 
    setSelectedPosId(job.position_id);
    setTargetDate(job.target_date);
    setDescription(job.description);
    setSelectedSkills(job.highlighted_skills);
    
    setIsDialogOpen(true);
  };

  const openCreateWizard = () => {
    setIsEditMode(false);
    setEditingJobId(null);
    setSelectedPosId("");
    setTargetDate("");
    setDescription("");
    setSelectedSkills([]);
    setAvailableSkills([]);
    setIsDialogOpen(true);
  };

  const closeWizard = () => {
    setIsDialogOpen(false);
    setIsEditMode(false);
    setEditingJobId(null);
  };

  // 4. MANUEL AI ANALİZİ (Yeniden Eşleştir)
  const handleReMatch = async (e: React.MouseEvent, job: JobOpening) => {
    e.stopPropagation();
    if(!confirm("Start AI matching analysis for this position?")) return;
    
    alert("AI Analysis started... Please wait a few seconds then click the accordion.");

    try {
        const response = await fetch("/api/match-candidates", {
            method: "POST",
            body: JSON.stringify({
                openingId: job.id,
                positionTitle: job.position_title,
                description: job.description,
                skills: job.highlighted_skills
            })
        });
        
        const res = await response.json();
        if(res.success) {
             alert(`Analysis Complete! Found ${res.count} scored candidates.`);
             // Veriyi tazelemek için akordeonu kapatıp açıyoruz (veya veri çekiyoruz)
             fetchData();
        } else {
             alert("Analysis failed: " + (res.error || res.message));
        }
    } catch (err: any) {
        alert("Network error: " + err.message);
    }
  };

  // --- KAPATMA (CLOSE JOB) & AUTOCOMPLETE ---

  const openCloseDialog = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setClosingJobId(id);
    setCloseReason("hired");
    setCandidateSearchTerm("");
    setCandidateSearchResults([]);
    setSelectedCandidate(null);
    setIsCloseDialogOpen(true);
  };

  // Aday Arama
  const handleCandidateSearch = async (term: string) => {
    setCandidateSearchTerm(term);
    if (term.length < 2) {
        setCandidateSearchResults([]);
        return;
    }

    const { data } = await supabase
        .from("candidates")
        .select("id, full_name, summary")
        .eq("organization_id", DEMO_ORG_ID)
        .ilike("full_name", `%${term}%`)
        .limit(5);

    if (data) setCandidateSearchResults(data);
  };

  const selectCandidate = (candidate: CandidateSimple) => {
    setSelectedCandidate(candidate);
    setCandidateSearchTerm(candidate.full_name); 
    setCandidateSearchResults([]); 
  };

  const handleCloseJobConfirm = async () => {
    if (!closingJobId) return;
    if (closeReason === "hired" && !selectedCandidate) {
        alert("Please select the hired candidate.");
        return;
    }

    const updateData: any = {
        status: 'closed',
        close_reason: closeReason,
        closed_at: new Date().toISOString() // BUGÜNÜN TARİHİ
    };

    if (closeReason === "hired" && selectedCandidate) {
        updateData.hired_candidate_id = selectedCandidate.id;
    }

    const { error } = await supabase
        .from("job_openings")
        .update(updateData)
        .eq("id", closingJobId);

    if (error) {
        alert("Error closing job: " + error.message);
    } else {
        setIsCloseDialogOpen(false);
        fetchData(); // Listeden düşecek
    }
  };

  // --- UI YARDIMCILARI ---

  const toggleAccordion = async (jobId: string) => {
    const job = openings.find(o => o.id === jobId);
    if (!job?.isOpen) {
        // Açarken veriyi çek
        const { data: matches } = await supabase
            .from("matches")
            .select("match_score, ai_reason, candidates(id, full_name)")
            .eq("job_opening_id", jobId)
            .order("match_score", { ascending: false })
            .limit(5);

        const formattedMatches = matches?.map((m: any) => ({
            candidate_id: m.candidates.id,
            full_name: m.candidates.full_name,
            match_score: m.match_score,
            ai_reason: m.ai_reason
        }));

        setOpenings(prev => prev.map(job => 
            job.id === jobId ? { ...job, matches: formattedMatches, isOpen: true } : job
        ));
    } else {
        // Kapat
        setOpenings(prev => prev.map(job => 
            job.id === jobId ? { ...job, isOpen: false } : job
        ));
    }
  };

  const ScoreGauge = ({ score }: { score: number }) => {
    const color = score > 80 ? "text-green-500" : score > 50 ? "text-yellow-500" : "text-red-500";
    return (
        <div className="relative w-12 h-12 flex items-center justify-center">
             <svg className="w-full h-full" viewBox="0 0 36 36">
                <path className="text-slate-200" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                <path className={`${color} drop-shadow-md`} strokeDasharray={`${score}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
            </svg>
            <span className={`absolute text-[10px] font-bold ${color}`}>{score}</span>
        </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* BAŞLIK & EKLE BUTONU */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Active Recruitments</h2>
          <p className="text-slate-500">Track job openings and AI-matched candidates.</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200" onClick={openCreateWizard}>
              <Plus className="mr-2 h-4 w-4" /> Create Opening
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            {isAnalyzing ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse rounded-full"></div>
                        <Sparkles className="h-16 w-16 text-blue-600 animate-spin-slow" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">AI Recruiter is Working...</h3>
                    <p className="text-slate-500 text-center max-w-xs">Reading CVs, analyzing context, and scoring candidates against your requirements.</p>
                </div>
            ) : (
                <>
                <DialogHeader>
                <DialogTitle>{isEditMode ? "Edit Job Opening" : "Start New Recruitment"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Select Position</Label>
                        <Select value={selectedPosId} onValueChange={handlePositionSelect}>
                            <SelectTrigger><SelectValue placeholder="Choose role..." /></SelectTrigger>
                            <SelectContent>{positions.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Target Date</Label>
                        <Input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Key Competencies (AI Focus)</Label>
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-lg border min-h-[60px]">
                        {!selectedPosId ? (
                            <span className="text-xs text-slate-400 flex items-center h-full">Select a position first to see skills.</span>
                        ) : availableSkills.length === 0 ? (
                            <span className="text-xs text-red-400 flex items-center h-full">No competencies defined for this position.</span>
                        ) : (
                            availableSkills.map(skill => (
                                <Badge 
                                    key={skill} 
                                    onClick={() => toggleSkill(skill)}
                                    variant={selectedSkills.includes(skill) ? "default" : "outline"}
                                    className="cursor-pointer transition-all hover:scale-105 select-none"
                                >
                                    {skill}
                                </Badge>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Job Context / Description</Label>
                    <Textarea 
                        placeholder="Details about the role..." 
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                    />
                </div>

                <Button onClick={handleSaveOpening} className="w-full bg-indigo-600 hover:bg-indigo-700">
                    <Sparkles className="mr-2 h-4 w-4" /> {isEditMode ? "Update Analysis" : "Analyze & Create"}
                </Button>
                </div>
                </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* --- İLAN LİSTESİ --- */}
      <div className="space-y-4">
        {openings.length === 0 && !loading && (
            <div className="text-center py-12 text-slate-400">No active job openings found.</div>
        )}

        {openings.map((job) => (
            <div key={job.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all group">
                <div 
                    onClick={() => toggleAccordion(job.id)}
                    className="flex items-center justify-between p-5 cursor-pointer hover:bg-slate-50 transition-colors border-l-4 border-l-indigo-500 relative"
                >
                    <div className="flex flex-col gap-1">
                        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            {job.position_title}
                            <Badge variant="secondary" className="text-xs font-normal">Deadline: {job.target_date}</Badge>
                        </h3>
                        <div className="flex gap-2 text-xs text-slate-500">
                            <span className="font-semibold text-slate-700">Focus:</span> 
                            {job.highlighted_skills.join(", ") || "General"}
                        </div>
                    </div>

                    {/* AKSİYON BUTONLARI */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                             {/* AI Re-Match */}
                             <Button 
                                variant="ghost" size="sm" className="h-8 w-8 text-indigo-600 bg-indigo-50 hover:bg-indigo-100" 
                                title="Run AI Matching" onClick={(e) => handleReMatch(e, job)}
                             >
                                <Sparkles size={14} />
                             </Button>
                             {/* Edit */}
                             <Button 
                                variant="ghost" size="sm" className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100" 
                                title="Edit" onClick={(e) => openEditWizard(e, job)}
                             >
                                <Edit2 size={14} />
                             </Button>
                             {/* Close (Tick) */}
                             <Button 
                                variant="ghost" size="sm" className="h-8 w-8 text-green-600 bg-green-50 hover:bg-green-100" 
                                title="Close / Fill Position" onClick={(e) => openCloseDialog(e, job.id)}
                             >
                                <CheckCircle size={14} />
                             </Button>
                             {/* Delete */}
                             <Button 
                                variant="ghost" size="sm" className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50" 
                                title="Delete" onClick={(e) => handleDelete(e, job.id)}
                             >
                                <Trash2 size={14} />
                             </Button>
                        </div>
                        
                        <div className="text-slate-400 pl-2 border-l border-slate-200">
                            {job.isOpen ? <ChevronUp /> : <ChevronDown />}
                        </div>
                    </div>
                </div>

                {/* AKORDEON İÇERİĞİ (ADAYLAR) */}
                {job.isOpen && (
                    <div className="bg-slate-50/50 p-4 border-t border-slate-100 animate-in slide-in-from-top-2">
                        <h4 className="text-sm font-semibold text-slate-500 mb-3 uppercase tracking-wider">Top AI Matches</h4>
                        
                        <div className="space-y-3">
                            {!job.matches || job.matches.length === 0 ? (
                                <p className="text-sm text-slate-400 italic">No matches found yet. Try the Sparkles icon to run AI.</p>
                            ) : (
                                job.matches.map((match: MatchResult) => (
                                    <div key={match.candidate_id} className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                        <ScoreGauge score={match.match_score} />
                                        <div className="flex-1">
                                            <div className="flex justify-between">
                                                <h5 className="font-bold text-slate-800">{match.full_name}</h5>
                                                <span className="text-xs text-slate-400">ID: {match.candidate_id.slice(0,4)}</span>
                                            </div>
                                            <p className="text-xs text-slate-600 mt-1 line-clamp-1">
                                                <span className="text-indigo-600 font-semibold">AI Insight: </span> 
                                                {match.ai_reason}
                                            </p>
                                        </div>
                                        <Button size="sm" variant="outline" className="text-xs h-8">Profile</Button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        ))}
      </div>

      {/* --- İLAN KAPATMA POPUP (AUTOCOMPLETE VAR) --- */}
      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Close Job Opening</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-6">
                <div className="space-y-3">
                    <Label className="text-base">Reason for closing?</Label>
                    <RadioGroup value={closeReason} onValueChange={(v: "hired" | "cancelled") => setCloseReason(v)}>
                        <div className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-slate-50">
                            <RadioGroupItem value="hired" id="r-hired" />
                            <Label htmlFor="r-hired" className="flex items-center gap-2 cursor-pointer w-full">
                                <CheckCircle size={16} className="text-green-600" /> 
                                Candidate Hired
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2 border p-3 rounded-lg cursor-pointer hover:bg-slate-50">
                            <RadioGroupItem value="cancelled" id="r-cancelled" />
                            <Label htmlFor="r-cancelled" className="flex items-center gap-2 cursor-pointer w-full">
                                <Ban size={16} className="text-slate-500" />
                                Position Cancelled / Other
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                {/* AUTOCOMPLETE KISMI */}
                {closeReason === "hired" && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                        <Label>Who was hired?</Label>
                        <div className="relative">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Start typing candidate name..." 
                                className="pl-9"
                                value={candidateSearchTerm}
                                onChange={(e) => handleCandidateSearch(e.target.value)}
                            />
                            
                            {/* Autocomplete Sonuçları */}
                            {candidateSearchResults.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-md shadow-lg z-50 max-h-40 overflow-y-auto">
                                    {candidateSearchResults.map(c => (
                                        <div 
                                            key={c.id} 
                                            className="p-2 hover:bg-blue-50 cursor-pointer flex items-center gap-2 text-sm"
                                            onClick={() => selectCandidate(c)}
                                        >
                                            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold">
                                                {c.full_name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-slate-800">{c.full_name}</div>
                                                <div className="text-xs text-slate-400 truncate w-48">{c.summary}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Seçilen Aday Gösterimi */}
                            {selectedCandidate && (
                                <div className="mt-2 flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200">
                                    <CheckCircle size={14} /> 
                                    Selected: <span className="font-bold">{selectedCandidate.full_name}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
            <DialogFooter>
                <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleCloseJobConfirm} className="bg-slate-900 text-white">Confirm & Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}