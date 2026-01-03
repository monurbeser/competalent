import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import PDFParser from "pdf2json";
import { authenticateRequest } from "@/lib/apiAuth";

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  console.log("--- GELİŞMİŞ CV ANALİZİ BAŞLADI ---");

  try {
    const auth = await authenticateRequest(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { supabase, orgId } = auth;
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const requestedOrgId = formData.get("orgId")?.toString();

    if (!file) return NextResponse.json({ error: "Dosya yok" }, { status: 400 });
    if (requestedOrgId && requestedOrgId !== orgId) {
      return NextResponse.json({ error: "Organization mismatch." }, { status: 403 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    // 1. Storage'a Yükle
    const uniqueFileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`;
    const { error: uploadError } = await supabase.storage.from("resumes").upload(uniqueFileName, file);
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const { data: publicUrlData } = supabase.storage.from("resumes").getPublicUrl(uniqueFileName);

    // 2. PDF Metnini Oku
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const resumeText = await new Promise<string>((resolve, reject) => {
        const pdfParser = new PDFParser(null, true);
        pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", (pdfData: any) => resolve(decodeURIComponent(pdfParser.getRawTextContent())));
        pdfParser.parseBuffer(buffer);
    });

    // 3. AI ile Detaylı Analiz (Extraction)
    const prompt = `
    You are an expert CV parser. Extract the following structured data from the resume text below.
    Return ONLY JSON.

    FIELDS TO EXTRACT:
    - full_name: Candidate Name
    - email: Email address (if found, else empty)
    - phone: Phone number (if found, else empty)
    - location: City, Country
    - summary: A professional summary or cover letter text derived from the CV (max 50 words).
    - skills: An array of strings (e.g. ["React", "Python", "Team Leadership"]).
    - experience: An array of objects, each containing:
        - title: Job Title
        - company: Company Name
        - years: Duration (e.g. "2019-2021" or "2 years")
    - ai_analysis: Your brief expert comment on the candidate's profile (e.g. "Strong technical background but lacks leadership exp.")

    RESUME TEXT:
    ${resumeText.substring(0, 3500)}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a JSON extractor." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" },
    });

    const parsedData = JSON.parse(completion.choices[0].message.content || "{}");
    console.log("AI Extraction Complete:", parsedData.full_name);

    // 4. Veritabanına Kaydet
    const { data: candidate, error: dbError } = await supabase
      .from("candidates")
      .insert([
        {
          organization_id: orgId,
          full_name: parsedData.full_name || "Unknown Candidate",
          email: parsedData.email || "pending@extraction.com",
          phone: parsedData.phone,
          resume_url: publicUrlData.publicUrl,
          parsed_data: parsedData, // Ham veriyi de saklayalım
          summary: parsedData.summary,
          
          // Yeni Alanlar
          experience: parsedData.experience || [],
          skills: parsedData.skills || [],
          cover_letter: parsedData.summary,
          ai_analysis: parsedData.ai_analysis,
          
          ai_score: 0 // Henüz bir pozisyonla eşleşmedi
        },
      ])
      .select()
      .single();

    if (dbError) throw dbError;

    return NextResponse.json({ success: true, candidate });

  } catch (error: any) {
    console.error("PARSE ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
