import type { User, Role } from '../types'

class AuthService {
  logout(): void {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('authProvider')
    // Reset app state if needed or redirect
    window.location.reload()
  }

  setToken(token: string): void {
    localStorage.setItem('token', token)
  }

  getToken(): string | null {
    return localStorage.getItem('token')
  }

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user))
  }

  getUser(): User | null {
    const userStr = localStorage.getItem('user')
    if (!userStr) return null
    try {
      return JSON.parse(userStr) as User
    } catch {
      return null
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken()
  }

  hasRole(requiredRole: Role): boolean {
    const user = this.getUser()
    if (!user) return false
    
    // Simple role hierarchy
    const roles: Record<Role, number> = {
      'User': 1,
      'Creator': 2,
      'Admin': 3
    }
    
    return roles[user.role] >= roles[requiredRole]
  }
}

export const authService = new AuthService()
