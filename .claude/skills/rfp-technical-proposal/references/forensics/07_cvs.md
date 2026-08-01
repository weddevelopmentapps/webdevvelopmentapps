# 07 — CV / PROFILE APPENDIX SLIDES (ملفات تعريف الفريق + ملفات تعريف الخبراء)

Scope analyzed: DECK1 slides 72–92 (divider 72, team CVs 73–80, divider 81, experts 82–92) and DECK2 slides 76–102 (divider 76, team CVs 77–85, divider 86, experts 87–102). 14 team CVs and 20+ expert profiles studied across both decks (images + txt + XML of slide73/81/91 D1, slide77/89/91 D2, layouts, theme).

---

## 0. ARCHETYPE INVENTORY

| # | Archetype | DECK1 | DECK2 |
|---|-----------|-------|-------|
| A | Appendix divider (green section splash) | 72 «ملحق / ملفات تعريف الفريق», 81 «ملحق / ملفات تعريف الخبراء (غير شامل)» | 76, 86 (identical artwork) |
| B | TEAM CV (full, client-bullet formula) | 73–80 | 77–85 |
| C | EXPERT profile — Deloitte SME (same layout as B, expertise-tagged title) | 82–91 (most) | 87–102 (most) |
| D | EXPERT profile — external/career-history variant (position-title bullets, no client:description formula) | 92 (ريتشارد كومبتن) | 89 (اسماعيل رضوان), 91 (د. خالد الحازمي), 92 (فيصل صديق), 95 (يزيد الثنيان), 100 (جيانكارلو مانجون) |

All B/C/D share ONE master layout (`slideLayout5.xml`, "3_Title & subtitle"). The CV section is a mass-produced template family: one geometry, four content dialects.

---

## 1. NARRATIVE ROLE

- The CV appendix is the proposal's **proof of bench**. It comes AFTER the team-structure/org-chart section in the main body; the appendix carries the depth so the body can stay light.
- Team CVs (B) prove the named delivery team has done *this exact client's* work before — the first 1–2 bullets of nearly every team CV are the incumbent client's own projects (see §5).
- Expert profiles (C/D) prove **breadth on call**: one expert per RFP evaluation theme (strategy, transport, smart cities, urban dev, org/workforce, economics, real estate, legal/governance, infrastructure; DECK2 adds قياس الأثر, التحول الرقمي, الخدمات البلدية, التخطيط الحضري, النماذج التشغيلية to mirror its RFP's scope). The expert list is literally a mirror of the RFP scoring criteria.
- The expert divider carries «(غير شامل)» (non-exhaustive) — a deliberate hedge: "we have more where this came from."

## 2. LAYOUT ANATOMY (forensic, from slide73 XML; 13.333×7.5in canvas)

**Header band (from layout, not slide):** full-width Riyadh-skyline photo with dark-green gradient overlay sweeping in from the right (deep green right → photo visible left), height ≈1.54in, thin white rule at its bottom edge. Wave-line motif in the green. Identical band on every CV slide in both decks.

- **Title placeholder:** x=1.97in, y=0.35in, w=9.76in, h=0.86in. Wraps to 2 lines when long (D2 s-100).
- **Section header 1** «ملخص السيرة الذاتية»: text rect x=0.51in, y=1.69in, w=9.97in, h=0.23in, white fill; beneath it a **straight connector** x=0.51, y=1.97, length 9.97in, weight **4.5pt (w=57150)**, color schemeClr `tx1` (**black**).
- **Bio text box:** x=0.51in, y=2.10in, w=9.97in, h≈1.1–1.5in (2–3 paragraphs).
- **Section header 2** «الخبرات السابقة»: rect x=2.12in, y≈3.59in (slides vertically with bio length), w=8.36in; beneath it connector x=0.51, y≈3.88, length 9.97in, 4.5pt, color schemeClr `accent1` = **86BC25 (green)**. Black rule for the bio, GREEN rule for experience — this two-rule rhythm is the CV slide's signature.
- **Experience bullets box:** x=0.12in, y=4.01in, w=10.36in, h=3.07in (runs to ~7.1in; densest slides overflow in LibreOffice render — in PPT they autofit-shrink).
- **Right sidebar rect:** x=10.64in, y=1.69in, w=2.18in, h=5.27in, fill = schemeClr bg1 lumMod 95% ≈ **#F2F2F2** light gray, no border.
- **Photo:** `prstGeom prst="ellipse"` (circular crop), **1.70×1.70in**, x=10.85in, y=1.86in — centered at top of sidebar.
- **Sidebar text placeholder:** x=10.71in, y=3.68in, w=2.09in, h=3.27in (flipH="1"), right-aligned RTL.
- Proportions: content column : sidebar ≈ 10.5 : 2.2 (≈ 82% / 18%). No footer intrusion; footer strip along bottom 0.35in.

## 3. TYPOGRAPHY (element by element)

| Element | Font | Size | Weight | Color | Align |
|---|---|---|---|---|---|
| Title «الاسم \| الدور» | Sakkal Majalla | **28pt** (sz=2800, from layout) | regular | **FFFFFF** on green band | right (algn="r") |
| Section headers «ملخص السيرة الذاتية» / «الخبرات السابقة» / «الملف الشخصي» | Sakkal Majalla | **12pt** | **bold** (b="1") | 000000 | right, rtl=1 |
| Rule under bio header | — | 4.5pt line | — | black (tx1) | full content width 9.97in |
| Rule under experience header | — | 4.5pt line | — | **86BC25** (accent1) | full content width |
| Bio paragraphs | Sakkal Majalla | **12pt** | regular | 000000 | **justified** (algn="just"), rtl |
| Experience bullets | Sakkal Majalla | **11pt** (sz=1100) | lead-in **bold**, rest regular | 000000 | right, rtl; bullet char "•" font Arial, marL=177800 EMU (0.19in) hanging indent (indent=−177800), buSzPct 100% |
| Sidebar name | Sakkal Majalla | ~12pt (inherited) | **bold** | 000000 | right |
| Sidebar role | Sakkal Majalla | 12pt | regular (team); **italic** i="1" for external experts (D2 s-91: «خبير مختص في مجال التحول الرقمي» italic) | 000000 | right |
| Sidebar block headers «مجالات الخبرة:» «قطاعات الخبرة:» | Sakkal Majalla | 12pt | **bold**, buNone | 000000 | right |
| Sidebar bullet items | Sakkal Majalla | 12pt | regular | 000000 | right, "•" Arial |
| Footer (3 parts) | Sakkal Majalla | ~8–9pt | regular | gray 53565A-ish | © right, project center, page № left |
| Divider big title | **Open Sans** | **88pt** (sz=8800) | **bold** | FFFFFF | right |
| Divider «(غير شامل)» | Open Sans | **48pt** | *italic* | FFFFFF | right, under title |

## 4. TITLE FORMULA

- **Team CV:** «الاسم الكامل | الدور في المشروع» — role is the PROJECT role, not the firm rank: «مشعل السديري | شريك المشروع», «سلطان بن فيصل آل سعود | المدير التنفيذي للمشروع» (D1) / «… | مدير المشروع» (D2), «أحمد سلامة | مدير المشروع», «محمد آل ثنيان | استشاري أول», «شوق النعيم | استشاري». DECK2 adds functional roles: «محمد العمري | محلل أعمال», «سلمان الشعيبي | مستشار تقني», «مي العامر | مصمم انفوغرافيك», and rank-only «باسم بحلس | مدير» for members without a bespoke project title.
- **Expert:** «الاسم | خبير مختص في مجال X» — the fixed tag «خبير مختص في مجال …» (occasionally «خبير مختص في تطوير البنية التحتية» / «خبير مختص في التخطيط الحضري والاستراتيجي للمناطق» without «مجال»). X = one RFP evaluation theme. Honorifics kept: «الدكتور خالد الحازمي», «الدكتور جيانكارلو مانجون».
- The `|` pipe separator is the same convention as body breadcrumb titles elsewhere in the deck. Title is a LABEL, not an assertion sentence — CV slides are the one family where the title is not a full-sentence claim, and there is **no green-highlight word** in the title (band is already green).
- Subtitle line printed at top of content: «ملخص السيرة الذاتية» for most; «الملف الشخصي» used on some senior-consultant slides (D1 s-076, s-077; D2 s-080) — a tolerated inconsistency, not a rule.
- Divider titles: «ملحق» + line 2 «ملفات تعريف الفريق» / «ملفات تعريف الخبراء» + «(غير شامل)» only on the experts divider.

## 5. BODY WRITING PATTERNS

**Bio (2–3 short paragraphs, 12pt justified):**
1. Para 1 = position + firm + city + years + focus: «مشعل شريك في مكتب مونيتور ديلويت في الرياض واكتسب الخبرة المهنية والاستشارية في الشرق الأوسط مع التركيز على…»; experts lead with a seniority stat: «لديه أكثر من 18 عامًا من الخبرة…», «أكثر من 25 عامًا», «20 عاماً», «12 عامًا», «15 عامًا» — the **N+ years** number always sits in sentence 1.
2. Para 2 = pre-Deloitte career and/or marquee client names: «شمل عملاء سلطان امانة منطقة الرياض ووزارة البلديات والاسكان وكذلك الهيئات الملكية…».
3. Education is EMBEDDED in the bio (no separate المؤهلات العلمية block anywhere): «تخرج مشعل من جامعة كينجستون بدرجة ماجستير في إدارة الإنشاءات، وبكالوريوس في الهندسة الصناعية», «محمد حاصل على درجة البكالوريوس في العمارة من جامعة الملك سعود». Honors noted: «مع مرتبة الشرف الأولى». Languages/certs also embedded: «ويتقن اللغتين العربية والإنجليزية», «حاز شهادة سكس سيغما لين (Six Sigma Lean)».

**Experience bullets («الخبرات السابقة», 11pt, 4–11 bullets, typical 6–9):**
- Anatomy = **bold client/engagement lead-in + colon + action sentence**: «**امانة منطقة الرياض:** قيادة مشروع استراتيجية للتحسين الشامل لفئة مستهدفة عبر جميع الابعاد في سلسلة القيمة».
- Lead-in grammar variants: `الجهة:` , `الجهة – المملكة العربية السعودية:` , `الجهة (المملكة العربية السعودية):` , sector-first composite `المشروع – البرنامج – الجهة:` («استراتيجية قطاع الحج – برنامج ضيوف الرحمن – الهيئة الملكية لمدينة مكة المكرمة والمشاعر المقدسة:»), and dated «المركز الوطني للأرصاد – المملكة العربية السعودية (أكتوبر 2024م – يونيو 2025م):».
- **Client anonymization vocabulary:** «سري», «سرية», «جهة حكومية», «جهة حكومية سرّية», «عميل من القطاع العام», «منظمة غير حكومية - سرية», «أصل مصرفي\ماكنزي & كومباني», «جهة حكومية – MBB». Sensitive current work is scope-anonymized too: «قيادة مشروع استراتيجية للتحسين الشامل لفئة مستهدفة» (client named, scope veiled).
- **Verb ladder encodes seniority:** partner/director bullets open with قاد/قادت/قيادة/ترأس; senior consultant with دعم/مساعدة/ساهم; consultant with عمل على/ساهمت/ساعدت/طورت/أجرت (female forms used naturally for women: «قادت», «ساهمت», «دعمت»).
- **Relevance-first ordering:** the two Riyadh-Amanah bullets («امانة منطقة الرياض: قيادة مشروع استراتيجية للتحسين الشامل…» and «…دراسة انشاء صندوق تمويلي لتنفيذ وتمويل البنية التحتية الاساسية…») are pasted VERBATIM at the TOP of almost every team CV in both decks (s73, 74, 75, 76 (support-verb version «دعم مشروع…»), 78, 80-D2, 81-D2, 82-D2) — CVs are re-sorted so current-client work leads.
- **Numbers-first stat forms in expert bullets:** «12 برنامجًا استراتيجيًا و 27 مبادرة وأكثر من 150 مشروعًا… تأثير مالي إيجابي بقيمة 118 مليار دولار بحلول عام 2040», «96.0 مليار ريال سعودي / 25.6 مليار دولار أمريكي - وهو أكبر طرح عام أولي في العالم», «وفورات تتراوح ما بين 12 و35%», «أكثر من 8 برامج واسعة النطاق», «قدمها إلى 24 وزارة», «4000 موظف», «منطقة يبلغ عدد سكانها 10 ملايين نسمة», «أكثـر مـن 15 مدينـة… منطقــة تزيــد علــى 700 كيلـو».
- **Variant D (external experts):** bullets are CAREER POSITIONS not engagements — «كبير الاقتصاديين في دول مجلس التعاون الخليجي، البنك الدولي، الرياض، المملكة العربية السعودية», «نائب الرئيس، مدير العمليات - الشركة السعودية بارسونز المحدودة» — format: title، employer، city، country; s-092 D1 sets them **all bold**; s-100 D2 nests level-2 sub-bullets describing each role.

**Sidebar blocks (right, gray panel):** photo → **name (bold)** → role (plain; *italic* for externals) → «مجالات الخبرة:» (bold, 2–8 bullet items, typ. 3–6) → «قطاعات الخبرة:» (bold, 1–5 items, typ. 2–4). Sub-dialect on some senior-consultant slides: headers «الخبرات العملية» + «قطاعات الخبرة» WITHOUT colon (D1 s-076/077, D2 s-080). Some external experts drop قطاعات entirely (s-089, s-091, s-095 have only مجالات الخبرة). Items are 1–4-word noun phrases: «تطوير الاستراتيجيات», «الحوكمة», «القطاع البلدي», «السياحة».

## 6. VISUAL GRAMMAR

- **Photos:** circular crop (ellipse geometry) 1.70×1.70in; most treated **grayscale/B&W** (esp. externals: s-089, s-091, D2 s-085); team photos gray-to-muted-color; no border ring, sits flush on the F2F2F2 panel. One slide (s-089 D1/s-094 D2 أوليفر) references two Picture placeholders — a leftover, only one renders.
- **No icons, no charts, no tables, no diagrams** on CV slides — the only graphic devices are the two horizontal rules (black + green), the circular photo, and the gray sidebar panel. Visual restraint is the point: text density signals substance.
- **Divider slides (A):** full-bleed dark-green (046A38-family) field; left ~28% = warm gold architectural close-up photo (curved ribbed facade) behind a white arc; faint Deloitte geometric pattern + white contour wave-lines across the green; right-aligned white Open Sans 88pt bold two-line title; italic 48pt «(غير شامل)» beneath on experts divider. IDENTICAL pixel-for-pixel in both decks (pure template asset).

## 7. MICRO-CONVENTIONS

- **Footer, right:** «© 2026 ديلويت اند توش الشرق الأوسط المحدودة جميع الحقوق محفوظة» (DECK1) / «© 2025 …محفوظة.» (DECK2 — year tracks proposal date, trailing period inconsistent).
- **Footer, center:** «العرض الفني: خدمات الدراسات الاستراتيجية والاقتصادية للتخطيط العمراني وإدارة المدن» (DECK1) vs «العرض الفني: أمانة منطقة الرياض | مشروع ضبط جودة مخرجات الأعمال لقطاع وسط مدينة الرياض» (DECK2 — pattern «العرض الفني: الجهة | المشروع»). DECK2 also contains a stray third string «العرض الفني: مركز مشاريع البنية التحتية بمنطقة الرياض | مشروع دراسة نطاق صلاحيات المركز في الأصول الخاصة» on recycled slides — proof footers are updated per proposal and misses happen.
- **Footer, left:** plain page number (73, 89, …), small gray.
- «(غير شامل)» appears ONLY on the experts divider (hedge that expert list is non-exhaustive) — never on team divider.
- No source lines («المصدر:») on CV slides.
- **Template-tell defects to avoid when reproducing:** sidebar name not updated (D2 s-085 مي العامر's sidebar still says «محمد العمري / مستشار»; D2 s-102 القباني's sidebar says «يزيد الثنيان»); typo «خير» for «خبير» (D2 s-089); D1 s-074 sidebar role says «مدير تنفيذي» while D2 s-078 same box says «مدير» — sidebar rank must match the title role.

## 8. DECK1 vs DECK2 DELTAS (template vs project-specific)

**Literally identical (template):** layout geometry, both dividers, header band, rules/colors/sizes, footer structure, the entire profiles of مشعل السديري (s73→s77), عبدالرحمن العمراني (s78→s82 — only role word changed استشاري→مستشار), and 8 experts carried verbatim: سلطان بك خونكاييف، مقرن الشعلان، ميغيل أنتونيس، سام بلاكي، أوليفر مورغن، سيمون بيدفورد، طارق نحلة، سمير خيزران، حسن مالك، دانيا نورالله (bullets, tags, photos byte-identical).

**Re-tailored per proposal (the interesting part):**
1. **Role retitling:** سلطان بن فيصل آل سعود is «المدير التنفيذي للمشروع» in D1 but «مدير المشروع» in D2; his bio downshifts from «منصب مدير تنفيذي» to «منصب مدير» — the SAME person is re-cast to fit the org chart each RFP demands. أحمد سلامة (D1 «مدير المشروع») is dropped from D2 entirely; باسم بحلس slots in as «مدير».
2. **Team composition mirrors scope:** D2 (a business-quality-control/operations RFP) adds «محلل أعمال», «مستشار تقني» (digital transformation CV), «مصمم انفوغرافيك» (deliverable-production CV) — roles D1's strategy-study RFP never needed. D1 fields 8 team CVs, D2 fields 9.
3. **Expert roster re-mixed:** D2 adds 6 new expert themes matching its RFP (قياس الأثر، التحول الرقمي، الخدمات البلدية، التخطيط الحضري والخدمات البلدية، التخطيط الحضري والاستراتيجي للمناطق، النماذج التشغيلية) and keeps the reusable core. Expert tag lines («خبير مختص في مجال …») are stable per person across decks.
4. **Terminology drift:** D1 uses «استشاري / استشاري أول», D2 «مستشار / مستشار أول» — pick ONE per proposal, ideally the RFP's own wording.
5. Footers and copyright year re-stamped (imperfectly — see §7).

## 9. RECONSTRUCTION RECIPE

**Inputs:** (a) RFP required roles + evaluation criteria; (b) reference CV library (per person: bio, education, languages, full engagement list with client/scope/verb/dates, photo, مجالات/قطاعات tags); (c) project name + client for footer; (d) current year.

**Step 1 — Cast the team.** Map RFP org-chart roles → people. Title each CV «الاسم | الدور في المشروع» using the RFP's role names verbatim (شريك المشروع، مدير المشروع، استشاري أول…). If the RFP org chart differs from a person's last proposal, RETITLE them (bio sentence 1 and sidebar role must be edited to match — three places: title, bio, sidebar). Add functional roles (محلل أعمال، مستشار تقني، مصمم انفوغرافيك) only if the scope calls for those workstreams.

**Step 2 — Cast the experts.** Derive one expert theme per RFP scope pillar/evaluation criterion; pick from library the person whose tag fits; keep their stable tag «خبير مختص في مجال X» or mint a new X from the RFP's noun (X must echo RFP vocabulary). 8–16 experts; always put «(غير شامل)» on the divider.

**Step 3 — Re-bullet every CV.** (i) Select 5–9 engagements scored by similarity to the new RFP scope; (ii) SORT so the most client-relevant sit first — if the firm has live/prior work with this client, write 1–2 bullets for it and place them at top of EVERY team CV (anonymize scope if sensitive: «لفئة مستهدفة», «في منطقة محددة»); (iii) keep the bold-lead-in+colon formula, seniority-correct verbs (قاد for leads, دعم/ساهم for juniors, feminine forms for women); (iv) keep hard numbers wherever the library has them (N برنامج، N مليار، N%…); (v) anonymize confidential clients with «سري/جهة حكومية».

**Step 4 — Sidebar.** Circular 1.7in photo (grayscale), bold name, role (italic if external expert), «مجالات الخبرة:» 3–6 noun-phrase bullets, «قطاعات الخبرة:» 2–4 bullets; make the FIRST مجال and FIRST قطاع match the RFP's domain (e.g., القطاع البلدي first for a municipal RFP).

**Step 5 — Build geometry exactly:** layout per §2 (header band 1.54in; title 28pt white right; black 4.5pt rule under «ملخص السيرة الذاتية» at y≈1.97; green 86BC25 4.5pt rule under «الخبرات السابقة»; bio 12pt justified; bullets 11pt Arial-• hanging 0.19in; sidebar #F2F2F2 10.64→12.82in). Dividers: reuse splash asset, Open Sans 88pt bold white.

**Step 6 — Stamp micro-chrome:** footer center «العرض الفني: {الجهة} | {اسم المشروع}», right «© {السنة} ديلويت اند توش الشرق الأوسط المحدودة جميع الحقوق محفوظة», left page №. Re-stamp on EVERY slide (the source decks' stray old footers are a defect, not a feature).

**Quality bar (human-consultant look):** every CV completely fills the frame — bio ≥2 paragraphs, ≥5 experience bullets, sidebar full — but must NOT overflow past y≈7.0in (shrink to 10.5pt before spilling); name/role consistent across title+bio+sidebar (the decks' own copy-paste name errors are the #1 AI-tell to avoid); one person per slide, zero decoration beyond the two rules + photo + panel; verbs match rank; years-of-experience stat in bio sentence 1 for anyone ≥manager; external experts get career-position bullets (title، employer، city) instead of client-colon bullets and an italic sidebar role; keep D1/D2's restraint — no icons, no color accents except the single green rule.
