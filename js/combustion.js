// ============================================================================
// 缸内燃烧视觉特效：每缸在点火延迟后（喷油结束角）触发
//   ① 白色闪光（预混火焰，发火后 ~12°CA）
//   ② 橙色火球余辉（跟随活塞下行扩散，~220°CA 内指数衰减）
//   ③ 缸内点光源脉冲（照亮缸套/活塞/气门，~90°CA）
//   ④ 烟气粒子上浮（独立墙钟节流，透过半透明外壳可见）
// 全部包络以「曲轴转角」为自变量：与燃烧物理一致（燃烧持续角 ≈200°CA），
// 且任何转速下火舌都恰好充满做功冲程前半段。
// 触发为相位越沿检测，逐缸发火自动满足点火顺序 1-3-4-2。
// ============================================================================
import * as THREE from 'three';
import { P, VALVE } from './config.js';
import { pistonCrownY, cylinderPhase } from './kinematics.js';

const IGNITION_AT = VALVE.injection.end;  // 366°：喷油结束后缸压/温度足以自燃
const FLASH_DEG = 12;    // 白色闪光持续曲轴角
const GLOW_DEG  = 220;   // 橙色余辉覆盖曲轴角（半个做功冲程+）
const LIGHT_DEG = 90;    // 点光源脉冲曲轴角
const SMOKE_T   = 0.95;  // 烟气上浮寿命 s（墙钟）
const SMOKE_N   = 16;    // 每缸烟气粒子数

// 柔和圆形粒子贴图（烟）
function dotTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 2, 32, 32, 30);
  g.addColorStop(0, 'rgba(180,190,205,0.85)');
  g.addColorStop(0.55, 'rgba(150,160,175,0.28)');
  g.addColorStop(1, 'rgba(130,140,155,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export function buildCombustion(scene) {
  const root = new THREE.Group();
  root.name = 'combustion';
  const dot = dotTexture();
  const glowGeo = new THREE.CylinderGeometry(1, 1, 1, 28);
  const flashGeo = new THREE.SphereGeometry(1, 18, 14);

  const cyls = [];
  for (let i = 0; i < P.numCyl; i++) {
    const z = P.cylZ(i);

    // 闪光核（白炽）
    const flashMat = new THREE.MeshBasicMaterial({
      color: 0xfff2cf, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false });
    const flash = new THREE.Mesh(flashGeo, flashMat);
    flash.frustumCulled = false;

    // 火球余辉（橙色火焰包络）
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0xff7e28, transparent: true, opacity: 0,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.frustumCulled = false;

    // 缸内点光源
    const light = new THREE.PointLight(0xff7a26, 0, 900, 2);
    light.position.set(0, 280, z);

    // 烟气粒子
    const smokeGeo = new THREE.BufferGeometry();
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SMOKE_N * 3), 3));
    const smokeMat = new THREE.PointsMaterial({
      map: dot, color: 0x8e9aab, size: 42, transparent: true, opacity: 0,
      depthWrite: false, sizeAttenuation: true });
    const smoke = new THREE.Points(smokeGeo, smokeMat);
    smoke.frustumCulled = false;

    root.add(flash, glow, smoke, light);

    cyls.push({
      z, flash, glow, light, smoke, smokeGeo,
      active: false,     // 燃烧特效激活中
      tSmoke: -1,        // 烟气独立墙钟（节流复用）
      seed: 0,
      lastPhase: null,
      dirs: Array.from({ length: SMOKE_N }, () => ({
        a: Math.random() * Math.PI * 2,
        r: Math.random() * 22,
        v: 26 + Math.random() * 34,
        w: (Math.random() - 0.5) * 14,
      })),
    });
  }
  scene.add(root);

  function spawnSmoke(c, theta) {
    const y = pistonCrownY(cyls.indexOf(c), theta);
    const pos = c.smokeGeo.attributes.position.array;
    for (let k = 0; k < SMOKE_N; k++) {
      pos[k * 3] = Math.cos(c.dirs[k].a) * c.dirs[k].r;
      pos[k * 3 + 1] = y + 6 + Math.random() * 8;   // 起始于活塞顶上方
      pos[k * 3 + 2] = c.z + (Math.random() - 0.5) * 10;
    }
    c.smokeGeo.attributes.position.needsUpdate = true;
  }

  function fire(c, theta) {
    c.active = true;
    c.seed = Math.random() * 37;
    if (c.tSmoke < 0 || c.tSmoke > SMOKE_T * 0.8) {
      c.tSmoke = 0;          // 节流：上一炉烟未散则不重复释放
      spawnSmoke(c, theta);
    }
  }

  function update(dt, theta, allowFire) {
    for (let i = 0; i < cyls.length; i++) {
      const c = cyls[i];
      const p = cylinderPhase(i, theta);

      // 相位越过发火角 → 点火（模 720 越沿检测；d===0 表示整周跳变亦视为越沿）
      if (allowFire && c.lastPhase !== null) {
        const d = ((p - c.lastPhase) % 720 + 720) % 720;
        const toIgn = ((IGNITION_AT - c.lastPhase) % 720 + 720) % 720;
        if (d === 0 || toIgn <= d) fire(c, theta);
      }
      c.lastPhase = p;

      // 燃烧结束后门：A 越过覆盖窗即熄灭
      const A = ((p - IGNITION_AT) % 720 + 720) % 720;   // 发火后经过的曲轴角
      if (c.active && A > GLOW_DEG) c.active = false;

      if (!c.active) {
        c.flash.visible = c.glow.visible = c.smoke.visible = false;
        c.light.intensity = 0;
      } else {
        const flick = 0.86 + 0.14 * Math.sin(A * 1.2 + c.seed);
        const crownY = pistonCrownY(i, theta);
        const chamberTop = P.deckY - 4;

        // —— ① 白色闪光：急剧膨胀后瞬间熄灭
        if (A < FLASH_DEG * 1.6) {
          const k = Math.min(1, A / FLASH_DEG);
          c.flash.visible = true;
          c.flash.position.set(0, Math.min(chamberTop, crownY + 10), c.z);
          const s = 8 + 40 * (1 - Math.pow(1 - k, 2));
          c.flash.scale.set(s, s * 0.6, s);
          c.flash.material.opacity = Math.pow(1 - k, 2);
        } else c.flash.visible = false;

        // —— ② 橙色余辉：跟随活塞下行膨胀，径向扩散、指数衰减
        //     火焰包络严格钳制在「活塞顶 ~ 缸盖接合面」之间，不侵入缸盖
        {
          c.glow.visible = true;
          const r = 26 + 18 * (1 - Math.exp(-A / 16));
          const top = Math.min(chamberTop, crownY + (chamberTop - crownY) + 30 * Math.min(1, A / 90) + 14);
          const hEff = Math.max(12, Math.min(top, chamberTop) - crownY);
          c.glow.position.set(0, (crownY + Math.min(top, chamberTop)) / 2, c.z);
          c.glow.scale.set(r, hEff, r);
          c.glow.material.color.setHSL(
            0.085 - 0.055 * (A / GLOW_DEG), 1.0, 0.62 - 0.3 * (A / GLOW_DEG));
          c.glow.material.opacity = 0.85 * Math.exp(-A / 55) * flick;
        }

        // —— ③ 点光源脉冲
        if (A < LIGHT_DEG) {
          c.light.position.y = (crownY + Math.min(chamberTop, crownY + 30)) / 2;
          c.light.intensity = 42000 * Math.exp(-A / 22) * flick;
          c.light.color.setHSL(0.07, 1.0, 0.55);
        } else c.light.intensity = 0;
      }

      // —— ④ 烟气粒子上浮（独立墙钟，跨发火周期节流）
      if (c.tSmoke >= 0) c.tSmoke += dt;
      if (c.tSmoke >= 0 && c.tSmoke < SMOKE_T) {
        c.smoke.visible = true;
        const arr = c.smokeGeo.attributes.position.array;
        for (let k = 0; k < SMOKE_N; k++) {
          const d0 = c.dirs[k];
          arr[k * 3] += Math.cos(d0.a) * d0.w * dt;                 // 径向缓慢扩散
          arr[k * 3 + 1] += d0.v * dt;                              // 上浮
          arr[k * 3 + 2] += Math.sin(d0.a) * d0.w * dt;
        }
        c.smokeGeo.attributes.position.needsUpdate = true;
        c.smoke.material.opacity = 0.34 * Math.pow(1 - c.tSmoke / SMOKE_T, 2);
        c.smoke.material.size = 42 + c.tSmoke * 34;
      } else {
        c.smoke.visible = false;
        if (c.tSmoke >= SMOKE_T) c.tSmoke = -1;
      }
    }
  }

  function setVisible(b) {
    root.visible = b;
    if (!b) cyls.forEach((c) => { c.active = false; c.tSmoke = -1; c.light.intensity = 0; });
  }

  return { root, update, setVisible };
}
