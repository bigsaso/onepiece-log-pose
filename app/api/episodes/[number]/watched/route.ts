import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireUser } from '@/lib/requireUser';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ number: string }> },
) {
  const { error, userId } = await requireUser(req);
  if (error) return error;

  const { number } = await params;
  const epNumber = Number(number);
  const body = await req.json();
  const { watched } = body;

  if (typeof watched !== 'boolean') {
    return NextResponse.json({ error: 'watched must be a boolean' }, { status: 400 });
  }

  if (watched) {
    await pool.query(
      `INSERT INTO user_watched (user_id, episode_number)
       VALUES ($1, $2)
       ON CONFLICT (user_id, episode_number) DO NOTHING`,
      [userId, epNumber],
    );
  } else {
    await pool.query(
      'DELETE FROM user_watched WHERE user_id = $1 AND episode_number = $2',
      [userId, epNumber],
    );
  }

  return NextResponse.json({ number: epNumber, watched });
}
