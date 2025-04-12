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
    console.log("Submitting login form:", email, password)
    onSubmit(email, password)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1"
          placeholder="Enter your email"
          disabled={loading}
        />
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <a href="#" className="text-sm text-primary hover:underline">
            Forgot password?
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
          placeholder="Enter your password"
          disabled={loading}
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? (
          <>
            <span className="mr-2">Logging in...</span>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
          </>
        ) : (
          "Login"
        )}
      </Button>
      
      <div className="text-center mt-4">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account? <a href="/register" className="text-primary hover:underline">Register now</a>
        </p>
      </div>
    </form>
  )
} 