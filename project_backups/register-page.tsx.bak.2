'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/RegisterForm";
import SocialLoginButtons from "@/components/auth/SocialLoginButtons";
import { signIn } from "next-auth/react";
import { SocialProvider } from "@/types/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 處理社交登入
  const handleSocialLogin = async (provider: SocialProvider) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await signIn(provider, { callbackUrl: '/dashboard' });
    } catch (error) {
      console.error(`${provider} 登入錯誤:`, error);
      setError(`${provider}登入失敗，請稍後再試`);
      setIsLoading(false);
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      // 調用 API 進行註冊
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "註冊失敗");
      }

      // 註冊成功後，自動登入用戶
      const signInResult = await signIn('credentials', {
        redirect: false,
        email,
        password
      });

      if (signInResult?.error) {
        console.error('自動登入失敗:', signInResult.error);
        // 如果自動登入失敗，還是導向登入頁
        router.push("/login?registered=true");
      } else {
        // 自動登入成功，導向儀表板
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("註冊錯誤:", error);
      setError(error instanceof Error ? error.message : "註冊過程中發生錯誤");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">創建帳戶</CardTitle>
            <CardDescription className="text-center">
              輸入您的信息以創建帳戶
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm 
              onSubmit={handleRegister}
              loading={isLoading}
              error={error}
            />
            
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">
                    或使用社交帳號註冊
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <SocialLoginButtons 
                  onSocialLogin={handleSocialLogin} 
                  isLoading={isLoading}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-muted-foreground">
              已經有帳戶？{" "}
              <Link href="/login" className="text-primary hover:text-primary/80">
                登入
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 