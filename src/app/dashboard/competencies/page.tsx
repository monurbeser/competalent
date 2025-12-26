"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthProvider"; // <-- YENİ BEYİN
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Loader2 } from "lucide-react";

type Competency = {
  id: string;
  name: string;
  category: string;
};

export default function CompetenciesPage() {
  const { orgId } = useAuth(); // <-- DİNAMİK ID
  
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComp, setNewComp] = useState("");
  const [category, setCategory] = useState("Technical");

  const fetchCompetencies = async () => {
    if (!orgId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("competencies")
      .select("*")
      .eq("organization_id", orgId) // <-- KENDİ ŞİRKETİMİZ
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    else setCompetencies(data || []);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchCompetencies();
  }, [orgId]);

  const handleAdd = async () => {
    if (!newComp.trim() || !orgId) return;

    const { error } = await supabase.from("competencies").insert([
      {
        organization_id: orgId, // <-- ŞİRKET ID
        name: newComp,
        category: category
      }
    ]);

    if (error) {
      alert("Error adding competency: " + error.message);
    } else {
      setNewComp("");
      fetchCompetencies();
    }
  };

  const handleDelete = async (id: string) => {
    if(!confirm("Delete this competency?")) return;
    const { error } = await supabase.from("competencies").delete().eq("id", id);
    if (!error) fetchCompetencies();
  };

  if (loading && competencies.length === 0) {
     return <div className="p-12 text-center text-slate-400"><Loader2 className="animate-spin inline mr-2"/> Loading competencies...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Competency Library</h2>
          <p className="text-slate-500">Define skills and traits for your organization.</p>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
            <select 
                className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
            >
                <option value="Technical">Technical</option>
                <option value="Soft Skill">Soft Skill</option>
                <option value="Language">Language</option>
            </select>
            <Input 
                placeholder="e.g. React.js, Leadership" 
                value={newComp}
                onChange={(e) => setNewComp(e.target.value)}
                className="min-w-[200px]"
            />
            <Button onClick={handleAdd} className="bg-blue-600 hover:bg-blue-700">
                <Plus size={18} />
            </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
         {competencies.length === 0 && (
            <div className="text-center text-slate-400 py-8">
                No competencies found. Add some skills above.
            </div>
         )}

         <div className="flex flex-wrap gap-3">
            {competencies.map((comp) => (
                <div key={comp.id} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg group hover:border-blue-300 transition-colors">
                    <div className={`w-2 h-2 rounded-full ${comp.category === 'Technical' ? 'bg-blue-500' : comp.category === 'Soft Skill' ? 'bg-purple-500' : 'bg-green-500'}`}></div>
                    <span className="font-medium text-slate-700 text-sm">{comp.name}</span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider ml-1">{comp.category}</span>
                    
                    <button onClick={() => handleDelete(comp.id)} className="ml-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={14} />
                    </button>
                </div>
            ))}
         </div>
      </div>
    </div>
  );
}