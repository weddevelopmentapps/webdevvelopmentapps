# 09 — FRAMEWORKS & METHODOLOGIES APPENDIX (أطر العمل والمنهجيات)

Evidence base: DECK1 slides 174, 175, 176, 178, 180, 181, 182, 184, 186, 192, 193, 196, 197, 201, 206, 213, 218, 220, 222, 226, 230 (images + txt + XML); DECK2 slides 190, 197, 231 (images) and 189–245 (txt diffs). XML checked: slide174/175/178/182/192/193/196/197/218/220/226/230, slideLayout5, slideMaster1, theme1.

---

## 0. WHAT THIS SECTION IS

The frameworks appendix (~DECK1 s.170–233, DECK2 ~s.185–250) is the "methodology arsenal": one slide (occasionally 2–3) per proprietary or industry-standard framework that the approach chapters earlier in the deck *name*; the appendix *proves* each one exists as real, drawn, branded IP. Narrative job of the whole section: convert the claim "we have a methodology" into visual evidence — every slide is a framework rendered as a real diagram, never a text list pretending to be a framework. It is ~95% a **reusable library**: 11 of 12 paired slides are byte-identical across the two decks (see §8).

Section order in DECK1 mirrors the scope of work: policy-making cycle (174–176) → strategy development (178–181) → strategic analysis tools SWOT/PESTEL/sector assessment/benchmarking (182–186) → initiative readiness & prioritization (192–193) → operating model & PMO (196–197) → process redesign & governance/RACI (201, 206) → KPIs & performance (213, 217) → change management (218) → risk (220) → mega-program delivery (222) → digital tools & platforms (226, 230) → global network/innovation credentials (231).

---

## 1. UNIVERSAL SLIDE SCAFFOLD (every framework slide)

All framework slides share one chassis (layout "3_Title & subtitle", slideLayout5):

1. **Header band**: full-width Riyadh-skyline photo strip with dark-green gradient overlay, top of slide, ~155px/750px of height (~1.55in). Title placeholder at x=457200, y=345992 EMU, 11277600×864970 EMU (full usable width).
2. **"للتوضيح" tag**: small rectangle at the exact top-LEFT corner (x=0, y=−1; 1306016×267129 EMU ≈ 1.36×0.28in), fill teal **0097A9**, white Sakkal Majalla text "للتوضيح" ("for illustration"). Present on EVERY framework slide in BOTH decks — this is the section's compliance marker (says: this is our IP shown illustratively, not project output). Note: framework slides carry NO "المصدر:" line and NO "غير شامل" tag — those belong to data/credential slides. The للتوضيح tag replaces them here.
3. **Title**: Sakkal Majalla **28pt bold white** (sz="2800", b="1", schemeClr bg1), `algn="r" rtl="1"`, 2–4 lines, sentence-style assertion (see §5).
4. **Optional kicker/subtitle** directly under the band, right-aligned, ~12–14pt dark gray, naming the framework formally, e.g. s.182 "إطار عمل منهجية التحليل الرباعي: منهجية توضيحية", s.206 "إطار عمل مصفوفة الصلاحيات", s.181 "تحليل منهجية تسلسل الخيارات الاستراتيجية: مثال توضيحي عن خطة تطوير المحطة الشمالية لتوليد الطاقة الكهربائية في المملكة المتّحدة", s.213 bold mixed-script "خريطة القيمة لمؤسسات القطاع العام - Deloitte Enterprise Value Map™ (EVM)".
5. **Footer** (from slideMaster1, identical on all slides): page number "‹#›" at far left (~9pt gray); center: project string — DECK1 "العرض الفني: خدمات الدراسات الاستراتيجية والاقتصادية للتخطيط العمراني وإدارة المدن"; right: "© 2026 ديلويت اند توش الشرق الأوسط المحدودة جميع الحقوق محفوظة". DECK2 footer: "العرض الفني: أمانة منطقة الرياض | مشروع ضبط جودة مخرجات الأعمال لقطاع وسط مدينة الرياض" + "© 2025 …" — i.e., client + "|" + project name, and copyright year = submission year.
6. **Body zone**: white background, content grid from y≈1.6in to y≈7.0in.
7. Hidden 126294 EMU yellow (FFFF00) marker rectangle exists in the XML of most slides (template tag artifact, hidden="1") — ignore when rebuilding.

**Font regime**: Sakkal Majalla for ALL Arabic (84–303 runs per slide); Latin insertions (framework names, RACI letters, TOM, EVM) inherit Sakkal Majalla or use Arial/Verdana/Tahoma for small chart labels. Body sizes observed: 14pt standard body, 16pt box headers, 12pt secondary, 9–11pt dense diagram labels, 5–8pt only inside miniature explainer graphics (s.220).

---

## 2. ARCHETYPE CATALOG

### A. CYCLE WHEEL + PROGRESSIVE-DISCLOSURE TRIPTYCH (7-phase policy cycle) — s.174/175/176 (= DECK2 s.189/190/191)
The single most instructive pattern: ONE framework, THREE consecutive slides, same geometry, deepening content.
- **s.174 (overview)**: center = circular track drawn with two `arc` shapes (gray, arrowhead), 6 numbered **diamond** shapes (prstGeom `diamond`, fill dark teal-green **005253**, white numeral) placed on the circle; center = gray **hexagon** containing diamond "7" + label "المشاركة والتوثيق" (engagement & documentation as the continuous hub phase). Phase labels sit OUTSIDE the wheel in two flanking columns (right: 1–3, left: 4–6), Sakkal Majalla **24pt bold** dark text, each backed by a **giant ghost numeral, 138pt (sz="13800"), white (schemeClr bg1)** acting as a watermark behind the label. Labels: تحديد التحدي، تحليل التحدي، تحديد الهدف، صياغة السياسات، تنفيذ السياسات، المراقبة والتقييم.
- **s.175 (definitions)**: SAME wheel shrunk to center-bottom, 6 detail blocks in a 3-col × 2-row grid around it. Each block = full-width **header bar fill 005253**, white bold ~16pt text with the phase number in a pentagon/chevron notch at the bar's right end, + justified 14pt body paragraph beneath (3–5 lines, no bullets). Body text = definition of the phase written as verbal-noun clauses ("مراجعة تحديات السياسات العامة التي تم تحديدها وصياغة فهم منظم…").
- **s.176 (key questions)**: identical grid, but body = 3–5 **question bullets**, each with a small gray line-icon hanging on the RIGHT of the text (RTL icon-bullet). Questions are short and parallel: "ما هو أثر السياسة؟ هل حققت السياسة أهدافها المخطط لها؟ هل يسير التنفيذ بسلاسة؟". EN insert kept in Latin inside Arabic: "ما هو بيان التحدي (Problem Statement)؟".
- Title arc across the triptych: assertion of integration (174 "تجمع منهجية السياسات العامة الخاصة بشركة ديلويت بين المستويات المختلفة لعملية صنع القرار…") → assertion of coverage (175 "يحدد إطار السياسات العامة الخطوات الشاملة لمعالجة احتياجات…") → continuation with "و" prefix (176 "**و**يحتاج صناع السياسات إلى الإجابة على الأسئلة الرئيسية المتعلقة بكل مرحلة من المراحل السبع…"). Starting a follow-on title with "و" / "ويتم" / "اضافة لذلك" is the standard continuation convention in this section (also 179 "ويتم إعداد / تحديث بيان الطموح…", 184 "اضافة لذلك، تحليل…", 213 "ولقياس نجاح الاستراتيجية…").

### B. PHASE-BAND FRAMEWORK (StrategyByDesign©) — s.178 (= D2 s.193, identical)
- Three rounded-pill group headers across the top (RTL order right→left): **الاستراتيجية الحالية** (blue **007CB0**), **الخيارات** (teal **0D8390**), **الاستراتيجية المستقبلية** (dark navy-teal **003E58**) — color literally encodes time progression current→options→future (light blue → teal → dark). Each pill ends in a white circle badge with a thin-line icon (target, network, hands/bulb).
- Under them, 6 stage rectangles (2 per group): التعبير، التقييم | التطوير، الاختيار | التفصيل، التنفيذ — white bold ~16pt on fills that step through the same blue→teal→dark ramp; double-headed thin arrows between every stage (iterative, not linear).
- Below each stage: a column of 2–4 bullet **questions** (14pt, dark, right-aligned, round bullets), columns separated by thin vertical gray rules — a 6-column question grid.
- EN framework name kept in Latin **inside the Arabic title**: "…باستعمال اطار StrategyByDesign©)". Trademark © retained.

### C. CASCADE / STAIRCASE (Strategy Cascade) + PROOF-CASE SLIDE — s.180, s.181 (= D2 s.195, identical; 181 also reused)
- **s.180**: 5 question boxes descending as a staircase from top-right to bottom-left (RTL waterfall). Boxes are **green→gray gradient** fills, white bold ~12–14pt question text ("ما هو الطموح الذي نرغب تحقيقه؟", "ما هي المجالات التي سنركّز عليها في عملنا؟", "كيف سنحقّق النجاح؟", "ما هي القدرات التي ينبغي أن نمتلكها؟", "ما هي الأنظمة الإدارية التي نحتاج إليها؟"). Solid black elbow arrows connect group headers; **dashed** thin arrows loop back between boxes (cascade is iterative). Three group headers float above: تحديد الطموح / اتخاذ قرارات استراتيجية / خلق القدرات والممكنات التنظيمية — black bold ~18pt with short **green underline accent strokes** (86BC25 family) beside them. Under each box: bullets whose **key noun is bolded mid-sentence** ("ما هي **المجالات التي ينبغي أن نركّز عليها**…", "كيف **سنعمل** في كل طبقة…") — selective bold inside bullets, not lead-in-only.
- **s.181 (the proof slide — critical pattern)**: immediately after the framework, one slide applying it to a real reference project. Title = effectiveness assertion + evidence claim: "أثبتت المنهجية فعاليتها عالميًا في دعم وضع استراتيجيات التطوير وخطط التحوّل الشاملة، ويُعتبر أحدث مشروع أنجزناه في المملكة المتّحدة خير دليل على ذلك". Layout: 4 columns, headers = **bright-green 86BC25 filled bars** with white bold questions (mirroring the cascade questions) + tiny italic sub-caption inside the bar; column contents = the UK client's actual answers: quote block ("اقتصاد معترف به عالميًا…" in green bold), numbered priority list in **gray rounded boxes with 2 highlighted in green** (items 8–9 shown in 86BC25 with white text to show focus), numbers-first bullets ("توفير أكثر من **35,000** فرصة عمل إضافية وإثراء إجمالي القيمة المضافة السنوية بـ**3.7 مليار** جنيه أسترليني"), ✓ check bullets, and a green parenthetical evidence tag "(استراتيجية تنمية الخط عالي السرعة 2 (HS2) مثال على ذلك)". This is the template for "framework → applied case" pairing.

### D. 2×2 MATRIX (SWOT) — s.182 (= D2 s.197, byte-identical)
- Title: "يعتمد التحليل الاستراتيجي على تحليل القوة والضعف والفرص والمخاطر (SWOT)" — Arabic expansion first, Latin acronym in parentheses at the end. Kicker: "إطار عمل منهجية التحليل الرباعي: منهجية توضيحية".
- Quadrant grammar: each quadrant = a **narrow header bar filled 86BC25** (only 4 explicit 86BC25 uses in XML — the header bars), white bold ~12pt label centered (نقاط القوة top-right, الفرص المتاحة top-left, نقاط الضعف bottom-right, المخاطر bottom-left — RTL: strengths right), with a **white circle icon badge with green thin-line icon** hanging on the header's outer corner. Body = light-gray tint panel (F2F2F2-family), 11pt (sz="1100") dark text, bullet + sub-bullet hierarchy: round bullet then **Wingdings ➤ arrow sub-bullets** for the drill-down ("الجوانب المعروفة – …", "الجوانب المجهولة – …"). 18pt used for quadrant headers.
- Writing pattern inside quadrants: imperative-analysis verbal nouns ("تقييم الميزة التنافسية ونقاط القوة في القطاع:", "رصد الفرص المتاحة على مستوى كل قطاع…") followed by probing questions ("هل يعتمد ذلك على عوامل العرض أم الطلب؟") — the quadrant teaches HOW Deloitte interrogates, not generic SWOT definitions. Quoted mini-phrases in Arabic quotes: تهديدات "مهمّة فعلًا".

### E. ACRONYM PHOTO BANNER (PESTEL) — s.184 (= D2 s.199, identical)
- Signature move: a full-width rounded-corner **photo band** (skyscraper photo, dark overlay) with the acronym spelled in **giant white Latin capitals P E S T E L** spaced across it (~white 60–80pt, Arial-class). Below, **6 columns**, one per letter, each: green thin-line icon (86BC25/26890D stroke, no container), bold ~16pt Arabic column header (السياسة، الاقتصاد، العوامل الاجتماعية، التكنولوجيا، البيئة، العوامل القانونية), then 2–4 small round bullets 12pt. Columns run LTR to match the Latin letters (P under P…) — Latin acronym order overrides RTL here; EN term embedded in bullets where needed ("التكليف والتوكيل (Mandate)").

### F. MULTI-BAND ASSEMBLY (benchmark sourcing & screening) — s.186
- Two stacked numbered bands, each introduced by a full-width light-gray strip with bold italic-style header "**1. مصادر المقارنات المعيارية**" / "**2. معايير اختيار الدول خارج نطاق الإقليم**" (number + period + label, right-aligned).
- Band 1: 4 white boxes with thin gray border chained right→left by **black ⊕ circles** (additive logic), each box numbered with a small black corner badge (1–4) and text with **bold lead word**: "**مدخلات خبراء** ديلويت العالميين المتخصّصين في المنظومة", "**البحوث** المكتبية حول البلدان التي تسجّل أداءً عاليًا", "**التعاون مع** الجهات المعنية في القطاع", "**البحوث المفصّلة حول** البلدان عالية الأداء والمدرجة في القائمة النهائية".
- Band 2: a screening **funnel drawn as 3 successive lens/funnel shapes** colored black → dark teal 005253/0D8390 → bright green 86BC25 (progression toward the shortlist is a darkness→green ramp), scattered "x" data points being filtered, big **green chevron arrows (86BC25, pointing LEFT** = RTL flow direction) between stages, criteria labels beneath each funnel (المعيار أ/ب/ج + bold criterion + *italic 9pt example caption* "على سبيل المثال، الدولة التي تحتلّ المرتبة 80 أو أي مرتبة أعلى في مؤشر سهولة ممارسة الأعمال 2019"), real report cover thumbnail (Doing Business 2019) as the input artifact, and 4 country **flag icons** as the output. Note line in green 9pt: "ملاحظة: يُعتبر توافر البيانات حول الدولة المحدّد متغيّرًا رئيسيًا…".
- This archetype = "any multi-step logic that doesn't fit one diagram": stack 2 numbered bands, each band its own mini-diagram.

### G. CHEVRON PROCESS STRIP — s.192 (readiness), s.201 (3-step redesign), s.220 (risk); D2 twins 207/216/235
The workhorse for N-step methodologies (N = 3–4):
- **s.192**: full-width **teal banner (0D8390)** naming the methodology "تقييم جاهزية المبادرات والمشاريع" (white bold 18pt, centered) → 4 **chevron/homePlate header shapes** (prstGeom `chevron`, teal fill, white bold 14pt two-line labels, points facing LEFT for RTL flow): حصر الوثائق والمستندات المعتمدة → المراجعة والتحليل → تحديد الفجوات وأهم المخاطر والتحديات → تطوير خارطة الطريق لرفع الجاهزية; under each a **light-gray body box** with one justified 14pt paragraph (13–25 words, verbal-noun style "العمــل على تحديــد الفجــوات وأهم المخاطر والتحديات التي تعيق جاهزية المشاريع…"). Bottom: a **dashed-border container** captioned "يتم تقييم جاهزية المبادرات والمشاريع من خلال" holding 6 icon cards (teal thin-line icon 40px + bold 10–11pt caption "التأكد من وجود خطة استراتيجية معتمدة" …) — the checklist layer under the process layer.
- **s.201**: 3 columns, bold black 16pt column headers (فهم وتحليل الإجراءات الحالية → تصميم الإجراءات المستقبلية → تصميم وثائق متطلبات الأعمال) separated by **teal double-chevron « glyphs** floating between columns; each column = light-gray card with 3 icon-bullets (dark-green 046A38 line icons hanging right of text, 12pt); beneath each column a **fanned stack of 3–4 real deliverable screenshots** (process manuals, BRD documents, KSA-crested forms) — screenshots-as-proof is deliberate.
- **s.220 (risk)**: the 4 step cards sit ON the photo band itself (top 55% of slide is a documents/pen photo): dark-teal cards (**004F59/005253**), white circle-line icons (62DE7C accent lime for icon strokes), **teal accent underline bar** inside each card, numbered white circles 1–4 on card corners, chevron separators between cards, rotated white side-label "اطار إدارة المخاطر" on the right edge. Bottom 45%: 4 white **explainer cards** (thin gray border), one per step, each a different micro-visual: pill-grid of risk-register fields (المرجع، الفئة، الخطر، التاريخ…), arrow-tag list of the 4 risk responses (القبول/التفادي/التخفيف/التحويل as leftward arrow tags with tiny 5–7pt explanations), two green circle icons + definitions for احتمالية الحدوث / مستوى التأثير + note "مقياس مكون من 5 نقاط", and a 2×4 grid of teal boxes of risk categories (مخاطر اجتماعية، بيئية، مالية، اقتصادية، الجدول الزمني، إشراك أصحاب المصلحة، الموارد، البنية التحتية). Rotated bracket label "شرح" ties the bottom row to the top steps. Text down to sz="500" (5pt) exists in the micro-diagrams — density is accepted inside explainer cards.

### H. CRITERIA CHEVRON MATRIX (initiative prioritization) — s.193 (= D2 s.208 family)
- 8 criteria as **homePlate arrow bars** in 2 columns × 4 rows, points facing outward (right column points right… rendered teal ~0D8390 via theme gradient; XML uses schemeClr tx2+accent1 gradient with sage 90B9B3), each bar: white thin-line icon in a rounded square + white bold 16pt label (الجاهزية، الميزانية، مدة التنفيذ، التحديات والمعوقات | الاعتمادية، البعد الاستراتيجي، البعد الاقتصادي، البعد البيئي).
- Center spine: white outlined rectangle + **green (86BC25) vertical bookmark/pennant tab** with rotated white text "محاور تقييم المبادرات". Title states function-as-tool: "لدى ديلويت مصفوفة لتقييم المبادرات والمشاريع حيث تساعد المصفوفة في تحديد أولويات المبادرات والمشاريع وهي أداة لصنع القرار".

### I. HUB-SPOKE WHEEL (Target Operating Model, 10 components) — s.197; blue variant D2 s.231
- **s.197**: right half = the wheel: thick **gray ring (BBBCBC)**, 10 green circles sitting on it (fills ramp through the green scale 86BC25→43B02A→26890D→046A38 as you travel the ring — position encodes sequence), white 9–12pt labels inside circles; hub = light-gray circle "المكونات الرئيسية للنموذج التشغيلي" with gray radial arrows + one **dark-green (046A38) circular sweep arrow**. Left half = the legend-as-questions list: 10 rows, each = right-aligned 14pt question ("ما هي القنوات التواصل المطلوبة لتقديم الخدمات؟") + **green pill label** (component name, white bold 12pt, pill fills darken down the list matching the wheel) + thin-ring circle icon at far right. A light-gray triangle beam visually pours the list into the wheel. Title = numeric composition assertion: "يتكون اطار ديلويت للنموذج التشغيلي المستهدف من **10 مكونات رئيسية**".
- **D2 s.231 (PMO elements)**: same archetype in BLUE — center solid blue circle (**007CB0**) "عناصر ادارة المشاريع", 10 **dotted-ring** blue icon nodes connected by dotted spokes, each node paired with a white strip: bold 12pt element name + 10pt gray description. Blue = delivery/PMO domain color (vs green = strategy/TOM). Proves the house style has TWO wheel skins: green-solid (strategy) and blue-dotted (delivery/tech).

### J. PHASE FUNNEL WITH ITERATION LOOPS (TOM/PMO design phases) — s.196 (D2 s.231 replaces it with archetype I)
- 4 phase chevrons across the top, right→left, fills ramp dark→bright green (المرحلة الأولى - التقييم وتحديد الخيارات 046A38 → المرحلة الثانية - تصميم النموذج التشغيلي 26890D → المرحلة الثالثة – الإعداد والتخطيط 43B02A → المرحلة الرابعة – التنفيذ والتفعيل 86BC25) — **maturity/progress ramps ALWAYS run dark→bright green in RTL direction**. Thin navy double arrows above split the strip into هدف تصميم نموذج التشغيل vs التنفيذ.
- Under each phase: small gray homePlate activity tags (9–10pt); big **gray U-turn arrows** looping back labeled "الخيارات المرفوضة" (rejected options) — iteration drawn explicitly; **dashed diagonal funnel lines** narrowing left showing convergence; per-phase quoted question at the bottom in quotes: "ماذا نفعل"، "كيف سنفعل ذلك"، "متى سنقوم بذلك ولماذا يجب علينا".
- Bottom: 4 **"النتائج" outcome bars** color-matched to their phase (dark green→bright green) with 2–4 outcome bullets each (خط الأساس المفصل، خيارات TOM مفصلة، خارطة الطريق للتنفيذ، مقياس النجاح…). Right margin column: المدخلات الخارجية / المدخلات الداخلية bullet lists (9pt). Latin "TOM" embedded in Arabic bullets.

### K. VALUE-TREE / KPI CASCADE (Deloitte Enterprise Value Map EVM) — s.213 (= D2 s.228, identical)
- Kicker in mixed script: "خريطة القيمة لمؤسسات القطاع العام - **Deloitte Enterprise Value Map™ (EVM)**" (™ retained).
- Center: 3-level tree — top box "الأداء الحكومي" (teal 0D8390-family, white bold), connector elbows to 4 teal level-2 boxes (أهداف السياسات، تنفيذ البرامج، كفاءة التشغيل، كفاءة الأصول), then 10 **black-gradient level-3 boxes** (السياسة، الاستراتيجية، المساءلة، الكفاءة (Efficiency)، الفعالية (Effectiveness)، المشتريات، المالية، التقنية، رأس المال البشري، الأصول المادية/المالية) — Latin glosses in parentheses inside Arabic labels.
- Right edge: vertical photo panel with dark overlay carrying a white bold **stat claim**: "…قاعدة البيانات التي تضم أكثر من **500 مؤشر أداء رئيسي** للقطاع العام" — the 100+/500+ numbers-first credibility form appears even in framework slides.
- Left rail: 3 annotation blocks, each: small teal icon + **bold header – dash – embedded question** ("محركات القيمة – كيف يتم إنشاء القيمة") + 10pt explanation; **teal curved arrows** cascade between the three blocks. Two small white tag-boxes give the tactic/strategic split ("افعل ما تفعله بشكل أفضل (تكتيكي)" / "تغيير ما تفعله (استراتيجي)").

### L. IMPORTED-EN-GRAPHIC FRAMEWORK (change management) — s.218 (= D2 s.233, identical)
- When the global framework's original graphic is English, it is kept in English and annotated in Arabic: right side = Deloitte's EN ring/arc graphic (arcs in 86BC25, C4D600/AEC000 lime, 6FC2B4 mint, 046A38; curved ALL-CAPS Latin micro-labels "DEFINE PURPOSE / DESIGN FOR IMPACT / DEVELOP CAPABILITY / DRIVE THROUGH PERFORMANCE"); left side = a **black header bar** "إطار إدارة التغيير – نقلك من الرؤية إلى القيمة" (white bold; note the em-dash value-promise subtitle) over 4 stacked sections, each opened by a **colored bold lead-in + colon** (تحديد الأسباب: / التصميم من أجل التأثير: / تطوير القدرات: / القيادة من خلال الأداء: — each lead-in tinted a different green of the ramp to match its arc segment) with square bullets; **thin hairline connectors** run from each Arabic section to its arc segment. Latin practice names kept inline: "(Walk the Walls)". Title = customization assertion: "يمكن تخصيص إطار إدارة التغيير ليناسب حجم ونطاق احتياجات أي منظمة".

### M. BRANDED-PROGRAM SLIDE (Aerodynamics®) — s.222 (= D2 s.237, identical)
- Two full-width **green section bars (26890D)** structure the slide as Q&A: "ما هو برنامج Aerodynamics®؟" then "مكونات برنامج Aerodynamics®" (white bold 16pt, ® retained in Latin).
- Under bar 1: gray-tint paragraph with **scattered bold emphasis** (not lead-in bold): "…مصمم **لتهيئة الظروف للنجاح** لأكبر **البرامج المعقدة في العالم**… يسهم **صنع القرار المعتمد على المعلومات**… الحد من **المخاطر بشكل كبير**… بهدف **تسريع وتيرة الإنجاز**".
- Under bar 2: 5 outlined rows, each with **colored bold lead-in phrase** (الإستراتيجية المستمرة / بنية مرنة / تنفيذ التحول / التحفيز الرقمي / تصميم نظام الموارد البشرية — colored green/olive/blue per component) + 10–11pt explanation + **dotted-matrix circle icon** in a thin ring at the row's right; left third = the program's signature **triangle network diagram**: 5 dotted-pattern circles (dot-matrix in green/olive/blue) connected by thin gray lines, labels beneath each node. Component color in the list = node color in the diagram (strict legend discipline).

### N. PLATFORM / TOOL SLIDES (dashboards & digital assets) — s.226 (digital catalyst), s.230 (Deloitte Score = D2 s.245 identical)
- **s.226**: left column = two **question-tag pills** (white, green outline, bold lead + comma + question): "**فهم الوضع الحالي**، اين نحن الآن وما هو مستوي تقدم الاداء؟" and "**التنبؤ بالمستقبل**، ماذا سوف يحدث وماهي الآثار المترتبة على ذلك؟"; each followed by a bold intro sentence then icon-bullets with **green bold caption + explanation** (لوحات المعلومات / منهجية شاملة / مستودع بيانات مركزي / التحليلات التنبؤية المتقدمة / التنبؤ وتحليل السيناريوهات) and **REAL dashboard screenshots** (RAG heatmaps, S-curves) embedded at small size. Right column = **3-level green pyramid** (top 86BC25 "الأهداف الاستراتيجية ومؤشرات الأداء الرئيسية والمبادرات", middle 43B02A "مستوى المحافظ والبرامج", base 26890D "مستوى المشاريع") standing on 6 **gray pillar boxes (53565A)** (الميزانية، الجدولة، المخاطر والمشاكل، تحليل التدفق النقدي، طلبات التغيير، بيانات أخرى); big gray upward arrow "تجميع البيانات إلى مستويات أعلى", rotated axis strips, curly-brace annotation "إطار شامل لتطوير التقارير", *italic caption* under the diagram: "التسلسل الهرمي للمشاريع والبرامج والمحافظ وارتباطها بالمبادرات والخطط الاستراتيجية", and a bottom **green bar** "أصحاب المصلحة / التحسين المستمر".
- **s.230**: title is a 4-line feature assertion naming the asset in Arabic quotes: "لدينا منصة إلكترونية تم تطويرها كأحد أصول ديلويت في مجال التقييم الإلكتروني \"ديلويت سكور\"، هذه المنصة تم تطبيقها بنجاح في مشاريع مختلفة، وتتميز بأنها سهلة الاستخدام، قابلة للإعداد والتخصيص بشكل كامل، مبنية على صفحات الويب". Right rail = 5 **dark-green (046A38) homePlate banner tabs** (feature groups: واجهة بناء وإدارة التقييمات، واجهة لتنفيذ التقييم وإجراء التقييم الذاتي، حفظ وإدارة الوثائق الخاصة بالتقييمات، إصدار التقارير ولوحات المؤشرات، وظائف متقدمة) each with a white thin-line icon in a circle; green dot + leftward chevron connectors point each tab to its 2–3 feature bullets (12pt, 575757 gray); left = boxed panel titled "لمحات من منصة ديلويت سكور" (bold) stacking 4 REAL product screenshots with thin borders. Screenshot authenticity (Latin UI, real charts) is the credibility device — never redraw fake UI.

---

## 3. COLOR-ROLE GRAMMAR (what each color MEANS here)

Theme accents (theme1.xml): accent1 **86BC25**, accent2 **43B02A**, accent3 **26890D**, accent4 **046A38**, accent5 **0D8390**, accent6 **007CB0**; dk2 53565A, lt2 D0D0CE.
- **86BC25 bright green** = highlight/endpoint: matrix header bars (SWOT), selected items in lists (s.181), top of pyramids, final phase of ramps, accent tabs, underline strokes, funnel shortlist.
- **Green ramp 046A38→26890D→43B02A→86BC25** = staged progress/maturity (phases s.196, wheel s.197, pyramid s.226, change-mgmt lead-ins s.218). Dark = early/foundation, bright = late/target. RTL: ramp runs right(dark)→left(bright).
- **0D8390 teal + 005253/004F59 dark teal** = process & governance machinery: process banners/chevrons (s.192), criteria bars (s.193), policy-cycle diamonds (174–176: 005253), risk cards (s.220), EVM tree (s.213), annotation icons. Teal is the "method engine" color, green the "outcome/strategy" color.
- **007CB0 blue** = current-state/PMO/technology (s.178 current-strategy pill, D2 s.231 PMO wheel, s.222 digital node).
- **Black/near-black gradient** = raw inputs or deepest drill level (EVM level-3 boxes s.213, funnel start s.186, header bar s.218, ⊕ connectors).
- **Gray 53565A/575757 text, BBBCBC/D0D0CE structure, F2F2F2 panels** = neutral containers, data pillars, ghost content. Light-gray body boxes carry ALL long text; saturated fills carry ONLY short white bold labels.
- **0097A9** = the للتوضيح tag fill (appears exactly once per slide in XML — a reliable fingerprint).
- Photos: only in the header band + occasional bottom-band or side-panel with dark overlay carrying white stat text (s.213, s.220).

## 4. TYPOGRAPHY SUMMARY (element → spec)

| Element | Font | Size | Weight/Color |
|---|---|---|---|
| Title in band | Sakkal Majalla | 28pt (sz 2800) | Bold, white FFFFFF, algn=r rtl=1 |
| Kicker/subtitle | Sakkal Majalla | 12–14pt | Regular/bold, 53565A–black, right |
| Section/methodology banner | Sakkal Majalla | 16–18pt | Bold white on 0D8390/26890D/black |
| Diagram node labels | Sakkal Majalla | 12–16pt (wheel 9–14) | Bold white on fills; bold dark on white |
| Phase labels beside wheel | Sakkal Majalla | 24pt | Bold, near-black |
| Ghost watermark numerals | Sakkal Majalla | 138pt (sz 13800) | White (bg1), behind labels |
| Body bullets | Sakkal Majalla | 14pt standard; 11–12pt dense (SWOT 11pt) | Regular, black/575757, right-aligned; justified in gray boxes |
| Bold lead-ins | same run, b=1 | inherits | Sometimes tinted (218, 226: green lead-ins) |
| Micro-labels in explainer graphics | Sakkal Majalla/Tahoma | 5–10pt | 004F59/gray |
| Latin inserts (SWOT, TOM, EVM™, HS2, RACI letters) | inherit Sakkal Majalla; Arial/Verdana/Tahoma in charts | matches Arabic run | RACI letters: giant green capitals (s.206) |
| Footer | Sakkal Majalla | ~9pt | gray; page # left, project center, © right |

Bullet glyphs: round • default; ➤ (Wingdings) for sub-levels; ✓ (Wingdings 2) for achievements; square bullets in s.218.

## 5. TITLE FORMULA FOR FRAMEWORK SLIDES

Never a bare framework name. Always a full-sentence assertion of what the methodology DOES, with the framework name embedded. Six recurring molds (all verifiable above):
1. **Composition count**: "يتكون اطار ديلويت لـX من N مكونات/خطوات رئيسية" (197: 10 مكونات; 201: 3 خطوات رئيسية).
2. **Function/benefit**: "تعمل منهجية مونيتور ديلويت لـX بشكل شامل ومتكامل باستعمال اطار [LatinName©]" (178); "يساعد/تساعد… وهي أداة لصنع القرار" (193); "إطار X يساعد المؤسسات على…" (217).
3. **Usage declaration (passive يتم/نعتمد/سنستفيد)**: "يتم اتباع منهجية X الخاصة بمونيتور ديلويت للتوصل إلى…" (180); "يتم تقييم جاهزية… باستخدام المنهجية التالية" (192); "من أجل [goal]، نعتمد على إطار عمل X من أجل [sub-goal]" (206); "ولقياس نجاح الاستراتيجية…، سنستفيد من…" (213).
4. **Proof-of-effectiveness**: "أثبتت المنهجية فعاليتها عالميًا في…، ويُعتبر أحدث مشروع أنجزناه في … خير دليل على ذلك" (181).
5. **Asset-ownership**: "لدى ديلويت مصفوفة لـ…" (193), "لدينا منصة إلكترونية تم تطويرها كأحد أصول ديلويت…" (230), "تتمتع ديلويت بإمكانية الوصول…" (231).
6. **Customizability/outcome promise**: "يمكن تخصيص إطار X ليناسب حجم ونطاق احتياجات أي منظمة" (218); "سيوفر المحفز الرقمي قدرة قوية واستشرافية…" (226).
Conventions: continuation slides start with "و" or "اضافة لذلك،"; Latin names keep ©/®/™ (StrategyByDesign©, Aerodynamics®, EVM™); Arabic name first + (LATIN) acronym in parentheses (SWOT, PESTEL, Strategy Cascade, Problem Statement); no (1/N) pagination and no | breadcrumbs in this section (those are used elsewhere); the 86BC25 green-highlight-inside-title device is NOT used on the photo-band white titles of this appendix.

## 6. BODY WRITING PATTERNS

- **Question-driven frameworks**: the house style renders methodology as questions (178, 180, 176, 197, 226). Every phase/component gets "ما هو/ما هي/كيف/هل/متى…؟". Rebuild rule: if a framework has N parts, write N questions + N verbal-noun definitions.
- **Bold lead-in + colon**: "**إدارة المشاريع:** لإسناد المسؤوليات والتأكّد من إنجاز المهام" (206); colored bold lead-ins (218, 222, 226). Variant: bold lead + comma + question (226).
- **Scattered mid-sentence bold** for emphasis words in paragraphs (222) and inside cascade bullets (180).
- **Verbal-noun openings** for process text: مراجعة، تقييم، تحديد، صياغة، تطوير، حصر، رصد، وضع، عقد اجتماعات… (parallel across sibling boxes — every sibling box starts with the same grammatical form).
- **Numbers-first stats**: "أكثر من 35,000 فرصة عمل"، "بـ3.7 مليار جنيه"، "أكثر من 500 مؤشر أداء"، "415k+ / 150+ / 100+" (231 keeps entire stat block in English).
- **Quoted mini-terms**: تهديدات "مهمّة فعلًا"؛ "البدء في عمل تجاري"؛ phase questions in quotes (196).
- Sentence rhythm: title = one long assertion (15–35 words); box bodies = single 13–25-word sentence or 3–5 bullets of 5–12 words; explanations never exceed ~3 lines in a card.

## 7. MICRO-CONVENTIONS CHECKLIST

- للتوضيح tag (0097A9, top-left, white text) on EVERY slide of the section — both decks.
- No المصدر: lines, no "غير شامل" in this appendix (frameworks are own IP).
- Footer triplet from master: ‹#› page (left) | العرض الفني: [project] (center) | © [year] ديلويت اند توش الشرق الأوسط المحدودة جميع الحقوق محفوظة (right). DECK2 center = "أمانة منطقة الرياض | مشروع …" (client | project with pipe).
- Ghost 138pt white numerals behind phase labels (174).
- Numbered badges: white numeral in colored circle (220) or dark corner square (186) or notch in header bar (175/176).
- Arrows: solid thin black elbow = main flow; **dashed** = iteration/feedback; big gray U-turn = rejected-options loop; green 86BC25 chevrons = stage-gates (RTL, point LEFT); teal curved arrows = cascade between annotations; double-headed thin = interdependency (178).
- Legend discipline: color/icon used in a diagram must reappear in its text list (222, 197, 218 connector hairlines).
- Icons: thin-line (1–1.5px) monochrome, in white circles with colored ring, or naked; icon sits to the RIGHT of RTL text (icon-first in reading order). Dotted-matrix icon style reserved for Aerodynamics/blue-PMO family.
- Real screenshots (dashboards, BRDs, report covers) always framed with thin gray border, fanned or stacked; flags for countries; ⊕ black circles for additive steps.
- Rotated (vertical) white side-labels name the framework on diagram-dominant slides (220 "اطار إدارة المخاطر", 226 axis strips).

## 8. DECK1 vs DECK2 DELTAS — THE REUSABLE LIBRARY

Byte-identical text (verified by diff = 0 lines) and pixel-identical layout; ONLY footer (project string) and © year change:
- D1-178 = D2-193 StrategyByDesign; D1-180 = D2-195 Strategy Cascade; D1-182 = D2-197 SWOT; D1-184 = D2-199 PESTEL; D1-201 = D2-216 process redesign; D1-206 = D2-221 RACI/authority matrix; D1-213 = D2-228 EVM; D1-218 = D2-233 change mgmt; D1-220 = D2-235 risk framework; D1-222 = D2-237 Aerodynamics®; D1-230 = D2-245 Deloitte Score. Policy cycle triptych D1-174/175/176 = D2-189/190/191 (spot-verified image-identical). Also present in both: readiness (D1-192≈D2-207), prioritization matrix (D1-193≈D2-208).
- **Only real delta found**: D1-196 vs D2-231 — same TITLE ("مركز إدارة المشاريع هي منصة مركزية…") but different body: D1 uses the 4-phase TOM-design funnel, D2 uses a blue 10-node hub-spoke of PMO elements. Lesson: the title formula is also library; the diagram under it can be swapped per scope emphasis (D2 is delivery-heavier).
- Slide ORDER shifts with scope (policy cycle at 174 in D1 vs 189 in D2); DECK2 inserts sector-study credentials (s.204) and portfolio-management (s.236, s.240 roles by portfolio/program/project level) reflecting its PMO-heavier scope.
- How the approach sections reference the library: approach/PoV slides name the framework inline (Arabic name + Latin in parentheses) and the appendix carries the full drawing; the appendix header uses the same أطر العمل والمنهجيات divider family. Cross-referencing is by name, not by slide number.

## 9. RECONSTRUCTION RECIPE

### 9.1 Select frameworks from RFP scope (scope theme → framework family)
Map كراسة الشروط scope items to families; include ONLY families the scope touches, in scope order:
- سياسات عامة / تشريعات → 7-phase policy cycle triptych (archetype A).
- إعداد/تحديث استراتيجية → StrategyByDesign© (B) + Strategy Cascade (C) + one proof-case slide (C2) + ambition-workshop slide.
- تحليل/تشخيص الوضع الراهن → SWOT (D) + PESTEL (E) + sector-assessment rings + benchmarking sourcing/funnel (F).
- مبادرات ومشاريع (حصر/تقييم/أولويات) → readiness chevron strip (G) + criteria chevron matrix (H).
- نموذج تشغيلي / هيكلة → TOM 10-component wheel (I) + TOM phase funnel (J) + governance framework.
- إجراءات وحوكمة → 3-step redesign (G) + RACI مصفوفة الصلاحيات (L-RACI, s.206 pattern).
- مؤشرات أداء / قياس → EVM value tree (K) + integrated performance mgmt.
- إدارة التغيير → EN-graphic change framework (L).
- مخاطر → 4-step risk strip + explainer cards (G-risk).
- تنفيذ برامج كبرى / PMO → Aerodynamics® (M) + PMO platform (title from s.196, diagram per emphasis) + portfolio roles.
- رقمنة / متابعة إلكترونية → digital catalyst pyramid + dashboards (N) + Deloitte Score (N) — include ONLY if RFP asks for tools/platforms.
Target 15–25 appendix slides; keep 1 slide per framework, 3 for the flagship framework of the engagement (overview → definitions → questions, archetype A pattern).

### 9.2 Fixed boilerplate vs recomputed
FIXED (copy from library, do not rewrite): all archetype bodies in §8's identical list — the Arabic definitions, questions, diagrams, icons, colors. RECOMPUTED per RFP: (a) footer project string "العرض الفني: [client] | [project]" + © year; (b) which frameworks are included and their order; (c) the proof-case slide (C2) — swap in a reference project relevant to the client's geography/sector with its real numbers; (d) any title tweaks binding a framework to the client's entity name ("الوزارة", "الأمانة"); (e) platform screenshots only if newer ones exist. NEVER invent new Arabic text for an existing framework — reuse verbatim; that is what the firm itself does.

### 9.3 Drawing NEW framework diagrams in the house language
1. Pick the archetype by logic type: cycle→wheel+diamonds(005253); linear N-step→teal chevrons+gray body boxes; drill-down tree→teal/black value tree; composition→green-ramp wheel or pyramid; criteria→chevron matrix with center green tab; program brand→section bars + dotted-node network; tool→banner tabs + real screenshots.
2. Apply color roles from §3 (teal=process, green ramp=progress, 86BC25=endpoint/highlight, blue=PMO/tech, gray=containers/inputs). One hue family per diagram + gray; second family only for a genuine second dimension.
3. Saturated fill ⇒ short white bold label only; all sentences go in light-gray panels or white space at 11–14pt.
4. Give every part BOTH a noun label and a question or definition; keep siblings grammatically parallel; RTL flow right→left with chevrons pointing left; add dashed arrows for any iteration; number everything (badges).
5. Add the scaffold: photo band + 28pt bold white assertion title (mold from §5), للتوضيح tag, kicker naming the framework, footer triplet.
6. Quality bar (human-consultant look): dense but grid-aligned (equal box widths, one baseline per row); ONE idea per slide; real drawn geometry (PowerPoint shapes: diamond/hexagon/chevron/homePlate/arc — never a bitmap of a diagram, EXCEPT authentic product screenshots); Latin framework names preserved with ©/®/™; text sizes may drop to 9pt in explainer cards but titles/headers never deviate from 28/16/14; no orphan colors (every color used must appear ≥2 places: diagram + legend/text); ghost numerals and rotated side-labels are the two permitted decorative flourishes.
