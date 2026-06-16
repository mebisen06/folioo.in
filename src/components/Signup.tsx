import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Card } from './ui/Card'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { Mail, Lock, User, AlertCircle, ArrowLeft } from 'lucide-react'
import type { Role } from '../types'

interface SignupProps {
  onNavigate: (viewId: string) => void
  onSuccess: () => void
}

export default function Signup({ onNavigate, onSuccess }: SignupProps) {
  const { signup, googleSignIn } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [role, setRole] = useState<Role>('User')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setError(null)
    setLoading(true)
    try {
      await signup(email, password, name, role)
      onSuccess()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Registration failed. Try a different email.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setError(null)
    setLoading(true)
    try {
      await googleSignIn(role)
      onSuccess()
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'Google signup failed.')
    } finally {
      setLoading(false)
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

      <div className="w-full max-w-[440px] z-10 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center font-bold text-white shadow-glow mx-auto text-lg">
            P
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Create Your Profile</h1>
          <p className="text-zinc-500 text-sm">Join the gallery and host your interactive templates.</p>
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
              label="Full Name"
              type="text"
              placeholder="Jane Doe"
              leftIcon={<User className="w-4 h-4" />}
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />

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

            {/* Role dropdown */}
            <div className="w-full flex flex-col gap-1.5 text-left">
              <label className="text-xs font-semibold text-zinc-400 tracking-wide uppercase select-none">
                Profile Goal (Role)
              </label>
              <select
                className="w-full bg-surface border border-border text-sm text-primary-text rounded-md px-4 py-2.5 outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                disabled={loading}
              >
                <option value="User">Standard User (Resume Builder / Downloads)</option>
                <option value="Creator">Portfolio Creator (Submit Templates)</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Password"
                type="password"
                placeholder="••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
              <Input
                label="Confirm Password"
                type="password"
                placeholder="••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <Button type="submit" variant="glow" className="w-full mt-2" isLoading={loading}>
              Sign Up
            </Button>
          </form>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border/60"></div>
            </div>
            <span className="relative px-3 bg-background text-zinc-500 text-[10px] uppercase font-mono tracking-widest">
              Or Register With
            </span>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2 text-zinc-300 font-semibold"
            onClick={handleGoogleSignUp}
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
            Register with Google
          </Button>
        </Card>

        <div className="text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <button
            onClick={() => onNavigate('login')}
            className="text-accent hover:underline font-medium cursor-pointer"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  )
}
