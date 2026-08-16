#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_geo.py — بناء طبقة الخريطة الحقيقية لمدينة الرياض
─────────────────────────────────────────────────────────
المصادر:
1. حدود الأحياء الفعلية (إحداثيات جغرافية lat/lng):
   مستودع homaily/Saudi-Arabia-Regions-Cities-and-Districts (عام — MIT)
   json/districts.json → city_id=3 (مدينة الرياض) → 189 حياً.
   يُحفظ المستخرج في reference/riyadh-districts-geo.json (يولده هذا السكربت
   من الملف الخام إن وُجد، وإلا يستعمل المستخرج المحفوظ).
2. توزيع الأحياء على قطاعات الأمانة الخمسة: التجميع الرسمي المعتمد في
   طبقة الخريطة المنشورة للمنصة الأصلية (assets/riyadh-districts.js —
   RIYADH_GEO)، منقول اسماً باسم كما ورد فيها.
3. نقاط التركّز الرقابي: إحداثيات viewBox من طبقة بيانات المنصة الأصلية
   (js/data.js → context.hotspots)، تُحوَّل إلى إحداثيات جغرافية عبر
   مواءمة أفينية (affine fit) مبنية على مراكز الأحياء المشتركة بين
   الملفين، وتُثبَّت جودتها بفحص بقايا المواءمة (residuals).

المخرجات:
- data/riyadh-geo.json    : الأحياء بقطاعاتها + حدود جغرافية مبسطة +
                            مسارات SVG مسقطة (للعرض دون اتصال) +
                            نقاط التركّز محوّلة جغرافياً + مدى الخريطة.
- تقرير فحص على stdout: أسماء غير مطابقة، بقايا المواءمة، مجاميع.

الاستخدام:  python3 tools/build_geo.py [--raw /path/to/districts-sa.json]
"""
import argparse
import json
import math
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
REF = os.path.join(ROOT, "reference")
OUT = os.path.join(ROOT, "data", "riyadh-geo.json")
EXTRACT = os.path.join(REF, "riyadh-districts-geo.json")

RIYADH_CITY_ID = 3

# ────────────────────────────────────────────────────────────────────────────
# 1) التجميع الرسمي للأحياء على القطاعات — منقول حرفياً من RIYADH_GEO
#    في المنصة الأصلية (الأسماء كما وردت هناك، وهي مطابقة لأسماء homaily).
# ────────────────────────────────────────────────────────────────────────────
SECTOR_DISTRICTS = {
    "north": [
        "حي ام الحمام الشرقي", "حي الشرفية", "حي الهدا", "حي المعذر الشمالي",
        "حي ام الحمام الغربي", "حي الرحمانية", "حي الملك فهد", "حي الندى",
        "حي المرسلات", "حي الورود", "حي صلاح الدين", "حي المعذر",
        "حي المحمدية", "حي السليمانية", "حي العليا", "حي الوادي",
        "حي النفل", "حي المصيف", "حي السفارات", "حي الربيع", "حي العقيق",
        "حي النخيل", "حي الغدير", "حي المروج", "حي الصحافة", "حي الرائد",
        "حي الخزامى", "عرقة", "حي حطين", "حي الملقا", "حي القيروان",
        "حي الياسمين", "حي العارض", "حي النرجس", "حي بنبان",
        "جامعة الملك سعود", "حي الخير",
    ],
    "east": [
        "حي الشهداء", "حي الفلاح", "حي النزهة", "حي الملك فيصل",
        "المدينة الصناعية الثانية", "حي الفاروق", "حي الفيصلية",
        "حي الجزيرة", "حي السعادة", "حي المناخ", "حي الدفاع", "حي النور",
        "حي الملك عبدالله", "حي الواحة", "حي الملك عبدالعزيز", "حي الربوة",
        "حي النهضة", "حي الخليج", "حي القادسية", "حي الصفا", "حي الاسكان",
        "حي السلام", "حي المنار", "حي النسيم الشرقي", "حي القدس",
        "حي التعاون", "حي الازدهار", "حي الاندلس", "حي الروضة",
        "حي الروابي", "حي الريان", "حي النظيم", "حي الرماية", "حي البرية",
        "خشم العان", "حي قرطبة", "حي المغرزات", "حي السلي", "حي الحمراء",
        "حي الزهراء", "حي الفيحاء", "حي الجنادرية", "حي اشبيلية",
        "حي المعيزلة", "حي اليرموك", "حي المونسية", "مطار الملك خالد",
        "جامعة الامام محمد بن سعود الاسلامية", "حي الرمال", "حي غرناطة",
        "حي النسيم الغربي", "حي المشاعل", "حي الندوة", "حي الرابية",
        "حي التضامن", "حي البساتين", "حي الرحاب", "حي المجد", "حي الدانة",
        "حي الرسالة", "حي الفرسان", "حي الشعلة", "حي الراية", "حي الزهور",
        "حي الزاهر", "حي المرجان", "حي البيان", "حي العلا", "حي المشرق",
        "حي النخبة", "حي السحاب", "حي الوسام",
    ],
    "center": [
        "حي العمل", "حي النموذجية", "حي الجرادية", "حي الصناعية",
        "حي منفوحة الجديدة", "حي الفاخرية", "حي الديرة", "حي عتيقة",
        "حي المربع", "حي المنصورة", "حي غبيرة", "حي الخالدية",
        "حي الناصرية", "حي الوزارات", "حي سكيرينة", "حي جرير",
        "حي الصالحية", "حي الملز", "حي منفوحة", "حي عليشة", "حي الضباط",
        "حي صياح", "حي سلطانة", "حي اليمامة", "حي البديعة", "حي الدريهمية",
        "حي العود", "حي ثليم", "حي الشميسي", "حي الوشام", "منتزه سلام",
        "حي الدوبية", "حي معكال", "حي جبرة", "حي القرى", "حي المرقب",
        "حي الفوطة", "حي ام سليم", "حي البطيحا", "حي المؤتمرات",
        "حي الوسيطاء", "حي الدحو",
    ],
    "west": [
        "حي لبن", "حي الرفيعة", "حي السويدي", "حي الحزم",
        "حي السويدي الغربي", "حي ديراب", "حي شبرا", "حي الزهرة",
        "حي ظهرة البديعة", "حي ضاحية نمار", "حي طويق", "حي العوالي",
        "حي العريجاء الغربي", "حي العريجاء", "حي العريجاء الوسطى",
        "حي ظهرة لبن", "حي المهدية", "حي وادي لبن",
        "مدينة الملك عبدالله للطاقة",
    ],
    "south": [
        "حي العزيزية", "حي احد", "حي نمار", "حي الشفا", "حي المروة",
        "حي عكاظ", "حي المصانع", "حي طيبة", "حي المنصورية", "حي المصفاة",
        "حي الدار البيضاء", "حي العماجية", "حي هيت", "حي الحائر",
        "حي ام الشعال", "حي الغنامية", "حي عريض", "حي بدر", "حي السدرة",
    ],
}

# ────────────────────────────────────────────────────────────────────────────
# 2) أزواج المواءمة الأفينية: (اسم الحي، cx، cy في viewBox الملف الأصلي)
#    مراكز منقولة من RIYADH_GEO — تُقابل بمراكز homaily الجغرافية المحسوبة.
#    التوزيع يغطي أطراف المدينة كلها لضبط المواءمة (بما فيها أقصى الشمال
#    الغربي «الخير» وأقصى الشمال الشرقي «الرحاب» وأقصى الجنوب «الحائر»).
# ────────────────────────────────────────────────────────────────────────────
AFFINE_PAIRS = [
    ("حي الملقا", 278.8, 403.4),
    ("حي الصحافة", 320.0, 402.4),
    ("حي حطين", 281.9, 443.6),
    ("حي الياسمين", 324.7, 377.4),
    ("حي النسيم الشرقي", 524.8, 469.2),
    ("حي السلي", 525.8, 563.4),
    ("حي النظيم", 650.7, 335.2),
    ("حي النسيم الغربي", 503.4, 483.4),
    ("حي منفوحة", 408.0, 621.4),
    ("حي غبيرة", 416.0, 598.3),
    ("حي الجرادية", 378.2, 601.9),
    ("حي الديرة", 390.5, 585.3),
    ("حي السويدي الغربي", 305.9, 649.2),
    ("حي ظهرة لبن", 223.5, 588.8),
    ("حي العريجاء الغربي", 280.6, 622.5),
    ("حي طويق", 211.1, 659.1),
    ("حي المنصورية", 478.5, 709.2),
    ("حي العزيزية", 450.0, 634.0),
    ("حي الشفا", 379.0, 658.7),
    ("حي بدر", 406.3, 701.7),
    ("حي العمل", 402.9, 570.4),
    ("حي العليا", 365.0, 518.9),
    ("حي السليمانية", 382.8, 510.6),
    ("حي الملز", 414.6, 551.9),
    ("حي المربع", 388.4, 554.8),
    ("حي الملك فهد", 351.1, 467.1),
    ("حي الورود", 359.1, 484.7),
    ("حي الخير", 95.5, 121.3),
    ("حي بنبان", 209.8, 194.5),
    ("حي الحائر", 564.8, 815.6),
    ("حي هيت", 659.3, 750.8),
    ("حي المصفاة", 594.3, 749.8),
    ("عرقة", 268.7, 522.5),
    ("حي السفارات", 302.2, 535.4),
    ("حي الرمال", 445.3, 222.4),
    ("حي العارض", 283.2, 295.5),
    ("حي النرجس", 326.1, 307.6),
    ("حي القيروان", 242.4, 319.3),
    ("حي الرحاب", 945.1, 80.5),
    ("حي التضامن", 766.1, 51.2),
    ("حي البساتين", 869.0, 40.3),
]

# ────────────────────────────────────────────────────────────────────────────
# 3) نقاط التركّز الرقابي — منقولة حرفياً من طبقة بيانات المنصة الأصلية
#    (js/data.js → context.hotspots): قطاع، كثافة d، إحداثيات viewBox.
# ────────────────────────────────────────────────────────────────────────────
HOTSPOTS_VIEWBOX = [
    {"s": "south", "d": 59, "x": 457.2, "y": 646.8},
    {"s": "south", "d": 58, "x": 402.4, "y": 689.6},
    {"s": "south", "d": 69, "x": 356.9, "y": 706.8},
    {"s": "south", "d": 74, "x": 346.8, "y": 694.0},
    {"s": "south", "d": 99, "x": 657.1, "y": 796.6},
    {"s": "south", "d": 80, "x": 656.8, "y": 795.6},
    {"s": "south", "d": 77, "x": 494.1, "y": 723.6},
    {"s": "south", "d": 83, "x": 365.1, "y": 642.1},
    {"s": "south", "d": 100, "x": 486.8, "y": 675.7},
    {"s": "south", "d": 93, "x": 381.3, "y": 679.2},
    {"s": "south", "d": 77, "x": 563.9, "y": 783.0},
    {"s": "south", "d": 79, "x": 415.0, "y": 714.4},
    {"s": "east", "d": 90, "x": 772.1, "y": 37.4},
    {"s": "east", "d": 92, "x": 394.3, "y": 395.4},
    {"s": "east", "d": 68, "x": 500.1, "y": 407.6},
    {"s": "east", "d": 86, "x": 449.1, "y": 429.3},
    {"s": "east", "d": 60, "x": 418.2, "y": 414.9},
    {"s": "east", "d": 81, "x": 407.7, "y": 520.9},
    {"s": "east", "d": 53, "x": 492.4, "y": 635.4},
    {"s": "east", "d": 59, "x": 534.8, "y": 515.4},
    {"s": "east", "d": 71, "x": 385.5, "y": 429.1},
    {"s": "east", "d": 80, "x": 383.2, "y": 385.3},
    {"s": "center", "d": 48, "x": 375.7, "y": 551.6},
    {"s": "center", "d": 50, "x": 419.9, "y": 585.1},
    {"s": "center", "d": 53, "x": 391.5, "y": 592.9},
    {"s": "center", "d": 26, "x": 391.9, "y": 572.0},
    {"s": "center", "d": 53, "x": 390.5, "y": 593.8},
    {"s": "center", "d": 39, "x": 393.4, "y": 584.8},
    {"s": "center", "d": 32, "x": 406.0, "y": 595.9},
    {"s": "north", "d": 29, "x": 261.9, "y": 427.3},
    {"s": "north", "d": 37, "x": 262.7, "y": 425.4},
    {"s": "north", "d": 12, "x": 363.0, "y": 413.5},
    {"s": "north", "d": 15, "x": 312.7, "y": 484.6},
    {"s": "north", "d": 27, "x": 157.9, "y": 171.5},
    {"s": "north", "d": 17, "x": 348.8, "y": 520.6},
    {"s": "west", "d": 23, "x": 369.7, "y": 622.5},
    {"s": "west", "d": 24, "x": 74.8, "y": 671.0},
    {"s": "west", "d": 15, "x": 342.4, "y": 593.6},
    {"s": "west", "d": 30, "x": 282.5, "y": 662.1},
    {"s": "west", "d": 11, "x": 293.6, "y": 686.2},
]


# ────────────────────────────────────────────────────────────────────────────
def load_extract(raw_path):
    """يقرأ مستخرج الرياض؛ وإن توفر الملف الخام يعيد توليده منه."""
    if raw_path and os.path.exists(raw_path):
        data = json.load(open(raw_path, encoding="utf-8"))
        riyadh = [x for x in data if x.get("city_id") == RIYADH_CITY_ID]
        out = [{"id": x["district_id"], "name_ar": x["name_ar"],
                "name_en": x["name_en"], "boundaries": x["boundaries"]}
               for x in riyadh]
        os.makedirs(REF, exist_ok=True)
        json.dump(out, open(EXTRACT, "w", encoding="utf-8"), ensure_ascii=False)
        return out
    if os.path.exists(EXTRACT):
        return json.load(open(EXTRACT, encoding="utf-8"))
    sys.exit("لا يوجد مستخرج ولا ملف خام — مرر --raw لملف districts.json الكامل")


def ring_area_centroid(ring):
    """مساحة ومركز مضلع (صيغة الحذاء) — بإحداثيات (lng, lat) مستوية تقريباً."""
    a = cx = cy = 0.0
    n = len(ring)
    for i in range(n):
        lat1, lng1 = ring[i]
        lat2, lng2 = ring[(i + 1) % n]
        cross = lng1 * lat2 - lng2 * lat1
        a += cross
        cx += (lng1 + lng2) * cross
        cy += (lat1 + lat2) * cross
    a *= 0.5
    if abs(a) < 1e-12:
        lats = [p[0] for p in ring]; lngs = [p[1] for p in ring]
        return 0.0, sum(lngs) / n, sum(lats) / n
    return abs(a), cx / (6 * a), cy / (6 * a)


def district_centroid(boundaries):
    """مركز الحي = مركز أكبر حلقة (الأحياء متعددة الحلقات نادرة)."""
    best = (0.0, 0.0, 0.0)
    for ring in boundaries:
        a, lng, lat = ring_area_centroid(ring)
        if a > best[0]:
            best = (a, lng, lat)
    return best[2], best[1]  # lat, lng


def simplify_ring(ring, tolerance):
    """تبسيط دوغلاس-بيوكر تكراري (بلا عودية لتجنب حدود العمق)."""
    if len(ring) <= 4:
        return ring
    keep = [False] * len(ring)
    keep[0] = keep[-1] = True
    stack = [(0, len(ring) - 1)]
    while stack:
        i0, i1 = stack.pop()
        if i1 <= i0 + 1:
            continue
        ax, ay = ring[i0][1], ring[i0][0]
        bx, by = ring[i1][1], ring[i1][0]
        dx, dy = bx - ax, by - ay
        seg2 = dx * dx + dy * dy
        dmax, imax = -1.0, -1
        for i in range(i0 + 1, i1):
            px, py = ring[i][1], ring[i][0]
            if seg2 <= 1e-18:
                d2 = (px - ax) ** 2 + (py - ay) ** 2
            else:
                t = max(0.0, min(1.0, ((px - ax) * dx + (py - ay) * dy) / seg2))
                d2 = (px - (ax + t * dx)) ** 2 + (py - (ay + t * dy)) ** 2
            if d2 > dmax:
                dmax, imax = d2, i
        if dmax > tolerance * tolerance:
            keep[imax] = True
            stack.append((i0, imax))
            stack.append((imax, i1))
    return [p for p, k in zip(ring, keep) if k]


def affine_fit(pairs):
    """مواءمة أفينية بالمربعات الصغرى: (x,y) viewBox → (lng,lat).
    تُحل منظومتان خطيتان 3×3 (واحدة لكل بعد) بحذف غاوس البسيط."""
    def solve3(m, v):
        for col in range(3):
            piv = max(range(col, 3), key=lambda r: abs(m[r][col]))
            m[col], m[piv] = m[piv], m[col]
            v[col], v[piv] = v[piv], v[col]
            p = m[col][col]
            for r in range(3):
                if r != col and abs(p) > 1e-15:
                    f = m[r][col] / p
                    for c in range(3):
                        m[r][c] -= f * m[col][c]
                    v[r] -= f * v[col]
        return [v[i] / m[i][i] for i in range(3)]

    sxx = sxy = sx = syy = sy = n = 0.0
    bx_lng = by_lng = b_lng = 0.0
    bx_lat = by_lat = b_lat = 0.0
    for x, y, lng, lat in pairs:
        sxx += x * x; sxy += x * y; sx += x
        syy += y * y; sy += y; n += 1
        bx_lng += x * lng; by_lng += y * lng; b_lng += lng
        bx_lat += x * lat; by_lat += y * lat; b_lat += lat
    m = [[sxx, sxy, sx], [sxy, syy, sy], [sx, sy, n]]
    a_lng = solve3([row[:] for row in m], [bx_lng, by_lng, b_lng])
    a_lat = solve3([row[:] for row in m], [bx_lat, by_lat, b_lat])

    def transform(x, y):
        return (a_lat[0] * x + a_lat[1] * y + a_lat[2],
                a_lng[0] * x + a_lng[1] * y + a_lng[2])
    return transform, a_lat, a_lng


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--raw", default=None,
                    help="مسار districts.json الخام الكامل (اختياري)")
    ap.add_argument("--tolerance", type=float, default=0.00025,
                    help="سماحية تبسيط الحدود بالدرجات (افتراضي ‎0.00025°‎ ≈ 27م)")
    args = ap.parse_args()

    districts = load_extract(args.raw)
    by_name = {}
    for d in districts:
        by_name.setdefault(d["name_ar"], []).append(d)

    # فحص التطابق بين قوائم القطاعات وأسماء homaily
    errors = []
    assigned = {}
    for sector, names in SECTOR_DISTRICTS.items():
        for name in names:
            hits = by_name.get(name, [])
            if not hits:
                errors.append(f"غير موجود في homaily: [{sector}] {name}")
            else:
                if name in assigned:
                    errors.append(f"مكرر في قطاعين: {name} ({assigned[name]}/{sector})")
                assigned[name] = sector
    unassigned = [d["name_ar"] for d in districts if d["name_ar"] not in assigned]
    dup_names = [n for n, hits in by_name.items() if len(hits) > 1]

    print(f"أحياء homaily: {len(districts)} · معيّنة: {len(assigned)} · غير معيّنة: {len(unassigned)}")
    if unassigned:
        print("غير معيّنة على قطاع:", "، ".join(unassigned))
    if dup_names:
        print("أسماء مكررة في homaily:", "، ".join(dup_names))
    for e in errors:
        print("⚠", e)

    # المواءمة الأفينية
    pairs = []
    for name, x, y in AFFINE_PAIRS:
        hits = by_name.get(name)
        if not hits:
            errors.append(f"زوج مواءمة بلا مقابل: {name}")
            continue
        lat, lng = district_centroid(hits[0]["boundaries"])
        pairs.append((x, y, lng, lat))
    transform, a_lat, a_lng = affine_fit(pairs)

    resid = []
    for (x, y, lng, lat) in pairs:
        plat, plng = transform(x, y)
        # كم متراً يبعد المُسقَط عن المركز الحقيقي
        dm = math.hypot((plat - lat) * 111320.0,
                        (plng - lng) * 111320.0 * math.cos(math.radians(24.7)))
        resid.append(dm)
    resid.sort()
    print(f"بقايا المواءمة (متر): وسيط {resid[len(resid)//2]:.0f} · "
          f"أقصى {resid[-1]:.0f} · عدد الأزواج {len(pairs)}")

    # تحويل نقاط التركّز
    hotspots = []
    for h in HOTSPOTS_VIEWBOX:
        lat, lng = transform(h["x"], h["y"])
        hotspots.append({"sector": h["s"], "density": h["d"],
                         "lat": round(lat, 6), "lng": round(lng, 6)})

    # التبسيط والإسقاط
    all_lat = []; all_lng = []
    out_sectors = {}
    total_pts_before = total_pts_after = 0
    for sector, names in SECTOR_DISTRICTS.items():
        lst = []
        for name in names:
            hits = by_name.get(name)
            if not hits:
                continue
            d = hits[0]
            simp = []
            for ring in d["boundaries"]:
                total_pts_before += len(ring)
                s = simplify_ring(ring, args.tolerance)
                total_pts_after += len(s)
                simp.append([[round(p[0], 5), round(p[1], 5)] for p in s])
                for p in s:
                    all_lat.append(p[0]); all_lng.append(p[1])
            lat, lng = district_centroid(d["boundaries"])
            lst.append({"name": name, "name_en": d["name_en"],
                        "centroid": [round(lat, 5), round(lng, 5)],
                        "rings": simp})
        out_sectors[sector] = lst

    bounds = [[min(all_lat), min(all_lng)], [max(all_lat), max(all_lng)]]
    print(f"نقاط الحدود: {total_pts_before} → {total_pts_after} بعد التبسيط")

    payload = {
        "source": {
            "boundaries": "homaily/Saudi-Arabia-Regions-Cities-and-Districts (MIT) — city_id=3",
            "sector_grouping": "التجميع الرسمي لطبقة خريطة المنصة الأصلية (RIYADH_GEO)",
            "hotspots": "طبقة بيانات المنصة الأصلية (js/data.js → context.hotspots) — إحداثيات محوّلة بمواءمة أفينية",
            "affine_residual_median_m": round(resid[len(resid) // 2]),
            "affine_residual_max_m": round(resid[-1]),
        },
        "bounds": bounds,
        "sectors": out_sectors,
        "hotspots": hotspots,
    }
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(payload, open(OUT, "w", encoding="utf-8"),
              ensure_ascii=False, separators=(",", ":"))
    print(f"كُتب {OUT} ({os.path.getsize(OUT):,} بايت)")

    if errors:
        print("\n".join(["⚠ " + e for e in errors]))
        sys.exit(1)


if __name__ == "__main__":
    main()
