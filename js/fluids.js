// ============================================================================
// 流体粒子系统：冷却液（蓝）与润滑油（琥珀色）沿流道流动
// ============================================================================
import * as THREE from 'three';

function particleTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d');
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.4, 'rgba(255,255,255,0.7)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}

export class ParticleFlow {
  constructor(parent, paths, color, count = 900) {
    this.parent = parent;
    this.curves = paths.map((pts) => new THREE.CatmullRomCurve3(pts, true));
    this.count = count;
    this.particles = [];
    const total = this.curves.length;
    for (let i = 0; i < count; i++) {
      this.particles.push({
        path: i % total,
        t: Math.random(),
        speed: 0.02 + Math.random() * 0.03,
      });
    }
    const geo = new THREE.BufferGeometry();
    this.positions = new Float32Array(count * 3);
    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.material = new THREE.PointsMaterial({
      color,
      size: 5,
      map: particleTexture(),
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      opacity: 0.85,
    });
    this.points = new THREE.Points(geo, this.material);
    this.points.frustumCulled = false;
    this.parent.add(this.points);
    this.visible = true;
    // 初始化位置
    this._write(0);
  }

  _write(dt) {
    for (let i = 0; i < this.count; i++) {
      const p = this.particles[i];
      const curve = this.curves[p.path];
      const v = curve.getPoint(p.t);
      this.positions[i * 3] = v.x;
      this.positions[i * 3 + 1] = v.y;
      this.positions[i * 3 + 2] = v.z;
      p.t += p.speed * dt;
      if (p.t >= 1) p.t -= 1;
    }
    this.points.geometry.attributes.position.needsUpdate = true;
  }

  update(dt, flowFactor = 1) {
    if (!this.visible) { this.points.visible = false; return; }
    this.points.visible = true;
    this._write(dt * flowFactor);
  }

  setVisible(v) { this.visible = v; }
  dispose() {
    this.parent.remove(this.points);
    this.points.geometry.dispose();
    this.material.dispose();
  }
}

// 冷却液循环路径（散热器 → 水泵 → 缸体水套 → 缸盖 → 节温器 → 散热器）
function coolantPaths() {
  const A = [
    new THREE.Vector3(0, 350, -340), new THREE.Vector3(20, 140, -340),
    new THREE.Vector3(0, -70, -340),
  ];
  const B = [
    new THREE.Vector3(0, -90, -340), new THREE.Vector3(60, -90, -300),
    new THREE.Vector3(80, 20, -260), new THREE.Vector3(80, 45, -250),
  ];
  const C = [
    new THREE.Vector3(80, 65, -235), new THREE.Vector3(70, 160, -120),
    new THREE.Vector3(45, 230, -40),
  ];
  const D = [
    new THREE.Vector3(45, 230, -40), new THREE.Vector3(40, 285, -30),
    new THREE.Vector3(30, 330, 20),
  ];
  const E = [
    new THREE.Vector3(30, 345, 40), new THREE.Vector3(55, 360, -80),
    new THREE.Vector3(70, 362, -195),
  ];
  const F = [
    new THREE.Vector3(70, 382, -195), new THREE.Vector3(110, 405, -255),
    new THREE.Vector3(150, 355, -340), new THREE.Vector3(0, 350, -340),
  ];
  return [A, B, C, D, E, F];
}

// 润滑油循环路径（油底壳 → 机油泵 → 滤清器 → 主油道 → 轴承 → 回流）
function oilPaths() {
  const A = [
    new THREE.Vector3(-40, -170, -120), new THREE.Vector3(-80, -90, -228),
  ];
  const B = [
    new THREE.Vector3(-80, -90, -228), new THREE.Vector3(-105, -50, -180),
    new THREE.Vector3(-115, -20, -150),
  ];
  const C = [
    new THREE.Vector3(-115, -20, -150), new THREE.Vector3(-70, 55, -80),
    new THREE.Vector3(-25, 55, 0),
  ];
  const D = [
    new THREE.Vector3(-25, 55, 0), new THREE.Vector3(-10, -20, 0),
  ];
  const E = [
    new THREE.Vector3(-10, -20, 0), new THREE.Vector3(0, -100, 0),
    new THREE.Vector3(-20, -170, -40),
  ];
  return [A, B, C, D, E];
}

export function buildFluids(scene) {
  const coolant = new ParticleFlow(scene, coolantPaths(), 0x35c8ee, 900);
  const oil = new ParticleFlow(scene, oilPaths(), 0xf0b53a, 700);
  return { coolant, oil };
}
