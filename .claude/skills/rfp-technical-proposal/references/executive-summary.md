# Section Playbook — الملخص التنفيذي (Executive Summary)

A fixed two-beat rhetorical unit on "hero" slides (full-bleed dark photo, no footer, no
chrome): **Slide A «ندرك أهمية…» = we understand you** → **Slide B «وسنعمل على دعم…» = we
will deliver**. Slide B's opening «و» deliberately chains the pair. Preceded by the
`الملخص التنفيذي` divider.

## Hero canvas (shared by both slides)

- Full-bleed dusk/night photo of the client's city financial district (reference decks:
  the KAFD skyline image, identical file in both decks — a fixed template asset). Photo
  must be dark enough for white 20pt text; if not, add a 40–55% black overlay.
- Use the **same photo file on both slides** — continuity is intentional.
- No footer, page number, source line, or copyright on these two slides.
- Title placeholder (0.55", 0.36"), 12.24" × 0.86", right-aligned RTL, Sakkal Majalla
  28pt, two runs: plain white stem + **bold green payload**.
- **The green**: not a raw hex — `schemeClr accent4` (046A38) + `lumMod 60000` +
  `lumOff 40000` ("accent4, Lighter 40%"), rendering as the vivid bright green. Use the
  schemeClr formula so theme recolors keep working. Green is used ONLY for: title payload
  span, column/section lead sentences, numbered-circle outlines.

## Slide A — «ندرك أهمية مشروع …»

**Title**: `ندرك أهمية ` (plain white, exactly these two words) + bold-green `مشروع {اسم
المشروع الرسمي كاملاً}`. Single clean assertion — no pagination, no breadcrumb.

**Layout**: two symmetric prose columns, each 6.05" wide starting y=1.40", gutter 0.34"
(right col x=6.84", left col x=0.45"). Pure typography — no icons, shapes, or logos.
~90–110 Arabic words per column. Paragraphs: lnSpc 100%, 12pt space-after, **no bullets
anywhere — flowing prose**.

**RIGHT column (read first in RTL) — the CLIENT/CITY story** (from client research, not
the RFP; reusable verbatim for repeat clients):
1. Green bold **24pt** lead — assertion of the client's pivotal role:
   `تلعب {الجهة} دورا محوريا في {التنمية الشاملة والمستدامة}…والتي تعد الاسرع نموا وتحولا في العالم`
2. White **20pt** ¶ — historic growth/transformation with one hard fact
   (`شهدت {المدينة} في العقود الماضية واحدة من أسرع حركات النمو الحضري في العالم، مدفوعة بـ…`)
3. White 20pt ¶ — heritage + ambition with a rank-style stat
   (`…بالاضافة لسعيها لأن تكون من بين أفضل 10 مدن في العالم`)
4. White 20pt ¶ — the client's unique mandate among many players
   (`يوجد حاليا العديد من الجهات التي تعمل في {المدينة}، ولكن تشكل {الجهة} العامود الاساسي في…`)
Rhythm: past → present/ambition → client's role. Each ¶ = one long sentence (35–45
words) of comma-chained parallel clauses.

**LEFT column — the PROJECT story** (fully recomputed from the RFP):
1. Green bold 24pt lead — the objective sentence:
   `يهدف مشروع {الاسم} إلى {سلسلة مصادر: توفير…/بناء…/تعزيز…}` — the title's green
   project name repeated as subject (title asserts *importance*, lead asserts *aim*).
2. White 20pt ¶ — contribution / why-now: opens `يسهم المشروع في…` or
   `ويأتي استجابةً للحاجة المتزايدة إلى…`, ends with an alignment clause
   (`بما ينسجم مع أولويات… والتوجهات الاستراتيجية طويلة المدى`).
3. White 20pt ¶ — scope fusion: opens `ويركز المشروع على…`, then **compresses ALL the
   RFP's scope bullets into one long sentence of parallel verbal nouns joined by و**,
   closing with a `بما يضمن {استدامة الأثر}…` coda. Never bullet the objectives; never
   quote RFP sentences verbatim — re-verb them with the fixed battery
   {يهدف، يسهم، يركز} + {تعزيز، رفع كفاءة، دعم صناعة القرار، جاهزية، استدامة، نقل المعرفة}.

Quality bar: both green leads start at the same y; columns bottom-align within ~0.3";
every paragraph is one grammatical sentence; zero Latin words.

## Slide B — «وسنعمل على دعم … على أكمل وجه»

**Title** (fixed sentence, reuse verbatim, swap client short-name):
`وسنعمل على دعم {الأمانة/الجهة} بالخدمات التي تحتاجها ` + bold-green
`لتنفيذ المشروع على أكمل وجه`. The highlight lands on the *commitment clause*.

**Three-zone anatomy**:

### RIGHT zone — the approach preview (read first)
- Header `النهج الذي سنتّبعه` 18pt bold white at ≈(6.67", 1.08").
- Fixed intro ¶ 14pt white (reuse verbatim):
  `لقد اقترحنا هذا النهج المحدّد للمشروع والفريق المخصّص لتنفيذه، بناءً على فهمنا لأهداف
  {الجهة} وبناءً على ما هو متوقّع منّا من حيث النتائج والمخرجات. ينطوي النهج الذي نقترحه
  على مراحل العمل الآتية:` — note the doubled `بناءً على… وبناءً على…` rhythm + colon handoff.
- Tracks textbox ≈ (5.76", 2.0"–2.3") 7.0" × 4.7": ONE paragraph per track = bold lead +
  soft line-break (`<a:br/>`, not a new paragraph) + one-sentence description (15–25
  words, verb-noun opener: إعداد/تمكين/ضمان/تحليل/تطوير). 8pt space before AND after.
  - Workstream flavor: `مسار الإطلاق` then `مسار العمل الأول: {الاسم}` (ordinal WORDS).
  - Phase flavor: `المرحلة 0: الاطلاق` … `المرحلة 6: نقل المعرفة` (ordinal DIGITS).
  - Font 16pt for ≤5 items, step down to 14pt for 6–7 — **capacity is absorbed by
    shrinking body text, never the title/headers/circles**.
  - Track names MUST match the approach chapter word-for-word.
- **Numbered-circle rail** hugging the right edge (x≈12.76"): one 0.42" outline-only
  circle per track — 1.5pt stroke in accent4-Lighter-40% green, noFill, digit 24pt bold
  white, **starting at 0** (launch). Each circle vertically centered on its track's lead
  line (uneven spacing when track lengths differ is CORRECT — don't force even pitch).

### LEFT zone — credibility
- Header `فريق العمل الذي نخصّصه للمشروع` 18pt bold white.
- Monitor Deloitte white wordmark (~1.16" × 0.47") + the FIXED firm blurb, 18pt, bold
  lead-in: `لمحة عن مونيتور ديلويت: مونيتور ديلويت هي الذراع الاستراتيجي لديلويت، والتي
  تعتبر أكبر شركة للخدمات المهنية حول العالم. وبفضل أكثر من 170 عامًا من الإرث…` (verbatim).
- **Experts ghost card** (~4.64" × 2.5", noFill, 1.5pt light-gray border bg1@85%,
  slightly rounded): label `خبراء المشروع` 14pt bold white top-right; **`غير شامل` tag**
  overlapping the top-left corner (single-corner-rounded rect, teal→blue gradient
  0097A9→007CB0@lum50, white 14pt); stat `200+` (200 at 36pt, + at 24pt, white) + a
  domain-tuned descriptor 12–14pt (`خبير معني بالقطاعات المطلوبة في {مجالات هذا العطاء}
  او المجالات الداعمة الممكنة لنجاح المشروع`).
- Expert photo strip: 5 headshots 0.45", pitch ≈0.9", name 11pt bold white below, role
  9pt white (`خبير في {التخصص}`). Regional CEO first (rightmost); **swap exactly one
  slot** to a domain expert matching this RFP; keep the other 4 as the standard bench.
- Partner-logo row (white/knockout logos + tiny 8pt sub-brand labels) ONLY when the bid
  includes subcontractors/alliances.

## Template vs recomputed (audit checklist)

| Fixed template (reuse verbatim) | Recomputed per RFP |
|---|---|
| Both title stems; hero photo; all geometry | Green project name (title A) |
| Right column of slide A (same client) | Left column of slide A (objectives/scope fusion) |
| Approach intro ¶; firm blurb; `200+` card; `غير شامل` tag | Track count, names, descriptions, flavor |
| 4 of 5 expert strip; circle styling | 1 expert swap; descriptor domain clause |
| — | Partner logos present/absent |
