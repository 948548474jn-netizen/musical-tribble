# 江南 · Personal Portfolio

一个基于 React + Vite 的暗色系个人作品集基础版本。整体采用编辑式排版、荧光黄绿强调色、动态视频 Hero、项目大图与独立设计细节。

## 本地运行

需要安装 Node.js 18 或更高版本。

```bash
npm install
npm run dev
```

Vite 会输出本地预览地址，通常为 `http://localhost:5173`。

## 构建生产版本

```bash
npm run build
npm run preview
```

## 项目结构

```text
jiang-portfolio/
├── public/
│   └── profile.png       # 来自你上传的简历图片
├── src/
│   ├── main.jsx          # 页面结构与内容
│   └── styles.css        # 全部样式、响应式规则
├── index.html
└── package.json
```

## 下一步建议

- 将精选项目中的示例图片替换为真实项目图，并补充每个项目的设计背景、角色与成果。
- Hero 使用远程视频作为动态背景；如果视频源不可用，会显示 poster 图片。
- 邮箱已使用简历中的地址。社交平台链接目前为示例入口，请替换成自己的主页。
- 当前页面适配桌面端，并提供移动端基础响应式布局。
