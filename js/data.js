/* ============================================================
   ЖГУТ.ПРО — справочные данные конфигуратора
   Всё, что можно менять без правки логики: типы техники,
   назначения, материалы, разъёмы, опции, скидки, пресеты.
   ============================================================ */
(function (global) {
  'use strict';

  /* ---------- типы техники ---------- */
  const TYPES = {
    yacht: {
      id: 'yacht',
      name: 'Яхта',
      code: 'Y',
      accent: '#2F8F86',
      coef: 1.24,
      desc: 'Соль, влага и УФ. Лужёная медь, герметичные разъёмы и защита, которой не страшна открытая палуба.',
      purposes: [
        {
          id: 'y-main', name: 'Главный моторный жгут',
          desc: 'Питание, запуск, приборы и заряд. Основной ствол от АКБ до панели.',
          circuits: 24, length: 8, branches: 4, environment: 'engine', voltage: 12,
          section: 2.5, sealed: true, ip: 'ip67', sleeve: 'pe', connectors: 'dt', conductor: 'tinned',
          extras: ['fuse', 'drawing', 'test']
        },
        {
          id: 'y-panel', name: 'Жгут панели приборов',
          desc: 'Панель, переключатели, индикация и сигналы управления.',
          circuits: 16, length: 3.5, branches: 3, environment: 'dry', voltage: 12,
          section: 1, sealed: true, ip: 'ip67', sleeve: 'pe', connectors: 'dt', conductor: 'tinned',
          extras: ['drawing', 'test']
        },
        {
          id: 'y-light', name: 'Жгут освещения и палубы',
          desc: 'Ходовые огни, палубный свет, подсветка и наружные потребители.',
          circuits: 20, length: 12, branches: 6, environment: 'damp', voltage: 12,
          section: 1.5, sealed: true, ip: 'ip67', sleeve: 'pu', connectors: 'superseal', conductor: 'tinned',
          extras: ['fuse', 'drawing']
        },
        {
          id: 'y-bilge', name: 'Жгут трюмных систем',
          desc: 'Трюмные насосы, датчики, осушитель и аварийная сигнализация.',
          circuits: 12, length: 6, branches: 4, environment: 'bilge', voltage: 12,
          section: 2.5, sealed: true, ip: 'ip68', sleeve: 'pu', connectors: 'dt', conductor: 'tinned',
          extras: ['fuse', 'drawing', 'test', 'antichafe']
        },
        {
          id: 'y-power', name: 'Силовой жгут 12/24 В',
          desc: 'АКБ, инвертор, зарядное устройство и силовые магистрали.',
          circuits: 8, length: 5, branches: 2, environment: 'engine', voltage: 24,
          section: 16, sealed: true, ip: 'ip67', sleeve: 'heat', connectors: 'anderson', conductor: 'tinned',
          extras: ['fuse', 'drawing', 'test']
        }
      ]
    },

    camper: {
      id: 'camper',
      name: 'Автодом',
      code: 'C',
      accent: '#C18432',
      coef: 1.06,
      desc: 'Жилая зона и шасси. Предсказуемая разводка, реле и предохранители, сервисные разъёмы для доработок.',
      purposes: [
        {
          id: 'c-living', name: 'Жилая зона 12 В',
          desc: 'Свет, розетки, кухня, отопление — вся жилая зона одним жгутом.',
          circuits: 28, length: 7, branches: 6, environment: 'dry', voltage: 12,
          section: 1.5, sealed: true, ip: 'ip54', sleeve: 'pe', connectors: 'superseal', conductor: 'copper',
          extras: ['fuse', 'relay', 'drawing', 'test']
        },
        {
          id: 'c-chassis', name: 'Шасси и задние фонари',
          desc: 'Шасси, задние фонари, сигнал D+ и адаптер штатной проводки.',
          circuits: 16, length: 9, branches: 4, environment: 'damp', voltage: 12,
          section: 1.5, sealed: true, ip: 'ip67', sleeve: 'pe', connectors: 'dt', conductor: 'copper',
          extras: ['fuse', 'drawing', 'test']
        },
        {
          id: 'c-solar', name: 'Солнечная система и заряд',
          desc: 'Панели, MPPT, DC-DC и зарядные линии жилой АКБ.',
          circuits: 10, length: 4, branches: 2, environment: 'damp', voltage: 12,
          section: 4, sealed: true, ip: 'ip67', sleeve: 'pu', connectors: 'anderson', conductor: 'copper',
          extras: ['fuse', 'drawing', 'test', 'emi']
        },
        {
          id: 'c-water', name: 'Вода, отопление и датчики',
          desc: 'Насос, бойлер, отопитель и датчики уровней.',
          circuits: 14, length: 6, branches: 5, environment: 'damp', voltage: 12,
          section: 1, sealed: true, ip: 'ip67', sleeve: 'pe', connectors: 'superseal', conductor: 'copper',
          extras: ['fuse', 'drawing']
        },
        {
          id: 'c-panel', name: 'Панель управления',
          desc: 'Пульт, индикация, выключатели и шина управления.',
          circuits: 18, length: 2.5, branches: 3, environment: 'dry', voltage: 12,
          section: 0.75, sealed: false, ip: 'ip54', sleeve: 'pe', connectors: 'dt', conductor: 'copper',
          extras: ['drawing', 'test']
        }
      ]
    },

    car: {
      id: 'car',
      name: 'Автомобиль',
      code: 'A',
      accent: '#B65F2C',
      coef: 0.96,
      desc: 'Моторный отсек и салон. Термостойкая изоляция, компактные разъёмы и защита от вибрации.',
      purposes: [
        {
          id: 'a-engine', name: 'Подкапотный жгут',
          desc: 'Датчики, форсунки, зажигание, вентилятор и питание.',
          circuits: 30, length: 5, branches: 5, environment: 'engine', voltage: 12,
          section: 1.5, sealed: true, ip: 'ip67', sleeve: 'pe', connectors: 'dt', conductor: 'copper',
          extras: ['fuse', 'drawing', 'test']
        },
        {
          id: 'a-cabin', name: 'Салонный жгут',
          desc: 'Свет, стеклоподъёмники, аудио, климат и комфорт.',
          circuits: 24, length: 4.5, branches: 5, environment: 'dry', voltage: 12,
          section: 0.75, sealed: false, ip: 'ip54', sleeve: 'pe', connectors: 'mx150', conductor: 'copper',
          extras: ['drawing', 'test']
        },
        {
          id: 'a-light', name: 'Освещение и фонари',
          desc: 'Головной свет, задние фонари, поворотники и сигналы.',
          circuits: 18, length: 6.5, branches: 6, environment: 'damp', voltage: 12,
          section: 1, sealed: true, ip: 'ip67', sleeve: 'pe', connectors: 'superseal', conductor: 'copper',
          extras: ['fuse', 'drawing', 'test']
        },
        {
          id: 'a-extra', name: 'Жгут допоборудования',
          desc: 'Лебёдка, доп. свет, компрессор, камеры и аксессуары.',
          circuits: 12, length: 4, branches: 3, environment: 'dry', voltage: 12,
          section: 2.5, sealed: false, ip: 'ip54', sleeve: 'spiral', connectors: 'mx150', conductor: 'copper',
          extras: ['fuse', 'drawing']
        },
        {
          id: 'a-trailer', name: 'Жгут прицепа',
          desc: 'Габариты, стопы, повороты, задний ход и заряд прицепа.',
          circuits: 13, length: 7, branches: 2, environment: 'damp', voltage: 12,
          section: 1.5, sealed: true, ip: 'ip67', sleeve: 'pe', connectors: 'superseal', conductor: 'copper',
          extras: ['drawing', 'test']
        }
      ]
    }
  };

  /* ---------- условия эксплуатации ---------- */
  const ENVIRONMENTS = {
    dry: {
      name: 'Сухой отсек', short: 'Салон, рубка, багажник',
      desc: 'Нет прямого контакта с водой и маслом.',
      coef: 1, hint: 'Обычно достаточно IP54 и ПВХ-изоляции.'
    },
    damp: {
      name: 'Влажная зона', short: 'Кухня, санузел, палуба',
      desc: 'Конденсат, брызги, перепады температур.',
      coef: 1.08, hint: 'Рекомендуем IP67 и защиту от УФ.'
    },
    engine: {
      name: 'Моторный отсек', short: 'Тепло, масло, вибрация',
      desc: 'Повышенная температура и агрессивная среда.',
      coef: 1.16, hint: 'Рекомендуем XLPE, гофру ПУ и хомуты через 250 мм.'
    },
    bilge: {
      name: 'Трюм / открытая палуба', short: 'Вода, соль, УФ',
      desc: 'Постоянная влажность, солевой туман, солнце.',
      coef: 1.26, hint: 'Рекомендуем IP68, лужёную медь и плетёную оплётку.'
    }
  };

  /* ---------- сечения ---------- */
  const SECTIONS = [
    { value: 0.5, label: '0,5 мм²', amp: 6, use: 'сигнальные' },
    { value: 0.75, label: '0,75 мм²', amp: 8, use: 'управление' },
    { value: 1, label: '1,0 мм²', amp: 11, use: 'свет, сигналы' },
    { value: 1.5, label: '1,5 мм²', amp: 16, use: 'освещение, насосы' },
    { value: 2.5, label: '2,5 мм²', amp: 22, use: 'розетки, силовые' },
    { value: 4, label: '4,0 мм²', amp: 30, use: 'инверторы' },
    { value: 6, label: '6,0 мм²', amp: 40, use: 'заряд, магистрали' },
    { value: 10, label: '10 мм²', amp: 55, use: 'силовые линии' },
    { value: 16, label: '16 мм²', amp: 75, use: 'АКБ, стартер' },
    { value: 25, label: '25 мм²', amp: 100, use: 'силовые вводы' }
  ];

  /* ---------- материалы ---------- */
  const INSULATION = {
    pvc: { name: 'ПВХ / FLRY-B', temp: '−40…+105 °C', coef: 1, desc: 'Универсальный стандарт для авто и автодомов.' },
    xlpe: { name: 'XLPE / сшитый ПЭ', temp: '−55…+125 °C', coef: 1.18, desc: 'Стойкость к перегреву и старению.' },
    silicone: { name: 'Силикон', temp: '−60…+180 °C', coef: 1.45, desc: 'Гибкость на морозе, высокая термостойкость.' },
    pur: { name: 'PUR / полиуретан', temp: '−50…+90 °C', coef: 1.3, desc: 'Истирание, масло, УФ и постоянная влага.' }
  };

  const CONDUCTORS = {
    copper: { name: 'Медь', desc: 'Стандартная токопроводящая жила.', coef: 1 },
    tinned: { name: 'Лужёная медь', desc: 'Защита от коррозии для моря и влажных зон.', coef: 1.07 }
  };

  const COLORS = {
    din: { name: 'DIN 47100', desc: 'Стандартная цветовая маркировка жил.', coef: 1 },
    mono: { name: 'Монохром + номера', desc: 'Белая изоляция, номер на каждом проводе.', coef: 1.03 },
    custom: { name: 'По схеме заказчика', desc: 'Цвета и номера под ваш проект.', coef: 1.06 }
  };

  /* ---------- разъёмы ---------- */
  const CONNECTORS = {
    dt: { name: 'Deutsch DT', desc: '2–12 контактов, до 13 А', note: 'IP67, вибростойкий', short: 'IP67 · вибро', price: 780, amp: 13 },
    dtm: { name: 'Deutsch DTM', desc: '2–12 контактов, до 7,5 А', note: 'Компактный, IP67', short: 'IP67 · мини', price: 640, amp: 7.5 },
    superseal: { name: 'Superseal 1.5', desc: '2–6 контактов, до 14 А', note: 'Компактный, IP67', short: 'IP67 · компакт', price: 420, amp: 14 },
    mx150: { name: 'Molex MX150', desc: '2–12 контактов, до 22 А', note: 'Автомобильный, IP67', short: 'IP67 · авто', price: 520, amp: 22 },
    m12: { name: 'M12 / датчики', desc: '4–8 контактов, до 4 А', note: 'IP67/68, промышленный', short: 'IP67/68 · датчики', price: 1350, amp: 4 },
    anderson: { name: 'Anderson SB50', desc: '2 контакта, до 50 А', note: 'Силовое подключение', short: 'до 50 А · силовой', price: 980, amp: 50 },
    lugs: { name: 'Наконечники и гильзы', desc: 'Силовые и сервисные концы', note: 'Под опрессовку', short: 'опрессовка', price: 70, amp: 100 }
  };

  /* ---------- защита ---------- */
  const SLEEVES = {
    none: { name: 'Без защиты', desc: 'Только маркировка и стяжки.', price: 0 },
    pe: { name: 'Гофра ПЭ', desc: 'Лёгкая, бюджетная, −40…+90 °C.', price: 45 },
    pu: { name: 'Гофра ПУ', desc: 'Стойкая к истиранию и маслу.', price: 72 },
    spiral: { name: 'Спиральная обмотка', desc: 'Гибкая, удобно добавлять ветви.', price: 95 },
    braid: { name: 'Плетёная оплётка', desc: 'Защита от трения и УФ, премиум.', price: 150 },
    heat: { name: 'Термоусадка', desc: 'Герметичные переходы и концы.', price: 115 }
  };

  const IP = {
    ip54: { name: 'IP54', desc: 'Пыль и брызги', coef: 1 },
    ip67: { name: 'IP67', desc: 'Кратковременное погружение', coef: 1.06 },
    ip68: { name: 'IP68', desc: 'Длительное погружение', coef: 1.12 }
  };

  const LABELS = {
    none: { name: 'Без маркировки', desc: 'Только цветовая маркировка.', price: 0 },
    numbered: { name: 'Номера на проводах', desc: 'Печатные номера, стойкие к маслу.', price: 1200 },
    thermal: { name: 'Термобирки', desc: 'Код цепи на обоих концах, как в схеме.', price: 1800 }
  };

  /* ---------- опции ---------- */
  const EXTRAS = [
    { id: 'fuse', name: 'Блок предохранителей', desc: 'Держатели ATO/MIDI и диагностика', price: 3800 },
    { id: 'relay', name: 'Реле и колодки', desc: 'Силовые цепи под ключ', price: 2900 },
    { id: 'drawing', name: 'Комплект КД', desc: 'Схема, pinout и спецификация', price: 4500 },
    { id: 'test', name: 'Протокол испытаний', desc: 'Прозвонка, изоляция, полярность', price: 2800 },
    { id: 'emi', name: 'Экранирование EMI', desc: 'Для сигнальных и CAN-линий', price: 3200 },
    { id: 'antichafe', name: 'Антифрикционная защита', desc: 'Ленты и рукава в точках трения', price: 1600 },
    { id: 'spare', name: 'Запас длины +10%', desc: 'На укладку и сервис', price: 1200 },
    { id: 'fire', name: 'Огнестойкое исполнение', desc: 'Материалы класса UL94 V-0', price: 2900 },
    { id: 'pack', name: 'Упаковка и маркировка', desc: 'Бирки, пакет, транспортная коробка', price: 900 }
  ];

  /* ---------- партии ---------- */
  const QTY_OPTIONS = [
    { value: 1, discount: 0 },
    { value: 3, discount: 0.05 },
    { value: 5, discount: 0.08 },
    { value: 10, discount: 0.12 },
    { value: 25, discount: 0.18 },
    { value: 50, discount: 0.25 }
  ];

  /* ---------- готовые пресеты ---------- */
  const PRESETS = [
    {
      id: 'p-yacht',
      type: 'yacht',
      purpose: 'y-bilge',
      badge: 'Морское исполнение',
      title: 'Яхта · палуба и трюм',
      desc: 'Жгут для насосов, датчиков и палубного света. Рассчитан на соль, влагу и УФ.',
      chips: ['IP68', 'Лужёная медь', 'Плетёная оплётка'],
      overrides: {
        length: 10, circuits: 18, branches: 6, sleeve: 'braid',
        extras: ['fuse', 'drawing', 'test', 'antichafe', 'emi']
      }
    },
    {
      id: 'p-camper',
      type: 'camper',
      purpose: 'c-living',
      badge: 'Для автодома',
      title: 'Автодом · жилая зона 12 В',
      desc: 'Свет, розетки, кухня и отопление. С реле, предохранителями и маркировкой под схему.',
      chips: ['32 цепи', 'Реле и предохранители', 'Сервисные разъёмы'],
      featured: true,
      overrides: {
        length: 8.5, circuits: 32, branches: 7, sleeve: 'pu',
        extras: ['fuse', 'relay', 'drawing', 'test']
      }
    },
    {
      id: 'p-car',
      type: 'car',
      purpose: 'a-engine',
      badge: 'Под ключ',
      title: 'Авто · подкапотный жгут',
      desc: 'Термостойкий жгут для датчиков и силовых цепей. С экранированием и полным комплектом КД.',
      chips: ['34 цепи', 'XLPE', 'Схема и pinout'],
      overrides: {
        length: 5.5, circuits: 34, branches: 5, insulation: 'xlpe',
        extras: ['fuse', 'drawing', 'test', 'emi']
      }
    }
  ];

  const CONTACTS = {
    phone: '+7 (495) 120-45-90',
    phoneHref: 'tel:+74951204590',
    email: 'hello@zhgut.pro',
    city: 'Москва, ул. Складочная, 1, стр. 18',
    hours: 'Пн–Пт, 9:00–18:00'
  };

  /* ---------- состояние по умолчанию ---------- */
  const DEFAULT_TYPE = 'yacht';
  const DEFAULT_PURPOSE = 'y-main';

  function clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function roundHalf(v) {
    return Math.round(v * 2) / 2;
  }

  function pickPurpose(purpose) {
    return {
      circuits: purpose.circuits,
      length: purpose.length,
      branches: purpose.branches,
      environment: purpose.environment,
      voltage: purpose.voltage,
      section: purpose.section,
      sealed: purpose.sealed,
      ip: purpose.ip,
      sleeve: purpose.sleeve,
      connectors: purpose.connectors,
      conductor: purpose.conductor,
      extras: (purpose.extras || []).slice()
    };
  }

  function presetState(typeId, purposeId) {
    const type = TYPES[typeId] || TYPES[DEFAULT_TYPE];
    const purpose = type.purposes.find(function (p) { return p.id === purposeId; }) || type.purposes[0];
    return Object.assign({}, pickPurpose(purpose), {
      type: type.id,
      purpose: purpose.id,
      qty: 1,
      insulation: 'pvc',
      colorCode: 'din',
      labels: 'thermal',
      comment: ''
    });
  }

  function sanitize(raw) {
    const src = raw && typeof raw === 'object' ? raw : {};
    const typeId = TYPES[src.type] ? src.type : DEFAULT_TYPE;
    const type = TYPES[typeId];
    const purposeOk = type.purposes.some(function (p) { return p.id === src.purpose; });
    const purposeId = purposeOk ? src.purpose : type.purposes[0].id;
    const base = presetState(typeId, purposeId);
    const s = Object.assign({}, base, src, { type: typeId, purpose: purposeId });

    s.qty = QTY_OPTIONS.some(function (q) { return q.value === Number(s.qty); }) ? Number(s.qty) : 1;
    s.voltage = [12, 24, 48].indexOf(Number(s.voltage)) >= 0 ? Number(s.voltage) : base.voltage;
    s.length = clamp(roundHalf(Number(s.length) || base.length), 1, 30);
    s.circuits = clamp(Math.round(Number(s.circuits) || base.circuits), 4, 64);
    s.branches = clamp(Math.round(Number(s.branches) || 0), 0, 12);
    if (!ENVIRONMENTS[s.environment]) s.environment = base.environment;
    if (!SECTIONS.some(function (x) { return x.value === Number(s.section); })) s.section = base.section;
    else s.section = Number(s.section);
    if (!INSULATION[s.insulation]) s.insulation = 'pvc';
    if (!CONDUCTORS[s.conductor]) s.conductor = base.conductor;
    if (!COLORS[s.colorCode]) s.colorCode = 'din';
    if (!CONNECTORS[s.connectors]) s.connectors = base.connectors;
    if (!SLEEVES[s.sleeve]) s.sleeve = base.sleeve;
    if (!IP[s.ip]) s.ip = base.ip;
    if (!LABELS[s.labels]) s.labels = 'thermal';
    s.sealed = Boolean(s.sealed);
    s.extras = Array.isArray(s.extras)
      ? s.extras.filter(function (id) { return EXTRAS.some(function (e) { return e.id === id; }); })
      : base.extras.slice();
    s.comment = String(s.comment || '').slice(0, 500);
    delete s.comments;
    return s;
  }

  const API = {
    TYPES: TYPES,
    ENVIRONMENTS: ENVIRONMENTS,
    SECTIONS: SECTIONS,
    INSULATION: INSULATION,
    CONDUCTORS: CONDUCTORS,
    COLORS: COLORS,
    CONNECTORS: CONNECTORS,
    SLEEVES: SLEEVES,
    IP: IP,
    LABELS: LABELS,
    EXTRAS: EXTRAS,
    QTY_OPTIONS: QTY_OPTIONS,
    PRESETS: PRESETS,
    CONTACTS: CONTACTS,
    presetState: presetState,
    sanitize: sanitize
  };

  global.HARNESS_DATA = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
