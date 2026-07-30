import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authorization = request.headers.get('authorization');
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ code: 400, msg: '非法的 id' }, { status: 400 });
  }

  const upstreamResponse = await fetch(`${BACKEND_BASE_URL}/api/v1/collections/${encodeURIComponent(id)}/documents`, {
    method: 'GET',
    headers: authorization ? { Authorization: authorization } : {},
  });

  const text = await upstreamResponse.text();

  return new NextResponse(text, {
    status: upstreamResponse.status,
    headers: {
      'content-type': upstreamResponse.headers.get('content-type') || 'application/json',
    },
  });
}
