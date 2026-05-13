import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { requireUser } from '@/lib/requireUser';

export async function GET(req: NextRequest) {
  const { error, userId } = await requireUser(req);
  if (error) return error;

  const { searchParams } = req.nextUrl;
  const arc_id = searchParams.get('arc_id');
  const saga_id = searchParams.get('saga_id');
  const watched = searchParams.get('watched');
  const include_filler = searchParams.get('include_filler');

  let sql = `
    SELECT e.number, e.title, e.type, e.air_date,
           CASE WHEN uw.episode_number IS NOT NULL THEN TRUE ELSE FALSE END AS watched,
           a.id AS arc_id, a.name AS arc_name,
           s.id AS saga_id, s.name AS saga_name
    FROM episodes e
    LEFT JOIN arcs a ON e.arc_id = a.id
    LEFT JOIN sagas s ON a.saga_id = s.id
    LEFT JOIN user_watched uw ON uw.episode_number = e.number AND uw.user_id = $1
    WHERE 1=1
  `;
  const params: (string | number)[] = [userId];
  let paramIdx = 1;

  if (include_filler !== 'true') {
    sql += ` AND e.type != 'filler'`;
  }
  if (arc_id) {
    paramIdx++;
    sql += ` AND a.id = $${paramIdx}`;
    params.push(Number(arc_id));
  }
  if (saga_id) {
    paramIdx++;
    sql += ` AND s.id = $${paramIdx}`;
    params.push(Number(saga_id));
  }
  if (watched === 'true') {
    sql += ` AND uw.episode_number IS NOT NULL`;
  } else if (watched === 'false') {
    sql += ` AND uw.episode_number IS NULL`;
  }

  sql += ` ORDER BY e.number ASC`;

  const { rows } = await pool.query(sql, params);
  return NextResponse.json({
    episodes: rows,
    total: rows.length,
  });
}
