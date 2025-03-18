# EventConnect 專案概述

## 專案簡介

EventConnect 是一個連接活動主辦方與潛在贊助商的平台，旨在簡化贊助過程並促進雙方的合作。該平台提供了完整的活動管理、贊助套餐設定和交流工具，使雙方能夠更高效地尋找合適的合作伙伴。

## 系統架構

本系統採用了 Next.js 全棧應用框架，具有以下特點：

- **前後端一體化**：使用 Next.js API 路由作為後端服務
- **靜態與動態渲染結合**：優化性能與用戶體驗
- **響應式設計**：支持各種設備訪問
- **模塊化架構**：確保代碼可維護性和可擴展性

## 核心功能模塊

### 1. 用戶管理模塊

- 用戶註冊與登入（支持郵箱、Google 和 Apple ID）
- 用戶角色分類（主辦方/贊助商）
- 個人資料管理
- 權限控制

### 2. 活動管理模塊（主辦方）

- 活動創建與編輯
- 活動詳情管理
- 贊助套餐設定
- 活動統計數據

### 3. 贊助管理模塊（贊助商）

- 活動瀏覽與搜索
- 贊助套餐查看
- 購物車功能
- 贊助請求管理

### 4. 會議預約模塊

- 會議排程
- 視訊會議連結整合
- 會議通知提醒
- 會議歷史記錄

### 5. 訊息通知模塊

- 系統通知
- 活動更新提醒
- 贊助申請通知
- 會議提醒

## 數據模型

主要實體關係：

1. **用戶（User）**：系統中的所有用戶
2. **活動（Event）**：由主辦方創建的活動
3. **贊助套餐（SponsorshipPlan）**：活動的贊助選項
4. **贊助（Sponsorship）**：贊助商與活動的贊助關係
5. **會議（Meeting）**：主辦方與贊助商之間的會議

## 技術選型

- **前端框架**：Next.js (React)
- **CSS 框架**：Tailwind CSS
- **數據管理**：React Context API
- **API 層**：Next.js API Routes
- **測試工具**：Jest 和 Playwright
- **部署環境**：Vercel

## 開發路線圖

1. **MVP 階段**：基本用戶認證、活動管理和贊助功能
2. **第二階段**：會議管理、消息通知和付款集成
3. **最終階段**：分析儀表板、高級搜索和社區功能

## 相關文檔

詳細功能規格和系統設計請參考以下文檔：

### 需求文檔
- [活動管理平台需求文檔](./活動管理平台_PRD.md)
- [主辦方與贊助方平台串接文檔](./sponsor_plan_integration_prd.md)
- [加密貨幣會議平台需求文檔](./crypto_conference_platform_prd.md)
- [登入系統優化與社交媒體整合需求](./login_system_integration_prd.md)
- [贊助商平台需求摘要](./sponsor_platform_requirements_summary.md)
- [贊助購物車 UI 設計](./sponsor_cart_ui_mockup_updated.md)

### 系統設計文檔
- [活動管理平台系統設計](./event_management_platform_system_design.md)
- [活動平台系統設計](./event_platform_system_design.md)
- [登入系統整合系統設計](./login_system_integration_system_design.md)
- [Spongo 系統設計](./spongo_system_design.md)

### 其他文檔
- [緊急問題分析](./urgent_issues_analysis.md) 

## 文檔審核結果

經過對所有文檔的審核和比對，根據現有專案結構和實際功能，我們對這些文檔進行了評估：

### 應保留文檔
- **活動管理平台_PRD.md** - 與當前專案的主要功能相符，仍然相關
- **login_system_integration_prd.md** - 社交登入功能實際已實作，文檔持續相關
- **login_system_integration_system_design.md** - 提供了登入系統的技術細節，有參考價值
- **PROJECT_OVERVIEW.md** - 重要的專案總覽文檔，應持續更新

### 需要更新的文檔
- **sponsor_plan_integration_prd.md** - 需要更新以反映當前專案的贊助計劃實作
- **event_management_platform_system_design.md** - 需要與當前Next.js專案結構同步
- **event_platform_system_design.md** - 需要更新以適配現有專案架構

### 存在差異的文檔
- **crypto_conference_platform_prd.md** - 與現有專案的重點有差異，建議重新評估需求
- **spongo_system_design.md** - 描述了較舊版本的架構，與現有Next.js架構有差異
- **sponsor_cart_ui_mockup_updated.md** - UI設計與現有實作有些許差異

### 建議歸檔的文檔
- **urgent_issues_analysis.md** - 似乎是舊版專案的問題分析，已不再相關
- **sponsor_platform_requirements_summary.md** - 內容已整合到其他更詳細的文檔中

建議保留所有文檔作為歷史參考，但在開發時應主要參考標記為「應保留」和「需要更新」的文檔。對於存在差異的文檔，應該在團隊會議中討論是否需要調整當前的實作方向，或是更新文檔以符合現有專案。
