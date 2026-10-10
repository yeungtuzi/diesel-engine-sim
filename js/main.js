// ============================================================================
// 主程序：场景、渲染循环、运动驱动、交互
// ============================================================================
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { P, CYL, DEG } from './config.js';
import { partState } from './partData.js';
import { createMaterials } from './materials.js';
import { buildEngine } from './engine.js';
import { buildFluids } from './fluids.js';
import { buildCombustion } from './combustion.js';
import { pistonPinY, pistonCrownY, valveLift, strokeInfo } from './kinematics.js';
import { initUI } from './ui.js';

const canvas = document.getElementById('viewport');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
renderer.localClippingEnabled = true;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0d1219);
scene.fog = new THREE.Fog(0x0d1219, 2400, 7000);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 5, 9000);
camera.position.set(820, 560, 1020);

// ---------- 光照与环境 ----------
// 四灯布光：主光（暖白，投影）+ 冷色补光 + 蓝色轮廓光 + 排气侧暖色氛围光
const { materials, envMap } = createMaterials(renderer);
scene.environment = envMap;
const hemi = new THREE.HemisphereLight(0xbdd4ff, 0x1d2127, 0.5);
scene.add(hemi);
const key = new THREE.DirectionalLight(0xfff3e2, 2.2);
key.position.set(540, 760, 380);
key.castShadow = true;
key.shadow.mapSize.set(2048, 2048);
key.shadow.camera.left = -720; key.shadow.camera.right = 720;
key.shadow.camera.top = 720;   key.shadow.camera.bottom = -720;
key.shadow.camera.near = 150;  key.shadow.camera.far = 2800;
key.shadow.bias = -0.0004;
key.shadow.normalBias = 3;
scene.add(key);
const fill = new THREE.DirectionalLight(0x74a0ff, 0.65);
fill.position.set(-520, 240, 560);
scene.add(fill);
const rim = new THREE.DirectionalLight(0x88bbff, 0.85);
rim.position.set(-520, 320, -420);
scene.add(rim);
const warmAccent = new THREE.DirectionalLight(0xff8e4d, 0.4);   // 排气/涡轮侧高温氛围
warmAccent.position.set(-300, 120, -700);
scene.add(warmAccent);

// ---------- 辉光（Bloom）后期 ----------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight), 0.4, 0.55, 0.82);
composer.addPass(bloomPass);
composer.addPass(new OutputPass());

// ---------- 地面与网格 ----------
const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(8000, 8000),
  new THREE.MeshStandardMaterial({ color: 0x141a22, roughness: 0.95, metalness: 0 }));
ground.rotation.x = -Math.PI / 2;
ground.position.y = -232;
ground.receiveShadow = true;
scene.add(ground);
const grid = new THREE.GridHelper(4000, 80, 0x2a3442, 0x1a212b);
grid.position.y = -231;
scene.add(grid);

// ---------- 发动机 ----------
const { root, refs, subGroups } = buildEngine(materials);
scene.add(root);
const engineMaterials = new Set();
root.traverse((o) => {
  if (!o.isMesh) return;
  engineMaterials.add(o.material);
  // 半透明外壳不投影（避免脏影），实体件投影且受影
  o.castShadow = !(o.material && o.material.transparent);
  o.receiveShadow = true;
});

// ---------- 剖视平面 ----------
const sectionPlane = new THREE.Plane(new THREE.Vector3(-1, 0, 0), 0);
const sectionCap = new THREE.Mesh(new THREE.PlaneGeometry(780, 860), materials.sectionCap);
sectionCap.rotation.y = Math.PI / 2;
sectionCap.position.set(0, 110, 0);
sectionCap.visible = false;
scene.add(sectionCap);

// ---------- 流体 ----------
const fluids = buildFluids(scene);

// ---------- 缸内燃烧特效 ----------
const combustion = buildCombustion(scene);

// ---------- 外壳半透明开关（实体件清单） ----------
const shellMeshes = [];
root.traverse((o) => {
  if (o.isMesh && o.material && o.material.userData.shell) shellMeshes.push(o);
});
function setShellTransparent(b) {
  engineMaterials.forEach((m) => {
    if (!m.userData.shell) return;
    m.transparent = b;
    m.opacity = b ? m.userData.baseOpacity : 1;
    m.depthWrite = !b;
    m.userData.fresOn = b;      // 实体模式关闭边缘辉光，避免表面发白
    m.needsUpdate = true;
  });
  shellMeshes.forEach((o) => { o.castShadow = !b; o.renderOrder = b ? 2 : 0; });
}

// ---------- 控制器 ----------
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 60, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 260;
controls.maxDistance = 3200;
controls.maxPolarAngle = Math.PI * 0.85;
controls.update();

// ---------- 射线拾取 ----------
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let hoveredKey = null;

// ---------- 状态 ----------
const ui = initUI();
let playing = true;
let rpm = 1200;
let theta = 0;                 // 连续曲轴转角（度）
let sectionOn = false;
let explodeOn = false;
let explodeAmt = 0;
let fluidOn = true;
let wireframeOn = false;
let shellOn = true;               // 外壳半透明（默认开）
let glowOn = true;                // 辉光后期（默认开）

const explodeTargets = {
  foundation: new THREE.Vector3(0, 0, 0),
  rotating: new THREE.Vector3(0, 0, 300),
  valvetrain: new THREE.Vector3(0, 175, 0),
  systems: new THREE.Vector3(0, 0, -310),
};

// ================= 运动驱动 =================
const UP = new THREE.Vector3(0, 1, 0);
const tmpDir = new THREE.Vector3();

function updateEngine() {
  refs.crankshaft.rotation.z = theta * DEG;
  refs.camshaft.rotation.z = (theta / 2) * DEG;

  for (const p of refs.pistons) {
    p.mesh.position.y = pistonCrownY(p.cyl, theta);
  }

  for (const r of refs.rods) {
    const beta = (theta + CYL.throwOffset[r.cyl]) * DEG;
    const bx = P.crankRadius * Math.sin(beta);
    const by = P.crankRadius * Math.cos(beta);
    const sy = pistonPinY(r.cyl, theta);
    tmpDir.set(-bx, sy - by, 0).normalize();
    r.mesh.position.set(bx, by, P.cylZ(r.cyl));
    r.mesh.quaternion.setFromUnitVectors(UP, tmpDir);
  }

  for (const v of refs.valves) {
    const lift = valveLift(v.cyl, theta, v.which);
    v.group.position.y = P.valveSeatY - lift;
    v.spring.scale.y = 1 - lift / 46;
  }
  for (const t of refs.tappets) {
    t.mesh.position.y = P.tappetCenterY + valveLift(t.cyl, theta, t.which);
  }
  for (const pr of refs.pushrods) {
    const lift = valveLift(pr.cyl, theta, pr.which);
    pr.mesh.position.y = (P.tappetTopY + P.pushrodTopY) / 2 + lift;
  }
  for (const rk of refs.rockers) {
    const lift = valveLift(rk.cyl, theta, rk.which);
    rk.group.rotation.z = -(lift / 27.5);
  }

  if (refs.waterPumpImpeller) refs.waterPumpImpeller.rotation.z = theta * 1.3 * DEG;
  if (refs.fan) refs.fan.rotation.z = theta * 1.1 * DEG;
  if (refs.turboWheel) refs.turboWheel.rotation.x = theta * 40 * DEG;
}

// ================= 交互事件 =================
ui.els.btnPlay.addEventListener('click', () => {
  playing = !playing;
  ui.els.btnPlay.textContent = playing ? '⏸ 暂停' : '▶ 播放';
});
ui.els.speedSlider.addEventListener('input', (e) => {
  rpm = Number(e.target.value);
  ui.els.speedValue.textContent = String(rpm);
});
ui.els.btnSection.addEventListener('click', () => {
  sectionOn = !sectionOn;
  renderer.clippingPlanes = sectionOn ? [sectionPlane] : [];
  sectionCap.visible = sectionOn;
  ui.els.btnSection.classList.toggle('active', sectionOn);
});
ui.els.btnExplode.addEventListener('click', () => {
  explodeOn = !explodeOn;
  ui.els.btnExplode.classList.toggle('active', explodeOn);
});
ui.els.btnFluid.addEventListener('click', () => {
  fluidOn = !fluidOn;
  fluids.coolant.setVisible(fluidOn);
  fluids.oil.setVisible(fluidOn);
  ui.els.btnFluid.classList.toggle('active', fluidOn);
});
ui.els.btnShell.addEventListener('click', () => {
  shellOn = !shellOn;
  setShellTransparent(shellOn);
  ui.els.btnShell.classList.toggle('active', shellOn);
});
ui.els.btnGlow.addEventListener('click', () => {
  glowOn = !glowOn;
  ui.els.btnGlow.classList.toggle('active', glowOn);
});
ui.els.btnWireframe.addEventListener('click', () => {
  wireframeOn = !wireframeOn;
  engineMaterials.forEach((m) => { m.wireframe = wireframeOn; });
  ui.els.btnWireframe.classList.toggle('active', wireframeOn);
});
ui.els.btnReset.addEventListener('click', () => {
  sectionOn = false; renderer.clippingPlanes = []; sectionCap.visible = false;
  ui.els.btnSection.classList.remove('active');
  explodeOn = false; ui.els.btnExplode.classList.remove('active');
  wireframeOn = false; engineMaterials.forEach((m) => { m.wireframe = false; });
  ui.els.btnWireframe.classList.remove('active');
  fluidOn = true; ui.els.btnFluid.classList.add('active');
  fluids.coolant.setVisible(true); fluids.oil.setVisible(true);
  shellOn = true; setShellTransparent(true); ui.els.btnShell.classList.add('active');
  glowOn = true; ui.els.btnGlow.classList.add('active');
  setView('iso');
});

const VIEWS = {
  front: { pos: [0, 80, 1500], target: [0, 80, 0] },
  side: { pos: [1500, 80, 0], target: [0, 80, 0] },
  top: { pos: [0, 1800, 1], target: [0, 60, 0] },
  iso: { pos: [820, 560, 1020], target: [0, 60, 0] },
};
function setView(name) {
  const v = VIEWS[name];
  if (!v) return;
  camera.position.set(...v.pos);
  controls.target.set(...v.target);
  controls.update();
}
document.querySelectorAll('.preset').forEach((btn) => {
  btn.addEventListener('click', () => setView(btn.dataset.preset));
});

canvas.addEventListener('pointermove', (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(refs.hitMeshes, false);
  if (hits.length === 0) {
    hoveredKey = null;
    ui.hideTooltip();
    canvas.style.cursor = 'grab';
    return;
  }
  // 优先返回不透明零件（可穿透半透明外壳查看内部）
  const opaque = hits.find((h) => h.object.material && !h.object.material.transparent);
  const target = (opaque || hits[0]).object;
  if (target.userData.partKey) {
    hoveredKey = target.userData.partKey;
    ui.showTooltip(hoveredKey, partState(hoveredKey, theta % 720));
    ui.moveTooltip(e.clientX, e.clientY);
    canvas.style.cursor = 'pointer';
  }
});
canvas.addEventListener('pointerleave', () => {
  hoveredKey = null;
  ui.hideTooltip();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  composer.setSize(window.innerWidth, window.innerHeight);
});

// ================= 渲染循环 =================
const clock = new THREE.Clock();
let firstFrame = true;

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.1);

  if (playing) theta += rpm * 6 * dt;  // rpm → °/s

  updateEngine();

  const flow = playing ? Math.max(0.1, rpm / 1200) : 0;
  fluids.coolant.update(dt, flow);
  fluids.oil.update(dt, flow * 0.92);

  // 缸内燃烧特效（分解视图下停发，避免误导）
  combustion.update(dt, theta, playing && !explodeOn);

  // 爆炸视图平滑过渡
  explodeAmt += ((explodeOn ? 1 : 0) - explodeAmt) * Math.min(1, dt * 4);
  for (const name of Object.keys(explodeTargets)) {
    subGroups[name].position.copy(explodeTargets[name]).multiplyScalar(explodeAmt);
  }

  // 状态面板
  const phase = theta % 720;
  const c1 = strokeInfo(0, theta);
  const firing = [0, 1, 2, 3].find((i) => strokeInfo(i, theta).strokeIndex === 2);
  const coolant = 82 + ((rpm - 1000) / 3000) * 8 + Math.sin(theta * DEG) * 0.5;
  const oil = Math.min(8, 1.5 + (rpm / 1000) * 2.8);
  ui.setStatus({
    angle: phase,
    strokeIdx: c1.strokeIndex,
    rpm,
    coolant,
    oil,
    injecting: firing !== undefined && strokeInfo(firing, theta).inject,
  });
  ui.setCylinders([0, 1, 2, 3].map((i) => strokeInfo(i, theta)));

  controls.update();
  if (glowOn) composer.render();
  else renderer.render(scene, camera);

  if (firstFrame) {
    firstFrame = false;
    ui.els.loading.classList.add('done');
    setTimeout(() => ui.els.loading.remove(), 600);
  }
}

// ================= 公共 API（便于嵌入网页 / 脚本控制） =================
window.dieselSim = {
  setRPM(v) { rpm = Math.max(60, Math.min(3000, v)); ui.els.speedSlider.value = rpm; ui.els.speedValue.textContent = String(Math.round(rpm)); },
  getRPM: () => rpm,
  setPlaying(b) { playing = !!b; ui.els.btnPlay.textContent = playing ? '⏸ 暂停' : '▶ 播放'; },
  isPlaying: () => playing,
  setSection(b) { sectionOn = !!b; renderer.clippingPlanes = sectionOn ? [sectionPlane] : []; sectionCap.visible = sectionOn; ui.els.btnSection.classList.toggle('active', sectionOn); },
  setExplode(b) { explodeOn = !!b; ui.els.btnExplode.classList.toggle('active', explodeOn); },
  setFluid(b) { fluidOn = !!b; fluids.coolant.setVisible(fluidOn); fluids.oil.setVisible(fluidOn); ui.els.btnFluid.classList.toggle('active', fluidOn); },
  setShell(b) { shellOn = !!b; setShellTransparent(shellOn); ui.els.btnShell.classList.toggle('active', shellOn); },
  setGlow(b) { glowOn = !!b; ui.els.btnGlow.classList.toggle('active', glowOn); },
  setCombustion(b) { combustion.setVisible(!!b); },
  setView,
  _root: root,
  _refs: refs,
  _findMaxX() {
    root.updateMatrixWorld(true);
    let worst = null;
    root.traverse((o) => {
      if (!o.isMesh) return;
      const x = o.matrixWorld.elements[12];
      if (!worst || Math.abs(x) > Math.abs(worst.x)) worst = { x, key: o.userData.partKey, geom: o.geometry.type };
    });
    return worst;
  },
  getState() {
    const phase = theta % 720;
    const c1 = strokeInfo(0, theta);
    return { angle: phase, stroke: c1.nameZh, rpm, playing, coolant: 82 + ((rpm - 1000) / 3000) * 8, oil: Math.min(8, 1.5 + (rpm / 1000) * 2.8), sectionOn, explodeOn, fluidOn };
  },
  _stats() {
    root.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(root);
    let meshes = 0, nan = 0;
    root.traverse((o) => {
      if (o.isMesh) {
        meshes++;
        const p = new THREE.Vector3(); o.getWorldPosition(p);
        if (!isFinite(p.x + p.y + p.z)) nan++;
      }
    });
    return {
      meshes, nan, theta,
      bboxMin: box.min.toArray(), bboxMax: box.max.toArray(),
      pistonCrowns: refs.pistons.map((p) => Number(p.mesh.position.y.toFixed(2))),
      valveLifts: refs.valves.map((v) => Number(valveLift(v.cyl, theta, v.which).toFixed(2))),
      hitMeshes: refs.hitMeshes.length,
    };
  },
};

updateEngine();
animate();
