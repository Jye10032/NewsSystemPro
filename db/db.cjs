const fs = require('fs');
const path = require('path');
//json-server 需要 CommonJS 格式

module.exports = function () {
  // 读取 db.json（不包含 news）
  const dbPath = path.join(__dirname, 'db.json');
  const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

  // 读取 news.json
  const newsPath = path.join(__dirname, 'news.json');
  const newsData = JSON.parse(fs.readFileSync(newsPath, 'utf-8'));

  // 合并并返回数据
  return {
    ...dbData,
    news: newsData
  };
};
