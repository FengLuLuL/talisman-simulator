// ============================================================
// 符咒数据库
// ============================================================
const TALISMANS = [
  {
    id:'thunder', name:'雷符', desc:'驱邪避凶\n震慑鬼神', color:'#ffd700',
    paths:[
      {type:'move',x:.3,y:.15},{type:'line',x:.7,y:.15},
      {type:'move',x:.5,y:.15},{type:'line',x:.5,y:.42},
      {type:'move',x:.28,y:.42},{type:'line',x:.72,y:.42},
      {type:'move',x:.35,y:.42},{type:'line',x:.25,y:.65},{type:'line',x:.45,y:.65},{type:'line',x:.35,y:.85},
      {type:'move',x:.65,y:.42},{type:'line',x:.55,y:.65},{type:'line',x:.75,y:.65},{type:'line',x:.65,y:.85},
    ]
  },
  {
    id:'fire', name:'火符', desc:'辟寒驱冷\n明照黑暗', color:'#ff4500',
    paths:[
      {type:'move',x:.5,y:.12},
      {type:'bezier',cx1:.5,cy1:.12,cx2:.72,cy2:.35,x:.68,y:.5},
      {type:'bezier',cx1:.68,cy1:.5,cx2:.75,cy2:.7,x:.5,y:.88},
      {type:'bezier',cx1:.5,cy1:.88,cx2:.25,cy2:.7,x:.32,y:.5},
      {type:'bezier',cx1:.32,cy1:.5,cx2:.28,cy2:.35,x:.5,y:.12},
      {type:'move',x:.5,y:.3},
      {type:'bezier',cx1:.5,cy1:.3,cx2:.62,cy2:.5,x:.5,y:.7},
      {type:'bezier',cx1:.5,cy1:.7,cx2:.38,cy2:.5,x:.5,y:.3},
      {type:'move',x:.3,y:.45},{type:'line',x:.7,y:.45},
    ]
  },
  {
    id:'water', name:'水符', desc:'净化污秽\n以柔克刚', color:'#00bfff',
    paths:[
      {type:'move',x:.5,y:.1},{type:'line',x:.5,y:.9},
      {type:'move',x:.25,y:.25},{type:'bezier',cx1:.25,cy1:.25,cx2:.5,cy2:.4,x:.75,y:.25},
      {type:'move',x:.25,y:.5},{type:'bezier',cx1:.25,cy1:.5,cx2:.5,cy2:.65,x:.75,y:.5},
      {type:'move',x:.25,y:.75},{type:'bezier',cx1:.25,cy1:.75,cx2:.5,cy2:.9,x:.75,y:.75},
    ]
  },
  {
    id:'peace', name:'平安符', desc:'出入平安\n一生顺遂', color:'#90ee90',
    paths:[
      {type:'move',x:.2,y:.2},{type:'line',x:.8,y:.2},{type:'line',x:.8,y:.8},{type:'line',x:.2,y:.8},{type:'line',x:.2,y:.2},
      {type:'move',x:.5,y:.2},{type:'line',x:.5,y:.8},
      {type:'move',x:.2,y:.5},{type:'line',x:.8,y:.5},
      {type:'move',x:.35,y:.35},{type:'line',x:.65,y:.65},
      {type:'move',x:.65,y:.35},{type:'line',x:.35,y:.65},
    ]
  },
  {
    id:'ward', name:'辟邪符', desc:'斩妖除魔\n护宅安家', color:'#da70d6',
    paths:[
      {type:'move',x:.5,y:.1},{type:'line',x:.5,y:.9},
      {type:'move',x:.1,y:.5},{type:'line',x:.9,y:.5},
      {type:'move',x:.22,y:.22},{type:'line',x:.78,y:.78},
      {type:'move',x:.78,y:.22},{type:'line',x:.22,y:.78},
      {type:'move',x:.5,y:.1},
      {type:'bezier',cx1:.7,cy1:.15,cx2:.85,cy2:.35,x:.9,y:.5},
      {type:'bezier',cx1:.85,cy1:.65,cx2:.7,cy2:.85,x:.5,y:.9},
      {type:'bezier',cx1:.3,cy1:.85,cx2:.15,cy2:.65,x:.1,y:.5},
      {type:'bezier',cx1:.15,cy1:.35,cx2:.3,cy2:.15,x:.5,y:.1},
    ]
  },
  {
    id:'luck', name:'聚财符', desc:'招财进宝\n财运亨通', color:'#ffd700',
    paths:[
      {type:'move',x:.5,y:.1},{type:'line',x:.7,y:.4},{type:'line',x:.95,y:.4},
      {type:'line',x:.75,y:.6},{type:'line',x:.82,y:.9},{type:'line',x:.5,y:.72},
      {type:'line',x:.18,y:.9},{type:'line',x:.25,y:.6},{type:'line',x:.05,y:.4},
      {type:'line',x:.3,y:.4},{type:'line',x:.5,y:.1},
    ]
  },
];

const BRUSH_COLORS = [
  {name:'墨金',value:'#e8c97d'},{name:'烈焰',value:'#ff4500'},
  {name:'灵蓝',value:'#00bfff'},{name:'玉白',value:'#f0f0f0'},
  {name:'紫气',value:'#da70d6'},{name:'翠绿',value:'#90ee90'},
  {name:'朱砂',value:'#ff2020'},
];

// 每种符的激活特效配置
const TALISMAN_FX = {
  thunder:{ label:'⚡ 雷符激活！', sub:'天雷滚滚，鬼神辟易！', color:'#ffd700' },
  fire:   { label:'🔥 火符燃起！', sub:'烈焰冲天，驱散阴霾！', color:'#ff4500' },
  water:  { label:'💧 水符流转！', sub:'以柔克刚，净化万物！', color:'#00bfff' },
  peace:  { label:'☮ 平安符成！', sub:'祥和护体，一路平安！', color:'#90ee90' },
  ward:   { label:'✦ 辟邪符显！', sub:'紫气东来，妖魔远遁！', color:'#da70d6' },
  luck:   { label:'★ 聚财符现！', sub:'财源滚滚，鸿运当头！', color:'#ffd700' },
};
