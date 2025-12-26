"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter, usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

type Profile = {
  id: string;
  full_name: string;
  email: string;
  organization_id: string;
  role: string;
};

type AuthContextType = {
  user: any | null;
  profile: Profile | null;
  orgId: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  orgId: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Mevcut Oturumu Kontrol Et
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          // Oturum yoksa ve korumalı sayfadaysa login'e at
          if (pathname.startsWith("/dashboard")) {
             router.push("/login");
          }
        }
      } catch (error) {
        console.error("Auth check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // 2. Oturum Değişikliklerini Dinle (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        if (pathname.startsWith("/dashboard")) {
            router.push("/login");
        }
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [pathname, router]);

  // Profil Verisini Çek (Organizasyon ID burada!)
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (!error && data) {
      setProfile(data);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Dashboard'daysa ve yükleniyorsa Loading göster
  if (loading && pathname.startsWith("/dashboard")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <p className="text-sm text-slate-500 font-medium">Loading Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, profile, orgId: profile?.organization_id || null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}