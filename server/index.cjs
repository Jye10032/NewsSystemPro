const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')

const authRoutes = require('./routes/auth.cjs')
const usersRoutes = require('./routes/users.cjs')
const dataRoutes = require('./routes/data.cjs')

const app = express()
const PORT = 8000

// 中间件
app.use(cors())
app.use(express.json())

// 路由
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/', dataRoutes)  // 兼容原有 json-server 路由

app.listen(PORT, () => {
  console.log(`Express server running on http://localhost:${PORT}`)
})
