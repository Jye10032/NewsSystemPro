const jwt = require('jsonwebtoken')

// 生产环境应使用环境变量
const ACCESS_SECRET = process.env.JWT_SECRET || 'news-system-pro-secret-key'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || `${ACCESS_SECRET}-refresh`
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || '15m'
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d'

function generateAccessToken(payload) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES_IN })
}

function generateRefreshToken(payload) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES_IN })
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET)
  } catch (err) {
    return null
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_SECRET)
  } catch (err) {
    return null
  }
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  generateToken: generateAccessToken,
  verifyToken: verifyAccessToken,
  SECRET: ACCESS_SECRET
}
