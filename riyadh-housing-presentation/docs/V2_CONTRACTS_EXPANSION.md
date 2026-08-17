# V2_CONTRACTS_EXPANSION.md — عقود حزمة التوسعة (المرجع الملزم لوكلاء التوسعة)

**الحالة:** سارٍ — كتبه معمار التوسعة بعد تنفيذ الأسس المشتركة
(`viz/geomap-utils.js`، `viz/charts-micro.js`، خطافات `router/app/nav/chrome/build.py`).
**يقرأ مع:** `docs/V2_CONTRACTS.md` (كل قواعده سارية حرفياً) و`docs/REVAMP_SPEC.md`.
**القاعدة الحاكمة:** البناء المعتمد من مجلس المراجعة (`docs/REVIEW_BOARD_APPROVAL.md`)
لا يُمسّ: الأقسام التسعة والملاحق الخمسة والإدارة تبقى ثابتة بكسلياً، ولا يجوز لوكيل
توسعة تعديل ملف وكيل آخر — **الاستثناء الوحيد**: نقطة دخول واحدة (زر/رابط بنمط
dashboard.css القائم) في الملف المضيف المسمّى صراحة في عقد الميزة أدناه.

**ممنوعات مؤكدة (تذكير):** لا اختلاق أرقام — كل قيمة من `release.json` أو
`riyadh-geo.json` عبر `RH.core.fmt`؛ وسم «قيمة مورّدة — بانتظار اعتماد المنهجية»
يلازم 81.6٪ أينما ظهرت؛ caveat السيناريوهات المورّدة يلازمها؛ وسم العينة
(`meta.sample_label`) يلازم قيم الأحياء؛ منظومة اللون الدلالية مقفلة (مرجاني=عجز/
مخالفات حصراً، ذهبي=مستهدف/خط أساس حصراً)؛ لا محاور مزدوجة ولا gauges؛
`"use strict"` وIIFE وتعليقات عربية و`node --check` لكل ملف؛ كل تفاعل ينظَّف
عبر `ctx.onTeardown`/دوال destroy؛ `prefers-reduced-motion` محترم.

---

## 0) خريطة الحزمة: الملفات، الفضاءات، بادئات CSS، الاختبارات

| # | الميزة | ملفات JS | CSS (بادئة → ملف) | فضاء الأسماء | اختبارات |
|---|---|---|---|---|---|
| 1 | الموجز التنفيذي المطبوع | `src/js/report/report-charts.js`، `report-pages.js`، `report.js` | `rpt-` → `src/styles/report.css` | `RH.report` | `tests/unit/report-model.test.mjs` |
| 2 | مستكشف السيناريوهات | `src/js/presenter/appendix/ax-scenarios.js` | `axs-` → `src/styles/scenarios.css` | `RH.explore.scenarios` | `tests/unit/scenarios-model.test.mjs` |
| 3 | أطلس الأحياء | `src/js/presenter/appendix/ax-atlas.js` | `atl-` → `src/styles/atlas.css` | `RH.explore.districts` | `tests/unit/atlas-model.test.mjs` |
| 4 | الجولة الموجهة + ملاحظات المتحدث | `src/js/presenter/notes-data.js`، `src/js/presenter/tour.js` | `tour-` → `src/styles/tour.css` | `RH.tour`، `RH.presenter.notesData` | `tests/unit/notes-data.test.mjs` |
| 5 | لوحة الأوامر | `src/js/presenter/palette.js` | `pal-` → `src/styles/palette.css` | `RH.palette` | `tests/unit/palette-index.test.mjs` |
| 6أ | ملحق المنهجية | `src/js/presenter/appendix/ax-methodology.js` | `mth-` → `src/styles/methodology.css` | ملحق `methodology` | `tests/unit/methodology-model.test.mjs` |
| 6ب | سجل القرارات | `src/js/presenter/appendix/ax-decisions.js` | `dcs-` → `src/styles/decisions.css` | ملحق `decisions` | ضمن `methodology-model.test.mjs` |
| 7 | إدارة: منشئ الموجز + مقارن الإصدارات | `src/js/admin/report-builder.js`، `src/js/admin/diff-viewer.js` | `adf-` → `src/styles/admin-ext.css` | `RH.admin.reportBuilder`، `RH.admin.diffViewer` | `tests/unit/diff-model.test.mjs` |
| 8 | مكتبة الرسوم المصغرة (منفذة) | `src/js/viz/charts-micro.js` | `mcr-` → `src/styles/micro.css` | `RH.viz.micro` | `tests/unit/charts-micro.test.mjs` |
| 9 | أدوات الجغرافيا المشتركة (منفذة) | `src/js/viz/geomap-utils.js` | — (منطق نقي) | `RH.viz.geoutils` | `tests/unit/geomap-utils.test.mjs` |

- **قاعدة البادئات:** كل صنف CSS جديد يبدأ ببادئة ميزته حصراً (`.rpt-page`،
  `.atl-list`…) — ممنوع لمس `dashboard.css`/`tokens.css`/`appendix.css` أو ملفات
  الأقسام. أصناف dashboard.css المشتركة (`.dash-card`، `.table-dense`،
  `.pending-card`…) تُستخدم كما هي دون إعادة تعريف.
- **مُسلَّم فعلاً (معمار التوسعة):** `tests/unit/charts-micro.test.mjs` (35 حالة)
  و`tests/unit/geomap-utils.test.mjs` (23 حالة) وأربع حالات مسار الموجز مضافة
  إلى `tests/unit/router.test.mjs`، وكلها مسجَّلة في `tests/unit/index.js`.
  `tests/unit/load-app.mjs` وُسِّع مرة واحدة (يملكه المعمار — **لا يعدّله وكيل
  ميزة**): يحمّل `viz/geomap-utils.js` و`viz/charts-micro.js` ضمن سياق vm،
  ويصدّر `freshGeo()` و`host()/textOf()/classOf()/find()/findAll()` لفحص شجرة
  DOM الوهمية. المجموع الحالي **151 اختبار وحدة، كلها خضراء**.
- **e2e:** يضيف وكيل الاختبارات `tests/e2e/expansion.spec.mjs` (مسار `#/report`،
  فتح اللوحة والقفز، أطلس بلوحة المفاتيح، الجولة، الملاحق الجديدة) دون تعديل
  `navigation.spec.mjs`/`admin.spec.mjs` القائمين.
- **قاعدة قابلية الاختبار:** كل وحدة جديدة تُحمَّل في بيئة اختبار الوحدة (vm مع
  محاكاة DOM دنيا — انظر `tests/unit/load-app.mjs`): لا وصول لـ`document`/`window`
  وقت التحميل خارج تعريف الفضاء؛ المنطق القابل للاختبار (نماذج، فهارس، اشتقاقات،
  diff) يُصدَّر دوالَّ نقية على الفضاء العام لا مدفونة في مغلفات DOM.

---

## 1) ترتيب البناء (build.py — منفَّذ، لا يعدَّل ثانية)

مواقع الضم المحجوزة (build.py يتسامح مع الملف الغائب بإنذار «بناء جزئي» — JS وCSS
سواء — فالبناء يبقى أخضر أثناء تقدم الوكلاء):

```
JS  (بعد viz/charts.js):        viz/charts-micro.js ثم viz/geomap-utils.js
JS  (بعد appendix/ax-kpi.js):   ax-scenarios.js، ax-atlas.js، ax-methodology.js، ax-decisions.js
JS  (بعد الملاحق):              presenter/notes-data.js، presenter/tour.js، presenter/palette.js
JS  (بعدها):                    report/report-charts.js، report-pages.js، report.js
JS  (بعد admin/publish.js):     admin/report-builder.js، admin/diff-viewer.js
CSS (بعد dashboard.css):        micro.css
CSS (بعد appendix.css):         chrome-ext.css
CSS (بعد admin.css):            admin-ext.css
CSS (بعد print.css — كي تتقدم قواعد @media print للموجز):
                                report.css، scenarios.css، atlas.css، tour.css،
                                palette.css، methodology.css، decisions.css
```

الاعتماد المسموح: كل ملف يعتمد على ما قبله فقط. `notes-data.js` قبل `tour.js`؛
`report-charts.js` قبل `report-pages.js` قبل `report.js`. الملاحق الجديدة تعتمد
على `RH.presenter.ax` (ax-shell) و`RH.viz.geoutils`/`RH.viz.micro` — كلها قبلها.

---

## 2) المسارات ومفاتيح اللوحة (منفَّذ في router/nav/chrome/app — للعلم والالتزام)

- **`#/report[?pages=a,b,c]`** → `{kind:"report", id:"main", params}` — وضع مستند
  كامل **يتجاوز المسرح**: `app.js` يخفي `#stage/#hud/#release-badge`، يضع
  `body.mode-report`، ينشئ/يظهر `#report-root` ويستدعي
  `RH.report.show(rootEl, route)`. غياب `RH.report` (بناء جزئي) → تحويل استبدالي
  آمن إلى `#/section/summary`. الخروج من الوضع يعيد المقدِّم كاملاً (منفذ في app.js).
  `params.pages`: قائمة معرفات صفحات مفصولة بفواصل (القائمة القانونية §3) —
  غيابها = كل الصفحات.
- **Ctrl+K / ⌘K** (ومكافئها على التخطيط العربي: المحرف `ن`) → يبث
  `RH.core.bus.emit("palette:toggle")` — يعمل في وضعي المقدِّم والموجز، لا في
  الإدارة. منفذ في nav.js **قبل** فحص المعدِّلات، مع `preventDefault`.
- **N** (ومكافئها العربي `ى`؛ بلا معدِّلات، والتركيز خارج عنصر تفاعلي) → يبث
  `bus.emit("notes:toggle")` — درج ملاحظات المتحدث (§6). في وضع المقدِّم فقط.
- **حارس الجولة:** أثناء `body.tour-active` تُحوَّل مفاتيح العرض (التالي/السابق/
  Home/End/Escape) إلى `bus.emit("tour:key", key)` بدل المحرك — الجولة تقود
  الملاحة بنفسها (§6). Escape ينفذ حتى لو كان التركيز داخل عنصر تفاعلي.
- **عقد §8 محفوظ:** إدخال اللوحة/البحث عناصر تفاعلية وجذر اللوحة `role="dialog"`
  — فـ`isInteractive` يمنع مفاتيح الكليكر من تقليب الأقسام أثناء الكتابة. **إلزام
  على وكيلي اللوحة والجولة:** الجذر الطافي يحمل `role="dialog"` و`aria-modal`،
  ومفاتيحه الداخلية تستدعي `stopPropagation` عند التقاطها.
- **أزرار HUD الجديدة (منفذة في chrome.js):** `#hud-palette` («بحث وتنقّل ‎Ctrl+K»)
  يبث `palette:toggle`، و`#hud-report` («الموجز التنفيذي») يوجه إلى `#/report`.
  يُخفى كل زر تلقائياً إذا غابت وحدته من البناء. أنماطهما `hudx-` في
  `src/styles/chrome-ext.css` (ملف المعمار — لا يلمسه وكيل ميزة).

### 2.1 تفاصيل التنفيذ المُسلَّم (ملزمة لوكلاء الميزات)

- **إشارة الوجود:** `RH.report` و`RH.palette` **غير معرَّفين في `ns.js` عمداً**؛
  وجودهما هو ما يفحصه `chrome.js` (`syncExtras`) و`nav.js` (حارس الاختصار)
  و`app.js` (احتياطي المسار). فوكيلا الميزتين يعرّفان الفضاء **كاملاً وقت
  التحميل** (`RH.report = (function(){…})()`)، ولا يعرّفانه كائناً فارغاً مبكراً.
  في المقابل `RH.explore = {}` **مُنشأ سلفاً في `ns.js`** — فوكلاء السيناريوهات
  والأطلس وسجل القرارات يكتبون عليه مباشرة بلا `RH.explore || {}`.
- **جذر الموجز:** `app.js` ينشئ `#report-root.rpt-root` كسولاً عند أول دخول
  للمسار (`role="document"`, `aria-label="الموجز التنفيذي"`) — `markup.html`
  **لم يُمس**. `RH.report.show(root, route)` يستقبل هذا الجذر ذاته في كل دخول
  (العنصر نفسه لا نسخة جديدة) فعليه بتفريغه بنفسه قبل البناء.
- **حصرية الأوضاع:** الأوضاع الثلاثة (`mode-presenter`/`mode-admin`/`mode-report`)
  تُكتب بـ`body.className =` كاملاً، وجذرا الإدارة والموجز لا يظهران معاً أبداً.
  الخروج إلى المقدِّم يمر بـ`restorePresenter()` التي تعيد `stage/hud` وتستدعي
  `chrome.renderBadge()` و`chrome.syncExtras()`.
- **استثناء الأزرار في الملاحق:** `chrome-ext.css` يبقي زرّي التوسعة عاملين
  داخل الملاحق (بخلاف زرّي التقليب اللذين يخفيهما `presenter.css`)، ويخفيهما
  في `body.mode-report` وفي الطباعة. على الغلاف يتبعان قاعدة `.hud-btn` المعتمدة
  (يختفيان — الغلاف نظيف بأمر المجلس)، والاختصار `Ctrl+K` يظل عاملاً هناك.
- **مطابقة المفاتيح مستقلة عن التخطيط:** `nav.js` يفحص `e.code` الفيزيائي
  (`KeyK`/`KeyN`) ويُسنده بمحرفي التخطيطين (`k`/`ن` و`n`/`ى`) لأجهزة التقديم
  التي لا ترسل `code`.
- **تشديد §8 المضاف (يعتمد عليه وكيلا اللوحة والجولة):** `nav.js` يمنع مفاتيح
  العرض ونقر الخلفية وسحب اللمس كلما وُجد في المستند
  `[role="dialog"][aria-modal="true"]` — **ولو ضلّ التركيز خارج الطبقة**. لذا:
  جذر اللوحة الطافي **يجب** أن يحمل `role="dialog" aria-modal="true"` (فينال
  الحماية مجاناً)، ودرج الملاحظات **يجب ألا** يحملهما (ليس حوارياً — العرض
  يستمر خلفه). `Escape` وحده يمر عبر هذا الحارس ليصل إلى الطبقة.
- **أولوية Escape أثناء الجولة:** `tour:key("Escape")` يُبث فقط إذا لم يكن
  التركيز داخل `[role="dialog"]` — الطبقة المفتوحة تملك Escape الخاص بها،
  فلا تنهي الجولة عن غير قصد.
- **اللمس أثناء الجولة:** السحب الأفقي يُحوَّل إلى `tour:key("ArrowRight")`
  (التالي في RTL) أو `"ArrowLeft"` — فعلى `tour.js` معالجة مفاتيح الأسهم لا
  أسماء خطوات خاصة.

---

## 3) RH.report — الموجز التنفيذي المطبوع «موجز تنفيذي»

**الملفات:** `src/js/report/report-charts.js` ثم `report-pages.js` ثم `report.js`.
كل الأرقام من `release/derived` حصراً؛ لا سرد جديد — نصوص الرؤى من
`insight_panels` حرفياً، والعناوين من تعريفات الأقسام.

### 3.1 نموذج الصفحات — `RH.report.pages` (report-pages.js)

```js
RH.report.pages.PAGE_IDS
// ["cover","summary","demand","licensing","control","map","initiatives",
//  "kpis","forecast","closing","appendix-tables","provenance"]
// الغلاف وprovenance إلزاميان دائماً ولا يقبلان الإسقاط عبر ?pages=

RH.report.pages.model(release, derived, opts?) → {
  cover: { title, entity|null, releaseId, dataAsOf, generatedAt, sha256Short },
  pages: [{
    id, title, kicker,
    figures: [{ label, value /*منسقة سلفاً*/, unit?, tone?, note? }],  // 3..6
    charts:  [{ builder /*اسم charts2 القانوني §3 من V2_CONTRACTS*/,
                opts?, caption, caveat? }],                            // 0..2
    tables:  [{ title, columns, rows, note? }],                        // 0..2
    insights:[{ cls, title, text }],   // من insight_panels حرفياً — قد تكون []
    caveats: [String],                 // وسوم الصدق الملازمة (انظر أدناه)
  }],
  provenance: { sources, metrics: [{ id, label, value, unit, origin }],
                gates: { total, passed, warnings }, decisions: "انظر ملحق المنهجية" },
}
```

- **وسوم الصدق إلزامية في النموذج ذاته** (تُختبر وحدةً): صفحة `control` تحمل
  caveat منهجية 81.6٪ (`release.compliance.note/status`)؛ صفحة `forecast` تحمل
  `release.scenarios.caveat` نصاً؛ أي جدول أحياء يحمل `meta.sample_label`؛ صفحة
  `map` تحمل `meta.map_disclaimer` وسطر إسناد الحدود؛ `kpis` تعرض current الغائبة
  «تُسجَّل من المنصة — غير متوفرة» صراحة.
- `opts.pages`: مصفوفة معرفات تحصر صفحات الأقسام (الغلاف وprovenance يبقيان).
- الدالة **نقية** (لا DOM) — هي المُختبرة في `report-model.test.mjs`.

### 3.2 لقطات الرسوم — `RH.report.charts` (report-charts.js)

```js
RH.report.charts.snapshot(host, builderName, opts, su) → echarts instance|null
// يبني رسم charts2 القانوني داخل مضيف ثابت المقاس .rpt-chart-host
// (أبعاد صريحة بالبكسل تضبطها report.css: 560×320 قياسياً، 1160×300 للممتد)
// بمفتاح مثيل "rpt:"+builderName — عبر theme.chart حصراً (لا echarts.init).
// حركة صفرية إجبارياً (setOption بعد البناء: animation:false) — لقطة سكونية
// تطبع كما تظهر. builderName خارج القائمة القانونية → null وبطاقة
// «تعذر إدراج الرسم» صادقة (لا صفحة فارغة صامتة).
RH.report.charts.disposeAll()  // يتخلص من مثيلات "rpt:*" عند مغادرة الوضع
```

الرسوم المصغرة داخل الجداول (شرائط KPI، sparklines التغطية) عبر `RH.viz.micro`
(§9) — SVG يطبع نصياً حاداً، لا canvas.

### 3.3 المستند والوضع — `RH.report` (report.js)

```js
RH.report.show(rootEl, route)   // يبني المستند كاملاً داخل #report-root
RH.report.destroy()             // يفرغ الجذر ويتخلص من مثيلات rpt:*
                                // (app.js لا يستدعيها — report.js يراقب مغادرة
                                //  الوضع عبر hashchange الخاص به وينظف ذاتياً)
```

- **البنية:** شريط أدوات علوي `.rpt-toolbar` (لا يُطبع): «طباعة / حفظ PDF» يستدعي
  `window.print()`، «العودة إلى العرض» يوجه إلى `#/section/summary`، وملخص
  الصفحات المحصورة إن وُجد `?pages=`. ثم كومة صفحات `.rpt-doc > .rpt-page` بنسبة
  A4 عمودية RTL: صفحة غلاف، صفحة لكل قسم (أرقامه البارزة + لقطات + رؤى + وسوم
  صدقه)، صفحة/صفحات جداول الملاحق (`appendix-tables`: القطاعات الخمسة، عينة
  الأحياء بوسمها، 14 مؤشراً، 18 مبادرة)، وصفحة الإسناد `provenance` (المصادر،
  أصل كل مقياس ورقةً ومرساة، عداد البوابات، هوية الإصدار وsha).
- **الطباعة (داخل report.css حصراً — print.css المعتمد لا يُلمس):**
  `@page { size: A4; margin: 12mm }`؛ `.rpt-page { break-after: page }`؛
  في `@media print` مع `body.mode-report`: إخفاء `.rpt-toolbar` وكل ما ليس
  `#report-root`، خلفية بيضاء وحبر داكن (الموجز مستند نهاري — رموز `--paper/--ink`
  من tokens.css)، وعلى الشاشة معاينة الصفحات نفسها فوق أرضية المسرح الداكنة.
- **المداخل:** زر HUD (منفذ)، بند لوحة الأوامر (§7)، منشئ الموجز الإداري (§8).
- **لوحة المفاتيح:** الوضع مستند قابل للتمرير الطبيعي — لا اختطاف مفاتيح؛
  Ctrl+K تعمل (منفذ في nav).

---

## 4) RH.explore.scenarios — مستكشف السيناريوهات (ملحق `scenarios`)

**الملف:** `src/js/presenter/appendix/ax-scenarios.js` — يسجل عبر
`RH.presenter.ax.register({ id: "scenarios", … })`.
**نقطة الدخول (الاستثناء المرخص):** زر واحد «استكشاف السيناريوهات» في قسم
`forecast` (`s08-forecast.js`) بنمط أزرار الملاحق القائم في الأقسام —
`ctx.openAppendix("scenarios")` — لا تغيير آخر في القسم.

```js
RH.explore.scenarios = {
  // اشتقاق ترجمة التغطية — نقي ومختبَر: العجز المورّد → نسبة تغطية مكافئة
  coverageFromDeficit(deficitBeds, totalDemand) → Number,   // ((د−ع)/د)×100
  // نموذج الشهر المختار — نقي: صف scenarios.rows[i] → دلتات وترجمات
  monthModel(release, i) → {
    iso, label,
    rows: [{ key:"conservative"|"base"|"optimistic", label, deficit,
             dBase /*الفرق عن الأساسي بالسرير*/, coveragePct, dCoveragePts }],
    spread /*متفائل−متحفظ*/, caveat, status,
  },
}
```

**الصفحات (3):**
1. **المقارنة التفاعلية** — منزلق شهور (`input type=range` على مؤشر
   `scenarios.rows`، `data-interactive`، مسمى aria، يعمل بالأسهم داخله) + ثلاث
   بطاقات سيناريو (المتحفظ/الأساسي/المتفائل بألوانها القائمة في
   `forecastScenarios`: العجز مرجاني الدلالة) + جدول دلتات
   (`layout.tableCard`) وترجمة كل عجز إلى تغطية مكافئة عبر
   `coverageFromDeficit` مع رقاقات `micro.deltaChip`
   (`positiveIsGood:false` للعجز). حالة المنزلق تُكتب `ctx.update({m})`
   فتصمد عبر العودة من الملحق.
2. **شريط الحساسية** — `micro.smallMultiples` بثلاث خلايا sparkline (مسار كل
   سيناريو عبر الأشهر المورّدة) + شريط مدى الانتشار شهرياً (spread) —
   **لا استيفاء ولا مد خارج الأشهر المورّدة**.
3. **لوحة الصدق** — `release.scenarios.caveat` نصاً كاملاً ببطاقة
   `layout.pendingCard`، حالة `supplied_unvalidated`، وما يلزم لاعتمادها
   (توثيق الافتراضات/المالك/الإصدار/التحديث — من نص الـcaveat نفسه لا إنشاءً
   جديداً)، وبيان أن الترجمة إلى تغطية **اشتقاق حسابي تعريفي** من الطلب الكلي
   المعتمد لا تنبؤ جديد.

**محرّم:** أي سيناريو رابع، أي استيفاء بين الأشهر، أي إظهار للقيم دون الـcaveat.

---

## 5) RH.explore.districts — أطلس الأحياء (ملحق `atlas`)

**الملف:** `src/js/presenter/appendix/ax-atlas.js` — `ax.register({ id: "atlas" })`.
**نقطة الدخول:** زر «أطلس الأحياء» في قسم الخريطة (`s05-map.js`) —
`ctx.openAppendix("atlas")`. اختيار حي من القائمة يكتب `ctx.update({d: key})`.

```js
RH.explore.districts = {
  // نقي — يُختبر: يبني نموذج لوحة الحي من فهرس geoutils
  panelModel(entry, release, derived, geo) → {
    name, name_en, sector, sectorName,
    sectorFigures: [{label, value, unit?}],      // من صف القطاع وderived.sector
    sample: null | { rows: [{label, value}], sampleLabel /*meta.sample_label*/ },
    hotspots: [{ km, density }],                  // geoutils.hotspotsNear ≤ 3كم
    honest: null | "لا بيانات على مستوى الحي — القيم المعروضة قطاعية، والحي خارج عينة الأحياء المدرجة",
  },
}
```

**البنية (صفحة واحدة بعمودين):**
- **عمود البحث والقائمة:** حقل بحث (`data-interactive`) بتطبيع
  `geoutils.normalizeAr` + `searchDistricts` على الـ189 حياً (الاسم العربي
  والإنجليزي)، عدّاد نتائج بـ`fmt.int`، قائمة `.atl-list` بأدوار
  `role="listbox"/"option"`: ArrowUp/Down تنقّل، Enter يفتح، Home/End للأطراف،
  التمرير يتبع التركيز — كل ذلك داخل عنصر موسوم `data-interactive` فلا يبلغ
  الكليكر. صف الحي يظهر وسماً صغيراً «ضمن العينة» عند توفر صف عينة.
- **لوحة الحي:** ترويسة الاسم/القطاع؛ خريطة مصغرة SVG خاصة بالأطلس (ترسم عبر
  `geoutils.projector(...).ringPath` كل الأحياء بحياد وتبرز الحي المختار —
  **لا** تعديل على `viz/geomap.js`) مع سطر إسناد الحدود القائم؛ أرقام القطاع؛
  بطاقة العينة بوسم `meta.sample_label` عند التطابق أو **الحالة الصادقة**
  `panelModel().honest` بأسلوب `.pending-card` عند غيابه؛ نقاط التركّز الرقابي
  ضمن 3 كم (عدد ومسافات — «مواقع النقاط توضيحية من سجل المنصة»).
- لا حي مختاراً → لوحة تمهيدية بإحصاءات موزونة فقط من الإصدار (عدد الأحياء
  بالقطاع من geo، إجماليات القطاعات) — لا اختلاق قيم حيّية.

---

## 6) RH.tour — الجولة الموجهة وملاحظات المتحدث

**الملفات:** `src/js/presenter/notes-data.js` ثم `src/js/presenter/tour.js`.

### 6.1 جدول الملاحظات — `RH.presenter.notesData`

```js
RH.presenter.notesData = {
  version: "1",
  sections: {  // مفتاح لكل معرف في engine.LINEAR (‏"00" ثم الأقسام التسعة)
    "<id>": {
      headline: String,          // سطر افتتاح المتحدث
      points: [String],          // 3..6 نقاط حديثية
      transition: String,        // جملة العبور للقسم التالي ("" للخاتمة)
      sourceRefs: [String],      // معرفات لوحات الرؤى/المقاييس التي صيغت منها
    },
  },
}
```

**قاعدة التأليف الصارمة:** النقاط تُصاغ من نصوص `insight_panels` المعتمدة
وتسميات المقاييس القائمة **حصراً — لا أرقام جديدة**: كل رقم يرد في نقطة يجب أن
يظهر حرفياً (بتنسيقه) في نص لوحة رؤى معتمدة أو أن يكون قيمة مقياس منشورة تمر
عبر `RH.core.fmt`. `notes-data.test.mjs` يتحقق: تغطية كل معرفات `LINEAR`،
وأن كل رقم في النقاط موجود في مجمع نصوص/قيم الإصدار.

### 6.2 الجولة والدرج — `RH.tour` (tour.js)

```js
RH.tour.start(opts?)      // يبدأ من القسم الحالي أو من أوله — يضبط body.tour-active
RH.tour.stop()            // ينهي ويزيل الطبقة ويعيد الحالة
RH.tour.active() → Boolean
RH.tour.notes = { toggle(), open(), close(), isOpen() }
```

- **الإقلاع:** IIFE الملف يشترك في `bus.on("notes:toggle", …)` و
  `bus.on("tour:key", …)` مرة واحدة (مستمعان دائمان على مستوى التطبيق — لا
  يتراكمان لأن الملف يُحمَّل مرة).
- **نقطة الدخول:** زر «جولة موجهة» على الغلاف (`s0-cover.js`) بنمط أزرار الغلاف
  القائمة يستدعي `RH.tour.start()` — الاستثناء المرخص الوحيد في الغلاف.
- **الجولة:** خطوة لكل معرف في `engine.LINEAR` (تتبع التسلسل الحي — لا قائمة
  منسوخة). كل خطوة: يوجه `engine.goScene(id)` ثم يعرض شريط `.tour-bar` (أسفل
  المسرح): اسم الخطوة/العداد بـ`fmt.int`، نقاط `notesData` للقسم، أزرار
  التالي/السابق/إنهاء. مفاتيح العرض تصل عبر `tour:key` (منفذ في nav): التالي/
  السابق يقلبان **الخطوات**، Escape ينهي. لا خطوات فرعية داخل القسم (الجولة
  تمر على القسم بحالته الأولى step=0).
- **درج الملاحظات:** `.tour-notes` لوح جانبي زجاجي يعرض ملاحظات القسم الحالي؛
  يتزامن مع تغير المسار (مستمع `hashchange` خاص به يقرأ `engine.current()`)؛
  N يبدّله (منفذ في nav)؛ زر إغلاق مرئي؛ `aria-live="polite"` لتغير المحتوى.
  الدرج **لا** يوقف الكليكر (ليس حوارياً) — العرض يستمر والدرج يلحق.
- **حركة:** `REDUCED` → لا انزلاق، ظهور/إخفاء فوري. الطبقات تُزال كلياً في
  `stop()` وعند دخول الإدارة/الموجز (يراقب `hashchange`).

---

## 7) RH.palette — لوحة الأوامر (Ctrl+K)

**الملف:** `src/js/presenter/palette.js`. الإقلاع: اشتراك وحيد في
`bus.on("palette:toggle", …)`.

```js
RH.palette = {
  open(), close(), toggle(), isOpen() → Boolean,
  // نقي — يُختبر في palette-index.test.mjs:
  buildIndex(release, derived, geo, sections /*RH.sections.list()*/) → [Entry],
  search(index, query, limit=12) → [Entry],   // ترتيب: درجة ثم نوع ثم عنوان
}
Entry = { kind: "section"|"appendix"|"district"|"metric",
          id, title, sub?, norm /*نص مطبع للمطابقة*/,
          answer? /*للمقاييس: {value, unit?, source, caveat?}*/ }
```

- **الفهرس:** الأقسام التسعة + الغلاف؛ الملاحق القانونية (demand، licensing،
  monitoring، pillar، kpi، scenarios، atlas، methodology، decisions) بعناوينها؛
  الـ189 حياً (تفعيلها يفتح `#/appendix/atlas?d=<key>`)؛ المقاييس: كل
  `release.metrics` و`release.derived` القياسية بعناوينها — **إجابة المقياس
  تُعرض سطراً داخل النتيجة**: القيمة عبر `fmt` + الوحدة + مرساة المصدر
  (`sheet!anchor` للخام، «مشتق (صيغة)» للمشتق) + زر «الانتقال إلى القسم»؛
  المقاييس الموسومة تحمل وسمها داخل الإجابة (81.6٪ بمنهجيتها، السيناريوهات
  بـcaveat) — **الوسم يسافر مع الرقم حيثما ظهر**.
- **المطابقة:** `geoutils.normalizeAr` للطرفين؛ درجات: تطابق تام > بادئة >
  بادئة كلمة > احتواء > تتابع حروف؛ التعادل يفصله النوع (قسم > ملحق > مقياس >
  حي) ثم الترتيب الأبجدي.
- **الحداثة:** آخر 8 تفعيلات تُعرض عند فتح اللوحة فارغةَ الاستعلام — تُحفظ في
  `localStorage["rh.palette.recent"]` داخل try/catch (file:// قد يمنعها —
  السقوط: ذاكرة الجلسة).
- **الواجهة:** `.pal-veil` جذرها `role="dialog" aria-modal="true"` (فيمنع
  `isInteractive` الكليكر تلقائياً)؛ التركيز يدخل حقل البحث فور الفتح ويعود
  لعنصر التركيز السابق عند الإغلاق؛ ArrowUp/Down تنقّل النتائج
  (`aria-activedescendant`)، Enter يفعّل، Escape يغلق، نقر الخلفية يغلق؛
  مفاتيحها الداخلية `stopPropagation`. التفعيل الملاحي: أقسام عبر
  `engine.goScene`، ملاحق عبر `engine.openAppendix` (من داخل مشهد) أو
  `router.go` المباشر (من الموجز/الغلاف)، والموجز `#/report`.

---

## 8) الملاحق الجديدة: المنهجية وسجل القرارات

كلاهما عبر `RH.presenter.ax.register` — يرثان هيكل الصفحات والعودة السياقية
ومفاتيح التقليب مجاناً. **نقاط الدخول:** بندا لوحة الأوامر (تلقائي من فهرسها)،
وزر «منهجية البيانات» في ملحق أو قسم الخاتمة (`s09-closing.js` — زر واحد بنمطه
القائم `ctx.openAppendix("methodology")`)؛ `decisions` يُفتح من الخاتمة كذلك
(`ctx.openAppendix("decisions")`) — الوكيل ذاته يضيف الزرين معاً بتعديل واحد.

### 8.1 `ax-methodology.js` (ملحق `methodology`، بادئة `mth-`)

الصفحات (4):
1. **هوية الإصدار والمصادر** — `release.release` (المعرف/التاريخ/sha مختصراً عبر
   قالب ثابت)، `release.sources` كاملة، فترة الرصد وتاريخ الحساب من `meta`.
2. **أصل كل مقياس** — جدول شامل يبنيه امتداد لفكرة `ax.provenanceRows` (ينفذه
   الملحق محلياً دون تعديل ax-shell): كل `metrics` (ورقة/مرساة/مصدر) وكل
   `derived` (الصيغة وإصدارها) — الأرقام عبر `fmt`، النصوص عبر `esc`.
3. **بوابات التحقق حيّاً** — يستدعي `RH.data.validate.validateRelease(release)`
   وقت البناء ويعرض العد الحقيقي (المجتاز/الكلي — الرقم 152 يأتي من الفحص الحي
   لا من ثابت مكتوب)، الإنذارات المفتوحة نصاً، وشرحاً عرضياً موجزاً لفلسفة
   «الحجب مقابل الإنذار».
4. **قرارات المطابقة R1–R12** — جدول ثابت التأليف منقول بصياغة عرضية من
   `docs/DATA_RECONCILIATION.md` §3 (المعرف/الموضوع/القرار/الحالة: مفتوح أو
   محسوم — بما فيها حسم R4/R5 بتوجيه العميل وبقاء R1/R2/R8 مفتوحة) —
   الجدول بيانات ثابتة داخل الملف (const) لأن المصدر وثيقة لا إصدار؛ ممنوع
   إعادة صياغة تُغيّر منطوق قرار.

### 8.2 `ax-decisions.js` (ملحق `decisions`، بادئة `dcs-`)

«سجل القرارات المطلوبة» — من التوصيات المعتمدة في `insight_panels` **حصراً**
(البطاقات ذات `status:"approved_brief"` التي تتضمن توصية/إجراء):

```js
// نقي — يُختبر: يشتق سجل القرارات من لوحات الرؤى المعتمدة دون أي نص جديد
RH.explore = RH.explore || {};
RH.explore.decisionsModel(release) → [{
  id,                 // معرف بطاقة الرؤية المصدر (sd1…)
  section, sectionTitle,
  decision,           // «قرار مطلوب» — منطوق التوصية من نص البطاقة
  impact,             // «أثره» — الجزء التقريري من نص البطاقة ذاته
  source,             // «مصدره» — عنوان البطاقة + مفتاح القسم
  cls,                // pos|neg|warn|neu من البطاقة (مفردات مقفلة)
}]
```

الصياغة تقسيم لنص البطاقة القائم لا إنشاء: `decision` و`impact` جملتان من نص
البطاقة نفسه (أو النص كاملاً في خانة الأثر حين لا تنقسم الجملة بأمان).
بطاقة بلا مضمون توصية تُستبعد. `next_steps` حالتها `pending_approval` — تُعرض
بطاقتها الصادقة «لا خطوات معتمدة بعد» (`layout.pendingCard`) أسفل السجل ولا
يُخترع منها قرار. العرض: جدول كثيف + بطاقات مجمعة بالأقسام، ترشيح بالتصنيف
(أزرار `role="tab"`).

---

## 9) RH.viz.micro — مكتبة الرسوم المصغرة (منفَّذة — هذا عقدها الملزم)

**الملف:** `src/js/viz/charts-micro.js` (SVG/DOM نقي — لا ECharts ولا canvas:
تُطبع حادة في الموجز وتعمل في بيئة اختبار الوحدة). الأنماط `mcr-` في
`src/styles/micro.css`. كل الألوان من رموز tokens عبر أصناف نغمة مقفلة:
`t-pos` أخضر، `t-demand` رملي، `t-neg` مرجاني (عجز/مخالفات حصراً)، `t-gold`
ذهبي (مستهدف/خط أساس حصراً)، `t-blue` أزرق ثانوي، `t-neu` محايد.

```js
RH.viz.micro.sparkline(el, {
  su,                       // إلزامي
  values,                   // [Number|null] — null فجوة صادقة تقطع الخط
  ariaLabel,                // إلزامي — غيابه يجعل الرسم aria-hidden زخرفياً
  tone = "pos", area = false, markLast = false,
  width = 220, height = 56, // وحدات منطقية (viewBox) — العرض يتمدد مع المضيف
  target,                   // { value, label? } — خط ذهبي متقطع (مستهدف حصراً)
  fmt,                      // منسق قيمة العلامة الأخيرة (افتراضي fmt.int)
}) → SVGSVGElement          // مصفوفة فارغة/كلها null → عنصر .mcr-empty «—»

RH.viz.micro.microBars(el, {
  su, items,                // [{ label, value, tone? }] — 1..12
  ariaLabel,                // إلزامي
  max,                      // سقف الشريط (افتراضي أقصى قيمة موجبة)
  fmt,                      // منسق القيمة المعروضة (افتراضي fmt.int)
  tone = "pos",             // النغمة العامة؛ tone الصف يتقدم عليها
}) → HTMLElement (.mcr-bars)

RH.viz.micro.deltaChip(el, {
  value,                    // Number|null — null/0 → «—» محايدة
  fmt,                      // منسق المقدار المطلق (افتراضي fmt.int)
  positiveIsGood = true,    // false للعجز/المخالفات: الزيادة مرجانية والنقص أخضر
  label, title,             // نص مرافق واختياري tooltip (title attr)
}) → HTMLElement (.mcr-delta.pos|.neg|.neu)  // السهم ▲/▼ مع عزل اتجاهي

RH.viz.micro.ratioBar(el, {
  su, pct,                  // 0..100 (تُقصّ بصمت خارجها مع title صادق)
  ariaLabel,                // إلزامي
  tone = "pos", fmt,        // منسق النص (افتراضي fmt.pct)
  target,                   // { pct, label? } — شاخص ذهبي (مستهدف حصراً)
  note,                     // سطر وسم ملازم (منهجية 81.6٪ تمرر هنا إلزامياً)
}) → HTMLElement (.mcr-ratio)   // بديل الgauge المحرّم — شريط أفقي حصراً

RH.viz.micro.smallMultiples(el, {
  su, items, renderCell,    // renderCell(cellEl, item, i) يبني كل خلية
  cols,                     // افتراضي: 3 حتى 6 عناصر، وإلا 4
  ariaLabel, title,
}) → { el, cells, update(items) }   // update يعيد بناء الخلايا بنفس الشبكة
```

- المكتبة **لا تنسق أرقاماً بنفسها** — كل نص قيمة يمر عبر `fmt` الممرر (وافتراضاته
  من `RH.core.fmt`)، وكل نص تسميات عبر `textContent` (لا innerHTML).
- سكونية بالكامل: لا حركة ولا مستمعين ولا مؤقتات — لا شيء يحتاج teardown.
- عقد الدلالة على المستدعي: `t-neg` للعجز/المخالفات حصراً، `target` و`t-gold`
  للمستهدف/خط الأساس حصراً — المدقق البشري يرفض أي استخدام آخر.

---

## 10) RH.viz.geoutils — أدوات الجغرافيا المشتركة (منفَّذة — هذا عقدها الملزم)

**الملف:** `src/js/viz/geomap-utils.js` — منطق نقي (لا DOM إطلاقاً)؛
`viz/geomap.js` المعتمد **لم يُمس** (يحتفظ بنسخه الداخلية — التطابق مضمون
باختبار وحدة يقارن التطبيعين على أسماء عينة الأحياء).

```js
RH.viz.geoutils = {
  SECTOR_ORDER,                       // ["north","east","center","west","south"]
  normalizeAr(s) → String,            // تطبيع بحث شامل: تشكيل/تطويل/همزات/ة/ى
                                      // + خفض اللاتينية — للمطابقة الحرة (لوحة/أطلس)
                                      // ترتيبه يضم الفراغات ويقصّها **قبل** حذف
                                      // بادئة «حي» (استعلام المستخدم قد يبدأ
                                      // بفراغ فتفشل المرساة ^) — بخلاف
                                      // normDistrict الذي يحفظ ترتيب geomap حرفياً
  normDistrict(s) → String,           // مرآة normName في geomap حرفياً:
                                      // [أإآ]→ا، ة→ه، ى→ي، حذف «حي » البادئة
  districtIndex(geo, release, derived?) → [{
    key,                              // "<sector>:<normDistrict(name)>" — معرف ثابت
    name, name_en, sector, sectorName, centroid, rings,
    sectorRow,                        // صف القطاع من release.sectors
    sectorDerived,                    // من derived.sector إن مُرر derived
    sample,                           // صف عينة الأحياء المطابق أو null
    norm, normEn,                     // نصا مطابقة جاهزان
  }],                                 // بترتيب SECTOR_ORDER ثم ترتيب الملف
  findByKey(index, key) → entry|null,
  searchDistricts(index, query, limit=12) → [entry],  // درجات: تام>بادئة>
                                      // بادئة كلمة>احتواء>إنجليزي>تتابع
  distanceKm(a, b) → Number,          // haversine على [lat,lng]
  hotspotsNear(geo, centroid, radiusKm=3) → [{sector,density,lat,lng,km}],
                                      // تصاعدياً بالمسافة، km بدقة عشرية واحدة
  sectorCentroid(geo, sectorId) → [lat,lng]|null,   // متوسط مراكز الأحياء
  projector(bounds, viewWidth=1000) → {
    w, h, px(lng), py(lat),           // إسقاط متساوي البعد بتصحيح جيب التمام
    ringPath(rings) → String,         // سلسلة d جاهزة لـ<path> (مرآة geomap)
  },
}
```

قاعدة الاستهلاك: الأطلس واللوحة والموجز يبنون فهارسهم عبر هذه الأدوات حصراً —
ممنوع نسخ منطق تطبيع/إسقاط جديد في ملفات الميزات.

---

## 11) الإدارة: منشئ الموجز ومقارن الإصدارات

**نقطة الدخول (تعديل مرخص واحد في `admin/shell.js` ينفذه وكيل الإدارة):**
إضافة تبويبين إلى `TABS` وحالتي switch — لا شيء آخر يتغير في shell:

```js
{ id: "report", name: "منشئ الموجز" },     // ليس في needDraft
{ id: "diff",   name: "مقارنة الإصدارات" }, // ليس في needDraft
case "report": return RH.admin.reportBuilder.render(content, session);
case "diff":   return RH.admin.diffViewer.render(content, await RH.data.store.getDraft());
```

### 11.1 `report-builder.js` — `RH.admin.reportBuilder`

```js
RH.admin.reportBuilder.render(content, session)
RH.admin.reportBuilder.selection() → [pageId]        // الاختيار الحالي المرتب
```

- قائمة صناديق اختيار لصفحات الأقسام من `RH.report.pages.PAGE_IDS` (الغلاف
  وprovenance موسومان «إلزامي» ومعطلا الإسقاط)، بالحفاظ على الترتيب القانوني.
- **معاينة حية:** يبني نموذج `RH.report.pages.model(release, derived,
  {pages})` ويعرض ملخص كل صفحة (عدد الأرقام/الرسوم/الجداول + وسوم الصدق) داخل
  بطاقات `.adf-preview` — المعاينة بنموذج البيانات لا برسم كل المستند داخل
  الإدارة (الرسم الكامل وظيفة وضع `#/report` نفسه).
- «فتح الموجز للطباعة» → `#/report?pages=…` بالاختيار الحالي.
- الاختيار يُحفظ `localStorage["rh.report.pages"]` داخل try/catch.
- غياب `RH.report` (بناء جزئي) → بطاقة صادقة «وحدة الموجز غير مضمنة بعد».

### 11.2 `diff-viewer.js` — `RH.admin.diffViewer`

```js
RH.admin.diffViewer.diff(base, other, opts?) → [{
  path,                       // "metrics.total_demand.value" — مسار نقطي
  kind: "added"|"removed"|"changed",
  from, to,                   // القيم البدائية (عرضها عبر fmt/esc عند الرسم)
  group,                      // المفتاح الأعلى ("metrics"، "strategy"…)
}]                            // نقية ومختبرة في diff-model.test.mjs
RH.admin.diffViewer.render(content, draft)
```

- المشي العميق: كائنات بالمفاتيح؛ المصفوفات ذات عناصر بـ`id` تُطابق بالمعرف
  (إضافة/حذف/تغيير عنصر)، وإلا بالفهرس؛ حقول الجذر التشغيلية
  (`release.sha256`، `published_at`، `draft_version`…) تُستثنى افتراضياً
  (opts.ignore قابلة للتوسعة).
- العرض: «المسودة الحالية مقابل الإصدار المنشور» حقلاً حقلاً، مجمّعاً بالمفاتيح
  العليا مع عدادات لكل مجموعة (`fmt.noun` للتطابق العددي)، تمييز لوني: إضافة
  خضراء، حذف مرجاني (خلل محتمل)، تغيير رملي — والقيم الرقمية تُعرض بتنسيق
  `fmt` المناسب ونصوصها عبر النصوص الآمنة (`textContent`).
- لا مسودة → بطاقة صادقة «لا مسودة مفتوحة — المقارنة تتطلب مسودة» بنمط
  البطاقة القائمة في shell.

---

## 12) بوابات القبول لكل وكيل توسعة (قائمة تسليم إلزامية)

1. `node --check` أخضر لكل ملف JS جديد أو معدَّل.
2. `python3 build.py` أخضر — وقائمة «الملفات غير الموجودة» تتقلص لا تتسع.
3. `node --test tests/unit/` أخضر بالكامل (القائم + الجديد).
4. لا لمس لملفات خارج عقد الميزة؛ نقطة الدخول المرخصة تعديل واحد محدد أعلاه.
5. تشغيل بصري من `file://index.html`: الميزة تعمل دون اتصال، والعودة منها تعيد
   حالة المستدعي، ولا انحراف بصري في الأقسام المعتمدة.
6. وسوم الصدق حاضرة في كل ظهور للقيم الموسومة (81.6٪، السيناريوهات، العينة،
   إخلاء الخريطة) — تدقيق يدوي إلزامي قبل التسليم.

---

## 13) حالة تنفيذ الأسس المشتركة (سُلّمت — نقطة الانطلاق لوكلاء الميزات)

كل ما في هذا القسم **موجود وأخضر الآن**؛ يبني عليه وكلاء الميزات ولا يعيدون
كتابته ولا يعدّلونه.

| الملف | الحالة | ما يقدّمه |
|---|---|---|
| `src/js/viz/charts-micro.js` | ✅ منفَّذ (270 سطراً) | `RH.viz.micro` بخمس دوال (§9) |
| `src/js/viz/geomap-utils.js` | ✅ منفَّذ (217 سطراً) | `RH.viz.geoutils` كاملاً (§10) |
| `src/styles/micro.css` | ✅ منفَّذ | نغمات `t-*`، حبر يتبدّل مع الوضع، قواعد طباعة |
| `src/styles/chrome-ext.css` | ✅ منفَّذ | موضع زرّي HUD ورقاقة الاختصار |
| `src/js/core/ns.js` | ✅ معدَّل | `RH.explore = {}` مُنشأ سلفاً |
| `src/js/core/router.js` | ✅ معدَّل | تحليل وتسلسل `#/report` |
| `src/js/app.js` | ✅ معدَّل | وضع `mode-report`، جذر كسول، احتياطي آمن، `restorePresenter` |
| `src/js/presenter/nav.js` | ✅ معدَّل | `Ctrl+K`، `N`، حارس الجولة، تشديد الطبقات المشروطة |
| `src/js/presenter/chrome.js` | ✅ معدَّل | `buildExtras()`/`syncExtras()` وزرّا الدخول |
| `build.py` | ✅ معدَّل | 12 خانة JS و9 خانات CSS + تسامح CSS الغائب |
| `tests/unit/load-app.mjs` | ✅ موسَّع | تحميل الأساسين + `freshGeo` وأدوات فحص DOM |

**الأحداث المتاحة على الناقل الآن** (يبثها `nav.js`/`chrome.js`، ولا مشترك لها
بعد — أول مشترك يملكها):

| الحدث | الحمولة | المُصدِر | المالك المرتقب |
|---|---|---|---|
| `palette:toggle` | — | `Ctrl+K`، زر `#hud-palette` | `palette.js` |
| `notes:toggle` | — | مفتاح `N` | `tour.js` (الدرج) |
| `tour:key` | اسم المفتاح | مفاتيح العرض والسحب أثناء `body.tour-active` | `tour.js` |

**ما يتبقى على كل وكيل ميزة:** ملفات ميزته وملف CSS الخاص بها من الخانات
المحجوزة (§1) — الخانة موجودة في `build.py` وتنتظر الملف، فبمجرد كتابته يدخل
البناء دون تعديل أي ملف مشترك. `python3 build.py` اليوم يطبع بصدق 12 ملف JS
و8 ملفات CSS «غير موجودة بعد» — **هذه القائمة يجب أن تتقلص لا أن تتسع**.
