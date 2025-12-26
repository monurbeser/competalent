"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  BrainCircuit, 
  FileText, 
  Target, 
  Layers, 
  BarChart3, 
  CheckCircle, 
  ArrowRight,
  ShieldCheck,
  Zap
} from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-20 pb-32 lg:pt-32 lg:pb-40">
        <div className="absolute top-0 left-0 w-full h-full bg-white">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-100/50 rounded-full blur-3xl opacity-50 pointer-events-none" />
        </div>
        
        <div className="container mx-auto px-6 relative z-10 text-center">
          <Badge className="mb-6 bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-1.5 text-sm rounded-full border border-blue-200">
            <Sparkles size={14} className="mr-2 inline" /> 
            Powered by GPT-4o Intelligence
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8">
            Recruiting, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Reimagined.</span>
          </h1>
          
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Stop drowning in CVs. Let Competalent's AI engine analyze, score, and match the best talent to your open positions in seconds.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 h-14 px-8 text-lg rounded-full shadow-xl shadow-blue-200">
                    Get Started Free <ArrowRight className="ml-2" />
                </Button>
            </Link>
            <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-slate-300 hover:bg-white">
                View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* 2. BENTO GRID FEATURES (ANA ÖZELLİKLER) */}
      <section className="py-20 bg-white border-y border-slate-100">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-800 mb-4">Everything you need to hire top talent</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
                Our platform combines advanced parsing technology with human-centric design to streamline your entire recruitment workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* FEATURE 1: AI MATCHING (BÜYÜK KART) */}
            <div className="md:col-span-2 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-3xl p-8 border border-blue-100 relative overflow-hidden group">
                <div className="relative z-10">
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 text-indigo-600">
                        <BrainCircuit size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800 mb-3">AI-Powered Candidate Matching</h3>
                    <p className="text-slate-600 max-w-md">
                        Our engine reads job descriptions and candidate profiles semantically. It doesn't just look for keywords; it understands context, experience, and soft skills to provide a 0-100 match score.
                    </p>
                </div>
                {/* Dekoratif Görsel (Abstract UI) */}
                <div className="absolute right-[-40px] bottom-[-40px] w-64 h-64 bg-white rounded-xl shadow-xl border border-slate-100 rotate-[-6deg] group-hover:rotate-0 transition-all duration-500 p-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">95</div>
                        <div><div className="h-2 w-24 bg-slate-200 rounded"></div><div className="h-2 w-16 bg-slate-100 rounded mt-1"></div></div>
                    </div>
                    <div className="space-y-2">
                        <div className="h-2 w-full bg-slate-50 rounded"></div>
                        <div className="h-2 w-full bg-slate-50 rounded"></div>
                        <div className="h-2 w-3/4 bg-slate-50 rounded"></div>
                    </div>
                </div>
            </div>

            {/* FEATURE 2: CV PARSING */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 group hover:border-blue-300 transition-colors">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 text-orange-500">
                    <FileText size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Instant PDF Parsing</h3>
                <p className="text-slate-500 text-sm">
                    Drag and drop bulk resumes. We extract contact info, work history, skills, and education automatically—turning PDF chaos into structured data.
                </p>
            </div>

            {/* FEATURE 3: COMPETENCY MATRIX */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 group hover:border-blue-300 transition-colors">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-6 text-purple-600">
                    <Layers size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-3">Competency Matrices</h3>
                <p className="text-slate-500 text-sm">
                    Define precise skill requirements for each role. Visualize skill gaps and ensure every candidate meets your specific technical and soft skill standards.
                </p>
            </div>

            {/* FEATURE 4: ANALYTICS (BÜYÜK KART) */}
            <div className="md:col-span-2 bg-slate-900 rounded-3xl p-8 border border-slate-800 text-white relative overflow-hidden group">
                 <div className="relative z-10">
                    <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shadow-sm mb-6 text-blue-400">
                        <BarChart3 size={32} />
                    </div>
                    <h3 className="text-2xl font-bold mb-3">Real-time Recruitment Analytics</h3>
                    <p className="text-slate-400 max-w-md">
                        Track your hiring pipeline, time-to-hire, and source effectiveness. Get a bird's-eye view of your entire organization's talent acquisition performance.
                    </p>
                </div>
                 <div className="absolute right-0 top-10 w-64 h-64 opacity-20">
                    <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                      <path fill="#3B82F6" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.2C93.5,8.8,82.2,21.9,71.4,33.3C60.6,44.7,50.3,54.4,39,62.5C27.7,70.6,15.4,77.1,1.9,73.8C-11.6,70.5,-26.3,57.4,-38.7,46.7C-51.1,36,-61.2,27.7,-68.6,16.6C-76,5.5,-80.7,-8.4,-77.1,-21.1C-73.5,-33.8,-61.6,-45.3,-49.2,-53.2C-36.8,-61.1,-23.9,-65.4,-10.8,-67.2C2.3,-69,15.4,-68.3,30.5,-73.4Z" transform="translate(100 100)" />
                    </svg>
                 </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DETAY LİSTESİ */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div>
                    <Badge className="mb-4 bg-green-100 text-green-700 hover:bg-green-200">Efficiency First</Badge>
                    <h2 className="text-4xl font-bold text-slate-900 mb-6">Designed for modern HR teams.</h2>
                    <p className="text-lg text-slate-600 mb-8">
                        Competalent isn't just a database; it's an intelligent assistant that handles the tedious parts of recruiting, allowing you to focus on people.
                    </p>
                    
                    <ul className="space-y-4">
                        {[
                            "Drag-and-drop Kanban workflows (Coming Soon)", 
                            "Automated email notifications", 
                            "Role-based access control",
                            "GDPR Compliant Data Storage",
                            "Customizable interview scorecards"
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-slate-700">
                                <CheckCircle size={20} className="text-blue-600 shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-600 rounded-3xl rotate-3 opacity-10"></div>
                    <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 relative">
                        <div className="flex items-center justify-between mb-8">
                            <h4 className="font-bold text-slate-800">Recruitment Velocity</h4>
                            <Badge variant="outline">This Month</Badge>
                        </div>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Zap size={20}/></div>
                                    <span className="font-medium text-slate-700">Time to Hire</span>
                                </div>
                                <span className="font-bold text-slate-900">-40%</span>
                            </div>
                            <div className="h-px bg-slate-100"></div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-green-50 text-green-600 rounded-lg"><Target size={20}/></div>
                                    <span className="font-medium text-slate-700">Quality of Hire</span>
                                </div>
                                <span className="font-bold text-slate-900">+85%</span>
                            </div>
                            <div className="h-px bg-slate-100"></div>
                             <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><ShieldCheck size={20}/></div>
                                    <span className="font-medium text-slate-700">Data Accuracy</span>
                                </div>
                                <span className="font-bold text-slate-900">99.9%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* 4. CTA SECTION */}
      <section className="py-24 bg-slate-900 text-white text-center">
        <div className="container mx-auto px-6">
            <h2 className="text-4xl font-bold mb-6">Ready to transform your hiring?</h2>
            <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
                Join forward-thinking companies using Competalent to find the right people, faster.
            </p>
            <Link href="/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 h-14 px-10 text-lg rounded-full">
                    Start Your Free Trial
                </Button>
            </Link>
            <p className="mt-6 text-sm text-slate-500">No credit card required • 14-day free trial</p>
        </div>
      </section>

    </div>
  );
}