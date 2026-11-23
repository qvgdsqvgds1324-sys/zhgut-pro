/* ============================================================
   ЖГУТ.ПРО — интерфейс конфигуратора
   ============================================================ */
(function () {
  'use strict';

  const D = window.HARNESS_DATA;
  const C = window.HARNESS_CALC;
  const $ = function (sel, root) { return (root || document).querySelector(sel); };
  const $$ = function (sel, root) { return Array.from((root || document).querySelectorAll(sel)); };

  const STORAGE_KEY = 'zhgutpro:cfg:v1';
  const STEPS = [
    { name: 'Техника', short: 'Техника' },
    { name: 'Состав', short: 'Состав' },
    { name: 'Провода', short: 'Провода' },
    { name: 'Разъёмы', short: 'Разъёмы' },
    { name: 'Опции', short: 'Опции' },
    { name: 'Итог', short: 'Итог' }
  ];

  const numFmt = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 1 });
  const intFmt = new Intl.NumberFormat('ru-RU');
  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function money(v) { return C.formatMoney(v); }
  function num(v) { return numFmt.format(v); }
  function int(v) { return intFmt.format(v); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function plural(n, one, few, many) {
    const n10 = n % 10;
    const n100 = n % 100;
    if (n10 === 1 && n100 !== 11) return one;
    if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return few;
    return many;
  }
  function circuitsWord(n) { return plural(n, 'цепь', 'цепи', 'цепей'); }
  function branchesWord(n) { return plural(n, 'ветвь', 'ветви', 'ветвей'); }
  function pad2(n) { return String(n).padStart(2, '0'); }

  /* ---------- иконки ---------- */
  const TYPE_ICONS = {
    yacht: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 42h50l-8 10H15L7 42z"/><path d="M32 7v35"/><path d="M32 11 15 37h17"/><path d="M37 20l13 17H37"/><path d="M4 58h56"/></svg>',
    camper: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 45V25a4 4 0 0 1 4-4h27l8 9h10a4 4 0 0 1 4 4v11"/><path d="M5 45h54"/><path d="M46 21v10h12"/><rect x="11" y="27" width="13" height="9" rx="1.5"/><circle cx="17" cy="49" r="5"/><circle cx="47" cy="49" r="5"/></svg>',
    car: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 41v-7l7-2 7-12h20l8 12 9 2v7"/><path d="M6 41h52"/><circle cx="18" cy="44" r="5"/><circle cx="47" cy="44" r="5"/><path d="M23 20l-4 12h13V20M37 20v12h13l-5-12"/></svg>'
  };
  const TYPE_SHORT = {
    yacht: 'соль, влага, УФ',
    camper: 'жилая зона и шасси',
    car: 'моторный отсек и салон'
  };
  const ENV_ICONS = {
    dry: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"/></svg>',
    damp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5S6 10.2 6 14a6 6 0 0 0 12 0c0-3.8-6-10.5-6-10.5z"/><path d="M9.5 14.5a2.6 2.6 0 0 0 2.5 2.4"/></svg>',
    engine: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2s1.5 4-1.5 7S9 14 12 16c-4 0-7-2.5-7-6 0-2 1-3.5 1-3.5S4 8 4 11a8 8 0 0 0 16 0c0-5-7-9-7-9z"/></svg>',
    bilge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M2 9c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2"/><path d="M2 15c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2 2 2 4 2"/></svg>'
  };
  const BLOCK_ICONS = {
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10.5c.8.8 1.3 1.7 1.4 3h5.2c.1-1.3.6-2.2 1.4-3A6 6 0 0 0 12 3z"/></svg>',
    socket: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="10" r="1.2" fill="currentColor"/><circle cx="15" cy="10" r="1.2" fill="currentColor"/><path d="M8 15h8"/></svg>',
    drop: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3.5S6 10.2 6 14a6 6 0 0 0 12 0c0-3.8-6-10.5-6-10.5z"/><path d="M9.5 14.5a2.6 2.6 0 0 0 2.5 2.4"/></svg>',
    flame: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2s1.5 4-1.5 7S9 14 12 16c-4 0-7-2.5-7-6 0-2 1-3.5 1-3.5S4 8 4 11a8 8 0 0 0 16 0c0-5-7-9-7-9z"/></svg>',
    gauge: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 18a8 8 0 1 1 16 0"/><path d="M12 18l4-5"/><circle cx="12" cy="18" r="1.6" fill="currentColor"/><path d="M5 18h2M17 18h2"/></svg>',
    bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>',
    panel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M7 10h10M7 14h6"/><circle cx="17" cy="14" r="1.4" fill="currentColor"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M12 8v8M8 12h8"/></svg>'
  };
  const MODE_ICONS = {
    blocks: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="8" height="7" rx="2"/><rect x="13" y="4" width="8" height="7" rx="2"/><rect x="3" y="13" width="8" height="7" rx="2"/><rect x="13" y="13" width="8" height="7" rx="2"/></svg>',
    simple: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/><circle cx="9" cy="7" r="2.2" fill="#fff"/><circle cx="15" cy="12" r="2.2" fill="#fff"/><circle cx="8" cy="17" r="2.2" fill="#fff"/></svg>'
  };

  /* ---------- состояние ---------- */
  let state;
  let step = 1;
  let lastResult;
  let lastLead = null;
  let toastTimer = null;
  let persistTimer = null;
  let asideRaf = 0;
  let selectedBlockId = null;
  let paletteDragType = null;
  let canvasDrag = null;
  let nearestPortId = null;

  function encodeState(s) {
    const bytes = new TextEncoder().encode(JSON.stringify(s));
    let bin = '';
    bytes.forEach(function (b) { bin += String.fromCharCode(b); });
    return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decodeState(str) {
    const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const bin = atob(b64 + '='.repeat((4 - b64.length % 4) % 4));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function clampStep(n) {
    n = Number(n);
    return n >= 1 && n <= 6 ? n : 1;
  }

  function loadInitial() {
    const hash = window.location.hash || '';
    const match = hash.match(/#cfg=([A-Za-z0-9_-]+)/);
    if (match) {
      try {
        return { state: D.sanitize(JSON.parse(decodeState(match[1]))), step: 6 };
      } catch (err) { /* повреждённая ссылка — стартуем с сохранения */ }
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return { state: D.sanitize(parsed.state), step: clampStep(parsed.step) };
      }
    } catch (err) { /* localStorage может быть запрещён */ }
    return { state: D.presetState('yacht', 'y-main'), step: 1 };
  }

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ state: state, step: step }));
    } catch (err) { /* noop */ }
  }

  function persistSoon() {
    clearTimeout(persistTimer);
    persistTimer = setTimeout(persist, 280);
  }

  /* ---------- toast / меню ---------- */
  function toast(message) {
    const el = $('#toast');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 3400);
  }

  function closeMenu() {
    document.body.classList.remove('menu-open');
    const btn = $('#navToggle');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function scrollToConfig() {
    const el = $('#configurator');
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: y, behavior: motionOK ? 'smooth' : 'auto' });
  }

  function scrollToForm() {
    if (step !== 6) {
      step = 6;
      renderStep();
      syncStepper();
      renderAside();
      updateMobileBar();
      persist();
    }
    setTimeout(function () {
      const lead = $('#lead');
      if (lead) lead.scrollIntoView({ behavior: motionOK ? 'smooth' : 'auto', block: 'start' });
    }, 90);
  }

  /* ---------- цены «от» ---------- */
  function typicalPrice(typeId, purposeId) {
    return C.calc(D.presetState(typeId, purposeId), D).priceOne;
  }

  /* ---------- лендинг: карточки техники ---------- */
  function renderTypeCards() {
    const host = $('#typeCards');
    if (!host) return;
    host.innerHTML = Object.keys(D.TYPES).map(function (id, index) {
      const t = D.TYPES[id];
      const min = Math.min.apply(null, t.purposes.map(function (p) { return typicalPrice(t.id, p.id); }));
      const extra = t.purposes.length - 3;
      return '<article class="type-card" style="--tc:' + t.accent + '">' +
        '<div class="type-card-top"><span class="type-index">' + pad2(index + 1) + '</span>' + TYPE_ICONS[t.id] + '</div>' +
        '<h3>' + t.name + '</h3>' +
        '<p>' + t.desc + '</p>' +
        '<ul class="type-list">' +
          t.purposes.slice(0, 3).map(function (p) { return '<li>' + p.name + '</li>'; }).join('') +
          (extra > 0 ? '<li class="more">и ещё ' + extra + ' ' + plural(extra, 'назначение', 'назначения', 'назначений') + '</li>' : '') +
        '</ul>' +
        '<div class="type-foot">' +
          '<div class="type-from"><span>расчёт от</span><b>' + money(min) + '</b></div>' +
          '<button type="button" class="btn btn-ghost btn-small" data-action="type-jump" data-value="' + t.id + '">Настроить →</button>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  /* ---------- лендинг: пресеты ---------- */
  function renderPresets() {
    const host = $('#presetCards');
    if (!host) return;
    host.innerHTML = D.PRESETS.map(function (p) {
      const base = D.presetState(p.type, p.purpose);
      const seeded = D.sanitize(Object.assign({}, base, p.overrides || {}, { qty: 1 }));
      const r = C.calc(seeded, D);
      return '<article class="preset-card' + (p.featured ? ' is-featured' : '') + '">' +
        '<div class="preset-top"><span class="preset-badge">' + p.badge + '</span><span class="preset-code">' + r.code + '</span></div>' +
        '<h3>' + p.title + '</h3>' +
        '<p>' + p.desc + '</p>' +
        '<ul class="chips">' + p.chips.map(function (c) { return '<li>' + c + '</li>'; }).join('') + '</ul>' +
        '<div class="preset-foot">' +
          '<div><span>предварительно</span><b>≈ ' + money(r.priceOne) + '</b></div>' +
          '<button type="button" class="btn btn-primary btn-small" data-action="preset" data-value="' + p.id + '">Загрузить</button>' +
        '</div>' +
      '</article>';
    }).join('');
  }

  /* ---------- шаги ---------- */
  function renderStepper() {
    const host = $('#stepper');
    if (!host) return;
    host.innerHTML = STEPS.map(function (s, i) {
      const n = i + 1;
      return '<button type="button" class="step" role="tab" data-action="step" data-step="' + n + '" aria-label="Шаг ' + n + ': ' + s.name + '">' +
        '<span class="step-num">' + pad2(n) + '</span><span class="step-name">' + s.short + '</span>' +
      '</button>';
    }).join('');
  }

  function syncStepper() {
    $$('#stepper .step').forEach(function (btn) {
      const n = Number(btn.dataset.step);
      btn.classList.toggle('is-active', n === step);
      btn.classList.toggle('is-done', n < step);
      btn.setAttribute('aria-selected', n === step ? 'true' : 'false');
      if (n === step) btn.setAttribute('aria-current', 'step');
      else btn.removeAttribute('aria-current');
    });
  }

  function optButton(o) {
    return '<button type="button" class="opt ' + (o.on ? 'is-on ' : '') + (o.className || '') + '"' +
      ' data-action="' + o.action + '" data-value="' + o.value + '" aria-pressed="' + (o.on ? 'true' : 'false') + '">' +
      '<span class="opt-check" aria-hidden="true"></span>' +
      '<span class="opt-name">' + o.name + '</span>' +
      (o.desc ? '<span class="opt-desc">' + o.desc + '</span>' : '') +
      (o.meta ? '<span class="opt-meta">' + o.meta + '</span>' : '') +
    '</button>';
  }

  function rangeField(o) {
    const pct = ((o.value - o.min) / (o.max - o.min) * 100).toFixed(1);
    return '<div class="field">' +
      '<div class="field-label-row">' +
        '<label class="field-label" for="range-' + o.key + '">' + o.label + '</label>' +
        '<output class="range-out" for="range-' + o.key + '" data-out="' + o.key + '">' + o.text(o.value) + '</output>' +
      '</div>' +
      '<input class="range" id="range-' + o.key + '" type="range" min="' + o.min + '" max="' + o.max + '" step="' + o.step + '" value="' + o.value + '" data-bind="' + o.key + '" style="--p:' + pct + '%" aria-label="' + o.label + '" aria-valuetext="' + o.text(o.value) + '">' +
      '<div class="range-scale">' + o.marks.map(function (m) { return '<span>' + m + '</span>'; }).join('') + '</div>' +
    '</div>';
  }

  function stepNav() {
    const last = step === 6;
    return '<div class="step-nav">' +
      (step > 1 ? '<button type="button" class="btn btn-ghost" data-action="back">← Назад</button>' : '<span></span>') +
      '<span class="step-count">Шаг ' + step + ' из 6</span>' +
      (last
        ? '<button type="button" class="btn btn-primary" data-action="to-form">Оставить заявку →</button>'
        : '<button type="button" class="btn btn-primary" data-action="next">' + (step === 5 ? 'Показать расчёт' : 'Далее') + ' →</button>') +
    '</div>';
  }

  function renderStep() {
    const panel = $('#configPanel');
    if (!panel) return;
    const renderers = [renderStep1, renderStep2, renderStep3, renderStep4, renderStep5, renderStep6];
    panel.innerHTML = renderers[step - 1]();
  }

  /* шаг 1 */
  function renderStep1() {
    const t = D.TYPES[state.type];
    const typeTiles = Object.keys(D.TYPES).map(function (id) {
      const tt = D.TYPES[id];
      return '<button type="button" class="type-tile ' + (state.type === id ? 'is-on' : '') + '" data-action="type" data-value="' + id + '" aria-pressed="' + (state.type === id ? 'true' : 'false') + '">' +
        '<span class="tt-icon">' + TYPE_ICONS[id] + '</span>' +
        '<span class="tt-body"><b>' + tt.name + '</b><small>' + TYPE_SHORT[id] + '</small></span>' +
      '</button>';
    }).join('');

    const purposes = t.purposes.map(function (p) {
      return '<button type="button" class="opt purpose ' + (state.purpose === p.id ? 'is-on' : '') + '" data-action="purpose" data-value="' + p.id + '" aria-pressed="' + (state.purpose === p.id ? 'true' : 'false') + '">' +
        '<span class="opt-check" aria-hidden="true"></span>' +
        '<span class="opt-name">' + p.name + '</span>' +
        '<span class="opt-desc">' + p.desc + '</span>' +
        '<span class="opt-meta">' + p.circuits + ' ' + circuitsWord(p.circuits) + ' · ' + num(p.length) + ' м · ' + p.voltage + ' В</span>' +
      '</button>';
    }).join('');

    const voltages = [12, 24, 48].map(function (v) {
      return '<button type="button" class="' + (state.voltage === v ? 'is-on' : '') + '" data-action="voltage" data-value="' + v + '" aria-pressed="' + (state.voltage === v ? 'true' : 'false') + '">' + v + ' В</button>';
    }).join('');

    const qtys = D.QTY_OPTIONS.map(function (q) {
      return '<button type="button" class="' + (state.qty === q.value ? 'is-on' : '') + '" data-action="qty" data-value="' + q.value + '" aria-pressed="' + (state.qty === q.value ? 'true' : 'false') + '">' + q.value +
        (q.discount ? '<small>−' + Math.round(q.discount * 100) + '%</small>' : '') + '</button>';
    }).join('');

    return '<div class="step-head">' +
        '<p class="step-kicker">Шаг 1 · Техника</p>' +
        '<h3>Что за техника и какой жгут?</h3>' +
        '<p class="step-lead">Выберите тип — подставим типовые параметры и условия эксплуатации. Всё можно изменить на следующих шагах.</p>' +
      '</div>' +
      '<div class="field">' +
        '<div class="field-label">Тип техники</div>' +
        '<div class="type-tiles" role="group" aria-label="Тип техники">' + typeTiles + '</div>' +
      '</div>' +
      '<div class="field">' +
        '<div class="field-label"><span>Назначение жгута</span><span class="field-hint">' + t.purposes.length + ' вариантов</span></div>' +
        '<div class="purpose-grid" role="group" aria-label="Назначение жгута">' + purposes + '</div>' +
      '</div>' +
      '<div class="field-two">' +
        '<div class="field">' +
          '<div class="field-label">Напряжение бортсети</div>' +
          '<div class="seg" role="group" aria-label="Напряжение">' + voltages + '</div>' +
        '</div>' +
        '<div class="field">' +
          '<div class="field-label"><span>Партия</span><span class="field-hint">скидка за серию</span></div>' +
          '<div class="seg seg-wrap" role="group" aria-label="Партия">' + qtys + '</div>' +
        '</div>' +
      '</div>' +
      stepNav();
  }

  /* ---------- блоки ---------- */
  function nextBlockId() {
    let max = 0;
    state.blocks.forEach(function (b) {
      const match = /^b(\d+)$/.exec(b.id);
      if (match) max = Math.max(max, Number(match[1]));
    });
    return 'b' + (max + 1);
  }

  function findBlock(id) {
    return state.blocks.find(function (b) { return b.id === id; });
  }

  function blockCost(id) {
    const item = (lastResult.blockCosts || []).find(function (c) { return c.id === id; });
    return item ? item.total : 0;
  }

  function syncBlocksAggregate() {
    if (state.mode !== 'blocks') return;
    const agg = D.aggregateBlocks(state.trunk, state.blocks);
    state.circuits = Math.max(4, Math.min(64, agg.circuits));
    state.length = Math.max(1, Math.min(30, Math.round(agg.length * 10) / 10));
    state.branches = Math.min(12, agg.branches);
    state.section = Number(state.trunk.section) || state.section;
    state.connectors = state.trunk.connector || state.connectors;
  }

  function trunkLengthMax() {
    const others = Math.max(0, state.length - Number(state.trunk.length));
    return Math.max(1, Math.min(10, Math.floor((30 - others) * 2) / 2));
  }

  function parentOf(block) {
    return block.parentId ? findBlock(block.parentId) : null;
  }

  function blockAnchorY(block) {
    const parent = parentOf(block);
    return parent ? blockOuterY(parent) : D.CANVAS.trunkY;
  }

  function blockDir(block) {
    return block.y < blockAnchorY(block) ? -1 : 1;
  }

  function blockInnerY(block) {
    return block.y + (blockDir(block) < 0 ? D.CANVAS.brickH / 2 : -D.CANVAS.brickH / 2);
  }

  function blockOuterY(block) {
    return block.y + (blockDir(block) < 0 ? -D.CANVAS.brickH / 2 : D.CANVAS.brickH / 2);
  }

  function maxLengthFor(block) {
    const CV = D.CANVAS;
    const anchor = blockAnchorY(block);
    const dir = block.y < anchor ? -1 : 1;
    const space = (dir < 0 ? anchor - CV.minY : CV.maxY - anchor) - CV.brickH / 2;
    const geomMax = Math.max(CV.minLength, space / CV.scale);
    const totalMax = (30 - Math.max(0, state.length - block.length * block.qty)) / (block.qty || 1);
    return Math.max(CV.minLength, Math.floor(Math.min(CV.maxLength, geomMax, totalMax) * 2) / 2);
  }

  function lengthFromGeometry(block) {
    const anchor = blockAnchorY(block);
    const dir = block.y < anchor ? -1 : 1;
    const distance = Math.abs(block.y - anchor) - D.CANVAS.brickH / 2;
    return Math.max(D.CANVAS.minLength, Math.min(D.CANVAS.maxLength, Math.round(distance / D.CANVAS.scale * 2) / 2));
  }

  function snapBlockGeometry(block) {
    const max = maxLengthFor(block);
    const length = Math.max(D.CANVAS.minLength, Math.min(lengthFromGeometry(block), max));
    block.length = length;
    const anchor = blockAnchorY(block);
    const dir = block.y < anchor ? -1 : 1;
    block.y = Math.min(D.CANVAS.maxY, Math.max(D.CANVAS.minY, anchor + dir * (length * D.CANVAS.scale + D.CANVAS.brickH / 2)));
  }

  function isBlockDescendant(candidateId, ancestorId) {
    let cursor = findBlock(candidateId);
    let depth = 0;
    while (cursor && depth < 20) {
      if (cursor.id === ancestorId) return true;
      cursor = cursor.parentId ? findBlock(cursor.parentId) : null;
      depth += 1;
    }
    return false;
  }

  function optionsHTML(list, selected) {
    return list.map(function (item) {
      return '<option value="' + item.value + '"' + (item.value === selected ? ' selected' : '') + '>' + item.label + '</option>';
    }).join('');
  }

  function sectionOptions(selected) {
    return optionsHTML(D.SECTIONS.map(function (s) { return { value: s.value, label: s.label }; }), Number(selected));
  }

  function connectorOptions(selected) {
    return Object.keys(D.CONNECTORS).map(function (id) {
      return '<option value="' + id + '"' + (id === selected ? ' selected' : '') + '>' + D.CONNECTORS[id].name + '</option>';
    }).join('');
  }

  function modeSwitch() {
    return '<div class="mode-switch" role="group" aria-label="Способ сборки жгута">' +
      '<button type="button" class="mode-card ' + (state.mode === 'blocks' ? 'is-on' : '') + '" data-action="mode" data-value="blocks" aria-pressed="' + (state.mode === 'blocks' ? 'true' : 'false') + '">' +
        '<span class="mode-icon">' + MODE_ICONS.blocks + '</span>' +
        '<span class="mode-text"><b>Блоками</b><small>Как конструктор: модули, разъёмы, длины</small></span>' +
        '<span class="mode-dot" aria-hidden="true"></span>' +
      '</button>' +
      '<button type="button" class="mode-card ' + (state.mode === 'simple' ? 'is-on' : '') + '" data-action="mode" data-value="simple" aria-pressed="' + (state.mode === 'simple' ? 'true' : 'false') + '">' +
        '<span class="mode-icon">' + MODE_ICONS.simple + '</span>' +
        '<span class="mode-text"><b>По параметрам</b><small>Быстро: длина, цепи, ветви</small></span>' +
        '<span class="mode-dot" aria-hidden="true"></span>' +
      '</button>' +
    '</div>';
  }

  function trunkCardHTML() {
    const trunk = state.trunk || D.defaultTrunk(state.type);
    const maxLen = trunkLengthMax();
    const value = Math.min(Number(trunk.length) || 1, maxLen);
    const pct = maxLen > 1 ? ((value - 1) / (maxLen - 1) * 100).toFixed(1) : '100';
    return '<div class="trunk-strip">' +
      '<span class="trunk-badge">БАЗА</span>' +
      '<div class="ts-title"><b>Магистраль</b><small>источник → распределение</small></div>' +
      '<div class="ts-range">' +
        '<span>Длина <b data-trunk-out>' + num(value) + ' м</b></span>' +
        '<input class="range range-sm" type="range" min="1" max="' + Math.max(1, Math.min(10, maxLen)) + '" step="0.5" value="' + value + '" data-trunk="length" style="--p:' + pct + '%" aria-label="Длина магистрали">' +
      '</div>' +
      '<label class="ts-field"><span>Сечение</span><select class="mini-select" data-trunk-field="section">' + sectionOptions(trunk.section) + '</select></label>' +
      '<label class="ts-field"><span>Разъём</span><select class="mini-select" data-trunk-field="connector">' + connectorOptions(trunk.connector) + '</select></label>' +
      '<span class="trunk-cost">≈ ' + money(lastResult.trunkCost || 0) + '</span>' +
    '</div>';
  }

  function paletteHTML() {
    return '<div class="field">' +
      '<div class="field-label"><span>Модули</span><span class="field-hint">перетащите на схему или нажмите</span></div>' +
      '<div class="palette palette-horizontal">' +
        Object.keys(D.BLOCKS).map(function (id) {
          const b = D.BLOCKS[id];
          return '<div class="palette-card" role="button" tabindex="0" draggable="true" data-action="block-add" data-value="' + id + '" data-palette-type="' + id + '" style="--brick:' + b.color + '">' +
            '<span class="palette-icon">' + (BLOCK_ICONS[b.icon] || BLOCK_ICONS.plus) + '</span>' +
            '<span class="palette-name">' + b.name + '</span>' +
            '<span class="palette-meta">' + b.circuits + ' ' + circuitsWord(b.circuits) + ' · ' + num(b.length) + ' м</span>' +
            '<span class="palette-plus" aria-hidden="true">+</span>' +
          '</div>';
        }).join('') +
      '</div>' +
    '</div>';
  }

  function ensureSelection() {
    if (!state.blocks.length) {
      selectedBlockId = null;
      return;
    }
    if (!selectedBlockId || !findBlock(selectedBlockId)) selectedBlockId = state.blocks[0].id;
  }

  function canvasPoint(svg, clientX, clientY) {
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const matrix = svg.getScreenCTM();
    if (!matrix) return { x: 0, y: 0 };
    return pt.matrixTransform(matrix.inverse());
  }

  function canvasSVGInner() {
    const CV = D.CANVAS;
    const selected = selectedBlockId;
    const links = state.blocks.map(function (block) {
      const def = D.BLOCKS[block.type] || D.BLOCKS.reserve;
      const parent = parentOf(block);
      const sx = parent ? parent.x : block.x;
      const sy = parent ? blockOuterY(parent) : CV.trunkY;
      const ex = block.x;
      const ey = blockInnerY(block);
      const mid = (sy + ey) / 2;
      const d = 'M' + sx + ' ' + sy + ' C' + sx + ' ' + mid + ', ' + ex + ' ' + mid + ', ' + ex + ' ' + ey;
      return '<path class="cv-link' + (block.id === selected ? ' is-selected' : '') + '" d="' + d + '" stroke="' + def.color + '" fill="none" stroke-width="' + (block.id === selected ? 3.6 : 2.4) + '" stroke-linecap="round" opacity=".9"/>';
    }).join('');

    const blocks = state.blocks.map(function (block, index) {
      const def = D.BLOCKS[block.type] || D.BLOCKS.reserve;
      const side = block.y < CV.trunkY ? -1 : 1;
      const innerY = side < 0 ? CV.brickH / 2 : -CV.brickH / 2;
      const outerY = side < 0 ? -CV.brickH / 2 : CV.brickH / 2;
      const studY = side < 0 ? -CV.brickH / 2 + 2 : CV.brickH / 2 - 2;
      const isSelected = block.id === selected;
      const isPortTarget = nearestPortId === block.id;
      return '<g class="cv-block' + (isSelected ? ' is-selected' : '') + (isPortTarget ? ' is-port-target' : '') + '" data-cv-block="' + block.id + '" transform="translate(' + block.x + ' ' + block.y + ')" tabindex="0" role="button" aria-label="Блок ' + def.name + ', ' + block.circuits + ' цепей, ' + num(block.length) + ' метров">' +
        (isSelected ? '<rect class="cv-sel" x="' + (-CV.brickW / 2 - 5) + '" y="' + (-CV.brickH / 2 - 5) + '" width="' + (CV.brickW + 10) + '" height="' + (CV.brickH + 10) + '" rx="14" fill="none" stroke="#F3DCC9" stroke-width="1.4" stroke-dasharray="6 5"/>' : '') +
        '<rect class="cv-brick" x="' + (-CV.brickW / 2) + '" y="' + (-CV.brickH / 2) + '" width="' + CV.brickW + '" height="' + CV.brickH + '" rx="10" fill="' + def.color + '" fill-opacity=".2" stroke="' + def.color + '" stroke-width="' + (isSelected ? 2.6 : 1.6) + '"/>' +
        [-48, -16, 16, 48].map(function (dx) {
          return '<circle cx="' + dx + '" cy="' + studY + '" r="2.6" fill="' + def.color + '" fill-opacity=".65"/>';
        }).join('') +
        '<text class="cv-index" x="' + (-CV.brickW / 2 + 9) + '" y="' + (-CV.brickH / 2 + 14) + '">B' + (index + 1) + '</text>' +
        '<text class="cv-name" x="0" y="-2" text-anchor="middle">' + def.short + '</text>' +
        '<text class="cv-sub" x="0" y="14" text-anchor="middle">' + block.circuits + ' ЦЕП.' + (block.qty > 1 ? ' ×' + block.qty : '') + ' · ' + num(block.length) + ' М</text>' +
        '<circle class="cv-port-in" cx="0" cy="' + innerY + '" r="4.5" fill="' + def.color + '"/>' +
        '<circle class="cv-port-out" cx="0" cy="' + outerY + '" r="4.5" fill="#0B1B25" stroke="' + def.color + '" stroke-width="1.6"/>' +
      '</g>';
    }).join('');

    const trunks = '<g class="cv-trunk-conn">' +
        '<rect x="' + (CV.trunkStart - 22) + '" y="' + (CV.trunkY - 11) + '" width="44" height="22" rx="5" fill="#0B1B25" stroke="#E8B080" stroke-width="1.5"/>' +
        [-12, -4, 4, 12].map(function (dx) { return '<circle cx="' + (CV.trunkStart + dx) + '" cy="' + CV.trunkY + '" r="1.7" fill="#E8B080"/>'; }).join('') +
        '<text class="cv-label" x="' + CV.trunkStart + '" y="' + (CV.trunkY - 20) + '" text-anchor="middle">X1</text>' +
        '<rect x="' + (CV.trunkEnd - 22) + '" y="' + (CV.trunkY - 11) + '" width="44" height="22" rx="5" fill="#0B1B25" stroke="#E8B080" stroke-width="1.5"/>' +
        [-12, -4, 4, 12].map(function (dx) { return '<circle cx="' + (CV.trunkEnd + dx) + '" cy="' + CV.trunkY + '" r="1.7" fill="#E8B080"/>'; }).join('') +
        '<text class="cv-label" x="' + CV.trunkEnd + '" y="' + (CV.trunkY - 20) + '" text-anchor="middle">X2</text>' +
      '</g>';

    const empty = state.blocks.length ? '' :
      '<g class="cv-empty"><rect x="330" y="286" width="340" height="148" rx="16" fill="#0F2634" stroke="#E8B080" stroke-opacity=".3" stroke-dasharray="5 5"/>' +
      '<text x="500" y="346" text-anchor="middle" class="cv-empty-title">ПЕРЕТАЩИТЕ МОДУЛЬ</text>' +
      '<text x="500" y="372" text-anchor="middle" class="cv-empty-sub">из палитры на магистраль</text></g>';

    return '<rect x="16" y="16" width="968" height="608" rx="6" class="cv-frame"/>' +
      '<text x="32" y="44" class="cv-kicker">МОДУЛЬНАЯ СХЕМА · ПЕРЕТАЩИТЕ БЛОК</text>' +
      '<text x="968" y="44" text-anchor="end" class="cv-kicker">' + lastResult.code + '</text>' +
      '<line x1="32" y1="54" x2="968" y2="54" class="cv-rule"/>' +
      '<path d="M' + CV.trunkStart + ' ' + CV.trunkY + 'H' + CV.trunkEnd + '" stroke="#DCE6EA" stroke-opacity=".12" stroke-width="16" stroke-linecap="round" fill="none"/>' +
      '<path d="M' + CV.trunkStart + ' ' + CV.trunkY + 'H' + CV.trunkEnd + '" stroke="#2F8F86" stroke-opacity=".22" stroke-width="10" stroke-linecap="round" fill="none"/>' +
      '<path d="M' + CV.trunkStart + ' ' + CV.trunkY + 'H' + CV.trunkEnd + '" stroke="#E8B080" stroke-width="2" stroke-linecap="round" fill="none"/>' +
      '<path class="cv-pulse" d="M' + CV.trunkStart + ' ' + CV.trunkY + 'H' + CV.trunkEnd + '" stroke="#FFD9B0" stroke-width="2" stroke-dasharray="3 36" stroke-linecap="round" fill="none"/>' +
      links + trunks + blocks + empty +
      '<text x="32" y="610" class="cv-scale">1 М ≈ ' + CV.scale + ' ЕД. СХЕМЫ · ' + state.blocks.length + ' БЛОКОВ · ' + state.circuits + ' ЦЕПЕЙ</text>' +
      '<text x="968" y="610" text-anchor="end" class="cv-scale">' + (state.sealed ? 'ГЕРМЕТИЧНЫЕ РАЗЪЁМЫ' : 'РАЗЪЁМЫ БЕЗ УПЛОТНЕНИЙ') + ' · ' + lastResult.ip.name + '</text>';
  }

  function canvasPropsHTML() {
    ensureSelection();
    const block = findBlock(selectedBlockId);
    if (!block) {
      return '<div class="cp-empty"><b>Блок не выбран</b><span>Перетащите модуль из палитры на схему или нажмите на плечо блока.</span></div>';
    }
    const def = D.BLOCKS[block.type] || D.BLOCKS.reserve;
    const index = state.blocks.indexOf(block) + 1;
    const maxLen = maxLengthFor(block);
    const value = Math.min(block.length, maxLen);
    const pct = maxLen > 0.5 ? ((value - 0.5) / (maxLen - 0.5) * 100).toFixed(1) : '100';
    const parent = parentOf(block);
    const options = ['<option value="">Магистраль</option>'].concat(state.blocks.filter(function (b) {
      return b.id !== block.id && !isBlockDescendant(b.id, block.id);
    }).map(function (b, i) {
      return '<option value="' + b.id + '"' + (block.parentId === b.id ? ' selected' : '') + '>B' + (state.blocks.indexOf(b) + 1) + ' · ' + (D.BLOCKS[b.type] || {}).name + '</option>';
    })).join('');

    return '<div class="cp-card" style="--brick:' + def.color + '">' +
      '<div class="cp-head">' +
        '<span class="cp-icon">' + (BLOCK_ICONS[def.icon] || BLOCK_ICONS.plus) + '</span>' +
        '<div class="cp-title"><b>' + def.name + '</b><small>B' + index + ' · ' + (parent ? 'от блока B' + (state.blocks.indexOf(parent) + 1) : 'на магистрали') + '</small></div>' +
        '<span class="cp-cost">≈ ' + money(blockCost(block.id)) + '</span>' +
      '</div>' +
      '<div class="cp-grid">' +
        '<div class="cp-field"><span>Цепи</span><div class="mini-stepper">' +
          '<button type="button" data-action="block-circuits-minus" data-id="' + block.id + '" aria-label="Меньше цепей">−</button><b>' + block.circuits + '</b><button type="button" data-action="block-circuits-plus" data-id="' + block.id + '" aria-label="Больше цепей">+</button>' +
        '</div></div>' +
        '<div class="cp-field"><span>Кол-во</span><div class="mini-stepper">' +
          '<button type="button" data-action="block-qty-minus" data-id="' + block.id + '" aria-label="Меньше блоков">−</button><b>' + block.qty + '</b><button type="button" data-action="block-qty-plus" data-id="' + block.id + '" aria-label="Больше блоков">+</button>' +
        '</div></div>' +
        '<label class="cp-field"><span>Сечение</span><select class="mini-select" data-block-field="section" data-id="' + block.id + '">' + sectionOptions(block.section) + '</select></label>' +
        '<label class="cp-field"><span>Разъём</span><select class="mini-select" data-block-field="connector" data-id="' + block.id + '">' + connectorOptions(block.connector) + '</select></label>' +
        '<label class="cp-field"><span>Подключение</span><select class="mini-select" data-block-field="parent" data-id="' + block.id + '">' + options + '</select></label>' +
        '<div class="cp-field cp-length"><span>Длина ветви <b>' + num(value) + ' м</b></span><input class="range range-sm" type="range" min="0.5" max="' + maxLen + '" step="0.5" value="' + value + '" data-canvas-length data-id="' + block.id + '" style="--p:' + pct + '%" aria-label="Длина ветви ' + def.name + '"></div>' +
      '</div>' +
      '<div class="cp-actions">' +
        '<button type="button" class="btn btn-ghost btn-small" data-action="block-dup" data-id="' + block.id + '">Дублировать</button>' +
        '<button type="button" class="btn btn-ghost btn-small cp-danger" data-action="block-del" data-id="' + block.id + '">Удалить</button>' +
        '<span class="cp-note">Тяните блок на схеме — длина и цена меняются.</span>' +
      '</div>' +
    '</div>';
  }

  function renderCanvasOnly() {
    const stage = $('#canvasStage');
    if (stage) stage.innerHTML = canvasSVGInner();
  }

  function renderCanvasPropsOnly() {
    const host = $('#canvasProps');
    if (host) host.innerHTML = canvasPropsHTML();
  }

  function selectCanvasBlock(id) {
    selectedBlockId = id;
    renderCanvasOnly();
    renderCanvasPropsOnly();
    scheduleAside();
  }

  function blockSummaryHTML() {
    return '<div class="block-summary">' +
      '<div class="bs-item"><span>Блоков</span><b>' + state.blocks.length + '</b></div>' +
      '<div class="bs-item"><span>Цепей</span><b>' + state.circuits + '</b></div>' +
      '<div class="bs-item"><span>Длина</span><b>' + num(state.length) + ' м</b></div>' +
      '<div class="bs-item"><span>Разъёмов</span><b>' + lastResult.connectorCount + '</b></div>' +
      '<button type="button" class="btn btn-ghost btn-small" data-action="block-reset">Сбросить набор</button>' +
    '</div>';
  }

  function envGridHTML() {
    const envs = Object.keys(D.ENVIRONMENTS).map(function (id) {
      const env = D.ENVIRONMENTS[id];
      return '<button type="button" class="opt env-card ' + (state.environment === id ? 'is-on' : '') + '" data-action="environment" data-value="' + id + '" aria-pressed="' + (state.environment === id ? 'true' : 'false') + '">' +
        '<span class="env-ico">' + ENV_ICONS[id] + '</span>' +
        '<span class="opt-check" aria-hidden="true"></span>' +
        '<span class="opt-name">' + env.name + '</span>' +
        '<span class="opt-desc">' + env.desc + '</span>' +
        '<span class="env-hint">' + env.hint + '</span>' +
      '</button>';
    }).join('');
    return '<div class="field" style="margin-top:24px">' +
      '<div class="field-label"><span>Условия эксплуатации</span><span class="field-hint">влияет на материалы и цену</span></div>' +
      '<div class="env-grid" role="group" aria-label="Условия эксплуатации">' + envs + '</div>' +
    '</div>';
  }

  /* шаг 2 */
  function renderStep2() {
    const sec = D.SECTIONS.find(function (s) { return s.value === Number(state.section); }) || D.SECTIONS[3];
    const blocks = state.mode === 'blocks';
    const simpleContent = rangeField({
        key: 'length', label: 'Длина жгута', min: 1, max: 30, step: 0.5, value: state.length,
        text: function (v) { return num(v) + ' м'; },
        marks: ['1 м', '15 м', '30 м']
      }) +
      rangeField({
        key: 'circuits', label: 'Количество цепей', min: 4, max: 64, step: 2, value: state.circuits,
        text: function (v) { return v + ' ' + circuitsWord(v); },
        marks: ['4', '32', '64']
      }) +
      rangeField({
        key: 'branches', label: 'Ветви и отводы', min: 0, max: 12, step: 1, value: state.branches,
        text: function (v) { return v + ' ' + branchesWord(v); },
        marks: ['0', '6', '12']
      }) +
      '<p class="field-note" style="margin-top:-12px">Сейчас в расчёте: ' + state.circuits + ' ' + circuitsWord(state.circuits) +
        ' · ' + num(state.circuits * state.length) + ' погонных метров провода · до ' + sec.amp + ' А на цепь при сечении ' + sec.label + '.</p>' +
      '<div class="mode-hint">' +
        '<div><b>Хотите собрать из модулей?</b><p>Переключитесь на блочный режим: перетаскивайте свет, розетки, насос и другие модули прямо по схеме жгута.</p></div>' +
        '<button type="button" class="btn btn-ghost btn-small" data-action="mode" data-value="blocks">Собрать блоками →</button>' +
      '</div>';

    ensureSelection();
    const blocksContent =
      trunkCardHTML() +
      paletteHTML() +
      '<div class="canvas-scroll">' +
        '<div class="canvas-wrap" id="canvasWrap">' +
          '<svg id="canvasStage" viewBox="0 0 1000 640" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Модульная схема жгута">' + canvasSVGInner() + '</svg>' +
          '<span class="canvas-drop-hint">отпустите модуль на схеме</span>' +
        '</div>' +
      '</div>' +
      '<p class="canvas-caption">Тяните блок за корпус; ближе к магистрали — короче ветвь. Порт на внешней стороне блока — для подключения дочерних модулей. <button type="button" class="text-link" data-action="scroll-props">Настроить выбранный блок ↓</button></p>' +
      '<div class="canvas-props" id="canvasProps">' + canvasPropsHTML() + '</div>' +
      blockSummaryHTML();

    return '<div class="step-head">' +
        '<p class="step-kicker">Шаг 2 · Состав</p>' +
        '<h3>' + (blocks ? 'Соберите жгут на схеме' : 'Геометрия и условия') + '</h3>' +
        '<p class="step-lead">' + (blocks ? 'Перетащите модуль из палитры на схему. Блок подключится к магистрали; тяните ближе или дальше — длина ветви и цена изменятся. Соединить блок с другим блоком можно через «Подключение» или порт.' : 'Длина, количество цепей и ветвей определяют материалы и трудозатраты. Условия эксплуатации — защиту и коэффициенты.') + '</p>' +
      '</div>' +
      modeSwitch() +
      (blocks ? blocksContent : simpleContent) +
      envGridHTML() +
      stepNav();
  }

  /* шаг 3 */
  function renderStep3() {
    const sections = D.SECTIONS.map(function (s) {
      return '<button type="button" class="opt section-opt ' + (Number(state.section) === s.value ? 'is-on' : '') + '" data-action="section" data-value="' + s.value + '" aria-pressed="' + (Number(state.section) === s.value ? 'true' : 'false') + '">' +
        '<span class="so-label">' + s.label + '</span>' +
        '<span class="so-amp">' + s.amp + ' А</span>' +
        '<span class="so-use">' + s.use + '</span>' +
        '<span class="opt-check" aria-hidden="true"></span>' +
      '</button>';
    }).join('');

    const insulations = Object.keys(D.INSULATION).map(function (id) {
      const ins = D.INSULATION[id];
      return optButton({ on: state.insulation === id, action: 'insulation', value: id, name: ins.name, desc: ins.desc, meta: ins.temp });
    }).join('');

    const conductors = Object.keys(D.CONDUCTORS).map(function (id) {
      const c = D.CONDUCTORS[id];
      return optButton({ on: state.conductor === id, action: 'conductor', value: id, name: c.name, desc: c.desc, meta: c.coef > 1 ? '+' + Math.round((c.coef - 1) * 100) + '% к проводу' : 'базовый вариант' });
    }).join('');

    const colors = Object.keys(D.COLORS).map(function (id) {
      const c = D.COLORS[id];
      return optButton({ on: state.colorCode === id, action: 'colors', value: id, name: c.name, desc: c.desc });
    }).join('');

    const blocksMode = state.mode === 'blocks';

    return '<div class="step-head">' +
        '<p class="step-kicker">Шаг 3 · Провода</p>' +
        '<h3>Сечение, изоляция и жила</h3>' +
        '<p class="step-lead">Сечение указано на одну жилу. Для силовых цепей берите с запасом по току — конфигуратор посчитает стоимость по выбранному варианту.</p>' +
      '</div>' +
      '<div class="field">' +
        '<div class="field-label"><span>' + (blocksMode ? 'Сечение магистрали' : 'Сечение жилы') + '</span><span class="field-hint">до 100 А на цепь</span></div>' +
        '<div class="opt-grid cols-5" role="group" aria-label="Сечение">' + sections + '</div>' +
        (blocksMode ? '<p class="field-note">Здесь выбирается сечение магистрали. Сечения отдельных модулей задаются в шаге 2 на схеме — выделите блок и откройте его настройки.</p>' : '') +
      '</div>' +
      '<div class="field">' +
        '<div class="field-label"><span>Изоляция</span><span class="field-hint">температурный класс</span></div>' +
        '<div class="opt-grid cols-4" role="group" aria-label="Изоляция">' + insulations + '</div>' +
      '</div>' +
      '<div class="field">' +
        '<div class="field-label">Материал жилы</div>' +
        '<div class="opt-grid" role="group" aria-label="Материал жилы">' + conductors + '</div>' +
      '</div>' +
      '<div class="field">' +
        '<div class="field-label">Цветовая маркировка</div>' +
        '<div class="opt-grid cols-3" role="group" aria-label="Цветовая маркировка">' + colors + '</div>' +
      '</div>' +
      stepNav();
  }

  /* шаг 4 */
  function renderStep4() {
    const connectors = Object.keys(D.CONNECTORS).map(function (id) {
      const c = D.CONNECTORS[id];
      return optButton({ on: state.connectors === id, action: 'connectors', value: id, name: c.name, desc: c.desc, meta: (c.short || c.note) + ' · ' + int(c.price) + ' ₽/шт' });
    }).join('');

    const sleeves = Object.keys(D.SLEEVES).map(function (id) {
      const s = D.SLEEVES[id];
      return optButton({ on: state.sleeve === id, action: 'sleeve', value: id, name: s.name, desc: s.desc, meta: s.price ? '+' + int(s.price) + ' ₽/м' : 'без доплаты' });
    }).join('');

    const ips = Object.keys(D.IP).map(function (id) {
      const ip = D.IP[id];
      return '<button type="button" class="' + (state.ip === id ? 'is-on' : '') + '" data-action="ip" data-value="' + id + '" aria-pressed="' + (state.ip === id ? 'true' : 'false') + '">' + ip.name + '</button>';
    }).join('');

    const labels = Object.keys(D.LABELS).map(function (id) {
      const l = D.LABELS[id];
      return optButton({ on: state.labels === id, action: 'labels', value: id, name: l.name, desc: l.desc, meta: l.price ? '+' + int(l.price) + ' ₽' : 'включено' });
    }).join('');

    const blocksMode = state.mode === 'blocks';
    const connectorField = blocksMode
      ? '<div class="field">' +
          '<div class="field-label"><span>Разъёмы по блокам</span><span class="field-hint">' + lastResult.connectorCount + ' шт</span></div>' +
          '<div class="connector-summary">' + lastResult.connectorName + '</div>' +
          '<p class="field-note">Разъём каждого модуля и магистрали выбирается в шаге 2. Здесь можно изменить уплотнения и защиту.</p>' +
          '<button type="button" class="btn btn-ghost btn-small" data-action="step" data-step="2">← Настроить блоки</button>' +
        '</div>'
      : '<div class="field">' +
          '<div class="field-label"><span>Серия разъёмов</span><span class="field-hint">в расчёте ' + lastResult.connectorCount + ' шт</span></div>' +
          '<div class="opt-grid cols-3" role="group" aria-label="Серия разъёмов">' + connectors + '</div>' +
        '</div>';

    return '<div class="step-head">' +
        '<p class="step-kicker">Шаг 4 · Разъёмы и защита</p>' +
        '<h3>Чем соединять и как защищать</h3>' +
        '<p class="step-lead">Разъёмы подбираем под ток, среду и удобство монтажа. Защита задаёт ресурс жгута в реальных условиях.</p>' +
      '</div>' +
      connectorField +
      '<div class="field">' +
        '<button type="button" class="switch-row ' + (state.sealed ? 'is-on' : '') + '" data-action="toggle-sealed" role="switch" aria-checked="' + (state.sealed ? 'true' : 'false') + '">' +
          '<span class="switch" aria-hidden="true"><span class="knob"></span></span>' +
          '<span class="switch-text"><b>Герметичные разъёмы</b><small>Уплотнения, заглушки свободных пинов, защита от влаги</small></span>' +
          '<span class="switch-state">' + (state.sealed ? 'включено' : 'выключено') + '</span>' +
        '</button>' +
      '</div>' +
      '<div class="field">' +
        '<div class="field-label"><span>Защита жгута</span><span class="field-hint">цена за метр</span></div>' +
        '<div class="opt-grid cols-3" role="group" aria-label="Защита жгута">' + sleeves + '</div>' +
      '</div>' +
      '<div class="field-two">' +
        '<div class="field">' +
          '<div class="field-label">Класс защиты</div>' +
          '<div class="seg" role="group" aria-label="Класс защиты">' + ips + '</div>' +
          '<p class="field-note">IP67 — кратковременное погружение, IP68 — длительное. Герметизация учитывается в цене.</p>' +
        '</div>' +
        '<div class="field">' +
          '<div class="field-label">Маркировка</div>' +
          '<div class="opt-grid cols-3" style="grid-template-columns:1fr" role="group" aria-label="Маркировка">' + labels + '</div>' +
        '</div>' +
      '</div>' +
      stepNav();
  }

  /* шаг 5 */
  function renderStep5() {
    const extras = D.EXTRAS.map(function (e) {
      const checked = state.extras.indexOf(e.id) >= 0;
      return '<label class="extra">' +
        '<input type="checkbox" data-extra="' + e.id + '"' + (checked ? ' checked' : '') + '>' +
        '<span class="extra-box" aria-hidden="true"></span>' +
        '<span class="extra-text"><b>' + e.name + '</b><small>' + e.desc + '</small></span>' +
        '<span class="extra-price">+' + int(e.price) + ' ₽</span>' +
      '</label>';
    }).join('');

    return '<div class="step-head">' +
        '<p class="step-kicker">Шаг 5 · Опции</p>' +
        '<h3>Что добавить к жгуту</h3>' +
        '<p class="step-lead">Опции не обязательны, но экономит время на монтаже и приёмке. Схема, протокол и блок предохранителей уже в типовом наборе.</p>' +
      '</div>' +
      '<div class="field">' +
        '<div class="field-label"><span>Дополнительно</span><span class="field-hint">' + state.extras.length + ' выбрано</span></div>' +
        '<div class="extra-grid" role="group" aria-label="Дополнительные опции">' + extras + '</div>' +
      '</div>' +
      '<div class="field">' +
        '<div class="field-label"><span>Комментарий инженеру</span><span class="field-hint">необязательно</span></div>' +
        '<textarea class="comment" maxlength="500" data-comment placeholder="Например: нужен разъём XS12 под панель, длина ветви до кормы 4,2 м, маркировка по схеме заказчика.">' + esc(state.comment || '') + '</textarea>' +
      '</div>' +
      stepNav();
  }

  /* шаг 6 */
  function specRows() {
    const r = lastResult;
    const rows = [
      ['Тип техники', D.TYPES[state.type].name],
      ['Назначение', r.purpose.name],
      ['Сборка', state.mode === 'blocks' ? 'Модульная, ' + state.blocks.length + ' блоков' : 'По параметрам'],
      ['Напряжение', state.voltage + ' В'],
      ['Партия', state.qty + ' шт'],
      ['Длина', num(state.length) + ' м'],
      ['Цепей', state.circuits + ' ' + circuitsWord(state.circuits)],
      ['Ветвей', state.branches + ' ' + branchesWord(state.branches)]
    ];
    if (state.mode === 'blocks') {
      rows.push(['Магистраль', num(state.trunk.length) + ' м, ' + (D.CONNECTORS[state.trunk.connector] || {}).name]);
    }
    rows.push(
      ['Сечение', r.section.label + ', до ' + r.section.amp + ' А'],
      ['Изоляция', r.insulation.name + ', ' + r.insulation.temp],
      ['Жила', r.conductor.name],
      ['Маркировка', r.colors.name],
      ['Разъёмы', r.connectorName + ', ' + r.connectorCount + ' шт' + (state.sealed ? ', герметичные' : '')],
      ['Защита', r.sleeve.name],
      ['Класс', r.ip.name + ' — ' + r.ip.desc],
      ['Бирки', r.labels.name],
      ['Опции', extrasText()],
      ['Код расчёта', r.code],
      ['Срок', r.leadDays + ' раб. дн.']
    );
    return rows;
  }

  function extrasText() {
    if (!state.extras.length) return 'нет';
    return state.extras.map(function (id) {
      const e = D.EXTRAS.find(function (x) { return x.id === id; });
      return e ? e.name : '';
    }).filter(Boolean).join(', ');
  }

  function renderStep6() {
    const r = lastResult;
    const rows = specRows().map(function (row) {
      return '<div class="spec-row"><dt>' + row[0] + '</dt><dd>' + esc(row[1]) + '</dd></div>';
    }).join('');

    const b = r.components;
    const breakdown =
      '<li><span>Провод и защита</span><b>' + money(b.wire + b.sheath) + '</b></li>' +
      '<li><span>Сборка и разделка</span><b>' + money(b.labor) + '</b></li>' +
      '<li><span>Разъёмы и контакты</span><b>' + money(b.connectors) + '</b></li>' +
      (b.marking ? '<li><span>Маркировка</span><b>' + money(b.marking) + '</b></li>' : '') +
      (b.extras ? '<li><span>Опции</span><b>' + money(b.extras) + '</b></li>' : '') +
      '<li class="bd-factor"><span>Коэффициент исполнения ×' + String(r.factor).replace('.', ',') + '</span><b>+' + money(b.execution) + '</b></li>' +
      '<li class="bd-total"><span>Цена за 1 жгут</span><b>' + money(r.priceOne) + '</b></li>' +
      (state.qty > 1 ? '<li class="bd-discount"><span>Серийная скидка −' + Math.round(r.discount * 100) + '%</span><b>−' + money(r.priceOne - r.priceUnit) + '</b></li>' : '') +
      (state.qty > 1 ? '<li class="bd-total"><span>Итого за ' + state.qty + ' шт</span><b>' + money(r.total) + '</b></li>' : '');

    return '<div class="step-head">' +
        '<p class="step-kicker">Шаг 6 · Итог</p>' +
        '<h3>' + (state.mode === 'blocks' ? 'Модульный расчёт готов' : 'Предварительный расчёт готов') + '</h3>' +
        '<p class="step-lead">Код конфигурации ' + r.code + '. ' + (state.mode === 'blocks' ? 'Собрано ' + state.blocks.length + ' блоков, ' : '') + 'Сохраните ссылку или скачайте спецификацию — расчёт зафиксирован. Точную цену подтвердим после проверки ТЗ.</p>' +
      '</div>' +
      '<div class="result-top">' +
        '<div class="result-price">' +
          '<span class="rp-label">' + (state.qty > 1 ? 'Итого за ' + state.qty + ' шт' : 'Цена за 1 жгут') + '</span>' +
          '<b>' + money(r.total) + '</b>' +
          '<small>' + (state.qty > 1 ? money(r.priceUnit) + ' за жгут · скидка ' + Math.round(r.discount * 100) + '%' : 'предварительно, без НДС') + '</small>' +
        '</div>' +
        '<div class="result-meta">' +
          '<div><span>Срок</span><b>' + r.leadDays + ' раб. дн.</b></div>' +
          '<div><span>Масса</span><b>' + num(r.weight) + ' кг</b></div>' +
          '<div><span>Разъёмов</span><b>' + r.connectorCount + '</b></div>' +
        '</div>' +
      '</div>' +
      '<div class="field">' +
        '<div class="field-label">Спецификация</div>' +
        '<dl class="spec-grid">' + rows + '</dl>' +
      '</div>' +
      '<div class="field">' +
        '<div class="field-label">Из чего складывается цена</div>' +
        '<ul class="breakdown">' + breakdown + '</ul>' +
        '<p class="field-note">Цена без НДС и доставки. Материалы и работа — по текущему прайсу; коэффициент учитывает тип техники, среду, герметизацию и IP.</p>' +
      '</div>' +
      '<div class="result-actions">' +
        (state.mode === 'blocks' ? '<button type="button" class="btn btn-ghost" data-action="step" data-step="2">Редактировать блоки</button>' : '') +
        '<button type="button" class="btn btn-ghost" data-action="download">Скачать спецификацию</button>' +
        '<button type="button" class="btn btn-ghost" data-action="print">Печать / PDF</button>' +
        '<button type="button" class="btn btn-ghost" data-action="share">Ссылка на расчёт</button>' +
        '<button type="button" class="btn btn-ghost" data-action="reset">Сбросить</button>' +
      '</div>' +
      '<div class="lead-card" id="lead">' +
        '<div class="lead-head"><h4>Отправить расчёт инженеру</h4><p>Проверим совместимость разъёмов, уточним цену и пришлём коммерческое предложение.</p></div>' +
        '<form id="leadForm" novalidate>' +
          '<div class="form-grid">' +
            '<label class="form-field"><span>Имя *</span><input class="input" name="name" autocomplete="name" placeholder="Как к вам обращаться"></label>' +
            '<label class="form-field"><span>Телефон *</span><input class="input" name="phone" type="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__"></label>' +
            '<label class="form-field"><span>E-mail</span><input class="input" name="email" type="email" autocomplete="email" placeholder="you@company.ru"></label>' +
            '<label class="form-field"><span>Город</span><input class="input" name="city" autocomplete="address-level2" placeholder="Москва"></label>' +
          '</div>' +
          '<label class="consent"><input type="checkbox" name="consent"> <span>Согласен на обработку персональных данных и получение ответа по этой заявке.</span></label>' +
          '<div class="form-foot"><button type="submit" class="btn btn-primary">Сформировать заявку</button><small>Письмо откроется в вашей почтовой программе — ничего не отправится без вашего подтверждения.</small></div>' +
        '</form>' +
        '<div class="form-status" id="leadStatus" role="status" aria-live="polite"></div>' +
      '</div>' +
      stepNav();
  }

  /* ---------- эскиз ---------- */
  function drawBlockHarness() {
    const t = D.TYPES[state.type];
    const r = lastResult;
    const accent = t.accent;
    const x0 = 64;
    const x1 = 596;
    const y = 205;
    const blocks = state.blocks.slice().sort(function (a, b) { return a.x - b.x; }).slice(0, 8);
    const n = blocks.length;
    const span = x1 - x0 - 150;
    const xs = blocks.map(function (_, i) {
      return x0 + 75 + (n === 1 ? span / 2 : span * i / (n - 1));
    });

    function connector(x, cy, label, below, color) {
      const ly = below ? cy + 22 : cy - 12;
      return '<g>' +
        '<rect x="' + (x - 19) + '" y="' + (cy - 10) + '" width="38" height="20" rx="4" fill="#08141D" stroke="' + color + '" stroke-width="1.4"/>' +
        [-12, -6, 0, 6, 12].map(function (dx) {
          return '<circle cx="' + (x + dx) + '" cy="' + cy + '" r="1.5" fill="' + color + '"/>';
        }).join('') +
        '<text x="' + x + '" y="' + ly + '" text-anchor="middle" class="dwg-label">' + label + '</text>' +
      '</g>';
    }

    const bricks = blocks.map(function (block, i) {
      const def = D.BLOCKS[block.type] || D.BLOCKS.reserve;
      const color = def.color;
      const dir = i % 2 === 0 ? -1 : 1;
      const cx = xs[i];
      const cy = y + dir * 78;
      const bw = 84;
      const bh = 34;
      const stemEnd = cy + (dir < 0 ? bh / 2 : -bh / 2);
      const connY = cy + dir * (bh / 2 + 14);
      const qty = block.qty > 1 ? ' ×' + block.qty : '';
      const stem = 'M' + cx + ' ' + y + 'V' + stemEnd;
      return '<path d="' + stem + '" stroke="#DCE6EA" stroke-opacity=".1" stroke-width="8" stroke-linecap="round" fill="none"/>' +
        '<path d="' + stem + '" stroke="' + color + '" stroke-width="2" stroke-linecap="round" fill="none"/>' +
        '<circle cx="' + cx + '" cy="' + y + '" r="3.5" fill="#08141D" stroke="' + color + '" stroke-width="1.2"/>' +
        '<rect x="' + (cx - bw / 2) + '" y="' + (cy - bh / 2) + '" width="' + bw + '" height="' + bh + '" rx="5" fill="' + color + '" fill-opacity=".16" stroke="' + color + '" stroke-width="1.3"/>' +
        [-14, 0, 14].map(function (dx) {
          return '<circle cx="' + (cx + dx) + '" cy="' + (cy - bh / 2 + 4) + '" r="2" fill="' + color + '" fill-opacity=".65"/>';
        }).join('') +
        '<text x="' + cx + '" y="' + (cy - 2) + '" text-anchor="middle" class="dwg-brick-name">' + def.short + '</text>' +
        '<text x="' + cx + '" y="' + (cy + 10) + '" text-anchor="middle" class="dwg-brick-sub">' + block.circuits + ' ЦЕП.' + qty + '</text>' +
        connector(cx, connY, 'X' + (i + 3), dir > 0, color);
    }).join('');

    const extra = state.blocks.length - blocks.length;
    return '<svg viewBox="0 0 660 400" role="img" aria-label="Модульный эскиз жгута ' + r.code + '">' +
      '<defs><linearGradient id="pvGrad" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#8F4A24"/><stop offset=".52" stop-color="#E8B080"/><stop offset="1" stop-color="#B65F2C"/>' +
      '</linearGradient></defs>' +
      '<g fill="none" stroke="#E9E2D3" stroke-opacity=".2">' +
        '<rect x="12" y="12" width="636" height="376" rx="3"/>' +
        '<rect x="21" y="21" width="618" height="358" rx="2" stroke-opacity=".09"/>' +
      '</g>' +
      '<text x="30" y="42" class="dwg-note">' + t.name.toUpperCase() + ' · ' + state.blocks.length + ' БЛОКОВ · ' + state.circuits + ' ЦЕПЕЙ</text>' +
      '<text x="630" y="42" text-anchor="end" class="dwg-note">' + r.code + '</text>' +
      '<line x1="30" y1="50" x2="630" y2="50" stroke="#E9E2D3" stroke-opacity=".12"/>' +
      '<path d="M' + x0 + ' ' + y + 'H' + x1 + '" stroke="#DCE6EA" stroke-opacity=".1" stroke-width="12" stroke-linecap="round" fill="none"/>' +
      '<path d="M' + x0 + ' ' + y + 'H' + x1 + '" stroke="' + accent + '" stroke-opacity=".2" stroke-width="7" stroke-linecap="round" fill="none"/>' +
      '<path d="M' + x0 + ' ' + y + 'H' + x1 + '" stroke="url(#pvGrad)" stroke-width="2.2" stroke-linecap="round" fill="none"/>' +
      '<path class="dwg-pulse" d="M' + x0 + ' ' + y + 'H' + x1 + '" stroke="#FFD9B0" stroke-width="2" stroke-dasharray="3 34" stroke-linecap="round" fill="none"/>' +
      bricks +
      connector(x0, y, 'X1', false, accent) +
      connector(x1, y, 'X2', false, accent) +
      (extra > 0 ? '<text x="' + (x1 - 20) + '" y="' + (y - 36) + '" text-anchor="end" class="dwg-note">+ЕЩЁ ' + extra + '</text>' : '') +
      '<g stroke="#93A9B3" stroke-opacity=".55">' +
        '<path d="M' + x0 + ' 352H396"/><path d="M' + x0 + ' 345v14M396 345v14"/>' +
        '<path d="M' + x0 + ' 352l9-4v8zM396 352l-9-4v8z" fill="#93A9B3" stroke="none" fill-opacity=".65"/>' +
      '</g>' +
      '<text x="230" y="344" text-anchor="middle" class="dwg-dimtext">L = ' + int(state.length * 1000) + ' мм</text>' +
      '<g>' +
        '<rect x="422" y="350" width="214" height="36" fill="#08141D" stroke="#93A9B3" stroke-opacity=".28"/>' +
        '<line x1="422" y1="368" x2="636" y2="368" stroke="#93A9B3" stroke-opacity=".2"/>' +
        '<text x="430" y="363" class="dwg-strong">ЖГУТ.ПРО</text>' +
        '<text x="430" y="380" class="dwg-muted">' + r.code + ' · ' + t.name + '</text>' +
        '<text x="628" y="363" text-anchor="end" class="dwg-muted">МОДУЛЬНАЯ</text>' +
        '<text x="628" y="380" text-anchor="end" class="dwg-muted">М 1:10</text>' +
      '</g>' +
      '<text x="30" y="380" class="dwg-muted">НЕ ДЛЯ ПРОИЗВОДСТВА</text>' +
      '<text x="30" y="366" class="dwg-muted">' + (state.sealed ? 'ГЕРМЕТИЧНЫЕ РАЗЪЁМЫ' : 'РАЗЪЁМЫ БЕЗ УПЛОТНЕНИЙ') + ' · ' + r.ip.name + '</text>' +
    '</svg>';
  }

  function drawHarness() {
    if (state.mode === 'blocks') return drawBlockHarness();
    const t = D.TYPES[state.type];
    const r = lastResult;
    const accent = t.accent;
    const x0 = 64;
    const x1 = 596;
    const y = 200;
    const n = Math.min(state.branches, 8);
    const span = x1 - x0 - 170;
    const xs = [];
    for (let i = 0; i < n; i++) {
      xs.push(x0 + 85 + (n === 1 ? span / 2 : span * i / (n - 1)));
    }
    const bundle = 6.5 + Math.min(state.circuits, 64) * 0.15;
    const bw = Math.max(3, bundle * 0.55);

    function connector(x, cy, label, below) {
      const ly = below ? cy + 25 : cy - 14;
      return '<g>' +
        '<rect x="' + (x - 19) + '" y="' + (cy - 10) + '" width="38" height="20" rx="4" fill="#08141D" stroke="' + accent + '" stroke-width="1.4"/>' +
        [-12, -6, 0, 6, 12].map(function (dx) {
          return '<circle cx="' + (x + dx) + '" cy="' + cy + '" r="1.5" fill="' + accent + '"/>';
        }).join('') +
        '<text x="' + x + '" y="' + ly + '" text-anchor="middle" class="dwg-label">' + label + '</text>' +
      '</g>';
    }

    const branches = xs.map(function (x, i) {
      const dir = i % 2 ? 1 : -1;
      const len = 56 + (i % 3) * 20 + (state.branches > 6 ? 6 : 0);
      const ey = y + dir * len;
      const d = 'M' + x + ' ' + y + 'V' + ey;
      return '<path d="' + d + '" stroke="#DCE6EA" stroke-opacity=".1" stroke-width="' + (bw + 5) + '" stroke-linecap="round" fill="none"/>' +
        '<path d="' + d + '" stroke="' + accent + '" stroke-opacity=".2" stroke-width="' + (bw + 1) + '" stroke-linecap="round" fill="none"/>' +
        '<path d="' + d + '" stroke="url(#pvGrad)" stroke-width="1.5" stroke-linecap="round" fill="none"/>' +
        connector(x, ey, 'X' + (i + 3), dir > 0);
    }).join('');

    const joints = xs.map(function (x) {
      return '<circle cx="' + x + '" cy="' + y + '" r="3" fill="#08141D" stroke="' + accent + '" stroke-width="1.2"/>';
    }).join('');

    const dimension = '<g stroke="#93A9B3" stroke-opacity=".55">' +
        '<path d="M' + x0 + ' 336H' + x1 + '"/>' +
        '<path d="M' + x0 + ' 329v14M' + x1 + ' 329v14"/>' +
        '<path d="M' + x0 + ' 336l9-4v8zM' + x1 + ' 336l-9-4v8z" fill="#93A9B3" stroke="none" fill-opacity=".65"/>' +
      '</g>' +
      '<text x="' + ((x0 + x1) / 2) + '" y="328" text-anchor="middle" class="dwg-dimtext">L = ' + int(state.length * 1000) + ' мм</text>';

    return '<svg viewBox="0 0 660 400" role="img" aria-label="Эскиз жгута ' + r.code + '">' +
      '<defs><linearGradient id="pvGrad" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#8F4A24"/><stop offset=".52" stop-color="#E8B080"/><stop offset="1" stop-color="#B65F2C"/>' +
      '</linearGradient></defs>' +
      '<g fill="none" stroke="#E9E2D3" stroke-opacity=".2">' +
        '<rect x="12" y="12" width="636" height="376" rx="3"/>' +
        '<rect x="21" y="21" width="618" height="358" rx="2" stroke-opacity=".09"/>' +
      '</g>' +
      '<text x="30" y="42" class="dwg-note">' + t.name.toUpperCase() + ' · ' + state.circuits + ' ЦЕПЕЙ · ' + num(state.length) + ' М · ' + state.voltage + ' В</text>' +
      '<text x="630" y="42" text-anchor="end" class="dwg-note">' + r.code + '</text>' +
      '<line x1="30" y1="50" x2="630" y2="50" stroke="#E9E2D3" stroke-opacity=".12"/>' +
      '<path d="M' + x0 + ' ' + y + 'H' + x1 + '" stroke="#DCE6EA" stroke-opacity=".1" stroke-width="' + (bundle + 6) + '" stroke-linecap="round" fill="none"/>' +
      '<path d="M' + x0 + ' ' + y + 'H' + x1 + '" stroke="' + accent + '" stroke-opacity=".2" stroke-width="' + bundle + '" stroke-linecap="round" fill="none"/>' +
      '<path d="M' + x0 + ' ' + y + 'H' + x1 + '" stroke="url(#pvGrad)" stroke-width="2.2" stroke-linecap="round" fill="none"/>' +
      '<path class="dwg-pulse" d="M' + x0 + ' ' + y + 'H' + x1 + '" stroke="#FFD9B0" stroke-width="2" stroke-dasharray="3 34" stroke-linecap="round" fill="none"/>' +
      branches + joints +
      connector(x0, y, 'X1', false) +
      connector(x1, y, 'X2', false) +
      dimension +
      '<g>' +
        '<rect x="422" y="350" width="214" height="36" fill="#08141D" stroke="#93A9B3" stroke-opacity=".28"/>' +
        '<line x1="422" y1="368" x2="636" y2="368" stroke="#93A9B3" stroke-opacity=".2"/>' +
        '<text x="430" y="363" class="dwg-strong">ЖГУТ.ПРО</text>' +
        '<text x="430" y="380" class="dwg-muted">' + r.code + ' · ' + t.name + '</text>' +
        '<text x="628" y="363" text-anchor="end" class="dwg-muted">ЭСКИЗ</text>' +
        '<text x="628" y="380" text-anchor="end" class="dwg-muted">М 1:10</text>' +
      '</g>' +
      '<text x="30" y="380" class="dwg-muted">НЕ ДЛЯ ПРОИЗВОДСТВА</text>' +
      '<text x="30" y="366" class="dwg-muted">' + (state.sealed ? 'ГЕРМЕТИЧНЫЕ РАЗЪЁМЫ' : 'РАЗЪЁМЫ БЕЗ УПЛОТНЕНИЙ') + ' · ' + (r.ip.name) + '</text>' +
    '</svg>';
  }

  /* ---------- правая панель ---------- */
  function updateAside() {
    const host = $('#configAside');
    if (!host || !lastResult) return;
    const r = lastResult;
    const t = D.TYPES[state.type];
    host.style.setProperty('--accent', t.accent);
    const qtySub = state.qty > 1
      ? state.qty + ' шт · скидка ' + Math.round(r.discount * 100) + '%'
      : 'за 1 жгут · партия 1 шт';
    const nextLabel = step === 6 ? 'К заявке' : 'Перейти к итогу';
    const onCanvas = state.mode === 'blocks' && step === 2;
    const visual = onCanvas
      ? '<div class="pv-list">' + (state.blocks.length
          ? state.blocks.map(function (block, index) {
              const def = D.BLOCKS[block.type] || D.BLOCKS.reserve;
              return '<div class="pv-item' + (block.id === selectedBlockId ? ' is-selected' : '') + '" style="--brick:' + def.color + '">' +
                '<span class="pv-dot"></span>' +
                '<span class="pv-item-name">B' + (index + 1) + ' · ' + def.name + '</span>' +
                '<span class="pv-item-meta">' + block.circuits + ' ц.' + (block.qty > 1 ? ' ×' + block.qty : '') + '</span>' +
              '</div>';
            }).join('')
          : '<p class="pv-list-empty">Пока только магистраль. Перетащите модуль на схему.</p>') + '</div>'
      : '<div class="pv-drawing">' + drawHarness() + '</div>';

    host.innerHTML =
      '<div class="preview-head">' +
        '<div><span class="pv-kicker">' + (onCanvas ? 'Состав на схеме' : 'Эскиз жгута') + '</span><div class="pv-title">' + t.name + ' · ' + r.purpose.name + '</div></div>' +
        '<span class="pv-code">' + r.code + '</span>' +
      '</div>' +
      visual +
      '<div class="metrics">' +
        '<div class="metric"><span>Длина</span><b>' + num(state.length) + ' м</b></div>' +
        '<div class="metric"><span>Цепи</span><b>' + state.circuits + '</b></div>' +
        '<div class="metric"><span>Ветви</span><b>' + state.branches + '</b></div>' +
        '<div class="metric"><span>Разъёмы</span><b>' + r.connectorCount + ' шт</b></div>' +
        '<div class="metric"><span>Масса</span><b>' + num(r.weight) + ' кг</b></div>' +
        '<div class="metric"><span>Ток</span><b>до ' + r.maxAmp + ' А</b></div>' +
      '</div>' +
      '<div class="price-box">' +
        '<div class="price-top"><span class="price-label">Предварительно</span>' +
          (state.qty > 1 ? '<span class="disc-badge">−' + Math.round(r.discount * 100) + '%</span>' : '') +
        '</div>' +
        '<div class="price-value">' + money(r.priceUnit) + '</div>' +
        '<div class="price-sub">' + qtySub + '</div>' +
        (state.qty > 1 ? '<div class="price-total"><span>Итого за ' + state.qty + ' шт</span><b>' + money(r.total) + '</b></div>' : '') +
        '<div class="price-meta"><span>Срок: ' + r.leadDays + ' раб. дн.</span><span>Масса: ' + num(r.weight) + ' кг</span></div>' +
      '</div>' +
      '<div class="aside-actions">' +
        '<button type="button" class="btn btn-primary btn-wide" data-action="' + (step === 6 ? 'to-form' : 'next') + '">' + nextLabel + ' →</button>' +
        '<div class="aside-row">' +
          '<button type="button" class="btn btn-ghost-light" data-action="download">Спецификация</button>' +
          '<button type="button" class="btn btn-ghost-light" data-action="share">Ссылка</button>' +
        '</div>' +
      '</div>' +
      '<p class="aside-note">Расчёт обновляется автоматически. Не оферта: точная цена — после проверки ТЗ.</p>';
  }

  function updateMobileBar() {
    const bar = $('#mobileBar');
    if (!bar || !lastResult) return;
    bar.innerHTML =
      '<div class="mb-price"><span>≈</span><b>' + money(lastResult.total) + '</b><small>' + (state.qty > 1 ? state.qty + ' шт' : 'за 1 жгут') + '</small></div>' +
      '<button type="button" class="btn btn-primary" data-action="' + (step === 6 ? 'to-form' : 'next') + '">' + (step === 6 ? 'Заявка' : 'Далее') + ' →</button>';
  }

  function scheduleAside() {
    if (asideRaf) return;
    asideRaf = requestAnimationFrame(function () {
      asideRaf = 0;
      updateAside();
      updateMobileBar();
    });
  }

  /* ---------- изменение состояния ---------- */
  function afterChange(rerenderStep) {
    lastResult = C.calc(state, D);
    if (rerenderStep) renderStep();
    scheduleAside();
    updateMobileBar();
    persist();
  }

  function patch(changes, rerenderStep) {
    if (state.mode === 'blocks' && changes.section !== undefined && state.trunk) {
      state.trunk.section = Number(changes.section);
    }
    Object.assign(state, changes);
    state = D.sanitize(state);
    afterChange(rerenderStep !== false);
  }

  function switchMode(mode) {
    if (mode !== 'blocks' && mode !== 'simple') return;
    if (mode === state.mode) return;
    if (mode === 'blocks') {
      state.simpleSnapshot = {
        circuits: state.circuits,
        length: state.length,
        branches: state.branches,
        section: state.section,
        connectors: state.connectors
      };
      if (!state.blocks.length) state.blocks = D.seedBlocks(state.type);
      if (!state.trunk) state.trunk = D.defaultTrunk(state.type);
      state.mode = 'blocks';
      selectedBlockId = state.blocks.length ? state.blocks[0].id : null;
      syncBlocksAggregate();
      state = D.sanitize(state);
      afterChange(true);
      toast('Модульный режим: перетаскивайте блоки прямо по схеме.');
    } else {
      state.mode = 'simple';
      if (state.simpleSnapshot) {
        Object.assign(state, state.simpleSnapshot);
        delete state.simpleSnapshot;
      } else {
        const base = D.presetState(state.type, state.purpose);
        state.circuits = base.circuits;
        state.length = base.length;
        state.branches = base.branches;
        state.section = base.section;
        state.connectors = base.connectors;
      }
      state = D.sanitize(state);
      afterChange(true);
      toast('Режим параметров: длина, цепи и ветви.');
    }
  }

  function limitMessage(extraCircuits, extraLength, extraBranches) {
    if (state.circuits + extraCircuits > 64) return 'Лимит: 64 цепи. Уменьшите другой блок.';
    if (state.length + extraLength > 30) return 'Лимит: 30 м общей длины. Уменьшите другой блок.';
    if (state.branches + extraBranches > 12) return 'Лимит: 12 ветвей. Уменьшите количество блоков.';
    return '';
  }

  function addBlock(typeId, dropX, dropY) {
    const def = D.BLOCKS[typeId];
    if (!def) return;
    const CV = D.CANVAS;
    let x;
    let y;
    let length;
    if (typeof dropX === 'number' && typeof dropY === 'number') {
      x = Math.min(910, Math.max(90, dropX));
      const side = dropY < CV.trunkY ? -1 : 1;
      const geomMax = Math.max(CV.minLength, ((side < 0 ? CV.trunkY - CV.minY : CV.maxY - CV.trunkY) - CV.brickH / 2) / CV.scale);
      const available = Math.max(CV.minLength, 30 - state.length);
      const rawDistance = Math.abs(dropY - CV.trunkY) - CV.brickH / 2;
      const wanted = rawDistance > 0 ? rawDistance / CV.scale : CV.minLength;
      length = Math.max(CV.minLength, Math.min(CV.maxLength, geomMax, available, wanted));
      length = Math.floor(length * 2) / 2;
      y = CV.trunkY + side * (length * CV.scale + CV.brickH / 2);
    } else {
      const sides = state.blocks.length % 2 ? [1, -1] : [-1, 1];
      let slot = null;
      sides.some(function (side) {
        for (let col = 0; col < 6; col += 1) {
          const candidateX = 130 + col * 150;
          const occupied = state.blocks.some(function (b) {
            return Math.sign(b.y - CV.trunkY) === side && Math.abs(b.x - candidateX) < 105;
          });
          if (!occupied) {
            slot = { x: candidateX, side: side };
            return true;
          }
        }
        return false;
      });
      if (!slot) slot = { x: 130, side: -1 };
      x = slot.x;
      length = Math.min(def.length, Math.max(CV.minLength, 30 - state.length));
      y = CV.trunkY + slot.side * (length * CV.scale + CV.brickH / 2);
    }
    const warn = limitMessage(def.circuits, length, 1);
    if (warn) { toast(warn); return; }
    const block = {
      id: nextBlockId(),
      type: typeId,
      circuits: def.circuits,
      length: length,
      section: def.section,
      connector: def.connector,
      qty: 1,
      x: x,
      y: y,
      parentId: null
    };
    state.blocks.push(block);
    selectedBlockId = block.id;
    syncBlocksAggregate();
    afterChange(true);
    toast('Блок «' + def.name + '» добавлен на схему');
  }

  function removeBlock(id) {
    const block = findBlock(id);
    if (!block) return;
    state.blocks.forEach(function (b) {
      if (b.parentId === id) b.parentId = null;
    });
    state.blocks = state.blocks.filter(function (b) { return b.id !== id; });
    if (selectedBlockId === id) selectedBlockId = state.blocks.length ? state.blocks[0].id : null;
    syncBlocksAggregate();
    afterChange(true);
    toast('Блок «' + (D.BLOCKS[block.type] || {}).name + '» удалён');
  }

  function duplicateBlock(id) {
    const block = findBlock(id);
    if (!block) return;
    const warn = limitMessage(block.circuits, block.length, 1);
    if (warn) { toast(warn); return; }
    const side = block.y < D.CANVAS.trunkY ? -1 : 1;
    const copy = Object.assign({}, block, {
      id: nextBlockId(),
      qty: 1,
      parentId: null,
      x: Math.min(880, Math.max(100, block.x + 36)),
      y: D.CANVAS.trunkY + side * (block.length * D.CANVAS.scale + D.CANVAS.brickH / 2)
    });
    state.blocks.push(copy);
    selectedBlockId = copy.id;
    syncBlocksAggregate();
    afterChange(true);
    toast('Блок продублирован');
  }

  function adjustBlockCircuits(id, delta) {
    const block = findBlock(id);
    if (!block) return;
    if (block.circuits + delta < 1 || block.circuits + delta > 12) return;
    if (delta > 0) {
      const warn = limitMessage(delta, 0, 0);
      if (warn) { toast(warn); return; }
    }
    block.circuits += delta;
    syncBlocksAggregate();
    afterChange(true);
  }

  function adjustBlockQty(id, delta) {
    const block = findBlock(id);
    if (!block) return;
    if (block.qty + delta < 1 || block.qty + delta > 4) return;
    if (delta > 0) {
      const warn = limitMessage(block.circuits * delta, block.length * delta, delta);
      if (warn) { toast(warn); return; }
    }
    block.qty += delta;
    syncBlocksAggregate();
    afterChange(true);
  }

  function updateBlockField(id, field, value) {
    const block = findBlock(id);
    if (!block) return;
    if (field === 'section') {
      block.section = Number(value);
    } else if (field === 'connector') {
      block.connector = value;
    } else if (field === 'parent') {
      if (value && (value === block.id || isBlockDescendant(value, block.id))) {
        toast('Нельзя подключить блок к самому себе или своему потомку');
        afterChange(true);
        return;
      }
      block.parentId = value || null;
      const anchor = blockAnchorY(block);
      const dir = block.y < anchor ? -1 : 1;
      block.y = Math.min(D.CANVAS.maxY, Math.max(D.CANVAS.minY, anchor + dir * (block.length * D.CANVAS.scale + D.CANVAS.brickH / 2)));
    }
    syncBlocksAggregate();
    afterChange(true);
  }

  function resetBlocks() {
    state.blocks = D.seedBlocks(state.type);
    state.trunk = D.defaultTrunk(state.type);
    selectedBlockId = state.blocks.length ? state.blocks[0].id : null;
    syncBlocksAggregate();
    afterChange(true);
    toast('Набор блоков сброшен к типовому');
  }

  function onCanvasLength(el) {
    const block = findBlock(el.dataset.id);
    if (!block) return;
    const max = maxLengthFor(block);
    const value = Math.min(parseFloat(el.value), max);
    if (isNaN(value)) return;
    block.length = value;
    const anchor = blockAnchorY(block);
    const dir = block.y < anchor ? -1 : 1;
    block.y = Math.min(D.CANVAS.maxY, Math.max(D.CANVAS.minY, anchor + dir * (value * D.CANVAS.scale + D.CANVAS.brickH / 2)));
    el.value = value;
    const pct = max > 0.5 ? ((value - 0.5) / (max - 0.5) * 100).toFixed(1) : '100';
    el.style.setProperty('--p', pct + '%');
    const label = el.closest('.cp-field') ? el.closest('.cp-field').querySelector('span b') : null;
    if (label) label.textContent = num(value) + ' м';
    syncBlocksAggregate();
    lastResult = C.calc(state, D);
    const cost = document.querySelector('.cp-cost');
    if (cost) cost.textContent = '≈ ' + money(blockCost(block.id));
    renderCanvasOnly();
    scheduleAside();
    updateMobileBar();
    persistSoon();
  }

  function onTrunkLength(el) {
    const max = trunkLengthMax();
    const value = Math.min(parseFloat(el.value), max);
    if (isNaN(value)) return;
    state.trunk.length = value;
    el.value = value;
    const pct = max > 1 ? ((value - 1) / (max - 1) * 100).toFixed(1) : '100';
    el.style.setProperty('--p', pct + '%');
    const out = document.querySelector('[data-trunk-out]');
    if (out) out.textContent = num(value) + ' м';
    syncBlocksAggregate();
    lastResult = C.calc(state, D);
    const trunkCost = document.querySelector('.trunk-cost');
    if (trunkCost) trunkCost.textContent = '≈ ' + money(lastResult.trunkCost || 0);
    renderCanvasOnly();
    scheduleAside();
    updateMobileBar();
    persistSoon();
  }

  function setType(typeId) {
    if (!D.TYPES[typeId]) return;
    const base = D.presetState(typeId, D.TYPES[typeId].purposes[0].id);
    const keepBlocks = state.mode === 'blocks';
    selectedBlockId = null;
    state = D.sanitize(Object.assign({}, base, {
      qty: state.qty,
      comment: state.comment,
      mode: state.mode,
      blocks: keepBlocks ? D.seedBlocks(typeId) : [],
      trunk: D.defaultTrunk(typeId)
    }));
    step = 1;
    renderAll();
  }

  function setPurpose(purposeId) {
    const type = D.TYPES[state.type];
    if (!type.purposes.some(function (p) { return p.id === purposeId; })) return;
    const base = D.presetState(state.type, purposeId);
    state = D.sanitize(Object.assign({}, base, {
      qty: state.qty,
      comment: state.comment,
      mode: state.mode,
      blocks: state.blocks,
      trunk: state.trunk
    }));
    renderAll();
  }

  function applyPreset(id) {
    const p = D.PRESETS.find(function (x) { return x.id === id; });
    if (!p) return;
    const base = D.presetState(p.type, p.purpose);
    selectedBlockId = null;
    state = D.sanitize(Object.assign({}, base, p.overrides || {}, { qty: 1 }));
    step = 6;
    renderAll();
    scrollToConfig();
    toast('Пресет загружен: ' + p.title);
  }

  function resetState() {
    state = D.presetState(state.type, D.TYPES[state.type].purposes[0].id);
    selectedBlockId = null;
    step = 1;
    try { localStorage.removeItem(STORAGE_KEY); } catch (err) { /* noop */ }
    renderAll();
    toast('Конфигурация сброшена');
  }

  function go(n) {
    step = clampStep(n);
    renderStep();
    syncStepper();
    updateAside();
    updateMobileBar();
    persist();
    const panel = $('#configPanel');
    if (panel) {
      const top = panel.getBoundingClientRect().top + window.scrollY - 92;
      window.scrollTo({ top: top, behavior: motionOK ? 'smooth' : 'auto' });
    }
  }

  function renderAll() {
    lastResult = C.calc(state, D);
    renderStep();
    syncStepper();
    updateAside();
    updateMobileBar();
    persist();
  }

  function rangeText(key, v) {
    if (key === 'length') return num(v) + ' м';
    if (key === 'circuits') return v + ' ' + circuitsWord(v);
    if (key === 'branches') return v + ' ' + branchesWord(v);
    return String(v);
  }

  function onRange(el) {
    const key = el.dataset.bind;
    const v = parseFloat(el.value);
    if (!key || isNaN(v)) return;
    state[key] = key === 'length' ? v : Math.round(v);
    const pct = ((v - Number(el.min)) / (Number(el.max) - Number(el.min)) * 100).toFixed(1);
    el.style.setProperty('--p', pct + '%');
    el.setAttribute('aria-valuetext', rangeText(key, v));
    const out = document.querySelector('[data-out="' + key + '"]');
    if (out) out.textContent = rangeText(key, v);
    lastResult = C.calc(state, D);
    scheduleAside();
    persistSoon();
  }

  function onExtraToggle(input) {
    const id = input.dataset.extra;
    if (!id) return;
    if (input.checked) {
      if (state.extras.indexOf(id) < 0) state.extras.push(id);
    } else {
      state.extras = state.extras.filter(function (x) { return x !== id; });
    }
    afterChange(false);
  }

  /* ---------- спецификация / печать / ссылка ---------- */
  function nowDate() {
    return new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' });
  }

  function buildSpecText() {
    const r = lastResult;
    const lines = [];
    lines.push('ЖГУТ.ПРО — спецификация жгута');
    lines.push('Дата: ' + nowDate());
    lines.push('Код: ' + r.code);
    lines.push('');
    lines.push('ПАРАМЕТРЫ');
    specRows().forEach(function (row) { lines.push(row[0] + ': ' + row[1]); });
    lines.push('');
    lines.push('СОСТАВ И СТОИМОСТЬ');
    const b = r.components;
    lines.push('Провод и защита: ' + money(b.wire + b.sheath));
    lines.push('Сборка и разделка: ' + money(b.labor));
    lines.push('Разъёмы и контакты: ' + money(b.connectors));
    lines.push('Маркировка: ' + money(b.marking));
    lines.push('Опции: ' + money(b.extras));
    lines.push('Коэффициент исполнения ×' + String(r.factor).replace('.', ',') + ': +' + money(b.execution));
    lines.push('Цена за 1 жгут: ' + money(r.priceOne));
    if (state.qty > 1) {
      lines.push('Скидка за партию ' + state.qty + ' шт: −' + money(r.priceOne - r.priceUnit) + '/шт');
      lines.push('Цена за жгут с учётом скидки: ' + money(r.priceUnit));
      lines.push('Итого за ' + state.qty + ' шт: ' + money(r.total));
    }
    lines.push('');
    if (state.comment) {
      lines.push('КОММЕНТАРИЙ');
      lines.push(state.comment);
      lines.push('');
    }
    lines.push('Срок производства: ' + r.leadDays + ' рабочих дней.');
    lines.push('Цены предварительные, не являются публичной офертой. Точная стоимость — после согласования ТЗ.');
    lines.push('');
    lines.push('Контакты: ' + D.CONTACTS.phone + ' · ' + D.CONTACTS.email + ' · ' + D.CONTACTS.city);
    return lines.join('\r\n');
  }

  function downloadSpec() {
    const text = buildSpecText();
    const blob = new Blob(['\ufeff' + text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spec-' + lastResult.code + '.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
    toast('Спецификация скачана');
  }

  function buildPrintHtml() {
    const r = lastResult;
    const b = r.components;
    const rows = specRows();
    const half = Math.ceil(rows.length / 2);
    function table(list) {
      return '<table class="ps-table">' + list.map(function (row) {
        return '<tr><th>' + esc(row[0]) + '</th><td>' + esc(row[1]) + '</td></tr>';
      }).join('') + '</table>';
    }
    return '<div class="ps-top">' +
        '<div class="ps-brand">ЖГУТ<span>.ПРО</span><small>инженерные жгуты</small></div>' +
        '<div class="ps-meta"><b>' + r.code + '</b>' + nowDate() + '<br>Предварительный расчёт</div>' +
      '</div>' +
      '<h1 class="ps-title">Спецификация жгута</h1>' +
      '<p class="ps-sub">' + D.TYPES[state.type].name + ' · ' + r.purpose.name + ' · ' + state.circuits + ' ' + circuitsWord(state.circuits) + ' · ' + num(state.length) + ' м</p>' +
      '<div class="ps-cols">' + table(rows.slice(0, half)) + table(rows.slice(half)) + '</div>' +
      '<table class="ps-table">' +
        '<tr><th>Провод и защита</th><td>' + money(b.wire + b.sheath) + '</td></tr>' +
        '<tr><th>Сборка и разделка</th><td>' + money(b.labor) + '</td></tr>' +
        '<tr><th>Разъёмы и контакты</th><td>' + money(b.connectors) + '</td></tr>' +
        '<tr><th>Маркировка</th><td>' + money(b.marking) + '</td></tr>' +
        '<tr><th>Опции</th><td>' + money(b.extras) + '</td></tr>' +
        '<tr><th>Коэффициент исполнения ×' + String(r.factor).replace('.', ',') + '</th><td>+' + money(b.execution) + '</td></tr>' +
      '</table>' +
      '<div class="ps-total"><span>' + (state.qty > 1 ? 'Итого за ' + state.qty + ' шт' : 'Цена за 1 жгут') + '</span><b>' + money(r.total) + '</b></div>' +
      '<p class="ps-note">Срок производства: ' + r.leadDays + ' рабочих дней. Цены предварительные и не являются публичной офертой; точная стоимость фиксируется после согласования технического задания. Масса: ' + num(r.weight) + ' кг. ' + (state.comment ? 'Комментарий: ' + esc(state.comment) : '') + '</p>' +
      '<div class="ps-sign"><span>Исполнитель: ЖГУТ.ПРО · ' + D.CONTACTS.phone + '</span><span>Заказчик: ____________________</span></div>';
  }

  function printSpec() {
    const sheet = $('#printSheet');
    if (!sheet) return;
    sheet.innerHTML = buildPrintHtml();
    window.print();
  }

  async function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    ta.style.top = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    let ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    ta.remove();
    if (!ok) throw new Error('copy-failed');
    return true;
  }

  async function shareSpec() {
    const url = window.location.href.split('#')[0] + '#cfg=' + encodeState(state);
    try {
      await copyText(url);
      toast('Ссылка на расчёт скопирована');
    } catch (err) {
      window.prompt('Скопируйте ссылку на расчёт:', url);
    }
  }

  /* ---------- заявка ---------- */
  function buildLeadText(fd) {
    const r = lastResult;
    const lines = [];
    lines.push('Заявка на жгут ' + r.code);
    lines.push('Имя: ' + fd.name);
    lines.push('Телефон: ' + fd.phone);
    if (fd.email) lines.push('E-mail: ' + fd.email);
    if (fd.city) lines.push('Город: ' + fd.city);
    lines.push('');
    lines.push(buildSpecText());
    return lines.join('\r\n');
  }

  function handleLead(form) {
    const status = $('#leadStatus');
    const nameEl = form.elements.name;
    const phoneEl = form.elements.phone;
    const emailEl = form.elements.email;
    const cityEl = form.elements.city;
    const consentEl = form.elements.consent;
    const consentWrap = form.querySelector('.consent');
    const name = nameEl.value.trim();
    const phone = phoneEl.value.trim();
    const email = emailEl.value.trim();
    const city = cityEl.value.trim();
    let ok = true;

    function mark(el, valid) {
      if (el) el.classList.toggle('is-invalid', !valid);
    }

    mark(nameEl, name.length >= 2);
    mark(phoneEl, phone.replace(/\D/g, '').length >= 10);
    mark(emailEl, !email || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email));
    if (consentWrap) consentWrap.classList.toggle('is-invalid', !consentEl.checked);
    if (name.length < 2 || phone.replace(/\D/g, '').length < 10 || (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) || !consentEl.checked) {
      ok = false;
    }
    if (!ok) {
      status.className = 'form-status is-error';
      status.textContent = 'Проверьте имя, телефон, e-mail и согласие на обработку данных.';
      return;
    }

    const text = buildLeadText({ name: name, phone: phone, email: email, city: city });
    const mailto = 'mailto:' + D.CONTACTS.email +
      '?subject=' + encodeURIComponent('Заявка на жгут ' + lastResult.code) +
      '&body=' + encodeURIComponent(text);
    lastLead = { text: text, mailto: mailto };

    form.style.display = 'none';
    status.className = 'form-status';
    status.innerHTML =
      '<div class="form-success">' +
        '<div class="fs-icon">✓</div>' +
        '<div><b>Заявка сформирована</b>' +
          '<p>Письмо с параметрами жгута уже собрано. Отправьте его — ответим в течение рабочего дня. Если почтовая программа не настроена, скопируйте текст и отправьте на ' + D.CONTACTS.email + '.</p>' +
          '<div class="fs-actions">' +
            '<a class="btn btn-primary" href="' + mailto + '">Открыть письмо</a>' +
            '<button type="button" class="btn btn-ghost" data-action="copy-lead">Скопировать текст</button>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  /* ---------- обработчики ---------- */
  function handleAction(el) {
    const action = el.dataset.action;
    const value = el.dataset.value;
    if (action === 'mode') { switchMode(value); return; }
    if (action === 'block-add') { addBlock(value); return; }
    if (action === 'block-del') { removeBlock(el.dataset.id); return; }
    if (action === 'block-dup') { duplicateBlock(el.dataset.id); return; }
    if (action === 'block-circuits-minus') { adjustBlockCircuits(el.dataset.id, -1); return; }
    if (action === 'block-circuits-plus') { adjustBlockCircuits(el.dataset.id, 1); return; }
    if (action === 'block-qty-minus') { adjustBlockQty(el.dataset.id, -1); return; }
    if (action === 'block-qty-plus') { adjustBlockQty(el.dataset.id, 1); return; }
    if (action === 'block-reset') { resetBlocks(); return; }
    if (action === 'scroll-props') {
      const props = $('#canvasProps');
      if (props) props.scrollIntoView({ behavior: motionOK ? 'smooth' : 'auto', block: 'start' });
      return;
    }
    if (action === 'type') { if (state.type !== value) setType(value); return; }
    if (action === 'purpose') { if (state.purpose !== value) setPurpose(value); return; }
    if (action === 'type-jump') {
      setType(value);
      scrollToConfig();
      toast('Тип выбран: ' + D.TYPES[value].name + '. Уточните назначение жгута.');
      return;
    }
    if (action === 'preset') { applyPreset(value); return; }
    if (action === 'qty') { patch({ qty: Number(value) }); return; }
    if (action === 'voltage') { patch({ voltage: Number(value) }); return; }
    if (action === 'environment') { patch({ environment: value }); return; }
    if (action === 'section') { patch({ section: Number(value) }); return; }
    if (action === 'insulation') { patch({ insulation: value }); return; }
    if (action === 'conductor') { patch({ conductor: value }); return; }
    if (action === 'colors') { patch({ colorCode: value }); return; }
    if (action === 'connectors') { patch({ connectors: value }); return; }
    if (action === 'sleeve') { patch({ sleeve: value }); return; }
    if (action === 'ip') { patch({ ip: value }); return; }
    if (action === 'labels') { patch({ labels: value }); return; }
    if (action === 'toggle-sealed') { patch({ sealed: !state.sealed }); return; }
    if (action === 'next') {
      if (step >= 6) scrollToForm();
      else go(step + 1);
      return;
    }
    if (action === 'back') { go(step - 1); return; }
    if (action === 'step') { go(Number(el.dataset.step)); return; }
    if (action === 'to-form') { scrollToForm(); return; }
    if (action === 'download') { downloadSpec(); return; }
    if (action === 'print') { printSpec(); return; }
    if (action === 'share') { shareSpec(); return; }
    if (action === 'reset') { resetState(); return; }
    if (action === 'copy-lead') {
      if (!lastLead) return;
      copyText(lastLead.text).then(function () { toast('Текст заявки скопирован'); })
        .catch(function () { toast('Не удалось скопировать — выделите текст вручную'); });
      return;
    }
  }

  function bind() {
    document.addEventListener('click', function (e) {
      const actionEl = e.target.closest('[data-action]');
      if (actionEl) {
        e.preventDefault();
        handleAction(actionEl);
        return;
      }
      const navLink = e.target.closest('#siteNav a');
      if (navLink) closeMenu();
      if (document.body.classList.contains('menu-open') && !e.target.closest('.site-head')) closeMenu();
    });

    document.addEventListener('input', function (e) {
      const el = e.target;
      if (el.matches('input[type="range"][data-bind]')) onRange(el);
      if (el.matches('[data-canvas-length]')) onCanvasLength(el);
      if (el.matches('[data-trunk="length"]')) onTrunkLength(el);
      if (el.matches('[data-comment]')) {
        state.comment = el.value.slice(0, 500);
        persistSoon();
      }
      if (el.matches('.input.is-invalid')) el.classList.remove('is-invalid');
      if (el.matches('input[name="consent"]')) {
        const wrap = el.closest('.consent');
        if (wrap && el.checked) wrap.classList.remove('is-invalid');
      }
    });

    document.addEventListener('change', function (e) {
      const extra = e.target.closest('input[data-extra]');
      if (extra) onExtraToggle(extra);
      const blockField = e.target.closest('select[data-block-field]');
      if (blockField) {
        updateBlockField(blockField.dataset.id, blockField.dataset.blockField, blockField.value);
        return;
      }
      const trunkField = e.target.closest('select[data-trunk-field]');
      if (trunkField) {
        state.trunk[trunkField.dataset.trunkField] = trunkField.dataset.trunkField === 'section'
          ? Number(trunkField.value)
          : trunkField.value;
        syncBlocksAggregate();
        afterChange(true);
      }
    });

    /* перетаскивание модуля из палитры на схему */
    document.addEventListener('dragstart', function (e) {
      const tile = e.target.closest('[data-palette-type]');
      if (!tile) return;
      paletteDragType = tile.dataset.paletteType;
      tile.classList.add('is-dragging');
      if (e.dataTransfer) {
        e.dataTransfer.effectAllowed = 'copy';
        try { e.dataTransfer.setData('text/plain', paletteDragType); } catch (err) { /* noop */ }
      }
    });

    document.addEventListener('dragend', function () {
      paletteDragType = null;
      document.querySelectorAll('[data-palette-type].is-dragging').forEach(function (el) { el.classList.remove('is-dragging'); });
      const wrap = $('#canvasWrap');
      if (wrap) wrap.classList.remove('is-drop');
    });

    document.addEventListener('dragover', function (e) {
      if (!paletteDragType) return;
      const wrap = e.target.closest('#canvasWrap');
      if (!wrap) return;
      e.preventDefault();
      if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
      wrap.classList.add('is-drop');
    });

    document.addEventListener('dragleave', function (e) {
      const wrap = e.target.closest('#canvasWrap');
      if (!wrap) return;
      if (!e.relatedTarget || !wrap.contains(e.relatedTarget)) wrap.classList.remove('is-drop');
    });

    document.addEventListener('drop', function (e) {
      if (!paletteDragType) return;
      const wrap = e.target.closest('#canvasWrap');
      if (!wrap) return;
      e.preventDefault();
      const stage = $('#canvasStage');
      if (!stage) return;
      const point = canvasPoint(stage, e.clientX, e.clientY);
      const type = paletteDragType;
      paletteDragType = null;
      wrap.classList.remove('is-drop');
      addBlock(type, point.x, point.y);
    });

    /* перетаскивание блока по схеме */
    document.addEventListener('pointerdown', function (e) {
      const group = e.target.closest('[data-cv-block]');
      const stage = e.target.closest('#canvasStage');
      if (!stage) return;
      if (!group) {
        selectedBlockId = null;
        renderCanvasOnly();
        renderCanvasPropsOnly();
        scheduleAside();
        return;
      }
      const block = findBlock(group.dataset.cvBlock);
      if (!block) return;
      e.preventDefault();
      selectedBlockId = block.id;
      nearestPortId = null;
      renderCanvasOnly();
      renderCanvasPropsOnly();
      scheduleAside();
      const point = canvasPoint(stage, e.clientX, e.clientY);
      canvasDrag = {
        id: block.id,
        stage: stage,
        offsetX: block.x - point.x,
        offsetY: block.y - point.y,
        moved: false,
        startX: e.clientX,
        startY: e.clientY
      };
      try { stage.setPointerCapture(e.pointerId); } catch (err) { /* noop */ }
    });

    document.addEventListener('pointermove', function (e) {
      if (!canvasDrag) return;
      const block = findBlock(canvasDrag.id);
      const stage = canvasDrag.stage;
      if (!block || !stage) return;
      const point = canvasPoint(stage, e.clientX, e.clientY);
      if (Math.abs(e.clientX - canvasDrag.startX) + Math.abs(e.clientY - canvasDrag.startY) > 2) canvasDrag.moved = true;
      block.x = Math.min(910, Math.max(90, point.x + canvasDrag.offsetX));
      block.y = Math.min(D.CANVAS.maxY, Math.max(D.CANVAS.minY, point.y + canvasDrag.offsetY));
      block.length = Math.max(0.5, Math.min(8, lengthFromGeometry(block)));
      nearestPortId = null;
      let bestPort = 60;
      state.blocks.forEach(function (candidate) {
        if (candidate.id === block.id || isBlockDescendant(candidate.id, block.id)) return;
        const distance = Math.hypot(candidate.x - block.x, blockOuterY(candidate) - block.y);
        if (distance < bestPort) {
          bestPort = distance;
          nearestPortId = candidate.id;
        }
      });
      renderCanvasOnly();
      if (e.cancelable) e.preventDefault();
    });

    document.addEventListener('pointerup', function () {
      if (!canvasDrag) return;
      const drag = canvasDrag;
      const block = findBlock(drag.id);
      canvasDrag = null;
      if (!block) return;
      if (!drag.moved) {
        nearestPortId = null;
        renderCanvasOnly();
        renderCanvasPropsOnly();
        return;
      }
      if (nearestPortId && !isBlockDescendant(nearestPortId, block.id)) {
        block.parentId = nearestPortId;
      } else if (block.parentId && Math.abs(block.y - D.CANVAS.trunkY) < 80) {
        block.parentId = null;
      }
      nearestPortId = null;
      snapBlockGeometry(block);
      syncBlocksAggregate();
      afterChange(true);
    });

    document.addEventListener('pointercancel', function () {
      canvasDrag = null;
      nearestPortId = null;
    });

    document.addEventListener('submit', function (e) {
      const form = e.target.closest('#leadForm');
      if (!form) return;
      e.preventDefault();
      handleLead(form);
    });

    const navToggle = $('#navToggle');
    if (navToggle) {
      navToggle.addEventListener('click', function () {
        const open = document.body.classList.toggle('menu-open');
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
      const palette = e.target.closest('[data-palette-type]');
      if (palette && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        addBlock(palette.dataset.paletteType);
        return;
      }
      const group = e.target.closest('[data-cv-block]');
      if (group && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        selectCanvasBlock(group.dataset.cvBlock);
      }
    });

    window.addEventListener('scroll', function () {
      document.body.classList.toggle('scrolled', window.scrollY > 8);
    }, { passive: true });

    if ('IntersectionObserver' in window) {
      const target = $('#configurator');
      if (target) {
        new IntersectionObserver(function (entries) {
          document.body.classList.toggle('config-inview', entries[0].isIntersecting);
        }, { threshold: 0 }).observe(target);
      }
    }
  }

  function init() {
    const initial = loadInitial();
    state = initial.state;
    step = initial.step;
    lastResult = C.calc(state, D);

    renderTypeCards();
    renderPresets();
    renderStepper();
    renderStep();
    syncStepper();
    updateAside();
    updateMobileBar();
    bind();

    const year = $('#year');
    if (year) year.textContent = String(new Date().getFullYear());

    if (/#cfg=/.test(window.location.hash)) {
      setTimeout(scrollToConfig, 380);
    }

    window.addEventListener('hashchange', function () {
      const match = window.location.hash.match(/#cfg=([A-Za-z0-9_-]+)/);
      if (!match) return;
      try {
        state = D.sanitize(JSON.parse(decodeState(match[1])));
        step = 6;
        renderAll();
        scrollToConfig();
      } catch (err) { /* noop */ }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
