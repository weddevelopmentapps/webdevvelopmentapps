# -*- coding: utf-8 -*-
"""Seed generator for منصة الرياض الموحدة لتمكين المشاريع الكبرى.

Merges the RMUN domain catalog (catalog.json — authored by the municipal
domain authority) with demo users, journeys, requests, challenges,
notifications and audit history into data.json (window.SEED).

Reference date for the demo narrative: today (relative dates).
Run: python3 generate_data.py && python3 build.py
"""
import json, os, datetime

HERE = os.path.dirname(os.path.abspath(__file__))
CATALOG = json.load(open(os.path.join(HERE, "catalog.json"), encoding="utf-8"))

TODAY = datetime.date.today()

HOLIDAYS = {"2026-02-22", "2026-03-19", "2026-03-20", "2026-03-21", "2026-03-22",
            "2026-05-26", "2026-05-27", "2026-05-28", "2026-09-23"}

def iso(d): return d.isoformat()
def days_ago(n): return TODAY - datetime.timedelta(days=n)
def is_workday(d):
    return d.weekday() not in (4, 5) and iso(d) not in HOLIDAYS  # Fri=4? NO: Mon=0..Sun=6 → Fri=4, Sat=5

def add_workdays(d, n):
    cur, left = d, n
    while left > 0:
        cur += datetime.timedelta(days=1)
        if is_workday(cur):
            left -= 1
    return cur

def workdays_between(a, b):
    if a > b: return -workdays_between(b, a)
    n, cur = 0, a
    while cur < b:
        cur += datetime.timedelta(days=1)
        if is_workday(cur):
            n += 1
    return n

def ts(d, hh=10, mm=0):
    return datetime.datetime(d.year, d.month, d.day, hh, mm).isoformat() + "Z"

AR = lambda ar, en: {"ar": ar, "en": en}

# ----------------------------------------------------------------------------
# Users — demo identities (clearly labeled). Nafath replaces this in production.
# ----------------------------------------------------------------------------
PW = "Demo@2026"
USERS = [
    dict(id="u-gpo-mgr", role="platform_manager", personaType=None,
         name=AR("م. عبدالعزيز الحمدان", "Eng. Abdulaziz Alhamdan"),
         title=AR("مدير مكتب المشاريع الكبرى", "Director, Giga Projects Office"),
         org=AR("أمانة منطقة الرياض", "Riyadh Region Municipality"),
         email="a.alhamdan@rrm.gov.sa"),
    dict(id="u-spec-1", role="amanah_specialist", personaType=None,
         name=AR("سارة القحطاني", "Sarah Alqahtani"),
         title=AR("أخصائي بلدي — التخطيط العمراني", "Municipal specialist — Urban Planning"),
         org=AR("الإدارة العامة للتخطيط العمراني", "GD of Urban Planning"),
         email="s.alqahtani@rrm.gov.sa"),
    dict(id="u-spec-2", role="amanah_specialist", personaType=None,
         name=AR("م. خالد العتيبي", "Eng. Khalid Alotaibi"),
         title=AR("أخصائي بلدي — رخص البناء", "Municipal specialist — Building Permits"),
         org=AR("الإدارة العامة لرخص البناء", "GD of Building Permits"),
         email="k.alotaibi@rrm.gov.sa"),
    dict(id="u-giga-dgda", role="project_rep", personaType="giga_entity",
         name=AR("م. ريم العنقري", "Eng. Reem Alanqari"),
         title=AR("ممثل مشروع كبير — الدرعية", "Giga-project representative — Diriyah"),
         org=AR("شركة الدرعية", "Diriyah Company"),
         email="r.alanqari@diriyah.sa", projectIds=["diriyah"]),
    dict(id="u-giga-nm", role="project_rep", personaType="giga_entity",
         name=AR("م. سلطان الشمري", "Eng. Sultan Alshammari"),
         title=AR("مدير التصاريح — المربع الجديد", "Permits director — New Murabba"),
         org=AR("شركة المربع الجديد", "New Murabba Development Co."),
         email="s.alshammari@newmurabba.sa", projectIds=["new-murabba"]),
    dict(id="u-dev-roshn", role="project_rep", personaType="developer",
         name=AR("م. بدر الراشد", "Eng. Bader Alrashed"),
         title=AR("مدير التراخيص — مجموعة روشن", "Licensing director — ROSHN Group"),
         org=AR("مجموعة روشن", "ROSHN Group"),
         email="b.alrashed@roshn.sa", projectIds=["roshn-sedra"]),
    dict(id="u-investor", role="project_rep", personaType="investor",
         name=AR("أحمد الجريسي", "Ahmed Aljeraisy"),
         title=AR("مستثمر عقاري — شركة رافد للاستثمار", "Real-estate investor — Rafd Investment"),
         org=AR("شركة رافد للاستثمار", "Rafd Investment Co."),
         email="a.aljeraisy@rafd-invest.sa", projectIds=[]),
    dict(id="u-operator", role="project_rep", personaType="operator",
         name=AR("م. هند المطيري", "Eng. Hind Almutairi"),
         title=AR("مدير الأصول — تحالف إدارة المرافق", "Asset manager — FM Alliance"),
         org=AR("تحالف إدارة المرافق", "FM Alliance"),
         email="h.almutairi@fm-alliance.sa", projectIds=["king-salman-park"]),
    dict(id="u-eng-office", role="project_rep", personaType="developer",
         name=AR("مكتب العمران الهندسي", "Al-Omran Engineering Office"),
         title=AR("مكتب هندسي معتمد — بالإنابة عن مجموعة روشن", "Certified engineering office — delegate of ROSHN"),
         org=AR("مكتب العمران الهندسي", "Al-Omran Engineering"),
         email="info@alomran-eng.sa", projectIds=["roshn-sedra"],
         delegatedBy="u-dev-roshn",
         allowedServiceIds=["survey-decision", "concept-master-plan", "detailed-plans-submission", "building-permit"]),
    dict(id="u-ext-sec", role="external_entity", personaType=None,
         name=AR("م. ماجد الدوسري", "Eng. Majed Aldosari"),
         title=AR("ممثل الشركة السعودية للكهرباء", "Saudi Electricity Company representative"),
         org=AR("الشركة السعودية للكهرباء", "Saudi Electricity Company"),
         email="m.aldosari@se.com.sa", entityId="sec"),
    dict(id="u-ext-nwc", role="external_entity", personaType=None,
         name=AR("م. عبير الحقباني", "Eng. Abeer Alhogbani"),
         title=AR("ممثل شركة المياه الوطنية", "National Water Company representative"),
         org=AR("شركة المياه الوطنية", "National Water Company"),
         email="a.alhogbani@nwc.com.sa", entityId="nwc"),
    dict(id="u-viewer", role="viewer", personaType=None,
         name=AR("د. فهد السديري", "Dr. Fahad Alsudairi"),
         title=AR("مستشار — مكتب الأمين", "Advisor — Mayor's Office"),
         org=AR("مكتب أمين منطقة الرياض", "Office of the Mayor of Riyadh Region"),
         email="f.alsudairi@rrm.gov.sa"),
]
for u in USERS:
    u.setdefault("projectIds", [])
    u["password"] = PW
    u["active"] = True
    parts = u["name"]["en"].replace("Eng. ", "").replace("Dr. ", "").split()
    u["avatarInitials"] = (parts[0][0] + (parts[-1][0] if len(parts) > 1 else "")).upper()
    u["createdAt"] = ts(days_ago(220))

# ----------------------------------------------------------------------------
# Projects — from the RMUN registry, normalized to platform shape
# ----------------------------------------------------------------------------
PHASE_MAP = {
    "diriyah": ("construction", "active"),
    "qiddiya": ("construction", "active"),
    "king-salman-park": ("infrastructure", "enabled"),
    "sports-boulevard": ("handover", "enabled"),
    "new-murabba": ("design", "active"),
    "roshn-sedra": ("construction", "enabled"),
    "ksia": ("construction", "active"),
    "expo-2030": ("planning", "active"),
    "misk-city": ("operation", "enabled"),
    "green-riyadh": ("operation", "active"),
}
DISTRICTS = {
    "diriyah": AR("الدرعية", "Ad Diriyah"), "qiddiya": AR("القدية", "Qiddiya"),
    "king-salman-park": AR("مطار الملك سلمان السابق", "Former airbase district"),
    "sports-boulevard": AR("محور الأمير محمد بن سلمان", "Prince Mohammed bin Salman axis"),
    "new-murabba": AR("شمال غرب الرياض", "Northwest Riyadh"),
    "roshn-sedra": AR("سدرة — شمال الرياض", "Sedra — North Riyadh"),
    "ksia": AR("مطار الملك سلمان الدولي", "King Salman International Airport"),
    "expo-2030": AR("شمال الرياض", "North Riyadh"),
    "misk-city": AR("مدينة مسك — إرقاح", "Misk City — Irqah"),
    "green-riyadh": AR("عموم مدينة الرياض", "City-wide"),
}
PROJECTS = []
for gp in CATALOG["gigaProjects"]:
    phase, status = PHASE_MAP.get(gp["id"], ("construction", "active"))
    PROJECTS.append(dict(
        id=gp["id"], name=gp["name"], owner=gp["owner"], developer=gp["developer"],
        sector=gp["sector"], isGiga=True, phase=phase, status=status,
        monogram=gp["monogram"],
        location=dict(district=DISTRICTS[gp["id"]], lat=gp["lat"], lng=gp["lng"], areaKm2=gp["areaKm2"]),
        description=gp["description"],
        requestedServiceIds=[],
        createdAt=ts(days_ago(400)), updatedAt=ts(days_ago(3)),
    ))

# ----------------------------------------------------------------------------
# Journeys — the official developer/investor journeys (July 2026 guide)
# ----------------------------------------------------------------------------
def step(kind, title_ar, title_en, actor_ar, actor_en, sla=None, service=None, note=None):
    s = dict(kind=kind, title=AR(title_ar, title_en), actor=AR(actor_ar, actor_en))
    if sla is not None: s["slaDays"] = sla
    if service: s["serviceId"] = service
    if note: s["note"] = AR(*note)
    return s

DEV = ("المطور العقاري", "Developer")
AMN = ("أمانة منطقة الرياض", "Riyadh Region Municipality")
RCR = ("الأمانة + الهيئة الملكية لمدينة الرياض", "Amanah + Royal Commission for Riyadh City")
UTL = ("الجهات الخدمية (كهرباء، مياه، اتصالات)", "Utility entities (SEC, NWC, telecom)")

JOURNEYS = [
    dict(id="planning", phase="before",
         name=AR("رحلة مشاريع التخطيط", "Planning-projects journey"),
         audience=AR("أرض خام أو ضمن مخطط هيكلي", "Raw land or land within a structural plan"),
         personas=["developer", "giga_entity", "engineering_office"],
         steps=[
             step("service", "تقديم طلب إصدار قرار مساحي", "Submit survey-decision request", *AMN, sla=10, service="survey-decision"),
             step("service", "التقديم على طلب التخطيط من خلال المنصة", "Submit the planning request via the platform", *DEV, service="planning-request"),
             step("review", "مراجعة الطلب والدراسات الأولية والحصول على المحددات", "Review request & initial studies; issue determinants", *AMN, sla=5),
             step("service", "تقديم الدراسة التخطيطية (Concept Master Plan)", "Submit the planning study (Concept Master Plan)", *DEV, service="concept-master-plan"),
             step("review", "إحالة المخطط للجنة التخطيط العمراني (نطاق NPX)", "Refer plan to the Urban Planning Committee (NPX scope)", *AMN, sla=10),
             step("review", "الموافقة على الفكرة التخطيطية وإصدار قرار الاعتماد الأولي (DMP)", "Approve planning concept & issue initial approval (Detailed Master Plan)", *RCR, sla=15),
             step("choice", "اختيار مسار استكمال إجراءات اعتماد المخطط", "Choose the plan-approval completion path", *DEV),
         ],
         paths=[
             dict(id="path-1", name=AR("الاعتماد الابتدائي والإفراغ التدريجي", "Initial approval with progressive conveyance"),
                  description=AR("اعتماد المخطط ابتدائيًا والبدء بتنفيذ البنية التحتية، مع إفراغ أجزاء من المخطط تدريجيًا حتى الاعتماد النهائي.",
                                 "Approve initially, execute infrastructure, and convey plan portions progressively until final approval."),
                  steps=[
                      step("service", "تقديم المخططات التفصيلية على المنصة", "Submit detailed plans on the platform", *DEV, service="detailed-plans-submission"),
                      step("review", "التدقيق وإحالة المخططات التفصيلية للجهات الخدمية", "Audit & refer detailed plans to service entities", *AMN, sla=2),
                      step("service", "تقديم الدراسات التصميمية لشبكات البنية التحتية", "Submit infrastructure-network design studies", *DEV, service="infra-design-studies"),
                      step("review", "دراسة واعتماد تصاميم شبكات البنية التحتية والإشعار بالموافقة", "Review & approve network designs; notify approval", *UTL, sla=28),
                      step("action", "البدء بتنفيذ الأعمال (الجزئي)", "Begin (partial) works execution", *DEV),
                      step("service", "التسليم النهائي لأعمال شبكات البنية التحتية", "Final handover of infrastructure works", *UTL, service="infra-final-handover", sla=5),
                      step("review", "إشعار الهيئة العامة للعقار والسماح بالفرز والإفراغ الجزئي (≥25%)", "Notify REGA; allow sorting & partial conveyance (≥25% of plan area)", *AMN, sla=1),
                      step("service", "اعتماد المخطط النهائي بعد اكتمال كامل البنية التحتية", "Final plan approval after full infrastructure completion", *AMN, service="final-plan-approval", sla=5),
                      step("service", "شهادة الإتمام (Certificate of Completion)", "Certificate of Completion", *AMN, service="certificate-of-completion", sla=5),
                  ]),
             dict(id="path-2", name=AR("الاعتماد الابتدائي والنهائي قبل التنفيذ", "Initial & final approval before execution"),
                  description=AR("اعتماد ابتدائي ونهائي للمخطط قبل التنفيذ، على أن يرتبط الاعتماد بتاريخ محدد بحد أقصى ثلاث سنوات يلتزم خلالها بتنفيذ البنية التحتية، مع إفراغ جزئي تبعًا لما يتم تنفيذه.",
                                 "Initial and final approval before execution, bound to a committed date (max 3 years) for infrastructure delivery, with partial conveyance as works complete."),
                  steps=[
                      step("service", "تقديم المخططات التفصيلية على المنصة", "Submit detailed plans on the platform", *DEV, service="detailed-plans-submission"),
                      step("review", "إحالة المخططات التفصيلية للجهات الخدمية", "Refer detailed plans to service entities", *AMN, sla=1),
                      step("service", "تقديم الدراسات التصميمية لشبكات البنية التحتية", "Submit infrastructure design studies", *DEV, service="infra-design-studies"),
                      step("review", "دراسة واعتماد التصاميم والإشعار بالموافقة", "Review & approve designs; notify approval", *UTL, sla=5),
                      step("review", "الاعتماد النهائي للمخطط المشروط بالتنفيذ خلال 3 سنوات", "Final approval conditioned on execution within 3 years", *AMN),
                      step("action", "البدء بتنفيذ الأعمال", "Begin works execution", *DEV),
                      step("service", "التسليم النهائي لأعمال شبكات البنية التحتية", "Final handover of infrastructure works", *UTL, service="infra-final-handover", sla=5),
                      step("review", "إشعار الهيئة العامة للعقار باعتماد المخطط والسماح بالفرز وإفراغ القطع", "Notify REGA of plan approval; allow sorting & conveyance", *AMN, sla=1),
                  ]),
             dict(id="path-3", name=AR("الاعتماد الابتدائي والنهائي وبيع جميع القطع قبل التنفيذ", "Initial & final approval with full plot sales before execution"),
                  description=AR("اعتماد ابتدائي ونهائي مع بيع كامل قطع المخطط قبل التنفيذ، على أن تُنفذ البنية التحتية بالتزامن مع مرحلة البيع وبدفع مبالغ التنفيذ من قبل المطور لجهة التنفيذ.",
                                 "Initial and final approval with all plots sold before execution; infrastructure delivered in parallel with sales, execution funds paid by the developer."),
                  steps=[
                      step("service", "تقديم المخططات التفصيلية على المنصة", "Submit detailed plans on the platform", *DEV, service="detailed-plans-submission"),
                      step("review", "الاعتماد الابتدائي والنهائي وربط البيع بحساب الضمان", "Initial & final approval; sales bound to escrow", *AMN, sla=5),
                      step("action", "بيع القطع وتحصيل مبالغ التنفيذ عبر حساب الضمان", "Sell plots; collect execution funds via escrow", *DEV),
                      step("service", "تنفيذ وتسليم أعمال البنية التحتية", "Execute & hand over infrastructure works", *UTL, service="infra-final-handover", sla=5),
                      step("service", "شهادة الإتمام", "Certificate of Completion", *AMN, service="certificate-of-completion", sla=5),
                  ]),
         ]),
    dict(id="building", phase="during",
         name=AR("رحلة مشاريع البناء", "Building-projects journey"),
         audience=AR("أرض ضمن مخطط معتمد (تقسيمات أراضٍ)", "Land within an approved subdivision plan"),
         personas=["developer", "giga_entity", "engineering_office"],
         steps=[
             step("service", "إصدار رخصة بناء", "Issue a building permit", *DEV, service="building-permit", sla=5,
                  note=("المتطلبات: تقرير دراسة التربة، التقرير المساحي، التأمين ضد العيوب الخفية، مخططات الدفاع المدني، دراسة حركة مرورية حسب نوع المشروع.",
                        "Prerequisites: soil study, survey report, latent-defects insurance, civil-defense drawings, traffic study per project type.")),
             step("service", "تصريح بيئي للإنشاء", "Environmental construction permit", *DEV, service="env-construction-permit", sla=7),
             step("service", "تصاريح التمكين الإنشائي (رافعات، حفريات، إغلاق طرق، سياج)", "Construction enablement permits (cranes, excavation, road closure, hoarding)", *DEV, service="tower-crane-permit"),
             step("service", "طلب إيصال التيار الكهربائي (30–50% من البناء)", "Electrical connection request (30–50% completion)", *DEV, service="power-connection", sla=14),
             step("service", "شهادة إتمام البناء وإشغاله", "Building completion & occupancy certificate", *DEV, service="building-completion-occupancy", sla=10),
         ]),
    dict(id="investor", phase="after",
         name=AR("رحلة المستثمر العقاري", "Real-estate investor journey"),
         audience=AR("الفرص الاستثمارية المطروحة عبر منصة فرص", "Investment opportunities offered via the Furas platform"),
         personas=["investor"],
         steps=[
             step("action", "مرحلة ما قبل التعاقد — المنافسة والترسية عبر منصة فرص", "Pre-contract — competition & award via Furas", *("المستثمر العقاري", "Investor")),
             step("service", "إصدار التراخيص المعنية حسب طبيعة الفرصة الاستثمارية", "Issue the licenses required by the opportunity", *("المستثمر العقاري", "Investor"), service="commercial-activity-license", sla=5),
             step("action", "البدء بالأعمال الإنشائية للفرصة الاستثمارية", "Begin construction works for the opportunity", *("المستثمر العقاري", "Investor")),
             step("action", "تشغيل النشاط وفق كراسة الشروط والالتزام بخطة التشغيل والصيانة", "Operate per the RFP terms with the O&M plan", *("المستثمر العقاري", "Investor")),
             step("service", "التجديد أو الإنهاء: إعداد تقرير فني ومشاركته للأمانة", "Renewal or exit: prepare & share the technical report", *("المستثمر العقاري", "Investor"), service="technical-report-renewal-termination", sla=10),
             step("service", "عند الإنهاء: تسليم الموقع لمكاتب مدينتي", "On exit: hand the site to Madinati offices", *("المستثمر العقاري", "Investor"), service="site-handover-madinati", sla=5),
         ]),
    dict(id="operation", phase="after",
         name=AR("رحلة التشغيل وإدارة الأصول", "Operation & asset-management journey"),
         audience=AR("مديرو الأصول وشركات التشغيل بعد اكتمال التطوير", "Asset managers and operators after development completes"),
         personas=["operator", "giga_entity"],
         steps=[
             step("service", "رخصة نشاط تجاري وإشغال المنشأة", "Commercial activity & occupancy license", *("مدير الأصول", "Operator"), service="commercial-activity-license", sla=5),
             step("service", "تصريح بيئي للتشغيل", "Environmental operating permit", *("مدير الأصول", "Operator"), service="env-operation-permit", sla=7),
             step("service", "تصاريح الفعاليات والأنشطة الموسمية", "Events & seasonal activity permits", *("مدير الأصول", "Operator"), service="events-permit", sla=3),
             step("service", "شهادة الامتثال الدورية", "Periodic compliance certificate", *("مدير الأصول", "Operator"), service="periodic-compliance-certificate", sla=10),
             step("service", "تجديد الرخص البلدية", "Municipal license renewals", *("مدير الأصول", "Operator"), service="license-renewal", sla=3),
         ]),
    dict(id="industrial", phase="during",
         name=AR("رحلة المشاريع الصناعية", "Industrial-projects journey"),
         audience=AR("داخل نطاق مدن وخارجه", "Inside and outside MODON scope"),
         personas=["developer", "investor"],
         steps=[
             step("action", "توقيع العقد واعتماد المخططات (مخطط عام ومخطط سلامة)", "Sign contract; approve general & safety plans", *("المطور/مُدن", "Developer/MODON")),
             step("service", "تصريح بيئي للإنشاء", "Environmental construction permit", *DEV, service="env-construction-permit", sla=7),
             step("service", "إصدار رخصة بناء (أمانة أو مُدن)", "Building permit (Amanah or MODON)", *DEV, service="modon-building-permit", sla=5),
             step("service", "طلب إيصال التيار الكهربائي (اكتمال 30–50%)", "Electrical connection (30–50% completion)", *DEV, service="power-connection", sla=14),
             step("service", "رخصة التشغيل وشهادة إتمام وإشغال البناء", "Operating license & completion/occupancy certificate", *DEV, service="operation-license", sla=10),
         ]),
]

# ----------------------------------------------------------------------------
# Requests — full lifecycle coverage across personas & services
# ----------------------------------------------------------------------------
SERVICES = {s["id"]: s for s in CATALOG["services"]}

def doc_list(svc_id, state="pending", missing_key=None):
    docs = []
    for i, d in enumerate(SERVICES[svc_id].get("requiredDocuments", [])):
        key = "doc-%d" % i
        fmt = d.get("formats", ["pdf"])[0]
        if missing_key == key:
            docs.append(dict(key=key, name=d["name"], fileName=None, sizeKB=0, mime="",
                             uploadedAt=None, verifyState="missing", verifyNote=None))
        else:
            docs.append(dict(key=key, name=d["name"],
                             fileName="%s-%s.%s" % (svc_id, i + 1, fmt),
                             sizeKB=180 + (hash(svc_id + key) % 4000), mime="application/" + fmt,
                             uploadedAt=None, verifyState=state, verifyNote=None))
    return docs

def form_fill(svc_id, extra=None):
    """Plausible values for the smart-form fields of a service."""
    out = {}
    for f in SERVICES[svc_id].get("formFields", []):
        t, k = f.get("type"), f["key"]
        if extra and k in extra:
            out[k] = extra[k]; continue
        if t == "number": out[k] = 25000
        elif t == "date": out[k] = iso(add_workdays(TODAY, 10))
        elif t == "select" and f.get("options"): out[k] = f["options"][0]["v"] if isinstance(f["options"][0], dict) and "v" in f["options"][0] else (f["options"][0] if isinstance(f["options"][0], str) else f["options"][0].get("value", ""))
        elif t == "parcel-id": out[k] = "1010-" + str(2000 + hash(svc_id) % 7000)
        elif t == "map-point": out[k] = "24.7136, 46.6753"
        elif t == "textarea": out[k] = "وفق نطاق الأعمال المعتمد للمشروع والمتطلبات النظامية ذات العلاقة."
        else: out[k] = "أ ب/" + str(100 + hash(k + svc_id) % 900)
    return out

REQ_SEQ = [0]
def rq(num): return "RQ-2026-%04d" % num

def timeline_for(req, sub_d, first_d=None, decided_d=None, extra_events=None):
    tl = [dict(id="evt-%s-0" % req["id"], at=ts(sub_d, 9, 12), byId=req["createdById"], byRole="project_rep",
               type="state", fromState=None, toState="draft"),
          dict(id="evt-%s-1" % req["id"], at=ts(sub_d, 9, 40), byId=req["createdById"], byRole="project_rep",
               type="state", fromState="draft", toState="submitted")]
    n = 2
    def ev(d, byId, byRole, typ, **kw):
        nonlocal n
        e = dict(id="evt-%s-%d" % (req["id"], n), at=ts(d, 10 + n % 6, (n * 13) % 60), byId=byId, byRole=byRole, type=typ)
        e.update(kw); tl.append(e); n += 1
    if first_d:
        ev(first_d, req["assigneeId"], "amanah_specialist", "state", fromState="submitted", toState="screening")
    for x in (extra_events or []):
        ev(*x[0], **x[1])
    if decided_d and req.get("decision"):
        ev(decided_d, req["assigneeId"], "amanah_specialist", "decision",
           fromState="decision_due", toState=req["decision"]["type"],
           payload=({"permitNo": req["decision"].get("permitNo")} if req["decision"]["type"] == "approved"
                    else {"reason": req["decision"].get("reason"), "regulationRef": req["decision"].get("regulationRef")}))
    return tl

REQUESTS = []
PERMIT_SEQ = [100]

def mk(num, svc, proj, user_id, state, sub_days_ago, priority="fast_track", **kw):
    """Assemble a seeded request with consistent SLA math and timeline."""
    svc_def = SERVICES[svc]
    u = [x for x in USERS if x["id"] == user_id][0]
    sub_d = days_ago(sub_days_ago)
    sla_days = svc_def["slaDays"]
    if priority == "fast_track":
        sla_days = max(1, -(-svc_def["slaDays"] // 2))  # ceil(x*0.5)
    due = add_workdays(sub_d, sla_days)
    req = dict(
        id=rq(num), projectId=proj, serviceId=svc, createdById=user_id,
        personaSnapshot=dict(userId=user_id, name=u["name"], personaType=u.get("personaType"),
                             org=u["org"], delegatedBy=u.get("delegatedBy")),
        state=state, formData=form_fill(svc, kw.get("form")),
        documents=doc_list(svc, state=kw.get("docState", "pending"), missing_key=kw.get("missingDoc")),
        involvedEntities=list(svc_def.get("supportingEntities", [])),
        referrals=kw.get("referrals", []),
        returnNotes=kw.get("returnNotes", []),
        resubmissionCount=kw.get("resubmissionCount", 0),
        sla=dict(startAt=iso(sub_d), dueAt=iso(due), pausedDays=kw.get("pausedDays", 0),
                 pauseStartAt=kw.get("pauseStartAt"), breached=kw.get("breached", False),
                 escalation=kw.get("escalation", "none")),
        priority=priority, assigneeId=kw.get("assignee"),
        firstResponseAt=ts(days_ago(kw["first"])) if kw.get("first") is not None else None,
        decision=kw.get("decision"), satisfaction=kw.get("satisfaction"),
        submittedAt=ts(sub_d, 9, 40) if state != "draft" else None,
        closedAt=ts(days_ago(kw["closed"])) if kw.get("closed") is not None else None,
        createdAt=ts(sub_d, 9, 12), updatedAt=ts(days_ago(kw.get("updated", 0))),
        note=kw.get("note"),
    )
    if state == "draft":
        req["sla"] = dict(startAt=None, dueAt=None, pausedDays=0, pauseStartAt=None, breached=False, escalation="none")
        req["timeline"] = [dict(id="evt-%s-0" % req["id"], at=ts(sub_d, 9, 12), byId=user_id,
                                byRole="project_rep", type="state", fromState=None, toState="draft")]
    else:
        req["timeline"] = timeline_for(req, sub_d,
                                       first_d=days_ago(kw["first"]) if kw.get("first") is not None else None,
                                       decided_d=days_ago(kw["decided"]) if kw.get("decided") is not None else None,
                                       extra_events=kw.get("events"))
    REQUESTS.append(req)
    return req

def approved(permit_code=None):
    PERMIT_SEQ[0] += 1
    return dict(type="approved", decidedAt="", deciderId="u-spec-1",
                permitNo="RGP-2026-%04d" % PERMIT_SEQ[0], conditions=None, note=None)

E = lambda d, by, role, typ, **kw: ((d, by, role, typ), kw)

# --- the demo narrative (28 requests) ---
# ROSHN Sedra planning journey (developer):
r = mk(141, "survey-decision", "roshn-sedra", "u-dev-roshn", "closed", 44, first=43, decided=40, closed=33,
       assignee="u-spec-1", docState="verified",
       decision=approved(), satisfaction=dict(score=5, comment="إنجاز قبل الموعد", at=ts(days_ago(38))))
r["decision"]["decidedAt"] = ts(days_ago(40), 13)
r = mk(152, "planning-request", "roshn-sedra", "u-dev-roshn", "closed", 36, first=35, decided=34, closed=27,
       assignee="u-spec-1", docState="verified", decision=approved(),
       satisfaction=dict(score=5, comment=None, at=ts(days_ago(30))))
r["decision"]["decidedAt"] = ts(days_ago(34), 11)
r = mk(166, "concept-master-plan", "roshn-sedra", "u-eng-office", "external_review", 13, first=12,
       assignee="u-spec-1", docState="verified",
       referrals=[dict(entityId="rcrc", sentAt=ts(days_ago(9)), answeredAt=None, opinion=None, note=None)],
       events=[E(days_ago(11), "u-spec-1", "amanah_specialist", "state", fromState="screening", toState="in_review"),
               E(days_ago(9), "u-spec-1", "amanah_specialist", "referral", fromState="in_review", toState="external_review",
                 payload={"entities": ["rcrc"]})],
       note=AR("ضمن نطاق NPX — محال للجنة التخطيط العمراني بالتنسيق مع الهيئة الملكية",
               "Within NPX scope — referred to the Urban Planning Committee with RCRC"))
# Diriyah infra (escalated red):
r = mk(170, "infra-design-studies", "diriyah", "u-giga-dgda", "external_review", 22, first=21,
       assignee="u-spec-1", docState="verified", breached=True, escalation="red",
       referrals=[dict(entityId="sec", sentAt=ts(days_ago(19)), answeredAt=ts(days_ago(6)), opinion="approve_recommend", note="لا مانع مع اشتراط مسار بديل للكيبل"),
                  dict(entityId="nwc", sentAt=ts(days_ago(19)), answeredAt=None, opinion=None, note=None),
                  dict(entityId="telecom-operators", sentAt=ts(days_ago(19)), answeredAt=None, opinion=None, note=None)],
       events=[E(days_ago(20), "u-spec-1", "amanah_specialist", "state", fromState="screening", toState="in_review"),
               E(days_ago(19), "u-spec-1", "amanah_specialist", "referral", fromState="in_review", toState="external_review",
                 payload={"entities": ["sec", "nwc", "telecom-operators"]}),
               E(days_ago(2), "u-gpo-mgr", "platform_manager", "action", payload={"escalated": True})],
       note=AR("متأخر لدى الجهات الخدمية — مصعّد لمدير مكتب المشاريع الكبرى",
               "Delayed with utility entities — escalated to the GPO director"))
# Sports Boulevard road closure:
mk(173, "road-closure-permit", "sports-boulevard", "u-giga-nm", "in_review", 6, first=5, assignee="u-spec-2",
   docState="verified",
   events=[E(days_ago(4), "u-spec-2", "amanah_specialist", "state", fromState="screening", toState="in_review"),
           E(days_ago(3), "u-spec-2", "amanah_specialist", "note",
             textAr="بانتظار محضر التنسيق المروري لخطة التحويلات الليلية", textEn="Awaiting traffic-coordination minutes for the night diversion plan")],
   note=AR("إغلاق جزئي لطريق الأمير محمد بن سعد مع خطة تحويلات", "Partial closure of Prince Mohammed bin Saad Rd with diversion plan"))
# New Murabba building permit (returned → paused):
mk(175, "building-permit", "new-murabba", "u-giga-nm", "returned", 16, first=15, assignee="u-spec-2",
   pauseStartAt=iso(days_ago(12)),
   returnNotes=[dict(at=ts(days_ago(12), 14), byId="u-spec-2",
                     items=["وثيقة التأمين ضد العيوب الخفية", "دراسة حركة مرورية حسب نوع المشروع"],
                     note="يرجى استكمال الوثيقتين لاستئناف الدراسة")],
   missingDoc="doc-2", docState="verified",
   events=[E(days_ago(13), "u-spec-2", "amanah_specialist", "state", fromState="screening", toState="in_review"),
           E(days_ago(12), "u-spec-2", "amanah_specialist", "state", fromState="in_review", toState="returned",
             payload={"items": ["وثيقة التأمين ضد العيوب الخفية", "دراسة حركة مرورية حسب نوع المشروع"]})])
# KSIA tower cranes (approved):
r = mk(178, "tower-crane-permit", "ksia", "u-giga-dgda", "approved", 9, first=8, decided=6, assignee="u-spec-2",
       docState="verified", decision=approved(),
       events=[E(days_ago(7), "u-spec-2", "amanah_specialist", "state", fromState="screening", toState="in_review"),
               E(days_ago(7), "u-spec-2", "amanah_specialist", "state", fromState="in_review", toState="decision_due")],
       note=AR("8 رافعات برجية — تنسيق الارتفاعات مع الهيئة العامة للطيران المدني",
               "8 tower cranes — heights coordinated with GACA"))
r["decision"]["decidedAt"] = ts(days_ago(6), 12)
# Qiddiya excavation (screening):
mk(180, "excavation-permit", "qiddiya", "u-giga-dgda", "screening", 1, first=0, assignee="u-spec-2")
# New Murabba sales center (submitted, unassigned):
mk(181, "temporary-sales-center", "new-murabba", "u-giga-nm", "submitted", 0, assignee="u-spec-1")
# Diriyah events permit (rejected):
r = mk(169, "events-permit", "diriyah", "u-giga-dgda", "rejected", 23, first=22, decided=20, assignee="u-spec-2",
       docState="verified",
       decision=dict(type="rejected", decidedAt=ts(days_ago(20), 13), deciderId="u-spec-2",
                     reason="تعارض موعد الفعالية المقترح مع أعمال إنشائية قائمة ضمن نطاق الموقع وخطة سلامة غير مستوفية لاشتراطات الدفاع المدني",
                     regulationRef="اشتراطات تصاريح الفعاليات المؤقتة — المادة 6"),
       events=[E(days_ago(21), "u-spec-2", "amanah_specialist", "state", fromState="screening", toState="in_review"),
               E(days_ago(21), "u-spec-2", "amanah_specialist", "state", fromState="in_review", toState="decision_due")])
# KSP commercial license (closed + CSAT):
r = mk(155, "commercial-activity-license", "king-salman-park", "u-operator", "closed", 29, first=28, decided=27, closed=20,
       assignee="u-spec-2", docState="verified", decision=approved(),
       satisfaction=dict(score=4, comment=None, at=ts(days_ago(24))))
r["decision"]["decidedAt"] = ts(days_ago(27), 15)
# Investor technical report (in_review, normal lane):
mk(176, "technical-report-renewal-termination", None, "u-investor", "in_review", 8, first=7, assignee="u-spec-1",
   priority="normal", docState="verified",
   events=[E(days_ago(6), "u-spec-1", "amanah_specialist", "state", fromState="screening", toState="in_review")],
   note=AR("فرصة استثمارية — مركز خدمات على طريق الملك عبدالعزيز؛ الرغبة: تجديد العقد",
           "Investment opportunity — services center on King Abdulaziz Rd; intent: renew"))
# more coverage:
mk(183, "utility-relocation", "diriyah", "u-giga-dgda", "decision_due", 12, first=11, assignee="u-spec-1",
   docState="verified",
   events=[E(days_ago(10), "u-spec-1", "amanah_specialist", "state", fromState="screening", toState="in_review"),
           E(days_ago(4), "u-spec-1", "amanah_specialist", "state", fromState="in_review", toState="decision_due")],
   note=AR("نقل كيبل جهد عالٍ متعارض مع حفر النفق الغربي", "Relocating an HV cable conflicting with the west tunnel excavation"))
mk(184, "site-hoarding-permit", "new-murabba", "u-giga-nm", "resubmitted", 18, first=17, assignee="u-spec-2",
   resubmissionCount=1, pausedDays=4, docState="verified",
   returnNotes=[dict(at=ts(days_ago(14), 11), byId="u-spec-2",
                     items=["مخطط مواقع السياج على الرفع المساحي"], note="")],
   events=[E(days_ago(15), "u-spec-2", "amanah_specialist", "state", fromState="screening", toState="in_review"),
           E(days_ago(14), "u-spec-2", "amanah_specialist", "state", fromState="in_review", toState="returned",
             payload={"items": ["مخطط مواقع السياج على الرفع المساحي"]}),
           E(days_ago(8), "u-giga-nm", "project_rep", "state", fromState="returned", toState="resubmitted")])
mk(185, "labor-housing-permit", "qiddiya", "u-giga-dgda", "in_review", 5, first=4, assignee="u-spec-1",
   docState="pending",
   events=[E(days_ago(3), "u-spec-1", "amanah_specialist", "state", fromState="screening", toState="in_review")])
r = mk(160, "excavation-permit", "sports-boulevard", "u-giga-nm", "closed", 40, first=39, decided=37, closed=30,
       assignee="u-spec-2", docState="verified", decision=approved(),
       satisfaction=dict(score=5, comment=None, at=ts(days_ago(33))))
r["decision"]["decidedAt"] = ts(days_ago(37), 10)
r = mk(147, "env-construction-permit", "expo-2030", "u-giga-dgda", "approved", 33, first=32, decided=28,
       assignee="u-spec-1", docState="verified", decision=approved(),
       satisfaction=dict(score=4, comment=None, at=ts(days_ago(26))))
r["decision"]["decidedAt"] = ts(days_ago(28), 14)
mk(186, "npx-coordination", "expo-2030", "u-giga-dgda", "screening", 2, first=1, assignee="u-spec-1")
mk(187, "dewatering-permit", "ksia", "u-giga-dgda", "submitted", 1, assignee="u-spec-2")
r = mk(158, "periodic-compliance-certificate", "misk-city", "u-operator", "approved", 26, first=25, decided=22,
       assignee="u-spec-2", docState="verified", priority="normal", decision=approved())
r["decision"]["decidedAt"] = ts(days_ago(22), 9)
mk(188, "events-permit", "king-salman-park", "u-operator", "decision_due", 4, first=3, assignee="u-spec-2",
   docState="verified",
   events=[E(days_ago(2), "u-spec-2", "amanah_specialist", "state", fromState="screening", toState="in_review"),
           E(days_ago(1), "u-spec-2", "amanah_specialist", "state", fromState="in_review", toState="decision_due")],
   note=AR("فعالية موسم الرياض — المنطقة الشمالية للحديقة", "Riyadh Season activation — park north zone"))
mk(189, "license-renewal", "misk-city", "u-operator", "cancelled", 15, first=14, assignee="u-spec-1", priority="normal",
   events=[E(days_ago(13), "u-operator", "project_rep", "state", fromState="screening", toState="cancelled",
             payload={"reason": "تقديم مكرر"})])
mk(190, "building-permit", "roshn-sedra", "u-eng-office", "draft", 3)
mk(191, "road-closure-permit", "qiddiya", "u-giga-dgda", "draft", 1)
r = mk(150, "survey-decision", "new-murabba", "u-giga-nm", "closed", 47, first=46, decided=43, closed=36,
       assignee="u-spec-1", docState="verified", decision=approved(),
       satisfaction=dict(score=3, comment="نتمنى تسريع الإحالة للجهات", at=ts(days_ago(40))))
r["decision"]["decidedAt"] = ts(days_ago(43), 12)
mk(192, "temporary-works-permit", "sports-boulevard", "u-giga-nm", "in_review", 7, first=6, assignee="u-spec-1",
   docState="verified",
   events=[E(days_ago(5), "u-spec-1", "amanah_specialist", "state", fromState="screening", toState="in_review")])
mk(193, "naming-signage-approval", "misk-city", "u-operator", "submitted", 2, priority="normal", assignee="u-spec-2")
r = mk(168, "power-connection", "roshn-sedra", "u-dev-roshn", "external_review", 14, first=13, assignee="u-spec-2",
       docState="verified",
       referrals=[dict(entityId="sec", sentAt=ts(days_ago(10)), answeredAt=None, opinion=None, note=None)],
       events=[E(days_ago(12), "u-spec-2", "amanah_specialist", "state", fromState="screening", toState="in_review"),
               E(days_ago(10), "u-spec-2", "amanah_specialist", "referral", fromState="in_review", toState="external_review",
                 payload={"entities": ["sec"]})])
mk(194, "giga-project-onboarding", None, "u-giga-nm", "screening", 3, first=2, assignee="u-spec-1",
   note=AR("تسجيل مشروع ضاحية الفرسان ضمن سجل المشاريع الكبرى", "Registering Al-Fursan district in the giga registry"))

REQUESTS.sort(key=lambda r: r["id"], reverse=True)

# ----------------------------------------------------------------------------
# Challenges
# ----------------------------------------------------------------------------
def ch(num, proj, req, cat, sev, state, title_ar, title_en, owner, opened_ago, **kw):
    c = dict(id="CH-2026-%03d" % num, projectId=proj, requestId=req,
             title=AR(title_ar, title_en),
             description=AR(kw.get("desc_ar", title_ar), kw.get("desc_en", title_en)),
             category=cat, severity=sev, state=state, responsibleEntity=owner,
             proposedSolutions=[dict(id="sol-%d-1" % num, text=AR(kw["sol_ar"], kw["sol_en"]),
                                     byId=kw.get("by", "u-gpo-mgr"), at=ts(days_ago(opened_ago - 2)), chosen=state in ("resolved", "closed"))] if kw.get("sol_ar") else [],
             resolution=(dict(text=AR(kw["res_ar"], kw["res_en"]), byId=kw.get("by", "u-gpo-mgr"),
                              resolvedAt=ts(days_ago(kw["resolved_ago"]))) if kw.get("res_ar") else None),
             slaTargetDays=kw.get("target", 10),
             openedById=kw.get("opener", "u-gpo-mgr"), openedAt=ts(days_ago(opened_ago)),
             startedAt=ts(days_ago(kw["started_ago"])) if kw.get("started_ago") is not None else None,
             escalatedAt=ts(days_ago(kw["escalated_ago"])) if kw.get("escalated_ago") is not None else None,
             resolvedAt=ts(days_ago(kw["resolved_ago"])) if kw.get("resolved_ago") is not None else None,
             closedAt=ts(days_ago(kw["closed_ago"])) if kw.get("closed_ago") is not None else None,
             reopenCount=0, timeline=[])
    return c

CHALLENGES = [
    ch(11, "diriyah", "RQ-2026-0183", "infrastructure", "critical", "in_progress",
       "تعارض مسار كيبل جهد عالٍ مع أعمال حفر النفق الغربي",
       "HV cable route conflicts with the west tunnel excavation",
       "sec", 28, started_ago=24, opener="u-giga-dgda", target=25,
       sol_ar="نقل المسار ضمن خدمة نقل وحماية خدمات المرافق مع تنفيذ ليلي",
       sol_en="Relocate via the utility-relocation service with night works"),
    ch(12, "ksia", None, "coordination", "high", "escalated",
       "تأخر محاضر التنسيق بين الجهات الخدمية لممرات المرافق الشمالية",
       "Delayed inter-entity coordination minutes for the northern utility corridors",
       "gpo", 21, started_ago=18, escalated_ago=4, opener="u-giga-dgda", target=10,
       sol_ar="غرفة تنسيق أسبوعية موحدة برئاسة مكتب المشاريع الكبرى",
       sol_en="A unified weekly coordination room chaired by the GPO"),
    ch(13, "sports-boulevard", "RQ-2026-0173", "permits", "high", "open",
       "تعدد تصاريح الإغلاق المطلوبة لتقاطعات المسار مع الطرق الرئيسية",
       "Multiple closure permits required at main-road crossings",
       "traffic-department", 14, opener="u-giga-nm", target=15,
       sol_ar="تصريح إطاري موحد للتقاطعات بمراحل ربع سنوية",
       sol_en="A unified framework permit for crossings in quarterly phases"),
    ch(14, "new-murabba", None, "fees", "medium", "open",
       "آلية احتساب مقابل إشغال الأرصفة لمرحلة الأعمال التمكينية",
       "Sidewalk-occupation fee mechanics for the enabling-works phase",
       "sub-municipalities", 9, opener="u-giga-nm", target=20,
       sol_ar="تسعيرة موحدة متعددة السنوات معتمدة من لجنة الإيرادات",
       sol_en="A unified multi-year tariff approved by the revenue committee"),
    ch(9, "qiddiya", None, "technical", "medium", "closed",
       "اشتراطات تصريف مياه الأمطار في المناطق الجبلية خارج النطاق العمراني",
       "Stormwater requirements for mountainous zones outside the urban boundary",
       "construction-projects-agency", 65, started_ago=60, resolved_ago=19, closed_ago=12, opener="u-giga-dgda", target=30,
       sol_ar="دليل تصميم خاص بالمواقع الجبلية بالتنسيق مع الهيئة الملكية",
       sol_en="A mountain-sites design guide coordinated with RCRC",
       res_ar="اعتماد دليل تصميم خاص بالمواقع الجبلية بالتنسيق مع الهيئة الملكية لمدينة الرياض",
       res_en="Adopted a mountain-sites design guide with the Royal Commission for Riyadh City"),
    ch(15, "expo-2030", None, "regulatory", "high", "in_progress",
       "غياب مسار تنظيمي للمنشآت المؤقتة القابلة للفك وإعادة الاستخدام بعد المعرض",
       "No regulatory track for demountable, reusable post-expo structures",
       "gd-building-permits", 7, started_ago=5, opener="u-giga-dgda", target=25,
       sol_ar="فئة رخصة مؤقتة خاصة بمنشآت إكسبو تحال لاعتماد وكالة التعمير والمشاريع",
       sol_en="A dedicated temporary-license class for expo structures via the Construction Agency"),
    ch(16, "king-salman-park", "RQ-2026-0188", "coordination", "low", "resolved",
       "توحيد نافذة الموافقات الأمنية لفعاليات الحديقة الموسمية",
       "Unify the security-approvals window for seasonal park events",
       "gpo", 18, started_ago=15, resolved_ago=3, opener="u-operator", target=12,
       sol_ar="نافذة موحدة عبر المنصة بالتنسيق مع الجهات الأمنية",
       sol_en="A single platform window coordinated with security entities",
       res_ar="اعتماد نافذة موحدة للموافقات الأمنية عبر المنصة اعتبارًا من أغسطس 2026",
       res_en="Unified security-approvals window live on the platform from Aug 2026"),
    ch(17, "green-riyadh", None, "infrastructure", "medium", "in_progress",
       "تنسيق شبكات الري بالمياه المعالجة مع أعمال تطوير الطرق القائمة",
       "Coordinate treated-water irrigation networks with ongoing road works",
       "nwc", 11, started_ago=9, opener="u-operator", target=20,
       sol_ar="جدولة موحدة للحفريات ضمن تصريح إطاري مشترك",
       sol_en="A joint excavation schedule under a shared framework permit"),
]

# ----------------------------------------------------------------------------
# Notifications (a starter inbox per user) & audit trail
# ----------------------------------------------------------------------------
NOTIFS = [
    dict(id="ntf-1", userId="u-giga-dgda", at=ts(days_ago(2), 9), read=False, kind="danger",
         title=AR("تجاوز مدة الإنجاز — تصعيد", "SLA breached — escalated"),
         body=AR("الطلب RQ-2026-0170 تجاوز المدة المستهدفة لدى الجهات الخدمية", "RQ-2026-0170 exceeded its target with utility entities"),
         link="#/portal/requests/RQ-2026-0170"),
    dict(id="ntf-2", userId="u-giga-nm", at=ts(days_ago(12), 14), read=False, kind="warning",
         title=AR("طلبكم بحاجة إلى استكمال", "Your request needs completion"),
         body=AR("RQ-2026-0175 — رخصة بناء: مطلوب وثيقتان لاستئناف الدراسة", "RQ-2026-0175 — building permit: two documents required"),
         link="#/portal/requests/RQ-2026-0175"),
    dict(id="ntf-3", userId="u-spec-1", at=ts(days_ago(0), 8), read=False, kind="info",
         title=AR("طلب جديد مسند إليك", "New request assigned to you"),
         body=AR("RQ-2026-0181 — تصريح مركز مبيعات مؤقت", "RQ-2026-0181 — temporary sales-center permit"),
         link="#/work/review/RQ-2026-0181"),
    dict(id="ntf-4", userId="u-gpo-mgr", at=ts(days_ago(2), 9), read=False, kind="danger",
         title=AR("تصعيد: طلب متجاوز للمدة", "Escalation: request overdue"),
         body=AR("RQ-2026-0170 — دراسات شبكات البنية التحتية (الدرعية)", "RQ-2026-0170 — infrastructure design studies (Diriyah)"),
         link="#/manager/dashboard"),
    dict(id="ntf-5", userId="u-ext-sec", at=ts(days_ago(10), 11), read=False, kind="info",
         title=AR("إحالة جديدة تتطلب مرئياتكم", "New referral awaiting your opinion"),
         body=AR("RQ-2026-0168 — طلب إيصال التيار الكهربائي (سدرة)", "RQ-2026-0168 — power connection (Sedra)"),
         link="#/external"),
    dict(id="ntf-6", userId="u-ext-nwc", at=ts(days_ago(19), 11), read=False, kind="info",
         title=AR("إحالة جديدة تتطلب مرئياتكم", "New referral awaiting your opinion"),
         body=AR("RQ-2026-0170 — دراسات شبكات البنية التحتية (الدرعية)", "RQ-2026-0170 — infrastructure design studies (Diriyah)"),
         link="#/external"),
    dict(id="ntf-7", userId="u-dev-roshn", at=ts(days_ago(6), 13), read=True, kind="info",
         title=AR("طلبكم لدى الجهات الخارجية", "Your request is with external entities"),
         body=AR("RQ-2026-0168 — إيصال التيار الكهربائي", "RQ-2026-0168 — power connection"),
         link="#/portal/requests/RQ-2026-0168"),
    dict(id="ntf-8", userId="u-spec-2", at=ts(days_ago(1), 10), read=False, kind="info",
         title=AR("طلب جاهز لاتخاذ القرار", "Request ready for decision"),
         body=AR("RQ-2026-0188 — تصريح فعاليات (حديقة الملك سلمان)", "RQ-2026-0188 — events permit (King Salman Park)"),
         link="#/work/review/RQ-2026-0188"),
]

AUDIT = []
for r_ in REQUESTS:
    for e in r_["timeline"]:
        if e["type"] in ("state", "decision") and e.get("toState") not in (None, "draft"):
            AUDIT.append(dict(id="aud-%s-%s" % (r_["id"], e["id"]), at=e["at"], actorId=e["byId"],
                              actorRole=e["byRole"], type="request." + (e.get("toState") or "event"),
                              entityType="request", entityId=r_["id"], payload=e.get("payload")))
AUDIT.sort(key=lambda a: a["at"], reverse=True)

# ----------------------------------------------------------------------------
# Settings
# ----------------------------------------------------------------------------
SETTINGS = dict(
    schemaVersion=1,
    seedVersion="2026-07-28.1",
    lang="ar", theme="light",
    holidays=sorted(HOLIDAYS),
    requestSeq=200, permitSeq=PERMIT_SEQ[0], challengeSeq=20, projectSeq=10,
    slaPolicy=dict(workingDays=["sun", "mon", "tue", "wed", "thu"],
                   fastTrackMultiplier=0.5, amberPct=80, redPct=100,
                   escalationLadder=CATALOG["slaPolicy"].get("escalationLadder", [])),
    regulations=[
        dict(id="reg-planning-12", label=AR("نظام إجراءات اعتماد المخططات العمرانية — المادة 12", "Urban Plans Approval Procedures — Art. 12")),
        dict(id="reg-building-6", label=AR("اشتراطات البناء في مدينة الرياض — المادة 6", "Riyadh Building Requirements — Art. 6")),
        dict(id="reg-events-6", label=AR("اشتراطات تصاريح الفعاليات المؤقتة — المادة 6", "Temporary Events Permit Requirements — Art. 6")),
        dict(id="reg-roads-9", label=AR("لائحة إشغالات الطرق والحفريات — المادة 9", "Road Occupation & Excavation Regulations — Art. 9")),
        dict(id="reg-env-14", label=AR("نظام البيئة — المادة 14", "Environment Law — Art. 14")),
        dict(id="reg-fees-3", label=AR("لائحة الرسوم والمقابل المالي البلدي — المادة 3", "Municipal Fees & Charges Regulations — Art. 3")),
        dict(id="reg-other", label=AR("مرجع نظامي آخر (يُحدد نصًا)", "Other regulatory reference (specify)")),
    ],
    entities=CATALOG["entities"],
    connectors=[
        dict(id="gis", name=AR("نظم المعلومات الجغرافية GIS", "GIS systems"), mode="simulated", lastPingAt=None),
        dict(id="licensing", name=AR("نظام التراخيص", "Licensing system"), mode="simulated", lastPingAt=None),
        dict(id="amanah_core", name=AR("أنظمة الأمانة الداخلية", "Amanah core systems"), mode="simulated", lastPingAt=None),
        dict(id="developer_sys", name=AR("أنظمة المطورين", "Developer systems"), mode="simulated", lastPingAt=None),
        dict(id="permits", name=AR("أنظمة التصاريح", "Permit systems"), mode="simulated", lastPingAt=None),
        dict(id="crm", name=AR("نظام إدارة علاقات العملاء CRM", "Amanah CRM"), mode="simulated", lastPingAt=None),
    ],
)

SEED = dict(
    settings=SETTINGS,
    meta=dict(generatedAt=ts(TODAY), rfp="RRDC-RFX-00540-2", track=9),
    journeyPhases=CATALOG["journeyPhases"],
    personas=CATALOG["personas"],
    services=CATALOG["services"],
    journeys=JOURNEYS,
    challengeCategories=CATALOG["challengeCategories"],
    satisfaction=CATALOG["satisfaction"],
    users=USERS,
    projects=PROJECTS,
    requests=REQUESTS,
    challenges=CHALLENGES,
    notifications=NOTIFS,
    auditEvents=AUDIT,
)

out = os.path.join(HERE, "data.json")
json.dump(SEED, open(out, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("data.json written (%d KB) — %d services, %d projects, %d requests, %d challenges, %d users"
      % (os.path.getsize(out) // 1024, len(SEED["services"]), len(PROJECTS), len(REQUESTS), len(CHALLENGES), len(USERS)))
# state coverage report
states = {}
for r_ in REQUESTS: states[r_["state"]] = states.get(r_["state"], 0) + 1
print("state coverage:", dict(sorted(states.items())))
