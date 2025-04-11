import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { verifyCredentials } from "@/lib/auth/authService";
import { SystemRole } from "@/lib/types/users";

// JWT回調函數：添加自定義數據到JWT
const jwtCallback = async ({ token, user }: any) => {
  // 當用戶登入時，將用戶數據添加到token中
  if (user) {
    token.id = user.id;
    token.email = user.email;
    token.name = user.name;
    token.systemRole = user.systemRole;
  }
  return token;
};

// Session回調函數：從JWT添加數據到Session
const sessionCallback = async ({ session, token }: any) => {
  if (token) {
    session.user = {
      ...session.user,
      id: token.id,
      email: token.email,
      name: token.name,
      systemRole: token.systemRole
    };
  }
  return session;
};

// 認證配置
export const { handlers: { GET, POST }, auth } = NextAuth({
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
          
          // 返回用戶資訊，設置系統角色
          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            systemRole: user.systemRole || SystemRole.USER // 設置默認系統角色
          };
        } catch (error) {
          console.error("登入驗證錯誤:", error);
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
    jwt: jwtCallback,
    
    // 添加自定義數據到 Session
    session: sessionCallback,
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
}); 