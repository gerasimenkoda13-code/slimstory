'use strict';
// ---------- облако: вход по почте и копия данных в Firebase ----------
// Настройки веб-приложения Firebase не секретные: доступ к данным закрыт правилами (каждый видит только себя).
const FB_CFG = {
  apiKey: 'AIzaSyDwIDBDdZS3tkW9KoXn8988O8XVbqr8oGk',
  authDomain: 'slimstory-bcefd.firebaseapp.com',
  projectId: 'slimstory-bcefd',
  storageBucket: 'slimstory-bcefd.firebasestorage.app',
  messagingSenderId: '765959779480',
  appId: '1:765959779480:web:96abc4d82b3813221b8ced',
};
const LKEY = 'slimstory-v1', PKEY = 'ss_start', TKEY = 'ss_cloud_t';
const Cloud = (() => {
  let ready = null, auth = null, db = null, timer = 0, user = null;
  const subs = [];
  const load = src => new Promise((ok, bad) => { const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = bad; document.head.appendChild(s); });
  function init() {
    if (ready) return ready;
    ready = load('vendor/firebase-app-compat.js')
      .then(() => Promise.all([load('vendor/firebase-auth-compat.js'), load('vendor/firebase-firestore-compat.js')]))
      .then(() => {
        firebase.initializeApp(FB_CFG);
        auth = firebase.auth(); auth.languageCode = 'ru';
        db = firebase.firestore();
        auth.onAuthStateChanged(u => { user = u; try { localStorage.setItem('ss_email', u ? u.email : ''); } catch (e) {} subs.forEach(f => f(u)); });
      });
    return ready;
  }
  const ls = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const lset = (k, v) => { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch (e) {} };
  const doc = () => db.collection('users').doc(user.uid);
  async function push() {
    if (!user) return;
    const t = Date.now();
    await doc().set({s: ls(LKEY) || '', p: ls(PKEY) || '', t, email: user.email});
    lset(TKEY, String(t));
  }
  // при входе: берём то, что новее — телефон или облако
  async function pull() {
    if (!user) return 'none';
    const snap = await doc().get();
    const loc = +(ls(TKEY) || 0), hasLocal = !!ls(LKEY);
    if (snap.exists) {
      const d = snap.data();
      if (!hasLocal || (d.t || 0) > loc) {
        if (d.s) lset(LKEY, d.s); if (d.p) lset(PKEY, d.p); lset(TKEY, String(d.t || Date.now()));
        return 'cloud';
      }
    }
    await push();
    return 'local';
  }
  const ERR = {
    'auth/email-already-in-use': 'Эта почта уже зарегистрирована. Нажми «Войти»',
    'auth/invalid-email': 'Почта написана с ошибкой',
    'auth/missing-email': 'Напиши почту',
    'auth/weak-password': 'Пароль слишком короткий: нужно хотя бы 6 символов',
    'auth/missing-password': 'Напиши пароль',
    'auth/invalid-credential': 'Неверная почта или пароль',
    'auth/wrong-password': 'Неверная почта или пароль',
    'auth/user-not-found': 'Такой почты нет. Зарегистрируйся',
    'auth/too-many-requests': 'Слишком много попыток. Подожди пару минут',
    'auth/network-request-failed': 'Нет интернета. Проверь связь',
  };
  const msg = e => ERR[e && e.code] || 'Не получилось. Попробуй ещё раз';
  return {
    init,
    onUser(f) { subs.push(f); if (ready) ready.then(() => f(user)); },
    get user() { return user; },
    email: () => (user && user.email) || ls('ss_email') || '',
    async signUp(email, pw) { await init(); await auth.createUserWithEmailAndPassword(email.trim(), pw); await push(); },
    async signIn(email, pw) { await init(); await auth.signInWithEmailAndPassword(email.trim(), pw); return pull(); },
    async reset(email) { await init(); await auth.sendPasswordResetEmail(email.trim(), {url: location.origin + location.pathname.replace(/[^/]*$/, '')}); },
    async signOut() { await init(); clearTimeout(timer); try { await push(); } catch (e) {} await auth.signOut(); },
    // сохранить в облако через 3 секунды после последнего изменения
    queue() { if (!user) return; clearTimeout(timer); timer = setTimeout(() => push().catch(() => {}), 3000); },
    push, pull, msg,
  };
})();
addEventListener('online', () => Cloud.queue());
