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
    ED = r ? {id, n: r.n, t: r.t || '', por: r.por || 1, ing: r.ing.map(x => x.slice()), st: (r.steps || []).join('\n'), share: !!r.share}
      : {id: '', n: '', t: '', por: 2, ing: [], st: '', share: true};
  }
  const all = recTot(null, ED.ing);
  const inp = 'style="flex:1;border:0;background:none;outline:0;font:inherit;color:inherit;min-width:0"';
  const box = 'style="display:flex;align-items:center;background:#f6f3ff;border-radius:14px;padding:11px 14px;font-weight:800;font-size:16px"';
  const rows = ED.ing.map((x, j) => `<div class="ing">${pic(x[1], x[0], 40)}<div class="nm"><b>${esc(x[0])}</b></div><label class="g"><input type="number" inputmode="numeric" value="${x[2]}" onchange="ED.ing[${j}][2]=Math.max(0,+this.value||0);render(true)">г</label><div class="kc">${N(x[3] * x[2] / 100)}</div><button class="del" onclick="ED.ing.splice(${j},1);render(true)" aria-label="Убрать">${IC.x()}</button></div>`).join('');
  return `<div class="scr anim" style="padding-bottom:110px">${topb(ED.id ? 'Изменить рецепт' : 'Новый рецепт', '')}
  <div class="card" style="display:flex;flex-direction:column;gap:12px">
  <div><div class="muted" style="font-size:13px;margin-bottom:4px">Название</div><label ${box}><input id="en" value="${esc(ED.n)}" placeholder="Например, Сырники с изюмом" maxlength="80" oninput="ED.n=this.value" ${inp}></label></div>
  <div class="g2" style="margin:0"><div><div class="muted" style="font-size:13px;margin-bottom:4px">Время</div><label ${box}><input value="${esc(ED.t)}" placeholder="20 мин" maxlength="20" oninput="ED.t=this.value" ${inp}></label></div>
  <div><div class="muted" style="font-size:13px;margin-bottom:4px">Порций</div><div class="step" style="justify-content:space-between"><button onclick="ED.por=Math.max(1,ED.por-1);render(true)">−</button><b>${ED.por}</b><button onclick="ED.por=Math.min(50,ED.por+1);render(true)">+</button></div></div></div></div>
  ${ED.ing.length ? `<div class="sec">На 1 порцию</div><div class="tot">${totHTML({k: all.k / ED.por, p: all.p / ED.por, f: all.f / ED.por, c: all.c / ED.por})}</div>` : ''}
  <div class="sec">Продукты${ED.ing.length ? `<span>всего ${N(all.k)} ккал</span>` : ''}</div>
  <div class="card" style="padding-top:2px;padding-bottom:8px">${rows}<button class="add" style="display:flex;gap:8px;align-items:center;color:#7c5cff;font-weight:800;padding-top:10px" onclick="ingSheet('ed')">${IC.plus()} Добавить продукт</button></div>
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
  Object.assign(r, {n: n.slice(0, 80), t: ED.t.trim() || '', por: ED.por, ing: ED.ing.map(x => x.slice()).slice(0, 40), steps, i: recPic(n, ED.ing)});
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
