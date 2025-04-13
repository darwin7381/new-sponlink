# BlockMeet 認證系統標準使用指南

## 1. 認證系統架構概述

BlockMeet 平台採用現代化、安全的認證架構，基於以下核心技術和原則：

- **NextAuth.js** - 統一的身份驗證框架
- **React Context API** - 應用層級的狀態管理
- **模態式登入** - 非跳轉式的用戶友好體驗
- **分離式客戶端狀態** - 減少對 localStorage 的直接依賴

這種架構確保用戶體驗的一致性、代碼的可維護性，同時提供高水平的安全性。

## 2. 核心認證原則

### 2.1 用戶體驗優先原則

- ✅ **避免強制登入牆** - 未登入用戶可瀏覽大部分內容，只有需要寫入操作時才提示登入
- ✅ **模態式登入** - 使用登入模態框而非頁面跳轉，保留用戶上下文
- ✅ **本地購物車** - 未登入用戶可添加項目到本地購物車，註冊後自動合併
- ✅ **統一界面** - 未登入和已登入但無數據的用戶應看到相同界面

### 2.2 安全性原則

- ✅ **禁止直接訪問 localStorage 獲取用戶信息** - 所有用戶數據通過 Context API 獲取
- ✅ **統一認證入口** - 使用 `useAuth` hook 進行所有認證操作和狀態檢查
- ✅ **會話安全** - 使用 HttpOnly Cookie 存儲敏感認證信息，客戶端只保存必要的非敏感信息
- ✅ **標準化錯誤處理** - 統一的認證錯誤處理機制

### 2.3 代碼組織原則

- ✅ **認證邏輯與業務邏輯分離** - 使用 hook 封裝所有認證操作
- ✅ **組件化登入界面** - 可重用的登入、註冊表單組件
- ✅ **統一命名約定** - 一致的函數和變量命名規範
- ✅ **英文標準化** - 所有界面、錯誤訊息和代碼註釋使用英文

## 3. 標準化認證使用方法

### 3.1 客戶端認證

```tsx
// 在 React 組件中使用
import { useAuth } from '@/components/auth/AuthProvider';

function MyComponent() {
  // 獲取用戶狀態和認證函數
  const { user, isLoggedIn, showLoginModal } = useAuth();
  
  // 需要登入的操作示例
  const handleProtectedAction = () => {
    if (!isLoggedIn) {
      showLoginModal(); // 顯示登入模態框，不進行頁面跳轉
      return;
    }
    
    // 已登入用戶的後續操作...
    doProtectedAction();
  };
  
  return (
    <div>
      <button onClick={handleProtectedAction}>
        執行需要登入的操作
      </button>
      
      {/* 根據登入狀態條件渲染內容 */}
      {isLoggedIn ? (
        <p>Welcome, {user?.email}</p>
      ) : (
        <p>Content visible to all users</p>
      )}
    </div>
  );
}
```

### 3.2 登出操作

```tsx
const { handleLogout } = useAuth();

// 登出按鈕
<button onClick={handleLogout}>登出</button>
```

### 3.3 組件級別保護

對於需要整個組件級別保護的情況（極少數場景），使用標準化的 `RequireAuth` 組件：

```tsx
import { RequireAuth } from '@/components/auth/RequireAuth';

// 包裹需要保護的組件
function ProtectedPage() {
  return (
    <RequireAuth>
      <YourProtectedContent />
    </RequireAuth>
  );
}
```

## 4. 判定標準與規範核查清單

以下是評估認證實現是否符合標準的核查清單：

### 4.1 用戶流程標準

- [ ] 禁止錯誤得重新導向到登入頁，只有少數會動到會員遠端資料庫儲存的特定行為需要驗證身份
- [ ] 禁止出現任何登入警示，未登入的人看到的跟已登入但沒資料的人，看到的都是一樣的
- [ ] 確保符合英文網站要求，不允許中文界面元素和註釋
- [ ] 確保認證機制簡單明確，避免過於複雜的驗證身份或權限阻擋機制

### 4.2 代碼實現標準

- [ ] 統一使用 `useAuth` hook 獲取用戶狀態和認證功能
- [ ] 禁止直接使用 `router.push('/login')` 進行重定向
- [ ] 需要登入的操作統一使用 `showLoginModal()` 顯示登入模態框
- [ ] 禁止直接訪問 localStorage 獲取或存儲用戶認證數據
- [ ] 禁止使用已棄用的認證函數如 `isAuthenticated()`、`getCurrentUser()` 等
- [ ] 確保用戶反饋使用 `toast` 組件而非原生 `alert()`

### 4.3 用戶體驗標準

購物車功能標準化要求：
- [ ] 所有 "Add to Cart" 按鈕不需要登入就可以使用
- [ ] 未登入用戶的購物車內容保存在本地存儲中，不會丢失
- [ ] 只有在結帳 (Checkout) 時才需要登入
- [ ] 標準化實現應用於所有包含購物車功能的頁面

## 5. 常見問題與最佳實踐

### 5.1 處理需要用戶識別的API調用

```tsx
const handleDataFetch = async () => {
  if (!isLoggedIn) {
    // 顯示公共數據或空狀態
    setData(publicData);
    return;
  }
  
  // 用戶已登入，獲取個人化數據
  try {
    const result = await fetchUserSpecificData(user.id);
    setData(result);
  } catch (error) {
    console.error('Error fetching data:', error);
    toast.error('Failed to fetch data');
  }
};
```

### 5.2 避免常見錯誤

❌ **不推薦的寫法**:
```tsx
// 錯誤示例 1: 直接使用重定向
if (!isAuthenticated()) {
  router.push('/login');
  return;
}

// 錯誤示例 2: 直接訪問 localStorage
const user = JSON.parse(localStorage.getItem('user'));

// 錯誤示例 3: 使用條件渲染擋住整個頁面
return isAuthenticated() ? <YourComponent /> : <LoginPrompt />;
```

✅ **正確的寫法**:
```tsx
// 正確示例 1: 使用登入模態框
const { isLoggedIn, showLoginModal } = useAuth();
if (!isLoggedIn) {
  showLoginModal();
  return;
}

// 正確示例 2: 使用 useAuth 獲取用戶
const { user } = useAuth();

// 正確示例 3: 條件渲染僅針對需要認證的操作
return (
  <div>
    <PublicContent />
    {isLoggedIn ? <UserSpecificContent /> : <AnonymousUserContent />}
  </div>
);
```

## 6. 參考資源

- [使用 NextAuth.js 的官方文檔](https://next-auth.js.org/)
- [React Context API 文檔](https://reactjs.org/docs/context.html)
- [BlockMeet 認證系統實現記錄](./login-wall-fixes-progress.md)

## 7. 技術債務與未來改進

- 繼續完善多語言支持，保持與認證系統的解耦
- 增強錯誤處理和日誌記錄
- 實現更完善的權限管理系統

---

本文檔將隨著認證系統的演進持續更新，確保開發團隊始終遵循最佳實踐和統一標準。 