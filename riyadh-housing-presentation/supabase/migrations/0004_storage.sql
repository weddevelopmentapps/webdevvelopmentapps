-- ═══════════════════════════════════════════════════════════════════════════
-- 0004_storage.sql — حاويتا التخزين وسياساتهما
-- ═══════════════════════════════════════════════════════════════════════════
--   source-files    : خاصة — ملفات المصدر (platform-data.xlsx) بامتداد xlsx
--                     حصراً؛ قراءة ورفع للمحرر فما فوق، حذف للمدير فقط،
--                     ولا تعديل (الملف المصدر دليل ثابت).
--   published-media : عامة القراءة — وسائط الإصدارات المنشورة (ملصقات،
--                     حلقات فيديو) الموسومة بمسار الإصدار rel-*/... حصراً؛
--                     الرفع للناشر والمدير، الحذف للمدير.
--   منع HTML/SVG/JS غير المعقم: قائمة سماح صريحة للامتدادات وأنواع MIME —
--   تقديم svg أو html من نطاق عام يفتح باب XSS، فلا مكان لهما هنا.
-- ═══════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- 1) الحاويتان — قيود الحجم ونوع MIME على مستوى الحاوية (حزام أول)
-- ───────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'source-files', 'source-files', false,
    26214400, -- 25MB — يتسع لورقة platform-data.xlsx بهامش مريح
    array['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
  ),
  (
    'published-media', 'published-media', true,
    15728640, -- 15MB — حلقة الفيديو المنشورة ≤ 12MB وفق خطة الأداء (QA_PLAN §7)
    array['image/png', 'image/jpeg', 'image/webp', 'image/avif',
          'video/mp4', 'video/webm']
  )
on conflict (id) do nothing;

-- ───────────────────────────────────────────────────────────────────────────
-- 2) سياسات storage.objects — الحزام الثاني: الدور + المسار + الامتداد
--    (لا سياسة update في الحاويتين: الملفات ثابتة بعد رفعها — لا خلط وسائط
--    بين إصدارات ولا استبدال أدلة مصدر.)
-- ───────────────────────────────────────────────────────────────────────────

-- source-files: قراءة للمحرر فما فوق
create policy "source_files_select_editor_up"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'source-files'
    and public.has_any_role(array['editor', 'publisher', 'admin'])
  );

-- source-files: رفع للمحرر فما فوق — امتداد xlsx حصراً (قائمة سماح: تمنع
-- html/svg/js وأي امتداد قابل للتقديم التنفيذي، وxlsm بوحداته الماكروية).
create policy "source_files_insert_editor_up"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'source-files'
    and public.has_any_role(array['editor', 'publisher', 'admin'])
    and lower(storage.extension(name)) = 'xlsx'
  );

-- source-files: الحذف للمدير فقط
create policy "source_files_delete_admin"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'source-files'
    and public.has_any_role(array['admin'])
  );

-- published-media: قراءة عامة (anon + authenticated) للملفات الموسومة بمسار
-- إصدار فقط — المجلد الأول في المسار يجب أن يكون معرّف إصدار (rel-*).
create policy "published_media_select_release_scoped"
  on storage.objects
  for select
  to anon, authenticated
  using (
    bucket_id = 'published-media'
    and (storage.foldername(name))[1] like 'rel-%'
  );

-- published-media: الرفع للناشر والمدير — تحت مسار إصدار، وبامتدادات وسائط
-- معقمة حصراً (لا svg ولا html ولا أي شيء ينفَّذ في المتصفح).
create policy "published_media_insert_publisher_up"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'published-media'
    and public.has_any_role(array['publisher', 'admin'])
    and (storage.foldername(name))[1] like 'rel-%'
    and lower(storage.extension(name)) = any (
      array['png', 'jpg', 'jpeg', 'webp', 'avif', 'mp4', 'webm']
    )
  );

-- published-media: الحذف للمدير فقط
create policy "published_media_delete_admin"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'published-media'
    and public.has_any_role(array['admin'])
  );
