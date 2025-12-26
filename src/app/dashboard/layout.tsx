"use client"; // Bu satırı eklemeyi unutma, hook kullanacağız

import Link from "next/link";
import { useAuth } from "@/context/AuthProvider"; // <-- IMPORT
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Settings, 
  Layers, 
  FileText,
  Archive,
  LogOut // Çıkış ikonu
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile, signOut } = useAuth(); // <-- KULLANICI BİLGİSİ VE ÇIKIŞ

  // Kullanıcı adı ve baş harflerini hazırla
  const userName = profile?.full_name || "User";
  const userRole = profile?.role || "Member";
  const initials = userName.split(" ").map((n:string) => n[0]).join("").toUpperCase().slice(0,2);

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
              C
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg tracking-tight">Competalent</h1>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">HR Intelligence</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {/* ... LİNKLER AYNI KALSIN ... */}
          {/* KISACA MEVCUT LİNKLERİ BURADA KORUYUN */}
          
          <div className="text-xs font-semibold text-slate-400 mb-4 px-4 uppercase tracking-wider">Main Menu</div>
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all group">
            <LayoutDashboard size={20} className="text-slate-400 group-hover:text-blue-600" />
            Dashboard
          </Link>
          <Link href="/dashboard/positions" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all group">
            <Briefcase size={20} className="text-slate-400 group-hover:text-slate-600" />
            Positions
          </Link>
          <Link href="/dashboard/open-positions" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all group">
            <FileText size={20} className="text-slate-400 group-hover:text-slate-600" />
            Active Recruitments
          </Link>
          <Link href="/dashboard/closed-positions" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all group">
             <Archive size={20} className="text-slate-400 group-hover:text-slate-600" />
             Closed Positions
          </Link>
          <Link href="/dashboard/candidates" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all group">
            <Users size={20} className="text-slate-400 group-hover:text-slate-600" />
            Candidates
          </Link>
          <Link href="/dashboard/competencies" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all group">
            <Layers size={20} className="text-slate-400 group-hover:text-slate-600" />
            Competency Pool
          </Link>
          
          <div className="mt-8 text-xs font-semibold text-slate-400 mb-4 px-4 uppercase tracking-wider">Settings</div>
          <Link href="/dashboard/organization" className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all group">
            <Settings size={20} className="text-slate-400 group-hover:text-slate-600" />
            Organization
          </Link>
        </nav>

        {/* LOGOUT BÖLÜMÜ GÜNCELLENDİ */}
        <div className="p-4 border-t border-slate-100">
           <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs">
                 {initials}
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-sm font-bold text-slate-700 truncate">{userName}</p>
                 <p className="text-xs text-slate-400 truncate uppercase">{userRole}</p>
              </div>
           </div>
           
           <button 
             onClick={() => signOut()} // <-- ÇIKIŞ FONKSİYONU
             className="w-full mt-3 flex items-center gap-2 text-xs text-red-500 font-medium hover:text-red-600 px-1 py-1 hover:bg-red-50 rounded transition-colors"
           >
             <LogOut size={14} /> Sign Out
           </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 py-4 px-8 flex items-center justify-between sticky top-0 z-10">
           <div className="w-96">
              <input 
                type="text" 
                placeholder="Search..." 
                className="w-full bg-slate-50 border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
           </div>
           
           <div className="flex items-center gap-4">
              <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs border border-slate-200">
                 {initials}
              </div>
           </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}