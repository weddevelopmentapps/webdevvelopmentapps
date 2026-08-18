# -*- coding: utf-8 -*-
"""
يبني data.json من مصنّف البيانات الرئيسي الفعلي (master_data_V2.xlsx)
**بنفس مخطط البيانات الأصلي للوحة** حتى تبقى الرسوم والبطاقات والتخطيط كما هي.

مبدأ حاكم: لا يُخترع أي رقم. كل قيمة إما مقروءة حرفياً من المصنّف أو محسوبة منه
بقاعدة معلنة. وكل رسم لا يوجد له مصدر فعلي يُترك فارغاً ويُعلَّم في `avail`
ليعرضه التطبيق بحالة «لا تتوفر بيانات فعلية» بدل تعبئته بقيم تقديرية.

    python3 generate_data.py
"""
import datetime
import json
import os

import openpyxl

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "master_data_V2.xlsx")
OUT = os.path.join(HERE, "data.json")

wb = openpyxl.load_workbook(SRC, data_only=True)

AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
             "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]


# ---------------------------------------------------------------- أدوات قراءة
def rows(sheet, header_row=1):
    """صفوف الورقة كقواميس، مع تجاهل الفراغات وصف «الإجمالي (تحقق)» (يترك عمود المعرف فارغاً)."""
    ws = wb[sheet]
    data = list(ws.iter_rows(values_only=True))
    head = [str(c).strip() if c is not None else "" for c in data[header_row - 1]]
    out = []
    for r in data[header_row:]:
        if all(c is None or str(c).strip() == "" for c in r):
            continue
        d = {head[i]: r[i] for i in range(min(len(head), len(r)))}
        if d.get(head[0]) is None or str(d.get(head[0])).strip() == "":
            continue
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


# ---------------------------------------------------------------- 02 الرئيسية
main = {r["المعرف"]: r for r in rows("02_البيانات_الرئيسية")}
mv = lambda k: main[k]["القيمة"]

TODAY = iso(mv("meta_today"))
ASOF = str(mv("meta_asof"))

DEMAND = i(mv("main_demand"))
SUPPLY = i(mv("main_supply"))
GAP = i(mv("main_gap"))
COVERAGE = num(mv("main_coverage")) * 100
BUILD_LIC = i(mv("main_building"))
OPS_LIC = i(mv("main_operational"))
INSPECTORS = i(mv("main_inspectors"))
VIOLATIONS = i(mv("main_violations"))
VISITS = i(mv("main_visits"))
COMPLIANCE = num(mv("main_compliance")) * 100

sd = {r["metric_id"]: r for r in rows("03_العرض_والطلب")}
BLUE = i(sd["sd_collar_blue"]["القيمة"])
WHITE = i(sd["sd_collar_white"]["القيمة"])
MULTIPLE = num(sd["sd_multiple"]["القيمة"])

# ---------------------------------------------------------------- القطاعات
# نحتفظ بمضلعات الخريطة التخطيطية الأصلية ونربطها بأسماء القطاعات كما وردت في المصدر.
GEO_POLY = {
    "sector_north":  {"poly": [[13, 36], [17, 18], [27, 10], [40, 10], [47, 17], [49, 28], [45, 38], [38, 46], [27, 47], [18, 44]], "label": [31, 28]},
    "sector_east":   {"poly": [[52, 26], [54, 12], [63, 5], [78, 4], [91, 9], [96, 22], [92, 36], [82, 45], [68, 48], [57, 44], [51, 36]], "label": [74, 24]},
    "sector_center": {"poly": [[41, 49], [50, 45], [57, 50], [58, 60], [51, 66], [42, 62], [39, 55]], "label": [49, 55]},
    "sector_west":   {"poly": [[6, 60], [13, 52], [24, 49], [36, 52], [38, 62], [34, 73], [24, 77], [12, 73], [5, 67]], "label": [21, 63]},
    "sector_south":  {"poly": [[44, 67], [52, 64], [57, 55], [68, 50], [80, 54], [86, 66], [81, 82], [68, 93], [53, 94], [43, 84], [40, 74]], "label": [64, 73]},
}

sec_lic = {r["sector_id"]: r for r in rows("08_التراخيص_حسب_القطاع")}
sec_ctl = {r["sector_id"]: r for r in rows("11_الرقابة_حسب_القطاع")}

sectors, geo, cap_sector, lic_sector, insp_sector, demand_sector = [], {}, [], [], [], []
for r in rows("04_العرض_والطلب_حسب_القطاع"):
    sid, name = r["sector_id"], r["القطاع"]
    lic, ctl = sec_lic.get(sid, {}), sec_ctl.get(sid, {})
    sectors.append(name)
    geo[name] = GEO_POLY[sid]
    demand_sector.append({"name": name, "total": i(r["الطلب"]), "blue": None, "white": None})
    cap_sector.append({
        "name": name,
        "beds": i(lic.get("الطاقة_الاستيعابية"), 0),
        "demand": i(r["الطلب"]),
        "gap": i(r["الفجوة"]),
        "cov": num(r["نسبة_التغطية"]) * 100,
        "opLic": i(lic.get("الرخص_التشغيلية"), 0),
        "buildLic": i(lic.get("رخص_البناء"), 0),
    })
    lic_sector.append({
        "name": name,
        "constr": i(lic.get("رخص_البناء"), 0),
        "ops": i(lic.get("الرخص_التشغيلية"), 0),
        "total": i(lic.get("إجمالي_الرخص"), 0),
        "beds": i(lic.get("الطاقة_الاستيعابية"), 0),
    })
    insp_sector.append({
        "name": name,
        "inspectors": i(ctl.get("عدد_المراقبين"), 0),
        "visits": i(ctl.get("عدد_الزيارات"), 0),
        "violations": i(ctl.get("عدد_المخالفات"), 0),
        "closures": i(ctl.get("عدد_الإغلاقات"), None),
    })

un = sec_lic.get("sector_unassigned", {})
unassigned = {
    "name": un.get("القطاع", "غير مصنف قطاعياً"),
    "constr": i(un.get("رخص_البناء"), 0),
    "ops": i(un.get("الرخص_التشغيلية"), 0),
    "beds": i(un.get("الطاقة_الاستيعابية"), 0),
    "note": "صف مدرج في المصدر بلا اسم قطاع — يحتاج قراراً: توزيعه على القطاعات أو اعتماده بنداً مستقلاً.",
}

# ---------------------------------------------------------------- الطلب
# ورقة 05 مجموعات مهنية؛ المصدر لا يوفر تصنيف الياقة لكل مجموعة، لذا collar=None
occupation = [{"name": r["النشاط"], "collar": None, "count": i(r["الطلب"]), "rank": i(r["الترتيب"])}
              for r in rows("05_الطلب_حسب_النشاط")]
occupation.sort(key=lambda x: x["rank"])

# ---------------------------------------------------------------- التراخيص
lic_metrics = {r["metric_id"]: r for r in rows("06_التراخيص")}
lic_delta = {}
for key, mid in (("constr", "lic_building"), ("ops", "lic_operational"), ("beds", "lic_capacity")):
    r = lic_metrics[mid]
    lic_delta[key] = {
        "label": r["المؤشر"], "current": i(r["القيمة_الحالية"]), "baseline": i(r["قيمة_خط_الأساس"]),
        "change": i(r["التغير"]), "pct": num(r["نسبة_التغير"]) * 100,
        "unit": r["الوحدة"], "baseDate": iso(r["تاريخ_خط_الأساس"]),
        "owner": r.get("الجهة_المصدرة_للبيانات"), "srcStatus": r.get("حالة_المصدر"),
    }

# سلسلة شهرية على مستوى المدينة — المصدر لا يفصّلها قطاعياً ولا حسب نوع السكن
licenses, lic_baseline = [], None
for r in rows("07_التراخيص_الشهرية"):
    d = iso(r["التاريخ"])
    row = {
        "month": d[:7] if d else None, "month_ar": r["الشهر"],
        "sector": None, "type": None,
        "constr": i(r["رخص_البناء_الجديدة"], 0),
        "ops": i(r["الرخص_التشغيلية_الجديدة"], 0),
        "beds_added": i(r["الطاقة_الاستيعابية_المضافة"], 0),
        "cum_constr": i(r["رخص_البناء_التراكمية"]),
        "cum_ops": i(r["الرخص_التشغيلية_التراكمية"]),
        "cum_beds": i(r["الطاقة_الاستيعابية_التراكمية"]),
        # غير متوفرة في المصدر — تبقى صفراً ويمنع avail عرض أي رسم يعتمد عليها
        "req_in": 0, "req_closed": 0, "days_constr": 0, "days_ops": 0,
    }
    if r["month_id"] == "m_base":
        lic_baseline = row
    else:
        licenses.append(row)

lic_type = [{"name": r["نوع_السكن"], "ops": i(r["عدد_الرخص"]), "beds": i(r["الطاقة_الاستيعابية"]),
             "rank": i(r["الترتيب"])} for r in rows("09_أنواع_المساكن")]
lic_type.sort(key=lambda x: x["rank"])
for t in lic_type:
    t["avg"] = round(t["beds"] / t["ops"], 1) if t["ops"] else None

# ---------------------------------------------------------------- الرقابة
inspections = []
for r in rows("18_الرقابة_الشهرية"):
    d = iso(r["التاريخ"])
    inspections.append({
        "month": d[:7] if d else None, "month_ar": r["الشهر"], "sector": None,
        "visits": i(r["الزيارات_الرقابية"]), "violations": i(r["المخالفات"]),
        "fines": 0, "closures": 0,  # غير متوفرة في المصدر
    })

viol_cats = [{"name": r["نوع_المخالفة"], "count": i(r["عدد_المخالفات"]), "rank": i(r["الترتيب"]),
              "fines": None, "sme": None, "by_sector": None}
             for r in rows("12_المخالفات_حسب_النوع")]
viol_cats.sort(key=lambda x: x["rank"])

neighborhoods = [{
    "name": r["الحي"], "sector": r.get("القطاع"),
    "constr": i(r["رخص_البناء"], 0), "ops": i(r["الرخص_التشغيلية"], 0),
    "beds": i(r["الطاقة_الاستيعابية"], 0), "violations": i(r["عدد_المخالفات"], 0),
    "visits": i(r["عدد_الزيارات"], None), "quality": r.get("جودة_البيانات"),
} for r in rows("13_الأحياء")]

# ---------------------------------------------------------------- المبادرات
goals, sec = [], None
for r in wb["17_تعريفات_ومراجع"].iter_rows(values_only=True):
    c = [("" if x is None else str(x).strip()) for x in r]
    if c[1] == "الأهداف":
        sec = "g"; continue
    if c[1] in ("القطاعات", "حالات المبادرات", "أنواع المساكن", "اتجاه المؤشر"):
        sec = None; continue
    if sec == "g" and c[1].startswith("g") and c[1] != "goal_id":
        goals.append({"id": c[1], "name": c[2], "desc": c[3]})

GOAL_DESC = {g["id"]: g["desc"] for g in goals}
TODAY_D = datetime.date.fromisoformat(TODAY)

initiatives = []
for r in rows("14_المبادرات"):
    end = iso(r["تاريخ_الانتهاء"])
    st = r["الحالة_المعروضة_حالياً"]
    initiatives.append({
        "id": r["initiative_id"], "num": str(r["رقم_المبادرة"]), "name": r["اسم_المبادرة"],
        "pillar": r["الهدف"], "goalDesc": GOAL_DESC.get(r["goal_id"], ""),
        "status": st, "statusInFile": r.get("الحالة_في_الملف"),
        "start": iso(r["تاريخ_البدء"]), "end": end,
        # غير متوفرة في المصدر
        "owner": None, "completion": None, "budget": None, "milestone": None,
        "risk": None, "impact": None,
        "overdue": (TODAY_D - datetime.date.fromisoformat(end)).days
        if end and st == "متأخرة" else None,
    })

# ---------------------------------------------------------------- المؤشرات
kpis = []
for r in rows("16_مؤشرات_الأداء"):
    base, cur, tgt = num(r["خط_الأساس"]), num(r["القيمة_الحالية"]), num(r["المستهدف"])
    pct = r["الوحدة"] == "نسبة"
    span = (tgt - base) if tgt is not None and base is not None else None
    kpis.append({
        "id": r["kpi_id"], "name": r["اسم_المؤشر"],
        "pillar": r["الهدف"], "goalId": r["goal_id"],
        # اللوحة الأصلية تفصل «استراتيجي/تشغيلي»؛ المصدر يصنّف حسب الهدف،
        # فمؤشرات الأهداف الثلاثة الأولى استراتيجية ومؤشرات «الممكّن» تشغيلية.
        "level": "تشغيلي" if r["goal_id"] == "g4" else "استراتيجي",
        "unit": "٪" if pct else r["الوحدة"],
        "baseline": round(base * 100, 1) if pct else base,
        "actual": round(cur * 100, 1) if pct else cur,
        "target": round(tgt * 100, 1) if pct else tgt,
        "dir": "أعلى أفضل" if r["اتجاه_الأداء"] == "الأعلى_أفضل" else "أقل أفضل",
        "quality": r["جودة_البيانات"], "source": r.get("المصدر"),
        "srcStatus": r.get("حالة_المصدر"),
        "progress": round((cur - base) / span * 100, 1) if span else None,
        "series": None,  # لا توجد سلسلة شهرية في المصدر
    })

sources = [{"item": r["البند"], "section": r["القسم_في_اللوحة"], "sheet": r["الورقة/العمود"],
            "owner": r["الجهة_المصدرة_للبيانات"], "source": r.get("المصدر"),
            "status": r["حالة_المصدر"], "notes": r.get("ملاحظات_المصدر")}
           for r in rows("19_مصادر_البيانات")]

# ---------------------------------------------------------------- إسقاط محتسب
# قاعدة معلنة: متوسط الإضافة الشهرية للطاقة في الأشهر ذات الإضافة الفعلية، مُسقَط خطياً.
active = [m for m in licenses if m["beds_added"] > 0]
avg_beds = sum(m["beds_added"] for m in active) / len(active)
avg_ops = sum(m["ops"] for m in active) / len(active)
last = licenses[-1]
d0 = datetime.date.fromisoformat(last["month"] + "-01")

projection = []
y, mo, cap, ops_c = d0.year, d0.month, last["cum_beds"], last["cum_ops"]
for _ in range(12):
    mo += 1
    if mo == 13:
        mo, y = 1, y + 1
    cap += avg_beds
    ops_c += avg_ops
    projection.append({
        "month": f"{y}-{mo:02d}", "month_ar": f"{AR_MONTHS[mo-1]} {y}",
        "supply": int(round(cap)), "ops": int(round(ops_c)),
        # المصدر لا يتضمن سلسلة زمنية للطلب — يبقى عند القيمة المسجلة
        "demand": DEMAND,
        "gap": int(round(DEMAND - cap)),
        "cov": round(cap / DEMAND * 100, 3),
    })

kpi_beds = next(k for k in kpis if k["id"] == "kpi_005")
remaining = kpi_beds["target"] - kpi_beds["actual"]
months_to = remaining / avg_beds if avg_beds else None
target_date = None
if months_to:
    mm = d0.month + int(round(months_to))
    yy = d0.year + (mm - 1) // 12
    mm = (mm - 1) % 12 + 1
    target_date = f"{AR_MONTHS[mm-1]} {yy}"

foresight = {
    "rule": "متوسط الإضافة الشهرية للطاقة الاستيعابية في الأشهر ذات الإضافة الفعلية "
            "(سبتمبر 2025 – يوليو 2026)، مُسقَط خطياً على 12 شهراً.",
    "avgBeds": int(round(avg_beds)), "avgOps": round(avg_ops, 1), "activeMonths": len(active),
    "bedsTarget": int(kpi_beds["target"]), "bedsRemaining": int(round(remaining)),
    "monthsToTarget": round(months_to, 1) if months_to else None, "targetDate": target_date,
    "supplyIn12": projection[-1]["supply"], "covIn12": projection[-1]["cov"],
    "gapIn12": projection[-1]["gap"],
}

# ---------------------------------------------------------------- حقائق مشتقة
top_viol_sector = max(insp_sector, key=lambda s: s["violations"] / s["visits"])
top_cap_sector = max(cap_sector, key=lambda s: s["beds"])
worst_cov_sector = min(cap_sector, key=lambda s: s["cov"])
top_nb = max(neighborhoods, key=lambda n: n["violations"])
late_inis = [x for x in initiatives if x["status"] == "متأخرة"]
kpi_prog = [k["progress"] for k in kpis if k["progress"] is not None]

facts = {
    "bedsYoY": lic_delta["beds"]["pct"], "opsYoY": lic_delta["ops"]["pct"],
    "constrYoY": lic_delta["constr"]["pct"], "multiple": MULTIPLE,
    "worstCovSector": worst_cov_sector["name"], "worstCov": worst_cov_sector["cov"],
    "topCapSector": top_cap_sector["name"], "topCapBeds": top_cap_sector["beds"],
    "topViolSector": top_viol_sector["name"],
    "topViolRate": top_viol_sector["violations"] / top_viol_sector["visits"] * 100,
    "topCat": viol_cats[0]["name"], "topCatCount": viol_cats[0]["count"],
    "topNb": top_nb["name"], "topNbViol": top_nb["violations"],
    "lateCount": len(late_inis), "doneCount": sum(1 for x in initiatives if x["status"] == "منجزة"),
    "runCount": sum(1 for x in initiatives if x["status"] == "جاري العمل"),
    "maxOverdue": max((x["overdue"] for x in late_inis), default=0),
    "kpiBelowHalf": sum(1 for p in kpi_prog if p < 50),
    "kpiAvgProgress": round(sum(kpi_prog) / len(kpi_prog), 1),
    "kpiMet": sum(1 for k in kpis if k["actual"] >= k["target"]),
    "unknownOwners": sum(1 for s in sources if s["owner"] and "غير محدد" in s["owner"]),
    "sourceCount": len(sources),
}

# ---------------------------------------------------------------- توفر البيانات
# False = لا مصدر فعلي في المصنّف → يعرضه التطبيق بحالة «لا تتوفر بيانات فعلية»
avail = {
    "facilities": False, "occupancy": False, "collarByGroup": False,
    "econ": False, "sme": False, "nat": False, "age": False, "collarBySector": False,
    "licRequests": False, "licDays": False, "licMonthlyBySector": False, "licMonthlyByType": False,
    "fines": False, "closures": False, "inspectors": False, "hotspots": False,
    "violBySector": False, "violBySme": False, "inspMonthlyBySector": False,
    "iniProgress": False, "iniOwner": False, "iniRisk": False,
    "kpiSeries": False, "forecastScenarios": False, "predictions": False,
    # متوفر فعلياً في المصنّف
    "demandTotals": True, "demandBySector": True, "occupations": True, "collarTotals": True,
    "capacityBySector": True, "capacityByType": True, "licBaseline": True,
    "licMonthly": True, "licBySector": True, "inspMonthly": True, "inspBySector": True,
    "violCats": True, "neighborhoods": True, "initiatives": True, "kpis": True,
    "sources": True, "projection": True,
}

gaps = [
    {"key": "occupancy", "tab": "t1", "title": "معدل الإشغال الفعلي",
     "need": "عدد الأسرّة المشغولة فعلياً مقابل الطاقة المرخصة."},
    {"key": "facilities", "tab": "t1", "title": "سجل المنشآت المرخصة",
     "need": "سجل المنشآت: اسم، نوع، حي، إحداثيات، طاقة، حالة الرخصة، آخر زيارة."},
    {"key": "econ", "tab": "t1", "title": "الطلب حسب القطاع الاقتصادي",
     "need": "توزيع العمالة على الأنشطة الاقتصادية؛ المتوفر تصنيف مهني لا اقتصادي."},
    {"key": "sme", "tab": "t1", "title": "الطلب حسب حجم المنشأة",
     "need": "توزيع العمالة على فئات حجم المنشأة."},
    {"key": "age", "tab": "t1", "title": "الطلب حسب الفئة العمرية",
     "need": "التوزيع العمري للعمالة."},
    {"key": "nat", "tab": "t1", "title": "الطلب حسب الجنسية",
     "need": "عدد العمالة حسب الجنسية."},
    {"key": "licRequests", "tab": "t2", "title": "مسار طلبات الترخيص",
     "need": "عدد الطلبات المستلمة والمغلقة شهرياً."},
    {"key": "licDays", "tab": "t2", "title": "متوسط مدة الإصدار",
     "need": "متوسط أيام معالجة رخصة البناء ورخصة التشغيل شهرياً."},
    {"key": "fines", "tab": "t3", "title": "الغرامات المحصلة",
     "need": "مبالغ الغرامات لكل مخالفة أو لكل فئة مخالفة."},
    {"key": "closures", "tab": "t3", "title": "المنشآت المغلقة",
     "need": "المصدر يعلن الحقل «غير متوفر» — مطلوب عدد الإغلاقات إجمالاً وحسب القطاع."},
    {"key": "inspectors", "tab": "t3", "title": "أداء المفتشين فردياً",
     "need": "جولات ومخالفات ومسافات كل مفتش؛ المتوفر أعدادهم حسب القطاع فقط."},
    {"key": "hotspots", "tab": "t3", "title": "خريطة النقاط الساخنة",
     "need": "إحداثيات الأحياء (خط العرض والطول فارغان في ورقة 13) أو ملف حدود الأحياء."},
    {"key": "violBySme", "tab": "t3", "title": "المخالفات حسب حجم المنشأة",
     "need": "تفصيل كل فئة مخالفة على أحجام المنشآت."},
    {"key": "iniProgress", "tab": "t4", "title": "نسب إنجاز المبادرات وميزانياتها",
     "need": "نسبة إنجاز وميزانية وجهة مسؤولة ومعلم قادم لكل مبادرة."},
    {"key": "kpiSeries", "tab": "t5", "title": "السلاسل الشهرية للمؤشرات",
     "need": "قيمة شهرية لكل مؤشر؛ المتوفر خط أساس وقيمة حالية ومستهدف فقط."},
    {"key": "forecastScenarios", "tab": "t6", "title": "سيناريوهات التوقع ونطاقات الثقة",
     "need": "نموذج تنبؤي معتمد بسيناريوهات ونطاقات ثقة."},
]

# ---------------------------------------------------------------- تحقق
CHECKS = 0


def eq(a, b, label, tol=1):
    global CHECKS
    assert abs(a - b) <= tol, f"عدم تطابق: {label} — {a} ≠ {b}"
    CHECKS += 1


eq(sum(s["total"] for s in demand_sector), DEMAND, "الطلب حسب القطاع")
eq(sum(o["count"] for o in occupation), DEMAND, "الطلب حسب المجموعة المهنية")
eq(BLUE + WHITE, DEMAND, "الياقات")
eq(DEMAND - SUPPLY, GAP, "الفجوة")
eq(sum(s["beds"] for s in cap_sector) + unassigned["beds"], SUPPLY, "الطاقة حسب القطاع")
eq(sum(s["constr"] for s in lic_sector) + unassigned["constr"], BUILD_LIC, "رخص البناء")
eq(sum(s["ops"] for s in lic_sector) + unassigned["ops"], OPS_LIC, "الرخص التشغيلية")
eq(sum(t["ops"] for t in lic_type), OPS_LIC, "الرخص حسب نوع السكن")
eq(sum(t["beds"] for t in lic_type), SUPPLY, "الطاقة حسب نوع السكن")
eq(sum(c["count"] for c in viol_cats), VIOLATIONS, "المخالفات حسب النوع")
eq(sum(s["violations"] for s in insp_sector), VIOLATIONS, "المخالفات حسب القطاع")
eq(sum(s["visits"] for s in insp_sector), VISITS, "الزيارات حسب القطاع")
eq(sum(s["inspectors"] for s in insp_sector), INSPECTORS, "المراقبون")
eq(sum(m["visits"] for m in inspections), VISITS, "الزيارات الشهرية")
eq(sum(m["violations"] for m in inspections), VIOLATIONS, "المخالفات الشهرية")
eq(licenses[-1]["cum_beds"], SUPPLY, "الطاقة التراكمية")
eq(licenses[-1]["cum_ops"], OPS_LIC, "الرخص التشغيلية التراكمية")
eq(licenses[-1]["cum_constr"], BUILD_LIC, "رخص البناء التراكمية")
eq((1 - VIOLATIONS / VISITS) * 100, COMPLIANCE, "الامتثال المحسوب مقابل المعلن", tol=0.1)

# ---------------------------------------------------------------- إخراج
data = {
    "meta": {
        "title": "لوحة معلومات السكن الجماعي للأفراد بمدينة الرياض",
        "entity": "أمانة منطقة الرياض — وكالة التنمية الحضرية",
        "updated": f"{ASOF} — مصنّف البيانات الرئيسي V2",
        "asOf": ASOF, "today": TODAY,
        "source": "مصنّف البيانات الرئيسي V2 — 2026-08-18",
        "totals": {
            "demand": DEMAND, "beds": SUPPLY, "gap": GAP, "coverage": round(COVERAGE, 2),
            "blue": BLUE, "white": WHITE, "multiple": MULTIPLE,
            "buildLic": BUILD_LIC, "opsLic": OPS_LIC,
            "inspectors": INSPECTORS, "visits": VISITS, "violations": VIOLATIONS,
            "compliance": round(COMPLIANCE, 1),
            "occupied": None, "occupancy": None, "facilities": None,
        },
    },
    "sectors": sectors,
    "geo": geo,
    "unassigned": unassigned,
    "demand": {"occupation": occupation, "sector": demand_sector,
               "econ": [], "sme": [], "nat": [], "age": []},
    "facilities": [],
    "capSector": cap_sector,
    "licenses": licenses,
    "licBaseline": lic_baseline,
    "licDelta": lic_delta,
    "licSector": lic_sector,
    "licType": lic_type,
    "inspections": inspections,
    "inspSector": insp_sector,
    "violCats": viol_cats,
    "inspectors": [],
    "hotspots": [],
    "neighborhoods": neighborhoods,
    "initiatives": initiatives,
    "pillars": [g["name"] for g in goals],
    "goals": goals,
    "kpis": kpis,
    "kpiMonths": [],
    "forecast": {},
    "projection": projection,
    "foresight": foresight,
    "predictions": [],
    "sources": sources,
    "facts": facts,
    "avail": avail,
    "gaps": gaps,
}

with open(OUT, "w", encoding="utf-8") as f:
    json.dump(data, f, ensure_ascii=False, separators=(",", ":"))

print(f"✓ data.json — {os.path.getsize(OUT)//1024} KB")
print(f"  الطلب {DEMAND:,} · الطاقة {SUPPLY:,} · الفجوة {GAP:,} · التغطية {COVERAGE:.2f}%")
print(f"  {len(sectors)} قطاعات · {len(licenses)} شهراً · {len(initiatives)} مبادرة · "
      f"{len(kpis)} مؤشراً · {len(neighborhoods)} حياً")
print(f"  {len(gaps)} فجوة بيانات معلنة · اجتازت {CHECKS} اختبار تطابق")
