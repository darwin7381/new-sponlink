'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LoginFormProps {
  onSubmit: (email: string, password: string) => void
  loading?: boolean
}

export function LoginForm({ onSubmit, loading = false }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("提交登录表单:", email, password)
    onSubmit(email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="email">電子郵件</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1"
          placeholder="請輸入您的電子郵件"
          disabled={loading}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">密碼</Label>
          <a href="#" className="text-sm text-primary hover:underline">
            忘記密碼?
          </a>
        </div>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1"
          placeholder="請輸入您的密碼"
          disabled={loading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <span className="mr-2">登入中...</span>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
          </>
        ) : (
          "登入"
        )}
      </Button>
      
      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground">
          還沒有帳號? <a href="/register" className="text-primary hover:underline">立即註冊</a>
        </p>
      </div>
    </form>
  )
} 