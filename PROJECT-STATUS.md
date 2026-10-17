# km.studio · 项目状态总览

> 最后更新：2026-10-17 19:40

## 一、线上地址

**https://kcz-666.github.io/km-studio/**

个人项目陈列室。四时段主题（夜晚/凌晨/白天/傍晚）随时间连续变化，带天体系统（太阳/月亮/云彩按虚拟时间运动）、交互终端、5 个项目卡片。

---

## 二、仓库清单

| 仓库 | 可见性 | 内容 | 状态 |
|---|---|---|---|
| `kcz-666/km-studio` | **公开** | 网站本身（HTML/CSS/JS + Actions） | 已上线 Pages |
| `kcz-666/living-world-rp` | 私有 | 活档案·多世界角色扮演平台 | building |
| `kcz-666/rance03-editor` | 私有 | 兰斯03存档修改器 | shipped |
| `kcz-666/cx-exam-float` | 私有 | 超星考试 AI 悬浮窗 | archived |
| `kcz-666/esp32-s3-lab` | 私有 | ESP32-S3 选题记录 | not started |

> 项目仓库保持私有，网站只展示手写文案 + 元数据（更新时间、语言占比等），源码不暴露。

---

## 三、数据流

```
4 个私有项目仓库
      │ push
      ▼
GitHub Actions（每天 UTC 02:00 / 北京时间 10:00）
      │ 用 PROJECTS_PAT 读 /repos /commits /languages
      ▼
data/projects.js  ←── data/curated.json（手写文案）
      │ 自动提交 + push
      ▼
GitHub Pages 重建 → 浏览器渲染卡片
```

**核心设计**：文案手写（`curated.json`），统计自动（Actions 注入 `stats` 字段）。

---

## 四、文件结构

```
km-studio/
├── index.html                    页面骨架（bento 容器是空壳，卡片由 JS 渲染）
├── assets/
│   ├── css/styles.css            四时段主题变量 + 天体 + 卡片 + 终端样式
│   └── js/main.js                主题混合引擎 / 天体 / 终端 / modal / renderBento
├── data/
│   ├── curated.json              ★ 手写项目文案（改这里）
│   └── projects.js               自动生成，勿手改
├── scripts/
│   ├── build-projects.mjs        curated + GitHub API → projects.js
│   └── push-all.ps1              一键推送全部 5 个仓库
├── .github/workflows/
│   └── update-projects.yml       每天自动刷新统计
└── PROJECT-STATUS.md             本文档
```

---

## 五、日常操作

### 改项目文案

1. 编辑 `data/curated.json`
2. 双击运行 `scripts\push-all.ps1`（或 `pwsh -File scripts\push-all.ps1`）
3. 脚本会自动重新生成 `projects.js` 并推送，1-2 分钟后线上更新

### 加一个新项目

在 `curated.json` 的 `projects` 数组里加一项：

```json
{
  "id": "my-project",
  "repo": "kcz-666/my-project",
  "layout": "wide",
  "title": "项目名",
  "sub": "",
  "tag": "tag · 标签",
  "desc": "一句话描述",
  "status": "building",
  "statusClass": "wip",
  "stacks": ["Python"],
  "highlight": "亮点",
  "sections": [{ "h": "细节", "l": ["条目"] }]
}
```

`layout` 可选：`large`（4×2）/ `tall`（2×2）/ `wide`（4×1）/ `small`（2×1）/ `full`（6×1）
`statusClass` 可选：`wip`（黄）/ `done`（绿）/ `future`（灰）

### 立即刷新统计（不等定时任务）

```powershell
$h = @{ Authorization = "token <你的PAT>"; Accept = 'application/vnd.github+json' }
Invoke-RestMethod -Uri 'https://api.github.com/repos/kcz-666/km-studio/actions/workflows/update-projects.yml/dispatches' -Method Post -Headers $h -Body '{"ref":"main"}'
```

### 推送全部仓库

```powershell
pwsh -File D:\桌面\自己网站\scripts\push-all.ps1
```

---

## 六、技术要点

### 主题引擎（连续混合）

不是"到点切换"，而是按时间连续插值。每个主题有独立的渐入/渐出窗口，任意时刻四个主题权重和恒为 1：

| 主题 | 渐入 | 渐出 |
|---|---|---|
| night | 18:00-22:00 | 3:00-6:00 |
| dawn | 3:00-6:00 | 6:00-10:00 |
| day | 6:00-10:00 | 15:00-18:00 |
| dusk | 15:00-18:00 | 18:00-22:00 |

所以 6:00-10:00 是天逐渐亮起来的过程（背景亮度 15 → 247 匀速上升），不是瞬间跳变。

### 天体系统

太阳 4:30 升 / 19:30 落，月亮 16:30 升 / 7:30 落，位置由虚拟时钟驱动，沿正弦弧线运动，两端渐入渐出。

### 终端命令

`help` / `ls` / `cat <n>` / `open <n>` / `status` / `theme <name>` / `speed <n>` / `time` / `secret` / `clear`

`speed` 支持倍率加速虚拟时间，用于演示主题过渡动画。

---

## 七、注意事项

### 1. PAT 有效期

`PROJECTS_PAT` 是 classic token，**2026-11-16 过期**。过期后 Actions 会失败，卡片上的 `· Xd ago` 会停住不动。

续期方法：重新生成 token → 更新仓库 Secret（Settings → Secrets and variables → Actions）。

### 2. 权限范围

当前用的是 classic token 的 `repo` scope，即**所有仓库的读写权限**，比最初的计划（只读 4 个私有仓库）宽。

原因：fine-grained token 页面在那台机器上无法滚动（输入事件到不了渲染进程），配置不了。以后如有需要可以改回 fine-grained。

### 3. 浏览器缓存

改完代码后普通窗口可能显示旧版，需要 **Ctrl+Shift+R** 强制刷新。用无痕窗口可排除缓存干扰。

### 4. 本地生成会覆盖统计吗

不会。`build-projects.mjs` 会读上一版 `projects.js` 回填 stats，本地没有 PAT 时沿用旧数据。

### 5. 不要提交 .workbuddy

`.gitignore` 已排除。这是工作区内部记录，不属于项目内容。

---

## 八、本次开发记录（2026-10-17）

### 主题系统
- 把"到点瞬间切换"重构为连续混合引擎，修复 dawn→day 瞬间跳亮的问题
- 归一化权重模型：每主题独立的 in/out 窗口，权重和恒为 1

### 项目内容
- 毕设全部撤下，换成 5 个真实项目
- 删除 QBot（做一半不做了）

### 数据驱动改造
- 卡片从静态 HTML 改为 JS 渲染
- 文案抽到 `curated.json`，统计由 Actions 注入
- 修了一个隐蔽 bug：IntersectionObserver 在渲染前就扫完了 `.reveal`，导致动态卡片永远 opacity:0（表现为项目区完全空白）

### 部署
- 建仓库 → 推代码 → 开 Pages → 配 PAT → 触发 Actions 全流程跑通
- 用 UI Automation 的 InvokePattern 绕过了 Edge 不接受合成鼠标事件的问题

### 仓库
- 4 个私有项目仓库初始化并推送（含 .gitignore，排除密钥/游戏资源/依赖）
- 网站仓库公开，Pages 托管

---

## 九、已知问题

| 问题 | 影响 | 备注 |
|---|---|---|
| fine-grained token 页面无法操作 | 只能用 classic token | 页面滚动容器对输入模拟不友好 |
| 卡片文案不会自动更新 | 需手动改 curated.json | 有意为之：手写文案比 README 抓取有性格 |
| Actions 每天只跑一次 | 更新有延迟 | 可手动触发 workflow |
