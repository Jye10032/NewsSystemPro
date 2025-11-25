#!/usr/bin/env node

/**
 * 本地开发专用 JSON Server
 * 仅用于开发环境，Vercel 部署使用 api/index.cjs
 */

const jsonServer = require('json-server');
const path = require('path');
const fs = require('fs');

// 创建 server
const server = jsonServer.create();

// 设置默认中间件 (logger, static, cors, no-cache)
const middlewares = jsonServer.defaults();

// 读取数据库文件
const dbPath = path.join(__dirname, 'db/db.json');
const newsPath = path.join(__dirname, 'db/news.json');

const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf-8'));

// 合并数据
const fullData = {
  ...dbData,
  news: newsData
};

// 创建路由
const router = jsonServer.router(fullData);

// 使用中间件
server.use(middlewares);

// 添加自定义 CORS（允许跨域）
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  res.header('Access-Control-Allow-Methods', '*');
  next();
});

// 使用路由
server.use(router);

// 启动服务器
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log('\n=== 本地开发服务器 ===');
  console.log(`JSON Server 运行在: http://localhost:${PORT}`);
  console.log('\n可用的资源:');
  console.log(`  - http://localhost:${PORT}/users`);
  console.log(`  - http://localhost:${PORT}/roles`);
  console.log(`  - http://localhost:${PORT}/rights`);
  console.log(`  - http://localhost:${PORT}/children`);
  console.log(`  - http://localhost:${PORT}/news`);
  console.log(`  - http://localhost:${PORT}/categories`);
  console.log(`  - http://localhost:${PORT}/regions`);
  console.log('\n按 Ctrl+C 停止服务器\n');
});
