# DATA_DICTIONARY.md — قاموس بيانات الإصدار المنشور

مرجع كل حقل في `data/release.json` كما يولّده `generate_data.py` فعلياً
(الإصدار المرجعي: `rel-2026-08-16-001`، `schema_version: 1.0.0`).

**قواعد عامة تسري على كل ما يلي:**

- **المصدر الوحيد للخام:** `platform-data.xlsx` (قالب `V1`)، المرساة = الورقة + الخلية،
  والملف نفسه خاص لا يُنشر — يُسجَّل هاشه فقط في `sources[0].sha256`.
- **الاشتقاق مركزي ومزدوج التنفيذ:** كل صيغة تُحسب في `generate_data.py` (بايثون،
  وقت البناء) وتُعاد حرفياً في `src/js/data/derive.js` (المتصفح)، وتُختبر بالتساوي.
  إصدار حزمة الصيغ الحالي: **`fv1`**.
- **التقريب:** نصف-لأعلى حتمي (`round_half_up` — لا banker's rounding)؛ النسب بمنزلة
  عشرية واحدة للعرض؛ **الترتيب والمقارنات على القيم غير المقرّبة دائماً**
  (لذلك يوجد `coverage_raw`). القسمة على صفر مرفوضة بخطأ صريح لا بقيمة زائفة.
- الوحدات الموحدة: سرير، رخصة، زيارة، مخالفة، مراقب، قرار، ٪.

---

## 1. الجذر

| المسار | النوع | ملاحظات |
|---|---|---|
| `schema_version` | نص | `"1.0.0"` — عارض المقدِّم لا يقبل إصداراً محلياً من schema مختلف |
| `release` | كائن | هوية اللقطة (§2) |
| `meta` | كائن | البيانات الوصفية والتواريخ المنفصلة (§3) |
| `sources[]` | مصفوفة | سجل المصادر (§4) |
| `metrics` | كائن | المقاييس الخام المسماة (§5) |
| `derived` | كائن | المشتقات الموثقة الصيغ (§6–7) |
| `sectors[]` | مصفوفة | القطاعات الخمسة (§8) |
| `monthly` | كائن | السلسلتان الشهريتان (§9) |
| `baseline` | كائن | خط أساس التراخيص (§10) |
| `facility_types[]` · `economic_activities[]` · `violation_types[]` · `collar` | قوائم | (§11) |
| `neighbourhoods` | كائن | عينة الأحياء (§12) |
| `scenarios` | كائن | سيناريوهات العجز المورّدة (§13) |
| `compliance` · `coverage_target_indicative` | كائنان | قيم مورّدة بوسوم حالة (§14) |
| `strategy` · `next_steps` | كائنان | وحدتا الانتظار الشريف (§15) |
| `insights` | كائن | الجمل التقريرية المعتمدة (§16) |
| `quarantine` | كائن | المحجور عرضه (§17) |
| `validation` | كائن | خلاصة بوابات البناء (§18) |

## 2. `release` — هوية اللقطة

| الحقل | النوع | ملاحظات |
|---|---|---|
| `id` | نص | `rel-YYYY-MM-DD-NNN` |
| `status` | نص | `published` (المسودات: `draft`) |
| `published_at` / `published_by` | نص | طابع ISO / الفاعل (`system-seed` للإصدار التأسيسي) |
| `base_release_id` | نص أو `null` | أساس تفاؤلية التزامن؛ `null` للتأسيسي |
| `notes` | نص | ملاحظات الإصدار |
| `sha256` | نص | بصمة قانونية لمحتوى الإصدار (تستثني `release` و`validation` ذاتيهما) |

## 3. `meta` — البيانات الوصفية والتواريخ الأربعة

| الحقل | النوع | المصدر | ملاحظات |
|---|---|---|---|
| `title` | نص | إداري | عنوان العرض |
| `entity` | `null` | إداري | لا جهة/شعار مخترع — تُضاف عند اعتماد الهوية |
| `presentation_date` | تاريخ ISO | إداري | تاريخ الإلقاء |
| `presentation_date_needs_confirmation` | منطقي | إداري | `true` = إنذار جودة مفتوح |
| `data_as_of` | نص | السياق!C5 | «أغسطس 2026» — يظهر في «البيانات حتى …» |
| `monitoring_period_start` / `end` | `YYYY-MM` | مشتق من السلسلة | `2025-09` / `2026-08` |
| `monitoring_period_label` | نص | إداري | «سبتمبر 2025 – أغسطس 2026» |
| `baseline_label` / `comparison_qualifier` | نص | إداري | صياغة خط الأساس المعتمدة |
| `calculation_date` | تاريخ ISO | السياق!C6 | `2026-08-11` — من الورقة حصراً |
| `map_disclaimer` | نص | حوكمة R11 | «خريطة توضيحية» — وسم دائم لكل استخدام للخريطة |
| `sample_label` | نص | حوكمة R10 | «عينة من الأحياء المدرجة في قاعدة البيانات» |

## 4. `sources[]`

`id` (`src-workbook-v1`) · `name` (`platform-data.xlsx`) · `kind` (`workbook`) ·
`template_version` (`V1`) · `sha256` (بصمة الملف الأصلي) · `imported_at` ·
`private: true` (لا يُضمَّن الملف في الحزمة المنشورة).

## 5. `metrics` — المقاييس الخام (kind: `raw`)

كل سجل: `{id, value, unit, kind:"raw", source_id:"src-workbook-v1", sheet, anchor, label}`.

| المعرّف | القيمة | الوحدة | المرساة (الورقة!الخلية) |
|---|---:|---|---|
| `total_demand` | 1,420,000 | سرير | الطلب!C4 |
| `licensed_beds` | 612,400 | سرير | التراخيص!E20 |
| `occupied_beds` | 561,571 | سرير | السياق!C4 |
| `current_building` | 96 | رخصة | التراخيص!C20 |
| `current_operational` | 140 | رخصة | التراخيص!D20 |
| `baseline_building` | 64 | رخصة | التراخيص!C5 |
| `baseline_operational` | 118 | رخصة | التراخيص!D5 |
| `baseline_beds` | 563,900 | سرير | التراخيص!E5 |
| `blue_collar` | 1,164,400 | سرير | السياق!C15 |
| `white_collar` | 255,600 | سرير | السياق!C16 |
| `total_monitors` | 18 | مراقب | الرقابة!C10 |
| `total_visits` | 19,651 | زيارة | الرقابة!E10 |
| `total_violations` | 3,617 | مخالفة | الرقابة!D10 |
| `total_closures` | 113 | قرار | الرقابة!F10 |
| `south_violations` | 1,367 | مخالفة | الرقابة!D9 |

## 6. `derived` — المشتقات المسماة (kind: `derived`, formula_version: `fv1`)

كل سجل: `{id, value, unit, kind:"derived", formula, formula_version:"fv1", inputs[]}`.

| المعرّف | القيمة | الوحدة | الصيغة | المدخلات |
|---|---:|---|---|---|
| `deficit_beds` | 807,600 | سرير | `max(total_demand − licensed_beds, 0)` | `total_demand`, `licensed_beds` |
| `coverage_pct` | 43.1 | ٪ | `licensed_beds ÷ total_demand × 100` | `licensed_beds`, `total_demand` |
| `uncovered_pct` | 56.9 | ٪ | `100 − coverage_pct` | `coverage_pct` |
| `occupancy_pct` | 91.7 | ٪ | `occupied_beds ÷ licensed_beds × 100` | `occupied_beds`, `licensed_beds` |
| `vacant_beds` | 50,829 | سرير | `licensed_beds − occupied_beds` | `licensed_beds`, `occupied_beds` |
| `blue_share_pct` | 82.0 | ٪ | `blue_collar ÷ total_demand × 100` | `blue_collar`, `total_demand` |
| `white_share_pct` | 18.0 | ٪ | `white_collar ÷ total_demand × 100` | `white_collar`, `total_demand` |
| `growth_building_abs` | 32 | رخصة | `current_building − baseline_building` | `current_building`, `baseline_building` |
| `growth_building_pct` | 50.0 | ٪ | `(current − baseline) ÷ baseline × 100` | نفسها |
| `growth_operational_abs` | 22 | رخصة | `current_operational − baseline_operational` | `current_operational`, `baseline_operational` |
| `growth_operational_pct` | 18.6 | ٪ | `(current − baseline) ÷ baseline × 100` | نفسها |
| `growth_beds_abs` | 48,500 | سرير | `current_beds − baseline_beds` | `current_beds`, `baseline_beds` |
| `growth_beds_pct` | 8.6 | ٪ | `(current − baseline) ÷ baseline × 100` | نفسها |
| `avg_monthly_visits` | 1,638 | زيارة | `total_visits ÷ 12` (تقريب نصف-لأعلى لعدد صحيح) | `total_visits` |
| `south_violations_share_pct` | 37.8 | ٪ | `south_violations ÷ total_violations × 100` | `south_violations`, `total_violations` |

## 7. `derived.sector_derived` و`derived.rankings`

لكل قطاع (`north/east/center/west/south`) — المدخلات: طلب القطاع وأسرّته وزياراته
ومخالفاته + الإجماليات؛ الصيغ `fv1`:

| الحقل | الصيغة | الوحدة |
|---|---|---|
| `coverage_pct` | أسرّة القطاع ÷ طلب القطاع × 100 | ٪ |
| `coverage_raw` | أسرّة ÷ طلب (غير مقرّب) | نسبة خام — **للترتيب فقط، غير معروضة** |
| `deficit_beds` | `max(طلب − أسرّة, 0)` | سرير |
| `violations_share_pct` | مخالفات القطاع ÷ 3,617 × 100 | ٪ |
| `visits_share_pct` | زيارات القطاع ÷ 19,651 × 100 | ٪ |
| `demand_share_pct` | طلب القطاع ÷ 1,420,000 × 100 | ٪ |

`rankings` — عشرة مفاتيح محسوبة على الخام: `lowest_coverage` (south) ·
`highest_coverage` (east) · `highest_demand` (south) · `highest_violations` (south) ·
`highest_building` (east) · `lowest_building` (center) · `highest_operational` (east) ·
`lowest_operational` (west) · `highest_beds` (east) · `lowest_beds` (west).

## 8. `sectors[]` — القطاعات الخمسة

الترتيب الثابت: شمال، شرق، وسط، غرب، جنوب. حقول كل سجل ومراسيها:

| الحقل | الوحدة | المرساة |
|---|---|---|
| `id` / `name` / `short` | — | تسميات معتمدة (الطلب!B7:B11) |
| `demand` | سرير | الطلب!C7:C11 |
| `building` / `operational` / `beds` | رخصة/رخصة/سرير | التراخيص!C23:E27 |
| `monitors` / `violations` / `visits` / `closures` | مراقب/مخالفة/زيارة/قرار | الرقابة!C5:F9 (الأعمدة C/D/E/F) |

## 9. `monthly` — السلسلتان الشهريتان (12 شهراً متتابعاً: 2025-09 → 2026-08)

- `monthly.licensing[]` — التراخيص!B8:E19: `{iso, label, building, operational, beds}`
  — **صافي إضافات شهرية** (البوابة: خط الأساس + Σ الشهري = الحالي لكل مقياس).
- `monthly.monitoring[]` — السياق!B30:D41: `{iso, label, visits, violations}`
  (البوابة: Σ الشهري = إجماليات الرقابة).

## 10. `baseline` — التراخيص!C5:E5

`{building: 64, operational: 118, beds: 563,900}` — «خط الأساس قبل سبتمبر 2025».

## 11. القوائم المغلقة

| المسار | المرساة | البوابة |
|---|---|---|
| `facility_types[]` (مجمع سكني 38، مبنى سكني 68، كبائن متنقلة 34) | السياق!B9:C11 | Σ = الرخص التشغيلية 140 |
| `economic_activities[]` (6 أنشطة، حقل `demand` بالسرير) | السياق!B20:C25 | Σ = 1,420,000 |
| `violation_types[]` (6 أنواع، حقل `count` بالمخالفة) | الرقابة!B15:C20 | Σ = 3,617 |
| `collar` (`blue: 1,164,400`، `white: 255,600`) | السياق!C15:C16 | Σ = 1,420,000 |

## 12. `neighbourhoods` — عينة الأحياء (الأحياء!B5:G24)

`label`: «عينة من الأحياء المدرجة في قاعدة البيانات» (وسم إلزامي R10) ·
`ranking_note`: «أي ترتيب هو ضمن العينة المورّدة فقط، مع تسمية المقياس المرتب» ·
`rows[]` = 20 سجلاً: `{name, sector, building, operational, beds, violations}`.
البوابات: أسماء فريدة؛ قطاع صحيح؛ Σ عينة كل قطاع ≤ إجمالي قطاعها للمقاييس الأربعة.

## 13. `scenarios` — سيناريوهات العجز المورّدة (السياق!B46:E55)

`status: "supplied_unvalidated"` — **نموذج غير معتمد**؛ `caveat` نصي إلزامي العرض.
`unit: "سرير"` · `rows[]` = 10 أشهر متتابعة (2026-09 → 2027-06):
`{iso, label, conservative, base, optimistic}` بقاعدة ترتيب حاجبة:
متحفظ ≥ أساسي ≥ متفائل لكل شهر.

## 14. القيم المورّدة بوسم حالة

| المسار | القيمة | المرساة | الحالة | القيد |
|---|---:|---|---|---|
| `compliance` | 81.6٪ | الرقابة!C12 | `pending_methodology` | قيمة مورّدة؛ لا اشتقاق `1 − (مخالفات ÷ زيارات)`؛ لا تُعرض كمؤشر معتمد (R8) |
| `coverage_target_indicative` | 60٪ | التراخيص!C31 | `indicative_not_approved` | هدف استرشادي؛ الملاحق فقط، لا المشاهد الرئيسة (R9) |

## 15. وحدتا الانتظار الشريف

- `strategy`: `status: "pending_source"` · `required_pillars: 7` ·
  `source_required: "خطة عمل المشروع V.1.0.0"` · `pillars: []` · `initiatives: []` ·
  `kpis: []` · `weights_rule: null`. عند الاعتماد تحمل السجلات حقول التحرير الإداري
  (المبادرة: `pillar_id`, `progress_percent` صريحة 0–100, `weight`,
  `execution_status`, `schedule_status`, `owner`, `due`؛ المؤشر: `unit`, `baseline`,
  `target`, `current_value`, `direction`, `priority`, `owner`, `as_of`, `source`,
  `waiver`) وتنفعل بواباتها الحاجبة.
- `next_steps`: `status: "pending_approval"` · `items: []` (عند الاعتماد: 3–4 بنود
  `{action, owner, due, status, decision}`).

## 16. `insights` — الجمل التقريرية المعتمدة (s03–s07)

لكل مشهد: `{text, metric_ids[], status: "approved_brief"}`. أرقام النص تُفحص ضد
المشتقات ببوابات بناء (`insight.s03` … `insight.s07`) — لا نص بأرقام متقادمة.

## 17. `quarantine` — المحجور عرضه

- `inspector_level_records`: سجلات المفتشين الفردية — «تعارض مع الإجماليات المعتمدة
  (R1) — لا تُعرض حتى ورود سجل رسمي مطابق».
- `hotspots`: النقاط الساخنة — «إحداثيات بلا مصدر موثق في ملف البيانات (R2)».

## 18. `validation`

`{gates_passed: 133, gates_total: 133, checked_at}` — خلاصة بوابات
`generate_data.py` وقت البناء (السجل الكامل في `data/validation_log.json`).

---

## 19. حدود البيانات الحالية (خلاصة DATA_RECONCILIATION §3)

هذه القيود سارية على الإصدار الحالي ويجب ألا يقدَّم أي مما يلي كحقيقة معتمدة:

1. **الحجر الصحي (R1, R2):** بيانات المفتشين الفردية (أسماء وأداء) محجورة كلياً —
   القائمة المتاحة (≈37,322 زيارة / 7,409 مخالفات) تخالف الإجماليات المعتمدة
   (19,651 / 3,617) فلا تظهر في تجربة المقدِّم حتى يرد سجل رسمي مطابق تماماً.
   وكذلك «النقاط الساخنة»: إحداثيات وتسميات بلا مصدر موثق — لا تُعرض كحقائق.
2. **السيناريوهات غير المعتمدة:** سيناريوهات العجز (§13) قيم مورّدة في ملف البيانات
   لا نموذج تنبؤ معتمداً؛ تُعرض في الملاحق حصراً بوسم التحفظ، وتُعتمد فقط بعد توثيق
   الافتراضات ومالك النموذج وإصداره وطريقة التحديث.
3. **منهجية الامتثال (R8):** 81.6٪ قيمة مورّدة لم يُعتمد بسطها ولا مقامها ولا
   معالجة تعدد المخالفات في الزيارة الواحدة؛ تُعرض في السطر الثانوي بوسم
   «بانتظار اعتماد المنهجية» ولا تُشتق بديلاً عنها أي نسبة.
4. **هدف 60٪ الاسترشادي (R9):** هدف تغطية غير معتمد؛ يظهر بوسم
   «هدف استرشادي (غير معتمد)» في الملاحق فقط، لا في المشاهد الرئيسة.
5. **العينة (R10):** ورقة الأحياء عينة من 20 حياً لا حصراً شاملاً؛ الوسم إلزامي،
   وأي ترتيب هو داخل العينة فقط مع تسمية المقياس المرتب.
6. **قيود مكملة:** لا يُعرض أي «نمو للطلب» — لا سلسلة طلب تاريخية معتمدة (R6)؛
   وحدة الاستراتيجية بانتظار «خطة عمل المشروع V.1.0.0» ولا تلفيق لركائز 5–7
   (R4, R5)؛ القيم الحالية للمؤشرات غائبة ولا أصفار زائفة (R7)؛ هندسة الخريطة غير
   موثقة المصدر فوسم «خريطة توضيحية» دائم (R11)؛ تاريخ العرض التقديري يحتاج تأكيداً
   إدارياً قبل يوم العرض.
