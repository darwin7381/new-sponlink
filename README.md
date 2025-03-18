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

- **前端框架**: Next.js (React 18+)
- **樣式**: Tailwind CSS + shadcn/ui
- **前端狀態管理**: React Context API
- **後端**: Next.js API 路由
- **認證**: 自建及社交媒體登入
- **測試**: Jest & Playwright

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

3. **提交規範**
   - 提交訊息格式：`類型: 描述`
   - 類型包括：feat, fix, docs, style, refactor, test, chore

## 部署

本專案可以部署在 Vercel 平台上：

1. 註冊/登入 [Vercel](https://vercel.com)
2. 導入 GitHub 倉庫
3. 保持默認設置並部署

## 文檔

詳細技術文檔和設計說明位於 `docs/` 目錄：

- [專案概述](docs/PROJECT_OVERVIEW.md)
- [活動管理平台需求文檔](docs/活動管理平台_PRD.md)
- [主辦方與贊助方平台串接文檔](docs/sponsor_plan_integration_prd.md)
- [系統設計文檔](docs/event_management_platform_system_design.md)

## License

MIT
