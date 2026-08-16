-- ═══════════════════════════════════════════════════════════════════════════
-- 0001_schema.sql — الأساس البنيوي لمنصة العرض التنفيذي (السكن الجماعي — الرياض)
-- ═══════════════════════════════════════════════════════════════════════════
-- المرجع المعماري: docs/ARCHITECTURE.md §5 و§7، والنموذج المُحاكى في
-- src/js/data/store.js — عقيدة النموذج:
--   • إصدار منشور واحد غير قابل للتغيير يقرؤه المقدِّم (لا خلط بين إصدارين).
--   • المسودات منفصلة كلياً وتحمل أساساً متوقعاً (base_release_id) ونسخة تحرير
--     (draft_version) لرفض تعارضات التحرير الصامتة.
--   • سجل تدقيق ملحق فقط (append-only) — لا تعديل ولا حذف أبداً.
--   • لا كتابة مباشرة على جداول النشر: الكتابة عبر دوال security definer فقط
--     (انظر 0002_rls.sql و0003_publish_fn.sql).
-- الصياغة: Postgres 15 / Supabase — أسماء إنجليزية وتعليقات عربية.
-- ═══════════════════════════════════════════════════════════════════════════

-- pgcrypto: تلزم لدالة digest() المستخدمة في حساب بصمة sha256 داخل دالة النشر.
-- تُثبَّت في مخطط extensions وفق عرف Supabase، وتُستدعى مؤهَّلة بالكامل
-- (extensions.digest) لأن دوالنا تثبّت search_path على public, pg_temp.
create extension if not exists pgcrypto with schema extensions;

-- ───────────────────────────────────────────────────────────────────────────
-- 1) user_roles — دور واحد لكل مستخدم
-- ───────────────────────────────────────────────────────────────────────────
create table public.user_roles (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  role       text not null check (role in ('viewer', 'editor', 'publisher', 'admin')),
  granted_by uuid references auth.users (id),
  granted_at timestamptz not null default now()
);

comment on table public.user_roles is
  'دور تطبيقي واحد لكل مستخدم: viewer (قراءة المنشور فقط)، editor (تحرير المسودات)، publisher (النشر عبر الدالة الموثوقة)، admin (إدارة الأدوار). أول admin يُنشأ عبر SQL مباشرة — انظر supabase/README.md.';
comment on column public.user_roles.granted_by is 'من منح هذا الدور (للمساءلة).';

-- ───────────────────────────────────────────────────────────────────────────
-- 2) presentation_releases — الإصدارات المنشورة (تاريخ غير قابل للتغيير)
-- ───────────────────────────────────────────────────────────────────────────
create table public.presentation_releases (
  id              text primary key,
  payload         jsonb not null check (jsonb_typeof(payload) = 'object'),
  sha256          text not null,
  published_by    uuid references auth.users (id),
  published_at    timestamptz not null default now(),
  -- بلا قيد مرجعي ذاتي عمداً: أساس أول إصدار قد يكون null أو معرّف الإصدار
  -- المضمّن وقت البناء قبل استزراعه في هذا الجدول (انظر README خطوة الاستزراع).
  base_release_id text,
  waivers         jsonb not null default '{}'::jsonb
);

comment on table public.presentation_releases is
  'لقطات النشر الكاملة (payload = ملف release.json كاملاً). سجل تاريخي غير قابل للتغيير: الإدراج عبر دالة publish_release حصراً، والتعديل والحذف محجوبان بمحفّز حتى عن مالك الجدول.';
comment on column public.presentation_releases.sha256 is
  'بصمة الخادم: sha256 لجسم الحمولة القانوني في jsonb (باستثناء مفتاحي release وvalidation). تُحسب عبر extensions.digest داخل دالة النشر — وهي المرجع الخادمي، ولا تُقارن حرفياً ببصمة العميل المحسوبة على JSON.stringify بترتيب مفاتيح جافاسكريبت.';
comment on column public.presentation_releases.waivers is
  'الإقرارات الموقَّعة بالإنذارات المفتوحة وقت النشر: {gate_id: {by, at, ...}} — لا نشر بتجاهل صامت.';

create index presentation_releases_published_at_idx
  on public.presentation_releases (published_at desc);

-- ───────────────────────────────────────────────────────────────────────────
-- 3) presentations — مؤشر الإصدار الحالي (صف واحد إجباري)
-- ───────────────────────────────────────────────────────────────────────────
create table public.presentations (
  id                 int primary key default 1 check (id = 1),
  current_release_id text references public.presentation_releases (id)
);

comment on table public.presentations is
  'صف واحد (id = 1) يحمل مؤشر الإصدار المنشور الحالي. قفل هذا الصف داخل دالة النشر يجعل عمليات النشر متسلسلة ويكشف تعارض الأساس.';

-- الصف الوحيد — يبدأ بلا إصدار حالٍ حتى أول نشر أو استزراع.
insert into public.presentations (id, current_release_id) values (1, null);

-- ───────────────────────────────────────────────────────────────────────────
-- 4) presentation_drafts — المسودات (نسخة كاملة قيد التحرير)
-- ───────────────────────────────────────────────────────────────────────────
create table public.presentation_drafts (
  id              uuid primary key default gen_random_uuid(),
  -- بلا قيد مرجعي عمداً: قد يشير إلى الإصدار المضمّن وقت البناء قبل استزراعه.
  base_release_id text,
  draft_version   int not null default 1 check (draft_version >= 1),
  payload         jsonb not null check (jsonb_typeof(payload) = 'object'),
  updated_by      uuid references auth.users (id),
  updated_at      timestamptz not null default now()
);

comment on table public.presentation_drafts is
  'مسودات التحرير: نسخة كاملة من الإصدار تعمل عليها الإدارة، بأساس متوقع (base_release_id) ونسخة تحرير (draft_version) للتزامن التفاؤلي — مرآة startDraft/saveDraft في store.js.';
comment on column public.presentation_drafts.draft_version is
  'تزداد بمقدار 1 مع كل حفظ. المحفّز أدناه يرفض أي تحديث لا يرسل القيمة المتوقعة + 1 (draft_conflict).';

create index presentation_drafts_updated_at_idx
  on public.presentation_drafts (updated_at desc);

-- ───────────────────────────────────────────────────────────────────────────
-- 5) audit_events — سجل التدقيق (ملحق فقط)
-- ───────────────────────────────────────────────────────────────────────────
create table public.audit_events (
  seq    bigint generated always as identity primary key,
  at     timestamptz not null default now(),
  actor  uuid,
  action text not null,
  detail jsonb not null default '{}'::jsonb
);

comment on table public.audit_events is
  'سجل تدقيق ملحق فقط (append-only): الإدراج عبر الدوال والمحفّزات الموثوقة، والتعديل والحذف والإفراغ مرفوضة بمحفّز حتى عن مالك الجدول.';

create index audit_events_at_idx on public.audit_events (at desc);

-- ───────────────────────────────────────────────────────────────────────────
-- 6) source_files — بيانات وصفية لملفات المصدر المرفوعة (المخزن في Storage)
-- ───────────────────────────────────────────────────────────────────────────
create table public.source_files (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  sha256           text not null unique,
  size             bigint not null check (size >= 0),
  template_version text,
  storage_path     text not null,
  uploaded_by      uuid references auth.users (id),
  uploaded_at      timestamptz not null default now()
);

comment on table public.source_files is
  'سجل ملفات المصدر (platform-data.xlsx ونحوها) المرفوعة إلى الحاوية الخاصة source-files. فرادة sha256 تجعل إعادة الاستيراد المتطابقة idempotent (خطة الجودة QA_PLAN §2).';

-- ───────────────────────────────────────────────────────────────────────────
-- 7) محفّزات صون العقيدة
-- ───────────────────────────────────────────────────────────────────────────

-- (أ) سجل التدقيق ملحق فقط — يرفض التعديل والحذف والإفراغ نهائياً.
create or replace function public.audit_events_block_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'audit_append_only'
    using errcode = 'P0001',
          hint = 'سجل التدقيق ملحق فقط: لا تعديل ولا حذف ولا إفراغ.';
end;
$$;

create trigger trg_audit_append_only
  before update or delete on public.audit_events
  for each row execute function public.audit_events_block_mutation();

create trigger trg_audit_no_truncate
  before truncate on public.audit_events
  for each statement execute function public.audit_events_block_mutation();

-- (ب) الإصدارات المنشورة غير قابلة للتغيير — «التراجع لا يعدل التاريخ أبداً».
create or replace function public.releases_block_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'releases_immutable'
    using errcode = 'P0001',
          hint = 'الإصدارات المنشورة تاريخ غير قابل للتغيير؛ التراجع ينسخ إصداراً إلى مسودة جديدة تمر بمسار النشر ذاته.';
end;
$$;

create trigger trg_releases_immutable
  before update or delete on public.presentation_releases
  for each row execute function public.releases_block_mutation();

-- (ج) حارس نسخة المسودة + ختم التحديث — مرآة saveDraft (التزامن التفاؤلي):
--     كل حفظ يجب أن يرسل draft_version = النسخة الحالية + 1 وإلا رُفض بتعارض.
create or replace function public.drafts_before_write()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op = 'UPDATE' and new.draft_version is distinct from old.draft_version + 1 then
    raise exception 'draft_conflict'
      using errcode = 'P0001',
            hint = 'تعارض تحرير: عدّل مستخدم آخر المسودة منذ فتحتها. أرسل draft_version = النسخة المتوقعة + 1 بعد الدمج.';
  end if;
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

create trigger trg_drafts_before_write
  before insert or update on public.presentation_drafts
  for each row execute function public.drafts_before_write();

-- (د) تدقيق نشاط المسودات تلقائياً (draft.insert / draft.update / draft.delete)
--     — security definer كي يُدرج في سجل التدقيق دون فتح أي سياسة كتابة عليه.
create or replace function public.drafts_audit()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.audit_events (actor, action, detail)
  values (
    auth.uid(),
    case tg_op
      when 'INSERT' then 'draft.insert'
      when 'UPDATE' then 'draft.update'
      else 'draft.delete'
    end,
    jsonb_build_object(
      'draft_id',        coalesce(new.id, old.id),
      'base_release_id', coalesce(new.base_release_id, old.base_release_id),
      'draft_version',   coalesce(new.draft_version, old.draft_version)
    )
  );
  return coalesce(new, old);
end;
$$;

create trigger trg_drafts_audit
  after insert or update or delete on public.presentation_drafts
  for each row execute function public.drafts_audit();
