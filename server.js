const jsonServer = require('json-server')
const fs = require('fs')
const path = require('path')

const server = jsonServer.create()

// 读取并合并数据库文件
function getDatabase() {
  const dbPath = path.join(__dirname, 'db', 'db.json')
  const newsPath = path.join(__dirname, 'db', 'news.json')

  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))
  const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf-8'))

  return {
    ...dbData,
    news: newsData
  }
}

const router = jsonServer.router(getDatabase())
const middlewares = jsonServer.defaults({
  static: './public'
})

// 设置 CORS
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', '*')
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH')
  next()
})

server.use(middlewares)
server.use(router)

const PORT = process.env.PORT || 8000

server.listen(PORT, () => {
  console.log(`JSON Server is running on port ${PORT}`)
})

module.exports = server
