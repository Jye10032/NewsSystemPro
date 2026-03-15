const AUTH_TOKEN_KEY = 'news_system_auth_token'

export function getAuthToken(): string {
  try {
    return String(localStorage.getItem(AUTH_TOKEN_KEY) || '')
  } catch (_error) {
    return ''
  }
}

export function setAuthToken(token: string): void {
  try {
    if (!token) {
      localStorage.removeItem(AUTH_TOKEN_KEY)
      return
    }
    localStorage.setItem(AUTH_TOKEN_KEY, token)
  } catch (_error) {
    // Ignore storage failures and rely on cookie auth fallback.
  }
}

export function clearAuthToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY)
  } catch (_error) {
    // Ignore storage failures.
  }
}
