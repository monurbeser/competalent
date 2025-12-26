"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Başarılı giriş
      router.push("/dashboard");

    } catch (error: any) {
      alert("Giriş başarısız: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100 relative overflow-hidden">
        {/* Dekoratif Gradient */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

        <div className="text-center mb-8">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 shadow-lg shadow-blue-200">C</div>
            <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-sm text-slate-500 mt-1">Sign in to your organization workspace.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
                <Label className="text-xs font-semibold text-slate-600 uppercase">Work Email</Label>
                <Input 
                    required 
                    type="email" 
                    value={email} 
                    onChange={e => setEmail(e.target.value)} 
                    placeholder="john@company.com"
                    className="bg-slate-50"
                />
            </div>
            <div className="space-y-1">
                <div className="flex justify-between items-center">
                    <Label className="text-xs font-semibold text-slate-600 uppercase">Password</Label>
                    <Link href="#" className="text-xs text-blue-600 hover:underline">Forgot password?</Link>
                </div>
                <Input 
                    required 
                    type="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)} 
                    placeholder="••••••••"
                    className="bg-slate-50"
                />
            </div>

            <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-base font-semibold shadow-lg transition-all hover:scale-[1.02]" disabled={loading}>
                {loading ? <Loader2 className="animate-spin mr-2" /> : "Sign In"}
            </Button>
        </form>
        
        <div className="text-center mt-6 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-400">
                Don't have an account? <Link href="/register" className="text-blue-600 font-bold hover:underline">Sign Up</Link>
            </p>
        </div>
      </div>
    </div>
  );
}