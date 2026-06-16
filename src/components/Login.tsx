import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Card } from './ui/Card'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Mail, Lock, AlertCircle, ArrowLeft } from 'lucide-react'

interface LoginProps {
  onNavigate: (viewId: string) => void
  onSuccess: () => void
}

export default function Login({ onNavigate, onSuccess }: LoginProps) {
  const { login, googleSignIn, resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resetModalOpen, setResetModalOpen] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetSuccess, setResetSuccess] = useState<string | null>(null)
  const [resetLoading, setResetLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Please fill in all fields.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      onSuccess()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Invalid credentials or connection issue.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setError(null)
    setLoading(true)
    try {
      await googleSignIn('User')
      onSuccess()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to authenticate with Google.')
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resetEmail) return
    setResetLoading(true)
    setResetSuccess(null)
    try {
      await resetPassword(resetEmail)
      setResetSuccess('Password reset link sent to your email!')
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Failed to send password reset email.')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Back button */}
      <div className="absolute top-6 left-6">
        <Button variant="ghost" size="sm" onClick={() => onNavigate('landing')} className="gap-1.5 text-zinc-400">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Button>
      </div>

      <div className="w-full max-w-[420px] z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center font-bold text-white shadow-glow mx-auto text-lg">
            F
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Welcome Back</h1>
          <p className="text-zinc-500 text-sm">Enter your credentials to access your creator profile.</p>
        </div>

        <Card className="p-6 border border-border bg-surface/50 backdrop-blur-md">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-start gap-2.5 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <Input
              label="Email Address"
              type="email"
              placeholder="you@domain.com"
              leftIcon={<Mail className="w-4 h-4" />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />

            <div className="space-y-1 text-right">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <button
                type="button"
                onClick={() => setResetModalOpen(true)}
                className="text-xs text-accent hover:underline focus:outline-none cursor-pointer mt-1"
              >
                Forgot password?
              </button>
            </div>

            <Button type="submit" variant="glow" className="w-full mt-2" isLoading={loading}>
              Sign In
            </Button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60"></div>
            </div>
            <span className="relative px-3 bg-background text-zinc-500 text-[10px] uppercase font-mono tracking-widest">
              Or Connect With
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 text-zinc-300 font-semibold"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Sign in with Google
          </Button>
        </Card>

        <div className="text-center text-sm text-zinc-500">
          New to Folioo?{' '}
          <button
            onClick={() => onNavigate('signup')}
            className="text-accent hover:underline font-medium cursor-pointer"
          >
            Create account
          </button>
        </div>
      </div>

      {/* Forgot Password Reset Modal */}
      {resetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-[380px] p-6 border border-border bg-[#0d0d0d] shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-2">Reset Password</h3>
            <p className="text-xs text-zinc-500 mb-4">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            <form onSubmit={handleResetPassword} className="space-y-4">
              {resetSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-emerald-400 text-xs">
                  {resetSuccess}
                </div>
              )}

              <Input
                label="Email"
                type="email"
                placeholder="you@domain.com"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
              />

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => { setResetModalOpen(false); setResetSuccess(null); }}>
                  Cancel
                </Button>
                <Button variant="glow" size="sm" type="submit" isLoading={resetLoading}>
                  Send Link
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}
