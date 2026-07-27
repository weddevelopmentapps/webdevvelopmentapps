# -*- coding: utf-8 -*-
"""Assemble the fully self-contained index.html (zero external requests):
embedded Arabic fonts + vendored ECharts + inline data/app.
Run: python3 generate_data.py && python3 build.py
"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
read = lambda p: open(os.path.join(HERE, p), encoding="utf-8").read()

css     = read("src/styles.css")
markup  = read("src/markup.html")
app     = read("src/app.js")
fonts   = read("vendor/fonts-embedded.css")
echarts = read("vendor/echarts.min.js")
data    = json.dumps(json.load(open(os.path.join(HERE, "data.json"), encoding="utf-8")),
                     ensure_ascii=False, separators=(",", ":"))

html = f"""<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="منصة استدامة كفاءة الإنفاق — الهيئة الملكية لمدينة الرياض. أتمتة ممارسات كفاءة الإنفاق وبرنامج ركائز الاستدامة.">
<title>منصة استدامة كفاءة الإنفاق — الهيئة الملكية لمدينة الرياض</title>
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
window.DATA = {data};
</script>
<script>
{app}
</script>
</body>
</html>
"""
out = os.path.join(HERE, "index.html")
open(out, "w", encoding="utf-8").write(html)
print(f"✓ index.html written ({os.path.getsize(out)//1024} KB) — fully self-contained (offline-ready)")
