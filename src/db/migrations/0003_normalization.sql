-- 添加 avatar_url 欄位到 user_profiles 表
ALTER TABLE "user_profiles" ADD COLUMN IF NOT EXISTS "avatar_url" text;

-- 創建 user_statistics 表
CREATE TABLE IF NOT EXISTS "user_statistics" (
  "user_id" varchar(255) PRIMARY KEY NOT NULL,
  "total_events" integer DEFAULT 0,
  "upcoming_events" integer DEFAULT 0,
  "average_attendees" integer DEFAULT 0,
  "total_revenue" text DEFAULT '$0',
  "total_sponsored" integer DEFAULT 0,
  "active_sponsorships" integer DEFAULT 0,
  "total_investment" text DEFAULT '$0',
  "average_roi" text DEFAULT '0%',
  "activity_id" varchar(255),
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "user_statistics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- 創建 organization_profiles 表
CREATE TABLE IF NOT EXISTS "organization_profiles" (
  "id" varchar(255) PRIMARY KEY NOT NULL,
  "user_id" varchar(255) NOT NULL,
  "name" text NOT NULL,
  "description" text,
  "logo_url" text,
  "website" text,
  "activity_id" varchar(255),
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "organization_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

-- 這一步會在已經遷移數據後執行，確保不會遺失數據
-- ALTER TABLE "user_profiles" DROP COLUMN IF EXISTS "profile_data";

-- 註釋: 
-- 1. 先使用 schema_normalization.ts 腳本遷移數據
-- 2. 確認數據遷移成功後，取消上面的註釋行，刪除舊的 profile_data 欄位 