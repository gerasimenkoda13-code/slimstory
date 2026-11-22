'use strict';
// ---------- помощники ----------
const $ = s => document.querySelector(s);
const I = n => !n ? 'icons/pack.svg' : (typeof IMG !== 'undefined' && IMG[n]) || ('img/' + n + '.webp');
const N = x => Math.round(x).toLocaleString('ru-RU');
const W1 = x => (+x).toFixed(1).replace('.', ',');
const D1 = x => (Math.round(x * 10) / 10).toLocaleString('ru-RU');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const q = s => esc(JSON.stringify(s)); // для аргументов в onclick

const SV = (p, c = '#6b6385', w = 2.4, s = 22, fill = 'none') => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="${fill}" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
const IC = {
  back: SV('<path d="M15 5l-7 7 7 7"/>', '#2a2340', 2.6, 20),
  chev: SV('<path d="M9 5l7 7-7 7"/>', '#a49dbb', 2.6, 16),
  plus: (c = '#7c5cff', s = 18) => SV('<path d="M12 5v14M5 12h14"/>', c, 3, s),
  x: (c = '#e2577f', s = 12) => SV('<path d="M6 6l12 12M18 6L6 18"/>', c, 3, s),
  heart: on => SV('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>', '#e2577f', 2.4, 16, on ? '#e2577f' : 'none'),
  search: SV('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>', '#a49dbb', 2.6, 20),
  plate: (c = '#fff', s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 48 48" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="26" cy="26" r="14"/><circle cx="26" cy="26" r="7"/><path d="M6 8v10a3 3 0 0 0 3 3v19M9 8v8M12 8v10a3 3 0 0 1-3 3"/></svg>`,
  cam: (c = '#fff', s = 20) => `<svg width="${s}" height="${s}" viewBox="0 0 48 48" fill="none" stroke="${c}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"><path d="M8 17a4 4 0 0 1 4-4h4l3-4h10l3 4h4a4 4 0 0 1 4 4v15a4 4 0 0 1-4 4H12a4 4 0 0 1-4-4z"/><circle cx="24" cy="24" r="6.5"/></svg>`,
  mic: (c = '#fff', s = 24) => SV('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>', c, 2.4, s),
  pen: (c = '#a49dbb', s = 18) => SV('<path d="M4 20h4L19 9l-4-4L4 16z"/>', c, 2.2, s),
  check: (c = '#159a6a', s = 14) => SV('<path d="M5 12l5 5 9-10"/>', c, 3, s),
  fork: SV('<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 3-3 7h3v11"/>', '#7c5cff', 2.4, 18),
  pin: SV('<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>', '#7c5cff', 2.4, 18),
  send: SV('<path d="M4 12l16-8-6 16-2-7z"/>', '#fff', 2.4, 22),
  home: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
  book: '<rect x="5" y="4" width="14" height="16" rx="3"/><path d="M5 14h14"/>',
  leaf: '<path d="M5 20c0-9 6-15 15-15 0 9-6 15-15 15z"/><path d="M5 20l8-8"/>',
  chart: '<path d="M5 20V10M10 20V5M15 20v-8M20 20H3"/>',
};
const FRIDGE = SV('<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M6 9.5h12M9 5.5v2M9 12.5v3"/>', '#7c5cff', 2.2, 18);
const MI = {
  sun:'<circle cx="24" cy="24" r="8"/><path d="M24 6v5M24 37v5M6 24h5M37 24h5M11.3 11.3l3.5 3.5M33.2 33.2l3.5 3.5M11.3 36.7l3.5-3.5M33.2 14.8l3.5-3.5"/>',
  bowl:'<path d="M8 24h32a16 16 0 0 1-32 0z"/><path d="M19 10c-2 3 2 5 0 8M27 10c-2 3 2 5 0 8"/>',
  moon:'<path d="M34 30A14 14 0 0 1 20 10a14 14 0 1 0 14 20z"/>',
  cookie:'<circle cx="24" cy="24" r="15"/><circle cx="19" cy="20" r="1.8" fill="currentColor"/><circle cx="28" cy="27" r="1.8" fill="currentColor"/><circle cx="20" cy="30" r="1.8" fill="currentColor"/><circle cx="29" cy="18" r="1.4" fill="currentColor"/>',
};
const mic = (m, s = 26) => `<svg viewBox="0 0 48 48" width="${s}" height="${s}" fill="none" stroke="${m.col}" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round" style="color:${m.col}">${MI[m.ic]}</svg>`;

const WD = ['Вс','Пн','Вт','Ср','Чт','Пт','Сб'];
const WDF = ['Воскресенье','Понедельник','Вторник','Среда','Четверг','Пятница','Суббота'];
const MON = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const MONS = ['янв','февр','марта','апр','мая','июня','июля','авг','сент','окт','нояб','дек'];
const pad = n => String(n).padStart(2, '0');
const dk = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const kd = k => { const [y, m, d] = k.split('-').map(Number); return new Date(y, m - 1, d); };
const addD = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const TODAY = dk(new Date());
const GL = () => Math.max(50, Math.round((S.waterGoal || 2000) / 8 / 10) * 10); // стакан = норма / 8
const dTitle = k => { const d = kd(k); return `${WD[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]}`; };

// ---------- данные пользователя ----------
const KEY = 'slimstory-v1';
let S;
function fresh() {
  // профиль из анкеты (start.html)
  let P = null; try { P = JSON.parse(localStorage.getItem('ss_start') || 'null'); } catch (e) {}
  P = P || {};
  const w = +P.w || 70, tw = P.goal === 'down' || P.goal === 'up' ? (+P.tw || w) : w, n = P.norm || {kc: 1800, p: 110, f: 60, c: 200};
  return {
    name: P.name || 'Я', login: '', ava: {t: 'l'},
    goal: {k: n.kc, p: n.p, f: n.f, c: n.c, w: tw, start: w},
    bjuMode: 'g', mealsOn: {b: 1, l: 1, d: 1, s: 1}, sync: {apple: 0, android: 0}, glass: 250, waterGoal: P.water || 2000,
    favs: [], rfav: [], my: [], recent: [],
    rover: {}, myRecipes: [], days: {}, weights: [{d: TODAY, w}], diet: null, dEdit: {},
    home: [],
    prefs: {type: ['Обычное'], no: (P.allergy || []).slice()}, remind: 3,
  };
}
function blank() { return {meals: {b: [], l: [], d: [], s: []}, ml: 0}; }
function load() { try { S = JSON.parse(localStorage.getItem(KEY)); } catch (e) { S = null; } if (!S || !S.days) S = fresh(); S.rfold = S.rfold || []; S.collMy = S.collMy || {}; }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} if (typeof Cloud !== 'undefined') Cloud.queue(); }
function day(k) { return S.days[k] || (S.days[k] = blank()); }
function entryF(f, g, extra) { const r = g / 100; return Object.assign({n: f.mk ? `${f.n} «${f.mk}»` : f.n, i: f.i, g, k: f.k * r, p: f.p * r, f: f.f * r, c: f.c * r}, f.kind ? {kind: f.kind, pid: f.id} : {}, extra || {}); }
function sumE(list) { return list.reduce((a, e) => ({k: a.k + e.k, p: a.p + e.p, f: a.f + e.f, c: a.c + e.c}), {k: 0, p: 0, f: 0, c: 0}); }
function dayTot(k) { const d = day(k); return sumE([].concat(...MEALS.map(m => d.meals[m.id] || []))); }

// ---------- поиск: ё = е, похожие написания (choco pie = чокопай) ----------
const nz = s => String(s || '').toLowerCase().replace(/ё/g, 'е').replace(/[«»"'`.,!?()%\-–—_/]+/g, ' ').replace(/\s+/g, ' ').trim();
const TRL = {а:'a',б:'b',в:'v',г:'g',д:'d',е:'e',ж:'7',з:'z',и:'i',й:'y',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'h',ц:'c',ч:'4',ш:'6',щ:'6',ъ:'',ы:'y',ь:'',э:'e',ю:'u',я:'a'};
function sk(s) { // «скелет» слова: латиница, без гласных и пробелов
  let t = nz(s).replace(/[а-я]/g, c => TRL[c] ?? c);
  t = t.replace(/sch/g, '6').replace(/tch|ch/g, '4').replace(/sh/g, '6').replace(/zh|j/g, '7').replace(/ph/g, 'f').replace(/ck|q/g, 'k').replace(/x/g, 'ks').replace(/w/g, 'v')
    .replace(/c(?=[eiy])/g, 's').replace(/c/g, 'k').replace(/kh/g, 'h').replace(/\s/g, '').replace(/(.)\1+/g, '$1').replace(/[aeiouy]/g, '');
  return t;
}
function fits(name, q) { // подходит ли название под запрос
  const a = nz(name), b = nz(q); if (!b) return true; if (a.includes(b)) return true;
  if (b.replace(/\s/g, '').length < 4) return false;
  const kb = sk(b); if (kb.length >= 3 && sk(a).includes(kb)) return true;
  return wordsFit(a, sk(a), b);
}
// каждое слово запроса — по написанию или по звучанию: «данон творог» = «Danone Творог»
function wordsFit(h, hs, b) {
  const W = b.split(' '); if (W.length < 2) return false;
  return W.every(w => h.includes(w) || (w.length >= 4 && (k => k.length >= 2 && hs.includes(k))(sk(w))));
}
const hay = f => (f.mk ? f.mk + ' ' : '') + f.n;
let sel = TODAY; // выбранный день на главной

// ---------- оболочка ----------
let STK = ['home'];
const app = () => $('#app');
function go(h) { STK.push(h.replace(/^#\//, '')); onRoute(); }
function root(h) { STK = [h.replace(/^#\//, '')]; onRoute(); }
function back(n = 1) { STK.splice(Math.max(1, STK.length - n)); onRoute(); }
function onRoute() { if (route()[0] !== 'add') addQ = ''; if (route()[0] !== 'bar' && route()[0] !== 'label') barStop(); render(); }
function toast(t) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = t; $('#phone').appendChild(d); setTimeout(() => d.remove(), 2300); }
// плавная перерисовка: меняем только то, что поменялось (без моргания)
function morph(a, b) {
  if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName) { a.replaceWith(b.cloneNode(true)); return; }
  if (a.nodeType === 3 || a.nodeType === 8) { if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue; return; }
  if (a.nodeType !== 1) return;
  for (const at of [...a.attributes]) if (!b.hasAttribute(at.name)) a.removeAttribute(at.name);
  for (const at of [...b.attributes]) if (a.getAttribute(at.name) !== at.value) a.setAttribute(at.name, at.value);
  if (a.nodeName === 'INPUT' || a.nodeName === 'TEXTAREA') { const v = b.getAttribute('value') ?? ''; if (a !== document.activeElement && a.value !== v) a.value = v; if (a.type === 'checkbox') a.checked = b.hasAttribute('checked'); }
  const A = [...a.childNodes], B = [...b.childNodes];
  B.forEach((n, i) => { if (A[i]) morph(A[i], n); else a.appendChild(n.cloneNode(true)); });
  for (let i = B.length; i < A.length; i++) A[i].remove();
}
function htmlEl(html, tag = 'div') { const t = document.createElement(tag); t.innerHTML = html; return t; }
function sheet(html, cls = '') {
  const cur = document.querySelector('.sheet:not(.out)');
  if (cur) {
    const nw = htmlEl(`<div class="grab"></div>${html}`), t1 = cur.querySelector('.sh b'), t2 = nw.querySelector('.sh b');
    cur.className = `sheet ${cls}`; cur.style.animation = 'none';
    if (t1 && t2 && t1.textContent === t2.textContent) morph(cur, Object.assign(nw, {className: cur.className}), true);
    else { cur.innerHTML = nw.innerHTML; cur.scrollTop = 0; }
    cur.setAttribute('style', 'animation:none'); return;
  }
  const ph = $('#phone'); ph.insertAdjacentHTML('beforeend', `<div class="dim" onclick="closeSheet()"></div><div class="sheet ${cls}"><div class="grab"></div>${html}</div>`);
}
function closeSheet(now) {
  document.querySelectorAll('.dim:not(.out),.sheet:not(.out)').forEach(e => { if (now) { e.remove(); return; } e.classList.add('out'); setTimeout(() => e.remove(), 230); });
}
function nav(active) {
  const items = [['#/home', IC.home], ['#/recipes', IC.book], ['#/diets', IC.leaf], ['#/reports', IC.chart]];
  return `<div class="fadeb"></div><div class="nav">${items.map(([h, p], i) => `<button class="${i === active ? 'on' : ''}" onclick="root('${h}')" aria-label="${['Главная','Рецепты','Диеты','Отчёты'][i]}">${SV(p, i === active ? '#7c5cff' : '#6b6385', 2.2, 24)}</button>`).join('')}</div>
  <button class="bigplus" id="bp" onclick="togglePlus()" aria-label="Добавить">${IC.plus('#fff', 30)}</button>`;
}
const topb = (t, s = '', right = '<div style="width:42px"></div>') => `<div class="top"><button class="back" onclick="back()" aria-label="Назад">${IC.back}</button><div class="ttl"><b>${t}</b>${s ? `<small>${s}</small>` : ''}</div>${right}</div>`;
function avaHTML(size = 46, fs = 18) {
  const a = S.ava || {t: 'l'};
  if (a.t === 'p') return `<div class="ava" style="width:${size}px;height:${size}px"><img src="${a.v}" alt=""></div>`;
  if (a.t === 'i') return `<div class="ava pic" style="width:${size}px;height:${size}px"><img src="${I(a.v)}" alt=""></div>`;
  return `<div class="ava" style="width:${size}px;height:${size}px;font-size:${fs}px">${esc((S.name || '?')[0].toUpperCase())}</div>`;
}
const pic = (i, n, s = 44) => i ? `<div class="ico" style="width:${s}px;height:${s}px"><img src="${I(i)}" style="width:${s - 4}px;height:${s - 4}px" alt=""></div>` : `<div class="ico" style="width:${s}px;height:${s}px"><span>${esc(n[0])}</span></div>`;

// ---------- главная ----------
function gauge(v, max) {
  const r = 92, cx = 110, cy = 108, L = Math.PI * r, pr = Math.min(v / max, 1);
  return `<svg width="220" height="120" viewBox="0 0 220 120"><defs><linearGradient id="gg" x1="0" x2="1"><stop offset="0" stop-color="#8b6cff"/><stop offset="1" stop-color="#4fd1b0"/></linearGradient></defs>
  <path d="M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}" fill="none" stroke="#efe9ff" stroke-width="18" stroke-linecap="round"/>
  <path d="M${cx - r},${cy} A${r},${r} 0 0 1 ${cx + r},${cy}" fill="none" stroke="${v > max ? '#e2577f' : 'url(#gg)'}" stroke-width="18" stroke-linecap="round" stroke-dasharray="${L}" stroke-dashoffset="${L * (1 - pr)}" style="transition:stroke-dashoffset .5s"/></svg>`;
}
const L1 = ml => (ml / 1000).toLocaleString('ru-RU', {maximumFractionDigits: 2});
function glassImg(fill) { return fill <= 0 ? 'glass_0' : fill < .375 ? 'glass_25' : fill < .625 ? 'glass_50' : fill < .875 ? 'glass_75' : 'glass_100'; }
function trItems(k, kind) { const d = day(k), out = []; MEALS.forEach(m => (d.meals[m.id] || []).forEach((e, j) => { if (e.kind === kind) out.push({e, m: m.id, j}); })); return out; }
function trRow(kind) {
  const eaten = trItems(sel, kind), def = TR_DEF[kind];
  const cells = def.map((pid, i) => {
    if (i < eaten.length) {
      const x = eaten[i], more = i === 4 && eaten.length > 5 ? `<span class="more">+${eaten.length - 5}</span>` : '';
      return `<button onclick="prodInfo('${x.m}',${x.j})" aria-label="${esc(x.e.n)}"><img src="${I(x.e.i)}" class="${popT === kind && i === eaten.length - 1 ? 'pop' : ''}" alt="${esc(x.e.n)}">${more}</button>`;
    }
    return `<button onclick="prodPick('${kind}')" aria-label="Добавить"><img src="${I(PD[pid].i + '_dim')}" alt=""></button>`;
  }).join('');
  return `<div class="trow">${cells}<button class="tplus" onclick="prodPick('${kind}')" aria-label="Добавить">${IC.plus('#7c5cff', 18)}</button></div>`;
}
function scrHome() {
  const d = day(sel), t = dayTot(sel), G = S.goal, now = kd(sel);
  const mon = addD(now, -((now.getDay() + 6) % 7));
  const days = [...Array(7)].map((_, i) => { const x = addD(mon, i), k = dk(x); return `<button class="${k === sel ? 'on' : ''} ${k === TODAY ? 'today' : ''}" onclick="sel='${k}';render()"><small>${WD[x.getDay()]}</small><b>${x.getDate()}</b></button>`; }).join('');
  const left = G.k - t.k;
  const bj = (key, lbl, v, g, bg, col, bar) => {
    const val = S.bjuMode === 'p' ? `${Math.round(v / g * 100)} %` : `${Math.round(v)} / ${g} г`;
    return `<button class="bj" style="background:${bg}" onclick="macroSheet('${key}')"><small style="color:${col}">${lbl}</small><b style="color:${col}">${val}</b><div class="bar"><i style="width:${Math.min(v / g * 100, 100)}%;background:${bar}"></i></div></button>`;
  };
  const meals = MEALS.filter(m => S.mealsOn[m.id]).map(m => {
    const Lm = d.meals[m.id] || [], s = sumE(Lm);
    const sub = Lm.length ? Lm.map(e => e.n).join(', ') : `Рекомендуется ${m.rec} ккал`;
    return `<button class="meal" onclick="go('#/add/${m.id}')"><div class="mi" style="background:${m.bg}">${mic(m)}</div><div class="mt"><b>${m.n}</b><small>${esc(sub)}</small></div>${Lm.length ? `<span class="mk">${N(s.k)} ккал</span>` : `<span class="pbtn">${IC.plus()}</span>`}</button>`;
  }).join('');
  const n = 8, gl = GL(), ml = d.ml || 0;
  const glasses = [...Array(n)].map((_, i) => `<button onclick="tapWater(${i})" aria-label="Стакан ${i + 1}"><img src="${I(glassImg((ml - i * gl) / gl))}" class="${popW && i === Math.ceil(ml / gl) - 1 ? 'pop' : ''}" alt=""></button>`).join('');
  const out = `<div class="scr anim" id="sc">
  <div class="hello"><div><small>${WDF[now.getDay()]}, ${now.getDate()} ${MON[now.getMonth()]}</small><b>Привет, ${esc(S.name)}!</b></div><div style="display:flex;gap:10px;align-items:center"><button class="calbtn ${calOpen ? 'on' : ''}" onclick="calOpen=!calOpen;calM=sel.slice(0,7);render(true)" aria-label="Календарь">${SV('<rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/><circle cx="8" cy="14" r=".6" fill="currentColor"/><circle cx="12" cy="14" r=".6" fill="currentColor"/><circle cx="16" cy="14" r=".6" fill="currentColor"/><circle cx="8" cy="17" r=".6" fill="currentColor"/><circle cx="12" cy="17" r=".6" fill="currentColor"/>', calOpen ? '#fff' : '#7c5cff', 2.2, 22)}</button><button onclick="go('#/me')" aria-label="Я">${avaHTML(46)}</button></div></div>
  ${calOpen ? calHTML() : ''}
  <div class="days" style="${calOpen ? 'display:none' : ''}"><button class="arr" onclick="sel=dk(addD(kd(sel),-7));render()" aria-label="Прошлая неделя">${SV('<path d="M15 5l-7 7 7 7"/>', '#7c5cff', 2.8, 16)}</button>${days}<button class="arr" onclick="sel=dk(addD(kd(sel),7));render()" aria-label="Следующая неделя">${SV('<path d="M9 5l7 7-7 7"/>', '#7c5cff', 2.8, 16)}</button></div>
  ${sel !== TODAY ? `<button class="totoday" onclick="sel=TODAY;render()">Вернуться к сегодня</button>` : ''}
  <div class="card kc-card"><div class="gauge">${gauge(t.k, G.k)}<div class="num"><b>${N(t.k)}</b><small>из ${N(G.k)} ккал</small></div></div>
  <span class="left ${left < 0 ? 'over' : ''}">${left >= 0 ? `Осталось ${N(left)} ккал` : `Больше нормы на ${N(-left)} ккал`}</span>
  <div class="bju">${bj('p', 'Белки', t.p, G.p, '#ffe8dc', '#c4561c', '#f39a6b')}${bj('f', 'Жиры', t.f, G.f, '#ece6ff', '#6a4be0', '#8b6cff')}${bj('c', 'Углеводы', t.c, G.c, '#dcf7ec', '#159a6a', '#3cc48f')}</div></div>
  <div class="sec">Приёмы пищи</div>${meals}
  <div class="sec">Ежедневные трекеры</div>
  <div class="trk"><div class="trh"><h3>Вода</h3><button class="wl" onclick="waterSheet()">${L1(ml)} из ${L1(S.waterGoal)} л ${IC.pen('#7c5cff', 13)}</button></div>
  <div class="trow w">${glasses}<button class="tplus w" onclick="addWater(${gl})" aria-label="Добавить ${gl} мл">${IC.plus('#7c5cff', 18)}<small>${gl} мл</small></button></div></div>
  <div class="trk"><h3>Овощи</h3>${trRow('veg')}</div>
  <div class="trk"><h3>Фрукты</h3>${trRow('fruit')}</div>
  </div>${nav(0)}`;
  popW = 0; popT = '';
  return out;
}
let popW = 0, popT = '';
function tapWater(i) {
  const d = day(sel), g = GL(), ml = d.ml || 0;
  d.ml = ml >= (i + 1) * g && ml < (i + 2) * g ? i * g : (i + 1) * g;
  popW = 1; save(); render(true);
}
function addWater(v) { const d = day(sel); d.ml = Math.max(0, (d.ml || 0) + v); popW = 1; save(); toast(`Вода: ${L1(d.ml)} л`); if (route()[0] === 'home') render(true); }
function waterSheet() {
  const d = day(sel); let v = d.ml || 0;
  window._wv = x => { v = Math.max(0, x); $('#wv').value = v; };
  sheet(`<div class="sh"><img src="${I('glass_100')}" alt=""><div><b>Вода</b><small>сколько выпила за день</small></div></div>
  <div class="big-in"><input id="wv" type="number" inputmode="numeric" value="${v}" oninput="v=+this.value||0"><span>мл</span></div>
  <div class="presets">${[20, 50, 100, 250, 500].map(x => `<button class="pill" onclick="_wv((+$('#wv').value||0)+${x})">+${x}</button>`).join('')}<button class="pill" onclick="_wv((+$('#wv').value||0)-50)">−50</button></div>
  <div style="padding:18px 20px 0"><button class="btn" onclick="day(sel).ml=Math.max(0,+$('#wv').value||0);save();closeSheet();render(true)">Сохранить</button></div>`);
}
function macroSheet(key) {
  const nm = {p: 'Белки', f: 'Жиры', c: 'Углеводы'}[key], col = {p: '#f39a6b', f: '#8b6cff', c: '#3cc48f'}[key];
  const d = day(sel), all = [];
  MEALS.forEach(m => (d.meals[m.id] || []).forEach(e => all.push({e, m})));
  all.sort((a, b) => b.e[key] - a.e[key]);
  const tot = all.reduce((a, x) => a + x.e[key], 0), mx = all.length ? all[0].e[key] || 1 : 1;
  sheet(`<div class="sh"><div><b>${nm}: ${N(tot)} из ${S.goal[key]} г</b><small>больше всего дали</small></div></div>
  <div class="card" style="padding-top:2px;padding-bottom:2px">${all.length ? all.map(({e, m}) => `<div class="ing">${pic(e.i, e.n, 40)}<div class="nm"><b>${esc(e.n)}</b><small>${m.n} · ${N(e.g)} г</small><div class="bar" style="height:6px;margin-top:5px"><i style="width:${e[key] / mx * 100}%;background:${col}"></i></div></div><div class="kc">${D1(e[key])} г</div></div>`).join('') : '<div class="empty" style="margin:14px">Пока ничего не съедено</div>'}</div>`);
}

// ---------- календарь ----------
let calOpen = false, calM = TODAY.slice(0, 7);
const MONN = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
function calHTML() {
  const [y, m] = calM.split('-').map(Number), first = new Date(y, m - 1, 1), start = addD(first, -((first.getDay() + 6) % 7));
  const cells = [...Array(42)].map((_, i) => { const x = addD(start, i), k = dk(x), inM = x.getMonth() === m - 1, has = S.days[k] && dayTot(k).k > 0;
    return `<button class="cd ${inM ? '' : 'out'} ${k === sel ? 'on' : ''} ${k === TODAY ? 'today' : ''}" onclick="sel='${k}';calOpen=false;render()">${x.getDate()}${has ? '<i></i>' : ''}</button>`; }).join('');
  return `<div class="card cal"><div class="calh"><button class="rb" onclick="calShift(-1)" aria-label="Прошлый месяц">${SV('<path d="M15 5l-7 7 7 7"/>', '#7c5cff', 2.8, 16)}</button><b>${MONN[m - 1]} ${y}</b><button class="rb" onclick="calShift(1)" aria-label="Следующий месяц">${SV('<path d="M9 5l7 7-7 7"/>', '#7c5cff', 2.8, 16)}</button></div>
  <div class="calg">${['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => `<small>${d}</small>`).join('')}${cells}</div>
  <button class="totoday" onclick="sel=TODAY;calOpen=false;render()">Сегодня</button></div>`;
}
function calShift(d) { const [y, m] = calM.split('-').map(Number), x = new Date(y, m - 1 + d, 1); calM = `${x.getFullYear()}-${pad(x.getMonth() + 1)}`; render(true); }

// ---------- овощи и фрукты ----------
let PK = null;
function prodPick(kind, qq = '') {
  PK = {kind, q: qq};
  const L = PRODUCE.filter(x => x.kind === kind && fits(x.n, qq));
  sheet(`<div class="sh"><div><b>${kind === 'veg' ? 'Какой овощ?' : 'Какой фрукт или ягоду?'}</b></div></div>
  <div class="search" style="margin-top:12px">${IC.search}<input id="pq" placeholder="Найти или написать свой" value="${esc(qq)}" oninput="prodFilter(this.value)"></div>
  <div class="pgrid" id="pg">${prodGrid(L)}</div>
  <div style="padding:14px 20px 0"><button class="btn w" onclick="prodOwn()">${IC.pen('#7c5cff', 16)}&nbsp;Свой вариант</button></div>`, 'tall');
}
function prodGrid(L) { return L.length ? L.map(x => `<button class="pcell" onclick="prodQty('${x.id}')"><div class="circ"><img src="${I(x.i)}" alt=""></div><span>${x.n}</span></button>`).join('') : '<div class="empty" style="grid-column:1/-1">Не нашлось. Нажми «Свой вариант»</div>'; }
function prodFilter(v) { $('#pg').innerHTML = prodGrid(PRODUCE.filter(x => x.kind === PK.kind && fits(x.n, v))); }
function prodQty(id) {
  const x = PD[id]; let g = x.g;
  const draw = () => { const r = g / 100; $('#pt').innerHTML = totHTML({k: x.k * r, p: x.p * r, f: x.f * r, c: x.c * r}); };
  window._pg = v => { g = Math.max(0, +v || 0); draw(); };
  sheet(`<div class="sh"><img src="${I(x.i)}" alt=""><div><b>${x.n}</b><small>${x.u} ≈ ${x.g} г</small></div></div>
  <div class="big-in"><input type="number" inputmode="numeric" value="${g}" oninput="_pg(this.value)"><span>г</span></div>
  <div class="muted" style="text-align:center;margin-top:6px">не знаешь вес — оставь как есть</div>
  <div class="tot" id="pt"></div>
  <div style="padding:18px 20px 0"><button class="btn" id="pa">Добавить в перекус</button></div>`);
  draw();
  $('#pa').onclick = () => { day(sel).meals.s.push(entryF(x, g)); popT = x.kind; save(); closeSheet(); toast(`${x.n}: ${N(x.k * g / 100)} ккал, в перекусе`); render(true); };
}
function prodOwn() {
  const kind = PK.kind, nm = ($('#pq') && $('#pq').value.trim()) || '';
  sheet(`<div class="sh"><div><b>Свой ${kind === 'veg' ? 'овощ' : 'фрукт'}</b></div></div>
  <div style="padding:14px 20px 0;display:flex;flex-direction:column;gap:10px"><div class="search" style="margin:0"><input id="on" placeholder="Название" value="${esc(nm)}"></div>
  <div class="search" style="margin:0"><input id="og" type="number" inputmode="numeric" placeholder="Граммы (можно не писать)"></div>
  <button class="btn" onclick="prodOwnSave('${kind}')">Добавить в перекус</button></div>`);
}
function prodOwnSave(kind) {
  const n = $('#on').value.trim(); if (!n) { toast('Напиши название'); return; }
  const g = +$('#og').value || (kind === 'veg' ? 120 : 150);
  const base = kind === 'veg' ? {k: 25, p: 1.2, f: 0.2, c: 5} : {k: 50, p: 0.7, f: 0.3, c: 11};
  day(sel).meals.s.push(entryF(Object.assign({id: 'own', n, i: TR_DEF[kind][0] === 'carrot' ? 'tr_carrot' : 'tr_apple', kind}, base), g));
  popT = kind; save(); closeSheet(); toast(`${n} добавлен в перекус`); render(true);
}
function prodInfo(m, j) {
  const e = day(sel).meals[m][j];
  sheet(`<div class="sh"><img src="${I(e.i)}" alt=""><div><b>${esc(e.n)}</b><small>${N(e.g)} г · ${MEALS.find(x => x.id === m).n}</small></div></div>
  <div class="tot">${totHTML(e)}</div><div style="display:flex;gap:10px;padding:18px 20px 0"><button class="btn w" onclick="day(sel).meals['${m}'].splice(${j},1);save();closeSheet();render(true)">Убрать</button><button class="btn" onclick="closeSheet()">Готово</button></div>`);
}

// ---------- меню + ----------
function togglePlus() {
  const ov = $('.plus-ov');
  if (ov) { closePlus(true); return; }
  const big = MEALS.map(m => `<button onclick="closePlus();go('#/add/${m.id}')"><div class="circ"><img src="${I(m.img)}" alt=""></div><span>${m.n}</span></button>`);
  $('#phone').insertAdjacentHTML('beforeend', `<div class="plus-ov" onclick="if(event.target===this)closePlus(true)"><div class="plus-panel">
  <div class="title">Что добавить?</div>
  <div class="arc s"><button class="circ" onclick="closePlus();weightSheet()" aria-label="Вес"><img src="${I('scale')}" alt=""></button><button class="circ" onclick="closePlus();addWater(${GL()})" aria-label="Вода"><img src="${I('glass_100')}" alt=""></button><button class="circ" onclick="closePlus();prodPick('fruit')" aria-label="Фрукты"><img src="${I('tr_apple')}" alt=""></button></div>
  <div class="b2">${big[0]}${big[1]}</div><div class="b2">${big[2]}${big[3]}</div>
  <div class="ic2"><button class="circ" onclick="closePlus();photoFood()" aria-label="Фото еды">${IC.plate('#fff', 24)}</button><button class="circ" onclick="closePlus();go('#/scan')" aria-label="Скриншот">${IC.cam('#fff', 24)}</button><button class="circ" onclick="closePlus();go('#/assistant')" aria-label="Голосом">${IC.mic('#fff', 24)}</button></div>
  </div></div>`);
  $('#bp').classList.add('x');
}
function closePlus(anim) {
  const ov = $('.plus-ov'), b = $('#bp'); if (b) b.classList.remove('x');
  if (!ov) return;
  if (anim) { ov.classList.add('out'); setTimeout(() => ov.remove(), 220); } else ov.remove();
}

// ---------- добавить еду ----------
let addTab = 0, addQ = '';
function myFoods() { return S.my.concat(FOODS.filter(f => f.brand)); }
function scrAdd(m) {
  const M = MEALS.find(x => x.id === m) || MEALS[0], L = day(sel).meals[M.id], s = sumE(L);
  const tabs = ['Недавние', 'Избранное', 'Продукты', 'Рецепты'];
  return `<div class="scr anim" style="padding-bottom:110px">${topb(M.n, dTitle(sel))}
  <div class="search">${IC.search}<input id="fq" placeholder="Найти продукт или марку" value="${esc(addQ)}" oninput="addQ=this.value;$('#fl').innerHTML=foodList('${M.id}')"><button class="cam" onclick="go('#/bar')" aria-label="Сфоткать этикетку">${IC.cam()}</button></div>
  <button class="rowlink" onclick="photoFood('${M.id}')"><span class="ci">${IC.plate('#7c5cff', 20)}</span><b>Фото еды</b><span>сфоткай тарелку</span>${IC.chev}</button>
  <button class="rowlink" onclick="go('#/cafe/${M.id}')"><span class="ci">${IC.fork}</span><b>Кафе и рестораны</b><span>меню с КБЖУ</span>${IC.chev}</button>
  <div class="tabs">${tabs.map((t, i) => `<button class="tab ${i === addTab ? 'on' : ''}" onclick="addTab=${i};addQ='';render(true)">${t}</button>`).join('')}</div>
  <div class="sum">Добавлено ${M.v}<span>${N(s.k)} ккал</span></div>
  <div class="added">${L.map((e, j) => `<div>${e.i ? `<img src="${I(e.i)}" alt="">` : ''}${esc(e.n)} · ${N(e.k)}<button onclick="delE('${M.id}',${j})" aria-label="Убрать">${IC.x()}</button></div>`).join('')}</div>
  <div id="fl">${foodList(M.id)}</div></div>
  <div class="fadeb"></div><div class="btns"><button class="btn" onclick="root('#/home')">Готово</button></div>`;
}
function foodTile(f, m) {
  const fav = S.favs.includes(f.id), src = f.brand === 'с упаковки' ? '<span class="src u">с упаковки</span>' : f.brand === 'изменено' ? '<span class="src e">изменено</span>' : '';
  return `<div class="tile" onclick="qtySheet('${f.id}','${m}')"><div class="cp">${src}<img src="${I(f.i)}" alt=""><button class="heart" onclick="event.stopPropagation();favF('${f.id}')" aria-label="Избранное">${IC.heart(fav)}</button></div><b>${esc(f.n)}</b><small>${f.mk ? `<span class="mk">${esc(f.mk)}</span> · ` : ''}${f.pn} · ${f.por} г</small><div class="tk"><span>${N(f.k * f.por / 100)} ккал</span><span class="pbtn">${IC.plus()}</span></div></div>`;
}
function foodList(m) {
  const qq = addQ.trim().toLowerCase();
  if (addTab === 3 && !qq) {
    const R = S.myRecipes;
    return `<div class="grid">${R.map(r => recTile(r, m)).join('')}</div>`;
  }
  let L;
  if (qq) L = FOODS.concat(PRODUCE, S.my).filter(f => fits(hay(f), qq));
  else if (addTab === 0) L = S.recent.map(id => FD[id] || S.my.find(x => x.id === id)).filter(Boolean);
  else if (addTab === 1) L = S.favs.map(id => FD[id] || S.my.find(x => x.id === id)).filter(Boolean);
  else L = S.my.concat(FOODS, PRODUCE);
  let base = '';
  if (qq) {
    if (!OFF) offLoad().then(() => { const fl = $('#fl'); if (fl && addQ.trim().toLowerCase() === qq) fl.innerHTML = foodList(m); });
    const have = new Set(L.map(f => f.code).filter(Boolean)), B = offSearch(qq).filter(f => !have.has(f.code));
    if (B.length) base = `<div class="sec" style="margin-left:0;margin-right:0">Из базы товаров<span>Open Food Facts</span></div><div class="grid">${B.map(f => foodTile(f, m)).join('')}</div>`;
    else if (!OFF) base = `<div class="empty">Ищу в базе товаров…</div>`;
  }
  if (!L.length && !base) return `<div class="empty">${qq ? 'Ничего не нашлось. Отсканируй штрихкод или перепиши с упаковки' : addTab === 1 ? 'Нажми сердечко на продукте, и он появится здесь' : 'Пока пусто'}</div>`;
  return (L.length ? `<div class="grid">${L.map(f => foodTile(f, m)).join('')}</div>` : '') + base;
}
function favF(id) { const j = S.favs.indexOf(id); j >= 0 ? S.favs.splice(j, 1) : S.favs.push(id); save(); const fl = $('#fl'); if (fl) { const m = route()[1]; fl.innerHTML = foodList(m); } }
function delE(m, j) { day(sel).meals[m].splice(j, 1); save(); render(true); }
function findFood(id) { return FD[id] || S.my.find(x => x.id === id) || (typeof OFFC !== 'undefined' && OFFC[id]); }

let QS = null;
function qtySheet(id, m, srcNote) {
  const f = findFood(id); QS = {id, m, mode: 'g', g: f.por, por: 1, note: srcNote || ''}; drawQty();
}
function drawQty() {
  const f = findFood(QS.id), M = MEALS.find(x => x.id === QS.m) || MEALS[0];
  const g = QS.mode === 'p' ? QS.por * f.por : QS.g, r = g / 100;
  const body = QS.mode === 'p'
    ? `<div style="display:flex;justify-content:center;margin-top:18px"><div class="step"><button onclick="QS.por=Math.max(.5,QS.por-.5);drawQty()">−</button><b style="font-size:40px;min-width:70px">${D1(QS.por)}</b><button onclick="QS.por+=.5;drawQty()">+</button></div></div><div class="muted" style="text-align:center;margin-top:6px">${f.pn} = ${f.por} г</div>`
    : `<div class="big-in"><input id="gin" type="number" inputmode="numeric" value="${Math.round(g)}" oninput="QS.g=Math.max(0,+this.value||0);updQty()"><span>г</span></div><div class="muted" style="text-align:center;margin-top:6px" id="qpor">≈ ${D1(g / f.por)} порции</div>
       <div class="presets">${[100, 150, 200, f.por].filter((v, i, a) => a.indexOf(v) === i).map(v => `<button class="pill ${Math.round(g) === v ? 'on' : ''}" onclick="QS.g=${v};drawQty()">${v} г</button>`).join('')}</div>`;
  sheet(`<div class="sh"><img src="${I(f.i)}" alt=""><div><b>${esc(f.n)}</b><small>${f.mk ? esc(f.mk) + ' · ' : ''}${f.pn} = ${f.por} г · ${N(f.k)} ккал в 100 г${QS.note ? ' · ' + QS.note : ''}</small></div></div>
  <div style="padding:14px 20px 0"><div class="seg"><button class="${QS.mode === 'p' ? 'on' : ''}" onclick="QS.mode='p';drawQty()">Порции</button><button class="${QS.mode === 'g' ? 'on' : ''}" onclick="QS.mode='g';QS.g=Math.round(${g});drawQty()">Граммы</button></div></div>
  ${body}<div class="tot" id="qtot">${totHTML({k: f.k * r, p: f.p * r, f: f.f * r, c: f.c * r})}</div>
  <div style="padding:18px 20px 0"><button class="btn" onclick="addQty()">Добавить ${M.v}</button></div>`);
}
function updQty() { const f = findFood(QS.id), r = QS.g / 100; $('#qtot').innerHTML = totHTML({k: f.k * r, p: f.p * r, f: f.f * r, c: f.c * r}); $('#qpor').textContent = `≈ ${D1(QS.g / f.por)} порции`; document.querySelectorAll('.presets .pill').forEach(b => b.classList.toggle('on', parseInt(b.textContent) === QS.g)); }
function totHTML(t) { return `<div class="t k"><b>${N(t.k)}</b><small>ккал</small></div><div class="t p"><b>${N(t.p)}</b><small>белки</small></div><div class="t f"><b>${N(t.f)}</b><small>жиры</small></div><div class="t c"><b>${N(t.c)}</b><small>углев.</small></div>`; }
function addQty() {
  const f = keepFood(findFood(QS.id)), g = QS.mode === 'p' ? QS.por * f.por : QS.g;
  if (!g) { toast('Укажи вес'); return; }
  QS.id = f.id;
  day(sel).meals[QS.m].push(entryF(f, g));
  S.recent = [QS.id].concat(S.recent.filter(x => x !== QS.id)).slice(0, 12);
  save(); closeSheet(); toast(`Добавлено: ${f.n}, ${N(f.k * g / 100)} ккал`);
  if (route()[0] === 'photo') { FP = null; root('#/home'); } else render(true);
}

// ---------- рецепты ----------
function recipe(id) { return S.myRecipes.find(r => r.id === id) || RECIPES.find(r => r.id === id) || SHARED.find(r => r.id === id); }
function recTot(r, ing) { return (ing || r.ing).reduce((a, x) => { const k = x[2] / 100; return {k: a.k + x[3] * k, p: a.p + x[4] * k, f: a.f + x[5] * k, c: a.c + x[6] * k, g: a.g + x[2]}; }, {k: 0, p: 0, f: 0, c: 0, g: 0}); }
function recTile(r, m) {
  const t = recTot(r), fav = S.rfav.includes(r.id);
  return `<div class="tile" onclick="go('#/recipe/${r.id}${m ? '/' + m : ''}')"><div class="cp"><img src="${I(r.i)}" alt=""><button class="heart" onclick="event.stopPropagation();favR('${r.id}')" aria-label="Избранное">${IC.heart(fav)}</button></div><b>${esc(r.n)}</b><small>${r.t ? r.t + ' · ' : ''}${r.por} ${r.por === 1 ? 'порция' : r.por < 5 ? 'порции' : 'порций'}</small><div class="tk"><span>${N(t.k / r.por)} ккал</span></div>${(r.tags || []).length ? `<div>${r.tags.slice(0, 2).map((x, i) => `<span class="mtag ${i ? 'o' : ''}">${x}</span>`).join('')}</div>` : ''}</div>`;
}
function favR(id) { const j = S.rfav.indexOf(id); j >= 0 ? S.rfav.splice(j, 1) : S.rfav.push(id); save(); render(true); }
let recSeg = 0, recCat = 'Все';
function scrRecipes() {
  let body;
  if (recSeg === 0) {
    let R = S.myRecipes;
    if (recCat === 'Избранное') R = RECIPES.concat(S.myRecipes, sharedList()).filter(r => S.rfav.includes(r.id));
    body = `<div class="chips">${['Все', 'Избранное'].map(c => `<button class="chip ${c === recCat ? 'on' : ''}" onclick="recCat='${c}';render(true)">${c}</button>`).join('')}</div>
    ${recCat === 'Все' ? foldRow() : ''}
    <button class="rowlink" onclick="go('#/home-food')"><span class="ci">${FRIDGE}</span><b>Что есть дома?</b><span>рецепты из твоих продуктов</span>${IC.chev}</button>
    ${R.length ? `${recCat === 'Все' && S.rfold.length ? '<div class="sec">Все рецепты</div>' : ''}<div class="grid">${R.map(r => recTile(r)).join('')}</div>` : '<div class="empty">Здесь пока пусто</div>'}`;
  } else {
    const goals = [['Похудение', 'до 350 ккал', 'Д7_Салат с курицей', '#dcf7ec'], ['Набор мышц', 'много белка', 'Д3_Стейк из говядины', '#ffe8dc'], ['Здоровый кишечник', 'клетчатка', 'Д5_Киноа', '#eef3ff'], ['Без сахара', 'и десерты', 'Д9_Панна-котта', '#ffe3ec'], ['Мало углеводов', 'кето', 'Д4_Лосось запечённый', '#ece6ff'], ['Вегетарианское', 'без мяса', 'Д5_Овощи гриль', '#fff1dc']];
    const how = [['Аэрогриль', 'Д3_Наггетсы'], ['Мультиварка', 'Д3_Плов'], ['Духовка', 'Д3_Курица запечённая'], ['Без масла', 'Д5_Брокколи на пару'], ['Без готовки', 'Д7_Капрезе'], ['Сковорода', 'Д1_Яичница']];
    const block = (title) => { const R = dayMix(collList(title), title); return `<div class="sec">${title === 'Из греческого йогурта' ? 'Топ из греческого йогурта' : title}<button onclick="go('#/coll/${title}')">Все</button></div>
      <div class="grid">${R.slice(0, 4).map(r => recTile(r)).join('')}</div>${R.length > 4 ? `<button class="more-btn" onclick="go('#/coll/${title}')">Показать ещё</button>` : ''}`; };
    const W = weekly(), U = dayMix(usersAll(), 'u');
    body = `<button class="feat" onclick="go('#/coll/Подборка недели')"><small>подборка недели</small><b>${W[0]}</b><span>${collList('Подборка недели').length} рецептов</span><img src="${I(W[2])}" alt=""></button>
    <div class="sec">По цели</div>
    <div class="g2">${goals.map(([a, b, i, bg]) => `<button class="gc" style="background:${bg}" onclick="go('#/coll/${a}')"><b>${a}</b><small>${b}</small><img src="${I(i)}" alt=""></button>`).join('')}</div>
    <div class="sec">От пользователей${U.length ? `<button onclick="go('#/coll/От пользователей')">Все</button>` : ''}</div>
    ${U.length ? `<div class="grid">${U.slice(0, 4).map(r => recTile(r)).join('')}</div>${U.length > 4 ? `<button class="more-btn" onclick="go('#/coll/От пользователей')">Показать ещё</button>` : ''}` : `<div class="hint" style="margin:12px 20px 0">Здесь появятся рецепты, которыми делятся люди. Добавь свой: «Мои рецепты» → «Новый рецепт».</div>`}
    <div class="sec">Как готовить</div>
    <div class="g3">${how.map(([a, i]) => `<button class="how" onclick="go('#/coll/${a}')"><div class="circ"><img src="${I(i)}" alt=""></div><span>${a}</span></button>`).join('')}</div>
    ${block('Завтраки')}${block('Супы')}${block('Из греческого йогурта')}${block('Новинки')}${block('Десерты')}${block('Напитки')}
    <div class="sec">Ещё подборки</div>
    <div class="wrap" style="margin:12px 20px 0">${['За 5 минут', 'До 5 продуктов', 'Заготовки на неделю', 'Бюджетно', 'Без сахара', 'Сковорода'].map(c => `<button class="chip" onclick="go('#/coll/${c}')">${c}</button>`).join('')}</div>`;
  }
  return `<div class="scr anim"><div class="h1">Рецепты</div>
  <div class="search">${IC.search}<input placeholder="Найти рецепт" oninput="recFind(this.value)"></div>
  <div class="seg2"><button class="${recSeg === 0 ? 'on' : ''}" onclick="recSeg=0;render(true)">Мои рецепты</button><button class="${recSeg === 1 ? 'on' : ''}" onclick="recSeg=1;render(true);sharedLoad()">Каталог</button></div>
  <div id="rbody">${body}</div></div>
  ${recSeg === 0 ? `<button class="btn" style="position:absolute;right:20px;bottom:110px;width:auto;padding:0 20px;height:52px;z-index:15;gap:8px" onclick="ED=null;go('#/recnew')">${IC.plus('#fff', 18)}Новый рецепт</button>` : ''}${nav(1)}`;
}
function collList(name) { name = decodeURIComponent(name); if (name === 'От пользователей') return usersAll(); const tag = name === 'Подборка недели' ? weekly()[1] : COLL[name], T = [].concat(tag || []); return S.myRecipes.filter(r => (S.collMy[name] || []).includes(r.id)).concat(RECIPES.filter(r => !tag || (r.tags || []).some(x => T.includes(x)))); }
function recFind(v) {
  const qq = v.trim().toLowerCase(), b = $('#rbody');
  if (!qq) { render(true); return; }
  const R = S.myRecipes.concat(RECIPES, sharedList()).filter(r => fits(r.n, qq));
  b.innerHTML = R.length ? `<div class="grid">${R.map(r => recTile(r)).join('')}</div>` : '<div class="empty">Ничего не нашлось</div>';
}
function scrColl(name) {
  const nm = decodeURIComponent(name), mine = S.myRecipes.filter(r => (S.collMy[nm] || []).includes(r.id)), R = mine.concat(dayMix(collList(name).filter(r => !mine.includes(r)), nm));
  const canAdd = nm !== 'От пользователей';
  return `<div class="scr anim">${topb(decodeURIComponent(name), `${R.length} ${R.length % 10 === 1 && R.length !== 11 ? 'рецепт' : R.length % 10 >= 2 && R.length % 10 <= 4 && (R.length < 12 || R.length > 14) ? 'рецепта' : 'рецептов'}`)}${canAdd ? `<button class="rowlink" onclick="collAddSheet(${q(encodeURIComponent(nm))})"><span class="ci" style="background:#efe9ff">${IC.plus('#6a4be0', 20)}</span><b>Добавить свой рецепт</b><span></span>${IC.chev}</button>` : ''}<div class="grid">${R.map(r => recTile(r)).join('')}</div></div>`;
}
// добавить продукт в рецепт
function ingSheet(target) {
  window._ingT = target;
  const L = Object.keys(ING).filter(k => ING[k][1] > 0);
  sheet(`<div class="sh"><div><b>Добавить продукт</b></div></div>
  <div class="search" style="margin-top:12px">${IC.search}<input id="iq" placeholder="Найти продукт" oninput="$('#il').innerHTML=ingList(this.value)"></div>
  <div class="card" id="il" style="padding-top:2px;padding-bottom:2px">${ingList('')}</div>`, 'tall');
}
function ingList(qq) {
  const L = Object.keys(ING).filter(k => ING[k][1] > 0 && fits(k, qq)), M = S.my.filter(f => fits(hay(f), qq));
  return M.map(f => `<button class="ing" style="width:100%;text-align:left" onclick="ingAddMy('${f.id}')">${pic(f.i, f.n, 40)}<div class="nm"><b>${esc((f.mk ? f.mk + ' ' : '') + f.n)}</b><small>${N(f.k)} ккал в 100 г</small></div><span class="pbtn">${IC.plus()}</span></button>`).join('') + L.map(k => `<button class="ing" style="width:100%;text-align:left" onclick="ingAdd(${q(k)})">${pic(ING[k][0], k, 40)}<div class="nm"><b>${esc(k)}</b><small>${ING[k][1]} ккал в 100 г</small></div><span class="pbtn">${IC.plus()}</span></button>`).join('') || '<div class="empty" style="margin:14px">Не нашлось</div>';
}
function ingAdd(k) {
  const b = ING[k], row = [k, b[0], 100, b[1], b[2], b[3], b[4], b[5] || ''];
  if (window._ingT === 'ed') ED.ing.push(row); else if (window._ingT === 'sc') SC.ing.push(row); else { RC.ing.push(row); RC.changed[RC.ing.length - 1] = 1; }
  closeSheet(); render(true);
}
function ingAddMy(id) {
  const f = S.my.find(x => x.id === id); if (!f) return;
  const row = [(f.mk ? '«' + f.mk + '» ' : '') + f.n, f.i || '', f.por || 100, f.k, f.p, f.f, f.c, 'с упаковки'];
  if (window._ingT === 'ed') ED.ing.push(row); else if (window._ingT === 'sc') SC.ing.push(row); else { RC.ing.push(row); RC.changed[RC.ing.length - 1] = 1; }
  closeSheet(); render(true);
}
function rcDel(j) { RC.ing.splice(j, 1); const c = {}; Object.keys(RC.changed).forEach(x => { x = +x; if (x < j) c[x] = 1; else if (x > j) c[x - 1] = 1; }); RC.changed = c; RC.removed = 1; render(true); }

// шапка таблицы продуктов: столбик граммов и столбик калорий
function ingHead(t, del = 1) { return `<div class="ihd"><b>Продукты</b><span class="hg">${N(t.g)} г</span><span class="hk">${N(t.k)}<small style="display:block;font-size:11px;color:var(--mute)">ккал</small></span>${del ? '<i></i>' : ''}</div>`; }
let RC = null; // открытый рецепт
function scrRecipe(id, m) {
  const r = recipe(id); if (!r) return scrRecipes();
  const mineR = S.myRecipes.includes(r);
  if (!RC || RC.id !== id) RC = {id, n: 1, mode: 'p', g: 0, ing: r.ing.map(x => x.slice()), changed: {}};
  const all = recTot(r, RC.ing), porG = Math.round((S.rover[id] || all.g / r.por));
  const k = RC.mode === 'p' ? RC.n / r.por : (RC.g || porG) / all.g;
  const t = {k: all.k * k, p: all.p * k, f: all.f * k, c: all.c * k};
  const M = MEALS.find(x => x.id === m);
  const rows = ingHead(all) + RC.ing.map((x, j) => `<div class="ing tb">${pic(x[1], x[0], 40)}<div class="nm"><b>${esc(x[0])}</b>${RC.changed[j] ? '<span class="tag e">изменено</span>' : x[7] ? `<span class="tag u">${x[7]}</span>` : ''}</div><label class="g"><input type="number" inputmode="numeric" value="${x[2]}" onchange="rcG(${j},this.value)">г</label><div class="kc">${N(x[3] * x[2] / 100)}</div><button class="del" onclick="rcDel(${j})" aria-label="Убрать">${IC.x()}</button></div>`).join('') + `<button class="add" style="display:flex;gap:8px;align-items:center;color:#7c5cff;font-weight:800;padding-top:10px" onclick="ingSheet('rc')">${IC.plus()} Добавить продукт</button>`;
  return `<div class="scr anim" style="padding-bottom:110px">
  <div class="hero"><button class="back" onclick="RC=null;back()" aria-label="Назад">${IC.back}</button><button class="rb" onclick="favR('${id}')" aria-label="Избранное">${IC.heart(S.rfav.includes(id))}</button><img src="${I(r.i)}" alt=""></div>
  <div class="sheet-top"><div style="padding:16px 20px 0"><div style="font-size:26px;font-weight:900">${esc(r.n)}</div><div class="muted" style="font-size:14px">${r.t ? r.t + ' · ' : ''}${mineR ? 'мой рецепт' : r.shared ? 'от пользователей' : 'каталог'} · на ${r.por} ${r.por === 1 ? 'порцию' : r.por < 5 ? 'порции' : 'порций'}</div></div>
  <div class="tot">${totHTML(t)}</div>
  <div class="card"><div class="seg"><button class="${RC.mode === 'p' ? 'on' : ''}" onclick="RC.mode='p';render(true)">Порции</button><button class="${RC.mode === 'g' ? 'on' : ''}" onclick="RC.mode='g';render(true)">Граммы</button></div>
  <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px">${RC.mode === 'p'
    ? `<div class="step"><button onclick="RC.n=Math.max(.5,RC.n-.5);render(true)">−</button><b>${D1(RC.n)}</b><button onclick="RC.n+=.5;render(true)">+</button></div><button class="pill" style="background:#efe9ff;color:#6a4be0" onclick="porSheet('${id}',${porG})">1 порция = ${porG} г ${IC.pen('#6a4be0', 14)}</button>`
    : `<label class="g" style="font-size:18px;padding:8px 12px"><input type="number" inputmode="numeric" style="width:70px;font-size:18px" value="${RC.g || porG}" onchange="RC.g=+this.value||0;render(true)">г</label><span class="muted">всего блюда ${N(all.g)} г</span>`}</div></div>
  <div class="card" style="padding-top:4px;padding-bottom:6px;margin-top:16px">${rows}</div>
  <div class="muted" style="margin:10px 22px 0;font-size:13px">Сегодня приготовила иначе? Поменяй граммы в списке, и калории пересчитаются только на этот раз.</div>
  ${(r.steps || []).length ? `<div class="sec">Как готовить</div><div class="card" style="display:flex;flex-direction:column;gap:12px">${r.steps.map((x, j) => `<div style="display:flex;gap:12px;align-items:flex-start"><span style="flex:none;width:26px;height:26px;border-radius:50%;background:#efe9ff;color:#6a4be0;font-weight:900;font-size:14px;display:flex;align-items:center;justify-content:center">${j + 1}</span><span style="font-weight:700;font-size:15px;line-height:1.4">${esc(x)}</span></div>`).join('')}</div>` : ''}
  ${mineR ? `<div style="display:flex;gap:10px;margin:14px 20px 0"><button class="btn w" style="flex:1" onclick="ED=null;go('#/recnew/${id}')">${IC.pen('#6a4be0', 16)} Редактировать</button><button class="btn w" style="flex:1;color:#c23a64" onclick="recDel('${id}')">Удалить</button></div><button class="rowlink" onclick="foldFor('${id}')"><span class="ci" style="background:#efe9ff">${SV('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>', '#7c5cff', 2, 20)}</span><b>Папка</b><span>${r.fold ? esc(r.fold) : 'без папки'}</span>${IC.chev}</button>${r.share ? `<div class="muted" style="margin:10px 22px 0;font-size:13px">${r.sent ? 'Рецепт есть в каталоге для всех' : 'Попадёт в каталог, когда войдёшь в аккаунт'}</div>` : ''}` : ''}
  </div></div>
  <div class="btns"><button class="btn w" onclick="${mineR ? `saveRec('${id}')` : `recCopy('${id}')`}">${mineR ? 'Сохранить граммы' : 'В мои рецепты'}</button><button class="btn" onclick="${M ? `addRec('${id}','${m}')` : `mealPick('addRec','${id}')`}">${M ? 'В ' + M.n.toLowerCase() : 'Добавить'}</button></div>`;
}
function rcG(j, v) { RC.ing[j][2] = Math.max(0, +v || 0); RC.changed[j] = 1; render(true); }
function porSheet(id, g) {
  sheet(`<div class="sh"><div><b>Сколько весит 1 порция?</b></div></div><div class="big-in"><input id="pg" type="number" inputmode="numeric" value="${g}"><span>г</span></div><div style="padding:18px 20px 0"><button class="btn" onclick="S.rover['${id}']=+$('#pg').value||${g};save();closeSheet();render(true)">Сохранить</button></div>`);
}
function saveRec(id) { const r = recipe(id); if (!S.myRecipes.includes(r)) return recCopy(id); r.ing = RC.ing.map(x => x.slice()); if (r.share) r.sent = 0; RC.changed = {}; save(); shareSync(); toast('Рецепт сохранён'); render(true); }
function mealPick(fn, arg) {
  sheet(`<div class="sh"><div><b>Куда добавить?</b></div></div><div class="g2" style="margin-top:14px">${MEALS.map(m => `<button class="dl" style="margin:0;width:100%" onclick="closeSheet();${fn}('${arg}','${m.id}')"><div class="mi" style="width:40px;height:40px;border-radius:50%;background:${m.bg};display:flex;align-items:center;justify-content:center">${mic(m, 22)}</div><b>${m.n}</b></button>`).join('')}</div>`);
}
function addRec(id, m) {
  const r = recipe(id), all = recTot(r, RC.ing), porG = S.rover[id] || all.g / r.por;
  const k = RC.mode === 'p' ? RC.n / r.por : (RC.g || porG) / all.g;
  day(sel).meals[m].push({n: r.n, i: r.i, g: all.g * k, k: all.k * k, p: all.p * k, f: all.f * k, c: all.c * k});
  save(); toast(`${r.n} добавлено ${MEALS.find(x => x.id === m).v}`); RC = null; root('#/home');
}

// ---------- что есть дома ----------
// ---------- диеты ----------
let dietLen = 21, dietTag = 'Все';
const lenName = n => { const f = DIET_LEN.find(x => x[0] === n); if (f) return f[1].toLowerCase(); const w = Math.round(n / 7); return `${w} ${w % 10 === 1 && w !== 11 ? 'неделя' : w % 10 >= 2 && w % 10 <= 4 && (w < 12 || w > 14) ? 'недели' : 'недель'}`; };
function scrDiets() {
  const tags = ['Все', 'похудение', 'набор мышц', 'голодание', 'здоровье'];
  const L = DIETS.filter(d => dietTag === 'Все' || d.tag === dietTag);
  const my = S.diet && DIETS.find(d => d.id === S.diet.id);
  return `<div class="scr anim"><div class="h1">Диеты</div>
  <div class="promo"><b>Какая диета тебе подходит?</b><small>6 вопросов · 1 минута</small><br><button onclick="QZ={i:0,a:[]};go('#/quiz')">Пройти тест</button><img src="${I('Д7_Салат из свежих овощей')}" alt=""></div>
  ${my ? `<button class="dl" style="border:2px solid #7c5cff" onclick="go('#/diet/${my.id}')"><div class="im"><img src="${I(my.i)}" alt=""></div><div class="tx"><small>Моя диета</small><b>${my.n}</b><small>день ${S.diet.day} из ${S.diet.len}</small></div>${IC.chev}</button>` : ''}
  <div class="sec">На сколько</div>
  <div class="chips wr">${DIET_LEN.map(([n, t]) => `<button class="chip ${dietLen === n ? 'pri' : ''}" onclick="dietLen=${n};render(true)">${t}</button>`).join('')}<button class="chip ${DIET_LEN.some(x => x[0] === dietLen) ? '' : 'pri'}" onclick="lenSheet()">${DIET_LEN.some(x => x[0] === dietLen) ? 'Свой срок' : lenName(dietLen)}</button></div>
  <div class="sec">Цель</div>
  <div class="chips wr">${tags.map(t => `<button class="chip ${t === dietTag ? 'on' : ''}" onclick="dietTag='${t}';render(true)">${t === 'Все' ? t : t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</div>
  ${L.map(d => `<button class="dl" onclick="go('#/diet/${d.id}')"><div class="im"><img src="${I(d.i)}" alt=""></div><div class="tx"><b>${d.n}</b><small>${lenName(dietLen)} · ~${N(d.kcal)} ккал в день</small><span class="mtag" style="background:${d.tc[0]};color:${d.tc[1]}">${d.tag}</span></div>${IC.chev}</button>`).join('')}
  </div>${nav(2)}`;
}
function lenSheet() {
  let w = Math.max(1, Math.round(dietLen / 7));
  window._lw = x => { w = Math.min(52, Math.max(1, w + x)); $('#lwv').textContent = w; };
  sheet(`<div class="sh"><div><b>Свой срок</b><small>в неделях</small></div></div><div style="display:flex;justify-content:center;margin-top:20px"><div class="step"><button onclick="_lw(-1)">−</button><b id="lwv" style="font-size:40px;min-width:90px">${w}</b><button onclick="_lw(1)">+</button></div></div><div class="muted" style="text-align:center">недель</div>
  <div style="padding:18px 20px 0"><button class="btn" id="lwb">Готово</button></div>`);
  $('#lwb').onclick = () => { dietLen = w * 7; closeSheet(); render(true); };
}
// блюдо плана: r:рецепт, p:овощ/фрукт, f:продукт
function itemInfo(ref, q = 1) {
  const [t, id] = ref.split(':');
  if (t === 'r') { const r = recipe(id), a = recTot(r), z = q / r.por; return {n: r.n, i: r.i, g: a.g * z, k: a.k * z, p: a.p * z, f: a.f * z, c: a.c * z, rid: id}; }
  const f = FD[id], z = q * f.por / 100; return {n: f.n, i: f.i, g: f.por * q, k: f.k * z, p: f.p * z, f: f.f * z, c: f.c * z};
}
function dietPlan(d, dayN) {
  const key = d.id + ':' + dayN;
  if (S.dEdit[key]) return S.dEdit[key];
  const plan = MEALS.filter(m => d.pool[m.id]).map((m, mi) => { const P = d.pool[m.id], x = P[(dayN - 1 + mi * 2) % P.length]; return {m: m.id, ref: x.includes(':') ? x : 'r:' + x, q: 1}; });
  // порции подгоняются так, чтобы день был близок к норме диеты
  const isR = p => p.ref.startsWith('r:'), fix = plan.filter(p => !isR(p)).reduce((a, p) => a + itemInfo(p.ref).k, 0), var_ = plan.filter(isR).reduce((a, p) => a + itemInfo(p.ref).k, 0);
  const f = var_ ? Math.min(2.5, Math.max(.5, (d.kcal - fix) / var_)) : 1;
  plan.forEach(p => { if (isR(p)) p.q = Math.round(f * 4) / 4; });
  return plan;
}
function setPlan(d, dayN, plan) { S.dEdit[d.id + ':' + dayN] = plan; save(); }
let dietDay = 0;
function scrDiet(id) {
  const d = DIETS.find(x => x.id === id), on = S.diet && S.diet.id === id;
  const len = on ? S.diet.len : dietLen, cur = on ? S.diet.day : 1;
  if (!dietDay || dietDay > len) dietDay = cur;
  const plan = dietPlan(d, dietDay), items = plan.map(p => Object.assign({m: p.m, ref: p.ref, extra: p.extra}, itemInfo(p.ref, p.q)));
  const total = items.reduce((a, x) => a + x.k, 0), over = total - d.kcal;
  return `<div class="scr anim" style="padding-bottom:110px">
  <div class="hero" style="height:230px"><button class="back" onclick="dietDay=0;back()" aria-label="Назад">${IC.back}</button><img src="${I(d.i)}" style="width:190px;height:190px;margin-top:20px" alt=""></div>
  <div class="sheet-top"><div style="padding:16px 20px 0"><div style="font-size:24px;font-weight:900">${d.n}</div><div class="muted" style="font-size:14px;margin-top:4px">${d.desc}</div></div>
  <div class="st3"><div><b>${len}</b><small>дней</small></div><div><b>${N(d.kcal)}</b><small>ккал в день</small></div><div><b style="font-size:15px">${d.loss.split(' ')[0]}</b><small>${d.loss.split(' ').slice(1).join(' ')}</small></div></div>
  <div class="sec">${on ? 'Твой план' : 'План по дням'}<span>День ${dietDay} из ${len}</span></div>
  <div class="days" style="justify-content:space-between">${(() => { const w0 = Math.floor((dietDay - 1) / 7) * 7; return `<button class="arr" style="${w0 ? '' : 'opacity:.3'}" onclick="dietDay=Math.max(1,${w0 - 6});render(true)" aria-label="Прошлая неделя">${SV('<path d="M15 5l-7 7 7 7"/>', '#7c5cff', 2.8, 16)}</button>` + [...Array(7)].map((_, i) => { const n = w0 + i + 1; return n > len ? '<button style="visibility:hidden"></button>' : `<button class="${n === dietDay ? 'on' : ''}" style="${on && S.diet.done.includes(n) && n !== dietDay ? 'background:#dcf7ec;color:#159a6a' : ''}" onclick="dietDay=${n};render(true)"><small>день</small><b>${n}</b></button>`; }).join('') + `<button class="arr" style="${w0 + 7 < len ? '' : 'opacity:.3'}" onclick="dietDay=Math.min(${len},${w0 + 8});render(true)" aria-label="Следующая неделя">${SV('<path d="M9 5l7 7-7 7"/>', '#7c5cff', 2.8, 16)}</button>`; })()}</div>
  <div class="card" style="padding-top:4px;padding-bottom:6px">${items.map((x, j) => { const M = MEALS.find(m => m.id === x.m); return `<div class="ing"><button style="display:flex;gap:10px;align-items:center;flex:1;min-width:0;text-align:left" onclick="${x.rid ? `go('#/recipe/${x.rid}')` : `toast('${esc(x.n)}: ${N(x.k)} ккал')`}">${pic(x.i, x.n, 46)}<div class="nm"><small>${M.n}${x.extra ? ' · добавлено' : ''}</small><b>${esc(x.n)}</b><small>${N(x.g)} г${x.rid ? ' · рецепт' : ''}</small></div></button><div class="kc">${N(x.k)} ккал</div><button class="sw2" onclick="swapSheet('${id}',${j})" aria-label="Заменить">${SV('<path d="M4 8h13l-3-3M20 16H7l3 3"/>', '#7c5cff', 2.4, 16)}</button></div>`; }).join('')}
  <button class="add" style="display:flex;gap:8px;align-items:center;color:#7c5cff;font-weight:800;padding-top:10px" onclick="dietAddSheet('${id}')">${IC.plus()} Добавить блюдо</button></div>
  <div class="sec" style="font-size:16px">Итого за день<span style="color:${over > 50 ? '#c23a64' : '#7c5cff'}">${N(total)} из ${N(d.kcal)} ккал</span></div>
  ${over > 50 ? `<div class="hint">Больше плана на ${N(over)} ккал. Замени блюдо на более лёгкое или уменьши порцию.</div>` : ''}
  <div class="muted" style="margin:8px 22px 0;font-size:12.5px">Если есть болезни или беременность, перед диетой посоветуйся с врачом.</div></div></div>
  <div class="btns">${on ? `<button class="btn w" onclick="dietToDay('${id}')">В мой день</button><button class="btn" onclick="dietMark()">Отметить день</button>` : `<button class="btn" onclick="dietStart('${id}')">Начать на ${lenName(dietLen)}</button>`}</div>`;
}
function swapSheet(id, j) {
  const d = DIETS.find(x => x.id === id), plan = dietPlan(d, dietDay).map(x => Object.assign({}, x)), cur = plan[j], ci = itemInfo(cur.ref, cur.q), qOf = ref => ref.startsWith('r:') ? (cur.q || 1) : 1;
  const pool = (d.pool[cur.m] || []).map(x => x.includes(':') ? x : 'r:' + x);
  const alts = [...new Set(pool.concat(['p:banana', 'p:apple', 'p:orange', 'r:r_kefir', 'r:r_capr'].filter(x => !x.startsWith('r:') || recOk(recipe(x.slice(2)), d.rules))))].filter(r => r !== cur.ref), myA = S.myRecipes.map(r => 'r:' + r.id).filter(r => r !== cur.ref);
  const swRow = ref => { const x = itemInfo(ref, qOf(ref)), df = x.k - ci.k; return `<button class="ing" style="width:100%;text-align:left" onclick="_sw('${ref}')">${pic(x.i, x.n, 40)}<div class="nm"><b>${esc(x.n)}</b><small>${N(x.g)} г · ${N(x.k)} ккал</small></div><span class="d ${(G.w > G.start ? df < 0 : df > 0) ? 'up' : ''}">${df > 0 ? '+' : '−'}${N(Math.abs(df))}</span></button>`; };
  window._sw = ref => { plan[j] = {m: cur.m, ref, extra: cur.extra, q: qOf(ref)}; setPlan(d, dietDay, plan); closeSheet(); render(true); };
  window._swDel = () => { plan.splice(j, 1); setPlan(d, dietDay, plan); closeSheet(); render(true); };
  sheet(`<div class="sh"><div><b>Заменить «${esc(ci.n)}»</b><small>сейчас ${N(ci.k)} ккал</small></div></div>
  ${myA.length ? `<div class="sec">Мои рецепты</div><div class="card" style="padding-top:2px;padding-bottom:2px">${myA.map(swRow).join('')}</div><div class="sec">Из диеты</div>` : ''}
  <div class="card" style="padding-top:2px;padding-bottom:2px">${alts.map(swRow).join('')}</div>
  <div style="padding:14px 20px 0"><button class="btn w" onclick="closeSheet();ED=null;go('#/recnew')">${IC.plus()} Создать свой рецепт</button></div>
  <div style="padding:14px 20px 0"><button class="btn w" onclick="_swDel()">Убрать из плана</button></div>`, 'tall');
}
function dietAddSheet(id) {
  const d = DIETS.find(x => x.id === id);
  const refs = ['p:apple', 'p:banana', 'p:mand', 'f:yog', 'f:almond', 'f:capp', 'f:choc', 'r:r_smoo', 'r:r_hum', 'f:pbar', 'f:croiss', 'r:r_tvb'];
  window._dm = 's';
  const daRow = ref => { const x = itemInfo(ref); return `<button class="ing" style="width:100%;text-align:left" onclick="_da('${ref}')">${pic(x.i, x.n, 40)}<div class="nm"><b>${esc(x.n)}</b><small>${N(x.g)} г</small></div><div class="kc">${N(x.k)} ккал</div></button>`; };
  window._da = ref => { const plan = dietPlan(d, dietDay).map(x => Object.assign({}, x)); plan.push({m: window._dm, ref, extra: 1}); setPlan(d, dietDay, plan); closeSheet(); render(true); };
  sheet(`<div class="sh"><div><b>Что ещё съела?</b></div></div>
  <div class="chips wr">${MEALS.map(m => `<button class="chip ${m.id === 's' ? 'pri' : ''}" onclick="_dm='${m.id}';this.parentNode.querySelectorAll('.chip').forEach(c=>c.classList.remove('pri'));this.classList.add('pri')">${m.n}</button>`).join('')}</div>
  ${S.myRecipes.length ? `<div class="sec">Мои рецепты<span>1 порция</span></div><div class="card" style="padding-top:2px;padding-bottom:2px">${S.myRecipes.map(r => 'r:' + r.id).map(daRow).join('')}</div><div class="sec">Быстро добавить</div>` : ''}
  <div class="card" style="padding-top:2px;padding-bottom:2px">${refs.map(daRow).join('')}</div>
  <div style="padding:14px 20px 0"><button class="btn w" onclick="closeSheet();ED=null;go('#/recnew')">${IC.plus()} Создать свой рецепт</button></div>`, 'tall');
}
function dietStart(id, len) { S.diet = {id, len: len || dietLen, day: 1, done: [], since: TODAY}; dietDay = 1; save(); toast('Диета начата. Удачи!'); render(true); }
function dietMark() { const D = S.diet; if (!D.done.includes(D.day)) D.done.push(D.day); if (D.day < D.len) D.day++; dietDay = D.day; save(); toast('День отмечен'); render(true); }
function dietToDay(id) {
  const d = DIETS.find(x => x.id === id);
  dietPlan(d, dietDay).forEach(p => { const x = itemInfo(p.ref, p.q); day(TODAY).meals[p.m].push({n: x.n, i: x.i, g: x.g, k: x.k, p: x.p, f: x.f, c: x.c}); });
  save(); toast('Блюда этого дня добавлены в сегодня');
}
let QZ = {i: 0, a: []};
function scrQuiz() {
  const Q = QUIZ[QZ.i], A = QZ.a[QZ.i] || [];
  return `<div class="scr anim" style="padding-bottom:110px">${topb('Тест', `вопрос ${QZ.i + 1} из ${QUIZ.length}`)}<div class="prog"><i style="width:${(QZ.i + 1) / QUIZ.length * 100}%"></i></div>
  <div style="padding:22px 20px 0;font-size:24px;font-weight:900">${Q.q}</div>
  <div class="g2" style="margin-top:16px">${Q.o.map((o, j) => `<button class="qopt ${A.includes(j) ? 'on' : ''}" onclick="qzPick(${j})"><img src="${I(o[1])}" alt="">${o[0]}</button>`).join('')}</div></div>
  <div class="btns"><button class="btn" style="${A.length ? '' : 'opacity:.5'}" onclick="qzNext()">${QZ.i === QUIZ.length - 1 ? 'Посмотреть результат' : 'Дальше'}</button></div>`;
}
function qzPick(j) { const Q = QUIZ[QZ.i]; let A = QZ.a[QZ.i] || []; if (Q.multi) { A = A.includes(j) ? A.filter(x => x !== j) : A.concat(j); } else A = [j]; QZ.a[QZ.i] = A; render(true); }
function qzNext() { if (!(QZ.a[QZ.i] || []).length) { toast('Выбери вариант'); return; } if (QZ.i < QUIZ.length - 1) { QZ.i++; render(); } else go('#/quizres'); }
function scrQuizRes() {
  const g = (QZ.a[0] || [0])[0], id = ['d1', 'd2', 'd4', 'd3'][g], d = DIETS.find(x => x.id === id);
  const alt = DIETS.filter(x => x.id !== id).slice(0, 2);
  const why = ['Твоя цель: ' + QUIZ[0].o[g][0].toLowerCase(), 'Ты ешь ' + QUIZ[2].o[(QZ.a[2] || [1])[0]][0].toLowerCase() + ' в день, план под это', 'Не ешь: ' + ((QZ.a[3] || []).filter(j => j < 3).map(j => QUIZ[3].o[j][0].toLowerCase()).join(', ') || 'ограничений нет')];
  return `<div class="scr anim" style="padding-bottom:110px">${topb('Результат теста')}
  <div class="card" style="text-align:center"><span class="ok">подходит на 92 %</span><img src="${I(d.i)}" style="width:130px;height:130px;object-fit:contain;display:block;margin:6px auto 0" alt=""><div style="font-size:22px;font-weight:900">${d.n}</div><div class="muted">~${N(d.kcal)} ккал в день</div>
  <div style="text-align:left;margin-top:12px">${why.map(w => `<div style="display:flex;gap:8px;align-items:center;font-weight:700;font-size:14px;margin-top:6px">${IC.check()}${esc(w)}</div>`).join('')}</div></div>
  <div class="sec">Ещё подходят</div><div class="card" style="padding-top:2px;padding-bottom:2px">${alt.map((a, j) => `<button class="ing" style="width:100%;text-align:left" onclick="go('#/diet/${a.id}')">${pic(a.i, a.n, 40)}<div class="nm"><b>${a.n}</b></div><div class="kc">${[78, 71][j]} %</div></button>`).join('')}</div></div>
  <div class="btns"><button class="btn" onclick="dietStart('${id}',21);root('#/diet/${id}')">Начать на 3 недели</button></div>`;
}

// ---------- отчёты ----------
let repSeg = 0, repOff = 0, repFrom = dk(addD(new Date(), -13)), repTo = TODAY;
function scrReports() {
  let keys;
  if (repSeg === 2) { const a = kd(repFrom), b = kd(repTo), c = Math.max(1, Math.min(366, Math.round((b - a) / 864e5) + 1)); keys = [...Array(c)].map((_, i) => dk(addD(a, i))); }
  else { const c = repSeg === 0 ? 7 : 30, end = addD(new Date(), -repOff * c); keys = [...Array(c)].map((_, i) => dk(addD(end, i - c + 1))); }
  const n = keys.length;
  const tots = keys.map(k => S.days[k] ? dayTot(k) : null), filled = tots.filter(t => t && t.k > 0);
  const avg = filled.length ? filled.reduce((a, t) => a + t.k, 0) / filled.length : 0, G = S.goal.k;
  const av = key => filled.length ? filled.reduce((a, t) => a + t[key], 0) / filled.length : 0;
  // столбики
  const W = 330, H = 170, X0 = 34, Y0 = 10, Y1 = 140, mx = Math.max(2200, ...tots.map(t => t ? t.k : 0));
  const y = v => Y1 - v / mx * (Y1 - Y0), bw = (W - X0 - 6) / n;
  const bars = tots.map((t, i) => { const v = t ? t.k : 0, x = X0 + i * bw + bw * .18, w = bw * .64, isT = keys[i] === TODAY; return `<rect x="${x}" y="${y(v)}" width="${w}" height="${Y1 - y(v)}" rx="${Math.min(6, w / 2)}" fill="${isT ? '#b9a6ff' : '#7c5cff'}"/>${n === 7 ? `<text x="${x + w / 2}" y="${Y1 + 16}" text-anchor="middle" font-size="11" font-weight="800" fill="${isT ? '#2a2340' : '#a49dbb'}">${WD[kd(keys[i]).getDay()]}</text>` : ''}`; }).join('');
  const grid = [0, 1000, 2000].map(v => `<line x1="${X0}" x2="${W}" y1="${y(v)}" y2="${y(v)}" stroke="#eee9fb"/><text x="${X0 - 6}" y="${y(v) + 4}" text-anchor="end" font-size="10" fill="#a49dbb" font-weight="700">${v}</text>`).join('');
  const svg = `<svg width="100%" viewBox="0 0 ${W} ${H}">${grid}${bars}<line x1="${X0}" x2="${W}" y1="${y(G)}" y2="${y(G)}" stroke="#22b07d" stroke-width="2" stroke-dasharray="5 5"/><text x="${W}" y="${y(G) - 5}" text-anchor="end" font-size="11" font-weight="800" fill="#159a6a">норма ${N(G)}</text></svg>`;
  const a = kd(keys[0]), b = kd(keys[n - 1]);
  const range = a.getMonth() === b.getMonth() ? `${a.getDate()} – ${b.getDate()} ${MON[b.getMonth()]}` : `${a.getDate()} ${MONS[a.getMonth()]} – ${b.getDate()} ${MONS[b.getMonth()]}`;
  const mAvg = MEALS.map(m => { const v = keys.filter(k => S.days[k]).map(k => sumE(S.days[k].meals[m.id] || []).k); return [m, v.length ? v.reduce((x, y) => x + y, 0) / v.length : 0]; });
  const mr = (l, v, g, c) => `<div class="mr"><div class="t2">${l}<span>${N(v)} / ${g} г</span></div><div class="bar"><i style="width:${Math.min(v / g * 100, 100)}%;background:${c}"></i></div></div>`;
  const dev = avg - G;
  return `<div class="scr anim"><div class="h1">Отчёты</div>
  <div class="seg2"><button class="${repSeg === 0 ? 'on' : ''}" onclick="repSeg=0;repOff=0;render(true)">Неделя</button><button class="${repSeg === 1 ? 'on' : ''}" onclick="repSeg=1;repOff=0;render(true)">Месяц</button><button class="${repSeg === 2 ? 'on' : ''}" onclick="periodSheet()">Свой период</button></div>
  ${repSeg === 2 ? `<button class="rowlink" style="justify-content:center" onclick="periodSheet()"><b>${range}</b>${IC.pen('#7c5cff',16)}</button>` : `<div style="display:flex;justify-content:space-between;align-items:center;margin:14px 20px 0;font-weight:900;font-size:16px"><button class="rb" style="width:34px;height:34px" onclick="repOff++;render(true)" aria-label="Раньше">${IC.back.replace('20', '16')}</button>${range}<button class="rb" style="width:34px;height:34px;${repOff ? '' : 'opacity:.35'}" onclick="if(repOff){repOff--;render(true)}" aria-label="Позже">${IC.chev}</button></div>`}
  ${filled.length ? `<div class="stats"><div class="stat"><b>${N(avg)}</b><small>ккал в день</small></div><div class="stat"><b>${N(G)}</b><small>норма</small></div><div class="stat"><b style="color:${dev > 0 ? '#c27a12' : '#159a6a'}">${dev > 0 ? '+' : '−'}${N(Math.abs(dev))}</b><small>от нормы</small></div></div>
  <div class="sec">Калории по дням</div><div class="card">${svg}</div>
  <div class="sec">Белки, жиры, углеводы<span>в среднем</span></div>
  <div class="card">${mr('Белки', av('p'), S.goal.p, '#f39a6b')}${mr('Жиры', av('f'), S.goal.f, '#8b6cff')}${mr('Углеводы', av('c'), S.goal.c, '#3cc48f')}</div>
  <div class="sec">Приёмы пищи<span>в среднем</span></div>
  <div class="card" style="padding-top:2px;padding-bottom:2px">${mAvg.map(([m, v]) => `<div class="ing"><div class="ico" style="background:${m.bg}">${mic(m, 24)}</div><div class="nm"><b>${m.n}</b></div><div style="text-align:right"><b class="v">${N(v)} ккал</b><small class="muted" style="display:block;font-size:12px">совет ${m.rec}</small></div></div>`).join('')}</div>` : '<div class="empty">За эти дни записей нет</div>'}
  </div>${nav(3)}`;
}

let PR = null;
function periodSheet() { PR = {a: repSeg === 2 ? repFrom : null, b: repSeg === 2 ? repTo : null, m: (repSeg === 2 ? repTo : TODAY).slice(0, 7)}; drawPeriod(); }
function drawPeriod() {
  const [y, m] = PR.m.split('-').map(Number), first = new Date(y, m - 1, 1), start = addD(first, -((first.getDay() + 6) % 7));
  const cells = [...Array(42)].map((_, i) => { const x = addD(start, i), k = dk(x), inM = x.getMonth() === m - 1, fut = k > TODAY;
    const edge = k === PR.a || k === PR.b, mid = PR.a && PR.b && k > PR.a && k < PR.b;
    return `<button class="cd ${inM ? '' : 'out'} ${edge ? 'on' : ''} ${mid ? 'mid' : ''} ${fut ? 'fut' : ''}" ${fut ? 'disabled' : `onclick="prTap('${k}')"`}>${x.getDate()}</button>`; }).join('');
  const lbl = PR.a && PR.b ? (() => { const a = kd(PR.a), b = kd(PR.b); return a.getMonth() === b.getMonth() && a.getFullYear() === b.getFullYear() ? `${a.getDate()} – ${b.getDate()} ${MON[b.getMonth()]}` : `${a.getDate()} ${MONS[a.getMonth()]} – ${b.getDate()} ${MONS[b.getMonth()]}`; })() : PR.a ? 'Выбери последний день' : 'Выбери первый день';
  sheet(`<div class="sh"><div><b>Свой период</b><small>${lbl}</small></div></div>
  <div class="card cal" style="animation:none"><div class="calh"><button class="rb" onclick="prShift(-1)" aria-label="Прошлый месяц">${SV('<path d="M15 5l-7 7 7 7"/>', '#7c5cff', 2.8, 16)}</button><b>${MONN[m - 1]} ${y}</b><button class="rb" onclick="prShift(1)" aria-label="Следующий месяц">${SV('<path d="M9 5l7 7-7 7"/>', '#7c5cff', 2.8, 16)}</button></div>
  <div class="calg">${['Пн','Вт','Ср','Чт','Пт','Сб','Вс'].map(d => `<small>${d}</small>`).join('')}${cells}</div></div>
  <div style="padding:16px 20px 0"><button class="btn" style="${PR.a && PR.b ? '' : 'opacity:.5'}" onclick="periodSave()">Показать</button></div>`);
}
function prTap(k) { if (!PR.a || PR.b) { PR.a = k; PR.b = null; } else if (k < PR.a) { PR.b = PR.a; PR.a = k; } else PR.b = k; drawPeriod(); }
function prShift(d) { const [y, m] = PR.m.split('-').map(Number), x = new Date(y, m - 1 + d, 1); PR.m = `${x.getFullYear()}-${pad(x.getMonth() + 1)}`; drawPeriod(); }
function periodSave() { if (!PR.a || !PR.b) { toast('Нажми первый и последний день'); return; } repFrom = PR.a; repTo = PR.b; repSeg = 2; closeSheet(); render(true); }

// ---------- вес ----------
let wSeg = 1;
function scrWeight() {
  const Wt = S.weights.slice().sort((a, b) => a.d < b.d ? -1 : 1), last = Wt[Wt.length - 1], G = S.goal;
  const span = [7, 31, 92, 366][wSeg], from = dk(addD(new Date(), -span));
  let P = Wt.filter(w => w.d >= from); if (P.length < 2) P = Wt.slice(-2);
  const monthAgo = Wt.filter(w => w.d <= dk(addD(new Date(), -28))).pop() || Wt[0];
  const ch = last.w - monthAgo.w, up = G.w > G.start, prog = G.w === G.start ? 1 : Math.max(0, Math.min(1, (G.start - last.w) / (G.start - G.w)));
  const X0 = 34, X1 = 326, Y0 = 14, Y1 = 176, lo = Math.min(G.w - 1, ...P.map(p => p.w)) , hi = Math.max(G.w, ...P.map(p => p.w)) + 1;
  const t0 = kd(P[0].d).getTime(), t1 = kd(P[P.length - 1].d).getTime() || t0 + 1;
  const x = d => X0 + (kd(d).getTime() - t0) / Math.max(1, t1 - t0) * (X1 - X0), y = v => Y0 + (hi - v) / (hi - lo) * (Y1 - Y0);
  const pts = P.map(p => `${x(p.d).toFixed(1)},${y(p.w).toFixed(1)}`).join(' ');
  const ticks = [Math.ceil(lo), Math.round((lo + hi) / 2), Math.floor(hi)];
  const lbl = d => { const z = kd(d); return `${z.getDate()} ${MONS[z.getMonth()]}`; };
  const svg = `<svg width="100%" viewBox="0 0 350 200"><defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8b6cff" stop-opacity=".22"/><stop offset="1" stop-color="#8b6cff" stop-opacity="0"/></linearGradient></defs>
  ${ticks.map(v => `<line x1="${X0}" x2="${X1}" y1="${y(v)}" y2="${y(v)}" stroke="#eee9fb"/><text x="${X0 - 8}" y="${y(v) + 4}" text-anchor="end" font-size="11" fill="#a49dbb" font-weight="700">${v}</text>`).join('')}
  ${G.w >= lo ? `<line x1="${X0}" x2="${X1}" y1="${y(G.w)}" y2="${y(G.w)}" stroke="#22b07d" stroke-width="2" stroke-dasharray="5 5"/><text x="${X1}" y="${y(G.w) - 6}" text-anchor="end" font-size="12" font-weight="800" fill="#159a6a">цель ${D1(G.w)}</text>` : ''}
  <path d="M${x(P[0].d)},${Y1} L${pts.replace(/ /g, ' L')} L${x(P[P.length - 1].d)},${Y1} Z" fill="url(#ga)"/><polyline points="${pts}" fill="none" stroke="#7c5cff" stroke-width="2.5" stroke-linejoin="round"/>
  ${P.map(p => `<circle cx="${x(p.d)}" cy="${y(p.w)}" r="4" fill="#7c5cff" stroke="#fff" stroke-width="2"/>`).join('')}
  <text x="${x(last.d)}" y="${y(last.w) - 12}" text-anchor="end" font-size="12" font-weight="900" fill="#2a2340">${W1(last.w)}</text>
  <text x="${X0}" y="${Y1 + 18}" font-size="11" fill="#a49dbb" font-weight="700">${lbl(P[0].d)}</text><text x="${X1}" y="${Y1 + 18}" text-anchor="end" font-size="11" fill="#a49dbb" font-weight="700">${lbl(P[P.length - 1].d)}</text></svg>`;
  const H = Wt.slice(-6).reverse().map((w, i, a) => { const prev = a[i + 1]; const df = prev ? w.w - prev.w : 0; return `<div class="hist"><div>${W1(w.w)} кг<br><small>${dTitle(w.d)}</small></div>${prev ? `<span class="d ${(G.w > G.start ? df < 0 : df > 0) ? 'up' : ''}">${df > 0 ? '+' : df < 0 ? '−' : ''}${D1(Math.abs(df))}</span>` : ''}</div>`; }).join('');
  return `<div class="scr anim" style="padding-bottom:110px">${topb('Вес')}
  <div class="card"><div style="display:flex;align-items:center;gap:14px"><img src="${I('scale')}" style="width:70px;height:70px;object-fit:contain" alt=""><div><div style="font-size:40px;font-weight:900;line-height:1">${W1(last.w)} <small style="font-size:18px;color:#8a83a3">кг</small></div><span class="ok" style="margin-top:6px;${(up ? ch < 0 : ch > 0) ? 'background:#fff1dc;color:#c27a12' : ''}">${ch > 0 ? '+' : '−'}${D1(Math.abs(ch))} кг за месяц</span></div></div>
  <div class="bar" style="margin-top:14px"><i style="width:${prog * 100}%"></i></div><div style="display:flex;justify-content:space-between;font-size:13px;font-weight:800;color:#8a83a3;margin-top:6px"><span>Старт ${D1(G.start)}</span><span>Осталось ${D1(Math.max(0, up ? G.w - last.w : last.w - G.w))} кг</span><span>Цель ${D1(G.w)}</span></div></div>
  <div class="seg2">${['Неделя', 'Месяц', '3 мес.', 'Год'].map((t, i) => `<button class="${i === wSeg ? 'on' : ''}" onclick="wSeg=${i};render(true)">${t}</button>`).join('')}</div>
  <div class="card">${svg}</div>
  <div class="sec">История</div><div class="card" style="padding-top:2px;padding-bottom:2px">${H}</div></div>
  <div class="btns"><button class="btn" onclick="weightSheet()">Записать вес</button></div>`;
}
let WS = 0;
function weightSheet() {
  const Wt = S.weights.slice().sort((a, b) => a.d < b.d ? -1 : 1); WS = WS || Wt[Wt.length - 1].w;
  sheet(`<div class="sh"><img src="${I('scale')}" alt=""><div><b>Мой вес</b><small>${dTitle(TODAY)}</small></div></div>
  <div style="display:flex;justify-content:center;align-items:center;gap:16px;margin-top:20px"><div class="step"><button onclick="WS=Math.round((WS-.1)*10)/10;weightSheet()">−</button><b style="font-size:44px;min-width:120px">${W1(WS)}</b><button onclick="WS=Math.round((WS+.1)*10)/10;weightSheet()">+</button></div></div><div class="muted" style="text-align:center">кг</div>
  <div style="padding:20px 20px 0"><button class="btn" onclick="saveW()">Сохранить</button></div>`);
}
function saveW() { S.weights = S.weights.filter(w => w.d !== TODAY); S.weights.push({d: TODAY, w: WS}); WS = 0; save(); closeSheet(); toast('Вес записан'); render(true); }

// ---------- я ----------
function scrMe() {
  const t = dayTot(TODAY), d = day(TODAY), Wt = S.weights.slice().sort((a, b) => a.d < b.d ? -1 : 1), last = Wt[Wt.length - 1], G = S.goal;
  const dt = S.diet && DIETS.find(x => x.id === S.diet.id);
  const items = [['Цели и норма', `${G.w < last.w ? 'Похудеть' : 'Держать вес'} · ${N(G.k)} ккал · Б ${G.p} Ж ${G.f} У ${G.c}`, '#/settings'], ['Параметры тела', bodyDate().replace(/^./, c => c.toUpperCase()), '#/body'], ['Предпочтения в еде', S.prefs.type.join(', '), '#/prefs'], ['Моя диета', dt ? `${dt.n} · день ${S.diet.day} из ${S.diet.len * 7}` : 'Не выбрана', dt ? '#/diet/' + dt.id : '#/diets'], ['Настройки', 'приёмы пищи, трекеры, синхронизация', '#/settings']];
  return `<div class="scr anim">${topb('Я')}
  <div class="card" style="display:flex;align-items:center;gap:14px"><button onclick="avaSheet()" style="position:relative" aria-label="Поменять фото">${avaHTML(68, 26)}<span style="position:absolute;right:-2px;bottom:-2px;width:24px;height:24px;border-radius:50%;background:#7c5cff;display:flex;align-items:center;justify-content:center;border:2px solid #fff">${IC.cam('#fff', 13)}</span></button>
  <div style="flex:1;min-width:0"><div style="font-size:22px;font-weight:900">${esc(S.name)}</div><div class="muted" style="font-size:14px">${typeof Cloud !== 'undefined' && Cloud.email() ? esc(Cloud.email()) : '<a href="start.html?s=login" style="color:var(--pri);font-weight:800;text-decoration:none">Войти в аккаунт</a>'}</div></div><button onclick="nameSheet()" aria-label="Изменить имя">${IC.pen()}</button></div>
  <div class="sec">Сегодня</div>
  <div class="card"><div style="display:flex;justify-content:space-between;font-weight:800"><span>Калории</span><span><b class="v">${N(t.k)}</b> <span class="muted">из ${N(G.k)} ккал</span></span></div><div class="bar" style="margin-top:8px"><i style="width:${Math.min(100, t.k / G.k * 100)}%"></i></div>
  <div style="display:flex;justify-content:space-between;font-weight:800;margin-top:14px"><span>Вода</span><span><b class="v">${L1(d.ml || 0)}</b> <span class="muted">из ${L1(S.waterGoal)} л</span></span></div><div class="bar" style="margin-top:8px"><i style="width:${Math.min(100, (d.ml || 0) / S.waterGoal * 100)}%;background:linear-gradient(90deg,#6db7ff,#4fd1b0)"></i></div></div>
  <div class="sec">Вес и цель<button onclick="go('#/weight')">График</button></div>
  <button class="card" style="display:block;width:calc(100% - 40px);text-align:left" onclick="go('#/weight')"><div style="display:flex;justify-content:space-between;align-items:flex-end"><div><small class="muted">Сейчас</small><div style="font-size:26px;font-weight:900">${W1(last.w)} кг</div></div><div style="text-align:center"><span class="ok">${last.w > G.start ? '+' : '−'}${D1(Math.abs(G.start - last.w))} кг</span><small class="muted" style="display:block;font-size:12px;margin-top:4px">с начала</small></div><div style="text-align:right"><small class="muted">Цель</small><div style="font-size:26px;font-weight:900">${D1(G.w)} кг</div></div></div>
  <div class="bar" style="margin-top:12px"><i style="width:${Math.max(0, Math.min(1, (G.start - last.w) / (G.start - G.w))) * 100}%"></i></div></button>
  <div class="sec">Моё</div>
  <div class="card" style="padding-top:2px;padding-bottom:2px">${items.map(([a, b, h]) => `<button class="row" onclick="go('${h}')"><div style="min-width:0">${a}<small>${esc(b)}</small></div>${IC.chev}</button>`).join('')}</div></div>`;
}
function avaSheet() {
  sheet(`<div class="sh"><div><b>Фото или иконка</b></div></div>
  <div style="display:flex;gap:10px;padding:14px 20px 0"><button class="btn w" style="flex:1;height:48px" onclick="S.ava={t:'l'};save();closeSheet();render(true)">Буква</button><label class="btn" style="flex:1;height:48px">Своё фото<input type="file" accept="image/*" style="display:none" onchange="avaFile(this)"></label></div>
  <div class="muted" style="margin:16px 20px 0">Или выбери картинку</div>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;padding:10px 20px 0">${AVATARS.map(a => `<button class="circ" style="width:100%;aspect-ratio:1" onclick="S.ava={t:'i',v:'${a}'};save();closeSheet();render(true)"><img src="${I(a)}" style="width:70%;height:70%" alt=""></button>`).join('')}</div>`);
}
function avaFile(inp) {
  const f = inp.files[0]; if (!f) return;
  const img = new Image(), rd = new FileReader();
  rd.onload = () => { img.onload = () => { const c = document.createElement('canvas'), s = 200; c.width = c.height = s; const m = Math.min(img.width, img.height); c.getContext('2d').drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, s, s); S.ava = {t: 'p', v: c.toDataURL('image/jpeg', .85)}; save(); closeSheet(); render(true); }; img.src = rd.result; };
  rd.readAsDataURL(f);
}
function nameSheet() { sheet(`<div class="sh"><div><b>Как тебя зовут?</b></div></div><div style="padding:14px 20px 0"><div class="search" style="margin:0"><input id="nm" value="${esc(S.name)}"></div><div class="search" style="margin:10px 0 0"><input id="lg" value="${esc(S.login)}"></div><button class="btn" style="margin-top:14px" onclick="S.name=$('#nm').value.trim()||S.name;S.login=$('#lg').value.trim()||S.login;save();closeSheet();render(true)">Сохранить</button></div>`); }

// ---------- настройки ----------
function scrSettings() {
  const G = S.goal;
  const row = (a, v, fn) => `<button class="row" onclick="${fn}"><span>${a}</span><span class="v">${v}</span></button>`;
  const sw = (on, fn) => `<button class="sw ${on ? 'on' : ''}" onclick="${fn}" aria-label="Переключить"></button>`;
  return `<div class="scr anim">${topb('Настройки')}
  <div class="sec">Мои цели</div><div class="card" style="padding-top:2px;padding-bottom:2px">
  ${row('Калории в день', N(G.k) + ' ккал', `numSheet('k','Калории в день','ккал',50)`)}${row('Белки', G.p + ' г', `numSheet('p','Белки в день','г',5)`)}${row('Жиры', G.f + ' г', `numSheet('f','Жиры в день','г',5)`)}${row('Углеводы', G.c + ' г', `numSheet('c','Углеводы в день','г',5)`)}${row('Желаемый вес', D1(G.w) + ' кг', `numSheet('w','Желаемый вес','кг',.5)`)}</div>
  <div class="sec">Как показывать</div><div class="card"><div style="display:flex;justify-content:space-between;align-items:center;font-weight:800">БЖУ на главной<div class="seg" style="width:150px"><button class="${S.bjuMode === 'g' ? 'on' : ''}" onclick="S.bjuMode='g';save();render(true)">граммы</button><button class="${S.bjuMode === 'p' ? 'on' : ''}" onclick="S.bjuMode='p';save();render(true)">%</button></div></div></div>
  <div class="sec">Приёмы пищи</div><div class="card" style="padding-top:2px;padding-bottom:2px">${MEALS.map(m => `<div class="row"><span style="display:flex;align-items:center;gap:10px"><span class="ico" style="width:34px;height:34px;background:${m.bg}">${mic(m, 20)}</span>${m.n}</span>${sw(S.mealsOn[m.id], `S.mealsOn['${m.id}']=S.mealsOn['${m.id}']?0:1;save();render(true)`)}</div>`).join('')}</div>
  <div class="sec">Трекеры</div><div class="card" style="padding-top:2px;padding-bottom:2px"><div class="row"><span>Стакан воды</span><span class="v">${GL()} мл</span></div><button class="row" onclick="numSheetW()"><span>Норма воды</span><span class="v">${L1(S.waterGoal)} л</span></button><div class="row"><span>Овощи</span><span class="v">5 в день</span></div><div class="row"><span>Фрукты</span><span class="v">5 в день</span></div></div>
  <div class="sec">Синхронизация</div><div class="card" style="padding-top:2px;padding-bottom:2px"><div class="row"><div>Apple Здоровье<small>шаги и активность в калориях</small></div>${sw(S.sync.apple, `S.sync.apple=S.sync.apple?0:1;save();render(true);toast('Заработает в приложении')`)}</div><div class="row"><div>Health Connect (Android)<small>шаги и активность в калориях</small></div>${sw(S.sync.android, `S.sync.android=S.sync.android?0:1;save();render(true);toast('Заработает в приложении')`)}</div></div>
  ${typeof Cloud !== 'undefined' && Cloud.email() ? `<div class="sec">Аккаунт</div><div class="card" style="padding-top:2px;padding-bottom:2px"><div class="row"><span>Почта</span><span class="v">${esc(Cloud.email())}</span></div><button class="row" onclick="outSheet()"><span style="color:#c23a64">Выйти</span></button></div>` : `<div class="sec">Аккаунт</div><div class="card" style="padding-top:2px;padding-bottom:2px"><button class="row" onclick="location.href='start.html?s=reg'"><span>Создать аккаунт</span></button><button class="row" onclick="location.href='start.html?s=login'"><span>Войти</span></button></div>`}
  <div style="padding:22px 20px 0"><button class="btn w" onclick="resetAll()">Стереть все данные</button></div>
  <div class="muted" style="font-size:12px;text-align:center;padding:16px 20px 0">Данные о товарах: Open Food Facts, лицензия ODbL</div></div>`;
}
function numSheet(key, title, unit, step) {
  let v = S.goal[key];
  window._ns = d => { v = Math.max(0, Math.round((v + d) * 10) / 10); $('#nsv').textContent = unit === 'кг' ? D1(v) : N(v); };
  sheet(`<div class="sh"><div><b>${title}</b></div></div><div style="display:flex;justify-content:center;margin-top:20px"><div class="step"><button onclick="_ns(-${step})">−</button><b id="nsv" style="font-size:40px;min-width:130px">${unit === 'кг' ? D1(v) : N(v)}</b><button onclick="_ns(${step})">+</button></div></div><div class="muted" style="text-align:center">${unit}</div>
  <div style="padding:18px 20px 0"><button class="btn" id="nsb">Сохранить</button></div>`);
  $('#nsb').onclick = () => { S.goal[key] = v; save(); closeSheet(); render(true); };
}
function numSheetW() { let v = S.waterGoal; window._nw = d => { v = Math.max(500, v + d); $('#nwv').textContent = L1(v); }; sheet(`<div class="sh"><div><b>Норма воды</b></div></div><div style="display:flex;justify-content:center;margin-top:20px"><div class="step"><button onclick="_nw(-100)">−</button><b id="nwv" style="font-size:40px;min-width:110px">${L1(v)}</b><button onclick="_nw(100)">+</button></div></div><div class="muted" style="text-align:center">литра</div><div style="padding:18px 20px 0"><button class="btn" id="nwb">Сохранить</button></div>`); $('#nwb').onclick = () => { S.waterGoal = v; save(); closeSheet(); render(true); }; }
function outSheet() { sheet(`<div class="sh"><div><b>Выйти из аккаунта?</b><small>Данные останутся в облаке, с этого телефона они сотрутся</small></div></div><div style="display:flex;gap:10px;padding:18px 20px 0"><button class="btn w" onclick="closeSheet()">Отмена</button><button class="btn" onclick="logOut()">Выйти</button></div>`); }
async function logOut() { try { await Cloud.signOut(); } catch (e) { toast('Нет интернета, попробуй позже'); return; } try { localStorage.removeItem(KEY); localStorage.removeItem('ss_start'); localStorage.removeItem('ss_cloud_t'); } catch (e) {} location.replace('start.html?s=login'); }
function resetAll() { sheet(`<div class="sh"><div><b>Стереть все записи?</b><small>Записи о еде, воде и весе удалятся</small></div></div><div style="display:flex;gap:10px;padding:18px 20px 0"><button class="btn w" onclick="closeSheet()">Отмена</button><button class="btn" onclick="try{localStorage.removeItem(KEY)}catch(e){};S=fresh();closeSheet();root('#/home');render()">Стереть</button></div>`); }

const BODY = ['Талия', 'Бёдра', 'Грудь', 'Обхват бедра', 'Обхват руки', 'Процент жира'];
function bodyLast() { const L = S.body || []; return L[L.length - 1]; }
function bodyDate() { const l = bodyLast(); if (!l) return 'замеров пока нет'; const d = kd(l.d); return `последний замер ${d.getDate()} ${MON[d.getMonth()]}`; }
function scrBody() {
  const L = S.body || [], l = L[L.length - 1], pr = L[L.length - 2];
  const nx = l ? addD(kd(l.d), S.remind === 1 ? 30 : 91) : null;
  const cell = (a, j) => { const v = l && l.v[j], o = pr && pr.v[j], df = v && o ? v - o : 0, u = j === 5 ? ' %' : ' см';
    return `<div style="background:#f6f3ff;border-radius:14px;padding:10px 12px"><small class="muted">${a}</small><div style="display:flex;justify-content:space-between;align-items:baseline"><b style="font-size:20px">${v ? D1(v) + u : '—'}</b>${df ? `<b style="color:${df < 0 ? '#159a6a' : '#c4561c'};font-size:13px">${df > 0 ? '+' : '−'}${D1(Math.abs(df))}</b>` : ''}</div></div>`; };
  return `<div class="scr anim" style="padding-bottom:110px">${topb('Параметры тела', bodyDate())}
  <div class="card"><div class="g2" style="margin:0">${BODY.map(cell).join('')}</div></div>
  <div class="sec">Напоминать о замере</div><div class="card"><div class="seg"><button class="${S.remind === 1 ? 'on' : ''}" onclick="S.remind=1;save();render(true)">раз в месяц</button><button class="${S.remind === 3 ? 'on' : ''}" onclick="S.remind=3;save();render(true)">раз в 3 месяца</button></div>${nx ? `<div class="muted" style="font-size:13px;margin-top:8px">Следующий замер: ${nx.getDate()} ${MON[nx.getMonth()]}</div>` : ''}</div></div>
  <div class="btns"><button class="btn" onclick="bodySheet()">Новый замер</button></div>`;
}
function bodySheet() {
  const l = bodyLast();
  sheet(`<div class="sh"><div><b>Новый замер</b><small>можно заполнить не всё</small></div></div><div class="g2" style="padding:14px 20px 0">${BODY.map((a, j) => `<label style="background:#f6f3ff;border-radius:14px;padding:8px 12px;display:block"><small class="muted">${a}, ${j === 5 ? '%' : 'см'}</small><input id="bm${j}" inputmode="decimal" value="${l && l.v[j] ? String(l.v[j]).replace('.', ',') : ''}" style="width:100%;border:0;background:none;font-size:20px;font-weight:900;outline:none"></label>`).join('')}</div>
  <div style="padding:14px 20px 0"><button class="btn" onclick="bodySave()">Сохранить</button></div>`);
}
function bodySave() {
  const v = BODY.map((_, j) => +($('#bm' + j).value.replace(',', '.')) || 0);
  if (!v.some(Boolean)) { closeSheet(); return; }
  S.body = (S.body || []).filter(x => x.d !== TODAY); S.body.push({d: TODAY, v}); save(); closeSheet(); render(true); toast('Замер сохранён');
}
function scrPrefs() {
  const types = ['Обычное', 'Вегетарианское', 'Веганское', 'Без глютена', 'Без лактозы', 'Халяль'];
  const fav = [['Творог', 'М1_Творог в пачке'], ['Курица', 'Д3_Куриная грудка гриль'], ['Авокадо', 'Ф1_Авокадо'], ['Голубика', 'Ф2_Голубика'], ['Йогурт', 'М1_Греческий йогурт'], ['Лосось', 'Д4_Лосось запечённый']];
  return `<div class="scr anim">${topb('Предпочтения в еде')}
  <div class="sec">Как я питаюсь</div><div class="card"><div class="wrap">${types.map(t => `<button class="pill ${S.prefs.type.includes(t) ? 'on' : ''}" onclick="prefT('${t}')">${t}</button>`).join('')}</div></div>
  <div class="sec">Не ем</div><div class="card"><div class="wrap">${S.prefs.no.map((t, j) => `<span class="pill" style="background:#ffe3ec;color:#c23a64">${esc(t)}<button onclick="S.prefs.no.splice(${j},1);save();render(true)" aria-label="Убрать">${IC.x()}</button></span>`).join('')}<button class="pill" style="color:#7c5cff" onclick="noSheet()">+ добавить</button></div></div>
  <div class="sec">Любимые продукты</div><div class="card"><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">${fav.map(([a, i]) => `<div style="text-align:center;font-weight:800;font-size:12.5px"><div style="background:#f6f3ff;border-radius:16px;aspect-ratio:1;display:flex;align-items:center;justify-content:center"><img src="${I(i)}" style="width:80%;height:80%;object-fit:contain" alt=""></div>${a}</div>`).join('')}</div></div>
  <button class="rowlink" onclick="go('#/home-food')"><span class="ci">${IC.fork}</span><b>Что есть дома?</b><span></span>${IC.chev}</button></div>`;
}
function prefT(t) { const a = S.prefs.type, j = a.indexOf(t); j >= 0 ? a.splice(j, 1) : a.push(t); save(); render(true); }
function noSheet() { sheet(`<div class="sh"><div><b>Что не ешь?</b></div></div><div style="padding:14px 20px 0"><div class="search" style="margin:0"><input id="no" placeholder="Например, лук"></div><button class="btn" style="margin-top:14px" onclick="const v=$('#no').value.trim();if(v){S.prefs.no.push(v);save()}closeSheet();render(true)">Добавить</button></div>`); }

// ---------- скриншот ----------
let SC = null;
function scanGo(t) { SC = t === 'recipe' ? {t, por: 3, save: 1, m: 'l', ing: [['Творог 5%', 'М1_Творог в пачке', 400, 121, 17.2, 5, 1.8], ['Яйцо', 'М1_Яйца', 50, 157, 12.7, 11.5, 0.7], ['Мука', '', 60, 342, 10, 1, 70], ['Сахар', '', 20, 399, 0, 0, 99.8], ['Сметана 15%', 'М1_Сметана', 60, 162, 2.6, 15, 3]]} : {t, m: 's'}; go('#/scanres'); }
function scrScanRes() {
  if (!SC) return scrScan();
  if (SC.t === 'product') {
    const f = FD.yog;
    return `<div class="scr anim" style="padding-bottom:110px">${topb('Со скриншота', 'продукт')}
    <div class="card" style="display:flex;gap:12px;align-items:center"><div style="width:74px;height:90px;border-radius:12px;background:#f6f3ff;display:flex;align-items:center;justify-content:center"><img src="${I(f.i)}" style="width:60px;height:60px;object-fit:contain" alt=""></div><div><span class="ok">${IC.check()} Данные с упаковки</span><div style="font-size:20px;font-weight:900;margin-top:6px">Йогурт греческий 2%</div><div class="muted">упаковка 140 г</div></div></div>
    <div class="sec">Пищевая ценность<span>в 100 г</span></div><div class="tot">${totHTML(f)}</div>
    <div class="sec">Вся упаковка 140 г</div><div class="tot">${totHTML({k: f.k * 1.4, p: f.p * 1.4, f: f.f * 1.4, c: f.c * 1.4})}</div>
    <div class="sec">Куда добавить</div><div class="chips">${MEALS.map(m => `<button class="chip ${SC.m === m.id ? 'pri' : ''}" onclick="SC.m='${m.id}';render(true)">${m.n}</button>`).join('')}</div></div>
    <div class="btns"><button class="btn w" onclick="toast('Сохранено в продукты')">Сохранить</button><button class="btn" onclick="day(sel).meals[SC.m].push(entryF(FD.yog,140));save();toast('Добавлено');root('#/home')">${MEALS.find(m => m.id === SC.m).v[0].toUpperCase() + MEALS.find(m => m.id === SC.m).v.slice(1)}</button></div>`;
  }
  const all = recTot(null, SC.ing), k = 1 / SC.por, M = MEALS.find(m => m.id === SC.m);
  const rows = ingHead(all) + SC.ing.map((x, j) => `<div class="ing tb">${pic(x[1], x[0], 40)}<div class="nm"><b>${esc(x[0])}</b></div><label class="g"><input type="number" inputmode="numeric" value="${x[2]}" onchange="SC.ing[${j}][2]=+this.value||0;render(true)">г</label><div class="kc">${N(x[3] * x[2] / 100)}</div><button class="del" onclick="SC.ing.splice(${j},1);render(true)" aria-label="Убрать">${IC.x()}</button></div>`).join('');
  return `<div class="scr anim" style="padding-bottom:110px">${topb('Сырники', 'со скриншота')}
  <div class="card" style="display:flex;justify-content:space-between;align-items:center;font-weight:900">Рецепт на ${SC.por} ${SC.por < 5 ? 'порции' : 'порций'}<div class="step"><button onclick="SC.por=Math.max(1,SC.por-1);render(true)">−</button><b>${SC.por}</b><button onclick="SC.por++;render(true)">+</button></div></div>
  <div class="sec">На 1 порцию</div><div class="tot">${totHTML({k: all.k * k, p: all.p * k, f: all.f * k, c: all.c * k})}</div>
  <div class="card" style="padding-top:2px;padding-bottom:8px;margin-top:16px">${rows}<button class="add" style="display:flex;gap:8px;align-items:center;color:#7c5cff;font-weight:800;padding-top:10px" onclick="scAddSheet()">${IC.plus()} Добавить продукт</button></div>
  <button class="card" style="display:flex;gap:10px;align-items:center;width:calc(100% - 40px);font-weight:800" onclick="SC.save=!SC.save;render(true)"><span style="width:24px;height:24px;border-radius:8px;background:${SC.save ? '#7c5cff' : '#efe9ff'};display:flex;align-items:center;justify-content:center">${SC.save ? IC.check('#fff') : ''}</span>Сохранить в мои рецепты</button>
  <div class="sec">Куда добавить</div><div class="chips">${MEALS.map(m => `<button class="chip ${SC.m === m.id ? 'pri' : ''}" onclick="SC.m='${m.id}';render(true)">${m.n}</button>`).join('')}</div></div>
  <div class="btns"><button class="btn" onclick="scDone()">${M.v[0].toUpperCase() + M.v.slice(1)}</button></div>`;
}
function scAddSheet() { ingSheet('sc'); return;
  sheet(`<div class="sh"><div><b>Добавить продукт</b></div></div><div class="g2" style="margin-top:12px">${FOODS.slice(0, 12).map(f => `<button class="dl" style="margin:0;width:100%;padding:6px" onclick="SC.ing.push(['${f.n}','${f.i}',${f.por},${f.k},${f.p},${f.f},${f.c}]);closeSheet();render(true)"><div class="im" style="width:40px;height:40px"><img src="${I(f.i)}" style="width:34px;height:34px" alt=""></div><b style="font-size:13px">${f.n}</b></button>`).join('')}</div>`);
}
function scDone(mode) {
  const all = recTot(null, SC.ing), k = 1 / SC.por;
  const exists = RECIPES.concat(S.myRecipes).find(r => r.n === 'Сырники');
  if (SC.save && exists && !mode) {
    sheet(`<div class="sh"><div><b>Такой рецепт уже есть</b><small>«Сырники» в твоих рецептах</small></div></div><div style="padding:16px 20px 0;display:flex;flex-direction:column;gap:10px">
    <button class="btn" onclick="closeSheet();scDone('new')">Сохранить как новый</button><button class="btn w" onclick="closeSheet();scDone('replace')">Заменить старый</button><button class="btn w" onclick="closeSheet();scDone('skip')">Не сохранять</button></div>`);
    return;
  }
  if (SC.save && mode !== 'skip') {
    if (mode === 'replace') exists.ing = SC.ing.map(x => x.slice()), exists.por = SC.por;
    else S.myRecipes.push({id: 'mr' + Date.now(), n: mode === 'new' ? 'Сырники со сметаной' : 'Сырники', i: 'Д1_Сырники', t: '20 мин', por: SC.por, mine: 1, cat: 'Завтраки', ing: SC.ing.map(x => x.slice())});
  }
  day(sel).meals[SC.m].push({n: 'Сырники', i: 'Д1_Сырники', g: all.g * k, k: all.k * k, p: all.p * k, f: all.f * k, c: all.c * k});
  save(); toast(`Добавлено ${MEALS.find(m => m.id === SC.m).v}`); SC = null; root('#/home');
}

// ---------- этикетка ----------
function scrLabel() {
  const corner = s => `<div style="position:absolute;width:34px;height:34px;${s}"></div>`;
  return `<div class="camv anim" id="cv"><div style="position:absolute;top:30px;left:20px;right:20px;display:flex;justify-content:space-between;align-items:center"><button class="back" onclick="back()" aria-label="Закрыть">${IC.x('#fff', 18)}</button><b style="font-size:18px;font-weight:900">Свой продукт</b><div style="width:42px"></div></div>
  <div style="position:absolute;top:90px;left:20px;right:20px;display:flex;background:rgba(255,255,255,.12);border-radius:16px;padding:4px"><button id="lt0" style="flex:1;padding:9px;border-radius:12px;background:#fff;color:#2a2340;font-weight:800" onclick="labTab(0)">Этикетка</button><button id="lt1" style="flex:1;padding:9px;border-radius:12px;font-weight:800;color:#ddd" onclick="labTab(1)">Штрихкод</button></div>
  <div style="position:absolute;top:170px;left:45px;right:45px;height:330px">
  <div id="lbl" style="position:absolute;inset:26px 18px;background:#fbf8ef;color:#2a2340;border-radius:6px;padding:14px 16px;transform:rotate(-2deg);box-shadow:0 10px 30px rgba(0,0,0,.4)"><div style="font-weight:900;font-size:16px">Йогурт греческий 2%</div><div style="font-size:12px;color:#666;margin-bottom:8px">масса нетто 140 г</div><div style="font-weight:800;font-size:12px;margin-bottom:4px">Пищевая ценность в 100 г:</div>
  ${[['Энергетическая ценность', '66 ккал'], ['Белки', '9,5 г'], ['Жиры', '2,0 г'], ['Углеводы', '3,5 г']].map(([a, b]) => `<div style="display:flex;justify-content:space-between;border-top:1px solid #ddd;padding:5px 0;font-size:13px"><span>${a}</span><b>${b}</b></div>`).join('')}</div>
  ${corner('left:0;top:0;border-left:4px solid #4fd1b0;border-top:4px solid #4fd1b0;border-radius:14px 0 0 0')}${corner('right:0;top:0;border-right:4px solid #4fd1b0;border-top:4px solid #4fd1b0;border-radius:0 14px 0 0')}${corner('left:0;bottom:0;border-left:4px solid #4fd1b0;border-bottom:4px solid #4fd1b0;border-radius:0 0 0 14px')}${corner('right:0;bottom:0;border-right:4px solid #4fd1b0;border-bottom:4px solid #4fd1b0;border-radius:0 0 14px 0')}</div>
  <div id="lhint" style="position:absolute;top:526px;left:0;right:0;text-align:center;font-weight:800;font-size:15px">Сфоткай этикетку</div>
  <div style="position:absolute;bottom:calc(46px + env(safe-area-inset-bottom));left:0;right:0;display:flex;justify-content:center"><button class="shutter" onclick="snap()" aria-label="Сфоткать"><i></i></button></div></div>`;
}
let labMode = 0;
function labTab(i) {
  labMode = i;
  $('#lt0').style.cssText = `flex:1;padding:9px;border-radius:12px;font-weight:800;${i ? 'color:#ddd' : 'background:#fff;color:#2a2340'}`;
  $('#lt1').style.cssText = `flex:1;padding:9px;border-radius:12px;font-weight:800;${i ? 'background:#fff;color:#2a2340' : 'color:#ddd'}`;
  $('#lbl').innerHTML = i ? `<div style="display:flex;gap:3px;height:150px;align-items:stretch;justify-content:center;margin-top:40px">${[...Array(34)].map((_, j) => `<i style="width:${[2, 4, 1, 3][j % 4]}px;background:#222"></i>`).join('')}</div><div style="text-align:center;font-size:13px;margin-top:6px;letter-spacing:2px">4 600000 123456</div>` : $('#lbl').innerHTML;
  if (!i) render(true);
  $('#lhint').textContent = i ? 'Наведи на штрихкод' : 'Сфоткай этикетку';
}
function snap() {
  const c = $('#cv'); c.classList.add('flash');
  if (labMode === 1) { setTimeout(() => { toast('В базе не нашлось, сфоткай этикетку'); labTab(0); }, 400); return; }
  setTimeout(() => { go('#/labelres'); }, 300);
}
let LB = {};
function scrLabelRes() {
  const L = LB || {}, val = x => x === undefined || x === null || x === '' ? '' : String(x).replace('.', ',');
  const fld = (l, id, v, u = '', ph = '') => `<div><div class="muted" style="font-size:13px;margin-bottom:4px">${l}</div><label style="display:flex;align-items:center;background:#f6f3ff;border-radius:14px;padding:11px 14px;font-weight:800;font-size:16px"><input id="${id}" ${u ? 'inputmode="decimal"' : ''} value="${esc(v)}" placeholder="${ph}" style="flex:1;border:0;background:none;outline:0;font-weight:800;min-width:0">${u ? `<span class="muted">${u}</span>` : IC.pen()}</label></div>`;
  return `<div class="scr anim" style="padding-bottom:110px">${topb('Свой продукт', L.code ? 'штрихкод ' + L.code : 'с упаковки')}
  <button class="rowlink" onclick="labPhoto()"><span class="ci" style="background:#efe9ff">${IC.cam('#6a4be0', 20)}</span><b>Заполнить по фото</b><span>сфоткай состав на упаковке</span>${IC.chev}</button>
  <div class="card" style="display:flex;flex-direction:column;gap:12px">${fld('Название', 'ln', L.n || '', '', 'Например, Творог 5%')}${fld('Марка *', 'lb', L.mk || '', '', 'Например, Простоквашино')}<div class="g2" style="margin:0">${fld('Вес упаковки', 'lw', val(L.w), 'г')}${fld('Порция', 'lp', val(L.por), 'г')}</div></div>
  <div class="sec">Пищевая ценность<span>в 100 г</span></div>
  <div class="card"><div class="g2" style="margin:0">${fld('Калории', 'lk', val(L.k), 'ккал')}${fld('Белки', 'lpr', val(L.p), 'г')}${fld('Жиры', 'lf', val(L.f), 'г')}${fld('Углеводы', 'lc', val(L.c), 'г')}</div></div></div>
  <div class="btns"><button class="btn w" onclick="back()">Отмена</button><button class="btn" onclick="labSave()">Сохранить</button></div>`;
}
function labSave() {
  const v = id => parseFloat(String($('#' + id).value).replace(',', '.')) || 0;
  const id = 'my' + Date.now();
  const mk = $('#lb').value.trim(); if (!mk) { toast('Напиши марку с упаковки'); $('#lb').focus(); return; }
  const n = $('#ln').value.trim(); if (!n) { toast('Напиши название'); $('#ln').focus(); return; }
  if (!$('#lk').value.trim()) { toast('Напиши калории с упаковки'); $('#lk').focus(); return; }
  const por = v('lp') || v('lw') || 100, code = (LB && LB.code) || '';
  if (code) S.my = S.my.filter(x => x.code !== code);
  S.my.unshift({id, code, mk, n, i: '', k: v('lk'), p: v('lpr'), f: v('lf'), c: v('lc'), por, pn: v('lp') ? '1 порция' : v('lw') ? '1 упаковка' : '100 г', brand: 'с упаковки'});
  LB = {}; save(); toast('Продукт сохранён'); addTab = 2; back(STK[STK.length - 2] === 'bar' ? 2 : 1);
}

// ---------- кафе ----------
// ---------- маршруты ----------
function route() { return STK[STK.length - 1].split('/'); }
let lastScroll = {};
let lastR = '';
function render(keep) {
  const rk = STK.join('>'); if (rk === lastR) keep = true; lastR = rk;
  const [r, a, b] = route(), sc = $('.scr');
  const y = keep && sc ? sc.scrollTop : 0;
  closeSheet(); closePlus();
  const R = {home: scrHome, add: () => scrAdd(a || 'b'), recipes: scrRecipes, recipe: () => scrRecipe(a, b), recnew: () => scrRecEd(a), rfold: () => scrFold(a), coll: () => scrColl(a), 'home-food': scrHomeFood,
    diets: scrDiets, diet: () => scrDiet(a), quiz: scrQuiz, quizres: scrQuizRes, reports: scrReports, weight: scrWeight, me: scrMe, settings: scrSettings,
    body: scrBody, prefs: scrPrefs, scan: scrScan, scanres: scrScanRes, label: scrBar, bar: scrBar, labelres: scrLabelRes, cafe: () => scrCafe(a), cafem: () => scrCafeMenu(a, b), assistant: scrAssistant, photo: scrPhoto};
  const html = (R[r] || scrHome)();
  if (keep && app().firstElementChild) {
    const nw = htmlEl(html); nw.querySelectorAll('.anim').forEach(e => e.classList.remove('anim'));
    const old = $('.scr'); if (old) old.classList.remove('anim');
    nw.id = 'app'; morph(app(), nw);
    const n = $('.scr'); if (n && n.scrollTop !== y) n.scrollTop = y;
  } else app().innerHTML = html;
  if (r === 'bar' || r === 'label') setTimeout(barStart, 50);
}
// первый запуск: сначала заставка и анкета
let HAS = null; try { HAS = localStorage.getItem(KEY) || localStorage.getItem('ss_start'); } catch (e) {}
if (!HAS) location.replace('start.html');
else {
  load(); sel = TODAY;
  // анкету прошли заново: обновить норму и имя
  try { const P = JSON.parse(localStorage.getItem('ss_start') || 'null'); if (P && P.norm && P.at && P.at !== S.startAt) { S.name = P.name || S.name; S.goal.k = P.norm.kc; S.goal.p = P.norm.p; S.goal.f = P.norm.f; S.goal.c = P.norm.c; if (P.goal === 'down' || P.goal === 'up') S.goal.w = +P.tw; if (P.water) S.waterGoal = P.water; S.startAt = P.at; save(); } } catch (e) {}
  // кто прошёл анкету до появления нормы воды: посчитать по весу
  try { const P = JSON.parse(localStorage.getItem('ss_start') || 'null'); if (P && P.w && !P.water && !S.waterSet) { S.waterGoal = Math.min(3500, Math.max(1500, Math.round((30 * P.w + ({run: 300, fire: 500}[P.act] || 0)) / 100) * 100)); S.waterSet = 1; save(); } } catch (e) {}
  render();
}
if (typeof Cloud !== 'undefined' && HAS) setTimeout(() => Cloud.init().then(() => Cloud.onUser(u => { if (u) { Cloud.queue(); shareSync(); if (route()[0] === 'me' || route()[0] === 'settings') render(true); } })).catch(() => {}), 400);
if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
