import type { Config } from 'drizzle-kit';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// // Load .env.local for drizzle-kit commands
// try {
//   const envPath = resolve(process.cwd(), '.env.local');
//   const envContent = readFileSync(envPath, 'utf-8');
//   for (const line of envContent.split('\n')) {
//     const match = line.match(/^([^#=]+)=(.*)$/);
//     if (match) {
//       const key = match[1].trim();
//       const value = match[2].trim().replace(/^["']|["']$/g, '');
//       if (!process.env[key]) {
//         process.env[key] = value;
//       }
//     }
//   }
// } catch {
//   // .env.local not found, rely on existing env vars
// }

export default {
  schema: './src/db/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
} satisfies Config;
