'use strict';
// ---------- «Что есть дома?» и голосовой помощник (настоящие, без примеров) ----------
const PANTRY = new Set(['Специи и соль', 'Вода', 'Сахар', 'Растительное масло', 'Масло оливковое', 'Лавровый лист и перец', 'Уксус', 'Разрыхлитель', 'Корица', 'Зелень', 'Лимонный сок', 'Чай', 'Сахарозаменитель']);
const stem = w => w.length <= 3 ? w : w.slice(0, Math.max(3, w.length - 2));
const words = s => nz(s).split(' ').filter(w => w.length >= 3 && !/^\d/.test(w));
// продукт из справочника, который подходит под слово «творог», «молоко» и т.п.
function ingFind(text) {
  const W = words(text).map(stem); if (!W.length) return null;
  let best = null, bs = 0;
  for (const k of Object.keys(ING)) {
    if (!ING[k][1] && !PANTRY.has(k)) continue;
    const kw = words(k); if (!kw.length) continue;
    const hit = kw.filter(w => W.some(x => x.startsWith(stem(w)) || stem(w).startsWith(x))).length;
    if (!hit || !W.some(x => x.startsWith(stem(kw[0])) || stem(kw[0]).startsWith(x))) continue;
    const sc = hit / kw.length + hit / W.length;
    if (sc > bs) { bs = sc; best = k; }
  }
  return best;
}
const famOf = k => stem(words(k)[0] || k); // «Молоко 2,5%» и «Молоко 3,2%» — одно и то же дома
function homeHas(ing, H) { return H.has(ing) || [...H].some(h => famOf(h) === famOf(ing)); }

function scrHomeFood() {
  S.home = (S.home || []).map(h => h[3] ? h : [h[0], h[1], h[2], ingFind(h[0]) || '']);
  const H = new Set(S.home.map(h => h[3]).filter(Boolean));
  let R = [];
  if (H.size) {
    R = S.myRecipes.concat(RECIPES).map(r => {
      const need = r.ing.map(x => x[0]).filter(n => !PANTRY.has(n)), miss = [...new Set(need.filter(n => !homeHas(n, H)))];
      return {r, miss, have: need.length - miss.length, need: need.length};
    }).filter(x => x.have >= 1 && x.miss.length <= 2 && x.have / x.need >= .5).sort((a, b) => a.miss.length - b.miss.length || b.have - a.have).slice(0, 40);
  }
  const sug = hfQ.trim().length >= 2 ? Object.keys(ING).filter(k => ING[k][1] > 0 && fits(k, hfQ) && !H.has(k)).slice(0, 6) : [];
  return `<div class="scr anim">${topb('Что есть дома?')}
  <div class="search"><input id="hf" placeholder="Что есть: молоко, яйца, курица…" value="${esc(hfQ)}" oninput="hfQ=this.value;render(true)" onkeydown="if(event.key==='Enter')hfAdd()"><button class="cam" onclick="hfAdd()" aria-label="Добавить">${IC.plus('#fff', 18)}</button></div>
  ${sug.length ? `<div class="chips wr" style="margin-top:10px">${sug.map(k => `<button class="chip" onclick="hfAdd(${q(k)})">${esc(k)}</button>`).join('')}</div>` : ''}
  <div class="sec">У меня дома<span>${S.home.length} ${S.home.length % 10 === 1 && S.home.length !== 11 ? 'продукт' : S.home.length % 10 >= 2 && S.home.length % 10 <= 4 && (S.home.length < 12 || S.home.length > 14) ? 'продукта' : 'продуктов'}</span></div>
  <div class="card" style="padding-top:2px;padding-bottom:2px">${S.home.map((h, j) => `<div class="ing">${pic(h[1], h[0], 40)}<div class="nm"><b>${esc(h[0])}</b>${h[3] ? '' : '<small>не нашла в справочнике</small>'}</div><button class="g" onclick="hfAmt(${j})">${esc(h[2] || 'сколько?')} ${IC.pen('#a49dbb', 12)}</button><button class="del" onclick="S.home.splice(${j},1);save();render(true)" aria-label="Убрать">${IC.x()}</button></div>`).join('') || '<div class="empty" style="margin:14px">Добавь продукты сверху</div>'}</div>
  ${H.size ? `<div class="sec">Можно приготовить<span>${R.length}</span></div>
  ${R.map(({r, miss}) => `<button class="dl" onclick="go('#/recipe/${r.id}')"><div class="im"><img src="${I(r.i)}" alt=""></div><div class="tx"><b>${esc(r.n)}</b><small>${r.t ? r.t + ' · ' : ''}${N(recTot(r).k / r.por)} ккал</small><span class="mtag ${miss.length ? 'o' : ''}">${miss.length ? 'докупить: ' + esc(miss.join(', ').toLowerCase()) : 'всё есть дома'}</span></div>${IC.chev}</button>`).join('') || '<div class="empty">Пока ничего не подходит. Добавь ещё продуктов</div>'}` : ''}</div>`;
}
let hfQ = '';
function hfAdd(k) {
  const v = (k || hfQ).trim(); if (!v) return;
  const key = k || ingFind(v), n = key || v[0].toUpperCase() + v.slice(1);
  if (S.home.some(h => nz(h[0]) === nz(n))) { toast('Уже есть в списке'); hfQ = ''; render(true); return; }
  S.home.unshift([n, key ? ING[key][0] : '', '', key || '']); hfQ = ''; save(); render(true);
  setTimeout(() => { const e = $('#hf'); if (e) { e.value = ''; e.focus(); } }, 30);
}
function hfAmt(j) { sheet(`<div class="sh"><div><b>${esc(S.home[j][0])}</b><small>сколько осталось</small></div></div><div style="padding:14px 20px 0"><div class="search" style="margin:0"><input id="ha" value="${esc(S.home[j][2])}" placeholder="Например, 500 г или 6 шт"></div><button class="btn" style="margin-top:14px" onclick="S.home[${j}][2]=$('#ha').value.trim();save();closeSheet();render(true)">Сохранить</button></div>`); }

// ---------- помощник: понимает «200 г творога, банан и кофе с молоком» ----------
const NUMW = {ноль: 0, один: 1, одна: 1, одну: 1, одно: 1, два: 2, две: 2, три: 3, четыре: 4, пять: 5, шесть: 6, семь: 7, восемь: 8, девять: 9, десять: 10, пятнадцать: 15, двадцать: 20, тридцать: 30, сорок: 40, пятьдесят: 50, шестьдесят: 60, семьдесят: 70, восемьдесят: 80, девяносто: 90, сто: 100, двести: 200, триста: 300, четыреста: 400, пятьсот: 500, шестьсот: 600, семьсот: 700, восемьсот: 800, девятьсот: 900, тысяча: 1000, пол: .5, половина: .5, половинку: .5, половину: .5, полтора: 1.5, полторы: 1.5, пара: 2, пару: 2, несколько: 2};
const STOPW = new Set(['я', 'съела', 'съел', 'ела', 'ел', 'выпила', 'выпил', 'пила', 'пил', 'на', 'завтрак', 'обед', 'ужин', 'перекус', 'сегодня', 'утром', 'днем', 'вечером', 'еще', 'ещё', 'потом', 'немного', 'чуть', 'кусочек', 'г', 'гр', 'грамм', 'граммов', 'грамма', 'кг', 'мл', 'л', 'литр', 'литра', 'шт', 'штук', 'штуки', 'штука', 'штучки', 'ложка', 'ложку', 'ложки', 'ложек', 'столовая', 'столовую', 'чайная', 'чайную', 'стакан', 'стакана', 'кружка', 'кружку', 'чашка', 'чашку', 'кусок', 'куска', 'кусочка', 'ломтик', 'ломтика', 'тарелка', 'тарелку', 'порция', 'порцию', 'порции', 'пачка', 'пачку', 'банка', 'банку', 'бутылка', 'бутылку']);
// все продукты, из которых выбираем: свои, блюда, справочник, овощи и фрукты
function asPool() {
  const L = [];
  S.my.forEach(f => L.push({n: f.n, mk: f.mk, f, pr: 0}));
  FOODS.forEach(f => L.push({n: f.n, mk: f.mk, f, pr: 1}));
  S.myRecipes.concat(RECIPES).forEach(r => { const t = recTot(r); if (!t.g) return; const z = 100 / t.g; L.push({n: r.n, f: {id: 'rcp' + r.id, n: r.n, i: r.i, k: t.k * z, p: t.p * z, f: t.f * z, c: t.c * z, por: Math.round(t.g / r.por), pn: '1 порция'}, pr: 2}); });
  PRODUCE.forEach(f => L.push({n: f.n, f: Object.assign({}, f, {por: f.g || 100, pn: f.u}), pr: 3}));
  Object.keys(ING).forEach(k => { const b = ING[k]; if (!b[1]) return; L.push({n: k, f: {id: 'ing' + k, n: k, i: b[0], k: b[1], p: b[2], f: b[3], c: b[4], por: 100, pn: '100 г'}, pr: 4}); });
  return L;
}
function asMatch(text, pool) {
  const W = nz(text).split(' ').filter(w => w.length >= 3 && !STOPW.has(w) && !(w in NUMW) && !/^\d/.test(w)).map(stem);
  if (!W.length) return [];
  const out = [];
  for (const c of pool) {
    const kw = words(c.n); if (!kw.length) continue;
    const ok = w => W.some(x => x.startsWith(stem(w)) || stem(w).startsWith(x));
    const hit = kw.filter(ok).length; if (!hit) continue;
    const used = W.filter(x => kw.some(w => x.startsWith(stem(w)) || stem(w).startsWith(x))).length;
    const first = stem(kw[0]), f0 = W[0] && (W[0].startsWith(first) || first.startsWith(W[0])) ? .6 : 0, ex = kw.filter(w => W.includes(stem(w))).length * .3;
    const bw = c.mk ? words(c.mk).filter(ok).length * .4 : 0;
    out.push({c, s: bw + used / W.length * 2 + hit / kw.length + f0 + ex - (kw.length - hit) * .15 - c.pr * .05});
  }
  if (!out.length) { const kb = sk(W.join('')); if (kb.length >= 3) pool.forEach(c => { if (sk(c.n).includes(kb)) out.push({c, s: .5 - c.pr * .05}); }); }
  const seen = new Set();
  return out.sort((a, b) => b.s - a.s).filter(x => { const k = nz(x.c.n); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 5).map(x => x.c.f);
}
function asAmount(text, f) {
  const t = nz(text).replace(/(^| )ст ?л( |$)/g, ' ложки ').replace(/(^| )ч ?л( |$)/g, ' чайные ложки ').replace(/\d+(?:[.,]\d+)?\s*процент\S*/g, ' '), T = t.split(' '), piece = PIECE[f.n];
  let n = null;
  const m = t.match(/(\d+(?:[.,]\d+)?)/); if (m) n = parseFloat(m[1].replace(',', '.'));
  else { let acc = 0, got = 0; T.forEach(w => { if (w in NUMW) { acc += NUMW[w]; got = 1; } }); if (got) n = acc; }
  const has = re => re.test(t);
  if (has(/(^| )(кг|килограмм\S*)( |$)/)) return (n || 1) * 1000;
  if (has(/(^| )(л|литр\S*)( |$)/)) return (n || 1) * 1000;
  if (has(/(^| )(г|гр|грамм\S*|мл|миллилитр\S*)( |$)/) || (n && n >= 30 && !has(/шт|штук|ложк|стакан|круж|чашк|кус|ломт|тарел|порц|пачк|банк|бутыл/))) return n || f.por;
  const k = n || 1;
  if (has(/чайн\S* ложк/)) return k * 5;
  if (has(/ложк|ложек/)) return k * 15;
  if (has(/стакан|кружк|кружек/)) return k * 250;
  if (has(/чашк|чашек/)) return k * 200;
  if (has(/кус|ломт/)) return k * (piece || /хлеб|батон|сыр/i.test(f.n) ? 30 : Math.min(f.por || 100, 120));
  if (has(/бутыл/)) return k * 500;
  return k * (piece || f.por || 100);
}
// как говорят → как называется в приложении
const SYN = [[/кофе с молоком/g, 'латте'], [/(^| )кофе( |$)/g, '$1американо$2'], [/овсянк\S*/g, 'овсяная каша'], [/гречк\S*/g, 'гречневая каша'], [/(^| )рис\S*/g, '$1рис отварной'],
  [/(^| )(яйц|яиц|яичк)\S*/g, '$1яйцо'], [/курочк\S*|куриц\S*/g, 'куриная грудка'], [/шоколадк\S*|шоколад(?!н)\S*/g, 'шоколадка'], [/(^| )чай\S*/g, '$1чай черный'], [/картошк\S*|картофел\S*/g, 'картофель'],
  [/пюрешк\S*/g, 'картофельное пюре'], [/макарош\S*|макарон\S*/g, 'макароны'], [/сметанк\S*/g, 'сметана'], [/творожок\S*/g, 'творог'], [/хлебушк\S*/g, 'хлеб'], [/на молоке|на воде/g, '']];
const PIECE = {'Яйцо': 55, 'Банан': 120, 'Яблоко': 180, 'Хлеб': 30, 'Хлеб белый': 30, 'Хлеб цельнозерновой': 30, 'Батон': 30};
const asSplit = v => v.split(/,|;|\.| и (?=\S)| а также | плюс | потом | ещё | еще /i).map(s => s.trim()).filter(s => words(s).length);
function asText(v) {
  v = (v || ($('#ain') && $('#ain').value) || '').trim(); if (!v) return;
  const pool = asPool(), items = [], miss = [];
  const syn = x => { let t = nz(x); SYN.forEach(([a, b]) => { t = t.replace(a, b); }); return t.trim(); };
  // «кофе с молоком», «творог с бананом»: сначала ищем целиком, иначе делим по «с»
  asSplit(v).map(syn).filter(Boolean).forEach(ch => {
    const all = asMatch(ch, pool), name = nz(ch);
    const whole = all[0] && / с /.test(nz(all[0].n)) && / с /.test(name) && words(all[0].n).every(w => name.includes(stem(w)));
    const parts = !whole && / с /.test(name) ? ch.split(/ с /i) : [ch];
    parts.forEach((p, j) => {
      const A = j === 0 && parts.length === 1 ? all : asMatch(p, pool);
      if (!A.length) { miss.push(p.trim()); return; }
      const g = Math.round(asAmount(j ? p : (parts.length > 1 ? parts[0] : ch), A[0]));
      items.push({f: A[0], alts: A.slice(1), g: j && !/\d/.test(p) ? Math.round(A[0].por * .5) : g, src: p.trim()});
    });
  });
  AS.msgs.push({me: v});
  if (items.length) AS.items = (AS.items || []).concat(items);
  AS.msgs.push({ai: items.length ? `Нашла: ${items.map(x => x.f.n.toLowerCase()).join(', ')}. Проверь граммы ниже.${miss.length ? ` Не поняла: «${miss.join('», «')}». Напиши по-другому.` : ''}` : `Не узнала «${v}». Попробуй проще, например «150 г творога и банан».`});
  const e = $('#ain'); if (e) e.value = '';
  render(true); asScroll();
}
let AS = null;
function scrAssistant() {
  if (!AS) AS = {m: barMeal(), items: null, msgs: []};
  let h = `<div class="bub ai">Что ты съела? Скажи или напиши, например: «200 г творога, банан и кофе с молоком».</div>`;
  AS.msgs.forEach(x => h += x.me ? `<div class="bub me">${esc(x.me)}</div>` : `<div class="bub ai">${esc(x.ai)}</div>`);
  if (AS.items && AS.items.length) {
    const E = AS.items.map(x => entryF(x.f, x.g)), s = sumE(E);
    h += `<div class="ask"><b>Итого ${N(s.k)} ккал</b>${AS.items.map((x, j) => `<div class="ing tb">${pic(x.f.i, x.f.n, 36)}<div class="nm"><b style="font-size:14px">${esc(x.f.mk ? x.f.mk + ' ' + x.f.n : x.f.n)}</b>${x.alts.length ? `<small><button style="color:var(--pri);font-weight:800" onclick="asAlt(${j})">не то?</button></small>` : ''}</div><label class="g"><input type="number" inputmode="numeric" value="${x.g}" onchange="AS.items[${j}].g=Math.max(0,+this.value||0);render(true)">г</label><div class="kc">${N(E[j].k)}</div><button class="del" onclick="AS.items.splice(${j},1);render(true)" aria-label="Убрать">${IC.x()}</button></div>`).join('')}
    <div class="chips" style="padding:0;margin-top:8px">${MEALS.map(m => `<button class="chip ${AS.m === m.id ? 'pri' : ''}" onclick="AS.m='${m.id}';render(true)">${m.n}</button>`).join('')}</div>
    <button class="btn" style="margin-top:12px;height:48px" onclick="asAdd()">Добавить ${MEALS.find(m => m.id === AS.m).v}</button></div>`;
  }
  return `<div class="scr anim" id="asc" style="padding-bottom:110px">${topb('Помощник')}<div class="chat">${h}</div></div>
  <div class="inbar"><div class="search"><input id="ain" placeholder="${AS.rec ? 'Слушаю…' : 'Напиши или скажи…'}" onkeydown="if(event.key==='Enter')asText()"></div><button class="mic ${AS.rec ? 'rec' : ''}" onclick="asMic()" aria-label="Сказать">${AS.rec ? IC.send : IC.mic()}</button></div>`;
}
function asAlt(j) {
  const x = AS.items[j];
  window._aa = k => { const f = x.alts[k]; x.alts[k] = x.f; x.f = f; closeSheet(); render(true); };
  sheet(`<div class="sh"><div><b>Что именно?</b><small>${esc(x.src)}</small></div></div><div class="card" style="padding-top:2px;padding-bottom:2px">${x.alts.map((f, k) => `<button class="ing" style="width:100%;text-align:left" onclick="_aa(${k})">${pic(f.i, f.n, 40)}<div class="nm"><b>${esc(f.mk ? f.mk + ' ' + f.n : f.n)}</b><small>${N(f.k)} ккал в 100 г</small></div></button>`).join('')}</div>`);
}
function asScroll() { const s = $('#asc'); if (s) s.scrollTop = s.scrollHeight; }
let asRec = null;
function asMic() {
  const e = $('#ain'), v = e && e.value.trim();
  if (asRec) { try { asRec.stop(); } catch (er) {} return; }
  if (v) { asText(); return; }
  if (capSR()) { capMic(); return; }
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { toast('Голос тут не работает. Напиши текстом'); if (e) e.focus(); return; }
  const r = new SR(); asRec = r; r.lang = 'ru-RU'; r.interimResults = true; r.maxAlternatives = 1;
  let txt = '';
  r.onresult = ev => { txt = [...ev.results].map(x => x[0].transcript).join(' '); const i = $('#ain'); if (i) i.value = txt; };
  r.onerror = ev => { if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') toast('Разреши микрофон в настройках браузера'); else if (ev.error !== 'no-speech' && ev.error !== 'aborted') toast('Не расслышала. Попробуй ещё раз'); };
  r.onend = () => { asRec = null; AS.rec = 0; render(true); if (txt.trim()) asText(txt); };
  AS.rec = 1; render(true);
  try { r.start(); } catch (er) { asRec = null; AS.rec = 0; render(true); toast('Микрофон занят. Попробуй ещё раз'); }
}
// в приложении для Android голос идёт через системное распознавание
function capSR() { const C = window.Capacitor; if (!C || !C.isNativePlatform || !C.isNativePlatform()) return null; return (C.Plugins && C.Plugins.SpeechRecognition) || (C.registerPlugin && C.registerPlugin('SpeechRecognition')); }
async function capMic() {
  const P = capSR();
  try {
    const av = await P.available(); if (!av || !av.available) { toast('На телефоне нет распознавания речи. Напиши текстом'); return; }
    const pr = await P.requestPermissions(); if (pr && pr.speechRecognition && pr.speechRecognition !== 'granted') { toast('Разреши микрофон для приложения'); return; }
    AS.rec = 1; render(true); asRec = {stop: () => P.stop()};
    const r = await P.start({language: 'ru-RU', maxResults: 1, partialResults: false, popup: false});
    asRec = null; AS.rec = 0; render(true);
    const t = r && r.matches && r.matches[0]; if (t) { const i = $('#ain'); if (i) i.value = t; asText(t); }
  } catch (e) { asRec = null; AS.rec = 0; render(true); toast('Не расслышала. Попробуй ещё раз'); }
}
function asAdd() { AS.items.forEach(x => day(sel).meals[AS.m].push(entryF(x.f, x.g))); save(); toast(`Добавлено ${MEALS.find(m => m.id === AS.m).v}`); AS = null; root('#/home'); }

// ---------- распознавание текста с фото (Tesseract, работает прямо в телефоне) ----------
let tessP = null;
function ocrLoad() {
  if (window.Tesseract) return Promise.resolve();
  return tessP || (tessP = new Promise((ok, bad) => { const s = document.createElement('script'); s.src = 'vendor/tess/tesseract.min.js'; s.onload = ok; s.onerror = () => { tessP = null; bad(); }; document.head.appendChild(s); }));
}
async function ocrRead(file, onp) {
  await ocrLoad();
  const base = location.href.replace(/[#?].*$/, '').replace(/[^/]*$/, '') + 'vendor/tess/';
  const w = await Tesseract.createWorker('rus', 1, {workerPath: base + 'worker.min.js', corePath: base, langPath: base, logger: m => { if (onp && m.status === 'recognizing text') onp(Math.round(m.progress * 100)); }});
  try { const r = await w.recognize(file); return r.data.text || ''; } finally { w.terminate(); }
}
// выбрать фото: камера или галерея
function pickPhoto(cb) {
  const i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*';
  i.onchange = () => { if (i.files && i.files[0]) cb(i.files[0]); }; i.click();
}
function ocrBusy(t) { sheet(`<div class="sh"><div><b>Читаю текст с фото…</b><small id="ocrp">${t || 'первый раз загружается около 8 МБ'}</small></div></div><div style="padding:20px;display:flex;justify-content:center"><div class="prog" style="width:100%;margin:0"><i id="ocrb" style="width:5%"></i></div></div>`); }
const ocrProg = p => { const a = $('#ocrp'), b = $('#ocrb'); if (a) a.textContent = p + '%'; if (b) b.style.width = Math.max(5, p) + '%'; };
const numF = s => parseFloat(String(s).replace(',', '.'));

// этикетка: находим калории, белки, жиры, углеводы и вес
function labParse(t) {
  t = t.toLowerCase().replace(/ё/g, 'е').replace(/[|]/g, ' ').replace(/(\d)\s*[,.]\s*(\d)/g, '$1,$2');
  const one = re => { const m = t.match(re); return m ? numF(m[1]) : null; };
  const r = {};
  r.k = one(/(\d{2,4}(?:,\d)?)\s*к?\s*кал/) ?? one(/(?:калорийн|энергетическ)\S*[^0-9]{0,40}?(?:\d+(?:,\d)?\s*кдж\S*\s*[/(]?\s*)?(\d{2,4}(?:,\d)?)/);
  r.p = one(/бел\S*[^0-9]{0,15}(\d{1,2}(?:,\d+)?)/);
  r.f = one(/жир\S*[^0-9]{0,15}(\d{1,2}(?:,\d+)?)/);
  r.c = one(/углевод\S*[^0-9]{0,15}(\d{1,3}(?:,\d+)?)/);
  const w = t.match(/(?:масса|нетто|вес|объем)[^0-9]{0,20}(\d+(?:,\d+)?)\s*(кг|г|гр|мл|л)(?![а-яa-z])/);
  if (w) r.w = Math.round(numF(w[1]) * (w[2] === 'кг' || w[2] === 'л' ? 1000 : 1));
  if (r.k === null && r.p !== null && r.f !== null && r.c !== null) r.k = Math.round(r.p * 4 + r.f * 9 + r.c * 4);
  return r;
}
function labPhoto() {
  pickPhoto(async file => {
    ocrBusy();
    let t = '';
    try { t = await ocrRead(file, ocrProg); } catch (e) { closeSheet(); toast('Не получилось прочитать. Проверь интернет'); return; }
    closeSheet();
    const r = labParse(t), got = ['k', 'p', 'f', 'c'].filter(k => r[k] !== null && r[k] !== undefined);
    if (!got.length) { toast('Не нашла КБЖУ. Сфоткай ближе и ровнее'); return; }
    const keep = id => $('#' + id) ? $('#' + id).value : '';
    LB = Object.assign({}, LB || {}, {n: keep('ln') || (LB && LB.n) || '', mk: keep('lb') || (LB && LB.mk) || ''}, r.w ? {w: r.w} : {}, ...got.map(k => ({[k]: r[k]})));
    render(true); const put = (id, v) => { const e = $('#' + id); if (e && v !== undefined && v !== null) e.value = String(v).replace('.', ','); }; put('lk', r.k); put('lpr', r.p); put('lf', r.f); put('lc', r.c); if (r.w) put('lw', r.w);
    toast(got.length === 4 ? 'Заполнила КБЖУ. Проверь цифры' : 'Нашла не всё. Допиши остальное');
  });
}

// скриншот рецепта: название, продукты с граммами и шаги → редактор рецепта
function recParse(t) {
  const L = t.split('\n').map(s => s.replace(/[•·●▪■◦*–—-]+\s*/g, ' ').replace(/\s+/g, ' ').trim()).filter(s => s.length > 1);
  const ing = [], steps = [], seen = new Set();
  let title = '', mode = '', por = 0;
  for (const s of L) {
    const low = nz(s);
    if (/^(ингредиент|продукт|состав|понадобит|вам понадоб)/.test(low)) { mode = 'i'; continue; }
    if (/^(приготовлени|способ приготов|как приготов|шаг|рецепт приготов)/.test(low)) { mode = 's'; continue; }
    const pm = low.match(/(\d+)\s*(порци|персон)/); if (pm) { por = +pm[1]; if (low.length < 25) continue; }
    const amt = /\d|по вкусу|щепот|ложк|стакан|шт/.test(low);
    const key = ingFind(s);
    if (mode !== 's' && key && amt && s.length < 60) {
      if (seen.has(key)) continue; seen.add(key);
      const b = ING[key], f = {n: key, por: PIECE[key] || 100};
      const g = /по вкусу|щепот/.test(low) ? (PANTRY.has(key) ? 3 : 10) : Math.round(asAmount(s.replace(/\d+(?:[.,]\d+)?\s*%/g, ' '), f));
      ing.push([key, b[0], Math.min(g, 3000), b[1], b[2], b[3], b[4], b[5] || '']);
      continue;
    }
    if (!title && !amt && s.length >= 4 && s.length <= 60 && !mode) { title = s; continue; }
    if (mode === 's' || (s.length > 40 && !key)) steps.push(s.replace(/^\d+[.)]\s*/, ''));
  }
  return {title, ing, steps: steps.slice(0, 30), por};
}
function scrScan() {
  return `<div class="scr anim">${topb('Скриншот рецепта')}
  <div class="card" style="text-align:center;padding:24px 18px">
  <img src="${I('Д1_Сырники')}" style="width:120px;height:120px;object-fit:contain" alt="">
  <div style="font-size:18px;font-weight:900;margin-top:6px">Сделай скриншот рецепта</div>
  <div class="muted" style="font-size:14px;margin-top:6px">из соцсетей, сайта или книги. Я прочитаю продукты и граммы и посчитаю КБЖУ.</div>
  <button class="btn" style="margin-top:16px" onclick="scanPick()">${IC.cam('#fff', 18)} Выбрать скриншот</button></div>
  <button class="rowlink" onclick="go('#/labelres')"><span class="ci" style="background:#efe9ff">${IC.cam('#6a4be0', 20)}</span><b>Этикетка продукта</b><span>КБЖУ с упаковки</span>${IC.chev}</button>
  <div class="muted" style="margin:14px 22px 0;font-size:13px">Лучше всего читается чёткий текст: список продуктов с граммами. Всё можно поправить перед сохранением.</div></div>`;
}
function scanPick() {
  pickPhoto(async file => {
    ocrBusy();
    let t = '';
    try { t = await ocrRead(file, ocrProg); } catch (e) { closeSheet(); toast('Не получилось прочитать. Проверь интернет'); return; }
    closeSheet();
    const r = recParse(t);
    if (!r.ing.length) { toast('Не нашла продукты с граммами. Попробуй другой скриншот'); return; }
    ED = {id: '', n: r.title.slice(0, 80), t: '', por: r.por || 2, ing: r.ing, st: r.steps.join('\n'), share: true, fold: ''};
    toast(`Нашла продуктов: ${r.ing.length}. Проверь граммы`); go('#/recnew');
  });
}
