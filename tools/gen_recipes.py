# Собирает recipes.js из tools/recipes_src.py и проверяет, что все продукты и картинки есть
import json, os, re, sys
sys.path.insert(0, os.path.dirname(__file__))
from recipes_src import ING2, R1, STEPS

root = os.path.join(os.path.dirname(__file__), '..')
data = open(os.path.join(root, 'data.js'), encoding='utf-8').read()
ing_block = data[data.index('const ING = {'):data.index('};', data.index('const ING = {'))]
ING = set(re.findall(r"'([^']+)':\[", ing_block))
r0 = set(re.findall(r"\['(r_[a-z0-9]+)',", data[data.index('const R0'):data.index('const RECIPES')]))
imgs = json.loads(re.search(r'const IMG=(\{.*?\});', open(os.path.join(root, 'imgmap.js'), encoding='utf-8').read(), re.S).group(1))
LIBN = set(imgs) | {f[:-4] for d in ('blyuda','frukty_ovoshchi','magazin') for f in (os.listdir('/mnt/project-files/design/kartinki/'+d) if os.path.isdir('/mnt/project-files/design/kartinki/'+d) else [])}
have = lambda n: not n or n in imgs or os.path.exists(os.path.join(root, 'img', n + '.webp'))

err = []
allI = ING | set(ING2)
for k, v in ING2.items():
    if k in ING: err.append('продукт уже есть: ' + k)
    if v[0] and v[0] not in LIBN: err.append('нет картинки продукта: %s %s' % (k, v[0]))
ids = set()
for r in R1:
    rid, n, img, t, por, tags, ing, steps = r
    if rid in ids or rid in r0: err.append('повтор id ' + rid)
    ids.add(rid)
    if img not in LIBN: err.append('нет картинки: %s %s' % (rid, img))
    for nm, g in ing:
        if nm not in allI: err.append('нет продукта: %s в %s' % (nm, rid))
    if not steps: err.append('нет шагов ' + rid)
for k in STEPS:
    if k not in r0: err.append('шаги для неизвестного ' + k)
for k in r0 - set(STEPS): err.append('нет шагов для старого ' + k)
if err:
    print('\n'.join(err)); sys.exit(1)

j = lambda x: json.dumps(x, ensure_ascii=False, separators=(',', ':'))
out = ["'use strict';", '// Рецепты-каталог: собрано tools/gen_recipes.py из tools/recipes_src.py. Не править вручную.',
       'const ING2 = ' + j(ING2) + ';', 'const R1 = [']
out += ['  ' + j(r[:7] + [0, r[7]]) + ',' for r in R1]
out += ['];', 'const STEPS = ' + j(STEPS) + ';', '']
open(os.path.join(root, 'recipes.js'), 'w', encoding='utf-8').write('\n'.join(out))
print('ok: продуктов', len(ING2), 'рецептов', len(R1), 'шагов для старых', len(STEPS))
