#!/usr/bin/env python3
"""Builds prototype-phone/index.html from src/: the head (tokens, Tailwind config, CDN scripts), then every src/*.js in order."""
import glob, os
here = os.path.dirname(os.path.abspath(__file__)); src = os.path.join(here, 'src')
head = open(os.path.join(src, '00_head.html')).read()
js = ''.join(open(f).read() + '\n' for f in sorted(glob.glob(os.path.join(src, '[1-9]*.js'))))
open(os.path.join(here, 'index.html'), 'w').write(head + '<script>\n' + js + '</script>\n')
print('ok', os.path.getsize(os.path.join(here, 'index.html')))
