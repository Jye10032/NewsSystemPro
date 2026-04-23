import { describe, expect, it } from 'vitest'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const {
  createCorsOptions,
  isAllowedOrigin,
  normalizeOrigin
} = require('../../../server/utils/cors.cjs')

describe('CORS utils', () => {
  it('normalizes trailing slashes before matching origins', () => {
    expect(normalizeOrigin('https://news.misaka.design/')).toBe('https://news.misaka.design')
    expect(isAllowedOrigin('https://news.misaka.design/')).toBe(true)
  })

  it('allows known production and development origins', () => {
    expect(isAllowedOrigin('https://news.misaka.design')).toBe(true)
    expect(isAllowedOrigin('https://jye10032.github.io')).toBe(true)
    expect(isAllowedOrigin('http://localhost:5173')).toBe(true)
    expect(isAllowedOrigin('http://127.0.0.1:3000')).toBe(true)
  })

  it('rejects unknown origins without converting them into server errors', async () => {
    const corsOptions = createCorsOptions()

    const decision = await new Promise((resolve, reject) => {
      corsOptions.origin('https://evil.example.com', (error, value) => {
        if (error) {
          reject(error)
          return
        }

        resolve(value)
      })
    })

    expect(decision).toBe(false)
  })

  it('reflects allowed origins for credentialed requests', async () => {
    const corsOptions = createCorsOptions()

    const decision = await new Promise((resolve, reject) => {
      corsOptions.origin('https://news.misaka.design', (error, value) => {
        if (error) {
          reject(error)
          return
        }

        resolve(value)
      })
    })

    expect(decision).toBe('https://news.misaka.design')
  })
})
