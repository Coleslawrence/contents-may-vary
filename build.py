#!/usr/bin/env python3
"""Builds Contents May Vary.
docs/      -> the installable web app (GitHub Pages serves this folder)
preview.html -> the same game as a single body fragment for a Claude artifact preview"""
import os, json, shutil
ROOT = os.path.dirname(os.path.abspath(__file__)); S = lambda f: open(os.path.join(ROOT, 'src', f), encoding='utf-8').read()
VERSION = '0.5.0'
css = S('style.css'); js1 = S('engine.js') + '\n' + S('helpers.js'); ui = S('ui.js').replace('/*ART*/', S('art.js'))
fonts = '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Grenze:wght@800&family=JetBrains+Mono:wght@400&display=swap">'
body = f'<style>\n{css}\n</style>\n<div id="app"></div>\n<script>\n{js1}\n</script>\n<script>\n{ui}\n</script>\n'
# artifact preview fragment
open(os.path.join(ROOT, 'preview.html'), 'w', encoding='utf-8').write(f'<title>Contents May Vary</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n{fonts}\n{body}')
# installable app
d = os.path.join(ROOT, 'docs'); os.makedirs(os.path.join(d, 'icons'), exist_ok=True)
head = f'''<!doctype html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>Contents May Vary</title>
<meta name="description" content="A mimic idle game: lure visitors, swallow them, become what you eat.">
<meta name="theme-color" content="#16121d">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Mimic">
<link rel="manifest" href="manifest.webmanifest">
<link rel="icon" type="image/png" sizes="192x192" href="icons/icon-192.png">
<link rel="apple-touch-icon" href="icons/apple-touch-icon.png">
{fonts}
<style>:root{{box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}}body{{margin:0}}[hidden]{{display:none!important}}html{{-webkit-text-size-adjust:100%;touch-action:manipulation}}</style>
</head><body>
'''
open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(head + body + '</body></html>\n')
manifest = {"name": "Contents May Vary", "short_name": "Mimic", "id": "./", "start_url": "./", "scope": "./", "display": "standalone", "orientation": "portrait",
            "background_color": "#16121d", "theme_color": "#16121d", "description": "A mimic idle game: lure visitors, swallow them, become what you eat.",
            "icons": [{"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"}, {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"}]}
json.dump(manifest, open(os.path.join(d, 'manifest.webmanifest'), 'w'), indent=2)
sw = S('sw.js').replace('__VERSION__', VERSION)
open(os.path.join(d, 'sw.js'), 'w').write(sw)
open(os.path.join(d, '.nojekyll'), 'w').write('')
for f in os.listdir(os.path.join(ROOT, 'assets')):
    shutil.copy(os.path.join(ROOT, 'assets', f), os.path.join(d, 'icons', f))
print('built', VERSION, len(head + body), 'bytes')
