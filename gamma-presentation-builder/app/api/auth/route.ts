import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { password } = await request.json();
  const expected = process.env.SITE_PASSWORD || '1233';
  return NextResponse.json({ ok: password === expected });
}
