# GitHub Trending 自动博客

> 自动抓取 GitHub 热门项目，生成中文介绍文章

## 功能

- 🤖 自动抓取 GitHub Trending 项目
- 📝 使用免费 AI 生成中文介绍（可选）
- 🚀 自动部署到 GitHub Pages
- 🌐 绑定域名 th1ry.uk
- 💰 接入 Google AdSense 自动变现

## 快速部署（Windows 一键脚本）

项目根目录提供了 `deploy.ps1`，右键选择「使用 PowerShell 运行」即可自动完成：

1. 检查并安装 GitHub CLI
2. 登录 GitHub
3. 创建 `Th1ry.github.io` 仓库
4. 提交并推送代码
5. 开启 GitHub Pages（Source: GitHub Actions）
6. 绑定自定义域名 `th1ry.uk`

脚本运行完后，只需手动去域名服务商添加 DNS 记录即可。

### 手动步骤

#### 1. 创建 GitHub 仓库

访问 https://github.com/new，仓库名填 `Th1ry.github.io`，保持 Public。

#### 2. 修改配置

编辑 `_config.yml`：
```yaml
# 修改为你自己的信息
title: 你的博客名
author: 你的用户名
url: https://你的域名.com
```

#### 3. 设置 GitHub Pages

1. 进入仓库 Settings
2. Pages → Source → GitHub Actions
3. 等待自动部署

#### 4. 绑定域名

在仓库 Settings → Pages → Custom domain 输入 `th1ry.uk`

#### 5. 设置 DNS

在你的域名服务商添加 DNS 记录：
- 类型: CNAME，主机: `www`，目标: `Th1ry.github.io`
- 类型: CNAME，主机: `@`，目标: `Th1ry.github.io`

> 如果 `@` 不支持 CNAME，改用 A 记录指向：
> `185.199.108.153`、`185.199.109.153`、`185.199.110.153`、`185.199.111.153`

## 本地运行

```bash
# 安装依赖
npm install

# 本地预览
npx hexo server

# 本地生成文章
npm run start
```

## 自动化

GitHub Actions 会自动：
- 每天早上 9 点抓取新项目
- 生成中文介绍文章
- 部署到 GitHub Pages

## 变现

博客流量起来后（一般需要 1-3 个月）：

1. 申请 Google AdSense
2. 在 `source/_partial/head.ejs` 添加广告代码
3. 广告费自动到账

## 目录结构

```
Th1ryBlog/
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions 配置
├── scripts/
│   ├── fetch-trending.js   # 抓取 GitHub 热门
│   ├── generate-article.js # 生成文章
│   └── create-post.js      # 创建文章
├── source/
│   └── _posts/             # 博客文章
├── _config.yml             # Hexo 配置
└── package.json            # 依赖
```

## 许可证

MIT
