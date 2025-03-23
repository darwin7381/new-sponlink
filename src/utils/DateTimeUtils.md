# Luma 導入的時區處理方案

## 問題分析

通過檢查代碼和問題描述，我們發現了以下時區相關問題：

1. **時區識別問題**：在從Luma抓取活動時，我們可以獲取到時區信息（例如 'Asia/Singapore'、'Asia/Taipei'），但這些信息在轉換到表單時並未被正確使用

2. **日期顯示問題**：當用戶從Luma導入活動後，表單中顯示的日期時間可能與Luma原始日期時間不一致，這是由於時區差異造成的

3. **數據保存問題**：即使正確顯示了日期，我們也需要確保將原始時區信息保存下來，以便在後續顯示時能夠正確轉換

## 解決方案

我們實現了以下解決方案：

### 1. 創建時區處理工具函數

在 `src/utils/dateUtils.ts` 中添加了專門處理時區的工具函數：

- `convertToTimezone`: 將ISO時間字符串轉換為指定時區的ISO時間字符串
- `getBrowserTimezone`: 獲取用戶瀏覽器的時區
- `formatDateTime`: 格式化日期時間為本地顯示格式
- `convertToDatetimeLocalFormat`: 將Luma的ISO時間轉換為HTML表單使用的datetime-local格式
- `convertFromDatetimeLocalToISO`: 將表單的datetime-local格式轉換回ISO格式

### 2. 更新模型定義

- 在 `Event` 接口中添加了可選的 `timezone` 字段，用於存儲活動的時區信息

### 3. 應用更新

- 修改 `lumaService.ts` 中的 `formatLumaEvent` 函數，以保存時區信息並提供正確的時間轉換
- 更新 `events/create/page.tsx` 中的 `handleImportFromLuma` 函數，使用時區工具函數正確轉換時間
- 更新 `handleSubmit` 函數，在提交時保存時區信息

## 技術實現細節

### 時區轉換核心邏輯

時區轉換的核心是使用 JavaScript 的 `Intl.DateTimeFormat` API。這個 API 允許我們根據特定時區格式化日期時間：

```typescript
const formatter = new Intl.DateTimeFormat('en-US', {
  timeZone: timezone, // 例如 'Asia/Taipei'
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});
```

### 表單日期格式

HTML的datetime-local輸入框要求YYYY-MM-DDTHH:MM格式的時間字符串，所以我們需要將ISO時間字符串轉換為這種格式：

```typescript
// 例如：將 "2025-03-31T06:00:00.000Z" 轉換為 "2025-03-31T14:00" (考慮時區)
const datetimeLocalValue = convertToDatetimeLocalFormat(isoString, timezone);
```

## 處理流程

整體處理流程如下：

1. 從Luma獲取活動數據（包含時區信息）
2. 使用時區信息將ISO時間轉換為表單可以顯示的格式
3. 用戶編輯活動信息
4. 提交時將表單數據轉回ISO格式，並保存時區信息
5. 顯示活動時，根據保存的時區信息正確顯示時間

## 注意事項

- 不同瀏覽器可能有不同的時區設置，我們使用 `Intl.DateTimeFormat().resolvedOptions().timeZone` 獲取瀏覽器時區
- 當Luma沒有提供時區信息時，我們回退到用戶瀏覽器的時區
- 時區轉換可能會出錯，所以我們添加了錯誤處理，在出錯時回退到原始值 