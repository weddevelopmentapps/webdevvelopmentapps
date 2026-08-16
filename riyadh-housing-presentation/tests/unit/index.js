/* index.js — عبّارة توافق لأمر التشغيل المعتمد: node --test tests/unit/
   بعض بنى Node (ومنها بنية هذه البيئة 22.22.2) تعامل وسيطة المجلد كمسار ملف
   حرفي فتستدعيه بـ require — فيلتقط محلّل CJS هذا الملف ويضم حزم الاختبار
   الأربع تزامنياً (require(esm) متاح افتراضياً في Node ‏22.12+، ولا ملف منها
   يستخدم await علوياً). البنى التي تمسح المجلد وفق نمط ‎*.test.mjs تتجاهل
   هذا الملف كلياً فلا ازدواج تنفيذ في الحالتين. */
"use strict";

require("./derive.test.mjs");
require("./reconciliation.test.mjs");
require("./format.test.mjs");
require("./router.test.mjs");
require("./validate.test.mjs");
