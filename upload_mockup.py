#!/usr/bin/env python3
"""Naik satu set fail ke GitHub (zahir-property) melalui REST API."""
import base64, json, os, sys, urllib.request, urllib.error

ENV = os.path.expanduser('~/.hermes/.env')
REPO = 'zahirmjproperty/zahir-property'
BRANCH = 'main'
BASE = '/home/ubuntu/zahir-web/'

def token():
    for line in open(ENV, encoding='utf-8', errors='ignore'):
        line = line.strip()
        if line.startswith('GITHUB_TOKEN='):
            return line.split('=', 1)[1].strip().strip('"').strip("'")
    raise SystemExit('GITHUB_TOKEN tidak dijumpai')

TOK = token()

def api(url, method='GET', payload=None):
    data = json.dumps(payload).encode() if payload else None
    req = urllib.request.Request(url, data=data, method=method)
    req.add_header('Authorization', 'token ' + TOK)
    req.add_header('Accept', 'application/vnd.github+json')
    req.add_header('User-Agent', 'zmp-upload')
    if data:
        req.add_header('Content-Type', 'application/json')
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return r.status, json.loads(r.read() or '{}')
    except urllib.error.HTTPError as e:
        try:
            body = json.loads(e.read() or '{}')
        except Exception:
            body = {'raw': 'tidak dapat baca respons'}
        return e.code, body

def sha_of(path):
    st, res = api('https://api.github.com/repos/%s/contents/%s?ref=%s' % (REPO, path, BRANCH))
    if st == 200:
        return res.get('sha')
    return None

FAIL = ['index.html', 'mockup-luxury.html', 'portal/assets/auth-config.js',
        'assets/favicon.png', 'assets/apple-touch-icon.png']

hasil = []
for path in FAIL:
    penuh = BASE + path
    if not os.path.exists(penuh):
        print('  SKIP %-34s (tiada fail tempatan)' % path)
        continue
    isi = base64.b64encode(open(penuh, 'rb').read()).decode()
    sha = sha_of(path)
    pl = {'message': 'Add/update %s (redesign ZMP — mockup + aset)' % path,
          'content': isi, 'branch': BRANCH}
    if sha:
        pl['sha'] = sha
    st, res = api('https://api.github.com/repos/%s/contents/%s' % (REPO, path), 'PUT', pl)
    ok = st in (200, 201)
    print('  %s %-34s status %s  %s' % ('OK  ' if ok else 'GAGAL', path, st,
          (res.get('commit') or {}).get('sha', '')[:10]))
    hasil.append((ok, path, st))

print()
print('=== RINGKASAN ===')
print('  berjaya: %d / %d' % (sum(1 for h in hasil if h[0]), len(hasil)))
sys.exit(0 if all(h[0] for h in hasil) else 1)
