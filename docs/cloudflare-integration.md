# Cloudflare 集成配置詳細指南

本文檔提供了項目與 Cloudflare 集成的詳細說明，特別是關於 R2 存儲、CDN 和自定義域名的設定。

## 目錄

1. [前置條件](#前置條件)
2. [Cloudflare R2 設定](#cloudflare-r2-設定)
3. [自定義域名設定](#自定義域名設定)
4. [頁面規則設定](#頁面規則設定)
5. [CORS 政策設定](#cors-政策設定)
6. [常見問題與解決方案](#常見問題與解決方案)

## 前置條件

在開始設置之前，請確保您已準備好以下內容：

- Cloudflare 帳戶（已開通 R2 存儲服務）
- 已註冊域名（例如 blockmeet.io）
- 域名已添加到 Cloudflare 並完成 DNS 設定

## Cloudflare R2 設定

### 建立存儲桶

1. 登入 Cloudflare 控制面板：[https://dash.cloudflare.com/](https://dash.cloudflare.com/)
2. 在左側導航欄選擇 **R2**
3. 點擊 **Create bucket** 按鈕
4. 輸入桶名稱（例如：`blockmeet`）
5. 點擊 **Create bucket** 完成創建

### 建立 API 令牌

1. 在 R2 頁面，點擊 **Manage R2 API Tokens**
2. 點擊 **Create API token**
3. 設定令牌名稱（例如：`R2 Account Token`）
4. 選擇權限級別：
   - 選擇 **Object Read & Write** 以允許讀寫操作
   - 範圍選擇 **Apply to all buckets in this account**
   - TTL 設為 **Forever**
5. 點擊 **Create API Token**
6. **重要**：立即保存顯示的 **Access Key ID** 和 **Secret Access Key**，這些信息只會顯示一次。

### 設定 CORS 政策

1. 在 R2 儀表板中選擇您的桶
2. 點擊 **Settings** 標籤
3. 滾動到 **CORS Policy** 部分，點擊 **Add CORS policy**
4. 在 JSON 編輯器中添加以下 CORS 政策：

```json
[
  {
    "AllowedOrigins": [
      "http://localhost:3000",
      "https://blockmeet.io",
      "https://sponlink.blockmeet.io",
      "https://admin.blockmeet.io"
    ],
    "AllowedMethods": [
      "GET",
      "PUT",
      "POST",
      "DELETE"
    ],
    "AllowedHeaders": [
      "Content-Type",
      "Authorization",
      "x-content-type-options",
      "x-requested-with"
    ],
    "MaxAgeSeconds": 3600,
    "ExposeHeaders": [
      "ETag"
    ]
  }
]
```

5. 點擊 **Save** 保存政策

## 自定義域名設定

### 連接自定義域名到 R2 桶

1. 在 R2 儀表板中選擇您的桶
2. 點擊 **Settings** 標籤
3. 在 **Public Access** 部分，確保設定為 **允許公共訪問**
4. 點擊 **Connect Domain** 按鈕
5. 輸入您想使用的子域名（例如：`img.blockmeet.io`）
6. 點擊 **Connect Domain** 完成設定

### 驗證域名連接

Cloudflare 會自動配置必要的 DNS 記錄。等待幾分鐘後，可以使用以下命令測試連接：

```bash
curl -I https://img.blockmeet.io/test.jpg
```

如果返回 404 狀態碼但包含 Cloudflare 標頭，則表示域名已成功連接。

## 頁面規則設定

由於 Cloudflare Edge Cache TTL 的限制（最長為一個月），我們需要設定特定的頁面規則來最大化 CDN 效率。

### 圖片域名全局快取規則

1. 在 Cloudflare 控制面板選擇您的域名
2. 點擊 **Rules** > **Page Rules**
3. 點擊 **Create Page Rule** 按鈕
4. 輸入 URL 匹配模式：`img.blockmeet.io/*`
5. 添加以下設定：
   - **Browser Cache TTL**: 選擇 **a year**
   - **Cache Level**: 選擇 **Cache Everything**
   - **Edge Cache TTL**: 選擇 **a month**（Cloudflare 的最大值）
6. 點擊 **Save and Deploy** 保存規則

### API 圖片處理快取規則

1. 點擊 **Create Page Rule** 按鈕
2. 輸入 URL 匹配模式：`blockmeet.io/api/image/*`
3. 添加以下設定：
   - **Browser Cache TTL**: 選擇 **4 days**
   - **Cache Level**: 選擇 **Cache Everything**
   - **Edge Cache TTL**: 選擇 **4 days**
4. 點擊 **Save and Deploy** 保存規則

## 環境變量設置

在項目中，需要將 Cloudflare R2 的配置信息添加到 `.env.local` 文件中：

```
# Cloudflare R2 配置
R2_ACCESS_KEY_ID=您的訪問密鑰ID
R2_SECRET_ACCESS_KEY=您的秘密訪問密鑰
R2_BUCKET_NAME=blockmeet
R2_ACCOUNT_ID=您的Cloudflare帳戶ID
R2_ENDPOINT=https://您的Cloudflare帳戶ID.r2.cloudflarestorage.com
NEXT_PUBLIC_R2_CUSTOM_DOMAIN=img.blockmeet.io
```

請將上述佔位符替換為您實際的 Cloudflare R2 信息：
- **R2_ACCESS_KEY_ID**: 步驟 "建立 API 令牌" 中獲得的 Access Key ID
- **R2_SECRET_ACCESS_KEY**: 步驟 "建立 API 令牌" 中獲得的 Secret Access Key
- **R2_ACCOUNT_ID**: 您的 Cloudflare 帳戶 ID，可以從 URL 或 R2 設定中獲取
- **R2_BUCKET_NAME**: 您創建的桶名稱

## 常見問題與解決方案

### Edge Cache TTL 限制

**問題**：Cloudflare Edge Cache TTL 最長只能設置為一個月，而我們希望圖片可以快取更長時間。

**解決方案**：
1. 結合使用 Browser Cache TTL（設為一年）和唯一文件名
2. 設置 `Cache-Control: public, max-age=31536000, immutable` 頭部
3. 每月更新頁面規則以刷新 Edge Cache

### CORS 問題

**問題**：跨域請求被阻止，無法訪問 R2 存儲中的文件。

**解決方案**：
1. 確保 CORS 政策中正確列出所有需要訪問的域名
2. 注意 Cloudflare R2 不支持通配符 *.domain.com 格式
3. 驗證 AllowedMethods 和 AllowedHeaders 包含所有必要的方法和頭部

### 圖片無法通過自定義域名訪問

**問題**：已設置自定義域名，但無法訪問圖片。

**解決方案**：
1. 確認域名設置已生效（可能需要等待 DNS 傳播）
2. 檢查桶設置中的 "Public Access" 是否已啟用
3. 使用 curl 命令檢查域名解析及 HTTP 狀態碼

### 404 錯誤但存在 Cloudflare 標頭

**問題**：請求返回 404 但包含 Cloudflare 標頭。

**解決方案**：
1. 這表示域名解析正確，但文件不存在
2. 確認使用的文件路徑正確
3. 嘗試上傳測試文件並訪問

---

## 性能優化建議

1. **優先使用 WebP 格式**：相比 JPEG 和 PNG，WebP 可提供更高的壓縮率和圖像質量
2. **使用響應式圖片**：根據設備和視窗大小提供不同尺寸的圖片
3. **設置合理的緩存策略**：平衡快取時間和內容更新需求
4. **啟用 Polish**：在 Cloudflare 中啟用 Polish 功能進一步優化圖片
5. **使用圖片懶加載**：僅當圖片即將進入視窗時才加載

---

**文檔作者**: 系統自動生成  
**最後更新**: 2025年4月5日  
**版本**: 1.0 