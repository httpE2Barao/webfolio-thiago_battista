import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json({ 
    message: 'Album upload functionality is disabled in production for performance reasons.',
    error: 'UPLOAD_DISABLED' 
  }, { status: 503 });
}

export async function GET() {
  return NextResponse.json({ 
    message: 'Album upload functionality is disabled in production for performance reasons.',
    error: 'UPLOAD_DISABLED' 
  }, { status: 503 });
}