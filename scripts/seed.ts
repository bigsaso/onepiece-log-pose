import pg from 'pg';
import { load } from 'cheerio';
import * as fs from 'fs';
import * as path from 'path';

const POSTGRES_URL = process.env.POSTGRES_URL;
if (!POSTGRES_URL) {
  console.error('POSTGRES_URL environment variable is required');
  process.exit(1);
}

const SOURCE_URL = 'https://www.animefillerlist.com/shows/one-piece';

const SAGAS = [
  {
    name: 'East Blue',
    arcs: [
      { name: 'Romance Dawn', episodes: [[1, 3]] },
      { name: 'Orange Town', episodes: [[4, 8]] },
      { name: 'Syrup Village', episodes: [[9, 18]] },
      { name: 'Baratie', episodes: [[19, 30]] },
      { name: 'Arlong Park', episodes: [[31, 44]] },
      { name: 'Loguetown', episodes: [[45, 53]] },
    ],
  },
  {
    name: 'Arabasta',
    arcs: [
      { name: 'Reverse Mountain', episodes: [[61, 63]] },
      { name: 'Whisky Peak', episodes: [[64, 67]] },
      { name: 'Little Garden', episodes: [[70, 77]] },
      { name: 'Drum Island', episodes: [[78, 91]] },
      { name: 'Arabasta', episodes: [[92, 130]] },
    ],
  },
  {
    name: 'Sky Island',
    arcs: [
      { name: 'Jaya', episodes: [[144, 152]] },
      { name: 'Skypiea', episodes: [[153, 195]] },
    ],
  },
  {
    name: 'Water 7',
    arcs: [
      { name: 'Long Ring Long Land', episodes: [[207, 219]] },
      { name: 'Water 7', episodes: [[229, 263]] },
      { name: 'Enies Lobby', episodes: [[264, 312]] },
      { name: 'Post-Enies Lobby', episodes: [[313, 325]] },
    ],
  },
  {
    name: 'Thriller Bark',
    arcs: [
      { name: 'Thriller Bark', episodes: [[337, 381]] },
    ],
  },
  {
    name: 'Summit War',
    arcs: [
      { name: 'Sabaody Archipelago', episodes: [[385, 405]] },
      { name: 'Amazon Lily', episodes: [[408, 421]] },
      { name: 'Impel Down', episodes: [[422, 425], [430, 452]] },
      { name: 'Marineford', episodes: [[457, 489]] },
      { name: 'Post-War', episodes: [[490, 491], [493, 516]] },
    ],
  },
  {
    name: 'Fish-Man Island',
    arcs: [
      { name: 'Return to Sabaody', episodes: [[517, 522]] },
      { name: 'Fish-Man Island', episodes: [[523, 574]] },
    ],
  },
  {
    name: 'Dressrosa',
    arcs: [
      { name: 'Punk Hazard', episodes: [[579, 625]] },
      { name: 'Dressrosa', episodes: [[629, 746]] },
    ],
  },
  {
    name: 'Whole Cake Island',
    arcs: [
      { name: 'Zou', episodes: [[751, 779]] },
      { name: 'Whole Cake Island', episodes: [[783, 877]] },
      { name: 'Levely', episodes: [[878, 889]] },
    ],
  },
  {
    name: 'Wano Country',
    arcs: [
      { name: 'Wano Country', episodes: [[890, 894], [897, 906], [908, 1085]] },
    ],
  },
  {
    name: 'Final',
    arcs: [
      { name: 'Egghead', episodes: [[1086, 1155]] },
      { name: 'Elbaph', episodes: [[1156, 9999]] },
    ],
  },
];

async function scrapeEpisodes() {
  console.log(`Fetching episodes from ${SOURCE_URL}...`);
  const res = await fetch(SOURCE_URL);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  const html = await res.text();
  const $ = load(html);

  const episodes: { number: number; title: string; type: string; airDate: string | null }[] = [];
  $('tr[id^="eps-"]').each((_, el) => {
    const $row = $(el);
    const number = parseInt($row.find('td.Number').text().trim(), 10);
    const title = $row.find('td.Title a').text().trim() || $row.find('td.Title').text().trim();
    const airDate = $row.find('td.Date').text().trim() || null;

    const classes = ($row.attr('class') || '').split(/\s+/);
    let type = 'manga_canon';
    for (const cls of classes) {
      if (['manga_canon', 'mixed_canon/filler', 'filler', 'anime_canon'].includes(cls)) {
        type = cls;
        break;
      }
    }

    if (number && title) {
      episodes.push({ number, title, type, airDate });
    }
  });

  console.log(`Scraped ${episodes.length} episodes`);
  if (episodes.length < 1000) {
    throw new Error(`Expected 1000+ episodes, got ${episodes.length}. Site structure may have changed.`);
  }
  return episodes;
}

function buildArcLookup() {
  const lookup: Record<number, number> = {};
  let globalArcOrder = 0;
  for (const saga of SAGAS) {
    for (const arc of saga.arcs) {
      globalArcOrder++;
      for (const [start, end] of arc.episodes) {
        for (let ep = start; ep <= end; ep++) {
          lookup[ep] = globalArcOrder;
        }
      }
    }
  }
  return lookup;
}

async function seed() {
  const pool = new pg.Pool({ connectionString: POSTGRES_URL });
  const client = await pool.connect();

  try {
    const episodes = await scrapeEpisodes();
    const arcLookup = buildArcLookup();

    const schemaPath = path.resolve(process.cwd(), 'lib', 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf-8');

    await client.query('DROP TABLE IF EXISTS user_watched CASCADE');
    await client.query('DROP TABLE IF EXISTS episodes CASCADE');
    await client.query('DROP TABLE IF EXISTS arcs CASCADE');
    await client.query('DROP TABLE IF EXISTS sagas CASCADE');
    await client.query(schema);

    const sagaIds: Record<string, number> = {};
    let sagaOrder = 0;
    for (const saga of SAGAS) {
      sagaOrder++;
      const result = await client.query(
        'INSERT INTO sagas (name, sort_order) VALUES ($1, $2) RETURNING id',
        [saga.name, sagaOrder],
      );
      sagaIds[saga.name] = result.rows[0].id;
    }

    const arcIdByOrder: Record<number, number> = {};
    let globalArcOrder = 0;
    for (const saga of SAGAS) {
      for (const arc of saga.arcs) {
        globalArcOrder++;
        const result = await client.query(
          'INSERT INTO arcs (name, saga_id, sort_order) VALUES ($1, $2, $3) RETURNING id',
          [arc.name, sagaIds[saga.name], globalArcOrder],
        );
        arcIdByOrder[globalArcOrder] = result.rows[0].id;
      }
    }

    let inserted = 0;
    for (const ep of episodes) {
      const arcOrder = arcLookup[ep.number];
      const arcId = arcOrder ? arcIdByOrder[arcOrder] : null;
      await client.query(
        'INSERT INTO episodes (number, title, type, air_date, arc_id) VALUES ($1, $2, $3, $4, $5)',
        [ep.number, ep.title, ep.type, ep.airDate, arcId],
      );
      inserted++;
    }

    console.log(`Inserted ${inserted} episodes`);

    const stats = await client.query(
      'SELECT type, COUNT(*) as count FROM episodes GROUP BY type ORDER BY count DESC',
    );
    console.log('\nEpisode breakdown:');
    for (const row of stats.rows) {
      console.log(`  ${row.type}: ${row.count}`);
    }

    const nonFiller = await client.query(
      "SELECT COUNT(*) as count FROM episodes WHERE type != 'filler'",
    );
    console.log(`\nNon-filler episodes: ${nonFiller.rows[0].count}`);
  } finally {
    client.release();
    await pool.end();
  }

  console.log('Done!');
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
