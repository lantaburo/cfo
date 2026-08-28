import { NextResponse } from 'next/server';
import axios from 'axios';

export const maxDuration = 60; // Allow function to run up to 60 seconds on Vercel

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // 1. Fetch AI Settings from Google Sheets
    const WEBHOOK_URL = process.env.NEXT_PUBLIC_GSHEETS_WEBHOOK_URL;
    if (!WEBHOOK_URL) throw new Error("Webhook URL is not defined");

    let settings: any = {};
    try {
      const initialRes = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: JSON.stringify({ action: 'getSettings' }),
        cache: 'no-store',
        redirect: 'manual'
      });
      
      let settingsData;
      if (initialRes.status === 302 || initialRes.status === 303 || initialRes.status === 301 || initialRes.type === 'opaqueredirect') {
        const location = initialRes.headers.get('location');
        if (location) {
          const redirectRes = await fetch(location, { cache: 'no-store' });
          settingsData = await redirectRes.json();
        } else {
          throw new Error('Redirect location missing');
        }
      } else {
        settingsData = await initialRes.json();
      }
      
      if (settingsData && settingsData.status === 'success' && settingsData.settings) {
        settings = settingsData.settings;
      }
    } catch (e) {
      console.warn("Gagal mengambil setting dari GSheets, menggunakan default (Gemini)", e);
      settings = { ai_provider: 'Gemini', ai_model: 'gemini-1.5-flash' };
    }

    const provider = settings.ai_provider || 'Gemini';
    const model = settings.ai_model || 'gemini-1.5-flash';
    const customUrl = settings.ai_custom_url || 'https://api.openai.com/v1/chat/completions';
    
    // Fallback to local .env if api_key is empty in Sheets
    const apiKey = settings.ai_api_key || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.warn("No API Key found, returning mock response.");
      await new Promise(resolve => setTimeout(resolve, 1500));
      return NextResponse.json({
        financial_checkup: {
          ratios: [
            { name: "Liquidity Ratio", value: "11.11", condition: "Good", guideline: "> 6 bulan" },
            { name: "Debt to Asset Ratio", value: "4.6%", condition: "Good", guideline: "< 50%" },
            { name: "Saving Ratio", value: "27.4%", condition: "Good", guideline: "> 10%" }
          ],
          overall_health_summary: "Kondisi keuangan Anda saat ini sangat sehat dengan rasio tabungan yang baik. (MOCK DATA KARENA API KEY KOSONG)"
        },
        macro_micro_analysis: {
          inflation_assumptions: "Inflasi Umum 5%, Inflasi Pendidikan 10%.",
          investment_climate: "Pasar modal syariah dan instrumen Sukuk Negara (SBN) saat ini menawarkan imbal hasil yang stabil."
        },
        debt_restructuring_plan: "Karena Anda masih memiliki sisa hutang KPA Konvensional, sangat disarankan untuk melakukan percepatan pelunasan.",
        goal_projections: [],
        investment_allocation_plan: { lumpsum_allocation: [], monthly_allocation: [] },
        cfo_closing_statement: "Mari eksekusi rencana ini secara disiplin."
      });
    }

    const defaultPersona = `Anda adalah seorang Chief Financial Officer (CFO) Senior dan Konsultan Keuangan Pribadi (Financial Planner) berkelas dunia, yang memiliki spesialisasi eksklusif pada **Keuangan dan Investasi Syariah (100% Halal)**.`;

    const mandatoryRules = `
TUGAS DAN ATURAN UTAMA:
1. Baca JSON klien dan hasilkan output berupa JSON object MURNI tanpa markdown (tanpa blok \`\`\`json). 
2. DILARANG KERAS merekomendasikan instrumen riba.
3. **Dana Darurat Otomatis**: Anda WAJIB menghitung dan menambahkan 'Dana Darurat' ke dalam \`goal_projections\`. Rumus perhitungan \`target_amount\` HARUS persis seperti ini:
   - Kebutuhan DD per bulan = Total Pengeluaran Bulanan (Primer) + Total Kewajiban Bulanan (Cicilan utang).
   - Tentukan Periode (Bulan) berdasarkan profil klien (misal: 6 bulan, 9 bulan, atau 12 bulan).
   - Total Kebutuhan DD = Kebutuhan DD per bulan x Periode.
   - Target Dana Darurat (\`target_amount\`) = 30% x Total Kebutuhan DD, lalu dibulatkan ke atas.
   (Jelaskan secara singkat rincian perhitungan matematis ini ke dalam field \`notes\`).
4. **Kategorisasi Waktu**: Setiap goal dalam \`goal_projections\` harus memiliki field \`timeframe\` ("Pendek (1-3 Tahun)", "Menengah (4-5 Tahun)", atau "Panjang (>5 Tahun)").
5. **Financial Check Up (LM AI Guide)**: 
   Anda WAJIB membuat laporan analisis komprehensif yang diletakkan SEPENUHNYA ke dalam field \`overall_health_summary\`. **PENTING: JANGAN gunakan Enter/Line-break asli di dalam string JSON. Anda WAJIB menggunakan literal karakter \\n (backslash n) untuk membuat paragraf baru**. Wajib mencakup struktur persis berikut:
   - **Narasi Hasil Analysis Setiap Rasio Keuangan**: Berikan narasi profesional mendalam untuk setiap rasio (Liquidity, Liquid Asset to Net Worth, Net Investment Asset to Net Worth, Debt to Asset, Solvency, Debt Service, Saving). Jangan sekadar menyebut 'Good' atau 'Poorly', jelaskan maknanya secara real, serta korelasinya dengan cashflow, utang, atau aset klien saat ini.
   - **Kesimpulan & Resume Financial Check-Up**: Berikan kesimpulan menyeluruh. Nyatakan fase kesehatan keuangan (misal: "fase lampu kuning menuju merah" atau "fase sehat berkembang").
   - **Diagnosis Utama**: Berikan satu kalimat tajam/punchy sebagai konklusi utama (contoh: "Kaya Likuiditas, Terjebak Defisit Arus Kas (Illusion of Wealth)").
   - **3 Masalah Krusial yang Harus Dibenahi**: Buat daftar 3 poin krusial berdasarkan angka.
   - **Rekomendasi Langkah Strategis (Action Plan)**: Buat daftar poin aksi konkrit (misal: restrukturisasi/pelunasan dini, rasionalisasi pengeluaran, re-alokasi aset).
6. **Analisis Cashflow & Pengeluaran**:
   - Secara detail evaluasi kategori pengeluaran klien (Primer, Sekunder, Kewajiban, Sosial, Tabungan/Investasi, Latte Factor).
   - Khusus untuk **'Latte Factor'** (pengeluaran impulsif/terselubung): Berikan saran spesifik cara mengurangi/menghilangkannya untuk dialihkan ke investasi/tabungan.
   - Khusus untuk **'Sosial'**: Pastikan pengalokasian Zakat/Infaq/Sedekah sudah sesuai standar Syariah.
   - Khusus untuk **'Primer' & 'Kewajiban'**: Pastikan proporsinya tidak melebihi batas wajar.
7. **Profil Risiko (Risk Profile)**: Klien telah mengisi kuesioner profil risiko dan hasilnya terdapat di dalam data JSON (\`riskProfile\`). Gunakan skor, tipe profil (Konservatif, Moderat, Agresif Sedang, Agresif), dan saran alokasi aset yang ada di dalamnya sebagai dasar UTAMA dalam menyusun \`investment_allocation_plan\`. Jangan berikan saran alokasi yang bertentangan dengan profil risikonya.

Output JSON harus mengikuti struktur ini persis (PENTING! Jangan ubah nama key):
{
  "financial_checkup": { "ratios": [], "overall_health_summary": "" },
  "macro_micro_analysis": { "inflation_assumptions": "", "investment_climate": "" },
  "debt_restructuring_plan": "",
  "goal_projections": [
    { "goal_name": "Dana Darurat (Auto)", "target_amount": 0, "timeframe": "Pendek (1-3 Tahun)", "recommended_lumpsum_investment": 0, "recommended_monthly_investment": 0, "recommended_instruments": [], "notes": "" }
  ],
  "investment_allocation_plan": { "lumpsum_allocation": [], "monthly_allocation": [] },
  "cfo_closing_statement": ""
}`;

    let baseInstruction = (settings.ai_system_prompt && settings.ai_system_prompt.trim() !== '') 
      ? settings.ai_system_prompt 
      : defaultPersona;

    const systemInstruction = baseInstruction + "\n\n" + mandatoryRules;

    const promptText = "Analisis data ini: " + JSON.stringify(data);
    let jsonText = "";

    // 2. Call the AI based on the Provider
    if (provider === 'Gemini') {
      const payload = {
        system_instruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: "user", parts: [{ text: promptText }] }],
        generationConfig: { response_mime_type: "application/json" }
      };

      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const aiResponse: any = await res.json();
      if (aiResponse.error) throw new Error(aiResponse.error?.message || JSON.stringify(aiResponse.error));
      if (!aiResponse.candidates || !aiResponse.candidates[0]) {
        throw new Error("Gemini mengembalikan respons tidak valid: " + JSON.stringify(aiResponse));
      }
      jsonText = aiResponse.candidates[0].content.parts[0].text;
      
    } else {
      // OpenAI or Custom OpenAI-Compatible Provider
      let url = provider === 'OpenAI' ? 'https://api.openai.com/v1/chat/completions' : customUrl;
      
      // Auto-fix for common user mistake: only inputting the base domain
      if (provider === 'Custom' && !url.includes('/chat/completions')) {
        url = url.replace(/\/+$/, '') + '/v1/chat/completions';
      }

      const payload = {
        model: model,
        messages: [
          { role: "system", content: systemInstruction },
          { role: "user", content: promptText }
        ],
        response_format: { type: "json_object" }
      };

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify(payload)
      });
      const aiResponse: any = await res.json();
      
      if (aiResponse.error) throw new Error(aiResponse.error?.message || JSON.stringify(aiResponse.error));
      
      if (!aiResponse.choices || !aiResponse.choices[0]) {
        throw new Error("Provider AI mengembalikan respons tidak valid: " + JSON.stringify(aiResponse));
      }
      
      jsonText = aiResponse.choices[0].message.content;
    }

    // Clean up potential markdown formatting from custom providers
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonText = jsonMatch[0];
    } else {
      jsonText = jsonText.replace(/```json/ig, '').replace(/```/g, '').trim();
    }
    
    return NextResponse.json(JSON.parse(jsonText));

  } catch (error: any) {
    console.error("API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
