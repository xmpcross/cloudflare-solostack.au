#!/usr/bin/env python3
"""Fetch a logo for every brand and tool shown in "Related products and tools" and save them with the site's own files.

For each brand it reads the brand's own website for its best icon (apple-touch-icon, then a large PNG icon, then an SVG),
and falls back to the Google favicon service only if the site gives nothing usable. Rasters are normalised to 160x160 PNG
(padded, transparent background); SVGs are kept as they are. Writes:

  build-source/public/brand-logos/<key>.png|svg
  build-source/src/utilities/brandLogos.ts      key -> public path, used by the post template

Run again to refresh. Needs Pillow (python3 -I -m pip install pillow, or use the system one).  Usage:
  python3 scripts/fetch-brand-logos.py [--only key,key] [--report]
"""
import io, json, os, re, sys, urllib.parse, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'build-source', 'public', 'brand-logos')
TS = os.path.join(HERE, '..', 'build-source', 'src', 'utilities', 'brandLogos.ts')

# key (the brand name or tool slug, lower-cased with hyphens) -> the brand's website
SITES = {
    # tools (keyed by tool slug)
    'riverside-fm': 'riverside.fm', 'descript': 'descript.com', 'bonsai': 'hellobonsai.com', 'make-com': 'make.com',
    'canva-pro': 'canva.com',
    # retailers and sellers (products_offers.merchant)
    'amazon-au': 'amazon.com.au', 'bing-lee': 'binglee.com.au', 'jb-hi-fi': 'jbhifi.com.au', 'bunnings': 'bunnings.com.au',
    'pb-tech': 'pbtech.com', 'harvey-norman': 'harveynorman.com.au', 'woolworths': 'woolworths.com.au',
    'officeworks': 'officeworks.com.au', 'scorptec': 'scorptec.com.au', 'the-good-guys': 'thegoodguys.com.au',
    'store-dj': 'storedj.com.au', 'herman-miller': 'hermanmiller.com',
    # hosting and domains
    'a2-hosting': 'a2hosting.com', 'bluehost': 'bluehost.com', 'dreamhost': 'dreamhost.com', 'wp-engine': 'wpengine.com',
    'shopify': 'shopify.com', 'godaddy': 'godaddy.com', 'namecheap': 'namecheap.com', 'porkbun': 'porkbun.com',
    'ventraip': 'ventraip.com.au', 'crazy-domains': 'crazydomains.com.au',
    # hardware brands
    'alfordson': 'alfordson.com.au', 'alogic': 'alogic.co', 'artiss': 'artiss.com.au', 'asus': 'asus.com',
    'audio-technica': 'audio-technica.com', 'belkin': 'belkin.com', 'blue': 'bluemic.com', 'bonelk': 'bonelk.com',
    'canon': 'canon.com', 'dji': 'dji.com', 'elgato': 'elgato.com', 'emeet': 'emeet.com', 'ergovida': 'ergovida.com',
    'fifine': 'fifinemicrophone.com', 'flexispot': 'flexispot.com.au', 'focusrite': 'focusrite.com', 'gopro': 'gopro.com',
    'hyperx': 'hyperx.com', 'jbl': 'jbl.com', 'logitech': 'logitech.com', 'logitech-g': 'logitechg.com',
    'mimoglad': 'mimoglad.com', 'neewer': 'neewer.com', 'rode': 'rode.com', 'samsung': 'samsung.com', 'shure': 'shure.com',
    'sihoo': 'sihoooffice.com', 'smallrig': 'smallrig.com', 'sony': 'sony.com', 'tp-link': 'tp-link.com',
    'ulanzi': 'ulanzi.com', 'updown-desk': 'updowndesk.com.au',
}
UA = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36'}


def get(url, timeout=20):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read(), r.headers.get('Content-Type', ''), r.geturl()


def icon_urls(domain):
    """Candidate icon URLs from the brand's home page, best first: (url, size_hint, is_svg)."""
    found = []
    for host in (f'https://www.{domain}/', f'https://{domain}/'):
        try:
            body, _, final = get(host)
        except Exception:
            continue
        html = body.decode('utf-8', 'ignore')
        for tag in re.findall(r'<link\b[^>]*>', html, re.I):
            rel = re.search(r'rel=["\']([^"\']+)["\']', tag, re.I)
            href = re.search(r'href=["\']([^"\']+)["\']', tag, re.I)
            if not rel or not href or 'icon' not in rel.group(1).lower() or 'mask' in rel.group(1).lower():
                continue
            sizes = re.search(r'sizes=["\'](\d+)x\d+', tag, re.I)
            size = int(sizes.group(1)) if sizes else (180 if 'apple' in rel.group(1).lower() else 0)
            url = urllib.parse.urljoin(final, href.group(1).strip())
            found.append((url, size, url.lower().split('?')[0].endswith('.svg') or 'svg' in tag.lower()))
        found.append((urllib.parse.urljoin(final, '/apple-touch-icon.png'), 180, False))
        break
    # raster >= 96px first (biggest first), then svg, then smaller rasters
    big = sorted([f for f in found if not f[2] and f[1] >= 96], key=lambda f: -f[1])
    svgs = [f for f in found if f[2]]
    small = sorted([f for f in found if not f[2] and f[1] < 96], key=lambda f: -f[1])
    return big + svgs + small


def normalise(data):
    """Raster bytes -> 160x160 PNG, centred with padding, or None if too small to be useful."""
    from PIL import Image
    im = Image.open(io.BytesIO(data))
    im.load()
    im = im.convert('RGBA')
    if min(im.size) < 48:
        return None
    # trim empty margins, then fit inside 160 with 8px padding
    bbox = im.getbbox()
    if bbox:
        im = im.crop(bbox)
    # an icon that is a solid opaque square (apple-touch-icon) keeps its edges; transparent ones get padding
    box = 144
    im.thumbnail((box, box), Image.LANCZOS)
    canvas = Image.new('RGBA', (160, 160), (0, 0, 0, 0))
    canvas.paste(im, ((160 - im.width) // 2, (160 - im.height) // 2), im)
    out = io.BytesIO()
    canvas.save(out, 'PNG', optimize=True)
    return out.getvalue()


def fetch_one(key, domain):
    os.makedirs(OUT, exist_ok=True)
    tried = []
    for url, size, is_svg in icon_urls(domain):
        try:
            data, ctype, _ = get(url)
        except Exception as e:
            tried.append(f'{url}: {e}')
            continue
        if is_svg or b'<svg' in data[:600].lower():
            if len(data) > 60_000 or b'<script' in data.lower():
                continue
            path = os.path.join(OUT, f'{key}.svg')
            open(path, 'wb').write(data)
            return f'/brand-logos/{key}.svg', f'svg from {url}'
        try:
            png = normalise(data)
        except Exception as e:
            tried.append(f'{url}: not an image ({e})')
            continue
        if png:
            open(os.path.join(OUT, f'{key}.png'), 'wb').write(png)
            return f'/brand-logos/{key}.png', f'{size or "?"}px from {url}'
    # last resort: Google's favicon service (fetched now, saved locally)
    try:
        data, _, _ = get(f'https://www.google.com/s2/favicons?domain={domain}&sz=128')
        png = normalise(data)
        if png:
            open(os.path.join(OUT, f'{key}.png'), 'wb').write(png)
            return f'/brand-logos/{key}.png', 'google favicon fallback'
    except Exception as e:
        tried.append(f'google: {e}')
    return None, '; '.join(tried[:2]) or 'nothing usable'


def main():
    only = None
    for a in sys.argv[1:]:
        if a.startswith('--only='):
            only = a.split('=', 1)[1].split(',')
    # keep what is already saved when running with --only
    existing = {}
    if os.path.exists(TS):
        existing = dict(re.findall(r"'([a-z0-9-]+)': '(/brand-logos/[^']+)'", open(TS).read()))
    result = dict(existing)
    for key, domain in SITES.items():
        if only and key not in only:
            continue
        path, note = fetch_one(key, domain)
        print(('ok   ' if path else 'MISS ') + key.ljust(16) + domain.ljust(26) + note[:110])
        if path:
            result[key] = path
        else:
            result.pop(key, None)
    # keep logos saved by other means (manual or alternate sources), and add retailer-name aliases
    for f in os.listdir(OUT):
        k, ext = os.path.splitext(f)
        if ext in ('.png', '.svg'):
            result.setdefault(k, f'/brand-logos/{f}')
    for alias, k in {'belkin-au': 'belkin', 'tp-link-au': 'tp-link'}.items():
        if k in result:
            result[alias] = result[k]
    lines = ',\n'.join(f"  '{k}': '{v}'" for k, v in sorted(result.items()))
    open(TS, 'w').write(
        "// Generated by scripts/fetch-brand-logos.py. Brand or tool key -> logo file in public/brand-logos.\n"
        "// A brand with no entry shows a letter tile instead.\n"
        f"export const BRAND_LOGOS: Record<string, string> = {{\n{lines},\n}}\n\n"
        "export const logoKey = (name?: string | null) =>\n"
        "  (name ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')\n\n"
        "export const logoFor = (...names: (string | null | undefined)[]): string | null => {\n"
        "  for (const n of names) {\n"
        "    const hit = BRAND_LOGOS[logoKey(n)]\n"
        "    if (hit) return hit\n"
        "  }\n"
        "  return null\n"
        "}\n")
    print(f'\n{len(result)} logos saved, {len([k for k in SITES if k not in result])} missing -> {os.path.relpath(TS)}')


main()
