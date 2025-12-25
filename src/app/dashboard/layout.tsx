import Link from "next/link";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Settings, 
  Layers, 
  FileText, 
  Archive // <-- EKSİK OLAN BUYDU, EKLENDİ
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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

          {/* YENİ EKLENEN LINK */}
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

        <div className="p-4 border-t border-slate-100">
           <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3 border border-slate-100">
              <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center font-bold text-xs">
                 EY
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-sm font-bold text-slate-700 truncate">Emre Yilmaz</p>
                 <p className="text-xs text-slate-400 truncate">Admin • TechCorp</p>
              </div>
           </div>
           <button className="w-full mt-3 text-xs text-red-500 font-medium hover:text-red-600 text-left px-1">Sign Out</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-auto">
        <header className="bg-white border-b border-slate-200 py-4 px-8 flex items-center justify-between sticky top-0 z-10">
           {/* Header Search / Breadcrumb can go here */}
           <div className="w-96">
              <input 
                type="text" 
                placeholder="Search candidates, skills, or jobs..." 
                className="w-full bg-slate-50 border-slate-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              />
           </div>
           
           <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
                 <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
              </button>
              <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs border border-slate-200">
                 EY
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