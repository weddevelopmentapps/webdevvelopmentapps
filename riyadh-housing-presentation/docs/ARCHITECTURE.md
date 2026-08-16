# ARCHITECTURE.md — عقد البنية

## 1. الفلسفة

vanilla JS + ECharts محلي، ملف واحد مكتفٍ بذاته (`build.py` يضم `src/` + `vendor/` +
`data/release.json` في `index.html`). لا أطر ولا CDN: يجب أن يفتح بالنقر المزدوج على
حاسب حكومي مقفل ويعمل دون اتصال. لا وحدات ES في الناتج (file:// لا يدعمها) —
الملفات تُضم بالترتيب المحدد في `build.py: JS_ORDER` وتكتب تحت مساحة الأسماء `RH.*`.

قرار عدم الترحيل إلى Vite/TypeScript: قيمة الترحيل الأساسية (تقسيم الحزم، HMR) تصطدم
بمتطلب file:// الصلب؛ الفحص النوعي يعوَّض باختبارات unit تحمّل الملفات في Node عبر vm،
والفصل يفرضه العقد أدناه. هذا القرار قابل للمراجعة إن أصبح النشر المستضاف هو القناة الوحيدة.

## 2. خريطة الوحدات (ترتيب الضم = ترتيب الاعتماد)

| وحدة | مسؤوليتها | واجهتها العامة |
|---|---|---|
| `core/ns` | الجذر + حاجز الأخطاء | `RH`, `RH.core.showFatal` |
| `core/dom` | بناء DOM/SVG آمن | `h(tag,attrs,...kids)`, `svg()`, `clear`, `qs/qsa`, `isInteractive` |
| `core/format` | كل تنسيق عربي ظاهر | `int, dec1, pct, compact, compactParts, unitAfter, noun, date, iso` |
| `core/bus` | ناقل أحداث | `on(evt,fn)→off`, `emit(evt,p)` |
| `data/derive` | الاشتقاق المركزي (مرآة بايثون) | `compute(release)`, `computeStrategy`, `kpiVariance`, `roundHalfUp`, `pct` |
| `data/validate` | بوابات الجودة | `validateRelease(rel)→{gates,blockers,warnings}` |
| `data/store` | الإصدار الواحد + المسودات + النشر | `init, release(), der(), sector(id), startDraft, saveDraft, publish, rollback, history, auditLog` |
| `data/import-xlsx` | معاينة استيراد الورقة | `importFile(File)→{ok,errors,warnings,extracted,diff}`, `applyToDraft` |
| `core/router` | مسارات الهاش + العودة المرمزة | `start(handler)`, `go(route,opts)`, `encodeReturn/decodeReturn` |
| `viz/theme` | ألوان متحقق منها + أساس ECharts + سجل المثيلات | `C`, `base(su)`, `catXAxis/valAxis/hValAxis/hCatAxis`, `tooltip/ttRow/ttTitle`, `targetLine`, `chart(id,el)`, `resizeAll` |
| `viz/charts` | بناة الرسوم | `bridge, econBars, violTypeBars, sectorCompare, scenarioLines, monitoringMonthly, monthlyNet, facilityMix` |
| `viz/map` | خريطة القطاعات التوضيحية | `render(el,{metric,su,focus,onSelect,secondary,showNbhd})→info`, `legendEl(info,su)`, `METRICS` |
| `viz/rings` | الكوكبة وأقواس المؤشرات | `constellation(el,strategy,strat,{onSelect})`, `kpiArc(el,kpi,su)` |
| `viz/motion` | عدّ أول دخول + reduced-motion | `countUp(el,v,fmtFn,key)`, `firstEntry(key)`, `REDUCED` |
| `presenter/engine` | آلة المشاهد + الملاحق | `registerScene({id,kind,steps,build})`, `registerAppendix`, `next/prev/home/end/agenda`, `openAppendix(id,params)`, `returnFromAppendix`, `goScene`, `current()`, `updateParams` |
| `presenter/nav` | عقد لوحة المفاتيح/اللمس/النقر | (داخلي) يبث `appendix:page` |
| `presenter/ax` (ax-shell) | هيكل الملاحق | `register({id,kicker,title,returnLabel,pages})`, `provenanceRows(ids)` |
| `admin/*` | التجربة المحمية | `RH.admin.shell.show(route)` |

## 3. عقد مشهد المقدِّم

```js
RH.presenter.engine.registerScene({
  id: "05",            // موضعه في LINEAR
  kind: "analytic",    // cinematic | hub | analytic | portfolio
  steps: 3,            // خطوات بناء جهاز التقديم (اختياري، حتمي، في ?step=)
  build(host, ctx) {   // ctx: {su, params, route, update(params)}
    // يبني إطاراً واحداً 16:9 لا يتمرر؛ كل القيم من store حصراً
  },
});
```

قواعد صلبة: لا `innerHTML` لمحتوى متغير؛ كل رقم عبر `fmt`؛ كل لون من `theme.C`
بدلالته المعتمدة (أخضر=طاقة/فعل، رملي=طلب، مرجاني=عجز/خلل حصراً، ذهبي=مستهدف/خط
أساس حصراً)؛ العناصر التفاعلية إما عناصر أصلية أو تحمل `data-interactive`؛
الوسم «خريطة توضيحية» يظهر مع كل استخدام للخريطة؛ `اقرأ حالة الخطوة من ctx.params.step`.

## 4. عقد الملحق

`RH.presenter.ax.register({id, kicker, title, returnLabel(ret), pages(ctx)})` —
كل صفحة `{name, build(el, ctx)}` تملأ `.ax-page` (إطار واحد). زر العودة يعيد حالة
المستدعي المرمزة تلقائياً. مفاتيح جهاز التقديم تقلب الصفحات.

## 5. عقد البيانات

- المقدِّم يقرأ **إصداراً واحداً غير قابل للتغيير** (`store.release()`); المشتقات من
  `store.der()`. ممنوع منعاً باتاً كتابة قيمة عرض يدوياً في مشهد.
- المسودة نسخة كاملة من الإصدار تعمل عليها الإدارة، بأساس متوقع
  (`base_release_id`) و`draft_version` لرفض تعارضات التحرير.
- النشر: `store.publish(draft, actor, waivers)` — يرفض عند: بوابة حاجبة فاشلة،
  إنذار بلا تنازل مسجَّل، أو تغيّر الإصدار الأساس (تفاؤلية التزامن). التراجع ينسخ
  إصداراً تاريخياً إلى مسودة جديدة تمر بمسار النشر ذاته.
- `localStorage` ليس مصدر حقيقة: التفضيلات غير المؤذية فقط. المخزن IndexedDB.

## 6. المسارات

`#/scene/<id>[?step&sector&layer]` · `#/appendix/<id>[?page&return]` · `#/admin[/tab]`
وتحويلات قديمة: summary→scene/02، supply→scene/03، licenses→scene/05،
control→scene/07، initiatives→scene/08 (استبدال — لا حلقات).

## 7. وضعا التشغيل والأمن

- **محلي (بيئة التسليم الحالية):** المخزن IndexedDB والدخول ببوابة عبارة مرور
  (PBKDF2/WebCrypto حيث يتاح) موسومة «وضع محلي تجريبي» — ليست مصادقة خادم.
- **Supabase (عند توفير الاعتمادات):** `window.SUPABASE_CONFIG` يفعّل محوّل
  المصادقة (PKCE) والنشر عبر RPC موثوق. الهجرات وسياسات RLS والدالة الطرفية في
  `supabase/` جاهزة، ولم تُتحقق على خادم حي في هذه الجلسة — انظر قائمة العوائق.
- لا مفتاح service-role في أي ملف عميل. المتصفح لا يكتب جداول الإصدارات مباشرة.

## 8. التبعيات

| تبعية | لماذا | النطاق |
|---|---|---|
| ECharts 5 (vendor محلي) | رسوم كانفاس ناضجة RTL-قابلة للضبط | وقت التشغيل |
| خطا IBM Plex Sans Arabic + Cairo (مضمّنان) | الهوية الطباعية العربية | وقت التشغيل |
| Playwright + Chromium النظامي | لقطات واختبارات e2e | تطوير فقط |
| openpyxl | توليد البيانات والتحقق من الورقة | تطوير فقط |

لا تبعيات وقت تشغيل أخرى — هذا التزام، أي إضافة تتطلب تبريراً هنا.
