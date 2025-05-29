import { NextRequest, NextResponse } from 'next/server';

const GO_API_BASE_URL = process.env.GO_API_BASE_URL || 'http://localhost:8080/api/v1';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${GO_API_BASE_URL}/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
      return NextResponse.json(
        { error: errorData.error || `Request failed with status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
