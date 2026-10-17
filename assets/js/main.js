/* ============================================
   KM Studio · 交互脚本
   ============================================ */

(function () {
  'use strict';

  // ---- 工具 ----
  const $ = (s, p = document) => p.querySelector(s);
  const $$ = (s, p = document) => Array.from(p.querySelectorAll(s));
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

  // ============================================
  // 背景：星星 + 流星
  // ============================================
  function makeStars() {
    const host = $('#bg-stars');
    if (!host) return;
    const count = Math.min(80, Math.floor((window.innerWidth * window.innerHeight) / 18000));
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const s = document.createElement('div');
      s.className = 'star';
      // 7% 大星，3% 焦糖色星
      if (Math.random() < 0.07) s.classList.add('big');
      else if (Math.random() < 0.04) s.classList.add('accent');
      s.style.left = `${rand(0, 100)}%`;
      s.style.top = `${rand(0, 100)}%`;
      s.style.setProperty('--dur', `${rand(2.5, 6)}s`);
      s.style.setProperty('--delay', `${rand(0, 6)}s`);
      s.style.setProperty('--peak', `${rand(0.5, 1)}`);
      frag.appendChild(s);
    }
    host.appendChild(frag);
  }

  function makeMeteors() {
    const host = $('#bg-meteors');
    if (!host) return;
    const count = 5; // 少量
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const m = document.createElement('div');
      m.className = 'meteor';
      // 从屏幕右上方出现，飞向左下方
      // 错开初始位置 + 时间，避免一窝蜂出现
      m.style.setProperty('--start-top', `${rand(-15, 30)}%`);
      m.style.setProperty('--start-left', `${rand(75, 110)}%`);
      m.style.setProperty('--dur', `${rand(3, 5.5)}s`);
      m.style.setProperty('--delay', `${i * 2.5 + rand(0, 1.5)}s`);
      frag.appendChild(m);
    }
    host.appendChild(frag);
  }
  makeStars();
  makeMeteors();

  // ============================================
  // 时间引擎：虚拟时钟 + 速度倍率
  // speed=1 与真实时间同步；倍率只影响虚拟时间流速
  // ============================================
  const timeEngine = {
    speed: 1,
    baseReal: Date.now(),
    baseVirtual: Date.now(),
    now() {
      return new Date(this.baseVirtual + (Date.now() - this.baseReal) * this.speed);
    },
    setSpeed(s) {
      // 先冻结当前虚拟时间，再切换速率
      this.baseVirtual = this.now().getTime();
      this.baseReal = Date.now();
      this.speed = Math.max(0, s);
    },
    warpTo(target, duration = 3000) {
      // 平滑推移虚拟时钟到目标时刻（期间暂停流速累积）
      const prevSpeed = this.speed;
      this.setSpeed(0);
      const startV = this.baseVirtual;
      const endV = target.getTime();
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, Math.max(0, (t - t0) / duration));
        // easeInOutQuad
        const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
        this.baseVirtual = startV + (endV - startV) * e;
        if (k < 1) requestAnimationFrame(step);
        else this.setSpeed(prevSpeed || 1);
      };
      requestAnimationFrame(step);
    }
  };

  // ============================================
  // 主题定义（与 CSS 四套变量保持一致，此处为唯一运行真相）
  // ============================================
  const THEMES = {
    night: {
      bg: '#0e0d0a', bg2: '#16140f', bg3: '#1c1914',
      fg: '#f5f0e8', fgDim: '#b8b0a0', fgMute: '#6f6a5d',
      line: '#2a2620', line2: '#3a342b',
      accent: '#d97757', accent2: '#e89b7a',
      green: '#788c5d', yellow: '#d9b259', red: '#c8553d',
      starColor: '#f5f0e8',
      aurora1: 'rgba(217, 119, 87, 0.18)', aurora2: 'rgba(120, 140, 93, 0.12)',
      tlVeil: 'rgba(22, 20, 15, 0.55)',
      sunColor: '#f0b429', moonColor: '#e8ecf5', cloudColor: '#4a443a',
      headerBg: 'rgba(14, 13, 10, 0.7)', headerBgStrong: 'rgba(14, 13, 10, 0.85)',
      pillBg: 'rgba(28, 25, 20, 0.6)',
      starsOp: 1, meteorsOp: 1, cloudsOp: 0.1
    },
    dawn: {
      bg: '#0f141f', bg2: '#151b28', bg3: '#1b2231',
      fg: '#e9edf6', fgDim: '#a6b0c6', fgMute: '#5c6680',
      line: '#232b3b', line2: '#323b4f',
      accent: '#8fa8d9', accent2: '#a9bde8',
      green: '#7d9b8a', yellow: '#c9b47e', red: '#c0705f',
      starColor: '#dfe6f5',
      aurora1: 'rgba(143, 168, 217, 0.16)', aurora2: 'rgba(201, 138, 107, 0.10)',
      tlVeil: 'rgba(21, 27, 40, 0.6)',
      sunColor: '#e8895a', moonColor: '#c9cfdf', cloudColor: '#b8b4cc',
      headerBg: 'rgba(15, 20, 31, 0.72)', headerBgStrong: 'rgba(15, 20, 31, 0.86)',
      pillBg: 'rgba(21, 27, 40, 0.6)',
      starsOp: 0.55, meteorsOp: 0.35, cloudsOp: 0.5
    },
    day: {
      bg: '#f7f2e7', bg2: '#efe9d9', bg3: '#e4dcc7',
      fg: '#1a1814', fgDim: '#4d483e', fgMute: '#8d8677',
      line: '#d8d0ba', line2: '#bdb49c',
      accent: '#b85c33', accent2: '#cf7a4e',
      green: '#5f7a4d', yellow: '#a8823a', red: '#a8452f',
      starColor: '#1a1814',
      aurora1: 'rgba(184, 92, 51, 0.10)', aurora2: 'rgba(95, 122, 77, 0.08)',
      tlVeil: 'rgba(235, 229, 214, 0.6)',
      sunColor: '#f0b429', moonColor: '#8d8677', cloudColor: '#ffffff',
      headerBg: 'rgba(247, 242, 231, 0.72)', headerBgStrong: 'rgba(247, 242, 231, 0.86)',
      pillBg: 'rgba(239, 233, 217, 0.7)',
      starsOp: 0, meteorsOp: 0, cloudsOp: 0.85
    },
    dusk: {
      bg: '#1b1310', bg2: '#241a15', bg3: '#2d211a',
      fg: '#f6e9dc', fgDim: '#c6a992', fgMute: '#8b6d57',
      line: '#33241c', line2: '#463327',
      accent: '#e07a3c', accent2: '#f39b5e',
      green: '#8a8a5c', yellow: '#d9a44f', red: '#c25a3a',
      starColor: '#f6e9dc',
      aurora1: 'rgba(224, 122, 60, 0.22)', aurora2: 'rgba(194, 90, 58, 0.14)',
      tlVeil: 'rgba(36, 26, 21, 0.6)',
      sunColor: '#e0663a', moonColor: '#d8cfc4', cloudColor: '#e8b8a0',
      headerBg: 'rgba(27, 19, 16, 0.72)', headerBgStrong: 'rgba(27, 19, 16, 0.86)',
      pillBg: 'rgba(36, 26, 21, 0.6)',
      starsOp: 0.6, meteorsOp: 0.7, cloudsOp: 0.55
    }
  };

  const COLOR_KEYS = [
    'bg', 'bg2', 'bg3', 'fg', 'fgDim', 'fgMute', 'line', 'line2',
    'accent', 'accent2', 'green', 'yellow', 'red', 'starColor',
    'aurora1', 'aurora2', 'tlVeil', 'sunColor', 'moonColor', 'cloudColor',
    'headerBg', 'headerBgStrong', 'pillBg'
  ];
  const NUM_KEYS = ['starsOp', 'meteorsOp', 'cloudsOp'];

  // ============================================
  // 梯形权重模型：每主题独立的渐入/渐出窗口
  // 权重和恒为 1，窗口不重叠，从根上消除"过渡退出时跳回"
  //
  //   night: 渐出 [3-6)  → 纯 [22-3)   → 渐入 [18-22)
  //   dawn:  渐入 [3-6)  → 纯 [10-6=短) → 渐出 [6-10)
  //   day:   渐入 [6-10) → 纯 [10-15)  → 渐出 [15-18)
  //   dusk:  渐入 [15-18)→ 纯 [22-18)   → 渐出 [18-22)
  //
  // dawn→day 从 6:00 开始渐变、10:00 完全放晴（4h，亮度匀速上升）
  // day→dusk 从 15:00 开始、19:00 完全日落
  // ============================================
  const THEME_WINDOWS = {
    night: { in: [18, 22], out: [3, 6] },
    dawn:  { in: [3, 6],   out: [6, 10] },
    day:   { in: [6, 10],  out: [15, 18] },
    dusk:  { in: [15, 18], out: [18, 22] }
  };

  function themeWeight(name, h) {
    const W = THEME_WINDOWS[name];
    const [iS, iE] = W.in;
    const [oS, oE] = W.out;
    if (h >= iS && h < iE) return (h - iS) / (iE - iS);      // 渐入
    if (h >= oS && h < oE) return 1 - (h - oS) / (oE - oS);  // 渐出
    // 纯区间：顺序型（in 终点 <= out 起点）用 [iE, oS)；
    // 跨零点型（night: in [18,22) out [3,6)，纯区间 [22,3)）用 h>=iE || h<oS
    if (iE <= oS) {
      if (h >= iE && h < oS) return 1;
    } else {
      if (h >= iE || h < oS) return 1;
    }
    return 0;
  }

  // ---- 颜色工具 ----
  function parseColor(c) {
    if (c[0] === '#') {
      const hex = c.length === 4
        ? c.slice(1).split('').map((x) => x + x).join('')
        : c.slice(1);
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
        1
      ];
    }
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const p = m[1].split(',').map((v) => parseFloat(v));
      return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1];
    }
    return [0, 0, 0, 1];
  }
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  function lerpColor(c1, c2, t) {
    const a = parseColor(c1);
    const b = parseColor(c2);
    const r = a.map((v, i) => v + (b[i] - v) * t);
    return `rgba(${Math.round(r[0])}, ${Math.round(r[1])}, ${Math.round(r[2])}, ${r[3].toFixed(3)})`;
  }
  function mixTheme(a, b, t) {
    const out = {};
    COLOR_KEYS.forEach((k) => { out[k] = lerpColor(a[k], b[k], t); });
    NUM_KEYS.forEach((k) => { out[k] = a[k] + (b[k] - a[k]) * t; });
    return out;
  }

  // 给定虚拟小时 h，返回混合后的主题状态 + 主导主题 + 各主题权重
  function themeStateAt(h) {
    const w = {
      night: themeWeight('night', h),
      dawn: themeWeight('dawn', h),
      day: themeWeight('day', h),
      dusk: themeWeight('dusk', h)
    };

    // 主导主题 = 权重最大者
    let dominant = 'night';
    for (const k in w) if (w[k] > w[dominant]) dominant = k;

    // 加权混合：从高权重到低权重依次混入
    const order = Object.keys(w).sort((a, b) => w[b] - w[a]);
    let state = null;
    let acc = 0;
    for (const name of order) {
      if (w[name] <= 0.0001) continue;
      if (!state) {
        state = { ...THEMES[name] };
        acc = w[name];
      } else {
        state = mixTheme(state, THEMES[name], w[name] / (acc + w[name]));
        acc += w[name];
      }
    }
    if (!state) state = { ...THEMES.night };

    return { state, dominant, weights: w };
  }

  // ---- 应用主题状态到 CSS 变量 ----
  const bodyStyle = document.body.style;
  const veilEls = {};
  ['night', 'dawn', 'day', 'dusk'].forEach((n) => {
    veilEls[n] = document.querySelector(`.theme-veil[data-veil="${n}"]`);
  });

  function applyThemeState(result) {
    const s = result.state;
    bodyStyle.setProperty('--bg', s.bg);
    bodyStyle.setProperty('--bg-2', s.bg2);
    bodyStyle.setProperty('--bg-3', s.bg3);
    bodyStyle.setProperty('--fg', s.fg);
    bodyStyle.setProperty('--fg-dim', s.fgDim);
    bodyStyle.setProperty('--fg-mute', s.fgMute);
    bodyStyle.setProperty('--line', s.line);
    bodyStyle.setProperty('--line-2', s.line2);
    bodyStyle.setProperty('--accent', s.accent);
    bodyStyle.setProperty('--accent-2', s.accent2);
    bodyStyle.setProperty('--green', s.green);
    bodyStyle.setProperty('--yellow', s.yellow);
    bodyStyle.setProperty('--red', s.red);
    bodyStyle.setProperty('--star-color', s.starColor);
    bodyStyle.setProperty('--aurora-1', s.aurora1);
    bodyStyle.setProperty('--aurora-2', s.aurora2);
    bodyStyle.setProperty('--tl-veil', s.tlVeil);
    bodyStyle.setProperty('--sun-color', s.sunColor);
    bodyStyle.setProperty('--moon-color', s.moonColor);
    bodyStyle.setProperty('--cloud-color', s.cloudColor);
    bodyStyle.setProperty('--header-bg', s.headerBg);
    bodyStyle.setProperty('--header-bg-strong', s.headerBgStrong);
    bodyStyle.setProperty('--pill-bg', s.pillBg);
    bodyStyle.setProperty('--stars-opacity', s.starsOp.toFixed(3));
    bodyStyle.setProperty('--meteors-opacity', s.meteorsOp.toFixed(3));
    bodyStyle.setProperty('--clouds-opacity', s.cloudsOp.toFixed(3));

    // veil crossfade：每层 opacity = 对应主题的混合权重（平滑连续）
    Object.keys(veilEls).forEach((n) => {
      const el = veilEls[n];
      if (!el) return;
      const op = result.weights[n] || 0;
      el.style.opacity = op.toFixed(3);
    });

    // data-theme 跟随主导主题（驱动 day-specific 覆盖，如噪点 blend）
    if (document.body.dataset.theme !== result.dominant) {
      document.body.dataset.theme = result.dominant;
      document.body.classList.toggle('light-mode', result.dominant === 'day');
    }
  }

  // ============================================
  // 天体：太阳 4:30 升 / 19:30 落，月亮 16:30 升 / 7:30 落
  // 位置由虚拟时间驱动（倍速下同样连续运动）
  // ============================================
  const sunEl = $('#sun');
  const moonEl = $('#moon');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function celestialOpacity(h, inS, inE, outS, outE) {
    if (h >= inS && h < inE) return (h - inS) / (inE - inS);   // 渐入
    if (h >= outS && h < outE) return 1 - (h - outS) / (outE - outS); // 渐隐
    const visible = inE <= outS ? (h >= inE && h < outS) : (h >= inE || h < outS);
    return visible ? 1 : 0;
  }

  function placeCelestial(el, h, map) {
    if (!el) return;
    const { p, op } = map(h);
    el.style.opacity = op.toFixed(3);
    if (op <= 0.01) return;
    const x = 8 + p * 84;
    const y = 68 - Math.sin(p * Math.PI) * 58;
    el.style.left = `${x.toFixed(2)}%`;
    el.style.top = `${y.toFixed(2)}%`;
  }

  // ============================================
  // 统一驱动循环：主题混合 + 天体位置 + 时钟
  // ============================================
  const themeLabel = $('#theme-label');
  const spClock = $('#sp-clock');
  const spThemeName = $('#sp-theme-name');
  const liveTime = $('#live-time');
  const THEME_ORDER = ['night', 'dawn', 'day', 'dusk'];
  const THEME_REPS = { night: 23, dawn: 6.5, day: 12, dusk: 18.5 }; // warp 目标时刻

  function virtualHours() {
    const n = timeEngine.now();
    return n.getHours() + n.getMinutes() / 60 + n.getSeconds() / 3600;
  }

  function updateAll() {
    const h = virtualHours();

    // 主题混合
    const result = themeStateAt(h);
    applyThemeState(result);

    // 天体位置（倍速下连续运动）
    placeCelestial(sunEl, h, (hh) => ({
      p: clamp01((hh - 4.5) / 15),
      op: celestialOpacity(hh, 4.5, 6, 18, 19.5)
    }));
    placeCelestial(moonEl, h, (hh) => ({
      p: clamp01((((hh - 16.5) + 24) % 24) / 15),
      op: celestialOpacity(hh, 16.5, 18, 6, 7.5)
    }));

    // UI 文本
    const n = timeEngine.now();
    const hh = String(n.getHours()).padStart(2, '0');
    const mm = String(n.getMinutes()).padStart(2, '0');
    const ss = String(n.getSeconds()).padStart(2, '0');
    if (themeLabel) themeLabel.textContent = result.dominant;
    if (liveTime) liveTime.textContent = `${hh}:${mm}:${ss}`;
    if (spClock) spClock.textContent = `${hh}:${mm}:${ss}`;
    if (spThemeName) spThemeName.textContent = result.dominant;
  }

  // rAF 节流驱动（~40ms 粒度：1× 下无感知，600× 演示下也足够细）
  let lastDriveTick = 0;
  function driveLoop(ts) {
    if (ts - lastDriveTick > 40) {
      lastDriveTick = ts;
      updateAll();
    }
    requestAnimationFrame(driveLoop);
  }
  updateAll();
  requestAnimationFrame(driveLoop);

  // ============================================
  // 倍率控制 UI
  // ============================================
  const speedPill = $('#speed-pill');
  const speedPanel = $('#speed-panel');
  const speedSlider = $('#speed-slider');
  const speedValue = $('#speed-value');
  const spIcon = speedPill?.querySelector('.sp-icon');

  // slider 0-100 → speed 1×-3600×（对数映射）
  const sliderToSpeed = (v) => Math.pow(10, (3.556 * v) / 100);
  const speedToSlider = (s) => (100 * Math.log10(Math.max(1, s))) / 3.556;

  function formatSpeed(s) {
    if (s >= 1000) return `${(s / 1000).toFixed(s % 1000 === 0 ? 0 : 1)}k×`;
    if (s >= 100) return `${Math.round(s)}×`;
    if (Number.isInteger(s)) return `${s}×`;
    return `${s.toFixed(1)}×`;
  }

  function setSpeedUI(s) {
    timeEngine.setSpeed(s);
    if (speedValue) speedValue.textContent = formatSpeed(s);
    if (speedSlider) speedSlider.value = String(Math.round(speedToSlider(s)));
    if (speedPill) speedPill.classList.toggle('fast', s > 1);
    document.querySelectorAll('.speed-preset').forEach((b) => {
      b.classList.toggle('active', parseFloat(b.dataset.speed) === s);
    });
  }

  if (speedPill && speedPanel) {
    speedPill.addEventListener('click', (e) => {
      e.stopPropagation();
      speedPanel.classList.toggle('open');
      speedPill.classList.toggle('active');
    });
    // 点击外部关闭
    document.addEventListener('click', (e) => {
      if (!speedPanel.contains(e.target) && e.target !== speedPill && !speedPill.contains(e.target)) {
        speedPanel.classList.remove('open');
        speedPill.classList.remove('active');
      }
    });
  }
  if (speedSlider) {
    speedSlider.addEventListener('input', () => {
      setSpeedUI(sliderToSpeed(parseFloat(speedSlider.value)));
    });
  }
  document.querySelectorAll('.speed-preset').forEach((btn) => {
    btn.addEventListener('click', () => {
      setSpeedUI(parseFloat(btn.dataset.speed));
    });
  });

  // ============================================
  // 时段 warp：点击 theme-pill 平滑推到下一时段代表时刻
  // ============================================
  function warpToNextTheme() {
    const h = virtualHours();
    // 找当前主导时段的下一个
    const result = themeStateAt(h);
    const idx = THEME_ORDER.indexOf(result.dominant);
    const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    const target = new Date();
    target.setHours(Math.floor(THEME_REPS[next]), Math.round((THEME_REPS[next] % 1) * 60), 0, 0);
    timeEngine.warpTo(target, 3500);
  }

  const themePill = $('#theme-pill');
  if (themePill) {
    themePill.addEventListener('click', warpToNextTheme);
  }

  // 暴露给终端命令
  window.__kmTime = {
    setSpeed: (s) => setSpeedUI(s),
    warpToTheme: (name) => {
      if (!THEME_REPS[name]) return null;
      const target = new Date();
      target.setHours(Math.floor(THEME_REPS[name]), Math.round((THEME_REPS[name] % 1) * 60), 0, 0);
      timeEngine.warpTo(target, 3500);
      return name;
    },
    warpToRealNow: () => {
      timeEngine.warpTo(new Date(), 2000);
    },
    speed: () => timeEngine.speed,
    now: () => timeEngine.now(),
    dominant: () => themeStateAt(virtualHours()).dominant
  };

  // ============================================
  // 音效 · Web Audio API 生成 hover tick
  // ============================================
  let audioCtx = null;
  let audioReady = false;

  function ensureAudio() {
    if (audioReady) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      audioCtx = new AC();
      audioReady = true;
      return true;
    } catch (e) {
      return false;
    }
  }

  function playTick() {
    if (!ensureAudio() || !audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const ctx = audioCtx;
    const now = ctx.currentTime;

    // 主振: 短 sine tick
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.06);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.06, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.14);

    // 高频泛音（触感）：很轻的 click
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2200, now);
    gain2.gain.setValueAtTime(0.02, now);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    osc2.connect(gain2).connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.05);
  }

  function playClick() {
    if (!ensureAudio() || !audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const ctx = audioCtx;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.08);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18);

    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.2);
  }

  // 节流：避免快速 hover 触发太密集
  let lastTick = 0;
  const tickThrottled = () => {
    const now = Date.now();
    if (now - lastTick < 80) return;
    lastTick = now;
    playTick();
  };
  let lastClick = 0;
  const clickThrottled = () => {
    const now = Date.now();
    if (now - lastClick < 60) return;
    lastClick = now;
    playClick();
  };

  // ---- 自定义光标 ----
  const dot = $('.cursor-dot');
  const ring = $('.cursor-ring');
  const isCoarse = window.matchMedia('(pointer: coarse)').matches;

  if (!isCoarse && dot && ring) {
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx, ry = my;

    document.addEventListener('mousemove', (e) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%, -50%)`;
    });

    // 光标环缓动跟随
    function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%, -50%)`;
      requestAnimationFrame(loop);
    }
    loop();

    // hover 状态 + 音效
    const hoverables = 'a, button, .magnetic, .bento-card, .chip, input';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverables)) {
        document.body.classList.add('cursor-hover');
        tickThrottled();
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverables)) document.body.classList.remove('cursor-hover');
    });

    // click 音效
    document.addEventListener('click', (e) => {
      const target = e.target.closest('button, a.btn-primary, a.btn-ghost, .bento-card, .chip');
      if (target) clickThrottled();
    });
  }

  // ---- 磁吸按钮 ----
  $$('.magnetic').forEach((el) => {
    if (isCoarse) return;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
    });
  });

  // ---- Header 滚动状态 ----
  const header = $('.site-header');
  const heroTitle = $('.hero-title');
  const onScroll = () => {
    const y = window.scrollY;

    // Header
    if (y > 30) header?.classList.add('scrolled');
    else header?.classList.remove('scrolled');

    // Hero 视差：标题移动稍快 + 淡出
    if (heroTitle && y < window.innerHeight) {
      heroTitle.style.transform = `translate3d(0, ${y * 0.15}px, 0)`;
      heroTitle.style.opacity = `${1 - y / (window.innerHeight * 0.8)}`;
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Bento 卡片的鼠标光晕 ----
  $$('.bento-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
      card.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
    });
  });

  // ---- 滚动揭示 ----
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
  );
  $$('.reveal').forEach((el) => io.observe(el));

  // ---- Live time ----
  const timeEl = $('#live-time');
  if (timeEl) {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      const ss = String(d.getSeconds()).padStart(2, '0');
      timeEl.textContent = `${hh}:${mm}:${ss}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  // ---- Currently music shuffle ----
  const musicEl = $('#cur-music');
  if (musicEl) {
    const tracks = [
      'env 类的 ambient，或者干脆静音',
      'Nils Frahm — Says',
      'Brian Eno — Music for Airports',
      '落日飞车 — 我是一只鱼',
      'Tycho — Awake',
      '懒得开播放器'
    ];
    const shuffle = () => {
      musicEl.textContent = tracks[Math.floor(Math.random() * tracks.length)];
    };
    shuffle();
    setInterval(shuffle, 9000);
    musicEl.style.cursor = 'pointer';
    musicEl.addEventListener('click', shuffle);
  }

  // ============================================
  // TERMINAL
  // ============================================
  const termBody = $('#terminal-body');
  const termInput = $('#terminal-input');

  // ============================================
  // 项目数据：来自 data/projects.js
  // （data/curated.json 手写文案 + GitHub Actions 注入的 stats 合并产物）
  // ============================================
  const PROJECT_SOURCE = (window.KM_PROJECTS && window.KM_PROJECTS.projects) || [];
  const projects = {};
  PROJECT_SOURCE.forEach((p, i) => {
    projects[String(i + 1)] = p;
  });

  // ---- 相对时间 ----
  function timeAgo(iso) {
    const diff = Date.now() - new Date(iso).getTime();
    const d = Math.floor(diff / 86400000);
    if (d <= 0) {
      const h = Math.floor(diff / 3600000);
      if (h <= 0) return 'just now';
      return h + 'h ago';
    }
    if (d < 30) return d + 'd ago';
    const m = Math.floor(d / 30);
    return m + 'mo ago';
  }

  // ---- 渲染 Bento 卡片 ----
  function renderBento() {
    const host = $('#bento');
    if (!host) return;

    host.innerHTML = PROJECT_SOURCE.map((p, i) => {
      const idx = i + 1;
      const layout = p.layout || 'small';

      const deco = p.deco
        ? '<div class="bento-deco"><div class="dot d1"></div><div class="dot d2"></div><div class="dot d3"></div></div>'
        : '';
      const dashed = p.dashed ? '<div class="bento-dashed"><span>?</span></div>' : '';
      const sub = p.sub ? ' <span class="bento-sub">' + escapeHtml(p.sub) + '</span>' : '';
      const chips = (p.stacks || [])
        .map((x) => '<span class="meta-chip">' + escapeHtml(x) + '</span>')
        .join('');
      const view = p.repo ? '<a href="#" class="bento-link">view →</a>' : '';
      const ago = p.stats && p.stats.pushed_at
        ? '<span class="bento-ago">' + timeAgo(p.stats.pushed_at) + '</span>'
        : '';

      return [
        '<article class="bento-card bento-' + layout + ' reveal" data-index="' + idx + '">',
        '  <div class="bento-tag">' + escapeHtml(p.tag || '') + ago + '</div>',
        '  <h3 class="bento-title">' + escapeHtml(p.title) + sub + '</h3>',
        '  <p class="bento-desc">' + escapeHtml(p.desc || '') + '</p>',
        chips ? '  <div class="bento-meta">' + chips + '</div>' : '',
        '  <div class="bento-foot">',
        '    <span class="bento-status status-' + (p.statusClass || 'future') + '">' + escapeHtml(p.status || '') + '</span>',
        '    ' + view,
        '  </div>',
        deco,
        dashed,
        '</article>'
      ].join('');
    }).join('');
  }

  renderBento();

  // ============================================
  const modal = $('#project-modal');
  const modalBody = $('#pmodal-body');

  // ---- modal 里的 GitHub 实时统计（由 Actions 注入，缺失时整块隐藏）----
  function renderStats(p) {
    const st = p.stats;
    if (!st) return '';
    const rows = [];
    if (st.pushed_at) {
      const d = new Date(st.pushed_at);
      rows.push('最近推送: ' + d.toLocaleString('zh-CN', { hour12: false }));
    }
    if (st.last_commit && st.last_commit.message) {
      rows.push('最新提交: ' + escapeHtml(st.last_commit.message));
    }
    if (st.languages && st.languages.length) {
      rows.push('语言构成: ' + st.languages.map((l) => l.name + ' ' + l.pct + '%').join(' · '));
    }
    if (typeof st.size_kb === 'number') {
      rows.push('仓库体积: ' + st.size_kb + ' KB');
    }
    if (!rows.length) return '';
    return `
      <div class="modal-section modal-stats">
        <h4>github · live</h4>
        <ul>${rows.map((r) => '<li>' + r + '</li>').join('')}</ul>
      </div>`;
  }

  function openModal(key) {
    const p = projects[key];
    if (!p || !modal || !modalBody) return;

    const stacks = p.stacks.map((s) => `<span class="meta-chip">${s}</span>`).join('');
    const sections = (p.sections || [])
      .map(
        (s) => `
          <div class="modal-section">
            <h4>${s.h}</h4>
            <ul>${s.l.map((li) => `<li>${li}</li>`).join('')}</ul>
          </div>`
      )
      .join('');

    modalBody.innerHTML = `
      <div class="modal-tag">${p.tag || p.type}</div>
      <h2 id="pmodal-title">${p.title}${p.sub || ''}</h2>
      <p class="modal-desc">${p.desc}</p>
      <div class="modal-meta">${stacks}</div>
      <div class="modal-section">
        <h4>highlight</h4>
        <ul><li>${p.highlight}</li></ul>
      </div>
      ${sections}
      ${renderStats(p)}
      <div class="modal-foot">
        <span>status: <strong>${p.status}</strong></span>
        <span>// ${p.type}</span>
      </div>
    `;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // 点击项目卡打开 modal
  $$('.bento-card[data-index]').forEach((card) => {
    card.addEventListener('click', () => {
      const key = card.dataset.index;
      if (key) openModal(key);
    });
    card.style.cursor = 'pointer';
  });

  // 关闭
  if (modal) {
    $$('[data-close]', modal).forEach((el) => el.addEventListener('click', closeModal));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
  }

  // 写入一行
  function writeLine(html, className = '') {
    if (!termBody) return;
    const line = document.createElement('div');
    line.className = 't-line';
    line.innerHTML = `
      <span class="t-prompt">visitor@km.studio</span>
      <span class="t-sep">~</span>
      <span class="t-path">$</span>
      <span class="t-out ${className}">${html}</span>
    `;
    termBody.appendChild(line);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function writeEcho(cmd) {
    if (!termBody) return;
    const line = document.createElement('div');
    line.className = 't-line';
    line.innerHTML = `
      <span class="t-prompt">visitor@km.studio</span>
      <span class="t-sep">~</span>
      <span class="t-path">$</span>
      <span class="t-out"><strong style="color:var(--fg)">${escapeHtml(cmd)}</strong></span>
    `;
    termBody.appendChild(line);
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, (m) => ({
      '&': '&', '<': '<', '>': '>', '"': '"', "'": '&#39;'
    })[m]);
  }

  // 命令处理
  const commands = {
    help() {
      return `
        <strong>可用命令:</strong><br>
        <code>help</code> · 显示这个帮助<br>
        <code>ls</code> · 列出项目<br>
        <code>cat <n></code> · 看项目 n 的详情<br>
        <code>open <n></code> · 打开项目 n 的卡片<br>
        <code>whoami</code> · 介绍自己<br>
        <code>date</code> · 当前时间<br>
        <code>status</code> · 最近一周在干嘛<br>
        <code>music</code> · 现在在听啥<br>
        <code>theme night|dawn|day|dusk|auto</code> · warp 到某时段（3.5s 过渡）<br>
        <code>speed <n></code> · 时间倍率（speed 60 / 600 / 3600 / auto）<br>
        <code>time</code> · 查看虚拟时间和倍率<br>
        <code>goto <section></code> · 跳转<br>
        <code>echo <text></code> · 复读<br>
        <code>secret</code> · ?<br>
        <code>clear</code> · 清空
      `;
    },
    ls() {
      const rows = PROJECT_SOURCE.map((p, i) => {
        const idx = String(i + 1).padStart(2, '0');
        const name = p.title + (p.sub ? p.sub.replace('/', '·') : '');
        return `<span class="muted">${idx}/</span><span>${escapeHtml(name)} <span class="muted">// ${escapeHtml(p.status || '')}</span></span>`;
      }).join('');
      return `
        <div style="display:grid;grid-template-columns:auto 1fr;gap:8px 16px;">${rows}</div>
        <span class="muted">提示: cat 1 看项目1详情, open 1 开详情卡</span>
      `;
    },
    cat(args) {
      const key = (args[0] || '').trim();
      const p = projects[key];
      if (!p) return `<span class="warn">没找到项目 "${escapeHtml(key)}"。试试 ls。</span>`;
      const stacks = p.stacks.length
        ? `<br><strong>栈</strong>: ${p.stacks.join(' · ')}`
        : '';
      return `
        <strong>${p.title}</strong> <span class="muted">// ${p.type}</span><br>
        ${p.desc}
        ${stacks}<br>
        <span class="accent">提示</span>: 也可以点这里 <a href="#projects" onclick="document.querySelectorAll('.bento-card')[${parseInt(key,10) - 1}]?.click();return false;">→ 打开详情卡</a>
      `;
    },
    whoami() {
      return `
        <strong>km</strong> · 数据科学与大数据技术 · 2027 届<br>
        白天写代码，晚上拆二进制。<br>
        喜欢拆东西拼回去。讨厌纯演示。
      `;
    },
    date() {
      const d = new Date();
      return `<span class="accent">${d.toString()}</span>`;
    },
    goto(args) {
      const target = (args[0] || '').trim();
      const valid = ['projects', 'timeline', 'about', 'contact', 'terminal'];
      if (!valid.includes(target)) {
        return `<span class="warn">不知道去哪。可选: ${valid.join(', ')}</span>`;
      }
      const el = document.getElementById(target);
      if (el) {
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
        return `<span class="success">→ 跳到 ${target}</span>`;
      }
      return `<span class="warn">找不到 #${target}</span>`;
    },
    echo(args) {
      return `<span class="muted">${escapeHtml(args.join(' '))}</span>`;
    },
    open(args) {
      const key = (args[0] || '').trim();
      if (!projects[key]) return `<span class="warn">没找到项目 "${escapeHtml(key)}"</span>`;
      openModal(key);
      return `<span class="success">→ 打开项目 ${key}</span>`;
    },
    status() {
      return `
        <strong>现在在写</strong>: 活档案平台 · 回合编译器四层降级<br>
        <strong>在读</strong>: 自己的开发记录（146KB 越写越长）<br>
        <strong>在想</strong>: ESP32-S3 选 A 方案还是 B 方案
      `;
    },
    music() {
      const tracks = [
        '现在没在听 — 想听点啥?',
        'Nils Frahm — Says',
        'Brian Eno — Music for Airports',
        'ambient pad, 静音模式',
        '落日飞车 — 我是一只鱼'
      ];
      const pick = tracks[Math.floor(Math.random() * tracks.length)];
      return `<span class="accent">♪ ${pick}</span>`;
    },
    theme(args) {
      const t = (args[0] || '').toLowerCase();
      // 兼容旧别名
      const alias = { dark: 'night', light: 'day' };
      const name = alias[t] || t;
      const valid = ['night', 'dawn', 'day', 'dusk', 'auto'];

      if (t === 'auto') {
        window.__kmTime.warpToRealNow();
        return `<span class="success">→ 回到真实时间</span>`;
      }
      if (!valid.includes(name)) {
        return `<span class="warn">用法: theme night | dawn | day | dusk | auto</span>`;
      }
      window.__kmTime.warpToTheme(name);
      return `<span class="success">→ warp 到 ${name}</span> <span class="muted">（3.5s 平滑过渡）</span>`;
    },
    speed(args) {
      const v = (args[0] || '').toLowerCase();
      if (v === 'auto' || v === '1' || v === '') {
        window.__kmTime.setSpeed(1);
        return `<span class="success">→ 1× 真实时间</span>`;
      }
      const n = parseFloat(v);
      if (!isNaN(n) && n > 0 && n <= 100000) {
        window.__kmTime.setSpeed(n);
        return `<span class="success">→ ${n}×</span>`;
      }
      return `<span class="warn">用法: speed <n> 例如 speed 60 / speed 600 / speed auto</span>`;
    },
    time() {
      const n = window.__kmTime.now();
      const hh = String(n.getHours()).padStart(2, '0');
      const mm = String(n.getMinutes()).padStart(2, '0');
      const ss = String(n.getSeconds()).padStart(2, '0');
      const spd = window.__kmTime.speed();
      return `
        <strong>虚拟时间</strong>: <span class="accent">${hh}:${mm}:${ss}</span><br>
        <strong>倍率</strong>: ${spd}×<br>
        <strong>当前时段</strong>: ${window.__kmTime.dominant()}
      `;
    },
    secret() {
      return `
        <span class="accent">┌──────────────────────────────┐</span><br>
        <span class="accent">│</span>  <strong>彩蛋触发 ✓</strong><br>
        <span class="accent">│</span>  你居然真敲了 secret。<br>
        <span class="accent">│</span>  奖励: 一个冷知识 —— 焦糖橙 #d97757<br>
        <span class="accent">│</span>  来自一位设计师朋友的外套色。<br>
        <span class="accent">└──────────────────────────────┘</span>
      `;
    },
    sudo(args) {
      return `<span class="warn">Permission denied:</span> <span class="muted">你不是管理员，这里没人是。</span>`;
    },
    rm(args) {
      if ((args[0] || '').includes('-rf')) {
        return `<span class="warn">拒绝执行。</span> 这不是 Linux。`;
      }
      return `<span class="muted">删什么删，乖。</span>`;
    },
    clear() {
      if (termBody) termBody.innerHTML = '';
      return null;
    }
  };

  function runCommand(raw) {
    const cmd = raw.trim();
    if (!cmd) return;
    writeEcho(cmd);

    const parts = cmd.split(/\s+/);
    const head = parts[0].toLowerCase();
    const args = parts.slice(1);

    if (commands[head]) {
      const out = commands[head](args);
      if (out !== null) writeLine(out);
    } else {
      writeLine(
        `<span class="warn">未知命令: ${escapeHtml(head)}</span>。敲 <code>help</code>。`
      );
    }
  }

  // 输入事件
  if (termInput) {
    termInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        runCommand(termInput.value);
        termInput.value = '';
      }
    });
    // 自动聚焦
    termInput.addEventListener('blur', () => setTimeout(() => termInput.focus(), 50));
  }

  // 命令 chip 点击
  $$('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      const cmd = chip.dataset.cmd || '';
      if (termInput) {
        termInput.value = cmd;
        termInput.focus();
        // 立即执行
        runCommand(cmd);
        termInput.value = '';
      }
    });
  });

  // 点击终端窗口聚焦输入
  const tw = $('#terminal-window');
  if (tw && termInput) {
    tw.addEventListener('click', () => termInput.focus());
  }
})();
