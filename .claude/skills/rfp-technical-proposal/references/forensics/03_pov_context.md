# POV Section Part 1 — The CONTEXT FUNNEL opening وجهة نظرنا
Scope analyzed: DECK1 "Strategic Studies" slides 8–18; DECK2 "Central Riyadh Sectors Performance" slides 8–22. Every image studied; wording verified in txt dumps; geometry/colors verified in slide XML.

---

## 0. THE FUNNEL LOGIC (macro finding)

The section that opens وجهة نظرنا is a **zoom-in funnel**: WORLD → KINGDOM → CITY → CITY SYSTEM → CLIENT → (DECK2 only) CLIENT SUB-UNIT. Each slide answers "why does the next, narrower thing matter?", and the last slide of the funnel always lands on the exact entity that issued the RFP.

DECK1 funnel (11 slides):
1. s8 — Cities through history (world level, timeless assertion)
2. s9 — KSA macro-economy GDP scenarios to 2040 (kingdom)
3. s10 — Riyadh supports Vision 2030 (kingdom→city bridge)
4. s11 — Crown-Prince quote endorsing Riyadh (authority anchor)
5. s12 — Riyadh's global rankings + megaprojects (city credentials)
6. s13 — Region population 8.6M / 81% in the city (city stats, twin-title slide)
7. s14 — Intra-city population choropleth by district (city granularity)
8. s15 — Population to 15M+/23M by 2040 (city future = the problem)
9. s16 — City delivers 420+ services across a value chain (city system)
10. s17 — …through 100+ stakeholders (city ecosystem, logo wall)
11. s18 — **The client (أمانة منطقة الرياض) is the backbone** («العامود الاساسي») of it all (landing)

DECK2 funnel (15 slides): s8–s17 = DECK1 s8–s18 **minus s12** (rankings slide dropped), then EXTENDS the funnel 5 more steps because the RFP scope is one sector of the Amanah:
12. s18 — Client strategy links to Vision 2030 & sector strategies (hub-spoke with counts)
13. s19 — Client's ecosystem = 3 categories (agencies / sectors / companies)
14. s20 — Municipal Transformation Program: 5 قطاعات + 16 بلدية map, focus on وسط
15. s21 — قطاع الوسط org chart: 22+ إدارة و32+ قسم
16. s22 — قطاع الوسط serves through 5 مجالات رئيسية / 14+ خدمة رئيسية

**Reconstruction law:** the funnel always narrows until it reaches the exact organizational altitude of the RFP scope. If scope = whole entity, stop at the "backbone" slide (DECK1). If scope = a sub-unit, continue: entity strategy → entity ecosystem → geographic/programmatic decomposition → sub-unit org chart → sub-unit services (DECK2). The tail slides are the ONLY substantially new content between the two proposals.

---

## 1. SHARED DESIGN SYSTEM FACTS (verified in XML)

Theme (unpacked1/ppt/theme/theme1.xml, identical family in deck2):
- dk1=000000(windowText), lt1=window(FFFFFF), dk2=53565A, lt2=D0D0CE
- accent1=86BC25, accent2=43B02A, accent3=26890D, accent4=046A38, accent5=0D8390, accent6=007CB0, hlink=00A3E0
- Theme fonts Calibri; but ALL Arabic runs override with `latin/cs typeface="Sakkal Majalla"` (panose 02000..., charset -78). Latin inserts (CAGR, IMD, GaWC, L2, %) stay Arial/Calibri/Verdana.

**The signature "bright green" highlight is NOT a raw hex** — it is `schemeClr accent4 (046A38)` or `accent3 (26890D)` with `lumMod 60000 / lumOff 40000` (a 60% luminance tint). Used for: title emphasis spans (s9: «سيعتمد بشكل رئيسي على نمو المناطق والمدن», bold b="1"), big stat numbers on dark panels (s9 «4 – 6.2» = accent3 tint; s15 «23~ مليون نسمة» = accent4 tint). Renders as bright mint on dark backgrounds.

Title placeholder geometry (s9 XML): `off x=106326 y=325672, ext cx=11590374 cy=783461` → 11.4in wide band, 0.34in from top; `algn="r" rtl="1"`; base run `sz="3200"` (32pt), regular weight, black on light slides / white (bg1) on dark slides. Hero variant 36pt (s17 sz=3600).

Type scale observed (sz values): 8000/6600/6000/5400/4400/4000 = mega stats (80–40pt); 3600/3200 titles; 2800 stat labels & chart headers; 2000 photo-panel body (s8); 1800 card headers; 1600 sub-headers; 1300–1400 body; 1100–1200 diagram labels; 1000 hub-spoke labels; 900 chips; 800 source/copyright lines; 1050 footer project line.

Footer anatomy (every content slide, ~8–10.5pt):
- Bottom corner: page number (plain digit) + project descriptor:
  - DECK1: «العرض الفني: خدمات الدراسات الاستراتيجية والاقتصادية للتخطيط العمراني وإدارة المدن»
  - DECK2: «العرض الفني: أمانة منطقة الرياض | مشروع ضبط جودة مخرجات الأعمال لقطاع وسط مدينة الرياض» — note the **client | project** pipe pattern.
- Opposite corner copyright: DECK1 «© 2026 ديلويت اند توش الشرق الأوسط المحدودة جميع الحقوق محفوظة» (no period); DECK2 «© 2025 … محفوظة.» (with period, year of submission).
- Source line sits ABOVE the copyright, 8pt: always starts «المصدر: ». Variants seen: «المصدر: أبحاث وتحليلات مونيتور ديلويت» (s17), «…، أمانة منطقة الرياض، الهيئة العامة للإحصاء» (s13), «…، بيانات السعودية، الهيئة العامة للإحصاء» (s15), «…، إطار ديلويت لإدارة المدن» (s16 — cites Deloitte's own framework), «المصدر: رؤية 2030» (s10), «المصدر: أمانة منطقة الرياض» (s18/s21). Rule: Monitor-Deloitte-research first, then client sources, then public statistical bodies.

Micro-tags:
- «غير شامل» (non-exhaustive) pill: `prstGeom prst="round2SameRect"` (rounded-top rectangle), white 1pt outline + white text ~9pt, transparent fill, placed at the title-adjacent corner. Appears whenever a list/logo wall is illustrative (s10, s12, s17 in both decks).
- «تركيز الشرائح التالية» (focus of next slides): small green-filled tag + **dashed green rounded frame** drawn around the one element of a diagram the following slides will zoom into (DECK1 s17 around مدير المدينة; DECK2 s19 around «5 قطاعات», s20 around وسط). This is the visual device that *executes* the funnel narrowing.
- «+» stat convention: digit then plus, Latin order, e.g. 100+, 14+, 30+, 25+, 20+, 26+, 44+, 22+, 32+, 300+; in prose written «أكثر من 100+ صاحب مصلحة» (doubling أكثر من with +, s17 title — a house quirk).
- «++ خدمات أخرى يقدمها القطاع بشكل مستمر» — full-width white band at bottom of a service inventory (DECK2 s22) signaling "and more, continuously".
- Asterisk footnote: white «*» on black band, bold white text (DECK1 s18: «جاري العمل حالياً على تحديث استراتيجية أمانة منطقة الرياض للـ3 سنوات القادمة») — used to preempt "your data is stale" objections.
- Small circular connector chips (light-gray circle + chevron ‹) visually linking stat rows to the map/chart they refer to (s13, s15).

Title formulas (the 5 patterns in this section):
1. **Assertion sentence**: full declarative sentence with a number, 32pt, e.g. «يسكن منطقة الرياض حوالي 8.6 مليون نسمة ...», «يتكون قطاع الوسط من 22+ إدارة و32+ قسم».
2. **Green so-what emphasis**: final clause bold + accent4-tint, e.g. s9 «…والذي سيعتمد بشكل رئيسي على نمو المناطق والمدن», s12 «…من خلال العديد من المشاريع والمبادرات الضخمة والنوعية», DECK2 s22 «…من خلال 5 مجالات رئيسية وأكثر من 14 خدمة رئيسية».
3. **Twin-continuation with ellipses**: slide A title ends « ...», slide B title begins «... » — s10 «تدعم الرياض تحقيق رؤية 2030 وتحقيق فوائد تنموية شاملة ...» → s11 «... وهي ركيزة اساسية لنمو المملكة العربية السعودية المستدام»; s16 «تقدم مدينة الرياض أكثر من 420 خدمة لسكانها عبر سلسة القيمة ...» → s17 «... من خلال أكثر من 100+ صاحب مصلحة عبر مختلف القطاعات». s13 does it INSIDE one slide: right white panel title «يسكن منطقة الرياض حوالي 8.6 مليون نسمة ...» + left photo panel continuation in green «... 81% منهم يتركزون في مدينة الرياض».
4. **Chained cascade pills** (s12, DECK1 only): three dark-green rounded header pills across three columns that read as one sentence: «مدينة الرياض محرك رئيسي لاقتصاد المملكة ...» / «... مما جعلها ضمن أفضل 100 مدينة عالمية ...» / «.. وتواصل الرياض في تعزيز مكانتها من خلال العديد من المبادرات عبر قطاعات متعددة».
5. **و-continuation opener** (DECK2 s22): title starts with «ويعمل قطاع الوسط…» — the conjunction و chains it to the previous slide's assertion.

Chart header convention (bold, above every chart/map, 12–14pt): **[metric] ([year(s)], [unit])** — e.g. «سيناريوهات نمو الناتج المحلي الإجمالي الحقيقي للملكة العربية السعودية (2021 – 2040F)، ترليون ريال», «التوزيع الجغرافي لسكان منطقة الرياض (2022، ألف نسمة)», «اعلى الأحياء في عدد السكان (2022، ألف نسمة)», «سيناريوهات نمو سكان مدينة الرياض (2022– 2040)، مليون نسمة». Axis-unit repeated as small label above the y-axis («ترليون ريال»، «مليون نسمة»).

---

## 2. SLIDE ARCHETYPES (one per slide, with reconstruction recipe)

### A. HUB-SPOKE BENEFIT DIAGRAM — "cities through history" (D1 s8 = D2 s8, byte-identical content)
- **Narrative role:** open the POV at the highest possible altitude with a timeless, unfalsifiable truth: cities exist to concentrate economic/social benefit. Zero client data — pure intellectual framing that says "we think about cities, not just deliverables".
- **Layout:** left ~48% = Riyadh skyline photo at dusk (KAFD), dark overlay, with a **chevron/arrow notch** on its inner edge pointing into the content; right ~52% = title (3 lines, 32pt black) + hub-spoke diagram.
- **Hub-spoke anatomy:** center circle «الفوائد الاقتصادية والاجتماعية», 12 spokes each = white circular chip with thin black line-icon + 10pt (sz=1000) black label; spokes interconnected by a **thin 0D8390 (accent5 teal) polygon web** (54 srgbClr 0D8390 instances — every node connected to every node, reads as "network effects"). Labels: الوصول إلى التمويل، الوصول إلى السلع، استقطاب المواهب، النضج الرقمي، الوصول إلى الخدمات، الترفيه، الترابط، الوصول إلى التعليم، الذاكرة والفعالية، المعرفة، المهارات والعمالة، الوصول إلى التقنيات. Diagram caption above: «الفوائد الاقتصادية والاجتماعية للمدن» bold.
- **Photo-panel prose (20pt white, sz=2000, on dark):** 4 paragraphs, each with ONE bold-green emphasis span (26890D in XML): «…لتشغيل محركات الابتكار والازدهار على المستوى الوطني.» / «المجتمع وأصبحوا جزءًا من نظام القيم» / «يجتمع فيها الأفراد لمتابعة اهتماماتهم المشتركة…» / «بنية تحتية وخدمات فعالة من خلال تكثيف وتركيز النقل…». Pattern: plain narrative + green-bold on the phrase carrying the argument.
- **NEW-RFP recipe:** 100% reusable boilerplate for any city/urban client. For a non-urban client, rebuild same geometry with sector-appropriate "benefits of X" (12 nodes max, one per icon). Fixed: layout, web color 0D8390, chip style, 10pt labels. Recomputed: nothing (or node labels only). Quality bar: 10–12 evenly spaced nodes, icons all from the same thin-line family, no text wraps beyond 2 lines.

### B. SATELLITE-PHOTO GDP SCENARIO CHART — kingdom macro (D1 s9 = D2 s9)
- **Narrative role:** kingdom-level economics; plants the claim that national growth depends on cities/regions → justifies the whole engagement class.
- **Layout:** full-bleed night-satellite photo of Arabia from space; title band on top; RIGHT ~58% chart zone; LEFT ~30% dark stat panel.
- **Title:** 32pt, Latin «CAGR» inline in Latin font, green-bold tail «سيعتمد بشكل رئيسي على نمو المناطق والمدن» (accent4 lumMod60/lumOff40, b=1).
- **Chart styling (white-on-dark house style):** 3 scenario lines in pure white on the photo; y-axis 0–15 white labels; x-axis every year 2021→2040 (RTL orientation: 2021 at right); no gridlines; unit «ترليون ريال» above axis. Each line tagged with a **white ellipse chip** containing black bold «CAGR = 8%» / «5.4%» / «3%». Target callout = `wedgeRoundRectCallout` filled **accent2 43B02A**, white bold text «هدف رؤية 2030 = 6.5 ترليون ريال», pointer to a **green dot marker** placed on the line at 2030. Chart header per convention with «(2021 – 2040F)، ترليون ريال».
- **Stat panel:** header «مساهمة المناطق والمدن في الناتج المحلي الإجمالي الوطني» white bold; then stacked pairs: «4 – 6.2» 54pt bold Sakkal accent3-tint + «ترليون ريال في عام 2030» 28pt bold white; «5.5 – 13.3» + «ترليون ريال في عام 2040». (Ranges = low/high scenario endpoints — numbers-first, range form.)
- **NEW-RFP recipe:** KSA boilerplate; refresh GDP series + Vision target from latest GaStat/IMF; if client is in another city, keep the KSA frame. Fixed: photo, chart grammar (white lines, CAGR ellipses, 43B02A wedge callout, green dot), stat-panel styling. Recomputed: the 3 CAGRs, the range stats, target value. Quality bar: scenario lines must converge at the actual current-year value; callout anchored exactly at intersection year.

### C. VISION-2030 CASCADE PYRAMID (D1 s10 = D2 s10)
- **Narrative role:** tie the city to the national vision in ONE slide; show we can read a strategy house top-down (L1 pillars → L2 objectives → L3 strategic objectives → 2030 targets).
- **Layout:** satellite photo bg; title «تدعم الرياض تحقيق رؤية 2030 وتحقيق فوائد تنموية شاملة ...» (ends with ellipsis → continues on quote slide); «غير شامل» pill top corner; centered official Vision 2030 logo; then 3 labeled levels of white/translucent rounded boxes: L1 «المستوى الاول الركائز الرئيسية»: اقتصاد مزدهر / مجتمع حيوي / وطن طموح; L2 «الأهداف الفرعية» 4 boxes (تنمية مساهمة القطاع الخاص في الاقتصاد، إطلاق قدرات القطاعات غير النفطية الواعدة، الارتقاء بجودة الحياة في المدن السعودية، تنمية وتوزيع الاقتصاد); L3 «الأهداف الاستراتيجية» 5 boxes (جذب الاستثمار الأجنبي المباشر، الارتقاء بجودة الخدمات المقدمة في المدن السعودية، تحسين المشهد الحضري…، تحسين الربط المحلي والإقليمي والدولي…، تطوير رأس المال البشري…). Level captions sit on trapezoid/funnel connector shapes.
- **Bottom target band** (translucent dark strip): 3 stats each = number in white circle with green arc/paren + bold white text: «10» الارتقاء إلى قائمة أفضل 10 دول في مؤشر التنافسية العالمي; «3» عدد المدن السعودية بين أفضل 100 مدينة عالميًا; «20» تصنيف المملكة عالمياً في مؤشر الفاعلية الحكومية. Source: «المصدر: رؤية 2030».
- **NEW-RFP recipe:** structure 100% reusable for ANY KSA public client — only the SELECTION of L2/L3 objectives changes (pick the 4–5 relevant to the RFP domain; that's why «غير شامل» is mandatory here). Research needed: which Vision objectives/targets map to the client's mandate. Quality bar: use official logo, official objective wording verbatim, keep 3/4/5 box rhythm.

### D. ROYAL QUOTE SLIDE (D1 s11 = D2 s11)
- **Narrative role:** unimpeachable authority anchor; makes "Riyadh matters" a royal statement, not a consultant's opinion. Continuation title «... وهي ركيزة اساسية لنمو المملكة العربية السعودية المستدام» closes the ellipsis opened on s10.
- **Layout:** full black background; right ~40% = cut-out photo of the Crown Prince; left/center = giant quote in bold white Sakkal (~24–28pt), flanked by oversized decorative quotation-mark graphics (Graphic5/6.jpg); the final aspiration sentence is green-bold: «ونستهدف أن تكون الرياض من أكبر 10 اقتصاديات مدن في العالم». Attribution block below: bold white «صاحب السمو الملكي الأمير محمد بن سلمان بن عبد العزيز آل سعود» + regular «ولي العهد ورئيس مجلس الوزراء». No source line (the speaker IS the source). Quote text includes the 50% non-oil-economy stat.
- **NEW-RFP recipe:** reusable verbatim for any Riyadh engagement. For another city/sector: find an equivalent royal/ministerial quote naming the client's domain; NEVER paraphrase — quote verbatim, green-highlight only the target/number sentence. Fixed: black bg, cut-out portrait, quote-mark graphics, attribution hierarchy.

### E. TRIPLE-CASCADE RANKINGS SLIDE (D1 s12 ONLY — dropped in DECK2)
- **Narrative role:** city credentials — proof Riyadh already performs (rankings) and keeps investing (megaprojects). Dropped in DECK2 because that proposal's story runs to a sub-entity and needed room; shows this slide is OPTIONAL garnish in the funnel.
- **Layout:** dark city-photo bg; «غير شامل» pill; THREE columns, each headed by a dark-green (046A38) rounded pill with white circular icon, pills chain into one sentence (see title formula 4). Column 1 (right): 3 photo-stat rows — big pale-green numbers «27%» من سكان السعودية, «50%» من الناتج المحلي الإجمالي غير النفطي للمملكة, «38%» من جميع الوظائف في السعودية, each with a circular photo chip. Column 2 (middle): 3 ranking rows each = white logo card (IMD / Savills / GaWC) + label + big number: «مؤشر المدينة الذكية IMD — المرتبة 27 عالميًا», «مؤشر مراكز النمو - سافيلز — المرتبة 15 عالميًا», «تصنيف GaWC — ضمن أفضل 100 مدينة». Column 3 (left): 6 initiative chips with circular photos: المشاريع الضخمة، استراتيجية الاستدامة، مشاريع النقل، برنامج جذب المدارس الدولية، مشاريع البناء للمناطق الحضرية، الأحداث الكبرى.
- **NEW-RFP recipe:** research fresh: city share stats (population/GDP/jobs), 3 international rankings with logos, 6 flagship initiatives. Template fixed: 3-column cascade, green pills, photo chips, big-number styling. Quality bar: every number sourced, rankings ≤2y old, real logos.

### F. TWIN-TITLE POPULATION STAT + REGION MAP (D1 s13 = D2 s12)
- **Narrative role:** first client-geography data slide: region has 8.6M people and 81% concentrate in the city → the city is where the work is.
- **Layout — 3 vertical bands:** RIGHT ~38% white: title part 1 + chart header «التوزيع الجغرافي لسكان منطقة الرياض (2022، ألف نسمة)» + **region choropleth** (light-green province map, each governorate labeled number+name: 7,009 الرياض (مقر الامارة), 201 الدوادمي, 152 المجمعة, 92 وادي الدواسر, 72 عفيف, 71 القويعية, 55 الافلاج, 42 حوطة بني تميم; darkest fill = Riyadh governorate) + **gradient legend bar** white→dark-green with end labels «كثافة سكانية منخفضة / كثافة سكانية عالية». MIDDLE ~28% dark overlay: 3 stacked stats separated by dashed white lines, each linked by a circular chevron chip to the map: «8.6 مليون» (8.6 = 54pt sz=5400 bold Sakkal, WHITE bg1 here — on the dark middle panel stats are white, green is reserved for the left title) + label «عدد السكان في منطقة الرياض» 24–28pt; «23 نسمة لكل كم²» (superscript ²); «81% — من السكان يسكنون في مدينة الرياض (7+ مليون نسمة)». LEFT ~33%: skyline photo + continuation title in green 32–44pt «... 81% منهم يتركزون في مدينة الرياض».
- Source: «المصدر: أبحاث وتحليلات مونيتور ديلويت، أمانة منطقة الرياض، الهيئة العامة للإحصاء».
- **NEW-RFP recipe:** for a new region/city re-pull GaStat census: total pop, density, concentration %; redraw choropleth (single-hue green ramp, numbers in ألف نسمة). The **echo trick** is fixed: the same headline number (81%) appears in BOTH the green continuation title and the stat ladder. Quality bar: stat panel numbers must sum/agree with map labels.

### G. FULL-BLEED CITY CHOROPLETH + DISTRICT BAR CHART (D1 s14 = D2 s13)
- **Narrative role:** prove granular knowledge of the client's territory — down to أحياء (districts). This is a "we already know your streets" slide.
- **Layout:** ~75% of slide = detailed GIS choropleth of Riyadh city districts (5-step heat ramp cream→yellow→orange→red-orange→dark red; roads dark-green lines; dashed boundary = «النطاق العمراني»; hatched = «المناطق الصناعية والورش»). Legend card bottom-left, white, header «مفتاح الخريطة», rows: boundary/roads/industrial + 5 population bins (أقل من 10000 / من 10000 لـ 30000 / من 30000 لـ 50000 / من 50000 لـ 100000 / أكثر من 100000). RIGHT column = title-as-paragraph 32pt: «وفي مدينة الرياض يتوزع السكان حول المدينة، حيث يأتي حي طويق في المقدمة باعتباره الأعلى من حيث عدد السكان، يليه حي ظهرة لبن، ثم حي العزيزية» (note: names the top-3 in prose = numbers-first storytelling). Bottom-right inset **bar chart**: header «اعلى الأحياء في عدد السكان (2022، ألف نسمة)», 6 green bars (86BC25-family) with value labels above: طويق 283، ظهرة لبن 237، العزيزية 176، النسيم الغربي 160، الدار البيضاء 159، الرمال 141.
- **NEW-RFP recipe:** requires real GIS output (ArcGIS-style) — this is a make-or-break authenticity signal; an AI-ish schematic map would fail the bar. Re-research: district populations, top-6 ranking. Fixed: heat-ramp bins, legend card format, prose-title naming top-3, green bar chart inset. NOTE: this map is a placed image; budget real map production.

### H. POPULATION SCENARIO CHART + IMPLICATIONS PANEL (D1 s15 = D2 s14)
- **Narrative role:** the future-problem slide — growth to 15M+/23M makes planning/operations/services unavoidable → creates the need the RFP answers. The left panel literally states the engagement thesis.
- **Layout:** same grammar as archetype B but city-level: full-bleed Riyadh photo; title «من المتوقع أن يصل عدد السكان في مدينة الرياض إلى أكثر من 15 مليون نسمة بحلول 2040 ...»; chart header «سيناريوهات نمو سكان مدينة الرياض (2022– 2040)، مليون نسمة»; 3 white lines with white-ellipse chips CAGR = 9% / 6% / 5%; y 0–35; x 2018→2040. Big stat right of chart: «23~ مليون نسمة» (54pt accent4-tint bold) + «في عام 2040» 28pt white.
- **Left dark panel = continuation title + bullets:** green/white mixed headline «...مما يستوجب تخطيط شامل وتشغيل متكامل وخدمات بجودة عالية تلبي احتياجات السكان والزوار» (key nouns in green), then 3 bullets each with chevron chip, **bold lead-in + explanation** anatomy: «تخطيط استباقي شامل لمواكبة النمو وتلبية الطلب العالي على البنية التحتية (مثل الطرق، الصرف الصحي، الخ)» / «ضرورة الاستعداد المبكر للتحولات الاستراتيجية ووضع خطط للتعامل مع عدم اليقين وبناء السيناريوهات الاستراتيجية وفق المتغيرات» / «فهم التوجهات المحلية والعالمية والتوسع في الخدمات بأعلى جودة، لضمان جودة حياة عالية للسكان والزوار». These three bullets are a stealth restatement of the RFP's three service pillars — the funnel's punchline.
- **NEW-RFP recipe:** recompute scenarios from census + growth assumptions; REWRITE the 3 implication bullets to mirror the new RFP's scope verbs (this is where context is welded to scope). Everything else fixed. Quality bar: implications must use the client's own RFP vocabulary.

### I. VALUE-CHAIN × SERVICE-GROUP MATRIX (D1 s16 = D2 s15)
- **Narrative role:** show mastery of WHAT a city does (420+ services) using a proprietary framework («إطار ديلويت لإدارة المدن» cited in source line) — the "we brought our own IP" slide.
- **Layout:** full-bleed dark bokeh photo. Top row (RTL): label «مكونات سلسلة القيمة» + 6 gray chevron header cells: التمويل ← السياسات والتنظيم ← التخطيط والتنفيذ ← تنفيذ المشاريع ← تقديم الخدمات ← التشغيل والصيانة. Below: 14–15 horizontal green service-group bars spanning the matrix, each with a tiny white line-icon chip: الكهرباء، المياه، الصرف الصحي، إدارة النفايات الصلبة، الطرق، النقل، الاتصالات | التخطيط والاسكان، الرعاية الصحية، التعليم، الترفيه والتسلية، السلامة والأمن | تمويل المدينة، التجارة والاستثمار، تطوير المهارات والقوى العاملة. Bars are grouped by a **green categorical ramp** (XML fills: 046A38 → 058143 → 009A44 → 00BC55 → 43B02A → 4DCA30, dark→bright by group) + downward arrow overlays (gradient, showing flow through the chain). Center white overlay card, bold italic: «420 خدمة عبر 14 مجموعة خدمات». RIGHT rail: 3 category cards colored by the same ramp: «البنية التحتية للمدينة» (046A38 dark), «التنمية الاجتماعية» (mid green), «التنمية الاقتصادية» (43B02A bright), each with white icon; adjacent light-gray description panels with bold-green emphasis: «…يتمتعون بمستوى عالمي من المعيشة وجودة الحياة…», «…بالدعم الاجتماعي الأساسي اللازم…», «…لتحسين وضعهم الاجتماعي والاقتصادي». Column headers italic bold: «حزم خدمات المدينة» / «وصف حزم الخدمات».
- **NEW-RFP recipe:** the framework (6 value-chain steps + 3 service families) is reusable Deloitte IP; recount services for the new client («420 خدمة» → client's number, from service-catalog research or RFP annexes). Fixed: chevron header row, green ramp, 3-family cards, center count card. Quality bar: the count must be defensible; groups must equal the stated 14.

### J. 100+ STAKEHOLDER LOGO WALL (D1 s17 = D2 s16)
- **Narrative role:** ecosystem mastery — the client sits among 100+ entities; also pre-positions the two "city management" anchors (dashed-focus device points to the client).
- **Layout:** dark photo bg; «غير شامل» top-left; title 36pt «... من خلال أكثر من 100+ صاحب مصلحة عبر مختلف القطاعات»; bold white intro line «أكثر من 100+ جهة في القطاع العام والخاص وغير الربحي لهم علاقة مباشرة أو غير مباشرة بتقديم الخدمات العامة في مدينة الرياض ...». GRID of white rounded cards (logo walls): «مركز الحكومة» (royal court, council, SMO logos), «برامج تحقيق الرؤية» (VRP logos), 16 sector-ministry mini-cards in 2 rows (البلديات والإسكان، الإعلام، الرياضة، السياحة، الثقافة، الموارد البشرية، النقل والخدمات اللوجستية، الطاقة والصناعة والتعدين، المالية، الاتصالات وتقنية المعلومات، الصحة، التعليم، البيئة والمياه والزراعة، الدفاع والأمن، التجارة والاستثمار، الاقتصاد والتخطيط), wide cards «هيئات ومراكز وصناديق» and «الشركات / المشاريع الحكومية» (PIF, Aramco, SABIC, NHC, Qiddiya, SAMI…), bottom cards «القطاع الخاص (ممثلة في 16 لجنة في غرفة الرياض)» + «القطاع الثالث». RIGHT rail: 4 bright-green big-number chips: «14+ جهة مركزية», «30+ جهة قطاعية», «25+ هيئات وصناديق ومشاريع», «20+ قطاع خاص وثالث». LEFT rail with caption «يتقطاعون مع جهتين محلية رئيسية لإدارة المدينة» [sic — typo for يتقاطعون, human artifact]: two circular icon chips «مدير المدينة» (Amanah logo) and «مخطط المدينة» (Royal Commission for Riyadh City logo), the first wrapped in the **dashed-green focus frame + «تركيزالشرائح التالية» tag** with a green side-arrow.
- Interior card text 11pt (sz=1100 ×42); accent fill 166938 (dark green) for category headers.
- **NEW-RFP recipe:** heavy research slide: enumerate the client's real stakeholder landscape, harvest ~70–100 logos, bucket into 4–6 categories with counts (X+). Fixed: card wall grammar, right-rail count chips, dashed focus device pointing at the client. Quality bar: real logos at consistent size on white cards; counts match visible buckets; category taxonomy mirrors KSA governance layers (مركز الحكومة → قطاعات → هيئات → شركات → خاص/ثالث).

### K. BACKBONE / STRATEGY-HOUSE SLIDE (D1 s18 = D2 s17) — funnel landing on the client
- **Narrative role:** the funnel's destination: «تشكل أمانة منطقة الرياض العامود الاساسي في التنمية الشاملة، وتعمل كجهة ممكنة ومحركة للنهضة الشاملة لعمل المنظومة في المدينة». Simultaneously proves we've read the client's own strategy (house diagram) and quantified it (stat ladder).
- **Layout:** LEFT ~40% dark earth-at-night photo panel: stat ladder with dashed separators — «10 أهداف استراتيجية للأمانة», «26+ مبادرة استراتيجية», «44+ مؤشر أداء», «4 ممكنات رئيسية»; numbers 60–80pt (sz=6000, one sz=8000) bold in green (26890D family), labels bold white 18pt (sz=1800); black band at bottom with white * footnote «جاري العمل حالياً على تحديث استراتيجية أمانة منطقة الرياض للـ3 سنوات القادمة». RIGHT ~60% = **strategy house**: green-outlined roof triangle «الرؤية: أمانة رائدة لرياض مزدهرة ومستدامة ترتقي بجودة الحياة»; white mission bar «الرسالة: الارتقاء بالرياض من خلال تعزيز التنمية الحضرية المستدامة وتوفير خدمات عالية الجودة وبناء شراكات فعالة نحو مجتمع نابض بالحياة»; 4 pillar columns (dark-green 01563C gradient rects with hatched capitals): التنمية الحضرية، خدمات متميزة، مجتمع حيوي، الاستدامة المالية = «الأهداف الاستراتيجية»; base bar «القيم» with 5 icon+label values: التميز، المستفيد أولاً، الابتكار، الشفافية، التعاون. Client logo top-right. Source: «المصدر: أمانة منطقة الرياض».
- **NEW-RFP recipe:** ALL content client-specific: pull vision/mission/pillars/values verbatim from the client's published strategy; count objectives/initiatives/KPIs/enablers for the stat ladder (X and X+ forms). Fixed: house geometry (roof/mission/pillars/base), left stat-ladder styling, * caveat when strategy is mid-refresh. Quality bar: verbatim client wording; counts consistent with the client's documents; side label «الأهداف الاستراتيجية» / «القيم» brackets.

### L. STRATEGY-LINKAGE HUB (D2 s18 only)
- **Narrative role:** first DECK2 extension slide: the client's strategy is not an island — «ترتبط استراتيجية الأمانة بشكل مباشر مع اهداف رؤية 2030 والاستراتيجيات القطاعية ذات العلاقة». Converts strategy documents into countable linkage evidence.
- **Layout:** dark KAFD photo bg; CENTER green circle (43B02A ring) with client logo أمانة منطقة الرياض; SIX white rounded cards around it (2 columns × 3), thin connector lines to hub. Each card = fanned screenshot thumbnails of the actual strategy documents + big black bold number (40–44pt, sz=4000/4400) + label: «14+ مستهدف ذات علاقة في المستوى الثاني (L2) لرؤية 2030», «4+ مستهدفات ذات علاقة في الاستراتيجية الوطنية للاستثمار», «8+ مستهدفات ذات علاقة في برنامج جودة الحياة وبرنامج التحول الوطني», «6+ مستهدف ذات علاقة في استراتيجية مدينة الرياض», «25+ مستهدف ذات علاقة في استراتيجية التحول البلدي», «6+ استراتيجيات قطاعية أخرى ذات علاقة». Source: أبحاث وتحليلات مونيتور ديلويت.
- **NEW-RFP recipe:** research: read the 5–7 national/sector strategies relevant to the client's mandate, count related targets (the counting itself is the consulting work being previewed). Fixed: hub-circle + 6 white satellite cards + doc-thumbnail collage + big-number+label formula «X+ مستهدف/مستهدفات ذات علاقة في [strategy]». Quality bar: use REAL page screenshots of the strategies (authenticity signal AI decks lack).

### M. ECOSYSTEM-CANOPY 3-CATEGORY SLIDE (D2 s19 only)
- **Narrative role:** decompose the client into its 3 structural families and aim the funnel at one: «تمتلك الأمانة منظومة مكونة من 3 فئات رئيسية».
- **Layout:** dark bg; client logo top-center under a huge **green canopy/umbrella arc** (dark-green gradient) sheltering 3 columns. Each column: bright-green (43B02A) header bar with white icon + bold white label — «الإدارات الداخلية» / «القطاعات» / «الشركات» — over a white card. Card contents: (1) «8 وكالات» + thin divider + «300+ إدارة» (big green 36–44pt numbers, sz=3600/4400); (2) «5 قطاعات في مدينة الرياض» wrapped in **dashed-green focus frame** + green tag «تركيز الشرائح التالية», below «+ قطاع بلديات المنطقة»; (3) «3 شركات» + 3 logos with ownership captions «ملكية 100%» (شركة ريمات الرياض للتنمية), «ملكية 50%» (الرياض القابضة), «ملكية 24%» (الرياض للتعمير) — green bold percentages. Source: مونيتور ديلويت + أمانة.
- **NEW-RFP recipe:** research client org macro-structure (agencies/sectors/companies or equivalent trio), counts, subsidiary ownership %. Fixed: canopy arc, 3 green header bars, white cards, big-green-number style, focus frame on the RFP-relevant category. Quality bar: the trio must be MECE and match the client's own taxonomy.

### N. SECTOR-MAP TRANSFORMATION SLIDE (D2 s20 only)
- **Narrative role:** situate the scoped sector geographically and inside the reform program: «استهدف برنامج التحول البلدي رفع كفاءة التشغيل وتحسين الخدمات البلدية المباشرة وغير المباشرة وتعزيز تجربة المستفيدين والمشاركة المجتمعية لمواكبة التحول الذي حدث ويحدث في مدينة الرياض».
- **Layout:** ~70% = city map divided into 5 colored sector polygons with white road network + labels: قطاع الشمال D27951 (terracotta), قطاع الشرق 9EC7BB (sage), قطاع الوسط **016A47 (dark green — the brand color marks the focus sector)**, قطاع الغرب 81A7D3 (blue), قطاع الجنوب E9CC4A (yellow). Legend = stacked color chips شمال/وسط/جنوب/شرق/غرب; the وسط chip wrapped in dashed-green focus frame + «تركيز الشرائح التالية» tag. RIGHT column: narrative title 32pt + two mega stats: «5 قطاعات» (66pt, sz=6600) and «16 بلدية» (54pt) with chevron chip. Note: NON-focus sectors get muted pastels; ONLY the focus sector wears brand green.
- **NEW-RFP recipe:** map = client's actual territorial decomposition (from RFP/annexes); recolor: brand green on scope, 4 pastels elsewhere. Research: program objectives sentence (from the transformation program charter), sector/municipality counts. Quality bar: real street-grid map base, not abstract blobs.

### O. ORG-CHART SLIDE (D2 s21 only) — «يتكون قطاع الوسط من 22+ إدارة و32+ قسم»
- **Narrative role:** we know the client's insides to the قسم level — deepest point of the funnel.
- **Layout:** WHITE slide (only one in the funnel) with a green-tinted photo band across the top behind the 32pt title. Org tree, all text Sakkal 11pt (sz=1100 ×261), unit headers 14pt: root «رئيس قطاع الأمانة» black/dark box white text; «مكتب رئيس قطاع الأمانة» gray bar; «نائب / مساعد الرئيس» dark-green (046A38) band over 6 staff units (gray rounded rects: إدارة التخطيط والتطوير، إدارة الاستثمار، مكتب إدارة المشاريع، مركز البلاغات، إدارة الدعم المؤسسي، قسم إدارة الكراجات) + «القسم القانوني»; second tier: 5 dark-green general-directorate headers — «الإدارة العامة للرقابة», «الإدارة العامة لتنمية المدينة», «الإدارة العامة للبنية التحتية», «الإدارة العامة للاستدامة البيئية», «مكاتب مدينتي» — each with gray child إدارة boxes (e.g. إدارة صيانة الطرق، إدارة رخص البناء، إدارة الرقابة العمرانية، إدارة نظافة المدينة، إدارة مكافحة الآفات، إدارة المشاركة المجتمعية، إدارة خدمة العملاء…) and small white section-count chips «قسمين» / «3 أقسام» / «4 أقسام» hanging off them. Source: «المصدر: أمانة منطقة الرياض». Title states the totals (22+/32+) that the diagram then evidences.
- **NEW-RFP recipe:** research: real org chart (from client site/RFP/interviews). Fixed: color grammar (dark green = line leadership, gray = units, white chips = counts), 11pt density, title-with-counts formula. Quality bar: counts in title = boxes on chart; keep to 3 levels + count-chips (never draw 32 قسم boxes).

### P. DOMAINS × SERVICES ROWS (D2 s22 only) — closes the funnel onto scope
- **Narrative role:** translate the sub-unit into service language the RFP will price: «ويعمل قطاع الوسط على تلبية احتياجات المدينة ومختلف أصحاب المصلحة الداخليين والخارجيين من خلال 5 مجالات رئيسية وأكثر من 14 خدمة رئيسية» (green on «5 مجالات رئيسية» و«14 خدمة رئيسية»).
- **Layout:** dark photo bg; 5 rows; each row RTL: white line-icon + domain chip (bold white 20–24pt): الرقابة / تنمية المدينة / البنية التحتية / الاستدامة البيئية / المشاركة المجتمعية → **green triangle/play arrow** → 2–4 translucent dark service tiles (16–20pt white): e.g. الرقابة: الرقابة على المباني، الرقابة المساحية، الرقابة التجارية والصحية، الرقابة على اللوحات الإعلامية والإعلانية; تنمية المدينة: الرخص التجارية، الرخص الاستثمارية، التقارير المساحية، بيانات وعمليات الأراضي; البنية التحتية: صيانة الطرق، صيانة الإنارات، صيانة الحدائق والمنتزهات; الاستدامة البيئية: المعالجة البيئية والإنشائية والتجارية، مكافحة الآفات; المشاركة المجتمعية: الفعاليات والأنشطة، التطوع البلدي. Bottom full-width white band, bold black centered: «++ خدمات أخرى يقدمها القطاع بشكل مستمر».
- **NEW-RFP recipe:** the 5 domains/14 services come from the client's service catalog + RFP annexes; this taxonomy should then RECUR in the approach/scope section (it's the bridge out of context into methodology). Fixed: row grammar, green arrows, ++ band, domain icons. Quality bar: domain count in title = rows; services phrased as noun-services (no verbs).

---

## 3. DECK1 vs DECK2 DELTAS (template vs project content)

LITERALLY IDENTICAL (byte-level content, images, diagrams): D1 s8,9,10,11,13,14,15,16,17,18 = D2 s8,9,10,11,12,13,14,15,16,17. This 10-slide run is a **frozen Riyadh/KSA context library** — including the typo «يتقطاعون» carried into both decks and the stale «(2022، ألف نسمة)» data year in the 2025 deck.

Changed:
1. D1 s12 (rankings cascade) **deleted** in DECK2 → optional module.
2. DECK2 **appends s18–s22** (archetypes L–P): the client-strategy-linkage → ecosystem → sector map → org chart → services chain. This is where ~100% of new research went.
3. Footer project line: D1 «العرض الفني: خدمات الدراسات الاستراتيجية والاقتصادية للتخطيط العمراني وإدارة المدن» vs D2 «العرض الفني: أمانة منطقة الرياض | مشروع ضبط جودة مخرجات الأعمال لقطاع وسط مدينة الرياض».
4. Copyright year 2026 vs 2025 (+ trailing period in D2). Slide numbers re-flow.

Implication for a NEW proposal: budget the context funnel as ~10 reusable slides (refresh numbers/years only if Riyadh; rebuild data if another city) + 3–5 new tail slides that carry all client-specific research.

---

## 4. WHAT TO RE-RESEARCH vs REUSE FOR A NEW CLIENT

REUSABLE AS-IS (any KSA urban client): s8 hub-spoke (fully generic), s9 KSA GDP scenarios (refresh series/CAGRs), s10 Vision pyramid (reselect L2/L3 objectives), s11 royal quote (if Riyadh; else find domain quote), s16 value-chain framework (Deloitte IP; recount services), funnel structure, all styling tokens, footers/source-line grammar.

RIYADH-ONLY BOILERPLATE (reusable if client is in Riyadh, rebuild otherwise): s12 rankings/stats, s13 region population + choropleth, s14 district choropleth + top-6 bars, s15 population scenarios, s17 stakeholder wall (adjust counts), s18 Amanah strategy house.

ALWAYS RE-RESEARCHED (the DECK2 tail pattern): client strategy house verbatim + counted stat ladder (10/26+/44+/4), strategy-linkage counts vs national strategies (X+ مستهدف ذات علاقة), ecosystem trio + subsidiaries/ownership %, territorial decomposition map + focus sector, org chart to section level with 22+/32+ style totals, 5-domain/14-service catalog, stakeholder logos, transformation-program objective sentence, and the 3 implication bullets on the growth slide (must be rewritten in the RFP's own vocabulary).

HUMAN-CONSULTANT QUALITY BAR (what makes it not look AI-made): real GIS maps and real document screenshots as evidence; every number carries a source line naming Monitor Deloitte research + client + GaStat; counts in titles always reconcile with counts drawn on the slide; one assertion per slide, stated as a full sentence title with a single green so-what phrase; ellipsis chains make consecutive slides one continuous sentence; dashed-green focus frames physically narrow the funnel; stat numbers use the X+ / range (4 – 6.2) / ~X forms; dense 10–13pt diagram labels on a strict grid; deliberate imperfections (typos, «غير شامل», * caveats) that only occur in genuinely hand-built decks.
