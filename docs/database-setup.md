# 資料庫設置文檔

本文檔介紹如何設置和使用 Neon PostgreSQL 資料庫與 Drizzle ORM。

## 架構概述

- **資料庫**: Neon PostgreSQL (無服務器)
- **ORM**: Drizzle ORM
- **身份驗證**: 目前使用本地模擬，將來計劃整合 NextAuth.js
- **資料模型**: 包括用戶、活動、收藏和關注功能

## 建置步驟

### 1. 註冊 Neon 帳戶

1. 訪問 [Neon 官網](https://neon.tech)
2. 註冊一個帳號
3. 登錄 Neon 控制台
4. 創建一個新項目 (推薦命名為 "blockmeet-dev" 用於開發)
5. 在項目中創建一個新的數據庫 (推薦命名為 "blockmeet_db")
6. 獲取數據庫的連接字符串 (通常是 PostgreSQL URI)

### 2. 配置環境變量

1. 在項目根目錄找到 `.env.local` 文件
2. 更新 Neon 連接字符串:

```
DATABASE_URL="postgresql://username:password@your-neon-db-host.neon.tech/dbname?sslmode=require"
```

替換 `username`, `password`, `your-neon-db-host` 和 `dbname` 為你的實際值。

### 3. 執行資料庫遷移

使用以下命令將 Drizzle 模型推送到數據庫:

```bash
source ~/.nvm/nvm.sh && nvm use 20
npm run db:push
```

### 4. 填充測試數據

使用以下命令填充初始測試數據:

```bash
source ~/.nvm/nvm.sh && nvm use 20
npm run db:seed
```

### 5. 瀏覽資料庫內容

使用 Drizzle Studio 可視化查看數據庫內容:

```bash
source ~/.nvm/nvm.sh && nvm use 20
npm run db:studio
```

此命令將打開瀏覽器窗口，顯示所有表及其內容。

## 資料模型

當前資料模型包括:

- **users**: 用戶表 (核心用戶信息)
- **userProfiles**: 用戶個人資料表 (擴展用戶信息)
- **userSettings**: 用戶設置表
- **events**: 活動表
- **savedEvents**: 用戶收藏的活動關聯表
- **followedEvents**: 用戶關注的活動關聯表

## 當前實現狀態

**注意:** 根據開發進度評估，目前僅將以下表實際實現並同步到資料庫:

- **users**: 用戶表
- **userProfiles**: 用戶個人資料表
- **userSettings**: 用戶設置表

其他功能如活動、贊助計劃、會議等暫時使用前端模擬資料(`src/lib/mocks/`)進行開發，待功能開發較為完善後再遷移至資料庫。

## API 端點

以下 API 端點可用於與資料庫交互:

- `GET /api/db-users` - 獲取用戶資料 (參數: id 或 email)

## 開發指南

### 使用 Drizzle ORM

Drizzle ORM 提供了類型安全的 SQL 查詢構建器，可以這樣使用:

```typescript
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

// 根據 ID 查詢用戶
const user = await db.select()
  .from(users)
  .where(eq(users.id, userId))
  .limit(1);

// 插入用戶
const newUser = await db.insert(users)
  .values({
    id: 'user_123',
    email: 'example@mail.com',
    name: '測試用戶',
    role: 'ORGANIZER'
  })
  .returning();

// 更新用戶
const updatedUser = await db.update(users)
  .set({ name: '新名稱' })
  .where(eq(users.id, userId))
  .returning();

// 刪除用戶
await db.delete(users)
  .where(eq(users.id, userId));
```

### 修改數據模型

1. 編輯 `src/db/schema/*.ts` 文件
2. 執行 `npm run db:push` 更新數據庫結構

## 多租戶支持

每個表都包含 `activity_id` 欄位，用於支持多租戶架構。在查詢時，應始終包含此欄位以確保數據隔離:

```typescript
// 查詢特定租戶的數據
const tenantUsers = await db.select()
  .from(users)
  .where(eq(users.activity_id, 'tenant_123'));
```

## 注意事項

1. **本地開發**: 對於本地開發，可以使用免費的 Neon 項目，足夠測試用途。
2. **生產環境**: 對於生產環境，應使用付費計劃以獲取更好的性能和支持。
3. **密碼安全**: 切勿將實際的 DATABASE_URL 提交到版本控制系統。
4. **擴展性**: Drizzle 設計支持簡單擴展，可以輕鬆添加新表和關係。 