// ============================================================================
// 燃油 / 润滑 / 冷却 / 进排气 系统
// ============================================================================
import * as THREE from 'three';
import { P } from '../config.js';
import { reg, box, cyl, cylBetween, tubeAlong } from './helpers.js';

function cylX(r, len, mat, seg = 24) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
  m.rotation.z = Math.PI / 2;
  return m;
}
function cylZ(r, len, mat, seg = 24) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
  m.rotation.x = Math.PI / 2;
  return m;
}

export function buildSystems(refs, mat) {
  const g = new THREE.Group();
  const cylZPos = (i) => P.cylZ(i);

  // ================= 燃油系统 =================
  // 高压油泵（左前侧，齿轮驱动）
  const pump = cyl(30, 30, 150, mat.aluminumDark, 28);
  pump.position.set(-115, 55, -90);
  reg(refs, pump, 'injection-pump');
  g.add(pump);
  for (let i = 0; i < P.numCyl; i++) {
    const out = cyl(7, 7, 12, mat.fuelPipe, 10);
    out.position.set(-115, 135, cylZPos(i));
    reg(refs, out, 'injection-pump');
    g.add(out);
  }
  // 喷油器（每缸 1 个，位于缸盖顶部中心）
  for (let i = 0; i < P.numCyl; i++) {
    const body = cyl(9, 9, 46, mat.stainless, 16);
    body.position.set(0, 424, cylZPos(i));
    reg(refs, body, 'injector');
    g.add(body);
    const nozzle = cyl(4, 2.5, 14, mat.copperBrass, 12);
    nozzle.position.set(0, 394, cylZPos(i));
    reg(refs, nozzle, 'injector');
    g.add(nozzle);
    const clamp = cyl(16, 16, 6, mat.steelForged, 20);
    clamp.position.set(0, 412, cylZPos(i));
    reg(refs, clamp, 'injector');
    g.add(clamp);
  }
  // 高压油管（油泵 → 喷油器）
  for (let i = 0; i < P.numCyl; i++) {
    const z = cylZPos(i);
    const pipe = tubeAlong([
      new THREE.Vector3(-115, 138, z),
      new THREE.Vector3(-135, 210, z),
      new THREE.Vector3(-55, 442, z),
      new THREE.Vector3(0, 452, z),
    ], 3, mat.fuelPipe);
    reg(refs, pipe, 'fuel-pipe');
    g.add(pipe);
  }
  // 燃油滤清器
  const fFilter = cyl(24, 24, 66, mat.plasticBlack, 24);
  fFilter.position.set(-115, 210, -180);
  reg(refs, fFilter, 'fuel-filter');
  g.add(fFilter);
  const fFilterCap = cyl(27, 27, 10, mat.aluminumDark, 24);
  fFilterCap.position.set(-115, 172, -180);
  reg(refs, fFilterCap, 'fuel-filter');
  g.add(fFilterCap);

  // ================= 润滑系统 =================
  // 机油泵（前下方，曲轴驱动）
  const oilPump = cyl(22, 22, 40, mat.aluminumDark, 20);
  oilPump.position.set(-80, -90, -228);
  reg(refs, oilPump, 'oil-pump');
  g.add(oilPump);
  const pickup = cylBetween(
    new THREE.Vector3(-80, -70, -228), new THREE.Vector3(-40, -150, -120), 10, mat.aluminumDark);
  reg(refs, pickup, 'oil-pump');
  g.add(pickup);
  // 机油滤清器
  const oFilter = cyl(24, 24, 64, mat.plasticBlack, 24);
  oFilter.position.set(-115, -20, -150);
  reg(refs, oFilter, 'oil-filter');
  g.add(oFilter);
  // 主油道（沿机体纵向，半透明机油）
  const gallery = cylZ(7, P.blockLen - 40, mat.fluidOil, 18);
  gallery.position.set(-25, 55, 0);
  reg(refs, gallery, 'oil-gallery');
  g.add(gallery);
  // 主油道 → 各主轴承支管
  for (let i = 0; i < 5; i++) {
    const z = -210 + i * 105;
    const branch = cylBetween(
      new THREE.Vector3(-25, 55, z), new THREE.Vector3(-10, -20, z), 5, mat.fluidOil);
    reg(refs, branch, 'oil-gallery');
    g.add(branch);
  }
  // 机油冷却器（前侧，板翅式）
  const oCooler = box(90, 40, 26, mat.aluminum, 0, 20, -205);
  reg(refs, oCooler, 'oil-cooler');
  g.add(oCooler);
  for (let i = -1; i <= 1; i++) {
    const fin = box(90, 2, 22, mat.aluminumDark, 0, 20 + i * 10, -205);
    reg(refs, fin, 'oil-cooler');
    g.add(fin);
  }

  // ================= 冷却系统 =================
  // 水泵（前右侧，皮带轮驱动）
  const wpBody = cylX(26, 40, mat.aluminum, 24);
  wpBody.position.set(80, 65, -235);
  reg(refs, wpBody, 'water-pump');
  g.add(wpBody);
  const impeller = new THREE.Group();
  const hub = cylZ(12, 14, mat.steelPolished, 16);
  impeller.add(hub);
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    const blade = box(4, 16, 22, mat.aluminumDark, 0, 0, 0);
    blade.position.set(Math.cos(a) * 10, Math.sin(a) * 10, 0);
    blade.rotation.z = a;
    impeller.add(blade);
  }
  impeller.position.set(104, 65, -235);
  reg(refs, impeller, 'water-pump');
  g.add(impeller);
  refs.waterPumpImpeller = impeller;
  // 节温器（缸盖出水口）
  const thermo = cyl(16, 16, 34, mat.aluminum, 20);
  thermo.position.set(70, 360, -195);
  reg(refs, thermo, 'thermostat');
  g.add(thermo);
  const thermoCap = cyl(20, 20, 10, mat.copperBrass, 20);
  thermoCap.position.set(70, 380, -195);
  reg(refs, thermoCap, 'thermostat');
  g.add(thermoCap);
  // 散热器（前部，竖直面板）
  const radCore = box(320, 360, 26, mat.aluminum, 0, 140, -340);
  reg(refs, radCore, 'radiator');
  g.add(radCore);
  const radTop = box(320, 60, 40, mat.plasticBlack, 0, 350, -340);
  reg(refs, radTop, 'radiator');
  g.add(radTop);
  const radBot = box(320, 60, 40, mat.plasticBlack, 0, -70, -340);
  reg(refs, radBot, 'radiator');
  g.add(radBot);
  // 风扇（随转速旋转）
  const fan = new THREE.Group();
  const fanHub = cylZ(14, 10, mat.steelForged, 16);
  fan.add(fanHub);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const blade = box(20, 90, 3, mat.plasticBlack, 0, 0, 0);
    blade.position.set(Math.cos(a) * 45, Math.sin(a) * 45, 0);
    blade.rotation.z = a;
    fan.add(blade);
  }
  fan.position.set(0, 140, -300);
  reg(refs, fan, 'radiator');
  g.add(fan);
  refs.fan = fan;
  // 水道管路（软管）
  const hoseMat = mat.rubber;
  const hose1 = tubeAlong([
    new THREE.Vector3(0, -90, -340), new THREE.Vector3(60, -90, -300),
    new THREE.Vector3(80, 20, -260), new THREE.Vector3(80, 45, -250),
  ], 14, hoseMat);
  reg(refs, hose1, 'water-pipe');
  g.add(hose1);
  const hose2 = tubeAlong([
    new THREE.Vector3(70, 380, -195), new THREE.Vector3(120, 400, -250),
    new THREE.Vector3(150, 350, -340),
  ], 14, hoseMat);
  reg(refs, hose2, 'water-pipe');
  g.add(hose2);
  // 水道管路（机体 → 缸盖，示意）
  const hose3 = cylBetween(new THREE.Vector3(60, 300, 80), new THREE.Vector3(60, 360, 80), 14, hoseMat);
  reg(refs, hose3, 'water-pipe');
  g.add(hose3);

  // ================= 进排气系统 =================
  // 进气歧管（右侧）
  const intakeLog = cylZ(26, P.blockLen - 60, mat.aluminum, 24);
  intakeLog.position.set(118, 332, 0);
  reg(refs, intakeLog, 'intake-manifold');
  g.add(intakeLog);
  for (let i = 0; i < P.numCyl; i++) {
    const runner = cylBetween(
      new THREE.Vector3(118, 332, cylZPos(i)), new THREE.Vector3(104, 332, cylZPos(i)), 15, mat.aluminum);
    reg(refs, runner, 'intake-manifold');
    g.add(runner);
  }
  // 排气歧管（左侧）
  const exLog = cylZ(30, P.blockLen - 60, mat.hotExhaust, 24);
  exLog.position.set(-118, 338, 0);
  reg(refs, exLog, 'exhaust-manifold');
  g.add(exLog);
  for (let i = 0; i < P.numCyl; i++) {
    const runner = cylBetween(
      new THREE.Vector3(-118, 338, cylZPos(i)), new THREE.Vector3(-104, 338, cylZPos(i)), 16, mat.hotExhaust);
    reg(refs, runner, 'exhaust-manifold');
    g.add(runner);
  }
  // 涡轮增压器（排气歧管后段）
  const turbine = cylX(30, 44, mat.hotExhaust, 24);
  turbine.position.set(-135, 345, 175);
  reg(refs, turbine, 'turbocharger');
  g.add(turbine);
  const compressor = cylX(28, 44, mat.aluminum, 24);
  compressor.position.set(-85, 345, 175);
  reg(refs, compressor, 'turbocharger');
  g.add(compressor);
  const center = cylX(16, 20, mat.steelForged, 20);
  center.position.set(-110, 345, 175);
  reg(refs, center, 'turbocharger');
  g.add(center);
  const turboWheel = new THREE.Group();
  const wheelDisc = cylX(22, 8, mat.steelForged, 20);
  turboWheel.add(wheelDisc);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const blade = box(4, 20, 8, mat.stainless);
    blade.position.set(0, Math.cos(a) * 11, Math.sin(a) * 11);
    blade.rotation.x = a;
    turboWheel.add(blade);
  }
  turboWheel.position.set(-110, 345, 175);
  reg(refs, turboWheel, 'turbocharger');
  g.add(turboWheel);
  refs.turboWheel = turboWheel;
  // 中冷器（进气侧后段）
  const ic = box(120, 60, 50, mat.aluminum, 120, 332, 175);
  reg(refs, ic, 'intercooler');
  g.add(ic);
  for (let i = -2; i <= 2; i++) {
    const fin = box(120, 3, 46, mat.aluminumDark, 120, 332 + i * 9, 175);
    reg(refs, fin, 'intercooler');
    g.add(fin);
  }
  // 增压管路（压气机 → 中冷器 → 进气歧管）
  g.add(cylBetween(new THREE.Vector3(-85, 345, 175), new THREE.Vector3(60, 345, 175), 13, mat.aluminum));
  g.add(cylBetween(new THREE.Vector3(120, 360, 175), new THREE.Vector3(118, 360, 175), 13, mat.aluminum));

  return g;
}
