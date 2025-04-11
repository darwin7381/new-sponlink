'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface RegisterFormProps {
  onSubmit: (name: string, email: string, password: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
}

export function RegisterForm({ onSubmit, loading = false, error }: RegisterFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);

    // 基本驗證
    if (!name || !email || !password || !confirmPassword) {
      setFormError('所有欄位都是必填的');
      return;
    }

    if (password !== confirmPassword) {
      setFormError('密碼不匹配');
      return;
    }

    if (password.length < 8) {
      setFormError('密碼必須至少8個字符');
      return;
    }

    await onSubmit(name, email, password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">姓名</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="請輸入您的姓名"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">電子郵件</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="請輸入您的電子郵件"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">密碼</Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="請輸入您的密碼"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">確認密碼</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="再次輸入您的密碼"
        />
      </div>

      {(formError || error) && (
        <div className="text-sm text-red-500">
          {formError || error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center">
            <div className="mr-2">註冊中</div>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          </div>
        ) : (
          '註冊'
        )}
      </Button>
    </form>
  );
} 