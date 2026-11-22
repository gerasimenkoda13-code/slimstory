'use strict';
// ---------- кафе: рядом (OpenStreetMap) + меню сетей с КБЖУ + обычное кафе ----------
// Данные карты: © участники OpenStreetMap (лицензия ODbL), поиск через Nominatim, запасной — Overpass API.
let CHAINS = (typeof CHAIN_DATA !== 'undefined') ? CHAIN_DATA : [];
let NEAR = null; try { NEAR = JSON.parse(localStorage.getItem('ss_near') || 'null'); } catch (e) {}
let nearBusy = 0, cafeQ = '';
const OVP = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter'];
function distM(a, b, c, d) { const R = 6371e3, r = Math.PI / 180, x = Math.sin((c - a) * r / 2) ** 2 + Math.cos(a * r) * Math.cos(c * r) * Math.sin((d - b) * r / 2) ** 2; return 2 * R * Math.asin(Math.sqrt(x)); }
const kmT = m => m < 1000 ? Math.round(m / 10) * 10 + ' м' : (m / 1000).toFixed(1).replace('.', ',') + ' км';
const chainOf = name => CHAINS.find(c => c.re.test(name || ''));
// спрашиваем два сервера карты сразу и берём ответ того, кто быстрее
function ovFetch(q) {
  return new Promise((ok, bad) => {
    let left = OVP.length; const ac = new AbortController(), t = setTimeout(() => ac.abort(), 45000);
    OVP.forEach(u => fetch(u + '?data=' + encodeURIComponent(q), {signal: ac.signal}).then(r => r.ok ? r.json() : Promise.reject()).then(j => { clearTimeout(t); ac.abort(); ok(j); })
      .catch(() => { if (--left === 0) { clearTimeout(t); bad(new Error('ovp')); } }));
  });
}
// поиск OpenStreetMap (Nominatim): быстрый, по запросам «кафе», «ресторан», «фастфуд» в квадрате вокруг
async function nomFind(la, lo) {
  const d = .012, vb = [lo - d * 1.8, la + d, lo + d * 1.8, la - d].join(','), out = new Map();
  for (const [q, a] of [['кафе', 'cafe'], ['ресторан', 'restaurant'], ['fast food', 'fast_food']]) {
    const r = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=40&bounded=1&addressdetails=1&accept-language=ru&viewbox=${vb}&q=${encodeURIComponent(q)}`);
    if (!r.ok) throw new Error('nom');
    (await r.json()).forEach(x => { if (!x.name || out.has(x.osm_id)) return; const ad = x.address || {};
      out.set(x.osm_id, {id: (x.osm_type || 'n')[0] + x.osm_id, n: x.name, a: x.type in AM ? x.type : a, cu: '', br: '', d: Math.round(distM(la, lo, +x.lat, +x.lon)), addr: [ad.road, ad.house_number].filter(Boolean).join(', ')}); });
    await new Promise(z => setTimeout(z, 1100)); // не чаще 1 запроса в секунду
  }
  return [...out.values()];
}
function nearFind() {
  if (nearBusy) return;
  if (!navigator.geolocation) { toast('Телефон не даёт место. Выбери «Другое кафе»'); return; }
  nearBusy = 1; render(true); 
  navigator.geolocation.getCurrentPosition(async p => {
    const la = +p.coords.latitude.toFixed(4), lo = +p.coords.longitude.toFixed(4);
    try {
      let L = await nomFind(la, lo).catch(() => []);
      if (!L.length) {
        const j = await ovFetch(`[out:json][timeout:20];nwr(around:1200,${la},${lo})[amenity~"^(cafe|restaurant|fast_food|food_court)$"][name];out center tags 120;`);
        L = j.elements.map(e => { const y = e.lat ?? (e.center && e.center.lat), x = e.lon ?? (e.center && e.center.lon), t = e.tags || {};
          return {id: e.type[0] + e.id, n: t.name, a: t.amenity, cu: t.cuisine || '', br: t.brand || '', d: Math.round(distM(la, lo, y, x)), addr: [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(', ')}; });
      }
      L = L.filter(x => x.n).sort((a, b) => a.d - b.d);
      if (!L.length) throw new Error('empty');
      NEAR = {at: Date.now(), L}; try { localStorage.setItem('ss_near', JSON.stringify(NEAR)); } catch (e) {}
    } catch (e) { toast('Карта сейчас не отвечает. Попробуй через минуту'); }
    nearBusy = 0; render(true);
  }, err => { nearBusy = 0; render(true); toast(err.code === 1 ? 'Разреши доступ к месту в настройках браузера' : 'Не получилось найти, где ты'); }, {enableHighAccuracy: false, timeout: 15000, maximumAge: 600000});
}
const AM = {cafe: 'кафе', restaurant: 'ресторан', fast_food: 'фастфуд', food_court: 'фудкорт'};
function scrCafe(m) {
  const M = MEALS.find(x => x.id === m) || MEALS[0], qq = cafeQ.trim();
  const near = (NEAR && NEAR.L || []).filter(x => !qq || fits(x.n + ' ' + x.br, qq));
  const ch = CHAINS.filter(c => !qq || fits(c.n, qq));
  const row = x => { const c = chainOf(x.n + ' ' + x.br); return `<button class="dl" onclick="go('#/cafem/${c ? c.id : 'o_' + x.id}/${M.id}')"><div class="im" style="width:56px;height:56px;border-radius:16px"><img src="${I(c ? c.i : x.a === 'cafe' ? 'Д10_Капучино' : x.a === 'fast_food' ? 'Д8_Бургер' : 'Д3_Стейк из говядины')}" alt=""></div><div class="tx"><b>${esc(x.n)}</b><small>${AM[x.a] || 'кафе'} · ${kmT(x.d)}${x.addr ? ' · ' + esc(x.addr) : ''}</small>${c ? '<span class="mtag">меню с КБЖУ</span>' : ''}</div>${IC.chev}</button>`; };
  return `<div class="scr anim">${topb('Кафе и рестораны', 'для ' + M.n.toLowerCase().replace('завтрак', 'завтрака').replace('обед', 'обеда').replace('ужин', 'ужина').replace('перекус', 'перекуса'))}
  <div class="search">${IC.search}<input placeholder="Название кафе или сети" value="${esc(cafeQ)}" oninput="cafeQ=this.value;render(true)"></div>
  <button class="rowlink" onclick="nearFind()"><span class="ci">${IC.pin}</span><b>${nearBusy ? 'Ищу кафе рядом…' : NEAR ? 'Обновить кафе рядом' : 'Найти кафе рядом'}</b><span>${NEAR ? 'найдено ' + NEAR.L.length : 'по карте'}</span>${IC.chev}</button>
  ${ch.length ? `<div class="sec">Сети с меню и КБЖУ</div>${ch.map(c => `<button class="dl" onclick="go('#/cafem/${c.id}/${M.id}')"><div class="im" style="width:56px;height:56px;border-radius:16px"><img src="${I(c.i)}" alt=""></div><div class="tx"><b>${esc(c.n)}</b><small>${c.menu.length} позиций · КБЖУ с сайта сети</small></div>${IC.chev}</button>`).join('')}` : ''}
  ${near.length ? `<div class="sec">Рядом</div>${near.slice(0, 60).map(row).join('')}` : ''}
  <button class="dl" onclick="go('#/cafem/any/${M.id}')"><div class="im" style="width:56px;height:56px;border-radius:16px"><img src="${I('Д2_Борщ')}" alt=""></div><div class="tx"><b>Другое кафе</b><small>выбери блюдо из базы, порция как в кафе</small></div>${IC.chev}</button>
  <div class="muted" style="margin:14px 22px 0;font-size:12px">Карта: © участники OpenStreetMap. Место отправляется на карту только для поиска кафе.</div></div>`;
}
// блюдо сети → продукт для окна «Сколько съела»
function chainFood(c, j) {
  const x = c.menu[j], [n, g, k, p, f, cb] = x, z = 100 / (g || 100);
  const fd = {id: 'cf_' + c.id + '_' + j, n, mk: c.n, i: x[6] || c.i, k: k * z, p: p * z, f: f * z, c: cb * z, por: g || 100, pn: '1 порция', brand: 'с сайта кафе'};
  OFFC[fd.id] = fd; return fd;
}
let cafeDQ = '';
function scrCafeMenu(id, m) {
  const c = CHAINS.find(x => x.id === id);
  if (c) {
    return `<div class="scr anim" style="padding-bottom:110px">${topb(c.n, 'КБЖУ с сайта сети, на порцию')}
    <div class="card" style="padding-top:2px;padding-bottom:2px">${c.menu.map((x, j) => `<button class="ing" style="width:100%;text-align:left" onclick="cafeEat('${id}',${j},'${m}')">${pic(x[6] || c.i, x[0], 48)}<div class="nm"><b>${esc(x[0])}</b><small>${x[1]} г · Б ${D1(x[3])} · Ж ${D1(x[4])} · У ${D1(x[5])}</small></div><div class="kc">${N(x[2])} ккал</div></button>`).join('')}</div>
    <div class="muted" style="margin:10px 22px 0;font-size:12px">${esc(c.src || '')}</div></div>
    <div class="btns"><button class="btn" onclick="back()">Готово</button></div>`;
  }
  // обычное кафе: блюда из базы, порция как в кафе
  const o = id.startsWith('o_') && NEAR && NEAR.L.find(x => 'o_' + x.id === id);
  const kind = o ? o.a : 'restaurant', cu = o ? o.cu : '';
  const pool = asPool().filter(x => (x.pr === 1 || x.pr === 2) && !x.f.mk && x.f.brand !== 'с упаковки');
  const q2 = cafeDQ.trim();
  let L = q2 ? pool.filter(x => fits(x.n, q2)) : pool.filter(x => {
    const r = x.f.id.startsWith('rcp') && recipe(x.f.id.slice(3)), tg = r ? r.tags || [] : [];
    if (kind === 'cafe') return tg.includes('десерт') || tg.includes('напиток') || tg.includes('завтрак') || /кофе|капуч|латте|сырник|омлет|круасс|чизкейк|салат/i.test(x.n);
    if (kind === 'fast_food') return /бургер|пицц|шаурм|хот-дог|фри|наггет|кебаб|чизбург|буррито|тако|ролл|крыл|сэндвич|(^| )кола|лимонад|капучино|латте/i.test(x.n) || /^Д8_/.test(x.f.i || '');
    if (/sushi|japan/.test(cu)) return /ролл|суш|сашими|мисо|поке|удон|рамен|том ям/i.test(x.n);
    if (/pizza|italian/.test(cu)) return /пицц|паст|ризотто|лазан|карбонар|болоньез|тирамису|капрезе|салат/i.test(x.n);
    return !tg.includes('напиток');
  });
  const seen = new Set(); L = L.filter(x => { const k = nz(x.n); if (seen.has(k)) return false; seen.add(k); return true; }).slice(0, 60);
  return `<div class="scr anim" style="padding-bottom:110px">${topb(o ? o.n : 'Другое кафе', 'порция как в кафе')}
  <div class="search">${IC.search}<input placeholder="Что заказала?" value="${esc(cafeDQ)}" oninput="cafeDQ=this.value;render(true)"></div>
  <div class="card" style="padding-top:2px;padding-bottom:2px">${L.map(x => { const g = cafePor(x.f); return `<button class="ing" style="width:100%;text-align:left" onclick="cafeAny(${q(x.f.id)},'${m}')">${pic(x.f.i, x.f.n, 48)}<div class="nm"><b>${esc(x.f.n)}</b><small>${g} г</small></div><div class="kc">${N(x.f.k * g / 100)} ккал</div></button>`; }).join('') || '<div class="empty" style="margin:14px">Не нашлось. Напиши по-другому</div>'}</div>
  <div class="muted" style="margin:10px 22px 0;font-size:12px">Калории примерные: в кафе порции и рецепты бывают разные. Граммы можно поменять.</div></div>
  <div class="btns"><button class="btn" onclick="back()">Готово</button></div>`;
}
// в кафе порции обычно больше домашних
const cafePor = f => Math.round((f.por || 200) * (/напит|кофе|капуч|латте|чай|сок|кола|лимонад/i.test(f.n) ? 1 : 1.2) / 10) * 10;
function cafeAny(fid, m) { const f = asPool().find(x => x.f.id === fid); if (!f) return; const fd = Object.assign({}, f.f, {id: 'cafe_' + f.f.id, brand: 'в кафе, примерно'}); OFFC[fd.id] = fd; qtySheet(fd.id, m, 'Порция как в кафе, примерно'); QS.g = cafePor(fd); drawQty(); }
function cafeEat(id, j, m) { const c = CHAINS.find(x => x.id === id), fd = chainFood(c, j); qtySheet(fd.id, m, 'КБЖУ с сайта ' + c.n); }
