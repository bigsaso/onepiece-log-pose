import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireUser } from '@/lib/requireUser';

export async function PATCH(req: NextRequest) {
  const { error, userId } = await requireUser(req);
  if (error) return error;

  const { episode_numbers, watched } = await req.json();

  if (!Array.isArray(episode_numbers) || typeof watched !== 'boolean') {
    return NextResponse.json(
      { error: 'episode_numbers must be an array and watched must be a boolean' },
      { status: 400 },
    );
  }

  if (episode_numbers.length === 0) {
    return NextResponse.json({ updated: 0 });
  }

  if (watched) {
    const values = episode_numbers
      .map((_: number, i: number) => `($1, $${i + 2})`)
      .join(', ');
    await pool.query(
      `INSERT INTO user_watched (user_id, episode_number)
       VALUES ${values}
       ON CONFLICT (user_id, episode_number) DO NOTHING`,
      [userId, ...episode_numbers],
    );
  } else {
    const placeholders = episode_numbers
      .map((_: number, i: number) => `$${i + 2}`)
      .join(', ');
    await pool.query(
      `DELETE FROM user_watched WHERE user_id = $1 AND episode_number IN (${placeholders})`,
      [userId, ...episode_numbers],
    );
  }

  return NextResponse.json({ updated: episode_numbers.length });
}
