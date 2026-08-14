// ============================================================================
// 运动件：曲轴、平衡重、飞轮、皮带轮、活塞(含环/销)、连杆(含大头瓦)
// ============================================================================
import * as THREE from 'three';
import { P, CYL } from '../config.js';
import { reg, cyl, box } from './helpers.js';

// 轴线沿 Z 的圆柱
function cylZ(r, len, mat, seg = 28) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
  m.rotation.x = Math.PI / 2;
  return m;
}

export function buildRotating(refs, mat) {
  const g = new THREE.Group();
  const crank = new THREE.Group();
  refs.crankshaft = crank;

  const journalZ = [-224, -112, 0, 112, 224];
  const webDirs = CYL.throwOffset.map((o) => (o === 0 ? 1 : -1)); // +1=销在上, -1=销在下

  // ---------- 主轴颈 ----------
  for (const z of journalZ) {
    const j = cylZ(30, 40, mat.steelPolished);
    j.position.set(0, 0, z);
    reg(refs, j, 'crankshaft');
    crank.add(j);
  }

  // ---------- 连杆颈 + 曲柄臂 + 平衡重 ----------
  for (let i = 0; i < P.numCyl; i++) {
    const dir = webDirs[i];
    const z = P.cylZ(i);
    // 连杆颈
    const pin = cylZ(28, 34, mat.steelPolished);
    pin.position.set(0, P.crankRadius * dir, z);
    reg(refs, pin, 'crankshaft');
    crank.add(pin);

    // 两片曲柄臂
    for (const wz of [z - 18, z + 18]) {
      const web = box(72, 100, 22, mat.steelForged, 0, 26 * dir, wz);
      reg(refs, web, 'crankshaft');
      crank.add(web);
      // 平衡重（销的相对侧）
      const cw = box(76, 52, 24, mat.steelForged, 0, -30 * dir, wz);
      reg(refs, cw, 'counterweight');
      crank.add(cw);
    }
  }

  // ---------- 飞轮 ----------
  const flywheel = cylZ(170, 30, mat.castIronDark, 40);
  flywheel.position.set(0, 0, 240);
  reg(refs, flywheel, 'flywheel');
  crank.add(flywheel);
  // 起动齿圈
  const ring = new THREE.Mesh(
    new THREE.CylinderGeometry(172, 172, 24, 96, 1, true), mat.steelForged);
  ring.material = ring.material.clone(); ring.material.side = THREE.DoubleSide;
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, 0, 240);
  reg(refs, ring, 'flywheel');
  crank.add(ring);
  // 飞轮螺栓（示意）
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const bolt = cylZ(7, 30, mat.steelPolished, 8);
    bolt.position.set(Math.cos(a) * 90, Math.sin(a) * 90, 240);
    reg(refs, bolt, 'bolt');
    crank.add(bolt);
  }

  // ---------- 曲轴皮带轮 ----------
  const pulley = cylZ(62, 22, mat.castIronDark, 32);
  pulley.position.set(0, 0, -256);
  reg(refs, pulley, 'crankshaft-pulley');
  crank.add(pulley);

  g.add(crank);

  // ---------- 活塞 / 活塞环 / 活塞销 ----------
  refs.pistons = [];
  const ringMat = mat.castIronDark;
  for (let i = 0; i < P.numCyl; i++) {
    const pg = new THREE.Group();
    pg.position.set(0, 0, P.cylZ(i));
    // 活塞顶（含 ω 燃烧室凹坑，示意）
    const crown = cyl(45.5, 45.5, 16, mat.pistonAlloy, 36);
    crown.position.y = -8;
    reg(refs, crown, 'piston');
    pg.add(crown);
    const bowl = cyl(24, 24, 6, mat.pistonAlloy, 24);
    bowl.position.y = -3;
    reg(refs, bowl, 'piston');
    pg.add(bowl);
    // 裙部
    const skirt = cyl(45.2, 45.0, 50, mat.pistonAlloy, 36);
    skirt.position.y = -16 - 25;
    reg(refs, skirt, 'piston');
    pg.add(skirt);
    // 活塞环（2 气环 + 1 油环）
    for (let r = 0; r < 3; r++) {
      const ring = cyl(45.7, 45.7, 3, ringMat, 36);
      ring.position.y = -6 - r * 5;
      reg(refs, ring, 'piston-ring');
      pg.add(ring);
    }
    // 活塞销
    const pin = cylZ(16, 60, mat.steelPolished, 20);
    pin.position.y = -P.pistonCompHeight;
    reg(refs, pin, 'piston-pin');
    pg.add(pin);
    // 销挡圈（示意）
    for (const sz of [-27, 27]) {
      const clip = cylZ(16.5, 3, mat.copperBrass, 20);
      clip.position.set(0, -P.pistonCompHeight, sz);
      reg(refs, clip, 'piston-pin');
      pg.add(clip);
    }
    g.add(pg);
    refs.pistons.push({ mesh: pg, cyl: i });
  }

  // ---------- 连杆 + 大头瓦 ----------
  refs.rods = [];
  for (let i = 0; i < P.numCyl; i++) {
    const rod = new THREE.Group();
    // 大头（连杆颈处，原点在大头中心）
    const big = cylZ(33, 30, mat.steelForged, 28);
    reg(refs, big, 'connecting-rod');
    rod.add(big);
    // 大头瓦（铜铅合金轴瓦，内衬）
    const bearing = cylZ(29, 26, mat.copperBrass, 28);
    reg(refs, bearing, 'rod-bearing');
    rod.add(bearing);
    // 杆身（工字形示意）
    const shank = box(18, P.rodLength - 40, 14, mat.steelForged, 0, 20 + (P.rodLength - 40) / 2, 0);
    reg(refs, shank, 'connecting-rod');
    rod.add(shank);
    // 小头
    const small = cylZ(21, 26, mat.steelForged, 24);
    small.position.y = P.rodLength;
    reg(refs, small, 'connecting-rod');
    rod.add(small);
    g.add(rod);
    refs.rods.push({ mesh: rod, cyl: i });
  }

  return g;
}
