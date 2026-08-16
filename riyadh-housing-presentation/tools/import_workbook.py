#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
tools/import_workbook.py — خط الاستيراد الموثوق لملف platform-data.xlsx
=======================================================================

المسار الذي يُعاد عبره التحليل والتحقق قبل أي نشر (مرآة خادمية لمستورد
المتصفح src/js/data/import-xlsx.js — المتصفح «معاينة» وهذا هو الحكم).

المبادئ:
  1. البيان data/workbook_manifest.json يُطبَّق حرفياً: القبول والرفض والحدود
     والمراسي والتطبيع — لا مرساة ولا حدّ مكتوبين هنا خارج البيان.
  2. openpyxl بوضع data_only=False: تُقرأ القيم الخام فقط؛ أي خلية مرساة
     تحمل صيغة تُرفض (البيان يمنع الصيغ في المراسي). خلايا الصيغ خارج
     المراسي (المجاميع وخلايا ✓) تُتجاهل ولا يُوثق بها.
  3. كل فحوص الاتساق تُعاد من الخام — مستنسخة من بوابات generate_data.py:
     المجاميع الكبرى، سلاسل خط الأساس، الأحياء ≤ القطاع، ترتيب
     السيناريوهات، تتابع الأشهر.
  4. الإخراج JSON حتمي بايتاً-ببايت لنفس الملف (مفاتيح مرتبة، لا طوابع زمنية).

التشغيل:
  python3 tools/import_workbook.py <workbook.xlsx> [--out data/import_preview.json] [--strict]
  --strict: معاملة التحذيرات كأخطاء (يفشل التشغيل عند أي تحذير).
  رمز الخروج: 0 عند النجاح، 1 عند أي خطأ.
"""

import argparse
import hashlib
import io
import json
import os
import re
import sys
import unicodedata
import zipfile

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
MANIFEST_PATH = os.path.join(ROOT, "data", "workbook_manifest.json")
DEFAULT_OUT = os.path.join(ROOT, "data", "import_preview.json")

# مفاتيح القطاعات بترتيب تسميات البيان (واجهة ثابتة تعكس import-xlsx.js)
SECTOR_KEYS = ["north", "east", "center", "west", "south"]

AR_MONTHS = {
    "يناير": 1, "فبراير": 2, "مارس": 3, "أبريل": 4, "مايو": 5, "يونيو": 6,
    "يوليو": 7, "أغسطس": 8, "سبتمبر": 9, "أكتوبر": 10, "نوفمبر": 11, "ديسمبر": 12,
}

OLE_MAGIC = b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1"   # حاوية OLE — ملفات Office المشفرة/القديمة


def _norm(s):
    """تطبيع البيان: NFC + قصّ الأطراف + طيّ الفراغات الداخلية."""
    if s is None:
        return ""
    s = unicodedata.normalize("NFC", str(s))
    return re.sub(r"\s+", " ", s).strip()


def _consecutive(isos):
    for a, b in zip(isos, isos[1:]):
        ya, ma = map(int, a.split("-"))
        yb, mb = map(int, b.split("-"))
        if ya * 12 + ma + 1 != yb * 12 + mb:
            return False
    return True


def _parse_month_label(label):
    """«سبتمبر 2025» → ‎2025-09؛ يعيد None عند تعذر القراءة."""
    parts = _norm(label).split(" ")
    if len(parts) != 2:
        return None
    month = AR_MONTHS.get(unicodedata.normalize("NFC", parts[0]))
    if not month or not re.fullmatch(r"\d{4}", parts[1]):
        return None
    return "%04d-%02d" % (int(parts[1]), month)


def _range_bounds(rng):
    """يفكك «B8:E19» → (min_col, min_row, max_col, max_row) بأعمدة كحروف."""
    from openpyxl.utils import range_boundaries, get_column_letter
    mc, mr, xc, xr = range_boundaries(rng)
    return [get_column_letter(c) for c in range(mc, xc + 1)], mr, xr


def _is_formula(cell):
    if cell is None:
        return False
    if getattr(cell, "data_type", None) == "f":
        return True
    v = cell.value
    try:
        from openpyxl.worksheet.formula import ArrayFormula
        if isinstance(v, ArrayFormula):
            return True
    except ImportError:
        pass
    return isinstance(v, str) and v.startswith("=")


class Importer:
    def __init__(self, path, manifest):
        self.path = path
        self.manifest = manifest
        self.errors = []
        self.warnings = []
        self.data = None            # بايتات الملف
        self.sheets = {}            # الاسم المطبَّع → ورقة openpyxl
        self.template_version = None
        variants = manifest.get("normalization", {}).get("accepted_variants", {})
        self._variants = [(_norm(k), _norm(v)) for k, v in variants.items()]

    # ── التطبيع ──
    def canon(self, s):
        """تطبيع + تطبيق المرادفات المقبولة من البيان (مثل «بدون»→«دون»)."""
        t = _norm(s)
        for a, b in self._variants:
            t = t.replace(a, b)
        return t

    # ── 1) فحوص الملف والأرشيف (قبل أي تحليل محتوى) ──
    def check_file(self):
        name = os.path.basename(self.path)
        exts = tuple(e.lower() for e in self.manifest["accept"]["extensions"])
        reject = set(self.manifest["accept"].get("reject", []))
        lim = self.manifest["limits"]

        if not name.lower().endswith(exts):
            self.errors.append("يُقبل ملف بامتداد ‎.xlsx فقط — رُفض: " + name)
        if not os.path.isfile(self.path):
            self.errors.append("الملف غير موجود: " + self.path)
            return
        with open(self.path, "rb") as f:
            self.data = f.read()
        if len(self.data) > lim["max_bytes"]:
            self.errors.append(
                "حجم الملف (%d بايت) يتجاوز حد القالب (%d بايت)"
                % (len(self.data), lim["max_bytes"]))
        if self.errors:
            return

        if not zipfile.is_zipfile(io.BytesIO(self.data)):
            if "encrypted" in reject and self.data.startswith(OLE_MAGIC):
                self.errors.append(
                    "رُفض: الملف مشفَّر بكلمة مرور أو بصيغة Office قديمة (حاوية OLE) — "
                    "أرسل ملف ‎.xlsx غير مشفَّر")
            else:
                self.errors.append("الملف ليس ملف XLSX سليماً (بنية ZIP تالفة)")
            return
        zf = zipfile.ZipFile(io.BytesIO(self.data))
        names = zf.namelist()
        for entry in names:
            if "macro-enabled" in reject and re.search(r"vbaProject", entry, re.I):
                self.errors.append("رُفض: الملف يحتوي وحدات ماكرو (vbaProject) — القالب يمنع الماكرو")
            if "external-links" in reject and entry.startswith("xl/externalLinks/"):
                self.errors.append("رُفض: الملف يحتوي روابط خارجية (xl/externalLinks)")
            if entry.startswith("..") or "\\" in entry or entry.startswith("/"):
                self.errors.append("رُفض: مسار داخلي مشبوه في الأرشيف: " + entry)
        if "encrypted" in reject and "EncryptionInfo" in names:
            self.errors.append("رُفض: الملف مشفَّر (EncryptionInfo)")
        if "[Content_Types].xml" not in names:
            self.errors.append("رُفض: الملف ليس بصيغة Office المفتوحة ([Content_Types].xml مفقود)")

    # ── 2) فتح الورقة وفحص البنية ──
    def load(self):
        import openpyxl
        try:
            wb = openpyxl.load_workbook(io.BytesIO(self.data), data_only=False)
        except Exception as e:  # noqa: BLE001 — أي فشل فتح = ملف مرفوض
            self.errors.append("تعذر فتح الملف كمصنف XLSX: " + str(e))
            return
        lim = self.manifest["limits"]
        if len(wb.sheetnames) > lim["max_sheets"]:
            self.errors.append(
                "عدد الأوراق (%d) يتجاوز حد القالب (%d)"
                % (len(wb.sheetnames), lim["max_sheets"]))
        for ws in wb.worksheets:
            self.sheets[_norm(ws.title)] = ws
            if ws.max_row > lim["max_rows_per_sheet"]:
                self.errors.append(
                    "ورقة «%s» تتجاوز حد الصفوف (%d من %d)"
                    % (_norm(ws.title), ws.max_row, lim["max_rows_per_sheet"]))
        required = self.manifest["required_sheets"]
        for req in required:
            if _norm(req) not in self.sheets:
                self.errors.append("ورقة إلزامية مفقودة: «%s»" % req)
        extra = [n for n in self.sheets
                 if not any(_norm(r) == n for r in required)]
        if extra:
            self.warnings.append("أوراق زائدة عن القالب (ستُتجاهل): " + "، ".join(extra))

    # ── 3) هوية القالب: خلية template_version في ورقة «تعليمات» إن وُجدت ──
    def check_template_version(self):
        expected = self.manifest["template_version"]
        ws = self.sheets.get(_norm("تعليمات"))
        if ws is None:
            return  # سبق تسجيل «ورقة إلزامية مفقودة»
        found = None
        for row in ws.iter_rows():
            for c in row:
                if c.value is None or _is_formula(c):
                    continue
                t = _norm(c.value)
                if re.fullmatch(r"V\d+(?:\.\d+)*", t):
                    found = t
                    break
            if found:
                break
        if found is None:
            self.warnings.append(
                "لا توجد خلية إصدار قالب في ورقة «تعليمات» — قُبل الملف بعد مطابقة "
                "كل مراسي %s بنيوياً" % expected)
            self.template_version = expected
        elif found != expected:
            self.errors.append(
                "رُفض: قالب غير معروف — إصدار القالب في الملف «%s» والمدعوم «%s»"
                % (found, expected))
            self.template_version = found
        else:
            self.template_version = found

    # ── قراءة الخلايا الخام ──
    def _cell(self, sheet, addr):
        ws = self.sheets.get(_norm(sheet))
        return ws[addr] if ws is not None else None

    def _reject_formula(self, sheet, addr):
        c = self._cell(sheet, addr)
        if _is_formula(c):
            self.errors.append(
                "الخلية %s!%s تحتوي صيغة «%s» — البيان %s يمنع الصيغ في خلايا "
                "المراسي؛ أدخل القيمة الخام" % (sheet, addr, _norm(c.value),
                                                self.manifest["template_version"]))
            return True
        return False

    def as_int(self, sheet, addr):
        """عدد صحيح غير سالب إلزامي — رسائل عربية دقيقة بالخلية والورقة."""
        label = "%s!%s" % (sheet, addr)
        if self._reject_formula(sheet, addr):
            return None
        c = self._cell(sheet, addr)
        v = None if c is None else c.value
        if v is None or (isinstance(v, str) and _norm(v) == ""):
            self.errors.append("خلية إلزامية فارغة: %s — أدخل رقماً خاماً" % label)
            return None
        if isinstance(v, bool):
            self.errors.append("قيمة غير رقمية في %s: '%s' — أدخل رقماً خاماً" % (label, v))
            return None
        if isinstance(v, str):
            try:
                v = float(v.strip())
            except ValueError:
                self.errors.append(
                    "قيمة غير رقمية في %s: '%s' — أدخل رقماً خاماً" % (label, _norm(c.value)))
                return None
        if isinstance(v, float):
            if not v.is_integer():
                self.errors.append(
                    "قيمة غير صحيحة العدد في %s: %s — المطلوب عدد صحيح" % (label, c.value))
                return None
            v = int(v)
        if v < 0:
            self.errors.append("قيمة سالبة مرفوضة في %s: %d" % (label, v))
            return None
        return v

    def as_number(self, sheet, addr, what):
        """رقم غير سالب اختياري (نسب مورّدة) — فراغه تحذير لا خطأ."""
        label = "%s!%s" % (sheet, addr)
        if self._reject_formula(sheet, addr):
            return None
        c = self._cell(sheet, addr)
        v = None if c is None else c.value
        if v is None or (isinstance(v, str) and _norm(v) == ""):
            self.warnings.append("قيمة %s فارغة في %s" % (what, label))
            return None
        if isinstance(v, bool):
            self.errors.append("قيمة غير رقمية في %s: '%s' — أدخل رقماً خاماً" % (label, v))
            return None
        if isinstance(v, str):
            try:
                v = float(v.strip())
            except ValueError:
                self.errors.append(
                    "قيمة غير رقمية في %s: '%s' — أدخل رقماً خاماً" % (label, _norm(c.value)))
                return None
        v = float(v)
        if v < 0:
            self.errors.append("قيمة سالبة مرفوضة في %s: %s" % (label, c.value))
            return None
        return int(v) if float(v).is_integer() else v

    def as_text(self, sheet, addr):
        if self._reject_formula(sheet, addr):
            return ""
        c = self._cell(sheet, addr)
        return self.canon(None if c is None else c.value)

    def check_label(self, sheet, addr, expected):
        """مطابقة تسمية مرساة بعد التطبيع — أي انزياح = مرساة منقولة."""
        if self._reject_formula(sheet, addr):
            return
        got = self.as_text(sheet, addr)
        if got != self.canon(expected):
            self.errors.append(
                "مرساة منقولة: %s!%s — المتوقع «%s» والموجود «%s»"
                % (sheet, addr, expected, got or "فارغ"))

    def month_row(self, sheet, addr):
        """تسمية شهر عربية إلزامية؛ تعيد (label, iso)."""
        label = self.as_text(sheet, addr)
        iso = _parse_month_label(label)
        if iso is None:
            self.errors.append(
                "تعذر قراءة تسمية الشهر في %s!%s: '%s' — الصيغة المتوقعة مثل "
                "«سبتمبر 2025»" % (sheet, addr, label or "فارغ"))
        return label, iso

    # ── 4) الاستخراج بالمراسي (كل موقع من البيان حرفياً) ──
    def extract(self):
        A = self.manifest["anchors"]
        X = {"sectors": {k: {} for k in SECTOR_KEYS}, "monthly": {}}

        # ورقة «الطلب»
        sh = "الطلب"
        dem = A[sh]
        X["total_demand"] = self.as_int(sh, dem["total_demand"]["cell"])
        cols, r0, r1 = _range_bounds(dem["sector_table"]["range"])
        lcol = dem["sector_table"].get("labels_col", cols[0])
        vcol = [c for c in cols if c != lcol][0]
        labels = dem["sector_table"]["expected_labels"]
        sector_label_to_key = {self.canon(labels[i]): SECTOR_KEYS[i]
                               for i in range(len(SECTOR_KEYS))}
        for i, sec in enumerate(SECTOR_KEYS):
            row = r0 + i
            self.check_label(sh, "%s%d" % (lcol, row), labels[i])
            X["sectors"][sec]["demand"] = self.as_int(sh, "%s%d" % (vcol, row))

        # ورقة «التراخيص»
        sh = "التراخيص"
        lic = A[sh]
        cols, r0, _r1 = _range_bounds(lic["baseline"]["range"])
        X["baseline"] = {
            key: self.as_int(sh, "%s%d" % (cols[i], r0))
            for i, key in enumerate(("building", "operational", "beds"))
        }
        cols, r0, r1 = _range_bounds(lic["monthly"]["range"])
        X["monthly"]["licensing"] = []
        for row in range(r0, r1 + 1):
            label, iso = self.month_row(sh, "%s%d" % (cols[0], row))
            X["monthly"]["licensing"].append({
                "label": label, "iso": iso,
                "building": self.as_int(sh, "%s%d" % (cols[1], row)),
                "operational": self.as_int(sh, "%s%d" % (cols[2], row)),
                "beds": self.as_int(sh, "%s%d" % (cols[3], row)),
            })
        cols, r0, r1 = _range_bounds(lic["sector_table"]["range"])
        for i, sec in enumerate(SECTOR_KEYS):
            row = r0 + i
            self.check_label(sh, "%s%d" % (cols[0], row),
                             lic["sector_table"]["expected_labels"][i])
            X["sectors"][sec]["building"] = self.as_int(sh, "%s%d" % (cols[1], row))
            X["sectors"][sec]["operational"] = self.as_int(sh, "%s%d" % (cols[2], row))
            X["sectors"][sec]["beds"] = self.as_int(sh, "%s%d" % (cols[3], row))
        X["coverage_target"] = self.as_number(
            sh, lic["coverage_target"]["cell"], "هدف التغطية الاسترشادي")

        # ورقة «الرقابة»
        sh = "الرقابة"
        mon = A[sh]
        cols, r0, r1 = _range_bounds(mon["sector_table"]["range"])
        for i, sec in enumerate(SECTOR_KEYS):
            row = r0 + i
            self.check_label(sh, "%s%d" % (cols[0], row),
                             mon["sector_table"]["expected_labels"][i])
            X["sectors"][sec]["monitors"] = self.as_int(sh, "%s%d" % (cols[1], row))
            X["sectors"][sec]["violations"] = self.as_int(sh, "%s%d" % (cols[2], row))
            X["sectors"][sec]["visits"] = self.as_int(sh, "%s%d" % (cols[3], row))
            X["sectors"][sec]["closures"] = self.as_int(sh, "%s%d" % (cols[4], row))
        X["compliance"] = self.as_number(
            sh, mon["compliance_rate"]["cell"], "معدل الامتثال")
        cols, r0, r1 = _range_bounds(mon["violation_types"]["range"])
        X["violation_types"] = []
        for row in range(r0, r1 + 1):
            name = self.as_text(sh, "%s%d" % (cols[0], row))
            if not name:
                self.errors.append("تسمية نوع مخالفة فارغة في %s!%s%d" % (sh, cols[0], row))
            X["violation_types"].append({
                "name": name,
                "count": self.as_int(sh, "%s%d" % (cols[1], row)),
            })

        # ورقة «الأحياء» — عينة، لا حصر شامل
        sh = "الأحياء"
        cols, r0, r1 = _range_bounds(A[sh]["sample_table"]["range"])
        X["neighbourhoods"] = []
        for row in range(r0, r1 + 1):
            name = self.as_text(sh, "%s%d" % (cols[0], row))
            sector_name = self.as_text(sh, "%s%d" % (cols[1], row))
            if not name:
                self.errors.append("اسم حي فارغ في %s!%s%d" % (sh, cols[0], row))
            if sector_name not in sector_label_to_key:
                self.errors.append(
                    "قطاع غير معروف في %s!%s%d: «%s» — المتوقع أحد: %s"
                    % (sh, cols[1], row, sector_name or "فارغ", "، ".join(labels)))
            X["neighbourhoods"].append({
                "name": name,
                "sector_name": sector_name,
                "sector": sector_label_to_key.get(sector_name),
                "building": self.as_int(sh, "%s%d" % (cols[2], row)),
                "operational": self.as_int(sh, "%s%d" % (cols[3], row)),
                "beds": self.as_int(sh, "%s%d" % (cols[4], row)),
                "violations": self.as_int(sh, "%s%d" % (cols[5], row)),
            })

        # ورقة «السياق»
        sh = "السياق"
        ctx = A[sh]
        X["occupied_beds"] = self.as_int(sh, ctx["occupied_beds"]["cell"])
        X["data_as_of"] = self.as_text(sh, ctx["as_of"]["cell"])
        if not X["data_as_of"]:
            self.warnings.append("تاريخ البيانات (asOf) فارغ في %s!%s"
                                 % (sh, ctx["as_of"]["cell"]))
        X["calculation_date"] = self._read_calc_date(sh, ctx["calc_date"]["cell"])
        cols, r0, r1 = _range_bounds(ctx["facility_types"]["range"])
        X["facility_types"] = []
        for row in range(r0, r1 + 1):
            X["facility_types"].append({
                "name": self.as_text(sh, "%s%d" % (cols[0], row)),
                "count": self.as_int(sh, "%s%d" % (cols[1], row)),
            })
        cols, r0, r1 = _range_bounds(ctx["collar"]["range"])
        X["collar"] = {
            "blue": self.as_int(sh, "%s%d" % (cols[0], r0)),
            "white": self.as_int(sh, "%s%d" % (cols[0], r1)),
        }
        cols, r0, r1 = _range_bounds(ctx["economic_activities"]["range"])
        X["economic"] = []
        for row in range(r0, r1 + 1):
            X["economic"].append({
                "name": self.as_text(sh, "%s%d" % (cols[0], row)),
                "demand": self.as_int(sh, "%s%d" % (cols[1], row)),
            })
        cols, r0, r1 = _range_bounds(ctx["monthly_monitoring"]["range"])
        X["monthly"]["monitoring"] = []
        for row in range(r0, r1 + 1):
            label, iso = self.month_row(sh, "%s%d" % (cols[0], row))
            X["monthly"]["monitoring"].append({
                "label": label, "iso": iso,
                "visits": self.as_int(sh, "%s%d" % (cols[1], row)),
                "violations": self.as_int(sh, "%s%d" % (cols[2], row)),
            })
        cols, r0, r1 = _range_bounds(ctx["scenarios"]["range"])
        X["scenarios"] = []
        for row in range(r0, r1 + 1):
            label, iso = self.month_row(sh, "%s%d" % (cols[0], row))
            X["scenarios"].append({
                "label": label, "iso": iso,
                "conservative": self.as_int(sh, "%s%d" % (cols[1], row)),
                "base": self.as_int(sh, "%s%d" % (cols[2], row)),
                "optimistic": self.as_int(sh, "%s%d" % (cols[3], row)),
            })
        return X

    def _read_calc_date(self, sheet, addr):
        import datetime
        if self._reject_formula(sheet, addr):
            return ""
        c = self._cell(sheet, addr)
        v = None if c is None else c.value
        if isinstance(v, (datetime.datetime, datetime.date)):
            return str(v)[:10]
        t = _norm(v)
        if not t:
            self.warnings.append("تاريخ الاحتساب فارغ في %s!%s" % (sheet, addr))
        elif not re.fullmatch(r"\d{4}-\d{2}-\d{2}", t):
            self.warnings.append(
                "تنسيق تاريخ غير قياسي في %s!%s: '%s' — المتوقع YYYY-MM-DD"
                % (sheet, addr, t))
        return t

    # ── 5) فحوص الاتساق من الخام (استنساخ بوابات generate_data.py) ──
    def reconcile(self, X):
        A = self.manifest["anchors"]

        def recon(gate_id, label, ok, detail=""):
            if not ok:
                msg = "فشل فحص الاتساق [%s]: %s" % (gate_id, label)
                if detail:
                    msg += " — " + detail
                self.errors.append(msg)

        sec = [X["sectors"][k] for k in SECTOR_KEYS]

        def ssum(field):
            return sum(r[field] for r in sec)

        # المجاميع الكبرى
        recon("demand.sector_sum", "مجموع طلب القطاعات = إجمالي الطلب",
              ssum("demand") == X["total_demand"],
              "Σ=%d مقابل %d" % (ssum("demand"), X["total_demand"]))
        recon("demand.collar_sum", "الياقات الزرقاء + البيضاء = إجمالي الطلب",
              X["collar"]["blue"] + X["collar"]["white"] == X["total_demand"],
              "Σ=%d مقابل %d" % (X["collar"]["blue"] + X["collar"]["white"],
                                 X["total_demand"]))
        eco = sum(e["demand"] for e in X["economic"])
        recon("demand.economic_sum", "مجموع الأنشطة الاقتصادية = إجمالي الطلب",
              eco == X["total_demand"], "Σ=%d مقابل %d" % (eco, X["total_demand"]))
        vt = sum(t["count"] for t in X["violation_types"])
        recon("monitoring.violations_by_type",
              "مجموع أنواع المخالفات = مجموع مخالفات القطاعات",
              vt == ssum("violations"), "Σ=%d مقابل %d" % (vt, ssum("violations")))
        ft = sum(t["count"] for t in X["facility_types"])
        recon("licensing.facility_types", "مجموع أنواع الإيواء = الرخص التشغيلية",
              ft == ssum("operational"), "Σ=%d مقابل %d" % (ft, ssum("operational")))

        # سلاسل خط الأساس: خط الأساس + 12 إضافة شهرية = مجموع القطاعات
        for key, lab in (("building", "رخص البناء"),
                         ("operational", "الرخص التشغيلية"),
                         ("beds", "الأسرّة")):
            total = X["baseline"][key] + sum(m[key] for m in X["monthly"]["licensing"])
            recon("licensing.baseline_plus_monthly.%s" % key,
                  "خط الأساس + الإضافات الشهرية = مجموع القطاعات (%s)" % lab,
                  total == ssum(key),
                  "%d+Σشهري=%d مقابل Σقطاعات=%d"
                  % (X["baseline"][key], total, ssum(key)))

        # النشاط الشهري يطابق إجماليات الرقابة (المعاد حسابها من القطاعات)
        mv = sum(m["visits"] for m in X["monthly"]["monitoring"])
        recon("monitoring.monthly_visits", "مجموع الزيارات الشهرية = زيارات القطاعات",
              mv == ssum("visits"), "Σ=%d مقابل %d" % (mv, ssum("visits")))
        mx = sum(m["violations"] for m in X["monthly"]["monitoring"])
        recon("monitoring.monthly_violations",
              "مجموع المخالفات الشهرية = مخالفات القطاعات",
              mx == ssum("violations"), "Σ=%d مقابل %d" % (mx, ssum("violations")))

        # الإشغال
        recon("occupancy.not_exceeding", "الأسرّة المشغولة ≤ الطاقة المرخصة",
              X["occupied_beds"] <= ssum("beds"),
              "%d مقابل %d" % (X["occupied_beds"], ssum("beds")))

        # تتابع الأشهر (حسب البيان: consecutive)
        for gate_id, anchor, rows, lab in (
                ("licensing.months_consecutive", A["التراخيص"]["monthly"],
                 X["monthly"]["licensing"], "أشهر التراخيص"),
                ("monitoring.months_consecutive", A["السياق"]["monthly_monitoring"],
                 X["monthly"]["monitoring"], "أشهر النشاط الرقابي"),
                ("scenarios.months_consecutive", A["السياق"]["scenarios"],
                 X["scenarios"], "أشهر السيناريوهات")):
            if anchor.get("consecutive"):
                isos = [r["iso"] for r in rows]
                recon(gate_id, "تتابع %s دون فجوات" % lab, _consecutive(isos),
                      "التسلسل: %s" % " ← ".join(isos))

        # ترتيب السيناريوهات (حسب قاعدة البيان)
        if A["السياق"]["scenarios"].get("ordering") == "conservative>=base>=optimistic":
            bad = [r["label"] for r in X["scenarios"]
                   if not (r["conservative"] >= r["base"] >= r["optimistic"])]
            recon("scenarios.ordering", "ترتيب السيناريوهات: متحفظ ≥ أساسي ≥ متفائل",
                  not bad, "خلل في: " + "، ".join(bad) if bad else "")

        # الأحياء: أسماء فريدة + عينة كل قطاع ≤ إجمالي قطاعها
        names = [n["name"] for n in X["neighbourhoods"]]
        dupes = sorted({n for n in names if names.count(n) > 1})
        recon("nbhd.unique_names", "أسماء الأحياء فريدة", not dupes,
              "مكرر: " + "، ".join(dupes) if dupes else "")
        for i, sec_key in enumerate(SECTOR_KEYS):
            rows = [n for n in X["neighbourhoods"] if n["sector"] == sec_key]
            s = X["sectors"][sec_key]
            label = self.manifest["anchors"]["الطلب"]["sector_table"]["expected_labels"][i]
            for field, lab in (("building", "رخص البناء"),
                               ("operational", "الرخص التشغيلية"),
                               ("beds", "الأسرّة"), ("violations", "المخالفات")):
                total = sum(r[field] for r in rows)
                recon("nbhd.sample_le_sector.%s.%s" % (sec_key, field),
                      "عينة أحياء «%s» ≤ إجمالي القطاع (%s)" % (label, lab),
                      total <= s[field], "Σعينة=%d مقابل %d" % (total, s[field]))

    # ── التشغيل الكامل ──
    def run(self, strict=False):
        self.check_file()
        if not self.errors:
            self.load()
        if not self.errors:
            self.check_template_version()
        extracted = None
        if not self.errors:
            extracted = self.extract()
        if not self.errors and extracted is not None:
            self.reconcile(extracted)
        if strict and self.warnings and not self.errors:
            self.errors.append(
                "‏--strict: توجد %d تحذيرات عوملت كأخطاء" % len(self.warnings))
        ok = not self.errors
        return {
            "ok": ok,
            "errors": self.errors,
            "warnings": self.warnings,
            "file": {
                "name": os.path.basename(self.path),
                "sha256": hashlib.sha256(self.data).hexdigest() if self.data else None,
                "size": len(self.data) if self.data is not None else None,
                "template_version": self.template_version,
            },
            "extracted": extracted if ok else None,
        }


def main(argv=None):
    ap = argparse.ArgumentParser(
        description="خط الاستيراد الموثوق لملف platform-data.xlsx — "
                    "يطبق data/workbook_manifest.json حرفياً ويعيد كل الفحوص من الخام")
    ap.add_argument("workbook", help="مسار ملف ‎.xlsx المراد استيراده")
    ap.add_argument("--out", default=DEFAULT_OUT,
                    help="مسار ملف JSON الناتج (الافتراضي: data/import_preview.json)")
    ap.add_argument("--strict", action="store_true",
                    help="معاملة التحذيرات كأخطاء (رمز خروج 1 عند أي تحذير)")
    args = ap.parse_args(argv)

    try:
        with open(MANIFEST_PATH, encoding="utf-8") as f:
            manifest = json.load(f)
    except (OSError, ValueError) as e:
        print("تعذر قراءة البيان %s: %s" % (MANIFEST_PATH, e), file=sys.stderr)
        return 1

    result = Importer(args.workbook, manifest).run(strict=args.strict)
    # حتمية بايتاً-ببايت: مفاتيح مرتبة، لا طوابع زمنية، UTF-8 دون هروب
    payload = json.dumps(result, ensure_ascii=False, sort_keys=True, indent=1) + "\n"
    out_dir = os.path.dirname(os.path.abspath(args.out))
    os.makedirs(out_dir, exist_ok=True)
    with open(args.out, "w", encoding="utf-8") as f:
        f.write(payload)
    sys.stdout.write(payload)

    if result["ok"]:
        print("✓ نجح الاستيراد — كُتب: %s" % args.out, file=sys.stderr)
    else:
        print("✗ فشل الاستيراد (%d أخطاء) — انظر: %s"
              % (len(result["errors"]), args.out), file=sys.stderr)
        for msg in result["errors"]:
            print("  • " + msg, file=sys.stderr)
    return 0 if result["ok"] else 1


if __name__ == "__main__":
    sys.exit(main())
