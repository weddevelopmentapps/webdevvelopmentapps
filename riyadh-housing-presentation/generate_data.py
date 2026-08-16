#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
generate_data.py — المصدر الوحيد للحقيقة لإصدار العرض
=====================================================

يبني هذا الملف «الإصدار المنشور» (release snapshot) الذي تقرأه تجربة المقدِّم حصراً.

المبادئ الحاكمة:
  1. كل قيمة خام تُدرج هنا مرة واحدة مع أصلها (الورقة + المرساة) — لا قيمة يدوية في الواجهة.
  2. كل قيمة مشتقة تُحسب بصيغة موثقة ذات إصدار، وتُختبر بالتساوي مع إعادة حساب المتصفح.
  3. كل بوابات المطابقة في القسم 20 من التكليف تأكيدات صلبة تُفشل البناء عند أي خلل.
  4. لا تلفيق: وحدات «الاستراتيجية» و«الخطوات القادمة» تصدر بحالة `pending_source`
     لأن مصدرها المعتمد (خطة عمل المشروع V.1.0.0) غير متوفر — انظر DATA_RECONCILIATION.md §3.
  5. التقريب مركزي (نصف لأعلى)، والترتيب دائماً على القيم غير المقرّبة.

التشغيل:  python3 generate_data.py          → data/release.json + data/workbook_manifest.json
          python3 generate_data.py --check  → تحقق فقط دون كتابة
إن وُجد الملف private-sources/platform-data.xlsx تُعاد قراءته وتُطابَق قيمه حرفياً مع
الثوابت أدناه (حارس انحراف المصدر). غيابه لا يفشل البناء — الثوابت هي المرساة V1 الموثقة.
"""

import argparse
import datetime as _dt
import hashlib
import json
import os
import sys
import unicodedata
from decimal import Decimal, ROUND_HALF_UP

HERE = os.path.dirname(os.path.abspath(__file__))
SCHEMA_VERSION = "1.0.0"
TEMPLATE_VERSION = "V1"          # إصدار قالب platform-data.xlsx المدعوم
FORMULA_VERSION = "fv1"          # إصدار حزمة الصيغ المشتقة

# ═══════════════════════════════════════════════════════════════════════════════
# 0) أدوات مركزية: تقريب، تنسيق، فحص
# ═══════════════════════════════════════════════════════════════════════════════

def round_half_up(value, places=1):
    """تقريب نصف-لأعلى حتمي (لا banker's rounding)."""
    q = Decimal(10) ** -places
    return float(Decimal(str(value)).quantize(q, rounding=ROUND_HALF_UP))


def pct(numerator, denominator, places=1):
    """نسبة مئوية آمنة: ترفض القسمة على صفر بدل إنتاج قيمة زائفة."""
    if denominator == 0:
        raise ValueError("قسمة على صفر مرفوضة في حساب نسبة")
    return round_half_up(numerator / denominator * 100.0, places)


_CHECKS = []           # سجل نتائج الفحوص للتقرير
_FAILED = []


def gate(name, condition, detail=""):
    """بوابة مطابقة: تُسجَّل وتُفشل البناء عند الإخفاق."""
    _CHECKS.append({"gate": name, "ok": bool(condition), "detail": detail})
    if not condition:
        _FAILED.append(f"{name} — {detail}")


def nfc(s):
    return unicodedata.normalize("NFC", s)


# ═══════════════════════════════════════════════════════════════════════════════
# 1) الثوابت الخام — مرساة V1 من platform-data.xlsx (كل قيمة مع ورقتها وخليتها)
#    المرجع الحرفي: DATA_RECONCILIATION.md §2 — لا تعدل قيمة دون قرار مطابقة موثق.
# ═══════════════════════════════════════════════════════════════════════════════

WORKBOOK_FILE = "platform-data.xlsx"

# ورقة «الطلب»
TOTAL_DEMAND = 1_420_000                     # الطلب!C4
SECTOR_DEMAND = {                            # الطلب!B7:C11
    "north": 258_000,
    "east": 331_000,
    "center": 246_000,
    "west": 217_000,
    "south": 368_000,
}

# ورقة «التراخيص»
BASELINE = {"building": 64, "operational": 118, "beds": 563_900}   # التراخيص!C5:E5
MONTHLY_LICENSING = [                        # التراخيص!B8:E19 — صافي الإضافات الشهرية
    # (iso, label, building, operational, beds)
    ("2025-09", "سبتمبر 2025", 3, 1, 3_200),
    ("2025-10", "أكتوبر 2025", 2, 2, 3_600),
    ("2025-11", "نوفمبر 2025", 3, 2, 4_100),
    ("2025-12", "ديسمبر 2025", 3, 2, 3_900),
    ("2026-01", "يناير 2026", 2, 1, 4_200),
    ("2026-02", "فبراير 2026", 3, 2, 4_400),
    ("2026-03", "مارس 2026", 3, 2, 4_100),
    ("2026-04", "أبريل 2026", 3, 2, 4_300),
    ("2026-05", "مايو 2026", 2, 2, 4_200),
    ("2026-06", "يونيو 2026", 3, 2, 4_200),
    ("2026-07", "يوليو 2026", 3, 2, 4_100),
    ("2026-08", "أغسطس 2026", 2, 2, 4_200),
]
CURRENT_LICENSING = {"building": 96, "operational": 140, "beds": 612_400}  # التراخيص!C20:E20
SECTOR_LICENSING = {                         # التراخيص!B23:E27
    # sector: (building, operational, beds)
    "north": (22, 30, 128_000),
    "east": (26, 34, 172_400),
    "center": (12, 26, 96_000),
    "west": (16, 22, 88_000),
    "south": (20, 28, 128_000),
}
COVERAGE_TARGET_INDICATIVE = 60              # التراخيص!C31 — هدف استرشادي غير معتمد

# ورقة «الرقابة»
SECTOR_MONITORING = {                        # الرقابة!B5:F9
    # sector: (monitors, violations, visits, closures)
    "north": (4, 439, 3_538, 15),
    "east": (4, 907, 4_716, 27),
    "center": (4, 548, 3_341, 19),
    "west": (3, 356, 2_553, 12),
    "south": (3, 1_367, 5_503, 40),
}
MONITORING_TOTALS = {"monitors": 18, "violations": 3_617, "visits": 19_651, "closures": 113}  # الرقابة!B10
COMPLIANCE_RATE_SUPPLIED = 81.6              # الرقابة!C12 — منهجيتها غير معتمدة (R8)
VIOLATION_TYPES = [                          # الرقابة!B15:C20
    ("overcrowding", "الاكتظاظ وتجاوز الطاقة الاستيعابية", 1_121),
    ("fire-safety", "اشتراطات السلامة والحماية من الحريق", 868),
    ("hygiene", "النظافة والصحة العامة", 615),
    ("unlicensed", "مزاولة النشاط دون ترخيص", 434),      # الصياغة الرسمية: «دون» — ARABIC_COPY_REVIEW #4
    ("electrical", "مخالفات الكهرباء والسباكة", 326),
    ("ventilation", "التهوية والعزل غير المطابق", 253),
]

# ورقة «الأحياء» — عينة مرتبطة بالخريطة، ليست حصراً شاملاً (R10)
NEIGHBOURHOODS = [                           # الأحياء!B5:G24
    # (name, sector, building, operational, beds, violations)
    ("حي الملقا", "north", 6, 5, 21_500, 84),
    ("حي الصحافة", "north", 5, 4, 16_800, 61),
    ("حي حطين", "north", 4, 4, 15_200, 57),
    ("حي الياسمين", "north", 3, 3, 11_900, 48),
    ("حي النسيم الشرقي", "east", 7, 8, 34_600, 216),
    ("حي السلي", "east", 6, 6, 30_200, 246),
    ("حي النظيم", "east", 5, 5, 24_800, 168),
    ("حي النسيم الغربي", "east", 4, 6, 27_400, 152),
    ("حي منفوحة", "center", 4, 7, 23_200, 187),
    ("حي غبيرة", "center", 3, 5, 19_400, 149),
    ("حي الجرادية", "center", 2, 4, 15_300, 102),
    ("حي الديرة", "center", 2, 3, 11_600, 76),
    ("حي السويدي الغربي", "west", 5, 5, 18_900, 121),
    ("حي ظهرة لبن", "west", 4, 4, 15_600, 96),
    ("حي العريجاء الغربي", "west", 3, 4, 14_800, 78),
    ("حي طويق", "west", 3, 3, 11_200, 44),
    ("حي المنصورية", "south", 5, 7, 26_400, 358),
    ("حي العزيزية", "south", 5, 6, 24_100, 292),
    ("حي الشفا", "south", 4, 5, 21_800, 247),
    ("حي بدر", "south", 4, 4, 17_600, 214),
]

# ورقة «السياق»
OCCUPIED_BEDS = 561_571                      # السياق!C4
DATA_AS_OF_LABEL = "أغسطس 2026"              # السياق!C5
CALCULATION_DATE = "2026-08-11"              # السياق!C6
FACILITY_TYPES = [                           # السياق!B9:C11
    ("compound", "مجمع سكني", 38),
    ("building", "مبنى سكني", 68),
    ("cabins", "كبائن متنقلة", 34),
]
COLLAR = {"blue": 1_164_400, "white": 255_600}   # السياق!C15:C16
ECONOMIC_ACTIVITIES = [                      # السياق!B20:C25
    ("construction", "التشييد والبناء", 505_000),
    ("retail", "التجارة والتجزئة", 217_000),
    ("industry", "الصناعة", 198_000),
    ("public-services", "الخدمات العامة", 165_000),
    ("hospitality", "الضيافة والإعاشة", 152_000),
    ("other", "قطاعات أخرى", 183_000),
]
MONTHLY_MONITORING = [                       # السياق!B30:D41
    ("2025-09", "سبتمبر 2025", 1_548, 292),
    ("2025-10", "أكتوبر 2025", 1_504, 288),
    ("2025-11", "نوفمبر 2025", 1_601, 293),
    ("2025-12", "ديسمبر 2025", 1_580, 279),
    ("2026-01", "يناير 2026", 1_609, 292),
    ("2026-02", "فبراير 2026", 1_654, 304),
    ("2026-03", "مارس 2026", 1_736, 316),
    ("2026-04", "أبريل 2026", 1_755, 309),
    ("2026-05", "مايو 2026", 1_800, 310),
    ("2026-06", "يونيو 2026", 1_747, 300),
    ("2026-07", "يوليو 2026", 1_558, 317),
    ("2026-08", "أغسطس 2026", 1_559, 317),
]
DEFICIT_SCENARIOS = [                        # السياق!B46:E55 — سيناريوهات مورّدة، نموذج غير معتمد
    ("2026-09", "سبتمبر 2026", 830_540, 821_088, 810_736),
    ("2026-10", "أكتوبر 2026", 838_380, 825_768, 811_888),
    ("2026-11", "نوفمبر 2026", 846_320, 830_562, 813_040),
    ("2026-12", "ديسمبر 2026", 854_356, 835_464, 814_192),
    ("2027-01", "يناير 2027", 862_492, 840_294, 815_344),
    ("2027-02", "فبراير 2027", 870_724, 845_238, 816_496),
    ("2027-03", "مارس 2027", 879_052, 850_158, 817_648),
    ("2027-04", "أبريل 2027", 887_480, 855_102, 818_800),
    ("2027-05", "مايو 2027", 896_004, 860_028, 819_952),
    ("2027-06", "يونيو 2027", 904_628, 865_008, 821_788),
]

SECTOR_ORDER = ["north", "east", "center", "west", "south"]
SECTOR_NAMES = {
    "north": "قطاع الشمال",
    "east": "قطاع الشرق",
    "center": "قطاع الوسط",
    "west": "قطاع الغرب",
    "south": "قطاع الجنوب",
}
SECTOR_SHORT = {  # تسميات قصيرة للمحاور والخريطة
    "north": "الشمال", "east": "الشرق", "center": "الوسط", "west": "الغرب", "south": "الجنوب",
}

# ───────────────────────────────────────────────────────────────────────────────
# 1-ب) الاستراتيجية: خطة عمل المشروع V.1.0.0 — منقولة حرفياً من طبقة بيانات
#      المنصة المنشورة (js/data.js). قرار المطابقة R4/R5 مُحدَّث: المصدر متوفر
#      بتوجيه العميل الصريح؛ 4 محاور (3 ركائز + ممكن) و18 مبادرة و14 مؤشراً.
#      «القيم الحالية للمؤشرات» تبقى غير متوفرة بصدق (تُدار من الإدارة).
# ───────────────────────────────────────────────────────────────────────────────

STRATEGY_SOURCE = ("خطة عمل المشروع V.1.0.0 — كما وردت حرفياً في طبقة بيانات "
                   "المنصة المنشورة (js/data.js)")

STRATEGY_PILLARS = [
    # (id, kind, name كما ورد حرفياً في المصدر)
    ("p1", "ركيزة", "ركيزة 1: زيادة المعروض المرخص"),
    ("p2", "ركيزة", "ركيزة 2: سد الفجوات التنظيمية"),
    ("p3", "ركيزة", "ركيزة 3: تحسين آليات الرقابة"),
    ("p4", "ممكن", "ممكن 4: الحوكمة والنموذج التشغيلي"),
]

# (id, pillar_id, name, start, end, status_from_file)
# الحالة الفارغة None كما في الملف؛ «مكتملة» طُبّعت في المصدر إلى «منجزة».
INITIATIVES = [
    ("1.1", "p1", "دراسة الطلب والعرض على السكن الجماعي للأفراد", None, None, "منجزة"),
    ("1.2", "p1", "تسهيل رحلة إصدار التراخيص وزيادة الوعي في المنظومة", "2026-04-01", "2026-04-30", None),
    ("1.3", "p1", "طرح فرص استثمارية ورفع مستوى رضا المستثمرين", "2026-04-01", "2026-06-30", None),
    ("1.4", "p1", "تقنين السكن الجماعي غير المرخص", "2026-04-01", "2027-04-30", None),
    ("1.5", "p1", "احتضان مشاريع نموذجية للسكن الجماعي في المدينة", "2026-04-01", "2026-12-31", None),
    ("1.6", "p1", "إضافة فئات جديدة للسكن الجماعي للأفراد", "2026-04-01", "2026-07-31", None),
    ("2.1", "p2", "تنظيم التعاقد الإيجاري للسكن الجماعي", "2026-04-01", "2026-07-31", None),
    ("2.2", "p2", "ربط مكان سكن العامل بالهوية", "2026-04-01", "2026-09-30", None),
    ("2.3", "p2", "إلزام المنشآت بتسكين العاملين في سكن مرخص", "2026-04-01", "2027-04-30", None),
    ("2.4", "p2", "تنظيم المباني ذو الطاقة الاستيعابية أقل من 20", "2026-04-01", "2026-09-30", None),
    ("3.1", "p3", "تفعيل الرقابة الاستباقية لما قبل إصدار التراخيص", None, None, "منجزة"),
    ("3.2", "p3", "زيادة كفاءة التفتيش الميداني", "2026-04-01", "2026-07-31", None),
    ("3.3", "p3", "تحديث آلية المخالفات", "2026-04-01", "2026-06-30", None),
    ("4.1", "p4", "تفعيل نموذج الحوكمة", "2026-04-01", "2026-04-30", None),
    ("4.2", "p4", "تطبيق خطة إدارة الأداء والمخاطر", "2026-06-01", "2026-08-31", None),
    ("4.3", "p4", "تحسين آليات التواصل", "2026-04-01", "2026-09-30", None),
    ("4.4", "p4", "تطبيق نموذج تشغيلي للمنظومة", "2026-07-01", "2026-09-30", None),
    ("4.5", "p4", "رقمنة العمليات والإجراءات في منظومة السكن الجماعي", "2026-05-01", "2026-10-29", None),
]

INITIATIVE_STATUS_VOCAB = ["منجزة", "جاري العمل", "متأخرة", "لم يتم البدء"]
INITIATIVE_STATUS_RULE = ("الحالة المعروضة = حالة الملف إن وُجدت؛ وإلا: تجاوزت "
                          "تاريخ نهايتها دون تسجيل إنجاز = متأخرة حكماً، بدأت ولم "
                          "تنته = جاري العمل، لم يحن بدؤها = لم يتم البدء")

# (id, name, type, baseline, target, pct?) — كما وردت في ورقة «مؤشرات الأداء»
KPIS = [
    (1, "نسبة الالتزام باتفاقيات مستوى الخدمة للتراخيص", "استراتيجي", 0, 0.8, True),
    (2, "نسبة تفعيل نموذج الحوكمة المحدث للسكن الجماعي", "استراتيجي", 0, 1, True),
    (3, "عدد الأراضي المطروحة لبناء سكن جماعي للأفراد", "استراتيجي", 0, 10, False),
    (4, "عدد المشاريع النوعية في منظومة السكن الجماعي", "استراتيجي", 0, 3, False),
    (5, "عدد الأسرة المرخصة في مدينة الرياض", "استراتيجي", 130_000, 260_000, False),
    (6, "نسبة رضا المستثمرين", "استراتيجي", 0.5, 0.6, True),
    (7, "نسبة العقود التأجيرية المربوطة برخص السكن الجماعي", "استراتيجي", 0, 1, True),
    (8, "نسبة امتثال المساكن الجماعية للأفراد", "استراتيجي", 0.15, 0.3, True),
    (9, "نسبة اكتمال تطبيق النموذج التشغيلي المستهدف", "استراتيجي", 0, 1, True),
    (10, "نسبة مؤشرات الأداء الرئيسية المتوافقة مع خطة إدارة الأداء", "استراتيجي", 0, 1, True),
    (11, "نسبة أتمتة العمليات والإجراءات في منظومة السكن الجماعي للأفراد", "استراتيجي", 0, 1, True),
    (12, "نسبة تفعيل قنوات التواصل مع الجمهور المستهدف", "استراتيجي", 0, 1, True),
    (13, "نسبة الأفراد الساكنين في سكن مرخص", "استراتيجي", 0.2, 0.9, True),
    (14, "نسبة طلبات السكن الجماعي التي تم تحفيزها للسكن بالقرب من العمل", "استراتيجي", 0, 1, True),
]

# لوحات الرؤى الافتراضية لكل قسم (قابلة للتحرير إدارياً) — من analysisDefaults
INSIGHT_PANELS = {
    "supply": [
        ("sd1", "neg", "ارتفاع الطلب على الطاقة الاستيعابية",
         "الطلب الحالي يتجاوز العرض بنحو 807.6 ألف سرير، بما يعادل تغطية 43.1٪ فقط من إجمالي الاحتياج."),
        ("sd2", "warn", "تركز العجز في قطاع الجنوب",
         "يسجل قطاع الجنوب أدنى نسبة تغطية بين القطاعات (34.8٪) مع أعلى حجم طلب، ما يستدعي توجيه الرخص الجديدة إليه."),
        ("sd3", "pos", "تحسن العرض بنمو الرخص التشغيلية",
         "ارتفعت الطاقة الاستيعابية بنحو 48.5 ألف سرير منذ سبتمبر 2025 نتيجة نمو الرخص التشغيلية النشطة."),
    ],
    "licensing": [
        ("ld1", "pos", "نمو مطرد في الرخص التشغيلية",
         "أضيفت 22 رخصة تشغيلية نشطة منذ سبتمبر 2025 ليبلغ الإجمالي 140 رخصة بنمو سنوي قدره 18.6٪."),
        ("ld2", "pos", "ارتفاع الطاقة الاستيعابية",
         "واكب نموَّ الرخص ارتفاعٌ في الطاقة الاستيعابية بنسبة 8.6٪ خلال اثني عشر شهراً."),
        ("ld3", "neu", "تركز الرخص الجديدة جغرافياً",
         "يستحوذ قطاعا الشرق والشمال على النصيب الأكبر من الرخص النشطة، مقابل حضور أقل في قطاع الغرب."),
    ],
    "control": [
        ("cd1", "neg", "ارتفاع المخالفات في قطاع الجنوب",
         "سجل قطاع الجنوب 1,367 مخالفة خلال آخر 12 شهراً، وهو الأعلى بين القطاعات بفارق كبير عن المتوسط."),
        ("cd2", "warn", "تفاوت توزيع القدرة الرقابية",
         "يغطي قطاعَي الجنوب والغرب ثلاثة مراقبين لكل منهما رغم تباين حجم المخالفات، ما يشير إلى حاجة لإعادة الموازنة."),
        ("cd3", "neu", "مراجعة خطة الانتشار الميداني",
         "يوصى بدراسة إعادة توزيع المراقبين وفق كثافة المخالفات المسجلة ومعدلات الزيارات لكل قطاع."),
    ],
    "initiatives": [
        ("id1", "pos", "اكتمال مبادرتين تأسيسيتين",
         "اكتملت دراسة الطلب والعرض (1.1) وتفعيل الرقابة الاستباقية (3.1) وفق خطة العمل المعتمدة."),
        ("id2", "warn", "مبادرات متأخرة تتطلب تحديث الحالة",
         "سبع مبادرات تجاوزت تاريخ نهايتها المخطط دون تسجيل إنجاز فتُعد متأخرة حكماً — يوصى بتحديث حالاتها في خطة العمل."),
        ("id3", "neu", "تسع مبادرات جاري العمل عليها",
         "تمتد المبادرات التي يجري العمل عليها حتى أبريل 2027، وأطولها مدة تقنين السكن غير المرخص وإلزام المنشآت بالتسكين المرخص."),
    ],
}

# ═══════════════════════════════════════════════════════════════════════════════
# 2) إعادة التحقق الاختيارية من ملف الورقة الأصلي (حارس انحراف المصدر)
#    نتجاهل خلايا الصيغ ونقرأ الخام فقط — القسم 15 من التكليف.
# ═══════════════════════════════════════════════════════════════════════════════

def _cell(ws, addr):
    v = ws[addr].value
    if isinstance(v, float) and v.is_integer():
        return int(v)
    return v


def revalidate_against_workbook(path):
    """تفتح الورقة وتطابق كل مرساة V1 مع الثوابت أعلاه حرفياً."""
    try:
        import openpyxl
    except ImportError:
        print("⚠ openpyxl غير مثبت — تخطي إعادة التحقق من الورقة (الثوابت V1 هي المرجع)")
        return
    wb = openpyxl.load_workbook(path, data_only=True)
    d, l, r, n, c = (wb["الطلب"], wb["التراخيص"], wb["الرقابة"], wb["الأحياء"], wb["السياق"])

    gate("wb.total_demand", _cell(d, "C4") == TOTAL_DEMAND, f"C4={_cell(d,'C4')}")
    for i, sec in enumerate(SECTOR_ORDER):
        row = 7 + i
        gate(f"wb.demand.{sec}", nfc(_cell(d, f"B{row}")) == nfc(SECTOR_NAMES[sec])
             and _cell(d, f"C{row}") == SECTOR_DEMAND[sec], f"صف {row}")

    gate("wb.baseline", (_cell(l, "C5"), _cell(l, "D5"), _cell(l, "E5"))
         == (BASELINE["building"], BASELINE["operational"], BASELINE["beds"]), "التراخيص!C5:E5")
    for i, (iso, label, b, o, beds) in enumerate(MONTHLY_LICENSING):
        row = 8 + i
        gate(f"wb.lic.{iso}", nfc(_cell(l, f"B{row}")) == nfc(label)
             and (_cell(l, f"C{row}"), _cell(l, f"D{row}"), _cell(l, f"E{row}")) == (b, o, beds),
             f"صف {row}")
    for i, sec in enumerate(SECTOR_ORDER):
        row = 23 + i
        gate(f"wb.lic.sector.{sec}",
             (_cell(l, f"C{row}"), _cell(l, f"D{row}"), _cell(l, f"E{row}")) == SECTOR_LICENSING[sec],
             f"صف {row}")
    gate("wb.coverage_target", _cell(l, "C31") == COVERAGE_TARGET_INDICATIVE, "التراخيص!C31")

    for i, sec in enumerate(SECTOR_ORDER):
        row = 5 + i
        gate(f"wb.mon.sector.{sec}",
             (_cell(r, f"C{row}"), _cell(r, f"D{row}"), _cell(r, f"E{row}"), _cell(r, f"F{row}"))
             == SECTOR_MONITORING[sec], f"صف {row}")
    gate("wb.compliance", float(_cell(r, "C12")) == COMPLIANCE_RATE_SUPPLIED, "الرقابة!C12")
    for i, (_k, name, count) in enumerate(VIOLATION_TYPES):
        row = 15 + i
        wb_name = nfc(_cell(r, f"B{row}"))
        # الورقة تكتب «بدون ترخيص»؛ النسخة المحررة رسمياً «دون ترخيص» — فرق موثق في ARABIC_COPY_REVIEW
        name_ok = wb_name == nfc(name) or wb_name.replace("بدون", "دون") == nfc(name)
        gate(f"wb.viol.{_k}", name_ok and _cell(r, f"C{row}") == count, f"صف {row}: {wb_name}")

    for i, (name, sec, b, o, beds, viol) in enumerate(NEIGHBOURHOODS):
        row = 5 + i
        gate(f"wb.nbhd.{i}", nfc(_cell(n, f"B{row}")) == nfc(name)
             and nfc(_cell(n, f"C{row}")) == nfc(SECTOR_NAMES[sec])
             and (_cell(n, f"D{row}"), _cell(n, f"E{row}"), _cell(n, f"F{row}"), _cell(n, f"G{row}"))
             == (b, o, beds, viol), f"صف {row}: {name}")

    gate("wb.occupied", _cell(c, "C4") == OCCUPIED_BEDS, "السياق!C4")
    gate("wb.asof", nfc(_cell(c, "C5")) == nfc(DATA_AS_OF_LABEL), "السياق!C5")
    gate("wb.calc_date", str(_cell(c, "C6"))[:10] == CALCULATION_DATE, "السياق!C6")
    for i, (_k, name, count) in enumerate(FACILITY_TYPES):
        row = 9 + i
        gate(f"wb.fac.{_k}", nfc(_cell(c, f"B{row}")) == nfc(name) and _cell(c, f"C{row}") == count,
             f"صف {row}")
    gate("wb.collar", (_cell(c, "C15"), _cell(c, "C16")) == (COLLAR["blue"], COLLAR["white"]),
         "السياق!C15:C16")
    for i, (_k, name, v) in enumerate(ECONOMIC_ACTIVITIES):
        row = 20 + i
        gate(f"wb.econ.{_k}", nfc(_cell(c, f"B{row}")) == nfc(name) and _cell(c, f"C{row}") == v,
             f"صف {row}")
    for i, (iso, label, visits, viol) in enumerate(MONTHLY_MONITORING):
        row = 30 + i
        gate(f"wb.monm.{iso}", nfc(_cell(c, f"B{row}")) == nfc(label)
             and (_cell(c, f"C{row}"), _cell(c, f"D{row}")) == (visits, viol), f"صف {row}")
    for i, (iso, label, cons, base, opt) in enumerate(DEFICIT_SCENARIOS):
        row = 46 + i
        gate(f"wb.scn.{iso}", nfc(_cell(c, f"B{row}")) == nfc(label)
             and (_cell(c, f"C{row}"), _cell(c, f"D{row}"), _cell(c, f"E{row}")) == (cons, base, opt),
             f"صف {row}")
    print(f"✓ أعيد التحقق من الورقة: {path}")


# ═══════════════════════════════════════════════════════════════════════════════
# 3) الاشتقاق المركزي — كل صيغة موثقة بمعرّف ومدخلات (القسم 15 من التكليف)
# ═══════════════════════════════════════════════════════════════════════════════

def derive():
    """يحسب كل القيم المشتقة ويعيد قاموس derived بسجلات صيغ كاملة."""
    d = {}

    def rec(mid, value, unit, formula, inputs, places=None):
        d[mid] = {
            "id": mid, "value": value, "unit": unit, "kind": "derived",
            "formula": formula, "formula_version": FORMULA_VERSION, "inputs": inputs,
        }
        if places is not None:
            d[mid]["display_places"] = places
        return value

    dem, cap = TOTAL_DEMAND, CURRENT_LICENSING["beds"]
    rec("deficit_beds", max(dem - cap, 0), "سرير",
        "max(total_demand − licensed_beds, 0)", ["total_demand", "licensed_beds"])
    rec("coverage_pct", pct(cap, dem), "٪",
        "licensed_beds ÷ total_demand × 100", ["licensed_beds", "total_demand"])
    rec("uncovered_pct", round_half_up(100 - pct(cap, dem)), "٪",
        "100 − coverage_pct", ["coverage_pct"])
    rec("occupancy_pct", pct(OCCUPIED_BEDS, cap), "٪",
        "occupied_beds ÷ licensed_beds × 100", ["occupied_beds", "licensed_beds"])
    rec("vacant_beds", cap - OCCUPIED_BEDS, "سرير",
        "licensed_beds − occupied_beds", ["licensed_beds", "occupied_beds"])
    rec("blue_share_pct", pct(COLLAR["blue"], dem), "٪",
        "blue_collar ÷ total_demand × 100", ["blue_collar", "total_demand"])
    rec("white_share_pct", pct(COLLAR["white"], dem), "٪",
        "white_collar ÷ total_demand × 100", ["white_collar", "total_demand"])

    for key in ("building", "operational", "beds"):
        delta = CURRENT_LICENSING[key] - BASELINE[key]
        rec(f"growth_{key}_abs", delta,
            "رخصة" if key != "beds" else "سرير",
            f"current_{key} − baseline_{key}", [f"current_{key}", f"baseline_{key}"])
        rec(f"growth_{key}_pct", pct(delta, BASELINE[key]), "٪",
            f"(current_{key} − baseline_{key}) ÷ baseline_{key} × 100",
            [f"current_{key}", f"baseline_{key}"])

    sectors = {}
    for sec in SECTOR_ORDER:
        b, o, beds = SECTOR_LICENSING[sec]
        mon, viol, visits, clo = SECTOR_MONITORING[sec]
        demand = SECTOR_DEMAND[sec]
        sectors[sec] = {
            "coverage_pct": pct(beds, demand),
            "coverage_raw": beds / demand,            # للترتيب فقط — غير معروض
            "deficit_beds": max(demand - beds, 0),
            "violations_share_pct": pct(viol, MONITORING_TOTALS["violations"]),
            "visits_share_pct": pct(visits, MONITORING_TOTALS["visits"]),
            "demand_share_pct": pct(demand, TOTAL_DEMAND),
        }
    d["sector_derived"] = sectors

    # الترتيب على الخام دائماً (بوابة القسم 15)
    # كسر التعادل الموحد مع المتصفح: max/min تعيدان أول الأقصى/الأدنى بترتيب القطاعات
    d["rankings"] = {
        "lowest_coverage": min(SECTOR_ORDER, key=lambda s: sectors[s]["coverage_raw"]),
        "highest_coverage": max(SECTOR_ORDER, key=lambda s: sectors[s]["coverage_raw"]),
        "highest_demand": max(SECTOR_ORDER, key=lambda s: SECTOR_DEMAND[s]),
        "highest_violations": max(SECTOR_ORDER, key=lambda s: SECTOR_MONITORING[s][1]),
        "highest_building": max(SECTOR_ORDER, key=lambda s: SECTOR_LICENSING[s][0]),
        "lowest_building": min(SECTOR_ORDER, key=lambda s: SECTOR_LICENSING[s][0]),
        "highest_operational": max(SECTOR_ORDER, key=lambda s: SECTOR_LICENSING[s][1]),
        "lowest_operational": min(SECTOR_ORDER, key=lambda s: SECTOR_LICENSING[s][1]),
        "highest_beds": max(SECTOR_ORDER, key=lambda s: SECTOR_LICENSING[s][2]),
        "lowest_beds": min(SECTOR_ORDER, key=lambda s: SECTOR_LICENSING[s][2]),
    }

    rec("avg_monthly_visits", int(round_half_up(MONITORING_TOTALS["visits"] / 12, 0)), "زيارة",
        "total_visits ÷ 12", ["total_visits"])
    rec("south_violations_share_pct",
        pct(SECTOR_MONITORING["south"][1], MONITORING_TOTALS["violations"]), "٪",
        "south_violations ÷ total_violations × 100",
        ["south_violations", "total_violations"])
    return d


# ═══════════════════════════════════════════════════════════════════════════════
# 4) بوابات المطابقة — القسم 20 من التكليف حرفياً
# ═══════════════════════════════════════════════════════════════════════════════

def run_gates(derived):
    gate("demand.sector_sum", sum(SECTOR_DEMAND.values()) == 1_420_000,
         f"Σ={sum(SECTOR_DEMAND.values())}")
    gate("licensing.sector_beds_sum",
         sum(v[2] for v in SECTOR_LICENSING.values()) == 612_400,
         f"Σ={sum(v[2] for v in SECTOR_LICENSING.values())}")
    gate("monitoring.visits_sum",
         sum(v[2] for v in SECTOR_MONITORING.values()) == 19_651,
         f"Σ={sum(v[2] for v in SECTOR_MONITORING.values())}")
    gate("monitoring.violations_by_sector",
         sum(v[1] for v in SECTOR_MONITORING.values()) == 3_617,
         f"Σ={sum(v[1] for v in SECTOR_MONITORING.values())}")
    gate("monitoring.violations_by_type",
         sum(v[2] for v in VIOLATION_TYPES) == 3_617,
         f"Σ={sum(v[2] for v in VIOLATION_TYPES)}")
    gate("monitoring.monthly_visits",
         sum(m[2] for m in MONTHLY_MONITORING) == 19_651,
         f"Σ={sum(m[2] for m in MONTHLY_MONITORING)}")
    gate("monitoring.monthly_violations",
         sum(m[3] for m in MONTHLY_MONITORING) == 3_617,
         f"Σ={sum(m[3] for m in MONTHLY_MONITORING)}")
    gate("monitoring.monitors_sum",
         sum(v[0] for v in SECTOR_MONITORING.values()) == MONITORING_TOTALS["monitors"], "")
    gate("monitoring.closures_sum",
         sum(v[3] for v in SECTOR_MONITORING.values()) == MONITORING_TOTALS["closures"], "")
    gate("licensing.facility_types", sum(t[2] for t in FACILITY_TYPES) == 140,
         f"Σ={sum(t[2] for t in FACILITY_TYPES)}")
    gate("demand.collar_sum", COLLAR["blue"] + COLLAR["white"] == 1_420_000, "")
    gate("demand.economic_sum",
         sum(a[2] for a in ECONOMIC_ACTIVITIES) == 1_420_000,
         f"Σ={sum(a[2] for a in ECONOMIC_ACTIVITIES)}")

    # خط الأساس + 12 إضافة شهرية = الحالي، للمقاييس الثلاثة
    for i, key in enumerate(("building", "operational", "beds")):
        col = i + 2
        total = BASELINE[key] + sum(m[col] for m in MONTHLY_LICENSING)
        gate(f"licensing.baseline_plus_monthly.{key}", total == CURRENT_LICENSING[key],
             f"{BASELINE[key]}+Σ={total} مقابل {CURRENT_LICENSING[key]}")
        sec_total = sum(v[i] for v in SECTOR_LICENSING.values())
        gate(f"licensing.sector_sum.{key}", sec_total == CURRENT_LICENSING[key],
             f"Σ={sec_total}")

    # الإشغال
    gate("occupancy.not_exceeding", OCCUPIED_BEDS <= CURRENT_LICENSING["beds"], "")
    gate("occupancy.vacancy", derived["vacant_beds"]["value"] == 50_829,
         f"{derived['vacant_beds']['value']}")
    gate("occupancy.rate", derived["occupancy_pct"]["value"] == 91.7,
         f"{derived['occupancy_pct']['value']}")
    gate("coverage.city", derived["coverage_pct"]["value"] == 43.1,
         f"{derived['coverage_pct']['value']}")
    gate("deficit.city", derived["deficit_beds"]["value"] == 807_600, "")

    # الأشهر متتابعة
    def consecutive(isos):
        for a, b in zip(isos, isos[1:]):
            ya, ma = map(int, a.split("-"))
            yb, mb = map(int, b.split("-"))
            if (ya * 12 + ma) + 1 != yb * 12 + mb:
                return False
        return True

    gate("monitoring.months_consecutive", consecutive([m[0] for m in MONTHLY_MONITORING]),
         "سبتمبر 2025 → أغسطس 2026")
    gate("licensing.months_consecutive", consecutive([m[0] for m in MONTHLY_LICENSING]), "")
    gate("scenarios.months_consecutive", consecutive([m[0] for m in DEFICIT_SCENARIOS]),
         "سبتمبر 2026 → يونيو 2027")
    gate("scenarios.ordering",
         all(cons >= base >= opt for _i, _l, cons, base, opt in DEFICIT_SCENARIOS),
         "متحفظ ≥ أساسي ≥ متفائل")
    gate("monitoring.period_end",
         MONTHLY_MONITORING[-1][0] == "2026-08", "نهاية الفترة المعتمدة")

    # أعداد صحيحة غير سالبة
    all_counts = (
        list(SECTOR_DEMAND.values())
        + [x for v in SECTOR_LICENSING.values() for x in v]
        + [x for v in SECTOR_MONITORING.values() for x in v]
        + [t[2] for t in VIOLATION_TYPES] + [t[2] for t in FACILITY_TYPES]
        + [a[2] for a in ECONOMIC_ACTIVITIES]
        + [x for m in MONTHLY_LICENSING for x in m[2:]]
        + [x for m in MONTHLY_MONITORING for x in m[2:]]
        + [x for m in DEFICIT_SCENARIOS for x in m[2:]]
        + [n[i] for n in NEIGHBOURHOODS for i in (2, 3, 4, 5)]
    )
    gate("counts.nonnegative_integers",
         all(isinstance(x, int) and x >= 0 for x in all_counts), "")

    # الأحياء: أسماء فريدة، قطاع صحيح، Σ العينة ≤ إجمالي القطاع
    names = [n[0] for n in NEIGHBOURHOODS]
    gate("nbhd.unique_names", len(names) == len(set(names)), "")
    gate("nbhd.valid_sectors", all(n[1] in SECTOR_ORDER for n in NEIGHBOURHOODS), "")
    for sec in SECTOR_ORDER:
        rows = [n for n in NEIGHBOURHOODS if n[1] == sec]
        gate(f"nbhd.sample_le_sector.{sec}",
             sum(r[2] for r in rows) <= SECTOR_LICENSING[sec][0]
             and sum(r[3] for r in rows) <= SECTOR_LICENSING[sec][1]
             and sum(r[4] for r in rows) <= SECTOR_LICENSING[sec][2]
             and sum(r[5] for r in rows) <= SECTOR_MONITORING[sec][1],
             SECTOR_NAMES[sec])

    # القيم المعروضة في العناوين المعتمدة تطابق المشتقات (منع الأرقام المكتوبة نصاً)
    sd = derived["sector_derived"]
    gate("insight.s03", derived["coverage_pct"]["value"] == 43.1, "")
    gate("insight.s04",
         SECTOR_DEMAND["south"] == 368_000 and sd["south"]["coverage_pct"] == 34.8
         and sd["east"]["coverage_pct"] == 52.1, "")
    gate("insight.s05",
         derived["growth_building_pct"]["value"] == 50.0
         and derived["growth_beds_pct"]["value"] == 8.6
         and derived["growth_operational_pct"]["value"] == 18.6, "")
    gate("insight.s07",
         SECTOR_MONITORING["south"][1] == 1_367
         and derived["south_violations_share_pct"]["value"] == 37.8
         and SECTOR_MONITORING["south"][0] == 3, "")
    gate("rankings.consistency",
         derived["rankings"]["highest_demand"] == "south"
         and derived["rankings"]["lowest_coverage"] == "south"
         and derived["rankings"]["highest_coverage"] == "east"
         and derived["rankings"]["highest_violations"] == "south", "")

    # ── الاستراتيجية: خطة عمل V.1.0.0 (منقولة حرفياً — بوابات بنيوية ودلالية) ──
    pillar_ids = [p[0] for p in STRATEGY_PILLARS]
    gate("strategy.pillars_count", len(STRATEGY_PILLARS) == 4,
         f"{len(STRATEGY_PILLARS)} محاور (3 ركائز + ممكن)")
    gate("strategy.pillars_unique", len(set(pillar_ids)) == 4, "")
    gate("strategy.pillars_kinds",
         [p[1] for p in STRATEGY_PILLARS] == ["ركيزة", "ركيزة", "ركيزة", "ممكن"], "")

    ini_ids = [i[0] for i in INITIATIVES]
    gate("strategy.initiatives_count", len(INITIATIVES) == 18, f"{len(INITIATIVES)}")
    gate("strategy.initiatives_unique", len(set(ini_ids)) == 18, "")
    gate("strategy.initiatives_pillars_valid",
         all(i[1] in pillar_ids for i in INITIATIVES), "")
    gate("strategy.initiatives_id_prefix",
         all(iid.split(".")[0] == pid[1] for iid, pid, *_rest in INITIATIVES),
         "رقم المبادرة يطابق رقم محورها")

    def iso_ok(s):
        if s is None:
            return True
        try:
            _dt.date.fromisoformat(s)
            return True
        except ValueError:
            return False

    gate("strategy.initiatives_dates_iso",
         all(iso_ok(i[3]) and iso_ok(i[4]) for i in INITIATIVES), "")
    gate("strategy.initiatives_start_le_end",
         all(i[3] <= i[4] for i in INITIATIVES if i[3] and i[4]), "")
    gate("strategy.initiatives_status_vocab",
         all(i[5] is None or i[5] in INITIATIVE_STATUS_VOCAB for i in INITIATIVES), "")

    # الحالة المشتقة بقاعدة المصدر («متأخرة حكماً») عند تاريخ الاحتساب المعتمد —
    # تُثبَّت الأعداد لأن نصوص الرؤى المعتمدة تذكرها (2 منجزة / 7 متأخرة / 9 جارية)
    def ini_state(start, end, status):
        if status:
            return status
        if end and end < CALCULATION_DATE:
            return "متأخرة"
        if start and start <= CALCULATION_DATE:
            return "جاري العمل"
        return "لم يتم البدء"

    counts = {}
    for _iid, _pid, _name, start, end, status in INITIATIVES:
        st = ini_state(start, end, status)
        counts[st] = counts.get(st, 0) + 1
    gate("strategy.status_counts",
         counts == {"منجزة": 2, "متأخرة": 7, "جاري العمل": 9},
         f"{counts} عند {CALCULATION_DATE}")

    kpi_ids = [k[0] for k in KPIS]
    gate("strategy.kpis_count", len(KPIS) == 14, f"{len(KPIS)}")
    gate("strategy.kpis_ids", kpi_ids == list(range(1, 15)), "")
    gate("strategy.kpis_pct_bounds",
         all(0 <= k[3] <= 1 and 0 <= k[4] <= 1 for k in KPIS if k[5]),
         "المؤشرات النسبية كسور ضمن [0,1]")
    gate("strategy.kpis_target_progress",
         all(k[4] > k[3] for k in KPIS),
         "كل مستهدف أعلى من خط أساسه")

    # سلسلة التغطية الشهرية المشتقة: صاعدة وتنتهي عند 43.1٪
    cum = BASELINE["beds"]
    series = []
    for m in MONTHLY_LICENSING:
        cum += m[4]
        series.append(round_half_up(cum / TOTAL_DEMAND * 100, 1))
    gate("coverage.series_monotonic",
         all(a <= b for a, b in zip(series, series[1:])), "")
    gate("coverage.series_final", series[-1] == 43.1, f"{series[-1]}")

    # لوحات الرؤى: بنية سليمة وتصنيفات ضمن المفردات
    gate("insight_panels.sections",
         set(INSIGHT_PANELS.keys()) == {"supply", "licensing", "control", "initiatives"}, "")
    gate("insight_panels.cls_vocab",
         all(p[1] in ("pos", "neg", "warn", "neu")
             for panels in INSIGHT_PANELS.values() for p in panels), "")


# ═══════════════════════════════════════════════════════════════════════════════
# 5) تجميع الإصدار
# ═══════════════════════════════════════════════════════════════════════════════

def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(65536), b""):
            h.update(chunk)
    return h.hexdigest()


def canonical_hash(obj):
    payload = json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(payload.encode("utf-8")).hexdigest()


def build_release():
    derived = derive()
    run_gates(derived)

    wb_path = None
    for cand in (os.path.join(HERE, "private-sources", WORKBOOK_FILE),
                 os.path.join(HERE, WORKBOOK_FILE)):
        if os.path.exists(cand):
            wb_path = cand
            break
    wb_sha = sha256_file(wb_path) if wb_path else None
    if wb_path:
        revalidate_against_workbook(wb_path)

    if _FAILED:
        print("\n✗ فشلت بوابات المطابقة:", file=sys.stderr)
        for f in _FAILED:
            print("  •", f, file=sys.stderr)
        sys.exit(1)

    metrics = {}

    def raw(mid, value, unit, sheet, anchor, label):
        metrics[mid] = {"id": mid, "value": value, "unit": unit, "kind": "raw",
                        "source_id": "src-workbook-v1", "sheet": sheet, "anchor": anchor,
                        "label": label}

    raw("total_demand", TOTAL_DEMAND, "سرير", "الطلب", "C4", "إجمالي الطلب التقديري على الأسرّة")
    raw("licensed_beds", CURRENT_LICENSING["beds"], "سرير", "التراخيص", "E20",
        "الطاقة الاستيعابية المرخصة")
    raw("occupied_beds", OCCUPIED_BEDS, "سرير", "السياق", "C4", "الأسرّة المشغولة")
    raw("current_building", CURRENT_LICENSING["building"], "رخصة", "التراخيص", "C20", "رخص البناء")
    raw("current_operational", CURRENT_LICENSING["operational"], "رخصة", "التراخيص", "D20",
        "الرخص التشغيلية")
    raw("baseline_building", BASELINE["building"], "رخصة", "التراخيص", "C5",
        "رخص البناء — خط الأساس قبل سبتمبر 2025")
    raw("baseline_operational", BASELINE["operational"], "رخصة", "التراخيص", "D5",
        "الرخص التشغيلية — خط الأساس قبل سبتمبر 2025")
    raw("baseline_beds", BASELINE["beds"], "سرير", "التراخيص", "E5",
        "الطاقة المرخصة — خط الأساس قبل سبتمبر 2025")
    raw("blue_collar", COLLAR["blue"], "سرير", "السياق", "C15",
        "الطلب على الأسرّة للعمالة ذات الياقات الزرقاء")
    raw("white_collar", COLLAR["white"], "سرير", "السياق", "C16",
        "الطلب على الأسرّة للعمالة ذات الياقات البيضاء")
    raw("total_monitors", MONITORING_TOTALS["monitors"], "مراقب", "الرقابة", "C10",
        "إجمالي المراقبين حتى أغسطس 2026")
    raw("total_visits", MONITORING_TOTALS["visits"], "زيارة", "الرقابة", "E10",
        "الزيارات الميدانية خلال سبتمبر 2025–أغسطس 2026")
    raw("total_violations", MONITORING_TOTALS["violations"], "مخالفة", "الرقابة", "D10",
        "المخالفات المسجلة خلال الفترة نفسها")
    raw("total_closures", MONITORING_TOTALS["closures"], "قرار", "الرقابة", "F10",
        "قرارات الإغلاق خلال الفترة نفسها")
    raw("south_violations", SECTOR_MONITORING["south"][1], "مخالفة", "الرقابة", "D9",
        "مخالفات قطاع الجنوب")

    release = {
        "schema_version": SCHEMA_VERSION,
        "release": {
            "id": "rel-2026-08-16-001",
            "status": "published",
            "published_at": "2026-08-16T12:00:00Z",
            "published_by": "system-seed",
            "base_release_id": None,
            "notes": "الإصدار التأسيسي المولَّد من platform-data.xlsx (مرساة V1)",
        },
        "meta": {
            "title": "لوحة معلومات السكن الجماعي للأفراد في مدينة الرياض",
            "entity": None,   # لا شعار/جهة مخترعة — تُضاف من الإدارة عند اعتماد الهوية
            "presentation_date": "2026-08-16",
            "presentation_date_needs_confirmation": True,
            "data_as_of": DATA_AS_OF_LABEL,
            "monitoring_period_start": "2025-09",
            "monitoring_period_end": "2026-08",
            "monitoring_period_label": "سبتمبر 2025 – أغسطس 2026",
            "baseline_label": "خط الأساس قبل سبتمبر 2025",
            "comparison_qualifier": "مقارنة بخط الأساس قبل سبتمبر 2025، وحتى أغسطس 2026",
            "calculation_date": CALCULATION_DATE,
            "map_disclaimer": "خريطة توضيحية",
            "sample_label": "عينة من الأحياء المدرجة في قاعدة البيانات",
        },
        "sources": [{
            "id": "src-workbook-v1",
            "name": WORKBOOK_FILE,
            "kind": "workbook",
            "template_version": TEMPLATE_VERSION,
            "sha256": wb_sha,
            "imported_at": "2026-08-16T11:50:00Z",
            "private": True,
        }],
        "metrics": metrics,
        "derived": derived,
        "sectors": [
            {
                "id": sec,
                "name": SECTOR_NAMES[sec],
                "short": SECTOR_SHORT[sec],
                "demand": SECTOR_DEMAND[sec],
                "building": SECTOR_LICENSING[sec][0],
                "operational": SECTOR_LICENSING[sec][1],
                "beds": SECTOR_LICENSING[sec][2],
                "monitors": SECTOR_MONITORING[sec][0],
                "violations": SECTOR_MONITORING[sec][1],
                "visits": SECTOR_MONITORING[sec][2],
                "closures": SECTOR_MONITORING[sec][3],
            }
            for sec in SECTOR_ORDER
        ],
        "monthly": {
            "licensing": [
                {"iso": iso, "label": label, "building": b, "operational": o, "beds": beds}
                for iso, label, b, o, beds in MONTHLY_LICENSING
            ],
            "monitoring": [
                {"iso": iso, "label": label, "visits": v, "violations": x}
                for iso, label, v, x in MONTHLY_MONITORING
            ],
        },
        "baseline": BASELINE,
        "facility_types": [{"id": k, "name": n, "count": c} for k, n, c in FACILITY_TYPES],
        "economic_activities": [{"id": k, "name": n, "demand": v}
                                for k, n, v in ECONOMIC_ACTIVITIES],
        "violation_types": [{"id": k, "name": n, "count": c} for k, n, c in VIOLATION_TYPES],
        "collar": COLLAR,
        "neighbourhoods": {
            "label": "عينة من الأحياء المدرجة في قاعدة البيانات",
            "ranking_note": "أي ترتيب هو ضمن العينة المورّدة فقط، مع تسمية المقياس المرتب",
            "rows": [
                {"name": name, "sector": sec, "building": b, "operational": o,
                 "beds": beds, "violations": viol}
                for name, sec, b, o, beds, viol in NEIGHBOURHOODS
            ],
        },
        "scenarios": {
            "title": "سيناريوهات العجز المتوقع في الطاقة الاستيعابية (بعدد الأسرّة)، سبتمبر 2026–يونيو 2027",
            "caveat": "سيناريوهات العجز المورّدة في ملف البيانات — لا تمثل نموذج تنبؤ معتمداً؛ "
                      "تُعتمد بعد توثيق الافتراضات ومالك النموذج وإصداره وطريقة التحديث.",
            "status": "supplied_unvalidated",
            "unit": "سرير",
            "rows": [
                {"iso": iso, "label": label, "conservative": cons, "base": base, "optimistic": opt}
                for iso, label, cons, base, opt in DEFICIT_SCENARIOS
            ],
        },
        "compliance": {
            "value": COMPLIANCE_RATE_SUPPLIED,
            "unit": "٪",
            "label": "معدل الامتثال في الجولات الرقابية",
            "status": "pending_methodology",
            "note": "قيمة مورّدة في ملف البيانات؛ يلزم اعتماد البسط والمقام ومعالجة تعدد "
                    "المخالفات في الزيارة الواحدة قبل عرضها كمؤشر معتمد.",
        },
        "coverage_target_indicative": {
            "value": COVERAGE_TARGET_INDICATIVE,
            "unit": "٪",
            "label": "هدف نسبة التغطية الاسترشادي",
            "status": "indicative_not_approved",
            "note": "قيمة استرشادية من الورقة؛ لا تُعرض كمستهدف إلزامي قبل اعتماد تعريفه وحوكمته.",
        },
        "strategy": {
            "status": "approved_source_mirror",
            "required_pillars": len(STRATEGY_PILLARS),
            "source": STRATEGY_SOURCE,
            "note": "المحاور والمبادرات والمؤشرات منقولة حرفياً من المصدر المعتمد "
                    "بتوجيه العميل؛ لا حقل مُختلق — الحقول الغائبة في المصدر تبقى فارغة.",
            "pillars": [
                {"id": pid, "kind": kind, "name": name}
                for pid, kind, name in STRATEGY_PILLARS
            ],
            "initiatives": [
                {"id": iid, "pillar_id": pid, "name": name,
                 "start": start, "end": end, "status": status}
                for iid, pid, name, start, end, status in INITIATIVES
            ],
            "status_vocabulary": INITIATIVE_STATUS_VOCAB,
            "status_rule": INITIATIVE_STATUS_RULE,
            "kpis": [
                {"id": kid, "name": name, "type": ktype,
                 "baseline": baseline, "target": target, "pct": pct,
                 "current": None,
                 "current_note": "تُسجَّل القيم الحالية من داخل المنصة — غير متوفرة بعد"}
                for kid, name, ktype, baseline, target, pct in KPIS
            ],
            "weights_rule": None,
        },
        "insight_panels": {
            "note": "لوحات رؤى افتراضية لكل قسم — قابلة للتحرير من الإدارة؛ "
                    "أرقامها تخضع لبوابة مجمع الحقائق ذاتها",
            "sections": {
                sec: [{"id": pid, "cls": cls, "title": title, "text": text,
                       "status": "approved_brief"}
                      for pid, cls, title, text in panels]
                for sec, panels in INSIGHT_PANELS.items()
            },
        },
        "next_steps": {
            "status": "pending_approval",
            "note": "لا خطوات معتمدة بعد؛ تُدار من الإدارة ولا تُنشر خطوات ملفّقة.",
            "items": [],
        },
        "insights": {
            "s03": {
                "text": "لا تغطي الطاقة الاستيعابية المرخصة سوى 43.1٪ من الطلب التقديري الحالي",
                "metric_ids": ["coverage_pct"],
                "status": "approved_brief",
            },
            "s04": {
                "text": "يسجل قطاع الجنوب أعلى طلب على الأسرّة بواقع 368 ألف سرير، وأدنى نسبة "
                        "لتغطية الطلب عند 34.8٪، بينما يسجل قطاع الشرق أعلى نسبة تغطية عند 52.1٪",
                "metric_ids": ["sector_derived.south.coverage_pct", "sector_derived.east.coverage_pct"],
                "status": "approved_brief",
            },
            "s05": {
                "text": "ارتفع عدد رخص البناء 50.0٪ منذ خط الأساس، مقابل نمو 8.6٪ في الطاقة "
                        "الاستيعابية المرخصة",
                "metric_ids": ["growth_building_pct", "growth_beds_pct"],
                "status": "approved_brief",
            },
            "s06": {
                "text": "يتصدر قطاع الشرق رخص البناء (26 رخصة)، والرخص التشغيلية (34 رخصة)، "
                        "والطاقة الاستيعابية المرخصة (172,400 سرير). ويسجل قطاع الوسط أدنى عدد من "
                        "رخص البناء (12 رخصة)، بينما يسجل قطاع الغرب أدنى عدد من الرخص التشغيلية "
                        "(22 رخصة) وأدنى طاقة استيعابية (88,000 سرير).",
                "metric_ids": ["rankings"],
                "status": "approved_brief",
            },
            "s07": {
                "text": "سجّل قطاع الجنوب 1,367 مخالفة خلال الفترة المرجعية، بما يمثل 37.8٪ من "
                        "إجمالي مخالفات المدينة، ويبلغ عدد المراقبين فيه 3",
                "metric_ids": ["south_violations", "south_violations_share_pct"],
                "status": "approved_brief",
            },
        },
        "quarantine": {
            "inspector_level_records": {
                "reason": "تعارض مع الإجماليات المعتمدة (R1) — سجل المنصة التشغيلي "
                          "(37,322 زيارة / 7,409 مخالفات) يخالف الإجماليات المعتمدة "
                          "(19,651 / 3,617)؛ يُعرض في ملحق الرقابة فقط بوسم "
                          "«قيد المطابقة» ولا يظهر في المشاهد الرئيسة",
            },
        },
        "quarantine_resolved": {
            "hotspots": {
                "resolution": "R2 محسوم: المصدر طبقة بيانات المنصة الأصلية "
                              "(context.hotspots)، والإحداثيات حُوّلت جغرافياً بمواءمة "
                              "أفينية بقاياها ≤6م — الطبقة في data/riyadh-geo.json "
                              "بوسم «مواقع توضيحية من سجل المنصة»",
                "count": 40,
            },
        },
        "validation": {"gates_passed": 0, "gates_total": 0, "checked_at": "2026-08-16"},
    }

    release["validation"]["gates_total"] = len(_CHECKS)
    release["validation"]["gates_passed"] = sum(1 for c in _CHECKS if c["ok"])
    release["release"]["sha256"] = canonical_hash(
        {k: v for k, v in release.items() if k not in ("release", "validation")})
    return release


def build_workbook_manifest():
    """بيان المحلل V1: المراسي المبيضة حرفياً لملف platform-data.xlsx (القسم 15)."""
    return {
        "template_version": TEMPLATE_VERSION,
        "accept": {"extensions": [".xlsx"], "reject": ["macro-enabled", "encrypted",
                                                       "external-links", "unknown-template"]},
        "limits": {"max_bytes": 5_000_000, "max_sheets": 12, "max_rows_per_sheet": 400},
        "required_sheets": ["تعليمات", "الطلب", "التراخيص", "الرقابة", "الأحياء", "السياق"],
        "anchors": {
            "الطلب": {
                "total_demand": {"cell": "C4", "type": "int", "min": 0},
                "sector_table": {"range": "B7:C11", "labels_col": "B",
                                  "expected_labels": [SECTOR_NAMES[s] for s in SECTOR_ORDER]},
            },
            "التراخيص": {
                "baseline": {"range": "C5:E5", "type": "int"},
                "monthly": {"range": "B8:E19", "months": 12, "consecutive": True},
                "sector_table": {"range": "B23:E27",
                                  "expected_labels": [SECTOR_NAMES[s] for s in SECTOR_ORDER]},
                "coverage_target": {"cell": "C31", "type": "number", "status": "indicative"},
            },
            "الرقابة": {
                "sector_table": {"range": "B5:F9",
                                  "expected_labels": [SECTOR_NAMES[s] for s in SECTOR_ORDER]},
                "compliance_rate": {"cell": "C12", "type": "number",
                                     "status": "pending_methodology"},
                "violation_types": {"range": "B15:C20", "count": 6},
            },
            "الأحياء": {
                "sample_table": {"range": "B5:G24", "count": 20,
                                  "note": "عينة — لا تتجاوز إجماليات القطاع"},
            },
            "السياق": {
                "occupied_beds": {"cell": "C4", "type": "int"},
                "as_of": {"cell": "C5", "type": "text"},
                "calc_date": {"cell": "C6", "type": "date"},
                "facility_types": {"range": "B9:C11", "count": 3},
                "collar": {"range": "C15:C16"},
                "economic_activities": {"range": "B20:C25", "count": 6},
                "monthly_monitoring": {"range": "B30:D41", "months": 12, "consecutive": True},
                "scenarios": {"range": "B46:E55", "months": 10, "consecutive": True,
                               "ordering": "conservative>=base>=optimistic"},
            },
        },
        "normalization": {
            "unicode": "NFC",
            "whitespace": "strip + collapse-internal",
            "accepted_variants": {"بدون ترخيص": "دون ترخيص"},
        },
        "ignore": ["formula-cells", "cached-formula-results", "check-cells (✓)"],
    }


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--check", action="store_true", help="تحقق فقط دون كتابة ملفات")
    args = ap.parse_args()

    release = build_release()
    manifest = build_workbook_manifest()

    ok = sum(1 for c in _CHECKS if c["ok"])
    print(f"✓ اجتازت {ok}/{len(_CHECKS)} بوابة مطابقة")
    print(f"  الإصدار: {release['release']['id']}  sha256={release['release']['sha256'][:16]}…")

    if not args.check:
        os.makedirs(os.path.join(HERE, "data"), exist_ok=True)
        with open(os.path.join(HERE, "data", "release.json"), "w", encoding="utf-8") as f:
            json.dump(release, f, ensure_ascii=False, indent=1)
        with open(os.path.join(HERE, "data", "workbook_manifest.json"), "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=1)
        with open(os.path.join(HERE, "data", "validation_log.json"), "w", encoding="utf-8") as f:
            json.dump(_CHECKS, f, ensure_ascii=False, indent=1)
        print("✓ كُتب: data/release.json · data/workbook_manifest.json · data/validation_log.json")


if __name__ == "__main__":
    main()
