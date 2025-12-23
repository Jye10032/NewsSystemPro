/**
 * 密码哈希迁移脚本
 * 将 db.json 中的明文密码转换为 bcrypt 哈希
 *
 * 运行: node server/scripts/hash-passwords.cjs
 */

const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

const DB_PATH = path.join(__dirname, '../../db/db.json')
const COST = 12  // bcrypt cost factor

function hashPasswords() {
  console.log('读取数据库...')
  const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))

  let updated = 0

  data.users = data.users.map(user => {
    // 跳过已经哈希的密码（以 $2 开头）
    if (user.password.startsWith('$2')) {
      console.log(`跳过 ${user.username}（已哈希）`)
      return user
    }

    console.log(`哈希 ${user.username} 的密码...`)
    const hashedPassword = bcrypt.hashSync(user.password, COST)
    updated++

    return {
      ...user,
      password: hashedPassword
    }
  })

  // 备份原文件
  const backupPath = DB_PATH.replace('.json', `.backup-${Date.now()}.json`)
  fs.copyFileSync(DB_PATH, backupPath)
  console.log(`备份已创建: ${backupPath}`)

  // 写入新数据
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2))
  console.log(`完成！已更新 ${updated} 个用户的密码`)
}

hashPasswords()
