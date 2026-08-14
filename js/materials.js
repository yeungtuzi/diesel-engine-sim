// ============================================================================
// PBR 材质与环境光照
// ============================================================================
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// 生成灰度噪声纹理（用于粗糙度变化，增强真实感）
function noiseTexture(size = 256) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 120 + Math.random() * 120;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(6, 6);
  return t;
}

// 创建环境贴图 + 材质库
export function createMaterials(renderer) {
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new RoomEnvironment(renderer);
  const envMap = pmrem.fromScene(envScene, 0.04).texture;
  pmrem.dispose();
  if (envScene.dispose) envScene.dispose();

  const roughNoise = noiseTexture();

  const std = (opts) => new THREE.MeshStandardMaterial({
    envMap, envMapIntensity: 0.85, ...opts,
  });

  const materials = {
    // —— 铸铁 ——
    castIron: std({ color: 0x5a626b, metalness: 0.6,  roughness: 0.52, roughnessMap: roughNoise }),
    castIronDark: std({ color: 0x474d55, metalness: 0.6, roughness: 0.55, roughnessMap: roughNoise }),
    // —— 铝合金 ——
    aluminum: std({ color: 0x9aa3ad, metalness: 0.9,  roughness: 0.32 }),
    aluminumDark: std({ color: 0x7d8790, metalness: 0.9, roughness: 0.34 }),
    pistonAlloy: std({ color: 0x8f98a1, metalness: 0.92, roughness: 0.28 }),
    // —— 钢 ——
    steelPolished: std({ color: 0xcdd2d8, metalness: 1.0, roughness: 0.16 }),
    steelForged: std({ color: 0x83888e, metalness: 0.88, roughness: 0.38 }),
    springSteel: std({ color: 0xbcc1c7, metalness: 0.95, roughness: 0.22 }),
    // —— 有色/其它 ——
    copperBrass: std({ color: 0xc98a4b, metalness: 0.95, roughness: 0.30 }),
    stainless: std({ color: 0xaab1b8, metalness: 0.9, roughness: 0.42 }),
    rubber: std({ color: 0x26282b, metalness: 0.05, roughness: 0.92 }),
    plasticBlack: std({ color: 0x30363d, metalness: 0.1, roughness: 0.68 }),
    fuelPipe: std({ color: 0xb06a3a, metalness: 0.85, roughness: 0.35 }),
    // 排气/涡轮（轻微自发光表示高温）
    hotExhaust: new THREE.MeshStandardMaterial({
      color: 0x8e979e, metalness: 0.9, roughness: 0.5,
      emissive: 0x3a1406, emissiveIntensity: 0.35, envMap, envMapIntensity: 0.6,
    }),
    // —— 流体（半透明） ——
    fluidCoolant: new THREE.MeshPhysicalMaterial({
      color: 0x2fb8dc, metalness: 0, roughness: 0.05,
      transparent: true, opacity: 0.32, depthWrite: false,
      side: THREE.DoubleSide, envMap, envMapIntensity: 0.4,
    }),
    fluidOil: new THREE.MeshPhysicalMaterial({
      color: 0xd9a13a, metalness: 0, roughness: 0.15,
      transparent: true, opacity: 0.38, depthWrite: false,
      side: THREE.DoubleSide, envMap, envMapIntensity: 0.4,
    }),
    // 剖切面填充
    sectionCap: new THREE.MeshBasicMaterial({
      color: 0x4a5a6e, side: THREE.DoubleSide, transparent: true, opacity: 0.15,
    }),
  };

  return { materials, envMap };
}
