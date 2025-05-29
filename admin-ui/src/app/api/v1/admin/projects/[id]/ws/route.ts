import { NextRequest } from 'next/server';

const GO_API_BASE_URL = process.env.GO_API_BASE_URL || 'http://localhost:8080/api/v1';

interface Params {
  id: string;
}

export async function GET(request: NextRequest, { params }: { params: Params }) {
  // For WebSocket connections, we'll need to proxy the connection
  // This is a simplified version - in production you might want to use a proper WebSocket proxy
  const { id } = params;
  
  // Convert HTTP URL to WebSocket URL
  const wsUrl = GO_API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://');
  const targetUrl = `${wsUrl}/admin/projects/${id}/ws`;
  
  // Return WebSocket URL for client-side connection
  return new Response(JSON.stringify({ websocket_url: targetUrl }), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
