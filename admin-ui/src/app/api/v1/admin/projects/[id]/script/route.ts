import { NextRequest, NextResponse } from 'next/server';

const GO_API_BASE_URL = process.env.GO_API_BASE_URL || 'http://localhost:8080/api/v1';

interface Params {
  id: string;
}

export async function GET(request: NextRequest, { params }: { params: Params }) {
  try {
    const { id } = params;

    const response = await fetch(`${GO_API_BASE_URL}/admin/projects/${id}/script`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.text().catch(() => 'Request failed');
      return NextResponse.json(
        { error: errorData || `Request failed with status ${response.status}` },
        { status: response.status }
      );
    }

    const script = await response.text();
    return new NextResponse(script, {
      headers: {
        'Content-Type': 'application/javascript',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
