'use strict';
// ---------- база товаров Open Food Facts и сканер штрихкода ----------
// Данные: Open Food Facts (openfoodfacts.org), лицензия ODbL.
let OFF = null, OFFload = null;
const OFFC = {}; // товары из базы, которые сейчас на экране
const unq = s => String(s || '').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
function offLoad() {
  if (OFFload) return OFFload;
  OFFload = fetch('data/off.json').then(r => r.ok ? r.json() : []).catch(() => [])
    .then(a => (OFF = a.map(x => { x[1] = unq(x[1]); x[2] = unq(x[2]); return x; }).map(x => ({x, h: nz(x[2] + ' ' + x[1]), s: sk(x[2] + ' ' + x[1])}))));
  return OFFload;
}
function offFood(x) {
  const por = Math.min(x[8] || x[7] || 100, 1000);
  const f = {id: 'off' + x[0], code: x[0], n: x[1], mk: x[2], k: x[3], p: x[4], f: x[5], c: x[6], por, pn: x[8] ? '1 порция' : x[7] ? '1 упаковка' : '100 г', i: '', brand: 'с упаковки', off: 1};
  OFFC[f.id] = f; return f;
}
function offSearch(q, lim = 40) {
  if (!OFF || !OFF.length) return [];
  const b = nz(q); if (b.length < 2) return [];
  const words = b.split(' '), kb = b.replace(/\s/g, '').length >= 4 ? sk(b) : '', res = [];
  const r2 = []; // сначала точные совпадения, потом похожие по звучанию
  for (const o of OFF) {
    if (words.every(w => o.h.includes(w))) { res.push(o.x); if (res.length >= lim) break; }
    else if (r2.length < lim && ((kb.length >= 3 && o.s.includes(kb)) || wordsFit(o.h, o.s, b))) r2.push(o.x);
  }
  return res.concat(r2).slice(0, lim).map(offFood);
}
// товар из базы попадает в «Мои продукты», чтобы был под рукой и без интернета
function keepFood(f) {
  if (!f || !f.off) return f;
  let m = S.my.find(x => x.id === f.id);
  if (!m) { m = Object.assign({}, f); delete m.off; S.my.unshift(m); save(); }
  return m;
}

// ---------- сканер ----------
const BAR = {stream: null, timer: 0, reader: null, done: false};
function scrBar() {
  const corner = s => `<div style="position:absolute;width:34px;height:34px;${s}"></div>`;
  return `<div class="camv anim" id="cv"><video id="bv" playsinline muted autoplay style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></video>
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 60% 22% at 50% 42%,transparent 98%,rgba(20,14,40,.55) 100%)"></div>
  <div style="position:absolute;top:max(env(safe-area-inset-top),30px);left:20px;right:20px;display:flex;justify-content:space-between;align-items:center"><button class="back" onclick="back()" aria-label="Закрыть">${IC.x('#fff', 18)}</button><b style="font-size:18px;font-weight:900">Штрихкод</b><div style="width:42px"></div></div>
  <div style="position:absolute;top:calc(42% - 90px);left:40px;right:40px;height:180px">
  ${corner('left:0;top:0;border-left:4px solid #4fd1b0;border-top:4px solid #4fd1b0;border-radius:14px 0 0 0')}${corner('right:0;top:0;border-right:4px solid #4fd1b0;border-top:4px solid #4fd1b0;border-radius:0 14px 0 0')}${corner('left:0;bottom:0;border-left:4px solid #4fd1b0;border-bottom:4px solid #4fd1b0;border-radius:0 0 0 14px')}${corner('right:0;bottom:0;border-right:4px solid #4fd1b0;border-bottom:4px solid #4fd1b0;border-radius:0 0 14px 0')}
  <div class="scanline"></div></div>
  <div id="bh" style="position:absolute;top:calc(42% + 110px);left:20px;right:20px;text-align:center;font-weight:800;font-size:15px">Наведи камеру на штрихкод</div>
  <div style="position:absolute;bottom:calc(30px + env(safe-area-inset-bottom));left:20px;right:20px;display:flex;gap:10px">
  <button class="btn w" style="flex:1" onclick="barManual()">Ввести цифры</button><button class="btn w" style="flex:1" onclick="LB={};go('#/labelres')">Нет штрихкода</button></div></div>`;
}
function barHint(t) { const h = $('#bh'); if (h) h.textContent = t; }
async function barStart() {
  if (BAR.stream || BAR.reader) return;
  BAR.done = false;
  const v = $('#bv'); if (!v) return;
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { barHint('Камера недоступна. Введи цифры штрихкода'); return; }
  const cons = {video: {facingMode: {ideal: 'environment'}, width: {ideal: 1280}, height: {ideal: 720}}, audio: false};
  let fmts = [];
  try { if ('BarcodeDetector' in window) fmts = await BarcodeDetector.getSupportedFormats(); } catch (e) {}
  try {
    if (fmts.includes('ean_13')) { // Android Chrome: встроенный распознаватель
      BAR.stream = await navigator.mediaDevices.getUserMedia(cons);
      if (route()[0] !== 'bar') { barStop(); return; }
      v.srcObject = BAR.stream; await v.play().catch(() => {});
      const det = new BarcodeDetector({formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128']});
      const tick = async () => {
        if (BAR.done || !BAR.stream) return;
        try { const r = await det.detect(v); if (r.length) return barFound(r[0].rawValue); } catch (e) {}
        BAR.timer = setTimeout(tick, 250);
      };
      tick();
    } else { // iPhone и остальные: библиотека ZXing
      await loadZX();
      const hints = new Map(); hints.set(ZXing.DecodeHintType.POSSIBLE_FORMATS, [ZXing.BarcodeFormat.EAN_13, ZXing.BarcodeFormat.EAN_8, ZXing.BarcodeFormat.UPC_A, ZXing.BarcodeFormat.UPC_E, ZXing.BarcodeFormat.CODE_128]);
      BAR.reader = new ZXing.BrowserMultiFormatReader(hints, 300);
      if (route()[0] !== 'bar') { barStop(); return; }
      await BAR.reader.decodeFromConstraints(cons, v, (res) => { if (res && !BAR.done) barFound(res.getText()); });
    }
  } catch (e) {
    barStop();
    barHint(e && e.name === 'NotAllowedError' ? 'Разреши доступ к камере в настройках браузера' : 'Камера недоступна. Введи цифры штрихкода');
  }
}
let zxP = null;
function loadZX() {
  if (window.ZXing) return Promise.resolve();
  return zxP || (zxP = new Promise((ok, bad) => { const s = document.createElement('script'); s.src = 'vendor/zxing.min.js'; s.onload = ok; s.onerror = bad; document.head.appendChild(s); }));
}
function barStop() {
  clearTimeout(BAR.timer);
  if (BAR.reader) { try { BAR.reader.reset(); } catch (e) {} BAR.reader = null; }
  if (BAR.stream) { BAR.stream.getTracks().forEach(t => t.stop()); BAR.stream = null; }
}
function barManual() {
  sheet(`<div class="sh"><div><b>Цифры под штрихкодом</b><small>обычно 13 цифр</small></div></div>
  <div class="big-in"><input id="bc" inputmode="numeric" maxlength="14" placeholder="4600000000000"></div>
  <div style="padding:18px 20px 0"><button class="btn" onclick="const c=$('#bc').value.replace(/\\D/g,'');if(c.length<8){toast('Нужно 8–13 цифр');return}closeSheet();barFound(c)">Найти</button></div>`);
}
// что нашли по коду: сначала свои продукты и скачанная база, потом сайт Open Food Facts
async function barFound(code) {
  BAR.done = true; barStop();
  if (navigator.vibrate) navigator.vibrate(60);
  barHint('Ищу товар…');
  const meal = barMeal();
  let f = S.my.find(x => x.code === code);
  if (!f) { await offLoad(); const o = OFF && OFF.find(o => o.x[0] === code); if (o) f = offFood(o.x); }
  if (!f && navigator.onLine !== false) {
    try {
      const r = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}?fields=code,product_name,product_name_ru,brands,nutriments,quantity,serving_size`);
      const j = await r.json(), p = j && j.status === 1 && j.product;
      if (p) {
        const n = p.nutriments || {}, num = x => (x === undefined || x === '' || isNaN(+x)) ? null : Math.round(+x * 10) / 10;
        const kc = num(n['energy-kcal_100g']) ?? (num(n['energy_100g']) !== null ? Math.round(n['energy_100g'] / 4.184) : null);
        const gr = s => { const m = /(\d+(?:[.,]\d+)?)\s*(г|гр|g|мл|ml)\b/i.exec(s || ''); return m ? Math.round(+m[1].replace(',', '.')) : 0; };
        const name = (p.product_name_ru || p.product_name || '').trim(), mk = (p.brands || '').split(',')[0].trim();
        if (name && kc !== null && num(n.proteins_100g) !== null) f = offFood([code, name, mk, kc, num(n.proteins_100g), num(n.fat_100g) || 0, num(n.carbohydrates_100g) || 0, gr(p.quantity), gr(p.serving_size)]);
        else { LB = {code, n: name, mk}; toast('Нашла товар, но без КБЖУ. Перепиши с упаковки'); back(); go('#/labelres'); return; }
      }
    } catch (e) { toast('Нет связи с базой. Можно ввести с упаковки'); }
  }
  if (!f) { LB = {code}; toast('Такого товара нет в базе. Перепиши с упаковки'); back(); go('#/labelres'); return; }
  if (!f.mk) { LB = {code, n: f.n, k: f.k, p: f.p, f: f.f, c: f.c, por: f.por}; toast('Укажи марку с упаковки'); back(); go('#/labelres'); return; }
  f = keepFood(f);
  back();
  setTimeout(() => qtySheet(f.id, meal), 60);
}
function barMeal() { for (let i = STK.length - 1; i >= 0; i--) { const p = STK[i].split('/'); if (p[0] === 'add') return p[1] || 'b'; } return ({5: 'b', 6: 'b', 7: 'b', 8: 'b', 9: 'b', 10: 'b', 11: 'l', 12: 'l', 13: 'l', 14: 'l', 15: 's', 16: 's', 17: 'd', 18: 'd', 19: 'd', 20: 'd'})[new Date().getHours()] || 's'; }
