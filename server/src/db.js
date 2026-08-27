import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn('WARNING: DATABASE_URL is not set. Set it to your Neon Postgres connection string.');
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('localhost')
    ? false
    : { rejectUnauthorized: false },
});

/** Convert ? placeholders to $1, $2, ... for node-pg */
function toPg(sql, params = []) {
  let i = 0;
  const text = sql.replace(/\?/g, () => `$${++i}`);
  return { text, values: params };
}

function createStatement(sql) {
  return {
    async run(...params) {
      const { text, values } = toPg(sql, params);
      const res = await pool.query(text, values);
      return {
        lastInsertRowid: res.rows[0]?.id ?? null,
        changes: res.rowCount ?? 0,
        rows: res.rows,
      };
    },
    async get(...params) {
      const { text, values } = toPg(sql, params);
      const res = await pool.query(text, values);
      return res.rows[0];
    },
    async all(...params) {
      const { text, values } = toPg(sql, params);
      const res = await pool.query(text, values);
      return res.rows;
    },
  };
}

// Sync-looking wrapper that actually returns promises — controllers must await
// We keep prepare().get/run/all but they return Promises.
const db = {
  prepare(sql) {
    // Auto-append RETURNING id for INSERT without RETURNING
    let finalSql = sql;
    if (/^\s*INSERT\s+/i.test(sql) && !/RETURNING/i.test(sql)) {
      finalSql = sql.replace(/;?\s*$/, ' RETURNING id');
    }
    return createStatement(finalSql);
  },
  async exec(sql) {
    await pool.query(sql);
  },
  async query(sql, params = []) {
    const { text, values } = toPg(sql, params);
    return pool.query(text, values);
  },
  pool,
};

export async function initDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      last_login TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS traders (
      id SERIAL PRIMARY KEY,
      display_number INTEGER UNIQUE NOT NULL,
      name TEXT,
      avatar_url TEXT,
      phone TEXT NOT NULL,
      facebook_url TEXT,
      deposit_amount INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS scam_reports (
      id SERIAL PRIMARY KEY,
      trader_id INTEGER REFERENCES traders(id) ON DELETE SET NULL,
      scam_image_url TEXT,
      scam_facebook_url TEXT,
      scam_bank_account TEXT,
      scam_amount INTEGER DEFAULT 0,
      description TEXT NOT NULL,
      reporter_contact TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'verified', 'rejected', 'resolved')),
      created_at TIMESTAMPTZ DEFAULT NOW(),
      reviewed_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS admin_logs (
      id SERIAL PRIMARY KEY,
      admin_id INTEGER REFERENCES admins(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      target_type TEXT,
      target_id INTEGER,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS search_logs (
      id SERIAL PRIMARY KEY,
      query TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_traders_phone ON traders(phone);
    CREATE INDEX IF NOT EXISTS idx_traders_display ON traders(display_number);
    CREATE INDEX IF NOT EXISTS idx_reports_status ON scam_reports(status);
    CREATE INDEX IF NOT EXISTS idx_reports_trader ON scam_reports(trader_id);
  `);

  console.log('Database initialized (PostgreSQL / Neon)');
  return db;
}

export default db;
