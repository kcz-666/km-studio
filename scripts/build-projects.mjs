#!/usr/bin/env node
/**
 * 合并 curated.json（手写文案）+ GitHub API 实时统计 → data/projects.js
 *
 * 用法：
 *   node scripts/build-projects.mjs                    # 无 token，只输出文案
 *   GH_PAT=xxx node scripts/build-projects.mjs         # 带 token，拉私有仓库统计
 *
 * 在 GitHub Actions 里由 workflow 自动执行，token 来自 Secrets。
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const token = process.env.GH_PAT || process.env.GITHUB_TOKEN || '';

async function api(path) {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'km-studio-build',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
  if (!res.ok) throw new Error(`${path} -> ${res.status} ${res.statusText}`);
  return res.json();
}

async function fetchStats(repo) {
  const [info, commits, langs] = await Promise.all([
    api(`/repos/${repo}`),
    api(`/repos/${repo}/commits?per_page=1`).catch(() => []),
    api(`/repos/${repo}/languages`).catch(() => ({}))
  ]);

  const last = Array.isArray(commits) && commits[0] ? commits[0] : null;
  const total = Object.values(langs).reduce((a, b) => a + b, 0);
  const langList = Object.entries(langs)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([name, bytes]) => ({ name, pct: total ? Math.round((bytes / total) * 100) : 0 }));

  return {
    pushed_at: info.pushed_at,
    updated_at: info.updated_at,
    size_kb: info.size,
    private: info.private,
    default_branch: info.default_branch,
    language: info.language,
    languages: langList,
    last_commit: last
      ? {
          message: (last.commit?.message || '').split('\n')[0],
          date: last.commit?.author?.date || ''
        }
      : null
  };
}

const curated = JSON.parse(await readFile(resolve(root, 'data/curated.json'), 'utf8'));

// ---- 读取上一版 projects.js，用于回填 stats ----
// 本地没有 PAT 时拉不到私有仓库统计，但直接覆盖会把 Actions 已经拉到的
// 数据抹掉。这里保留旧值，等下次 Actions 跑起来再刷新。
const prevStats = {};
try {
  const oldRaw = await readFile(resolve(root, 'data/projects.js'), 'utf8');
  const jsonText = oldRaw.slice(oldRaw.indexOf('{'), oldRaw.lastIndexOf('}') + 1);
  const oldObj = JSON.parse(jsonText);
  for (const p of oldObj.projects || []) {
    if (p.id && p.stats) prevStats[p.id] = p.stats;
  }
  if (Object.keys(prevStats).length) {
    console.log(`↺ 回填上一版统计: ${Object.keys(prevStats).length} 个项目`);
  }
} catch {
  // 首次运行或旧文件损坏，忽略
}

const projects = [];
for (const p of curated.projects) {
  let stats = null;
  if (p.repo) {
    try {
      stats = await fetchStats(p.repo);
      console.log(`✓ ${p.repo}`);
    } catch (e) {
      console.warn(`! ${p.repo}: ${e.message}`);
    }
  }
  // 拉取失败时沿用旧统计，避免线上数据倒退
  if (!stats && prevStats[p.id]) {
    stats = prevStats[p.id];
    console.log(`↺ ${p.id}: 沿用旧统计`);
  }
  projects.push({ ...p, stats });
}

const out = {
  generated_at: new Date().toISOString(),
  has_live_stats: projects.some((p) => p.stats),
  projects
};

await writeFile(
  resolve(root, 'data/projects.js'),
  `// 自动生成，请勿手改。改文案请编辑 data/curated.json\nwindow.KM_PROJECTS = ${JSON.stringify(out, null, 2)};\n`,
  'utf8'
);

const ok = projects.filter((p) => p.stats).length;
console.log(`→ data/projects.js  (${projects.length} projects, ${ok} with live stats)`);

