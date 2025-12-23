const jwt = require('jsonwebtoken')

// 生产环境应使用环境变量
const SECRET = process.env.JWT_SECRET || 'news-system-pro-secret-key'
const EXPIRES_IN = '7d'

function generateToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN })
}

function verifyToken(token) {
  try {
    return jwt.verify(token, SECRET)
  } catch (err) {
    return null
  }
}

module.exports = { generateToken, verifyToken, SECRET }
