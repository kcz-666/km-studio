# km.studio

个人项目陈列室。数据驱动的项目展示：文案手写，统计自动。

## 结构

```
.
├── index.html                        # 页面骨架（bento 卡片由 JS 渲染）
├── assets/
│   ├── css/styles.css                # 四时段主题 + 天体系统 + 卡片样式
│   └── js/main.js                    # 交互（主题引擎 / 终端 / modal / 渲染）
├── data/
│   ├── curated.json                  # ★ 手写项目文案，改这里
│   └── projects.js                   # 自动生成，勿手改
├── scripts/
│   └── build-projects.mjs            # curated + GitHub API → projects.js
└── .github/workflows/
    └── update-projects.yml           # 每天 UTC 02:00 自动刷新
```

## 更新项目信息

**改文案**：编辑 `data/curated.json`，然后

```bash
node scripts/build-projects.mjs
```

**加新项目**：在 `curated.json` 的 `projects` 数组里加一项，填 `id` / `repo` / `layout` / 文案即可。`layout` 可选 `large` / `tall` / `wide` / `small` / `full`。

**自动统计**：项目仓库有 push 后，Action 会在下次定时任务时拉取最新数据（最近推送时间、最后一次 commit、语言构成、仓库体积），写进 `data/projects.js` 的 `stats` 字段。卡片上会显示 `· 3d ago` 这类相对时间，modal 里显示完整统计。

## GitHub Actions 配置

需要在仓库的 **Settings → Secrets and variables → Actions** 添加：

| Secret | 说明 |
|---|---|
| `PROJECTS_PAT` | fine-grained PAT，对 4 个私有项目仓库有 `Contents: Read` 权限 |

没有这个 secret 时脚本不会报错，只会跳过统计（`has_live_stats: false`），卡片仍正常显示手写文案。

## 本地预览

```bash
# 任选其一
python -m http.server 8000
# 或
npx serve .
```

也可以直接双击 `index.html`——所有数据通过 `<script>` 加载，不依赖 fetch，file:// 协议下也能跑。
