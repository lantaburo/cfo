import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const WEBHOOK_URL = process.env.NEXT_PUBLIC_GSHEETS_WEBHOOK_URL;
    
    if (!WEBHOOK_URL) {
      throw new Error("Webhook URL is not defined in .env.local");
    }

    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify(data),
      redirect: 'follow'
    });

    const text = await response.text();
    
    let result;
    try {
      result = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse GAS response:", text);
      throw new Error("Invalid response from Google Sheets webhook");
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
