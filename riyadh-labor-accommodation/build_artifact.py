# -*- coding: utf-8 -*-
"""يجمّع artifact.html — نسخة مستقلة تماماً بلا أي طلب خارجي.

ECharts والخطوط العربية مضمّنة من vendor/، والصور من assets/ كـ data URI.
الملف محتوى جسم فقط (بلا <html>/<head>/<body>) لأن المضيف يغلّفه.
"""
import os
from build import bundle, read, TITLE

HERE = os.path.dirname(os.path.abspath(__file__))
b = bundle()
fonts = read("vendor/fonts-embedded.css")
echarts = read("vendor/echarts.min.js")

html = f"""<title>{TITLE}</title>
<script>document.documentElement.setAttribute('dir','rtl');document.documentElement.setAttribute('lang','ar');</script>
<style>
html{{direction:rtl}}
{fonts}
{b['leafletCss']}
{b['css']}
</style>
{b['markup']}
<script>
{echarts}
</script>
<script>
{b['leafletJs']}
</script>
<script>
window.DATA = {b['data']};
const IMAGES = {b['images']};
</script>
<script>
{b['app']}
</script>
"""
out = os.path.join(HERE, "artifact.html")
open(out, "w", encoding="utf-8").write(html)
print(f"✓ artifact.html — {os.path.getsize(out)//1024} KB")
