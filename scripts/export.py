#!/usr/bin/env python3
"""Export the SoloStack Next.js site to static files for Cloudflare Pages.

Crawls a running copy of the site (default http://127.0.0.1:3099), saves every page as
<path>.html (Pages serves /a/b from a/b.html without a trailing slash), downloads the
/_next/static assets it references, copies uploaded media to /api/media/file/, and writes
_redirects and the sitemap files. Usage: python3 scripts/export.py [--base URL] [--out dist]
"""
import argparse
import re
import shutil
import sys
import xml.etree.ElementTree as ET
from collections import deque
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote

import requests

HERE = Path(__file__).resolve().parent.parent
MEDIA_DIR = HERE / 'build-source' / 'public' / 'media'
PUBLIC_DIR = HERE / 'build-source' / 'public'
BUILD_STATIC = HERE / 'build-source' / '.next' / 'static'

SEEDS = ['/', '/posts', '/tools', '/stacks', '/comparisons', '/best-gear', '/search', '/cookie-policy']
SITEMAPS = ['/sitemap.xml', '/pages-sitemap.xml', '/posts-sitemap.xml']
SKIP_PREFIXES = ('/admin', '/api/', '/next/', '/_next/')
ASSET_RE = re.compile(r'(/_next/static/[A-Za-z0-9_\-./~%]+)')
HREF_RE = re.compile(r'href="([^"#]*)"')
SITE_HOSTS = {'solostack.au', 'www.solostack.au'}


def page_file(out: Path, path: str) -> Path:
    path = path.rstrip('/') or '/'
    return out / 'index.html' if path == '/' else out / (path.lstrip('/') + '.html')


def normalise(href: str, base: str):
    u = urlparse(urljoin(base + '/', href))
    if u.hostname not in (urlparse(base).hostname, *SITE_HOSTS):
        return None
    path = unquote(u.path) or '/'
    if path.startswith(SKIP_PREFIXES) or Path(path).suffix:
        return None
    return path.rstrip('/') or '/'


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--base', default='http://127.0.0.1:3099')
    ap.add_argument('--out', default=str(HERE / 'dist'))
    args = ap.parse_args()
    base, out = args.base.rstrip('/'), Path(args.out)

    if out.exists():
        shutil.rmtree(out)
    out.mkdir(parents=True)
    s = requests.Session()

    # Static files from public/ (logos, favicons, robots, llms.txt); media is copied separately below.
    for item in PUBLIC_DIR.iterdir():
        if item.name in ('media', 'sitemap.xml') or item.name.endswith('.md'):
            continue
        dest = out / item.name
        shutil.copytree(item, dest) if item.is_dir() else shutil.copy2(item, dest)
    shutil.copytree(MEDIA_DIR, out / 'api' / 'media' / 'file')

    queue, seen, assets, redirects, failures = deque(), set(), set(), [], []
    for sm in SITEMAPS:
        r = s.get(base + sm, timeout=60)
        r.raise_for_status()
        (out / sm.lstrip('/')).write_bytes(r.content)
        for loc in ET.fromstring(r.content).iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc'):
            p = normalise(loc.text.strip(), base)
            if p:
                queue.append(p)
    queue.extend(SEEDS)

    while queue:
        path = queue.popleft()
        if path in seen:
            continue
        seen.add(path)
        r = s.get(base + path, allow_redirects=False, timeout=120)
        if r.status_code in (301, 302, 307, 308):
            target = r.headers.get('location', '/')
            redirects.append((path, target, 301 if r.status_code in (301, 308) else 302))
            p = normalise(target, base)
            if p:
                queue.append(p)
            continue
        if r.status_code != 200 or 'text/html' not in r.headers.get('content-type', ''):
            failures.append((path, r.status_code))
            continue
        html = r.text
        dest = page_file(out, path)
        dest.parent.mkdir(parents=True, exist_ok=True)
        dest.write_text(html, encoding='utf-8')
        assets.update(ASSET_RE.findall(html))
        for href in HREF_RE.findall(html):
            p = normalise(href.replace('&amp;', '&').split('?')[0], base)
            if p and p not in seen:
                queue.append(p)

    # Not-found page: Pages serves 404.html for unknown paths.
    r = s.get(base + '/__static-export-not-found__', timeout=60)
    # The not-found page is Next's own error shell, which has no layout <head>: add the site-wide AdSense script to it.
    not_found = r.text
    head = re.search(r'<head.*?</head>', not_found, re.S)
    if not (head and 'adsbygoogle.js?client=' in head.group(0)):
        not_found = not_found.replace(
            '<head>',
            '<head><script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2867376862905050" crossorigin="anonymous"></script>',
            1,
        )
    (out / '404.html').write_text(not_found, encoding='utf-8')
    assets.update(ASSET_RE.findall(r.text))

    # Copy the complete /_next/static build output (lazy-loaded chunks are not all referenced from HTML),
    # then check every asset a page references exists.
    shutil.copytree(BUILD_STATIC, out / '_next' / 'static')
    done = {a.split('?')[0] for a in assets}
    for a in sorted(done):
        if not (out / unquote(a).lstrip('/')).exists() and Path(a).suffix:
            failures.append((a, 'missing'))

    # Redirects found while crawling, plus the app's permanent redirects.
    lines = ['/hardware /best-gear 301', '/hardware/* /best-gear 301', '/deals / 301']
    for src, target, code in redirects:
        t = urlparse(target)
        target = t.path + (('?' + t.query) if t.query else '') if t.hostname in (None, *SITE_HOSTS) else target
        line = f'{src} {target} {code}'
        if line not in lines and not src.startswith('/hardware') and src != '/deals':
            lines.append(line)
    (out / '_redirects').write_text('\n'.join(lines) + '\n')
    shutil.copy2(HERE / 'public' / '_headers', out / '_headers')

    pages = sum(1 for _ in out.rglob('*.html'))
    print(f'pages={pages} assets={len(done)} redirects={len(lines)} failures={len(failures)}')
    for f in failures:
        print('  FAIL', *f)
    return 1 if any(not str(p).startswith('/_next/') for p, _ in failures) else 0


if __name__ == '__main__':
    sys.exit(main())
