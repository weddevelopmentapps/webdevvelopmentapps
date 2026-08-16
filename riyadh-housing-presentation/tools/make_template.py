#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
tools/make_template.py — مولّد قالب platform-data.template.xlsx
===============================================================

يبني قالباً فارغ القيم (صفر للأرقام، فراغ للنصوص) بنفس مراسي وتسميات
البيان data/workbook_manifest.json — البيان هو المصدر الوحيد لمواقع الخلايا
وتسميات القطاعات، لا نسخ يدوي من أي ورقة خاصة.

الخصائص:
  • كل الخلايا القابلة للتعديل ملوّنة أصفر (بنص أزرق) — ما عداها لا يُمس.
  • خلية template_version في ورقة «تعليمات» تساوي إصدار البيان (V1) ليتعرف
    عليها tools/import_workbook.py.
  • كل مرساة تسبقها لافتة صغيرة باسمها في البيان ونوعها/قيدها (اشتقاق حرفي).

التشغيل:
  python3 tools/make_template.py [--out data/platform-data.template.xlsx]
  رمز الخروج: 0 عند النجاح، 1 عند أي فشل.
"""

import argparse
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
MANIFEST_PATH = os.path.join(ROOT, "data", "workbook_manifest.json")
DEFAULT_OUT = os.path.join(ROOT, "data", "platform-data.template.xlsx")

# مفاتيح القطاعات بترتيب تسميات البيان (نفس واجهة import_workbook.py)
SECTOR_KEYS = ["north", "east", "center", "west", "south"]

# عدد أعمدة النص في بداية كل جدول بلا expected_labels (عمود التسمية/الاسم؛
# جدول الأحياء يضيف عمود القطاع) — معرفة واجهة تعكس import_workbook.py.
TEXT_COLS = {"sample_table": 2}


def _bounds(rng):
    from openpyxl.utils import range_boundaries, get_column_letter
    mc, mr, xc, xr = range_boundaries(rng)
    return [get_column_letter(c) for c in range(mc, xc + 1)], mr, xr


def build(manifest):
    import openpyxl
    from openpyxl.styles import Alignment, Font, PatternFill

    fill_edit = PatternFill("solid", fgColor="FFFFF3B0")     # أصفر = قابل للتعديل
    font_edit = Font(color="FF1F4E79")                        # نص أزرق
    font_head = Font(bold=True, size=13)
    font_cap = Font(italic=True, size=9, color="FF8C8C8C")    # لافتة مرساة
    wrap = Alignment(wrap_text=False, vertical="center")

    wb = openpyxl.Workbook()
    wb.remove(wb.active)
    sheets = {}
    for name in manifest["required_sheets"]:
        ws = wb.create_sheet(title=name)
        ws.sheet_view.rightToLeft = True
        ws.column_dimensions["A"].width = 3
        ws.column_dimensions["B"].width = 44
        for col in ("C", "D", "E", "F", "G"):
            ws.column_dimensions[col].width = 16
        sheets[name] = ws

    def edit(ws, addr, value):
        c = ws[addr]
        c.value = value
        c.fill = fill_edit
        c.font = font_edit
        c.alignment = wrap

    def caption(ws, addr, text):
        c = ws[addr]
        if c.value is None:
            c.value = text
            c.font = font_cap

    def spec_caption(key, spec):
        bits = [key]
        if spec.get("type"):
            bits.append(spec["type"])
        if spec.get("min") is not None:
            bits.append("≥ %s" % spec["min"])
        if spec.get("count"):
            bits.append("count=%s" % spec["count"])
        if spec.get("months"):
            bits.append("months=%s" % spec["months"])
        if spec.get("consecutive"):
            bits.append("متتابعة")
        if spec.get("ordering"):
            bits.append(spec["ordering"])
        if spec.get("status"):
            bits.append(spec["status"])
        if spec.get("note"):
            bits.append(spec["note"])
        return "⌖ " + " — ".join(str(b) for b in bits)

    # ── ورقة «تعليمات» (البيان مصدر كل الأرقام فيها) ──
    lim = manifest["limits"]
    ins = sheets[manifest["required_sheets"][0]]
    ins["B2"] = "قالب بيانات منصة السكن الجماعي للأفراد — مدينة الرياض"
    ins["B2"].font = font_head
    ins["B4"] = ("طريقة الاستخدام: عدِّل القيم في الخلايا الصفراء فقط (نص أزرق)، "
                 "ثم مرِّر الملف عبر tools/import_workbook.py قبل أي نشر.")
    ins["B5"] = ("لا تنقل الخلايا ولا تضف أو تحذف صفوفاً — مواقع المراسي ثابتة "
                 "حسب البيان data/workbook_manifest.json.")
    ins["B6"] = "لا صيغ في الخلايا الصفراء: أدخل أرقاماً خاماً غير سالبة وتسميات نصية خاماً."
    ins["B7"] = ("تسميات الأشهر تُكتب مثل «سبتمبر 2025» وبتتابع شهري دون فجوات "
                 "حيث يحدد البيان ذلك.")
    ins["B9"] = ("حدود القالب: الحجم ≤ %d بايت، الأوراق ≤ %d، الصفوف ≤ %d لكل ورقة. "
                 "يُرفض الماكرو والتشفير والروابط الخارجية."
                 % (lim["max_bytes"], lim["max_sheets"], lim["max_rows_per_sheet"]))
    ins["B10"] = "الأوراق الإلزامية: " + "، ".join(manifest["required_sheets"])
    ins["B12"] = "إصدار القالب — لا تعدل الخلية المجاورة:"
    ins["C12"] = manifest["template_version"]
    ins["C12"].font = font_head

    # ── أوراق البيانات: توليد المراسي من البيان حرفياً ──
    for sheet_name, anchors in manifest["anchors"].items():
        ws = sheets[sheet_name]
        for key, spec in anchors.items():
            if "cell" in spec:
                addr = spec["cell"]
                col = "".join(ch for ch in addr if ch.isalpha())
                row = int("".join(ch for ch in addr if ch.isdigit()))
                edit(ws, addr, None if spec.get("type") in ("text", "date") else 0)
                if col != "B":
                    caption(ws, "B%d" % row, spec_caption(key, spec))
                continue

            cols, r0, r1 = _bounds(spec["range"])
            caption(ws, "%s%d" % (cols[0], r0 - 1), spec_caption(key, spec))
            expected = spec.get("expected_labels")
            if expected:
                lcol = spec.get("labels_col", cols[0])
                vcols = [c for c in cols if c != lcol]
                for i, label in enumerate(expected):
                    row = r0 + i
                    ws["%s%d" % (lcol, row)] = label       # مرساة ثابتة — لا تُلوَّن
                    for vc in vcols:
                        edit(ws, "%s%d" % (vc, row), 0)
            else:
                if spec.get("type") in ("int", "number") or len(cols) == 1:
                    n_text = 0        # نطاق رقمي بالكامل حسب نوع البيان
                else:
                    n_text = TEXT_COLS.get(key, 1)
                for row in range(r0, r1 + 1):
                    for i, colletter in enumerate(cols):
                        if i < n_text:
                            edit(ws, "%s%d" % (colletter, row), None)   # اسم/تسمية
                        else:
                            edit(ws, "%s%d" % (colletter, row), 0)      # قيمة رقمية
    return wb


def verify(path, manifest):
    """يفتح الملف الناتج ويتأكد من الأوراق وخلية الإصدار وعدد الخلايا الصفراء."""
    import openpyxl
    wb = openpyxl.load_workbook(path)
    problems = []
    if wb.sheetnames != manifest["required_sheets"]:
        problems.append("أوراق الناتج لا تطابق البيان: %s" % wb.sheetnames)
    ins = wb[manifest["required_sheets"][0]]
    if ins["C12"].value != manifest["template_version"]:
        problems.append("خلية إصدار القالب غير صحيحة: %r" % ins["C12"].value)
    yellow = 0
    for ws in wb.worksheets:
        for row in ws.iter_rows():
            for c in row:
                if c.fill is not None and c.fill.patternType == "solid" \
                        and c.fill.fgColor.rgb == "FFFFF3B0":
                    yellow += 1
    if yellow == 0:
        problems.append("لا خلايا صفراء قابلة للتعديل في الناتج")
    return problems, yellow


def main(argv=None):
    ap = argparse.ArgumentParser(
        description="يولّد قالب platform-data.template.xlsx فارغ القيم من "
                    "data/workbook_manifest.json حرفياً")
    ap.add_argument("--out", default=DEFAULT_OUT,
                    help="مسار ملف القالب الناتج (الافتراضي: data/platform-data.template.xlsx)")
    args = ap.parse_args(argv)

    try:
        with open(MANIFEST_PATH, encoding="utf-8") as f:
            manifest = json.load(f)
    except (OSError, ValueError) as e:
        print("تعذر قراءة البيان %s: %s" % (MANIFEST_PATH, e), file=sys.stderr)
        return 1

    wb = build(manifest)
    out_dir = os.path.dirname(os.path.abspath(args.out))
    os.makedirs(out_dir, exist_ok=True)
    wb.save(args.out)

    problems, yellow = verify(args.out, manifest)
    if problems:
        print("✗ فشل التحقق من القالب الناتج:", file=sys.stderr)
        for p in problems:
            print("  • " + p, file=sys.stderr)
        return 1
    print("✓ كُتب القالب: %s (إصدار %s، %d خلية قابلة للتعديل)"
          % (args.out, manifest["template_version"], yellow))
    return 0


if __name__ == "__main__":
    sys.exit(main())
