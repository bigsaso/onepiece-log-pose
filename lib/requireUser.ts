import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function requireUser(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  if (!token?.sub) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), userId: '' };
  }
  return { error: null, userId: token.sub };
}
