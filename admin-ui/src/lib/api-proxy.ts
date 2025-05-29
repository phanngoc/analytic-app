import { NextRequest, NextResponse } from 'next/server';

const GO_API_BASE_URL = process.env.GO_API_BASE_URL || 'http://localhost:8080/api/v1';

export interface ApiProxyOptions {
  method?: string;
  body?: any;
  headers?: Record<string, string>;
  endpoint: string;
  request: NextRequest;
}

/**
 * Generic proxy function to forward requests to Go backend API
 */
export async function proxyToGoAPI({
  method = 'GET',
  body,
  headers = {},
  endpoint,
  request,
}: ApiProxyOptions): Promise<NextResponse> {
  try {
    // Build the full URL
    const url = `${GO_API_BASE_URL}${endpoint}`;

    // Prepare headers
    const requestHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Forward authorization headers if present
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      requestHeaders['authorization'] = authHeader;
    }

    // Forward user agent and other relevant headers
    const userAgent = request.headers.get('user-agent');
    if (userAgent) {
      requestHeaders['user-agent'] = userAgent;
    }

    // Make the request to Go backend
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      ...(body && { body: JSON.stringify(body) }),
    });

    // Handle non-JSON responses (like script files)
    const contentType = response.headers.get('content-type');
    
    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: 'Request failed' };
      }
      
      return NextResponse.json(
        { error: errorData.error || `Request failed with status ${response.status}` },
        { status: response.status }
      );
    }

    // Handle different response types
    if (contentType?.includes('application/json')) {
      const data = await response.json();
      return NextResponse.json(data);
    } else if (contentType?.includes('text/')) {
      const text = await response.text();
      return new NextResponse(text, {
        headers: {
          'Content-Type': contentType,
        },
      });
    } else {
      // Binary content (like file downloads)
      const buffer = await response.arrayBuffer();
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': contentType || 'application/octet-stream',
          'Content-Disposition': response.headers.get('Content-Disposition') || '',
        },
      });
    }
  } catch (error) {
    console.error('API Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Extract query parameters from request URL
 */
export function getQueryParams(request: NextRequest): URLSearchParams {
  const { searchParams } = new URL(request.url);
  return searchParams;
}

/**
 * Build query string from URL search params
 */
export function buildQueryString(params: URLSearchParams): string {
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}
