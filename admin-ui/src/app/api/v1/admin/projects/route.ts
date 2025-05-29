import { NextRequest } from 'next/server';
import { proxyToGoAPI, getQueryParams, buildQueryString } from '@/lib/api-proxy';

export async function GET(request: NextRequest) {
  const queryParams = getQueryParams(request);
  const queryString = buildQueryString(queryParams);
  
  return proxyToGoAPI({
    endpoint: `/admin/projects${queryString}`,
    request,
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  
  return proxyToGoAPI({
    method: 'POST',
    endpoint: '/admin/projects',
    body,
    request,
  });
}
