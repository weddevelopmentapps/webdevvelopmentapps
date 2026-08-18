# -*- coding: utf-8 -*-
"""يجمّع index.html المستقل من src/ + data.json + assets/.

الصور مضمّنة كـ data URI، فلا يصدر عن الملف أي طلب لصور خارجية.
لاستبدال أي صورة برسم فوتوغرافي فعلي: ضع الملف في assets/ بالاسم نفسه
(بامتداد .jpg أو .png) وحدّث المسار في IMAGES أدناه — لا يلزم تغيير أي كود آخر.
"""
import base64, json, mimetypes, os

HERE = os.path.dirname(os.path.abspath(__file__))
read = lambda p: open(os.path.join(HERE, p), encoding="utf-8").read()

# مفتاح الصورة في الواجهة  ->  الملف في assets/
IMAGES = {
    "cover": "assets/cover.svg",
    "lic":   "assets/sec-licensing.svg",
    "ctl":   "assets/sec-monitoring.svg",
}


def data_uri(rel):
    path = os.path.join(HERE, rel)
    mime = mimetypes.guess_type(path)[0] or "image/svg+xml"
    with open(path, "rb") as f:
        return f"data:{mime};base64," + base64.b64encode(f.read()).decode("ascii")


def bundle():
    imgs = {k: data_uri(v) for k, v in IMAGES.items()}
    return {
        "css": read("src/styles.css"),
        "markup": read("src/markup.html"),
        "app": read("src/app.js"),
        "data": json.dumps(json.load(open(os.path.join(HERE, "data.json"), encoding="utf-8")),
                           ensure_ascii=False, separators=(",", ":")),
        "images": json.dumps(imgs, ensure_ascii=False),
    }


TITLE = "لوحة معلومات السكن الجماعي للأفراد بمدينة الرياض — أمانة منطقة الرياض"

if __name__ == "__main__":
    b = bundle()
    html = f"""<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{TITLE}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Cairo:wght@400;600;700&display=swap" rel="stylesheet">
<script src="https://cdn.jsdelivr.net/npm/echarts@5.5.1/dist/echarts.min.js"></script>
<style>
{b['css']}
</style>
</head>
<body>
{b['markup']}
<script>
window.DATA = {b['data']};
const IMAGES = {b['images']};
</script>
<script>
{b['app']}
</script>
</body>
</html>
"""
    out = os.path.join(HERE, "index.html")
    open(out, "w", encoding="utf-8").write(html)
    print(f"✓ index.html — {os.path.getsize(out)//1024} KB")
