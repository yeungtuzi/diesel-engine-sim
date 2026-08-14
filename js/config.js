// ============================================================================
// 发动机全局参数与运动学配置
// 世界单位：毫米 (1 unit = 1 mm)。坐标系：
//   Y 轴向上 = 气缸轴线方向；Z 轴 = 曲轴轴线方向（1→4 缸）；X 轴 = 横向。
// 剖切面：X = 0（保留 X < 0 一侧），可看到气缸/活塞/水套剖面。
// ============================================================================

export const DEG = Math.PI / 180;

export const P = {
  // —— 基础参数 ——
  numCyl: 4,
  bore: 92,               // 缸径 mm
  stroke: 110,            // 行程 mm
  crankRadius: 55,        // 曲柄半径 (行程/2)
  rodLength: 200,         // 连杆中心距
  cylSpacing: 112,        // 缸心距
  pistonCompHeight: 45,   // 活塞销中心 → 活塞顶
  compressionRatio: 17.5, // 压缩比（信息用）

  // —— 关键高度 (Y) ——
  crankY: 0,              // 曲轴中心线高度
  blockBottomY: -115,     // 机体底面（油底壳接合面）
  deckY: 300,             // 机体顶面（缸盖接合面）
  panBottomY: -205,       // 油底壳底部
  linerBottomY: 172,      // 缸套下沿
  headTopY: 400,          // 缸盖顶面

  // —— 机体外形 ——
  blockLen: 470,          // 机体长度 (Z)
  blockWidth: 210,        // 机体宽度 (X)

  // —— 配气机构布局 (OHV 顶置气门 / 下置凸轮轴) ——
  camX: -55,              // 凸轮轴横向位置
  camY: -38,              // 凸轮轴高度
  tappetTopY: 2,          // 挺柱顶面高度（闭合时）
  tappetCenterY: -10,     // 挺柱中心高度（闭合时）
  pushrodTopY: 380,       // 推杆顶端高度
  rockerY: 380,           // 摇臂轴高度
  valveSeatY: 300,        // 气门座（缸盖底面）
  valveStemTopY: 380,     // 气门杆顶端（与摇臂接触）

  // —— 气缸中心 Z 坐标（第 i 缸，i=0..3）——
  cylZ: (i) => (i - 1.5) * 112,   // -168, -56, 56, 168
};

// 各缸相位（单位：曲轴转角°）
// 定义：全局转角 theta=0 为第 1 缸“吸气上止点”。
// 点火顺序 1-3-4-2，点火间隔 180°。
export const CYL = {
  // 各缸“吸气冲程起点”在全局转角中的偏移（1,2,3,4 缸）
  cycleOffset: [0, 540, 180, 360],
  // 各缸曲柄销的物理夹角（1&4 同相位, 2&3 同相位，相差 180°）
  throwOffset: [0, 180, 180, 0],
  firingOrder: [1, 3, 4, 2],
};

// 配气相位（以“本缸吸气上止点”为 0 的相位角 p ∈ [0,720)）
export const VALVE = {
  intake:  { open: -15, close: 220, maxLift: 9.5, ramp: 42 },  // 进气门
  exhaust: { open: 495, close: 735, maxLift: 9.5, ramp: 42 },  // 排气门（关闭角 >720 表示越过上止点）
  injection: { start: 348, end: 366 },  // 喷油事件（压缩上止点前）
};

// 冲程划分（相位 p）
export const STROKE = {
  NAMES: ['吸气 Intake', '压缩 Compression', '做功 Power', '排气 Exhaust'],
  SHORT: ['吸气', '压缩', '做功', '排气'],
  EN: ['Intake', 'Compression', 'Power', 'Exhaust'],
  CLASS: ['intake', 'compress', 'power', 'exhaust'],
  // p 落在哪个区间
  of(p) {
    if (p < 180) return 0;
    if (p < 360) return 1;
    if (p < 540) return 2;
    return 3;
  },
};

// 图例分组（颜色区分）
export const LEGEND = [
  { group: '固定件 Fixed',      color: '#8fa8c8', keys: ['cylinder-block','cylinder-liner','cylinder-head','head-gasket','oil-pan','flywheel-housing','timing-cover','main-bearing-cap','bolt'] },
  { group: '运动件 Moving',     color: '#f0a35c', keys: ['piston','piston-ring','piston-pin','connecting-rod','rod-bearing','crankshaft','counterweight','flywheel','crankshaft-pulley'] },
  { group: '配气机构 Valvetrain', color: '#6fd08c', keys: ['camshaft','tappet','pushrod','rocker-arm','intake-valve','exhaust-valve','valve-spring','timing-gear'] },
  { group: '燃油系统 Fuel',      color: '#ff7b7b', keys: ['injection-pump','injector','fuel-filter','fuel-pipe'] },
  { group: '润滑系统 Lube',      color: '#f4c94a', keys: ['oil-pump','oil-filter','oil-gallery','oil-cooler'] },
  { group: '冷却系统 Cooling',   color: '#5ad1e6', keys: ['water-pump','thermostat','radiator','water-jacket','water-pipe'] },
  { group: '进排气 Intake/Exhaust', color: '#c79bff', keys: ['intake-manifold','exhaust-manifold','turbocharger','intercooler'] },
];
