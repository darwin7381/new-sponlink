import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// 加載環境變量
dotenv.config({ path: '.env.local' });

// 從連接串中解析必要的資訊
const connectionString = process.env.DATABASE_URL || '';
const regex = /postgres(ql)?:\/\/([^:]+):([^@]+)@([^:]+)(?::(\d+))?\/([^?]+)/;
const match = connectionString.match(regex);

export default {
  schema: './src/db/schema/*',
  out: './src/db/migrations',
  dialect: 'postgresql',
  dbCredentials: match ? {
    host: match[4],
    port: match[5] ? parseInt(match[5], 10) : 5432,
    user: match[2],
    password: match[3],
    database: match[6],
    ssl: true
  } : {
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '',
    database: 'postgres',
    ssl: false
  },
  verbose: true,
  strict: true,
} satisfies Config; 