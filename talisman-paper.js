// ============================================================
// 符纸系统
// ============================================================
const PAPER_W = 320, PAPER_H = 420;  // 符纸尺寸（逻辑）

function summonPaper() {
  if (!S.currentId) { showHint('请先选择一种符！'); return; }
  // 如果已有符纸且在燃烧/消失中，先清理
  if (S.paper && (S.paper.state === 'burning' || S.paper.state === 'ready')) {
    clearPaperDraw();
  }
  const cx = (window.innerWidth - 170 - 148) / 2 + 170;
  const cy = (window.innerHeight - 56 - 38) / 2 + 56;
  S.paper = {
    x: cx - PAPER_W/2,
    y: cy - PAPER_H/2,
    w: PAPER_W,
    h: PAPER_H,
    angle: (Math.random()-0.5)*4,  // 轻微随机倾斜
    state: 'entering',             // entering|ready|burning|gone
    alpha: 0,
    enterY: cy - PAPER_H/2 - 120,  // 从上方飘入
    targetY: cy - PAPER_H/2,
    burnProgress: 0,
    burnParticles: [],
  };
  S.activated = false;
  S.similarity = 0;
  updateSimilarityUI(0);
  setPaperStatus('召唤中…');
  showHint('符纸飘来啦！伸出食指在纸上画符');
  drawGuide();
}

function clearPaperDraw() {
  dCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
  S.similarity = 0;
  updateSimilarityUI(0);
}

// 绘制符纸本体
function drawPaper() {
  if (!S.paper) return;
  const p = S.paper;
  if (p.state === 'gone') { pCtx.clearRect(0,0,paperCanvas.width,paperCanvas.height); return; }

  pCtx.clearRect(0, 0, paperCanvas.width, paperCanvas.height);

  pCtx.save();
  pCtx.globalAlpha = p.alpha;
  pCtx.translate(p.x + p.w/2, p.y + p.h/2);
  pCtx.rotate(p.angle * Math.PI/180);
  pCtx.translate(-p.w/2, -p.h/2);

  // 裁剪区域（符纸形状）
  pCtx.save();
  if (p.state === 'burning') {
    // 燃烧：从底部向上裁剪
    const burnY = p.h * p.burnProgress;
    pCtx.beginPath();
    pCtx.rect(0, 0, p.w, p.h - burnY);
    pCtx.clip();
  }

  // 符纸背景 — 黄色宣纸风格
  const grad = pCtx.createLinearGradient(0,0,p.w,p.h);
  grad.addColorStop(0,'#f5e6a0');
  grad.addColorStop(0.4,'#ede0b0');
  grad.addColorStop(1,'#d4c078');
  pCtx.fillStyle = grad;
  roundRect(pCtx, 0, 0, p.w, p.h, 8);
  pCtx.fill();

  // 纸纹理噪点（用随机点模拟）
  pCtx.globalAlpha = 0.06;
  for (let i=0; i<60; i++) {
    pCtx.fillStyle = '#8b6914';
    pCtx.fillRect(Math.random()*p.w, Math.random()*p.h, Math.random()*3+1, Math.random()*3+1);
  }
  pCtx.globalAlpha = p.alpha;

  // 边框
  pCtx.strokeStyle = '#8b6914';
  pCtx.lineWidth = 2.5;
  pCtx.shadowColor = 'rgba(0,0,0,.4)';
  pCtx.shadowBlur = 12;
  roundRect(pCtx, 0, 0, p.w, p.h, 8);
  pCtx.stroke();
  pCtx.shadowBlur = 0;

  // 内边框装饰
  pCtx.strokeStyle = 'rgba(139,105,20,.4)';
  pCtx.lineWidth = 1;
  roundRect(pCtx, 6, 6, p.w-12, p.h-12, 5);
  pCtx.stroke();

  pCtx.restore(); // 恢复clip

  // 燃烧火焰边缘
  if (p.state === 'burning') {
    drawBurnEdge(p);
  }

  pCtx.restore();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.lineTo(x+w-r, y);
  ctx.arcTo(x+w, y, x+w, y+r, r);
  ctx.lineTo(x+w, y+h-r);
  ctx.arcTo(x+w, y+h, x+w-r, y+h, r);
  ctx.lineTo(x+r, y+h);
  ctx.arcTo(x, y+h, x, y+h-r, r);
  ctx.lineTo(x, y+r);
  ctx.arcTo(x, y, x+r, y, r);
  ctx.closePath();
}

function drawBurnEdge(p) {
  const burnY = p.h * p.burnProgress;
  const edgeY = p.h - burnY;
  // 不规则锯齿火焰线
  pCtx.save();
  pCtx.beginPath();
  pCtx.moveTo(0, edgeY);
  for (let x=0; x<=p.w; x+=8) {
    const jitter = (Math.sin(x*0.3 + Date.now()*0.008)*12 + Math.random()*6);
    pCtx.lineTo(x, edgeY + jitter);
  }
  pCtx.lineTo(p.w, p.h);
  pCtx.lineTo(0, p.h);
  pCtx.closePath();
  const fg = pCtx.createLinearGradient(0, edgeY-20, 0, edgeY+30);
  fg.addColorStop(0,'rgba(255,200,0,0)');
  fg.addColorStop(0.4,'rgba(255,120,0,0.8)');
  fg.addColorStop(1,'rgba(0,0,0,0)');
  pCtx.fillStyle = fg;
  pCtx.fill();
  pCtx.restore();

  // 生成燃烧粒子
  if (Math.random() < 0.6) {
    for (let i=0; i<3; i++) {
      p.burnParticles.push({
        x: Math.random()*p.w,
        y: edgeY + (Math.random()-0.5)*10,
        vx: (Math.random()-.5)*1.5,
        vy: -(Math.random()*3+1.5),
        life: 1,
        size: Math.random()*5+2,
        color: Math.random()<.5 ? '#ff6600' : '#ffd700',
      });
    }
  }
}

// 更新符纸动画
function updatePaper() {
  if (!S.paper) return;
  const p = S.paper;

  if (p.state === 'entering') {
    p.alpha = Math.min(1, p.alpha + 0.05);
    p.y += (p.targetY - p.y) * 0.12;
    if (Math.abs(p.y - p.targetY) < 1 && p.alpha >= 0.98) {
      p.y = p.targetY;
      p.alpha = 1;
      p.state = 'ready';
      setPaperStatus('就绪，开始画符！');
      showHint('符纸就绪！伸出食指画符，画完张开五指激活！');
      drawGuide();
    }
  } else if (p.state === 'burning') {
    p.burnProgress += 0.008;
    // 更新燃烧粒子
    p.burnParticles = p.burnParticles.filter(pt => pt.life > 0);
    p.burnParticles.forEach(pt => {
      pt.x += pt.vx; pt.y += pt.vy;
      pt.vy -= 0.08;
      pt.life -= 0.025;
    });
    if (p.burnProgress >= 1) {
      p.state = 'gone';
      // 清理所有相关画布
      gCtx.clearRect(0, 0, guideCanvas.width, guideCanvas.height);  // 清除引导虚线
      pCtx.clearRect(0, 0, paperCanvas.width, paperCanvas.height); // 清除符纸
      dCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);  // 清除画笔轨迹
      setPaperStatus('未召唤');
      S.paper = null;
    }
  }
}

// 把燃烧粒子也画到fxCanvas（符纸坐标系）
function drawBurnParticles() {
  if (!S.paper || S.paper.state !== 'burning') return;
  const p = S.paper;
  fCtx.save();
  fCtx.translate(p.x + p.w/2, p.y + p.h/2);
  fCtx.rotate(p.angle * Math.PI/180);
  fCtx.translate(-p.w/2, -p.h/2);
  p.burnParticles.forEach(pt => {
    fCtx.globalAlpha = pt.life;
    fCtx.beginPath();
    fCtx.arc(pt.x, pt.y, pt.size, 0, Math.PI*2);
    fCtx.fillStyle = pt.color;
    fCtx.shadowColor = pt.color;
    fCtx.shadowBlur = 8;
    fCtx.fill();
  });
  fCtx.restore();
  fCtx.globalAlpha = 1;
  fCtx.shadowBlur = 0;
}

// ============================================================
// 将屏幕坐标转换到符纸本地坐标
// ============================================================
function screenToPaper(sx, sy) {
  if (!S.paper || S.paper.state !== 'ready') return null;
  const p = S.paper;
  const cx = p.x + p.w/2, cy = p.y + p.h/2;
  const rad = -p.angle * Math.PI/180;
  const dx = sx - cx, dy = sy - cy;
  const lx = dx*Math.cos(rad) - dy*Math.sin(rad) + p.w/2;
  const ly = dx*Math.sin(rad) + dy*Math.cos(rad) + p.h/2;
  return { lx, ly, inPaper: lx>=0 && lx<=p.w && ly>=0 && ly<=p.h };
}

// ============================================================
// 笔迹绘制（限制在符纸内）
// ============================================================
function drawStroke(sx, sy) {
  if (!S.paper || S.paper.state !== 'ready') return;
  const cur = screenToPaper(sx, sy);
  if (!cur || !cur.inPaper) { S.lastX = null; S.lastY = null; return; }
  if (S.lastX === null) { S.lastX = sx; S.lastY = sy; return; }

  const prev = screenToPaper(S.lastX, S.lastY);
  if (!prev || !prev.inPaper) { S.lastX = sx; S.lastY = sy; return; }

  // 在符纸坐标系内绘制（在drawCanvas上）
  const p = S.paper;
  dCtx.save();
  dCtx.translate(p.x + p.w/2, p.y + p.h/2);
  dCtx.rotate(p.angle * Math.PI/180);
  dCtx.translate(-p.w/2, -p.h/2);

  // 裁剪到符纸范围
  roundRect(dCtx, 2, 2, p.w-4, p.h-4, 7);
  dCtx.clip();

  dCtx.beginPath();
  dCtx.moveTo(prev.lx, prev.ly);
  dCtx.lineTo(cur.lx, cur.ly);
  dCtx.strokeStyle = S.brushColor;
  dCtx.lineWidth = S.brushSize;
  dCtx.lineCap = 'round';
  dCtx.lineJoin = 'round';
  dCtx.shadowColor = S.brushColor;
  dCtx.shadowBlur = S.glowStrength;
  dCtx.stroke();
  dCtx.shadowBlur = 0;
  // 亮芯
  dCtx.beginPath();
  dCtx.moveTo(prev.lx, prev.ly);
  dCtx.lineTo(cur.lx, cur.ly);
  dCtx.strokeStyle = 'rgba(255,255,255,.45)';
  dCtx.lineWidth = S.brushSize * 0.22;
  dCtx.stroke();

  dCtx.restore();

  // 粒子
  spawnParticles(sx, sy);

  S.lastX = sx; S.lastY = sy;
  // 节流计算相似度
  if (Math.random() < 0.08) calcSimilarity();
}
