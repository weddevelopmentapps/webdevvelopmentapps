# 08 — CREDENTIALS APPENDIX خبراتنا (the largest section, ~80-85 slides per deck)

Scope analyzed:
- DECK1 "Strategic Studies": divider s-093, summary matrix s-094–100 (7 slides, all studied), local credentials خبراتنا | محلياً s-101–162 (62 slides, 14 sampled + all headlines extracted), global خبراتنا | عالمياً s-163–172 (10 slides, 4 sampled).
- DECK2 "Central Riyadh Sectors Performance": divider s-103, summary matrix s-104–111 (8 slides, all studied), local s-112–173 (62), global s-174–187 (14). ALL headlines extracted; ~8 slides deep-read; XML cross-checked.
- Verified by byte-diff: 69 of 72 DECK1 detail slides reappear VERBATIM in DECK2 at offset +11 (s-101→s-112 … s-169→s-180), and the remaining 3 (s-170/171/172) reappear verbatim at s-183/184/185. Geometry of every shape is EMU-identical between decks (verified slide105-deck1 vs slide116-deck2: True).

The section contains exactly THREE archetypes: (A) section divider, (B) summary matrix "سجل حافل", (C) single-credential slide (local/global/confidential variants).

---

## ARCHETYPE A — Appendix divider (DECK1 s-093, DECK2 s-103 — identical in both decks)

1. **Narrative role**: announces the credentials appendix. Big-title divider, no content.
2. **Layout**: full-bleed dark-green (046A38 family gradient) background; left third = gold/bronze architectural photo clipped behind a large white curved arc; faint Deloitte triangle/pattern motifs and thin white "wave" contour lines across the green field; night-city photo ghosted into the green at low opacity.
3. **Text**: `ملحق` then subtitle `خبراتنا المماثلة محلياً وعالمياً` — white, bold, Sakkal Majalla, very large (~40pt+), right-aligned, stacked on the right half.
4. **Title formula**: appendix dividers are labeled `ملحق` + a noun phrase naming the appendix. The phrase "خبراتنا المماثلة محلياً وعالمياً" (our similar experience, locally and globally) is fixed boilerplate reused verbatim across proposals.

---

## ARCHETYPE B — Summary matrix: "لدينا سجل حافل..." (DECK1 s-094–100, DECK2 s-104–111)

### B1. Narrative role
Proves volume + relevance in one table before any detail: a numbered inventory of the ENTIRE credentials library (70–74 projects), paginated, sitting on a dramatic Riyadh-skyline photo. In DECK2 it is upgraded into a **capability-mapping matrix**: every credential is checked against the RFP's own scope streams, so the evaluator can literally count how many prior projects touch each requirement of THEIR RFP.

### B2. Layout anatomy (XML-verified)
- Full-bleed photo: KAFD Riyadh skyline at night, `0,0 → 12192000×6858000` (whole slide), SAME photo in both decks.
- Over it, full-slide rectangle filled `schemeClr tx1` (black) at **alpha 70000** (70% opacity) → dark scrim; all content is white on top.
- Title placeholder (layout26 "dark photo" layout): x=456073 y=345992 w=11278727 h=864970. **28pt Sakkal Majalla, white (bg1)**, right-aligned, wraps to 2–3 lines.
- Table frame: DECK1 `300447,1364012 11649272×5300159`; DECK2 `242283,1298697 11707435×5344026`. 11 rows: 1 header (h≈464789 EMU) + 10 body rows (h≈483537 each, ~0.53in). Table has `rtl="1"` — **first gridCol renders at the far RIGHT**.
- DECK1 columns (right→left): `#` 585690 EMU (0.64") | `البلد` 1327987 (1.45") | `الجهة` 5204194 (5.69") | `المشروع` 4531401 (4.95").
- DECK2 columns (right→left): `#` 312775 | `البلد` 709182 | `الجهة` 2779184 | `المشروع` 2419894 | then **six equal scope columns 914400 EMU (1.00") each** on the left half.
- DECK2 adds above the six scope columns: a tiny label `نطاق العمل` (12pt) plus a **rightBrace shape rotated 270° (rot="16200000"), accent1 86BC25** acting as a horizontal brace spanning the scope-column group.
- 10 flag images per slide float in the `البلد` column: 393405×284297 EMU (0.43×0.31") rectangles at x≈10512411, one per row. Saudi flag repeated for local rows; per-country flags (Qatar, UAE, GCC emblem, Jordan, EU, Norway, Netherlands…) on global pages; a **globe glyph** for the confidential international row.

### B3. Typography / table styling (XML-verified, slide94 + slide104)
- All table text **white**, Sakkal Majalla; Latin digits render in Calibri/Times fallback.
- Header row: `#` / `البلد` / `الجهة` / `المشروع` (+ DECK2: the 6 scope headers) — **16pt bold white, centered** (scope headers wrap to 2–3 lines).
- Header underline: bottom border **12700 EMU (1pt) solid `618894`** (steel-blue-gray) across the header row — the ONE non-palette color in the section; it reads as a bright hairline under the header on the dark photo.
- Body rows: `#` 12pt bold white centered; `الجهة` **13pt bold** white right-aligned; `المشروع` **12pt bold** white right-aligned; NO cell fills (photo shows through).
- Row separators: bottom borders **9525 EMU (0.75pt) WHITE, prstDash="dash"** — dashed white hairlines between rows (76 dash borders/slide).
- Checkmarks (DECK2 only): **Wingdings U+F0FC (), 24pt, white (prstClr white)**, centered in scope cells.

### B4. Title formula — quote exactly
Fixed stem + RFP-scope clause + pagination:
- DECK1: `لدينا سجل حافل في تسليم المشاريع ذات المتطلبات المماثلة لقياس خدمات الدراسات الاستراتيجية والاقتصادية للتخطيط العمراني وإدارة المدن (1/7)` … `(7/7)`
- DECK2: `لدينا سجل حافل في تسليم المشاريع ذات المتطلبات المماثلة لقياس وضبط جودة الاداء وتطوير الخطط التشغيلية وتحسين الإجراءات ورفع كفاءة الأداء (1/8)` … `(8/8)`
- Pattern: **`لدينا سجل حافل في تسليم المشاريع ذات المتطلبات المماثلة لـ<verbatim keywords of the new RFP's scope> (i/N)`**. The stem never changes; the trailing clause is recomputed from each RFP; `(i/N)` pagination in Western digits, at the end of the title (leftmost visually in RTL), repeated on every page of the matrix.

### B5. DECK2 scope columns — quote exactly (these ARE the RFP's requirement streams)
Under the brace label `نطاق العمل` (scope of work):
1. `القطاع البلدي` (municipal sector — sector-relevance flag)
2. `تطوير الخطط التشغيلية`
3. `تحليل الاحتياجات البشرية والتقنية`
4. `تحسين الإجراءات`
5. `قياس وتطوير الأداء`
6. `المتابعة وتطوير التقارير`
Checkmark statistics (parsed from XML, all 74 rows): القطاع البلدي 10/74, تطوير الخطط التشغيلية 68/74, تحليل الاحتياجات 66/74, تحسين الإجراءات 57/74, قياس وتطوير الأداء 63/74, المتابعة وتطوير التقارير 37/74. **Every row has ≥1 check.** Logic: the sector column is strict (only genuinely municipal projects), the capability columns are generous — the page reads as "68 of our 74 projects did operational planning". This is capability mapping, not binary qualification.

### B6. Row content & ordering
Rows are `#` (running number 1…70/74) + country flag + `الجهة` (client entity, or `سري` for confidential) + `المشروع` (project title as a compact verbal-noun phrase, e.g. `تفعيل إدارة الأداء الإستراتيجي`, `تصميم النموذج التشغيلي المستهدف`). 10 rows per slide, always.
Library order (identical in both decks, rows 1–70): 1–10 Riyadh municipal cluster (وزارة البلديات والإسكان، أمانة منطقة الرياض، الهيئة الملكية لمدينة الرياض) → 11–20 national entities/strategy (سري، المركز الوطني للتنافسية، صندوق التنمية السياحي، الهيئة السعودية للسياحة…) → 21–30 Makkah/Hajj + urban-social (الهيئة الملكية لمدينة مكة ×5، برنامج خدمة ضيوف الرحمن، الدرعية…) → 31–40 giga-projects & ministry PMOs (نيوم ×2، أوكساجون، وزارة التعليم، وزارة النقل…) → 41–55 ministries/funds/operating models → 56–60 recent Riyadh-Amanah + HR credentials → **61–70 global** (كاس العالم 2022، مجلس أبوظبي للتعليم، دائرة الأراضي والأملاك، دول مجلس التعاون، أمانة عمان الكبرى، سري، اللجنة العليا للمشاريع والارث، مجلس الاتحاد الأوروبي، وزارة البيئة النرويجية، بلدية ماستريخت). DECK2 appends 71–74: حكومة البوسنة والهرسك، وزارة الصحة في سلوفاكيا، حكومة واشنطن العاصمة، حكومة سنغافورة.
Ordering principle: **client-adjacent first** (the RFP's own client family leads), local before global, thematic clustering inside. NOT alphabetical, NOT chronological.
QA note: DECK2 s-106 contains a manual typo — row numbered "12" that should be "21". Evidence rows are hand-edited; a generator must auto-number.

---

## ARCHETYPE C — Single-credential slide (72 in DECK1, 76 in DECK2)

### C1. Narrative role
One project per slide, story-shaped: what the client needed → what Deloitte did → what came out. Dense enough to prove real involvement, uniform enough to skim 60+ in a row.

### C2. Layout anatomy (EMU-exact, identical on EVERY credential slide in both decks)
- **Left photo panel**: `0,0 → 6840345×6858000` — 56.1% of slide width, full height. Photo is theme/client-matched: KAFD daytime (s-101), Riyadh night skyline (s-105), ministry campus (s-113), medical X-ray for the health-sector credential (s-158), Earth from space (s-163), satellite view of the Gulf (s-168), Washington Monument (s-181). No overlay/scrim on the photo.
- **White header zone** (top-right ~44%): contains breadcrumb title, headline, logos.
  - Breadcrumb title placeholder: `787207,179939 11277600×334099` — text right-aligned so it sits top-right.
  - Headline placeholder: `6970816,598490 5093991×757252`.
  - Saudi-emblem roundel (circular flag badge): `8785966,83558 487486×487486` (0.53" circle).
  - Client logo: `8119068,108911` ≈585145×393022 (0.64×0.43"), placed immediately LEFT of the roundel. Both sit left of the title text.
- **White content card**: `5869459,1440195 6195355×5269523` — right 51% of slide, from 21% to 98% of slide height, **overlapping the photo by ~0.97M EMU (~1.06")**. Fill `bg1` white, thin light border.
- **Two green accent bars** ("Rectangle: Single Corner Rounded", fill `accent3` = **26890D**): each `2969342×69488` EMU (3.25"×0.076"). One flush with the card's TOP-LEFT corner (`5869459,1440195`), one at the BOTTOM-RIGHT (`9095465,6640230`). These diagonal-opposite green slivers are the signature of the credential card.

### C3. Typography (XML-verified on slide105; identical everywhere)
| Element | Font | Size | Weight | Color | Notes |
|---|---|---|---|---|---|
| Breadcrumb `خبراتنا | محلياً` | Sakkal Majalla | 20pt | bold | tx1 (black) | right-aligned, pipe with spaces |
| Headline sentence | Sakkal Majalla | 16pt | regular | tx2 = 53565A gray | right-aligned/justified (kashida stretching visible, e.g. s-168 `لبرنــامج حكــومي رئيســي`) |
| Block headers `السياق:` `المنهجية:` `النتيجة:` | Sakkal Majalla | 16pt | **bold + underline (u="sng")** | **26890D** | colon included, right edge of card |
| Body paragraphs / bullets | Sakkal Majalla | 16pt | regular | black / 575757 | `•` bullets under المنهجية only |
| Confidential tag `سري` box | Sakkal Majalla | 16pt | regular | 53565A on white/light box with thin gray border | box `1411706×430480` at `7218947,83558` |

### C4. Title formula
- Breadcrumb is ALWAYS `خبراتنا | محلياً` or `خبراتنا | عالمياً` — section name + pipe + geography. No pagination, no (1/N) on detail slides.
- The real "title" is the gray **headline sentence**: past-tense verb + ديلويت + deliverable + client. Verified opener catalog (frequency across 72 slides): `دعمت ديلويت …` (most common), `عملت ديلويت على …` / `عملت ديلويت مع <client> على …`, `قامت ديلويت بـ…`, `قادت ديلويت / قادت شركة ديلويت …`, `شاركت ديلويت في …`, `تعاونّا مع …`, `عملنا مع …`, `كلفت شركة ارامكو السعودية ديلويت بـ…` (client-as-subject variant). **Ongoing projects use present tense**: `تعمل ديلويت على …` / `تدعم ديلويت …`. Brand alternates ديلويت / مونيتور ديلويت / شركة مونيتور ديلويت. A few slides drop the verb entirely and use the bare project noun phrase (s-138, s-157/158, s-161, s-162). Confidential clients get the anonymized headline `عملت مونيتور ديلويت كذلك مع هيئات حكومية أخرى في المملكة لتنفيذ التزامات مشابهة أو ذات الصلة` (s-113).

### C5. Body writing pattern — the three fixed blocks (100% consistency, zero variants across all 148 credential slides in both decks)
Exact recurring block headers, always in this order:
1. **`السياق:`** — 1 paragraph, 2–5 lines. Formula: client ambition/problem + why Deloitte was engaged. Recurring stems: `تم تكليف ديلويت بـ…` / `أرادت <الجهة> …` / `كان العميل يسعى للحصول على …` / `طُلب من ديلويت أن …` / `استهدف المشروع/البرنامج …` / `في ضوء ما تشهده … بات من الضروري أن …`.
2. **`المنهجية:`** — 3–6 bullets (`•`), each a verbal-noun phrase (masdar-first, NO full sentences): `تحليل الوضع الراهن وتحديد الفجوات الرئيسية…`, `تطوير خارطة طريق لتنفيذ الأعمال`, `تصميم النموذج التشغيلي`, `بناء دليل استرشادي…`, `نقل المعرفة لفريق…`. Bullets are parallel (all start with masdar: تحليل/تطوير/تصميم/بناء/تقييم/تحديد/إنشاء/تشغيل/تفصيل/قياس/رسم/جمع/توزيع/عقد). No lead-in bold, no colons inside bullets — this differs from body slides elsewhere in the deck.
3. **`النتيجة:`** — 1 paragraph (occasionally 2 bullets). Completed: outcome + approval/impact (`الحصول على موافقة مجلس ادارة الهيئة الملكية على نتائج الدراسة مما مهد الطريق لـ…`). Ongoing: fixed phrase **`المشروع قيد التنفيذ حاليًا ويستهدف …`** (s-103, s-105, s-107).
- **Numbers-first credibility forms** sprinkled into bullets: `تقييم 15+ دراسة حالة لصناديق مشابهة عالميا` (s-107), `80+ عنصر قابل للتخصيص` (s-155), `أكثر من 32 جهة حكومية` (s-113), `ما يزيد عن 450 من أصحاب المصلحة` (s-181), `لمدة 6 سنوات` (s-150). The `N+` form (digit + plus sign) is house style.
- NO meta line (duration/client/sector) — client identity is carried by the logo, geography by the breadcrumb + roundel; dates are almost never given (evergreen credentials).

### C6. Visual grammar / variants
- **Local slide**: Saudi-flag circular roundel + client logo. Client logos in native color on the white header band.
- **Global slide**: country-flag circular roundel (US flag s-181, GCC emblem s-168) or organization logo; photo = country landmark; breadcrumb `خبراتنا | عالمياً`. Everything else identical.
- **Confidential**: logo replaced by a light box with thin gray border containing `سري`; roundel keeps geography (Saudi flag locally, globe glyph internationally, s-163). Giga-project variant: box text `احدى المشاريع الكبرى` (s-158, box `1652484×487486` at `6970816,83558`) — anonymized but classified as "one of the giga-projects".
- No footers, page numbers, source lines, or copyright lines anywhere in the credentials section (both decks) — the appendix runs clean.
- No "غير شامل" tags here (the list is positioned as exhaustive record, not sample).

### C7. Ordering of detail slides
Follows matrix row order with **same-client clustering overrides**: matrix rows 56–57 (أمانة منطقة الرياض projects) are pulled up to sit inside the Riyadh cluster (DECK1 s-105/106, between row 4 and row 5). Sequence DECK1: s-101→r1, 102→r2, 103→r3, 104→r4, 105→r56, 106→r57, 107→r5 … then rows 11–55 and 58–60 in matrix order through s-162. A few detail slides have NO matrix row (bonus depth): s-157/158 (health-sector shared-services center, giga project) and s-159 (innovation strategy). Global always last: DECK1 s-163–172 = rows 66,67,61,62,63,64,65,68,69,70 — roughly KSA-adjacent Gulf first, then Europe. DECK2 inserts its 4 new global credentials (DC s-181, Singapore s-182 mid-sequence; Bosnia s-186, Slovakia s-187 at the end).

---

## DECK1 vs DECK2 DELTAS (template vs project-specific)

**Literally identical (the reusable library):**
- Divider slide (ملحق / خبراتنا المماثلة محلياً وعالمياً) — same.
- All 70 matrix rows 1–70: same clients, same project titles, same order, same flags.
- 72 of 72 DECK1 detail slides re-used **byte-identical** in DECK2 (verified diff), same photos, logos, EMU geometry. The credentials library is a frozen asset; slides are copied whole into each proposal.
- Matrix visual system: KAFD photo, 70% black scrim, white 28pt title, white table text, 618894 header rule, white dashed row separators, 10 rows/page.

**Recomputed per RFP (project-specific):**
1. Title scope clause after `…المتطلبات المماثلة لـ` ← the new RFP's scope keywords; pagination (1/7)→(1/8).
2. **DECK2-only capability columns**: 6 scope streams quoted from the RFP under the `نطاق العمل` brace, with Wingdings checks per credential. DECK1 had a plain 4-column list — the checkmark matrix is the EVOLVED form and should be the default for new proposals.
3. Library extensions: 4 new global credentials added (Bosnia, Slovakia, Washington DC, Singapore — all economic-development/performance themed, matching DECK2's performance-measurement RFP), each getting a matrix row AND a new detail slide built on the same template.
4. Column widths re-balanced to fit 10 columns (جهة 5204194→2779184 EMU).

---

## RECONSTRUCTION RECIPE — credentials appendix for a NEW RFP

Inputs: (a) parsed RFP scope/evaluation criteria; (b) credentials reference library (each entry: client, country, project title as masdar phrase, السياق/المنهجية/النتيجة text, client logo, theme photo, confidential flag, theme tags).

**Step 1 — Shortlist.** Tag every library credential with capability themes. Select ALL local credentials (the house style shows breadth: 60+), plus 10–14 global. If the RFP sector is thin in the library, add new credentials (as DECK2 did with 4 economic-development ones) — write them in the identical 3-block format.

**Step 2 — Build the scope-column set.** Extract 5–6 requirement streams VERBATIM from the RFP's نطاق العمل (e.g. تطوير الخطط التشغيلية، تحسين الإجراءات…) + 1 sector-relevance column (القطاع البلدي → rename to the new RFP's sector). These become checkmark columns under a `نطاق العمل` brace (rightBrace shape rot 270°, accent1 86BC25, label 12pt).

**Step 3 — Order.** Client-family credentials first (the entity issuing the RFP and its siblings), then national entities clustered by theme, then giga-projects/ministries, local ALWAYS before global; global ordered Gulf → wider world. Number 1…N continuously; auto-number (avoid DECK2's "12/21" typo).

**Step 4 — Render matrix pages.** 10 rows per page, N pages, title `لدينا سجل حافل في تسليم المشاريع ذات المتطلبات المماثلة لـ<scope clause> (i/N)` 28pt white Sakkal Majalla on KAFD night photo + 70%-alpha black rectangle; rtl table, col widths ≈ #0.34" | flag 0.78" | جهة 3.04" | مشروع 2.65" | 6×1.00"; header 16pt bold white with 1pt solid 618894 bottom rule; body 12–13pt bold white; 0.75pt white dashed row rules; flags 0.43×0.31" floated in البلد; checks = Wingdings U+F0FC 24pt white. Check generously on capabilities (a credential earns a check if any workstream touched the theme) but strictly on the sector column. Every row must earn ≥1 check — if it can't, drop the row.

**Step 5 — Render one detail slide per credential** from library records (never re-write existing ones): left photo 56% full-bleed (theme-matched, no scrim); white card `5869459,1440195 6195355×5269523` with 26890D bars (3.25×0.076") top-left + bottom-right; breadcrumb `خبراتنا | محلياً/عالمياً` 20pt bold black; headline 16pt 53565A gray = verb+ديلويت+deliverable+client (present tense if ongoing); blocks `السياق:` / `المنهجية:` / `النتيجة:` 16pt bold underlined 26890D, body 16pt; المنهجية = 3–6 parallel masdar bullets; roundel 0.53" circle (Saudi flag locally / country flag globally) + client logo 0.64×0.43" to its left; confidential → `سري` gray-bordered box, giga-project → `احدى المشاريع الكبرى`.

**Step 6 — Quality bar** (what makes it consultant-made): every geometry constant reused to the EMU across all ~80 slides; zero variation in block headers; bullets grammatically parallel; at least a few `N+` quantified claims per 10 slides; theme-matched photography (an X-ray for a health credential, a monument for DC); checkmark counts that a skeptical evaluator can add up; and NOTHING else on the slide — no footers, no sources, one project per slide.
