# EventConnect - 活動贊助平台

EventConnect 是一個連接活動主辦方與潛在贊助商的平台，幫助建立互惠互利的合作關係。此專案使用 Next.js 框架進行開發，提供高效能的前後端整合解決方案。

![EventConnect Banner](public/images/event-placeholder.jpg)

## 專案概述

本平台旨在解決以下問題：
- 活動主辦方難以找到合適的贊助商
- 贊助商難以發現符合其目標受眾的活動
- 缺乏一個高效的贊助管理和交流渠道

## 主要功能

### 活動主辦方功能
- 創建和管理活動詳情
- 設定贊助套餐和權益
- 管理贊助商申請
- 安排與潛在贊助商的會議

### 贊助商功能
- 瀏覽活動列表
- 檢視活動詳情和贊助套餐
- 購物車管理
- 與活動主辦方溝通

### 通用功能
- 會員註冊/登入（包含社交媒體登入）
- 個人檔案管理
- 會議預約功能
- 通知系統

## 技術堆疊

- **前端框架**: Next.js (React 19+)
- **樣式**: Tailwind CSS + shadcn/ui
- **前端狀態管理**: React Context API
- **後端**: Next.js API 路由
- **認證**: 自建及社交媒體登入
- **測試**: Jest & Playwright

## 新增功能與改進

### 類型系統與適配器
- **雙版本類型系統**：支援新舊版本的Event類型，確保向下相容性
- **類型適配器**：實現 `types-adapter.ts` 處理不同格式事件資料的轉換
- **強化的類型定義**：更詳細的 Event、Location 和 SponsorshipPlan 類型定義

### 事件管理增強
- **改進的事件狀態管理**：新增 COMPLETED 狀態，擴展事件生命週期
- **地理位置功能增強**：加入經緯度與詳細地址資訊
- **標籤與分類系統**：新增事件分類與標籤功能，提升搜尋體驗

## 專案結構

```
├── public/               # 靜態資源
│   └── images/           # 圖片資源
├── src/
│   ├── app/              # 頁面路由
│   │   ├── api/          # API 路由
│   │   └── ...其他路由
│   ├── components/       # 組件
│   │   ├── auth/         # 認證相關組件
│   │   ├── events/       # 活動相關組件
│   │   ├── layout/       # 布局組件
│   │   └── ui/           # UI 組件 (shadcn/ui)
│   ├── lib/
│   │   ├── mocks/        # 假資料
│   │   ├── services/     # 服務層
│   │   ├── types/        # TypeScript 類型定義
│   │   ├── types-adapter.ts  # 類型轉換適配器
│   │   └── utils.ts      # 工具函數
│   └── ...
├── docs/                 # 專案文檔
│   ├── PROJECT_OVERVIEW.md  # 專案概述
│   └── ...其他技術文檔
├── e2e/                  # E2E 測試
├── next.config.js        # Next.js 配置
└── ...其他配置文件
```

## 安裝指南

確保您已安裝 Node.js 18.0 或更高版本：

```bash
# 檢查 Node.js 版本
node -v

# 如有需要，使用 nvm 切換版本
nvm use 18
```

### 安裝依賴

```bash
# 克隆倉庫
git clone https://github.com/darwin7381/new-sponlink.git
cd new-sponlink

# 安裝依賴
npm install
```

## 開發指南

### 啟動開發服務器

```bash
# 使用正確的 Node.js 版本並啟動開發服務器
source ~/.nvm/nvm.sh && nvm use 18 && npm run dev
```

訪問 [http://localhost:3000](http://localhost:3000) 查看應用。

### 構建生產版本

```bash
npm run build
```

### 運行測試

```bash
# 單元測試
npm test

# E2E 測試
npm run test:e2e
```

## 開發規範

1. **分支管理**
   - `main`: 主分支，僅接受穩定版本合併
   - `develop`: 開發分支，新功能從此分支拉取
   - 功能分支命名：`feature/功能名稱`

2. **代碼風格**
   - 遵循 TypeScript 和 React 最佳實踐
   - 使用函數組件和 Hooks
   - 組件使用 PascalCase 命名
   - 工具函數使用 camelCase 命名
   - 保持類型定義一致，使用適配器處理類型轉換

3. **提交規範**
   - 提交訊息格式：`類型: 描述`
   - 類型包括：feat, fix, docs, style, refactor, test, chore

## 部署

本專案可以部署在 Vercel 平台上：

1. 註冊/登入 [Vercel](https://vercel.com)
2. 導入 GitHub 倉庫
3. 保持默認設置並部署

## 類型系統使用指南

在開發過程中使用類型適配器：

```typescript
// 從舊版事件格式轉換為新版格式
import { adaptOldEventToNew } from '@/lib/types-adapter';
const newEvent = adaptOldEventToNew(oldEventData);

// 從新版事件格式轉換為舊版格式
import { adaptNewEventToOld } from '@/lib/types-adapter';
const oldEvent = adaptNewEventToOld(newEventData);

// 批量轉換
import { adaptOldEventsToNew } from '@/lib/types-adapter';
const newEvents = adaptOldEventsToNew(oldEventsArray);
```

## 文檔審核結果

在整合過去文檔後，我們對所有文檔進行了審核和評估，以確保它們與當前專案結構和需求保持一致。

### 📚 建議使用的文檔
- [活動管理平台需求文檔](docs/活動管理平台_PRD.md) - 與當前專案功能一致
- [登入系統優化與社交媒體整合需求](docs/login_system_integration_prd.md) - 社交登入功能已實作
- [登入系統整合系統設計](docs/login_system_integration_system_design.md) - 技術細節參考
- [專案總覽](PROJECT_OVERVIEW.md) - 重要的專案指南文檔

### 🔄 需要更新的文檔
- [主辦方與贊助方平台串接文檔](docs/sponsor_plan_integration_prd.md) - 需更新贊助計劃實作
- [活動管理平台系統設計](docs/event_management_platform_system_design.md) - 需與Next.js架構同步
- [活動平台系統設計](docs/event_platform_system_design.md) - 需適配現有專案架構

### 🔍 歷史參考文檔
- [加密貨幣會議平台需求文檔](docs/crypto_conference_platform_prd.md) - 與現有功能有差異
- [Spongo 系統設計](docs/spongo_system_design.md) - 舊版架構參考
- [贊助購物車 UI 設計](docs/sponsor_cart_ui_mockup_updated.md) - UI設計參考
- [贊助商平台需求摘要](docs/sponsor_platform_requirements_summary.md) - 已整合到其他文檔
- [緊急問題分析](docs/urgent_issues_analysis.md) - 舊版專案問題分析

**注意**：開發時請主要參考「建議使用」和「需要更新」中的文檔。對於「歷史參考」中的文檔，應該在團隊會議中討論是否調整開發方向。

## License

MIT
