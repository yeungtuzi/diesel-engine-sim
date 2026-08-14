// ============================================================================
// 几何与装配辅助函数
// ============================================================================
import * as THREE from 'three';

// 注册零件网格（供射线拾取/信息卡使用）
export function reg(refs, mesh, key) {
  mesh.userData.partKey = key;
  refs.hitMeshes.push(mesh);
  return mesh;
}

export function box(w, h, d, mat, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  return m;
}

export function cyl(rTop, rBot, h, mat, seg = 28) {
  return new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, h, seg), mat);
}

export function sphere(r, mat, seg = 24) {
  return new THREE.Mesh(new THREE.SphereGeometry(r, seg, seg), mat);
}

export function torus(r, tube, mat, seg = 16) {
  return new THREE.Mesh(new THREE.TorusGeometry(r, tube, seg, 40), mat);
}

// 两点之间的圆柱（用于直管、推杆等）
export function cylBetween(a, b, r, mat, seg = 18) {
  const dir = b.clone().sub(a);
  const len = dir.length();
  if (len < 1e-6) return new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.1, seg), mat);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
  m.position.copy(a).add(b).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir.normalize());
  return m;
}

// 沿曲线生成的管道
export function tubeAlong(pts, r, mat, seg = 80) {
  const curve = new THREE.CatmullRomCurve3(pts);
  return new THREE.Mesh(new THREE.TubeGeometry(curve, seg, r, 12, false), mat);
}

// 齿轮（视觉示意）：给定齿数、齿顶圆半径、宽度
export function gearGeometry(teeth, tipRadius, width, addendum = 3) {
  const rootR = tipRadius - addendum * 2.1;
  const shape = new THREE.Shape();
  const step = (Math.PI * 2) / teeth;
  const toothW = step * 0.5;
  const gapW = step - toothW;
  const arc = (arr, r, a0, a1, n) => {
    for (let k = 0; k <= n; k++) {
      const a = a0 + (a1 - a0) * (k / n);
      arr.push([r * Math.cos(a), r * Math.sin(a)]);
    }
  };
  const pts = [];
  for (let i = 0; i < teeth; i++) {
    const a0 = i * step;
    const gs = a0, ge = a0 + gapW;
    arc(pts, rootR, gs, ge, 4);
    pts.push([tipRadius * Math.cos(ge), tipRadius * Math.sin(ge)]);
    arc(pts, tipRadius, ge, ge + toothW, 4);
    pts.push([rootR * Math.cos(ge + toothW), rootR * Math.sin(ge + toothW)]);
  }
  shape.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) shape.lineTo(pts[i][0], pts[i][1]);
  shape.closePath();
  return new THREE.ExtrudeGeometry(shape, { depth: width, bevelEnabled: false });
}

// 克隆材质并设为半透明（用于“透明外壳”模式）
export function ghost(mat, opacity = 0.35) {
  const m = mat.clone();
  m.transparent = true;
  m.opacity = opacity;
  m.depthWrite = false;
  m.side = THREE.DoubleSide;
  return m;
}

export function group(...children) {
  const g = new THREE.Group();
  children.forEach((c) => c && g.add(c));
  return g;
}

// 六角螺栓（示意）
export function hexBolt(r, len, mat) {
  const g = new THREE.Group();
  const head = new THREE.Mesh(new THREE.CylinderGeometry(r * 1.5, r * 1.5, len * 0.28, 6), mat);
  head.position.y = len * 0.5;
  const shank = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 12), mat);
  shank.position.y = -len * 0.14;
  g.add(head, shank);
  return g;
}
