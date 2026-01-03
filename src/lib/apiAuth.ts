import { NextRequest } from "next/server";
import { createClient, User } from "@supabase/supabase-js";

type AuthSuccess = {
  user: User;
  orgId: string;
  supabase: ReturnType<typeof createClient>;
};

type AuthFailure = {
  error: string;
  status: number;
};

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createServiceSupabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Supabase environment variables are not configured correctly.");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
};

export async function authenticateRequest(req: NextRequest): Promise<AuthSuccess | AuthFailure> {
  const supabase = createServiceSupabaseClient();
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    return { error: "Authorization token missing.", status: 401 };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser(token);

  if (userError || !user) {
    return { error: "Invalid or expired token.", status: 401 };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single();

  if (profileError || !profile?.organization_id) {
    return { error: "Organization not found for user.", status: 403 };
  }

  return { user, orgId: profile.organization_id, supabase };
}
