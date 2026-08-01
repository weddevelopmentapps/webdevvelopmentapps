# EXECUTIVE SUMMARY SECTION — Deep Reverse-Engineering Findings
Scope: DECK1 (Strategic Studies) slides 5–6, DECK2 (Central Riyadh Sectors Performance) slides 5–6.
Evidence: renders `img1/s-005.jpg`, `img1/s-006.jpg`, `img2/s-005.jpg`, `img2/s-006.jpg`; text dumps `txt1/txt2 s-005/s-006.txt`; XML `unpacked1|2/ppt/slides/slide5.xml, slide6.xml`; layout `slideLayouts/slideLayout3.xml`; master `slideMaster1.xml`; theme `theme/theme1.xml`.

The Executive Summary is a **2-slide pair immediately after the section divider (slide 4)**, and both slides are built as **full-bleed night-photo "hero" slides** — the only two content archetypes in the deck rendered entirely as white/green text over a dark photograph. They function as the 60-second read of the whole proposal: Slide 5 = "we understand you" (empathy/context), Slide 6 = "here is our approach + our team" (a one-slide preview of the entire technical proposal).

Both slides use **slideLayout3 ("3_Title & subtitle")**, which carries only a title placeholder (positioned x=501650, y=325672, cx=11195050, cy=783461 EMU ≈ 0.55" from left, 0.36" from top, 12.24" wide, 0.86" tall) with layout-level default: **36pt, Sakkal Majalla (latin+cs+sym), fill schemeClr bg1 (white)**. Slides override to 28pt. Master title style algn="l" but every slide paragraph sets `algn="r" rtl="1"`.

## 0. Shared infrastructure of both slides (the "hero canvas")

- **Background photo**: `Picture 4`, desc="KAFD" (King Abdullah Financial District skyline at dusk, green-lit Capital Market Authority tower — an intentionally Riyadh-specific, Deloitte-green-tinted image). Full bleed: off (0,1), ext (12192000×6858000) = exact slide size. `<a:srcRect/><a:stretch>`. **No overlay rectangle — the photo itself is dark enough**; all text is white directly on the photo. The file is byte-identical across decks (`media/image13.jpeg`, md5 8bbb36f0…, 189 KB) — this is a fixed template asset.
- **No footer, no page number, no source line, no copyright** on either slide — the hero pages are deliberately chrome-free (footers exist on white content slides elsewhere in the deck).
- **Hidden artifact**: every one of these slides carries an invisible legacy OLE object (`graphicFrame Object 6` 1684×1684 EMU + two 168393-EMU squares `Rectangle 3/4` near (1246291, 701039)). It is invisible junk from the template lineage — do NOT reproduce; a rebuild should omit it.
- **Title placeholder (both slides, both decks)**: one paragraph, `algn="r" rtl="1"`, two runs at `sz="2800"` (28pt):
  - Run 1 (plain, white/bg1): the "framing verb" phrase.
  - Run 2 (`b="1"`, fill `schemeClr accent4 + lumMod 60000 + lumOff 40000`): the emphasized payload.
  - Theme: accent4 = **046A38** (dark green). The 60%/40% luminance tint renders as the vivid bright green (~#18F088 in the LibreOffice render). So the "green highlight" is NOT a raw hex — it is **"accent4, Lighter 40%"** on the Deloitte theme (accent1=86BC25, accent2=43B02A, accent3=26890D, accent4=046A38, accent5=0D8390, accent6=007CB0, dk2=53565A, lt2=D0D0CE, hlink=00A3E0). Reproduce with the schemeClr formula, not a literal srgbClr, so theme-wide recolors keep working.
- **Font regime**: every explicit run sets `latin`, `cs`, `sym` = **Sakkal Majalla** (panose 02000000000000000000, charset="-78"), `ea` = SimSun. Titles inherit Sakkal Majalla from layout lstStyle. Numbers ("0"–"6", "200+", "170") are typed as lang="en-US" digits but still in Sakkal Majalla.

---

## ARCHETYPE A — Slide 5: "ندرك أهمية مشروع …" (We understand the importance of the … project)

### 1. Narrative role
First content slide after the Executive Summary divider. It must prove two things in one view: (a) we know **who you are** (client + city context — right column, read first in RTL), and (b) we know **what this project is really for** (re-expressed objectives — left column). It is the consultant's "playback" of the RFP: no methodology, no team, no diagrams — pure narrative empathy. One idea: *understanding*.

### 2. Layout anatomy (identical geometry both decks)
- Full-bleed photo canvas (see §0), title band across the top (y≈0.36"–1.09").
- **Two symmetric text columns**, each cx=5532120 (6.05"), starting y=1281950 (1.40"):
  - RIGHT column (`Rectangle 7` deck1 / `Rectangle 10` deck2): x=6250804 (6.84"), cy=5047536 — **CLIENT/CITY context** (read FIRST in RTL).
  - LEFT column (`Rectangle 5`): x=409076 (0.45"), cy=4955203 — **PROJECT objectives**.
  - Gutter between columns ≈ 0.34". Both are plain unfilled rectangles with `spAutoFit`, `wrap="square"`, `flipH="1"` (cosmetic).
- No icons, no shapes, no logos. The whole slide is typography over photo. Density: ~170–200 Arabic words; the columns visually overrun the bottom edge slightly in LibreOffice render (autofit text; in PowerPoint it fits exactly).

### 3. Typography (element-by-element)
| Element | Font | Size | Weight | Color | Align |
|---|---|---|---|---|---|
| Title run 1 «ندرك أهمية» | Sakkal Majalla | 28pt | regular | white (bg1) | right, rtl=1 |
| Title run 2 (project name…) | Sakkal Majalla | 28pt | **bold** | accent4 lum60/40 (bright green) | right, rtl=1 |
| Column lead paragraph (both columns) | Sakkal Majalla | **24pt** | **bold** | accent4 lum60/40 | right, rtl=1 |
| Column body paragraphs | Sakkal Majalla | **20pt** | regular | white (bg1) | right, rtl=1 |
- Paragraph spec: `lnSpc 100%`, `spcBef 0`, `spcAft 1200` (12pt after every paragraph), `buNone` — **no bullets anywhere on this slide; it is flowing prose paragraphs**.

### 4. Title formula
`ندرك أهمية ` + **[bold green: مشروع + FULL OFFICIAL RFP PROJECT NAME]`**
- DECK1: «ندرك أهمية **مشروع خدمات الدراسات الاستراتيجية والاقتصادية للتخطيط العمراني وإدارة المدن**»
- DECK2: «ندرك أهمية **مشروع ضبط جودة مخرجات الأعمال لقطاع وسط مدينة الرياض**»
- Rule: the un-highlighted stem is exactly two words («ندرك أهمية»); everything from «مشروع» to the end of the official project name is bold + green. No pagination, no «(1/N)», no «…» continuation, no breadcrumb — hero titles are single clean assertions. Title may wrap to 2 lines (green run wraps with it).

### 5. Body writing patterns
**RIGHT column (client/city) — 1 green lead + 3 white paragraphs, VERBATIM IDENTICAL in both decks (pure boilerplate for Amanat Al-Riyadh proposals):**
1. Green bold 24pt lead (an assertion about the client): «تلعب امانة منطقة الرياض دورا محوريا في التنمية الشاملة والمستدامة في المدينة والمنطقة، والتي تعد الاسرع نموا وتحولا في العالم»
2. «شهدت الرياض في العقود الماضية واحدة من أسرع حركات النمو الحضري في العالم، مدفوعة بزيادة سكانية هائلة، وهجرة داخلية وخارجية، وتحولات اقتصادية جذرية.» (history/momentum)
3. «الرياض هي مدينة ذات إرث عريق وطموح متجدد… بالاضافة لسعيها لأن تكون من بين أفضل 10 مدن في العالم.» (ambition + the **"أفضل 10 مدن"** stat-form)
4. «يوجد حاليا العديد من الجهات التي تعمل في الرياض، ولكن تشكل أمانة منطقة الرياض العامود الاساسي في التنمية الشاملة…» (client's unique position among many players)
Rhythm: past → present/ambition → client's role. Each paragraph one long Arabic sentence (35–45 words) built of comma-chained parallel clauses.

**LEFT column (project) — 1 green lead + 2 white paragraphs, FULLY REWRITTEN per RFP:**
1. Green bold 24pt lead = the **objective sentence**, formula: «يهدف مشروع [الاسم الكامل] إلى [مصدر verbal noun chain]…»
   - DECK1: «…إلى توفير دعم استشاري استراتيجي مستمر ومكثف للإدارة العليا بأمانة منطقة الرياض»
   - DECK2: «…إلى بناء نموذج تشغيلي لضبط جودة العمليات التشغيلية وتحسين كفاءة الأداء وتعزيز قدرة القطاع على تحقيق مستهدفاته»
   Note the deliberate echo: the title's green project name is repeated as the subject of the green lead — title asserts *importance*, lead asserts *aim*.
2. White ¶2 = **contribution/context**: starts «يسهم المشروع في…» (D1) or «ويأتي استجابةً للحاجة المتزايدة إلى…» (D2). Verb-first, links project to client priorities («بما ينسجم مع أولويات التنمية الحضرية والتوجهات الاستراتيجية طويلة المدى»).
3. White ¶3 = **focus/scope**: starts «ويركز المشروع على…» (D1) / «يركز المشروع على…» (D2) — then compresses ALL the RFP's scope bullets into ONE long sentence of parallel verbal nouns joined by «و…، و…، و…»: e.g. D1: «إعداد دراسات… وقياس الأثر الاقتصادي والتنظيمي… ورفع جاهزية المخرجات… وتعزيز التمكين المؤسسي ونقل المعرفة، بما يضمن استدامة أثر المشروع… ودعم الاستعداد المبكر للتحولات المستقبلية». Closing clause always begins «بما يضمن…»/«بما يتوافق مع…» (benefit/alignment coda).
- **This is re-expression, not copying**: RFP objective lists are converted to flowing prose with the fixed verb battery {يهدف، يسهم/ويأتي، يركز} + noun battery {تعزيز، رفع كفاءة، دعم صناعة القرار، جاهزية، استدامة، نقل المعرفة، التوجهات الاستراتيجية}.

### 6–7. Visual grammar & micro-conventions
None beyond §0: no icons, no source line, no «غير شامل», no footer. The restraint is the point — it reads like a letter, not a slide.

### 8. DECK1 vs DECK2 delta
- IDENTICAL: photo, geometry of all boxes, title stem «ندرك أهمية», entire right column word-for-word, all typography specs.
- CHANGED: title's green project name; the left column's 3 paragraphs (fully rewritten from the new RFP's objectives/scope). D2's ¶2 opens with a need-based justification («ويأتي استجابةً للحاجة المتزايدة…») instead of D1's contribution framing — showing the ¶2 slot is "why now / what it adds", flexible in angle.
- Conclusion: right column = client-level boilerplate reusable for ANY Amanat Al-Riyadh proposal; left column + title tail = the only RFP-derived content.

### 9. RECONSTRUCTION RECIPE (Slide 5)
1. Canvas 13.333"×7.5"; insert client-city hero photo full-bleed (dark dusk/night shot of client's city/HQ; must be dark enough for white 20pt text — if not, add a 40–55% black overlay rectangle). Keep the photo consistent across all hero slides in the deck.
2. Title placeholder at (0.55", 0.36"), 12.24"×0.86", right-aligned RTL, Sakkal Majalla 28pt: type «ندرك أهمية ` then bold+«accent4 Lighter 40%» green: «مشروع [official RFP project name]».
3. Two text boxes 6.05" wide × ~5.0" tall at y=1.40": right box x=6.84", left box x=0.45". Both: Sakkal Majalla, right-align, rtl, lnSpc 100%, space-after 12pt, no bullets.
4. RIGHT box (write from client research, NOT the RFP): green bold 24pt assertion of client's pivotal role («تلعب [الجهة] دورا محوريا في…»), then 3 white 20pt paragraphs: (i) historic growth/transformation with one hard fact, (ii) ambition/vision with a rank-style stat («من بين أفضل 10 …»), (iii) client's unique mandate among other players. If proposing to the same client again, reuse verbatim.
5. LEFT box (recomputed from RFP): green bold 24pt «يهدف مشروع [الاسم] إلى [2–3 chained aims]», white 20pt ¶ «يسهم المشروع في… بما ينسجم مع…» (or «ويأتي استجابةً لـ…»), white 20pt ¶ «يركز المشروع على [ALL scope items as verbal nouns joined by و]، بما يضمن [sustainability/impact coda]». Never bullet the objectives; never quote RFP sentences verbatim — re-verb them.
6. No footer/page number/source. Word budget ≈ 90–110 words per column. Quality bar: both green leads start at the same y; both columns bottom-align within ~0.3"; every paragraph is a single grammatical sentence; zero Latin words.

---

## ARCHETYPE B — Slide 6: "وسنعمل على دعم الأمانة …" (And we will support the Amanah …)

### 1. Narrative role
Second half of the exec summary and the **whole technical proposal in one slide**: right zone previews the delivery approach (numbered workstreams/phases 0…N), left zone establishes credibility (Monitor Deloitte blurb, partner logos, 200+ experts stat, leadership photo strip). The conjunction «و…» opening the title deliberately chains it to slide 5: *we understand (5) → and we will deliver (6)*.

### 2. Layout anatomy — three-zone (identical skeleton both decks)
- **Title band** (same placeholder as slide 5).
- **RIGHT zone (approach) — read first in RTL:**
  - Section header + intro: `Rectangle 5` at (6095998, 986414, 5568001×877163): line 1 «النهج الذي سنتّبعه» 18pt bold white; then intro 14pt white.
  - Tracks body `Rectangle 2`: D1 (5262880, 1873385, 6401118×4323874); D2 same x/w, y=2087087. One paragraph per track: bold lead run + `<a:br/>` + regular description run (this is why text dumps concatenate «مسار الإطلاقالمواءمة…» — the break is a soft `<a:br/>`, not a new paragraph). Para spec: spcBef 800 / spcAft 800 (8pt/8pt), algn r, rtl 1, `bodyPr tIns=bIns=91440`.
  - **Numbered circles** hugging the right slide edge, one per track: `Oval` 387795×387795 (0.42"), x=11663998 (≈12.76"), **noFill, 1.5pt (w=19050) outline in accent4 lum60/40 bright green**, centered digit 24pt bold white Sakkal Majalla, digits `0,1,2,…N`. D1: 5 circles at y = 1893781, 2583063, 3761961, 4689859, 5631612 (UNEVEN pitch — each circle vertically centered on its track paragraph). D2: 7 circles from y=2200029 with even pitch 625752 EMU (0.68") because all 7 track blocks are equal height. **Numbering starts at 0** — the kickoff is "phase/track 0".
- **LEFT zone (credibility):**
  - Header `Rectangle 14` (462205, 986414, 4257847×369332): «فريق العمل الذي نخصّصه للمشروع» bold white, inherits the presentation default **18pt** (no explicit sz).
  - Monitor Deloitte logo `Picture 33` (3619500, 1499018, 1060626×428536 ≈1.16"×0.47") — white "Monitor Deloitte." wordmark PNG, sits at the left edge of the blurb block.
  - Firm blurb `Rectangle 13` (462205, 1415161, 3107445×2585323): default 18pt white; bold lead-in run «لمحة عن مونيتور ديلويت: » + regular continuation «مونيتور ديلويت هي الذراع الاستراتيجي لديلويت، والتي تعتبر أكبر شركة للخدمات المهنية حول العالم. وبفضل أكثر من 170 عامًا من الإرث، تُعتبر مونيتور ديلويت حاليًا الشريك الأفضل والشريك الحقيقي الوحيد لتحقيق تحوّل الأعمال الشامل سواء على مستوى الحكومات أو المؤسسات الخاصة الرائدة في مختلف أنحاء العالم» — VERBATIM boilerplate in both decks (incl. the **«أكثر من 170 عامًا»** heritage stat).
  - **Experts card**: `Rectangle: Rounded Corners 25` (D1: 198968, 4212583, 4242741×2482248; corner adj 3584) — **no fill, 1.5pt light-gray outline `bg1 lumMod 85000`** (≈D9D9D9), i.e. a ghost card over the photo. Top-right inside: label «خبراء المشروع» 14pt bold white. Overlapping its top-LEFT corner: the tag `Rectangle: Single Corner Rounded 24` (1009784×201221, prst=round1Rect adj 20410) with **diagonal gradient 0097A9 → accent6(007CB0) lumMod 50%** (teal→dark blue, ang=8100000), white 14pt regular text **«غير شامل»** (non-exhaustive) — the house convention marking illustrative lists.
  - Inside the card: **stat block** `TextBox 16` (3413791, 4955059): «200+» — "200" at **36pt**, "+" at 24pt, white; beside it descriptor `TextBox 17` (209987, 5058714, w=3203805): D1 12pt / D2 14pt white: «خبير معني بالقطاعات المطلوبة في [الاستراتيجيات والتخطيط العمراني وإدارة المدن | الاستراتيجيات وكفاءة التشغيل] او المجالات الداعمة الممكنة لنجاح المشروع» — the middle clause is swapped to echo each RFP's domain.
  - **Partner-logo row** (DECK1 ONLY, y≈4.61–4.73M): Deloitte wordmark drawn as vector freeforms (`Group 39`) + `Rectangle 40` «Real Estate» 8pt bold white (= "Deloitte Real Estate"), `Picture 4` PARSONS logo (1361581×272494), `Picture 2` GIBSON DUNN logo (1497739×147044). **DECK2 drops this row entirely** (no subcontractors on that engagement).
  - **Expert photo strip**: 5 headshots 415182×~434–457200 EMU (0.45"×0.47") in a row at y≈5.54M (x from 313469 to 3776777, pitch ≈0.9"), each with name below at y=6038147 (**11pt bold white**) and role at y=6332351 (**9pt regular white**, boxes `Text Placeholder 51`). RTL order right→left: راشد بشير (الرئيس التنفيذي لشركة ديلويت في الشرق الأوسط)، سلطان بيك خونكيف (خبير في التخطيط الاستراتيجي)، حسن مالك (خبير في تنفيذ الاستراتيجية)، [slot 4]، مقرن الشعلان (خبير في الحوكمة والتنظيم). Slot 4 differs: D1 ريتشارد كومبتن «خبير مختص في التخطيط وتطوير البنية التحتية»؛ D2 يزيد الثنيان «خبير في التخطيط الحضري والخدمات البلدية» — the ONE swapped expert matches the RFP domain. Role formula: «خبير في [التخصص]»; CEO gets his title instead.

### 3. Typography summary (slide 6)
| Element | Size/weight | Color |
|---|---|---|
| Title run1 / run2 | 28pt reg / 28pt bold | white / accent4 lum60/40 |
| «النهج الذي سنتّبعه», «فريق العمل الذي نخصّصه للمشروع» (zone headers) | 18pt bold | white |
| Approach intro paragraph | 14pt reg | white |
| Track lead / track description | D1 **16pt** bold / 16pt reg; D2 **14pt** bold / 14pt reg | white |
| Circle digits | 24pt bold | white (green-ring circle) |
| Firm blurb lead / body | 18pt bold / 18pt reg (inherited default) | white |
| «خبراء المشروع» / «غير شامل» | 14pt bold / 14pt reg | white |
| «200+» | 36pt (+ at 24pt) | white |
| Experts descriptor | D1 12pt / D2 14pt | white |
| Names / roles | 11pt bold / 9pt reg | white |
| «Real Estate» (D1) | 8pt bold | white |
All Sakkal Majalla, right-aligned rtl=1 (circle digits centered; «Real Estate» latin).

### 4. Title formula
Fixed sentence, only the green span is styled: «وسنعمل على دعم الأمانة بالخدمات التي تحتاجها **لتنفيذ المشروع على أكمل وجه**» — VERBATIM identical in both decks (green bold = «لتنفيذ المشروع على أكمل وجه»). Pattern: opens with «و» (continuation of slide 5), client referenced generically («الأمانة»), the green highlight lands on the *commitment clause*, not the project name. For a new client substitute «الأمانة» with the client's short name.

### 5. Body writing patterns
- **Approach intro (fixed boilerplate, both decks verbatim)**: «لقد اقترحنا هذا النهج المحدّد للمشروع والفريق المخصّص لتنفيذه، بناءً على فهمنا لأهداف الأمانة وبناءً على ما هو متوقّع منّا من حيث النتائج والمخرجات. ينطوي النهج الذي نقترحه على مراحل العمل الآتية:» — note the «بناءً على… وبناءً على…» doubled-justification rhythm and the colon handing off to the numbered list.
- **Track naming formula**:
  - D1 (workstream flavor): item 0 = «مسار الإطلاق»; then «مسار العمل الأول: [اسم المسار]»، «مسار العمل الثاني: …»، «الثالث»، «الرابع» — ordinal WORDS.
  - D2 (phase flavor): «المرحلة 0: الاطلاق»، «المرحلة 1: تحليل الوضع الراهن» … «المرحلة 6: نقل المعرفة» — ordinal DIGITS. Digits in the circles always match.
  - Description line (after soft break): one sentence, 15–25 words, verb-noun opener (إعداد/تمكين/ضمان/تحليل/تطوير/متابعة/العمل على), compressing that workstream's chapter of the proposal. Phase 0 description is near-boilerplate: «المواءمة على معايير النجاح للمشروع، وإجراء ورشة عمل انطلاق المشروع مع الفريق للموائمة على أهداف المشروع». Last track is always forward-looking/sustainability (D1: التوجهات والتحولات المستقبلية; D2: نقل المعرفة).
- **Stat forms**: «أكثر من 170 عامًا من الإرث» (heritage), «200+» + «خبير معني بالقطاعات المطلوبة في …» (bench strength). Numbers lead, qualifier follows.

### 6–7. Visual grammar & micro-conventions
- Numbered-circle rail: outline-only circles (never filled) in the bright green, digits white — this is the house "journey" motif; the 0-start signals a free/setup mobilization phase.
- «غير شامل» tag: single-corner-rounded, teal→blue gradient (0097A9→007CB0@lum50), white 14pt — attaches to the corner of any illustrative container (here the experts card). Same construct reappears across the decks; it is a stock component.
- Ghost card (no fill + bg1@85% gray 1.5pt border, corner radius adj ≈3600) is the standard container over photos.
- Partner logos are white/knockout versions, vertically centered in one row; Deloitte sub-brand rendered as vector paths + tiny 8pt "Real Estate" label.
- No footer/page/source on this slide either.

### 8. DECK1 vs DECK2 delta (template vs project content)
IDENTICAL (template): photo, title text incl. green span, zone geometry, «النهج الذي سنتّبعه» + intro paragraph, «فريق العمل الذي نخصّصه للمشروع», entire Monitor Deloitte blurb + logo, experts card + «غير شامل» tag + «خبراء المشروع» + «200+», 4 of 5 experts (names, photos, roles), circle styling.
RECOMPUTED per RFP: (a) number and naming of tracks — D1: 4 workstreams + launch (5 circles, 16pt, uneven circle spacing matched to text); D2: 6 phases + phase 0 (7 circles, 14pt — font stepped DOWN one notch to fit two more items, circles evenly pitched, tracks body shifted down y 1873385→2087087, experts card regrouped/lowered); (b) all track names + one-line descriptions; (c) the 5th expert and his role; (d) the experts-descriptor domain clause; (e) partner-logo row present only when subcontractors exist (D1). Lesson: **capacity is absorbed by shrinking body text 16→14pt and equalizing block heights, never by shrinking the title, headers, circles, or card**.

### 9. RECONSTRUCTION RECIPE (Slide 6)
1. Same hero canvas as slide 5 (same photo file — continuity is intentional).
2. Title: «وسنعمل على دعم [الجهة] بالخدمات التي تحتاجها » + bold green «لتنفيذ المشروع على أكمل وجه». 28pt.
3. RIGHT zone: header «النهج الذي سنتّبعه» 18pt bold at (6.67", 1.08"); paste the fixed intro paragraph 14pt ending with «…مراحل العمل الآتية:».
4. Derive N tracks (recompute from your proposed methodology section — these MUST be the same names as the approach chapter later in the deck): launch item 0 + 3–6 substantive tracks + a closing sustainability/knowledge-transfer track. Choose flavor: «مسار العمل [ordinal word]: NAME» for workstream-style engagements, «المرحلة [digit]: NAME» for phased ones.
5. Tracks textbox ≈ (5.76", 2.0"–2.3", 7.0"×4.7"): per track ONE paragraph = bold lead (16pt if ≤5 items, 14pt if 6–7) + Shift-Enter + one-sentence description; 8pt space before AND after.
6. Circle rail at x≈12.76": one 0.42" outline-only circle per track (1.5pt, accent4 Lighter 40%), digit 24pt bold white, each circle vertically centered on its track's lead line.
7. LEFT zone: header «فريق العمل الذي نخصّصه للمشروع» 18pt bold; Monitor Deloitte white logo; the FIXED firm blurb («لمحة عن مونيتور ديلويت: مونيتور ديلويت هي الذراع الاستراتيجي… في مختلف أنحاء العالم») with bold lead-in + colon.
8. Ghost card (4.64"×~2.5–2.7", no fill, D9D9D9-equivalent 1.5pt border, slight round): «خبراء المشروع» 14pt bold top-right; «غير شامل» gradient tag on top-left corner; «200+» 36pt + domain-tuned descriptor («خبير معني بالقطاعات المطلوبة في [مجالات هذا العطاء] او المجالات الداعمة الممكنة لنجاح المشروع»); row of 5 leader headshots 0.45" with name 11pt bold / role «خبير في …» 9pt; put the regional CEO first (rightmost) and swap ONE slot to a domain expert matching the RFP; add a white partner-logo row above the strip only if the bid includes subcontractors.
9. Quality bar: everything white except the two green devices (title span, circles) and the teal tag; no filled boxes besides the tag; circle digits and track ordinals must agree; track names must match the later approach section word-for-word; nothing may collide with the photo's bright areas; no footer. Human tell: uneven-but-centered circle spacing when track lengths differ — do that, don't force even spacing over ragged text.

---

## Cross-cutting takeaways for the generator
1. The exec-summary pair is a fixed two-beat rhetorical unit: «ندرك أهمية…» → «وسنعمل على دعم…» — reuse both stems verbatim.
2. Green emphasis = schemeClr accent4 + lumMod 60000/lumOff 40000, applied ONLY to: title payload span, column/section lead sentences, circle outlines. Everything else is pure white on photo.
3. Hierarchy ladder on photo slides: 28 title / 24 col-lead / 20 body (slide 5); 18 zone-header / 16→14 tracks / 14 labels / 11–9 captions (slide 6). All Sakkal Majalla, algn="r" rtl="1", spcAft 12pt (prose) or 8+8pt (list).
4. Boilerplate library confirmed: Riyadh-context column, approach intro paragraph, Monitor Deloitte blurb, «200+ خبير» card, «غير شامل» tag, KAFD hero photo, 4-of-5 leadership strip.
5. RFP-derived slots: green project name, objective sentence, scope-fusion paragraph, track names/descriptions/count, domain clause of the experts descriptor, one expert swap, optional partner logos.
