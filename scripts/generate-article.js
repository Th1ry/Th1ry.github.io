/**
 * 文章生成器
 * 使用免费 AI API 生成中文介绍文章
 */

const fs = require('fs');

// 使用免费的中文 AI API (Claude 或其他免费接口)
const FREE_AI_API = 'https://api.deepseek.com/v1/chat/completions';

// 如果没有 API Key，使用模板生成（完全免费）
function generateArticleFromTemplate(repo) {
  const stars = repo.stargazers_count;
  const starsStr = stars > 1000 ? `${(stars / 1000).toFixed(1)}k` : stars;
  const forks = repo.forks_count;
  const lang = repo.language || '多语言';
  const desc = repo.description || '暂无描述';
  const owner = repo.owner.login;
  const name = repo.name;
  const url = repo.html_url;

  // 中文分类
  const categoryMap = {
    'JavaScript': '前端开发',
    'TypeScript': '前端开发',
    'Python': 'Python 开发',
    'Go': 'Go 语言',
    'Rust': 'Rust 开发',
    'Java': 'Java 开发',
    'Vue': '前端框架',
    'React': '前端框架',
    'C++': 'C++ 开发',
    'C': 'C 语言',
    'Shell': '运维脚本',
    'CSS': '样式开发',
  };
  const category = categoryMap[lang] || '开源项目';

  const today = new Date().toISOString().split('T')[0];

  return `---
title: "${name} - ${desc.slice(0, 30)}"
date: ${today}
tags: [${category}, 开源, ${lang}]
description: "${desc}"
author: Th1ry
---

# ${name}

## 📖 项目介绍

${desc}

这是一个在 GitHub 上获得 **${starsStr} ⭐** 的热门开源项目，由 **${owner}** 开发维护。

## 🔥 为什么值得关注？

### 1. 社区认可度高
- ⭐ Stars: ${starsStr}
- 🍴 Forks: ${forks}
- 🐛 Issues: ${repo.open_issues_count}

### 2. 技术栈
- 主力语言: **${lang}**
- 最新更新: ${new Date(repo.pushed_at).toLocaleDateString('zh-CN')}
- License: ${repo.license?.spdx_id || '无'}

### 3. 适用场景

\`\`\`${lang.toLowerCase()}
# 快速开始
# 克隆项目
git clone ${url}

# 查看 README 获取更多信息
\`\`\`

## 🚀 如何使用

1. 访问项目主页: [${name}](${url})
2. 阅读 README 文档
3. 按照安装步骤配置
4. 开始使用！

## 💡 替代方案

如果你对 ${name} 感兴趣，也可以看看这些相关项目：

- [awesome-${name}](https://github.com/topics/${name.toLowerCase()})
- [best-${lang}-projects](https://github.com/topics/${lang.toLowerCase()})

---

**相关标签:** ${category} | ${lang} | 开源 | GitHub Trending

**原文地址:** [${name} on GitHub](${url})
`;
}

// AI 生成（需要 API Key）
async function generateWithAI(repo, apiKey) {
  const prompt = `请为以下 GitHub 项目写一篇中文介绍博客文章：

项目名: ${repo.name}
描述: ${repo.description}
语言: ${repo.language}
Stars: ${repo.stargazers_count}
作者: ${repo.owner.login}
链接: ${repo.html_url}

要求：
1. 500-800字
2. 包含项目介绍、特点、使用场景
3. 适合中文读者
4. Markdown 格式
5. 包含代码示例

请直接输出文章内容，不需要标题。`;

  try {
    const response = await fetch(FREE_AI_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1500
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || generateArticleFromTemplate(repo);
  } catch (e) {
    console.log('AI 生成失败，使用模板生成');
    return generateArticleFromTemplate(repo);
  }
}

module.exports = { generateArticleFromTemplate, generateWithAI };
