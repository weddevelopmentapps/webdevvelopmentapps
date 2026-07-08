# -*- coding: utf-8 -*-
"""Assemble artifact.html — a fully self-contained build for hosting behind a
strict CSP (no external hosts): ECharts and the Arabic fonts are inlined.
The file is body-content only (no <html>/<head>/<body>) because the host wraps it."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
read = lambda p: open(os.path.join(HERE, p), encoding="utf-8").read()

css     = read("src/styles.css")
fonts   = read("vendor/fonts-embedded.css")
echarts = read("vendor/echarts.min.js")
markup  = read("src/markup.html")
app     = read("src/app.js")
data    = json.dumps(json.load(open(os.path.join(HERE, "data.json"), encoding="utf-8")),
                     ensure_ascii=False, separators=(",", ":"))

html = f"""<title>لوحة معلومات سكن العمالة — أمانة منطقة الرياض</title>
<script>document.documentElement.setAttribute('dir','rtl');document.documentElement.setAttribute('lang','ar');</script>
<style>
html{{direction:rtl}}
{fonts}
{css}
</style>
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
"""
out = os.path.join(HERE, "artifact.html")
open(out, "w", encoding="utf-8").write(html)
print(f"✓ artifact.html written ({os.path.getsize(out)//1024} KB)")
