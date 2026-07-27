/**
 * 主脚本 - 自动抓取并发布文章
 */

const fs = require('fs');
const path = require('path');
const { fetchGitHubTrending, fetchTrendingByLanguage } = require('./fetch-trending');
const { generateArticleFromTemplate } = require('./generate-article');

const POSTS_DIR = 'source/_posts';

// 确保目录存在
if (!fs.existsSync(POSTS_DIR)) {
  fs.mkdirSync(POSTS_DIR, { recursive: true });
}

// 读取已发布的项目（避免重复）
function getPublishedRepos() {
  const file = 'published-repos.json';
  if (fs.existsSync(file)) {
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
  }
  return [];
}

// 保存已发布项目
function savePublishedRepo(repo) {
  const repos = getPublishedRepos();
  repos.push({
    name: repo.name,
    publishedAt: new Date().toISOString()
  });
  fs.writeFileSync('published-repos.json', JSON.stringify(repos, null, 2));
}

// 生成文章文件名
function getPostFilename(repo) {
  const date = new Date().toISOString().split('T')[0];
  const slug = repo.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  return `${date}-${slug}.md`;
}

// 创建文章
function createPost(repo) {
  const content = generateArticleFromTemplate(repo);
  const filename = getPostFilename(repo);
  const filepath = path.join(POSTS_DIR, filename);

  fs.writeFileSync(filepath, content);
  console.log(`✅ 创建文章: ${filename}`);
  return filename;
}

async function main() {
  console.log('🚀 开始抓取 GitHub Trending...\n');

  try {
    // 获取热门项目
    const repos = await fetchGitHubTrending();
    console.log(`📊 获取到 ${repos.length} 个热门项目\n`);

    // 过滤已发布的
    const published = getPublishedRepos();
    const publishedNames = published.map(r => r.name);
    const newRepos = repos.filter(r => !publishedNames.includes(r.name));

    if (newRepos.length === 0) {
      console.log('📭 没有新项目需要发布');
      return;
    }

    console.log(`🆕 有 ${newRepos.length} 个新项目需要发布\n`);

    // 发布最新 1-2 个
    const toPublish = newRepos.slice(0, 1);

    for (const repo of toPublish) {
      console.log(`📝 发布: ${repo.name}`);
      createPost(repo);
      savePublishedRepo(repo);
      console.log('');
    }

    console.log('✅ 完成！文章已创建在 source/_posts/ 目录');

  } catch (error) {
    console.error('❌ 错误:', error.message);
    process.exit(1);
  }
}

// 本地运行
if (require.main === module) {
  main();
}

module.exports = { main };
