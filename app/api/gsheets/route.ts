import { NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const WEBHOOK_URL = process.env.NEXT_PUBLIC_GSHEETS_WEBHOOK_URL;
    
    if (!WEBHOOK_URL) {
      throw new Error("Webhook URL is not defined in .env.local");
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
        throw new Error("Invalid response from Google Sheets webhook");
      }
    }

    return NextResponse.json(result);
  } catch (error: any) {
    if (error.response) {
      console.error("Failed to parse GAS response:", error.response.data);
      return NextResponse.json({ status: 'error', message: "Invalid response from Google Sheets webhook" }, { status: 500 });
    }
    return NextResponse.json({ status: 'error', message: error.message }, { status: 500 });
  }
}
