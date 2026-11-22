# Добавляет недостающие картинки (webp 360px) из папки дизайна и пересобирает imgmap.js
import re, os, json, sys
from PIL import Image
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
K = '/mnt/project-files/design/kartinki'
LIB = {}
for sub in ('blyuda', 'frukty_ovoshchi', 'magazin'):
    for f in os.listdir(os.path.join(K, sub)):
        LIB[f[:-4]] = os.path.join(K, sub, f)
TL = dict(zip('абвгдеёжзийклмнопрстуфхцчшщъыьэюя', ['a','b','v','g','d','e','e','zh','z','i','y','k','l','m','n','o','p','r','s','t','u','f','h','c','ch','sh','sch','','y','','e','yu','ya']))
slug = lambda s: re.sub(r'[^a-z0-9]+', '-', ''.join(TL.get(c, c) for c in s.lower())).strip('-')
m = json.loads(re.search(r'const IMG=(\{.*?\});', open(os.path.join(R, 'imgmap.js'), encoding='utf-8').read(), re.S).group(1))
code = ''.join(open(os.path.join(R, f), encoding='utf-8').read() for f in ('app.js', 'data.js', 'recipes.js', 'diets.js', 'share.js', 'off.js', 'start.html') if os.path.exists(os.path.join(R, f)))
names = set(re.findall(r'["\']([ДФОМТ]\d+_[^"\']+)["\']', code))
missing = []
for n in sorted(names - set(m)):
    p = LIB.get(n)
    if not p: missing.append(n); continue
    s = slug(n); dst = os.path.join(R, 'img', s + '.webp'); m[n] = 'img/' + s + '.webp'
    if not os.path.exists(dst):
        im = Image.open(p).convert('RGBA'); im.thumbnail((360, 360), Image.LANCZOS); im.save(dst, 'WEBP', quality=82, method=6)
open(os.path.join(R, 'imgmap.js'), 'w', encoding='utf-8').write('const IMG=' + json.dumps(m, ensure_ascii=False) + ';')
print('images', len(m), 'missing', missing)
if missing: sys.exit(1)
