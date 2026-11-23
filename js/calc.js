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
    const sectionInfo = data.SECTIONS.find(function (s) { return s.value === Number(state.section); }) || data.SECTIONS[3];
    const insulation = data.INSULATION[state.insulation] || data.INSULATION.pvc;
    const conductor = data.CONDUCTORS[state.conductor] || data.CONDUCTORS.copper;
    const colors = data.COLORS[state.colorCode] || data.COLORS.din;
    const connector = data.CONNECTORS[state.connectors] || data.CONNECTORS.dt;
    const sleeve = data.SLEEVES[state.sleeve] || data.SLEEVES.none;
    const ip = data.IP[state.ip] || data.IP.ip54;
    const labels = data.LABELS[state.labels] || data.LABELS.none;

    const qty = Number(state.qty) || 1;
    const circuits = Number(state.circuits);
    const length = Number(state.length);
    const branches = Number(state.branches);

    const extras = (Array.isArray(state.extras) ? state.extras : [])
      .map(function (id) { return data.EXTRAS.find(function (e) { return e.id === id; }); })
      .filter(Boolean);

    const extrasCost = extras.reduce(function (sum, item) { return sum + item.price; }, 0);
    const connectorCount = Math.max(2, branches + 2);

    const wireCost = circuits * length * RATES[sectionInfo.value] * insulation.coef * conductor.coef * colors.coef;
    const sheathCost = length * sleeve.price;
    const laborCost = BASE_LABOR + circuits * LABOR_PER_CIRCUIT + branches * LABOR_PER_BRANCH;
    const connectorsCost = connectorCount * connector.price;
    const markingCost = labels.price;
    const core = wireCost + sheathCost + laborCost + connectorsCost + markingCost + extrasCost;

    const factor = type.coef * env.coef * (state.sealed ? SEALED_FACTOR : 1) * ip.coef;
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
      connectorPrice: connector.price,
      maxAmp: sectionInfo.amp,
      wireMeters: Math.round(circuits * length),
      factor: Math.round(factor * 100) / 100,
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
