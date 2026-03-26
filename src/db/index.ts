// Database connection setup
// This file exports the database connection using PostgreSQL

// NOTE: These dependencies need to be installed:
// npm install pg @types/pg drizzle-orm
// npm install -D drizzle-kit

import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
