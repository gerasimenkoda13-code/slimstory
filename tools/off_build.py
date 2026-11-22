# Собирает базу товаров из открытой выгрузки Open Food Facts (лицензия ODbL)
# Берём товары России, Беларуси и Казахстана с названием и КБЖУ.
import csv, gzip, io, json, re, sys, urllib.request

URL = 'https://static.openfoodfacts.org/data/en.openfoodfacts.org.products.csv.gz'
KEEP = ('en:russia', 'en:belarus', 'en:kazakhstan')
csv.field_size_limit(10**9)


def num(x):
    try:
        v = float(x)
        return round(v, 1) if 0 <= v < 1000 else None
    except (TypeError, ValueError):
        return None


def grams(s):
    m = re.search(r'(\d+(?:[.,]\d+)?)\s*(г|гр|g|мл|ml)\b', (s or '').lower())
    return round(float(m.group(1).replace(',', '.'))) if m else 0


out, seen = [], set()
req = urllib.request.Request(URL, headers={'User-Agent': 'SlimStory/1.0 (github.com/gerasimenkoda13-code/slimstory)'})
with urllib.request.urlopen(req) as r, gzip.GzipFile(fileobj=r) as g:
    rd = csv.DictReader(io.TextIOWrapper(g, encoding='utf-8', errors='replace'), delimiter='\t')
    for i, row in enumerate(rd):
        if i % 500000 == 0:
            print(i, len(out), file=sys.stderr, flush=True)
        ct = row.get('countries_tags') or ''
        if not any(k in ct for k in KEEP):
            continue
        name = (row.get('product_name_ru') or row.get('product_name') or '').strip()
        code = (row.get('code') or '').strip()
        k = num(row.get('energy-kcal_100g'))
        if not name or not code or k is None or code in seen:
            continue
        p, f, c = num(row.get('proteins_100g')), num(row.get('fat_100g')), num(row.get('carbohydrates_100g'))
        if p is None or f is None or c is None:
            continue
        if abs(p * 4 + f * 9 + c * 4 - k) > max(60, k * 0.5):  # явно ошибочные данные
            continue
        brand = (row.get('brands') or '').split(',')[0].strip()
        seen.add(code)
        out.append([code, name[:80], brand[:40], k, p, f, c, grams(row.get('quantity')), grams(row.get('serving_size'))])

out.sort(key=lambda x: (x[2] == '', x[1].lower()))
with open('data/off.json', 'w', encoding='utf-8') as fh:
    json.dump(out, fh, ensure_ascii=False, separators=(',', ':'))
print('products', len(out), file=sys.stderr)
