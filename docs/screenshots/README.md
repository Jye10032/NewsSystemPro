# 项目截图说明

## 📸 如何添加项目截图

为了让 README 更加专业和直观，建议添加以下页面的截图：

### 需要截图的页面

1. **登录页面** (`/login`)
   - 文件名：`login.png`
   - 展示登录界面和表单

2. **管理后台首页** (`/`)
   - 文件名：`home.png`
   - 展示数据统计图表和仪表盘

3. **新闻编辑页面** (`/news-manage/add`)
   - 文件名：`news-edit.png`
   - 展示富文本编辑器和新闻表单

4. **数据统计** (首页的图表部分)
   - 文件名：`statistics.png`
   - 展示 ECharts 图表

5. **前台新闻展示** (`/news`)
   - 文件名：`news-list.png`
   - 展示新闻列表页面

6. **新闻详情页** (`/detail/:id`)
   - 文件名：`news-detail.png`
   - 展示单个新闻的详细内容

### 截图步骤

1. 运行项目：`npm start`
2. 访问对应页面
3. 使用截图工具（推荐使用全屏截图）
4. 保存截图到 `docs/screenshots/` 目录
5. 在 README.md 中取消注释对应的图片引用

### 截图要求

- 分辨率：建议 1920x1080 或更高
- 格式：PNG 或 JPG
- 文件大小：建议压缩到 500KB 以内
- 内容：确保截图中包含有代表性的数据

### 图片压缩工具推荐

- [TinyPNG](https://tinypng.com/) - 在线压缩
- [ImageOptim](https://imageoptim.com/) - Mac 桌面工具
- [Squoosh](https://squoosh.app/) - Google 的在线图片压缩工具

### 完成后

将 README.md 中的注释取消，例如：

```markdown
### 登录页面
![登录页面](./docs/screenshots/login.png)

### 管理后台首页
![管理后台首页](./docs/screenshots/home.png)
```

## 📝 替代方案

如果不想添加截图到仓库（减小仓库大小），可以：

1. 使用图床服务（如 Imgur、SM.MS）
2. 将截图上传到 GitHub Issues
3. 使用 GitHub 的 Wiki 功能存储图片

## 🎥 进阶：添加 GIF 动图

如果想展示交互效果，可以录制 GIF 动图：

推荐工具：
- [ScreenToGif](https://www.screentogif.com/) - Windows
- [Kap](https://getkap.co/) - Mac
- [LICEcap](https://www.cockos.com/licecap/) - 跨平台

示例：
```markdown
### 新闻发布流程演示
![新闻发布流程](./docs/screenshots/publish-flow.gif)
```
