# 画符模拟器 ☯

> **用摄像头手势画符，感受道法自然的魅力！**

![画符模拟器](https://img.shields.io/badge/手势追踪-MediaPipe-blue)
![画符模拟器](https://img.shields.io/badge/技术栈-Canvas%20API-orange)
![画符模拟器](https://img.shields.io/badge/平台-Web-ff69b4)

## ✨ 功能特点

- 🖐️ **手势识别**：MediaPipe Hands 实时追踪手部动作
- 📜 **6种符咒**：雷符、火符、水符、平安符、辟邪符、聚财符
- 🎯 **相似度检测**：像素级对比算法，检测符咒匹配度
- 🔥 **燃烧特效**：激活符咒后符纸燃烧消失，带粒子动画
- ✨ **专属特效**：每种符咒有独特的激活爆发效果
- 🤏 **手势召唤**：捏合食指拇指即可召唤符纸

## 🚀 快速开始

### 方法一：GitHub Pages（推荐）

1. **克隆仓库**
   ```bash
   git clone https://github.com/FengLuLuL/talisman-simulator.git
   cd talisman-simulator
   ```

2. **直接打开**
   - 直接用浏览器打开 `talisman-simulator.html`
   - 或者使用本地服务器（见方法二）

### 方法二：本地服务器

**重要说明**：由于浏览器的安全策略，摄像头功能必须在 **HTTPS** 或 **localhost** 下才能正常工作。

```bash
# 使用 Python
python -m http.server 8000

# 或使用 Node.js
npx serve . -p 8000
```

然后在浏览器访问 `http://localhost:8000/talisman-simulator.html`

## 📦 项目结构

```
talisman-simulator/
├── talisman-simulator.html    # 主页面
├── talisman-data.js           # 符咒数据库
├── talisman-core.js           # 核心功能
├── talisman-paper.js          # 符纸系统
├── talisman-sim.js            # 相似度检测
├── talisman-fx.js             # 粒子特效
└── README.md                  # 本文件
```

## 🎮 使用说明

### 操作流程

1. **选择符咒**：点击左侧面板选择要画的符咒
2. **召唤符纸**：
   - 点击右侧「✦ 召唤符纸」按钮，或
   - 捏合食指和拇指（🤏）
3. **绘画**：伸出食指（✏️）在符纸上照着虚线画符
4. **激活**：画完后张开五指（🖐️）激活符咒

### 激活条件

- 符咒匹配度需要达到 **45% 以上**
- 五指张开保持2帧（约0.1秒）

## 🎯 手势控制

| 手势 | 动作 | 说明 |
|------|------|------|
| ✏️ 食指伸出 | 绘画 | 伸出食指，其他手指收起 |
| ✌️ 剪刀手 | 抬笔 | 食指和中指伸出 |
| ✊ 握拳 | 暂停 | 所有手指收起 |
| 🖐️ 五指张开 | 激活符咒 | 所有手指伸出 |
| 🤏 捏合手指 | 召唤符纸 | 食指和拇指指尖捏合（保持0.3秒） |

## 🔧 技术栈

- **MediaPipe Hands**：手部追踪
- **Canvas API**：图形绘制
- **OffscreenCanvas**：像素对比算法
- **Web Audio API**：音效合成

## ⚠️ 常见问题

### Q: 为什么摄像头无法启动？
A: 浏览器要求摄像头必须在 HTTPS 或 localhost 下才能访问。如果使用本地文件（file://）或 HTTP，会提示权限错误。

**解决方案**：
1. 使用 GitHub Pages（HTTPS）
2. 使用本地服务器（localhost）

### Q: GitHub Pages 上无法使用摄像头？
A: GitHub Pages 默认使用 HTTPS，应该可以直接使用。如果遇到问题，请确保：
- 浏览器允许摄像头权限
- 没有使用插件阻止摄像头访问

### Q: 如何在其他平台上部署？
A: 支持任何静态文件托管服务：
- Vercel
- Netlify
- Cloudflare Pages
- 自己的服务器（需要 HTTPS）

## 📝 开发说明

### 本地开发

```bash
# 启动本地服务器
npx serve . -p 7788

# 访问
# http://localhost:7788/talisman-simulator.html
```

### 修改符咒路径

在 `talisman-data.js` 中的 `TALISMANS` 数组添加或修改符咒：

```javascript
{
  id:'custom',
  name:'自定义符',
  desc:'符咒描述',
  color:'#e8c97d',
  paths:[
    {type:'move', x:0.5, y:0.1},
    {type:'line', x:0.5, y:0.9},
    // 更多路径...
  ]
}
```

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 🙏 致谢

- [MediaPipe](https://github.com/google/mediapipe) - 手部追踪
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API) - 图形绘制

---

**祝你画符愉快！** ☯
