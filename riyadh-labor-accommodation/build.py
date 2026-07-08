# -*- coding: utf-8 -*-
"""Assemble the self-contained index.html from src/ + data.json."""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
read = lambda p: open(os.path.join(HERE, p), encoding="utf-8").read()

css    = read("src/styles.css")
markup = read("src/markup.html")
app    = read("src/app.js")
data   = json.dumps(json.load(open(os.path.join(HERE, "data.json"), encoding="utf-8")),
                    ensure_ascii=False, separators=(",", ":"))

html = f"""<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>لوحة معلومات السكن الجماعي للأفراد بمدينة الرياض — أمانة منطقة الرياض</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@500;600;700&family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>
<style>
{css}
</style>
</head>
<body>
{markup}
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
print(f"✓ index.html written ({os.path.getsize(out)//1024} KB)")
