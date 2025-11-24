// Vercel Serverless API 入口
const jsonServer = require('json-server');

// 创建 server
const app = jsonServer.create();

// 设置默认中间件（logger, static, cors and no-cache）
const middlewares = jsonServer.defaults();

// 设置路由 - 使用内联数据库
const router = jsonServer.router({
  users: require('../db/db.json').users,
  roles: require('../db/db.json').roles,
  rights: require('../db/db.json').rights,
  children: require('../db/db.json').children,
  news: require('../db/news.json')
});

app.use(middlewares);

// 添加自定义 CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});

// 使用路由
app.use(router);

// 导出为 Vercel Serverless 函数
module.exports = app;
