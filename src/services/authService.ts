import { apiClient } from '../api/client'
import type { User, Role } from '../types'

interface AuthResponse {
  token: string
  type: string
  user: User
}

class AuthService {
  async login(credentials: any): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login', credentials)
    this.setToken(response.token)
    this.setUser(response.user)
    return response
  }

  async register(data: any): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    this.setToken(response.token)
    this.setUser(response.user)
    return response
  }

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
