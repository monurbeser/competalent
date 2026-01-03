import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { authenticateRequest } from "@/lib/apiAuth";

export const runtime = 'nodejs'; // Timeout süresini uzatır

export async function POST(req: NextRequest) {
  try {
    const { openingId, positionTitle, description, skills } = await req.json();

    const auth = await authenticateRequest(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { orgId, supabase } = auth;
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // İlanın kullanıcının organizasyonuna ait olduğunu doğrula
    const { data: openingRecord, error: openingError } = await supabase
      .from("job_openings")
      .select("organization_id")
      .eq("id", openingId)
      .single();

    if (openingError || !openingRecord || openingRecord.organization_id !== orgId) {
      return NextResponse.json({ error: "Unauthorized access to job opening." }, { status: 403 });
    }

    // 1. Önce bu ilana ait eski eşleşmeleri temizle (Temiz sayfa)
    await supabase.from("matches").delete().eq("job_opening_id", openingId);

    // 2. Adayları Çek
    const { data: candidates } = await supabase
      .from("candidates")
      .select("id, full_name, parsed_data, summary")
      .eq("organization_id", orgId);

    if (!candidates || candidates.length === 0) {
      return NextResponse.json({ success: false, message: "Havuzda hiç aday yok." });
    }

    // 3. AI'a Gönderilecek Veriyi Hazırla (Payload)
    // Adayın parsed_data'sı boş olsa bile en azından summary'sini gönderiyoruz.
    const candidatesPayload = candidates.map(c => ({
        id: c.id,
        name: c.full_name,
        skills: c.parsed_data?.skills || [], 
        experience_summary: c.summary || "No description provided."
    }));

    // 4. Güçlü Prompt
    const prompt = `
    ROLE: You are an expert Recruiter.
    
    JOB OPENING:
    - Title: ${positionTitle}
    - Description: ${description}
    - Priority Skills: ${skills && skills.length > 0 ? skills.join(", ") : "General fit based on title"}
    
    CANDIDATE POOL:
    ${JSON.stringify(candidatesPayload)}

    TASK:
    Evaluate EVERY candidate in the pool. Do not skip anyone.
    Assign a match score (0-100).
    - 80-100: Strong match (Has key skills + relevant experience).
    - 50-79: Potential match (Has some skills or transferable experience).
    - 0-49: Weak match.

    RETURN JSON FORMAT:
    {
      "matches": [
        { "candidate_id": "...", "score": 85, "reason": "Has 5 years exp and knows React." },
        ...
      ]
    }
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a JSON analysis engine. Output JSON only." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(completion.choices[0].message.content || "{}");
    const matches = result.matches || [];

    // 5. Sonuçları Veritabanına Yaz
    if (matches.length > 0) {
      const inserts = matches.map((m: any) => ({
        job_opening_id: openingId,
        candidate_id: m.candidate_id,
        match_score: m.score,
        ai_reason: m.reason
      }));

      const { error } = await supabase.from("matches").insert(inserts);
      if (error) throw error;
    }

    return NextResponse.json({ success: true, count: matches.length });

  } catch (error: any) {
    console.error("Match Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
