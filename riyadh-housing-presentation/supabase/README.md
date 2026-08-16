# حزمة Supabase — منصة العرض التنفيذي (السكن الجماعي — الرياض)

هذه الحزمة تنقل نموذج «الإصدار الواحد غير القابل للتغيير + المسودات + التدقيق»
(المطبَّق محلياً في `src/js/data/store.js` على IndexedDB) إلى خادم Supabase
بفرضٍ حقيقي: RLS على كل الجداول، ونشرٌ عبر دالة `security definer` واحدة،
وسجل تدقيق ملحق فقط، وتاريخ إصدارات محصَّن حتى عن مالك قاعدة البيانات.

> **تحذير إلزامي قبل أي اعتماد:** هذه الحزمة **لم تُختبر على خادم حي في بيئة
> التسليم** — لا اعتمادات Supabase متاحة في جلسة التطوير، وكل ما طُبّق عليها
> **مراجعة نصية وفحص صياغة فقط** (محلل PostgreSQL دون تنفيذ). طبّقها أولاً على
> مشروع تجريبي، وشغّل `supabase test db`، وراجع نتائج الاختبارات الـ 51 قبل
> أي استخدام إنتاجي.

## محتويات الحزمة

| الملف | الغرض |
|---|---|
| `migrations/0001_schema.sql` | الجداول الستة + محفّزات الحصانة (تدقيق ملحق فقط، إصدارات غير قابلة للتغيير، حارس نسخة المسودة) |
| `migrations/0002_rls.sql` | تفعيل RLS + مصفوفة الأدوار + الدوال المساعدة + امتيازات الحد الأدنى |
| `migrations/0003_publish_fn.sql` | `publish_release` (النشر الموثوق بمعاملة واحدة) و`rollback_to` (تراجع لا يمس التاريخ) |
| `migrations/0004_storage.sql` | حاويتا `source-files` (خاصة، xlsx حصراً) و`published-media` (عامة، وسائط معقمة موسومة بمسار الإصدار) |
| `functions/publish-release/index.ts` | دالة طرفية: جلسة + دور ناشر ثم RPC — **لا service-role في أي عميل أبداً** |
| `tests/rls_test.sql` | 51 تأكيد pgTAP لمصفوفة QA_PLAN §2 |

## خطوات التطبيق اليدوية (بالترتيب)

### 1) إنشاء المشروع وربطه

```bash
# من لوحة supabase.com: New project — اختر منطقة قريبة وكلمة مرور قوية لقاعدة البيانات
npm i -g supabase          # أو استخدم النسخة المثبتة محلياً
supabase login
cd riyadh-housing-presentation
supabase link --project-ref <PROJECT_REF>
```

### 2) تطبيق الهجرات

```bash
supabase db push
```

يطبّق الملفات الأربعة بالترتيب (`0001` → `0004`). إن رفض المشروع المُستضاف
إنشاء سياسات `storage.objects` من الهجرة (تشديد صلاحيات حديث في بعض المشاريع)،
فطبّق محتوى `0004_storage.sql` نصاً من **SQL Editor** في اللوحة.

### 3) نشر الدالة الطرفية

```bash
supabase functions deploy publish-release
```

لا تستخدم `--no-verify-jwt` — التحقق من JWT على البوابة مطلوب. الدالة لا
تحتاج أي أسرار إضافية: `SUPABASE_URL` و`SUPABASE_ANON_KEY` محقونان تلقائياً.

### 4) إنشاء أول admin عبر SQL

أنشئ المستخدم أولاً من اللوحة (Authentication ← Users ← Add user)، ثم من
SQL Editor:

```sql
insert into public.user_roles (user_id, role, granted_by)
values (
  (select id from auth.users where email = 'admin@example.gov.sa'),
  'admin',
  (select id from auth.users where email = 'admin@example.gov.sa')
);
```

هذا الإدراج الأول يتم بصلاحيات اللوحة عمداً: سياسات RLS تمنع أي مستخدم من
منح نفسه دوراً (`user_id <> auth.uid()`)، فلا يوجد مسار ذاتي لأول مدير.
بعدها يمنح الـ admin بقية الأدوار من واجهة الإدارة.

### 5) استزراع الإصدار التأسيسي (مطلوب قبل أول نشر من التطبيق)

المسودات في التطبيق تُفتح من الإصدار المضمّن وقت البناء
(`rel-2026-08-16-001`)، ودالة النشر ترفض أساساً لا يطابق مؤشر الخادم. لذا
استزرع الإصدار المضمّن مرة واحدة من SQL Editor:

```sql
-- الصق محتوى data/release.json مكان <RELEASE_JSON>
insert into public.presentation_releases
  (id, payload, sha256, published_by, published_at, base_release_id, waivers)
select
  payload -> 'release' ->> 'id',
  payload,
  payload -> 'release' ->> 'sha256',
  null,
  (payload -> 'release' ->> 'published_at')::timestamptz,
  payload -> 'release' ->> 'base_release_id',
  '{}'::jsonb
from (select '<RELEASE_JSON>'::jsonb as payload) seed;

update public.presentations
   set current_release_id = (select id from public.presentation_releases
                             order by published_at desc limit 1)
 where id = 1;
```

### 6) تصلّب المصادقة في اللوحة (Authentication ← Settings)

- **عطّل التسجيل الذاتي** (Allow new users to sign up ← off): الحسابات تُنشأ
  يدوياً من المدير فقط — منصة داخلية لا عامة.
- **فعّل MFA** (Multi-Factor Authentication ← TOTP): إلزامي لأدوار
  `publisher` و`admin` على الأقل، ويُستحسن للجميع.
- عطّل مزودي OAuth غير المستخدمين، وأبقِ البريد/كلمة المرور أو SSO الحكومي.

### 7) ربط التطبيق

في صفحة الاستضافة (قبل سكربتات التطبيق) عرّف:

```html
<script>
  window.SUPABASE_CONFIG = {
    url: "https://<PROJECT_REF>.supabase.co",
    anonKey: "<ANON_KEY>",           // مفتاح anon العام فقط
    functionsUrl: "https://<PROJECT_REF>.supabase.co/functions/v1"
  };
</script>
```

وجود `window.SUPABASE_CONFIG` يفعّل محوّل المصادقة (PKCE) والنشر عبر
`publish-release` بدل الوضع المحلي التجريبي (انظر `ARCHITECTURE.md §7`).
**مفتاح `service_role` لا يوضع في أي ملف عميل ولا في أي مستودع — إطلاقاً.**

### 8) تشغيل الاختبارات

```bash
supabase test db          # يشغّل tests/rls_test.sql — المتوقع: 51/51 ok
```

## قرارات تنفيذية موثَّقة (اقرأها قبل التعديل)

1. **`current_app_role()` بدل `current_role()`**: `CURRENT_ROLE` كلمة محجوزة
   في SQL القياسي ولا تصلح اسم دالة — الدلالة والعقد كما طُلبا، والاسم فقط
   مُكيَّف. جميع الدوال المساعدة `security definer` مع
   `set search_path = public, pg_temp` و`grant execute` مقيّد.
2. **بصمة `sha256` الخادمية**: تُحسب بـ `extensions.digest` على الشكل القانوني
   لـ `jsonb` في Postgres (باستثناء مفتاحي `release` و`validation`). ترتيب
   مفاتيح `jsonb` يختلف عن `JSON.stringify` في المتصفح، فبصمة الخادم هي
   المرجع الخادمي ولا تُقارن حرفياً ببصمة العميل في `store.js`.
3. **لا `force row level security`**: دوال `security definer` المملوكة لمالك
   الجداول هي قناة الكتابة الوحيدة على جداول النشر؛ ومحفّزات الحصانة في
   `0001` ترفض تعديل/حذف التدقيق والإصدارات حتى عن المالك نفسه.
4. **قراءة تاريخ الإصدارات** مُنحت لـ `publisher`/`admin` فقط (فوق نص العقد
   الأدنى) لأن شاشتي «التاريخ» و«التراجع» تحتاجانها — قراءة صرفة، والكتابة
   محجوبة عن الجميع.
5. **عقيدة عدم التلفيق على الخادم**: ما دامت `strategy.status = "pending_source"`
   فالنشر يتطلب إقراراً موقَّعاً (`waivers["strategy.pending"] = {by, at}`)
   وإلا رفضته الدالة بـ `waivers_required` — مرآة بوابات `validate.js`
   المنذرة، ولا نشر بتجاهل صامت.
6. **الفحوص داخل SQL تقارن الحمولة بذاتها** (مجاميع القطاعات بإجماليات
   الحمولة نفسها): الخادم لا يثق بحساب العميل، ولا رقم مكتوب نصاً في الكود.

## مصفوفة الأدوار المفروضة

| العملية | anon | viewer | editor | publisher | admin |
|---|---|---|---|---|---|
| قراءة المؤشر والإصدار المنشور الحالي | ✓ | ✓ | ✓ | ✓ | ✓ |
| قراءة تاريخ الإصدارات كاملاً | ✗ | ✗ | ✗ | ✓ | ✓ |
| CRUD على المسودات | ✗ | ✗ | ✓ | ✓ | ✓ |
| تنفيذ `publish_release` / `rollback_to` | ✗ | ✗ | ✗ | ✓ | ✓ |
| قراءة سجل التدقيق | ✗ | ✗ | ✗ | ✓ | ✓ |
| إدارة `user_roles` (عدا صفه هو) | ✗ | ✗ | ✗ | ✗ | ✓ |
| كتابة مباشرة على releases/presentations/audit | ✗ | ✗ | ✗ | ✗ | ✗ |

الكتابة على جداول النشر الثلاثة ممنوعة عن **كل** الأدوار — بما فيها
`admin` — ولا تمر إلا عبر دالتي `security definer`.
