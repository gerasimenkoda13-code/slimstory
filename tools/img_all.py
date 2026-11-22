# Все акварельные картинки библиотеки -> webp (300px) в img/, и imgcat.js (ключ -> путь) для поиска картинки по названию
import re, os, json
from PIL import Image
R = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
K = '/mnt/project-files/design/kartinki'
TL = dict(zip('абвгдеёжзийклмнопрстуфхцчшщъыьэюя', ['a','b','v','g','d','e','e','zh','z','i','y','k','l','m','n','o','p','r','s','t','u','f','h','c','ch','sh','sch','','y','','e','yu','ya']))
slug = lambda s: re.sub(r'[^a-z0-9]+', '-', ''.join(TL.get(c, c) for c in s.lower())).strip('-')
m = json.loads(re.search(r'const IMG=(\{.*?\});', open(os.path.join(R, 'imgmap.js'), encoding='utf-8').read(), re.S).group(1))
K2 = {}; made = 0
for sub in ('blyuda', 'frukty_ovoshchi', 'magazin', 'tovary500'):
    for f in sorted(os.listdir(os.path.join(K, sub))):
        key = f[:-4]
        if key in m: K2[key] = m[key]; continue
        s = slug(key); dst = os.path.join(R, 'img', s + '.webp')
        if not os.path.exists(dst):
            im = Image.open(os.path.join(K, sub, f)).convert('RGBA'); im.thumbnail((300, 300), Image.LANCZOS); im.save(dst, 'WEBP', quality=80, method=6); made += 1
        K2[key] = 'img/' + s + '.webp'
open(os.path.join(R, 'imgcat.js'), 'w', encoding='utf-8').write('const IMGK=' + json.dumps(K2, ensure_ascii=False, separators=(',', ':')) + ';')
print('library', len(K2), 'new webp', made)
