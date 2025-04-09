import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';
import * as dotenv from 'dotenv';
import { join } from 'path';

// 加載環境變量
dotenv.config({ path: join(process.cwd(), '.env.local') });

// 使用環境變量中的連接字符串
const connectionString = process.env.DATABASE_URL!;
console.log("Connection string available:", !!connectionString);

// 創建 SQL 客戶端
const client = postgres(connectionString);

// 建立 Drizzle 資料庫連接
export const db = drizzle(client, { schema });

// 導出 schema 以供直接使用
export * from './schema'; 