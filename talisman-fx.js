// ============================================================
// 粒子系统
// ============================================================
function spawnParticles(x, y) {
  for (let i=0; i<2; i++) {
    const a = Math.random()*Math.PI*2;
    const sp = Math.random()*2+.5;
    S.particles.push({ x,y, vx:Math.cos(a)*sp, vy:Math.sin(a)*sp-1,
      life:1, size:Math.random()*3+1, color:S.brushColor });
  }
}
function updateParticles() {
  S.particles = S.particles.filter(p=>p.life>0);
  S.particles.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=.06; p.life-=.03; });
}
function drawParticles(ctx) {
  S.particles.forEach(p=>{
    ctx.globalAlpha=p.life;
    ctx.beginPath(); ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
    ctx.fillStyle=p.color; ctx.shadowColor=p.color; ctx.shadowBlur=6; ctx.fill();
  });
  ctx.globalAlpha=1; ctx.shadowBlur=0;
}

// ============================================================
// 激活特效粒子
// ============================================================
function spawnActivationFx(cx, cy, color) {
  // 多层爆炸
  for (let i=0; i<120; i++) {
    const a = (i/120)*Math.PI*2;
    const sp = Math.random()*8+3;
    S.fxParticles.push({
      x:cx, y:cy,
      vx:Math.cos(a)*sp, vy:Math.sin(a)*sp,
      life:1, decay:Math.random()*.012+.007,
      size:Math.random()*7+2,
      color, type:'circle',
    });
  }
  // 白色内爆
  for (let i=0; i<40; i++) {
    const a = Math.random()*Math.PI*2;
    const sp = Math.random()*12+5;
    S.fxParticles.push({
      x:cx, y:cy,
      vx:Math.cos(a)*sp, vy:Math.sin(a)*sp,
      life:1, decay:.02,
      size:Math.random()*4+1,
      color:'#ffffff', type:'circle',
    });
  }
  // 冲击波圈
  for (let i=0; i<4; i++) {
    S.fxParticles.push({
      x:cx, y:cy,
      radius:10+i*30, maxR:500,
      life:0.9-i*.12, decay:.011,
      color, type:'shockwave',
      delay:i*6, delayLeft:i*6,
    });
  }
  // 星星雨
  for (let i=0; i<50; i++) {
    S.fxParticles.push({
      x:cx+(Math.random()-.5)*400,
      y:cy-(Math.random()*150),
      vx:(Math.random()-.5)*4,
      vy:-(Math.random()*6+2),
      life:1, decay:.007,
      size:Math.random()*12+4,
      color, type:'star',
    });
  }
  flashScreen(color, 200);
}

function updateFxParticles() {
  S.fxParticles = S.fxParticles.filter(p=>p.life>0);
  S.fxParticles.forEach(p=>{
    if ((p.delayLeft||0)>0){ p.delayLeft--; return; }
    if (p.type==='shockwave'){ p.radius+=9; p.life-=p.decay; return; }
    p.x+=p.vx; p.y+=p.vy;
    p.vy+=.07; p.vx*=.99;
    p.life-=p.decay;
  });
}

function drawFxParticles() {
  fCtx.clearRect(0,0,fxCanvas.width,fxCanvas.height);
  drawBurnParticles();
  S.fxParticles.forEach(p=>{
    if ((p.delayLeft||0)>0) return;
    fCtx.save();
    fCtx.globalAlpha=Math.max(0,p.life);
    if (p.type==='shockwave'){
      fCtx.beginPath(); fCtx.arc(p.x,p.y,p.radius,0,Math.PI*2);
      fCtx.strokeStyle=p.color; fCtx.lineWidth=2.5;
      fCtx.shadowColor=p.color; fCtx.shadowBlur=12; fCtx.stroke();
    } else if (p.type==='star'){
      drawStar(fCtx, p.x, p.y, p.size, p.color);
    } else {
      fCtx.beginPath(); fCtx.arc(p.x,p.y,Math.max(.5,p.size),0,Math.PI*2);
      fCtx.fillStyle=p.color; fCtx.shadowColor=p.color; fCtx.shadowBlur=8; fCtx.fill();
    }
    fCtx.restore();
  });
}

function drawStar(ctx, cx, cy, r, color) {
  ctx.beginPath();
  for (let i=0;i<10;i++){
    const a=(i/10)*Math.PI*2-Math.PI/2;
    const rd=i%2===0?r:r*.42;
    i===0?ctx.moveTo(cx+Math.cos(a)*rd,cy+Math.sin(a)*rd)
         :ctx.lineTo(cx+Math.cos(a)*rd,cy+Math.sin(a)*rd);
  }
  ctx.closePath();
  ctx.fillStyle=color; ctx.shadowColor=color; ctx.shadowBlur=10; ctx.fill();
}

function flashScreen(color, dur) {
  const d = document.createElement('div');
  d.style.cssText=`position:fixed;inset:0;background:${color};opacity:.5;pointer-events:none;z-index:170;transition:opacity ${dur}ms ease-out`;
  document.body.appendChild(d);
  requestAnimationFrame(()=>{ d.style.opacity='0'; });
  setTimeout(()=>d.remove(), dur+50);
}

// ============================================================
// 音效
// ============================================================
function playActivateSound() {
  try {
    const ac = new (window.AudioContext||window.webkitAudioContext)();
    [523,659,784,1047].forEach((f,i)=>{
      const o=ac.createOscillator(), g=ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type='sine'; o.frequency.value=f;
      g.gain.setValueAtTime(.15, ac.currentTime+i*.12);
      g.gain.exponentialRampToValueAtTime(.001, ac.currentTime+i*.12+.5);
      o.start(ac.currentTime+i*.12); o.stop(ac.currentTime+i*.12+.6);
    });
  } catch(e){}
}

// ============================================================
// 手势骨架
// ============================================================
const HAND_CONN=[[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],
  [5,9],[9,10],[10,11],[11,12],[9,13],[13,14],[14,15],[15,16],
  [13,17],[17,18],[18,19],[19,20],[0,17]];

function drawHandSkeleton(landmarks) {
  const w=handCanvas.width, h=handCanvas.height;
  hCtx.clearRect(0,0,w,h);
  const pts=landmarks.map(lm=>({x:(1-lm.x)*w, y:lm.y*h}));
  hCtx.strokeStyle='rgba(255,200,100,.45)'; hCtx.lineWidth=1.5;
  HAND_CONN.forEach(([a,b])=>{
    hCtx.beginPath(); hCtx.moveTo(pts[a].x,pts[a].y); hCtx.lineTo(pts[b].x,pts[b].y); hCtx.stroke();
  });
  pts.forEach((p,i)=>{
    hCtx.beginPath();
    hCtx.arc(p.x,p.y,i===8?8:3,0,Math.PI*2);
    hCtx.fillStyle=i===8?'#e8c97d':'rgba(255,200,100,.7)';
    if(i===8){hCtx.shadowColor='#e8c97d';hCtx.shadowBlur=12;}
    hCtx.fill(); hCtx.shadowBlur=0;
  });
  // 绘制绘画粒子
  drawParticles(hCtx);
}

// ============================================================
// 手势分析
// ============================================================
// 捏合检测状态（防误触发）
let pinchFrames = 0;

function analyzeHand(lm) {
  const ext=(tip,mid)=>lm[tip].y < lm[mid].y;
  const idx=ext(8,6), mid=ext(12,10), rng=ext(16,14), pky=ext(20,18);
  const thm=Math.abs(lm[4].x-lm[0].x)>.1;

  // 捏合检测：食指指尖(8)和拇指指尖(4)的距离
  const pinchDist = Math.sqrt(
    Math.pow(lm[8].x - lm[4].x, 2) + Math.pow(lm[8].y - lm[4].y, 2)
  );
  const isPinch = pinchDist < 0.05; // 捏合阈值

  // 五指全开 → 激活
  if (idx && mid && rng && pky && thm) return {mode:'open', tip:lm[8]};

  // 食指伸出，其他手指收起 → 绘画
  if (idx && !mid && !rng) {
    pinchFrames = 0; // 重置捏合计数
    return {mode:'draw', tip:lm[8]};
  }

  // 食指中指伸出 → 抬笔
  if (idx && mid && !rng) {
    pinchFrames = 0;
    return {mode:'lift', tip:lm[8]};
  }

  // 食指和拇指捏合 → 召唤符纸
  if (isPinch) {
    pinchFrames++;
    // 连续捏合10帧（约0.3秒）才触发召唤，防止误触
    if (pinchFrames >= 10) {
      return {mode:'pinch', tip:lm[8]};
    }
  } else {
    pinchFrames = 0;
  }

  // 其他情况 → 暂停
  return {mode:'pause',tip:null};
}

// ============================================================
// 主渲染循环
// ============================================================
function renderLoop() {
  updateParticles();
  updateFxParticles();
  updatePaper();
  if (S.lastHandLandmarks) drawHandSkeleton(S.lastHandLandmarks);
  else { hCtx.clearRect(0,0,handCanvas.width,handCanvas.height); }
  drawPaper();
  drawFxParticles();
  requestAnimationFrame(renderLoop);
}

// ============================================================
// 手势回调
// ============================================================
function onHandResults(results) {
  const w=drawCanvas.width, h=drawCanvas.height;
  if (!results.multiHandLandmarks || !results.multiHandLandmarks.length) {
    S.lastHandLandmarks=null; S.openFrames=0;
    gestureStatus.textContent='未检测到手';
    if(S.isDrawing){ S.isDrawing=false; S.lastX=null; S.lastY=null; }
    modeIndicator.style.opacity='0'; return;
  }
  const landmarks=results.multiHandLandmarks[0];
  S.lastHandLandmarks=landmarks;
  const g=analyzeHand(landmarks);
  const tx=g.tip?(1-g.tip.x)*w:null;
  const ty=g.tip?g.tip.y*h:null;

  switch(g.mode){
    case 'open':
      gestureStatus.textContent='激活 🖐';
      modeIndicator.textContent='🖐 激活！'; modeIndicator.style.opacity='1';
      S.openFrames++;
      if(S.openFrames>=2) tryActivate();
      if(S.isDrawing){ S.isDrawing=false; S.lastX=null; S.lastY=null; }
      break;
    case 'draw':
      S.openFrames=0;
      gestureStatus.textContent='绘画 ✏️';
      modeIndicator.textContent='✏️ 绘画中'; modeIndicator.style.opacity='1';
      if(!S.isDrawing){ S.isDrawing=true; S.lastX=tx; S.lastY=ty; }
      else drawStroke(tx, ty);
      break;
    case 'lift':
      S.openFrames=0;
      gestureStatus.textContent='抬笔 ✌️';
      modeIndicator.textContent='✌️ 抬笔'; modeIndicator.style.opacity='1';
      S.isDrawing=false; S.lastX=null; S.lastY=null;
      break;
    case 'pinch':
      gestureStatus.textContent='召唤符纸 🤏';
      modeIndicator.textContent='🤏 召唤！'; modeIndicator.style.opacity='1';
      S.openFrames=0;
      if(S.isDrawing){ S.isDrawing=false; S.lastX=null; S.lastY=null; }
      // 召唤符纸
      summonPaper();
      // 重置捏合计数，防止连续触发
      pinchFrames = 0;
      break;
    case 'pause':
      S.openFrames=0;
      gestureStatus.textContent='暂停 ✊';
      modeIndicator.textContent='✊ 暂停'; modeIndicator.style.opacity='1';
      S.isDrawing=false;
      break;
  }
}

// ============================================================
// 控制面板事件
// ============================================================
$('brushSize').addEventListener('input',   e=>S.brushSize=+e.target.value);
$('glowStrength').addEventListener('input',e=>S.glowStrength=+e.target.value);

$('summonBtn').addEventListener('click', summonPaper);

$('toggleGuide').addEventListener('click',()=>{
  S.showGuide=!S.showGuide;
  $('toggleGuide').textContent=S.showGuide?'隐藏引导':'显示引导';
  S.showGuide ? drawGuide() : gCtx.clearRect(0,0,guideCanvas.width,guideCanvas.height);
});

$('clearBtn').addEventListener('click',()=>{
  dCtx.clearRect(0,0,drawCanvas.width,drawCanvas.height);
  fCtx.clearRect(0,0,fxCanvas.width,fxCanvas.height);
  S.particles=[]; S.fxParticles=[];
  S.lastX=null; S.lastY=null;
  S.activated=false; S.openFrames=0; S.similarity=0;
  updateSimilarityUI(0);
  similarityBar.style.opacity='0'; similarityLabel.style.opacity='0';
  completeBanner.classList.remove('show');
  if(S.paper){ S.paper.state='gone'; S.paper=null; }
  setPaperStatus('未召唤');
  gCtx.clearRect(0,0,guideCanvas.width,guideCanvas.height);
  showHint('已清除，重新召唤符纸开始吧！');
});

// ============================================================
// MediaPipe 初始化
// ============================================================
async function initHands() {
  loadingText.textContent='正在初始化摄像头…';
  const hands=new Hands({locateFile:f=>`https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}`});
  hands.setOptions({maxNumHands:1,modelComplexity:1,minDetectionConfidence:.75,minTrackingConfidence:.6});
  hands.onResults(onHandResults);
  try {
    const stream=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:1280},height:{ideal:720},facingMode:'user'}});
    video.srcObject=stream;
    await new Promise(r=>video.onloadedmetadata=r);
    video.style.opacity='1';
    loadingText.textContent='手势模型加载中…';
  } catch(e){ loadingText.textContent='摄像头错误：'+e.message; return; }
  const camera=new Camera(video,{
    onFrame:async()=>await hands.send({image:video}),
    width:1280,height:720,
  });
  camera.start().then(()=>{
    loadingText.textContent='就绪！';
    setTimeout(()=>{
      loadingOverlay.style.transition='opacity .8s';
      loadingOverlay.style.opacity='0';
      setTimeout(()=>loadingOverlay.style.display='none',800);
      summonHint.style.opacity='1';
      showHint('请先选择一种符咒，再点击"召唤符纸"');
      renderLoop();
    },800);
  });
}

// ============================================================
// 启动
// ============================================================
buildColorRow();
buildTalismanPanel();
syncActiveColor();
selectTalisman(TALISMANS[0].id);
initHands();
