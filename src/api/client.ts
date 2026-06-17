export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? 'http://127.0.0.1:8080/api' : '')

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean>
}



class ApiClient {
  private async request<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...customConfig } = options

    // Bypassed mock database to route directly to Python FastAPI backend
    
    const token = localStorage.getItem('token')
    const headers: Record<string, string> = {
      ...customConfig.headers as Record<string, string>,
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    if (!(customConfig.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }

    let url = `${API_BASE_URL}${endpoint}`
    
    if (params) {
      const searchParams = new URLSearchParams()
      Object.entries(params).forEach(([key, value]) => {
        searchParams.append(key, String(value))
      })
      url += `?${searchParams.toString()}`
    }

    const config: RequestInit = {
      ...customConfig,
      headers,
    }

    try {
      const response = await fetch(url, config)
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }
      
      if (response.status === 204) {
        return {} as T
      }
      
      return await response.json()
    } catch (error) {
      console.error(`Fetch request failed [${url}]:`, error)
      throw error
    }
  }

  get<T>(endpoint: string, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'GET' })
  }

  post<T>(endpoint: string, body: any, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) })
  }

  postFormData<T>(endpoint: string, formData: FormData, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body: formData })
  }

  put<T>(endpoint: string, body: any, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) })
  }

  delete<T>(endpoint: string, options?: FetchOptions) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const apiClient = new ApiClient()
