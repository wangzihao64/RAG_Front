import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authorization = request.headers.get('authorization');
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ code: 400, msg: '非法的 id' }, { status: 400 });
  }

  const formData = await request.formData();

  const upstreamResponse = await fetch(`${BACKEND_BASE_URL}/api/v1/collections/${encodeURIComponent(id)}/chat`, {
    method: 'POST',
    headers: authorization ? { Authorization: authorization } : {},
    body: formData,
  });

  const headers = new Headers();
  headers.set('content-type', upstreamResponse.headers.get('content-type') || 'text/event-stream');
  headers.set('cache-control', upstreamResponse.headers.get('cache-control') || 'no-cache');
  headers.set('connection', upstreamResponse.headers.get('connection') || 'keep-alive');

  const buffering = upstreamResponse.headers.get('x-accel-buffering');
  if (buffering) {
    headers.set('x-accel-buffering', buffering);
  }

  return new NextResponse(upstreamResponse.body, {
    status: upstreamResponse.status,
    headers,
  });
}
