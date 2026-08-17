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

  /** عزل اتجاهي حتمي للرموز المختلطة (أرقام + ٪) داخل نص عربي —
      LRI/PDI محارف تحكم صفرية العرض تعمل في DOM وCanvas معاً */
  const iso = (s) => "\u2066" + s + "\u2069";

  return { int, dec1, pct, compact, compactParts, unitAfter, countNoun, noun, date, iso, AR_MONTHS, NBSP };
})();
