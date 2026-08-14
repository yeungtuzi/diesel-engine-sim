// ============================================================================
// 固定件：气缸体、缸套、气缸盖、缸垫、油底壳、飞轮壳、正时齿轮室、主轴承盖、螺栓
// ============================================================================
import * as THREE from 'three';
import { P } from '../config.js';
import { reg, box, cyl, ghost, hexBolt } from './helpers.js';

export function buildFoundation(refs, mat) {
  const g = new THREE.Group();

  // 透明外壳材质（可切换不透明）
  const ghostIron = ghost(mat.castIron, 0.30);
  const ghostIronDark = ghost(mat.castIronDark, 0.34);
  const ghostAlu = ghost(mat.aluminum, 0.34);
  refs.housingMats.push(ghostIron, ghostIronDark, ghostAlu);

  // ---------- 气缸体 ----------
  const block = box(P.blockWidth, P.deckY - P.blockBottomY, P.blockLen, ghostIron,
    0, (P.deckY + P.blockBottomY) / 2, 0);
  reg(refs, block, 'cylinder-block');
  g.add(block);

  // 机体底部凸缘（加强裙边，示意）
  const skirt = box(P.blockWidth + 30, 26, P.blockLen + 20, ghostIron,
    0, P.blockBottomY + 13, 0);
  reg(refs, skirt, 'cylinder-block');
  g.add(skirt);

  // ---------- 缸套（4 个，薄壁管） ----------
  const linerH = P.deckY - P.linerBottomY; // 128
  const linerGeo = new THREE.CylinderGeometry(48, 48, linerH, 40, 1, true);
  for (let i = 0; i < P.numCyl; i++) {
    const liner = new THREE.Mesh(linerGeo, mat.castIronDark);
    liner.material = liner.material.clone();
    liner.material.side = THREE.DoubleSide;
    liner.position.set(0, (P.deckY + P.linerBottomY) / 2, P.cylZ(i));
    reg(refs, liner, 'cylinder-liner');
    g.add(liner);
  }

  // ---------- 缸体水套（半透明冷却液体积，环绕缸套） ----------
  const jacketH = 104;
  for (let i = 0; i < P.numCyl; i++) {
    const jacket = cyl(57, 57, jacketH, mat.fluidCoolant, 32);
    jacket.position.set(0, P.linerBottomY + jacketH / 2 + 4, P.cylZ(i));
    reg(refs, jacket, 'water-jacket');
    g.add(jacket);
  }

  // ---------- 气缸盖 ----------
  const headH = P.headTopY - P.deckY; // 80
  const head = box(P.blockWidth, headH, P.blockLen, ghostAlu,
    0, P.deckY + headH / 2, 0);
  reg(refs, head, 'cylinder-head');
  g.add(head);

  // 缸盖水腔（半透明）
  const headWater = box(P.blockWidth - 40, 26, P.blockLen - 40, mat.fluidCoolant,
    0, P.deckY + 26, 0);
  reg(refs, headWater, 'water-jacket');
  g.add(headWater);

  // ---------- 气缸垫 ----------
  const gasket = box(P.blockWidth + 2, 2.4, P.blockLen + 2, mat.rubber,
    0, P.deckY + 1.2, 0);
  reg(refs, gasket, 'head-gasket');
  g.add(gasket);

  // ---------- 油底壳 ----------
  const panH = P.blockBottomY - P.panBottomY; // 90
  const pan = box(P.blockWidth - 40, panH, P.blockLen - 60, ghostIronDark,
    0, P.blockBottomY - panH / 2, 0);
  reg(refs, pan, 'oil-pan');
  g.add(pan);
  // 油底壳内机油液面（半透明）
  const oilPool = box(P.blockWidth - 48, 26, P.blockLen - 68, mat.fluidOil,
    0, P.panBottomY + 13, 0);
  reg(refs, oilPool, 'oil-pan');
  g.add(oilPool);

  // ---------- 飞轮壳 ----------
  const fwHousing = new THREE.Mesh(
    new THREE.CylinderGeometry(185, 185, 72, 40, 1, true), ghostIron);
  fwHousing.material = fwHousing.material.clone();
  fwHousing.material.side = THREE.DoubleSide;
  fwHousing.rotation.x = Math.PI / 2; // 轴线沿 Z
  fwHousing.position.set(0, 0, 252);
  reg(refs, fwHousing, 'flywheel-housing');
  g.add(fwHousing);
  // 飞轮壳后法兰
  const fwFlange = cyl(205, 205, 10, ghostIron, 40);
  fwFlange.rotation.x = Math.PI / 2;
  fwFlange.position.set(0, 0, 288);
  reg(refs, fwFlange, 'flywheel-housing');
  g.add(fwFlange);

  // ---------- 正时齿轮室 ----------
  const tc = box(190, 250, 26, ghostAlu, 0, 10, -P.blockLen / 2 - 8);
  reg(refs, tc, 'timing-cover');
  g.add(tc);

  // ---------- 主轴承盖（5 道） ----------
  for (let i = 0; i < 5; i++) {
    const z = -210 + i * 105;
    const cap = box(84, 54, 46, mat.castIronDark, 0, -40, z);
    reg(refs, cap, 'main-bearing-cap');
    g.add(cap);
    // 两侧螺柱
    for (const sx of [-32, 32]) {
      const stud = hexBolt(6, 60, mat.steelPolished);
      stud.position.set(sx, -16, z);
      reg(refs, stud, 'bolt');
      g.add(stud);
    }
  }

  // ---------- 缸盖螺栓（示意，两排） ----------
  for (let i = 0; i < 8; i++) {
    const z = -200 + i * 57;
    for (const sx of [-95, 95]) {
      const b = hexBolt(7, 26, mat.steelPolished);
      b.position.set(sx, P.deckY - 13, z);
      reg(refs, b, 'bolt');
      g.add(b);
    }
  }

  return g;
}
