# BlockMeet 資料庫設計文檔

## 概述

BlockMeet系統使用PostgreSQL資料庫和Drizzle ORM，遵循關係型資料庫標準設計原則。本文檔記錄系統中的表結構和關係。

## 用戶相關表

### users

核心用戶資訊表，存儲最基本和最常訪問的用戶資料。

| 欄位 | 類型 | 描述 | 備註 |
|------|------|------|------|
| id | VARCHAR | 用戶ID | 主鍵，UUID格式 |
| email | VARCHAR | 用戶電子郵件 | 唯一，不可為空 |
| name | TEXT | 用戶名稱 | 可為空 |
| image | TEXT | 用戶頭像URL | 可為空 |
| email_verified | TIMESTAMP | 電子郵件驗證時間 | 可為空 |
| password | TEXT | 密碼哈希 | 可為空 |
| system_role | VARCHAR | 系統角色 | 默認為'USER' |
| preferred_language | VARCHAR | 偏好語言 | 默認為'en' |
| activity_id | VARCHAR | 活動ID | 多租戶支持 |
| created_at | TIMESTAMP | 創建時間 | 不可為空 |
| updated_at | TIMESTAMP | 更新時間 | 不可為空 |

### user_profiles

用戶個人資料表，存儲用戶的擴展資訊。

| 欄位 | 類型 | 描述 | 備註 |
|------|------|------|------|
| user_id | VARCHAR | 用戶ID | 主鍵，外鍵指向users |
| bio | TEXT | 用戶簡介 | 可為空 |
| contact_info | TEXT | 聯絡資訊 | 可為空 |
| avatar_url | TEXT | 頭像URL | 可為空 |
| activity_id | VARCHAR | 活動ID | 多租戶支持 |
| updated_at | TIMESTAMP | 更新時間 | 不可為空 |

### user_settings

用戶偏好設置表，存儲用戶的應用程式設置。

| 欄位 | 類型 | 描述 | 備註 |
|------|------|------|------|
| user_id | VARCHAR | 用戶ID | 主鍵，外鍵指向users |
| email_notifications | BOOLEAN | 電子郵件通知 | 默認為true |
| browser_notifications | BOOLEAN | 瀏覽器通知 | 默認為true |
| in_app_notifications | BOOLEAN | 應用內通知 | 默認為true |
| notification_frequency | VARCHAR | 通知頻率 | 默認為'immediately' |
| theme | VARCHAR | 界面主題 | 默認為'system' |
| activity_id | VARCHAR | 活動ID | 多租戶支持 |
| updated_at | TIMESTAMP | 更新時間 | 不可為空 |

### user_statistics

用戶統計數據表，存儲用戶的活動和贊助統計資訊。

| 欄位 | 類型 | 描述 | 備註 |
|------|------|------|------|
| user_id | VARCHAR | 用戶ID | 主鍵，外鍵指向users |
| total_events | INTEGER | 總活動數 | 默認為0 |
| upcoming_events | INTEGER | 即將舉行的活動數 | 默認為0 |
| average_attendees | INTEGER | 平均參與人數 | 默認為0 |
| total_revenue | TEXT | 總收入 | 默認為'$0' |
| total_sponsored | INTEGER | 贊助活動總數 | 默認為0 |
| active_sponsorships | INTEGER | 活躍贊助數 | 默認為0 |
| total_investment | TEXT | 總投資金額 | 默認為'$0' |
| average_roi | TEXT | 平均投資回報率 | 默認為'0%' |
| activity_id | VARCHAR | 活動ID | 多租戶支持 |
| created_at | TIMESTAMP | 創建時間 | 不可為空 |
| updated_at | TIMESTAMP | 更新時間 | 不可為空 |

### organization_profiles

組織資料表，存儲贊助商組織的資訊。

| 欄位 | 類型 | 描述 | 備註 |
|------|------|------|------|
| id | VARCHAR | 組織ID | 主鍵，UUID格式 |
| user_id | VARCHAR | 所有者ID | 外鍵指向users |
| name | TEXT | 組織名稱 | 不可為空 |
| description | TEXT | 組織描述 | 可為空 |
| logo_url | TEXT | LOGO URL | 可為空 |
| website | TEXT | 網站 | 可為空 |
| activity_id | VARCHAR | 活動ID | 多租戶支持 |
| created_at | TIMESTAMP | 創建時間 | 不可為空 |
| updated_at | TIMESTAMP | 更新時間 | 不可為空 |

## 活動相關表

### events

活動資訊表，存儲活動的基本資訊。

| 欄位 | 類型 | 描述 | 備註 |
|------|------|------|------|
| id | VARCHAR | 活動ID | 主鍵，UUID格式 |
| title | TEXT | 活動標題 | 不可為空 |
| description | TEXT | 活動描述 | 可為空 |
| image_url | TEXT | 活動圖片URL | 可為空 |
| start_date | TIMESTAMP | 開始時間 | 可為空 |
| end_date | TIMESTAMP | 結束時間 | 可為空 |
| location | TEXT | 活動地點 | 可為空 |
| status | VARCHAR | 活動狀態 | 默認為'draft' |
| is_public | BOOLEAN | 是否公開 | 默認為true |
| owner_id | VARCHAR | 所有者ID | 外鍵指向users |
| owner_type | VARCHAR | 所有者類型 | 'USER'或'ORGANIZATION' |
| activity_id | VARCHAR | 活動ID | 多租戶支持 |
| created_at | TIMESTAMP | 創建時間 | 不可為空 |
| updated_at | TIMESTAMP | 更新時間 | 不可為空 |

### saved_events

用戶收藏的活動關係表。

| 欄位 | 類型 | 描述 | 備註 |
|------|------|------|------|
| user_id | VARCHAR | 用戶ID | 主鍵之一，外鍵指向users |
| event_id | VARCHAR | 活動ID | 主鍵之一，外鍵指向events |
| metadata | TEXT | 額外資訊 | JSON格式，可為空 |
| activity_id | VARCHAR | 活動ID | 多租戶支持 |
| created_at | TIMESTAMP | 創建時間 | 不可為空 |

### followed_events

用戶關注的活動關係表。

| 欄位 | 類型 | 描述 | 備註 |
|------|------|------|------|
| user_id | VARCHAR | 用戶ID | 主鍵之一，外鍵指向users |
| event_id | VARCHAR | 活動ID | 主鍵之一，外鍵指向events |
| notification_settings | TEXT | 通知設置 | JSON格式，可為空 |
| activity_id | VARCHAR | 活動ID | 多租戶支持 |
| created_at | TIMESTAMP | 創建時間 | 不可為空 |

## 關係圖

用戶相關表關係：
- users (1) → (0..1) user_profiles
- users (1) → (0..1) user_settings
- users (1) → (0..1) user_statistics
- users (1) → (0..n) organization_profiles

活動相關表關係：
- users (1) → (0..n) events
- events (1) → (0..n) saved_events
- events (1) → (0..n) followed_events
- users (1) → (0..n) saved_events
- users (1) → (0..n) followed_events

## 設計考量

1. **將用戶資料分成多個表**：遵循單一職責原則，提高查詢效率，便於擴展
   
2. **標準化ID格式**：所有ID使用UUID，避免複雜的ID轉換邏輯
   
3. **避免使用JSON存儲結構化資料**：將常用資料存儲在專用欄位，提高查詢效率和數據一致性
   
4. **使用外鍵關係**：確保資料一致性和完整性
   
5. **多租戶支持**：各表均有activity_id欄位，支持多租戶隔離

## 維護指南

1. **新增欄位**：應考慮將其添加到最合適的表中，而非全部堆積在users表
   
2. **刪除資料**：資料庫使用ON DELETE CASCADE設置，刪除用戶時關聯資料自動刪除
   
3. **查詢效率**：對常用查詢欄位添加適當索引
   
4. **數據遷移**：使用專業工具（如Drizzle-kit）進行結構變更和數據遷移 