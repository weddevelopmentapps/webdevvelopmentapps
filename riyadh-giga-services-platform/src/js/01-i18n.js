/* ============================================================
   i18n — bilingual engine. Arabic (RTL) is the primary language,
   English (LTR) secondary. Domain data is bilingual at the data
   level ({ar,en}); UI chrome uses this dictionary via t(key).
   ============================================================ */
"use strict";

(function () {
  var LANG_KEY = "rgp.lang";

  var DICT = {
    /* ---- brand ---- */
    "brand.name":            { ar: "منصة الخدمات البلدية للمشاريع الكبرى", en: "Giga-Projects Municipal Services Platform" },
    "brand.short":           { ar: "الخدمات البلدية للمشاريع الكبرى", en: "Giga Municipal Services" },
    "brand.owner":           { ar: "أمانة منطقة الرياض", en: "Riyadh Region Municipality" },
    "brand.tagline":         { ar: "البوابة الموحدة لتقديم الخدمات البلدية للمشاريع الكبرى في مدينة الرياض ومتابعتها.", en: "The unified gateway for submitting and tracking municipal services for giga projects in Riyadh." },

    /* ---- common ---- */
    "common.search":         { ar: "بحث", en: "Search" },
    "common.all":            { ar: "الكل", en: "All" },
    "common.none":           { ar: "لا يوجد", en: "None" },
    "common.save":           { ar: "حفظ", en: "Save" },
    "common.cancel":         { ar: "إلغاء", en: "Cancel" },
    "common.confirm":        { ar: "تأكيد", en: "Confirm" },
    "common.back":           { ar: "رجوع", en: "Back" },
    "common.next":           { ar: "التالي", en: "Continue" },
    "common.previous":       { ar: "السابق", en: "Previous" },
    "common.close":          { ar: "إغلاق", en: "Close" },
    "common.view":           { ar: "عرض", en: "View" },
    "common.details":        { ar: "التفاصيل", en: "Details" },
    "common.edit":           { ar: "تعديل", en: "Edit" },
    "common.delete":         { ar: "حذف", en: "Delete" },
    "common.add":            { ar: "إضافة", en: "Add" },
    "common.print":          { ar: "طباعة", en: "Print" },
    "common.export":         { ar: "تصدير البيانات", en: "Export data" },
    "common.import":         { ar: "استيراد", en: "Import" },
    "common.reset":          { ar: "استرجاع بيانات العرض", en: "Reset demo data" },
    "common.required":       { ar: "إلزامي", en: "Required" },
    "common.optional":       { ar: "اختياري", en: "Optional" },
    "common.workdays":       { ar: "يوم عمل", en: "working days" },
    "common.days":           { ar: "يوم", en: "days" },
    "common.today":          { ar: "اليوم", en: "Today" },
    "common.of":             { ar: "من", en: "of" },
    "common.more":           { ar: "المزيد", en: "More" },
    "common.showAll":        { ar: "عرض الكل", en: "Show all" },
    "common.signin":         { ar: "تسجيل الدخول", en: "Sign in" },
    "common.signout":        { ar: "تسجيل الخروج", en: "Sign out" },
    "common.language":       { ar: "English", en: "العربية" },
    "common.loading":        { ar: "جارٍ التحميل…", en: "Loading…" },
    "common.copied":         { ar: "تم النسخ", en: "Copied" },
    "common.noResults":      { ar: "لا توجد نتائج مطابقة", en: "No matching results" },
    "common.notFound":       { ar: "الصفحة غير موجودة", en: "Page not found" },
    "common.fees":           { ar: "الرسوم", en: "Fees" },
    "common.sla":            { ar: "مدة الإنجاز", en: "Service level" },
    "common.status":         { ar: "الحالة", en: "Status" },
    "common.date":           { ar: "التاريخ", en: "Date" },
    "common.actions":        { ar: "الإجراءات", en: "Actions" },
    "common.demo":           { ar: "نسخة تجريبية للعرض — البيانات افتراضية", en: "Demonstration build — sample data" },

    /* ---- roles & personas ---- */
    "role.project_rep":       { ar: "ممثل مشروع", en: "Project representative" },
    "role.amanah_specialist": { ar: "أخصائي بلدي", en: "Municipal specialist" },
    "role.platform_manager":  { ar: "مكتب المشاريع الكبرى", en: "Giga Projects Office" },
    "role.external_entity":   { ar: "جهة خارجية", en: "External entity" },
    "role.viewer":            { ar: "مستخدم مشاهد", en: "Executive viewer" },
    "persona.giga_entity":    { ar: "جهة مشروع كبير", en: "Giga-project entity" },
    "persona.developer":      { ar: "مطور عقاري", en: "Real-estate developer" },
    "persona.investor":       { ar: "مستثمر عقاري", en: "Real-estate investor" },
    "persona.operator":       { ar: "مدير أصول وتشغيل", en: "Asset manager / operator" },
    "persona.engineering_office": { ar: "مكتب هندسي", en: "Engineering office" },

    /* ---- request states ---- */
    "state.draft":            { ar: "مسودة", en: "Draft" },
    "state.submitted":        { ar: "مقدَّم", en: "Submitted" },
    "state.screening":        { ar: "فرز أولي", en: "Screening" },
    "state.in_review":        { ar: "قيد الدراسة", en: "In review" },
    "state.returned":         { ar: "مُعاد للاستكمال", en: "Returned" },
    "state.resubmitted":      { ar: "أُعيد التقديم", en: "Resubmitted" },
    "state.external_review":  { ar: "لدى الجهات الخارجية", en: "External review" },
    "state.decision_due":     { ar: "قرار مستحق", en: "Decision due" },
    "state.approved":         { ar: "معتمد", en: "Approved" },
    "state.rejected":         { ar: "مرفوض", en: "Declined" },
    "state.cancelled":        { ar: "ملغى", en: "Cancelled" },
    "state.closed":           { ar: "مغلق", en: "Closed" },

    /* ---- SLA bands ---- */
    "sla.ok":                 { ar: "ضمن المدة", en: "On track" },
    "sla.amber":              { ar: "اقتراب الموعد", en: "Approaching due" },
    "sla.red":                { ar: "متجاوز", en: "Overdue" },
    "sla.paused":             { ar: "متوقف مؤقتًا بانتظار العميل", en: "Paused — awaiting customer" },
    "sla.remaining":          { ar: "المتبقي", en: "Remaining" },
    "sla.due":                { ar: "تاريخ الاستحقاق", en: "Due date" },
    "sla.elapsed":            { ar: "المنقضي", en: "Elapsed" },
    "sla.fastTrack":          { ar: "أولوية المشاريع الكبرى", en: "Giga fast-track" },

    /* ---- journey phases ---- */
    "phase.before":           { ar: "قبل التطوير", en: "Before development" },
    "phase.during":           { ar: "أثناء التطوير", en: "During development" },
    "phase.after":            { ar: "بعد التطوير", en: "After development" },

    /* ---- landing ---- */
    "landing.heroTitle":      { ar: "منصة الخدمات البلدية للمشاريع الكبرى", en: "The Municipal Services Platform for Giga Projects" },
    "landing.heroSub":        { ar: "المنصة الموحدة لأمانة منطقة الرياض لاستقبال طلبات الخدمات البلدية للمشاريع الكبرى والمطورين والمستثمرين ومديري الأصول، ومعالجتها ومتابعتها وفق مدد زمنية معتمدة.", en: "Riyadh Region Municipality's unified platform for receiving, processing and tracking municipal service requests for giga projects, developers, investors and asset managers within approved timelines." },
    "landing.cta":            { ar: "تقديم طلب", en: "Submit a request" },
    "landing.explore":        { ar: "استعراض الخدمات", en: "Browse services" },
    "landing.journeyTitle":   { ar: "مراحل رحلة التطوير", en: "Development journey phases" },
    "landing.journeySub":     { ar: "اختر مرحلة مشروعك لعرض الخدمات المتاحة فيها", en: "Select your project's phase to view its services" },
    "landing.servicesTitle":  { ar: "دليل الخدمات", en: "Service catalog" },
    "landing.servicesSub":    { ar: "خدمات بلدية موثقة بمتطلباتها ومددها الزمنية", en: "Documented municipal services with requirements and timelines" },
    "landing.howTitle":       { ar: "آلية تقديم الطلب ومعالجته", en: "How requests are submitted and processed" },
    "landing.how1":           { ar: "تسجيل المشروع واختيار الخدمة", en: "Register the project and select a service" },
    "landing.how2":           { ar: "تعبئة نموذج الطلب وإرفاق المستندات", en: "Complete the request form and attach the documents" },
    "landing.how3":           { ar: "متابعة الطلب وفق المدد الزمنية المعتمدة", en: "Track the request against the approved timelines" },
    "landing.how4":           { ar: "صدور القرار واستلام الوثيقة الرسمية", en: "Receive the decision and the official document" },
    "landing.statsProjects":  { ar: "مشروعًا كبيرًا ممكّنًا", en: "Giga projects enabled" },
    "landing.statsServices":  { ar: "خدمة بلدية موحدة", en: "Unified municipal services" },
    "landing.statsOnTime":    { ar: "الالتزام بالمواعيد", en: "On-time performance" },
    "landing.statsAvg":       { ar: "متوسط زمن المعالجة (يوم عمل)", en: "Avg processing (working days)" },
    "landing.entitiesTitle":  { ar: "بالتكامل مع الجهات ذات العلاقة", en: "Coordinated with partner entities" },
    "landing.govTitle":       { ar: "حوكمة معتمدة من مكتب المشاريع الكبرى", en: "Governed by the Giga Projects Office" },
    "landing.govSub":         { ar: "مسار موحد للطلبات، ومسؤوليات محددة، وآلية تصعيد معتمدة تصل إلى مكتب الأمين", en: "A unified request route, defined responsibilities, and an approved escalation path up to the Mayor's office" },

    /* ---- login ---- */
    "login.title":            { ar: "تسجيل الدخول إلى المنصة", en: "Sign in to the platform" },
    "login.sub":              { ar: "اختر هوية تجريبية أو أدخل بيانات الدخول", en: "Choose a demo identity or enter credentials" },
    "login.demoIdentities":   { ar: "هويات العرض التجريبي", en: "Demonstration identities" },
    "login.email":            { ar: "البريد الإلكتروني", en: "Email" },
    "login.password":         { ar: "كلمة المرور", en: "Password" },
    "login.nafath":           { ar: "الدخول عبر النفاذ الوطني الموحد", en: "Sign in with Nafath SSO" },
    "login.nafathNote":       { ar: "يتوفر في النسخة المرتبطة بالأنظمة الحكومية", en: "Available in the government-connected release" },
    "login.badCreds":         { ar: "بيانات الدخول غير صحيحة", en: "Incorrect credentials" },
    "login.customers":        { ar: "المستفيدون", en: "Customers" },
    "login.staff":            { ar: "منسوبو الأمانة", en: "Municipality staff" },

    /* ---- customer portal ---- */
    "portal.welcome":         { ar: "مرحبًا", en: "Welcome" },
    "portal.myProjects":      { ar: "مشاريعي", en: "My projects" },
    "portal.activeRequests":  { ar: "طلباتي النشطة", en: "Active requests" },
    "portal.newRequest":      { ar: "طلب خدمة جديد", en: "New service request" },
    "portal.myRequests":      { ar: "طلباتي", en: "My requests" },
    "portal.drafts":          { ar: "المسودات", en: "Drafts" },
    "portal.needsAction":     { ar: "بانتظار إجراءك", en: "Needs your action" },
    "portal.journeyExplorer": { ar: "مستكشف الرحلة", en: "Journey explorer" },
    "portal.recentActivity":  { ar: "آخر المستجدات", en: "Recent activity" },
    "portal.noRequests":      { ar: "لا توجد طلبات مسجلة حتى الآن. يمكنك تقديم طلب خدمة جديد لمشروعك.", en: "No requests registered yet. You can submit a new service request for your project." },
    "portal.viewCatalog":     { ar: "دليل الخدمات", en: "Service catalog" },

    /* ---- wizard ---- */
    "wizard.title":           { ar: "طلب خدمة جديد", en: "New service request" },
    "wizard.step1":           { ar: "المشروع والمرحلة", en: "Project & phase" },
    "wizard.step2":           { ar: "الخدمة", en: "Service" },
    "wizard.step3":           { ar: "بيانات الطلب", en: "Request details" },
    "wizard.step4":           { ar: "المستندات", en: "Documents" },
    "wizard.step5":           { ar: "المراجعة والتقديم", en: "Review & submit" },
    "wizard.chooseProject":   { ar: "اختر المشروع", en: "Choose the project" },
    "wizard.choosePhase":     { ar: "اختر مرحلة الرحلة", en: "Choose the journey phase" },
    "wizard.chooseService":   { ar: "اختر الخدمة", en: "Choose the service" },
    "wizard.prereqs":         { ar: "المتطلبات المسبقة", en: "Prerequisites" },
    "wizard.prereqConfirm":   { ar: "أقر بتوفر المتطلبات المسبقة أعلاه", en: "I confirm the prerequisites above are met" },
    "wizard.attach":          { ar: "أرفق المستندات المطلوبة", en: "Attach the required documents" },
    "wizard.attachHint":      { ar: "اسحب الملف أو انقر للاختيار", en: "Drag a file or click to browse" },
    "wizard.attached":        { ar: "مرفق", en: "Attached" },
    "wizard.missingDocs":     { ar: "أرفق جميع المستندات الإلزامية للمتابعة", en: "Attach all required documents to continue" },
    "wizard.reviewNote":      { ar: "راجع بيانات طلبك قبل التقديم. بعد التقديم يبدأ احتساب مدة الإنجاز.", en: "Review your request before submitting. The SLA clock starts on submission." },
    "wizard.declaration":     { ar: "أقر بأن جميع البيانات والمستندات المقدمة في هذا الطلب صحيحة، وأتحمل المسؤولية النظامية عن أي خطأ أو نقص فيها.", en: "I declare that all information and documents submitted in this request are accurate, and I bear regulatory responsibility for any error or omission." },
    "wizard.submit":          { ar: "تقديم الطلب", en: "Submit request" },
    "wizard.saveDraft":       { ar: "حفظ كمسودة", en: "Save as draft" },
    "wizard.submitted":       { ar: "تم تقديم طلبكم بنجاح", en: "Your request was submitted" },
    "wizard.submittedSub":    { ar: "رقم الطلب", en: "Request number" },
    "wizard.expectedBy":      { ar: "الإنجاز المتوقع بحلول", en: "Expected completion by" },
    "wizard.track":           { ar: "متابعة الطلب", en: "Track request" },
    "wizard.fastTrackNote":   { ar: "هذا الطلب مؤهل لمسار أولوية المشاريع الكبرى، وتُطبق عليه مدة إنجاز مخفضة", en: "This request qualifies for the giga priority lane; a reduced service level applies" },

    /* ---- request detail ---- */
    "req.number":             { ar: "رقم الطلب", en: "Request no." },
    "req.service":            { ar: "الخدمة", en: "Service" },
    "req.project":            { ar: "المشروع", en: "Project" },
    "req.applicant":          { ar: "مقدم الطلب", en: "Applicant" },
    "req.assignee":           { ar: "الأخصائي المسؤول", en: "Assigned specialist" },
    "req.timeline":           { ar: "سجل الطلب", en: "Request timeline" },
    "req.formData":           { ar: "بيانات الطلب", en: "Request details" },
    "req.documents":          { ar: "المستندات", en: "Documents" },
    "req.decision":           { ar: "القرار", en: "Decision" },
    "req.documentNo":         { ar: "رقم الوثيقة", en: "Document no." },
    "req.regulationRef":      { ar: "السند النظامي", en: "Regulatory reference" },
    "req.missingItems":       { ar: "المطلوب استكماله", en: "Items to complete" },
    "req.resubmit":           { ar: "استكمال وإعادة التقديم", en: "Complete & resubmit" },
    "req.cancelReq":          { ar: "إلغاء الطلب", en: "Cancel request" },
    "req.printPermit":        { ar: "طباعة الوثيقة", en: "Print document" },
    "req.conditions":         { ar: "الاشتراطات", en: "Conditions" },
    "req.externalWith":       { ar: "لدى", en: "With" },
    "req.rate":               { ar: "تقييم الخدمة", en: "Rate the service" },
    "req.rateThanks":         { ar: "تم تسجيل تقييمكم، وسيُستفاد منه في تحسين الخدمة.", en: "Your rating has been recorded and will inform service improvement." },
    "req.closeReq":           { ar: "إغلاق الطلب", en: "Close request" },
    "req.satisfaction":       { ar: "رضا المستفيد", en: "Customer satisfaction" },

    /* ---- specialist ---- */
    "work.queue":             { ar: "قائمة الطلبات", en: "Request queue" },
    "work.myQueue":           { ar: "طلباتي المسندة", en: "My assignments" },
    "work.unassigned":        { ar: "غير مسندة", en: "Unassigned" },
    "work.priorityLane":      { ar: "مسار الأولوية", en: "Priority lane" },
    "work.claim":             { ar: "إسناد الطلب إليّ وبدء الفرز", en: "Claim & start screening" },
    "work.startReview":       { ar: "بدء المراجعة الفنية", en: "Start technical review" },
    "work.sendExternal":      { ar: "إحالة لجهة خارجية", en: "Refer to external entity" },
    "work.markDecision":      { ar: "جاهز للقرار", en: "Ready for decision" },
    "work.approve":           { ar: "اعتماد", en: "Approve" },
    "work.return":            { ar: "إعادة للعميل", en: "Return to customer" },
    "work.reject":            { ar: "رفض", en: "Decline" },
    "work.checklist":         { ar: "قائمة التحقق من المستندات", en: "Document checklist" },
    "work.verifyDoc":         { ar: "مطابق", en: "Verified" },
    "work.flagDoc":           { ar: "غير مطابق", en: "Not compliant" },
    "work.internalNotes":     { ar: "ملاحظات داخلية", en: "Internal notes" },
    "work.addNote":           { ar: "إضافة ملاحظة", en: "Add note" },
    "work.reassign":          { ar: "إعادة إسناد", en: "Reassign" },
    "work.approveTitle":      { ar: "اعتماد الطلب وإصدار الوثيقة", en: "Approve & issue document" },
    "work.approveNote":       { ar: "عند الاعتماد يصدر رقم وثيقة رسمي ويُشعر مقدم الطلب بذلك.", en: "On approval an official document number is issued and the applicant is notified." },
    "work.conditionsOpt":     { ar: "اشتراطات على الاعتماد (اختياري)", en: "Conditions on approval (optional)" },
    "work.returnTitle":       { ar: "إعادة الطلب للعميل", en: "Return to customer" },
    "work.returnNote":        { ar: "حدد البنود المطلوب استكمالها بدقة. تتوقف مدة الإنجاز حتى إعادة التقديم.", en: "List the items to be completed precisely. The SLA clock pauses until resubmission." },
    "work.returnItemPh":      { ar: "البند المطلوب استكماله…", en: "Item to complete…" },
    "work.addItem":           { ar: "إضافة بند", en: "Add item" },
    "work.rejectTitle":       { ar: "رفض الطلب", en: "Decline request" },
    "work.rejectNote":        { ar: "قرار الرفض نهائي، ويشترط لإصداره بيان السبب والسند النظامي، ويُعرضان لمقدم الطلب.", en: "Declining is final and requires a stated reason and regulatory reference, both shown to the applicant." },
    "work.reasonPh":          { ar: "سبب الرفض…", en: "Reason…" },
    "work.regulationPh":      { ar: "مثال: المادة (12) من لائحة اشتراطات البناء", en: "e.g., Article 12, Building Code Regulations" },
    "work.externalTitle":     { ar: "إحالة لجهات خارجية", en: "Refer to external entities" },
    "work.externalNote":      { ar: "حدد الجهات المطلوب أخذ مرئياتها قبل إصدار القرار.", en: "Choose the entities whose clearance is required before the decision." },
    "work.slaLeft":           { ar: "المتبقي على الاستحقاق", en: "Time to due" },
    "work.overdueBy":         { ar: "متجاوز بمقدار", en: "Overdue by" },
    "work.filters.state":     { ar: "الحالة", en: "State" },
    "work.filters.service":   { ar: "الخدمة", en: "Service" },
    "work.filters.priority":  { ar: "الأولوية", en: "Priority" },

    /* ---- GPO / manager ---- */
    "gpo.dashboard":          { ar: "لوحة القيادة", en: "Command dashboard" },
    "gpo.registry":           { ar: "سجل المشاريع الكبرى", en: "Giga-projects registry" },
    "gpo.map":                { ar: "خريطة مشاريع الرياض", en: "Riyadh projects map" },
    "gpo.challenges":         { ar: "التحديات والمعوقات", en: "Challenges & obstacles" },
    "gpo.reports":            { ar: "التقارير", en: "Reports" },
    "gpo.catalog":            { ar: "إدارة دليل الخدمات", en: "Catalog administration" },
    "gpo.audit":              { ar: "سجل التدقيق", en: "Audit log" },
    "gpo.kpis":               { ar: "مؤشرات الأداء", en: "Performance indicators" },
    "gpo.settings":           { ar: "الإعدادات", en: "Settings" },
    "kpi.avgProcessing":      { ar: "متوسط زمن المعالجة", en: "Avg processing time" },
    "kpi.slaCompliance":      { ar: "الالتزام بالمواعيد", en: "SLA compliance" },
    "kpi.challengeClosure":   { ar: "نسبة إغلاق التحديات", en: "Challenge closure" },
    "kpi.firstResponse":      { ar: "سرعة الاستجابة الأولى", en: "First response" },
    "kpi.satisfaction":       { ar: "رضا المشاريع", en: "Project satisfaction" },
    "kpi.enabledProjects":    { ar: "المشاريع الممكنة", en: "Enabled projects" },
    "kpi.openRequests":       { ar: "الطلبات النشطة", en: "Active requests" },
    "kpi.returnRate":         { ar: "معدل الإعادة", en: "Return rate" },
    "kpi.workdaysUnit":       { ar: "يوم عمل", en: "wd" },
    "gpo.byService":          { ar: "الطلبات حسب الخدمة", en: "Requests by service" },
    "gpo.byPhase":            { ar: "حسب مرحلة الرحلة", en: "By journey phase" },
    "gpo.byStatus":           { ar: "حسب الحالة", en: "By status" },
    "gpo.bySector":           { ar: "المشاريع حسب القطاع", en: "Projects by sector" },
    "gpo.trend":              { ar: "اتجاه الطلبات (12 أسبوعًا)", en: "Request trend (12 weeks)" },
    "gpo.slaByEntity":        { ar: "الالتزام حسب الإدارة", en: "Compliance by department" },
    "gpo.needsAttention":     { ar: "يتطلب تدخلًا", en: "Needs attention" },
    "gpo.escalations":        { ar: "التصعيدات", en: "Escalations" },
    "gpo.addProject":         { ar: "تسجيل مشروع", en: "Register project" },
    "gpo.editProject":        { ar: "تحديث بيانات المشروع", en: "Update project" },

    /* ---- challenges ---- */
    "ch.title":               { ar: "التحديات والمعوقات", en: "Challenges & obstacles" },
    "ch.new":                 { ar: "تسجيل تحدٍّ", en: "Log a challenge" },
    "ch.open":                { ar: "مفتوح", en: "Open" },
    "ch.in_progress":         { ar: "قيد المعالجة", en: "In progress" },
    "ch.escalated":           { ar: "مصعّد", en: "Escalated" },
    "ch.resolved":            { ar: "تمت المعالجة", en: "Resolved" },
    "ch.closed":              { ar: "مغلق", en: "Closed" },
    "ch.category":            { ar: "التصنيف", en: "Category" },
    "ch.owner":               { ar: "الجهة المسؤولة", en: "Responsible entity" },
    "ch.impact":              { ar: "الأثر", en: "Impact" },
    "ch.resolution":          { ar: "الحل المقترح", en: "Proposed resolution" },
    "ch.resolutionDays":      { ar: "مدة المعالجة", en: "Resolution time" },
    "ch.linkedRequest":       { ar: "الطلب المرتبط", en: "Linked request" },
    "ch.impact.high":         { ar: "عالٍ", en: "High" },
    "ch.impact.medium":       { ar: "متوسط", en: "Medium" },
    "ch.impact.low":          { ar: "منخفض", en: "Low" },

    /* ---- reports ---- */
    "rep.title":              { ar: "التقارير الدورية", en: "Periodic reports" },
    "rep.projects":           { ar: "تقرير حالة المشاريع الكبرى", en: "Giga-projects status report" },
    "rep.requests":           { ar: "تقرير الخدمات والطلبات", en: "Services & requests report" },
    "rep.challenges":         { ar: "تقرير التحديات", en: "Challenges report" },
    "rep.coordination":       { ar: "تقرير التنسيق بين الجهات", en: "Inter-entity coordination report" },
    "rep.generate":           { ar: "إنشاء التقرير", en: "Generate report" },
    "rep.period":             { ar: "الفترة", en: "Period" },
    "rep.generatedAt":        { ar: "أُنشئ في", en: "Generated" },
    "rep.confidential":       { ar: "وثيقة داخلية — أمانة منطقة الرياض", en: "Internal document — Riyadh Region Municipality" },

    /* ---- notifications ---- */
    "ntf.title":              { ar: "الإشعارات", en: "Notifications" },
    "ntf.markAll":            { ar: "تحديد الكل كمقروء", en: "Mark all read" },
    "ntf.empty":              { ar: "لا توجد إشعارات جديدة.", en: "No new notifications." },

    /* ---- external ---- */
    "ext.inbox":              { ar: "الإحالات الواردة", en: "Incoming referrals" },
    "ext.respond":            { ar: "تسجيل المرئيات", en: "Record clearance" },
    "ext.clear":              { ar: "لا مانع", en: "No objection" },
    "ext.remarks":            { ar: "ملاحظات الجهة", en: "Entity remarks" },
    "ext.responded":          { ar: "تم الرد", en: "Responded" },
    "ext.simNote":            { ar: "قناة تكامل محاكاة — تُستبدل بالربط الفعلي (GIS/CRM) في مرحلة الربط", en: "Simulated integration channel — replaced by live GIS/CRM connectors at integration phase" },

    /* ---- executive ---- */
    "exec.title":             { ar: "الملخص التنفيذي", en: "Executive summary" },
    "exec.sub":               { ar: "موجز مؤشرات تمكين المشاريع الكبرى المعد لمكتب الأمين", en: "Giga-project enablement summary for the Mayor's office" },

    /* ---- profile/settings ---- */
    "prof.title":             { ar: "الملف الشخصي", en: "Profile" },
    "prof.org":               { ar: "الجهة", en: "Organization" },
    "prof.dataTools":         { ar: "أدوات البيانات", en: "Data tools" },
    "prof.theme":             { ar: "المظهر", en: "Appearance" },
    "prof.theme.light":       { ar: "فاتح", en: "Light" },
    "prof.theme.dark":        { ar: "داكن", en: "Dark" },
    "prof.theme.auto":        { ar: "تلقائي", en: "Auto" },

    /* ---- toasts ---- */
    "toast.saved":            { ar: "تم الحفظ", en: "Saved" },
    "toast.draftSaved":       { ar: "حُفظت المسودة", en: "Draft saved" },
    "toast.submitted":        { ar: "تم تقديم الطلب", en: "Request submitted" },
    "toast.approved":         { ar: "تم اعتماد الطلب وإصدار الوثيقة", en: "Approved — document issued" },
    "toast.returned":         { ar: "أُعيد الطلب للعميل وتوقفت المدة", en: "Returned to customer — SLA paused" },
    "toast.rejected":         { ar: "تم رفض الطلب", en: "Request declined" },
    "toast.claimed":          { ar: "أُسند الطلب إليك", en: "Request assigned to you" },
    "toast.imported":         { ar: "تم استيراد البيانات", en: "Data imported" },
    "toast.importFail":       { ar: "تعذر الاستيراد — ملف غير صالح", en: "Import failed — invalid file" },
    "toast.resetDone":        { ar: "أُعيدت بيانات العرض الأصلية", en: "Demo data restored" },
    "toast.exportDone":       { ar: "تم تنزيل نسخة البيانات", en: "Data export downloaded" },
    "toast.challengeLogged":  { ar: "سُجّل التحدي وأُشعرت الجهة المسؤولة", en: "Challenge logged — owner notified" },
    "toast.needAllDocs":      { ar: "لا يمكن المتابعة قبل اكتمال المستندات", en: "Complete all documents first" },
    "toast.storageFull":      { ar: "تعذر الحفظ المحلي — المساحة ممتلئة", en: "Local save failed — storage full" }
  };

  var I18N = RGP.i18n = {
    lang: "ar",

    init: function () {
      try {
        var saved = localStorage.getItem(LANG_KEY);
        if (saved === "ar" || saved === "en") I18N.lang = saved;
      } catch (e) { /* default ar */ }
      I18N.applyDir();
    },

    t: function (key) {
      var e = DICT[key];
      if (!e) { console.warn("i18n missing:", key); return key; }
      return e[I18N.lang] || e.ar;
    },

    /* bilingual data-object accessor */
    d: function (obj) {
      if (obj == null) return "";
      if (typeof obj === "string") return obj;
      return obj[I18N.lang] || obj.ar || obj.en || "";
    },

    toggle: function () {
      I18N.lang = I18N.lang === "ar" ? "en" : "ar";
      try { localStorage.setItem(LANG_KEY, I18N.lang); } catch (e) { /* noop */ }
      I18N.applyDir();
      RGP.bus.emit("lang:changed", I18N.lang);
    },

    applyDir: function () {
      var rtl = I18N.lang === "ar";
      document.documentElement.setAttribute("dir", rtl ? "rtl" : "ltr");
      document.documentElement.setAttribute("lang", I18N.lang);
    },

    dir: function () { return I18N.lang === "ar" ? "rtl" : "ltr"; }
  };

  /* global shorthands used across view modules */
  window.t = I18N.t;
  window.td = I18N.d;
})();
