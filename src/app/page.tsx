import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Header / Navbar */}
      <header className="px-6 h-16 flex items-center justify-between border-b bg-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <span className="font-bold text-xl text-slate-900">Competalent</span>
        </div>
        <nav className="hidden md:flex gap-6 text-sm font-medium text-slate-600">
          <Link href="#" className="hover:text-blue-600">Features</Link>
          <Link href="#" className="hover:text-blue-600">Pricing</Link>
          <Link href="#" className="hover:text-blue-600">About</Link>
        </nav>
        <div className="flex gap-4">
          <Button variant="ghost">Log in</Button>
          <Button>Get Started</Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="max-w-3xl space-y-6">
          <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
            New: AI-Powered Resume Parsing
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight">
            Hire the best talent, <br />
            <span className="text-blue-600">without the bias.</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Competalent helps you screen, rank, and match candidates to positions using advanced AI. 
            Save hours on manual CV screening.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" className="h-12 px-8 text-lg">
              Start Free Trial
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-lg">
              View Demo
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-500 text-sm border-t bg-white">
        © 2025 Competalent Inc. All rights reserved.
      </footer>
    </div>
  );
}