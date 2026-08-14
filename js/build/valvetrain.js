// ============================================================================
// 配气机构：凸轮轴、挺柱、推杆、摇臂、气门、气门弹簧、正时齿轮
// ============================================================================
import * as THREE from 'three';
import { P, CYL, VALVE, DEG } from '../config.js';
import { reg, box, cyl, gearGeometry } from './helpers.js';

function cylZ(r, len, mat, seg = 24) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
  m.rotation.x = Math.PI / 2;
  return m;
}

// 螺旋弹簧（轴线沿 Y）
function springGeo(radius, height, coils, tubeR) {
  const pts = [];
  const n = coils * 32;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = t * Math.PI * 2 * coils;
    pts.push(new THREE.Vector3(radius * Math.cos(a), t * height, radius * Math.sin(a)));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n, tubeR, 8, false);
}

export function buildValvetrain(refs, mat) {
  const g = new THREE.Group();

  // 每缸配气相位峰值（用于凸轮桃尖朝向）
  const pPeak = {
    intake: (VALVE.intake.open + VALVE.intake.close) / 2,
    exhaust: (VALVE.exhaust.open + VALVE.exhaust.close) / 2,
  };

  // ---------- 凸轮轴 ----------
  const cam = new THREE.Group();
  cam.position.set(P.camX, P.camY, 0);
  refs.camshaft = cam;

  const shaft = cylZ(12, 500, mat.steelForged, 24);
  reg(refs, shaft, 'camshaft');
  cam.add(shaft);

  refs.tappets = [];
  refs.pushrods = [];
  refs.rockers = [];
  refs.valves = [];

  const lobeGeoBase = new THREE.CylinderGeometry(16, 16, 16, 20);
  lobeGeoBase.rotateX(Math.PI / 2);
  const lobeGeoNose = new THREE.CylinderGeometry(9.5, 9.5, 16, 20);
  lobeGeoNose.rotateX(Math.PI / 2);

  for (let i = 0; i < P.numCyl; i++) {
    for (const which of ['intake', 'exhaust']) {
      const dz = which === 'intake' ? -14 : 14;
      const z = P.cylZ(i) + dz;
      const thetaPeak = CYL.cycleOffset[i] + pPeak[which];
      const phi = -thetaPeak / 2 * DEG; // 桃尖在峰值相位时指向 +Y

      // 凸轮（基圆 + 桃尖）
      const lobe = new THREE.Group();
      const base = new THREE.Mesh(lobeGeoBase, mat.steelForged);
      reg(refs, base, 'camshaft');
      lobe.add(base);
      const nose = new THREE.Mesh(lobeGeoNose, mat.steelPolished);
      nose.position.y = 16;
      reg(refs, nose, 'camshaft');
      lobe.add(nose);
      lobe.position.set(0, 0, z);
      lobe.rotation.z = phi;
      cam.add(lobe);

      // 挺柱
      const tappet = cyl(12, 12, 24, mat.steelForged, 20);
      tappet.position.set(P.camX, P.tappetCenterY, z);
      reg(refs, tappet, 'tappet');
      g.add(tappet);
      refs.tappets.push({ mesh: tappet, cyl: i, which });

      // 推杆
      const rodLen = P.pushrodTopY - P.tappetTopY;
      const pushrod = cyl(4, 4, rodLen, mat.steelPolished, 12);
      pushrod.position.set(P.camX, (P.tappetTopY + P.pushrodTopY) / 2, z);
      reg(refs, pushrod, 'pushrod');
      g.add(pushrod);
      refs.pushrods.push({ mesh: pushrod, cyl: i, which });

      // 摇臂（绕 Z 轴转动）
      const pivotX = P.camX / 2; // -27.5
      const rocker = new THREE.Group();
      rocker.position.set(pivotX, P.rockerY, z);
      const shaft2 = cylZ(8, 16, mat.steelForged, 16);
      reg(refs, shaft2, 'rocker-arm');
      rocker.add(shaft2);
      const arm = box(Math.abs(P.camX), 11, 12, mat.steelForged, pivotX, 0, 0);
      reg(refs, arm, 'rocker-arm');
      rocker.add(arm);
      // 气门端压头
      const pad = box(12, 9, 14, mat.steelPolished, 0, -5, 0);
      reg(refs, pad, 'rocker-arm');
      rocker.add(pad);
      // 推杆端球头
      const cup = new THREE.Mesh(new THREE.SphereGeometry(6, 16, 16), mat.steelPolished);
      cup.position.set(P.camX, -3, 0);
      reg(refs, cup, 'rocker-arm');
      rocker.add(cup);
      g.add(rocker);
      refs.rockers.push({ group: rocker, cyl: i, which });

      // 气门
      const vR = which === 'intake' ? 20 : 18;
      const vg = new THREE.Group();
      vg.position.set(0, P.valveSeatY, z);
      const head = cyl(vR, vR, 7, which === 'intake' ? mat.stainless : mat.hotExhaust, 28);
      head.position.y = -3.5;
      reg(refs, head, which === 'intake' ? 'intake-valve' : 'exhaust-valve');
      vg.add(head);
      const stem = cyl(4, 4, P.valveStemTopY - P.valveSeatY, mat.steelPolished, 12);
      stem.position.y = (P.valveStemTopY - P.valveSeatY) / 2;
      reg(refs, stem, which === 'intake' ? 'intake-valve' : 'exhaust-valve');
      vg.add(stem);
      const retainer = cyl(7, 7, 4, mat.steelForged, 16);
      retainer.position.y = P.valveStemTopY - P.valveSeatY;
      reg(refs, retainer, 'valve-spring');
      vg.add(retainer);
      g.add(vg);

      // 气门弹簧（底端固定于缸盖，随气门开闭压缩）
      const spring = new THREE.Mesh(springGeo(9, 52, 6, 1.5), mat.springSteel);
      spring.position.set(0, P.valveSeatY + 16, z);
      reg(refs, spring, 'valve-spring');
      g.add(spring);

      refs.valves.push({ group: vg, spring, cyl: i, which, maxLift: VALVE[which].maxLift });
    }
  }

  // ---------- 正时齿轮 ----------
  // 曲轴齿轮（21 齿，随曲轴旋转）
  const crankGear = new THREE.Mesh(gearGeometry(21, 26, 16, 3), mat.steelForged);
  crankGear.position.set(0, 0, -240);
  reg(refs, crankGear, 'timing-gear');
  refs.crankshaft.add(crankGear);
  // 凸轮轴齿轮（42 齿，随凸轮轴旋转）
  const camGear = new THREE.Mesh(gearGeometry(42, 47, 16, 3), mat.steelForged);
  camGear.position.set(0, 0, -240);
  reg(refs, camGear, 'timing-gear');
  cam.add(camGear);

  g.add(cam);
  return g;
}
