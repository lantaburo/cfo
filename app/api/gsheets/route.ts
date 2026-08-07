import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const WEBHOOK_URL = process.env.NEXT_PUBLIC_GSHEETS_WEBHOOK_URL;
    
    if (!WEBHOOK_URL) {
      throw new Error("Webhook URL is not defined in .env.local");
    }
    
    // Mencegah error Google Sheets Cell Limit (Max 50,000 karakter)
    // Jika actionPlan terlalu panjang, potong sebelum dikirim ke GAS
    if (data.actionPlan && typeof data.actionPlan === 'string' && data.actionPlan.length > 45000) {
      data.actionPlan = data.actionPlan.substring(0, 45000) + "\n\n... [Hasil analisa dipotong otomatis karena melebihi batas maksimal ukuran database]";
    }

    const response = await axios.post(WEBHOOK_URL, JSON.stringify(data), {
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      }
    });

    let result = response.data;
    if (typeof result === 'string') {
      try {
        result = JSON.parse(result);
      } catch (e) {
        console.error("Failed to parse GAS response:", result);
        const snippet = result.substring(0, 100).replace(/<[^>]*>?/gm, ''); // get text snippet
        throw new Error(`Invalid response from Google Sheets webhook: ${snippet}`);
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.response) {
      console.error("Failed to parse GAS response:", error.response.data);
      const snippet = typeof error.response.data === 'string' ? error.response.data.substring(0, 100).replace(/<[^>]*>?/gm, '') : JSON.stringify(error.response.data).substring(0, 100);
      return NextResponse.json({ status: 'error', message: `Invalid response from Google Sheets webhook: ${snippet}` }, { status: 500 });
    }
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
