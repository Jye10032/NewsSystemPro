const fs = require('fs')
const path = require('path')

const DB_PATH = path.join(__dirname, '../../db/db.json')
const NEWS_PATH = path.join(__dirname, '../../db/news.json')

function readDB() {
  const data = fs.readFileSync(DB_PATH, 'utf-8')
  return JSON.parse(data)
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
}

function readNews() {
  const data = fs.readFileSync(NEWS_PATH, 'utf-8')
  return JSON.parse(data)
}

function writeNews(data) {
  fs.writeFileSync(NEWS_PATH, JSON.stringify(data, null, 2))
}

module.exports = { readDB, writeDB, readNews, writeNews }
