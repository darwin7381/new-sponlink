'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { UserRole } from "@/types/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (name: string, email: string, password: string, role: UserRole) => {
    setError(null);
    setIsLoading(true);

    try {
      // 在實際應用中，這裡會調用 API 進行註冊
      // 目前使用模擬數據
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          role,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "註冊失敗");
      }

      // 註冊成功，重定向到登錄頁面
      router.push("/login?registered=true");
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