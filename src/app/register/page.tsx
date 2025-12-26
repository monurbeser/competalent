"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
    consent: false
  });

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) { alert("Please accept the terms."); return; }
    
    setLoading(true);

    try {
        // 1. KULLANICIYI OLUŞTUR
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: { data: { full_name: formData.fullName } }
        });

        if (signUpError) throw signUpError;

        // 2. GARANTİ GİRİŞ (Session'ı Zorla Al)
        // Eğer session boş geldiyse (confirm email kapalı olsa bile bazen olur),
        // hemen arkasından giriş yapıp token'ı alıyoruz.
        let session = signUpData.session;
        if (!session) {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });
            if (signInError) throw signInError;
            session = signInData.session;
        }

        if (!session) throw new Error("Oturum açılamadı. Lütfen e-posta ayarlarını kontrol edin.");

        // 3. ŞİRKETİ OLUŞTUR
        const { data: orgData, error: orgError } = await supabase
            .from("organizations")
            .insert([{ name: formData.companyName }])
            .select()
            .single();

        if (orgError) throw new Error("Organization Error: " + orgError.message);

        // 4. PROFİLİ OLUŞTUR
        const { error: profileError } = await supabase
            .from("profiles")
            .insert([{
                id: session.user.id, // Session'dan gelen garanti ID
                full_name: formData.fullName,
                email: formData.email,
                organization_id: orgData.id,
                role: 'admin'
            }]);

        if (profileError) throw new Error("Profile Error: " + profileError.message);

        // 5. BİTTİ -> YÖNLENDİR
        router.refresh();
        router.push("/dashboard");

    } catch (error: any) {
        console.error("Register Error:", error);
        alert("Hata: " + error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-slate-100">
        <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Get Started</h1>
            <p className="text-sm text-slate-500">Create workspace instantly.</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-1">
                <Label>Full Name</Label>
                <Input required onChange={e => setFormData({...formData, fullName: e.target.value})} />
            </div>
            <div className="space-y-1">
                <Label>Company Name</Label>
                <Input required onChange={e => setFormData({...formData, companyName: e.target.value})} />
            </div>
            <div className="space-y-1">
                <Label>Email</Label>
                <Input required type="email" onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
            <div className="space-y-1">
                <Label>Password</Label>
                <Input required type="password" onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            
            <div className="flex items-center gap-2 pt-2">
                <Checkbox id="terms" checked={formData.consent} onCheckedChange={(c: boolean) => setFormData({...formData, consent: c})} />
                <label htmlFor="terms" className="text-xs">I agree to Terms & Conditions.</label>
            </div>

            <Button type="submit" className="w-full h-12 bg-slate-900 text-white" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : "Sign Up & Login"}
            </Button>
        </form>
      </div>
    </div>
  );
}