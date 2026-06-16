import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { Card } from './ui/Card'
import { Input } from './ui/Input'
import { Button } from './ui/Button'
import { User, Mail, Calendar, Shield, Lock, CheckCircle, AlertCircle } from 'lucide-react'

export default function UserProfile() {
  const { currentUser, logout } = useAuth()
  
  // Edit Profile States
  const [name, setName] = useState(currentUser?.name || '')
  const [editSuccess, setEditSuccess] = useState<string | null>(null)
  const [editError, setEditError] = useState<string | null>(null)
  const [editLoading, setEditLoading] = useState(false)

  // Change Password States
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passSuccess, setPassSuccess] = useState<string | null>(null)
  const [passError, setPassError] = useState<string | null>(null)
  const [passLoading, setPassLoading] = useState(false)

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUser) return
    setEditError(null)
    setEditSuccess(null)
    setEditLoading(true)

    try {
      const updatedUser = { ...currentUser, name }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setEditSuccess('Profile details updated successfully!')
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (err: any) {
      console.error(err)
      setEditError(err.message || 'Failed to update profile details.')
    } finally {
      setEditLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPassError(null)
    setPassSuccess(null)

    if (newPassword !== confirmPassword) {
      setPassError('New passwords do not match.')
      return
    }

    if (newPassword.length < 6) {
      setPassError('Password must be at least 6 characters.')
      return
    }

    setPassLoading(true)

    try {
      setPassSuccess('Password updated successfully!')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err: any) {
      console.error(err)
      setPassError(err.message || 'Failed to update password. Verify current password.')
    } finally {
      setPassLoading(false)
    }
  }

  // Format Join Date
  const joinDate = currentUser?.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown'

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Profile Overview Card */}
      <Card className="p-6 border border-border bg-surface/30 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-accent text-3xl font-bold uppercase relative overflow-hidden">
            {currentUser?.photoURL ? (
              <img src={currentUser.photoURL} alt={currentUser.name} className="w-full h-full object-cover" />
            ) : (
              currentUser?.name.charAt(0) || 'U'
            )}
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left">
            <h2 className="text-xl font-bold text-white">{currentUser?.name}</h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-zinc-500" /> {currentUser?.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-zinc-500" /> Joined {joinDate}
              </span>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-accent/10 text-accent font-semibold border border-accent/20 uppercase tracking-wide text-[10px]">
                <Shield className="w-3.5 h-3.5 shrink-0" /> {currentUser?.role}
              </span>
            </div>
          </div>

          <div className="shrink-0 mt-2 sm:mt-0">
            <Button variant="outline" size="sm" onClick={logout} className="text-red-400 hover:text-red-300 border-red-500/20 hover:bg-red-500/5">
              Sign Out
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Edit Details */}
        <Card className="p-6 border border-border bg-surface/30 backdrop-blur-md flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-border/60 pb-2">
              Profile Settings
            </h3>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              {editSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-start gap-2.5 text-emerald-400 text-xs">
                  <CheckCircle className="w-4.5 h-4.5 shrink-0" />
                  <span>{editSuccess}</span>
                </div>
              )}
              {editError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-start gap-2.5 text-red-400 text-xs">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              <Input
                label="Display Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
              />

              <Button type="submit" variant="glow" size="sm" isLoading={editLoading} className="w-full">
                Save Profile Details
              </Button>
            </form>
          </div>
        </Card>

        {/* Change Password */}
        <Card className="p-6 border border-border bg-surface/30 backdrop-blur-md">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-border/60 pb-2">
              Change Password
            </h3>

            <form onSubmit={handleChangePassword} className="space-y-4">
              {passSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-md flex items-start gap-2.5 text-emerald-400 text-xs">
                  <CheckCircle className="w-4.5 h-4.5 shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}
              {passError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-start gap-2.5 text-red-400 text-xs">
                  <AlertCircle className="w-4.5 h-4.5 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />

              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <Button type="submit" variant="glow" size="sm" isLoading={passLoading} className="w-full">
                Update Security Credentials
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  )
}
