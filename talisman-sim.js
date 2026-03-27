// ============================================================
// 相似度检测
// 原理：在离屏canvas分别渲染模板和用户笔迹，
//       对比两者在符纸格子内的像素覆盖率交集
// ============================================================
const SIM_SIZE = 64; // 采样分辨率

function calcSimilarity() {
  if (!S.paper || S.paper.state !== 'ready' || !S.currentId) return;
  const t = TALISMANS.find(t => t.id === S.currentId);
  if (!t) return;

  const p = S.paper;
  const N = SIM_SIZE;

  // --- 模板离屏canvas ---
  const tplCvs = new OffscreenCanvas(N, N);
  const tCtx = tplCvs.getContext('2d');
  tCtx.strokeStyle = '#fff';
  tCtx.lineWidth = 3;
  tCtx.lineCap = 'round';
  tCtx.lineJoin = 'round';
  renderPaths(tCtx, t, N, N, 0.12);

  // --- 用户笔迹：从drawCanvas采样（符纸坐标系内） ---
  const userCvs = new OffscreenCanvas(N, N);
  const uCtx = userCvs.getContext('2d');
  // 把drawCanvas对应符纸区域截出来
  uCtx.save();
  // 逆变换：先把符纸在屏幕上的区域画到N×N
  uCtx.translate(N/2, N/2);
  uCtx.rotate(-p.angle * Math.PI/180);
  uCtx.scale(N/p.w, N/p.h);
  uCtx.translate(-p.w/2, -p.h/2);
  uCtx.drawImage(drawCanvas, -p.x, -p.y, drawCanvas.width, drawCanvas.height);
  uCtx.restore();

  // --- 像素对比 ---
  const tData = tplCvs.getContext('2d').getImageData(0,0,N,N).data;
  const uData = userCvs.getContext('2d').getImageData(0,0,N,N).data;

  let tplCount = 0, matchCount = 0, extraCount = 0;
  for (let i=0; i<N*N; i++) {
    const tHit = tData[i*4+3] > 30;   // 模板有像素
    const uHit = uData[i*4+3] > 30;   // 用户有像素
    if (tHit) tplCount++;
    if (tHit && uHit) matchCount++;
    if (!tHit && uHit) extraCount++;   // 画到模板外（惩罚）
  }

  if (tplCount === 0) { S.similarity = 0; return; }

  // 覆盖率：用户覆盖了多少模板面积
  const coverage = matchCount / tplCount;
  // 惩罚多余笔迹（画到模板外超过30%则扣分）
  const penalty = Math.min(1, extraCount / (tplCount * 0.5));
  const raw = Math.max(0, coverage - penalty * 0.3);

  S.similarity = Math.min(1, raw);
  updateSimilarityUI(S.similarity);
}

function updateSimilarityUI(val) {
  const pct = Math.round(val * 100);
  similarityFill.style.width = pct + '%';
  similarityLabel.textContent = `匹配度：${pct}%`;

  if (val > 0.05) {
    similarityBar.style.opacity = '1';
    similarityLabel.style.opacity = '1';
  }

  if (val >= 0.55) {
    similarityFill.style.background = 'linear-gradient(90deg,#00ff88,#00bfff)';
    similarityFill.style.boxShadow = '0 0 8px #00ff88';
  } else if (val >= 0.35) {
    similarityFill.style.background = 'linear-gradient(90deg,#e8c97d,#ff6600)';
    similarityFill.style.boxShadow = '0 0 6px #ff6600';
  } else {
    similarityFill.style.background = 'linear-gradient(90deg,#e8c97d,#ff6600)';
    similarityFill.style.boxShadow = '0 0 6px #ff6600';
  }
}

// ============================================================
// 符咒激活判定
// ============================================================
const ACTIVATE_THRESHOLD = 0.45;  // 45% 覆盖率可激活

function tryActivate() {
  if (S.activated) return;
  if (!S.paper || S.paper.state !== 'ready') return;
  if (!S.currentId) return;
  calcSimilarity();

  if (S.similarity >= ACTIVATE_THRESHOLD) {
    S.activated = true;
    triggerActivation();
  } else {
    showHint(`匹配度 ${Math.round(S.similarity*100)}% 不够！需要 ${Math.round(ACTIVATE_THRESHOLD*100)}%，再多画几笔！`);
    // 抖动反馈
    shakeUI();
  }
}

function shakeUI() {
  const el = paperStatusBadge;
  el.style.transition = 'transform .05s';
  let n = 0;
  const iv = setInterval(() => {
    el.style.transform = `translateX(${n%2===0?4:-4}px)`;
    n++;
    if (n>6) { clearInterval(iv); el.style.transform=''; }
  }, 50);
}

function triggerActivation() {
  const fx = TALISMAN_FX[S.currentId] || { label:'✨ 符咒激活！', sub:'道法自然！', color:'#e8c97d' };
  const cx = (window.innerWidth - 170 - 148)/2 + 170;
  const cy = (window.innerHeight - 56 - 38)/2 + 56;

  // 开始燃烧符纸
  if (S.paper) {
    S.paper.state = 'burning';
    S.paper.burnProgress = 0;
    clearTimeout(null);

    // 立即清除虚线引导
    gCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);

    // 清除笔迹（延迟，等符纸开始燃烧后）
    setTimeout(() => {
      dCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    }, 400);
  }

  // 隐藏相似度UI
  similarityBar.style.opacity = '0';
  similarityLabel.style.opacity = '0';
  setPaperStatus('激活！');

  // 爆发特效
  spawnActivationFx(cx, cy, fx.color);

  // 完成横幅
  bannerTitle.textContent = fx.label;
  bannerTitle.style.color  = fx.color;
  bannerSub.textContent    = fx.sub;
  bannerSub.style.color    = fx.color;
  completeBanner.classList.add('show');
  setTimeout(() => completeBanner.classList.remove('show'), 3500);

  // 音效
  playActivateSound();
  showHint('符咒已激活！✨', 4000);
}
