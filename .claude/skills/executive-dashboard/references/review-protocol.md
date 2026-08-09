# Review protocol — the multi-agent board

The single highest-leverage practice in the methodology. Independent reviewers with
different lenses found: a wrong-region term in seeded data, a stripped royal program name,
a finance gate bypassable through the edit modal, print bleeding the whole app into
reports, mobile overflow on the two most important tabs, and five different meanings
assigned to the accent gold. None of these were visible to the builder. Budget for the
board; it is the difference between demo and deliverable.

## When

1. **Board of four** — after the platform is functionally complete.
2. **Design director** — after the visual system is final (separate pass, one agent).
3. **Arabic editor** — last, after all copy is stable (see arabic-language.md §4).

Fix everything critical/major between passes; re-verify with the QA script after fixes.

## Findings schema (require structured output)

```json
{ "verdict": "one paragraph", "score": 7.5,
  "findings": [{ "severity": "critical|major|minor|polish",
                 "title": "…", "detail": "what & where exactly", "fix": "concrete action" }] }
```

Severity contract: critical = would embarrass the client in a handout / broken behavior;
major = clearly hurts quality or compliance; minor = noticeable; polish = nice-to-have.
Tell reviewers: findings must be actionable, compliments are not findings, and an area
that passes gets no invented findings.

## The four reviewers (prompt skeletons — adapt domain specifics)

**1. Domain-executive critic (the star).** "You impersonate the CEO/المسؤول الأول of
<entity> in an internal red-team exercise. You know <entity's real portfolio, programs
with official names, governance bodies, political stakes>. You are demanding, allergic to
fluff, and you sign what goes to <the assessing authority>. Review the screenshots and
the seeded data: Is this credible for MY organization? Are programs, numbers, and
terminology right? Does it reflect how I actually govern? What would embarrass us in
front of <assessor>? What is missing that <the RFP/framework> promised?" Give it the
research notes and the source documents. Its unique value: credibility and
domain-truth findings no generic reviewer makes.

**2. UI/UX expert.** Reviews SCREENSHOTS (full-page desktop of every tab + drawers +
modals + mobile), not code — code reviews miss what the eye catches (clipped labels,
bidi-mirrored ≤/≥ flipping meaning, legend colors that don't match series, steppers
scrolled away from the current step). Ask for: hierarchy, typographic rhythm, bidi/RTL
correctness everywhere, color discipline, chart legibility, spacing, mobile usability.

**3. Compliance auditor.** Gets the source documents (RFP scope lists, the domain
framework, official formulas) + the code + data. Task: map EVERY requirement to where the
platform covers it, verify formulas and official terminology, and list gaps with exact
locations. This is where "four promised capabilities are absent" surfaces.

**4. QA engineer.** Writes and runs Playwright against the BUILT index.html: console/page
errors on every tab, drawer, and modal; edit flows recompute roll-ups and survive reload;
reset restores seed (handle the confirm dialog); every workflow gate through EVERY path
(drawer buttons AND modal dropdowns AND direct state edits); export/import round-trip;
print emulation screenshot; rapid tab switching (chart dispose errors); resize; hash
deep-links. Require reproduction steps per failure.

Run the four in parallel (they're independent); collect structured findings; fix; re-run
the QA gates.

## Design-director pass

One agent, fresh screenshots, explicit bar: "Would a $10M design engagement ship this?
Does anything still look template/AI-generated?" Constrain to fixes achievable via
CSS/markup within an hour each, max ~12, ranked by visual impact — this forces
prioritized, concrete output instead of a redesign essay. Feed it the design-language
checklist as its lens.

## Applying corrections at scale

For string-level corrections (editorial passes), require byte-exact `old` strings and
apply with literal replacement in a script that reports misses — then INSPECT the misses;
they're usually overlapping replacements (one fix contained inside another's target — a
substring collision once turned «لا يدخل» into corrupted text). After every applied
batch: regenerate data, rebuild, parse-check JS, and run the QA scan.
