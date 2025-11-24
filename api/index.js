// Vercel Serverless 函数入口
// 使用 CommonJS 格式，兼容 Vercel 部署

const jsonServer = require('json-server');
const fs = require('fs');
const path = require('path');

// 创建 json-server 应用
const server = jsonServer.create();

// 读取并合并数据库文件
function getDatabase() {
  const dbPath = path.join(__dirname, '..', 'db', 'db.json');
  const newsPath = path.join(__dirname, '..', 'db', 'news.json');

  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
  const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf-8'));

  return {
    ...dbData,
    news: newsData
  };
}

// 配置路由
const router = jsonServer.router(getDatabase());
const middlewares = jsonServer.defaults({
  noCors: false
});

// CORS 配置
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');

  // 处理 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

server.use(middlewares);
server.use(router);

// 导出为 Vercel Serverless 函数
// Vercel 需要一个函数，而不是 Express 应用实例
module.exports = (req, res) => {
  // 让 Express 应用处理请求
  server(req, res);
};
