-- Auth.js tables

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT UNIQUE,
    "emailVerified" TIMESTAMPTZ,
    image TEXT
);

CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    provider TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    refresh_token TEXT,
    access_token TEXT,
    expires_at BIGINT,
    token_type TEXT,
    scope TEXT,
    id_token TEXT,
    session_state TEXT,
    UNIQUE(provider, "providerAccountId")
);

CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "sessionToken" TEXT NOT NULL UNIQUE,
    "userId" UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS verification_tokens (
    identifier TEXT NOT NULL,
    token TEXT NOT NULL UNIQUE,
    expires TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (identifier, token)
);

-- Content tables

CREATE TABLE IF NOT EXISTS sagas (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS arcs (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    saga_id INTEGER NOT NULL REFERENCES sagas(id),
    sort_order INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS episodes (
    number INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('manga_canon', 'mixed_canon/filler', 'filler', 'anime_canon')),
    air_date TEXT,
    arc_id INTEGER REFERENCES arcs(id)
);

CREATE INDEX IF NOT EXISTS idx_episodes_type ON episodes(type);
CREATE INDEX IF NOT EXISTS idx_episodes_arc ON episodes(arc_id);

-- Per-user watched state

CREATE TABLE IF NOT EXISTS user_watched (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    episode_number INTEGER NOT NULL REFERENCES episodes(number) ON DELETE CASCADE,
    watched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (user_id, episode_number)
);

CREATE INDEX IF NOT EXISTS idx_user_watched_user ON user_watched(user_id);
