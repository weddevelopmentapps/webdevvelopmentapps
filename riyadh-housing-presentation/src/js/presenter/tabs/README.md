# src/js/presenter/tabs/ — بانو التبويبات الخمسة

ملف واحد لكل تبويب، مضموم آلياً بعد `presenter/tabs.js` عبر
`_globbed("src/js/presenter/tabs/*.js")` في `build.py` (ترتيب أبجدي حتمي —
سمِّ الملفات `t1-demand.js` … `t5-kpis.js` كي يطابق الضمُّ ترتيبَ المتتبّع).

العقد الملزم كاملاً في **`docs/V3_CONTRACTS.md` §4** (ويُقرأ مع `docs/V3_SPEC.md`).
الهيكل الأدنى:

```js
"use strict";
RH.tabs.register({
  id: "demand", order: 1, title: "الطلب",
  build(el, ctx) { /* … */ },
});
```

تذكير بالبوابات: `.tabchart` لكل رسم رئيس · `T.tooltip(su)` + `T.ttMicro` لكل
تلميح · `ctx.highlight()` للنقرة الأولى (حد 320 حرفاً) · `ctx.chart()` لكل
مثيل ECharts · `ctx.onTeardown()` لكل تفاعل · **صفر لون مكتوب** · كل رقم عبر
`RH.core.fmt`.
