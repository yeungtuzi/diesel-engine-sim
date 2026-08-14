// ============================================================================
// 零件元数据：名称（中英）、材料与工艺、功能、关键设计参数
// 键名与各构建模块中的 partKey 一一对应。
// ============================================================================

export const PARTS = {
  // ===================== 固定件 =====================
  'cylinder-block': {
    zh: '气缸体', en: 'Cylinder Block',
    material: '灰铸铁 HT250，整体铸造，主轴承孔精镗',
    func: '发动机骨架，承载曲轴/活塞/缸套，内部布有主油道与缸体水套。',
    params: '缸径 92mm · 缸心距 112mm · 缸数 4 · 水套壁厚 6mm',
  },
  'cylinder-liner': {
    zh: '气缸套', en: 'Cylinder Liner',
    material: '合金铸铁，离心铸造，内孔珩磨',
    func: '构成燃烧室与活塞导向的精密内壁，耐高温高压、耐磨。',
    params: '内径 92mm · 壁厚 3mm · 表面粗糙度 Ra0.4',
  },
  'cylinder-head': {
    zh: '气缸盖', en: 'Cylinder Head',
    material: '铝合金 ZL101 / 灰铸铁，低压铸造，气道与油道整体成型',
    func: '密封燃烧室顶部，布置进/排气道、气门、喷油器与冷却水腔。',
    params: '气门 2 个/缸 · 喷油器孔 1 个/缸 · 压缩比 17.5:1',
  },
  'head-gasket': {
    zh: '气缸垫', en: 'Head Gasket',
    material: '多层钢 MLS 复合垫，表面涂覆密封胶',
    func: '密封缸体与缸盖结合面，隔离燃气、冷却液与机油通道。',
    params: '厚度 1.2mm · 缸口加强环',
  },
  'oil-pan': {
    zh: '油底壳', en: 'Oil Pan / Sump',
    material: '钢板冲压 / 铝合金压铸，内设隔板与放油螺塞',
    func: '储存机油，经机油泵吸入口供油，并收集回流机油。',
    params: '容量 ~12L · 含挡油板与磁性放油螺塞',
  },
  'flywheel-housing': {
    zh: '飞轮壳', en: 'Flywheel Housing',
    material: '灰铸铁 HT250 铸造',
    func: '连接发动机与变速器，包覆并防护飞轮与离合器。',
    params: '与曲轴轴线同轴度 ≤0.05mm',
  },
  'timing-cover': {
    zh: '正时齿轮室', en: 'Timing Gear Cover',
    material: '铝合金压铸 / 钢板冲压',
    func: '封闭正时齿轮系，保证曲轴与凸轮轴 2:1 相位关系。',
    params: '曲轴齿 21 · 凸轮轴齿 42 · 传动比 2:1',
  },
  'main-bearing-cap': {
    zh: '主轴承盖', en: 'Main Bearing Cap',
    material: '球墨铸铁 QT500，与缸体配对精加工',
    func: '压紧曲轴主轴颈，承受爆发压力与惯性力。',
    params: '主轴颈直径 60mm · 主轴承盖 5 道',
  },
  'bolt': {
    zh: '连接螺栓', en: 'Fastening Bolt',
    material: '合金钢 40Cr，调质处理，高强度级',
    func: '紧固缸盖、主轴承盖、连杆大头等关键结合面。',
    params: '缸盖螺栓 M14×2 · 主轴承螺栓 M16×1.5',
  },

  // ===================== 运动件 =====================
  'piston': {
    zh: '活塞', en: 'Piston',
    material: '铝合金 ZL109，锻造，顶部有 ω 形燃烧室凹坑',
    func: '在缸套内往复，压缩空气并传递燃气压力至连杆。',
    params: '直径 92mm · 压缩高 45mm · 顶部 ω 燃烧室',
  },
  'piston-ring': {
    zh: '活塞环组', en: 'Piston Ring Set',
    material: '球墨铸铁/钢，镀铬/喷钼，三道环',
    func: '密封燃气（气环）并刮油控油（油环），兼传热。',
    params: '气环 2 道 + 油环 1 道 · 开口间隙 0.3mm',
  },
  'piston-pin': {
    zh: '活塞销', en: 'Piston Pin / Gudgeon Pin',
    material: '合金钢 20CrMnTi，渗碳淬火，全浮式',
    func: '铰接活塞与连杆小头，传递往复力。',
    params: '直径 32mm · 全浮式 · 表面硬度 HRC58-64',
  },
  'connecting-rod': {
    zh: '连杆', en: 'Connecting Rod',
    material: '锻钢 40Cr，模锻，杆身工字形截面',
    func: '将活塞往复运动转换为曲轴旋转，传递燃气压力。',
    params: '中心距 200mm · 大头孔径 56mm · 小头孔径 32mm',
  },
  'rod-bearing': {
    zh: '连杆大头瓦', en: 'Connecting Rod Bearing',
    material: '钢背 + 铜铅合金/铝锡合金轴瓦',
    func: '支撑连杆颈，形成油膜，降低摩擦磨损。',
    params: '轴瓦厚度 2mm · 径向间隙 0.04-0.08mm',
  },
  'crankshaft': {
    zh: '曲轴', en: 'Crankshaft',
    material: '锻钢 42CrMo，模锻，轴颈感应淬火',
    func: '汇集各缸扭矩并输出，驱动配气与附件。',
    params: '主轴颈 60mm · 连杆颈 56mm · 曲柄半径 55mm',
  },
  'counterweight': {
    zh: '平衡重', en: 'Counterweight',
    material: '与曲轴一体锻造',
    func: '平衡旋转质量与部分往复惯性力，减小振动。',
    params: '配置于曲柄相对侧 · 动平衡等级 G6.3',
  },
  'flywheel': {
    zh: '飞轮', en: 'Flywheel',
    material: '灰铸铁 HT250 铸造，外缘热套齿圈',
    func: '储存旋转动能，平稳转速，供起动马达啮合。',
    params: '直径 340mm · 转动惯量大 · 外缘起动齿圈',
  },
  'crankshaft-pulley': {
    zh: '曲轴皮带轮', en: 'Crankshaft Pulley',
    material: '锻钢 / 球铁，带扭转减振器',
    func: '驱动水泵、发电机等附件，并吸收扭转振动。',
    params: '多楔带 · 集成硅油减振器',
  },

  // ===================== 配气机构 =====================
  'camshaft': {
    zh: '凸轮轴', en: 'Camshaft',
    material: '合金铸铁 / 冷激铸铁，凸轮表面淬硬',
    func: '按配气相位驱动挺柱→推杆→摇臂，控制气门开闭。',
    params: '8 凸轮 · 转速为曲轴 1/2 · 凸轮升程 9.5mm',
  },
  'tappet': {
    zh: '挺柱', en: 'Tappet / Lifter',
    material: '合金钢，桶形/菌形，工作面渗碳',
    func: '将凸轮升程传递给推杆，承受侧向力。',
    params: '菌形挺柱 · 直径 25mm',
  },
  'pushrod': {
    zh: '推杆', en: 'Pushrod',
    material: '无缝钢管 / 合金钢，两端球头',
    func: '将挺柱运动传至摇臂，长杆承受轴向力。',
    params: '长度 ~370mm · 空心钢管',
  },
  'rocker-arm': {
    zh: '摇臂', en: 'Rocker Arm',
    material: '锻钢 / 精铸钢，摇臂轴轴承',
    func: '杠杆放大并换向，将推杆升程作用于气门杆。',
    params: '摇臂比 1.4:1 · 气门升程 9.5mm',
  },
  'intake-valve': {
    zh: '进气门', en: 'Intake Valve',
    material: '耐热钢 4Cr9Si2，锥面堆焊钴基合金',
    func: '控制新鲜空气进入气缸，开启于吸气冲程。',
    params: '盘径 40mm · 升程 9.5mm · 开启角 -15°~220°',
  },
  'exhaust-valve': {
    zh: '排气门', en: 'Exhaust Valve',
    material: '奥氏体耐热钢 21-4N，钠冷中空',
    func: '控制废气排出气缸，开启于排气冲程。',
    params: '盘径 36mm · 升程 9.5mm · 开启角 495°~735°',
  },
  'valve-spring': {
    zh: '气门弹簧', en: 'Valve Spring',
    material: '弹簧钢 60Si2Mn，螺旋圆柱弹簧',
    func: '使气门紧贴座圈闭合，防止跳动。',
    params: '双弹簧 · 刚度 ~45N/mm · 预紧力',
  },
  'timing-gear': {
    zh: '正时齿轮', en: 'Timing Gear',
    material: '合金钢，斜齿/直齿，磨齿',
    func: '以 2:1 传动比同步曲轴与凸轮轴。',
    params: '曲轴齿 21 · 凸轮轴齿 42 · 模数 3',
  },

  // ===================== 燃油系统 =====================
  'injection-pump': {
    zh: '高压油泵', en: 'High-Pressure Injection Pump',
    material: '合金钢柱塞偶件，精密研磨配副',
    func: '将低压燃油增压至高压并按时序分配给各喷油器。',
    params: '柱塞式 · 喷射压力 ~120MPa · 柱塞直径 10mm',
  },
  'injector': {
    zh: '喷油器', en: 'Fuel Injector',
    material: '钢制阀体，针阀偶件精密研磨',
    func: '将高压燃油以雾化形式喷入燃烧室。',
    params: '多孔喷嘴 5 孔 · 开启压力 25MPa · 雾化锥角',
  },
  'fuel-filter': {
    zh: '燃油滤清器', en: 'Fuel Filter',
    material: '壳体钢/铝，纸质滤芯',
    func: '过滤燃油杂质与水分，保护精密偶件。',
    params: '过滤精度 3-5μm · 带油水分离器',
  },
  'fuel-pipe': {
    zh: '高压油管', en: 'High-Pressure Fuel Pipe',
    material: '厚壁无缝钢管，两端球锥密封',
    func: '将高压燃油从油泵输送至喷油器。',
    params: '内径 2mm · 耐压 >150MPa',
  },

  // ===================== 润滑系统 =====================
  'oil-pump': {
    zh: '机油泵', en: 'Oil Pump',
    material: '铸铁壳体，齿轮/转子式',
    func: '将油底壳机油加压，输送至各摩擦副。',
    params: '齿轮式 · 额定流量 ~40L/min · 压力 4-5bar',
  },
  'oil-filter': {
    zh: '机油滤清器', en: 'Oil Filter',
    material: '钢壳 + 滤纸，带旁通阀',
    func: '过滤机油中的磨屑与杂质。',
    params: '过滤精度 15μm · 旁通阀开启 1.5bar',
  },
  'oil-gallery': {
    zh: '主油道', en: 'Main Oil Gallery',
    material: '缸体铸造内腔（钻削油道）',
    func: '将压力机油分配至主轴承、连杆与配气机构。',
    params: '主油道直径 14mm · 压力 4-5bar',
  },
  'oil-cooler': {
    zh: '机油冷却器', en: 'Oil Cooler',
    material: '铝制板翅式，内置旁通阀',
    func: '用冷却液冷却机油，维持油温。',
    params: '板翅式 · 散热功率 ~8kW',
  },

  // ===================== 冷却系统 =====================
  'water-pump': {
    zh: '水泵', en: 'Water Pump',
    material: '铸铁/铝壳体，离心式叶轮',
    func: '驱动冷却液在缸体水套、散热器间循环。',
    params: '离心式 · 流量 ~150L/min',
  },
  'thermostat': {
    zh: '节温器', en: 'Thermostat',
    material: '蜡式感温元件，黄铜/钢壳体',
    func: '控制冷却液大/小循环，维持工作温度。',
    params: '开启温度 82°C · 全开 95°C',
  },
  'radiator': {
    zh: '散热器', en: 'Radiator',
    material: '铝制管带式芯体 + 塑料水室',
    func: '将冷却液热量散发至空气，冷却发动机。',
    params: '管带式 · 散热面积大 · 带风扇',
  },
  'water-jacket': {
    zh: '缸体水套', en: 'Water Jacket',
    material: '缸体/缸盖铸造内腔',
    func: '环绕气缸与燃烧室，带走高温区域热量。',
    params: '环绕缸套 · 冷却液流向缸盖',
  },
  'water-pipe': {
    zh: '水道管路', en: 'Coolant Pipe',
    material: '橡胶软管 / 钢管，卡箍连接',
    func: '连接水泵、散热器、节温器与机体水套。',
    params: '耐温 120°C · 内径 40mm',
  },

  // ===================== 进排气系统 =====================
  'intake-manifold': {
    zh: '进气管', en: 'Intake Manifold',
    material: '铝合金 / 塑料，气道流畅设计',
    func: '将增压后的新鲜空气均匀分配至各缸。',
    params: '谐振进气 · 气道截面积匹配',
  },
  'exhaust-manifold': {
    zh: '排气管', en: 'Exhaust Manifold',
    material: '耐热铸铁 / 不锈钢，紧凑布置',
    func: '汇集各缸废气导入涡轮增压器。',
    params: '耐温 >700°C · 脉冲式',
  },
  'turbocharger': {
    zh: '涡轮增压器', en: 'Turbocharger',
    material: '镍基高温合金涡轮 + 铝压气机叶轮',
    func: '利用废气能量压缩进气，提高进气密度与功率。',
    params: '压比 ~2.5 · 转速可超 10万rpm',
  },
  'intercooler': {
    zh: '中冷器', en: 'Intercooler / Charge Air Cooler',
    material: '铝制板翅式/管带式',
    func: '冷却增压后的进气，提高密度并降低热负荷。',
    params: '进气降温 50-80°C',
  },
};

// 依据零件类型与当前相位，动态生成“当前状态”描述。
export function partState(key, phaseDeg) {
  const s = (phaseDeg + 720) % 720;
  switch (key) {
    case 'piston': case 'piston-ring': case 'piston-pin':
      if (s < 180) return '吸气下行中';
      if (s < 360) return '正在压缩上行';
      if (s < 540) return '做功下行（膨胀）';
      return '正在排气上行';
    case 'intake-valve':
      return s >= 705 || s < 220 ? '进气门开启中' : '进气门关闭';
    case 'exhaust-valve':
      return (s >= 495 && s < 720) || s < 15 ? '排气门开启中' : '排气门关闭';
    case 'injector':
      return (s >= 348 && s <= 366) ? '正在喷射燃油' : '待喷（蓄压）';
    case 'crankshaft': case 'flywheel': case 'crankshaft-pulley':
      return `旋转中 · ${(phaseDeg % 360).toFixed(1)}°`;
    case 'camshaft': case 'timing-gear':
      return `旋转中 · 曲轴转速 1/2（${((phaseDeg / 2) % 360).toFixed(1)}°）`;
    case 'turbocharger':
      return '废气驱动，压气端持续增压';
    case 'water-pump': case 'water-pipe': case 'thermostat':
      return '冷却液循环中';
    case 'oil-pump': case 'oil-gallery': case 'oil-filter': case 'oil-cooler':
      return '压力机油循环中';
    default:
      return '静止固定件';
  }
}
