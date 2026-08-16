#!/usr/bin/env bash
# fetch_media.sh — جلب وسائط العرض المُحسَّنة إلى assets/media/ مع تحقق SHA-256
# ─────────────────────────────────────────────────────────────────────────────
# لماذا هذا الملف؟ سياسة الشبكة في بيئة بناء التسليم منعت تنزيل الوسائط المولدة
# إلى المستودع مباشرة، فوُلِّدت وحُسِّنت واستُضيفت على مسارات ثابتة، ويجلبها هذا
# السكربت من أي جهاز ذي اتصال طبيعي (جهاز العرض مثلاً) قبل البروفة.
# التطبيق يعمل كاملاً بدون هذه الملفات (بديل مدرَّج كودي) — لكنها الغلاف السينمائي المعتمد.
#
# الاستخدام:  bash tools/fetch_media.sh
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p assets/media

CDN="https://d2ol7oe51mr4n9.cloudfront.net/user_39Ow9EnYlPATc0d7kEzhjPIj2oa"

fetch() {
  local url="$1" out="$2" sha="$3"
  echo "⬇ $out"
  curl -fSL --retry 3 -o "assets/media/$out.tmp" "$url"
  local got
  got=$(sha256sum "assets/media/$out.tmp" | cut -d' ' -f1)
  if [ "$got" != "$sha" ]; then
    echo "✗ بصمة غير مطابقة لـ $out" >&2
    echo "  متوقع: $sha" >&2
    echo "  فعلي:  $got" >&2
    rm -f "assets/media/$out.tmp"
    exit 1
  fi
  mv "assets/media/$out.tmp" "assets/media/$out"
  echo "✓ $out ($(du -h "assets/media/$out" | cut -f1)) — البصمة مطابقة"
}

# ملصق الغلاف — 1920×1080، ‎402 KB (< حد 500KB)
fetch "$CDN/a8169305-2de9-468c-a86e-3cfafbc3d832.jpg" "cover-poster.jpg" \
  "7c93febe56aad2c92c350747e136bede1b7301d78ba5d1bdff2adf93cd7b4d43"

# حلقة الغلاف — 1920×1080، 9 ثوانٍ متواصلة (crossfade)، صامتة، ‎4.7 MB (< حد 12MB)
fetch "$CDN/dfc88558-791d-4114-9ee3-39565b89ed7d.mp4" "cover-loop.mp4" \
  "0d6ac702ce0c376927ede25e97ee889803293633caf4f87964597e87bd25c9bb"

# معالجة اختيارية للوحات (غير مستخدمة افتراضياً — الزخرفة الكودية هي الافتراضي)
fetch "$CDN/cb6a4b6b-26c1-4a51-a210-0171a6ce2b6b.jpg" "agenda-grid.jpg" \
  "01e6beecd632f3fe92adf70a620d8f7eafc2b7ae15a60ae2ef20c8625d8f514c"
fetch "$CDN/0f906a72-2e00-4b85-b7c6-781e65b52b73.jpg" "heritage.jpg" \
  "9b2afe89ddfb284c53fc60d9232fc12c77a0146e816d43ef274a7eddbce6688f"

echo
echo "✓ اكتمل الجلب. أعد البناء (python3 build.py) لتُنسخ الوسائط إلى dist/،"
echo "  ثم افتح index.html وتحقق من الغلاف، وراجع الوسائط بصرياً (MEDIA_MANIFEST.md §5)."
