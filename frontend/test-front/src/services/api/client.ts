// Base URL for the backend API.
const API_BASE_URL = 'http://13.221.42.133:3000'

// Small fetch helper that returns JSON or throws an error.
export async function client<T = unknown>(
  path: string,
  options: RequestInit = {},
) {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: 'application/json',
      ...options.headers,
    },
  })

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || `Request failed with status ${response.status}`)
  }

  return response.json() as Promise<T>
}
