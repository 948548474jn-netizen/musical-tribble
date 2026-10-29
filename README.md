# 江南 · 交互式个人作品集

React + Vite + Three.js + GSAP。首页是居中的复古绿档案柜：点击抽屉展开并转为俯视，点击物品浏览作品、个人资料、技能及创作实验。点击哑光台灯切换日夜主题，便签通过邮箱联系。

## 在 Mac 上打开预览

需要 Node.js 22.12+ 或 24 LTS（本项目已使用 Node.js 24 验证）。

1. 在 GitHub 本分支页面点击 **Code → Download ZIP**。
2. 解压下载的 ZIP。
3. 打开终端，输入 `cd `（注意后面有空格），将解压后的整个文件夹拖进终端，按回车。
4. 确认终端现在位于包含 `package.json` 的文件夹，再依次执行：

```bash
npm ci
npm run dev
```

5. 在浏览器打开终端 `Local` 一行显示的地址，通常是 `http://localhost:5173`。保持终端窗口开启；按 Ctrl+C 停止服务。

如果出现 `Missing script: dev`，说明当前目录不是项目目录；重新执行第 3 步。终端提示符里的 `~` 表示用户主目录。

## 体验交互

- 点击抽屉把手或“打开我的抽屉”，再次点击可收起。
- 展开后点击文件或对应标签，跳转到作品、个人档案、技能、创作实验。
- 点击台灯：开灯为暗夜，关灯为白天；主题会在本机保存。
- 点击便签使用本机邮件应用联系。此操作需要配置默认邮件应用。
- 支持键盘导航和系统“减少动态效果”设置；无 WebGL 时保留文字目录。

## 构建

```bash
npm run build
npm run preview
```

## 主要文件

- `src/CabinetScene.jsx`：3D 模型、材质、灯光、抽屉与镜头动画。
- `src/InteractiveHero.jsx`：首页交互入口及创作实验预览。
- `src/theme.js`、`src/theme.css`：日夜状态及全站主题。
- `src/main.jsx`：作品、关于、技能与联系内容。
- `src/cabinet.css`、`src/framework.css`、`src/styles.css`：布局和视觉样式。
- `public/studies/`：本地概念封面；`public/profile.png`：简历概览。

## 当前内容状态

项目标题、经历和邮箱沿用现有内容。项目封面与图形练习为概念示意，完整案例内容仍待整理。模型为实时程序化建模版本。此分支用于下载和本地预览，不会自动部署网站。
