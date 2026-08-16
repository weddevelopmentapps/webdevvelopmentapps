-- ═══════════════════════════════════════════════════════════════════════════
-- 0002_rls.sql — أمن الصفوف (RLS) ومصفوفة الأدوار
-- ═══════════════════════════════════════════════════════════════════════════
-- المصفوفة (مرجعها docs/QA_PLAN.md §2 وARCHITECTURE.md §7):
--   anon/viewer : قراءة presentations والإصدار المنشور الحالي فقط — ولا شيء غيره.
--   editor      : كل ما سبق + CRUD على presentation_drafts فقط.
--   publisher   : كل صلاحيات editor + تنفيذ دالتي النشر والتراجع
--                 (+ قراءة تاريخ الإصدارات وسجل التدقيق لشاشتي التاريخ والتراجع).
--   admin       : إدارة user_roles — مع منع رفع المستخدم صلاحية نفسه.
--   لا insert/update/delete مباشراً على releases/presentations/audit_events
--   لأي دور: الكتابة عبر دوال security definer فقط (0003_publish_fn.sql).
--
-- ملاحظة تنفيذية: نفعّل RLS دون فرضه على المالك (بلا force row level security)
-- عمداً — دوال security definer المملوكة لمالك الجداول هي قناة الكتابة الوحيدة
-- على جداول النشر، ومحفّزا المناعة في 0001 يصونان التاريخ حتى عن المالك نفسه.
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- 1) دوال مساعدة (security definer + search_path مثبّت)
-- ───────────────────────────────────────────────────────────────────────────
-- تنبيه تسمية: CURRENT_ROLE كلمة محجوزة في SQL القياسي ولا تصلح اسم دالة،
-- لذا سُميت current_app_role() — الدلالة نفسها المطلوبة في العقد.

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select role from public.user_roles where user_id = auth.uid();
$$;

comment on function public.current_app_role() is
  'الدور التطبيقي للمستخدم الحالي (security definer لتفادي التفاف RLS الذاتي على user_roles).';

create or replace function public.has_any_role(p_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(public.current_app_role() = any (p_roles), false);
$$;

comment on function public.has_any_role(text[]) is
  'هل يحمل المستخدم الحالي أحد الأدوار المعطاة؟ تُستخدم في سياسات RLS وسياسات التخزين.';

create or replace function public.current_release_id()
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select current_release_id from public.presentations where id = 1;
$$;

comment on function public.current_release_id() is
  'معرّف الإصدار المنشور الحالي — تعتمد عليه سياسة قراءة الإصدار للعموم.';

-- تقييد التنفيذ: نلغي منحة PUBLIC الافتراضية ثم نمنح بدقة.
revoke execute on function public.current_app_role() from public;
revoke execute on function public.has_any_role(text[]) from public;
revoke execute on function public.current_release_id() from public;

grant execute on function public.current_app_role() to authenticated, service_role;
grant execute on function public.has_any_role(text[]) to authenticated, service_role;
grant execute on function public.current_release_id() to anon, authenticated, service_role;

-- ───────────────────────────────────────────────────────────────────────────
-- 2) تفعيل RLS على كل الجداول
-- ───────────────────────────────────────────────────────────────────────────
alter table public.user_roles            enable row level security;
alter table public.presentation_drafts   enable row level security;
alter table public.presentation_releases enable row level security;
alter table public.presentations         enable row level security;
alter table public.audit_events          enable row level security;
alter table public.source_files          enable row level security;

-- ───────────────────────────────────────────────────────────────────────────
-- 3) امتيازات الجداول (حزام أمان تحت السياسات)
--    Supabase يمنح افتراضياً امتيازات واسعة لـ anon/authenticated — نلغيها
--    ثم نعيد منح الحد الأدنى، فتصبح الكتابة المباشرة على جداول النشر
--    «permission denied» صريحاً لا مجرد صفوف صفرية.
-- ───────────────────────────────────────────────────────────────────────────
revoke all on table public.user_roles            from anon, authenticated;
revoke all on table public.presentation_drafts   from anon, authenticated;
revoke all on table public.presentation_releases from anon, authenticated;
revoke all on table public.presentations         from anon, authenticated;
revoke all on table public.audit_events          from anon, authenticated;
revoke all on table public.source_files          from anon, authenticated;

grant select on table public.presentations         to anon, authenticated;
grant select on table public.presentation_releases to anon, authenticated;

grant select, insert, update, delete on table public.presentation_drafts to authenticated;
grant select, insert, update, delete on table public.user_roles          to authenticated;
grant select                         on table public.audit_events        to authenticated;
grant select, insert, delete         on table public.source_files        to authenticated;

-- ───────────────────────────────────────────────────────────────────────────
-- 4) presentations — المؤشر مقروء للجميع (لا يحمل إلا معرّف الإصدار الحالي)
-- ───────────────────────────────────────────────────────────────────────────
create policy "presentations_read_all"
  on public.presentations
  for select
  to anon, authenticated
  using (true);

-- لا سياسات كتابة إطلاقاً: التحديث عبر publish_release (security definer) فقط.

-- ───────────────────────────────────────────────────────────────────────────
-- 5) presentation_releases — العموم يقرأ المنشور الحالي فقط
-- ───────────────────────────────────────────────────────────────────────────
create policy "releases_read_current_public"
  on public.presentation_releases
  for select
  to anon, authenticated
  using (id = public.current_release_id());

-- شاشتا «التاريخ» و«التراجع» في الإدارة تحتاجان قراءة السجل كاملاً — للناشر
-- والمدير فقط (قراءة صرفة؛ الكتابة تبقى محجوبة بالكامل).
create policy "releases_read_history_publisher"
  on public.presentation_releases
  for select
  to authenticated
  using (public.has_any_role(array['publisher', 'admin']));

-- لا سياسات insert/update/delete: الإدراج عبر publish_release فقط،
-- والتعديل/الحذف مرفوضان بمحفّز trg_releases_immutable حتى عن المالك.

-- ───────────────────────────────────────────────────────────────────────────
-- 6) presentation_drafts — CRUD كامل للمحرر فما فوق، ولا شيء لغيرهم
-- ───────────────────────────────────────────────────────────────────────────
create policy "drafts_crud_editor_up"
  on public.presentation_drafts
  for all
  to authenticated
  using (public.has_any_role(array['editor', 'publisher', 'admin']))
  with check (public.has_any_role(array['editor', 'publisher', 'admin']));

-- ───────────────────────────────────────────────────────────────────────────
-- 7) audit_events — قراءة للناشر والمدير؛ لا كتابة مباشرة لأحد
-- ───────────────────────────────────────────────────────────────────────────
create policy "audit_read_publisher_admin"
  on public.audit_events
  for select
  to authenticated
  using (public.has_any_role(array['publisher', 'admin']));

-- لا سياسات كتابة: الإدراج عبر الدوال والمحفّزات security definer حصراً.

-- ───────────────────────────────────────────────────────────────────────────
-- 8) user_roles — كلٌّ يرى دوره؛ الإدارة للمدير مع منع رفع صلاحية الذات
-- ───────────────────────────────────────────────────────────────────────────
create policy "roles_read_own_or_admin"
  on public.user_roles
  for select
  to authenticated
  using (user_id = auth.uid() or public.current_app_role() = 'admin');

-- شرط user_id <> auth.uid() في كل سياسات الكتابة: لا يستطيع مدير — ولا أي
-- مستخدم بلغت جلسته هذا الحد — تعديل صف صلاحيته هو (منع رفع الصلاحية الذاتي).
create policy "roles_admin_insert"
  on public.user_roles
  for insert
  to authenticated
  with check (public.current_app_role() = 'admin' and user_id <> auth.uid());

create policy "roles_admin_update"
  on public.user_roles
  for update
  to authenticated
  using (public.current_app_role() = 'admin' and user_id <> auth.uid())
  with check (public.current_app_role() = 'admin' and user_id <> auth.uid());

create policy "roles_admin_delete"
  on public.user_roles
  for delete
  to authenticated
  using (public.current_app_role() = 'admin' and user_id <> auth.uid());

-- ───────────────────────────────────────────────────────────────────────────
-- 9) source_files — بيانات الملفات الوصفية: قراءة وإدراج للمحرر فما فوق،
--    الحذف للمدير فقط (الملفات نفسها تحكمها سياسات التخزين في 0004)
-- ───────────────────────────────────────────────────────────────────────────
create policy "source_files_read_editor_up"
  on public.source_files
  for select
  to authenticated
  using (public.has_any_role(array['editor', 'publisher', 'admin']));

create policy "source_files_insert_editor_up"
  on public.source_files
  for insert
  to authenticated
  with check (
    public.has_any_role(array['editor', 'publisher', 'admin'])
    and uploaded_by = auth.uid()
  );

create policy "source_files_delete_admin"
  on public.source_files
  for delete
  to authenticated
  using (public.has_any_role(array['admin']));
