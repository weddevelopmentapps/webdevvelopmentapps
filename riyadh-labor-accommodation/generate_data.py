# -*- coding: utf-8 -*-
"""
يبني data.json من مصنّف البيانات الرئيسي الفعلي (master_data_V2.xlsx).

مبدأ حاكم: لا يُخترع أي رقم. كل قيمة في data.json إما مقروءة حرفياً من المصنّف،
أو محسوبة من قيم المصنّف بقاعدة معلنة في حقل rule. وكل رسم بياني لا يوجد له
مصدر فعلي في المصنّف يُدرج في سجل gaps ويُعرض في اللوحة بحالة «لا تتوفر بيانات فعلية».

    python3 generate_data.py     # يكتب data.json
"""
import json, os, datetime
import openpyxl

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "master_data_V2.xlsx")
OUT = os.path.join(HERE, "data.json")

wb = openpyxl.load_workbook(SRC, data_only=True)


# ---------------------------------------------------------------- قراءة عامة
def rows(sheet, header_row=1):
    """صفوف الورقة كقواميس بمفاتيح رؤوس الأعمدة، مع تجاهل الصفوف الفارغة وصفوف «الإجمالي (تحقق)»."""
    ws = wb[sheet]
    data = list(ws.iter_rows(values_only=True))
    head = [str(c).strip() if c is not None else "" for c in data[header_row - 1]]
    out = []
    for r in data[header_row:]:
        if all(c is None or str(c).strip() == "" for c in r):
            continue
        d = {head[i]: r[i] for i in range(min(len(head), len(r)))}
        first = d.get(head[0])
        if first is None or str(first).strip() == "":
            continue  # صف الإجمالي في المصنّف يترك عمود المعرف فارغاً
        out.append(d)
    return out


def num(v, default=None):
    if v is None or (isinstance(v, str) and v.strip() == ""):
        return default
    return float(v)


def i(v, default=None):
    n = num(v, None)
    return default if n is None else int(round(n))


def iso(v):
    if isinstance(v, (datetime.datetime, datetime.date)):
        return v.strftime("%Y-%m-%d")
    return None


def kv(sheet, key_col, val_col, header_row=1):
    return {r[key_col]: r[val_col] for r in rows(sheet, header_row)}


# ---------------------------------------------------------------- 02 البيانات الرئيسية
main = {r["المعرف"]: r for r in rows("02_البيانات_الرئيسية")}
mv = lambda k: main[k]["القيمة"]

meta = {
    "title": "لوحة معلومات السكن الجماعي للأفراد بمدينة الرياض",
    "entity": "أمانة منطقة الرياض",
    "agency": "وكالة التنمية الحضرية",
    "asOf": str(mv("meta_asof")),
    "today": iso(mv("meta_today")),
    "source": "مصنّف البيانات الرئيسي V2 — 2026-08-18",
    "sourceFile": "master_data_V2.xlsx",
}

totals = {
    "demand": i(mv("main_demand")),
    "supply": i(mv("main_supply")),
    "gap": i(mv("main_gap")),
    "coverage": num(mv("main_coverage")),
    "buildingLic": i(mv("main_building")),
    "operationalLic": i(mv("main_operational")),
    "inspectors": i(mv("main_inspectors")),
    "violations": i(mv("main_violations")),
    "visits": i(mv("main_visits")),
    "compliance": num(mv("main_compliance")),
    "initiatives": i(mv("main_ini_total")),
    "closures": None,  # ورقة 10: «غير متوفر» صراحةً
}

# 03 — العرض والطلب
sd = {r["metric_id"]: r for r in rows("03_العرض_والطلب")}
totals["blue"] = i(sd["sd_collar_blue"]["القيمة"])
totals["white"] = i(sd["sd_collar_white"]["القيمة"])
totals["gapPct"] = num(sd["sd_gap_pct"]["القيمة"])
totals["multiple"] = num(sd["sd_multiple"]["القيمة"])

# ---------------------------------------------------------------- القطاعات
sec_supply = {r["sector_id"]: r for r in rows("08_التراخيص_حسب_القطاع")}
sec_ctl = {r["sector_id"]: r for r in rows("11_الرقابة_حسب_القطاع")}

sectors = []
for r in rows("04_العرض_والطلب_حسب_القطاع"):
    sid = r["sector_id"]
    s = sec_supply.get(sid, {})
    c = sec_ctl.get(sid, {})
    sectors.append({
        "id": sid,
        "name": r["القطاع"],
        "short": r["القطاع"].replace("قطاع ", ""),
        "demand": i(r["الطلب"]),
        "supply": i(r["العرض"]),
        "gap": i(r["الفجوة"]),
        "coverage": num(r["نسبة_التغطية"]),
        "buildLic": i(s.get("رخص_البناء"), 0),
        "opLic": i(s.get("الرخص_التشغيلية"), 0),
        "totalLic": i(s.get("إجمالي_الرخص"), 0),
        "capacity": i(s.get("الطاقة_الاستيعابية"), 0),
        "inspectors": i(c.get("عدد_المراقبين"), 0),
        "visits": i(c.get("عدد_الزيارات"), 0),
        "violations": i(c.get("عدد_المخالفات"), 0),
        "closures": i(c.get("عدد_الإغلاقات"), None),
    })

# صف «غير مصنف قطاعياً» موجود في ورقة 08 فقط — يُعرض كبند مستقل معلّق على قرار الجهة
un = sec_supply.get("sector_unassigned", {})
unassigned = {
    "id": "sector_unassigned",
    "name": un.get("القطاع", "غير مصنف قطاعياً"),
    "buildLic": i(un.get("رخص_البناء"), 0),
    "opLic": i(un.get("الرخص_التشغيلية"), 0),
    "totalLic": i(un.get("إجمالي_الرخص"), 0),
    "capacity": i(un.get("الطاقة_الاستيعابية"), 0),
    "note": "صف مدرج في المصدر بلا اسم قطاع — يحتاج قراراً: توزيعه على القطاعات أو اعتماده بنداً مستقلاً.",
}

# ---------------------------------------------------------------- 05 المجموعات المهنية
activities = [{
    "id": r["activity_id"],
    "name": r["النشاط"],
    "demand": i(r["الطلب"]),
    "rank": i(r["الترتيب"]),
} for r in rows("05_الطلب_حسب_النشاط")]
activities.sort(key=lambda a: a["rank"])

# ---------------------------------------------------------------- 06 / 07 التراخيص
lic_metrics = {r["metric_id"]: r for r in rows("06_التراخيص")}
licDelta = {}
for key, mid in (("building", "lic_building"), ("operational", "lic_operational"), ("capacity", "lic_capacity")):
    r = lic_metrics[mid]
    licDelta[key] = {
        "label": r["المؤشر"],
        "current": i(r["القيمة_الحالية"]),
        "baseline": i(r["قيمة_خط_الأساس"]),
        "change": i(r["التغير"]),
        "pct": num(r["نسبة_التغير"]),
        "unit": r["الوحدة"],
        "baselineDate": iso(r["تاريخ_خط_الأساس"]),
        "currentDate": iso(r["تاريخ_القيمة_الحالية"]),
        "owner": r.get("الجهة_المصدرة_للبيانات"),
        "sourceStatus": r.get("حالة_المصدر"),
    }
totals["capacity"] = licDelta["capacity"]["current"]

licMonthly = [{
    "id": r["month_id"],
    "label": r["الشهر"],
    "date": iso(r["التاريخ"]),
    "newBuild": i(r["رخص_البناء_الجديدة"], 0),
    "newOp": i(r["الرخص_التشغيلية_الجديدة"], 0),
    "newCap": i(r["الطاقة_الاستيعابية_المضافة"], 0),
    "cumBuild": i(r["رخص_البناء_التراكمية"]),
    "cumOp": i(r["الرخص_التشغيلية_التراكمية"]),
    "cumCap": i(r["الطاقة_الاستيعابية_التراكمية"]),
    "isBaseline": r["month_id"] == "m_base",
} for r in rows("07_التراخيص_الشهرية")]

housingTypes = [{
    "id": r["housing_type_id"],
    "name": r["نوع_السكن"],
    "licenses": i(r["عدد_الرخص"]),
    "capacity": i(r["الطاقة_الاستيعابية"]),
    "icon": r["icon_key"],
    "rank": i(r["الترتيب"]),
} for r in rows("09_أنواع_المساكن")]
housingTypes.sort(key=lambda h: h["rank"])
for h in housingTypes:
    h["avgBeds"] = round(h["capacity"] / h["licenses"], 1) if h["licenses"] else None

# ---------------------------------------------------------------- الرقابة
violTypes = [{
    "id": r["violation_type_id"],
    "name": r["نوع_المخالفة"],
    "count": i(r["عدد_المخالفات"]),
    "rank": i(r["الترتيب"]),
} for r in rows("12_المخالفات_حسب_النوع")]
violTypes.sort(key=lambda v: v["rank"])

inspMonthly = [{
    "id": r["month_id"],
    "label": r["الشهر"],
    "date": iso(r["التاريخ"]),
    "visits": i(r["الزيارات_الرقابية"]),
    "violations": i(r["المخالفات"]),
} for r in rows("18_الرقابة_الشهرية")]
for m in inspMonthly:
    m["rate"] = round(m["violations"] / m["visits"], 4) if m["visits"] else None

sector_name = {s["id"]: s["name"] for s in sectors}
neighborhoods = [{
    "id": r["neighborhood_id"],
    "name": r["الحي"],
    "sectorId": r["sector_id"],
    "sector": r.get("القطاع") or sector_name.get(r["sector_id"], ""),
    "buildLic": i(r["رخص_البناء"], 0),
    "opLic": i(r["الرخص_التشغيلية"], 0),
    "capacity": i(r["الطاقة_الاستيعابية"], 0),
    "violations": i(r["عدد_المخالفات"], 0),
    "visits": i(r["عدد_الزيارات"], None),
    "lat": num(r["خط_العرض"], None),
    "lng": num(r["خط_الطول"], None),
    "quality": r.get("جودة_البيانات"),
} for r in rows("13_الأحياء")]

# ---------------------------------------------------------------- المبادرات
goals, sec = [], None
for r in wb["17_تعريفات_ومراجع"].iter_rows(values_only=True):
    c = [("" if x is None else str(x).strip()) for x in r]
    if c[1] == "الأهداف":
        sec = "goals"; continue
    if c[1] in ("القطاعات", "حالات المبادرات", "أنواع المساكن", "اتجاه المؤشر"):
        sec = None; continue
    if sec == "goals" and c[1].startswith("g") and c[1] != "goal_id":
        goals.append({"id": c[1], "name": c[2], "desc": c[3]})

TODAY = datetime.date.fromisoformat(meta["today"])
initiatives = []
for r in rows("14_المبادرات"):
    start, end = iso(r["تاريخ_البدء"]), iso(r["تاريخ_الانتهاء"])
    initiatives.append({
        "id": r["initiative_id"],
        "num": str(r["رقم_المبادرة"]),
        "name": r["اسم_المبادرة"],
        "goalId": r["goal_id"],
        "goal": r["الهدف"],
        "statusInFile": r.get("الحالة_في_الملف"),
        "status": r["الحالة_المعروضة_حالياً"],
        "start": start,
        "end": end,
        "owner": r.get("الجهة_المسؤولة"),
        # أيام التأخر عن تاريخ الانتهاء — محسوبة من تاريخ اليوم المرجعي في المصنّف
        "overdueDays": (TODAY - datetime.date.fromisoformat(end)).days
        if end and r["الحالة_المعروضة_حالياً"] == "متأخرة" else None,
    })

plan = [{
    "id": r["plan_item_id"],
    "initiativeId": r["initiative_id"],
    "num": str(r["رقم_المبادرة"]),
    "name": r["اسم_النشاط"],
    "start": iso(r["تاريخ_البدء"]),
    "end": iso(r["تاريخ_الانتهاء"]),
    "status": r["الحالة"],
    "order": i(r["الترتيب"]),
} for r in rows("15_خطة_المبادرات")]
plan.sort(key=lambda p: p["order"])

# ---------------------------------------------------------------- مؤشرات الأداء
kpis = []
for r in rows("16_مؤشرات_الأداء"):
    base, cur, tgt = num(r["خط_الأساس"]), num(r["القيمة_الحالية"]), num(r["المستهدف"])
    span = (tgt - base) if tgt is not None and base is not None else None
    kpis.append({
        "id": r["kpi_id"],
        "name": r["اسم_المؤشر"],
        "goalId": r["goal_id"],
        "goal": r["الهدف"],
        "baseline": base,
        "current": cur,
        "target": tgt,
        "unit": r["الوحدة"],
        "type": r["نوع_المؤشر"],
        "direction": r["اتجاه_الأداء"],
        "period": r["الفترة"],
        "quality": r["جودة_البيانات"],
        "source": r.get("المصدر"),
        "sourceStatus": r.get("حالة_المصدر"),
        # نسبة قطع المسافة من خط الأساس إلى المستهدف
        "progress": round((cur - base) / span, 4) if span else None,
    })

# ---------------------------------------------------------------- سجل المصادر
sources = [{
    "id": r["dataset_id"],
    "item": r["البند"],
    "section": r["القسم_في_اللوحة"],
    "sheet": r["الورقة/العمود"],
    "owner": r["الجهة_المصدرة_للبيانات"],
    "source": r.get("المصدر"),
    "status": r["حالة_المصدر"],
    "notes": r.get("ملاحظات_المصدر"),
} for r in rows("19_مصادر_البيانات")]

# ---------------------------------------------------------------- إسقاط محتسب
# قاعدة معلنة: متوسط الإضافة الشهرية للطاقة الاستيعابية خلال الأشهر التي سُجّلت فيها
# إضافة فعلية (استبعاد أغسطس 2026 لأنه شهر جارٍ بقيمة صفر)، ثم إسقاط خطي 24 شهراً.
active = [m for m in licMonthly if not m["isBaseline"] and m["newCap"] > 0]
avg_cap = sum(m["newCap"] for m in active) / len(active)
avg_op = sum(m["newOp"] for m in active) / len(active)
last = licMonthly[-1]
AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
             "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]
projection = []
d0 = datetime.date.fromisoformat(last["date"])
y, mo = d0.year, d0.month
cap, op = last["cumCap"], last["cumOp"]
for k in range(1, 25):
    mo += 1
    if mo == 13:
        mo = 1; y += 1
    cap += avg_cap
    op += avg_op
    projection.append({
        "date": f"{y}-{mo:02d}-01",
        "label": f"{AR_MONTHS[mo-1]} {y}",
        "capacity": int(round(cap)),
        "operational": int(round(op)),
        "coverage": round(cap / totals["demand"], 6),
        "gap": int(round(totals["demand"] - cap)),
    })

kpi_beds = next(k for k in kpis if k["id"] == "kpi_005")
remaining = kpi_beds["target"] - kpi_beds["current"]
months_to_target = remaining / avg_cap if avg_cap else None
foresight = {
    "rule": "متوسط الإضافة الشهرية للطاقة الاستيعابية في الأشهر ذات الإضافة الفعلية (سبتمبر 2025 – يوليو 2026)، مُسقَط خطياً.",
    "avgMonthlyCapacity": int(round(avg_cap)),
    "avgMonthlyOperational": round(avg_op, 1),
    "activeMonths": len(active),
    "bedsTarget": int(kpi_beds["target"]),
    "bedsRemaining": int(round(remaining)),
    "monthsToTarget": round(months_to_target, 1) if months_to_target else None,
    "targetDate": None,
    "coverageIn24": projection[-1]["coverage"],
    "capacityIn24": projection[-1]["capacity"],
}
if months_to_target:
    yy, mm = d0.year, d0.month + int(round(months_to_target))
    yy += (mm - 1) // 12
    mm = (mm - 1) % 12 + 1
    foresight["targetDate"] = f"{AR_MONTHS[mm-1]} {yy}"

# ---------------------------------------------------------------- سجل الفجوات
# كل رسم/مقياس كان في النسخة السابقة ولا يوجد له مصدر فعلي في المصنّف.
gaps = [
    {"key": "occupancy", "scene": "s1_supply", "section": "العرض والطلب",
     "title": "معدل الإشغال الفعلي للأسرّة",
     "need": "عدد الأسرّة المشغولة فعلياً مقابل الطاقة المرخصة، شهرياً أو لكل منشأة."},
    {"key": "facilities", "scene": "s1_supply", "section": "العرض والطلب",
     "title": "سجل المنشآت المرخصة",
     "need": "سجل المنشآت (اسم، نوع، حي، إحداثيات، الطاقة، حالة الرخصة، آخر زيارة)."},
    {"key": "demandProfile", "scene": "s1_demand", "section": "العرض والطلب",
     "title": "الطلب حسب الجنسية والفئة العمرية وحجم المنشأة",
     "need": "تفصيل الطلب على هذه الأبعاد؛ المصنّف يوفر الياقات والمجموعات المهنية والقطاع فقط."},
    {"key": "econSector", "scene": "s1_demand", "section": "العرض والطلب",
     "title": "الطلب حسب النشاط الاقتصادي",
     "need": "توزيع العمالة على الأنشطة الاقتصادية؛ المتوفر حالياً تصنيف مهني لا اقتصادي."},
    {"key": "licDuration", "scene": "s2_flow", "section": "التراخيص",
     "title": "متوسط مدة إصدار الرخصة ومسار الطلبات",
     "need": "عدد الطلبات المستلمة والمغلقة ومتوسط أيام المعالجة شهرياً."},
    {"key": "fines", "scene": "s3_violations", "section": "الرقابة والامتثال",
     "title": "قيم الغرامات المحصّلة",
     "need": "مبالغ الغرامات لكل مخالفة أو لكل فئة مخالفة."},
    {"key": "closures", "scene": "s3_overview", "section": "الرقابة والامتثال",
     "title": "عدد الإغلاقات",
     "need": "المصنّف يعلن الحقل «غير متوفر» — مطلوب عدد الإغلاقات إجمالاً وحسب القطاع."},
    {"key": "inspectors", "scene": "s3_sectors", "section": "الرقابة والامتثال",
     "title": "أداء المراقبين فردياً",
     "need": "جولات ومخالفات ومسافات كل مراقب؛ المتوفر أعداد المراقبين حسب القطاع فقط."},
    {"key": "hotspots", "scene": "s3_sectors", "section": "الرقابة والامتثال",
     "title": "خريطة النقاط الساخنة",
     "need": "إحداثيات الأحياء (خط العرض والطول فارغان في ورقة 13) أو ملف حدود الأحياء."},
    {"key": "iniProgress", "scene": "s4_status", "section": "المبادرات",
     "title": "نسب الإنجاز والميزانيات والمعالم",
     "need": "نسبة إنجاز وميزانية ومعلم قادم لكل مبادرة؛ المتوفر الحالة والتواريخ فقط."},
    {"key": "kpiSeries", "scene": "s5_journey", "section": "مؤشرات الأداء",
     "title": "السلاسل الشهرية للمؤشرات",
     "need": "قيمة شهرية لكل مؤشر؛ المتوفر خط أساس وقيمة حالية ومستهدف فقط."},
    {"key": "scenarios", "scene": "s6_projection", "section": "التوقعات",
     "title": "سيناريوهات التوقع ونطاقات الثقة",
     "need": "نموذج تنبؤي معتمد بسيناريوهات ونطاقات ثقة؛ لا يوجد في المصنّف."},
]

# ---------------------------------------------------------------- تحقق
def eq(a, b, label, tol=1):
    assert abs(a - b) <= tol, f"عدم تطابق: {label} — {a} ≠ {b}"

eq(sum(s["demand"] for s in sectors), totals["demand"], "مجموع الطلب حسب القطاع")
eq(sum(a["demand"] for a in activities), totals["demand"], "مجموع الطلب حسب المجموعة المهنية")
eq(totals["blue"] + totals["white"], totals["demand"], "مجموع الياقات")
eq(totals["demand"] - totals["supply"], totals["gap"], "الفجوة")
eq(sum(s["capacity"] for s in sectors) + unassigned["capacity"], totals["supply"], "مجموع الطاقة حسب القطاع")
eq(sum(s["buildLic"] for s in sectors) + unassigned["buildLic"], totals["buildingLic"], "مجموع رخص البناء")
eq(sum(s["opLic"] for s in sectors) + unassigned["opLic"], totals["operationalLic"], "مجموع الرخص التشغيلية")
eq(sum(h["licenses"] for h in housingTypes), totals["operationalLic"], "مجموع الرخص حسب نوع السكن")
eq(sum(h["capacity"] for h in housingTypes), totals["supply"], "مجموع الطاقة حسب نوع السكن")
eq(sum(v["count"] for v in violTypes), totals["violations"], "مجموع المخالفات حسب النوع")
eq(sum(s["violations"] for s in sectors), totals["violations"], "مجموع المخالفات حسب القطاع")
eq(sum(s["visits"] for s in sectors), totals["visits"], "مجموع الزيارات حسب القطاع")
eq(sum(s["inspectors"] for s in sectors), totals["inspectors"], "مجموع المراقبين")
eq(sum(m["visits"] for m in inspMonthly), totals["visits"], "مجموع الزيارات الشهرية")
eq(sum(m["violations"] for m in inspMonthly), totals["violations"], "مجموع المخالفات الشهرية")
eq(licMonthly[-1]["cumCap"], totals["supply"], "الطاقة التراكمية الأخيرة")
eq(licMonthly[-1]["cumBuild"], totals["buildingLic"], "رخص البناء التراكمية الأخيرة")
eq(licMonthly[-1]["cumOp"], totals["operationalLic"], "الرخص التشغيلية التراكمية الأخيرة")
eq(len(initiatives), totals["initiatives"], "عدد المبادرات")

# ---------------------------------------------------------------- إخراج
data = {
    "meta": meta,
    "totals": totals,
    "sectors": sectors,
    "unassigned": unassigned,
    "activities": activities,
    "licDelta": licDelta,
    "licMonthly": licMonthly,
    "housingTypes": housingTypes,
    "violTypes": violTypes,
    "inspMonthly": inspMonthly,
    "neighborhoods": neighborhoods,
    "goals": goals,
    "initiatives": initiatives,
    "plan": plan,
    "kpis": kpis,
    "sources": sources,
    "projection": projection,
    "foresight": foresight,
    "gaps": gaps,
}

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

print(f"✓ data.json — {os.path.getsize(OUT)//1024} KB")
print(f"  الطلب {totals['demand']:,} · العرض {totals['supply']:,} · الفجوة {totals['gap']:,} "
      f"· التغطية {totals['coverage']*100:.2f}%")
print(f"  {len(sectors)} قطاعات · {len(initiatives)} مبادرة · {len(kpis)} مؤشراً · {len(gaps)} فجوة بيانات")
print("  ✓ اجتازت جميع اختبارات التطابق")
