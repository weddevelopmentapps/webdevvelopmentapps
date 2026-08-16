// ═══════════════════════════════════════════════════════════════════════════
// publish-release — دالة طرفية (Supabase Edge Function / Deno)
// ═══════════════════════════════════════════════════════════════════════════
// تتحقق من جلسة JWT ومن دور الناشر عبر user_roles ثم تستدعي RPC
// publish_release وتعيد نتيجتها. ترفض بلا جلسة (401) وبلا دور ناشر (403).
//
// ⚠️ قاعدة أمنية صلبة: لا مفتاح service-role في العميل أبداً — ولا حتى هنا.
// هذه الدالة تُنشئ عميل Supabase بمفتاح anon مع تمرير Authorization الخاص
// بالمستدعي، فتبقى RLS وبوابة الدور داخل دالة SQL (security definer) هي
// السلطة الوحيدة. فحص الدور هنا طبقة مبكرة مهذّبة للرسائل، لا بديلاً عن
// الفرض في قاعدة البيانات.
//
// النشر: supabase functions deploy publish-release
// (التحقق من JWT على البوابة مفعّل افتراضياً — لا تعطّله بـ --no-verify-jwt)
// ═══════════════════════════════════════════════════════════════════════════

import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** تحويل رسائل استثناءات SQL المعرَّفة في 0003 إلى أكواد HTTP دقيقة */
function statusForDbError(message: string): number {
  if (message.includes("base_conflict")) return 409; // تعارض الأساس
  if (message.includes("validation_failed")) return 422; // فحوص جوهرية فاشلة
  if (message.includes("waivers_required")) return 422; // إنذارات بلا إقرار
  if (message.includes("draft_not_found")) return 404;
  if (message.includes("forbidden")) return 403;
  return 500;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  // (1) لا جلسة → رفض فوري
  const authorization = req.headers.get("Authorization");
  if (!authorization) {
    return json(
      { error: "no_session", message: "مطلوب جلسة مصادقة سارية." },
      401,
    );
  }

  // (2) عميل بمفتاح anon + هوية المستدعي — لا service-role إطلاقاً (انظر أعلاه)
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    },
  );

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData?.user) {
    return json(
      { error: "invalid_session", message: "جلسة غير صالحة أو منتهية." },
      401,
    );
  }

  // (3) دور الناشر عبر user_roles — سياسة RLS تسمح للمستخدم بقراءة صفه فقط
  const { data: roleRow, error: roleError } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id)
    .maybeSingle();
  if (roleError) {
    return json({ error: "role_lookup_failed", message: roleError.message }, 500);
  }
  if (!roleRow || !["publisher", "admin"].includes(roleRow.role)) {
    return json(
      { error: "forbidden", message: "النشر مقصور على دوري publisher وadmin." },
      403,
    );
  }

  // (4) جسم الطلب: { draft_id, expected_base, waivers }
  let body: {
    draft_id?: string;
    expected_base?: string | null;
    waivers?: Record<string, unknown>;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_request", message: "جسم JSON غير صالح." }, 400);
  }
  if (!body.draft_id || !UUID_RE.test(body.draft_id)) {
    return json(
      { error: "bad_request", message: "draft_id مطلوب بصيغة UUID." },
      400,
    );
  }
  if (body.expected_base !== null && body.expected_base !== undefined &&
    typeof body.expected_base !== "string") {
    return json(
      { error: "bad_request", message: "expected_base نص أو null." },
      400,
    );
  }
  if (body.waivers !== undefined &&
    (typeof body.waivers !== "object" || body.waivers === null ||
      Array.isArray(body.waivers))) {
    return json(
      { error: "bad_request", message: "waivers كائن JSON: {gate_id: {by, at}}." },
      400,
    );
  }

  // (5) استدعاء الدالة الموثوقة — الفرض النهائي كله داخل SQL
  const { data, error } = await supabase.rpc("publish_release", {
    p_draft_id: body.draft_id,
    p_expected_base: body.expected_base ?? null,
    p_waivers: body.waivers ?? {},
  });
  if (error) {
    return json(
      {
        error: error.message, // base_conflict | validation_failed | waivers_required | ...
        details: error.details ?? null,
        hint: error.hint ?? null,
      },
      statusForDbError(error.message ?? ""),
    );
  }

  // النتيجة: { id, sha256, published_at }
  return json({ ok: true, release: data }, 200);
});
