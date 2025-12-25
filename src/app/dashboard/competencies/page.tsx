"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DEMO_ORG_ID } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, X, Loader2, Trash2, LayoutGrid, List, Edit2 } from "lucide-react";

// Tipler
type Competency = { id: string; name: string; category: string };
type Position = { id: string; title: string };
type MatrixLink = { position_id: string; competency_id: string; required_level: number };
type TempLink = { positionId: string; positionTitle: string; level: string };

export default function CompetenciesPage() {
  const userOrgId = DEMO_ORG_ID;

  const [activeTab, setActiveTab] = useState("list");
  
  // Veri State'leri
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [matrixLinks, setMatrixLinks] = useState<MatrixLink[]>([]); 
  const [loading, setLoading] = useState(true);
  
  // Dialog (Ekleme/Düzenleme) State'leri
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); 
  const [editingId, setEditingId] = useState<string | null>(null);

  const [compName, setCompName] = useState("");
  const [compCategory, setCompCategory] = useState("Technical");
  const [selectedPosId, setSelectedPosId] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("1");
  const [tempLinks, setTempLinks] = useState<TempLink[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // VERİLERİ ÇEKME
  const fetchPageData = async () => {
    setLoading(true);
    
    // 1. Yetkinlikler
    const { data: comps } = await supabase
      .from("competencies")
      .select("*")
      .eq('organization_id', userOrgId)
      .order("created_at", { ascending: false });
    
    // 2. Pozisyonlar
    const { data: pos } = await supabase
      .from("positions")
      .select("id, title")
      .eq('organization_id', userOrgId)
      .order("title", { ascending: true });

    const validComps = comps || [];
    const validPos = pos || [];
    
    setCompetencies(validComps);
    setPositions(validPos);

    // 3. İlişkiler (Matrix Linkleri)
    const { data: allLinks } = await supabase
      .from("position_competencies")
      .select("position_id, competency_id, required_level");

    if (allLinks) {
      const relevantLinks = allLinks.filter(link => 
        validPos.some(p => p.id === link.position_id) && 
        validComps.some(c => c.id === link.competency_id)
      );
      setMatrixLinks(relevantLinks);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchPageData();
  }, []);

  // Form Listesine Ekleme
  const addLinkToList = () => {
    if (!selectedPosId) return;
    const pos = positions.find(p => p.id === selectedPosId);
    if (!pos) return;
    if (tempLinks.find(t => t.positionId === selectedPosId)) { alert("Position already added."); return; }
    setTempLinks([...tempLinks, { positionId: pos.id, positionTitle: pos.title, level: selectedLevel }]);
    setSelectedPosId("");
  };

  const removeLinkFromList = (id: string) => { setTempLinks(tempLinks.filter(t => t.positionId !== id)); };

  // DÜZENLEME MODUNU AÇMA
  const openEditDialog = async (comp: Competency) => {
    setIsEditing(true);
    setEditingId(comp.id);
    setCompName(comp.name);
    setCompCategory(comp.category);
    setTempLinks([]); 
    
    const { data: existingLinks } = await supabase
        .from("position_competencies")
        .select("required_level, position_id, positions(title)")
        .eq("competency_id", comp.id);

    if (existingLinks) {
        const formattedLinks: TempLink[] = existingLinks.map((l: any) => ({
            positionId: l.position_id,
            positionTitle: l.positions?.title || "Unknown Position",
            level: l.required_level.toString()
        }));
        setTempLinks(formattedLinks);
    }

    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setIsEditing(false);
    setEditingId(null);
    setCompName("");
    setCompCategory("Technical");
    setTempLinks([]);
    setIsDialogOpen(true);
  };

  // KAYDETME
  const handleSave = async () => {
    if (!compName) return;
    setIsSaving(true);

    let targetCompId = editingId;

    if (isEditing && editingId) {
        const { error } = await supabase
            .from("competencies")
            .update({ name: compName, category: compCategory })
            .eq("id", editingId);
        
        if (error) { alert("Error: " + error.message); setIsSaving(false); return; }
        await supabase.from("position_competencies").delete().eq("competency_id", editingId);

    } else {
        const { data: compData, error } = await supabase
            .from("competencies")
            .insert([{ name: compName, category: compCategory, organization_id: userOrgId }])
            .select().single();
        
        if (error) { alert("Error: " + error.message); setIsSaving(false); return; }
        targetCompId = compData.id;
    }

    if (tempLinks.length > 0 && targetCompId) {
      const linksToInsert = tempLinks.map(link => ({
        position_id: link.positionId,
        competency_id: targetCompId,
        required_level: parseInt(link.level),
        weight: "medium"
      }));
      await supabase.from("position_competencies").insert(linksToInsert);
    }

    setIsDialogOpen(false);
    setCompName(""); 
    setTempLinks([]); 
    setIsEditing(false);
    fetchPageData(); 
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this competency? This will remove it from the Matrix.")) return;
    const { error } = await supabase.from("competencies").delete().eq("id", id);
    if (error) alert("Error: " + error.message);
    else fetchPageData();
  };

  const renderLevelDots = (level: number) => {
    return (
      <div className="flex gap-0.5 justify-center" title={`Level ${level}`}>
         {[1, 2, 3, 4].map((i) => (
            <div 
                key={i} 
                className={`w-2.5 h-2.5 rounded-full ${i <= level ? 'bg-blue-600 shadow-sm' : 'bg-slate-200'}`} 
            />
         ))}
      </div>
    );
  };

  const getMatrixValue = (posId: string, compId: string) => {
    const link = matrixLinks.find(l => l.position_id === posId && l.competency_id === compId);
    return link ? link.required_level : 0;
  };

  if (loading) return <div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Competency Pool</h2>
          <p className="text-slate-500">Manage skills and define requirements matrix.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" /> Add Competency
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle>{isEditing ? "Edit Competency" : "Add New Competency"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Name</Label>
                    <Input placeholder="e.g. React.js" value={compName} onChange={e => setCompName(e.target.value)} />
                </div>
                <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={compCategory} onValueChange={setCompCategory}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Technical">Technical</SelectItem>
                            <SelectItem value="Soft Skill">Soft Skill</SelectItem>
                            <SelectItem value="Language">Language</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                <h4 className="text-sm font-semibold text-slate-700">Required by Positions</h4>
                <div className="flex gap-2 items-end">
                  <div className="flex-1 space-y-2">
                    <Label className="text-xs">Position</Label>
                    <Select value={selectedPosId} onValueChange={setSelectedPosId}>
                      <SelectTrigger className="h-9"><SelectValue placeholder="Select..." /></SelectTrigger>
                      <SelectContent>{positions.map(p => <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="w-24 space-y-2">
                    <Label className="text-xs">Level (1-4)</Label>
                    <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                      <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="1">1 - Basic</SelectItem><SelectItem value="2">2 - Mid</SelectItem><SelectItem value="3">3 - Adv</SelectItem><SelectItem value="4">4 - Expert</SelectItem></SelectContent>
                    </Select>
                  </div>
                  <Button size="sm" variant="secondary" onClick={addLinkToList}>Add</Button>
                </div>
                
                {tempLinks.length > 0 ? (
                    <div className="space-y-2 mt-2 max-h-40 overflow-y-auto">
                        {tempLinks.map((link) => (
                            <div key={link.positionId} className="flex justify-between items-center bg-white p-2 text-xs border rounded shadow-sm">
                                <span className="font-medium">{link.positionTitle}</span>
                                <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Lvl {link.level}</Badge>
                                    <button onClick={() => removeLinkFromList(link.positionId)} className="text-red-400 hover:text-red-600"><X size={14} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-slate-400 italic text-center py-2">No positions linked yet.</p>
                )}
              </div>
              <Button onClick={handleSave} disabled={isSaving} className="w-full">
                  {isSaving ? "Saving..." : (isEditing ? "Update Competency" : "Save Competency")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="list" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
          <TabsTrigger value="list" className="flex gap-2"><List size={16}/> List View</TabsTrigger>
          <TabsTrigger value="matrix" className="flex gap-2"><LayoutGrid size={16}/> Skill Matrix</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-4">
          <div className="bg-white rounded-lg border shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-[300px]">Competency Name</TableHead>
                  <TableHead>Related Positions</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competencies.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-slate-500 h-32">No competencies found.</TableCell></TableRow>
                ) : (
                    competencies.map((comp) => {
                        const linkedPos = matrixLinks.filter(l => l.competency_id === comp.id);

                        return (
                        <TableRow key={comp.id} className="group hover:bg-slate-50/50">
                            <TableCell className="font-medium text-slate-900">{comp.name}</TableCell>
                            <TableCell>
                                <div className="flex flex-wrap gap-1">
                                    {linkedPos.length > 0 ? (
                                        linkedPos.map(link => {
                                            const posTitle = positions.find(p => p.id === link.position_id)?.title;
                                            return (
                                                <Badge key={link.position_id} variant="secondary" className="bg-slate-100 text-slate-600 text-[10px] font-normal border-slate-200">
                                                    {posTitle} <span className="text-slate-400 ml-1">(Lvl {link.required_level})</span>
                                                </Badge>
                                            )
                                        })
                                    ) : (
                                        <span className="text-slate-400 text-xs italic">- No link -</span>
                                    )}
                                </div>
                            </TableCell>

                            <TableCell><Badge variant="outline">{comp.category}</Badge></TableCell>
                            <TableCell className="text-right">
                                <div className="flex justify-end gap-1">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50" onClick={() => openEditDialog(comp)}>
                                        <Edit2 size={16} />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(comp.id)}>
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </TableCell>
                        </TableRow>
                        )
                    })
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="matrix" className="mt-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
                <Table className="min-w-max border-collapse">
                    <TableHeader>
                        <TableRow className="bg-slate-100 border-b border-slate-200">
                            <TableHead className="w-[250px] min-w-[200px] sticky left-0 bg-slate-100 z-20 border-r border-slate-200 font-bold text-slate-700 pl-4">
                                Positions \ Skills
                            </TableHead>
                            {competencies.map((comp) => (
                                <TableHead key={comp.id} className="text-center min-w-[120px] px-2 border-r border-slate-100 font-semibold text-slate-600 text-xs uppercase tracking-wider h-14 bg-slate-50">
                                    {comp.name}
                                    <div className="text-[10px] text-slate-400 font-normal normal-case">{comp.category}</div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {positions.length === 0 ? (
                            <TableRow><TableCell colSpan={competencies.length + 1} className="text-center h-32 text-slate-400">No positions defined.</TableCell></TableRow>
                        ) : (
                            positions.map((pos) => (
                                <TableRow key={pos.id} className="hover:bg-blue-50/30 transition-colors border-b border-slate-100">
                                    <TableCell className="sticky left-0 bg-white z-10 border-r border-slate-200 font-medium text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                                        {pos.title}
                                    </TableCell>
                                    {competencies.map((comp) => {
                                        const level = getMatrixValue(pos.id, comp.id);
                                        return (
                                            <TableCell key={`${pos.id}-${comp.id}`} className="text-center border-r border-slate-50 p-2">
                                                {level > 0 ? (
                                                    <div className="flex flex-col items-center gap-1">
                                                        {renderLevelDots(level)}
                                                        <span className="text-[10px] text-slate-500 font-mono font-bold">Lvl {level}</span>
                                                    </div>
                                                ) : (
                                                    <div className="w-full h-full flex justify-center items-center opacity-30">
                                                        <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                                                    </div>
                                                )}
                                            </TableCell>
                                        );
                                    })}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
          </div>
          <div className="mt-4 flex gap-4 text-xs text-slate-500 justify-end">
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div> Required</div>
              <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div> Not mapped</div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}