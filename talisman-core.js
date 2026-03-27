// ============================================================
// 应用状态 & DOM引用
// ============================================================
const S = {
  isDrawing: false,
  lastX: null, lastY: null,
  openFrames: 0,
  prevMode: '',
  currentId: null,
  brushColor: '#e8c97d',
  brushSize: 5,
  glowStrength: 12,
  showGuide: true,
  particles: [],
  fxParticles: [],
  paper: null,    // 符纸对象
  similarity: 0,
  activated: false,
  lastHandLandmarks: null,
};

const video       = document.getElementById('video');
const paperCanvas = document.getElementById('paperCanvas');
const drawCanvas  = document.getElementById('drawCanvas');
const fxCanvas    = document.getElementById('fxCanvas');
const handCanvas  = document.getElementById('handCanvas');
const guideCanvas = document.getElementById('guideCanvas');
const pCtx = paperCanvas.getContext('2d');
const dCtx = drawCanvas.getContext('2d');
const fCtx = fxCanvas.getContext('2d');
const hCtx = handCanvas.getContext('2d');
const gCtx = guideCanvas.getContext('2d');

const $= id => document.getElementById(id);
const loadingOverlay   = $('loadingOverlay');
const loadingText      = $('loadingText');
const gestureStatus    = $('gestureStatus');
const paperStatusTxt   = $('paperStatusTxt');
const currentTalism    = $('currentTalisman');
const gestureHint      = $('gestureHint');
const modeIndicator    = $('modeIndicator');
const similarityBar    = $('similarityBar');
const similarityFill   = $('similarityFill');
const similarityLabel  = $('similarityLabel');
const summonHint       = $('summonHint');
const paperStatusBadge = $('paperStatus');
const completeBanner   = $('completeBanner');
const bannerTitle      = $('bannerTitle');
const bannerSub        = $('bannerSub');

// ============================================================
// 画布尺寸管理
// ============================================================
function resizeCanvases() {
  [paperCanvas, drawCanvas, fxCanvas, handCanvas, guideCanvas].forEach(c => {
    c.width  = window.innerWidth;
    c.height = window.innerHeight;
  });
  if (S.currentId) drawGuide();
  if (S.paper && S.paper.state !== 'idle') drawPaper();
}
window.addEventListener('resize', resizeCanvases);
resizeCanvases();

// ============================================================
// 左侧面板 & 颜色行
// ============================================================
function buildTalismanPanel() {
  const panel = $('talismanPanel');
  TALISMANS.forEach(t => {
    const card = document.createElement('div');
    card.className = 'talisman-card';
    card.dataset.id = t.id;

    const nm = document.createElement('div');
    nm.className = 't-name';
    nm.textContent = t.name;

    const cvs = document.createElement('canvas');
    cvs.className = 'talisman-preview';
    cvs.width = 155; cvs.height = 110;
    drawPreviewCanvas(cvs, t);

    const dc = document.createElement('div');
    dc.className = 't-desc';
    dc.innerHTML = t.desc.replace('\n','<br>');

    card.appendChild(nm);
    card.appendChild(cvs);
    card.appendChild(dc);
    card.addEventListener('click', () => selectTalisman(t.id));
    panel.appendChild(card);
  });
}

function drawPreviewCanvas(canvas, talisman) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  ctx.fillStyle = 'rgba(0,0,0,.6)';
  ctx.fillRect(0,0,w,h);
  ctx.strokeStyle = talisman.color;
  ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  ctx.shadowColor = talisman.color; ctx.shadowBlur = 6;
  renderPaths(ctx, talisman, w, h, 0.1);
}

function buildColorRow() {
  const row = $('colorRow');
  BRUSH_COLORS.forEach(c => {
    const d = document.createElement('div');
    d.className = 'color-dot';
    d.style.background = c.value;
    d.dataset.value = c.value;
    d.title = c.name;
    d.addEventListener('click', () => { S.brushColor = c.value; syncActiveColor(); });
    row.appendChild(d);
  });
}
function syncActiveColor() {
  document.querySelectorAll('.color-dot').forEach(d =>
    d.classList.toggle('active', d.dataset.value === S.brushColor));
}

// ============================================================
// 符咒路径通用渲染
// ============================================================
function renderPaths(ctx, talisman, w, h, pad=0) {
  ctx.beginPath();
  talisman.paths.forEach(p => {
    const x  = (p.x  * (1-2*pad) + pad) * w;
    const y  = (p.y  * (1-2*pad) + pad) * h;
    if (p.type==='move')        { ctx.moveTo(x, y); }
    else if (p.type==='line')   { ctx.lineTo(x, y); }
    else if (p.type==='bezier') {
      ctx.bezierCurveTo(
        (p.cx1*(1-2*pad)+pad)*w, (p.cy1*(1-2*pad)+pad)*h,
        (p.cx2*(1-2*pad)+pad)*w, (p.cy2*(1-2*pad)+pad)*h,
        x, y);
    }
  });
  ctx.stroke();
}

// ============================================================
// 选择符咒
// ============================================================
function selectTalisman(id) {
  S.currentId  = id;
  S.activated  = false;
  S.openFrames = 0;
  document.querySelectorAll('.talisman-card').forEach(c =>
    c.classList.toggle('active', c.dataset.id === id));
  const t = TALISMANS.find(t => t.id === id);
  currentTalism.textContent = t ? t.name : '未选择';
  S.brushColor = t ? t.color : S.brushColor;
  syncActiveColor();
  drawGuide();
  showHint(`已选 ${t.name} — 点击召唤符纸，再用食指画符！`);
  summonHint.style.opacity = '0';
}

// ============================================================
// 引导虚线层
// ============================================================
function drawGuide() {
  const w = guideCanvas.width, h = guideCanvas.height;
  gCtx.clearRect(0,0,w,h);
  
  // 检查条件：必须有选中的符咒、开启引导、并且符纸已就绪
  if (!S.currentId || !S.showGuide || !S.paper) return;
  
  const t = TALISMANS.find(t => t.id === S.currentId);
  if (!t) return;
  
  // 符纸必须是 ready 状态才显示引导线
  const p = S.paper;
  if (p.state !== 'ready') return;
  
  gCtx.save();
  // 变换到符纸坐标系
  gCtx.translate(p.x + p.w/2, p.y + p.h/2);
  gCtx.rotate(p.angle * Math.PI / 180);
  gCtx.translate(-p.w/2, -p.h/2);
  
  // 绘制虚线引导
  gCtx.strokeStyle = t.color;
  gCtx.lineWidth = 2.5;
  gCtx.lineCap = 'round';
  gCtx.lineJoin = 'round';
  gCtx.shadowColor = t.color;
  gCtx.shadowBlur = 10;
  gCtx.setLineDash([7, 5]);
  
  // 边距 12%
  renderPaths(gCtx, t, p.w, p.h, 0.12);
  
  gCtx.setLineDash([]);
  
  // 绘制起点标记
  const fm = t.paths.find(pp => pp.type === 'move');
  if (fm) {
    const sx = (fm.x * 0.76 + 0.12) * p.w;
    const sy = (fm.y * 0.76 + 0.12) * p.h;
    
    gCtx.beginPath();
    gCtx.arc(sx, sy, 9, 0, Math.PI * 2);
    gCtx.strokeStyle = t.color;
    gCtx.lineWidth = 1.5;
    gCtx.shadowBlur = 6;
    gCtx.stroke();
    
    gCtx.fillStyle = t.color;
    gCtx.font = '11px serif';
    gCtx.fillText('起', sx + 11, sy + 4);
  }
  
  gCtx.restore();
}

// ============================================================
// 提示
// ============================================================
let hintTimer = null;
function showHint(msg, dur=3000) {
  gestureHint.textContent = msg;
  gestureHint.style.opacity = '1';
  clearTimeout(hintTimer);
  hintTimer = setTimeout(() => { gestureHint.style.opacity = '0'; }, dur);
}
function setPaperStatus(txt) {
  paperStatusTxt.textContent = txt;
  paperStatusBadge.textContent = txt;
  paperStatusBadge.style.opacity = txt === '未召唤' ? '0' : '1';
}
