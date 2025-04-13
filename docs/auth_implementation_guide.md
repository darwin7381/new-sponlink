# BlockMeet Auth.js 實施指南

## 目錄

1. [介紹](#介紹)
2. [快速開始](#快速開始)
3. [組件與 API](#組件與-api)
4. [社交登入](#社交登入)
5. [使用者資料和會話](#使用者資料和會話)
6. [ID 映射系統集成](#id-映射系統集成)
7. [測試與除錯](#測試與除錯)
8. [遷移指南](#遷移指南)

## 介紹

BlockMeet 平台使用 Auth.js (以前稱為 NextAuth.js) 作為認證解決方案，並配合自定義的使用者 ID 映射系統來保持與現有模擬資料的兼容性。本指南將幫助開發者理解如何使用和擴展這個系統。

### 系統架構

認證系統由以下主要部分組成：

1. **Auth.js 核心**：處理認證流程、session 管理和社交登入
2. **AuthProvider**：提供認證狀態和功能給整個應用
3. **ID 映射系統**：處理真實使用者 ID 與模擬資料 ID 的映射
4. **登入/登出流程**：處理使用者身份驗證

## 快速開始

### 安裝與設置

1. 確保所有必要的依賴已安裝：

```bash
npm install next-auth@beta
```

2. 確保環境變數已設置（`.env.local`）：

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
APPLE_CLIENT_ID=your-apple-client-id
APPLE_CLIENT_SECRET=your-apple-client-secret
```

### 基本用法

在組件中使用認證：

```tsx
'use client'

import { useSession, signIn, signOut } from 'next-auth/react';
import { useAuth } from '@/components/auth/AuthProvider';

export function MyComponent() {
  // 從 next-auth 獲取 session 數據
  const { data: session, status } = useSession();
  
  // 從我們的 AuthProvider 獲取額外功能
  const { user, getResourceOwnerId } = useAuth();

  if (status === 'loading') {
    return <div>加載中...</div>;
  }

  if (status === 'unauthenticated') {
    return (
      <div>
        <p>請登入以使用此功能</p>
        <button onClick={() => signIn()}>登入</button>
      </div>
    );
  }

  return (
    <div>
      <p>歡迎, {session?.user?.name || user?.email}</p>
      <button onClick={() => signOut()}>登出</button>
    </div>
  );
}
```

## 組件與 API

### 核心 Auth.js 功能

1. **useSession** - 獲取當前會話狀態

```tsx
const { data: session, status } = useSession();
```

`status` 可能的值：
- `loading` - 會話加載中
- `authenticated` - 使用者已認證
- `unauthenticated` - 使用者未認證

2. **signIn** - 啟動登入流程

```tsx
// 重定向到登入頁面
signIn();

// 使用特定方法登入
signIn('google');

// 使用憑證登入（不重定向）
signIn('credentials', {
  redirect: false,
  email: 'user@example.com',
  password: 'password'
});
```

3. **signOut** - 登出使用者

```tsx
// 登出並重定向到首頁
signOut();

// 登出但不重定向
signOut({ redirect: false });
```

### 自定義 AuthProvider 功能

1. **useAuth** - 獲取認證上下文

```tsx
const { 
  isLoggedIn,        // 是否已登入
  user,              // 使用者資料
  loading,           // 加載狀態
  handleLogout,      // 登出函數
  showLoginModal,    // 顯示登入模態框
  getResourceOwnerId // ID 映射函數
} = useAuth();
```

2. **資源所有權功能**

```tsx
// 檢查使用者是否為資源擁有者
function isUserOwner(resourceOwnerId) {
  const { user, getResourceOwnerId } = useAuth();
  
  // 獲取映射後的 ID
  const mappedOwnerId = getResourceOwnerId(resourceOwnerId);
  
  return user?.id === mappedOwnerId;
}
```

## 社交登入

### 設置 OAuth 提供商

目前系統支持 Google 和 Apple 登入。要添加新的社交登入提供商，需修改 `src/app/api/auth/[...nextauth]/route.ts`：

```typescript
// 添加新的提供商
const authOptions = {
  providers: [
    GoogleProvider({...}),
    AppleProvider({...}),
    // 添加新提供商，如 GitHub
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET
    }),
    // ...其他提供商
  ],
  // ...其他配置
};
```

### 客戶端社交登入

在 UI 中添加社交登入按鈕：

```tsx
import { signIn } from 'next-auth/react';

// 社交登入按鈕組件
function SocialLoginButton({ provider, children }) {
  return (
    <button 
      onClick={() => signIn(provider, { callbackUrl: '/dashboard' })}
      className="btn btn-social"
    >
      {children}
    </button>
  );
}

// 使用方式
<SocialLoginButton provider="google">
  使用 Google 登入
</SocialLoginButton>
```

## 使用者資料和會話

### 使用者資料結構

Auth.js 中的會話包含以下使用者資料：

```typescript
interface SessionUser {
  id: string;          // 使用者 ID
  email: string;       // 電子郵件
  role: string;        // 角色
  mockUserId?: string; // 映射的模擬使用者 ID
  name?: string;       // 名稱（可選）
  image?: string;      // 頭像（可選）
}
```

### 自定義使用者資料

要擴展使用者資料，請修改 `src/app/api/auth/[...nextauth]/route.ts` 中的會話回調：

```typescript
callbacks: {
  async session({ session, token }) {
    if (token) {
      // 添加更多使用者數據
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.preferences = token.preferences;
      // ...其他自定義數據
    }
    return session;
  },
}
```

## ID 映射系統集成

Auth.js 與 ID 映射系統的集成是 BlockMeet 認證架構的核心。

### 在登入流程中設置映射

登入時，系統自動建立使用者 ID 映射：

```typescript
// login 頁面中
useEffect(() => {
  if (status === 'authenticated' && session) {
    // 設置使用者 ID 映射
    if (session.user && session.user.email) {
      setupUserMappingOnLogin({
        id: session.user.id,
        email: session.user.email
      });
    }
    // ...其他登入後操作
  }
}, [session, status]);
```

### 在授權檢查中使用映射

```typescript
// 檢查使用者是否可以編輯資源
function canEditResource(resource) {
  const { user, getResourceOwnerId } = useAuth();
  
  if (!user) return false;
  
  // 獲取映射後的資源擁有者 ID
  const actualOwnerId = getResourceOwnerId(resource.ownerId);
  
  // 檢查使用者是否為資源擁有者
  return user.id === actualOwnerId;
}
```

## 測試與除錯

### 常見問題排解

1. **登入失敗/無法獲取會話**

   檢查項目：
   - 環境變數是否正確設置
   - OAuth 提供商配置是否有誤
   - 網絡錯誤或跨域問題

2. **無法訪問資源/權限問題**

   檢查項目：
   - ID 映射是否正確建立
   - 是否正確使用 `getResourceOwnerId`
   - 使用者角色是否符合要求

### 開發工具

1. **會話狀態檢查**

   在開發者工具中添加以下代碼以檢查會話狀態：

   ```javascript
   // 控制台中運行
   // 檢查 Auth.js 會話
   fetch('/api/auth/session').then(r => r.json()).then(console.log);
   
   // 檢查本地 ID 映射
   console.log(JSON.parse(localStorage.getItem('user_id_mapping')));
   ```

2. **Auth.js 調試模式**

   在 `.env.local` 中啟用調試：

   ```
   NEXTAUTH_DEBUG=true
   ```

## 遷移指南

### 從舊認證系統遷移

如果您的組件仍在使用舊的認證方法，請按照以下步驟遷移：

1. **從 `authService` 到 Auth.js**

   Before:
   ```typescript
   import { login, logout, isAuthenticated } from '@/lib/services/authService';
   
   // 登入
   await login(email, password);
   
   // 登出
   logout();
   
   // 檢查是否已認證
   if (isAuthenticated()) { ... }
   ```

   After:
   ```typescript
   import { signIn, signOut, useSession } from 'next-auth/react';
   
   // 登入
   await signIn('credentials', { redirect: false, email, password });
   
   // 登出
   signOut();
   
   // 檢查是否已認證
   const { status } = useSession();
   if (status === 'authenticated') { ... }
   ```

2. **使用者數據訪問**

   Before:
   ```typescript
   import { getCurrentUser } from '@/lib/services/authService';
   
   const user = await getCurrentUser();
   ```

   After:
   ```typescript
   import { useSession } from 'next-auth/react';
   import { useAuth } from '@/components/auth/AuthProvider';
   
   // 在組件中
   const { data: session } = useSession();
   const { user } = useAuth();
   
   // 使用 session.user 或 user
   ```

### 未來演進

我們計劃逐步淘汰 ID 映射系統，並完全遷移到真實使用者數據。請關注開發團隊的更新通知。

## 總結

本指南旨在幫助開發者理解和使用 BlockMeet 的認證系統。如有問題或需要更多幫助，請聯繫開發團隊。

## 最新更新：登入功能完成狀態

我們已經成功實現並優化了登入和認證功能，主要改進包括：

1. **優化導航結構**：
   - 移除了冗餘的 Navbar 組件，統一使用 Header 組件作為全局導航
   - 優化狀態更新邏輯，避免不必要的重新渲染

2. **登出功能修復**：
   - 修復了登出時導航欄消失的問題
   - 統一使用 next-auth 的 signOut 方法處理登出
   - 保留視圖狀態，不清除影響導航顯示的本地存儲數據

3. **視角切換系統實現**：
   - 在 types/users.ts 中定義了 VIEW_TYPE 枚舉
   - 從 authService 導出 VIEW_TYPE 供組件使用
   - 實現基於視角而非角色的界面顯示邏輯

4. **權限檢查機制**：
   - 簡化了權限檢查，減少對固定角色的依賴
   - 實現基於所有權的權限檢查
   - 更新了頁面，使用更靈活的安全檢查機制

5. **組件清理與文檔更新**：
   - 移除未使用的 ProtectedRouteWrapper 組件引用
   - 使用 RequireAuth 組件進行路由保護
   - 更新文檔以反映最新的認證架構

現在，當用戶登入或登出時，導航欄將正確保持顯示所有導航項目，無需頁面刷新，提供更一致和流暢的用戶體驗。

---

## 原計劃：認證實現 