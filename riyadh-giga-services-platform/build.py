# -*- coding: utf-8 -*-
"""Assemble the fully self-contained index.html for
«منصة الخدمات البلدية للمشاريع الكبرى» — أمانة منطقة الرياض.

Zero external requests at runtime: embedded Arabic fonts, vendored ECharts,
official RRM logo + hero imagery as data URIs, inline seed data + app code.

Run: python3 build.py            (expects data.json already present)
"""
import base64, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
read = lambda p: open(os.path.join(HERE, p), encoding="utf-8").read()

MIME = {".png": "image/png", ".webp": "image/webp", ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg", ".svg": "image/svg+xml"}

def data_uri(path):
    ext = os.path.splitext(path)[1].lower()
    with open(os.path.join(HERE, path), "rb") as f:
        return "data:%s;base64,%s" % (MIME[ext], base64.b64encode(f.read()).decode())

def bundle(dirname, ext):
    """Concatenate all files in src/<dirname> with the given extension, sorted."""
    root = os.path.join(HERE, "src", dirname)
    parts = []
    for name in sorted(os.listdir(root)):
        if name.endswith(ext):
            parts.append("/* ===== src/%s/%s ===== */\n" % (dirname, name) + read("src/%s/%s" % (dirname, name)))
    return "\n\n".join(parts)

css     = bundle("css", ".css")
js      = bundle("js", ".js")
markup  = read("src/markup.html")
fonts   = read("vendor/fonts-embedded.css") + "\n" + read("vendor/fonts-light.css")
echarts = read("vendor/echarts.min.js")

logo = data_uri("assets/rrm-logo.webp")
hero = data_uri("assets/hero-riyadh.jpg") if os.path.exists(os.path.join(HERE, "assets", "hero-riyadh.jpg")) else ""

data = json.dumps(json.load(open(os.path.join(HERE, "data.json"), encoding="utf-8")),
                  ensure_ascii=False, separators=(",", ":"))

html = f"""<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="description" content="منصة الخدمات البلدية للمشاريع الكبرى — أمانة منطقة الرياض. البوابة الموحدة لتقديم الخدمات البلدية للمشاريع الكبرى في مدينة الرياض ومتابعتها.">
<meta name="color-scheme" content="light dark">
<title>منصة الخدمات البلدية للمشاريع الكبرى — أمانة منطقة الرياض</title>
<link rel="icon" type="image/webp" href="{logo}">
<style>
{fonts}
</style>
<style>
{css}
</style>
</head>
<body>
{markup}
<script>
{echarts}
</script>
<script>
window.SEED = {data};
window.ASSETS = {{ logo: "{logo}", hero: "{hero}" }};
</script>
<script>
{js}
</script>
</body>
</html>
"""

out = os.path.join(HERE, "index.html")
open(out, "w", encoding="utf-8").write(html)
size_kb = os.path.getsize(out) // 1024
print("index.html written (%d KB) — fully self-contained (offline-ready)" % size_kb)
if size_kb > 4600:
    print("WARNING: exceeds 4.5MB performance budget", file=sys.stderr)

# Artifact variant: body-only content (the artifact host wraps it in its own
# doctype/head/body skeleton), same assets, same behavior. dir/lang are applied
# to documentElement at boot by RGP.i18n.applyDir().
artifact = f"""<title>منصة الخدمات البلدية للمشاريع الكبرى</title>
<style>
{fonts}
</style>
<style>
{css}
</style>
{markup}
<script>
{echarts}
</script>
<script>
window.SEED = {data};
window.ASSETS = {{ logo: "{logo}", hero: "{hero}" }};
</script>
<script>
{js}
</script>
"""
art_out = os.path.join(HERE, "artifact.html")
open(art_out, "w", encoding="utf-8").write(artifact)
print("artifact.html written (%d KB) — body-only variant for hosted publishing" % (os.path.getsize(art_out) // 1024))
