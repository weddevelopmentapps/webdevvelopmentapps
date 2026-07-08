# لوحة معلومات سكن العمالة — أمانة منطقة الرياض

Executive Arabic (RTL) command-center dashboard for labor accommodation management in Riyadh, plus the fully reconciled dummy dataset that powers it.

## Deliverables

| File | Description |
|---|---|
| `index.html` | **The dashboard** — a single self-contained file (HTML + CSS + vanilla JS). Opens by double-click; only CDN dependencies are Apache ECharts 5 and Google Fonts (IBM Plex Sans Arabic + Cairo). All data is embedded as a `window.DATA` object. No backend, no localStorage. |
| `labor_accommodation_data.xlsx` | **The dummy dataset** — 20 sheets with Arabic headers, RTL sheet views, internally consistent numbers. |
| `generate_data.py` | Regenerates the workbook **and** `data.json` from a single source of truth, with hard reconciliation assertions. |
| `build.py` | Reassembles `index.html` from `src/` + `data.json`. |
| `src/` | Dashboard source (styles.css / markup.html / app.js) for maintainability. |

## Seed totals (everything reconciles to these)

- **الطلب (إجمالي العمالة):** 1,420,000 — every `Demand_*` sheet sums to this exactly
- **العرض (الأسرّة المرخصة):** 612,400 — equals the sum of the 140 rows in `Facilities`
- **فجوة الإيواء:** 807,600 · **نسبة التغطية:** 43.1%
- **معدل الإشغال:** 91.7% (occupied beds = 561,571)
- **نمو الرخص السنوي:** ≈ +18% · **توقع الفجوة بنهاية يونيو 2027 (أساسي):** ~865,008 سرير

## Data model (sheets)

- **Demand:** `Demand_ByOccupation` (SSCO groups + collar type), `Demand_ByEconomicSector`, `Demand_BySMESize`, `Demand_ByNationality`, `Demand_ByAge`, `Demand_ByMunicipalSector`. Each carries exact blue/white collar splits so the collar cross-filter is exact, not approximated.
- **Supply:** `Facilities` — 140 licensed facilities with type, sector, district, X/Y map coordinates (0–100 SVG space), licensed/occupied beds, occupancy, license status/date, compliance score, risk level, last inspection.
- **Licensing:** `Licenses_Monthly` — 24 months × 5 sectors × 3 accommodation types (issuance, requests, processing days; improving trend).
- **Monitoring:** `Inspections_Monthly` (24 × 5), `Violation_Categories` (6 categories with fines + SME-size + sector splits), `Inspectors` (18, totals reconcile to inspections), `Hotspots` (40 points, skewed south/east).
- **Strategy:** `Initiatives` (28 across the 7 pillars; 3 close within 90 days of 2026-07-08), `KPIs` (6 strategic + 8 operational, targets, direction, 12 monthly actuals).
- **Foresight:** `Predictions` (10 grounded insights + recommendations), `Forecast_Series` (12 months × 3 scenarios with confidence bounds).
- **Reference:** `README`, `dim_sector`, `dim_district`, `dim_accommodation_type`.

## Replacing dummy data with real data

1. **Preferred:** edit the constants and tables at the top of `generate_data.py` (or replace its builders with real extracts), run `python3 generate_data.py` — assertions guarantee reconciliation — then `python3 build.py`.
2. **Direct:** overwrite sheet contents in the workbook keeping column names, export each sheet to the matching key in `data.json`, then run `python3 build.py`.
3. Keep the invariants: demand sheets sum to one total; facility beds sum to the supply total; violation categories sum to inspection totals; KPI actuals derive from the operational sheets.

## Recommended assets to further improve the build

- شعار أمانة منطقة الرياض الرسمي (SVG)
- خريطة GIS فعلية لحدود القطاعات البلدية (GeoJSON) لاستبدال المضلعات التقريبية
- القائمة الفعلية للمبادرات الاستراتيجية ومستهدفاتها
- تعريفات ومستهدفات المؤشرات المعتمدة
- بيانات الترخيص والرقابة الفعلية (وفق قوالب الأوراق أعلاه)
- دليل الهوية البصرية الرسمي (الألوان والخطوط المعتمدة)

## Verified quality bar

Checked headless (Chromium, 1920×1080 and 1366×768): zero console errors; all six tabs; map hover/click/dots/hotspot toggle; drawers (facility/month/category/inspector/initiative/KPI); cross-filters and reset chips; gauges with inverted "أقل أفضل" logic and gold target ticks; scenario switching; `prefers-reduced-motion` respected; totals in the UI reconcile exactly with the workbook.
