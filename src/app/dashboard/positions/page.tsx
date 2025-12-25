"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DEMO_ORG_ID } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Trash2, Edit2, Briefcase } from "lucide-react";

// Veri Tipi Tanımı
type Position = {
  id: string;
  title: string;
  description: string;
  status: string;
  created_at: string;
};

export default function PositionsPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Form Verileri
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // 1. Verileri Çekme
  const fetchPositions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("positions")
      .select("*")
      .eq("organization_id", DEMO_ORG_ID)
      .order("created_at", { ascending: false });

    if (error) console.error("Error:", error);
    else setPositions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  // 2. Yeni Pozisyon Kaydetme
  const handleCreate = async () => {
    if (!newTitle) return;
    setIsSaving(true);
    
    const { error } = await supabase.from("positions").insert([
      {
        title: newTitle,
        description: newDesc,
        organization_id: DEMO_ORG_ID,
        status: "active",
      },
    ]);

    if (error) {
        alert("Error: " + error.message);
    } else {
        setIsDialogOpen(false);
        setNewTitle("");
        setNewDesc("");
        fetchPositions();
    }
    setIsSaving(false);
  };

  // 3. SİLME FONKSİYONU
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this position?")) return;

    const { error } = await supabase
      .from("positions")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error deleting: " + error.message);
    } else {
      // Listeden çıkar
      setPositions(positions.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Positions</h2>
          <p className="text-slate-500">Manage your open job roles and requirements.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Create Position
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Position</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input 
                  placeholder="e.g. Senior Frontend Developer" 
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Job details, requirements..." 
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>
              <Button onClick={handleCreate} disabled={isSaving} className="w-full">
                {isSaving ? "Saving..." : "Create Position"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Arama */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
        <Search className="text-slate-400 h-5 w-5" />
        <Input 
          placeholder="Search positions..." 
          className="border-none shadow-none focus-visible:ring-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Liste */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
               <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell></TableRow>
            ) : positions.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={4} className="h-32 text-center text-slate-500">
                    <Briefcase className="mx-auto h-8 w-8 mb-2 text-slate-300" />
                    No positions found.
                 </TableCell>
               </TableRow>
            ) : (
              positions
              .filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((pos) => (
                <TableRow key={pos.id} className="group hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-900">{pos.title}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">
                      {pos.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {new Date(pos.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                        {/* Edit butonu şimdilik görsel amaçlı (Ghost) */}
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                            <Edit2 size={16} />
                        </Button>
                        
                        {/* SİLME BUTONU */}
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(pos.id)}
                        >
                            <Trash2 size={16} />
                        </Button>
                    </div>
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