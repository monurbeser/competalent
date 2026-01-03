import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import PDFParser from "pdf2json";
import { authenticateRequest } from "@/lib/apiAuth";

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { supabase, orgId } = auth;
    const { candidateId, resumeUrl: requestedResumeUrl } = await req.json();

    if (!candidateId) {
      return NextResponse.json({ error: "Missing candidate ID or URL" }, { status: 400 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    console.log("Re-analyzing:", candidateId);

    const { data: candidateRecord, error: candidateError } = await supabase
      .from("candidates")
      .select("organization_id, resume_url")
      .eq("id", candidateId)
      .single();

    if (candidateError || !candidateRecord || candidateRecord.organization_id !== orgId) {
      return NextResponse.json({ error: "Unauthorized candidate access." }, { status: 403 });
    }

    const resumeUrl = candidateRecord.resume_url || requestedResumeUrl;
    if (!resumeUrl) {
      return NextResponse.json({ error: "Resume URL not found for candidate." }, { status: 400 });
    }

    // 1. Dosyayı Supabase Storage'dan İndir
    // URL'den dosya yolunu (path) ayıklamamız lazım. 
    // Örnek URL: .../storage/v1/object/public/resumes/1735...pdf
    const path = resumeUrl?.split("/resumes/")[1];
    
    if (!path) {
        return NextResponse.json({ error: "Invalid resume URL format" }, { status: 400 });
    }

    const { data: fileBlob, error: downloadError } = await supabase.storage
        .from("resumes")
        .download(path);

    if (downloadError || !fileBlob) {
        return NextResponse.json({ error: "File download failed" }, { status: 500 });
    }

    // 2. PDF Metnini Oku
    const arrayBuffer = await fileBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    const resumeText = await new Promise<string>((resolve, reject) => {
        const pdfParser = new PDFParser(null, true);
        pdfParser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
        pdfParser.on("pdfParser_dataReady", (pdfData: any) => resolve(decodeURIComponent(pdfParser.getRawTextContent())));
        pdfParser.parseBuffer(buffer);
    });

    // 3. AI ile Detaylı Analiz (Güncel Prompt)
    const prompt = `
    Extract structured data from this resume text. Return ONLY JSON.
    
    FIELDS:
    - full_name: Candidate Name
    - email: Email
    - phone: Phone
    - location: City, Country
    - summary: Professional summary (max 50 words)
    - skills: String array (e.g. ["React", "Sales"])
    - experience: Array of objects { title, company, years }
    - ai_analysis: Expert brief comment on profile.

    TEXT:
    ${resumeText.substring(0, 3500)}
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: "JSON extractor." }, { role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    const parsedData = JSON.parse(completion.choices[0].message.content || "{}");

    // 4. Veritabanını Güncelle
    const { error: updateError } = await supabase
        .from("candidates")
        .update({
            full_name: parsedData.full_name, // İsim yanlışsa düzelir
            email: parsedData.email,
            phone: parsedData.phone,
            summary: parsedData.summary,
            skills: parsedData.skills || [],
            experience: parsedData.experience || [],
            ai_analysis: parsedData.ai_analysis,
            parsed_data: parsedData
        })
        .eq("id", candidateId);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, data: parsedData });

  } catch (error: any) {
    console.error("RE-ANALYZE ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
