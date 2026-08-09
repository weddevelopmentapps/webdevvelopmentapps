# -*- coding: utf-8 -*-
"""Assemble the fully self-contained index.html (zero external requests):
embedded Arabic fonts + vendored ECharts + official RCRC logo + inline data/app.
Run: python3 generate_data.py && python3 build.py
"""
import base64, json, os
HERE = os.path.dirname(os.path.abspath(__file__))
read = lambda p: open(os.path.join(HERE, p), encoding="utf-8").read()

def data_uri(path):
    with open(os.path.join(HERE, path), "rb") as f:
        return "data:image/png;base64," + base64.b64encode(f.read()).decode()

css     = read("src/styles.css")
markup  = read("src/markup.html")
app     = read("src/app.js")
fonts   = read("vendor/fonts-embedded.css") + "\n" + read("vendor/fonts-light.css")
echarts = read("vendor/echarts.min.js")
logo_emblem = data_uri("assets/logo-emblem.png")
logo_full   = data_uri("assets/logo-full.png")
data    = json.dumps(json.load(open(os.path.join(HERE, "data.json"), encoding="utf-8")),
                     ensure_ascii=False, separators=(",", ":"))
en_dict = json.dumps(json.load(open(os.path.join(HERE, "src/i18n-en.json"), encoding="utf-8")),
                     ensure_ascii=False, separators=(",", ":"))

html = f"""<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="description" content="منصة استدامة كفاءة الإنفاق — الهيئة الملكية لمدينة الرياض. أتمتة ممارسات كفاءة الإنفاق وبرنامج ركائز الاستدامة.">
<title>منصة استدامة كفاءة الإنفاق — الهيئة الملكية لمدينة الرياض</title>
<link rel="icon" type="image/png" href="{logo_emblem}">
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
window.EN_DICT = {en_dict};
</script>
<script>
{app}
</script>
</body>
</html>
"""
html = html.replace("__LOGO_EMBLEM__", logo_emblem).replace("__LOGO_FULL__", logo_full)
out = os.path.join(HERE, "index.html")
open(out, "w", encoding="utf-8").write(html)
print(f"✓ index.html written ({os.path.getsize(out)//1024} KB) — fully self-contained (offline-ready)")
