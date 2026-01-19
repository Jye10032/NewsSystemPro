const { verifyToken } = require('../utils/jwt.cjs')

// JWT 验证中间件（从 Cookie 读取）
function authMiddleware(req, res, next) {
  const token = req.cookies?.jwt

  if (!token) {
    return res.status(401).json({ message: '未提供认证令牌' })
  }

  const decoded = verifyToken(token)

  if (!decoded) {
    return res.status(401).json({ message: '令牌无效或已过期' })
  }

  req.user = decoded
  next()
}

// 可选认证（不强制要求 token）
function optionalAuth(req, res, next) {
  const token = req.cookies?.jwt

  if (token) {
    const decoded = verifyToken(token)
    if (decoded) {
      req.user = decoded
    }
  }

  next()
}

module.exports = { authMiddleware, optionalAuth }
