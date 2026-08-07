import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const WEBHOOK_URL = process.env.NEXT_PUBLIC_GSHEETS_WEBHOOK_URL;
    const data = { action: "getUsers" };
    
    const response = await fetch(WEBHOOK_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      body: JSON.stringify(data),
      redirect: 'follow'
    });

    const text = await response.text();
    return NextResponse.json({ text, status: response.status, url: response.url, redirected: response.redirected });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
