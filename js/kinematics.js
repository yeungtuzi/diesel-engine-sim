// ============================================================================
// 四冲程运动学：活塞往复、气门升程、冲程相位、喷油事件
// 全局曲轴转角 theta（度），0 = 第 1 缸吸气上止点。
// ============================================================================
import { P, CYL, VALVE, STROKE } from './config.js';

const R = P.crankRadius;
const L = P.rodLength;

// 曲柄滑块：给定曲柄角 beta（0=上止点），返回活塞销相对曲轴中心的高度
export function sliderPinY(betaDeg) {
  const b = betaDeg * Math.PI / 180;
  return R * Math.cos(b) + Math.sqrt(L * L - R * R * Math.sin(b) * Math.sin(b));
}

// 曲柄销在曲轴横截面内的位置（x=横向, y=向上）
export function crankPinVec(betaDeg) {
  const b = betaDeg * Math.PI / 180;
  return { x: R * Math.sin(b), y: R * Math.cos(b) };
}

// 第 cyl 缸的相位 p ∈ [0,720)，0=吸气上止点
export function cylinderPhase(cyl, theta) {
  return ((theta - CYL.cycleOffset[cyl]) % 720 + 720) % 720;
}

// 活塞销 Y（世界坐标）
export function pistonPinY(cyl, theta) {
  const beta = (theta + CYL.throwOffset[cyl]) % 360;
  return P.crankY + sliderPinY(beta);
}

// 活塞顶 Y
export function pistonCrownY(cyl, theta) {
  return pistonPinY(cyl, theta) + P.pistonCompHeight;
}

// 气门升程（which = 'intake' | 'exhaust'）
export function valveLift(cyl, theta, which) {
  const p = cylinderPhase(cyl, theta);
  const v = VALVE[which];
  const d = ((p - v.open) % 720 + 720) % 720;   // 距开启点的角度
  const D = ((v.close - v.open) % 720 + 720) % 720; // 开启持续角
  if (d >= D) return 0;
  const ramp = v.ramp;
  if (d < ramp) return v.maxLift * 0.5 * (1 - Math.cos(Math.PI * d / ramp));
  if (d > D - ramp) return v.maxLift * 0.5 * (1 - Math.cos(Math.PI * (D - d) / ramp));
  return v.maxLift;
}

// 当前是否喷油（第 cyl 缸）
export function isInjecting(cyl, theta) {
  const p = cylinderPhase(cyl, theta);
  return p >= VALVE.injection.start && p <= VALVE.injection.end;
}

// 冲程信息
export function strokeInfo(cyl, theta) {
  const p = cylinderPhase(cyl, theta);
  const idx = STROKE.of(p);
  return {
    phase: p,
    strokeIndex: idx,
    nameZh: STROKE.SHORT[idx],
    nameEn: STROKE.EN[idx],
    cls: STROKE.CLASS[idx],
    inject: isInjecting(cyl, theta),
  };
}

// 当前处于“做功冲程”的缸（用于点火指示）
export function firingCylinder(theta) {
  for (let i = 0; i < P.numCyl; i++) {
    const s = strokeInfo(i, theta);
    if (s.strokeIndex === 2) return i;
  }
  return -1;
}
