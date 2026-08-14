// ============================================================================
// 界面：状态面板、图例、悬浮信息卡
// ============================================================================
import { LEGEND, P, STROKE } from './config.js';
import { PARTS } from './partData.js';

const $ = (id) => document.getElementById(id);

export function initUI() {
  // ---------- 图例 ----------
  const legendList = $('legend-list');
  legendList.innerHTML = '';
  for (const item of LEGEND) {
    const li = document.createElement('li');
    li.innerHTML = `<span class="swatch" style="background:${item.color}"></span>${item.group}`;
    legendList.appendChild(li);
  }

  // ---------- 各缸冲程徽章 ----------
  const cylWrap = $('cyl-strokes');
  cylWrap.innerHTML = '';
  for (let i = 0; i < P.numCyl; i++) {
    const row = document.createElement('div');
    row.className = 'cyl-row';
    row.innerHTML = `<span class="cyl-id">第 ${i + 1} 缸</span><span class="cyl-badge" data-cyl="${i}">吸气</span>`;
    cylWrap.appendChild(row);
  }

  return {
    els: {
      angle: $('stat-angle'),
      stroke: $('stat-stroke'),
      rpm: $('stat-rpm'),
      coolant: $('stat-coolant'),
      oil: $('stat-oil'),
      fuel: $('stat-fuel'),
      tooltip: $('tooltip'),
      ttNameZh: $('tt-name-zh'),
      ttNameEn: $('tt-name-en'),
      ttMaterial: $('tt-material'),
      ttFunction: $('tt-function'),
      ttParams: $('tt-params'),
      ttState: $('tt-state'),
      speedSlider: $('speed-slider'),
      speedValue: $('speed-value'),
      btnPlay: $('btn-play'),
      btnSection: $('btn-section'),
      btnExplode: $('btn-explode'),
      btnFluid: $('btn-fluid'),
      btnWireframe: $('btn-wireframe'),
      btnReset: $('btn-reset'),
      loading: $('loading'),
    },

    setStatus({ angle, strokeIdx, rpm, coolant, oil, injecting }) {
      this.els.angle.textContent = angle.toFixed(1) + '°';
      this.els.stroke.textContent = STROKE.SHORT[strokeIdx];
      this.els.stroke.className = '';
      this.els.stroke.classList.add(STROKE.CLASS[strokeIdx]);
      this.els.rpm.textContent = Math.round(rpm) + ' RPM';
      this.els.coolant.textContent = coolant.toFixed(1) + ' °C';
      this.els.oil.textContent = oil.toFixed(1) + ' bar';
      this.els.fuel.textContent = injecting ? '喷油中' : '—';
      this.els.fuel.className = injecting ? 'flash' : '';
    },

    setCylinders(infos) {
      const badges = document.querySelectorAll('#cyl-strokes .cyl-badge');
      infos.forEach((info, i) => {
        const b = badges[i];
        b.textContent = info.nameZh;
        b.className = 'cyl-badge ' + info.cls;
      });
    },

    showTooltip(key, stateText) {
      const p = PARTS[key];
      if (!p) return;
      this.els.ttNameZh.textContent = p.zh;
      this.els.ttNameEn.textContent = p.en;
      this.els.ttMaterial.textContent = p.material;
      this.els.ttFunction.textContent = p.func;
      this.els.ttParams.textContent = p.params;
      this.els.ttState.textContent = stateText || '—';
      this.els.tooltip.classList.remove('hidden');
    },

    hideTooltip() {
      this.els.tooltip.classList.add('hidden');
    },

    moveTooltip(x, y) {
      const w = this.els.tooltip.offsetWidth;
      const h = this.els.tooltip.offsetHeight;
      let left = x + 18;
      let top = y - h - 14;
      if (left + w > window.innerWidth - 8) left = x - w - 18;
      if (top < 8) top = y + 20;
      this.els.tooltip.style.left = left + 'px';
      this.els.tooltip.style.top = top + 'px';
    },
  };
}
