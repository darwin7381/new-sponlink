import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { verifyCredentials } from "@/lib/auth/authService";
import { SystemRole } from "@/lib/types/users";

/**
 * 擴展默認的 NextAuth Session 類型
 */
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      systemRole?: SystemRole;
    } & DefaultSession["user"];
  }
}

/**
 * 用戶對象類型定義
 */
interface UserPayload {
  id: string;
  email: string;
  name?: string;
  systemRole?: SystemRole;
}

// 認證配置
export const authOptions = {
  providers: [
    // 用戶名密碼認證
    CredentialsProvider({
      // 名稱和 ID
      id: "credentials",
      name: "帳號密碼",
      
      // 憑證字段
      credentials: {
        email: { label: "電子郵件", type: "text" },
        password: { label: "密碼", type: "password" },
      },
      
      // 授權處理
      async authorize(credentials) {
        // 檢查憑證完整性
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        try {
          // 驗證用戶憑證
          const user = await verifyCredentials(
            credentials.email,
            credentials.password
          );
          
          // 用戶不存在或密碼錯誤
          if (!user) {
            return null;
          }
          
          // 返回用戶資訊，使用原始UUID
          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            systemRole: user.systemRole || SystemRole.USER
          };
        } catch (error) {
          console.error("[NextAuth] 登入驗證錯誤:", error);
          return null;
        }
      },
    }),
    
    // Google 驗證 (僅當設置了環境變量時)
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  
  callbacks: {
    // 添加自定義數據到 JWT
    jwt: ({ token, user }) => {
      // 當用戶登入時，將用戶數據添加到token中
      if (user) {
        // 直接使用原始ID，不需要任何轉換
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.systemRole = user.systemRole;
        
        console.log(`[NextAuth] JWT生成，用戶ID: ${user.id}`);
      }
      return token;
    },
    
    // 添加自定義數據到 Session
    session: ({ session, token }) => {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          email: token.email,
          name: token.name,
          systemRole: token.systemRole as SystemRole
        };
        
        console.log(`[NextAuth] Session更新，用戶ID: ${session.user.id}`);
      }
      return session;
    },
  },
  
  // 自定義頁面
  pages: {
    signIn: "/login",
    error: "/login?error=auth_failed",
  },
  
  // 會話配置
  session: { strategy: "jwt" },
  
  // 調試模式
  debug: process.env.NODE_ENV === "development",
};

export const { handlers: { GET, POST }, auth } = NextAuth(authOptions); 