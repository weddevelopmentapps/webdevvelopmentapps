#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build.py — يجمع src/ + vendor/ + data/ في ملف index.html واحد مكتفٍ بذاته
========================================================================

الناتجان:
  index.html      — التطبيق الكامل (مقدِّم + إدارة) يعمل بالنقر المزدوج ودون اتصال.
  dist/           — نسخة النشر لـ GitHub Pages (نفس الملف + الوسائط + 404.html)

قواعد:
  • لا طلبات خارجية وقت التشغيل: الخطوط وECharts والبيانات كلها مضمّنة.
  • الوسائط (فيديو/ملصقات) ملفات شقيقة في assets/media/ — التطبيق يتدرج بأناقة عند غيابها.
  • data/release.json يجب أن يكون مولّداً من generate_data.py (بواباته هي حارس الصدق).
"""

import glob
import hashlib
import json
import os
import re
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))


def _globbed(pattern, exclude=()):
    """glob مرتب حتمياً نسبةً إلى جذر المشروع (عقد V2_CONTRACTS §8)"""
    paths = sorted(glob.glob(os.path.join(HERE, pattern)))
    rels = [os.path.relpath(p, HERE).replace(os.sep, "/") for p in paths]
    return [p for p in rels if os.path.basename(p) not in exclude]


# ترتيب الضم إلزامي: كل ملف يعتمد على ما قبله فقط.
# V2: مشاهد V1 (presenter/scenes/*) متقاعدة — خارج الضم والملفات باقية للمرجع.
JS_ORDER = [
    "src/js/core/ns.js",
    "src/js/core/dom.js",
    "src/js/core/format.js",
    "src/js/core/bus.js",
    # V3: مبدّل السمة يسبق كل شيء مرئي (يطبّق data-theme قبل أول بناء)
    "src/js/core/theme-mode.js",
    "src/js/data/derive.js",
    "src/js/data/validate.js",
    "src/js/data/store.js",
    "src/js/data/import-xlsx.js",
    "src/js/core/router.js",
    "src/js/viz/theme.js",
    # V3: عدّة الهوية تسبق كل مستهلكيها (قشرة التبويبات ترسم قفل الرأس)
    "src/js/brand/brand.js",
    "src/js/viz/charts.js",
    # حزمة التوسعة — الأسس المشتركة (V2_CONTRACTS_EXPANSION §1):
    # مكتبة الرسوم المصغرة وأدوات الجغرافيا النقية تسبق كل مستهلكيها.
    "src/js/viz/charts-micro.js",
    "src/js/viz/geomap-utils.js",
    "src/js/viz/map.js",
    "src/js/viz/rings.js",
    "src/js/viz/motion.js",
    "src/js/viz/geomap.js",
    "src/js/presenter/engine.js",
    "src/js/presenter/nav.js",
    "src/js/presenter/chrome.js",
    "src/js/presenter/layout.js",
    "src/js/presenter/media-bg.js",
    # V3: نافذة الإبراز (الطبقة الثانية من سلوك النقر) قبل أي بانٍ يستدعيها
    "src/js/presenter/highlight.js",
    "src/js/presenter/sections/registry.js",
] + _globbed("src/js/viz/charts/*.js") \
  + _globbed("src/js/presenter/sections/*.js", exclude=("registry.js",)) + [
    "src/js/presenter/appendix/ax-shell.js",
    "src/js/presenter/appendix/ax-demand.js",
    "src/js/presenter/appendix/ax-licensing.js",
    "src/js/presenter/appendix/ax-monitoring.js",
    "src/js/presenter/appendix/ax-pillar.js",
    "src/js/presenter/appendix/ax-kpi.js",
    # ملاحق حزمة التوسعة (تعتمد على ax-shell وgeoutils وmicro — كلها قبلها)
    "src/js/presenter/appendix/ax-scenarios.js",
    "src/js/presenter/appendix/ax-atlas.js",
    "src/js/presenter/appendix/ax-methodology.js",
    "src/js/presenter/appendix/ax-decisions.js",
    # مركز المقارنة القطاعية: يعتمد على ax-shell وgeoutils وmicro وlayout —
    # كلها قبله، ونموذجه النقي على RH.explore المُنشأ في ns.js.
    "src/js/presenter/appendix/ax-compare.js",
    # الجولة الموجهة ولوحة الأوامر: جدول الملاحظات قبل الجولة، واللوحة تفهرس
    # الأقسام والملاحق فتأتي بعد تسجيلها جميعاً.
    "src/js/presenter/notes-data.js",
    "src/js/presenter/tour.js",
    "src/js/presenter/palette.js",
    # V3: قشرة التبويبات بعد المحرك والملاحق والوحدات الاختيارية — تفحص وجودها
    "src/js/presenter/tabs.js",
] + _globbed("src/js/presenter/tabs/*.js") + [
    # الموجز التنفيذي: لقطات الرسوم ← نموذج الصفحات ← المستند
    "src/js/report/report-charts.js",
    "src/js/report/report-pages.js",
    "src/js/report/report.js",
    "src/js/admin/auth.js",
    "src/js/admin/shell.js",
    "src/js/admin/quality.js",
    "src/js/admin/editors.js",
    "src/js/admin/editors-strategy.js",
    "src/js/admin/editors-insights2.js",
    "src/js/admin/publish.js",
    # تبويبا الإدارة الجديدان (منشئ الموجز يقرأ RH.report.pages المضموم قبله)
    "src/js/admin/report-builder.js",
    "src/js/admin/diff-viewer.js",
    "src/js/app.js",
]

CSS_ORDER = [
    "src/styles/tokens.css",
    "src/styles/base.css",
    # V3: الهوية قبل كل مستهلكيها، والقشرة بعد الأساسات
    "src/styles/brand.css",
    "src/styles/presenter.css",
    "src/styles/dashboard.css",
    "src/styles/micro.css",          # مكتبة الرسوم المصغرة (بعد dashboard)
    "src/styles/scenes.css",
    "src/styles/appendix.css",
    "src/styles/chrome-ext.css",     # أزرار HUD الجديدة (بادئة hudx-)
    "src/styles/tabs.css",           # قشرة التبويبات (tabs-/tabtrack-/tabx-/tab-)
    "src/styles/highlight.css",      # نافذة الإبراز (hl-)
] + _globbed("src/styles/sections/*.css") \
  + _globbed("src/styles/tabs/*.css") + [
    # أنماط التبويبات الخمسة (dem-/lic-/mon-/int-/kpi-) — بعد قشرة التبويبات
    # ‎tabs.css‎ كي تتقدم قواعد كل تبويب على قواعد القشرة العامة.
    "src/styles/admin.css",
    "src/styles/admin-ext.css",      # تبويبا الإدارة الجديدان (بادئة adf-)
    "src/styles/print.css",
    # أنماط حزمة التوسعة بعد print.css كي تتقدم قواعد ‎@media print الخاصة
    # بالموجز على القواعد العامة (الموجز مستند طباعة أولاً — عقد §3).
    "src/styles/report.css",
    "src/styles/scenarios.css",
    "src/styles/atlas.css",
    "src/styles/tour.css",
    "src/styles/palette.css",
    "src/styles/methodology.css",
    "src/styles/decisions.css",
    "src/styles/compare.css",
]

FAVICON = ("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E"
           "%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E"
           "%3Cstop offset='0' stop-color='%23127C74'/%3E"
           "%3Cstop offset='1' stop-color='%230B6B4F'/%3E%3C/linearGradient%3E%3C/defs%3E"
           "%3Crect width='32' height='32' rx='8' fill='%23F7F9F8'/%3E"
           "%3Cg transform='skewX(-16) translate(4,0)'%3E"
           "%3Crect x='7' y='6' width='7' height='20' rx='1.4' fill='url(%23g)'/%3E"
           "%3Crect x='15' y='6' width='5.5' height='20' rx='1.4' fill='url(%23g)' opacity='.7'/%3E"
           "%3Crect x='22' y='6' width='4.5' height='20' rx='1.4' fill='url(%23g)' opacity='.44'/%3E"
           "%3C/g%3E%3C/svg%3E")


def read(path):
    with open(os.path.join(HERE, path), encoding="utf-8") as f:
        return f.read()


def _embed_data_uri(rel_path, mime, max_bytes=650_000):
    """يضمّن ملف وسائط محلياً data URI إن وُجد وكان ≤ الحد — وإلا None.
    (إصلاح المراجعة: ملصق الغلاف يُضمَّن وقت البناء كي يعرض file:// دون
    اتصال صورة فوتوغرافية لا الصورة الظلية المرسومة — التضمين مشروط بوجود
    الملف عبر tools/fetch_media.sh فلا يكسر بيئة بناء بلا وسائط.)"""
    import base64
    path = os.path.join(HERE, rel_path)
    if not os.path.exists(path):
        return None
    size = os.path.getsize(path)
    if size > max_bytes:
        print(f"⚠ {rel_path} أكبر من حد التضمين ({size} بايت) — يُترك ملفاً شقيقاً")
        return None
    with open(path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("ascii")
    return f"data:{mime};base64,{b64}"


BRAND_FILES = ("logo-full", "logo-mark", "logo-white")
BRAND_EXTS = (("svg", "image/svg+xml"), ("png", "image/png"),
              ("webp", "image/webp"), ("jpg", "image/jpeg"))


def brand_payload():
    """window.BRAND — أصول الهوية الرسمية من assets/brand/ بصيغة data URI.

    عقد V3_SPEC §2: المجلد **فتحة إدراج** لا أكثر. وجود الملفات يكمل الهوية
    تلقائياً دون تغيير سطر كود؛ وغيابها يترك RH.brand يرسم البديل المعلن.
    لا يُلفَّق شعار رسمي في أي حال.
    """
    out = {}
    base = os.path.join(HERE, "assets", "brand")
    if not os.path.isdir(base):
        print("· assets/brand/ غير موجود — الهوية بالبديل المرسوم كوداً")
        return out
    for name in BRAND_FILES:
        for ext, mime in BRAND_EXTS:
            uri = _embed_data_uri("assets/brand/%s.%s" % (name, ext), mime,
                                  max_bytes=900_000)
            if uri:
                out[name] = uri
                break
    if out:
        print("✓ أصول الهوية المضمّنة: " + "، ".join(sorted(out)))
    else:
        print("· assets/brand/ فارغ — الهوية بالبديل المرسوم كوداً")
    return out


def media_payload():
    """window.MEDIA من data/media-v2-jobs.json (عقد V2_CONTRACTS §6)"""
    path = os.path.join(HERE, "data", "media-v2-jobs.json")
    if not os.path.exists(path):
        return {"backdrops": {}, "cover": {}}
    jobs = json.load(open(path, encoding="utf-8"))
    backdrops = {row["section"]: row["url"]
                 for row in jobs.get("v2_backdrops", []) if row.get("url")}
    cov = jobs.get("cover_urls", {})
    cover = {
        "poster": cov.get("poster_2k"),
        "video": cov.get("video_2k"),
        "video_720": cov.get("video_720"),
        "poster_1k": cov.get("poster_1k"),
        "night_grid": cov.get("night_grid"),
        "heritage": cov.get("heritage"),
    }
    # ملصق الغلاف المضمّن (إن جُلب عبر tools/fetch_media.sh) — الأولوية القصوى
    embedded = (_embed_data_uri("assets/media/cover-poster.jpg", "image/jpeg")
                or _embed_data_uri("assets/media/cover-poster-1k.jpg", "image/jpeg")
                or _embed_data_uri("assets/media/cover-poster.png", "image/png"))
    if embedded:
        cover["poster_embedded"] = embedded
        print("✓ ملصق الغلاف مضمّن data URI — يعمل من file:// دون اتصال")
    return {"backdrops": backdrops, "cover": {k: v for k, v in cover.items() if v}}


def main():
    release_path = os.path.join(HERE, "data", "release.json")
    if not os.path.exists(release_path):
        sys.exit("✗ شغّل generate_data.py أولاً — data/release.json غير موجود")
    release = json.load(open(release_path, encoding="utf-8"))

    geo_path = os.path.join(HERE, "data", "riyadh-geo.json")
    if not os.path.exists(geo_path):
        sys.exit("✗ data/riyadh-geo.json غير موجود — حدود الأحياء لازمة للخرائط V2")
    geo = json.load(open(geo_path, encoding="utf-8"))

    # CSS: نفس تسامح JS مع الملفات غير المكتوبة بعد — البناء يبقى أخضر أثناء
    # تقدم وكلاء التوسعة، والإنذار يسمّي الغائب صراحةً (لا صمت).
    css_parts = []
    missing_css = []
    for p in CSS_ORDER:
        if not os.path.exists(os.path.join(HERE, p)):
            missing_css.append(p)
            continue
        css_parts.append(f"/* ═══ {p} ═══ */\n" + read(p))
    css = "\n".join(css_parts)
    if missing_css:
        print(f"⚠ أنماط غير موجودة بعد (بناء جزئي): {len(missing_css)}")
        for p in missing_css:
            print("   ·", p)
    fonts = read("vendor/fonts-embedded.css") + "\n" + read("vendor/fonts-light.css")
    echarts = read("vendor/echarts.min.js")
    # Leaflet مضمن (vendor/leaflet — منسوب لمصدره في LICENSE.txt):
    # JS في وسم <script> منفصل قبل التطبيق حفاظاً على الوضع الصارم للتطبيق،
    # وCSS قبل أنماط المشروع كي تتقدم عليها تحييدات الثيم.
    leaflet_js = read("vendor/leaflet/leaflet.js")
    css = read("vendor/leaflet/leaflet.css") + "\n" + css

    js_parts = []
    missing = []
    for p in JS_ORDER:
        if not os.path.exists(os.path.join(HERE, p)):
            missing.append(p)
            continue
        body = read(p)
        js_parts.append(f"/* ═══ {p} ═══ */\n" + body)
    js = "\n".join(js_parts)
    if missing:
        print(f"⚠ ملفات غير موجودة بعد (بناء جزئي): {len(missing)}")
        for p in missing:
            print("   ·", p)

    manifest = json.load(open(os.path.join(HERE, "data", "workbook_manifest.json"), encoding="utf-8"))

    html = read("src/markup.html")
    html = html.replace("__FAVICON__", FAVICON)
    html = html.replace("/*__FONTS__*/", fonts)
    html = html.replace("/*__CSS__*/", css)
    # ترتيب الحقن: البيانات (الإصدار + الحدود + الوسائط) ثم المكتبات ثم التطبيق
    html = html.replace("//__RELEASE__",
                        "window.RELEASE = " + json.dumps(release, ensure_ascii=False) + ";\n"
                        + "window.WORKBOOK_MANIFEST = " + json.dumps(manifest, ensure_ascii=False) + ";\n"
                        + "window.GEO = " + json.dumps(geo, ensure_ascii=False) + ";\n"
                        + "window.MEDIA = " + json.dumps(media_payload(), ensure_ascii=False) + ";\n"
                        + "window.BRAND = " + json.dumps(brand_payload(), ensure_ascii=False) + ";")
    html = html.replace("//__ECHARTS__", echarts)
    html = html.replace("//__LEAFLET__", leaflet_js)
    html = html.replace("//__APP__", js)

    out = os.path.join(HERE, "index.html")
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    size = os.path.getsize(out)
    sha = hashlib.sha256(open(out, "rb").read()).hexdigest()[:16]
    print(f"✓ index.html — {size/1024:.0f} KB  sha256={sha}…")

    # حزمة النشر
    dist = os.path.join(HERE, "dist")
    os.makedirs(dist, exist_ok=True)
    shutil.copy2(out, os.path.join(dist, "index.html"))
    shutil.copy2(out, os.path.join(dist, "404.html"))  # مسارات هاش — 404 يعيد التطبيق نفسه
    media_src = os.path.join(HERE, "assets", "media")
    media_dst = os.path.join(dist, "assets", "media")
    if os.path.isdir(media_src):
        shutil.rmtree(media_dst, ignore_errors=True)
        shutil.copytree(media_src, media_dst)
        n = len(os.listdir(media_dst))
        print(f"✓ dist/ — نسخة النشر مع {n} ملف وسائط (المصادر الخاصة مستثناة)")
    else:
        print("✓ dist/ — نسخة النشر (لا وسائط بعد — يعمل البديل المدرّج)")


if __name__ == "__main__":
    main()
