/* ============================================================
   ЖГУТ.ПРО — расчётная модель
   Чистая функция: состояние + справочники → цена и состав.
   ============================================================ */
(function (global) {
  'use strict';

  /* Ставки подобраны как ориентировочная смета для custom-жгутов
     малой и средней серии. Меняются здесь, логика — нет. */
  const RATES = {
    0.5: 15,
    0.75: 18,
    1: 21,
    1.5: 27,
    2.5: 38,
    4: 54,
    6: 74,
    10: 118,
    16: 180,
    25: 270
  };

  const BASE_LABOR = 2800;
  const LABOR_PER_CIRCUIT = 320;
  const LABOR_PER_BRANCH = 220;
  const BLOCK_SETUP_LABOR = 260;
  const TRUNK_SETUP_LABOR = 400;
  const SEALED_FACTOR = 1.06;

  const QTY_LEAD = { 1: 0, 3: 1, 5: 2, 10: 3, 25: 5, 50: 8 };
  const QTY_DISCOUNT = { 1: 0, 3: 0.05, 5: 0.08, 10: 0.12, 25: 0.18, 50: 0.25 };

  const moneyFormatter = new Intl.NumberFormat('ru-RU');

  function round10(value) {
    return Math.round(value / 10) * 10;
  }

  function pad(value, length) {
    let s = String(value);
    while (s.length < length) s = '0' + s;
    return s;
  }

  function priceCode(state, data) {
    const type = data.TYPES[state.type] || data.TYPES.camper;
    const length = pad(Math.round(Number(state.length) * 10), 3);
    const circuits = pad(Math.round(Number(state.circuits)), 2);
    return 'ZHP-' + type.code + '-' + length + circuits;
  }

  function calc(state, data) {
    const type = data.TYPES[state.type] || data.TYPES.camper;
    const purpose = type.purposes.find(function (p) { return p.id === state.purpose; }) || type.purposes[0];
    const env = data.ENVIRONMENTS[state.environment] || data.ENVIRONMENTS.dry;
    let sectionInfo = data.SECTIONS.find(function (s) { return s.value === Number(state.section); }) || data.SECTIONS[3];
    const insulation = data.INSULATION[state.insulation] || data.INSULATION.pvc;
    const conductor = data.CONDUCTORS[state.conductor] || data.CONDUCTORS.copper;
    const colors = data.COLORS[state.colorCode] || data.COLORS.din;
    const connector = data.CONNECTORS[state.connectors] || data.CONNECTORS.dt;
    const sleeve = data.SLEEVES[state.sleeve] || data.SLEEVES.none;
    const ip = data.IP[state.ip] || data.IP.ip54;
    const labels = data.LABELS[state.labels] || data.LABELS.none;

    const qty = Number(state.qty) || 1;
    const isBlocks = state.mode === 'blocks';
    const extras = (Array.isArray(state.extras) ? state.extras : [])
      .map(function (id) { return data.EXTRAS.find(function (e) { return e.id === id; }); })
      .filter(Boolean);
    const extrasCost = extras.reduce(function (sum, item) { return sum + item.price; }, 0);
    const factor = type.coef * env.coef * (state.sealed ? SEALED_FACTOR : 1) * ip.coef;
    const wireFactor = insulation.coef * conductor.coef * colors.coef;

    let circuits;
    let length;
    let branches;
    let connectorCount;
    let connectorName = connector.name;
    let wireCost;
    let sheathCost;
    let laborCost;
    let connectorsCost;
    let blockCosts = [];
    let trunkCost = 0;
    let maxAmp = sectionInfo.amp;

    if (isBlocks) {
      const trunk = state.trunk && typeof state.trunk === 'object' ? state.trunk : data.defaultTrunk(type.id);
      const trunkSection = data.SECTIONS.find(function (s) { return s.value === Number(trunk.section); }) || data.SECTIONS[3];
      const trunkConnector = data.CONNECTORS[trunk.connector] || connector;
      const trunkCircuits = 2;

      circuits = trunkCircuits;
      length = Number(trunk.length) || 0;
      branches = 0;
      maxAmp = trunkSection.amp;
      const trunkWire = trunkCircuits * length * RATES[trunkSection.value] * wireFactor;
      const trunkSheath = length * sleeve.price;
      const trunkLabor = BASE_LABOR + TRUNK_SETUP_LABOR + trunkCircuits * LABOR_PER_CIRCUIT;
      const trunkConnectors = 2 * trunkConnector.price;

      wireCost = trunkWire;
      sheathCost = trunkSheath;
      laborCost = trunkLabor;
      connectorsCost = trunkConnectors;
      trunkCost = round10((trunkWire + trunkSheath + trunkLabor + trunkConnectors) * factor);

      const used = {};
      const useConnector = function (name, count) { used[name] = (used[name] || 0) + count; };
      useConnector(trunkConnector.name, 2);

      let minSection = trunkSection;
      let maxSection = trunkSection;

      (Array.isArray(state.blocks) ? state.blocks : []).forEach(function (block) {
        const def = data.BLOCKS && data.BLOCKS[block.type];
        if (!def) return;
        const q = Math.max(1, Number(block.qty) || 1);
        const bCircuits = Math.max(1, Number(block.circuits) || def.circuits);
        const bLength = Math.max(0.5, Number(block.length) || def.length);
        const bSection = data.SECTIONS.find(function (s) { return s.value === Number(block.section); }) || trunkSection;
        const bConnector = data.CONNECTORS[block.connector] || connector;

        const bWire = bCircuits * q * bLength * RATES[bSection.value] * wireFactor;
        const bSheath = bLength * q * sleeve.price;
        const bLabor = bCircuits * q * LABOR_PER_CIRCUIT + q * LABOR_PER_BRANCH + q * BLOCK_SETUP_LABOR;
        const bConnectors = q * bConnector.price;

        wireCost += bWire;
        sheathCost += bSheath;
        laborCost += bLabor;
        connectorsCost += bConnectors;
        circuits += bCircuits * q;
        length += bLength * q;
        branches += q;
        maxAmp = Math.max(maxAmp, bSection.amp);
        if (bSection.value < minSection.value) minSection = bSection;
        if (bSection.value > maxSection.value) maxSection = bSection;
        useConnector(bConnector.name, q);

        blockCosts.push({
          id: block.id,
          total: round10((bWire + bSheath + bLabor + bConnectors) * factor)
        });
      });

      connectorCount = 2 + branches;
      connectorName = Object.keys(used).map(function (name) { return name + ' × ' + used[name]; }).join(', ');
      sectionInfo = {
        label: minSection.value === maxSection.value ? minSection.label : minSection.label.replace(' мм²', '') + '–' + maxSection.label,
        amp: maxAmp,
        value: maxSection.value
      };
    } else {
      circuits = Number(state.circuits);
      length = Number(state.length);
      branches = Number(state.branches);
      connectorCount = Math.max(2, branches + 2);
      wireCost = circuits * length * RATES[sectionInfo.value] * wireFactor;
      sheathCost = length * sleeve.price;
      laborCost = BASE_LABOR + circuits * LABOR_PER_CIRCUIT + branches * LABOR_PER_BRANCH;
      connectorsCost = connectorCount * connector.price;
    }

    const markingCost = labels.price;
    const core = wireCost + sheathCost + laborCost + connectorsCost + markingCost + extrasCost;

    const priceOne = round10(core * factor);
    const discount = QTY_DISCOUNT[qty] || 0;
    const priceUnit = round10(priceOne * (1 - discount));
    const total = priceUnit * qty;

    const leadDays = 7 +
      Math.ceil(circuits / 8) +
      (branches > 6 ? 1 : 0) +
      (extras.some(function (e) { return e.id === 'drawing'; }) ? 2 : 0) +
      (QTY_LEAD[qty] || 0);

    const weight = Math.round((circuits * length * 0.011 + connectorCount * 0.035 + 0.45) * 10) / 10;

    return {
      code: priceCode(state, data),
      priceOne: priceOne,
      priceUnit: priceUnit,
      total: total,
      discount: discount,
      savings: Math.max(0, priceOne * qty - total),
      leadDays: leadDays,
      weight: weight,
      connectorCount: connectorCount,
      connectorName: connectorName,
      connectorPrice: connector.price,
      maxAmp: sectionInfo.amp,
      wireMeters: Math.round(circuits * length),
      factor: Math.round(factor * 100) / 100,
      isBlocks: isBlocks,
      blockCosts: blockCosts,
      trunkCost: trunkCost,
      trunk: isBlocks ? state.trunk : null,
      components: {
        wire: wireCost,
        sheath: sheathCost,
        labor: laborCost,
        connectors: connectorsCost,
        marking: markingCost,
        extras: extrasCost,
        core: core,
        execution: priceOne - core
      },
      extras: extras,
      qty: qty,
      type: type,
      purpose: purpose,
      environment: env,
      section: sectionInfo,
      insulation: insulation,
      conductor: conductor,
      colors: colors,
      connector: connector,
      sleeve: sleeve,
      ip: ip,
      labels: labels
    };
  }

  function formatMoney(value) {
    return moneyFormatter.format(Math.round(value)) + ' ₽';
  }

  const API = { calc: calc, priceCode: priceCode, formatMoney: formatMoney, RATES: RATES };
  global.HARNESS_CALC = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
