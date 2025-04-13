# BlockMeet 使用者 ID 映射系統

## 目錄
1. [系統概述](#系統概述)
2. [問題背景](#問題背景)
3. [技術實現](#技術實現)
4. [使用方法](#使用方法)
5. [最佳實踐](#最佳實踐)
6. [故障排除](#故障排除)
7. [未來優化計劃](#未來優化計劃)

## 系統概述

BlockMeet 的使用者 ID 映射系統是一個用於解決真實使用者身份與開發環境模擬資料之間關聯的橋樑。本系統允許開發者在引入真實認證系統的同時，保持與現有模擬資料的兼容性，確保所有功能和測試流程不受影響。

## 問題背景

在開發 BlockMeet 平台的過程中，我們面臨以下挑戰：

1. **初期開發使用模擬數據**：早期開發階段使用了固定的使用者 ID（如 "1"、"2" 等）和與之關聯的模擬活動、贊助等資料。

2. **真實認證產生動態 ID**：引入 Auth.js 等真實認證系統後，每個使用者會獲得唯一的、不可預測的 ID（通常是 UUID）。

3. **ID 不兼容問題**：這導致真實登入的使用者無法與現有模擬資料建立關聯，影響功能體驗和測試。

## 技術實現

### 核心映射機制

映射系統基於本地儲存實現，核心文件為 `src/lib/userMapping.ts`，包含以下主要功能：

```typescript
// 使用者 ID 映射類型
interface UserIdMap {
  // key: 真實使用者 ID, value: 模擬使用者 ID
  [realUserId: string]: string;
}

// 存儲映射的本地儲存鍵名
const USER_ID_MAPPING_KEY = 'user_id_mapping';
```

### 主要功能模塊

1. **映射管理**：
   - `getUserIdMapping()`：從本地儲存獲取當前映射
   - `setUserIdMapping(mapping)`：更新本地儲存的映射
   - `addUserIdMapping(realUserId, mockUserId)`：添加單個映射關係

2. **映射建立**：
   - `setupUserIdMappingByEmail(realUserId, userEmail)`：基於使用者電子郵件自動建立映射

3. **ID 解析**：
   - `getMockUserId(realUserId)`：獲取真實 ID 對應的模擬 ID
   - `getResourceOwner(resourceOwnerId)`：智能解析資源所有者 ID

### 與認證系統集成

1. **在 Auth.js 中的集成**：
   ```typescript
   // src/app/api/auth/[...nextauth]/route.ts 中的會話回調
   async session({ session, token }) {
     if (token) {
       // ...其他操作
       
       // 查找匹配的模擬使用者，保持 ID 一致性
       if (session.user.email) {
         const matchingMockUser = MOCK_USERS.find(
           (u) => u.email === session.user.email
         );
         
         if (matchingMockUser) {
           session.user.mockUserId = matchingMockUser.id;
         }
       }
     }
     return session;
   }
   ```

2. **在 AuthProvider 中的集成**：
   ```typescript
   // src/components/auth/AuthProvider.tsx
   // 檢查登入狀態時處理 ID 映射
   if (status === 'authenticated' && session?.user) {
     // ...其他操作
     
     // 設置使用者 ID 映射
     if (session.user.email) {
       setupUserMappingOnLogin({
         id: session.user.id,
         email: session.user.email
       });
     }
   }
   ```

3. **資源存取時的轉換**：
   ```typescript
   // 在 AuthProvider 中提供轉換方法
   const getResourceOwnerId = useCallback((resourceId: string) => {
     return getResourceOwner(resourceId);
   }, []);
   
   // 提供給 Context 供組件使用
   <AuthContext.Provider value={{ 
     // ...其他值
     getResourceOwnerId 
   }}>
   ```

## 使用方法

### 對於前端開發者

1. **獲取資源所有者 ID**：

   ```tsx
   import { useAuth } from '@/components/auth/AuthProvider';
   
   function MyComponent() {
     const { getResourceOwnerId } = useAuth();
     
     useEffect(() => {
       // 假設從 API 獲取的資料有 ownerId 欄位
       const actualOwnerId = getResourceOwnerId(data.ownerId);
       
       // 使用轉換後的 ID 進行操作
       checkPermissions(actualOwnerId);
     }, [data]);
     
     // ...組件其餘部分
   }
   ```

2. **檢查資源所有權**：

   ```tsx
   function checkIfUserIsOwner(resourceOwnerId) {
     const { user, getResourceOwnerId } = useAuth();
     if (!user) return false;
     
     // 獲取可能經過映射的資源所有者 ID
     const actualOwnerId = getResourceOwnerId(resourceOwnerId);
     
     return user.id === actualOwnerId;
   }
   ```

### 對於後端開發者

1. **處理請求中的 ID**：

   ```typescript
   // API 路由處理函數
   export async function GET(request) {
     // 從請求中獲取資源 ID
     const { resourceId } = request.query;
     
     // 注意：在後端也需要實現類似的 ID 解析邏輯
     // 或者保持一致的 ID 體系
     
     // ...處理邏輯
   }
   ```

## 最佳實踐

1. **始終使用映射函數**：
   - 任何需要比較或檢查使用者 ID 的地方，都應該使用 `getResourceOwnerId`
   - 避免直接比較原始 ID

2. **保持電子郵件一致**：
   - 確保模擬使用者的電子郵件與開發/測試賬號一致
   - 這是建立映射關係的基礎

3. **處理新使用者場景**：
   - 考慮沒有對應模擬數據的新使用者的體驗
   - 可能需要為其創建初始數據

4. **跨裝置同步考量**：
   - 映射關係存儲在本地，不會跨裝置同步
   - 測試時需要注意這一點

## 故障排除

### 常見問題

1. **映射失敗**
   - **症狀**：登入後無法看到關聯的活動或贊助
   - **可能原因**：使用者電子郵件與模擬資料不匹配
   - **解決方案**：確保測試賬號使用與模擬資料相同的電子郵件

2. **權限錯誤**
   - **症狀**：無法編輯本應屬於使用者的資源
   - **可能原因**：ID 映射未正確應用
   - **解決方案**：檢查 `getResourceOwnerId` 的使用是否一致

3. **數據不一致**
   - **症狀**：在不同頁面看到的擁有資源不同
   - **可能原因**：部分頁面未使用 ID 映射
   - **解決方案**：全面檢查 ID 比較邏輯

### 調試方法

1. **檢查本地儲存**：
   - 打開開發者工具 → Application → Local Storage
   - 查看 `user_id_mapping` 項的內容

2. **日誌輸出**：
   - 添加臨時日誌來跟踪 ID 轉換：
     ```typescript
     console.log('Original ID:', resourceId);
     console.log('Mapped ID:', getResourceOwnerId(resourceId));
     ```

## 未來優化計劃

1. **向生產環境過渡**：
   - 實現「為新使用者創建示範數據」功能
   - 逐步減少對 ID 映射的依賴

2. **伺服器端映射**：
   - 考慮將映射邏輯遷移到伺服器端
   - 解決跨裝置同步問題

3. **自動化測試增強**：
   - 添加專門針對 ID 映射的測試用例
   - 確保在各種場景下的一致性

4. **性能優化**：
   - 緩存常用的 ID 映射結果
   - 減少重複計算

---

本文檔提供了 BlockMeet 使用者 ID 映射系統的詳細說明，幫助開發團隊理解並正確使用這一系統。如有任何問題或建議，請聯繫開發團隊。 