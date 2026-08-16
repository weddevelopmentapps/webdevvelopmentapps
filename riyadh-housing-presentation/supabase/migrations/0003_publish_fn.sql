-- ═══════════════════════════════════════════════════════════════════════════
-- 0003_publish_fn.sql — دالتا النشر والتراجع الموثوقتان (security definer)
-- ═══════════════════════════════════════════════════════════════════════════
-- مرآة خادمية لعقد store.js:
--   publish(draft, actor, waivers): تحقق كامل → لقطة غير قابلة للتغيير →
--   تحديث المؤشر → تدقيق — وترفض عند تعارض الأساس أو فشل الفحوص الجوهرية
--   أو إنذار مفتوح بلا إقرار موقَّع. rollback ينسخ إصداراً تاريخياً إلى مسودة
--   جديدة تمر بمسار النشر ذاته — لا تعديل على التاريخ أبداً.
-- جسم الدالة معاملة واحدة بطبيعته: أي استثناء يسترجع كل شيء.
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- publish_release — النشر الموثوق
-- ───────────────────────────────────────────────────────────────────────────
create or replace function public.publish_release(
  p_draft_id      uuid,
  p_expected_base text,
  p_waivers       jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_role        text;
  v_current     text;
  v_draft       public.presentation_drafts%rowtype;
  v_payload     jsonb;
  v_waivers     jsonb := coalesce(p_waivers, '{}'::jsonb);
  v_failures    jsonb := '[]'::jsonb;
  v_unwaived    jsonb := '[]'::jsonb;

  -- الإجماليات المعلنة في الحمولة
  v_total_demand    bigint;
  v_licensed_beds   bigint;
  v_occupied_beds   bigint;
  v_total_visits    bigint;
  v_total_viol      bigint;
  v_cur_building    bigint;
  v_cur_operational bigint;
  v_base_building   bigint;
  v_base_operat     bigint;
  v_base_beds       bigint;

  -- المجاميع المحسوبة من التفاصيل
  v_sec_demand      bigint;
  v_sec_beds        bigint;
  v_sec_visits      bigint;
  v_sec_viol        bigint;
  v_mon_building    bigint;
  v_mon_operational bigint;
  v_mon_beds        bigint;

  v_n     int;
  v_id    text;
  v_stamp timestamptz := now();
  v_body  jsonb;
  v_sha   text;
  v_release_obj jsonb;
begin
  -- (1) بوابة الدور: النشر للناشر والمدير حصراً — منحة EXECUTE وحدها لا تكفي
  --     لأنها تُمنح لدور authenticated الجامع، فالفصل الفعلي هنا.
  select role into v_role from public.user_roles where user_id = auth.uid();
  if v_role is null or v_role not in ('publisher', 'admin') then
    raise exception 'forbidden'
      using errcode = '42501',
            hint = 'النشر مقصور على دوري publisher وadmin.';
  end if;

  -- (2) قفل صف المؤشر: يجعل عمليات النشر متسلسلة داخل معاملة واحدة.
  select current_release_id into v_current
  from public.presentations
  where id = 1
  for update;
  if not found then
    raise exception 'presentations_missing'
      using errcode = 'P0001',
            hint = 'صف المؤشر (id = 1) مفقود — أعد تطبيق 0001_schema.sql.';
  end if;

  -- (3) المسودة المطلوب نشرها (مقفلة حتى نهاية المعاملة).
  select * into v_draft
  from public.presentation_drafts
  where id = p_draft_id
  for update;
  if not found then
    raise exception 'draft_not_found'
      using errcode = 'P0001',
            hint = 'لا مسودة بهذا المعرّف.';
  end if;
  v_payload := v_draft.payload;

  -- (4) تعارض الأساس (التزامن التفاؤلي): المؤشر الحالي والأساس المسجل في
  --     المسودة (عموداً وحمولةً) يجب أن تطابق جميعاً الأساس المتوقع.
  if v_current is distinct from p_expected_base
     or v_draft.base_release_id is distinct from p_expected_base
     or nullif(v_payload #>> '{release,base_release_id}', '') is distinct from p_expected_base then
    raise exception 'base_conflict'
      using errcode = 'P0001',
            detail = jsonb_build_object(
              'current',       v_current,
              'expected_base', p_expected_base,
              'draft_base',    v_draft.base_release_id
            )::text,
            hint = 'نُشر إصدار آخر منذ بدء هذه المسودة. أعد فتح مسودة من الإصدار الحالي.';
  end if;

  -- (5) فحوص الاتساق الجوهرية داخل SQL على الحمولة — مرآة البوابات الحاجبة
  --     في validate.js (المجاميع تُقارن بإجماليات الحمولة ذاتها: لا أرقام
  --     مكتوبة نصاً هنا، والخادم لا يثق بحساب العميل).
  v_total_demand    := (v_payload #>> '{metrics,total_demand,value}')::bigint;
  v_licensed_beds   := (v_payload #>> '{metrics,licensed_beds,value}')::bigint;
  v_occupied_beds   := (v_payload #>> '{metrics,occupied_beds,value}')::bigint;
  v_total_visits    := (v_payload #>> '{metrics,total_visits,value}')::bigint;
  v_total_viol      := (v_payload #>> '{metrics,total_violations,value}')::bigint;
  v_cur_building    := (v_payload #>> '{metrics,current_building,value}')::bigint;
  v_cur_operational := (v_payload #>> '{metrics,current_operational,value}')::bigint;
  v_base_building   := (v_payload #>> '{baseline,building}')::bigint;
  v_base_operat     := (v_payload #>> '{baseline,operational}')::bigint;
  v_base_beds       := (v_payload #>> '{baseline,beds}')::bigint;

  select
    coalesce(sum((s ->> 'demand')::bigint), 0),
    coalesce(sum((s ->> 'beds')::bigint), 0),
    coalesce(sum((s ->> 'visits')::bigint), 0),
    coalesce(sum((s ->> 'violations')::bigint), 0)
  into v_sec_demand, v_sec_beds, v_sec_visits, v_sec_viol
  from jsonb_array_elements(coalesce(v_payload -> 'sectors', '[]'::jsonb)) s;

  select
    coalesce(sum((m ->> 'building')::bigint), 0),
    coalesce(sum((m ->> 'operational')::bigint), 0),
    coalesce(sum((m ->> 'beds')::bigint), 0)
  into v_mon_building, v_mon_operational, v_mon_beds
  from jsonb_array_elements(coalesce(v_payload #> '{monthly,licensing}', '[]'::jsonb)) m;

  if v_total_demand is null or v_licensed_beds is null or v_occupied_beds is null
     or v_total_visits is null or v_total_viol is null
     or v_cur_building is null or v_cur_operational is null
     or v_base_building is null or v_base_operat is null or v_base_beds is null then
    v_failures := v_failures || jsonb_build_object(
      'id', 'payload.shape',
      'label', 'حقول جوهرية ناقصة في الحمولة (metrics/baseline)');
  else
    -- مجاميع القطاعات = الإجماليات (الطلب، الأسرّة، الزيارات، المخالفات)
    if v_sec_demand <> v_total_demand then
      v_failures := v_failures || jsonb_build_object('id', 'demand.sectors',
        'label', 'مجموع طلب القطاعات = إجمالي الطلب',
        'expected', v_total_demand, 'actual', v_sec_demand);
    end if;
    if v_sec_beds <> v_licensed_beds then
      v_failures := v_failures || jsonb_build_object('id', 'beds.sectors',
        'label', 'مجموع أسرّة القطاعات = الطاقة المرخصة',
        'expected', v_licensed_beds, 'actual', v_sec_beds);
    end if;
    if v_sec_visits <> v_total_visits then
      v_failures := v_failures || jsonb_build_object('id', 'visits.sectors',
        'label', 'مجموع زيارات القطاعات = الإجمالي',
        'expected', v_total_visits, 'actual', v_sec_visits);
    end if;
    if v_sec_viol <> v_total_viol then
      v_failures := v_failures || jsonb_build_object('id', 'violations.sectors',
        'label', 'مجموع مخالفات القطاعات = الإجمالي',
        'expected', v_total_viol, 'actual', v_sec_viol);
    end if;

    -- خط الأساس + الإضافات الشهرية = الحالي (بناء، تشغيلية، أسرّة)
    if v_base_building + v_mon_building <> v_cur_building then
      v_failures := v_failures || jsonb_build_object('id', 'licensing.chain.building',
        'label', 'خط الأساس + الإضافات الشهرية = الحالي (رخص البناء)',
        'expected', v_cur_building, 'actual', v_base_building + v_mon_building);
    end if;
    if v_base_operat + v_mon_operational <> v_cur_operational then
      v_failures := v_failures || jsonb_build_object('id', 'licensing.chain.operational',
        'label', 'خط الأساس + الإضافات الشهرية = الحالي (الرخص التشغيلية)',
        'expected', v_cur_operational, 'actual', v_base_operat + v_mon_operational);
    end if;
    if v_base_beds + v_mon_beds <> v_licensed_beds then
      v_failures := v_failures || jsonb_build_object('id', 'licensing.chain.beds',
        'label', 'خط الأساس + الإضافات الشهرية = الحالي (الأسرّة)',
        'expected', v_licensed_beds, 'actual', v_base_beds + v_mon_beds);
    end if;

    -- المشغول لا يتجاوز الطاقة
    if v_occupied_beds > v_licensed_beds then
      v_failures := v_failures || jsonb_build_object('id', 'occupancy.bound',
        'label', 'المشغول لا يتجاوز الطاقة',
        'licensed', v_licensed_beds, 'occupied', v_occupied_beds);
    end if;
  end if;

  -- عقيدة عدم التلفيق: عند اعتماد الاستراتيجية، عدد الركائز = المطلوب.
  if (v_payload #>> '{strategy,status}') = 'approved'
     and coalesce(jsonb_array_length(v_payload #> '{strategy,pillars}'), 0)
         is distinct from nullif(v_payload #>> '{strategy,required_pillars}', '')::int then
    v_failures := v_failures || jsonb_build_object('id', 'strategy.pillars7',
      'label', 'عدد الركائز المعتمدة يطابق العدد المطلوب');
  end if;

  if jsonb_array_length(v_failures) > 0 then
    raise exception 'validation_failed'
      using errcode = 'P0001',
            detail = v_failures::text,
            hint = 'فحوص الاتساق الجوهرية لم تجتز — راجع التفاصيل وصحّح المسودة.';
  end if;

  -- (6) الإنذارات تتطلب إقراراً موقَّعاً (waivers[id].by) — لا نشر بتجاهل
  --     صامت. المعرّفات مطابقة لبوابات validate.js المنذرة، ومنها حالة
  --     الاستراتيجية غير المعتمدة (strategy.status = pending_source حالياً).
  if (v_payload #>> '{strategy,status}') is distinct from 'approved'
     and coalesce(v_waivers -> 'strategy.pending' ->> 'by', '') = '' then
    v_unwaived := v_unwaived || to_jsonb('strategy.pending'::text);
  end if;
  if (v_payload #>> '{next_steps,status}') is distinct from 'approved'
     and coalesce(v_waivers -> 'next_steps.pending' ->> 'by', '') = '' then
    v_unwaived := v_unwaived || to_jsonb('next_steps.pending'::text);
  end if;
  if (v_payload #>> '{compliance,status}') = 'pending_methodology'
     and coalesce(v_waivers -> 'compliance.methodology' ->> 'by', '') = '' then
    v_unwaived := v_unwaived || to_jsonb('compliance.methodology'::text);
  end if;
  if coalesce((v_payload #>> '{meta,presentation_date_needs_confirmation}')::boolean, false)
     and coalesce(v_waivers -> 'meta.presentation_date' ->> 'by', '') = '' then
    v_unwaived := v_unwaived || to_jsonb('meta.presentation_date'::text);
  end if;

  if jsonb_array_length(v_unwaived) > 0 then
    raise exception 'waivers_required'
      using errcode = 'P0001',
            detail = v_unwaived::text,
            hint = 'النشر يتطلب إقراراً موقَّعاً بكل إنذار مفتوح: waivers[id] = {by, at}.';
  end if;

  -- (7) معرّف مبني على التاريخ + عدّاد تسلسلي — مرآة store.js. قفل المؤشر
  --     أعلاه يمنع السباق؛ والحلقة تحوط من أي تصادم نظري في المعرّف.
  select count(*)::int + 1 into v_n from public.presentation_releases;
  loop
    v_id := 'rel-' || to_char(v_stamp at time zone 'utc', 'YYYY-MM-DD')
            || '-' || lpad(v_n::text, 3, '0');
    exit when not exists (select 1 from public.presentation_releases where id = v_id);
    v_n := v_n + 1;
  end loop;

  -- (8) بصمة sha256 عبر pgcrypto.digest على جسم الحمولة القانوني
  --     (باستثناء مفتاحي release وvalidation — مرآة canonicalHash).
  v_body := (v_payload - 'release') - 'validation';
  v_sha := encode(extensions.digest(convert_to(v_body::text, 'UTF8'), 'sha256'), 'hex');

  v_release_obj := jsonb_build_object(
    'id',              v_id,
    'status',          'published',
    'published_at',    to_char(v_stamp at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'published_by',    auth.uid(),
    'base_release_id', p_expected_base,
    'waivers',         v_waivers,
    'notes',           coalesce(v_payload #>> '{release,notes}', ''),
    'sha256',          v_sha
  );

  -- (9) اللقطة + المؤشر + التدقيق + حذف المسودة — كلها في المعاملة نفسها.
  insert into public.presentation_releases
    (id, payload, sha256, published_by, published_at, base_release_id, waivers)
  values
    (v_id, jsonb_set(v_payload, '{release}', v_release_obj, true),
     v_sha, auth.uid(), v_stamp, p_expected_base, v_waivers);

  update public.presentations set current_release_id = v_id where id = 1;

  insert into public.audit_events (actor, action, detail)
  values (auth.uid(), 'release.publish', jsonb_build_object(
    'id',      v_id,
    'base',    p_expected_base,
    'sha256',  v_sha,
    'waivers', (select coalesce(jsonb_agg(k), '[]'::jsonb)
                from jsonb_object_keys(v_waivers) k)
  ));

  delete from public.presentation_drafts where id = p_draft_id;

  return jsonb_build_object(
    'id',           v_id,
    'sha256',       v_sha,
    'published_at', v_release_obj ->> 'published_at'
  );
end;
$$;

comment on function public.publish_release(uuid, text, jsonb) is
  'النشر الموثوق: قفل المؤشر → رفض تعارض الأساس (base_conflict) → الفحوص الجوهرية (validation_failed) → الإقرارات (waivers_required) → لقطة + مؤشر + تدقيق + حذف المسودة، معاملة واحدة.';

-- ───────────────────────────────────────────────────────────────────────────
-- rollback_to — التراجع: نسخ إصدار تاريخي إلى مسودة جديدة (لا مساس بالتاريخ)
-- ───────────────────────────────────────────────────────────────────────────
create or replace function public.rollback_to(p_release_id text)
returns uuid
language plpgsql
volatile
security definer
set search_path = public, pg_temp
as $$
declare
  v_role     text;
  v_current  text;
  v_payload  jsonb;
  v_draft_id uuid;
  v_release_obj jsonb;
begin
  select role into v_role from public.user_roles where user_id = auth.uid();
  if v_role is null or v_role not in ('publisher', 'admin') then
    raise exception 'forbidden'
      using errcode = '42501',
            hint = 'التراجع مقصور على دوري publisher وadmin.';
  end if;

  select current_release_id into v_current from public.presentations where id = 1;

  select payload into v_payload
  from public.presentation_releases
  where id = p_release_id;
  if not found then
    raise exception 'release_not_found'
      using errcode = 'P0001',
            hint = 'الإصدار المطلوب غير موجود في السجل.';
  end if;

  -- مسودة جديدة أساسها الإصدار الحالي — تمر بمسار النشر الاعتيادي كاملاً
  -- (فحوص + إقرارات)؛ الإصدار التاريخي نفسه لا يُمس أبداً.
  v_release_obj := jsonb_build_object(
    'id',              'draft',
    'status',          'draft',
    'base_release_id', v_current,
    'draft_version',   1,
    'started_by',      auth.uid(),
    'started_at',      to_char(now() at time zone 'utc', 'YYYY-MM-DD"T"HH24:MI:SS"Z"'),
    'notes',           'تراجع إلى ' || p_release_id,
    'rollback_of',     p_release_id
  );

  insert into public.presentation_drafts (base_release_id, draft_version, payload, updated_by)
  values (v_current, 1, jsonb_set(v_payload, '{release}', v_release_obj, true), auth.uid())
  returning id into v_draft_id;

  insert into public.audit_events (actor, action, detail)
  values (auth.uid(), 'release.rollback_draft',
          jsonb_build_object('to', p_release_id, 'draft_id', v_draft_id));

  return v_draft_id;
end;
$$;

comment on function public.rollback_to(text) is
  'التراجع = مسودة جديدة مستنسخة من إصدار تاريخي، أساسها الإصدار الحالي، تمر بمسار النشر ذاته — لا تعديل على التاريخ أبداً.';

-- ───────────────────────────────────────────────────────────────────────────
-- منح التنفيذ: نلغي منحة PUBLIC الافتراضية ثم نمنح authenticated فقط —
-- بوابة الدور الفعلية داخل الدالتين (publisher/admin).
-- ───────────────────────────────────────────────────────────────────────────
revoke execute on function public.publish_release(uuid, text, jsonb) from public, anon;
revoke execute on function public.rollback_to(text) from public, anon;

grant execute on function public.publish_release(uuid, text, jsonb) to authenticated, service_role;
grant execute on function public.rollback_to(text) to authenticated, service_role;
