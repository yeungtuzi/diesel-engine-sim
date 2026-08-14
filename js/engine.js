// ============================================================================
// 发动机总装：汇总各子系统，提供动画引用
// ============================================================================
import * as THREE from 'three';
import { buildFoundation } from './build/foundation.js';
import { buildRotating } from './build/rotating.js';
import { buildValvetrain } from './build/valvetrain.js';
import { buildSystems } from './build/systems.js';

export function buildEngine(materials) {
  const refs = {
    hitMeshes: [],       // 用于射线拾取的网格
    housingMats: [],     // 透明外壳材质（可切换不透明）
    crankshaft: null,
    camshaft: null,
    pistons: [],
    rods: [],
    tappets: [],
    pushrods: [],
    rockers: [],
    valves: [],
    waterPumpImpeller: null,
    fan: null,
    turboWheel: null,
  };

  const root = new THREE.Group();
  const foundation = buildFoundation(refs, materials);
  const rotating = buildRotating(refs, materials);
  const valvetrain = buildValvetrain(refs, materials);
  const systems = buildSystems(refs, materials);
  root.add(foundation, rotating, valvetrain, systems);

  return {
    root,
    refs,
    subGroups: { foundation, rotating, valvetrain, systems },
  };
}
