# V2_CONTRACTS.md — عقود وحدات النسخة الثانية (المرجع الملزم لوكلاء البناء)

**الحالة:** سارٍ — كتبه معمار النواة بعد تنفيذ النواة (registry/layout/media-bg/geomap/dashboard.css وإعادة توصيل المحرك والموجّه والبناء).
**القاعدة الذهبية:** كل قسم لوحة قيادة كثيفة: شريط مؤشرات كبرى أعلى الشاشة، رسوم تملأ ما تبقى، عمود رؤى. لا شاشات نصية، لا شاشات انتظار كاملة — حالة «قيد الاعتماد» الصادقة تُعرض بطاقة مدمجة `layout.pendingCard` داخل اللوحة.
**قواعد غير قابلة للتفاوض:** كل الأرقام عبر `RH.core.fmt` (تطابق العدد والمعدود عبر `fmt.noun/countNoun`)؛ أي نص من الإصدار يمر إلى HTML تلميح عبر `RH.viz.theme.esc`؛ منظومة اللون الدلالية (أخضر=طاقة مرخصة، رملي=طلب، مرجاني=عجز/مخالفات حصراً، ذهبي=مستهدف/خط أساس حصراً، أزرق=فئة ثانوية)؛ لا محاور مزدوجة أبداً (مقياسان مختلفا النطاق = رسمان متجاوران أو شبكتان grid منفصلتان داخل مثيل واحد)؛ لا gauges دائرية ولا بطاقات KPI بأيقونات؛ احترام `prefers-reduced-motion`؛ كل عنصر تفاعلي قابل للتركيز بلوحة المفاتيح.

---

## 1) واجهة وحدة القسم — `RH.sections.register(def)`

الملف: `src/js/presenter/sections/registry.js` (محمَّل قبل ملفات الأقسام). كل قسم ملف واحد
`src/js/presenter/sections/s<n>-<id>.js` (IIFE بنمط المشروع: تعليقات عربية، `"use strict"`).

```js
RH.sections.register({
  id: "demand",            // إلزامي — من القائمة القانونية أدناه
  order: 2,                // إلزامي — 1..9 يحدد موقع القسم في التسلسل الخطي
  title: "العرض والطلب",   // إلزامي — عنوان القسم (aria-label + ترويسة)
  kicker: "قراءة السوق",   // اختياري — سطر السياق الذهبي فوق العنوان
  backdrop: "demand",      // اختياري — مفتاح خلفية (القسم 6). غيابه = تدرج زجاجي فقط
  dim: 0.82,               // اختياري — عتامة الطبقة الزجاجية فوق الصورة (افتراضي 0.82)
  steps: 0,                // اختياري — عدد خطوات البناء الإضافية (افتراضي 0 = حالة واحدة)
  major: false,            // اختياري — دخول القسم للأمام انتقال مقطعي كبير
  build(el, ctx) { … },    // إلزامي — يبني اللوحة داخل el (‎.dash-body)
});
```

**التسلسل القانوني (order):**

| order | id | العنوان | backdrop | major |
|---|---|---|---|---|
| 1 | `summary` | الملخص التنفيذي | `summary` | ✓ |
| 2 | `demand` | العرض والطلب | `demand` | |
| 3 | `licensing` | التراخيص | `licensing` | |
| 4 | `control` | الرقابة الميدانية | `control` | |
| 5 | `map` | خريطة الرياض التفاعلية | `map` | |
| 6 | `initiatives` | المبادرات والركائز | `initiatives` | ✓ |
| 7 | `kpis` | مؤشرات الأداء | `kpis` | |
| 8 | `forecast` | سيناريوهات العجز | `forecast` | |
| 9 | `closing` | الخاتمة والتوصيات | `closing` | ✓ |

الغلاف يبقى مشهد `00`: ملفه `src/js/presenter/sections/s0-cover.js` يسجل مباشرة عبر
`RH.presenter.engine.registerScene({ id: "00", build })` (لا يمر عبر `RH.sections.register`)
ويستعمل `RH.presenter.mediaBg` لطبقة الفيديو/الملصق (القسم 6).

**ctx الممرر إلى build (العقد الدقيق):**

```js
ctx = {
  su: Number,                    // وحدة القياس (عرض المسرح ÷ 1920) وقت البناء
  release: Object,               // RH.data.store.release() — لا تعدّله أبداً
  derived: Object,               // RH.data.store.der()
  geo: Object|null,              // window.GEO — {bounds, sectors, hotspots}
  params: Object,                // معاملات الهاش الحالية (سلاسل)
  step: Number,                  // خطوة البناء الحالية (?step= — عدد صحيح ≥0)
  steps: Number,                 // إجمالي الحالات المعلنة (def.steps + 1)
  route: Object,                 // المسار الخام {kind:"scene", id, params}
  update(params),                // إعادة كتابة معاملات القسم في العنوان (استبدال، لا تاريخ)
  onTeardown(fn),                // تسجيل تنظيف يُنفذ قبل هدم القسم (مستمعون/مؤقتات/خرائط)
  openDetail(content, opts?),    // طبقة تفاصيل زجاجية فوق القسم — content: Node أو
                                 //   سلسلة HTML «من قوالب الكود الثابتة حصراً» (نصوص
                                 //   الإصدار تمر عبر theme.esc قبل الدمج). opts={title?}
                                 //   يعيد دالة إغلاق. Escape/زر الإغلاق/نقر الخلفية تغلق.
  openAppendix(id, params?),     // فتح ملحق V1 مع حفظ حالة القسم (engine.openAppendix)
};
```

- المحرك يبني القسم في مضيف احتياطي ثم يبدّل — لا تعتمد على وجود العنصر في DOM وقت `build`؛
  أنشئ رسوم ECharts بعد الإلحاق أو اعتمد على `theme.resizeAll` الذي يستدعيه المحرك بعد التبديل.
- خطوات البناء: القسم بلا `steps` يتقدم مباشرة للقسم التالي. مع `steps: 2` يستقبل
  `ctx.step` ∈ {0,1,2} — أظهر الطبقات تدريجياً (كما فعلت مشاهد V1 بـ opacity).
- `id` القسم يظهر في العنوان `#/section/<id>` — لا تغيّره بعد النشر.

---

## 2) مساعدات التخطيط — `RH.presenter.layout`

الملف: `src/js/presenter/layout.js`. كلها تُلحق بالعنصر الممرر وتعيد ما يُبنى.
كل المقاسات بوحدة `--su`. الأصناف في `src/styles/dashboard.css`.

```js
layout.sectionHeader(el, { kicker, title, badge?, meta? }) → HTMLElement
//  .dash-head > .dash-kicker (ذهبي) + .dash-title + .dash-badge? + .dash-meta?
//  badge: نص وسم قصير (مثل «بيانات حتى أغسطس 2026»)، meta: سطر ثانوي يمين الترويسة

layout.kpiStrip(el, items) → HTMLElement            // .kpi-strip
// items: [{
//   label: String,                 // تسمية المؤشر
//   value: String,                 // القيمة «منسقة سلفاً عبر RH.core.fmt» — إلزامي
//   unit?: String,                 // وحدة لاحقة («سرير»، «رخصة»…)
//   delta?: { text, tone },        // سطر تغيّر: tone ∈ pos|neg|warn|neu
//   tone?: "pos"|"neg"|"warn"|"gold"|"neu",  // لون الرقم — يخضع لمنظومة المعنى:
//                                  // neg (مرجاني) للعجز/المخالفات حصراً، gold للمستهدف حصراً
//   note?: String,                 // سطر هامشي صغير
//   countTo?: Number, fmt?: fn,    // عدّ تصاعدي عند أول دخول (RH.viz.motion)؛
//                                  // fmt(v)→String تُستدعى أثناء العد، والقيمة النهائية value
//   key?: String,                  // مفتاح «أول دخول فقط» للعد — إلزامي مع countTo
// }, …]  — 4 إلى 6 عناصر؛ الشريط شبكة أفقية أعلى اللوحة

layout.grid(el, { cols=12, rows?, gap?, cls? }) → { el, cell }
//  .dash-grid بشبكة CSS. cell({ span=1, rows=1, cls?, card=false }) → HTMLElement
//  يعيد مضيف خلية .dash-cell (مع .dash-card إن card:true) بالامتداد المطلوب.

layout.card(el, { title?, sub?, tone?, cls?, pad=true }) → { card, head?, body }
//  .dash-card زجاجية: .card-head (.card-title + .card-sub) + .card-body

layout.chartCard(el, { title, sub?, cls? }) → { card, body }
//  بطاقة رسم: body يحمل .chart-host — مرّره مباشرة لمُنشئ الرسم

layout.statCard(el, { label, value, unit?, foot?, tone? }) → HTMLElement
//  .stat-card مدمجة (رقم متوسط الحجم) — للأرقام الثانوية داخل الشبكة

layout.tableCard(el, { title?, columns, rows, note?, cls? }) → { card, table }
//  columns: [{ key, label, align?: "start"|"end"|"center", render?(row)→String|Node }]
//  rows: مصفوفة كائنات. بلا render تُعرض row[key] نصياً (آمن — عقد نصوص DOM).
//  الأرقام داخل render عبر RH.core.fmt حصراً. جدول كثيف .table-dense داخل .dash-card

layout.insightRail(el, sectionKey, opts?) → HTMLElement
//  يقرأ release.insight_panels.sections[sectionKey] — المفاتيح القانونية:
//  "supply" | "licensing" | "control" | "initiatives"
//  يرسم .rail بعنوان «رؤى تحليلية» وبطاقات .rail-item.pos|.neg|.warn|.neu
//  (الصنف من panel.cls — مفردات مقفلة). opts={title?, compact?}
//  مفتاح غير موجود → يعيد null ولا يرسم شيئاً (لا اختلاق رؤى).

layout.pendingCard(el, { label, note? }) → HTMLElement
//  .pending-card — الحالة الصادقة «قيد الاعتماد/غير متوفر» كبطاقة مدمجة موسومة
//  بالذهبي داخل اللوحة. ممنوع تحويلها شاشة كاملة.
```

---

## 3) عقد مكتبة الرسوم — `RH.viz.charts2`

ملفات: `src/js/viz/charts/charts-supply.js`، `charts-licensing.js`، `charts-control.js`،
`charts-strategy.js`. (`src/js/viz/charts.js` القديم يبقى كما هو لخدمة الإدارة والملاحق —
لا تلمسه.) كل ملف IIFE يبدأ بـ:

```js
RH.viz.charts2 = RH.viz.charts2 || {};
```

**التوقيع الموحد:** `RH.viz.charts2.<name>(el, su, opts?) → echarts instance`

- `el`: مضيف الرسم (عادة `chartCard(...).body`)، `su`: من `ctx.su`، `opts`: خيارات المُنشئ.
- المثيل يُنشأ حصراً عبر سجل الثيم: `RH.viz.theme.chart(chartId, el)` حيث
  `chartId = "c2:" + name + (opts && opts.key ? ":" + opts.key : "")` — السجل يتخلص من
  المثيل المستبدل تلقائياً، و`theme.disposeAll/resizeAll` يبقيان صالحين. لا `echarts.init` مباشر.
- البيانات من `RH.data.store.release()/.der()` حصراً؛ الأرقام في التسميات والتلميحات عبر
  `RH.core.fmt`؛ نصوص الأشهر/الأسماء في تلميحات HTML عبر `theme.esc/ttRow/ttTitle`.
- المحاور بأدوات الثيم (`catXAxis/valAxis/hValAxis/hCatAxis`) — RTL مضبوط سلفاً.
- الحركة: مدة الأساس من `theme.base(su)` (تحترم reduced-motion). لا حركة مستمرة للبيانات.

**القائمة القانونية للمنشئين (21):**

| الملف | المُنشئ | الشكل والبيانات |
|---|---|---|
| charts-supply.js | `occupancyComposition` | شرائح أفقية مكدسة: مشغول/شاغر من occupied_beds وvacant_beds (أخضر/أخضر خافت) |
| | `econBars` | أعمدة أفقية: economic_activities بالطلب (رملي) |
| | `sectorSupplyDemand` | أعمدة مجمعة قطاعياً: demand (رملي) مقابل beds (أخضر) + عجز (مرجاني اختياري) |
| | `coverageEvolution` | مساحة شهرية: سلسلة التغطية المشتقة (baseline.beds + تراكمي beds الشهرية ÷ total_demand) — تنتهي عند 43.1 |
| | `forecastScenarios` | خطوط نطاق: scenarios.rows (متحفظ/أساسي/متفائل) بوسم caveat «مورّدة غير معتمدة» |
| | `demandCollarSplit` | شريط مكدس ثنائي: collar.blue (أزرق) / collar.white (رملي) |
| charts-licensing.js | `cumulativeLicenses` | خطوط تراكمية: baseline + monthly.licensing (بناء/تشغيلية/أسرّة — لا محاور مزدوجة: الأسرّة في شبكة grid ثانية داخل المثيل) |
| | `monthlyNetIssuance` | أعمدة شهرية صافية: monthly.licensing |
| | `facilityTypes` | أعمدة/donut أنواع الإيواء: facility_types (أخضر/أزرق/رملي — facility3) |
| | `sectorLicenseCompare` | أعمدة قطاعية مجمعة: building/operational (وbeds في شبكة ثانية) |
| | `licenseGrowthBridge` | شرائح نمو أفقية: خط الأساس ← الإضافات ← الحالي (بديل الجسر الشلالي المرفوض) |
| charts-control.js | `monthlyActivityDual` | شبكتان مكدستان في مثيل واحد: زيارات (أعلى، أخضر) ومخالفات (أسفل، مرجاني) — **ليس** محورين على رسم واحد |
| | `violationTypes` | أعمدة أفقية: violation_types (مرجاني — عجز/خلل حصراً) |
| | `sectorViolationsBars` | أعمدة قطاعية: violations (مرجاني) مع وسم عدد المراقبين |
| | `complianceCard` | شريط نسبة أفقي 81.6٪ بوسم «قيمة مورّدة — بانتظار اعتماد المنهجية» (compliance.status) — لا gauge دائري |
| | `closuresBars` | أعمدة قطاعية: closures |
| charts-strategy.js | `initiativeGantt` | مخطط زمني: strategy.initiatives (custom series أو أعمدة مدى) بخط اليوم (ذهبي) وحالة محسوبة بقاعدة status_rule «متأخرة حكماً» |
| | `statusDonut` | donut حالات المبادرات: منجزة (أخضر)/جاري (أزرق)/متأخرة (مرجاني)/لم يبدأ (رمادي خافت) |
| | `pillarCards` | ليست ECharts: بطاقات الركائز الأربع (3 ركيزة + 1 ممكن) بعدّاد مبادراتها — ترجع العنصر |
| | `kpiBullets` | 14 bullet أفقي: baseline→target (ذهبي للمستهدف)، current=null يُعرض «غير متوفر» صراحة |
| | `kpiMatrix` | مصفوفة أنواع/أعداد المؤشرات (14 مؤشراً؛ target/baseline عبر fmt، النسب ×100 مع ٪) |

حساب حالة مبادرة (مرآة generate_data): `status` إن وُجد، وإلا: `end < meta.calculation_date`
→ «متأخرة»؛ `start ≤ calculation_date` → «جاري العمل»؛ وإلا «لم يتم البدء».
الأعداد المثبتة بالبوابات: 2 منجزة / 7 متأخرة / 9 جاري العمل.

---

## 4) واجهة الخريطة الجغرافية — `RH.viz.geomap` (منفذة في النواة)

الملف: `src/js/viz/geomap.js`. البيانات من `window.GEO` (تُحقن وقت البناء من
`data/riyadh-geo.json`): `{bounds:[[latMin,lngMin],[latMax,lngMax]], sectors:{north|east|center|west|south:[{name,name_en,centroid:[lat,lng],rings:[[[lat,lng],…]]}]}, hotspots:[{sector,density,lat,lng}]}`.

```js
const gm = RH.viz.geomap.render(el, {
  su: Number,                       // إلزامي
  layer: "beds",                    // "beds"|"operational"|"building"|"violations"
                                    // |"inspectors"|"demand"|"coverage"
  mode: "auto",                     // "auto"|"svg"|"tiles" — auto: بلاطات OSM إن كان
                                    // Leaflet حاضراً والاتصال متاحاً، وإلا SVG مسقط؛
                                    // فشل جلب البلاطات أو navigator.onLine===false
                                    // → سقوط تلقائي إلى svg
  hotspots: false,                  // طبقة نقاط التركّز الرقابي (مرجاني، حجم=الكثافة)
  sample: true,                     // إثراء تلميح الحي بقيم عينة release.neighbourhoods
  interactive: true,                // false = خريطة مصغرة عرضية (بلا تركيز/نقر)
  onDistrict(info) {},              // نقر/Enter على حي:
                                    // info={name, name_en, sector, sectorName,
                                    //       sectorRow, sectorDerived, centroid, sample|null}
});
gm.setLayer("violations");          // إعادة تلوين بلا إعادة بناء
gm.setHotspots(true);
gm.mode();                          // "svg" | "tiles" الفعلي الحالي
gm.refresh();                       // بعد تغير مقاس الحاوية
gm.destroy();                       // إلزامي في ctx.onTeardown
```

**العقد المرئي:**
- choropleth قطاعي: كل أحياء القطاع تُملأ بدرجة من السلم التسلسلي الأحادي حسب قيمة
  القطاع من الإصدار — المرجاني للمخالفات حصراً، الرملي النحاسي للطلب (لونه الدلالي)،
  والأخضر لسائر الطبقات (`coverage` من `derived.sector[id].coverage_pct`،
  `inspectors` من `sectors[].monitors`).
- وسيلة الإيضاح + سطر الإسناد إلزاميان في الوضعين:
  «حدود الأحياء: بيانات عامة (MIT) — مواقع النقاط توضيحية من سجل المنصة»
  (وفي وضع البلاطات يضاف «© مساهمو OpenStreetMap»).
- تلميح الحي: الاسم + اسم القطاع + قيمة طبقة القطاع، وقيم العينة (أسرّة/رخص/مخالفات)
  إذا طابق الاسم صف عينة الأحياء — كل النصوص عبر esc، كل الأرقام عبر fmt.
- لوحة المفاتيح: الحاوية قابلة للتركيز (`tabindex=0`, `data-interactive` فلا تتقدم
  الأسهم بالعرض)، الأسهم تتنقل بين الأحياء، Enter يستدعي onDistrict، Escape يخرج.
- SVG: إسقاط متساوي البعد مصحح بجيب تمام خط العرض الأوسط — يعمل من file:// دون اتصال.

---

## 5) اصطلاحات CSS

- `src/styles/dashboard.css` (النواة — موجود): الأصناف المشتركة كلها:
  `.dash`, `.dash-body`, `.dash-head`, `.dash-kicker`, `.dash-title`, `.dash-badge`,
  `.dash-meta`, `.dash-grid`, `.dash-cell`, `.dash-card`, `.card-head`, `.card-title`,
  `.card-sub`, `.card-body`, `.chart-host`, `.kpi-strip`, `.kpi`, `.kpi-label`,
  `.kpi-value`, `.kpi-num`, `.kpi-unit`, `.kpi-delta`, `.kpi-note`, `.rail`,
  `.rail-title`, `.rail-item`, `.stat-card`, `.table-dense`, `.pending-card`,
  `.detail-overlay`, `.detail-panel`, `.media-bg`, `.media-glass`, `.geomap`,
  `.geomap-legend`, `.geomap-attrib`, `.geomap-tip`.
- كل قسم يكتب **فقط** `src/styles/sections/<id>.css` (مثال `src/styles/sections/demand.css`)
  لتخصيصاته، ويسبق أصنافه بـ `[data-section="<id>"]` منعاً للتسرب. ممنوع تعديل
  dashboard.css أو tokens.css أو ملفات أقسام الغير.
- كل المقاسات `calc(var(--su) * n)`. الألوان من رموز tokens.css حصراً.
- الغلاف (s0-cover) يجوز له استخدام `src/styles/sections/cover.css`.

---

## 6) عقد الوسائط — `window.MEDIA` و`RH.presenter.mediaBg`

`build.py` يحقن من `data/media-v2-jobs.json`:

```js
window.MEDIA = {
  backdrops: { demand, licensing, control, map, initiatives, kpis_closing }, // url لكل قسم
  cover: { poster, video,            // ملصق 2K + فيديو 2K للغلاف
           video_720, poster_1k, night_grid, heritage },                     // بدائل
};
```

`RH.presenter.mediaBg` (النواة — `src/js/presenter/media-bg.js`):

```js
RH.presenter.mediaBg.attach(el, key, { dim=0.82 }?) → HTMLElement  // طبقة .media-bg
// key: مفتاح في MEDIA.backdrops أو أسماء الأقسام المستعارة:
//   summary→cover.night_grid، kpis→kpis_closing، closing→kpis_closing،
//   forecast→demand، cover→cover.poster
// يرسم <img> الخلفية + تدرجاً زجاجياً زمردياً فوقها (.media-glass بعتامة dim).
// فشل التحميل/غياب الشبكة/غياب MEDIA → تبقى لوحة التدرج الفني وحدها (تدهور رشيق
// دون نتوء بصري). الصورة تظهر بخفوت بعد اكتمال تحميلها فقط.
RH.presenter.mediaBg.attachVideo(el, { src, poster, dim }?) → HTMLElement
// للغلاف: فيديو حلقي صامت مع ملصق احتياطي؛ reduced-motion أو فشل التحميل → الملصق فقط.
RH.presenter.mediaBg.media() → window.MEDIA || null
```

سجل التسجيل `RH.sections` يستدعي `attach` تلقائياً عند تعريف `def.backdrop` — القسم لا
يحتاج استدعاءها بنفسه إلا لطبقات إضافية.

---

## 7) الملاحة والتوصيل (منفذ في النواة — للعلم لا للتعديل)

- `engine.LINEAR = ["00", …section ids بترتيب order]` — يبنيه `RH.sections.boot()` وقت
  الإقلاع (app.js). عقد الكليكر (§8 من التكليف) محفوظ حرفياً: التالي/السابق يقلبان
  خطوات البناء ثم الأقسام.
- المسارات: `#/section/<id>[?step=n&…]` للأقسام، `#/scene/00` للغلاف،
  `#/appendix/<id>` للملاحق كما كانت. مسارات V1 القديمة `#/scene/NN` تُعاد الكتابة
  استبدالاً: 01,02→summary · 03,04→demand · 05,06→licensing · 07→control ·
  08,09→initiatives · 10→kpis · 11→closing.
- الملاحق V1 (demand/licensing/control/pillar/kpi عبر ax-shell) باقية وتُفتح من الأقسام
  عبر `ctx.openAppendix(id)` — «التالي/السابق» لا يبلغانها أبداً.
- زر HUD «العودة إلى المحاور» يقود إلى أول قسم (summary) ويختفي على الغلاف وعليه.

---

## 8) ترتيب البناء (build.py — منفذ)

- JS: النواة ثم `viz/geomap.js` ثم `presenter/layout.js`، `presenter/media-bg.js`،
  `presenter/sections/registry.js` ثم **glob مرتب** `src/js/viz/charts/*.js` ثم
  **glob مرتب** `src/js/presenter/sections/*.js` (registry مستثنى من الglob) ثم الملاحق
  فالإدارة فـ app.js. مشاهد V1 (`presenter/scenes/*`) متقاعدة — خارج الضم، الملفات باقية.
- CSS: tokens → base → presenter → **dashboard.css** → scenes(للغلاف والإرث) → appendix
  → **glob مرتب `src/styles/sections/*.css`** → admin → print. وleaflet.css يُضم قبلها.
- Leaflet 1.9.4 مضمن من `vendor/leaflet/` في وسم `<script>` منفصل قبل التطبيق (حفاظاً
  على الوضع الصارم strict للتطبيق) — لا يُحسب في سطور src المعلنة.
- الحقن: `window.RELEASE` + `window.WORKBOOK_MANIFEST` + `window.MEDIA` + `window.GEO`.

---

## 9) بوابات التحقق الجديدة (validate.js — منفذ)

عند `strategy.status === "approved_source_mirror"` (الحالة المنشورة):

| البوابة | المستوى | الشرط |
|---|---|---|
| `strategy.pillars4` | حاجبة | 4 محاور بمعرفات فريدة: 3 «ركيزة» + 1 «ممكن» و`required_pillars===4` |
| `strategy.initiatives18` | حاجبة | 18 مبادرة بمعرفات فريدة |
| `strategy.membership` | حاجبة | كل مبادرة تنتمي لمحور معرَّف |
| `strategy.initiative_dates` | حاجبة | التواريخ ISO سليمة و`start ≤ end` حيث وُجدا |
| `strategy.initiative_status` | حاجبة | الحالة null أو من `status_vocabulary` |
| `strategy.kpis14` | حاجبة | 14 مؤشراً بمعرفات 1..14 بالضبط |
| `kpi.pct_bounds` | حاجبة | المؤشرات النسبية: baseline/target (وcurrent إن وُجد) ∈ [0,1] |
| `kpi.target_gt_baseline` | حاجبة | كل مستهدف > خط أساسه |
| `kpi.current_values` | إنذار | current غائبة → النشر يتطلب تنازلاً موقَّعاً (العقد القائم بلا تغيير) |
| `insight_panels.figures.*` | حاجبة | أرقام نصوص لوحات الرؤى تطابق مجمع الحقائق (كالتحليلات تماماً) |
| `insight_panels.cls.*` | حاجبة | تصنيف كل بطاقة من {pos,neg,warn,neu} |

مجمع الحقائق موسَّع ليشمل: معرفات المبادرات (1.1…4.4)، أعداد الاستراتيجية (4/18/14)،
قيم المؤشرات (خام و×100 للنسبية)، طول السلاسل الشهرية (12)، والمشتقات المختصرة
(807.6/48.5/18.6 ونحوها) — **ممنوع إضعاف البوابة؛ وسّع المجمع فقط بحقيقة مشروعة.**
أي حالة أخرى لـ strategy.status → إنذار `strategy.pending` (لا نشر كامل).

---

## 10) ممنوعات سارية على كل الأقسام (تذكير حاسم)

لا اختلاق قيم — كل رقم من release.json/riyadh-geo.json. القيم الحالية للمؤشرات غير
المتوفرة تُعرض «تُسجَّل من المنصة — غير متوفرة» صراحة. جدول المفتشين (18 اسماً) في ملحق
الرقابة فقط بوسم «قيد المطابقة». لا git. لا لمس ملفات وكلاء آخرين. `node --check` على
كل ملف JS قبل التسليم.
