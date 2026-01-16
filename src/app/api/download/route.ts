import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Download API' });
}

export async function POST() {
  // TODO: Implement ZIP download logic
  return NextResponse.json({ message: 'Download API POST' });
}
