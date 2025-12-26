"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthProvider"; // <-- YENİ BEYİN
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Briefcase, Plus, Search, Trash2, MapPin, Building2, Loader2 } from "lucide-react";

// Tip Tanımları
type Position = {
  id: string;
  title: string;
  department: string;
  location: string;
  status: string;
  created_at: string;
};

export default function PositionsPage() {
  const { orgId } = useAuth(); // <-- ARTIK ID BURADAN GELİYOR
  
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Yeni Pozisyon Ekleme State'i
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newPosition, setNewPosition] = useState({
    title: "",
    department: "",
    location: "Remote",
    status: "active"
  });

  // VERİLERİ GETİR
  const fetchPositions = async () => {
    if (!orgId) return; // Org ID yoksa (login değilse) sorgu atma
    setLoading(true);

    const { data, error } = await supabase
      .from("positions")
      .select("*")
      .eq("organization_id", orgId) // <-- FİLTRELEME BURADA
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching positions:", error);
    else setPositions(data || []);
    
    setLoading(false);
  };

  // Org ID gelince veya değişince çalış
  useEffect(() => {
    fetchPositions();
  }, [orgId]);

  // YENİ POZİSYON EKLE
  const handleAddPosition = async () => {
    if (!newPosition.title || !newPosition.department) return alert("Title and Department are required");
    if (!orgId) return alert("Organization ID missing");

    const { error } = await supabase.from("positions").insert([
      {
        organization_id: orgId, // <-- EKLERKEN BU ID İLE EKLİYORUZ
        title: newPosition.title,
        department: newPosition.department,
        location: newPosition.location,
        status: newPosition.status
      }
    ]);

    if (error) {
      alert("Error adding position: " + error.message);
    } else {
      setIsDialogOpen(false);
      setNewPosition({ title: "", department: "", location: "Remote", status: "active" });
      fetchPositions();
    }
  };

  // SİLME
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this position?")) return;
    
    const { error } = await supabase.from("positions").delete().eq("id", id);
    if (error) alert("Error deleting: " + error.message);
    else fetchPositions();
  };

  // ARAMA FİLTRESİ
  const filteredPositions = positions.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && positions.length === 0) {
      return <div className="p-12 text-center text-slate-400"><Loader2 className="animate-spin inline mr-2"/> Loading positions...</div>;
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Job Positions</h2>
          <p className="text-slate-500">Define roles and departments for your organization.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200">
              <Plus className="mr-2 h-4 w-4" /> Add Position
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Position</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input placeholder="e.g. Senior Frontend Developer" value={newPosition.title} onChange={(e) => setNewPosition({...newPosition, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Input placeholder="e.g. Engineering" value={newPosition.department} onChange={(e) => setNewPosition({...newPosition, department: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input placeholder="e.g. Remote / Dubai" value={newPosition.location} onChange={(e) => setNewPosition({...newPosition, location: e.target.value})} />
              </div>
              <Button onClick={handleAddPosition} className="w-full bg-slate-900">Create Position</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ARAMA BAR */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Search positions..." 
          className="pl-10 bg-white border-slate-200"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* LİSTE */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPositions.length === 0 && !loading && (
            <div className="col-span-3 text-center py-12 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                No positions found. Create one to get started.
            </div>
        )}

        {filteredPositions.map((pos) => (
          <div key={pos.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                <Briefcase size={24} />
              </div>
              <Button variant="ghost" size="icon" className="text-slate-300 hover:text-red-500" onClick={() => handleDelete(pos.id)}>
                <Trash2 size={16} />
              </Button>
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-1">{pos.title}</h3>
            <p className="text-sm text-slate-500 font-medium mb-4">{pos.department}</p>
            
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-4 border-t border-slate-50">
               <div className="flex items-center gap-1"><MapPin size={12}/> {pos.location}</div>
               <div className="flex items-center gap-1"><Building2 size={12}/> Full-time</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}