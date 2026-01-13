import { getEnv } from '../services/env'

describe('getEnv', () => {
  const originalEnv = (globalThis as any).__VITE_ENV__

  afterEach(() => {
    ;(globalThis as any).__VITE_ENV__ = originalEnv
  })

  it('returns values from the global env when present', () => {
    ;(globalThis as any).__VITE_ENV__ = {
      VITE_API_BASE_URL: 'http://localhost:3000',
      VITE_PUBLIC_KEY: 'pub_test',
    }

    expect(getEnv()).toEqual({
      VITE_API_BASE_URL: 'http://localhost:3000',
      VITE_PUBLIC_KEY: 'pub_test',
    })
  })

  it('falls back to process.env when global is missing', () => {
    ;(globalThis as any).__VITE_ENV__ = undefined
    process.env.VITE_API_BASE_URL = 'http://env.local'
    process.env.VITE_PUBLIC_KEY = 'pub_env'

    expect(getEnv()).toEqual({
      VITE_API_BASE_URL: 'http://env.local',
      VITE_PUBLIC_KEY: 'pub_env',
    })
  })
})
