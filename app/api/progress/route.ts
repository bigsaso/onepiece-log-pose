import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireUser } from '@/lib/requireUser';

export async function GET(req: NextRequest) {
  const { error, userId } = await requireUser(req);
  if (error) return error;

  const { rows } = await pool.query(
    `SELECT COUNT(*) AS total_non_filler,
            COUNT(uw.episode_number) AS watched
     FROM episodes e
     LEFT JOIN user_watched uw ON uw.episode_number = e.number AND uw.user_id = $1
     WHERE e.type != 'filler'`,
    [userId],
  );

  const row = rows[0];
  const total = Number(row.total_non_filler);
  const watched = Number(row.watched);

  return NextResponse.json({
    total_non_filler: total,
    watched,
    percentage: total > 0 ? Math.round((watched / total) * 10000) / 100 : 0,
  });
}
