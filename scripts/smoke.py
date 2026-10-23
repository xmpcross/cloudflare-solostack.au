#!/usr/bin/env python3
"""Read-only smoke check of a deployed (or locally served) static SoloStack site.

Usage: python3 scripts/smoke.py [BASE_URL]   (default http://127.0.0.1:8799)
Checks every exported page returns 200, assets load, redirects and 404 behave.
"""
import re
import sys
from pathlib import Path

import requests

base = (sys.argv[1] if len(sys.argv) > 1 else 'http://127.0.0.1:8799').rstrip('/')
dist = Path(__file__).resolve().parent.parent / 'dist'
s = requests.Session()
bad = []

pages = sorted('/' if p.name == 'index.html' and p.parent == dist else '/' + str(p.relative_to(dist))[:-5]
               for p in dist.rglob('*.html') if p.name != '404.html')
for path in pages:
    r = s.get(base + path, allow_redirects=False, timeout=60)
    if r.status_code != 200:
        bad.append((path, r.status_code))

home = s.get(base + '/', timeout=60).text
for asset in sorted(set(re.findall(r'(/_next/static/[^"\'\s)]+\.(?:css|js))', home)))[:40]:
    if s.get(base + asset, timeout=60).status_code != 200:
        bad.append((asset, 'asset'))
img = re.search(r'src="(/api/media/file/[^"?]+)', s.get(base + '/posts/how-to-choose-domain-name', timeout=60).text)
if not img or s.get(base + img.group(1), timeout=60).status_code != 200:
    bad.append(('media image', 'missing'))

checks = [('/hardware', 301, '/best-gear'), ('/this-page-does-not-exist', 404, None)]
for path, code, loc in checks:
    r = s.get(base + path, allow_redirects=False, timeout=60)
    if r.status_code != code or (loc and not r.headers.get('location', '').endswith(loc)):
        bad.append((path, r.status_code, r.headers.get('location')))

print(f'checked {len(pages)} pages; problems: {len(bad)}')
for b in bad:
    print('  ', *b)
sys.exit(1 if bad else 0)
