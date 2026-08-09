# Arabic language quality — professional administrative register

Native-speaker clients flag language before they flag features. A platform can be
functionally perfect and die in review because a heading is a literal translation. Do a
calque sweep yourself during the build, then ALWAYS spawn a professional Arabic-editor
agent over every user-facing string (UI + seeded data) before delivery — it will find
agreement errors you cannot see in template literals.

## 1. Calque table — never translate these literally

| English concept | Calque (wrong) | Professional Arabic |
|---|---|---|
| pipeline (stages) | خط أنابيب المبادرات | المبادرات حسب مراحل دورة الحياة |
| pipeline (identified value) | خط الأنابيب | الفرص المرصودة / محفظة الفرص |
| waterfall (chart) | شلال | مراحل تحقق … |
| threshold | عتبة | حد / درجة «…» |
| executive read | قراءة تنفيذية | الملخص التنفيذي |
| adoption ladder | سلم التبني | مستويات التبني |
| KPI families | عائلات المؤشرات | مجموعات المؤشرات |
| closed loop | حلقة مغلقة | دورة … متكاملة |
| flag (a record) | راية / إزالة الراية | حالة / إلغاء حالة «…» |
| promote (stage) | ترقية إلى | نقل إلى مرحلة / الانتقال إلى مرحلة |
| gate | بوابة | ضابط / اشتراط (الاكتمال) |
| generator (reports) | مولّد التقارير | إنشاء التقارير |
| trend | الاتجاه الزمني | التطور الزمني |
| actionable alerts | تنبيهات تتطلب الانتباه / تستدعي الإجراء | تنبيهات تستدعي اتخاذ إجراء |
| auto-derived | مشتقة آلياً | تُستخلص تلقائياً |
| configurable | قابل للتهيئة | قابل للمعايرة / قابل للضبط |
| 10x cheaper | أقل بعشرة أضعاف (illogical) | نحو عُشر التكلفة |
| on-site | موقعياً | في الموقع |
| earned value | الأداء المكتسب | القيمة المكتسبة |
| kanban board | لوحة كانبان | لوحة مراحل تفاعلية |

## 2. Grammar rules that recur in dashboards

**Number–noun agreement in dynamic strings.** `${n} مبادرة` is wrong for most values.
Encode real agreement wherever a count meets a noun (tooltips, footers, counters):

```js
const countNoun = (v, one, two, few, many) =>      // e.g. ("مبادرة واحدة","مبادرتان","مبادرات","مبادرة")
  v===1? one : v===2? two : (v>=3&&v<=10)? `${n(v)} ${few}` : `${n(v)} ${many}`;
```
Or sidestep with a safe frame: «عدد المشاركين: 810» ، «5 من المعايير». Never pair a
numeral with a dual («2 مرشحان» is wrong — the dual alone suffices).

**Gender concord.** A verb before a subject of varying gender in templated text will be
wrong half the time («عولجت» + مصدر mذكر). Fix by naming the subject explicitly:
«عولج مصدر الهدر عبر …».

**Number–gender polarity.** «المحاور الثلاثة» (محور is masculine → feminine numeral).

**Broken conjunction chains.** «إعداد ومتابعة الدراسات» separates مضاف from مضاف إليه —
write «إعداد الدراسات ومتابعتها». Orphaned coordinates («وورش» → «وورش عمل», «تخزين» →
«تخزين الطاقة»).

**Word order with definite numbers.** «الخطوات السبع», not «السبع خطوات».

**Common register fixes.** «دون» not «بدون»; «لجميع» rather than «لكافة»; «تُختتم» not
«تُختم»; transitive prepositions («الإبلاغ عنه» not «إبلاغه»؛ «يُعلن عنها»); complete
questions in confirms («هل تريد المتابعة؟»).

## 3. Terminology consistency

- Adopt the domain's OFFICIAL vocabulary and use it verbatim everywhere (for spending
  efficiency: بطاقة الفرصة، ميثاق المبادرة، خط الأساس، الوثائق الداعمة، لائحة التعقب،
  الدراسات الخمس، دراسات السعة والطلب، اعتماد الوفورات — each domain has its own set;
  extract it from the governing documents during research).
- One name per concept across all screens. Shortened department names must not change
  meaning («قسم التحقيق والمتابعة» reads as an *investigations* unit — a shortened form
  must keep the key noun: «قسم تحقيق المستهدفات والمتابعة»).
- Disambiguate near-collisions («الشؤون المالية» الداخلية vs «وزارة المالية» — never bare
  «المالية» where both exist).
- Authorities by full official name on first mention per screen; transliterations
  (إكسبرو) only as secondary mentions.
- Watch geographic/domain vocabulary leaks: a term tied to another city or ritual context
  («مواقف المشاعر» is Makkah vocabulary) inside your entity's data destroys credibility.

## 4. The editorial-agent pass (mandatory)

Spawn a native-level editor agent with this brief: review ALL Arabic user-facing strings
in the UI source and the data generator for (1) calques, (2) grammar — agreement, gender,
hamza, taa marbuta, duals/plurals, (3) register (formal Saudi government style), (4) one
name per concept + official-vocabulary alignment, (5) Arabic punctuation. Require
structured output: exact `old` (byte-exact, long enough to be unique), `new`, `reason`.
Warn it not to touch strings used in program logic comparisons (status values like
«متوفر», stage names) unless it flags them for coordinated change — renaming a status in
one place breaks the app. Apply with literal string replacement and rebuild.
