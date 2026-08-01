# Section Playbook — النهج الذي سنتّبعه (Our Approach)

The technical heart (~15–18 slides): converts the RFP scope + bill-of-quantities into
(1) a one-slide execution model, (2) a BoQ→deliverables contract table, (3) per-track
detailed methodology series, (4) the reusable governance/knowledge-transfer library.
Titles in this section are **white on the header band with NO green highlight**.
Slide budget: 1 overview + 1 BoQ (+1 optional upsell) + 1 launch methodology + 3–4
launch library + Σ per track ⌈activity_lines/20⌉ pages + 2 KT slides.

## 0. The delivery model: think in PHASES, not in the RFP's track list

**Doctrine (client feedback, binding): never structure the approach as the RFP's
scope items presented one-by-one.** An RFP that enumerates 9 tracks/مسارات is giving
you the CONTRACT decomposition, not the DELIVERY logic. A consultant re-derives the
delivery logic as a small set of phases — the classic arc is some variant of
**Assess → Strategize/Design → Implement/Enable → Monitor & Sustain** (plus a
mobilization phase 0 and continuous management bands). Design the phases first,
then map every RFP track INTO them:

- المرحلة صفر — الإطلاق والتعبئة (always; house spelling `الاطلاق` for the tab).
- Assess-type phase (الفهم والتقييم): current state, needs, capabilities, gaps.
- Strategize & Design (الاستراتيجية والتصميم): value propositions, catalogs, SLAs,
  org changes, governance models — the thinking deliverables.
- Implement & Enable (التنفيذ والتمكين): programs, roadmaps, PMO, platforms — the
  build deliverables. May overlap Design; phases run in parallel, not as a relay.
- Monitor & Sustain (قياس الأداء والاستدامة): continuous — periodic reporting,
  change management, knowledge transfer. Can merge with Implement when thin.

Rules of the mapping:
- A phase page carries sub-phases numbered `n.1, n.2…` (`المرحلة الفرعية n.m`);
  each sub-phase's activities are the RFP's مهام **verbatim** — compliance is
  preserved at the activity level, not the pagination level.
- One phase may span 2 pages (`(1/2)(2/2)`) when it holds 3+ RFP tracks; one RFP
  track may deserve its own sub-phase page (e.g. a digital platform).
- Every phase page's sidebar ends with `مسارات الكراسة المرتبطة: …` naming the RFP
  tracks it covers — the compliance bridge the evaluator can check.
- Add a phase↔track mapping slide in the overview (each phase column lists its RFP
  tracks + their BoQ deliverables with delivery months) so full coverage of the
  الكراسة is visible on one page.
- The timeline/Gantt mirrors the SAME phase structure (see team-and-timeline.md).
- Always include a knowledge-transfer stream (inside Monitor & Sustain).
- Phase names ≤4 words; tab labels `{N}. {الاسم}`؛ sub-phase lines in the RFP's own
  vocabulary.

**The consistency chain (the quality signature):** the phase model is ONE story told
everywhere — the executive summary's delivery-model slide, the hero's scope prose,
the PoV pivot's solution areas, the approach overview, the ribbon tabs, the
breadcrumb titles, and the Gantt swimlanes ALL use the same phase names in the same
order. Additionally: ribbon tab names = overview column headers = breadcrumb titles;
BoQ deliverable strings = methodology sidebar bullets = mapping-slide chips. After
any restructuring of the approach, grep the whole bespoke range (cover→timeline)
for the OLD structure's vocabulary (e.g. «مسار العمل») — the executive summary is
the easiest slide to forget and the first one the client reads. Break this chain
and the deck stops looking consultant-made.

## 1. The navigation ribbon (on EVERY approach slide except the 2 KT slides)

One tab per track, laid RTL (track 0 at far right):
- Shape: `homePlate` chevron (point leading leftward, flipH), height 0.30–0.41" at
  y≈1.6" (directly under the header band).
- Label: `{N}. {اسم المسار}` — Western numeral + period; Sakkal Majalla white,
  **14pt for ≤5 tabs, 11pt for 6–7 tabs**; launch tab 1.15" wide, content tabs ~2.0–2.9"
  (width ∝ label length), ~0.105" gaps. Overflow solution for many phases: a
  second full-width chevron band row (deck 2's phase 6).
- **ACTIVE tab fill = the header-band gradient itself** (`056946` 85% @18% → `88AEF1`
  60% @100%, linear ang=8100000/135°). **INACTIVE = solid `F2F2F2` with text left
  white** → ghosted, barely legible on purpose.
- Overview slide: ALL tabs active. Methodology slides: exactly one active ("you are
  here"). The active tab must always agree with the breadcrumb title.

## 2. Approach overview slides (archetype J) — NEVER bare lists

**Doctrine (client feedback, binding): an overview column is a miniature methodology,
not a table of contents.** A column that lists sub-phases as bare one-line items with
empty space beneath reads as unfinished. The mandatory column anatomy, top to bottom:

1. Phase chip (the ribbon tab, active) — `المرحلة {الترتيب}` + name, 2 lines.
2. Months line — `الأشهر X–Y` (or `مستمرة طوال المشروع`), ~11pt bold gray `53565A`.
3. For EVERY sub-phase: heading `n.m {الاسم}` — ~10.5pt **bold teal `0D8390`**,
   no bullet — followed by **1–3 scope bullets** (~9.5pt black, Arial `•`, hanging
   indent). Each bullet is a FULL, descriptive verb-first masdar clause lifted from
   the RFP scope — «إجراء مقابلات وورش عمل مع المشاريع الكبرى لفهم احتياجاتها
   التشغيلية وأولوياتها»، «حصر وتصنيف مقدمي الخدمات داخل المنطقة وخارجها» — NEVER a
   noun fragment («مسارات تطوير ومعايير تأهيل» is wrong; «تصنيف الموردين حسب النضج
   وتصميم مسارات التطوير ومعايير التأهيل والحوافز» is right). Together the bullets
   must be INCLUSIVE of everything the sub-phase's detailed methodology page does:
   the overview is the detailed approach compressed, not a different list. Write
   them by summarizing the detailed page's activity lines, then verify nothing
   material on the detailed page is unrepresented.
4. Payoff line — the phase's contractual deliverable(s) + month, ~10pt **bold green
   `046A38`** (e.g. `تقرير تقييم الوضع الراهن — الشهر 3`, `5 مخرجات تعاقدية —
   الأشهر 5–14`).

Title (exact template): `سيتم تنفيذ المشروع عبر {N} {مسارات|مراحل}...` or the
assertion form `سنقود المشروع عبر أربع مراحل متكاملة تغطي مسارات العمل التسعة خلال
{X} شهرًا`.

A SECOND overview slide carries the phase↔RFP-track mapping with the same density
rule — per track, a three-line block: track name (bold black bullet) → one scope
line (~9.5pt gray) → deliverable + month (bold teal). Continuous-management bands
(light `F2F2F2` flipH pentagons, full width) sit beneath the columns on both slides.

Launch column boilerplate: `0.1 إطلاق المشروع` → team/charter/stakeholder bullets؛
`0.2 تحديد الطموح` → ورشة الموائمة على الأهداف ومعايير النجاح.
Quality bar: columns filled to ~90% of their height (ragged bottoms are human, dead
half-columns are not); zero orphan words; every sub-phase visible with scope.

## 3. BoQ deliverables table

Title: `بناء على جدول الكميات، تم تفصيل المخرجات الرئيسية للنهج الذي سنتّبعه لكل
{مسار|مرحلة}` (note the شدّة in سنتّبعه — echoes the section name).

Table (one slide; logical column 1 = rightmost):
- Columns: `المسار` (3.4") | `المخرج` (7.2") | `وحدة القياس` (1.4") | `الكمية` (0.75").
  Optionally add `الرقم التسلسلي` and rename `المخرج`→`البند` to mirror the RFP's own
  BoQ headers — always adopt the RFP's terminology.
- Header row: no fill, 15pt bold `53565A`, centered, with a 1pt teal `0D8390` rule
  beneath.
- Body rows: white, 16pt black; deliverables right-aligned; units/quantities centered;
  1pt light-gray separators. Units are only ever `دراسة` or `تقرير`.
- Track column: cells **merged per track** and filled with the signature horizontal
  3-stop gradient `056946` 85% → `498D9E` → `6596ED` 60%, text 18pt bold white.
- Transcribe the RFP BoQ verbatim — never invent quantities. Reuse these exact
  deliverable strings in every methodology sidebar.

**Optional upsell slide** (include when differentiating on volume): title `ونقترح هذه
الكمية من المخرجات بنفس عدد فريق العمل والذي لا يؤثر على تكلفة المشروع` — same table
plus columns `الكمية حسب جدول الكميات` | `الكمية المقترحة` | `الزيادة` (`+5`, `+3` on
2–4 selected lines; leave the biggest anchors untouched so the gesture looks
considered).

## 4. Detailed methodology pages (archetype K — where evaluators score the bid)

**Title grammar** (fixed stem + ` | ` breadcrumbs + ` – ` before names):
- `منهجية المشروع التفصيلية | المسار الأول – {الاسم} (1/3)` (ordinals in words;
  deck 2 uses `المرحلة صفر` for 0)
- Launch library adds a third crumb: `… | الاطلاق | آلية ادارة المشروع`
- `(k/N)` in Western digits ONLY when a sub-track spans multiple slides (no `(1/1)`).

**Geometry** (identical every page): ribbon with one active tab; bordered white
content container (0.08", 2.21", 13.18" × 4.86"); deliverables panel on the LEFT edge
(2.28" wide, fill `F2F2F2`); activities area ~82% of width.

**Typography**:
| Element | Spec |
|---|---|
| `الأنشطة:` header | 16pt **bold italic** black, first line of activities box |
| Sub-track header `المسار الفرعي 1.1 | {الاسم}` | 16pt **bold teal `0D8390`**; pipe separator; launch says `المرحلة الفرعية 0.1 | إطلاق المشروع` in both models |
| L1 activity bullets | 14pt black, Arial `•`, 0.19" hanging indent |
| L2 sub-activity bullets | 14pt black, `o` bullet, deep 0.6" indent (the visible two-level rhythm) |
| `المخرجات والنتائج:` panel header | 16pt **bold italic** black |
| Panel bullets | 16pt black `•` |

**Content formula**:
- L1 = the RFP scope sentence (masdar-first; may end `من خلال:` to introduce subs).
- L2 = the consultant decomposition: 3–6 concrete steps per L1, 5–14 words each,
  strictly parallel masdar structure (عقد، تحليل، تحويل، تحديد، صياغة…) — generated
  from method knowledge (interviews, document review, benchmarks, workshops, drafting,
  validation cycles) flavored with RFP vocabulary.
- Load: 2–4 L1 groups, 12–20 body lines per slide; continuation pages repeat the same
  sub-track header; a light final page is acceptable — never re-flow to hide it.
- Element-count pattern where apt: `…من خلال تفصيل العناصر الـ10 التالية:` + bold
  lead-in + colon bullets (أصحاب المصلحة: …، الخدمات: …).
- EN technical terms inline untranslated for credibility: `Power BI أو Tableau`,
  `(UX/UI)`, `SWOT`, `Project Shadowing`, `(Predictive Analytics)`.
- **Deliverables panel = that track's BoQ strings verbatim, repeated on every page of
  the run**; launch and KT pages carry `لا ينطبق`.

## 5. Launch-phase governance library (near-verbatim reusable; tag `شكل توضيحي`)

These carry a **`شكل توضيحي` tag** — white ~14pt underlined text at top-left over the
photo band (this is the approach-section variant of the illustrative tag; the teal-box
`للتوضيح` belongs to PoV/frameworks slides).

1. **`… | الاطلاق | آلية ادارة المشروع`** — right: `دورة حياة المشروع` 5-segment
   colored cycle (الإطلاق `86BC25` → التخطيط `00ABAB` → التنفيذ `0D8390` → المراقبة
   والتحكم `007CB0` → الإغلاق `556478`); left: `إطار عمل إدارة المشاريع` 8 mint-pill
   (`6FC2B4`) rows with white description cards.
2. **`… | الاطلاق | إدارة المخاطر والتحديات`** — 6-column card grid (التخطيط، إدارة
   المخاطر، إدارة التحديات، التحكم في التغيير، إدارة التواصل، متابعة التقدم وإعداد
   التقارير): gray icon chip → teal header bar → description → teal triangle arrow →
   fanned tool screenshots. **Fossil warning: grep the library text for
   الوزارة/الأمانة/الجهة and normalize to the new client** (the reference decks carry a
   `الوزارة` leftover).
3. **`… | الاطلاق | خطة إدارة الجودة والمخرجات`** — two thin teal band headers with
   green check circles: `دورة الموافقة على المخرجات` (numbered 1–7 process incl. the
   2-day Deloitte turnaround SLA) and `المخرجات` (4 chevrons: internal review → client
   review → QA-partner review → client sign-off, captions italic gray). Include when
   the RFP scores quality management.
4. **`… | الاطلاق | خطة إدارة التصعيد`** — 3-row escalation table: header row teal
   `0D8390` white 24pt bold (`المستوى` | `وصف مستوى التصعيد` | `معايير`); fixed house
   SLAs — level 1 escalates after **3 أيام**, level 2 after **5 أيام** to project
   leadership incl. `راعي المشروع`; swap only the client word.

## 6. Knowledge-transfer pair (the ONLY approach slides without the ribbon)

Re-parented per proposal via breadcrumb only (`… | المسار الثالث – التمكين المؤسسي |
العمل التشاركي مع الأمانة` vs `… | المرحلة السادسة – نقل المعرفة | …`):

1. **العمل التشاركي مع {الجهة}** — bordered full-width bold-italic banner
   (`كجزء من إلتزامنا لنقل المعرفة…`); left: collage of 5 REAL workshop photos;
   right: teal `خطة نقل المعرفة` header card + 3 white cards (bold title + one-line
   explainer): `تنفيذ الارشاد المهني Project Shadowing` / `المشاركة الفعلية في
   الأنشطة اليومية` / `ورش عمل وجلسات نقاش وجلسات مركزة`.
2. **منهجية نقل المعرفة** — the handover wedge diagram: center stacked track boxes
   feeding `استدامة أعمال مسارات المشروع`; below, a ramp where the client-team teal
   band grows 0%→100% while the Deloitte green wedge shrinks (axis `الموارد المتاحة`);
   right legend panels; bottom 4 numbered focus areas (١ التأهيل، ٢ التدريب،
   ٣ التنفيذ، ٤ الإشراف والتوجيه) with descriptions. Recompute ONLY the track-name
   boxes (one per track, no duplicates) + client logo/name.

## 7. Pre-QA consistency checklist

- Track names character-identical across: exec summary slide B, PoV pivot, overview
  columns, ribbon tabs, breadcrumbs, BoQ merged cells, Gantt bands.
- Deliverable strings identical across: BoQ table, methodology sidebars, Gantt markers.
- Durations identical across: overview title, Gantt title, exec summary.
- `X.Y` numbering continuous; pagination `(k/N)` counts match actual pages.
- Library text normalized to this client (no الوزارة fossils); typos fixed
  (`على على`, `تحيبة`) — the house tolerates them, the generator shouldn't.
