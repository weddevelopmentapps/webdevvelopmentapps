# Domain adaptation — deriving the platform from any domain

The methodology is domain-agnostic because every executive domain has the same skeleton:
a **governing framework** (what good looks like), **work objects** flowing through
**staged lifecycles with gates**, **measures** rolling up to a **grade or outcome**, and
**governance** (owners, committees, escalations, reports to an external authority). Find
those five things in the new domain and the module list writes itself.

## The universal module skeleton

| # | Module | Universal content |
|---|---|---|
| 1 | Home | Hero grade/outcome + journey meter + alerts + executive summary + cycle countdown |
| 2 | Framework readiness | The domain's maturity/assessment model: dimensions → criteria, dual-mode scoring (self vs independent), evidence register, gap-to-target |
| 3 | Work objects | The core lifecycle (kanban + register + record drawer + gates + add/edit) |
| 4 | Value/outcomes | The benefit ledger (financial or non-financial) with validation states |
| 5 | Intake/requests | Whatever enters the system, with completeness rules + review chain |
| 6 | Methods library | The domain's methodologies/templates with status |
| 7 | Catalog | The inventory the domain manages (services, projects, strategies, assets) |
| 8 | Analysis | The domain's analytical registers (reviews, studies, assessments) |
| 9 | KPIs | The framework's indicator set, grouped as the framework groups them, official formulas shown |
| 10 | Governance | Org model, owners matrix, committees + decision log, escalation ladder, policy register |
| 11 | Capability & change | Training, awareness/adoption measurement, succession, incentives |
| 12 | Reports | Live generated: periodic + annual + framework submission pack |

Drop or merge modules the domain doesn't need; never pad. Map every module to a line in
the source document (RFP deliverable, framework chapter) — the compliance auditor will
check this mapping.

## Worked example — PMO (مكتب إدارة المشاريع)

- Framework: the entity's project-management manual / national PM guide; maturity via P3M3
  or the local PMO-maturity index. Grade pursued: maturity level or portfolio health.
- Work objects: projects & programs. Lifecycle: بوابات المراحل (تصور → دراسة الجدوى →
  اعتماد → تنفيذ → إغلاق → تحقق المنافع) with gate criteria per stage (business case
  complete, funding approved, PIR done).
- Value: benefits register (تحقق المنافع) — planned/realized benefits with owners distinct
  from project managers.
- Intake: مقترحات المشاريع with completeness rules (دراسة جدوى، ارتباط استراتيجي، تقدير كلفة).
- KPIs: CPI/SPI (القيمة المكتسبة), نسبة المشاريع المتعثرة, انحراف التكلفة عند الإكمال,
  معدل طلبات التغيير, الالتزام ببوابات المراحل.
- Governance: لجنة المحفظة (ربع سنوية، اعتماد وإيقاف المشاريع), مكتب إدارة المشاريع كنقطة
  تواصل, مصفوفة ملاك البرامج.
- Signature hero: portfolio health meter (مؤشر صحة المحفظة) or maturity journey to the
  target level.

## Worked example — SMO (مكتب إدارة الاستراتيجية)

- Framework: the strategy execution model (balanced scorecard or national planning
  framework); grade = نسبة تحقق الأهداف الاستراتيجية / منسوب الإنجاز.
- Work objects: الأهداف الاستراتيجية ← المبادرات ← معالم التنفيذ; lifecycle: تصميم →
  اعتماد → تنفيذ → قياس الأثر → إغلاق, gated by ربط كل مبادرة بهدف ومؤشر.
- Value: تحقق المستهدفات (KPI actuals vs targets rolled up hierarchically: مؤشر ← هدف ←
  ركيزة استراتيجية ← الرؤية).
- Intake: مقترحات المبادرات مع اشتراط الارتباط الاستراتيجي وتقدير الأثر.
- Analysis: مراجعات الأداء الدورية (فصلية) مع قرارات التصحيح.
- Governance: لجنة تنفيذ الاستراتيجية, تقارير الجهة المشرفة (مركز أداء / الجهة الوطنية).
- Signature hero: strategy realization meter with per-pillar radar.

## Seeded-data rules (any domain)

1. Realistic scale — research the entity's actual budget/portfolio magnitudes.
2. Real program/initiative names with official honorific forms, verified via research.
3. Role titles instead of invented people; anonymized third parties («جهة تعليمية»).
4. Internal consistency is asserted, not hoped for (generate_data.py assertions).
5. A believable narrative arc: a previous cycle score, current improvement, a credible
   gap to target — not everything green (all-green reads as fake; all-red reads as broken;
   the design bar is ~half within target, most of the rest near).
6. A few honest problem records (delayed/stalled items with notes and escalations) —
   they make the governance features demonstrable and the data credible.
7. Demo-data chip in the header + README replacement instructions.

## Language

For Arabic-first domains, extract the official vocabulary FROM the domain's own documents
during research and use it verbatim (see arabic-language.md). For English or bilingual
platforms the same discipline applies with the domain's English terms of art.
