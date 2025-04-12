'use client'

import { useState } from 'react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LoginForm } from './LoginForm'
import SocialLoginButtons from './SocialLoginButtons'
import { SocialProvider } from '@/types/auth'
import { RegisterForm } from './RegisterForm'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface LoginModalProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  defaultTab?: 'login' | 'register'
}

export default function LoginModal({ 
  isOpen, 
  onOpenChange, 
  defaultTab = 'login'
}: LoginModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(defaultTab)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('[LoginModal] Starting login with NextAuth:', email)
      
      // Use NextAuth signIn method
      const result = await signIn('credentials', {
        redirect: false,
        email,
        password
      })
      
      if (result?.error) {
        console.error('[LoginModal] Login error:', result.error)
        throw new Error('Invalid email or password')
      }
      
      console.log('[LoginModal] Login successful')
      
      // Close login modal
      onOpenChange(false)
      
      // Refresh the page to update state (optional)
      router.refresh()
    } catch (error) {
      console.error('Login error:', error)
      setError(error instanceof Error ? error.message : 'Login failed, please try again later')
    } finally {
      setLoading(false)
    }
  }

  const handleSocialLogin = (provider: SocialProvider) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log(`[LoginModal] Starting social login: ${provider}`)
      
      // Use NextAuth signIn method for social login
      signIn(provider, { callbackUrl: window.location.href })
      
      // Note: Social login will redirect to provider page, so we don't need to close the modal
    } catch (error) {
      console.error(`${provider} login error:`, error)
      setError(`${provider} login failed, please try again later`)
      setLoading(false)
    }
  }

  const handleRegister = async (name: string, email: string, password: string) => {
    setLoading(true)
    setError(null)
    
    try {
      console.log('[LoginModal] Starting registration:', email);
      
      // Use API registration flow
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('[LoginModal] API registration error:', errorData)
        throw new Error(errorData.error || 'Registration failed')
      }

      const data = await response.json()
      console.log('[LoginModal] Registration successful:', data.success)
      
      // Switch to login tab after successful registration
      setActiveTab('login')
      setError('Registration successful! Please login with your new account.')
    } catch (error) {
      console.error('Registration error:', error)
      setError(error instanceof Error ? error.message : 'Registration failed, please try again later')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-center font-bold text-foreground">
            {activeTab === 'login' ? 'Login to Your Account' : 'Create New Account'}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {activeTab === 'login' ? 'Please login to continue' : 'Fill in the information below to create your account'}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'register')} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-destructive" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-destructive">
                      {error}
                    </h3>
                  </div>
                </div>
              </div>
            )}
            
            <LoginForm onSubmit={handleLogin} loading={loading} />
            
            <div className="mt-6">
              <SocialLoginButtons onSocialLogin={handleSocialLogin} isLoading={loading} />
            </div>
          </TabsContent>
          
          <TabsContent value="register" className="mt-4">
            <RegisterForm 
              onSubmit={handleRegister} 
              loading={loading}
              error={error}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
} 