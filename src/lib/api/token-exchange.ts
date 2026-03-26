import type { TokenExchangeResponse } from '@/lib/types';

const AI_HUB_SERVER_HOST = process.env.AI_HUB_SERVER_HOST || 'https://localhost:3000';

export async function exchangeToken(token: string): Promise<TokenExchangeResponse> {
  const url = `${AI_HUB_SERVER_HOST}/api/iframe/exchange`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `Token exchange failed: ${response.statusText}`);
  }

  return response.json();
}
