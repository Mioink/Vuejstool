# 基于 Vue.js 的在线多功能工具平台设计与实现

这是一个前端项目，采用 Vue.js 组件化方式实现，包含 5 个独立工具模块：

- JSON 格式化工具
- Base64 编码/解码
- Markdown 预览
- 随机密码生成器
- 本地记事本

## 项目特点

- 左侧工具导航，右侧内容区域
- 顶部深色模式切换
- 工具收藏功能
- 最近使用记录
- 一键复制
- 本地记事本自动保存

## 项目结构

```text
tool-platform/
├── index.html
├── package.json
├── README.md
└── src/
    ├── components/
    │   ├── JsonTool.vue
    │   ├── Base64Tool.vue
    │   ├── MarkdownTool.vue
    │   ├── PasswordTool.vue
    │   └── NoteTool.vue
    ├── App.vue
    └── main.js
```

## 运行方式

这个项目使用浏览器直接加载 Vue 单文件组件，不依赖后端，也不强制要求本地安装 npm。

如果本机有 Python，可以在项目根目录运行：

```bash
python -m http.server 4173
```

然后访问：

```text
http://127.0.0.1:4173
```
## 技术说明

- 前端框架：Vue.js
- UI 风格：Naive UI
- Markdown 解析：marked
- 数据存储：LocalStorage
