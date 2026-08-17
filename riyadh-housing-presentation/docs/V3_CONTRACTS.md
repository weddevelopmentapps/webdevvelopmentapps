# V3_CONTRACTS.md — عقود أساسات V3 (المرجع الملزم لوكلاء التبويبات)

**الحالة:** سارٍ · كتبه معمار أساسات V3 بعد تسليم الطبقات الست.
**يُقرأ مع:** `docs/V3_SPEC.md` (الموجز الملزم — يتقدّم على هذا الملف عند أي تعارض)،
و`docs/V2_CONTRACTS_EXPANSION.md` (ميزات التوسعة باقية كما هي).
**يَنسخ:** كل ما يخالفه في `docs/V2_CONTRACTS.md` و`docs/REVAMP_SPEC.md`.

**البوابات المحققة عند التسليم:** `152/152` بوابة بيانات · `759/759` اختبار وحدة
(منها بوابتا V3 الجديدتان: حد نص الإبراز 320 حرفاً وعقد مبدّل السمة) ·
`python3 build.py` أخضر · `node --check` على كل ملف جديد · كونسول نظيف على
`file://` · صفر تمرير أفقي · **صفر لون مكتوب يدوياً خارج `tokens.css`**.

---

## 0) خريطة الأساسات المُسلَّمة

| # | الطبقة | ملفات JS | CSS (بادئة → ملف) | الفضاء |
|---|---|---|---|---|
| 1 | نظام السمة | `src/js/core/theme-mode.js` | `src/styles/tokens.css` | `RH.core.themeMode` |
| 2 | ثيم الرسوم | `src/js/viz/theme.js` (مُعاد كتابته) | — | `RH.viz.theme` |
| 3 | عدّة الهوية | `src/js/brand/brand.js` | `brand-` → `src/styles/brand.css` | `RH.brand` |
| 4 | قشرة التبويبات | `src/js/presenter/tabs.js` | `tabs-`/`tabtrack-`/`tabx-`/`tab-` → `src/styles/tabs.css` | `RH.tabs` |
| 5 | نافذة الإبراز | `src/js/presenter/highlight.js` | `hl-` → `src/styles/highlight.css` | `RH.highlight` |
| 6 | الملاحة والبناء | `core/router.js`، `presenter/engine.js`، `app.js`، `src/markup.html`، `build.py` | — | — |

**ملفات مُعدَّلة تعديلاً هيكلياً (لا يُعاد فتحها إلا بإذن المعمار):**
`core/router.js` (نوع `tab`)، `presenter/engine.js` (`hasAppendix`، أصل حالة
العودة، حارس `layout`)، `app.js` (توزيع المسارات)، `tests/unit/load-app.mjs`
(محاكاة `localStorage`/`matchMedia`/`documentElement`)، `build.py`.

**28 ملف CSS** مرّت بتدقيق آلي (`667` قيمة لونية مستبدَلة) — لم يبقَ أي
`#hex` ولا `rgb()`/`rgba()` عددي خارج `tokens.css`.

---

## 1) نظام السمة (V3_SPEC §1)

### 1-أ) الحالات الثلاث

```js
RH.core.themeMode.init()        // يُستدعى مرة واحدة، أول سطر في boot()
RH.core.themeMode.get()         // "light" | "dark" | "auto"   (الافتراضي "auto")
RH.core.themeMode.effective()   // "light" | "dark"            (بعد حساب auto)
RH.core.themeMode.set(mode)     // يحفظ + يطبّق + يبثّ · يرمي على وضع مجهول
RH.core.themeMode.toggle()      // فاتح ⇄ داكن (يخرج من auto بأول نقرة)
RH.core.themeMode.label()       // نص الزر: يصف **الفعل المقبل** لا الحالة
RH.core.themeMode.KEY           // "rh:theme"
```

- `"auto"` **لا يكتب** `data-theme` على `<html>` إطلاقاً؛ يحكم عندها
  `@media (prefers-color-scheme: dark)` في `tokens.css` وحده. لذلك **الفاتح
  هو الافتراضي** على كل جهاز لا يطلب الداكن صراحةً.
- الاختيار الصريح يكتب `data-theme="light|dark"` ويُحفظ في `localStorage`.
- سكربت تمهيد صغير في `<head>` (داخل `src/markup.html`) يطبّق المحفوظ قبل أول
  طلاء فلا تومض المنصة بلون خاطئ. **أي تعديل على مفتاح التخزين يجب أن يطابقه.**
- كل تغيّر يبثّ على الناقل:

```js
RH.core.bus.on("theme:change", ({ mode, effective, previous }) => { … });
```

### 1-ب) الرموز — `src/styles/tokens.css` هو المصدر الوحيد

اللوحة الفاتحة كاملة على `:root`؛ الداكنة يُعاد تعريفها في كتلتين متطابقتين:
`:root[data-theme="dark"]` و`@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }`.
**هذا الملف هو الموضع الوحيد في المشروع المسموح فيه بتكرار قيم لونية.**

| المجموعة | الرموز |
|---|---|
| الأسطح | `--paper` `--surface` `--surface-2` `--surface-3` `--line` · وأسماء المسرح التاريخية `--stage-abyss` `--stage-0..3` (صارت طبقات ارتفاع) |
| الحبر | `--ink` `--ink-2` `--ink-3` `--ink-4` · وأسماؤه التاريخية `--ivory` `--ink2-d` `--mut-d` `--faint-d` `--ink2` `--mut` `--faint` |
| الشعيرات | `--hair` `--hair2` `--hair-d` `--hair-d2` |
| الهوية | `--brand` `--brand-deep` `--brand-teal` `--brand-ink` `--on-accent` `--on-invert` `--invert-bg` `--invert-bg-hi` |
| المعنى | `--green` `--green-hi` `--green-dim` `--demand` `--demand-hi` `--coral` `--coral-dim` `--gold` `--gold-hi` `--collar-blue` `--blue-hi` |
| الحالات | `--ok` `--warn` `--bad` `--info` · ولكنة الإدارة `--accent` `--accent2` `--deep` `--accent-soft` `--accent-softer` |
| التدرّج | `--seq-1..5` `--seq-viol-1..5` |
| التلميح | `--tip-bg` `--tip-fg` `--tip-mut` `--tip-line` |
| الغلاف | `--cover-1..4` |
| الظل والحجاب | `--shadow` `--shadow-rgb` `--scrim-rgb` `--mask-solid` |
| قنوات RGB | `--ink-rgb` `--ink-3-rgb` `--base-rgb` `--surf-1..3-rgb` `--brand-rgb` `--accent-rgb` `--green-rgb` `--green-hi-rgb` `--demand-rgb` `--coral-rgb` `--gold-rgb` `--blue-rgb` `--ok-rgb` `--warn-rgb` `--bad-rgb` `--info-rgb` |
| الطباعة الثابتة | `--print-paper` `--print-ink` `--print-line` `--print-green` `--print-demand` `--print-gold` `--print-coral` `--print-blue` `--print-on-accent` |

**قاعدة الشفافية:** كل موضع كان فيه `rgba(R,G,B,a)` صار
`rgba(var(--X-rgb), a)` — فتتبع الشفافيات السمة تلقائياً. **لا تكتب ثلاثياً
عددياً جديداً**؛ إن لزمك رمز جديد بشفافية، اطلب قناة `-rgb` من المعمار.

### 1-ج) اللوحتان معايَرتان — لا تُعدَّل قيمة دون إعادة الفحص

كل زوج (حبر × سطح) يجتاز `4.5:1`، وكل علامة بيانية على كل سطح تجتاز `3:1`،
على **الأرضيتين**. الفصل الدلالي محفوظ: `ΔE(ذهبي↔برونزي)` = 30.0 فاتح · 20.9 داكن؛
`ΔE(أخضر↔مرجاني)` = 92.7؛ `ΔE(أخضر↔أزرق)` = 57.0.
تغيير أي قيمة يستلزم إعادة تشغيل مدقّق اللوحة على الأرضيتين قبل الاعتماد.

### 1-د) الممنوع المطلق

> **ممنوع كتابة أي لون (`#hex`، `rgb()`، `rgba()`، اسم لون CSS) داخل قاعدة
> مكوّن في أي ملف CSS، وداخل أي سلسلة نمط في JS.**

فحص التسليم (يجب أن يعيد **صفراً**):

```bash
grep -nEi '#[0-9a-f]{3,8}\b|rgba?\(\s*[0-9]' src/styles/*.css src/styles/sections/*.css \
  | grep -v '^src/styles/tokens.css'
```

استثناءان موثّقان لا ثالث لهما:

1. **الموجز التنفيذي المطبوع** ورقيّ دائماً داخل `@media print` ويستعمل رموز
   `--print-*` — وهي رموز في `:root` لا أرقاماً في المكوّن.
2. **جدول `TOKENS` في `viz/theme.js`** يحمل قيمة احتياطية لكل رمز، تُستعمل
   حصراً حين لا يتوفر `getComputedStyle` (سياق اختبار الوحدة، أو نداء قبل
   إلحاق الأنماط). القيم **مرآة حرفية** للوحة الفاتحة في `tokens.css`؛
   أي تعديل على رمز هناك يجب أن يُحاكى هنا في السطر المقابل.
   لا يجوز إضافة أي لون آخر في JS — لا في نمط سلسلة ولا في خيار رسم.

---

## 2) ثيم الرسوم وقانون التلميح — `RH.viz.theme`

### 2-أ) اللوحة الحيّة `T.C`

`C` **لا يُستبدل أبداً**؛ يُعاد ملؤه في مكانه من الرموز الحية عند كل
`theme:change`. لذلك `const T = RH.viz.theme;` ثم `T.C.green` داخل صياغة
(formatter) يقرأ القيمة الصحيحة دائماً بلا سطر إضافي.

مفاتيحه: `green greenHi demand demandHi coral gold goldHi blue blueHi brand
brandTeal brandDeep ivory ink2 mut faint stage1 stage2 stage3 line tipBg tipFg
tipMut ok warn bad info` · مصفوفتان `seq[5]` و`seqViol[5]` · ومشتقات
`axLine axSplit plateEdge shadowRgb`.

> **لا تنسخ قيمة من `C` إلى ثابت وحدةٍ عند التحميل.** اقرأها وقت البناء أو
> وقت النداء، وإلا تجمّدت على سمة الإقلاع.

### 2-ب) قانون التلميح الإلزامي (V3_SPEC §3 — شكوى العميل الحرفية)

**كل منشئ رسم ملزم بـ:**

```js
tooltip: Object.assign(T.tooltip(su), {
  formatter: (p) => T.ttMicro(p.name, fmt.int(p.value), "سرير"),
})
```

`T.tooltip(su)` يحقن — ولا يجوز إلغاء أيٍّ منها:

| البند | القيمة | السبب |
|---|---|---|
| `confine` | `true` | لا يخرج الصندوق عن القماش |
| `position` | `T.ttPosition` | يُلصق التلميح بالحافة الأفقية **المقابلة** لموضع المؤشر ويقيّده رأسياً |
| `max-width` | `260px` | حد العرض الملزم |
| `pointer-events` | `none` | لا يعترض التحويم |
| الألوان | `--tip-bg`/`--tip-fg` | تتبع السمة |

`T.ttMicro(title, value, unit)` = **سطران لا أكثر**: عنوان + قيمة واحدة.
`T.ttRow`/`T.ttTitle` (متعددة الأسطر) **ممنوعة في التبويبات** — تبقى للملاحق
والموجز حيث السطح تفصيلي لا تحويم مسرح.
كل نص يمرّ من ورقة الإصدار يُعقَّم بـ`T.esc` قبل الحقن في HTML التلميح.

**فحص القانون:** بمؤشر في النصف الأيسر من قماش عرضه 800 وصندوق عرضه 240،
`ttPosition` يعيد `x = 548`؛ وبمؤشر في النصف الأيمن يعيد `x = 12`. أي بناء
يخالف ذلك يسقط في فحص التلميح الآلي (V3_SPEC §7).

### 2-ج) دورة حياة المثيلات وإعادة الصبغ

```js
T.chart(id, el)        // المنفذ **الوحيد** لإنشاء مثيل — لا echarts.init مباشرة
T.disposeById(id)      // إتلاف مثيل بمعرفه
T.disposeAll()  T.resizeAll()
T.refreshAll()         // يُستدعى تلقائياً عند theme:change
T.onRetheme(fn)        // خطاف إعادة بناء كامل — يعيد دالة إلغاء التسجيل
```

`refreshAll()` يعمل على ثلاث مراحل: (1) إعادة قراءة الرموز، (2) استبدال حرفي
لقيم اللوحة القديمة بالجديدة داخل شجرة خيارات كل مثيل حي ثم `setOption(…, true)`،
(3) تنفيذ خطافات `onRetheme`. قشرة التبويبات مسجَّلة في (3) فتعيد بناء التبويب
الحالي كاملاً — وبذلك تلحق العناصر المرسومة بـSVG/DOM (`RH.viz.micro`،
`RH.viz.rings`، الخريطة) باللوحة الجديدة أيضاً.

**داخل التبويبات لا تستدعِ `T.chart` مباشرة** — استعمل `ctx.chart(name, el)`
(§4-ج) كي يُتلف المثيل تلقائياً عند مغادرة التبويب.

---

## 3) عدّة الهوية — `RH.brand`

```js
RH.brand.pattern(el, { opacity = 0.10, angle = 18, size = 132, tone = "brand" })
   // يرسم طبقة متوازيات الأضلاع المتراكبة (SVG مطلق الموضع، aria-hidden)
   // يعيد دالة تنظيف → سجّلها في ctx.onTeardown
RH.brand.logo(el, { variant: "full" | "mark" | "white", sub, label })
RH.brand.lockup({ title, subtitle, variant, actions, pattern })
   // → { el, actionsEl, logoEl, teardown() }
RH.brand.markSvg(mono)          // العلامة المرسومة كوداً وحدها
RH.brand.hasOfficialAssets()    // هل ضُمِّن أصل رسمي في هذا البناء؟
```

- `assets/brand/` **فتحة إدراج رسمية**: `build.py` يضمّن
  `logo-full` · `logo-mark` · `logo-white` بامتداد `svg|png|webp|jpg`
  (حتى 900 كيلوبايت لكل ملف) بصيغة data URI داخل `window.BRAND`.
  إسقاط الملفات يكمل الهوية **دون تغيير سطر كود**؛ وغيابها يترك البديل
  المرسوم. البناء الحالي: الملفات الثلاث **مضمَّنة** (`data-brand-source="asset"`).
- عند غياب الأصل يُرسم بديل هندسي **معلن**: ثلاث متوازيات أضلاع متراكبة
  بتدرّج `--brand-teal → --brand-deep` + اسم الجهة بالخط الرسمي.
  **ممنوع منعاً باتاً تلفيق شعار رسمي بأي صورة أخرى.**
- ألوان العدّة كلها `currentColor` أو `var(--…)` — العلامة تتبع السمة.

---

## 4) قشرة التبويبات — `RH.tabs` (عقد وكلاء التبويبات)

### 4-أ) التسجيل

```js
RH.tabs.register({
  id: "demand",            // من القائمة القانونية حصراً — لا سادس
  order: 1,
  title: "الطلب",
  build(el, ctx) { /* … */ },
});
```

القائمة القانونية بترتيب المتتبّع:

| # | `id` | العنوان | المسار |
|---|---|---|---|
| ١ | `demand` | الطلب | `#/tab/demand` (الافتراضي) |
| ٢ | `licensing` | التراخيص | `#/tab/licensing` |
| ٣ | `control` | الرقابة | `#/tab/control` |
| ٤ | `initiatives` | المبادرات | `#/tab/initiatives` |
| ٥ | `kpis` | مؤشرات الأداء | `#/tab/kpis` |

- ملف واحد لكل تبويب تحت `src/js/presenter/tabs/` (مضموم آلياً بعد `tabs.js`)،
  وبادئة CSS خاصة به في ملف نمطه الخاص. **ممنوع تعديل ملف وكيل آخر** أو
  `tokens.css`/`tabs.css`/`brand.css`/`highlight.css`.
- المتتبّع يعرض المحاور الخمسة **دائماً**؛ غير المسجَّل يظهر باهتاً
  (`.is-pending`) ولوحه يعلن غيابه بصدق — لا يختفي من الشريط.

### 4-ب) المسارات

```
#/tab/<id>[?…]            التبويب (المعاملات = حالة اللوحة، تُكتب بـ ctx.update)
#/appendix/<id>[?return=] الملحق (حالة العودة مرمّزة base64url)
#/section/<id>            **مسار قديم** → يُحال باستبدال صامت:
                            demand|licensing|control|initiatives|kpis → التبويب
                            summary → ملحق summary · map → atlas
                            forecast → scenarios · closing → decisions
                            (وإن غاب الملحق → التبويب الافتراضي — لا شاشة فارغة)
#/report · #/admin        كما هي
```

الجذر الفارغ يُستبدل صامتاً بـ`#/tab/demand` فيبقى العنوان قابلاً للمشاركة.

### 4-ج) سياق البناء `ctx`

| الحقل | الوصف |
|---|---|
| `ctx.su` | وحدة القياس المدرّجة (عرض الشاشة ÷ 1920، بحد أقصى 1.12) |
| `ctx.release` · `ctx.derived` · `ctx.geo` | البيانات — **المصدر الوحيد** |
| `ctx.params` · `ctx.update(patch)` | حالة اللوحة في العنوان (استبدال، بلا تاريخ) |
| `ctx.onTeardown(fn)` | **إلزامي** لكل مستمع/مؤقّت/طبقة |
| `ctx.chart(name, el)` | مثيل ECharts مُفضّى بالتبويب — يُتلف تلقائياً |
| `ctx.highlight(spec)` | يفتح نافذة الإبراز ويربط إغلاقها بتنظيف التبويب |
| `ctx.openAppendix(id, params)` | ينتقل بحالة عودة مرمّزة تلقائياً |
| `ctx.route` · `ctx.tab` · `ctx.def` | المسار الحالي والمعرف والتعريف |

### 4-د) أصناف التخطيط الجاهزة (لا تعيد اختراعها)

| الصنف | الدور |
|---|---|
| `.tabfigs` / `.tabfig` | صف الأرقام الكبرى أعلى التبويب |
| `.tabgrid` | عمودان كحد أقصى · `.is-1` عمود · `.is-3` ثلثان/ثلث · `.span-2` عرض كامل |
| `.tabcard` / `.tabcard-head` / `.tabcard-title` / `.tabcard-note` / `.tabcard-body` | بطاقة الرسم |
| `.tabchart` | **الرسم الرئيس: `min-height: min(46vh, 420px)`** · `.is-tall` · `.is-short` |

**حدود الكثافة الملزمة (V3_SPEC §3):** رسمان رئيسان كحد أقصى في الصف ·
أربعة عناصر كحد أقصى في شبكة الشاشة الواحدة · التمرير الرأسي مسموح
والأفقي **ممنوع** (`min-width: 0` على كل خلية شبكة).

### 4-هـ) وضع العرض الاختياري (V3_SPEC §6)

```js
RH.tabs.present.enter(sectionId?)   // ملء الشاشة + الكليكر فوق المسرح
RH.tabs.present.exit()              // Escape أو الزر — يعود إلى التبويب بحالته
RH.tabs.present.active()
```

المحرك وأقسام V2 التسعة و`nav.js` **لم يُحذف منها شيء**؛ صارت طبقة اختيارية.
خارج وضع العرض تُعامل `#/section/*` كمسار قديم يُحال (§4-ب).

---

## 5) نافذة الإبراز — `RH.highlight` (V3_SPEC §5)

### 5-أ) الطبقات الثلاث الصارمة

| الطبقة | الأداة | المحتوى المسموح |
|---|---|---|
| تحويم | `T.ttMicro` | **سطران**: عنوان + قيمة واحدة |
| نقرة أولى | `RH.highlight.open` | **جملة واحدة** + ≤3 أرقام + زر واحد |
| نقرة ثانية | زر النافذة | الملحق بحالة عودة مرمّزة |

### 5-ب) الواجهة

```js
ctx.highlight({
  title: "القطاع الجنوبي",
  sentence: "القطاع الجنوبي يستحوذ على أعلى عدد مخالفات في فترة الرصد.",
  stats: [ { label: "المخالفات", value: fmt.int(1204), tone: "neg" },
           { label: "الحصة",     value: fmt.pct(33.3) } ],       // ≤3
  appendix: { id: "monitoring", params: { sector: "south" }, label: "…" },
  note: "وسم الصدق/المصدر — خارج حدّ الأحرف ولا يُقصّ أبداً",
  anchor: eventTargetEl,     // يعود إليه التركيز عند الإغلاق
});
```

`tone` ∈ `"pos" | "neg" | "gold"` — دلالي فقط ويتبع المنظومة المقفلة.

### 5-ج) الحد الصارم: **320 حرفاً**

يُحتسب على: `title + sentence + Σ(stat.label + stat.value)`.
نص الزر ووسم `note` وتسميات الواجهة **خارج الحساب** (كروم ثابت ووسوم صدق).

| البيئة | السلوك |
|---|---|
| `RH.highlight.strict === true` (التطوير، أو `window.RH_DEV = true`) | **يرمي خطأً** فوراً |
| الإنتاج | يقصّ الجملة أولاً (بعلامة `…`)، ثم يُسقط الأرقام من الآخِر، ويُنذر في الكونسول |

الدالة النقية `RH.highlight.normalize(spec, { strict })` و`measure(spec)`
مغطاتان بـ`tests/unit/highlight-cap.test.mjs` (12 حالة) — **بوابة قبول ملزمة**.

السلوك: `role="dialog"` + `aria-modal="true"` (فيحترمها حارس `modalOpen()` في
`nav.js` فلا يقلّب الكليكر خلفها) · مصيدة تركيز دائرية · `Escape` يغلق ويعيد
التركيز إلى `anchor` · نافذة واحدة في كل لحظة · `prefers-reduced-motion` محترم.

---

## 6) ترتيب البناء (`build.py` — منفَّذ، لا يعدَّل ثانية)

```
JS  (بعد core/bus.js):          core/theme-mode.js
JS  (بعد viz/theme.js):         brand/brand.js
JS  (قبل sections/registry.js): presenter/highlight.js
JS  (بعد presenter/palette.js): presenter/tabs.js ثم _globbed("src/js/presenter/tabs/*.js")
CSS (بعد base.css):             brand.css
CSS (بعد chrome-ext.css):       tabs.css ثم highlight.css
```

`window.BRAND` يُحقن مع `window.RELEASE`/`GEO`/`MEDIA`. الأيقونة (favicon)
صارت علامة الأمانة الهندسية على أرضية ورقية.
`build.py` يتسامح مع الملف الغائب بإنذار «بناء جزئي» — فالبناء يبقى أخضر
أثناء تقدّم وكلاء التبويبات.

---

## 7) بوابات القبول لكل وكيل تبويب (قائمة تسليم إلزامية)

1. `python3 generate_data.py` → **152/152**؛ `python3 build.py` أخضر.
2. `node --check` على كل ملف JS جديد؛ `"use strict"` + IIFE + تعليقات عربية.
3. `node --test "tests/unit/*.test.mjs"` أخضر بالكامل (**759+**)، واختبار وحدة
   لكل اشتقاق جديد يقدّمه التبويب.
4. **صفر لون مكتوب**: فحص §1-د يعيد صفراً.
5. **قانون التلميح**: كل `tooltip` من `T.tooltip(su)` ومحتواه `T.ttMicro`.
6. **الرسم كبير**: كل رسم رئيس بالصنف `.tabchart`؛ ≤رسمين في الصف؛ ≤4 عناصر
   في الشبكة؛ صفر تمرير أفقي على 1366×768 و1920×1080.
7. **نقرة واحدة = إبراز**: لا نافذة تفاصيل مطوّلة في التبويبات؛ الحد 320 محقَّق.
8. **السمتان**: لقطة لكل تبويب في الفاتح والداكن، وتبديل السمة أثناء العرض
   لا يترك رسماً بلون قديم ولا يسقط الكونسول.
9. **الصدق**: كل رقم من `release.json` عبر `RH.core.fmt`؛ منظومة اللون الدلالية
   مقفلة؛ وسوم «قيمة مورّدة — بانتظار اعتماد المنهجية» و`meta.sample_label`
   وcaveat السيناريوهات تلازم قيمها.
10. **إتاحة**: تنقّل كامل بلوحة المفاتيح، حالة مُعلَنة بأكثر من اللون،
    `ctx.onTeardown` لكل تفاعل، `prefers-reduced-motion` محترم.

### 7-أ) صدق البيانات في التبويبين ٤ و٥ (V3_SPEC §4-ب — لا تلفيق)

- **حلقة الركيزة** = المنجز من مبادرات الركيزة، بتسمية صريحة وعدّ ظاهر
  («١ من ٦»). لا نسبة إنجاز مخترعة لمبادرة.
- **شريط المبادرة** = «مضي المدة الزمنية» من (تاريخ الاحتساب − البداية) ÷
  (النهاية − البداية)، **بتسمية حرفية لا تدّعي الإنجاز**، ويُخفى لمن لا تاريخ
  له؛ والمنجزة تُعرض 100٪ إنجازاً.
- **عدّادات المؤشرات**: 14/14 قيمة حالية فارغة في المصدر. يُرسم القوس بعلامتَي
  خط الأساس والمستهدف، وتُعلن حالة «القيمة الحالية غير مسجّلة — تُدخل من
  الإدارة». **لا إبرة وهمية إطلاقاً**؛ وإدخال قيمة من الإدارة يُظهر العدّاد كاملاً.
