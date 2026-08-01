# FRAMING SLIDES — Cover, Cover Letter, TOC, Section/Appendix Dividers
Monitor Deloitte Arabic RFP technical-proposal decks — reverse-engineering findings.

Evidence base: DECK1 "Strategic Studies" (269 slides, client شركة ريمات الرياض للتنمية, dated فبراير 2026) slides 1, 2, 3, 4, 7, 44, 63, 65, 71, 72, 81, 93, 173, 234, 246, 259; DECK2 "Central Riyadh Sectors Performance" (286 slides, client أمانة منطقة الرياض, dated ديسمبر 2025) slides 1, 2, 3, 4, 48, 66, 68, 75, 76. Geometry cited in EMU (914400 EMU = 1in; slide = 12192000 x 6858000 = 13.333in x 7.5in). All Arabic text is RTL, right-aligned, font Sakkal Majalla unless stated.

Theme palette (theme1.xml, identical both decks): accent1=86BC25 (bright green), accent2=43B02A, accent3=26890D (green), accent4=046A38 (dark green), accent5=0D8390 (teal), accent6=007CB0 (blue), dk2=53565A, lt2/bg2=D0D0CE, hlink=00A3E0. TOC/divider panels use out-of-theme greens 0A5456 + 055B3F (gradient) and swatch chips incl. 1A7749 parked off-canvas.

A telling micro-discovery: slideLayout9 (cover) carries a full Deloitte color-swatch chip board (004F59, 2C5234, 53565A, D0D0CE, A7A8AA, 97999B, 86BC25, 43B02A, 26890D, DDEFE8, 6FC2B4, 00ABAB, 012169, 62B5E5, 00A3E0, 0076A8, 005587, 007680, 1A7749, 63666A) parked OFF-CANVAS at x=12338175 (past the 12192000 right edge). Human designers keep the palette next to the slide but outside the visible area. Every slide also carries a hidden 1588x1588-EMU think-cell OLE object ("think-cell Slide") — the agency builds tables/charts with think-cell.

════════════════════════════════════════════════════════════════════
## ARCHETYPE 1 — COVER (DECK1 s1, DECK2 s1; layout = slideLayout9)

### 1. Narrative role
Instant credibility handshake: client brand + Monitor Deloitte brand side by side over a hero photo of the client's own city, with the project name and the deliverable type ("العرض الفني" = the Technical Proposal) and submission month. It must read as "this proposal was made FOR you, in your city" before a single word of content.

### 2. Layout anatomy
- Full-bleed photo (12192000 x 6858000) lives on the LAYOUT, not the slide: night aerial of Riyadh (KAFD district, the green-lit PIF/KAFD tower dead-center, dusk sky). Identical photo in BOTH decks → the photo is template-fixed for Riyadh-based clients, chosen because the hero tower literally glows Deloitte green.
- Two rounded-rectangle logo cards top corners, identical size 3219389 x 1173694 (3.52in x 1.28in), fill F2F2F2 (very light gray, reads white on the photo), no stroke:
  - CLIENT card top-LEFT at (407317, 219102). Client logo image centered inside; DECK1 client logo drawn 2853191 x 1332975 at (590934, 139461) — slightly larger than the card, allowed to bleed/overhang vertically; DECK2 swaps in the Amanat Al-Riyadh logo.
  - MONITOR DELOITTE card top-RIGHT at (8676115, 219101). "Monitor Deloitte." wordmark (black text + green period) image 1841929 x 761121 at (9448307, 365204).
  - Note the RTL politics: the CLIENT gets the reading-start corner (top-right is actually where Deloitte sits; client sits top-left) — in practice, render shows client top-left, Deloitte top-right; both decks identical, so treat it as fixed.
- Title block: single text box on the SLIDE at (1528997, 4479588), 10432248 x 1650541 (bottom third), bodyPr anchor=ctr, all paragraphs algn="r" rtl="1", line spacing 106%.
- No footer, no page number, no copyright on the cover.

### 3. Typography (element by element)
| Element | Text | Font | Size | Weight | Color |
|---|---|---|---|---|---|
| Client name (line 1) | شركة ريمات الرياض للتنمية / أمانة منطقة الرياض | Sakkal Majalla | 40pt (sz=4000) | Bold | schemeClr accent3 (26890D) + lumMod 60000 / lumOff 40000 → renders as bright light green (visually the 86BC25 family) |
| Project title (lines 2–3) | خدمات الدراسات الاستراتيجية والاقتصادية للتخطيط العمراني وإدارة المدن / مشروع ضبط جودة مخرجات الأعمال لقطاع وسط مدينة الرياض | Sakkal Majalla | 32pt (sz=3200) | Bold | White (schemeClr bg1) |
| Deliverable line | العرض الفني | Sakkal Majalla | 20pt (sz=2000) | Bold | White |
| Date line | فبراير 2026 / ديسمبر 2025 | Sakkal Majalla | 16pt (sz=1600) | Bold | White |

### 4. Title formula
`[Client legal name — GREEN 40pt]` NEWLINE `[Project name exactly as written in the RFP — WHITE 32pt]` NEWLINE `العرض الفني` NEWLINE `[Month YYYY in Arabic]`. The green highlight goes on the CLIENT, not on Deloitte and not on the project — the client is the hero. Project title is copied verbatim from the RFP title (same string later reused in letter subject, footer, TOC-side running text).

### 5. Body writing patterns
None — cover carries exactly 4 text lines, zero marketing copy. Restraint is part of the formula.

### 6. Visual grammar
Photo treatment: dark, high-contrast night aerial; no explicit overlay rectangle on the cover (the photo is dark enough); text sits directly on the photo. Logo cards use rounded corners (prstGeom roundRect) and neutral F2F2F2 so both logos sit on equal footing.

### 7. Micro-conventions
Date = submission month only, never a day. "العرض الفني" is the fixed deliverable label (a financial proposal would say العرض المالي). Hidden think-cell OLE + two hidden 158750-EMU accent3 squares (template debris) exist on the slide — harmless.

### 8. DECK1 vs DECK2 delta
IDENTICAL: layout9, photo, card geometry, Deloitte wordmark, title-block geometry (EMU-identical: 1528997/4479588), sizes, colors, "العرض الفني". CHANGED: client logo image, client name string, project title string, date. That's all — cover is ~95% frozen template.

### 9. RECONSTRUCTION RECIPE
1. Start from layout: full-bleed city photo of the CLIENT's city at night (dark, one landmark, ideally with green light accents); if client is in Riyadh, reuse the KAFD night aerial.
2. Place two F2F2F2 roundRect cards 3.52 x 1.28in at y=0.24in: left card x=0.45in (client logo), right card x=9.49in (Monitor Deloitte wordmark). Get the real client logo from their website/brand page; keep it big inside the card.
3. Title box 11.4in wide, 1.8in tall, top at 4.9in, center-anchored, right-aligned RTL, 106% line spacing. Fill 4 lines per the formula in §4: client name 40pt bright green bold, RFP project title verbatim 32pt white bold, العرض الفني 20pt, month-year 16pt.
4. Quality bar: no taglines, no "prepared by", no confidentiality boilerplate on the cover; exact RFP title spelling; date matches submission deadline month.

════════════════════════════════════════════════════════════════════
## ARCHETYPE 2 — COVER LETTER (DECK1 s2, DECK2 s2; layout = slideLayout16 "Letter Layout")

### 1. Narrative role
A formal Arabic business letter embedded as slide 2 — it is the "why us" elevator pitch disguised as courtesy. It (a) proves formal compliance with the RFP process, (b) names 4–6 differentiators that the rest of the deck will expand, (c) gives the client two named partners with faces, emails and mobiles — accountability on page 2.

### 2. Layout anatomy (white background)
- Letterhead block top-LEFT at (0, 0), 1502979 x 1027760 — Deloitte legal entity + address, mimicking printed letterhead.
- Big "Monitor Deloitte." wordmark top-RIGHT (from layout/master), much larger than on inner pages.
- Letter body: one big text box (372140, 1282516), 9367283 x 4657727 — occupies left ~80% width, right-aligned RTL text.
- Contacts sidebar occupies the right rail x≈10.1–12.8in: circular partner photo #1 at (10752883, 1520999) 965212 x 965212 (1.06in circle), contact text block #1 at (10127974, 2639557) 1594126 x 1391587; photo #2 at (10752883, 4184490); text block #2 at (10127974, 5303049).
- Standard master footer visible (page number + running title + copyright) — the letter is paginated as page 2.

### 3. Typography
| Element | Size | Weight/Color |
|---|---|---|
| Letterhead company line ديلويت أند توش الشرق الأوسط المحدودة | 10pt | Bold, black |
| Letterhead address/phone/fax/web (بوليفارد الميترو، حي العقيق، مركز الملك عبدالله المالي، ص. ب. 213 الرياض 11411، المملكة العربية السعودية؛ هاتف: 2828500 (11) 966+؛ فاكس: 4761350 (11) 966+؛ www.deloitte.com) | 10pt | Regular (Latin digits in Verdana/Arial) |
| Addressee + salutation + body prose | 12pt | Regular, black |
| Subject line الموضوع: … | 12pt | Bold, black |
| Advantage bullet LEAD-INS | 14pt | Bold, TEAL 0D8390 (hardcoded srgbClr in DECK1; accent5 in DECK2) — the colon after the lead-in is also teal bold |
| Bullet explanation text | 12pt | Regular black |
| Signature name خالد السقا | 12pt | Bold |
| Signature title شريك، ديلويت الشرق الأوسط | 12pt | Bold |
| Sidebar heading جهات الاتصال and contact names | 11pt | Bold |
| Sidebar role/entity/phone | 11pt | Regular |
| Sidebar emails | 11pt | hyperlink-styled (theme hlink 00A3E0 / renders teal-blue) |

NOTE: the letter is the ONLY framing slide whose accent color is teal 0D8390, not green — letters use teal lead-ins, decks use green highlights.

### 4/5. The letter formula — fixed skeleton with quoted invariants
Every sentence below appears VERBATIM in both decks (template boilerplate); brackets mark the swap-in slots:

1. Addressee: `إلى من يهمّه الأمر في [client]`
2. Salutation: `تحيبة طيّبة وبعد،` (sic — the typo تحيبة for تحية is copied across both decks; fix it in new work: تحية طيّبة وبعد،)
3. Subject: `الموضوع: [project title verbatim from RFP]` (bold)
4. Opening thanks paragraph: `بدايةً، اسمحوا لنا أن نشكركم على إتاحة الفرصة لتقديم رد على طلب المعلومات لمشروع «[project title — bold, in guillemets «»]»، الذي يسعى [1–2 clause paraphrase of the RFP's objective]` — DECK2 stretches the paraphrase to tie into Vision 2030: `...ويشكل خطوة محورية نحو تعزيز المدينة وتحسين جودة الحياة فيها، والارتقاء بجودة الخدمات المقدمة، وتدعم مسيرتها نحو تحقيق رؤية 2030، وتحقيق تطلعات سكانها.`
5. Pivot sentence introducing the advantages: `ومن هذا المنطلق، تتقدم مونيتور ديلويت [كشريك] لدعم [client] في هذا المشروع الحيوي والمهم من خلال تقديم الحلول المبتكرة والخبرات اللازمة، بناءً على المزايا التالية:` (DECK2 adds كشريك).
6. THE ADVANTAGE BULLETS — 4 to 6 bullets, each = `[bold teal 14pt lead-in]: [12pt black explanation, one long sentence ending in a benefit clause مما يساعدنا/مما يؤهلنا…]`. All lead-ins from both decks:
   - DECK1 (5 bullets): `فهمنا العميق لمدينة الرياض:` · `سجل حافل من النجاح في دعم القيادات العليا في المملكة:` · `فريق محلي وعالمي من الخبراء والقادة في مجالات الاستراتيجية والتخطيط العمراني وإدارة المدن:` · `شراكاتنا مع الحلفاء في مجالات التخطيط العمراني وإدارة المدن:` · `الالتزام بالشراكة المستدامة:`
   - DECK2 (4 bullets): `خبرتنا في العمل مع الجهات المحلية في مدينة الرياض:` · `الخبرة الواسعة في قياس وتطوير ورفع كفاءة الأداء:` · `فريق محلي وعالمي من الخبراء والقادة في مجال قياس وتطوير ورفع كفاءة الأداء:` · `الالتزام بالشراكة المستدامة:`
   - The generator formula behind them: bullet 1 = LOCAL KNOWLEDGE of the client's city/sector (name-drops sister entities: مثل أمانة منطقة الرياض والهيئة الملكية لمدينة الرياض وغيرها من الجهات المحلية); bullet 2 = TRACK RECORD in the RFP's functional domain; bullet 3 = TEAM `فريق محلي وعالمي من الخبراء والقادة في مجال [domain]:` with near-identical body text in both decks (`تجمع مونيتور ديلويت فرقًا فريدة ومتعددة التخصصات ولديها خبرة إقليمية وعالمية رائدة في مجالات [domain]، مما يؤهلنا لتقديم الدعم اللازم لنجاح المشروع وتحقيق الأهداف المرجوة.`); optional bullet 4 = ALLIANCES/ecosystem; final bullet ALWAYS = `الالتزام بالشراكة المستدامة: نحن نؤمن بأهمية الشراكة والعمل جنباً إلى جنب [مع الأمانة] لضمان تنفيذ المشاريع بنجاح وتحقيق الأهداف المرجوة، مع التركيز على تحقيق رؤية شاملة ومستدامة لمدينة الرياض.`
7. Closing commitment: `ونحن نؤكد لكم التزامنا الكامل تجاه المشروع. وفي حال الحاجة الى أي معلوماتٍ إضافية أو وجود أي استفسار، نرجو منكم عدم التردّد في التواصل معنا.  وتفضلوا بقبول فائق التحية والاحترام،`
8. Signature block: `خالد السقا` (bold) / `شريك، ديلويت الشرق الأوسط`.
9. Sidebar (both decks byte-identical): heading `جهات الاتصال`; contact card = circular photo → name bold (خالد السقا / مشعل السديري) → `شريك` → `ديلويت للاستشارات الشرق الأوسط` → email (kalsagga@deloitte.com / malsedairy@deloitte.com) → `جوال: +966 …`.

### 6. Visual grammar
Two circular head-shots (traditional Saudi dress, studio gray background), 1.06in diameter, one per contact. No icons, no color blocks — the page must look like a letter, not a slide.

### 7. Micro-conventions
Project name always in «guillemets» + bold inside prose. Phone format `+966 (11) 2828500`. RFP response is called `رد على طلب المعلومات` (response to RFI) — mirror the RFP's own terminology (طلب المعلومات vs طلب العروض). Letter keeps the standard footer, so the letter itself is "page 2" of the proposal.

### 8. DECK1 vs DECK2 delta
IDENTICAL: full skeleton sentences 1–9 above, letterhead, signatory, both contacts (names/emails/mobiles), geometry, sizes, teal lead-in style, the تحيبة typo. CHANGED: addressee client, subject/project title, objective paraphrase (DECK2 adds Vision-2030 framing), bullet count (5→4) and the domain nouns inside bullet lead-ins/bodies, one word كشريك. This proves the letter is a mail-merge: ~80% frozen, ~20% domain-swap.

### 9. RECONSTRUCTION RECIPE
1. Keep the whole skeleton (§4/5) literally; regenerate only: client name, project title (verbatim RFP), 1–2-clause objective paraphrase (lift the RFP's own objective wording, then bolt on national-vision framing), and 4–6 advantage bullets.
2. Compute bullets from: (a) client's city/sector → local-understanding bullet naming 2–3 real sister entities you've served; (b) RFP functional domain → track-record bullet; (c) same domain → team bullet using the frozen template sentence; (d) optional alliances bullet if the RFP scope includes delivery partners; (e) always close with the frozen commitment bullet.
3. Lead-ins: 3–9 words, noun-phrase, no verbs, 14pt bold teal 0D8390 + colon; explanation: ONE flowing sentence 25–45 words ending with مما يساعدنا/مما يؤهلنا + benefit.
4. Sidebar: two real engagement partners with photos cropped to circles, emails as live hyperlinks.
5. Quality bar: letter fills the page (dense, justified-looking right-aligned block), zero bullets beyond the advantage list, correct honorific salutation, and the letter's accent is TEAL not green.

════════════════════════════════════════════════════════════════════
## ARCHETYPE 3 — TABLE OF CONTENTS (DECK1 s3, DECK2 s3; layout = slideLayout8)

### 1. Narrative role
Signals the canonical Monitor Deloitte proposal architecture (reader orientation + implicit compliance matrix: exec summary → perspective → approach → timeline → team → 8 appendices). Identical section names across decks = the firm's fixed proposal spine.

### 2. Layout anatomy
- Full-height photo occupying the LEFT ~44.3%: Riyadh aerial at dusk with Kingdom Centre tower (purple sky, warm city lights). Edge is a hard vertical cut at x=5398593.
- GREEN PANEL: rectangle (5398593, 2) 6793405 x 6857998 — right 55.7%, fill = linear gradient 45° from 0A5456 (dark teal, alpha 84.7%) to 055B3F (dark green, alpha 85%); the ~15% transparency lets the underlying photo darken it richly (reads close to TOC-green 1A7749).
- Title `جدول المحتويات` in the STANDARD title placeholder (386400, 345992, 11277600 x 334099) — i.e. the normal content-slide title strip reused, right-aligned so it lands top-right on the green panel. 24pt (sz=2400) white.
- Contents table (think-cell) at (5932967, 1142999) 5731033 x 4565470: 13 rows, 2 columns — page number column + section-name column, transparent cells.
- Master footer partially visible (copyright `…جميع الحقوق محفوظة` bottom center-right, small).

### 3. Typography
Title 24pt white right-aligned. Table rows 16pt (sz=1600) Sakkal Majalla; section names white (schemeClr bg1); page NUMBERS in bg2 (D0D0CE, light gray) — numbers are Latin digits. Row separator: bottom border only, 1pt (w=12700) solid bg2/D0D0CE; no zebra, no fills, no vertical lines.

### 4. Canonical section names + page numbers (title formula)
Both decks list EXACTLY these 13 entries in this order (trailing spaces preserved in XML — copied, not retyped):
| Section | DECK1 page | DECK2 page |
|---|---|---|
| الملخص التنفيذي | 4 | 4 |
| وجهة نظرنا | 7 | 7 |
| النهج الذي سنتّبعه | 44 | 49 |
| الجدول الزمني الذي نقترحه | 63 | 67 |
| فريق العمل الذي نقترحه | 66 | 69 |
| ملحق | 72 | 76 |
| ملحق: ملفات تعريف الفريق | 73 | 77 |
| ملحق: ملفات تعريف الخبراء | 82 | 88 |
| ملحق: خبراتنا | 94 | 105 |
| ملحق: أطر العمل والمنهجيات | 174 | 190 |
| ملحق: نبذة عن ديلويت | 235 | 251 |
| ملحق: الشروط والأحكام | 247 | 263 |
| ملحق: المستندات القانونية | 260 | 276 |

Implied proportions (DECK1/DECK2): exec summary 3 slides; وجهة نظرنا (our perspective/context) ~37/42 slides — the biggest body section; approach ~19/18; timeline ~2–3; team ~6–7; then appendices ≈ 73% of the deck, dominated by خبراتنا (case credentials, ~80–85 slides) and أطر العمل والمنهجيات (frameworks, ~60 slides).
Numbering quirk (human artifact): the first 4 entries point AT the divider slide; the later entries point at divider+1 (e.g. فريق العمل divider is s65, TOC says 66; خبراتنا divider s93, TOC says 94). Not a system — don't over-engineer; just point at section starts consistently.

### 5–7. Writing/micro
Appendix entries always prefixed `ملحق: `. Sixth row is the bare word `ملحق` marking the appendix block start. No dots/leaders between name and number — the underline row border does that job. Page numbers = slide numbers (deck doubles as paginated PDF).

### 8. DECK1 vs DECK2 delta
Byte-identical except the 13 page numbers. Same photo, same gradient, same names (incl. trailing-space quirks).

### 9. RECONSTRUCTION RECIPE
1. Left 44.3%: full-height city photo (dusk/night, one landmark of client's city). Right 55.7%: 45° gradient 0A5456→055B3F at 85% alpha over the photo edge.
2. Title `جدول المحتويات` 24pt white, top strip, right-aligned.
3. Build 13-row table ~6.3in wide starting y≈1.25in: number cell (D0D0CE 16pt) then name cell (white 16pt), 1pt D0D0CE bottom border per row, transparent fills.
4. Keep the 13 canonical section names EXACTLY (this spine is the firm standard; only page numbers are recomputed after the deck is final). If RFP demands extra sections (e.g. financial appendix), append as `ملحق: …` rows.
5. Quality bar: numbers updated LAST after final pagination; never renumber sections; never translate section names to English.

════════════════════════════════════════════════════════════════════
## ARCHETYPE 4 — SECTION DIVIDER, single-title variant (DECK1 s4, s7, s44, s63, s65, s71; DECK2 s4, s48, s66, s68, s75; layout = slideLayout4 "Divider - Deloitte white")

### 1. Narrative role
Full-bleed pause page announcing the next main section in the proposal spine. Huge type = confidence; zero content = discipline.

### 2. Layout anatomy — the ONE background (there is only one divider background variant across BOTH decks; I checked all 13 DECK1 dividers + 6 DECK2 dividers)
All art lives on slideLayout4:
- LEFT STRIP (~0–14% width): close-up photo of sand-gold curved lattice architecture (ribbed, fan-like roof structure) with a white curved edge separating it from the panel; full height.
- MAIN FIELD: Riyadh city night photo "Picture 44" at (1691899, 0) 10500100 x 6858000, covered by gradient rectangle (1827656, 2) 10364343 x 6857998, linear 45°, 0A5456 alpha 84.7% → 055B3F alpha 85% — the same TOC gradient. Net effect: deep green field with the city faintly ghosting through.
- DECOR: white contour-line "wave/terrain" art sweeping across the top-right and center (thin concentric lines); Deloitte geometric triangle/chevron pattern tiles at alpha 18% (Group 16) scattered along the left panel edge and corners; one small freeform shape near bottom-center.
- TITLE placeholder: (1308493, 1670834) 10541000 x 1592403 (11.5in wide, top at 1.83in), bodyPr anchor="b" (text sits on the BOTTOM of the box → baseline ~3.57in, upper-middle of slide), algn="r" rtl.
- SUBTITLE placeholder: (1308493, 3429000) 10541000 x 1566532, anchor="t" — EMPTY in this variant.
- No footer, no page number, no logos.

### 3. Typography
Section title: Sakkal Majalla, 88pt (sz=8800), bold, WHITE, right-aligned. Nothing else on the slide.

### 4. Title formula
The divider title = the TOC entry text, verbatim (including trailing spaces: `الجدول الزمني الذي نقترحه `, `فريق العمل الذي نقترحه `). Canonical main-section titles: `الملخص التنفيذي` · `وجهة نظرنا` · `النهج الذي سنتّبعه` · `الجدول الزمني الذي نقترحه` · `فريق العمل الذي نقترحه` · `ملحق`. Note the first-person-plural possessive voice (نظرنا، سنتّبعه، نقترحه) — sections are framed as OUR point of view / OUR approach / OUR proposed timeline & team.

### 5–7. Writing/micro
No body text, no page furniture. The only permitted extra is the (غير شامل) tag (see Archetype 5).

### 8. Delta
DECK2 dividers are byte-identical to DECK1 (same layout4, same 88pt, same strings). 100% frozen boilerplate.

### 9. RECONSTRUCTION RECIPE
1. Reuse the exact background composition: left gold-architecture strip with white curve at ~14%, green 45° gradient (0A5456→055B3F @85% alpha) over a city night photo, white contour waves, 18%-alpha triangle pattern.
2. Title box 11.5in wide, top 1.83in, height 1.74in, bottom-anchored, right-aligned; 88pt bold white Sakkal Majalla.
3. Insert one divider before every TOC section, title = TOC string verbatim.
4. Quality bar: never shrink the type below 88pt for main sections; if a title wraps to 2 lines that's fine; keep slide otherwise empty.

════════════════════════════════════════════════════════════════════
## ARCHETYPE 5 — APPENDIX DIVIDER, two-line variant (DECK1 s72, s81, s93, s173, s234, s246, s259; DECK2 s76…; same layout4)

### 2–3. Anatomy & typography
Same background. Two placeholders now used:
- Line 1 (Title placeholder, bottom-anchored): the word `ملحق` — 88pt bold white.
- Line 2 (Text placeholder at y=3429000, top-anchored): the appendix name — ALSO 88pt bold white (b="1" explicit). Long names wrap to 2–4 lines and may OVERFLOW the bottom edge (s93 `خبراتنا المماثلة محلياً وعالمياً` renders 4 lines and clips "محلياً" at the slide edge — a real template flaw; keep appendix titles ≤ 3 words per line or accept the clip).
- Optional non-exhaustive tag: s81 appends a second paragraph `(غير شامل)` at 48pt (sz=4800) ITALIC (i="1"), white, right-aligned, under the appendix name — used when the appendix (expert CVs) shows only a sample.

### 4. Title strings (divider vs TOC)
Divider line-2 text drops the `ملحق: ` prefix and may be FULLER than the TOC entry: TOC `ملحق: خبراتنا` → divider `خبراتنا المماثلة محلياً وعالمياً` ("our comparable experience locally and globally"). Catalog of line-2 strings: `ملفات تعريف الفريق` · `ملفات تعريف الخبراء` + `(غير شامل)` · `خبراتنا المماثلة محلياً وعالمياً` · `أطر العمل والمنهجيات ` · `نبذة عن ديلويت` · `الشروط والأحكام` · `المستندات القانونية`.

### 8. Delta
Byte-identical across decks.

### 9. RECIPE
`ملحق` on line 1 (88pt), appendix name in the subtitle placeholder (88pt bold), append italic 48pt `(غير شامل)` when content is a sample. Keep the same 7 appendix dividers in the same order for any new RFP; only خبراتنا content behind them changes.

════════════════════════════════════════════════════════════════════
## MICRO-CONVENTIONS — footers & running furniture (from slideMaster1/2… identical family)

- Footer strip at y=6517368 (bottom 0.37in), 9pt (sz=900):
  - Page number: slidenum field, bottom-LEFT in render.
  - "CaseCode" running-title placeholder at (960257, 6517368) w=6437160, 9–10.5pt: DECK1 = `العرض الفني: خدمات الدراسات الاستراتيجية والاقتصادية للتخطيط العمراني وإدارة المدن` (deliverable: project); DECK2 = `العرض الفني: أمانة منطقة الرياض | مشروع ضبط جودة مخرجات الأعمال لقطاع وسط مدينة الرياض` (deliverable: CLIENT | project — the pipe-separated breadcrumb is the newer, better formula).
  - Copyright placeholder at (6379632, 6517368) w=5355168: `© [year] ديلويت اند توش الشرق الأوسط المحدودة جميع الحقوق محفوظة` — year = proposal year (2026/2025).
- Footers appear on letter + TOC + content slides; suppressed on cover and dividers.
- `(غير شامل)` = "non-exhaustive" tag, italic, parenthesized — appears at divider level (48pt) and (per its use here) flags sampled content.
- Trailing-space and typo fossils (تحيبة, `الجدول الزمني الذي نقترحه `) recur byte-identically in both decks → the firm clones the previous proposal file and swaps content. A faithful reproduction pipeline should do the same (clone + swap), but FIX the typos.

## GLOBAL DECK1 vs DECK2 SUMMARY (framing layer)
FROZEN (template): all five archetype layouts (slideLayout9/16/8/4 + masters), every EMU coordinate, all fonts/sizes/colors, cover photo, TOC photo, divider art, 13-section spine and divider titles, letter skeleton + signatory + contacts, footer structure.
RECOMPUTED per RFP: client logo + client name + project title + date (cover); addressee/subject/objective-paraphrase/advantage-bullet domains (letter); 13 page numbers (TOC); footer running title + copyright year. Nothing else changes. The framing layer is a ~90% frozen shell around 8 swap-in slots.

## MASTER RECONSTRUCTION CHECKLIST (new RFP, framing layer, in order)
1. Extract from RFP: client legal name, project title (verbatim), issuing entity city, RFI vs RFP wording, submission month, functional domain nouns.
2. Cover: swap logo + 4 title lines (Archetype 1 recipe).
3. Letter: mail-merge the frozen skeleton; write 4–6 advantage bullets from client research (sister entities served, domain track record, team, alliances, frozen commitment closer); teal 0D8390 lead-ins 14pt bold + colon.
4. TOC: keep 13 canonical rows; fill page numbers only after final pagination.
5. Dividers: 6 main + 7 appendix dividers, frozen art, 88pt white bold titles verbatim from TOC; add `(غير شامل)` where sampled.
6. Footer master: set `العرض الفني: [client] | [project]` + `© [year] ديلويت اند توش الشرق الأوسط المحدودة جميع الحقوق محفوظة`.
7. Human-not-AI quality bar: Sakkal Majalla everywhere (Arabic + numerals context), 106% line spacing on cover, right-aligned RTL every paragraph, guillemets around project name in prose, one idea per slide (dividers carry ONE line), dense letter page with zero decoration, and think-cell-grade table alignment on the TOC (equal row heights, single 1pt D0D0CE underlines).
