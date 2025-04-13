# Refactoring/Renaming Notes (BlockMeet)

此文件記錄在將產品全面更名為 BlockMeet 過程中觀察到的潛在程式碼問題，需要後續處理的事項。

## 潛在問題與觀察點

1.  **Linter 錯誤 (ARIA):**
    *   文件: `src/components/layout/Header.tsx` (after edit)
    *   錯誤: `Certain ARIA roles must be contained by particular parents: Required ARIA parents role not present: menu, menubar, group`
    *   說明: 在修改 Header 組件後出現此 ARIA 可訪問性錯誤，與品牌名稱更改無關。

2.  **Linter 錯誤 (Syntax Highlighter):**
    *   文件: `src/app/design-system/typography/page.tsx` (after edit)
    *   錯誤:
        *   `Cannot find module 'react-syntax-highlighter' or its corresponding type declarations.`
        *   `Cannot find module 'react-syntax-highlighter/dist/esm/styles/hljs' or its corresponding type declarations.`
        *   Multiple `"` and `'` can be escaped errors.
    *   說明: 修改排版頁面後出現此錯誤，涉及缺少模塊或類型聲明以及字符轉義，與品牌名稱更改無關。

3.  **Linter 錯誤 (Button Text):**
    *   文件: `src/app/design-system/colors/page.tsx` (after edit)
    *   錯誤: `Buttons must have discernible text: Element has no title attribute`
    *   說明: 在顏色系統頁面的顏色卡片組件中，複製按鈕缺少可訪問文本 (例如 title 屬性)，與品牌名稱更改無關。

4.  **Linter 錯誤 (Button Text):**
    *   文件: `src/app/design-system/components/page.tsx` (after edit)
    *   錯誤: `Buttons must have discernible text: Element has no title attribute`
    *   說明: 在組件庫頁面的浮動通知示例中，關閉按鈕缺少可訪問文本，與品牌名稱更改無關。

## 路徑與儲存庫相關問題

1. **GitHub 儲存庫名稱:**
   * 問題：GitHub 儲存庫仍然名為 `new-sponlink`，需要重命名為 `blockmeet`
   * 影響：克隆與推送指令、CI/CD 流程、部署工作流程
   * 解決方案：在 GitHub 平台上重命名儲存庫，更新所有相關的遠程引用

2. **本地目錄路徑:**
   * 問題：本地開發目錄可能仍為 `new-sponlink`
   * 影響：IDE 配置、路徑引用、Shell 腳本
   * 建議：如 README.md 中所述，為保留 Cursor 歷史記錄，可暫時保留本地目錄名稱，但全新 clone 應使用新名稱

3. **package.json 與 package-lock.json:**
   * 問題：`package.json` 和 `package-lock.json` 中的 `name` 字段仍包含舊品牌名稱
   * 建議：更新 `package.json` 中的名稱，然後運行 `npm install` 重新生成 `package-lock.json`

4. **Docker 相關配置:**
   * 問題：如有 Docker 配置，可能包含舊品牌名稱的容器和鏡像名稱
   * 建議：檢查並更新 Dockerfile、docker-compose.yml 及相關 Docker 腳本

5. **CI/CD 配置文件:**
   * 問題：GitHub Actions、Jenkins 或其他 CI/CD 工具的配置文件可能包含舊名稱
   * 建議：檢查 `.github/workflows/` 目錄下的所有 YAML 文件

6. **部署腳本和配置:**
   * 問題：部署腳本和配置文件可能硬編碼了舊品牌名稱
   * 建議：檢查 Vercel、Netlify 或其他部署平台的配置文件 