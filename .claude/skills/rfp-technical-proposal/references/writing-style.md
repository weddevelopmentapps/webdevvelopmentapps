# Writing Style — how every word in the deck is written

The decks are written in formal Modern Standard Arabic with a specific consulting voice.
This file defines the micro-rules. Follow them exactly; they are as important as the
visual system.

## 1. Titles are assertions (the single most important rule)

Every content-slide title is a **complete declarative sentence** that states the slide's
one takeaway. The reader should be able to read only titles, in order, and hear the full
argument (titles = the storyline).

**Formulas observed:**

| Pattern | Example (from reference decks) |
|---|---|
| We understand / we recognize | `ندرك أهمية مشروع {اسم المشروع بالكامل}` |
| And we will… (approach) | `وسنعمل على دعم الأمانة بالخدمات التي تحتاجها لتنفيذ المشروع على أكمل وجه` |
| Client-context assertion | `تشكل أمانة منطقة الرياض العامود الاساسي في التنمية الشاملة…` |
| Data assertion (number inside) | `من المتوقع أن يصل عدد السكان في مدينة الرياض إلى أكثر من 15 مليون نسمة بحلول 2040 …` |
| Number-first framing | `3 تحديات تشغيلية تواجه قطاع الوسط` / `ولمواكبة التطور والتنمية، تحتاج الأمانة إلى 3 ممكنات رئيسية` |
| Labeled enabler/challenge | `الممكن الأول: التعمق في فهم التوجهات الاستراتيجية للمدينة` / `التحدي الثاني: الحاجة لتوحيد آليات العمل وتعزيز الكفاءة التشغيلية` |
| Execution promise | `سيتم تنفيذ المشروع عبر 4 مسارات رئيسية وخلال مدة زمنية تقدر بـ9 أشهر` |
| Team promise | `سيتولّى إدارة التنفيذ فريق متفرّغ ومتخصّص سيتابع المشروع بشكل يومي مع الاستفادة من قيادتنا` |
| Track record | `لدينا سجل حافل في تسليم المشاريع ذات المتطلبات المماثلة لـ{الخدمة} (1/7)` |
| Methodology assertion | `تعمل منهجية مونيتور ديلويت لتطوير وتحديث الاستراتيجيات بشكل شامل ومتكامل باستعمال اطار StrategyByDesign©` |
| One-team closing | `وسنعمل كفريق واحد مع الأمانة لتحقيق الاهداف والأثر المرجو من المشروع` |

**Rules:**
- Titles may run to two lines (28pt). Never truncate to a label ("النهج" alone is wrong).
- **Green highlighting**: inside dark-slide titles, the load-bearing phrase (project name,
  the key claim) is a separate bold run in `schemeClr accent4 + lumMod 60%/lumOff 40%`
  ("accent4, Lighter 40%" — never a raw hex); the title stem stays regular-weight white.
  On white slides titles are plain black (breadcrumb/labelled titles take no highlight).
- **Narrative connectors**: consecutive titles begin with و / ولذلك / ومن هذا المنطلق /
  كما / واخيراً to chain the argument across slides.
- **Continuation pairs**: split one sentence across two consecutive slides with `...` —
  slide A title ends with `...` and slide B title begins with `...`. Use for
  stat→consequence pairs and value-chain→stakeholders pairs.
- **Breadcrumbs** for serialized sections: `منهجية المشروع التفصيلية | المسار الأول –
  {الاسم} (1/3)`, `خبراتنا | محلياً`, `المستندات القانونية | {اسم الشهادة}`,
  `{الاسم} | {الدور}`. Separator is ` | `, phase dash is ` – `.

## 2. Taglines (the one-line summaries under credential/section titles)

Credential slides carry a gray one-line tagline under the breadcrumb title:
**verb-first past-tense accomplishment + client**:
- `قادت ديلويت تفعيل إدارة الأداء الإستراتيجي لوزارة البلديات والإسكان وأمانات المناطق`
- Formula: `{قادت/دعمت/طوّرت} ديلويت {الإنجاز} لـ{الجهة}` — one line, no period, specific
  deliverable named, client named (or `- سرية` if confidential).

## 3. Bullet anatomy

**The house bullet is: bold lead-in + colon + explanation.**

- Letter advantage bullets: `فهمنا العميق لمدينة الرياض: عملنا مع الجهات المحلية…`
  (bold lead = the win theme; explanation = 1–3 lines of proof).
- CV experience bullets: `امانة منطقة الرياض: قيادة مشروع استراتيجية للتحسين الشامل…`
  (bold lead = client name; confidential clients as `منظمة غير حكومية - سرية:`).
- Track descriptions: `مسار العمل الأول: الدراسات الاستراتيجية والاقتصادية` then a
  separate description line starting with a verbal noun (`إعداد دراسات استراتيجية…`).

**Activity bullets** (methodology slides) are **verb-first with verbal nouns**, no lead-in:
`العمل بشكل مباشر مع الإدارة العليا لتحديد…` / `إعداد ومراجعة التقارير التحليلية…` /
`عقد ورش عمل وجلسات تفاعلية مع…` — one action per bullet, concrete object, no filler.
Two levels max: • activity → ◦ sub-steps (both verb-first).

**Deliverable bullets** are **noun phrases only**: `التوجهات الحضرية وتحليل الوضع الراهن`،
`تقييم الأثر والبدائل الاستراتيجية` — never verbs, never sentences.

**Question bullets** (framework slides only): key questions per stage, each starting
`كيف يمكننا…؟` / `ما هي…؟` / `ما مدى…؟`.

## 4. Numbers and stats

- Stats lead sentences: `يسكن منطقة الرياض حوالي 8.6 مليون نسمة`، `أكثر من 420 خدمة`،
  `100+ صاحب مصلحة`، `15+ مشروع`، `200+ خبير`، `7,009 نسمة/كم²`.
- The `N+` form (Latin plus sign after the numeral) is the standard for "more than".
- Ranges with dash: `ما بين 3% الى 8%`، `4 – 6.2 ترليون ريال`.
- Every stat that isn't common knowledge carries a source line on the slide.
- Big-stat callouts pair: number (huge, green) + unit (smaller) + label (white/black).

## 5. Paragraph voice (exec summary, PoV narrative, letter)

- First-person-plural consultant voice: نحن / سنعمل / نقترح / ندرك / نؤمن.
- The client is named respectfully and consistently: الأمانة، الجهة، شركة ريمات الرياض
  للتنمية — mirror the RFP's own short-name convention after first full mention.
- Sentences are long but structured, stacking clauses with بما يضمن / مما يساعد /
  بالإضافة إلى / في ظل — aspiration-laden but always ending in a concrete object.
- Vision 2030 and national strategy references appear early and often
  (`بما ينسجم مع أولويات التنمية الحضرية والتوجهات الاستراتيجية طويلة المدى`).
- Closing formulas are fixed: letter ends
  `ونحن نؤكد لكم التزامنا الكامل تجاه المشروع…` + `وتفضلوا بقبول فائق التحية والاحترام،`.

## 6. The cover letter formula (fixed skeleton, project-specific fill)

**The letter is the only framing page whose accent is TEAL `0D8390` (accent5), not
green** — advantage-bullet lead-ins are 14pt bold teal + teal colon; body is 12pt black.
The page must look like a letter, not a slide: dense right-aligned prose, zero
decoration, standard footer (it is "page 2").

1. Letterhead top-left, 10pt: `ديلويت أند توش الشرق الأوسط المحدودة` (bold) + address
   block (بوليفارد الميترو، حي العقيق، مركز الملك عبدالله المالي، ص. ب. 213 الرياض
   11411…) + `هاتف: +966 (11) 2828500` + fax + `www.deloitte.com`. Monitor Deloitte
   wordmark large top-right.
2. `إلى من يهمّه الأمر في {الجهة}` + `تحية طيّبة وبعد،` (note: the reference decks carry
   the typo تحيبة — fix it in new work).
3. `الموضوع: {اسم المشروع كما ورد في الكراسة}` (bold).
4. Thanks paragraph (frozen stem): `بدايةً، اسمحوا لنا أن نشكركم على إتاحة الفرصة لتقديم
   رد على طلب المعلومات لمشروع «{الاسم — bold، داخل علامتي تنصيص «»}»، الذي يسعى
   {إعادة صياغة هدف المشروع في 1–2 عبارة}…` — mirror the RFP's own process word
   (طلب المعلومات vs طلب العروض); extend the paraphrase with Vision-2030 framing
   (`…ويشكل خطوة محورية نحو…، وتدعم مسيرتها نحو تحقيق رؤية 2030`).
5. Bridge (frozen): `ومن هذا المنطلق، تتقدم مونيتور ديلويت كشريك لدعم {الجهة} في هذا
   المشروع الحيوي والمهم من خلال تقديم الحلول المبتكرة والخبرات اللازمة، بناءً على
   المزايا التالية:`
6. **4–6 advantage bullets** — lead-in = 3–9-word noun phrase, no verbs, 14pt bold teal
   + colon; explanation = ONE flowing 25–45-word sentence ending with
   `مما يساعدنا/مما يؤهلنا + benefit`. The generator formula:
   - Bullet 1 — LOCAL KNOWLEDGE of the client's city/sector, name-dropping 2–3 real
     sister entities served (`مثل أمانة منطقة الرياض والهيئة الملكية لمدينة الرياض
     وغيرها من الجهات المحلية`).
   - Bullet 2 — TRACK RECORD in the RFP's functional domain
     (`سجل حافل من النجاح في {الخدمة}:` or `الخبرة الواسعة في {الخدمة}:`).
   - Bullet 3 — TEAM (frozen body): `فريق محلي وعالمي من الخبراء والقادة في مجال
     {الخدمة}: تجمع مونيتور ديلويت فرقًا فريدة ومتعددة التخصصات ولديها خبرة إقليمية
     وعالمية رائدة في مجالات {…}، مما يؤهلنا لتقديم الدعم اللازم لنجاح المشروع وتحقيق
     الأهداف المرجوة.`
   - Bullet 4 (optional) — ALLIANCES: `شراكاتنا مع الحلفاء في مجالات {…}: …` (only when
     the bid includes delivery partners).
   - Final bullet ALWAYS (frozen): `الالتزام بالشراكة المستدامة: نحن نؤمن بأهمية
     الشراكة والعمل جنباً إلى جنب مع {الجهة} لضمان تنفيذ المشاريع بنجاح وتحقيق الأهداف
     المرجوة، مع التركيز على تحقيق رؤية شاملة ومستدامة لـ{المدينة}.`
7. Commitment close (frozen): `ونحن نؤكد لكم التزامنا الكامل تجاه المشروع. وفي حال
   الحاجة الى أي معلوماتٍ إضافية أو وجود أي استفسار، نرجو منكم عدم التردّد في التواصل
   معنا. وتفضلوا بقبول فائق التحية والاحترام،` + signature: partner name (bold) +
   `شريك، ديلويت الشرق الأوسط`.
8. Contacts sidebar (right rail): `جهات الاتصال` header — 2 real engagement partners:
   circular photo (1.06"), bold name (11pt), `شريك`, `ديلويت للاستشارات الشرق الأوسط`,
   email as live hyperlink, `جوال: +966 …`.

## 7. Terminology consistency table

Build one per proposal and enforce it deck-wide: the project name, client short name,
track/phase names, deliverable names (must match BoQ), and framework names must be
character-identical everywhere they appear (titles, TOC, exec summary, approach, Gantt,
footers). The reference decks are rigorous about this — inconsistency is an instant
tell of sloppy assembly.

## 8. Things this style never does

- No exclamation marks; no rhetorical questions outside framework question-bullets.
- No first-person-singular; no addressing the reader as أنت.
- No marketing superlatives without a number or fact behind them (الأكبر/الوحيد are used
  only where literally true of Deloitte: `أكبر شركة خدمات مهنية في العالم`).
- No filler bullets ("جودة عالية", "أفضل الممارسات" alone) — every bullet carries a
  specific object, mechanism, or number.
- No Latin loanwords where standard Arabic exists; Latin only for framework/product names
  and technical acronyms (KPI, CAGR, SWOT…).
