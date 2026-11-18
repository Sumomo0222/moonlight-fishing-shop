/* ============================================================
   月光钓鱼小铺 · 交互脚本
   状态机：idle → casting → waiting ⇄ nibble → reeling → result
   ============================================================ */
(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  const scene = $('scene');
  const waterEl = document.querySelector('.water');
  const btn = $('mainBtn');
  const hint = $('hint');
  const bobber = $('bobber');
  const ballEl = bobber.querySelector('.ball');
  const tipRing = $('tipRing');
  const linePath = $('linePath');
  const fx = $('fx');
  const jumpEl = $('catchJump');
  const modal = $('modal');
  const countEl = $('count');
  const toastEl = $('toast');

  /* ---------------- 收获图鉴 ---------------- */
  const ICONS = {
    starFish: `<svg viewBox="0 0 64 64" aria-hidden="true"><ellipse cx="29" cy="34" rx="18" ry="11.5" fill="#ffd98a" stroke="#c98f3d" stroke-width="2"/><path d="M45 34l12-8-3.5 8 3.5 8z" fill="#ffd98a" stroke="#c98f3d" stroke-width="2" stroke-linejoin="round"/><path d="M24 23.5q5-4 10 0" fill="none" stroke="#c98f3d" stroke-width="2" stroke-linecap="round"/><circle cx="17.5" cy="31.5" r="2.2" fill="#3a2c18"/><path d="M12.5 37.5q2.5 2 5 0" fill="none" stroke="#c98f3d" stroke-width="1.6" stroke-linecap="round"/><path d="M27 27l1.8 4.2 4.2 1.8-4.2 1.8-1.8 4.2-1.8-4.2-4.2-1.8 4.2-1.8z" fill="#fff6d8"/><circle cx="38" cy="36" r="1.4" fill="#fff6d8" opacity=".9"/><circle cx="33" cy="27" r="1.2" fill="#fff6d8" opacity=".8"/><circle cx="52" cy="16" r="1.6" fill="#ffe9b3"/><circle cx="57" cy="22" r="1.1" fill="#ffe9b3"/></svg>`,
    moonShell: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 10c13 0 23 11 23 25 0 7-3 12-7 12-3 0-4-2-6-5l-4 6c-2 3-4 3-6 3s-4 0-6-3l-4-6c-2 3-3 5-6 5-4 0-7-5-7-12 0-14 10-25 23-25z" fill="#f2e6d0" stroke="#b9a07a" stroke-width="2" stroke-linejoin="round"/><path d="M32 10v40M22 14l-3 30M42 14l3 30" stroke="#d5c3a0" stroke-width="1.8" fill="none" stroke-linecap="round"/><g transform="translate(22 20) scale(1.5)"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#9fc0dd"/></g><circle cx="20" cy="16" r="1.3" fill="#ffe9b3" opacity=".9"/><circle cx="47" cy="20" r="1.1" fill="#ffe9b3" opacity=".8"/></svg>`,
    bottle: `<svg viewBox="0 0 64 64" aria-hidden="true"><rect x="27" y="6" width="10" height="6" rx="2" fill="#a97b4f"/><path d="M28 11h8v4.5c4.5 2.5 8 7.5 8 14.5 0 11.5-5.5 18-12 18-6.5 0-12-6.5-12-18 0-7 3.5-12 8-14.5z" fill="#d5eaf2" opacity=".92" stroke="#7fa6b8" stroke-width="2" stroke-linejoin="round"/><path d="M21 40c2 4 6 6.5 11 6.5s9-2.5 11-6.5" fill="none" stroke="#8fd0d8" stroke-width="2" opacity=".7"/><path d="M23 34q9 4.5 18 0" stroke="#c98f3d" stroke-width="1.6" fill="none" opacity=".8"/><rect x="25" y="24" width="15" height="10" rx="1.5" fill="#f7ecd2" stroke="#c9b183" stroke-width="1.4" transform="rotate(-4 32 29)"/><path d="M28 27h9M28 30h6" stroke="#b9a07a" stroke-width="1.2" stroke-linecap="round" transform="rotate(-4 32 29)"/><circle cx="47" cy="18" r="1.3" fill="#fff" opacity=".7"/><circle cx="17" cy="22" r="1.1" fill="#fff" opacity=".6"/></svg>`,
    jelly: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M10 32c0-13 9.8-22 22-22s22 9 22 22c0 4.5-3 7-7 7H17c-4 0-7-2.5-7-7z" fill="#a9d6f5" opacity=".9" stroke="#7fb3dd" stroke-width="2"/><ellipse cx="32" cy="27" rx="9" ry="6" fill="#eaf7ff" opacity=".95"/><path d="M18 40q-3 7 1 13M26 41q-2 8 2 14M34 41q3 8-1 14M43 40q4 6 1 12" fill="none" stroke="#9fd0ef" stroke-width="2.4" stroke-linecap="round" opacity=".85"/><circle cx="24" cy="14" r="1.4" fill="#fff" opacity=".9"/><circle cx="41" cy="17" r="1.1" fill="#fff" opacity=".8"/></svg>`,
    radio: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M44 22L54 8" stroke="#5c3a20" stroke-width="2.2" stroke-linecap="round"/><circle cx="55" cy="7" r="2" fill="#c98f3d"/><rect x="9" y="22" width="46" height="30" rx="5" fill="#8a5a33" stroke="#5c3a20" stroke-width="2"/><rect x="14" y="28" width="21" height="17" rx="2" fill="#4a2e18"/><path d="M18 28v17M22 28v17M26 28v17M30 28v17" stroke="#6b4426" stroke-width="1.6"/><circle cx="45" cy="32" r="4.6" fill="#f2e6d0" stroke="#5c3a20" stroke-width="1.6"/><path d="M45 32l2.6-3" stroke="#c0392b" stroke-width="1.4" stroke-linecap="round"/><circle cx="42" cy="45" r="2.4" fill="#f2e6d0" stroke="#5c3a20" stroke-width="1.4"/><circle cx="49" cy="45" r="2.4" fill="#f2e6d0" stroke="#5c3a20" stroke-width="1.4"/><path d="M18 12q2 3 0 6M23 10q2.6 4 0 9" fill="none" stroke="#c9b183" stroke-width="1.6" stroke-linecap="round" opacity=".8"/></svg>`,
    wishStone: `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="36" r="22" fill="#b48ae0" opacity=".22"/><circle cx="32" cy="36" r="15" fill="#b48ae0" opacity=".28"/><path d="M20 42c-1.5-9 5.5-17.5 15.5-17.5 9 0 15.5 7 14.5 15.5-.9 7.5-7.5 12-16 12-7.5 0-13-3.5-14-10z" fill="#8a6cc0" stroke="#6a4fa0" stroke-width="2"/><path d="M32 28l2.2 5 5 2.2-5 2.2-2.2 5-2.2-5-5-2.2 5-2.2z" fill="#ffe9b3"/><circle cx="18" cy="20" r="1.5" fill="#ffe9b3" opacity=".9"/><circle cx="47" cy="18" r="1.1" fill="#ffe9b3" opacity=".8"/><circle cx="50" cy="44" r="1.3" fill="#ffe9b3" opacity=".7"/></svg>`,
    silverFish: `<svg viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="sf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef4fb"/><stop offset="1" stop-color="#b9c6d8"/></linearGradient></defs><ellipse cx="28" cy="34" rx="17" ry="10" fill="url(#sf)" stroke="#9fb2c8" stroke-width="2"/><path d="M43 34l12-7-3 7 3 7z" fill="#cdd8e6" stroke="#9fb2c8" stroke-width="2" stroke-linejoin="round"/><path d="M20 24.5q6-4.5 12 0" fill="none" stroke="#9fb2c8" stroke-width="1.8" stroke-linecap="round"/><path d="M22 40q5 3.5 10 0" fill="none" stroke="#9fb2c8" stroke-width="1.8" stroke-linecap="round" opacity=".8"/><circle cx="16.5" cy="31.5" r="2" fill="#3a2c18"/><path d="M31 30a6 6 0 0 1 4 5" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".8"/><circle cx="12" cy="22" r="1.3" fill="#fff" opacity=".8"/><circle cx="50" cy="18" r="1.5" fill="#ffe9b3"/></svg>`,
    cloudCan: `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M20 18c0-4 3.5-6.5 7-6.5 1.5-3 5-4.5 8-3.5 3-2.5 8-1.5 9.5 2 3.5.5 6 3.5 6 6.5 0 4-3.5 7-7.5 7h-15c-4.5 0-8-2.5-8-5.5z" fill="#f7f9ff" stroke="#c9d4e6" stroke-width="1.8"/><rect x="17" y="27" width="30" height="26" rx="4" fill="#dde3ec" stroke="#9aa4b4" stroke-width="2"/><rect x="18" y="35" width="28" height="9" fill="#f2a2a8" opacity=".85"/><path d="M17 35h30M17 44h30" stroke="#9aa4b4" stroke-width="1.2" opacity=".7"/><ellipse cx="32" cy="27" rx="15" ry="3.4" fill="#c3cad6" stroke="#9aa4b4" stroke-width="1.8"/><circle cx="27" cy="49" r="1.2" fill="#fff" opacity=".8"/><circle cx="38" cy="51" r="1" fill="#fff" opacity=".7"/><path d="M45 12l1.4 3 3 1.4-3 1.4-1.4 3-1.4-3-3-1.4 3-1.4z" fill="#ffe9b3"/></svg>`
  };

  const ITEMS = [
    { name: '银色小鱼', rarity: 'common', weight: 10, icon: ICONS.silverFish,
      desc: '鳞片映着月光，像一把会游泳的小钥匙。',
      share: '今晚在月光钓鱼小铺，钓到一把银色的、开锁童年的小钥匙 🐟' },
    { name: '漂流瓶', rarity: 'common', weight: 10, icon: ICONS.bottle,
      desc: '瓶塞很紧，里面的信纸居然还是干的。',
      share: '从湖里捡到一封陌生海岸寄来的信 🫙' },
    { name: '旧电台', rarity: 'common', weight: 10, icon: ICONS.radio,
      desc: '沙沙声里，正播着一首没人记得名字的歌。',
      share: '钓到昨天的电台广播， signal 有点潮 📻' },
    { name: '星星鱼', rarity: 'rare', weight: 4, icon: ICONS.starFish,
      desc: '尾巴上还挂着没熄灭的星光，扑腾一下撒你一身亮。',
      share: '今晚钓到了一颗会游泳的星星 ✨' },
    { name: '月亮贝壳', rarity: 'rare', weight: 4, icon: ICONS.moonShell,
      desc: '贴在耳边，能听见潮汐的摇篮曲。',
      share: '月亮掉进湖里，被我捞起来揣回了口袋 🌙' },
    { name: '发光水母', rarity: 'rare', weight: 4, icon: ICONS.jelly,
      desc: '像一盏不小心落进水里的灯，凉凉的、亮亮的。',
      share: '今晚的灯，是一只水母帮我点亮的 🪼' },
    { name: '云朵罐头', rarity: 'rare', weight: 4, icon: ICONS.cloudCan,
      desc: '打开盖子，一朵小云慢悠悠地飘了出来。',
      share: '开罐即食的云朵，味道像下雨前的风 ☁️' },
    { name: '许愿石', rarity: 'legendary', weight: 1.5, icon: ICONS.wishStone,
      desc: '握紧三秒，据说愿望会自己先游回湖里排队。',
      share: '钓到了传说里会实现愿望的石头，许了一个不告诉你的 🌟' }
  ];

  const RARITY = {
    common: { label: '寻 常', cls: 'c' },
    rare: { label: '稀 有', cls: 'r' },
    legendary: { label: '传 说', cls: 'l' }
  };

  function pickItem() {
    const total = ITEMS.reduce((s, it) => s + it.weight, 0);
    let t = Math.random() * total;
    for (const it of ITEMS) { t -= it.weight; if (t <= 0) return it; }
    return ITEMS[ITEMS.length - 1];
  }

  /* ---------------- 环境装饰 ---------------- */
  (function makeStars() {
    const box = $('stars');
    let html = '';
    for (let i = 0; i < 70; i++) {
      const size = Math.random() < 0.14 ? 3 : 2;
      html += `<span class="star" style="left:${rand(0, 100).toFixed(1)}%;top:${rand(0, 52).toFixed(1)}%;width:${size}px;height:${size}px;animation-duration:${rand(1.8, 4.5).toFixed(2)}s;animation-delay:-${rand(0, 4).toFixed(2)}s"></span>`;
    }
    box.innerHTML = html;
  })();

  (function makeStreaks() {
    const road = $('moonRoad');
    let html = '';
    for (let i = 0; i < 7; i++) {
      html += `<span class="streak" style="top:${rand(6, 86).toFixed(0)}%;width:${rand(26, 84).toFixed(0)}%;left:${rand(-14, 14).toFixed(0)}px;animation-duration:${rand(2.2, 4.2).toFixed(2)}s;animation-delay:-${rand(0, 3).toFixed(2)}s"></span>`;
    }
    road.insertAdjacentHTML('beforeend', html);
  })();

  (function makeFireflies() {
    const box = $('fireflies');
    let html = '';
    for (let i = 0; i < 14; i++) {
      html += `<span class="fly" style="left:${rand(4, 94).toFixed(1)}%;top:${rand(30, 86).toFixed(1)}%;--dx:${rand(-70, 70).toFixed(0)}px;--dy:${rand(-46, 26).toFixed(0)}px;--fd:${rand(7, 14).toFixed(1)}s;animation-delay:-${rand(0, 9).toFixed(1)}s"></span>`;
    }
    box.innerHTML = html;
  })();

  (function shootingStars() {
    const box = $('shooting');
    function spawn() {
      const el = document.createElement('span');
      el.className = 'shoot';
      el.style.left = rand(12, 72).toFixed(1) + '%';
      el.style.top = rand(4, 24).toFixed(1) + '%';
      el.style.setProperty('--len', rand(70, 130).toFixed(0) + 'px');
      el.style.setProperty('--ang', rand(22, 40).toFixed(0) + 'deg');
      el.style.animationDuration = rand(0.9, 1.5).toFixed(2) + 's';
      box.appendChild(el);
      setTimeout(() => el.remove(), 1800);
      setTimeout(spawn, rand(7000, 16000));
    }
    setTimeout(spawn, rand(3000, 7000));
  })();

  /* ---------------- 特效 ---------------- */
  function ripple(x, y, opts = {}) {
    const max = opts.max || 90;
    const dur = opts.dur || 1100;
    const delay = opts.delay || 0;
    const r = document.createElement('span');
    r.className = 'ripple';
    r.style.left = x + 'px';
    r.style.top = y + 'px';
    r.style.setProperty('--rmax', String(max));
    r.style.animationDuration = dur + 'ms';
    r.style.animationDelay = delay + 'ms';
    fx.appendChild(r);
    setTimeout(() => r.remove(), dur + delay + 150);
  }

  function splash(x, y) {
    ripple(x, y, { max: 120, dur: 1000 });
    ripple(x, y, { max: 78, dur: 900, delay: 160 });
    ripple(x, y, { max: 46, dur: 800, delay: 320 });
    for (let i = 0; i < 6; i++) {
      const d = document.createElement('span');
      d.className = 'drop';
      const ang = rand(-155, -25) * Math.PI / 180;
      const v = rand(28, 78);
      d.style.left = x + 'px';
      d.style.top = y + 'px';
      d.style.setProperty('--tx', (Math.cos(ang) * v).toFixed(0) + 'px');
      d.style.setProperty('--ty', (Math.sin(ang) * v).toFixed(0) + 'px');
      d.style.animationDuration = rand(500, 780).toFixed(0) + 'ms';
      fx.appendChild(d);
      setTimeout(() => d.remove(), 950);
    }
  }

  function sparkleBurst(x, y) {
    for (let i = 0; i < 7; i++) {
      const s = document.createElement('span');
      s.className = 'spark';
      s.textContent = '✦';
      s.style.left = x + 'px';
      s.style.top = y + 'px';
      s.style.setProperty('--tx', rand(-80, 80).toFixed(0) + 'px');
      s.style.setProperty('--ty', rand(-100, -24).toFixed(0) + 'px');
      s.style.animationDuration = rand(750, 1150).toFixed(0) + 'ms';
      fx.appendChild(s);
      setTimeout(() => s.remove(), 1400);
    }
  }

  let toastTimer = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1700);
  }

  /* ---------------- 状态机 ---------------- */
  const HINT_IDLE = '点「抛竿」，把鱼线送进月光里';

  let phase = 'idle'; // idle | casting | waiting | nibble | reeling | result
  let cur = { x: 0, y: 0 };        // 浮漂当前坐标（用于收线动画）
  let land = { x: 0, y: 0 };       // 落点
  let landFrac = 0.4;              // 落点在湖面中的高度比例（窗口变化时校正）
  let nibbleTimer = 0;
  let missTimer = 0;
  let nibbleRipTimer = 0;
  let floatRipTimer = 0;
  let lineRAF = 0;
  let lastCatch = null;
  let count = 0;

  try { count = parseInt(localStorage.getItem('mfs-count') || '0', 10) || 0; } catch (e) { /* 忽略 */ }
  countEl.textContent = count;

  const waterTop = () => waterEl.getBoundingClientRect().top;
  const tipPoint = () => {
    const r = tipRing.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };
  const bobPoint = () => {
    const r = ballEl.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  };

  function setBtn(label, enabled, stateAttr) {
    btn.textContent = label;
    btn.disabled = !enabled;
    btn.dataset.state = stateAttr;
  }
  function setHint(t) { hint.textContent = t; }

  /* ---------------- 鱼线绘制 ---------------- */
  function startLine() {
    cancelAnimationFrame(lineRAF);
    const loop = () => {
      const t = tipPoint();
      const b = bobPoint();
      const dist = Math.hypot(b.x - t.x, b.y - t.y);
      let sag = dist * 0.1;
      if (phase === 'casting') sag = dist * 0.05;
      if (phase === 'waiting') sag = dist * 0.16;
      if (phase === 'nibble') sag = dist * 0.16 + Math.sin(Date.now() / 110) * 5;
      const mx = (t.x + b.x) / 2;
      const my = (t.y + b.y) / 2 + sag;
      linePath.setAttribute('d', `M ${t.x.toFixed(1)} ${t.y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`);
      lineRAF = requestAnimationFrame(loop);
    };
    loop();
  }
  function stopLine() {
    cancelAnimationFrame(lineRAF);
    linePath.setAttribute('d', '');
  }

  function clearTimers() {
    clearTimeout(nibbleTimer);
    clearTimeout(missTimer);
    clearTimeout(nibbleRipTimer);
    clearInterval(floatRipTimer);
  }

  /* ---------------- 抛竿 ---------------- */
  function cast() {
    if (phase !== 'idle') return;
    phase = 'casting';
    setBtn('抛竿中…', false, 'busy');
    setHint('鱼线划过月光——');
    bobber.style.opacity = '1';
    bobber.classList.remove('float', 'nibble');

    const from = tipPoint();
    const W = scene.clientWidth;
    const H = scene.clientHeight;
    const pierW = W < 640 ? W * 0.6 : Math.min(W * 0.46, 560);
    const xMin = Math.max(24, W * 0.1);
    const xMax = Math.max(xMin + 60, Math.min(W * 0.58, W - pierW - 70));
    const wt = waterTop();
    land = { x: rand(xMin, xMax), y: wt + (H - wt) * rand(0.3, 0.62) };
    landFrac = clamp((land.y - wt) / Math.max(1, H - wt), 0, 1);
    cur = { x: from.x, y: from.y };
    bobber.style.transform = `translate(${from.x}px, ${from.y}px)`;
    startLine();

    const arc = Math.min(H * 0.22, 170);
    const t0 = performance.now();
    const dur = 950;
    (function fly(now) {
      const t = clamp((now - t0) / dur, 0, 1);
      const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const x = from.x + (land.x - from.x) * e;
      const y = from.y + (land.y - from.y) * e - Math.sin(Math.PI * e) * arc;
      cur = { x, y };
      bobber.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      if (t < 1) requestAnimationFrame(fly);
      else { splash(land.x, land.y); startFloat(); }
    })(t0);
  }

  /* ---------------- 等待咬钩 ---------------- */
  function startFloat() {
    phase = 'waiting';
    bobber.classList.add('float');
    setBtn('等鱼上钩…', false, 'busy');
    setHint('月光很静，湖面很轻…');
    clearInterval(floatRipTimer);
    floatRipTimer = setInterval(() => {
      const p = bobPoint();
      ripple(p.x, p.y + 6, { max: 34, dur: 1300 });
    }, 2900);
    nibbleTimer = setTimeout(startNibble, rand(1000, 3000));
  }

  function startNibble() {
    if (phase !== 'waiting') return;
    phase = 'nibble';
    bobber.classList.add('nibble');
    setBtn('收线！', true, 'action');
    setHint('浮漂在抖！马上收线！');
    const loopRip = () => {
      if (phase !== 'nibble') return;
      const p = bobPoint();
      ripple(p.x, p.y + 4, { max: 46, dur: 900 });
      nibbleRipTimer = setTimeout(loopRip, 800);
    };
    loopRip();
    missTimer = setTimeout(missFish, 4600);
  }

  function missFish() {
    if (phase !== 'nibble') return;
    clearTimeout(nibbleRipTimer);
    bobber.classList.remove('nibble');
    phase = 'waiting';
    setBtn('等鱼上钩…', false, 'busy');
    setHint('小鱼溜走了，再耐心等等…');
    nibbleTimer = setTimeout(startNibble, rand(1400, 3200));
  }

  /* ---------------- 收线 ---------------- */
  function reel() {
    if (phase !== 'nibble') return;
    clearTimers();
    phase = 'reeling';
    bobber.classList.remove('nibble', 'float');
    setBtn('收线中…', false, 'busy');
    setHint('慢慢收——有分量！');
    const from = { x: cur.x, y: cur.y };
    const t0 = performance.now();
    const dur = 620;
    const arc = 54;
    (function pull(now) {
      const t = clamp((now - t0) / dur, 0, 1);
      const e = t * t * (3 - 2 * t);
      const tp = tipPoint();
      const x = from.x + (tp.x - from.x) * e;
      const y = from.y + (tp.y - from.y) * e - Math.sin(Math.PI * e) * arc;
      cur = { x, y };
      bobber.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      if (t < 1) requestAnimationFrame(pull);
      else {
        bobber.style.opacity = '0';
        stopLine();
        showCatch();
      }
    })(t0);
  }

  /* ---------------- 收获 ---------------- */
  function showCatch() {
    const item = pickItem();
    lastCatch = item;
    count++;
    try { localStorage.setItem('mfs-count', String(count)); } catch (e) { /* 忽略 */ }
    countEl.textContent = count;

    splash(land.x, land.y);
    sparkleBurst(land.x, land.y - 10);

    jumpEl.style.left = land.x + 'px';
    jumpEl.style.top = land.y + 'px';
    jumpEl.innerHTML = `<div class="jump-icon">${item.icon}</div>`;
    jumpEl.classList.remove('go');
    void jumpEl.offsetWidth;
    jumpEl.classList.add('go');

    setHint('出水啦——');
    phase = 'result';
    setTimeout(() => openCard(item), 820);
  }

  function openCard(item) {
    const r = RARITY[item.rarity];
    $('cardIcon').innerHTML = item.icon;
    $('cardRarity').textContent = r.label;
    $('cardRarity').className = 'rarity ' + r.cls;
    $('cardName').textContent = item.name;
    $('cardDesc').textContent = item.desc;
    $('cardShare').textContent = '「' + item.share + '」';
    modal.hidden = false;
    requestAnimationFrame(() => modal.classList.add('show'));
  }

  function closeModal() {
    modal.classList.remove('show');
    setTimeout(() => { modal.hidden = true; }, 210);
    jumpEl.innerHTML = '';
    jumpEl.classList.remove('go');
    bobber.style.opacity = '0';
    stopLine();
    phase = 'idle';
    setBtn('抛竿', true, 'idle');
    setHint(HINT_IDLE);
  }

  /* ---------------- 事件绑定 ---------------- */
  btn.addEventListener('click', () => {
    if (phase === 'idle') cast();
    else if (phase === 'nibble') reel();
  });

  $('againBtn').addEventListener('click', () => {
    closeModal();
    setTimeout(() => { if (phase === 'idle') cast(); }, 300);
  });

  modal.querySelector('.modal-mask').addEventListener('click', closeModal);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && phase === 'result') closeModal();
  });

  window.addEventListener('resize', () => {
    if (phase === 'waiting' || phase === 'nibble') {
      const wt = waterTop();
      land.y = wt + (scene.clientHeight - wt) * landFrac;
      cur = { x: land.x, y: land.y };
      bobber.style.transform = `translate(${land.x}px, ${land.y}px)`;
    }
  });

  $('copyBtn').addEventListener('click', async () => {
    if (!lastCatch) return;
    const text = `我在「月光钓鱼小铺」钓到了「${lastCatch.name}」！${lastCatch.share}`;
    try {
      await navigator.clipboard.writeText(text);
      toast('已复制，去分享吧 ✨');
    } catch (e) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
        toast('已复制，去分享吧 ✨');
      } catch (err) {
        toast('复制失败，请手动长按复制');
      }
    }
  });

  setBtn('抛竿', true, 'idle');
})();
