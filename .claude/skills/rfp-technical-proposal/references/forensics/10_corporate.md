# 10 — CORPORATE APPENDICES: About Deloitte, Terms & Conditions, Legal Documents, Final Disclaimer

Scope analyzed: DECK1 slides 234–245 (About Deloitte incl. divider 234), 246–258 (T&C incl. divider 246), 259–269 (legal docs incl. divider 259 and closing disclaimer 269). DECK2 slides 249–260 (About), 261–273 (T&C), 274–285 (legal docs), 286 (disclaimer). Cross-deck diffs run programmatically on the text dumps; XML inspected for slides 235–247, 259/260, 269 and both slide masters.

## 0. HEADLINE FINDING — THIS ENTIRE SECTION IS A VERBATIM, FROZEN LIBRARY

Programmatic `diff` of the text dumps proves it:

- **About Deloitte (11 content slides):** DECK1 235–245 ↔ DECK2 250–260 — **character-for-character IDENTICAL**, every slide.
- **T&C (12 slides):** DECK1 247–258 ↔ DECK2 262–273 — IDENTICAL **except one single word phrase**: in clause 3.1 (slide 248/263) the client legal name is swapped — DECK1 `شركة ريمات الرياض للتنمية` → DECK2 `أمانة منطقة الرياض`, inside the frozen sentence `...من مسؤوليه ، واعداد <CLIENT LEGAL NAME> (يشار اليه فيما بعد ب "العميل")`. That is the ONLY edit in ~12 dense pages of legal text.
- **Legal documents:** same 9 certificate slides with identical breadcrumb titles; DECK2 **appends 2 extra certificates** demanded by that RFP (see §N). The scans themselves are refreshed to the copy current at submission time (DECK1's السجل التجاري slide shows the new teal Ministry-of-Commerce card design; DECK2 shows the older "Company Registration Certificate" scan).
- **Final disclaimer:** same boilerplate; DECK2's version carries two additional lead paragraphs and © year 2025 vs DECK1's 2026.

Consequence for generation: this section is **never rewritten per RFP**. It is copied binary-identical from the reference library; the only recomputed atoms are (1) client legal name in T&C clause 3.1, (2) the © year, (3) the footer project line, (4) the certificate scan images (latest copies), (5) optional extra certificates required by the RFP's شروط التأهيل.

## 0b. Section-wide micro-conventions (both decks)

- **Footer (from slide master, identical on every slide):**
  - Right: `© 2026 ديلويت اند توش الشرق الأوسط المحدودة جميع الحقوق محفوظة` — box at EMU (6379632, 6517368), 5355168×138499, 9 pt (sz=900), Sakkal Majalla (Arabic) / Arial (digits), gray. DECK2: same string with © 2025 and a trailing period.
  - Left-center: project line `العرض الفني: <project descriptor>` — box (960257, 6517368), 6437160×138499, 9–10.5 pt. DECK1: `العرض الفني: خدمات الدراسات الاستراتيجية والاقتصادية للتخطيط العمراني وإدارة المدن` (service name only). DECK2: `العرض الفني: أمانة منطقة الرياض | مشروع ضبط جودة مخرجات الأعمال لقطاع وسط مدينة الرياض` (**client | project** with pipe separator — the later, richer formula; use this one).
  - Far left: plain page number (sldNum field), ~9 pt Arial gray.
- **Title placeholder** on all content slides: off (386400, 345992), ext 11277600×334099 EMU — i.e., a full-width strip 0.42" from left, 0.38" from top; Sakkal Majalla, **20–21 pt** (sz=2000 on T&C/legal slides, 2100 on About slides), black, right-aligned RTL. Titles are full sentence assertions (see each archetype).
- **Palette deviation unique to this library:** the About-Deloitte slides were lifted from Deloitte's *global* brand template, so alongside house 86BC25 they use **009A44** (Deloitte accessible green — used for stat numbers and country names), **3F3D56** (dark navy-slate for labels), **0097A9** (teal accent), **262E3B** (dark band on the AI slide). Do NOT "correct" these to the proposal-body palette — reproducing them as-is is what makes the section look like genuine Deloitte collateral.
- Icon medallions throughout: circle, white fill, **gradient stroke 86BC25 → 009A44** (verified `<a:gs pos="0">86BC25` / `<a:gs pos="100000">009A44` in slide235/236 XML), thin-line white/green pictogram inside.
- Digits: Western digits (67.2, 460,000+) everywhere in the About/stat slides; **Arabic-Indic digits (١٩٢٦، ٥٠٠، ٤١٠٬٠٠٠، ٥٬٩٠٠، ٢٩، ١٥)** only in the final disclaimer's flowing legal prose.

---

## ARCHETYPE A — Appendix divider slide (ملحق ...)

Slides: D1-234 `ملحق / نبذة عن ديلويت`, D1-246 `ملحق / الشروط والأحكام`, D1-259 `ملحق / المستندات القانونية`; D2-249/261/274 identical.

1. **Narrative role:** hard visual break announcing an appendix; resets reader attention after the scored body of the proposal; signals "reference material starts here".
2. **Layout anatomy:** full-bleed composite: left ~22% of slide = warm gold/beige ribbed architectural arc photo (KAFD-style building), curving into a dark-green field (photo of Riyadh skyline at night under a heavy 046A38/0D3A2B-family overlay); overlaid white thin wave-line contours and semi-transparent Deloitte pattern glyphs (triangles/chevrons); title block right-aligned in right half, vertically centered.
3. **Typography:** two lines — line 1 `ملحق`, line 2 the appendix name — **88 pt** (sz=8800) Sakkal Majalla bold, white FFFFFF, right-aligned; letter-spaced (rendered with wide tracking). Open Sans registered for any Latin fallback. No footer content visible on dividers.
4. **Title formula:** literally `ملحق` + line-break + `<اسم الملحق>` (`نبذة عن ديلويت`, `الشروط والأحكام`, `المستندات القانونية`). No highlight color, no pagination.
5–7. No body, no source line, no footer page furniture.
8. **Deltas:** pixel-identical across decks (same background art, same 88 pt setting).
9. **RECIPE:** reuse the divider background image asset unchanged; type the two lines; one divider per appendix, always in the order: نبذة عن ديلويت → الشروط والأحكام → المستندات القانونية.

---

## ARCHETYPE B — Global KPI card row ("largest professional services firm") — D1-235 / D2-250

1. **Role:** first credibility slide; establishes Deloitte's global scale in 5 numbers within 3 seconds.
2. **Layout:** title strip; below title at right a bold green kicker `السنة المالية 2024` (86BC25, ~21 pt, 2 lines right-aligned); then a row of **5 equal rounded-rect cards** (roundRect, light-gray fill fading to white at bottom), RTL order right→left: الإيرادات → عدد الموظفين → عدد الموظفين الجدد → الدول والمناطق → الاستثمارات المجتمعية. Each card is topped by a circular icon medallion (money-nest $, three people, people group, globe, hand-holding-globe) overlapping the card's top edge. Bottom third of slide: decorative scatter of small 86BC25 dots forming a fading "confetti burst" (pure ornament).
3. **Typography:** big number **28 pt bold 86BC25** (sz=2800 ×19 runs), label **24 pt** dark slate **3F3D56** (sz=2400 ×27 runs); title 21 pt black. Number and label stacked, right-aligned within card.
4. **Title formula:** superlative assertion sentence — `ديلويت هي أكبر شركة خدمات مهنية في العالم`. No highlight, no breadcrumb.
5. **Body pattern:** numbers-first: value + unit + noun label, no verbs: `67.2 مليار دولار / الإيرادات`, `+460,000 / عدد الموظفين`, `+92,000 / عدد الموظفين الجدد`, `+150 / الدول والمناطق`, `416 مليون دولار / الاستثمارات المجتمعية`. `+` prefix in RTL renders after the number (150+).
6. **Visual grammar:** gradient-stroke circle medallions (86BC25→009A44); cards with soft vertical gradient; green dot scatter.
8. **Deltas:** none (identical).
9. **RECIPE:** frozen library slide; only update the FY label and figures when Deloitte publishes new Global Impact numbers (annual). Never re-layout.

---

## ARCHETYPE C — Revenue breakdown: 3 cards + timeline band — D1-236 / D2-251

1. **Role:** decomposes the 67.2B headline into sector / business-line / region, plus 4-year growth trend — proves breadth AND momentum.
2. **Layout:** title; **3 white rounded cards** in a row (right→left: الإيرادات حسب القطاع، الإيرادات حسب مجال الأعمال، الإيرادات حسب المنطقة), each headed by an icon medallion (building, briefcase, globe) beside a 2-line green header; below, a stacked list of `label: value` lines. Bottom: **full-width gradient band 86BC25→009A44** (~1.1" tall) carrying a horizontal dotted line with 4 white ellipse markers = يالسنة المالية 2021→2024 revenue timeline (`السنة المالية 2024 / 67.2 مليار دولار` … `2021 / 50.2 مليار دولار`), labelled `إجمالي الإيرادات` at right with a money icon medallion on the band.
3. **Typography:** card headers ~16 pt green; list rows: category label 12 pt gray + value **18 pt bold black** run inline (sz=1800 ×43 = the values; sz=1200 ×14 = labels); band text white, mixed 14–24 pt.
4. **Title formula:** trend assertion with the number in the sentence: `وصلت الإيرادات العالمية التراكمية في 2024 إلى 67.2 مليار دولار`.
5. **Body pattern:** strict `<segment>: <n.n> مليار دولار` parallel rows (e.g. `الخدمات المالية: 18.3 مليار دولار`); regions: `الأمريكيتين: 36.4 مليار دولار`, `أوروبا، الشرق الأوسط، أفريقيا: 21.5`, `آسيا المحيط الهادئ: 9.5`.
7. **Micro:** compliance footnote in ~10 pt under the middle card: `* اعتباراً من 1 أكتوبر 2024 فصاعداً، يجب ألا تتضمن أي إشارة إلى الإيرادات سوى التدقيق والمراجعة، الاستشارات الضريبية والقانونية، الأعمال الاستشارية فقط.` — keep it; it is a real Deloitte-brand-police artifact that screams authenticity.
8. **Deltas:** none.
9. **RECIPE:** frozen; refresh values annually from Global Impact Report; keep the footnote.

---

## ARCHETYPE D — Middle-East heritage: stat rail + choropleth map + green display quote — D1-237 / D2-252

1. **Role:** localizes the global story: ~100 years in the Middle East, trusted advisor claim.
2. **Layout (RTL reading order):** right column = **green display statement** in huge light-green type: `لا نزال نعمل كمستشارين موثوقين لمختلف عملائنا في الشرق الأوسط منذ قرابة 100 سنة` (86BC25, ~24–31 pt, sz=3100 for the display runs) followed by 3 justified gray paragraphs (أضخم شركة للخدمات المهنية…؛ لقد ساهم وجود ديلويت…؛ تقريرنا عن تأثير ديلويت الشرق الأوسط…). Center: **Middle-East choropleth map** shaded in 3–4 green tints (KSA darkest), English country labels. Left edge: **vertical light-gray rounded rail** (single roundRect, F2F2F2-family) stacking 5 stats each with a small gradient circle icon: `+7,000 موظف متخصص / 41% نساء / 101 جنسية / 15 دولة / 23 مكتباً`. Top-center: 2 gray paragraphs on expert quality (يتميز جميع الخبراء… / إن جميع المهنيين…).
3. **Typography:** rail numbers **28 pt bold 009A44** (sz=2800 ×7), rail labels **14 pt bold** dark; paragraphs 14–16 pt gray; display quote 86BC25.
4. **Title formula:** `تمتلك ديلويت خبرة تقارب 100 سنة في الشرق الأوسط` — number embedded in sentence.
5. **Body pattern:** stat = number bold green + noun; paragraphs are 2–3 line justified prose (this library tolerates longer prose than the proposal body).
6. **Visual grammar:** the ONLY choropleth map in the corporate library; green monochrome ramp.
8. **Deltas:** none.
9. **RECIPE:** frozen; the display-quote-in-green + left stat rail is the signature "regional credibility" pattern — reuse asset as-is.

---

## ARCHETYPE E — Office directory — D1-238 / D2-253

1. **Role:** proof of on-the-ground presence: every ME country + city office enumerated.
2. **Layout:** right third = green display statement (86BC25, ~28–32 pt, sz=3200): `يعمل لدينا ما يزيد عن 7,000 موظف متخصص موزعون في 15 دولة حيث يقدمون مختلف الخدمات إلى منطقة الشرق الأوسط ودول مجلس التعاون الخليجي`; beneath it a **gradient band + circular white-line medallion badge** `101 جنسية` (number 32 pt white/bold on band). Remaining ~two-thirds: **directory columns** (3 columns + a bottom row): country name bold **009A44 16 pt**, city names 16 pt black beneath (المملكة العربية السعودية → الرياض، جدة، الخبر؛ الإمارات → دبي، أبوظبي، الفجيرة، رأس الخيمة، الشارقة؛ etc., 15 countries/24 cities).
3. **Typography:** 74 runs at sz=1600 — the whole directory is uniform 16 pt; only country headers bolded+colored.
4. **Title formula:** `تمتلك ديلويت أكثر من 7000 موظف متخصص عبر 15 دولة في الشرق الأوسط`.
8. **Deltas:** none. (LibreOffice render shows the badge overlapping text — RTL render artifact, not real layout.)
9. **RECIPE:** frozen list; only touch if Deloitte's office network changes.

---

## ARCHETYPE F — History & awards two-zone — D1-239 / D2-254

1. **Role:** heritage (est. 1926) + employer-brand awards + purpose/values.
2. **Layout:** upper zone = full-width **light-gray rounded panel**: right column `لمحة سريعة` (green bold 86BC25 header ~14–16 pt + black para: افتتحت ديلويت أول مكتب لها… 1926… عبر 24 مكتباً… أكثر من 7,000 شريك ومهني وموظف); left inset **white card** `الجوائز` with green trophy line-icon and three "Great Place to Work / Best Workplaces" badge images (KSA 2023, UAE 2022–2023), caption text 12 pt. Lower zone (on white, over a faint green wave graphic): two columns with green bold headers `تأثيرنا الداخلي` (right) and `التأثير الخارجي` (left), each a 4–6 line justified gray paragraph.
3. **Typography:** headers 86BC25 bold ~14 pt; body 12–14 pt gray 53565A-family; award captions include quoted award names in Arabic quotes: `جائزة ”أفضل مكان عمل“`.
4. **Title formula:** historical fact as sentence: `افتتحت ديلويت أول مكتب لها في منطقة الشرق الأوسط في 1926`.
8. **Deltas:** none.
9. **RECIPE:** frozen; swap award badges only when newer awards exist in the library.

---

## ARCHETYPE G — Parent-network (NSE) slide — D1-240 / D2-255

1. **Role:** situates DME inside Deloitte North & South Europe — scale reassurance for mega-projects.
2. **Layout:** right rail = green display statement (86BC25, ~32 pt): `تحتل ديلويت شمال جنوب أوروبا المرتبة الثانية من حيث الحجم بين الشركات في شبكة ديلويت`, followed by a gray paragraph. Left-center: two justified gray paragraphs (3,000 شريك، 100,000 موظف…). Bottom-center: **two white rounded stat cards** with icon medallions: `أكثر من 100,000 / موظف يعملون في ديلويت شمال جنوب أوروبا` and `28 / دولة جميعها جزء من شركة واحدة` — numbers **44 pt** (sz=4400) 86BC25. Under cards, a link-style line: `اقرأ المزيد حول أثر ديلويت شمال جنوب أوروبا الذي يفيد العملاء والموظفين والمجتمع`.
3. **Typography:** display 32 pt 86BC25; body 14 pt gray 7F7F7F; card numbers 44 pt green, labels 14–18 pt.
4. **Title:** `تتبع ديلويت الشرق الأوسط لديلويت شمال جنوب أفريقيا` — NOTE: the title literally says "أفريقيا" while every body mention says "أوروبا"; this is a **typo frozen into both decks** (proves verbatim copying; a regenerated deck should fix it to أوروبا).
8. **Deltas:** none (typo included).
9. **RECIPE:** frozen; correct the أفريقيا/أوروبا typo once in the library.

---

## ARCHETYPE H — Service dimensions hub — D1-241 / D2-256

1. **Role:** one-glance map of Deloitte's 4 service dimensions (the "what we sell" slide).
2. **Layout:** center = large circle with white magnifier-over-briefcase line icon on a **radial gradient green disc (86BC25→009A44)** wrapped in a spiral halo of green dots (two arcs of scatter-dots). Four quadrant lists (2 right, 2 left), each headed by a **short rounded 86BC25 bar** (small pill, no text) above the list: quadrant heads are the dimensions — right-top: التكنولوجيا والأداء المؤسسي (+ الهندسة، الذكاء الاصطناعي والبيانات؛ الخدمات السيبرانية؛ المستهلك؛ راس المال البشري), left-top: الاستراتيجية والمعاملات (+ المخاطر والشؤون التنظيمية، البحث والتقصي), left-bottom: الضرائب (+ خدمات أصحاب العمل العالميين؛ حلول إجراءات العمل؛ الشؤون القانونية), right-bottom: التدقيق (+ المراجعة).
3. **Typography:** list items ~16–18 pt, first item (dimension name) dark/bold, sub-items green or gray; generous whitespace — this is the airiest slide in the deck.
4. **Title:** `تقدم ديلويت خدماتها عبر 4 أبعاد رئيسية` — count-first formula.
6. **Visual grammar:** the dotted-spiral hub is a brand asset — reuse image, don't redraw.
8. **Deltas:** none.

---

## ARCHETYPE I — Industry matrix — D1-242 / D2-257

1. **Role:** shows sector coverage: 5 industries / 20 sectors — used to prove the firm knows the client's vertical.
2. **Layout:** left ~28% = giant lime **magnifier + briefcase outline icon** (86BC25, line style). Right ~72% = **5 outlined rounded panels** in 2 columns (right col: المستهلك وقطاع التجزئة، الخدمات الحكومية والعامة وعلوم الحياة والرعاية الصحية; left col: الخدمات المالية، التكنولوجيا والإعلام والاتصالات، الطاقة والموارد والصناعات). Panel = white fill, **1 pt 86BC25 border, rounded corners w/ one clipped corner**, header in green ~16–18 pt, then 2–6 sector lines in gray 12–14 pt.
4. **Title:** `تركز ديلويت على 5 مجالات عمل رئيسية و20 قطاعاً في السوق العالمية` — double-count formula (5 … و20 …).
5. **Body:** bare noun lists, strictly parallel (السيارات؛ المنتجات الاستهلاكية؛ التجزئة، والجملة، والتوزيع؛ …).
8. **Deltas:** none.
9. **RECIPE:** frozen; when responding to a sector RFP you do NOT trim this to the client's sector — full breadth is the message.

---

## ARCHETYPE J — AI powerhouse: KPI row + dark alliance band + regional presence — D1-243 / D2-258

1. **Role:** positions Deloitte as the #1 AI transformation partner (kept even in non-AI RFPs — both decks include it).
2. **Layout (3 stacked zones):**
   - Zone 1: 4 KPIs right→left: `+10 ألف / موظف عالمي مختص…`, `2.2 مليار دولار / إيرادات من مشاريعنا…`, `22 / مركز تنفيذ ضمن شبكتنا العالمية`, `4.0 مليار دولار / استثماراتنا العالمية…` — numbers **36 pt** (sz=3600) 86BC25 bold, labels 12 pt dark.
   - Zone 2: full-width **dark band** (photo with 262E3B/303F47 overlay), white intro line `نعمل على دفع عجلة الابتكار بالاشتراك مع عملائنا، وتوفير تجربة سلسة لهم من خلال ...`, then: green bold inline lead-ins in 86BC25 (`المنظومات والتحالفات`, `معهد ديلويت العالمي للذكاء الاصطناعي™`, `مركز ديلويت لحوسبة الذكاء الاصطناعي` (NVIDIA DGX AI), `نموذج المواهب والتنفيذ`) + a **partner logo wall** on white chips: Anaplan, Google Cloud, Snowflake, Informatica, dataiku, UiPath, blueprism, Microsoft, databricks + "All in on AI" book cover + 2 report covers.
   - Zone 3: 3 columns under green-highlighted section header `حضورنا في الشرق الأوسط` (white text on 86BC25 highlight bar): each column = bold black claim headline (`أضخم فريق متخصص… في دول مجلس التعاون الخليجي`, `افتتاح معهد الذكاء الاصطناعي في الرياض`, `مركز الذكاء الاصطناعي للابتكار`) + para where key numbers/phrases are **inline-bolded in green** (`اكثر من 200 موظف متخصص`, `وأكثر من 25 خبير`).
3. **Typography:** 35 runs @12 pt body; 10 runs @36 pt numbers; white 12–16 pt in dark band.
4. **Title:** two-line superlative: `ديلويت هي الشركة الوحيدة التي تركز على مساعدة عملائها على تنظيم أكثر رحلات التحوّل تعقيداً في مجال الذكاء الاصطناعي والبيانات`.
6. **Visual grammar:** ONLY slide with third-party logos on dark; logos always on white rounded chips for contrast.
8. **Deltas:** none.

---

## ARCHETYPE K — AI Institute research slide — D1-244 / D2-259

1. **Role:** thought-leadership proof (research, academia, reach metrics).
2. **Layout:** under title, a **full-width green gradient banner** headed `وجهة نظرنا` (white bold) containing 3 white bullet lines (POV statements: انطلاقاً من حقيقة أن الذكاء الاصطناعي سيبقى…؛ لا يجب النظر إلى الذكاء الاصطناعي على أنه مجرد تكنولوجيا…؛ السحابة وتكنولوجيا إيدج والذكاء الاصطناعي التوليدي – الرهانات الثلاث الأولى…). Below, **two 1-pt-green-outlined panels**: right = `نقوم بإجراء البحوث وإعداد المؤلفات والدراسات الشاملة ...` (bold lead-in inside sentence) with 3 report covers + italic gray captions (حالة النسخة الخامسة من الذكاء الاصطناعي؛ ملف الذكاء الاصطناعي: اعتبارات للمخاطر والثقة؛ مضاعفات الذكاء الاصطناعي على الأعمال) and a mini stat row: `5+ ألف / مدير تنفيذي تم استطلاع آرائهم…`, `50 مليون / مشاهدة على مواقع التواصل الاجتماعي`, `5 مليار / مشاهدة في وسائل الإعلام` (numbers ~20–24 pt bold black); left = `التعاون مع المؤسسات الأكاديمية، وصانعي السياسات، والشركات الناشئة` + **logo wall of ~20 academic/policy logos** (WEF, OECD, Berkeley, MIT Media Lab, Carnegie Mellon, Virginia Tech, NACD, Aspen, Alan Turing Institute…) with the note `ديلويت هي الراعي المؤسس لمركز التكنولوجيا الجديرة بالثقة`.
3. **Typography:** banner bullets white 12–14 pt with `•`; captions italic ~10 pt; stat numbers bold.
4. **Title:** `يقدم معهد ديلويت للذكاء الاصطناعي نظرة قائمة على الأبحاث حول موقع السوق حالياً وأين يتجه مستقبلاً`.
6. **Visual grammar:** bold lead-in **inside** running sentence (المؤلفات والدراسات الشاملة bolded mid-sentence) — a signature Deloitte prose habit.
8. **Deltas:** none.

---

## ARCHETYPE L — Trustworthy-AI wheel + capability matrix — D1-245 / D2-260

1. **Role:** climax of the About section: full AI service catalogue on one canvas (Advise/Implement/Operate lifecycle).
2. **Layout:** center = **segmented ring** in 3 green tones (dark 046A38-family arc labeled `Advise`, mid `Implement`, light `Operate` — English labels rotated on the ring, bold) around a **4×4 icon grid** of offerings (each cell: small line icon + Arabic label 8–12 pt): استراتيجية الذكاء الاصطناعي والبيانات، هندسة الذكاء الاصطناعي، الذكاء الاصطناعي الجدير بالثقة، سحابة المرئيات، الذكاء الاصطناعي للمحادثة، Vision AI، التوأم الرقمي، الأنمتة الذكية، الذكاء الاصطناعي التوليدي، Edge AI، عمليات التعلم الآلي، ™ReadyAI، ™AIOPS.D، ™CortexAI… Top row above ring: 4 business-line columns (التدقيق والمراجعة | التكنولوجيا والتحوّل | الاستراتيجية والمخاطر والمعاملات | الاستشارات الضريبية والقانونية) separated by thin vertical rules. Right rail list `مجالات العمل` (8 industries), left rail list `النطاقات` (9 domains) — bold black headers, 12 pt gray items.
   Bottom: **two full-width light-green tint strips** (EFF3E8-family) with pipe-separated enabler chains: `المواهب والتغيير | الذكاء الاصطناعي الجدير بالثقة | المنظومات | تركيز على الأولويات البيئية والاجتماعية والحوكمية` and `جنباً إلى جنب مع الشركاء المميزين | مزوّدي القدرات | الشركات الناشئة | المؤسسات الأكاديمية وصانعي السياسات` (bold lead-in `جنباً إلى جنب مع` then pipes).
3. **Typography:** densest slide of the library: 12 pt dominant (sz=1200); ring labels English bold; TM marks preserved.
4. **Title:** long assertion incl. service span: `في ديلويت، نستخدم منهجية الذكاء الاصطناعي الجدير بالثقة لتقديم خدماتنا … - المشورة، والتنفيذ، والتشغيل` (dash-appended triad).
7. **Micro:** the pipe-separated strip is the house "enabler footer" idiom — reuse for any capability wheel.
8. **Deltas:** none.

---

## ARCHETYPE M — Terms & Conditions text slides — D1-247→258 / D2-262→273 (12 slides)

1. **Role:** contractual annex; exists to satisfy the RFP's legal completeness requirement. Nobody "reads" it in evaluation; it must look exhaustive, dense, and untouched-by-designers.
2. **Layout anatomy:** pure text page on white. Three stacked placeholders:
   - Title (std position): `الشروط والأحكام` — 20 pt (sz=2000) Sakkal Majalla black.
   - Subtitle body-ph idx=13 at (462205, 682943), 11201795×757252: `فيما يلي الشروط والأحكام العامة لشركة ديلويت` — 20 pt gray (theme gray ≈53565A). **These two lines repeat verbatim on all 12 slides** — a repeated header, not a continuation "(1/12)" formula; NO pagination counters are used.
   - Body box (501650, 1555153), 11162349×4031833 EMU (12.2"×4.4"): the legal text.
3. **Typography (verified XML slide247):** body **8 pt** (sz=800, 36 runs) Sakkal Majalla, black, `algn="r"` `rtl="1"` (right-aligned, NOT justified), single column (`numCol=1`), line list with blank-line paragraph spacing. Clause headers (e.g. `2. التفسير.`) are bolded 8 pt, same size.
4. **Title formula:** static noun title + static gray strapline; page furniture (footer) carries the numbering burden.
5. **Body writing pattern:** hierarchical manual numbering typed as literal text: `1.` → `1.1.` → `1.1.1.` and lettered sub-items `‌أ. / ‌ب. / ‌ج.` (with Arabic letter + period; note the ZWJ artifacts before letters). ~10–18 clauses per slide; slide breaks happen mid-clause-family (slide starts wherever the previous overflowed, e.g. s-249 opens at `5.3.1.`, s-251 opens at item `‌ب.`) — i.e., the 27+2-section agreement (`27. الاتفاقية الكاملة…`, `28. مكافحة الفساد`, `29. الاحترام والسلوك الشامل`) is **flowed** across 12 fixed frames, not re-edited per slide.
6. **Visual grammar:** none — deliberately unstyled; no icons, no color, no rules.
7. **Micro-conventions:** standard footer; no source lines.
8. **Deltas:** ONE atom changes — client legal name in clause 3.1 (`شركة ريمات الرياض للتنمية` → `أمانة منطقة الرياض`). Everything else byte-identical, including typos (e.g. `االمشورة`, `مسؤوليه`, `علىه`) — the legal text is treated as untouchable.
9. **RECIPE:** store the full T&C as one canonical flowed text; per new RFP: (a) find/replace the client legal name exactly where `(يشار اليه فيما بعد ب "العميل")` follows; (b) reflow into N slides at 8 pt in the fixed body frame (N≈12); (c) repeat the static title/strapline on each; (d) never re-word, never fix typos, never add design. Quality bar = it must look like paralegal paste, not slideware.

---

## ARCHETYPE N — Legal-document scan slides — D1-260→268 (9) / D2-275→285 (11)

1. **Role:** compliance proof: official Saudi registrations/certificates demanded by كراسة الشروط. Evaluators check presence, not aesthetics.
2. **Layout:** white page, standard title, then the **raw scan image centered** in the content area with NO frame, border, shadow, or caption. Verified geometry (slide260): image at (2583765, 931130), 7024469×4995740 EMU ≈ 7.7"×5.5", horizontally near-centered, top-aligned under title. Landscape certificates fill wider; portrait certificates (GOSI, VAT) are placed at ~45–55% width centered. **Two-page certificates get both pages side by side on one slide** (D1-262/264: شهادة ترخيص استثمار خدمي and شهادة التسجيل في ضريبة القيمة المضافة each show 2 page images).
3. **Typography:** only the title (20 pt Sakkal Majalla black).
4. **Title formula — the breadcrumb pattern:** `المستندات القانونية | <اسم الشهادة>` with spaced pipe. Canonical fixed sequence (both decks, same order):
   1. السجل التجاري
   2. شهادة العضوية في الغرفة التجارية
   3. شهادة ترخيص استثمار خدمي
   4. شهادة الزكاة والدخل
   5. شهادة التسجيل في ضريبة القيمة المضافة
   6. شهادة المؤسسة العامة للتأمينات الإجتماعية
   7. شهادة الالتزام بحماية الاجور
   8. شهادة التوطين
   9. رخصة البلدية
   DECK2 appends: 10. `شهادة تصنيف مقدمي خدمات المدن`, 11. `شهادة التصنيف الفني للمقاول` — RFP-specific qualification certs (municipal client).
5–6. No body text; the scan IS the content.
8. **Deltas:** titles/order identical for the base 9; scan files refreshed (D1 uses the 2025-era teal MoC certificate card; D2 the older bilingual CR scan); DECK2 adds the 2 municipal-classification certs.
9. **RECIPE:** maintain a certificates folder with the LATEST scan of each of the 9 base documents; per RFP: (a) always include all 9 in canonical order; (b) parse the RFP's متطلبات التأهيل for any additional required certificate (classification, sector license) and append it with the same breadcrumb title; (c) insert scans at native aspect ratio, centered, unbordered; two pages side-by-side on one slide, never two slides.

---

## ARCHETYPE O — Final disclaimer slide — D1-269 / D2-286 (deck's last slide)

1. **Role:** legal close: entity structure disclosure + liability disclaimer; doubles as the back cover.
2. **Layout:** white page; **Monitor Deloitte wordmark** ("Monitor" gray / "Deloitte" black + green period, ~1.9" wide) top-left corner (i.e., the RTL "end" corner); body = 6–8 right-aligned paragraphs occupying lower two-thirds; normal footer strip still present, PLUS an in-body closing line `© 2026 ديلويت آند توش (الشرق الأوسط)، جميع الحقوق محفوظة.` above the footer.
3. **Typography (XML):** body **10 pt** (sz=1000, 81 runs) Sakkal Majalla; a few 12 pt runs (sz=1200) for the bolded entity name `د إم إي` lead-ins; 9.07 pt scaled runs; URLs in Calibri, underlined (`www.deloitte.com/about`, `www.deloitte.com`); black only (single srgbClr 000000).
4. **Content formula (paragraph order):** [DECK2-only lead: `لقد تم إعداد هذا العرض بصفة عامة، وبالتالي لا يمكن الإعتماد على محتواه لتغطية حالات محددة…` + `يسّر ديلويت أند توش (الشرق الأوسط) )د إم إي) شراكة ذات مسؤولية محدودة أن تقدم الإستشارة المهنية… لا تتحمل (د ام إي) أي واجب أو مسؤولية عن أي خسارة…`] → DME is a subsidiary of NSE → "ديلويت" name usage explanation → DTTL network stats (**Arabic-Indic numerals**: قائمة فورتشن العالمية لأفضل ٥٠٠ شركة، أكثر من ١٣٠ دولة، ٤١٠٬٠٠٠ مهني) → DME regional history (منذ سنة ١٩٢٦، قراب ٥٬٩٠٠ شريك ومدير وموظف، ٢٩ مكتبًا في ١٥ بلدًا) → © line.
8. **Deltas:** DECK2 = superset (adds the 2 general-reliance paragraphs); year 2025 vs 2026. Prefer the DECK2 (fuller) version for new decks.
9. **RECIPE:** frozen text block; recompute only the © year. Always the literal last slide, after the legal-documents appendix.

---

## SECTION-LEVEL RECONSTRUCTION RECIPE (when/what to include)

1. **Always include, in this order, as the final ~35 slides of any عرض فني:** divider `ملحق نبذة عن ديلويت` → 11 About slides (B…L) → divider `ملحق الشروط والأحكام` → 12 T&C slides → divider `ملحق المستندات القانونية` → 9+ certificate slides → final disclaimer. Both decks kept ALL of it — including the 3 AI slides in a non-AI urban-planning proposal — so the default is: **never trim**. Trim candidates only if the RFP imposes a page cap: J/K/L (AI trio) first, then G (NSE).
2. **Recomputed atoms (the complete list):** client legal name in T&C 3.1; © year (two places: master footer + disclaimer body); master footer project line (`العرض الفني: <client> | <project>`); certificate scans (latest copies); appended RFP-specific certificates; FY stats refresh (annual, from Deloitte Global Impact Report) on slides B/C.
3. **Quality bar / human-tells to reproduce:** 8 pt flowed legal text with manual `1.1.1.` numbering and preserved typos; the compliance footnote on the revenue slide; the frozen أفريقيا/أوروبا title typo class of artifact (fix silently but keep density); global-brand palette (009A44/3F3D56) inside this section vs. house palette outside; gradient-stroke icon medallions; green display quotes at 28–44 pt 86BC25; logo walls on white chips; scans unframed and centered. An AI-made giveaway would be: restyled T&C, captioned/bordered scans, "(1/12)" counters, or About slides rewritten — never do any of these.
