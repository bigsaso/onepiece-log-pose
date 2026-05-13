import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireUser } from '@/lib/requireUser';

export async function GET(req: NextRequest) {
  const { error, userId } = await requireUser(req);
  if (error) return error;

  const saga_id = req.nextUrl.searchParams.get('saga_id');

  let sql = `
    SELECT a.id, a.name, a.sort_order,
           s.id AS saga_id, s.name AS saga_name,
           COUNT(e.number) AS total_episodes,
           SUM(CASE WHEN uw.episode_number IS NOT NULL THEN 1 ELSE 0 END) AS watched_episodes
    FROM arcs a
    JOIN sagas s ON a.saga_id = s.id
    LEFT JOIN episodes e ON e.arc_id = a.id AND e.type != 'filler'
    LEFT JOIN user_watched uw ON uw.episode_number = e.number AND uw.user_id = $1
    WHERE 1=1
  `;
  const params: (string | number)[] = [userId];

  if (saga_id) {
    sql += ` AND s.id = $2`;
    params.push(Number(saga_id));
  }

  sql += ` GROUP BY a.id, a.name, a.sort_order, s.id, s.name ORDER BY a.sort_order ASC`;

  const { rows } = await pool.query(sql, params);
  return NextResponse.json({
    arcs: rows.map((r) => ({
      ...r,
      total_episodes: Number(r.total_episodes),
      watched_episodes: Number(r.watched_episodes),
    })),
  });
}
