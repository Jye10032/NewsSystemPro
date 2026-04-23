const DEFAULT_ORIGINS = [
  'https://jye10032.github.io',
  'https://news.misaka.design',
  'http://localhost:5173',
  'http://localhost:3000'
]

const GITHUB_PAGES_RE = /^https:\/\/[a-z0-9-]+\.github\.io$/i
const MISAKA_DESIGN_RE = /^https:\/\/(?:[a-z0-9-]+\.)*misaka\.design$/i
const LOCALHOST_RE = /^http:\/\/(?:localhost|127(?:\.\d{1,3}){3})(?::\d+)?$/i

function normalizeOrigin(origin) {
  if (typeof origin !== 'string') return ''

  const trimmedOrigin = origin.trim()
  if (!trimmedOrigin) return ''

  return trimmedOrigin.replace(/\/+$/, '')
}

function buildAllowedOrigins() {
  const extraOrigins = String(process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(normalizeOrigin)
    .filter(Boolean)

  return new Set([...DEFAULT_ORIGINS.map(normalizeOrigin), ...extraOrigins])
}

function isAllowedOrigin(origin, allowedOrigins = buildAllowedOrigins()) {
  const normalizedOrigin = normalizeOrigin(origin)
  if (!normalizedOrigin) return true

  if (allowedOrigins.has(normalizedOrigin)) return true
  if (GITHUB_PAGES_RE.test(normalizedOrigin)) return true
  if (MISAKA_DESIGN_RE.test(normalizedOrigin)) return true
  if (LOCALHOST_RE.test(normalizedOrigin)) return true

  return false
}

function createCorsOptions() {
  const allowedOrigins = buildAllowedOrigins()

  return {
    origin(origin, callback) {
      const normalizedOrigin = normalizeOrigin(origin)
      if (isAllowedOrigin(normalizedOrigin, allowedOrigins)) {
        callback(null, normalizedOrigin || true)
        return
      }

      // Let the browser enforce the block instead of turning a CORS miss into a 500.
      callback(null, false)
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    optionsSuccessStatus: 204
  }
}

module.exports = {
  DEFAULT_ORIGINS,
  buildAllowedOrigins,
  createCorsOptions,
  isAllowedOrigin,
  normalizeOrigin
}
