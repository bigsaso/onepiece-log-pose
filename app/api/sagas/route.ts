import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireUser } from '@/lib/requireUser';

export async function GET(req: NextRequest) {
  const { error, userId } = await requireUser(req);
  if (error) return error;

  const { rows } = await pool.query(
    `SELECT s.id, s.name, s.sort_order,
            COUNT(DISTINCT a.id) AS total_arcs,
            COUNT(e.number) AS total_episodes,
            SUM(CASE WHEN uw.episode_number IS NOT NULL THEN 1 ELSE 0 END) AS watched_episodes
     FROM sagas s
     LEFT JOIN arcs a ON a.saga_id = s.id
     LEFT JOIN episodes e ON e.arc_id = a.id AND e.type != 'filler'
     LEFT JOIN user_watched uw ON uw.episode_number = e.number AND uw.user_id = $1
     GROUP BY s.id, s.name, s.sort_order
     ORDER BY s.sort_order ASC`,
    [userId],
  );

  return NextResponse.json({
    sagas: rows.map((r) => ({
      ...r,
      total_arcs: Number(r.total_arcs),
      total_episodes: Number(r.total_episodes),
      watched_episodes: Number(r.watched_episodes),
    })),
  });
}
