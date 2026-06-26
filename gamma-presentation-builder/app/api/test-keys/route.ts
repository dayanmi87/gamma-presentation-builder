import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    openai: Boolean(process.env.OPENAI_API_KEY),
    gamma: Boolean(process.env.GAMMA_API_KEY),
    tavily: Boolean(process.env.TAVILY_API_KEY),
    sitePassword: Boolean(process.env.SITE_PASSWORD)
  });
}
