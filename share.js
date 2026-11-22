'use strict';
// ---------- свои рецепты: редактор и общая база (рецепты пользователей видны всем) ----------
let SHARED = [], ED = null;
try { SHARED = JSON.parse(localStorage.getItem('ss_shared') || '[]'); } catch (e) {}
const sharedList = () => SHARED.filter(r => !S.myRecipes.some(m => m.id === r.id));

// загрузить общие рецепты (раз в 10 минут, остальное время — из памяти телефона)
let shLoading = 0;
function sharedLoad(force) {
  if (typeof Cloud === 'undefined' || shLoading) return;
  let t = 0; try { t = +localStorage.getItem('ss_shared_t') || 0; } catch (e) {}
  if (!force && Date.now() - t < 600000) return;
  shLoading = 1;
  Cloud.loadRecipes().then(a => {
    SHARED = a.map(d => ({id: d.id, n: d.n, i: d.i || '', t: d.t || '', por: d.por || 1, tags: [], shared: 1, uid: d.uid,
      steps: d.steps || [], ing: (d.ing || []).map(x => [x.n, x.i || '', x.g, x.k, x.p, x.f, x.c, ''])}));
    try { localStorage.setItem('ss_shared', JSON.stringify(SHARED)); localStorage.setItem('ss_shared_t', String(Date.now())); } catch (e) {}
    if (route()[0] === 'recipes' && recSeg === 1) render(true);
  }).catch(() => {}).finally(() => { shLoading = 0; });
}

// отправить в общую базу все свои рецепты с галочкой «Поделиться», которые ещё не ушли
async function shareSync() {
  if (typeof Cloud === 'undefined' || !Cloud.user) return;
  let ch = 0;
  for (const r of S.myRecipes) {
    try {
      if (r.share && !r.sent) { await Cloud.shareRecipe(r); r.sent = 1; ch = 1; }
      else if (!r.share && r.sent) { await Cloud.unshareRecipe(r.id); r.sent = 0; ch = 1; }
    } catch (e) {}
  }
  if (ch) save();
}

// картинка для своего рецепта: похожее блюдо или главный продукт
function recPic(n, ing) {
  const b = nz(n);
  if (typeof IMG !== 'undefined') {
    let best = '', bl = 0;
    for (const k in IMG) {
      if (k[0] !== 'Д') continue;
      const d = nz(k.replace(/^Д\d+_/, ''));
      if ((b.includes(d) || d.includes(b)) && d.length > bl) { best = k; bl = d.length; }
    }
    if (best) return best;
  }
  const top = ing.filter(x => x[1]).sort((a, c) => c[2] - a[2])[0];
  return top ? top[1] : '';
}

function scrRecEd(id) {
  if (!ED || (ED.id || '') !== (id || '')) {
    const r = id && S.myRecipes.find(x => x.id === id);
    ED = r ? {id, n: r.n, t: r.t || '', por: r.por || 1, ing: r.ing.map(x => x.slice()), st: (r.steps || []).join('\n'), share: !!r.share, fold: r.fold || ''}
      : {id: '', n: '', t: '', por: 2, ing: [], st: '', share: true, fold: (STK[STK.length - 2] || '').startsWith('rfold/') ? decodeURIComponent(STK[STK.length - 2].slice(6)) : ''};
  }
  const all = recTot(null, ED.ing);
  const inp = 'style="flex:1;border:0;background:none;outline:0;font:inherit;color:inherit;min-width:0"';
  const box = 'style="display:flex;align-items:center;background:#f6f3ff;border-radius:14px;padding:11px 14px;font-weight:800;font-size:16px"';
  const rows = (ED.ing.length ? ingHead(all) : '') + ED.ing.map((x, j) => `<div class="ing tb">${pic(x[1], x[0], 40)}<div class="nm"><b>${esc(x[0])}</b></div><label class="g"><input type="number" inputmode="numeric" value="${x[2]}" onchange="ED.ing[${j}][2]=Math.max(0,+this.value||0);render(true)">г</label><div class="kc">${N(x[3] * x[2] / 100)}</div><button class="del" onclick="ED.ing.splice(${j},1);render(true)" aria-label="Убрать">${IC.x()}</button></div>`).join('');
  return `<div class="scr anim" style="padding-bottom:110px">${topb(ED.id ? 'Изменить рецепт' : 'Новый рецепт', '')}
  <div class="card" style="display:flex;flex-direction:column;gap:12px">
  <div><div class="muted" style="font-size:13px;margin-bottom:4px">Название</div><label ${box}><input id="en" value="${esc(ED.n)}" placeholder="Например, Сырники с изюмом" maxlength="80" oninput="ED.n=this.value" ${inp}></label></div>
  <div class="g2" style="margin:0"><div><div class="muted" style="font-size:13px;margin-bottom:4px">Время</div><label ${box}><input value="${esc(ED.t)}" placeholder="20 мин" maxlength="20" oninput="ED.t=this.value" ${inp}></label></div>
  <div><div class="muted" style="font-size:13px;margin-bottom:4px">Порций</div><div class="step" style="justify-content:space-between"><button onclick="ED.por=Math.max(1,ED.por-1);render(true)">−</button><b>${ED.por}</b><button onclick="ED.por=Math.min(50,ED.por+1);render(true)">+</button></div></div></div></div>
  ${ED.ing.length ? `<div class="sec">На 1 порцию</div><div class="tot">${totHTML({k: all.k / ED.por, p: all.p / ED.por, f: all.f / ED.por, c: all.c / ED.por})}</div>` : ''}
  ${ED.ing.length ? '' : '<div class="sec">Продукты</div>'}
  <div class="card" style="padding-top:2px;padding-bottom:8px;margin-top:${ED.ing.length ? 16 : 0}px">${rows}<button class="add" style="display:flex;gap:8px;align-items:center;color:#7c5cff;font-weight:800;padding-top:10px" onclick="ingSheet('ed')">${IC.plus()} Добавить продукт</button></div>
  <div class="sec">Папка</div>
  <div class="chips wr"><button class="chip ${!ED.fold ? 'pri' : ''}" onclick="ED.fold='';render(true)">Без папки</button>${S.rfold.map(f => `<button class="chip ${ED.fold === f ? 'pri' : ''}" onclick="ED.fold=${q(f)};render(true)">${esc(f)}</button>`).join('')}<button class="chip" onclick="foldNew('ed')">${IC.plus()} Новая</button></div>
  <div class="sec">Как готовить<span>каждый шаг с новой строки</span></div>
  <div class="card"><textarea rows="5" maxlength="3000" placeholder="Смешай творог с яйцом.&#10;Сформируй сырники.&#10;Обжарь с двух сторон." oninput="ED.st=this.value" style="width:100%;border:0;background:#f6f3ff;border-radius:14px;padding:12px 14px;font:inherit;font-weight:700;font-size:15px;color:inherit;outline:0;resize:vertical">${esc(ED.st)}</textarea></div>
  <button class="card" style="display:flex;gap:10px;align-items:center;width:calc(100% - 40px);font-weight:800;text-align:left" onclick="ED.share=!ED.share;render(true)"><span style="flex:none;width:24px;height:24px;border-radius:8px;background:${ED.share ? '#7c5cff' : '#efe9ff'};display:flex;align-items:center;justify-content:center">${ED.share ? IC.check('#fff') : ''}</span><span>Поделиться со всеми<small class="muted" style="display:block;font-weight:700;font-size:13px">рецепт появится в каталоге, имя автора не видно</small></span></button>
  </div>
  <div class="btns"><button class="btn w" onclick="ED=null;back()">Отмена</button><button class="btn" onclick="recEdSave()">Сохранить</button></div>`;
}

function recEdSave() {
  const n = (ED.n || '').trim().replace(/\s+/g, ' ');
  if (!n) { toast('Напиши название'); const e = $('#en'); if (e) e.focus(); return; }
  if (!ED.ing.length) { toast('Добавь хотя бы один продукт'); return; }
  const steps = ED.st.split('\n').map(s => s.trim()).filter(Boolean).slice(0, 30);
  let r = ED.id && S.myRecipes.find(x => x.id === ED.id);
  if (!r) { r = {id: 'mr' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), mine: 1, tags: []}; S.myRecipes.unshift(r); }
  Object.assign(r, {n: n.slice(0, 80), t: ED.t.trim() || '', por: ED.por, ing: ED.ing.map(x => x.slice()).slice(0, 40), steps, i: recPic(n, ED.ing), fold: ED.fold || ''});
  const wasSent = r.sent;
  r.share = ED.share; r.sent = ED.share ? 0 : wasSent; // изменённый рецепт отправить заново
  ED = null; RC = null; save();
  const loggedIn = typeof Cloud !== 'undefined' && Cloud.user;
  toast(r.share && !loggedIn ? 'Сохранено. В каталог попадёт после входа' : r.share ? 'Сохранено и отправлено в каталог' : 'Рецепт сохранён');
  if (loggedIn) shareSync().then(() => sharedLoad(true));
  recSeg = 0; back();
}

function recDel(id) {
  sheet(`<div class="sh"><div><b>Удалить рецепт?</b><small>${esc((S.myRecipes.find(x => x.id === id) || {}).n || '')}</small></div></div><div style="padding:16px 20px 0;display:flex;flex-direction:column;gap:10px">
  <button class="btn" style="background:#c23a64" onclick="recDelOk('${id}')">Удалить</button><button class="btn w" onclick="closeSheet()">Отмена</button></div>`);
}
async function recDelOk(id) {
  const r = S.myRecipes.find(x => x.id === id); if (!r) return;
  if (r.sent) {
    if (typeof Cloud === 'undefined' || !Cloud.user) { toast('Войди в аккаунт, чтобы убрать рецепт из каталога'); return; }
    try { await Cloud.unshareRecipe(id); } catch (e) { toast('Нет интернета, попробуй позже'); return; }
  }
  S.myRecipes = S.myRecipes.filter(x => x.id !== id); S.rfav = S.rfav.filter(x => x !== id);
  SHARED = SHARED.filter(x => x.id !== id); try { localStorage.setItem('ss_shared', JSON.stringify(SHARED)); } catch (e) {}
  save(); closeSheet(); RC = null; toast('Рецепт удалён'); back();
}

// чужой или каталожный рецепт с изменёнными граммами — копия в мои рецепты
function recCopy(id) {
  const r = recipe(id); if (!r) return;
  const c = {id: 'mr' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), mine: 1, tags: [], n: r.n, i: r.i, t: r.t, por: r.por,
    ing: (RC && RC.id === id ? RC.ing : r.ing).map(x => x.slice()), steps: (r.steps || []).slice(), share: false};
  S.myRecipes.unshift(c); save(); RC = null; toast('Сохранено в мои рецепты');
  STK[STK.length - 1] = 'recipe/' + c.id; render();
}

// ---------- перемешивание подборок: каждый день свой порядок ----------
const dayMix = (L, key) => L.slice().sort((a, b) => hsh(TODAY + key + a.id) - hsh(TODAY + key + b.id));
// рецепты пользователей: чужие из общей базы + свои, которыми поделилась
const usersAll = () => S.myRecipes.filter(r => r.share).concat(sharedList());
// подборка недели меняется каждую неделю
const WEEKLY = [['Ужин в духовке и аэрогриле', ['аэрогриль', 'духовка'], 'Д3_Куриная грудка гриль'], ['Супы на всю неделю', 'суп', 'Д2_Куриный суп с лапшой'],
  ['Завтраки за 10 минут', 'завтрак', 'Д1_Сырники'], ['Белковые ужины', 'набор мышц', 'Д3_Стейк из говядины'], ['Лёгкие салаты', 'похудение', 'Д7_Греческий'],
  ['Десерты без чувства вины', 'без сахара', 'Д9_Панна-котта'], ['Без готовки', 'без готовки', 'Д7_Капрезе'], ['Вегетарианская неделя', 'вегетарианское', 'Д5_Овощи гриль']];
function weekly() { const d = new Date(), w = Math.floor((d - new Date(d.getFullYear(), 0, 1)) / 6048e5) + d.getFullYear() * 53; return WEEKLY[w % WEEKLY.length]; }

// ---------- свои рецепты в подборках «По цели» и т.д. ----------
function collAddSheet(name) {
  name = decodeURIComponent(name);
  if (!S.myRecipes.length) { toast('Сначала создай свой рецепт'); ED = null; go('#/recnew'); return; }
  const sel = S.collMy[name] || [];
  sheet(`<div class="sh"><div><b>Добавить в «${esc(name)}»</b><small>твои рецепты</small></div></div>
  <div class="card" style="padding-top:2px;padding-bottom:2px">${S.myRecipes.map(r => `<button class="ing" style="width:100%;text-align:left" onclick="collTog(${q(name)},'${r.id}')">${pic(r.i, r.n, 40)}<div class="nm"><b>${esc(r.n)}</b><small>${N(recTot(r).k / r.por)} ккал в порции</small></div><span class="pbtn" style="${sel.includes(r.id) ? 'background:#7c5cff' : ''}">${sel.includes(r.id) ? IC.check('#fff') : IC.plus()}</span></button>`).join('')}</div>`, 'tall');
}
function collTog(name, id) { const L = S.collMy[name] = S.collMy[name] || [], j = L.indexOf(id); j >= 0 ? L.splice(j, 1) : L.push(id); save(); render(true); collAddSheet(encodeURIComponent(name)); }

// ---------- папки в «Моих рецептах» ----------
function foldCnt(f) { return S.myRecipes.filter(r => r.fold === f).length; }
function foldRow() {
  const card = 'flex:none;width:118px;height:84px;border-radius:18px;padding:12px;display:flex;flex-direction:column;justify-content:space-between;text-align:left';
  return `<div class="sec">Папки</div><div style="display:flex;gap:10px;overflow-x:auto;padding:12px 20px 4px;scrollbar-width:none">
  ${S.rfold.map(f => `<button style="${card};background:#fff;box-shadow:0 2px 10px rgba(80,60,160,.07)" onclick="go('#/rfold/${encodeURIComponent(f)}')">${SV('<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>', '#7c5cff', 2, 24)}<span><b style="display:block;font-size:14px;font-weight:900;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(f)}</b><small class="muted" style="font-weight:700;font-size:12px">${foldCnt(f)} рец.</small></span></button>`).join('')}
  <button style="${card};background:#efe9ff;color:#6a4be0" onclick="foldNew()">${IC.plus('#6a4be0', 22)}<b style="font-size:14px;font-weight:900">Добавить категорию</b></button></div>`;
}
function foldNew(then) {
  window._fThen = then || '';
  const sug = ['Завтраки', 'Первое', 'Второе', 'Гарнир', 'Салаты', 'Десертики', 'На скорую руку', 'Перекусы', 'Праздничное'].filter(x => !S.rfold.includes(x));
  sheet(`<div class="sh"><div><b>Новая категория</b><small>как папка для рецептов</small></div></div>
  <div class="big-in"><input id="fn" maxlength="30" placeholder="Например, Десертики"></div>
  <div class="chips wr" style="margin-top:10px">${sug.map(x => `<button class="chip" onclick="$('#fn').value=${q(x)}">${x}</button>`).join('')}</div>
  <div style="padding:18px 20px 0"><button class="btn" onclick="foldSave()">Создать</button></div>`);
  setTimeout(() => { const e = $('#fn'); if (e) e.focus(); }, 100);
}
function foldSave() {
  const n = $('#fn').value.trim().replace(/\s+/g, ' ').slice(0, 30);
  if (!n) { toast('Напиши название'); return; }
  if (!S.rfold.includes(n)) S.rfold.push(n);
  const then = window._fThen; save(); closeSheet();
  if (then === 'ed') { ED.fold = n; render(true); }
  else if (then) { const r = S.myRecipes.find(x => x.id === then); if (r) { r.fold = n; save(); } render(true); }
  else go('#/rfold/' + encodeURIComponent(n));
}
function scrFold(f) {
  f = decodeURIComponent(f || '');
  const R = S.myRecipes.filter(r => r.fold === f);
  return `<div class="scr anim" style="padding-bottom:110px">${topb(f, `${R.length} ${R.length % 10 === 1 && R.length !== 11 ? 'рецепт' : R.length % 10 >= 2 && R.length % 10 <= 4 && (R.length < 12 || R.length > 14) ? 'рецепта' : 'рецептов'}`)}
  ${R.length ? `<div class="grid">${R.map(r => recTile(r)).join('')}</div>` : '<div class="empty">В этой папке пока пусто</div>'}
  <div style="display:flex;gap:10px;margin:18px 20px 0"><button class="btn w" style="flex:1" onclick="foldRen(${q(f)})">Переименовать</button><button class="btn w" style="flex:1;color:#c23a64" onclick="foldDel(${q(f)})">Удалить папку</button></div></div>
  <div class="btns"><button class="btn" onclick="foldPick(${q(f)})">${IC.plus('#fff', 18)} Добавить рецепты</button></div>`;
}
function foldPick(f) {
  if (!S.myRecipes.length) { toast('Сначала создай свой рецепт'); ED = null; go('#/recnew'); return; }
  sheet(`<div class="sh"><div><b>Рецепты в «${esc(f)}»</b><small>отметь нужные</small></div></div>
  <div class="card" style="padding-top:2px;padding-bottom:2px">${S.myRecipes.map(r => `<button class="ing" style="width:100%;text-align:left" onclick="foldTog(${q(f)},'${r.id}')">${pic(r.i, r.n, 40)}<div class="nm"><b>${esc(r.n)}</b><small>${r.fold && r.fold !== f ? 'сейчас в «' + esc(r.fold) + '»' : r.fold === f ? 'в этой папке' : 'без папки'}</small></div><span class="pbtn" style="${r.fold === f ? 'background:#7c5cff' : ''}">${r.fold === f ? IC.check('#fff') : IC.plus()}</span></button>`).join('')}</div>`, 'tall');
}
function foldTog(f, id) { const r = S.myRecipes.find(x => x.id === id); if (!r) return; r.fold = r.fold === f ? '' : f; save(); render(true); foldPick(f); }
function foldRen(f) {
  sheet(`<div class="sh"><div><b>Переименовать папку</b></div></div><div class="big-in"><input id="fn" maxlength="30" value="${esc(f)}"></div>
  <div style="padding:18px 20px 0"><button class="btn" onclick="foldRenOk(${q(f)})">Сохранить</button></div>`);
}
function foldRenOk(f) {
  const n = $('#fn').value.trim().replace(/\s+/g, ' ').slice(0, 30); if (!n) { toast('Напиши название'); return; }
  if (n !== f && S.rfold.includes(n)) { toast('Такая папка уже есть'); return; }
  S.rfold = S.rfold.map(x => x === f ? n : x); S.myRecipes.forEach(r => { if (r.fold === f) r.fold = n; });
  save(); closeSheet(); STK[STK.length - 1] = 'rfold/' + encodeURIComponent(n); render();
}
function foldDel(f) {
  sheet(`<div class="sh"><div><b>Удалить папку «${esc(f)}»?</b><small>рецепты останутся в «Моих рецептах»</small></div></div><div style="padding:16px 20px 0;display:flex;flex-direction:column;gap:10px">
  <button class="btn" style="background:#c23a64" onclick="foldDelOk(${q(f)})">Удалить</button><button class="btn w" onclick="closeSheet()">Отмена</button></div>`);
}
function foldDelOk(f) { S.rfold = S.rfold.filter(x => x !== f); S.myRecipes.forEach(r => { if (r.fold === f) r.fold = ''; }); save(); closeSheet(); back(); }
// выбрать папку для рецепта (в карточке рецепта)
function foldFor(id) {
  const r = S.myRecipes.find(x => x.id === id); if (!r) return;
  window._ff = f => { r.fold = f; save(); closeSheet(); render(true); };
  sheet(`<div class="sh"><div><b>В какую папку?</b></div></div>
  <div class="chips wr" style="margin-top:12px"><button class="chip ${!r.fold ? 'pri' : ''}" onclick="_ff('')">Без папки</button>${S.rfold.map(f => `<button class="chip ${r.fold === f ? 'pri' : ''}" onclick="_ff(${q(f)})">${esc(f)}</button>`).join('')}<button class="chip" onclick="foldNew('${id}')">${IC.plus()} Новая</button></div>`);
}
