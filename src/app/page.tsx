import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, BarChart3, Users, Zap, LayoutDashboard, BrainCircuit } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* HEADER / NAVBAR */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-200">
              C
            </div>
            <span className="font-bold text-xl tracking-tight text-slate-800">Competalent</span>
          </div>
          
          {/* Menu Links - BURAYI GÜNCELLEDİK */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">
              Features
            </Link>
            <Link href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors opacity-50 cursor-not-allowed">
              Pricing
            </Link>
            <Link href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors opacity-50 cursor-not-allowed">
              About
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
             <Link href="/dashboard">
                <Button variant="ghost" className="text-slate-600 hover:text-blue-600 font-medium">Log In</Button>
             </Link>
             <Link href="/dashboard">
                <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full px-6 transition-all hover:scale-105">
                  Get Started
                </Button>
             </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="container mx-auto px-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wider mb-8 border border-blue-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                New: AI Resume Parsing 2.0
            </div>
            
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-6 max-w-4xl mx-auto leading-tight">
              Hire the best talent,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">powered by Intelligence.</span>
            </h1>
            
            <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Competalent transforms your recruitment process with AI-driven resume analysis, automated competency matching, and data-backed hiring decisions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/dashboard">
                    <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all hover:scale-105">
                        Launch Dashboard <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                </Link>
                <Link href="/features">
                    <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-slate-200 hover:bg-slate-50 text-slate-600">
                        Explore Features
                    </Button>
                </Link>
            </div>
            
            {/* Dashboard Preview Image */}
            <div className="mt-20 relative max-w-5xl mx-auto">
                <div className="absolute inset-0 bg-blue-600 blur-[100px] opacity-20 rounded-full"></div>
                <div className="relative rounded-2xl border border-slate-200/60 bg-white/50 backdrop-blur-sm p-2 shadow-2xl">
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white">
                        {/* Buraya temsili bir dashboard UI'ı çiziyoruz (Görsel yerine CSS ile) */}
                        <div className="w-full aspect-[16/9] bg-slate-50 flex flex-col">
                            <div className="h-14 border-b border-slate-100 flex items-center px-6 gap-4 bg-white">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                                <div className="h-2 w-64 bg-slate-100 rounded-full"></div>
                            </div>
                            <div className="flex-1 p-8 grid grid-cols-3 gap-6">
                                <div className="col-span-2 space-y-4">
                                    <div className="h-32 bg-white rounded-lg border border-slate-100 shadow-sm p-4 space-y-3">
                                        <div className="h-4 w-1/3 bg-slate-100 rounded"></div>
                                        <div className="h-8 w-1/2 bg-blue-50 rounded"></div>
                                    </div>
                                    <div className="h-48 bg-white rounded-lg border border-slate-100 shadow-sm p-4 space-y-3">
                                        <div className="flex justify-between">
                                            <div className="h-10 w-10 rounded-full bg-indigo-100"></div>
                                            <div className="h-4 w-12 bg-green-100 rounded-full"></div>
                                        </div>
                                        <div className="h-2 w-full bg-slate-50 rounded"></div>
                                        <div className="h-2 w-2/3 bg-slate-50 rounded"></div>
                                    </div>
                                </div>
                                <div className="col-span-1 h-full bg-white rounded-lg border border-slate-100 shadow-sm p-4 space-y-4">
                                     <div className="h-4 w-1/2 bg-slate-100 rounded"></div>
                                     <div className="space-y-2">
                                        {[1,2,3,4].map(i => (
                                            <div key={i} className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100"></div>
                                                <div className="flex-1 h-2 bg-slate-50 rounded"></div>
                                            </div>
                                        ))}
                                     </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* VALUE PROPOSITION */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="space-y-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
                        <BrainCircuit size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">AI-Powered Matching</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Don't just search for keywords. Our semantic engine understands context, matching candidates to roles with 95% accuracy.
                    </p>
                </div>
                <div className="space-y-4">
                    <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                        <LayoutDashboard size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Centralized Pipeline</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Manage all your openings, candidates, and team evaluations in one intuitive dashboard. No more messy spreadsheets.
                    </p>
                </div>
                <div className="space-y-4">
                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-4">
                        <Zap size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Instant setup</h3>
                    <p className="text-slate-600 leading-relaxed">
                        Upload your existing CV database and let our parser structure everything in minutes. Ready to use from day one.
                    </p>
                </div>
            </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-slate-200 rounded text-slate-500 flex items-center justify-center font-bold text-xs">C</div>
                <span className="font-bold text-slate-700">Competalent</span>
            </div>
            <div className="text-sm text-slate-500">
                © 2024 Competalent Inc. All rights reserved.
            </div>
            <div className="flex gap-6">
                <Link href="#" className="text-slate-400 hover:text-slate-600">Privacy</Link>
                <Link href="#" className="text-slate-400 hover:text-slate-600">Terms</Link>
                <Link href="#" className="text-slate-400 hover:text-slate-600">Twitter</Link>
            </div>
        </div>
      </footer>
    </div>
  );
}