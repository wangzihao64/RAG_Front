import { NextRequest, NextResponse } from 'next/server';

const BACKEND_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8080';

export async function GET(request: NextRequest) {
  const authorization = request.headers.get('authorization');

  const upstreamResponse = await fetch(`${BACKEND_BASE_URL}/api/v1/collections`, {
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

export async function POST(request: NextRequest) {
  const authorization = request.headers.get('authorization');
  const body = await request.text();

  const upstreamResponse = await fetch(`${BACKEND_BASE_URL}/api/v1/collections`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(authorization ? { Authorization: authorization } : {}),
    },
    body,
  });

  const text = await upstreamResponse.text();

  return new NextResponse(text, {
    status: upstreamResponse.status,
    headers: {
      'content-type': upstreamResponse.headers.get('content-type') || 'application/json',
    },
  });
}
