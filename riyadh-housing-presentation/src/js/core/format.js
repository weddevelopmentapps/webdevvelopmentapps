/* format.js — التنسيق العربي المركزي
   قواعد ملزمة من التكليف:
   • نظام أرقام واحد (لاتيني) وفاصل آلاف واحد (,) وعلامة النسبة العربية ٪.
   • «مليون» و«ألف» للأرقام التنفيذية البارزة فقط؛ القيم الدقيقة في التفاصيل.
   • توحيد لحاق الوحدة بالقيمة (سرير بعد الأرقام المجردة — لا تناوب عشوائي مع «سريراً»).
   • تطابق العدد والمعدود في النصوص الديناميكية (لا «8 مبادرة»).
   كل رقم ظاهر في الواجهة يمر من هنا — ممنوع التنسيق اليدوي في المشاهد. */
"use strict";

RH.core.fmt = (function () {
  const NBSP = " ";

  /** فاصل آلاف لاتيني: 1,420,000 */
  function int(n) {
    if (n == null || Number.isNaN(n)) return "—";
    const neg = n < 0;
    const s = Math.abs(Math.round(n)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return (neg ? "−" : "") + s;
  }

  /** منزلة عشرية واحدة (تُمرَّر القيمة المقرّبة مركزياً أصلاً) */
  function dec1(n) {
    if (n == null || Number.isNaN(n)) return "—";
    const v = Math.round(n * 10) / 10;
    return Number.isInteger(v) ? v + ".0" : String(v);
  }

  /** نسبة بعلامة ٪ العربية بعزل اتجاهي حتمي: «43.1٪» أينما وردت */
  function pct(n) {
    if (n == null || Number.isNaN(n)) return "—";
    return "\u2066" + dec1(n) + "٪\u2069";
  }

  /** صيغة تنفيذية مختصرة: 1.42 مليون / 612.4 ألف — للبطولات فقط */
  function compact(n) {
    if (n == null || Number.isNaN(n)) return "—";
    if (Math.abs(n) >= 1_000_000) {
      const v = Math.round(n / 10_000) / 100;
      return String(v) + NBSP + "مليون";
    }
    if (Math.abs(n) >= 10_000) {
      const v = Math.round(n / 100) / 10;
      return (Number.isInteger(v) ? String(v) : String(v)) + NBSP + "ألف";
    }
    return int(n);
  }

  /** قيمة + وحدة موحدة اللحاق: unitAfter(612400, "سرير") → «612,400 سرير» */
  function unitAfter(n, unit) {
    return int(n) + NBSP + unit;
  }

  /** تطابق العدد والمعدود العربي الحقيقي.
      countNoun(5, {one:"رخصة واحدة", two:"رخصتان", few:"رخص", many:"رخصة"}) → «5 رخص» */
  function countNoun(n, forms) {
    if (n == null || Number.isNaN(n)) return "—";
    if (n === 0) return forms.zero || ("لا " + forms.many);
    if (n === 1) return forms.one;
    if (n === 2) return forms.two;
    const tail = n % 100;
    if (tail === 0) return int(n) + NBSP + (forms.hundred || forms.many); // مضاعفات المئة: مفرد مجرور
    if (tail >= 3 && tail <= 10) return int(n) + NBSP + forms.few;
    return int(n) + NBSP + forms.many;
  }

  const NOUNS = {
    bed: { one: "سرير واحد", two: "سريران", few: "أسرّة", many: "سريراً", hundred: "سرير", zero: "لا أسرّة" },
    licence: { one: "رخصة واحدة", two: "رخصتان", few: "رخص", many: "رخصة", hundred: "رخصة" },
    visit: { one: "زيارة واحدة", two: "زيارتان", few: "زيارات", many: "زيارة", hundred: "زيارة" },
    violation: { one: "مخالفة واحدة", two: "مخالفتان", few: "مخالفات", many: "مخالفة", hundred: "مخالفة" },
    monitor: { one: "مراقب واحد", two: "مراقبان", few: "مراقبين", many: "مراقباً", hundred: "مراقب" },
    decision: { one: "قرار واحد", two: "قراران", few: "قرارات", many: "قراراً", hundred: "قرار" },
    initiative: { one: "مبادرة واحدة", two: "مبادرتان", few: "مبادرات", many: "مبادرة", hundred: "مبادرة" },
    pillar: { one: "ركيزة واحدة", two: "ركيزتان", few: "ركائز", many: "ركيزة", hundred: "ركيزة" },
    indicator: { one: "مؤشر واحد", two: "مؤشران", few: "مؤشرات", many: "مؤشراً", hundred: "مؤشر" },
    sector: { one: "قطاع واحد", two: "قطاعان", few: "قطاعات", many: "قطاعاً", hundred: "قطاع" },
  };
  function noun(n, key) { return countNoun(n, NOUNS[key]); }

  /** تاريخ ميلادي عربي: 2026-08-16 → «16 أغسطس 2026» */
  const AR_MONTHS = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  function date(iso) {
    if (!iso) return "—";
    const m = /^(\d{4})-(\d{2})(?:-(\d{2}))?/.exec(iso);
    if (!m) return iso;
    const y = m[1], mon = AR_MONTHS[parseInt(m[2], 10) - 1];
    return m[3] ? `${parseInt(m[3], 10)} ${mon} ${y}` : `${mon} ${y}`;
  }

  /** أجزاء الصيغة التنفيذية للعرض المرن: {num:"1.42", word:"مليون"} */
  function compactParts(n) {
    if (n == null || Number.isNaN(n)) return { num: "—", word: "" };
    if (Math.abs(n) >= 1_000_000) {
      return { num: String(Math.round(n / 10_000) / 100), word: "مليون" };
    }
    if (Math.abs(n) >= 10_000) {
      return { num: String(Math.round(n / 100) / 10), word: "ألف" };
    }
    return { num: int(n), word: "" };
  }

  /* ── العزل الاتجاهي ومقاطع العنونة المركّبة ──────────────────────────────
     خطأ جذري صُحّح هنا (بلاغ «مسافات مفقودة بين الأرقام والكلمات العربية»):
     العزل كان LRI دائماً — وLRI يفرض أساساً **يسارياً** على ما بداخله. فإن
     حوى المقطع كلمةً عربية («0 من 14») انقلب ترتيب مقاطعه بصرياً («من 14 0»)
     فبدت الأرقام ملتصقة بالكلمات بلا مسافة وبلا معنى. القاعدة الصحيحة:
       • مقطع رقمي/لاتيني محض      → LRI (\u2066): يبقى الرقم يسارياً داخل RTL.
       • عبارة مختلطة فيها حرف عربي → FSI (\u2068): «أول قوي» يستنبط الأساس من
         الحرف العربي فيبقى ترتيب العبارة عربياً سليماً مهما كان اتجاه الوعاء.
     FSI مطابق لـLRI تماماً حين لا حرف قوي داخله، فالتبديل آمن على كل نداء
     قائم. PDI (\u2069) يغلق الاثنين، وكلها محارف تحكم صفرية العرض تعمل في
     DOM وCanvas معاً. */

  /** حرف عربي (الأبجدية + الصور العرضية) — يميّز العبارة المختلطة عن الرقم */
  const RE_AR_LETTER =
    /[\u0620-\u064A\u066E-\u06D3\u06FA-\u06FF\uFB50-\uFDFF\uFE70-\uFEFC]/;

  /** معزول أصلاً؟ (يبدأ بـLRI/RLI/FSI وينتهي بـPDI) — فلا يُعزل مرتين */
  const isIsolated = (s) => /^[\u2066-\u2068][\s\S]*\u2069$/.test(String(s));

  function iso(s) {
    const t = String(s);
    if (t === "") return t;
    if (isIsolated(t)) return t;
    return (RE_AR_LETTER.test(t) ? "\u2068" : "\u2066") + t + "\u2069";
  }

  /**
   * مقطع عنونة موحّد «تسمية + قيمة + وحدة» — الفواصل **صريحة** والقيمة معزولة.
   * هذا هو المسلك الوحيد لتركيب أي وسم يجمع رقماً بكلمة عربية، فلا يتكرر
   * اللصق الذي أنتج «الياقات الزرقاء1,164,400 سرير».
   *   seg({ label: "الياقات الزرقاء", value: int(1164400), unit: "سرير" })
   *     → «الياقات الزرقاء 1,164,400 سرير» (بفراغ غير فاصل وعزل حول الرقم)
   * ويقبل نصاً جاهزاً (مثل ناتج pct) فيمرّره كما هو بعد قصّ الفراغ.
   */
  function seg(spec) {
    if (spec == null || spec === false || spec === "") return "";
    if (typeof spec === "string" || typeof spec === "number") {
      return String(spec).trim();
    }
    const label = spec.label == null ? "" : String(spec.label).trim();
    const unit = spec.unit == null ? "" : String(spec.unit).trim();
    const raw = spec.value == null ? "" : String(spec.value).trim();
    const value = raw === "" ? "" : iso(raw);
    return [label, value, unit].filter((p) => p !== "").join(NBSP);
  }

  /** عبارة من مقاطع بفاصل ظاهر — يتخطى الفارغ ولا يلصق مقطعين أبداً */
  function caption(parts, sep) {
    const s = sep == null ? " \u00B7 " : sep;
    return (Array.isArray(parts) ? parts : [parts])
      .map(seg).filter((t) => t !== "").join(s);
  }

  /** «n من N» — النمط المتكرر عبر التبويبات الخمسة، معزولاً كعبارة **واحدة**.
      العزل يلف العبارة كلها لا كل رقم على حدة: عزل الأرقام منفردةً يترك «من»
      خارج أي عزل فينقلب ترتيب العبارة داخل أي وعاء يساري. الفاصل فراغ عادي
      (الأوعية الثلاثة التي تعرضها ‎white-space: nowrap‎ فلا تنكسر). */
  function ofTotal(n, total) {
    return iso(int(n) + " \u0645\u0646 " + int(total));
  }

  /** ضم تسميات أشهر متعددة بإفصاح كامل — لتسميات الذروة عند التعادل
      (إصلاح مراجعة الجولة 4): «ذروة المخالفات 317 في يوليو 2026» وحدها
      توحي بانحسارٍ بعد يوليو لم يحدث والذروة قائمة في أغسطس أيضاً.
      السنة المشتركة تُدمج: ["يوليو 2026","أغسطس 2026"] → «يوليو وأغسطس 2026»؛
      وعند اختلاف السنوات تُعطف التسميات كاملة. */
  function monthsList(labels) {
    if (!labels || !labels.length) return "—";
    if (labels.length === 1) return String(labels[0]);
    const parts = labels.map((l) => {
      const m = /^(.*?)\s+(\d{4})$/.exec(String(l).trim());
      return m ? { name: m[1], year: m[2] } : { name: String(l), year: null };
    });
    const oneYear = parts.every((p) => p.year && p.year === parts[0].year);
    if (oneYear) return parts.map((p) => p.name).join(" و") + NBSP + parts[0].year;
    return labels.map(String).join(" و");
  }

  return {
    int, dec1, pct, compact, compactParts, unitAfter, countNoun, noun, date,
    iso, isIsolated, seg, caption, ofTotal, monthsList, AR_MONTHS, NBSP,
  };
})();
