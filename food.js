// ---------- фото еды: бесплатная нейросеть прямо в телефоне (MobileNet V2) ----------
// Сама нейросеть знает около 60 видов еды. Остальное — поиск. Когда выбираешь блюдо,
// приложение запоминает, как оно выглядит, и в следующий раз предлагает его первым.
const FMAP = {
  924: 'гуакамоле|авокадо', 925: 'бульон|суп', 926: 'суп|рагу', 927: 'тирамису|десерт|парфе', 928: 'мороженое|пломбир', 929: 'эскимо|мороженое',
  930: 'багет|хлеб|батон', 931: 'бублик|бейгл|сушки', 932: 'крендель|брецель', 933: 'чизбургер|бургер|гамбургер', 934: 'хот дог|сосиски|сосиска в тесте',
  935: 'пюре картофельное|пюре', 936: 'капуста', 937: 'брокколи', 938: 'цветная капуста', 939: 'кабачок|кабачки', 940: 'тыква', 941: 'тыква', 942: 'тыква',
  943: 'огурец|салат из огурцов', 944: 'артишок', 945: 'перец болгарский|перец', 947: 'шампиньоны|грибы', 992: 'шампиньоны|грибы', 997: 'шампиньоны|грибы', 996: 'шампиньоны|грибы', 995: 'шампиньоны',
  948: 'яблоко', 949: 'клубника', 950: 'апельсин|мандарин', 951: 'лимон', 952: 'инжир', 953: 'ананас', 954: 'банан', 955: 'манго', 956: 'яблоко', 957: 'гранат',
  959: 'карбонара|паста|спагетти|макароны', 960: 'шоколад|блины|сырники', 961: 'пельмени|вареники|тесто', 962: 'котлета|запеканка|тефтели', 963: 'пицца',
  964: 'пирог|жульен|киш', 965: 'буррито|шаурма|ролл|лаваш', 966: 'вино', 967: 'кофе|эспрессо|американо', 968: 'кофе|чай|капучино', 969: 'латте|капучино|какао|коктейль',
  504: 'кофе|чай|капучино', 440: 'пиво', 441: 'пиво', 907: 'вино', 737: 'кола|газировка|лимонад', 809: 'суп|борщ|каша|солянка', 659: 'салат|овсянка',
  567: 'яичница|омлет|картофель жареный|сырники', 909: 'лапша|вок|рис', 544: 'рагу|плов|гуляш', 521: 'суп|рагу', 469: 'суп', 891: 'вафли', 415: 'хлеб|булочка|круассан',
  599: 'мед', 987: 'кукуруза', 998: 'кукуруза', 118: 'краб|креветки', 121: 'краб', 122: 'креветки', 124: 'креветки', 113: 'улитки', 119: 'краб',
  390: 'рыба|скумбрия', 391: 'рыба|форель|лосось', 397: 'рыба', 923: '', 868: ''
};
let FM = null, FMP = null; // модель и обещание загрузки
function fmLoad() {
  if (FM) return Promise.resolve(FM);
  if (FMP) return FMP;
  const tfjs = window.tf ? Promise.resolve() : new Promise((ok, no) => { const s = document.createElement('script'); s.src = 'vendor/tf/tf.min.js'; s.onload = ok; s.onerror = () => no(new Error('нет сети')); document.head.appendChild(s); });
  FMP = tfjs.then(async () => {
    let m = null;
    try { m = await tf.loadGraphModel('indexeddb://ss-mnet'); } catch (e) { m = null; }
    if (!m) {
      m = await tf.loadGraphModel('vendor/mnet/model.json', {onProgress: p => fmProg(Math.round(p * 100))});
      try { await m.save('indexeddb://ss-mnet'); } catch (e) { /* место кончилось — просто скачаем снова */ }
    }
    FM = m; return m;
  }).catch(e => { FMP = null; throw e; });
  return FMP;
}
// фото → квадрат 224×224 по центру
function fmImg(file) {
  return new Promise((ok, no) => {
    const u = URL.createObjectURL(file), im = new Image();
    im.onload = () => {
      const s = Math.min(im.width, im.height), c = document.createElement('canvas'); c.width = c.height = 224;
      c.getContext('2d').drawImage(im, (im.width - s) / 2, (im.height - s) / 2, s, s, 0, 0, 224, 224);
      const prev = document.createElement('canvas'), k = Math.min(1, 480 / Math.max(im.width, im.height)); prev.width = im.width * k; prev.height = im.height * k;
      prev.getContext('2d').drawImage(im, 0, 0, prev.width, prev.height);
      URL.revokeObjectURL(u); ok({c, prev: prev.toDataURL('image/jpeg', .8)});
    };
    im.onerror = () => { URL.revokeObjectURL(u); no(new Error('не картинка')); };
    im.src = u;
  });
}
// что видит нейросеть: вероятности 1000 классов и «отпечаток» картинки
async function fmRun(canvas) {
  const m = await fmLoad();
  const x = tf.tidy(() => tf.browser.fromPixels(canvas).toFloat().div(255).expandDims(0));
  const [lg, pool] = m.execute({images: x}, ['module_apply_default/MobilenetV2/Logits/output', 'module_apply_default/MobilenetV2/Logits/AvgPool']);
  const pr = tf.tidy(() => tf.softmax(lg).dataSync()), emb = pool.dataSync().slice();
  tf.dispose([x, lg, pool]);
  let n = 0; for (const v of emb) n += v * v; n = Math.sqrt(n) || 1;
  return {pr, emb: Float32Array.from(emb, v => v / n)};
}
// память «как выглядят мои блюда» — только в этом телефоне
const FMEM_K = 'ss_fmem';
function fmemGet() { try { return JSON.parse(localStorage.getItem(FMEM_K) || '[]'); } catch (e) { return []; } }
function fmemPack(e) { let s = ''; for (const v of e) s += String.fromCharCode(Math.max(0, Math.min(255, Math.round(v * 400 + 128)))); return btoa(s); }
function fmemUnpack(b) { const s = atob(b), a = new Float32Array(s.length); for (let i = 0; i < s.length; i++) a[i] = (s.charCodeAt(i) - 128) / 400; return a; }
function fmemAdd(emb, f) {
  const L = fmemGet(); L.unshift({e: fmemPack(emb), f: {id: f.id, n: f.n, i: f.i, mk: f.mk || '', k: f.k, p: f.p, f: f.f, c: f.c, por: f.por, pn: f.pn}});
  for (let n = L.length; n > 150 && JSON.stringify(L).length > 400000; n--) L.pop();
  try { localStorage.setItem(FMEM_K, JSON.stringify(L.slice(0, 150))); } catch (e) { /* нет места */ }
}
function fmemNear(emb) {
  return fmemGet().map(x => { const a = fmemUnpack(x.e); let s = 0; for (let i = 0; i < a.length; i++) s += a[i] * emb[i]; return {f: x.f, s}; })
    .filter(x => x.s > .62).sort((a, b) => b.s - a.s);
}
// варианты: сначала свои похожие, потом то, что узнала нейросеть
function fmGuess(r) {
  const out = [], seen = new Set(), pool = asPool();
  const add = (f, s, why) => { const k = nz(f.n); if (seen.has(k)) return; seen.add(k); out.push({f, s, why}); };
  fmemNear(r.emb).slice(0, 3).forEach(x => add(x.f, 1 + x.s, 'mem'));
  const top = [...r.pr.keys()].sort((a, b) => r.pr[b] - r.pr[a]).slice(0, 12);
  top.forEach(i => {
    const q = FMAP[i - 1]; if (!q || r.pr[i] < .02) return; // 0 — «фон», поэтому i-1
    q.split('|').forEach((w, j) => asMatch(w, pool).slice(0, j ? 1 : 2).forEach(f => add(f, r.pr[i] - j * .01, 'ai')));
  });
  return out.sort((a, b) => b.s - a.s).slice(0, 5);
}
let FP = null; // текущее фото: {prev, r, opts, q, m}
function photoFood(m) {
  pickPhoto(async file => {
    sheet(`<div class="sh"><div><b>Смотрю на фото…</b><small id="ocrp">первый раз загружается около 14 МБ</small></div></div><div style="padding:20px;display:flex;justify-content:center"><div class="prog" style="width:100%;margin:0"><i id="ocrb" style="width:5%"></i></div></div>`);
    try {
      const {c, prev} = await fmImg(file), r = await fmRun(c);
      FP = {prev, r, opts: fmGuess(r), q: '', m: m || autoMeal()};
      closeSheet(); go('#/photo');
    } catch (e) { closeSheet(); toast('Не получилось посмотреть фото. Нужен интернет при первом запуске'); }
  });
}
const fmProg = p => { const a = $('#ocrp'), b = $('#ocrb'); if (a) a.textContent = 'загрузка ' + p + '%'; if (b) b.style.width = Math.max(5, p) + '%'; };
function autoMeal() { const h = new Date().getHours(); return h < 11 ? 'b' : h < 16 ? 'l' : h < 21 ? 'd' : 's'; }
function fpTile(f, j) {
  return `<button class="ing" style="width:100%;text-align:left" onclick="fpPick(${j})">${pic(f.i, f.n, 48)}<div class="nm"><b>${esc(f.n)}</b><small>${f.mk ? esc(f.mk) + ' · ' : ''}${f.pn || '100 г'} = ${f.por} г</small></div><div class="kc">${N(f.k * f.por / 100)} ккал</div></button>`;
}
function scrPhoto() {
  if (!FP) return `<div class="scr anim">${topb('Фото еды')}<div class="empty">Сфоткай тарелку</div><div style="padding:0 20px"><button class="btn" onclick="photoFood()">Сфоткать</button></div></div>`;
  const L = FP.q.trim() ? asMatch(FP.q, asPool()) : FP.opts.map(x => x.f);
  FP.list = L;
  return `<div class="scr anim" style="padding-bottom:110px">${topb('Фото еды')}
  <div class="card" style="padding:0;overflow:hidden"><img src="${FP.prev}" alt="" style="width:100%;max-height:240px;object-fit:cover;display:block"></div>
  <div class="chips" style="margin-top:12px">${MEALS.map(x => `<button class="chip ${FP.m === x.id ? 'pri' : ''}" onclick="FP.m='${x.id}';render(true)">${x.n}</button>`).join('')}</div>
  <div class="sec">${FP.q.trim() ? 'Нашлось' : L.length ? 'Это похоже на' : 'Не узнала, найди сама'}</div>
  <div class="card" style="padding-top:2px;padding-bottom:2px" id="fpl">${L.length ? L.map(fpTile).join('') : `<div class="empty">Напиши ниже, что на фото</div>`}</div>
  <div class="search" style="margin-top:12px">${IC.search}<input id="fpq" placeholder="Нет нужного? Напиши, что это" value="${esc(FP.q)}" oninput="FP.q=this.value;fpList()"></div>
  <div class="muted" style="text-align:center;margin:10px 20px 0;font-size:13px">Выбранное блюдо запомнится, и в следующий раз будет первым</div></div>`;
}
function fpList() { const L = FP.q.trim() ? asMatch(FP.q, asPool()) : FP.opts.map(x => x.f); FP.list = L; $('#fpl').innerHTML = L.length ? L.map(fpTile).join('') : `<div class="empty">Ничего не нашлось</div>`; }
function fpPick(j) {
  const f = FP.list[j]; if (!f) return;
  fmemAdd(FP.r.emb, f);
  const fd = Object.assign({}, f); if (!findFood(fd.id)) OFFC[fd.id] = fd;
  qtySheet(fd.id, FP.m, 'по фото');
}
