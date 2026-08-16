-- ═══════════════════════════════════════════════════════════════════════════
-- rls_test.sql — اختبارات pgTAP لمصفوفة الأدوار وعقيدة النشر
-- ═══════════════════════════════════════════════════════════════════════════
-- المرجع: docs/QA_PLAN.md §2 — يثبت أن:
--   • anon لا يقرأ المسودات ولا التدقيق ولا الأدوار، ولا يكتب شيئاً،
--     ويرى الإصدار المنشور الحالي فقط.
--   • editor يحرر المسودات ولا ينشر؛ viewer لا يحرر.
--   • تعارض الأساس يُرفض (base_conflict)، والفحوص الجوهرية تحجب
--     (validation_failed)، والإنذارات بلا إقرار تحجب (waivers_required).
--   • rollback ينشئ مسودة جديدة ولا يمس التاريخ، والنشر بعدها إصدار جديد.
--   • admin لا يرفع صلاحية نفسه؛ سجل التدقيق والإصدارات محصّنة حتى عن المالك.
--
-- التشغيل: supabase test db   (يتطلب امتداد pgtap — يُنشأ أدناه إن لم يوجد)
-- المعاملة تُسترجع كاملة في النهاية (rollback) — لا أثر على البيانات.
--
-- بديل بلا pgTAP: يمكن إعادة صياغة كل تأكيد ككتلة DO تستخدم
--   begin ... exception when insufficient_privilege then raise notice 'ok';
-- والمقارنات بـ assert؛ أبقينا pgTAP أساساً لأنه معيار Supabase للاختبار.
-- ═══════════════════════════════════════════════════════════════════════════

begin;

create extension if not exists pgtap with schema extensions;

select plan(51);

-- ───────────────────────────────────────────────────────────────────────────
-- التهيئة (كمالك قاعدة البيانات — تُسترجع مع نهاية المعاملة)
-- ───────────────────────────────────────────────────────────────────────────

-- مستخدمون وهميون
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'admin@test.local'),
  ('00000000-0000-0000-0000-00000000000e', 'editor@test.local'),
  ('00000000-0000-0000-0000-00000000000b', 'publisher@test.local'),
  ('00000000-0000-0000-0000-00000000000f', 'viewer@test.local'),
  ('00000000-0000-0000-0000-00000000000c', 'norole@test.local');

insert into public.user_roles (user_id, role, granted_by) values
  ('00000000-0000-0000-0000-00000000000a', 'admin',     '00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000e', 'editor',    '00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000b', 'publisher', '00000000-0000-0000-0000-00000000000a'),
  ('00000000-0000-0000-0000-00000000000f', 'viewer',    '00000000-0000-0000-0000-00000000000a');

-- حمولة مصغّرة متسقة تجتاز الفحوص الجوهرية في publish_release:
--   قطاعات: 700+720=1420 طلباً، 300+312=612 سريراً، 96+100=196 زيارة، 16+20=36 مخالفة
--   سلسلة الترخيص: 6+3=9 بناء، 11+3=14 تشغيلية، 563+49=612 سريراً؛ المشغول 561 ≤ 612
create function pg_temp.fixture(p_base text default 'rel-seed-001') returns jsonb
language sql as $fx$
  select jsonb_set(
    $j${
      "schema_version": "1.0.0",
      "release": {"id": "draft", "status": "draft", "base_release_id": null,
                  "draft_version": 1, "notes": "حمولة اختبار"},
      "meta": {"presentation_date_needs_confirmation": false},
      "metrics": {
        "total_demand":        {"value": 1420},
        "licensed_beds":       {"value": 612},
        "occupied_beds":       {"value": 561},
        "current_building":    {"value": 9},
        "current_operational": {"value": 14},
        "total_visits":        {"value": 196},
        "total_violations":    {"value": 36}
      },
      "baseline": {"building": 6, "operational": 11, "beds": 563},
      "monthly": {"licensing": [
        {"iso": "2025-09", "building": 1, "operational": 1, "beds": 24},
        {"iso": "2025-10", "building": 2, "operational": 2, "beds": 25}
      ]},
      "sectors": [
        {"id": "north", "demand": 700, "beds": 300, "visits": 96,  "violations": 16},
        {"id": "south", "demand": 720, "beds": 312, "visits": 100, "violations": 20}
      ],
      "strategy": {"status": "approved", "required_pillars": 1, "pillars": [{"id": "p1"}]},
      "next_steps": {"status": "approved", "items": [{"t": "بند"}, {"t": "بند"}, {"t": "بند"}]},
      "compliance": {"status": "approved"}
    }$j$::jsonb,
    '{release,base_release_id}',
    coalesce(to_jsonb(p_base), 'null'::jsonb),
    true
  )
$fx$;

-- انتحال الأدوار (نمط اختبارات Supabase القياسي)
create function pg_temp.impersonate(p_user uuid) returns void
language plpgsql as $im$
begin
  perform set_config('request.jwt.claims',
    json_build_object('sub', p_user, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
end $im$;

create function pg_temp.as_anon() returns void
language plpgsql as $an$
begin
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  perform set_config('role', 'anon', true);
end $an$;

create function pg_temp.as_owner() returns void
language plpgsql as $ow$
begin
  perform set_config('request.jwt.claims', '', true);
  perform set_config('role', 'postgres', true);
end $ow$;

-- إصداران تاريخيان مستزرعان + توجيه المؤشر إلى الأحدث
insert into public.presentation_releases
  (id, payload, sha256, published_by, published_at, base_release_id, waivers)
values
  ('rel-seed-000', pg_temp.fixture(null), 'seedsha000',
   '00000000-0000-0000-0000-00000000000b', now() - interval '2 days', null, '{}'::jsonb),
  ('rel-seed-001', pg_temp.fixture('rel-seed-000'), 'seedsha001',
   '00000000-0000-0000-0000-00000000000b', now() - interval '1 day', 'rel-seed-000', '{}'::jsonb);

update public.presentations set current_release_id = 'rel-seed-001' where id = 1;

-- ───────────────────────────────────────────────────────────────────────────
-- (أ) RLS مفعّل على كل الجداول — الاختبارات 1–6
-- ───────────────────────────────────────────────────────────────────────────
select is((select relrowsecurity from pg_class where oid = 'public.user_roles'::regclass),
  true, 'RLS مفعّل: user_roles');
select is((select relrowsecurity from pg_class where oid = 'public.presentation_drafts'::regclass),
  true, 'RLS مفعّل: presentation_drafts');
select is((select relrowsecurity from pg_class where oid = 'public.presentation_releases'::regclass),
  true, 'RLS مفعّل: presentation_releases');
select is((select relrowsecurity from pg_class where oid = 'public.presentations'::regclass),
  true, 'RLS مفعّل: presentations');
select is((select relrowsecurity from pg_class where oid = 'public.audit_events'::regclass),
  true, 'RLS مفعّل: audit_events');
select is((select relrowsecurity from pg_class where oid = 'public.source_files'::regclass),
  true, 'RLS مفعّل: source_files');

-- ───────────────────────────────────────────────────────────────────────────
-- (ب) anon — الاختبارات 7–13
-- ───────────────────────────────────────────────────────────────────────────
select pg_temp.as_anon();

select throws_ok($q$select count(*) from public.presentation_drafts$q$,
  '42501', null, 'anon: لا قراءة للمسودات');
select throws_ok($q$select count(*) from public.audit_events$q$,
  '42501', null, 'anon: لا قراءة لسجل التدقيق');
select throws_ok($q$select count(*) from public.user_roles$q$,
  '42501', null, 'anon: لا قراءة للأدوار');
select results_eq($q$select id from public.presentation_releases$q$,
  $q$values ('rel-seed-001'::text)$q$,
  'anon: يرى الإصدار المنشور الحالي فقط (rel-seed-000 التاريخي محجوب)');
select throws_ok(
  $q$insert into public.presentation_releases (id, payload, sha256) values ('rel-x', '{}'::jsonb, 'x')$q$,
  '42501', null, 'anon: لا إدراج في الإصدارات');
select throws_ok(
  $q$update public.presentations set current_release_id = 'rel-seed-000' where id = 1$q$,
  '42501', null, 'anon: لا تعديل للمؤشر');
select throws_ok(
  $q$insert into public.audit_events (actor, action) values (null, 'x')$q$,
  '42501', null, 'anon: لا كتابة في سجل التدقيق');

-- ───────────────────────────────────────────────────────────────────────────
-- (ج) viewer — الاختبارات 14–16
-- ───────────────────────────────────────────────────────────────────────────
select pg_temp.impersonate('00000000-0000-0000-0000-00000000000f');

select results_eq($q$select id from public.presentation_releases$q$,
  $q$values ('rel-seed-001'::text)$q$,
  'viewer: يرى الإصدار المنشور الحالي فقط');
select is_empty($q$select id from public.presentation_drafts$q$,
  'viewer: المسودات محجوبة عنه');
select throws_ok(
  $q$insert into public.presentation_drafts (base_release_id, draft_version, payload)
     values ('rel-seed-001', 1, '{}'::jsonb)$q$,
  '42501', null, 'viewer: لا إنشاء مسودة');

-- ───────────────────────────────────────────────────────────────────────────
-- (د) editor — الاختبارات 17–23
-- ───────────────────────────────────────────────────────────────────────────
select pg_temp.impersonate('00000000-0000-0000-0000-00000000000e');

select lives_ok(
  $q$insert into public.presentation_drafts (id, base_release_id, draft_version, payload)
     values ('11111111-1111-1111-1111-111111111111', 'rel-seed-001', 1, pg_temp.fixture())$q$,
  'editor: إنشاء مسودة');
select is(
  (select draft_version from public.presentation_drafts
    where id = '11111111-1111-1111-1111-111111111111'),
  1, 'editor: نسخة المسودة تبدأ من 1');
select lives_ok(
  $q$update public.presentation_drafts
       set draft_version = 2, payload = pg_temp.fixture()
     where id = '11111111-1111-1111-1111-111111111111'$q$,
  'editor: حفظ بزيادة النسخة المتوقعة + 1');
select throws_ok(
  $q$update public.presentation_drafts
       set draft_version = 2, payload = pg_temp.fixture()
     where id = '11111111-1111-1111-1111-111111111111'$q$,
  'P0001', 'draft_conflict', 'editor: حفظ بنسخة قديمة يُرفض بتعارض تحرير');
select throws_ok(
  $q$select public.publish_release('11111111-1111-1111-1111-111111111111'::uuid,
       'rel-seed-001', '{}'::jsonb)$q$,
  '42501', 'forbidden', 'editor: لا ينشر');
select is_empty($q$select seq from public.audit_events$q$,
  'editor: سجل التدقيق محجوب عنه');
select throws_ok(
  $q$insert into public.presentation_releases (id, payload, sha256) values ('rel-y', '{}'::jsonb, 'y')$q$,
  '42501', null, 'editor: لا إدراج مباشراً في الإصدارات');

-- ───────────────────────────────────────────────────────────────────────────
-- (هـ) publisher: تعارض الأساس ثم نشر ناجح — الاختبارات 24–31
-- ───────────────────────────────────────────────────────────────────────────
select pg_temp.impersonate('00000000-0000-0000-0000-00000000000b');

select throws_ok(
  $q$select public.publish_release('11111111-1111-1111-1111-111111111111'::uuid,
       'rel-seed-000', '{}'::jsonb)$q$,
  'P0001', 'base_conflict', 'publisher: أساس متوقع مغاير للمؤشر الحالي يُرفض');
select lives_ok(
  $q$select public.publish_release('11111111-1111-1111-1111-111111111111'::uuid,
       'rel-seed-001', '{}'::jsonb)$q$,
  'publisher: نشر مسودة سليمة بأساس مطابق');
select is((select count(*)::int from public.presentation_releases),
  3, 'ثلاثة إصدارات بعد النشر (الناشر يرى السجل كاملاً)');
select is(
  (select current_release_id from public.presentations where id = 1),
  (select id from public.presentation_releases order by published_at desc limit 1),
  'المؤشر يشير إلى الإصدار المنشور حديثاً');
select matches(
  (select current_release_id from public.presentations where id = 1),
  '^rel-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{3}$',
  'معرّف الإصدار مبنيٌّ على التاريخ');
select is_empty(
  $q$select id from public.presentation_drafts
      where id = '11111111-1111-1111-1111-111111111111'$q$,
  'المسودة حُذفت بعد النشر');
select isnt_empty(
  $q$select seq from public.audit_events where action = 'release.publish'$q$,
  'حدث تدقيق release.publish مسجَّل');
select isnt_empty(
  $q$select id from public.presentation_releases
      where id = public.current_release_id() and sha256 ~ '^[0-9a-f]{64}$'$q$,
  'بصمة sha256 سداسية عشرية كاملة مسجلة عبر digest()');

-- ───────────────────────────────────────────────────────────────────────────
-- (و) الفحوص الجوهرية والإقرارات — الاختبارات 32–37
-- ───────────────────────────────────────────────────────────────────────────
select lives_ok(
  $q$insert into public.presentation_drafts (id, base_release_id, draft_version, payload)
     values ('22222222-2222-2222-2222-222222222222', public.current_release_id(), 1,
             jsonb_set(pg_temp.fixture(public.current_release_id()),
                       '{sectors,0,demand}', to_jsonb(999)))$q$,
  'مسودة بمجاميع مكسورة تُنشأ (الحجب عند النشر لا التحرير)');
select throws_ok(
  $q$select public.publish_release('22222222-2222-2222-2222-222222222222'::uuid,
       public.current_release_id(), '{}'::jsonb)$q$,
  'P0001', 'validation_failed', 'مجموع القطاعات ≠ الإجمالي → النشر محجوب');
select lives_ok(
  $q$insert into public.presentation_drafts (id, base_release_id, draft_version, payload)
     values ('33333333-3333-3333-3333-333333333333', public.current_release_id(), 1,
             jsonb_set(pg_temp.fixture(public.current_release_id()),
                       '{strategy,status}', to_jsonb('pending_source'::text)))$q$,
  'مسودة باستراتيجية بانتظار المصدر تُنشأ');
select throws_ok(
  $q$select public.publish_release('33333333-3333-3333-3333-333333333333'::uuid,
       public.current_release_id(), '{}'::jsonb)$q$,
  'P0001', 'waivers_required', 'إنذار مفتوح بلا إقرار موقَّع → النشر محجوب');
select lives_ok(
  $q$select public.publish_release('33333333-3333-3333-3333-333333333333'::uuid,
       public.current_release_id(),
       '{"strategy.pending": {"by": "أمين المنطقة", "at": "2026-08-16"}}'::jsonb)$q$,
  'الإقرار الموقَّع يفتح النشر (يُسجَّل في اللقطة والتدقيق)');
select is((select count(*)::int from public.presentation_releases),
  4, 'أربعة إصدارات بعد النشر الثاني');

-- ───────────────────────────────────────────────────────────────────────────
-- (ز) التراجع لا يمس التاريخ — الاختبارات 38–42
-- ───────────────────────────────────────────────────────────────────────────
select lives_ok($q$select public.rollback_to('rel-seed-000')$q$,
  'publisher: التراجع إلى إصدار تاريخي');
select is(
  (select count(*)::int from public.presentation_drafts
    where payload #>> '{release,rollback_of}' = 'rel-seed-000'),
  1, 'التراجع أنشأ مسودة جديدة موسومة rollback_of');
select is((select count(*)::int from public.presentation_releases),
  4, 'التراجع لم يضف إصداراً ولم يحذف — يمر بمسار النشر لاحقاً');
select is(
  (select sha256 from public.presentation_releases where id = 'rel-seed-000'),
  'seedsha000', 'الإصدار التاريخي لم يُمس (البصمة كما هي)');
select is(
  (select base_release_id from public.presentation_drafts
    where payload #>> '{release,rollback_of}' = 'rel-seed-000'),
  public.current_release_id(),
  'أساس مسودة التراجع = الإصدار الحالي (تفاؤلية التزامن محفوظة)');

-- ───────────────────────────────────────────────────────────────────────────
-- (ح) إدارة الأدوار ومنع رفع الصلاحية الذاتي — الاختبارات 43–47
-- ───────────────────────────────────────────────────────────────────────────
select pg_temp.impersonate('00000000-0000-0000-0000-00000000000a');

select lives_ok(
  $q$insert into public.user_roles (user_id, role, granted_by)
     values ('00000000-0000-0000-0000-00000000000c', 'viewer',
             '00000000-0000-0000-0000-00000000000a')$q$,
  'admin: منح دور لمستخدم آخر');

-- محاولة تعديل الذات: سياسة using تخفي صفه فلا يصيب التحديث شيئاً
update public.user_roles set role = 'publisher'
 where user_id = '00000000-0000-0000-0000-00000000000a';
select is(
  (select role from public.user_roles
    where user_id = '00000000-0000-0000-0000-00000000000a'),
  'admin', 'admin: تعديل صف صلاحيته بلا أثر (منع رفع الصلاحية الذاتي)');

select pg_temp.impersonate('00000000-0000-0000-0000-00000000000e');

select throws_ok(
  $q$insert into public.user_roles (user_id, role)
     values ('00000000-0000-0000-0000-00000000000e', 'admin')$q$,
  '42501', null, 'editor: لا يمنح نفسه دوراً');

update public.user_roles set role = 'admin'
 where user_id = '00000000-0000-0000-0000-00000000000e';
select is(
  (select role from public.user_roles
    where user_id = '00000000-0000-0000-0000-00000000000e'),
  'editor', 'editor: تحديث الأدوار بلا أثر');

select results_eq($q$select user_id from public.user_roles$q$,
  $q$values ('00000000-0000-0000-0000-00000000000e'::uuid)$q$,
  'editor: يرى صف دوره فقط');

-- ───────────────────────────────────────────────────────────────────────────
-- (ط) الحصانة حتى عن مالك القاعدة — الاختبارات 48–51
-- ───────────────────────────────────────────────────────────────────────────
select pg_temp.as_owner();

select throws_ok(
  $q$update public.audit_events set action = 'x'
      where seq = (select min(seq) from public.audit_events)$q$,
  'P0001', 'audit_append_only', 'سجل التدقيق ملحق فقط: لا تعديل');
select throws_ok(
  $q$delete from public.audit_events
      where seq = (select min(seq) from public.audit_events)$q$,
  'P0001', 'audit_append_only', 'سجل التدقيق ملحق فقط: لا حذف');
select throws_ok(
  $q$update public.presentation_releases set sha256 = 'x' where id = 'rel-seed-000'$q$,
  'P0001', 'releases_immutable', 'الإصدارات غير قابلة للتغيير: لا تعديل');
select throws_ok(
  $q$delete from public.presentation_releases where id = 'rel-seed-000'$q$,
  'P0001', 'releases_immutable', 'الإصدارات غير قابلة للتغيير: لا حذف للتاريخ');

select * from finish();
rollback;
