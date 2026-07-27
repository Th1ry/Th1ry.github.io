/**
 * GitHub Trending 爬虫
 * 自动获取 GitHub 热门项目
 */

const https = require('https');

async function fetchGitHubTrending() {
  const options = {
    hostname: 'api.github.com',
    path: '/search/repositories?q=stars:>1000+pushed:>2024-01-01&sort=stars&order=desc&per_page=10',
    headers: {
      'User-Agent': 'Th1ryBlog/1.0',
      'Accept': 'application/vnd.github.v3+json'
    }
  };

  return new Promise((resolve, reject) => {
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.items || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function fetchTrendingByLanguage(language) {
  const options = {
    hostname: 'api.github.com',
    path: `/search/repositories?q=language:${language}+stars:>500&sort=stars&order=desc&per_page=5`,
    headers: {
      'User-Agent': 'Th1ryBlog/1.0',
      'Accept': 'application/vnd.github.v3+json'
    }
  };

  return new Promise((resolve, reject) => {
    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve(json.items || []);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

module.exports = { fetchGitHubTrending, fetchTrendingByLanguage };
