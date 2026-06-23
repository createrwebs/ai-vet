import { NextResponse } from 'next/server';

export async function GET() {
  const isDemo = process.env.demo === 'true';
  return NextResponse.json({ isDemo });
}

