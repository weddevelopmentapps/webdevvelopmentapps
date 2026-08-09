/* ============================================================
   منصة استدامة كفاءة الإنفاق — الهيئة الملكية لمدينة الرياض
   Vanilla JS + ECharts. RTL. localStorage persistence.
   ============================================================ */
"use strict";

/* ---------------- state & persistence ---------------- */
const SEED = window.DATA;
const LS_KEY = "rcrcSE.v1";
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- i18n ---------------- */
const EN_DICT = {};
for(const [k,v] of Object.entries(window.EN_DICT || {}))
  EN_DICT[k.trim().replace(/\s+/g," ")] = v;
let LANG = localStorage.getItem("rcrcSE.lang") || "ar";
{ const q = new URLSearchParams(location.search).get("lang");
  if(q==="en"||q==="ar"){ LANG=q; localStorage.setItem("rcrcSE.lang", q); } }
const isAR = ()=>LANG==="ar";
const QQ = x=> isAR()? "«"+x+"»" : `“${x}”`;
const ARROW = ()=> isAR()? "←" : "→";
function t(s){
  if(LANG==="ar" || s==null) return s;
  const k = String(s).trim().replace(/\s+/g," ");
  return EN_DICT[k] !== undefined ? EN_DICT[k] : s;
}
function setLang(l){
  LANG = l;
  localStorage.setItem("rcrcSE.lang", l);
  document.documentElement.dir = l==="ar" ? "rtl" : "ltr";
  document.documentElement.lang = l;
  applyStaticI18n();
  refresh();
}
function applyStaticI18n(){
  const q = s=>document.querySelector(s);
  const set = (sel, ar)=>{ const el=q(sel); if(el) el.textContent = t(ar); };
  set("#mast-h1", "منصة استدامة كفاءة الإنفاق");
  set(".mast-title .entity", "الهيئة الملكية لمدينة الرياض");
  const sub = q("#mast-sub"); if(sub) sub.textContent = t(S.data.meta.subtitle);
  set("#demo-chip", "بيانات تجريبية لأغراض العرض");
  const asof = q("#asof-chip"); if(asof) asof.textContent = `${t("محدثة حتى")} ${fmtDate(S.data.meta.asOf)}`;
  const labels = { "btn-export":"تصدير", "btn-import":"استيراد", "btn-print":"طباعة", "btn-reset":"استرجاع" };
  Object.entries(labels).forEach(([id, ar])=>{
    const b = document.getElementById(id);
    if(b){ const node=[...b.childNodes].find(n=>n.nodeType===3 && n.textContent.trim()); if(node) node.textContent = " " + t(ar); }
  });
  const bl = document.getElementById("btn-lang");
  if(bl) bl.textContent = LANG==="ar" ? "English" : "العربية";
  document.title = t("منصة استدامة كفاءة الإنفاق") + " — " + t("الهيئة الملكية لمدينة الرياض");
}

function deepClone(o){ return JSON.parse(JSON.stringify(o)); }

let S = {
  tab: "home",
  skepMode: "self",          // self | sim
  data: loadState(),
  filters: { iniStatus: "الكل", iniProgram: "الكل", iniQ: "", svcQ: "", kpiFam: "الكل", studyType: "الكل" },
  sort: {},
};

function loadState(){
  try{
    const raw = localStorage.getItem(LS_KEY);
    if(raw){
      const saved = JSON.parse(raw);
      if(saved && saved.meta && saved.meta.asOf === SEED.meta.asOf) return saved;
    }
  }catch(e){ /* corrupted storage — fall back to seed */ }
  return deepClone(SEED);
}
let saveT = null;
function save(){
  clearTimeout(saveT);
  saveT = setTimeout(()=>{
    try{ localStorage.setItem(LS_KEY, JSON.stringify(S.data)); }
    catch(e){ toast("تعذر الحفظ المحلي — المساحة ممتلئة"); }
  }, 250);
}
function resetData(){
  if(!confirm(t("سيجري استرجاع بيانات العرض الأصلية وستُفقد جميع التعديلات المحلية. هل تريد المتابعة؟"))) return;
  localStorage.removeItem(LS_KEY);
  S.data = deepClone(SEED);
  refresh(); toast("تم استرجاع البيانات الأصلية");
}

/* ---------------- formatting ---------------- */
const NF = new Intl.NumberFormat("en-US");
function n(x, d){ return (d==null? NF.format(Math.round(x)) : Number(x).toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d})); }
function ltr(s){ return `<span class="ltr">${s}</span>`; }
function money(m){  // m in SAR millions
  if(m == null) return "—";
  if(Math.abs(m) >= 1000) return `${ltr(n(m/1000,2))} ${t("مليار ريال")}`;
  return `${ltr(n(m))} ${t("مليون ريال")}`;
}
function moneyShort(m){
  if(Math.abs(m) >= 1000) return `${ltr(n(m/1000,1))} ${t("مليار")}`;
  return `${ltr(n(m))} ${t("م.ر")}`;
}
function pct(x,d){ return `${ltr(n(x, d==null?0:d)+"%")}`; }
function esc(s){ return String(s==null?"":t(s)).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
const AR_MONTHS = {"01":"يناير","02":"فبراير","03":"مارس","04":"أبريل","05":"مايو","06":"يونيو","07":"يوليو","08":"أغسطس","09":"سبتمبر","10":"أكتوبر","11":"نوفمبر","12":"ديسمبر"};
function fmtDate(iso){
  if(!iso) return "—";
  const [y,m,d] = iso.split("-");
  return `${parseInt(d||1)} ${t(AR_MONTHS[m]||"")} ${y}`;
}
function daysBetween(a, b){ return Math.round((new Date(b) - new Date(a)) / 86400000); }

/* ---------------- SKEP engine (live roll-ups) ---------------- */
const MODES = { self:"selfScore", sim:"simScore", prev:"prevScore" };
function critScore(c, mode){ return c[MODES[mode]]; }
function pillarScore(p, mode){
  const k = MODES[mode];
  return Math.round(p.criteria.reduce((s,c)=>s+c[k],0) / p.criteria.length * 100) / 100;
}
function overallScore(mode){
  const ps = S.data.pillars.map(p=>pillarScore(p, mode));
  return Math.round(ps.reduce((a,b)=>a+b,0) / ps.length * 10) / 10;
}
function gradeOf(score){
  const t = S.data.maturity.thresholds.find(t=>score >= t.min);
  return t ? t.name : "مبتدئ";
}
function gradeColor(name){
  const lv = S.data.maturity.levels.find(l=>l.name===name);
  return lv ? lv.color : "#5C6E63";
}
function evStats(scope){ // scope: array of criteria
  let total=0, ready=0, prep=0, missing=0;
  scope.forEach(c=>c.evidence.forEach(e=>{
    total++;
    if(e.status==="متوفر") ready++;
    else if(e.status==="قيد الإعداد") prep++;
    else missing++;
  }));
  return { total, ready, prep, missing, coverage: total? Math.round(ready/total*100):0 };
}
function allCriteria(){ return S.data.pillars.flatMap(p=>p.criteria.map(c=>({...c, pillar:p}))); }

/* ---------------- impact & initiative roll-ups ---------------- */
function impactTotals(){
  const I = S.data.initiatives;
  const identified = I.reduce((s,i)=>s+(+i.estImpact||0),0);
  const approved = I.reduce((s,i)=>s+(+i.approvedImpact||0),0);
  const realized = I.reduce((s,i)=>s+(+i.realizedImpact||0),0);
  const documented = I.filter(i=>i.status==="مقفلة").reduce((s,i)=>s+(+i.realizedImpact||0),0);
  return { identified, approved, realized, documented };
}
function iniStats(){
  const I = S.data.initiatives;
  const flagged = I.filter(i=>i.flag==="متأخرة"||i.flag==="متعثرة").length;
  const commitment = I.length? Math.round((1 - flagged/I.length)*1000)/10 : 100;
  const cr = I.reduce((s,i)=>s+(+i.changeRequests||0),0);
  return { total:I.length, flagged, commitment, cr, crAvg: I.length? Math.round(cr/I.length*100)/100 : 0 };
}
const INI_STAGES = ["فرصة","دراسة","معتمدة","تنفيذ","قياس الأثر","مقفلة"];
function statusCount(){
  const m = {}; INI_STAGES.forEach(s=>m[s]=0);
  S.data.initiatives.forEach(i=>{ if(m[i.status]!=null) m[i.status]++; });
  return m;
}
function progName(id){ const p = S.data.programs.find(p=>p.id===id); return p? t(p.name) : id; }
function progShort(id){ const p = S.data.programs.find(p=>p.id===id); return p? t(p.short||p.name) : id; }

/* ---------------- funding chain ---------------- */
const FR_CHAIN = ["الإعداد","مراجعة المقيّم","مراجعة قائد الفريق","مراجعة المالية","اعتماد المسؤول الأول","مرفوع لوزارة المالية","معتمد"];
function frComplete(r){
  return Object.values(r.fiveStudies).every(Boolean) && r.cdStudy && r.scopeDoc && r.valueDoc;
}
/* intake quality across ALL registered requests — the entry gate itself
   guarantees 100% completeness inside the review chain */
function frCompliance(){
  const all = S.data.fundingRequests;
  if(!all.length) return 100;
  return Math.round(all.filter(frComplete).length / all.length * 100);
}

/* ---------------- alerts ---------------- */
function buildAlerts(){
  const A = [];
  const asOf = S.data.meta.asOf;
  S.data.initiatives.filter(i=>i.flag==="متعثرة").forEach(i=>
    A.push({sev:"bad", t:`${t("مبادرة متعثرة")}: ${t(i.name)}`, d:i.note||"تتطلب قراراً من اللجنة الإشرافية.", tab:"initiatives"}));
  S.data.initiatives.filter(i=>i.flag==="متأخرة").forEach(i=>
    A.push({sev:"warn", t:`${t("مبادرة متأخرة عن الخط الزمني")}: ${t(i.name)}`, d:i.note||"يلزم تحديث خطة المعالجة.", tab:"initiatives"}));
  S.data.fundingRequests.filter(r=>r.stage==="معاد للاستكمال").forEach(r=>
    A.push({sev:"warn", t:`${t("طلب تمويل معاد للاستكمال")}: ${t(r.name)}`, d:r.note||"استكمال المتطلبات قبل إعادة الرفع.", tab:"funding"}));
  const missing = allCriteria().filter(c=>c.evidence.some(e=>e.status==="غير متوفر"));
  if(missing.length)
    A.push({sev:"warn", t:`${n(missing.length)} ${t("من المعايير تنقصها وثائق داعمة")}`, d:"استكمال الوثائق شرط أساسي لدرجة «متميز» في التقييم.", tab:"skep"});
  const weak = allCriteria().filter(c=>c.simScore<=2);
  weak.forEach(c=>A.push({sev:"bad", t:`${t("معيار منخفض في تقييم المحاكاة")}: ${c.code} ${t(c.name)}`, d:"يتطلب خطة معالجة عاجلة قبل التقييم النهائي.", tab:"skep"}));
  const dLeft = daysBetween(asOf, S.data.assessmentCycle.selfDue);
  A.push({sev: dLeft<=45?"warn":"info", t:`${n(dLeft)} ${t("يوماً حتى موعد التقييم الذاتي للدورة السابعة")}`,
          d:`${t("آخر موعد للتقييم الذاتي")} ${fmtDate(S.data.assessmentCycle.selfDue)} ${t("ورفع الوثائق")} ${fmtDate(S.data.assessmentCycle.docsDue)}.`, tab:"skep"});
  return A;
}

/* ---------------- ECharts helpers ---------------- */
const CH = {};
const PALETTE = ["#0B4028","#098A4E","#C7A34F","#3A6EA5","#14A862","#8A7A2E","#5C6E63","#1B6E52"];
function ramp(i, total){
  // deep green -> logo green interpolation
  const a=[11,64,40], b=[20,168,98];
  const t = total<=1? 0 : i/(total-1);
  const c = a.map((v,k)=>Math.round(v+(b[k]-v)*t));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
}
function chart(id){
  const el = document.getElementById(id);
  if(!el) return null;
  if(CH[id] && CH[id].getDom() !== el){ CH[id].dispose(); delete CH[id]; }
  if(!CH[id]) CH[id] = echarts.init(el);
  return CH[id];
}
const TT = ()=>({
  trigger:"item", backgroundColor:"#131D17", borderColor:"transparent", borderWidth:0,
  textStyle:{ color:"#F1F5F2", fontFamily:"Cairo", fontSize:12 },
  extraCssText:(isAR()? "direction:rtl;text-align:right;" : "direction:ltr;text-align:left;") +
    "box-shadow:0 14px 40px rgba(10,20,15,.35);border-radius:13px;padding:11px 15px;",
});
function ttRow(k, v, color){
  return `<div style="display:flex;justify-content:space-between;gap:18px;align-items:center;margin:2px 0">
    <span style="color:#A9B6AE">${color?`<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-inline-end:6px"></span>`:""}${k}</span>
    <b style="font-family:'IBM Plex Sans Arabic';color:#FFF">${v}</b></div>`;
}
function base(extra){
  const o = Object.assign({
    animation: !REDUCED,
    animationDuration: 300,          // short: printed/captured views always show final values
    textStyle:{ fontFamily:"Cairo" },
    grid:{ top:30, bottom:28, right:14, left:52, containLabel:false },
  }, extra);
  /* grid insets are authored for RTL (value labels at the right); mirror for LTR */
  if(!isAR() && o.grid && o.grid.left!=null && o.grid.right!=null)
    o.grid = Object.assign({}, o.grid, { left:o.grid.right, right:o.grid.left });
  return o;
}
const AX_LINE = "rgba(17,24,21,.1)", AX_SPLIT = "rgba(17,24,21,.055)", AX_LBL = "#93A099", AX_CAT = "#6B7870";
const tArr = a=>a.map(x=>t(x));
const bRad = r=> isAR()? [r,0,0,r] : [0,r,r,0];       // rounded tip of horizontal bars
const hLbl = ()=> isAR()? "left" : "right";           // value label at the growing tip
function catAxis(data){
  return { type:"category", data:tArr(data), inverse:isAR(),
    axisLine:{ lineStyle:{ color:AX_LINE } }, axisTick:{ show:false },
    axisLabel:{ color:AX_CAT, fontFamily:"Cairo", fontSize:11 } };
}
function valAxis(fmt){
  return { type:"value", position: isAR()? "right":"left",
    splitLine:{ lineStyle:{ color:AX_SPLIT } }, axisLabel:{ color:AX_LBL, fontFamily:"IBM Plex Sans Arabic", fontSize:10.5, formatter:fmt } };
}
/* horizontal bars: grow from the inline-start edge, category labels at inline-start */
function hxAxis(fmt, max){
  const a = { type:"value", inverse:isAR(),
    splitLine:{ lineStyle:{ color:AX_SPLIT } },
    axisLabel:{ color:AX_LBL, fontFamily:"IBM Plex Sans Arabic", fontSize:10.5, formatter:fmt } };
  if(max!=null) a.max = max;
  return a;
}
function hyAxis(data, labelWidth){
  return { type:"category", data:tArr(data), position: isAR()? "right":"left", inverse:true,
    axisLine:{ lineStyle:{ color:"transparent" } }, axisTick:{ show:false },
    axisLabel:{ color:AX_CAT, fontFamily:"Cairo", fontSize:11,
      width: labelWidth||null, overflow: labelWidth? "truncate":"none" } };
}
/* vertical charts: category x-axis reads with the language direction */
function catXAxis(data, extra){
  return Object.assign({ type:"category", data:tArr(data), inverse:isAR(),
    axisLine:{ lineStyle:{ color:AX_LINE } }, axisTick:{ show:false },
    axisLabel:{ color:AX_CAT, fontFamily:"Cairo", fontSize:11 } }, extra||{});
}
let resizeT=null;
addEventListener("resize", ()=>{ clearTimeout(resizeT); resizeT=setTimeout(()=>Object.values(CH).forEach(c=>c.resize()),150); });
function resizeAll(){ requestAnimationFrame(()=>Object.values(CH).forEach(c=>c.resize())); }

/* ---------------- icons ---------------- */
const IC = {
  home:'<path d="M3 11l9-8 9 8M5 9v11h5v-6h4v6h5V9"/>',
  skep:'<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 12l9 5 9-5M3 16l9 5 9-5"/>',
  bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 00-4 10c.6.6 1 1.2 1 2h6c0-.8.4-1.4 1-2a6 6 0 00-4-10z"/>',
  coins:'<ellipse cx="9" cy="6" rx="6" ry="3"/><path d="M3 6v6c0 1.7 2.7 3 6 3s6-1.3 6-3V6"/><path d="M3 12v6c0 1.7 2.7 3 6 3s6-1.3 6-3v-6M15 9c3.3 0 6 1.3 6 3v6c0 1.7-2.7 3-6 3"/>',
  doc:'<path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6z"/><path d="M14 3v6h6M9 14l2 2 4-4"/>',
  book:'<path d="M4 19.5A2.5 2.5 0 016.5 17H20V3H6.5A2.5 2.5 0 004 5.5v14z"/><path d="M4 19.5A2.5 2.5 0 006.5 22H20v-5"/>',
  gridic:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  pie:'<path d="M21 12A9 9 0 1112 3v9h9z"/><path d="M21 8a9 9 0 00-6-5v5h6z"/>',
  chartic:'<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>',
  users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.5 3.4-5.5 6.5-5.5S14.7 16.5 15.5 20M16 5a3.5 3.5 0 010 7M17.5 15c2.2.6 3.6 2.3 4 5"/>',
  file:'<path d="M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9l-6-6z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
  flag:'<path d="M5 21V4a1 1 0 011-1h12l-3 4 3 4H6"/>',
  plan:'<rect x="4" y="4" width="16" height="17" rx="2"/><path d="M9 3v3M15 3v3M4 10h16M8 14h3M8 17h6"/>',
  people:'<circle cx="12" cy="7" r="3.5"/><path d="M5 21c.7-4 3.3-6.5 7-6.5s6.3 2.5 7 6.5"/>',
  cart:'<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M3 4h2l2.6 12h11l2.4-9H7"/>',
  crane:'<path d="M3 21h18M6 21V8l8-5v18M14 8h6v4M17 12v5"/>',
  building:'<rect x="4" y="7" width="10" height="14" rx="1"/><path d="M14 11h6v10M7 11h1.5M7 15h1.5M11 11h.5M11 15h.5M17 15h.5"/>',
  gauge:'<path d="M5 19a9 9 0 1114 0"/><path d="M12 14l4-5"/><circle cx="12" cy="14" r="1.6"/>',
  alertT:'<path d="M12 3l10 17H2L12 3z"/><path d="M12 9v5M12 17.5v.5"/>',
  info:'<circle cx="12" cy="12" r="9"/><path d="M12 8v.5M12 11v5"/>',
  check:'<circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 5-5.5"/>',
  clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
};
function svgi(name, cls){ return `<svg class="${cls||""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${IC[name]||""}</svg>`; }

/* ---------------- tabs ---------------- */
const TABS = [
  { id:"home", name:"الرئيسية", icon:"home" },
  { id:"skep", name:"ركائز الاستدامة", icon:"skep", kicker:"برنامج ركائز استدامة كفاءة الإنفاق",
    desc:"الركائز السبع لدورة حياة الإنفاق — التقييم الذاتي ومحاكاة التقييم المستقل والوثائق الداعمة وخطط المعالجة." },
  { id:"initiatives", name:"المبادرات", icon:"bulb", kicker:"دورة حياة المبادرات",
    desc:"من بطاقة الفرصة إلى الإقفال، مع اشتراط التحقق المالي وقاعدة مرجعية لممارسات الجهات الحكومية." },
  { id:"impact", name:"الأثر المالي", icon:"coins", kicker:"قياس الأثر",
    desc:"سجل الوفورات المعتمد: وفر مباشر وتجنب تكلفة وتعظيم إيراد، بخطوط أساس موثقة وتحقق مالي قبل الاعتماد." },
  { id:"funding", name:"طلبات التمويل", icon:"doc", kicker:"التخطيط والإعداد",
    desc:"لائحة التعقب وسلسلة المراجعة الرباعية واشتراط اكتمال الدراسات الخمس ودراسات السعة والطلب." },
  { id:"studies", name:"الدراسات", icon:"book", kicker:"أتمتة المنهجيات",
    desc:"دراسات السعة والطلب والدراسات الخمس والهندسة القيمية، مع مكتبة المنهجيات والمقارنات المعيارية." },
  { id:"services", name:"الخدمات", icon:"gridic", kicker:"مراجعة الخدمات",
    desc:"دليل خدمات الهيئة بتكلفة المعاملة وتصنيف الجودة ونقاط المراجعة والنسبة الرقمية." },
  { id:"budget", name:"الميزانية والمراجعة", icon:"pie", kicker:"مراجعة الإنفاق",
    desc:"أبواب الميزانية وعوامل التكلفة ومسببات الطلب وسجل مراجعات الإنفاق وفرصها." },
  { id:"kpis", name:"مؤشرات الأداء", icon:"chartic", kicker:"إدارة الأداء",
    desc:"مجموعات المؤشرات الأربع وفق النموذج التشغيلي لفرق كفاءة الإنفاق، بمعادلاتها واتجاهاتها." },
  { id:"governance", name:"الحوكمة", icon:"shield", kicker:"الحوكمة والتنظيم",
    desc:"التنظيم الإداري وملاك الركائز واللجان وسجل السياسات وسلم التصعيد مع هيئة كفاءة الإنفاق." },
  { id:"capability", name:"القدرات والثقافة", icon:"users", kicker:"بناء القدرات وإدارة التغيير",
    desc:"التدريب وقياس الوعي ومستويات التبني وخطط التعاقب وإدارة المعرفة وآلية التحفيز." },
  { id:"reports", name:"التقارير", icon:"file", kicker:"التقارير الدورية",
    desc:"تقارير حية جاهزة للطباعة والرفع: الربع سنوية والسنوية وجاهزية الركائز وحزمة إكسبرو." },
];
const BN_MAIN = ["home","skep","initiatives","impact"];
function renderTabbar(){
  document.getElementById("tabbar-inner").innerHTML = TABS.map(tb=>
    `<button class="tab ${S.tab===tb.id?"on":""}" data-tab="${tb.id}" ${S.tab===tb.id?'aria-current="page"':""}>${svgi(tb.icon)}${t(tb.name)}</button>`
  ).join("");
  renderBottomNav();
}
function renderBottomNav(){
  const bn = document.getElementById("bn-inner");
  if(!bn) return;
  const inMore = !BN_MAIN.includes(S.tab);
  bn.innerHTML = BN_MAIN.map(id=>{
    const tb = TABS.find(x=>x.id===id);
    return `<button class="bn-item ${S.tab===id?"on":""}" data-tab="${id}">${svgi(tb.icon)}${t(tb.name)}</button>`;
  }).join("") + `<button class="bn-item ${inMore?"on":""}" id="bn-more">${svgi("gridic")}${t("المزيد")}</button>`;
  bn.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{ closeMoreSheet(); go(b.dataset.tab); }));
  document.getElementById("bn-more").addEventListener("click", openMoreSheet);
}
function openMoreSheet(){
  const ms = document.getElementById("ms-body");
  ms.innerHTML = `
    <h4>${t("الأقسام")}</h4>
    <div class="ms-grid">
      ${TABS.filter(tb=>!BN_MAIN.includes(tb.id)).map(tb=>
        `<button class="ms-item ${S.tab===tb.id?"on":""}" data-tab="${tb.id}">${svgi(tb.icon)}${t(tb.name)}</button>`).join("")}
    </div>
    <h4>${t("البيانات")}</h4>
    <div class="ms-grid">
      <button class="ms-item" data-act="export">${svgi("doc")}${t("تصدير")}</button>
      <button class="ms-item" data-act="import">${svgi("doc")}${t("استيراد")}</button>
      <button class="ms-item" data-act="print">${svgi("file")}${t("طباعة")}</button>
      <button class="ms-item" data-act="reset">${svgi("clock")}${t("استرجاع")}</button>
    </div>`;
  ms.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>{ closeMoreSheet(); go(b.dataset.tab); }));
  ms.querySelectorAll("[data-act]").forEach(b=>b.addEventListener("click",()=>{
    closeMoreSheet();
    ({ export:doExport, import:doImport, print:()=>window.print(), reset:resetData })[b.dataset.act]();
  }));
  document.getElementById("moresheet").classList.add("on");
  OV.classList.add("on");
}
function closeMoreSheet(){
  document.getElementById("moresheet").classList.remove("on");
  if(!DR.classList.contains("on") && !MO.classList.contains("on")) OV.classList.remove("on");
}
document.getElementById("tabbar-inner").addEventListener("click", e=>{
  const b = e.target.closest("[data-tab]");
  if(b) go(b.dataset.tab);
});
function go(tab){
  S.tab = tab;
  location.hash = tab;
  closeDrawer(); hideReport();
  refresh();
  scrollTo({top:0, behavior: REDUCED? "auto":"smooth"});
}

/* ---------------- shell rendering ---------------- */
const APP = document.getElementById("app");
function refresh(){
  renderTabbar();
  const R = RENDER[S.tab] || RENDER.home;
  const tb = TABS.find(x=>x.id===S.tab);
  const head = (!R.hero && tb && tb.desc)
    ? `<header class="page-head">
         <div class="kicker">${esc(tb.kicker||"")}</div>
         <h1>${esc(tb.name)}</h1>
         <div class="desc">${esc(tb.desc)}</div>
       </header>`
    : "";
  APP.innerHTML = head + R.html();
  R.mount && R.mount();
  resizeAll();
}

/* ============================================================
   TAB: home
   ============================================================ */
function kpiTile(icon, iconCls, label, value, foot){
  return `<div class="kpi">
    <div class="lbl">${label}</div>
    <div class="val">${value}</div>
    <div class="foot">${foot||""}</div>
  </div>`;
}
const RENDER = {};

RENDER.home = {
  hero: true,
  html(){
    const ov = overallScore("self");
    const ovSim = overallScore("sim");
    const ovPrev = overallScore("prev");
    const g = gradeOf(ov);
    const ist = iniStats();
    const evs = evStats(allCriteria());
    const alerts = buildAlerts();
    const dLeft = daysBetween(S.data.meta.asOf, S.data.assessmentCycle.selfDue);
    const m2026 = S.data.impact.monthly2026;
    const real2026 = m2026.reduce((s,m)=>s+m.real,0);
    const tgt = S.data.meta.impactTarget2026;
    const MIN = 2.5, MAX = 5;
    const pos = v=>Math.max(0, Math.min(100, (v-MIN)/(MAX-MIN)*100));
    return `
    <section class="hero">
      <div class="hero-top">
        <div class="hero-main">
          <div class="lbl">${t("الجاهزية الشاملة لبرنامج ركائز استدامة كفاءة الإنفاق — الدورة السابعة")}</div>
          <div class="hero-score"><span class="big num">${n(ov,1)}</span><span class="of">${t("من 5")}</span></div>
          <div class="hero-grade"><i></i> ${t(g)} — ${t("التقييم الذاتي · المحاكاة المستقلة")} ${ltr(n(ovSim,1))} (${t(gradeOf(ovSim))})</div>
        </div>
        <div class="hero-side">
          <div class="hero-cell">
            <div class="l">${t("الأثر المالي المحقق 2026")}</div>
            <div class="v num">${n(real2026)}</div>
            <div class="s">${t("مليون ريال")} · ${pct(real2026/tgt*100)} ${t("من المستهدف")}</div>
          </div>
          <div class="hero-cell">
            <div class="l">${t("الالتزام بالمبادرات")}</div>
            <div class="v num">${n(ist.commitment,1)}%</div>
            <div class="s">${t("المستهدف")} ${pct(92)} · ${n(ist.flagged)} ${t("متأخرة/متعثرة")}</div>
          </div>
          <div class="hero-cell">
            <div class="l">${t("الوثائق الداعمة")}</div>
            <div class="v num">${evs.coverage}%</div>
            <div class="s">${n(evs.ready)} ${t("من")} ${n(evs.total)} ${t("وثيقة متوفرة")}</div>
          </div>
          <div class="hero-cell">
            <div class="l">${t("المتبقي للتقييم الذاتي")}</div>
            <div class="v num">${n(dLeft)}</div>
            <div class="s">${t("يوماً")} · ${fmtDate(S.data.assessmentCycle.selfDue)}</div>
          </div>
        </div>
      </div>
      <div class="meter" aria-label="${t("مسار النضج نحو متميز")}">
        <div class="meter-track">
          <div class="meter-zone" style="inset-inline-start:${pos(S.data.maturity.targetScore)}%;inset-inline-end:0"></div>
          <div class="meter-fill" style="width:${pos(ov)}%"></div>
        </div>
        <div class="meter-marks">
          <div class="meter-mark" style="inset-inline-start:${pos(ovPrev)}%"><b class="num">${n(ovPrev,1)}</b><span class="ml">${t("الدورة السادسة")}</span></div>
          <div class="meter-mark" style="inset-inline-start:${pos(ovSim)}%"><b class="num">${n(ovSim,1)}</b><span class="ml">${t("المحاكاة المستقلة")}</span></div>
          <div class="meter-mark strong" style="inset-inline-start:${pos(ov)}%"><b class="num">${n(ov,1)}</b><span class="ml">${t("التقييم الذاتي")}</span></div>
          <div class="meter-mark gold" style="inset-inline-start:${pos(S.data.maturity.targetScore)}%"><b class="num">${n(S.data.maturity.targetScore,1)}</b><span class="ml">${t("درجة «متميز»")}</span></div>
        </div>
      </div>
    </section>

    <div class="grid g21 mt">
      <div class="card">
        <h3>${t("مسار الأثر المالي 2026")}</h3>
        <div class="subt">${t("المخطط مقابل المحقق شهرياً (مليون ريال) — المستهدف السنوي")} ${moneyShort(tgt)}</div>
        <div id="ch-home-monthly" class="chart ch-290"></div>
      </div>
      <div class="card">
        <h3>${t("نضج الركائز السبع")}</h3>
        <div class="subt">${t("ذاتي / محاكاة / الدورة السادسة")}</div>
        <div id="ch-home-radar" class="chart ch-290"></div>
      </div>
    </div>

    <div class="grid g2 mt">
      <div class="card">
        <h3>${t("المبادرات حسب مراحل دورة الحياة")}</h3>
        <div class="subt">${t("عدد المبادرات في كل مرحلة")}</div>
        <div id="ch-home-pipe" class="chart ch-260"></div>
      </div>
      <div class="card">
        <h3>${t("تنبيهات تستدعي اتخاذ إجراء")}</h3>
        <div class="subt">${t("تُستخلص تلقائياً من بيانات المنصة")}</div>
        <div style="max-height:260px;overflow-y:auto">
          ${alerts.slice(0,7).map(a=>`
            <div class="alert ${a.sev}" role="button" data-goto="${a.tab}" style="cursor:pointer">
              <div class="ai">${svgi(a.sev==="bad"?"alertT":a.sev==="warn"?"clock":"info")}</div>
              <div><b>${esc(a.t)}</b><div class="at">${esc(a.d)}</div></div>
            </div>`).join("") || '<div class="empty">لا توجد تنبيهات</div>'}
        </div>
      </div>
    </div>

    <div class="grid g21 mt">
      <div class="card">
        <h3>${t("الملخص التنفيذي")}</h3>
        <div class="subt">${t("أبرز الملاحظات المستخلصة من الوضع الراهن")}</div>
        ${homeInsights()}
      </div>
      <div class="card goldrule">
        <h3>${t("دورة التقييم السابعة")}</h3>
        <div class="subt">${esc(S.data.assessmentCycle.name)}</div>
        <div class="countdown" style="margin:12px 0 16px">
          <div class="cd-box"><b>${n(dLeft)}</b><span>${t("يوماً للتقييم الذاتي")}</span></div>
          <div class="cd-box"><b>${n(daysBetween(S.data.meta.asOf, S.data.assessmentCycle.docsDue))}</b><span>${t("يوماً لرفع الوثائق")}</span></div>
        </div>
        <div class="fld"><b>${t("التقييم الذاتي")}</b><span>${fmtDate(S.data.assessmentCycle.selfDue)}</span></div>
        <div class="fld"><b>${t("رفع الوثائق الداعمة")}</b><span>${fmtDate(S.data.assessmentCycle.docsDue)}</span></div>
        <div class="fld"><b>${t("النتائج المتوقعة")}</b><span>${fmtDate(S.data.assessmentCycle.resultsExpected)}</span></div>
        <div class="fld"><b>${t("جهة التقييم الرسمية")}</b><span>${esc(S.data.assessmentCycle.committee)}</span></div>
        <div class="fld"><b>${t("محاكاة التقييم")}</b><span>${esc(S.data.assessmentCycle.simulation||"")}</span></div>
        <button class="btn primary mt" data-goto="skep" style="width:100%;justify-content:center">${t("فتح لوحة الركائز")}</button>
      </div>
    </div>`;
  },
  mount(){
    APP.querySelectorAll("[data-goto]").forEach(el=>el.addEventListener("click",()=>go(el.dataset.goto)));
    // monthly line
    const m = S.data.impact.monthly2026;
    chart("ch-home-monthly").setOption(base({
      tooltip: Object.assign({},TT(),{trigger:"axis", formatter: ps=>{
        let h = `<b>${ps[0].axisValue}</b>`;
        ps.forEach(p=>h+=ttRow(p.seriesName, `${n(p.value)} ${t("م.ر")}`, p.color));
        return h; }}),
      legend:{ icon:"circle", itemWidth:9, itemHeight:9, textStyle:{fontFamily:"Cairo",fontSize:11,color:"#5C6E63"}, top:0 },
      xAxis: catXAxis(m.map(x=>x.m)),
      yAxis: valAxis(v=>n(v)),
      grid:{ top:34, bottom:26, right:46, left:12 },
      series:[
        { name:t("المخطط"), type:"line", data:m.map(x=>x.plan), smooth:true, symbol:"circle", symbolSize:6,
          lineStyle:{color:"#C7A34F",width:2.5,type:"dashed"}, itemStyle:{color:"#C7A34F"} },
        { name:t("المحقق"), type:"line", data:m.map(x=>x.real), smooth:true, symbol:"circle", symbolSize:6,
          lineStyle:{color:"#098A4E",width:3}, itemStyle:{color:"#098A4E"},
          areaStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:"rgba(9,138,78,.22)"},{offset:1,color:"rgba(9,138,78,0)"}]}} },
      ],
    }));
    // radar
    mountRadar("ch-home-radar");
    // pipeline
    const sc = statusCount();
    chart("ch-home-pipe").setOption(base({
      tooltip: Object.assign({},TT(),{formatter: p=>ttRow(p.name, p.value>=3&&p.value<=10? `${n(p.value)} ${t("مبادرات")}` : p.value===2? "مبادرتان" : p.value===1? "مبادرة واحدة" : `${n(p.value)} ${t("مبادرة")}`, p.color)}),
      xAxis: hxAxis(v=>n(v)),
      yAxis: hyAxis(INI_STAGES, 84),
      grid:{ top:12, bottom:26, right:86, left:34 },
      series:[{ type:"bar", data: INI_STAGES.map(s=>({value:sc[s], itemStyle:{color:"#098A4E", borderRadius:bRad(6)}})),
        barWidth:14, label:{show:true, position:hLbl(), fontFamily:"IBM Plex Sans Arabic", color:"#6B7870", formatter:p=>n(p.value)} }],
    }));
  },
};
function homeInsights(){
  const it = impactTotals();
  const evs = evStats(allCriteria());
  const gaps = allCriteria().filter(c=>c.simScore < 4).length;
  const fr = frCompliance();
  const real2026 = S.data.impact.monthly2026.reduce((s,m)=>s+m.real,0);
  const tgt = S.data.meta.impactTarget2026;
  return `
    <div class="insight navy">${t("التقييم الذاتي الشامل")} ${ltr(n(overallScore("self"),1))} ${t("ومحاكاة التقييم المستقل")} ${ltr(n(overallScore("sim"),1))} ${t("من 5 — الفجوة الفعلية إلى «متميز» تُقاس على نتيجة المحاكاة")} (${ltr(n(Math.max(0,S.data.maturity.targetScore-overallScore("sim")),1))} ${t("نقطة)، ويتركز الجهد المطلوب في ركيزتي")} <b>${t("قياس الأثر")}</b> ${t("و")}<b>${t("الأصول والمرافق")}</b>.</div>
    <div class="insight">${t("تحقق")} ${pct(real2026/tgt*100)} ${t("من مستهدف الأثر المالي لعام 2026 حتى نهاية يوليو، مع فرص معتمدة من الشؤون المالية بقيمة")} ${money(it.approved)} ${t("بما يدعم بلوغ المستهدف قبل نهاية العام")}.</div>
    <div class="insight gold">${n(gaps)} ${t("معياراً دون درجة «متمكن» في تقييم المحاكاة المستقلة — معالجة هذه المعايير مع رفع اكتمال الوثائق (حالياً")} ${pct(evs.coverage)}) ${t("هي المسار الأسرع لبلوغ درجة «متميز»")}.</div>
    <div class="insight">${t("جودة طلبات التمويل المسجلة في لائحة التعقب عند")} ${pct(fr)} ${t("من حيث اكتمال الدراسات الخمس ودراسات السعة والطلب قبل الرفع لوزارة المالية")}.</div>`;
}
function mountRadar(id){
  const c = chart(id); if(!c) return;
  const P = S.data.pillars;
  c.setOption({
    animation:!REDUCED,
    tooltip: Object.assign({},TT()),
    legend:{ icon:"circle", itemWidth:9, itemHeight:9, bottom:0, textStyle:{fontFamily:"Cairo",fontSize:11,color:"#5C6E63"} },
    radar:{
      indicator:P.map(p=>({name:t(p.short), max:5})),
      radius:"64%", center:["50%","47%"], splitNumber:5,
      axisName:{ color:"#5C6E63", fontFamily:"Cairo", fontSize:11.5 },
      splitArea:{ areaStyle:{ color:["#FFFFFF","#F3F8F4"] } },
      splitLine:{ lineStyle:{ color:"#E2EDE5" } }, axisLine:{ lineStyle:{ color:"#DCE8E0" } },
    },
    series:[{ type:"radar", symbolSize:4,
      data:[
        { name:t("الذاتي"), value:P.map(p=>pillarScore(p,"self")), lineStyle:{color:"#098A4E",width:2.5}, itemStyle:{color:"#098A4E"}, areaStyle:{color:"rgba(9,138,78,.14)"} },
        { name:t("المحاكاة"), value:P.map(p=>pillarScore(p,"sim")), lineStyle:{color:"#0B4028",width:2}, itemStyle:{color:"#0B4028"} },
        { name:t("الدورة 6"), value:P.map(p=>pillarScore(p,"prev")), lineStyle:{color:"#9AA8A0",width:1.6,type:"dashed"}, itemStyle:{color:"#9AA8A0"} },
      ]}],
  });
}

/* ============================================================
   TAB: skep
   ============================================================ */
RENDER.skep = {
  html(){
    const mode = S.skepMode;
    const ov = overallScore(mode);
    const g = gradeOf(ov);
    const evs = evStats(allCriteria());
    const gaps = allCriteria().filter(c=>critScore(c,mode) < 4.5).sort((a,b)=>critScore(a,mode)-critScore(b,mode));
    return `
    <div class="toolbar">
      <div class="pillbar" role="tablist" aria-label="${t("وضع التقييم")}">
        <button class="pill ${mode==="self"?"on":""}" data-mode="self">${t("التقييم الذاتي")}</button>
        <button class="pill ${mode==="sim"?"on":""}" data-mode="sim">${t("محاكاة التقييم المستقل")}</button>
      </div>
      <span class="mini-note">${t("اضغط على أي ركيزة لفتح معاييرها وتحديث الدرجات والوثائق")}</span>
      <div class="spacer"></div>
      <span class="grade" style="background:${gradeColor(g)}18;color:${gradeColor(g)}">${t("الدرجة الإجمالية")}: ${ltr(n(ov,1))} — ${t(g)}</span>
    </div>

    <div class="grid g21">
      <div class="card">
        <h3>${t("خريطة نضج الركائز السبع")}</h3>
        <div class="subt">${t("درجة كل ركيزة")} (${mode==="self"?t("التقييم الذاتي"):t("محاكاة التقييم المستقل")}) — ${t("الخط الذهبي المتقطع: مستهدف «متميز»")} ${ltr(n(S.data.maturity.targetScore,1))}</div>
        <div id="ch-skep-bars" class="chart ch-340"></div>
      </div>
      <div class="card">
        <h3>${t("مقارنة الدورات")}</h3>
        <div class="subt">${t("ذاتي / محاكاة / الدورة السادسة")}</div>
        <div id="ch-skep-radar" class="chart ch-340"></div>
      </div>
    </div>

    <div class="section-head"><h2>${t("الركائز السبع — دورة حياة الإنفاق")}</h2>
      <span class="hint">${t("الوثائق الداعمة")}: ${n(evs.ready)} ${t("متوفرة")} · ${n(evs.prep)} ${t("قيد الإعداد")} · ${n(evs.missing)} ${t("غير متوفرة")}</span></div>
    <div class="grid g4" style="grid-template-columns:repeat(auto-fit,minmax(192px,1fr))">
      ${S.data.pillars.map((p,i)=>{
        const s = pillarScore(p,mode); const pg = gradeOf(s);
        const pe = evStats(p.criteria);
        return `<div class="card pillar-card lift" data-pillar="${p.id}" style="border-top-color:${ramp(i,7)}">
          <div class="ph"><div class="picon">${svgi(p.icon)}</div><div><h3>${esc(p.name)}</h3><span class="owner-tag">${esc(p.owner)}</span></div></div>
          <div class="pillar-row">
            <span class="pscore">${ltr(n(s,2))}<small> / 5</small></span>
            <span class="st" style="background:${gradeColor(pg)}18;color:${gradeColor(pg)}">${t(pg)}</span>
          </div>
          <div class="bar-mini" style="margin-top:8px"><i style="width:${s/5*100}%"></i></div>
          <div class="pillar-row"><span class="mini-note">${n(p.criteria.length)} ${t("معايير")}</span>
            <span class="mini-note">${t("وثائق")}: ${pct(pe.coverage)}</span></div>
        </div>`;}).join("")}
    </div>

    <div class="grid g21 mt">
      <div class="card">
        <h3>${t("مصفوفة المعايير")}</h3>
        <div class="subt">${t("درجة كل معيار في وضع")} ${QQ(mode==="self"?t("الذاتي"):t("المحاكاة"))} — ${t("اضغط أي خلية للتفاصيل")}</div>
        <div style="overflow-x:auto">${heatmapHTML(mode)}</div>
        <div class="legend-dots">${S.data.maturity.levels.map(l=>`<span><i style="background:${l.color}"></i>${t(l.name)} (${l.n})</span>`).join("")}</div>
        <div class="mini-note" style="margin-top:6px">${t("مقياس نضج استرشادي قابل للمعايرة — تُعاير المسميات والحدود وفق الدليل الإرشادي المعتمد لدورة التقييم")}.</div>
      </div>
      <div class="card">
        <h3>${t("فجوات الوصول إلى «متميز»")}</h3>
        <div class="subt">${t("المعايير دون")} ${ltr(n(S.data.maturity.targetScore,1))} ${t("مرتبة من الأدنى")} (${n(gaps.length)} ${t("معياراً")})</div>
        <div style="max-height:420px;overflow-y:auto">
        ${gaps.slice(0,14).map(c=>`
          <div class="alert ${critScore(c,mode)<=2?"bad":critScore(c,mode)<4?"warn":"info"}" data-pillar="${c.pillar.id}" style="cursor:pointer">
            <div class="ai">${svgi("alertT")}</div>
            <div style="flex:1"><b>${esc(c.code)} — ${esc(c.name)}</b>
              <div class="at">${esc(c.pillar.name)} · ${t("الدرجة الحالية")} ${ltr(n(critScore(c,mode)))} · ${c.actions.length? esc(c.actions[0].name) : t("لا توجد إجراءات مسجلة — أضف إجراء معالجة")}</div>
            </div>
          </div>`).join("")}
        </div>
      </div>
    </div>`;
  },
  mount(){
    APP.querySelectorAll("[data-mode]").forEach(b=>b.addEventListener("click",()=>{ S.skepMode=b.dataset.mode; refresh(); }));
    APP.querySelectorAll("[data-pillar]").forEach(el=>el.addEventListener("click",()=>openPillar(el.dataset.pillar)));
    // bars
    const mode = S.skepMode;
    const P = S.data.pillars;
    chart("ch-skep-bars").setOption(base({
      tooltip: Object.assign({},TT(),{formatter:p=> {
        const pl = P[p.dataIndex];
        return `<b>${t(pl.name)}</b>` + ttRow(t("الدرجة"), n(p.value,2), p.color) + ttRow(t("الدورة السادسة"), n(pillarScore(pl,"prev"),2)) + ttRow(t("عدد المعايير"), n(pl.criteria.length));
      }}),
      xAxis: hxAxis(v=>n(v), 5),
      yAxis: hyAxis(P.map(p=>p.short), 92),
      grid:{ top:14, bottom:26, right:96, left:44 },
      series:[
        { type:"bar", barWidth:16,
          data: P.map(p=>({ value:pillarScore(p,mode), itemStyle:{ color:"#098A4E", borderRadius:bRad(9) } })),
          label:{ show:true, position:hLbl(), formatter:p=>n(p.value,2), fontFamily:"IBM Plex Sans Arabic", fontWeight:700, color:"#5C6E63" },
          markLine:{ symbol:"none", lineStyle:{color:"#C7A34F",type:"dashed",width:2},
            label:{ show:false },
            data:[{xAxis:4.5}] } },
      ],
    }));
    mountRadar("ch-skep-radar");
  },
};
function heatmapHTML(mode){
  const P = S.data.pillars;
  const maxC = Math.max(...P.map(p=>p.criteria.length));
  let h = `<table style="min-width:520px"><thead><tr><th>${t("الركيزة")}</th>`;
  for(let i=0;i<maxC;i++) h+=`<th style="text-align:center">${t("معيار")} ${i+1}</th>`;
  h += `</tr></thead><tbody>`;
  P.forEach(p=>{
    h += `<tr><td style="font-family:var(--ff-d);font-weight:600;white-space:nowrap">${esc(p.short)}</td>`;
    for(let i=0;i<maxC;i++){
      const c = p.criteria[i];
      if(!c){ h+=`<td style="padding:4px 5px"><div class="heat-cell" style="background:var(--line2);color:var(--faint)">—</div></td>`; continue; }
      const s = critScore(c,mode);
      const lv = S.data.maturity.levels.find(l=>l.n===Math.round(s)) || S.data.maturity.levels[0];
      h += `<td style="padding:4px 5px"><div class="heat-cell" data-pillar="${p.id}" title="${esc(c.code)} ${esc(c.name)}" style="background:${lv.color}1F;color:${lv.color};border:1px solid ${lv.color}33;cursor:pointer">${n(s)}</div></td>`;
    }
    h += `</tr>`;
  });
  return h + `</tbody></table>`;
}
function openPillar(pid){
  const p = S.data.pillars.find(x=>x.id===pid); if(!p) return;
  const mode = S.skepMode;
  const body = `
    <div class="fld"><b>${t("الوصف")}</b><span>${esc(p.desc)}</span></div>
    <div class="fld"><b>${t("مالك الركيزة")}</b><span>${esc(p.owner)}</span></div>
    <div class="fld"><b>${t("الدرجات")}</b><span>${t("ذاتي")}: ${ltr(n(pillarScore(p,"self"),2))} · ${t("محاكاة")}: ${ltr(n(pillarScore(p,"sim"),2))} · ${t("الدورة السادسة")}: ${ltr(n(pillarScore(p,"prev"),2))}</span></div>
    <div class="dsec"><h4>${t("المعايير")} (${n(p.criteria.length)}) — ${t("اضغط الدرجة لتعديلها في وضع")} ${QQ(mode==="self"?t("الذاتي"):t("المحاكاة"))}</h4>
      ${p.criteria.map((c,ci)=>`
        <div class="card" style="padding:12px 14px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
            <div><b style="font-family:var(--ff-d)">${esc(c.code)} — ${esc(c.name)}</b></div>
            <div class="score-chips" data-crit="${ci}">
              ${[1,2,3,4,5].map(v=>`<button class="sc ${critScore(c,mode)===v?"on":""}" data-score="${v}" aria-label="${t("الدرجة")} ${v}">${v}</button>`).join("")}
            </div>
          </div>
          <div class="mini-note" style="margin:4px 0 8px">${t("ذاتي")}: ${ltr(n(c.selfScore))} · ${t("محاكاة")}: ${ltr(n(c.simScore))} · ${t("الدورة السادسة")}: ${ltr(n(c.prevScore))} · ${t("المستهدف")}: ${ltr(n(c.target))}</div>
          <div class="cklist">
            ${c.evidence.map((e,ei)=>`
              <button class="ck ${e.status==="متوفر"?"y":"n"}" data-ev="${ci}:${ei}" title="${t("اضغط لتغيير الحالة")}">
                <span class="box">${e.status==="متوفر"?"✓":""}</span>
                <span style="flex:1;text-align:start">${esc(e.name)}${e.updated?`<span class="owner-tag" style="display:block">${t("نسخة")} ${esc(e.version||"1.0")} · ${fmtDate(e.updated)} · ${esc(e.owner||"")}</span>`:""}</span>
                <span class="st ${e.status==="متوفر"?"ok":e.status==="قيد الإعداد"?"warn":"bad"}">${t(e.status)}</span>
              </button>`).join("")}
          </div>
          ${c.actions.length? `<div class="dsec"><h4>${t("إجراءات المعالجة")}</h4>
            ${c.actions.map(a=>`<div class="fld"><b>${esc(a.name)}</b><span><span class="st ${a.status==="مكتمل"?"ok":a.status==="قيد التنفيذ"?"info":"mut"}">${esc(a.status)}</span> ${esc(a.owner)} · ${fmtDate(a.due)}</span></div>`).join("")}
          </div>`:""}
        </div>`).join("")}
    </div>`;
  openDrawer(`${t(p.name)} — ${ltr(n(pillarScore(p,mode),2))} ${t("من 5")}`, body);
  const DB = document.getElementById("drawer-body");
  DB.querySelectorAll("[data-crit] [data-score]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const ci = +btn.closest("[data-crit]").dataset.crit;
      p.criteria[ci][MODES[mode]] = +btn.dataset.score;
      save(); refresh(); openPillar(pid);
      toast(`${t("تم تحديث درجة المعيار")} ${p.criteria[ci].code}`);
    });
  });
  DB.querySelectorAll("[data-ev]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const [ci,ei] = btn.dataset.ev.split(":").map(Number);
      const e = p.criteria[ci].evidence[ei];
      e.status = e.status==="متوفر"? "قيد الإعداد" : e.status==="قيد الإعداد"? "غير متوفر" : "متوفر";
      save(); refresh(); openPillar(pid);
    });
  });
}

/* ============================================================
   TAB: initiatives
   ============================================================ */
RENDER.initiatives = {
  html(){
    const ist = iniStats();
    const sc = statusCount();
    const f = S.filters;
    const list = S.data.initiatives.filter(i=>
      (f.iniStatus==="الكل" || i.status===f.iniStatus || (f.iniStatus==="متأخرة/متعثرة" && (i.flag==="متأخرة"||i.flag==="متعثرة"))) &&
      (f.iniProgram==="الكل" || i.program===f.iniProgram) &&
      (!f.iniQ || (i.name+i.id+i.category+i.owner).includes(f.iniQ)));
    const it = impactTotals();
    return `
    <div class="stat-strip">
      ${kpiTile("bulb","",t("إجمالي المبادرات"), `${ltr(n(ist.total))}`, `<span>${n(sc["تنفيذ"]+sc["قياس الأثر"])} ${t("قيد التنفيذ والقياس")}</span>`)}
      ${kpiTile("check","",t("نسبة الالتزام بالخط الزمني"), pct(ist.commitment,1),
        `<span>${t("المستهدف")} ${pct(92)}</span><span class="st ${ist.commitment>=92?"ok":"warn"}">${n(ist.flagged)} ${t("متأخرة/متعثرة")}</span>`)}
      ${kpiTile("coins","g",t("الأثر المقدر للمحفظة"), `${ltr(n(it.identified))} <small>${t("مليون ريال")}</small>`, `<span>${t("المعتمد")}: ${moneyShort(it.approved)}</span>`)}
      ${kpiTile("doc","n",t("متوسط طلبات التغيير"), `${ltr(n(ist.crAvg,2))}`, `<span>${t("لكل مبادرة — المستهدف")}: ${ltr("0.5")} ${t("أو أقل")}</span>`)}
    </div>

    <div class="section-head"><h2>${t("دورة حياة المبادرات")}</h2>
      <span class="hint">${t("وفق منهجية هيئة كفاءة الإنفاق: بطاقة الفرصة ← الدراسة ← الميثاق والاعتماد ← التنفيذ ← قياس الأثر ← الإقفال")}</span></div>
    <div class="kanban">
      ${INI_STAGES.map((st,si)=>`
        <div class="kcol"><h4>${t(st)}<span class="cnt">${n(sc[st])}</span></h4>
          ${S.data.initiatives.filter(i=>i.status===st).map(i=>`
            <div class="kcard" data-ini="${i.id}">
              <div class="kn">${esc(i.name)}</div>
              <div class="km">
                <span>${esc(progShort(i.program))}</span>
                <span class="kv">${moneyShort(i.status==="فرصة"||i.status==="دراسة"? i.estImpact : (i.realizedImpact||i.approvedImpact||i.estImpact))}</span>
              </div>
              ${i.flag? `<div style="margin-top:5px"><span class="st ${i.flag==="متعثرة"?"bad":"warn"}">${t(i.flag)}</span></div>`:""}
            </div>`).join("") || '<div class="mini-note" style="padding:8px 4px;text-align:center">—</div>'}
        </div>`).join("")}
    </div>

    <div class="section-head"><h2>${t("سجل المبادرات")}</h2></div>
    <div class="card">
      <div class="toolbar">
        <input class="fsearch" id="ini-q" placeholder="${t("بحث بالاسم أو الفئة أو المالك…")}" value="${esc(f.iniQ)}">
        <select class="fsel" id="ini-status">
          ${["الكل",...INI_STAGES,"متأخرة/متعثرة"].map(s=>`<option value="${s}" ${f.iniStatus===s?"selected":""}>${t(s)}</option>`).join("")}
        </select>
        <select class="fsel" id="ini-program">
          <option ${f.iniProgram==="الكل"?"selected":""} value="الكل">${t("كل البرامج")}</option>
          ${S.data.programs.map(p=>`<option value="${p.id}" ${f.iniProgram===p.id?"selected":""}>${esc(p.name)}</option>`).join("")}
        </select>
        <div class="spacer"></div>
        <button class="btn primary" id="ini-add">${svgi("bulb")} ${t("مبادرة جديدة")}</button>
      </div>
      <div class="tblwrap">
        <table>
          <thead><tr><th>${t("الرمز")}</th><th>${t("المبادرة")}</th><th>${t("البرنامج")}</th><th>${t("الفئة")}</th><th>${t("نوع الأثر")}</th><th>${t("المرحلة")}</th><th>${t("الأثر المقدر")}</th><th>${t("المحقق")}</th><th>${t("التقدم")}</th></tr></thead>
          <tbody>
            ${list.map(i=>`
              <tr class="clickable" data-ini="${i.id}">
                <td class="num">${esc(i.id)}</td>
                <td style="max-width:280px"><b style="font-family:var(--ff-d);font-size:12px">${esc(i.name)}</b>${i.flag?` <span class="st ${i.flag==="متعثرة"?"bad":"warn"}">${t(i.flag)}</span>`:""}</td>
                <td>${esc(progName(i.program))}</td>
                <td>${esc(i.category)}</td>
                <td><span class="st ${i.impactType==="وفر مباشر"?"teal":i.impactType==="تجنب تكلفة"?"navy":"gold"}">${esc(i.impactType)}</span></td>
                <td><span class="st ${i.status==="مقفلة"?"ok":i.status==="تنفيذ"||i.status==="قياس الأثر"?"info":"mut"}">${esc(i.status)}</span></td>
                <td class="num">${n(i.estImpact)}</td>
                <td class="num">${n(i.realizedImpact)}</td>
                <td><div class="bar-mini"><i style="width:${i.progress}%"></i></div></td>
              </tr>`).join("") || `<tr><td colspan="9" class="empty">${t("لا توجد نتائج مطابقة")}</td></tr>`}
          </tbody>
        </table>
      </div>
      <div class="mini-note mt">${t("القيم بالمليون ريال. المبادرات المقفلة اعتُمد أثرها المالي من الشؤون المالية واللجنة التوجيهية")}.</div>
    </div>

    <div class="section-head"><h2>${t("قاعدة بيانات مبادرات الجهات الحكومية (مرجعية)")}</h2>
      <span class="hint">${t("المخرج الخامس — ممارسات مطبقة مصنفة حسب الفئات مع مصادر الهدر وآلية احتساب الأثر (أسماء الجهات معمّاة لأغراض العرض)")}</span></div>
    <div class="card">
      <div class="tblwrap">
        <table>
          <thead><tr><th>${t("الفئة")}</th><th>${t("نوع الجهة")}</th><th>${t("المبادرة")}</th><th>${t("مصدر الهدر")}</th><th>${t("آلية المعالجة")}</th><th>${t("آلية احتساب الأثر")}</th><th>${t("الأثر المرجعي")}</th></tr></thead>
          <tbody>
            ${(S.data.benchmarkInitiatives||[]).map(b=>`
              <tr>
                <td><span class="st navy">${esc(b.category)}</span></td>
                <td>${esc(b.entity)}</td>
                <td style="max-width:220px"><b style="font-family:var(--ff-d);font-size:12px">${esc(b.initiative)}</b></td>
                <td style="max-width:190px;font-size:11.5px;color:var(--muted)">${esc(b.waste)}</td>
                <td style="max-width:190px;font-size:11.5px;color:var(--muted)">${esc(b.treatment)}</td>
                <td style="max-width:190px;font-size:11.5px;color:var(--muted)">${esc(b.impactMethod)}</td>
                <td style="max-width:190px;font-size:11.5px">${esc(b.impact)}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>`;
  },
  mount(){
    APP.querySelectorAll("[data-ini]").forEach(el=>el.addEventListener("click",()=>openIni(el.dataset.ini)));
    const q = document.getElementById("ini-q");
    q.addEventListener("input",()=>{ S.filters.iniQ=q.value; refreshKeepFocus("ini-q"); });
    document.getElementById("ini-status").addEventListener("change",e=>{ S.filters.iniStatus=e.target.value; refresh(); });
    document.getElementById("ini-program").addEventListener("change",e=>{ S.filters.iniProgram=e.target.value; refresh(); });
    document.getElementById("ini-add").addEventListener("click",()=>iniForm(null));
  },
};
function refreshKeepFocus(id){
  const pos = document.getElementById(id).selectionStart;
  refresh();
  const el = document.getElementById(id);
  if(el){ el.focus(); el.setSelectionRange(pos,pos); }
}
function openIni(id){
  const i = S.data.initiatives.find(x=>x.id===id); if(!i) return;
  const si = INI_STAGES.indexOf(i.status);
  const canAdvance = si < INI_STAGES.length-1;
  const nextStage = canAdvance? INI_STAGES[si+1] : null;
  const gateBlocked = (nextStage==="معتمدة" && !i.financeValidated) ||
                      (nextStage==="مقفلة" && !(i.financeValidated && i.realizedImpact>0));
  const gateMsg = nextStage==="مقفلة"
    ? "الإقفال يتطلب تحققاً مالياً وأثراً محققاً موثقاً وفق عملية مراجعة الأثر المالي للمبادرات المكتملة."
    : "وفق منهجية الهيئة: لا يمكن اعتماد المبادرة قبل تحقق الشؤون المالية من خط الأساس ومعادلة قياس الأثر.";
  const body = `
    <div class="stepper" style="margin-bottom:12px">
      ${INI_STAGES.map((st,k)=>`<div class="step ${k<si?"done":k===si?"cur":""}"><div class="dotp">${k<si?"✓":k+1}</div><span>${t(st)}</span></div>`).join("")}
    </div>
    ${i.flag? `<div class="alert ${i.flag==="متعثرة"?"bad":"warn"}"><div class="ai">${svgi("alertT")}</div><div><b>${i.flag}</b><div class="at">${esc(i.note||"")}</div></div></div>`:""}
    <div class="fld"><b>${t("البرنامج")}</b><span>${esc(progName(i.program))}</span></div>
    <div class="fld"><b>${t("الفئة / نوع الأثر")}</b><span>${esc(i.category)} · ${esc(i.impactType)}</span></div>
    <div class="fld"><b>${t("المالك")}</b><span>${esc(i.owner)}</span></div>
    <div class="fld"><b>${t("الفترة")}</b><span>${fmtDate(i.start)} ${ARROW()} ${fmtDate(i.end)}</span></div>
    <div class="fld"><b>${t("نسبة الإنجاز")}</b><span>${pct(i.progress)}</span></div>
    <div class="dsec"><h4>${t("بطاقة الفرصة")}</h4>
      <div class="fld"><b>${t("مصدر الهدر")}</b><span>${esc(i.wasteSource)}</span></div>
      <div class="fld"><b>${t("آلية المعالجة")}</b><span>${esc(i.treatment)}</span></div>
      <div class="fld"><b>${t("خط الأساس")}</b><span>${esc(i.baselineMethod)}</span></div>
    </div>
    <div class="dsec"><h4>${t("الأثر المالي (مليون ريال)")}</h4>
      <div class="fld"><b>${t("المقدر")}</b><span class="num">${n(i.estImpact)}</span></div>
      <div class="fld"><b>${t("المعتمد من الشؤون المالية")}</b><span class="num">${n(i.approvedImpact)}</span></div>
      <div class="fld"><b>${t("المحقق")}</b><span class="num">${n(i.realizedImpact)}</span></div>
      <div class="fld"><b>${t("التحقق المالي")}</b><span><span class="st ${i.financeValidated?"ok":"warn"}">${i.financeValidated?t("معتمد من الشؤون المالية"):t("بانتظار التحقق المالي")}</span></span></div>
      <div class="fld"><b>${t("طلبات التغيير")}</b><span class="num">${n(i.changeRequests)}</span></div>
    </div>
    ${i.charter? `<div class="dsec"><h4>${t("ميثاق المبادرة")}</h4>
      <div class="fld"><b>${t("الهدف")}</b><span>${esc(i.charter.objective)}</span></div>
      <div class="fld"><b>${t("الأنشطة الرئيسية")}</b><span>${i.charter.activities.map(esc).join(isAR()? "؛ " : "; ")}</span></div>
      <div class="fld"><b>${t("المخاطر")}</b><span>${esc(i.charter.risks)}</span></div>
      <div class="fld"><b>${t("البيانات المطلوبة")}</b><span>${esc(i.charter.dataNeeded)}</span></div>
      <div class="fld"><b>${t("آلية قياس الأثر")}</b><span>${esc(i.charter.mechanism)}</span></div>
    </div>`:""}
    ${i.docs? `<div class="dsec"><h4>${t("وثائق المبادرة")}</h4>
      <div class="cklist">${i.docs.map(d=>`
        <div class="ck ${d.status==="متوفر"?"y":"n"}"><span class="box">${d.status==="متوفر"?"✓":""}</span>
        <span style="flex:1">${esc(d.name)}</span>
        <span class="st ${d.status==="متوفر"?"ok":d.status==="قيد الإعداد"?"warn":"bad"}">${t(d.status)}</span></div>`).join("")}
      </div>
    </div>`:""}
    ${i.note && !i.flag? `<div class="dsec"><h4>${t("ملاحظات")}</h4><div class="mini-note">${esc(i.note)}</div></div>`:""}
    <div class="dsec" style="display:flex;gap:8px;flex-wrap:wrap">
      ${canAdvance? `<button class="btn primary" id="d-advance" ${gateBlocked?"disabled style='opacity:.5;cursor:not-allowed'":""}>${t("نقل إلى مرحلة")} ${QQ(t(nextStage))}</button>`:""}
      ${!i.financeValidated? `<button class="btn ghost" id="d-validate">${t("تأكيد التحقق المالي")}</button>`:""}
      <button class="btn ghost" id="d-edit">${t("تعديل البيانات")}</button>
      ${i.flag? `<button class="btn ghost" id="d-unflag">${t("إلغاء حالة")} ${QQ(t(i.flag))}</button>`:""}
    </div>
    ${gateBlocked? `<div class="mini-note mt">⚠ ${gateMsg}</div>`:""}`;
  openDrawer(`${i.id} — ${t(i.name)}`, body);
  const el = id2=>document.getElementById(id2);
  if(el("d-advance")) el("d-advance").addEventListener("click",()=>{
    if(gateBlocked) return;
    i.status = nextStage;
    if(nextStage==="مقفلة") i.progress = 100;
    save(); refresh(); openIni(id); toast(`${t("انتقلت المبادرة إلى مرحلة")} ${QQ(t(nextStage))}`);
  });
  if(el("d-validate")) el("d-validate").addEventListener("click",()=>{
    i.financeValidated = true;
    if(!i.approvedImpact && i.estImpact) i.approvedImpact = Math.round(i.estImpact*0.9);
    save(); refresh(); openIni(id); toast("تم تسجيل التحقق المالي");
  });
  if(el("d-unflag")) el("d-unflag").addEventListener("click",()=>{
    i.flag = null; save(); refresh(); openIni(id); toast("تم إلغاء الحالة");
  });
  if(el("d-edit")) el("d-edit").addEventListener("click",()=>{ closeDrawer(); iniForm(i); });
}
function iniForm(i){
  const isNew = !i;
  const d = i || { id:nextIniId(), name:"", program:S.data.programs[0].id, category:"مشتريات", impactType:"وفر مباشر",
    status:"فرصة", flag:null, estImpact:0, approvedImpact:0, realizedImpact:0, financeValidated:false,
    changeRequests:0, progress:0, owner:"", wasteSource:"", treatment:"", baselineMethod:"",
    start:S.data.meta.asOf, end:"", note:"" };
  openModal(isNew? t("مبادرة جديدة — بطاقة الفرصة") : `${t("تعديل")} ${d.id}`, `
    <div class="frow one"><div class="fgrp"><label>${t("اسم المبادرة *")}</label><input id="f-name" value="${esc(d.name)}"></div></div>
    <div class="frow">
      <div class="fgrp"><label>${t("البرنامج")}</label><select id="f-program">${S.data.programs.map(p=>`<option value="${p.id}" ${d.program===p.id?"selected":""}>${esc(p.name)}</option>`).join("")}</select></div>
      <div class="fgrp"><label>${t("الفئة")}</label><select id="f-cat">${["مشتريات","مشاريع","أصول ومرافق","خدمات","طاقة وموارد","رقمنة","إيرادات"].map(c=>`<option value="${c}" ${d.category===c?"selected":""}>${t(c)}</option>`).join("")}</select></div>
    </div>
    <div class="frow">
      <div class="fgrp"><label>${t("نوع الأثر")}</label><select id="f-itype">${["وفر مباشر","تجنب تكلفة","تعظيم إيراد"].map(c=>`<option value="${c}" ${d.impactType===c?"selected":""}>${t(c)}</option>`).join("")}</select></div>
      <div class="fgrp"><label>${t("المرحلة")}</label><select id="f-status">${INI_STAGES.map(c=>`<option value="${c}" ${d.status===c?"selected":""}>${t(c)}</option>`).join("")}</select></div>
    </div>
    <div class="frow">
      <div class="fgrp"><label>${t("الأثر المقدر (م.ر)")}</label><input id="f-est" type="number" min="0" value="${d.estImpact}"></div>
      <div class="fgrp"><label>${t("المالك")}</label><input id="f-owner" value="${esc(d.owner)}"></div>
    </div>
    <div class="frow">
      <div class="fgrp"><label>${t("تاريخ البداية (يوم / شهر / سنة)")}</label><input id="f-start" type="date" value="${d.start}"></div>
      <div class="fgrp"><label>${t("تاريخ النهاية (يوم / شهر / سنة)")}</label><input id="f-end" type="date" value="${d.end}"></div>
    </div>
    <div class="frow one"><div class="fgrp"><label>${t("مصدر الهدر")}</label><input id="f-waste" value="${esc(d.wasteSource)}"></div></div>
    <div class="frow one"><div class="fgrp"><label>${t("آلية المعالجة")}</label><input id="f-treat" value="${esc(d.treatment)}"></div></div>
    <div class="frow one"><div class="fgrp"><label>${t("خط الأساس وطريقة الاحتساب")}</label><input id="f-base" value="${esc(d.baselineMethod)}"></div></div>
    <div class="frow one"><div class="fgrp"><label>${t("ملاحظات")}</label><textarea id="f-note">${esc(d.note||"")}</textarea></div></div>
  `, [
    { label:"إلغاء", cls:"ghost", fn:closeModal },
    { label: isNew? "إضافة المبادرة" : "حفظ التعديلات", cls:"primary", fn:()=>{
        const v = id=>document.getElementById(id).value.trim();
        if(!v("f-name")){ toast("اسم المبادرة مطلوب"); return; }
        const newStage = v("f-status");
        if(INI_STAGES.indexOf(newStage) >= INI_STAGES.indexOf("معتمدة") && !d.financeValidated){
          toast("الاعتماد وما بعده يتطلب التحقق المالي أولاً — من بطاقة المبادرة"); return;
        }
        Object.assign(d, {
          name:v("f-name"), program:v("f-program"), category:v("f-cat"), impactType:v("f-itype"),
          status:v("f-status"), estImpact:+v("f-est")||0, owner:v("f-owner"),
          start:v("f-start"), end:v("f-end"), wasteSource:v("f-waste"),
          treatment:v("f-treat"), baselineMethod:v("f-base"), note:v("f-note"),
        });
        if(isNew) S.data.initiatives.push(d);
        save(); closeModal(); refresh();
        toast(isNew? `${t("تمت إضافة المبادرة")} ${d.id}` : "تم حفظ التعديلات");
      }},
  ]);
}
function nextIniId(){
  const mx = S.data.initiatives.reduce((m,i)=>Math.max(m, +String(i.id).replace(/\D/g,"")||0),0);
  return `INI-${String(mx+1).padStart(2,"0")}`;
}

/* ============================================================
   TAB: impact
   ============================================================ */
RENDER.impact = {
  html(){
    const it = impactTotals();
    const real2026 = S.data.impact.monthly2026.reduce((s,m)=>s+m.real,0);
    const tgt = S.data.meta.impactTarget2026;
    const share = Math.round(real2026 / S.data.meta.budgetApproved * 1000)/10;
    return `
    <div class="stat-strip">
      ${kpiTile("bulb","",t("الأثر المالي المحدد (الفرص المرصودة)"), `${ltr(n(it.identified))} <small>${t("مليون ريال")}</small>`, `<span>${n(S.data.initiatives.length)} ${t("مبادرة وفرصة")}</span>`)}
      ${kpiTile("check","",t("أثر معتمد من الشؤون المالية"), `${ltr(n(it.approved))} <small>${t("مليون ريال")}</small>`, `<span>${pct(it.identified? it.approved/it.identified*100:0)} ${t("من المحدد")}</span>`)}
      ${kpiTile("coins","g",t("أثر محقق تراكمي"), `${ltr(n(it.realized))} <small>${t("مليون ريال")}</small>`, `<span>${t("منه")} ${moneyShort(it.documented)} ${t("موثق بالإقفال")}</span>`)}
      ${kpiTile("gauge","n",t("نسبة الأثر من الميزانية المعتمدة 2026"), pct(share,1), `<span>${t("محقق 2026")}: ${moneyShort(real2026)} ${t("من ميزانية")} ${moneyShort(S.data.meta.budgetApproved)}</span>`)}
    </div>

    <div class="grid g21 mt">
      <div class="card">
        <h3>${t("مراحل تحقق الأثر المالي")}</h3>
        <div class="subt">${t("من الأثر المحدد إلى الموثق (مليون ريال) — منهجية: وفر مباشر، تجنب تكلفة، تعظيم إيراد")}</div>
        <div id="ch-imp-water" class="chart ch-340"></div>
      </div>
      <div class="card">
        <h3>${t("الأثر حسب النوع")}</h3>
        <div class="subt">${t("محقق مقابل محدد")}</div>
        <div id="ch-imp-type" class="chart ch-340"></div>
      </div>
    </div>

    <div class="grid g2 mt">
      <div class="card">
        <h3>${t("الأثر حسب البرنامج")}</h3>
        <div class="subt">${t("محقق ومتبقٍ من المحدد (مليون ريال)")}</div>
        <div id="ch-imp-prog" class="chart ch-300"></div>
      </div>
      <div class="card">
        <h3>${t("الأثر حسب الفئة")}</h3>
        <div class="subt">${t("محقق ومتبقٍ من المحدد (مليون ريال)")}</div>
        <div id="ch-imp-cat" class="chart ch-300"></div>
      </div>
    </div>

    <div class="section-head"><h2>${t("سجل الوفورات المعتمد")}</h2>
      <span class="hint">${t("لا يُدرج أثر إلا بعد التحقق المالي — خفض مستوى الخدمة لا يُعد وفراً")}</span></div>
    <div class="card">
      <div class="tblwrap">
        <table>
          <thead><tr><th>${t("المبادرة")}</th><th>${t("النوع")}</th><th>${t("خط الأساس")}</th><th>${t("معتمد")}</th><th>${t("محقق")}</th><th>${t("التحقق المالي")}</th><th>${t("الحالة")}</th></tr></thead>
          <tbody>
            ${S.data.initiatives.filter(i=>i.approvedImpact>0 || i.realizedImpact>0).map(i=>`
              <tr class="clickable" data-ini="${i.id}">
                <td style="max-width:300px"><b style="font-family:var(--ff-d);font-size:12px">${esc(i.name)}</b></td>
                <td><span class="st ${i.impactType==="وفر مباشر"?"teal":i.impactType==="تجنب تكلفة"?"navy":"gold"}">${esc(i.impactType)}</span></td>
                <td style="max-width:220px;font-size:11.5px;color:var(--muted)">${esc(i.baselineMethod)}</td>
                <td class="num">${n(i.approvedImpact)}</td>
                <td class="num"><b>${n(i.realizedImpact)}</b></td>
                <td>${i.financeValidated? `<span class="st ok">${t("معتمد")}</span>` : `<span class="st warn">${t("قيد التحقق")}</span>`}</td>
                <td><span class="st ${i.status==="مقفلة"?"ok":"info"}">${esc(i.status)}</span></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>`;
  },
  mount(){
    APP.querySelectorAll("[data-ini]").forEach(el=>el.addEventListener("click",()=>{ go("initiatives"); setTimeout(()=>openIni(el.dataset.ini),80); }));
    const it = impactTotals();
    // waterfall: محدد -> غير معتمد -> معتمد -> محقق -> موثق
    const identified = it.identified, approved = it.approved, realized = it.realized, doc = it.documented;
    const steps = [
      { name:t("الأثر المحدد"), base:0, val:identified, color:"#75837B" },
      { name:t("قيد الدراسة/الاعتماد"), base:0, val:identified-approved, color:"#C9D3CD" },
      { name:t("المعتمد"), base:0, val:approved, color:"#2E7D57" },
      { name:t("المحقق"), base:0, val:realized, color:"#098A4E" },
      { name:t("الموثق بالإقفال"), base:0, val:doc, color:"#0B4028" },
    ];
    chart("ch-imp-water").setOption(base({
      tooltip: Object.assign({},TT(),{formatter:p=> p.seriesIndex===1? `<b>${p.name}</b>`+ttRow(t("القيمة"),`${n(steps[p.dataIndex].val)} ${t("م.ر")}`, steps[p.dataIndex].color):""}),
      xAxis: catXAxis(steps.map(s=>s.name), { axisLabel:{color:"#5C6E63",fontFamily:"Cairo",fontSize:11,interval:0} }),
      yAxis: valAxis(v=>n(v)),
      grid:{ top:24, bottom:30, right:50, left:14 },
      series:[
        { type:"bar", stack:"w", itemStyle:{color:"transparent"}, emphasis:{itemStyle:{color:"transparent"}}, data:steps.map(s=>s.base), barWidth:44, silent:true },
        { type:"bar", stack:"w", data:steps.map(s=>({value:s.val, itemStyle:{color:s.color, borderRadius:[7,7,0,0]}})),
          label:{show:true, position:"top", fontFamily:"IBM Plex Sans Arabic", fontWeight:700, color:"#5C6E63", formatter:p=>n(steps[p.dataIndex].val)} },
      ],
    }));
    // by type
    const bt = {};
    S.data.initiatives.forEach(i=>{
      bt[i.impactType] = bt[i.impactType]||{identified:0, realized:0};
      bt[i.impactType].identified += i.estImpact; bt[i.impactType].realized += i.realizedImpact;
    });
    const types = Object.keys(bt);
    chart("ch-imp-type").setOption(base({
      tooltip: Object.assign({},TT(),{trigger:"axis", formatter:ps=>{
        let h=`<b>${ps[0].axisValue}</b>`; ps.forEach(p=>h+=ttRow(p.seriesName,`${n(p.value)} ${t("م.ر")}`,p.color)); return h; }}),
      legend:{ icon:"circle", itemWidth:9, itemHeight:9, top:0, textStyle:{fontFamily:"Cairo",fontSize:11,color:"#5C6E63"} },
      xAxis: hxAxis(v=>n(v)),
      yAxis: hyAxis(types, isAR()? 86 : 134),
      grid:{ top:34, bottom:26, right:isAR()? 90:146, left:20 },
      series:[
        { name:t("محقق"), type:"bar", stack:"t", barWidth:20, color:"#098A4E", data:types.map(t=>bt[t].realized) },
        { name:t("متبقٍ من المحدد"), type:"bar", stack:"t", color:"#DDEBE2", data:types.map(t=>({value:Math.max(0,bt[t].identified-bt[t].realized), itemStyle:{borderRadius:bRad(6)}})) },
      ],
    }));
    // by program / category (two similar charts)
    const agg = key=>{
      const m={};
      S.data.initiatives.forEach(i=>{
        const k = key==="program"? progShort(i.program) : i.category;
        m[k]=m[k]||{identified:0,realized:0};
        m[k].identified+=i.estImpact; m[k].realized+=i.realizedImpact;
      });
      return Object.entries(m).sort((a,b)=>b[1].identified-a[1].identified);
    };
    [["ch-imp-prog","program"],["ch-imp-cat","category"]].forEach(([cid,key])=>{
      const rows = agg(key);
      chart(cid).setOption(base({
        tooltip: Object.assign({},TT(),{trigger:"axis", formatter:ps=>{
          let h=`<b>${ps[0].axisValue}</b>`; ps.forEach(p=>h+=ttRow(p.seriesName,`${n(p.value)} ${t("م.ر")}`,p.color)); return h; }}),
        legend:{ icon:"circle", itemWidth:9, itemHeight:9, top:0, textStyle:{fontFamily:"Cairo",fontSize:11,color:"#5C6E63"} },
        xAxis: hxAxis(v=>n(v)),
        yAxis: hyAxis(rows.map(r=>r[0]), 155),
        grid:{ top:34, bottom:26, right:168, left:20 },
        series:[
          { name:t("محقق"), type:"bar", stack:"s", barWidth:13, color:"#098A4E", data:rows.map(r=>r[1].realized) },
          { name:t("متبقٍ"), type:"bar", stack:"s", color:"#DDEBE2", data:rows.map(r=>({value:Math.max(0,r[1].identified-r[1].realized), itemStyle:{borderRadius:bRad(6)}})) },
        ],
      }));
    });
  },
};

/* ============================================================
   TAB: funding
   ============================================================ */
RENDER.funding = {
  html(){
    const FR = S.data.fundingRequests;
    const comp = frCompliance();
    const returned = FR.filter(r=>r.stage==="معاد للاستكمال").length;
    const approved = FR.filter(r=>r.stage==="معتمد").length;
    const total = FR.reduce((s,r)=>s+r.amount,0);
    return `
    <div class="stat-strip">
      ${kpiTile("doc","",t("طلبات التمويل المسجلة"), `${ltr(n(FR.length))}`, `<span>${t("بقيمة إجمالية")} ${money(total)}</span>`)}
      ${kpiTile("check","",t("اكتمال متطلبات الطلبات المسجلة"), pct(comp), `<span class="st ${comp>=80?"ok":"warn"}">${t("جودة الطلبات عند التسجيل")}</span><span>${t("لا يدخل سلسلة المراجعة إلا طلب مكتمل المتطلبات")}</span>`)}
      ${kpiTile("clock","g",t("طلبات معادة للاستكمال"), `${ltr(n(returned))}`, `<span>${t("تتطلب استيفاء الملاحظات قبل إعادة الدخول")}</span>`)}
      ${kpiTile("coins","n",t("طلبات معتمدة"), `${ltr(n(approved))}`, `<span>${money(FR.filter(r=>r.stage==="معتمد").reduce((s,r)=>s+r.amount,0))}</span>`)}
    </div>

    <div class="section-head"><h2>${t("لائحة التعقب — سلسلة المراجعة الرباعية")}</h2>
      <span class="hint">${t("المقيّم ← قائد الفريق ← الشؤون المالية ← المسؤول الأول، مع اشتراط اكتمال الدراسات")}</span>
      <button class="btn primary" id="fr-add">${svgi("doc")} ${t("طلب تمويل جديد")}</button></div>
    <div class="card">
      <div class="tblwrap">
        <table>
          <thead><tr><th>${t("الرمز")}</th><th>${t("الطلب")}</th><th>${t("البرنامج")}</th><th>${t("النوع")}</th><th>${t("القيمة (م.ر)")}</th><th>${t("اكتمال الدراسات")}</th><th>${t("المرحلة")}</th></tr></thead>
          <tbody>
            ${FR.map(r=>{
              const done = Object.values(r.fiveStudies).filter(Boolean).length + (r.cdStudy?1:0) + (r.scopeDoc?1:0) + (r.valueDoc?1:0);
              const totalReq = 8;
              return `<tr class="clickable" data-fr="${r.id}">
                <td class="num">${esc(r.id)}</td>
                <td style="max-width:300px"><b style="font-family:var(--ff-d);font-size:12px">${esc(r.name)}</b></td>
                <td>${esc(progName(r.program))}</td>
                <td>${esc(r.type)}</td>
                <td class="num">${n(r.amount)}</td>
                <td><div style="display:flex;align-items:center;gap:8px"><div class="bar-mini" style="flex:1"><i style="width:${done/totalReq*100}%;${done<totalReq?"background:var(--warn)":""}"></i></div><span class="num" style="font-size:11px">${n(done)}/8</span></div></td>
                <td><span class="st ${r.stage==="معتمد"?"ok":r.stage==="معاد للاستكمال"?"bad":r.stage==="الإعداد"?"mut":"info"}">${esc(r.stage)}</span></td>
              </tr>`;}).join("")}
          </tbody>
        </table>
      </div>
      <div class="mini-note mt">${t("ضابط الاكتمال: لا يُحال الطلب إلى سلسلة المراجعة إلا باكتمال الدراسات الخمس (الاستراتيجية، الاقتصادية، التجارية، المالية، الإدارية) ودراسة السعة والطلب ووثيقتي النطاق والقيمة — وفق تعليمات تنفيذ الميزانية ومتطلبات هيئة كفاءة الإنفاق والمشروعات الحكومية. مرحلة «مرفوع لوزارة المالية» امتداد خاص بالهيئة لطلبات الميزانية الجديدة؛ وبعد الاعتماد يُؤرشف الطلب وتُحدَّث لائحة التعقب وفق النموذج التشغيلي")}.</div>
    </div>`;
  },
  mount(){
    APP.querySelectorAll("[data-fr]").forEach(el=>el.addEventListener("click",()=>openFR(el.dataset.fr)));
    document.getElementById("fr-add").addEventListener("click",()=>{
      openModal(t("طلب تمويل جديد"), `
        <div class="frow one"><div class="fgrp"><label>${t("اسم الطلب *")}</label><input id="nf-name"></div></div>
        <div class="frow">
          <div class="fgrp"><label>${t("البرنامج")}</label><select id="nf-program">${S.data.programs.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></div>
          <div class="fgrp"><label>${t("النوع")}</label><select id="nf-type"><option value="رأسمالي">${t("رأسمالي")}</option><option value="تشغيلي">${t("تشغيلي")}</option></select></div>
        </div>
        <div class="frow one"><div class="fgrp"><label>${t("القيمة (مليون ريال) *")}</label><input id="nf-amount" type="number" min="1"></div></div>
        <div class="mini-note">${t("يُسجل الطلب في مرحلة «الإعداد»؛ وتُستكمل الدراسات الخمس ودراسة السعة والطلب من بطاقة الطلب قبل دخول سلسلة المراجعة")}.</div>
      `, [
        { label:"إلغاء", cls:"ghost", fn:closeModal },
        { label:"تسجيل الطلب", cls:"primary", fn:()=>{
            const name = document.getElementById("nf-name").value.trim();
            const amount = +document.getElementById("nf-amount").value;
            if(!name || !amount){ toast("الاسم والقيمة مطلوبان"); return; }
            const mx = S.data.fundingRequests.reduce((m,r)=>Math.max(m,+String(r.id).replace(/\D/g,"")||0),0);
            S.data.fundingRequests.push({
              id:`FR-${String(mx+1).padStart(2,"0")}`, name,
              program: document.getElementById("nf-program").value,
              amount, type: document.getElementById("nf-type").value,
              stage:"الإعداد",
              fiveStudies:{"استراتيجية":false,"اقتصادية":false,"تجارية":false,"مالية":false,"إدارية":false},
              cdStudy:false, scopeDoc:false, valueDoc:false, note:"",
            });
            save(); closeModal(); refresh(); toast("تم تسجيل الطلب في لائحة التعقب");
          }},
      ]);
    });
  },
};
function openFR(id){
  const r = S.data.fundingRequests.find(x=>x.id===id); if(!r) return;
  const chainIdx = FR_CHAIN.indexOf(r.stage);
  const complete = frComplete(r);
  const checks = [
    ...Object.entries(r.fiveStudies).map(([k,v])=>({key:`fs:${k}`, label: isAR()? `الدراسة ال${k}` : `${t(k)} study`, val:v})),
    {key:"cd", label:"دراسة السعة والطلب", val:r.cdStudy},
    {key:"scope", label:"وثيقة نطاق العمل", val:r.scopeDoc},
    {key:"value", label:"قيمة التمويل ومبرراتها", val:r.valueDoc},
  ];
  const body = `
    <div class="stepper" style="margin-bottom:14px">
      ${FR_CHAIN.map((st,k)=>`<div class="step ${chainIdx>k?"done":chainIdx===k?"cur":""}"><div class="dotp">${chainIdx>k?"✓":k+1}</div><span>${t(st)}</span></div>`).join("")}
    </div>
    ${r.stage==="معاد للاستكمال"? `<div class="alert bad"><div class="ai">${svgi("alertT")}</div><div><b>${t("معاد للاستكمال")}</b><div class="at">${esc(r.note||"")}</div></div></div>`:""}
    <div class="fld"><b>${t("البرنامج")}</b><span>${esc(progName(r.program))}</span></div>
    <div class="fld"><b>${t("النوع")}</b><span>${esc(r.type)}</span></div>
    <div class="fld"><b>${t("القيمة")}</b><span>${money(r.amount)}</span></div>
    ${r.note && r.stage!=="معاد للاستكمال"? `<div class="fld"><b>${t("ملاحظات")}</b><span>${esc(r.note)}</span></div>`:""}
    <div class="dsec"><h4>${t("متطلبات الاكتمال — اضغط لتحديث الحالة")}</h4>
      <div class="cklist">
        ${checks.map(c=>`<button class="ck ${c.val?"y":"n"}" data-ck="${c.key}"><span class="box">${c.val?"✓":""}</span><span style="flex:1;text-align:start">${t(c.label)}</span></button>`).join("")}
      </div>
    </div>
    <div class="dsec" style="display:flex;gap:8px;flex-wrap:wrap">
      ${r.stage==="الإعداد"||r.stage==="معاد للاستكمال" ?
        `<button class="btn primary" id="fr-submit" ${!complete?`disabled style='opacity:.5;cursor:not-allowed' title='${t("استكمال المتطلبات أولاً")}'`:""}>${t("إحالة إلى سلسلة المراجعة")}</button>`:
       chainIdx>=1 && chainIdx<FR_CHAIN.length-1 ?
        `<button class="btn primary" id="fr-advance">${t("نقل إلى مرحلة")} ${QQ(t(FR_CHAIN[chainIdx+1]))}</button>
         <button class="btn danger" id="fr-return">${t("إعادة للاستكمال")}</button>`:""}
    </div>
    ${!complete && (r.stage==="الإعداد"||r.stage==="معاد للاستكمال")? `<div class="mini-note mt">⚠ ${t("لا يمكن الإحالة قبل اكتمال المتطلبات الثمانية")}.</div>`:""}`;
  openDrawer(`${r.id} — ${t(r.name)}`, body);
  document.querySelectorAll("#drawer-body [data-ck]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const k = btn.dataset.ck;
      if(k.startsWith("fs:")) r.fiveStudies[k.slice(3)] = !r.fiveStudies[k.slice(3)];
      else if(k==="cd") r.cdStudy = !r.cdStudy;
      else if(k==="scope") r.scopeDoc = !r.scopeDoc;
      else if(k==="value") r.valueDoc = !r.valueDoc;
      save(); refresh(); openFR(id);
    });
  });
  const el = x=>document.getElementById(x);
  if(el("fr-submit")) el("fr-submit").addEventListener("click",()=>{
    if(!frComplete(r)) return;
    r.stage = "مراجعة المقيّم"; r.note = "";
    save(); refresh(); openFR(id); toast("أُحيل الطلب إلى سلسلة المراجعة");
  });
  if(el("fr-advance")) el("fr-advance").addEventListener("click",()=>{
    if(!frComplete(r)){ toast("لا يمكن نقل الطلب — يُعاد للاستكمال لمعالجة النواقص"); return; }
    r.stage = FR_CHAIN[chainIdx+1];
    save(); refresh(); openFR(id); toast(`${t("انتقل الطلب إلى مرحلة")} ${QQ(t(r.stage))}`);
  });
  if(el("fr-return")) el("fr-return").addEventListener("click",()=>{
    r.stage = "معاد للاستكمال"; r.note = "أعيد الطلب لاستيفاء ملاحظات المراجعة.";
    save(); refresh(); openFR(id); toast("أعيد الطلب للاستكمال");
  });
}

/* ============================================================
   TAB: studies
   ============================================================ */
RENDER.studies = {
  html(){
    const f = S.filters.studyType;
    const types = ["الكل","سعة وطلب","الدراسات الخمس","هندسة قيمية"];
    const list = S.data.studies.filter(s=>f==="الكل"||s.type===f);
    const avg = ty=>{
      const l = S.data.studies.filter(s=>ty==="الكل"||s.type===ty);
      return l.length? Math.round(l.reduce((x,s)=>x+s.completeness,0)/l.length):0;
    };
    return `
    <div class="stat-strip">
      ${kpiTile("book","",t("إجمالي الدراسات"), `${ltr(n(S.data.studies.length))}`, `<span>${n(S.data.studies.filter(s=>s.status==="معتمدة"||s.status==="مكتملة").length)} ${t("معتمدة/مكتملة")}</span>`)}
      ${kpiTile("gauge","",t("متوسط اكتمال دراسات السعة والطلب"), pct(avg("سعة وطلب")), `<span>${t("منهجية الخطوات السبع حسب فئة الأصول")}</span>`)}
      ${kpiTile("doc","n",t("متوسط اكتمال الدراسات الخمس"), pct(avg("الدراسات الخمس")), `<span>${t("النموذج الخماسي للجدوى")}</span>`)}
      ${kpiTile("bulb","g",t("دراسات الهندسة القيمية"), `${ltr(n(S.data.studies.filter(s=>s.type==="هندسة قيمية").length))}`, `<span>${t("وفق منهجية SAVE ومراحل العمل الثماني")}</span>`)}
    </div>

    <div class="section-head"><h2>${t("سجل الدراسات")}</h2>
      <span class="hint">${t("أتمتة إعداد دراسات السعة والطلب والدراسات الخمس ومتابعتها — المسار الثالث من نطاق العمل")}</span></div>
    <div class="card">
      <div class="toolbar">
        <div class="pillbar">
          ${types.map(ty=>`<button class="pill ${f===ty?"on":""}" data-stype="${ty}">${t(ty)}</button>`).join("")}
        </div>
      </div>
      <div class="tblwrap">
        <table>
          <thead><tr><th>${t("الرمز")}</th><th>${t("الدراسة")}</th><th>${t("النوع")}</th><th>${t("فئة الأصول")}</th><th>${t("البرنامج")}</th><th>${t("الاكتمال")}</th><th>${t("الحالة")}</th></tr></thead>
          <tbody>
            ${list.map(s=>`
              <tr>
                <td class="num">${esc(s.id)}</td>
                <td style="max-width:320px"><b style="font-family:var(--ff-d);font-size:12px">${esc(s.name)}</b></td>
                <td><span class="st ${s.type==="سعة وطلب"?"teal":s.type==="الدراسات الخمس"?"navy":"gold"}">${esc(s.type)}</span></td>
                <td>${esc(s.assetClass)}</td>
                <td>${esc(progName(s.program))}</td>
                <td><div style="display:flex;align-items:center;gap:8px"><div class="bar-mini" style="flex:1"><i style="width:${s.completeness}%"></i></div><span class="num" style="font-size:11px">${n(s.stepsDone)}/${n(s.stepsTotal)}</span></div></td>
                <td><span class="st ${s.status==="معتمدة"||s.status==="مكتملة"?"ok":s.status==="قيد المراجعة"?"info":"warn"}">${esc(s.status)}</span></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>

    <div class="grid g2 mt">
      <div class="card">
        <h3>${t("تغطية الدراسات حسب فئة الأصول")}</h3>
        <div class="subt">${t("عدد الدراسات لكل فئة")}</div>
        <div id="ch-st-class" class="chart ch-260"></div>
      </div>
      <div class="card">
        <h3>${t("مكتبة المنهجيات والأدلة الاسترشادية")}</h3>
        <div class="subt">${t("المسار الثاني — 13 منهجية معتمدة أو قيد التطوير مع أدلتها التفصيلية")}</div>
        <div class="cklist" style="margin-top:6px;max-height:300px;overflow-y:auto">
          ${(S.data.methodologies||[]).map(m=>`
            <div class="ck ${m.status==="مفعّلة"?"y":"n"}"><span class="box">${m.status==="مفعّلة"?"✓":""}</span>
            <span style="flex:1">${esc(m.name)}<span class="owner-tag" style="display:block">${t("نسخة")} ${esc(m.version)} · ${esc(m.guide)}</span></span>
            <span class="st ${m.status==="مفعّلة"?"ok":"warn"}">${esc(m.status)}</span></div>`).join("")}
        </div>
      </div>
    </div>

    <div class="section-head"><h2>${t("المقارنات المعيارية بمساعدة الذكاء الاصطناعي")}</h2>
      <span class="hint">${t("نموذج أولي — المسار الثالث: توظيف الذكاء الاصطناعي في إعداد المقارنات المعيارية واحتساب السعة والطلب وتحديد مصادر البيانات")}</span></div>
    <div class="card goldrule">
      <div class="insight gold" style="margin-bottom:12px">${esc((S.data.aiBenchmarks||{}).note||"")}</div>
      <div class="tblwrap">
        <table>
          <thead><tr><th>${t("فئة الأصول")}</th><th>${t("البند المرجعي")}</th><th>${t("متوسط تكلفة الوحدة بالهيئة")}</th><th>${t("النطاق المرجعي")}</th><th>${t("مصدر البيانات")}</th></tr></thead>
          <tbody>
            ${((S.data.aiBenchmarks||{}).rows||[]).map(r=>`
              <tr>
                <td><span class="st teal">${esc(r.assetClass)}</span></td>
                <td><b style="font-family:var(--ff-d);font-size:12px">${esc(r.item)}</b></td>
                <td>${esc(r.rcrcCost)}</td>
                <td>${esc(r.range)}</td>
                <td style="font-size:11.5px;color:var(--muted)">${esc(r.source)}</td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div class="mini-note mt">${t("المخرجات المولدة بمساعدة الذكاء الاصطناعي مسودات استرشادية — الاعتماد النهائي للمختصين وفريق كفاءة الإنفاق")}.</div>
    </div>`;
  },
  mount(){
    APP.querySelectorAll("[data-stype]").forEach(b=>b.addEventListener("click",()=>{ S.filters.studyType=b.dataset.stype; refresh(); }));
    const m = {};
    S.data.studies.forEach(s=>{ m[s.assetClass]=(m[s.assetClass]||0)+1; });
    const rows = Object.entries(m).sort((a,b)=>b[1]-a[1]);
    chart("ch-st-class").setOption(base({
      tooltip: Object.assign({},TT(),{formatter:p=>ttRow(p.name, p.value>=3&&p.value<=10? `${n(p.value)} ${t("دراسات")}` : p.value===2? "دراستان" : p.value===1? "دراسة واحدة" : `${n(p.value)} ${t("دراسة")}`,p.color)}),
      xAxis: hxAxis(v=>n(v)),
      yAxis: hyAxis(rows.map(r=>r[0]), 130),
      grid:{ top:12, bottom:26, right:142, left:34 },
      series:[{ type:"bar", barWidth:12, data:rows.map(r=>({value:r[1], itemStyle:{color:"#098A4E", borderRadius:bRad(6)}})),
        label:{show:true, position:hLbl(), fontFamily:"IBM Plex Sans Arabic", color:"#6B7870", formatter:p=>n(p.value)} }],
    }));
  },
};

/* ============================================================
   TAB: services
   ============================================================ */
RENDER.services = {
  html(){
    const list = S.data.services.filter(s=>!S.filters.svcQ || (s.name+s.sector).includes(S.filters.svcQ));
    const totalCost = S.data.services.reduce((s,x)=>s+x.totalCost,0);
    const avgQ = Math.round(S.data.services.reduce((s,x)=>s+x.qualityScore,0)/S.data.services.length);
    const needs = S.data.services.filter(s=>s.classification==="يحتاج تحسين").length;
    const digital = Math.round(S.data.services.reduce((s,x)=>s+x.digitalShare*x.volume,0)/S.data.services.reduce((s,x)=>s+x.volume,0));
    return `
    <div class="stat-strip">
      ${kpiTile("gridic","",t("خدمات الدليل المعتمد"), `${ltr(n(S.data.services.length))}`, `<span>${t("تكلفة سنوية")} ${money(totalCost)}</span>`)}
      ${kpiTile("check","",t("متوسط جودة الخدمة"), `${ltr(n(avgQ))} <small>/ 100</small>`, `<span class="delta ${avgQ>=85?"up":"fl"}">${t("المستهدف")} ${ltr("85")}</span>`)}
      ${kpiTile("chartic","n",t("النسبة الرقمية المرجحة"), pct(digital), `<span>${t("من إجمالي المعاملات")}</span>`)}
      ${kpiTile("alertT","g",t("خدمات تحتاج تحسيناً"), `${ltr(n(needs))}`, `<span>${t("ضمن خطة الارتقاء بتصنيف الجودة")}</span>`)}
    </div>

    <div class="grid g21 mt">
      <div class="card">
        <h3>${t("التكلفة مقابل الجودة")}</h3>
        <div class="subt">${t("كل نقطة تمثل خدمة، وحجمها يعكس تكلفتها الإجمالية — اضغط أي نقطة للتفاصيل")}</div>
        <div id="ch-svc-scatter" class="chart ch-340"></div>
      </div>
      <div class="card">
        <h3>${t("تصنيف جودة الخدمات")}</h3>
        <div class="subt">${t("وفق منهجية مراجعة الخدمات")}</div>
        <div id="ch-svc-class" class="chart ch-340"></div>
      </div>
    </div>

    <div class="section-head"><h2>${t("دليل الخدمات والتكاليف")}</h2>
      <span class="hint">${t("تطوير دليل خدمات الهيئة واحتساب تكلفتها — متطلب أساسي في المسار الأول")}</span></div>
    <div class="card">
      <div class="toolbar">
        <input class="fsearch" id="svc-q" placeholder="${t("بحث في الخدمات…")}" value="${esc(S.filters.svcQ)}">
      </div>
      <div class="tblwrap">
        <table>
          <thead><tr><th>${t("الخدمة")}</th><th>${t("القطاع")}</th><th>${t("القناة")}</th><th>${t("تكلفة المعاملة (ألف ريال)")}</th><th>${t("الحجم السنوي")}</th><th>${t("التكلفة الإجمالية (م.ر)")}</th><th>${t("الجودة")}</th><th>${t("نقاط المراجعة")}</th><th>${t("التصنيف")}</th></tr></thead>
          <tbody>
            ${list.map(s=>`
              <tr>
                <td style="max-width:260px"><b style="font-family:var(--ff-d);font-size:12px">${esc(s.name)}</b></td>
                <td>${esc(s.sector)}</td>
                <td><span class="st ${s.channel==="رقمية"?"teal":s.channel==="مختلطة"?"info":"mut"}">${esc(s.channel)}</span></td>
                <td class="num">${n(s.unitCost,1)}</td>
                <td class="num">${n(s.volume)}</td>
                <td class="num">${n(s.totalCost,1)}</td>
                <td class="num">${n(s.qualityScore)}</td>
                <td class="num">${n(s.reviewScore)}</td>
                <td><span class="st ${s.classification==="ممتاز"?"ok":s.classification==="جيد"?"info":"warn"}">${esc(s.classification)}</span></td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
      <div class="mini-note mt">${t("كل مؤشر تكلفة وحدة مقرون بمؤشر جودة — خفض التكلفة مع تراجع الجودة لا يُحتسب تحسناً وفق إطار جودة الإنفاق")}.</div>
    </div>`;
  },
  mount(){
    const q = document.getElementById("svc-q");
    q.addEventListener("input",()=>{ S.filters.svcQ=q.value; refreshKeepFocus("svc-q"); });
    const cls = {"ممتاز":"#1E7F5C","جيد":"#3A6EA5","يحتاج تحسين":"#C88A16"};
    chart("ch-svc-scatter").setOption(base({
      tooltip: Object.assign({},TT(),{formatter:p=>{
        const s = S.data.services[p.dataIndex];
        return `<b>${t(s.name)}</b>` + ttRow(t("تكلفة المعاملة"),`${n(s.unitCost,1)} ${t("ألف ريال")}`) + ttRow(t("الجودة"),n(s.qualityScore)) + ttRow(t("التكلفة الإجمالية"),`${n(s.totalCost,1)} ${t("م.ر")}`) + ttRow(t("التصنيف"),t(s.classification));
      }}),
      xAxis: Object.assign(valAxis(v=>n(v)), { name:t("الجودة"), inverse:isAR(), nameLocation:"middle", nameGap:26, nameTextStyle:{fontFamily:"Cairo",color:"#8B9C91"}, min:60, max:100, position:"bottom" }),
      yAxis: Object.assign(valAxis(v=>n(v)), { name:t("تكلفة المعاملة (ألف ريال)"), nameGap:16, nameTextStyle:{fontFamily:"Cairo",color:"#8B9C91",align:isAR()?"right":"left"} }),
      grid:{ top:44, bottom:44, right:64, left:24 },
      series:[{ type:"scatter",
        data:S.data.services.map(s=>({ value:[s.qualityScore, s.unitCost], symbolSize:Math.max(10,Math.sqrt(s.totalCost)*4),
          itemStyle:{ color:cls[s.classification]+"CC", borderColor:cls[s.classification], borderWidth:1.5 } })) }],
    }));
    const cc = {"ممتاز":0,"جيد":0,"يحتاج تحسين":0};
    S.data.services.forEach(s=>cc[s.classification]++);
    chart("ch-svc-class").setOption(base({
      tooltip: Object.assign({},TT(),{formatter:p=>ttRow(p.name,`${n(p.value)} ${t("خدمات")}`,p.color)}),
      xAxis: hxAxis(v=>n(v)),
      yAxis: hyAxis(Object.keys(cc), 104),
      grid:{ top:12, bottom:26, right:110, left:34 },
      series:[{ type:"bar", barWidth:22,
        data:Object.entries(cc).map(([k,v])=>({value:v, itemStyle:{color:cls[k], borderRadius:bRad(7)}})),
        label:{show:true, position:hLbl(), fontFamily:"IBM Plex Sans Arabic", fontWeight:700, color:"#5C6E63", formatter:p=>n(p.value)} }],
    }));
  },
};

/* ============================================================
   TAB: budget
   ============================================================ */
RENDER.budget = {
  html(){
    const B = S.data.budgetChapters;
    const total = B.reduce((s,c)=>s+c.approved,0);
    const spent = B.reduce((s,c)=>s+c.spent,0);
    const opp = B.reduce((s,c)=>s+c.opportunities,0);
    const reviewed = B.filter(c=>c.reviewStatus==="مكتملة").length;
    return `
    <div class="stat-strip">
      ${kpiTile("pie","",t("الميزانية المعتمدة 2026"), `${ltr(n(total/1000,1))} <small>${t("مليار ريال")}</small>`, `<span>${n(B.length)} ${t("أبواب رئيسية")}</span>`)}
      ${kpiTile("chartic","",t("نسبة المنصرف حتى تاريخه"), pct(spent/total*100), `<span>${money(spent)} ${t("حتى")} ${fmtDate(S.data.meta.asOf)}</span>`)}
      ${kpiTile("book","n",t("تغطية مراجعات الإنفاق"), `${ltr(n(reviewed))} <small>${t("من")} ${n(B.length)}</small>`, `<span>${t("وفق منهجية هيئة كفاءة الإنفاق")}</span>`)}
      ${kpiTile("bulb","g",t("فرص كفاءة محددة من المراجعات"), `${ltr(n(opp))} <small>${t("م.ر")}</small>`, `<span>${t("تُغذّي محفظة المبادرات")}</span>`)}
    </div>

    <div class="grid g21 mt">
      <div class="card">
        <h3>${t("الأبواب: المعتمد مقابل المنصرف")}</h3>
        <div class="subt">${t("مليون ريال — مع فرص الكفاءة المحددة لكل باب")}</div>
        <div id="ch-bud-bars" class="chart ch-340"></div>
      </div>
      <div class="card">
        <h3>${t("عوامل التكلفة ومسببات الطلب")}</h3>
        <div class="subt">${t("دراسة بنود الميزانية — تصنيف إداري داخلي مواءم مع أبواب الميزانية")}</div>
        <div class="scroll-fade" style="max-height:380px;overflow-y:auto;padding-bottom:26px">
          ${B.map(c=>`
            <div style="padding:9px 0;border-bottom:1px dashed var(--line2)">
              <b style="font-family:var(--ff-d);font-size:12.5px">${esc(c.name)}</b>
              <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:5px">
                ${c.costDrivers.map(d=>`<span class="st navy">${esc(d)}</span>`).join("")}
                ${c.demandDrivers.map(d=>`<span class="st gold">${esc(d)}</span>`).join("")}
              </div>
            </div>`).join("")}
        </div>
        <div class="legend-dots mt"><span><i style="background:var(--navy)"></i>${t("عوامل تكلفة")}</span><span><i style="background:var(--gold)"></i>${t("مسببات طلب")}</span></div>
      </div>
    </div>

    <div class="section-head"><h2>${t("سجل مراجعات الإنفاق")}</h2>
      <span class="hint">${t("خدمة مراجعة الإنفاق تُنفذ بالتكامل مع هيئة كفاءة الإنفاق وتُختتم بفرص محددة ودروس مستفادة")}</span></div>
    <div class="grid g2">
      ${S.data.spendingReviews.map(r=>`
        <div class="card lift">
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
            <h3 style="font-size:13.5px">${esc(r.scope)}</h3>
            <span class="st ${r.status==="مكتملة"?"ok":r.status==="قيد التنفيذ"?"info":"mut"}">${esc(r.status)}</span>
          </div>
          <div class="subt">${t("دورة")} ${esc(r.period)}</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;margin:8px 0">
            ${r.axes.map(a=>`<span class="st teal">${esc(a)}</span>`).join("")}
          </div>
          ${r.opportunities.length? `<div class="divider"></div>
            ${r.opportunities.map(o=>`<div class="fld"><b>${t("فرصة")} ${esc(o.type)}${o.value?` — ${moneyShort(o.value)}`:""}</b><span><span class="st ${o.status==="معتمدة"?"ok":"info"}">${esc(o.status)}</span></span></div>`).join("")}`:""}
          ${r.lessons? `<div class="insight" style="margin-top:10px">${esc(r.lessons)}</div>`:""}
        </div>`).join("")}
    </div>`;
  },
  mount(){
    const B = S.data.budgetChapters;
    chart("ch-bud-bars").setOption(base({
      tooltip: Object.assign({},TT(),{trigger:"axis", formatter:ps=>{
        const c = B[ps[0].dataIndex];
        let h=`<b>${t(c.name)}</b>`;
        h+=ttRow(t("المعتمد"),`${n(c.approved)} ${t("م.ر")}`,"#0B4028");
        h+=ttRow(t("المنصرف"),`${n(c.spent)} ${t("م.ر")}`,"#098A4E");
        h+=ttRow(t("فرص الكفاءة"),`${n(c.opportunities)} ${t("م.ر")}`,"#C7A34F");
        h+=ttRow(t("حالة المراجعة"),c.reviewStatus);
        return h; }}),
      legend:{ icon:"circle", itemWidth:9, itemHeight:9, top:0, textStyle:{fontFamily:"Cairo",fontSize:11,color:"#5C6E63"} },
      xAxis: hxAxis(v=>n(v)),
      yAxis: hyAxis(B.map(c=>c.name), isAR()? 175 : 230),
      grid:{ top:34, bottom:26, right:isAR()? 188:242, left:20 },
      series:[
        { name:t("المعتمد"), type:"bar", barGap:"-100%", barWidth:16, color:"#E0EEE5", data:B.map(c=>({value:c.approved, itemStyle:{borderRadius:bRad(8)}})), silent:true },
        { name:t("المنصرف"), type:"bar", barWidth:16, color:"#098A4E", data:B.map(c=>({value:c.spent, itemStyle:{borderRadius:bRad(8)}})) },
        { name:t("فرص الكفاءة"), type:"scatter", symbol:"diamond", symbolSize:12, color:"#C7A34F", data:B.map(c=>c.opportunities) },
      ],
    }));
  },
};

/* ============================================================
   TAB: kpis
   ============================================================ */
const KPI_FAMS = ["الأثر المالي","الالتزام بالسياسات","تحسن الممارسات","الالتزام بالمبادرات"];
function kpiLatest(k){ return k.series[k.series.length-1].v; }
function kpiPrev(k){ return k.series.length>1? k.series[k.series.length-2].v : null; }
function kpiStatus(k){
  const v = kpiLatest(k);
  const r = k.direction==="up"? v/k.target : k.target/Math.max(v,0.0001);
  return r>=0.975? "ok" : r>=0.8? "warn" : "bad";
}
RENDER.kpis = {
  html(){
    const f = S.filters.kpiFam;
    const KP = S.data.kpis.filter(k=>f==="الكل"||k.family===f);
    const famStats = KPI_FAMS.map(fam=>{
      const ks = S.data.kpis.filter(k=>k.family===fam);
      const ok = ks.filter(k=>kpiStatus(k)==="ok").length;
      const near = ks.filter(k=>kpiStatus(k)==="warn").length;
      return { fam, total:ks.length, ok, near };
    });
    return `
    <div class="grid g4">
      ${famStats.map((fs,i)=>`
        <div class="kpi lift" data-fam="${fs.fam}" style="cursor:pointer;${f===fs.fam?"outline:2px solid var(--teal)":""}">
          <div class="icn ${i%2?"n":""}">${svgi(["coins","shield","chartic","bulb"][i])}</div>
          <div class="lbl">${t(fs.fam)}</div>
          <div class="val">${ltr(n(fs.ok))} <small>${t("من")} ${n(fs.total)} ${t("ضمن المستهدف")}</small></div>
          <div class="foot"><span class="st ${fs.near?"warn":"mut"}">${n(fs.near)} ${t("قريب من المستهدف")}</span><div class="bar-mini" style="flex:1"><i style="width:${fs.total? (fs.ok+fs.near*0.5)/fs.total*100:0}%;${fs.ok===0? (fs.near? "background:var(--warn)":"background:var(--bad)"):""}"></i></div></div>
        </div>`).join("")}
    </div>

    <div class="section-head"><h2>${t("مؤشرات إدارة الأداء")} ${f!=="الكل"?`— ${f}`:""}</h2>
      <span class="hint">${t("المجموعات الأربع وفق النموذج التشغيلي لفرق كفاءة الإنفاق (القسم 2.7) — اضغط أي مؤشر لعرض تطوره الزمني")}</span>
      ${f!=="الكل"?`<button class="btn ghost" id="kpi-all">${t("عرض الكل")}</button>`:""}</div>
    <div class="grid g3" style="grid-template-columns:repeat(auto-fill,minmax(330px,1fr))">
      ${KP.map(k=>{
        const st = kpiStatus(k);
        const v = kpiLatest(k), pv = kpiPrev(k);
        const better = pv==null? null : (k.direction==="up"? v>=pv : v<=pv);
        const progress = k.direction==="up"? Math.min(100, v/k.target*100) : Math.min(100, k.target/Math.max(v,0.0001)*100);
        return `<div class="card lift" data-kpi="${k.id}" style="cursor:pointer">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">
            <h3 style="font-size:12.5px;line-height:1.5;flex:1">${esc(k.name)}${k.extra?` <span class="st gold" style="font-size:10px">${t("مؤشر إضافي خاص بالهيئة")}</span>`:""}</h3>
            <span class="st ${st}">${st==="ok"?t("ضمن المستهدف"):st==="warn"?t("قريب"):t("حرج")}</span>
          </div>
          <div style="display:flex;align-items:baseline;gap:9px;margin-top:6px">
            <span class="pscore" style="font-size:24px">${ltr(n(v, v%1?1:0))}</span>
            <span class="mini-note">${esc(k.unit)} · ${t("المستهدف")} ${ltr(n(k.target, k.target%1?1:0))} ${k.direction==="down"?t("(الأقل أفضل)"):""}</span>
            ${better!=null? `<span class="delta ${better?"up":"dn"}">${better?t("تحسن"):t("تراجع")}</span>`:""}
          </div>
          <div class="bar-mini" style="margin-top:8px"><i style="width:${progress}%;${st==="bad"?"background:var(--bad)":st==="warn"?"background:var(--warn)":""}"></i></div>
          <div class="mini-note" style="margin-top:5px">${esc(k.freq)} · ${esc(k.family)}</div>
        </div>`;}).join("")}
    </div>`;
  },
  mount(){
    APP.querySelectorAll("[data-fam]").forEach(el=>el.addEventListener("click",()=>{ S.filters.kpiFam = S.filters.kpiFam===el.dataset.fam? "الكل" : el.dataset.fam; refresh(); }));
    const all = document.getElementById("kpi-all");
    if(all) all.addEventListener("click",()=>{ S.filters.kpiFam="الكل"; refresh(); });
    APP.querySelectorAll("[data-kpi]").forEach(el=>el.addEventListener("click",()=>openKpi(el.dataset.kpi)));
  },
};
function openKpi(id){
  const k = S.data.kpis.find(x=>x.id===id); if(!k) return;
  const body = `
    <div class="fld"><b>${t("المجموعة")}</b><span>${esc(k.family)}</span></div>
    <div class="fld"><b>${t("الدورية")}</b><span>${esc(k.freq)}</span></div>
    <div class="fld"><b>${t("الاتجاه")}</b><span>${k.direction==="up"?t("الأعلى أفضل"):t("الأقل أفضل")}</span></div>
    <div class="fld"><b>${t("المستهدف")}</b><span class="num">${n(k.target, k.target%1?1:0)} ${esc(k.unit)}</span></div>
    <div class="fld"><b>${t("المالك")}</b><span>${esc(k.owner)}</span></div>
    ${k.formula? `<div class="fld"><b>${t("المعادلة")}</b><span>${esc(k.formula)}</span></div>`:""}
    <div class="dsec"><h4>${t("التطور الزمني")}</h4><div id="ch-kpi-trend" class="chart ch-220"></div></div>`;
  openDrawer(t(k.name), body);
  requestAnimationFrame(()=>{
    const c = chart("ch-kpi-trend"); if(!c) return;
    c.setOption(base({
      tooltip: Object.assign({},TT(),{trigger:"axis", formatter:ps=>`<b>${ps[0].axisValue}</b>`+ttRow(t("القيمة"),`${n(ps[0].value, ps[0].value%1?1:0)} ${t(k.unit)}`,"#098A4E")}),
      xAxis: catXAxis(k.series.map(s=>s.p), { axisLabel:{color:"#5C6E63",fontFamily:"Cairo",fontSize:10, interval:0, rotate:k.series.length>4?26:0} }),
      yAxis: Object.assign(valAxis(v=>n(v)), {
        max: v=>Math.max(v.max, k.target)*1.08,
        min: v=>Math.min(v.min, k.direction==="down"? k.target : v.min)*0.9,
      }),
      grid:{ top:20, bottom:44, right:50, left:16, containLabel:true },
      series:[{ type:"line", data:k.series.map(s=>s.v), smooth:true, symbol:"circle", symbolSize:7,
        lineStyle:{color:"#098A4E",width:3}, itemStyle:{color:"#098A4E"},
        areaStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:"rgba(9,138,78,.2)"},{offset:1,color:"rgba(9,138,78,0)"}]}},
        markLine:{ symbol:"none", lineStyle:{color:"#C7A34F",type:"dashed",width:2},
          label:{formatter:`${t("المستهدف")} ${n(k.target,k.target%1?1:0)}`, fontFamily:"Cairo", color:"#A98A3C", position:"insideStartTop"},
          data:[{yAxis:k.target}] } }],
    }));
    c.resize();
  });
}

/* ============================================================
   TAB: governance
   ============================================================ */
RENDER.governance = {
  html(){
    const G = S.data.governance;
    return `
    <div class="grid g21">
      <div class="card">
        <h3>${t("النموذج التشغيلي")} — ${esc(G.model)}</h3>
        <div class="subt">${t("وفق النموذج التشغيلي لفرق كفاءة الإنفاق الصادر عن هيئة كفاءة الإنفاق والمشروعات الحكومية")}</div>
        <div class="grid" style="gap:10px;margin-top:10px">
          <div class="org-box head"><b>${esc(G.reportsTo)}</b><span style="font-size:11px;opacity:.8">${t("المرجعية المباشرة للفريق")}</span></div>
          <div class="org-box head" style="background:var(--teal)"><b>${esc(G.leader)}</b><span style="font-size:11px;opacity:.85">${t("نقطة التواصل الوحيدة مع إكسبرو")}</span></div>
          <div class="grid g3" style="gap:10px">
            ${G.sections.map(s=>`
              <div class="org-box sec"><b>${esc(s.name)}</b>
                ${s.units.length? `<div class="org-units">${s.units.map(u=>`<span>${esc(u)}</span>`).join("")}</div>`:""}
              </div>`).join("")}
          </div>
        </div>
        <div class="insight navy mt">${esc(G.singlePoint)}</div>
      </div>
      <div class="card">
        <h3>${t("سلم التصعيد مع هيئة كفاءة الإنفاق والمشروعات الحكومية")}</h3>
        <div class="subt">${t("ضوابط التفاعل ثلاثية المستويات (إكسبرو)")}</div>
        ${G.escalation.map(e=>`
          <div class="esc-row">
            <div class="esc-lvl">${e.level}</div>
            <div style="flex:1"><b style="font-family:var(--ff-d);font-size:12.5px">${esc(e.entity)}</b>
              <div class="mini-note">${esc(e.expro)}</div></div>
            <span class="esc-arrow">⇄</span>
          </div>`).join("")}
        <div class="mini-note mt">${t("التصعيد وطلب الدعم يتجهان لأعلى، والقرارات والتوجيهات تعود لأسفل — القنوات: الاجتماعات والتقارير والبريد الرسمي")}.</div>
      </div>
    </div>

    <div class="section-head"><h2>${t("ملاك الركائز")}</h2><span class="hint">${t("كل ركيزة يملكها قسم مسؤول عن خطتها التصحيحية وتقاريرها")}</span></div>
    <div class="card">
      <div class="tblwrap"><table>
        <thead><tr><th>${t("الركيزة")}</th><th>${t("المالك")}</th><th>${t("الدرجة الذاتية")}</th><th>${t("درجة المحاكاة")}</th><th>${t("وثائق متوفرة")}</th></tr></thead>
        <tbody>
          ${S.data.pillars.map(p=>{
            const pe = evStats(p.criteria);
            return `<tr class="clickable" data-pillar="${p.id}">
              <td><b style="font-family:var(--ff-d)">${esc(p.name)}</b></td>
              <td>${esc(p.owner)}</td>
              <td class="num">${n(pillarScore(p,"self"),2)}</td>
              <td class="num">${n(pillarScore(p,"sim"),2)}</td>
              <td><div style="display:flex;align-items:center;gap:8px"><div class="bar-mini" style="flex:1"><i style="width:${pe.coverage}%"></i></div><span class="num" style="font-size:11px">${pct(pe.coverage)}</span></div></td>
            </tr>`;}).join("")}
        </tbody>
      </table></div>
    </div>

    <div class="section-head"><h2>${t("سجل السياسات والتكليفات المعممة")}</h2>
      <span class="hint">${t("المرجع النظامي لمؤشر الالتزام بالسياسات — أوامر سامية وتعليمات وأدلة وطنية")}</span></div>
    <div class="card">
      <div class="tblwrap"><table>
        <thead><tr><th>${t("المرجع")}</th><th>${t("النوع")}</th><th>${t("الموضوع")}</th><th>${t("حالة الالتزام")}</th><th>${t("شاهد الالتزام")}</th></tr></thead>
        <tbody>
          ${(S.data.policies||[]).map(p=>`
            <tr>
              <td><b style="font-family:var(--ff-d);font-size:12px">${esc(p.ref)}</b></td>
              <td><span class="st navy">${esc(p.type)}</span></td>
              <td style="max-width:280px">${esc(p.subject)}</td>
              <td><span class="st ${p.status==="ملتزم"?"ok":p.status==="ملتزم جزئياً"?"warn":"info"}">${esc(p.status)}</span></td>
              <td style="font-size:11.5px;color:var(--muted)">${esc(p.evidence)}</td>
            </tr>`).join("")}
        </tbody>
      </table></div>
      <div class="mini-note mt">${t("يغذي هذا السجل مؤشر «نسبة الالتزام بالسياسات والتكليفات المعممة» وفق آلية الاحتساب المعتمدة من هيئة كفاءة الإنفاق والمشروعات الحكومية")}.</div>
    </div>

    <div class="section-head"><h2>${t("اللجان والاجتماعات")}</h2></div>
    <div class="grid g21">
      <div class="card">
        <div class="toolbar" style="margin-bottom:8px">
          <h3 style="margin:0">${t("سجل الاجتماعات والقرارات")}</h3>
          <div class="spacer"></div>
          <button class="btn primary" id="mtg-add">${t("تسجيل اجتماع")}</button>
        </div>
        ${G.meetings.map(m=>`
          <div style="padding:10px 0;border-bottom:1px dashed var(--line2)">
            <div style="display:flex;justify-content:space-between;gap:8px">
              <b style="font-family:var(--ff-d);font-size:12.5px">${esc(m.committee)}</b>
              <span class="mini-note">${fmtDate(m.date)}</span>
            </div>
            <ul style="margin:6px 18px 0 0;font-size:12px;color:var(--muted)">
              ${m.decisions.map(d=>`<li>${esc(d)}</li>`).join("")}
            </ul>
          </div>`).join("")}
      </div>
      <div>
        ${G.committees.map(c=>`
          <div class="card lift" style="margin-bottom:14px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px">
              <h3>${esc(c.name)}</h3><span class="st teal">${esc(c.freq)}</span>
            </div>
            <div class="fld"><b>${t("الرئيس")}</b><span>${esc(c.chair)}</span></div>
            <div class="fld"><b>${t("الأعضاء")}</b><span class="num">${n(c.members)}</span></div>
            <div class="mini-note" style="margin-top:6px">${esc(c.mandate)}</div>
          </div>`).join("")}
      </div>
    </div>`;
  },
  mount(){
    APP.querySelectorAll("[data-pillar]").forEach(el=>el.addEventListener("click",()=>{ go("skep"); setTimeout(()=>openPillar(el.dataset.pillar),80); }));
    document.getElementById("mtg-add").addEventListener("click",()=>{
      openModal(t("تسجيل اجتماع جديد"), `
        <div class="frow">
          <div class="fgrp"><label>${t("اللجنة")}</label><select id="m-comm">${S.data.governance.committees.map(c=>`<option value="${c.name}">${esc(c.name)}</option>`).join("")}</select></div>
          <div class="fgrp"><label>${t("التاريخ")}</label><input id="m-date" type="date" value="${S.data.meta.asOf}"></div>
        </div>
        <div class="frow one"><div class="fgrp"><label>${t("القرارات (سطر لكل قرار")})</label><textarea id="m-dec" rows="4"></textarea></div></div>
      `, [
        { label:"إلغاء", cls:"ghost", fn:closeModal },
        { label:"حفظ", cls:"primary", fn:()=>{
            const dec = document.getElementById("m-dec").value.trim().split("\n").map(s=>s.trim()).filter(Boolean);
            if(!dec.length){ toast("أدخل قراراً واحداً على الأقل"); return; }
            S.data.governance.meetings.unshift({
              date: document.getElementById("m-date").value,
              committee: document.getElementById("m-comm").value,
              decisions: dec,
            });
            save(); closeModal(); refresh(); toast("تم تسجيل الاجتماع");
          }},
      ]);
    });
  },
};

/* ============================================================
   TAB: capability
   ============================================================ */
RENDER.capability = {
  html(){
    const C = S.data.capability;
    const aw = C.awareness.surveys;
    const last = aw[aw.length-1];
    const done = C.trainings.filter(t=>t.status==="مكتمل").length;
    return `
    <div class="stat-strip">
      ${kpiTile("users","",t("تغطية مصفوفة المهارات"), pct(C.skillsCoverage), `<span>${t("المستهدف")} ${pct(C.skillsTarget)}</span>`)}
      ${kpiTile("check","",t("نسبة الوعي بكفاءة الإنفاق"), pct(last.score), `<span>${t("آخر قياس")}: ${esc(last.label)} (${t("عدد المشاركين")}: ${n(last.respondents)})</span>`)}
      ${kpiTile("book","n",t("البرامج التدريبية"), `${ltr(n(done))} <small>${t("من")} ${n(C.trainings.length)} ${t("مكتملة")}</small>`, `<span>${n(C.trainings.reduce((s,t)=>s+t.hours,0))} ${t("ساعة تدريبية")}</span>`)}
      ${kpiTile("flag","g",t("مستوى تبني كفاءة الإنفاق"), `${esc(C.adoption.current)}`, `<span>${t("المستهدف")} ${QQ(esc(C.adoption.target))} 2026–2027</span>`)}
    </div>

    <div class="grid g21 mt">
      <div class="card">
        <h3>${t("تطور نسبة الوعي بكفاءة الإنفاق")}</h3>
        <div class="subt">${t("دورة قياس وتحسين متكاملة: قياس ← تحديد الفجوات ← تدخلات ← إعادة قياس (المستهدف")} ${pct(C.awareness.target)})</div>
        <div id="ch-cap-aw" class="chart ch-260"></div>
      </div>
      <div class="card">
        <h3>${t("مستويات التبني")}</h3>
        <div class="subt">${t("خطة إدارة التغيير وآلية التحفيز")}</div>
        <div class="stepper" style="margin-top:16px">
          ${C.adoption.levels.map((l,i)=>`
            <div class="step ${i<C.adoption.currentIndex?"done":i===C.adoption.currentIndex?"cur":""}">
              <div class="dotp">${i<C.adoption.currentIndex?"✓":i+1}</div>
              <span style="font-weight:${i===C.adoption.targetIndex?700:400};${i===C.adoption.targetIndex?"color:var(--gold2)":""}">${t(l)}${i===C.adoption.targetIndex?" ◈":""}</span>
            </div>`).join("")}
        </div>
        <div class="insight gold mt">${esc(C.adoption.note)}</div>
        <div class="dsec"><h4>${t("آلية التحفيز")}</h4>
          ${C.incentives.map(x=>`<div class="fld"><b>${esc(x.name)}</b><span><span class="st ${x.status==="مفعّلة"?"ok":"warn"}">${esc(x.status)}</span></span></div>`).join("")}
        </div>
        ${C.nominations? `<div class="dsec"><h4>${t("دورة الترشيح والتكريم (ترشيح ← تقييم اللجنة الإشرافية ← إعلان)")}</h4>
          ${C.nominations.map(x=>`<div class="fld"><b style="max-width:60%">${esc(x.nominee).replace(/\(([A-Za-z0-9-]+)\)/g,'<span class="ltr">($1)</span>')}</b><span><span class="st ${x.stage.startsWith("إعلان")?"ok":x.stage.startsWith("تقييم")?"info":"mut"}">${esc(x.stage)}</span> · ${esc(x.criterion)}</span></div>`).join("")}
        </div>`:""}
      </div>
    </div>

    ${C.succession? `<div class="grid g2 mt">
      <div class="card">
        <h3>${t("خطة التعاقب الوظيفي")}</h3>
        <div class="subt">${t("تغطية الأدوار الحرجة")}: ${pct(C.succession.coverage)} — ${t("المستهدف")} ${pct(C.succession.target)}</div>
        <div class="bar-mini" style="margin:8px 0 12px"><i style="width:${C.succession.coverage}%"></i></div>
        ${C.succession.roles.map(r=>`<div class="fld"><b>${esc(r.role)}</b><span><span class="st ${r.status==="مغطى"?"ok":"warn"}">${esc(r.status)}</span> ${r.ready>1?t("مرشحان جاهزان"):t("مرشح واحد جاهز")}</span></div>`).join("")}
        <div class="mini-note mt">${esc(C.succession.note)}</div>
      </div>
      <div class="card">
        <h3>${t("منظومة إدارة المعرفة")}</h3>
        <div class="subt">${t("مستودع موحد للمنهجيات والدروس المستفادة وقصص النجاح")}</div>
        ${C.knowledge.assets.map(a=>`<div class="fld"><b>${esc(a.name)}</b><span><span class="st ${a.status==="محدّث"?"ok":"warn"}">${esc(a.status)}</span></span></div>`).join("")}
        <div class="mini-note mt">${esc(C.knowledge.note)}</div>
      </div>
    </div>`:""}

    <div class="grid g21 mt">
      <div class="card">
        <h3>${t("الخطة التدريبية ونقل المعرفة")}</h3>
        <div class="subt">${t("مرتبطة بفجوات مصفوفة المهارات — تشمل ورش نقل المعرفة من الاستشاريين")}</div>
        <div class="tblwrap"><table>
          <thead><tr><th>${t("البرنامج")}</th><th>${t("الفئة المستهدفة")}</th><th>${t("الساعات")}</th><th>${t("المشاركون")}</th><th>${t("الموعد")}</th><th>${t("الحالة")}</th></tr></thead>
          <tbody>
            ${C.trainings.map(t=>`
              <tr>
                <td><b style="font-family:var(--ff-d);font-size:12px">${esc(t.name)}</b></td>
                <td>${esc(t.audience)}</td>
                <td class="num">${n(t.hours)}</td>
                <td class="num">${n(t.attendees)}</td>
                <td>${fmtDate(t.date)}</td>
                <td><span class="st ${t.status==="مكتمل"?"ok":t.status==="قيد التنفيذ"?"info":"mut"}">${esc(t.status)}</span></td>
              </tr>`).join("")}
          </tbody>
        </table></div>
      </div>
      <div class="card">
        <h3>${t("الفعاليات والحملات")}</h3>
        <div class="subt">${t("بما يشمل يوم كفاءة الإنفاق على مستوى الهيئة")}</div>
        ${C.events.map(e=>`
          <div class="alert info">
            <div class="ai">${svgi("clock")}</div>
            <div style="flex:1"><b>${esc(e.name)}</b>
              <div class="at">${fmtDate(e.date)}${e.note?` — ${esc(e.note)}`:""}</div></div>
            <span class="st ${e.status==="منفذة"?"ok":"mut"}">${esc(e.status)}</span>
          </div>`).join("")}
      </div>
    </div>`;
  },
  mount(){
    const C = S.data.capability;
    chart("ch-cap-aw").setOption(base({
      tooltip: Object.assign({},TT(),{trigger:"axis", formatter:ps=>`<b>${ps[0].axisValue}</b>`+ttRow(t("نسبة الوعي"),pct(ps[0].value),"#098A4E")}),
      xAxis: catXAxis(C.awareness.surveys.map(s=>s.label), { boundaryGap:false }),
      yAxis: Object.assign(valAxis(v=>n(v)+"%"), {max:100}),
      grid:{ top:22, bottom:28, right:74, left:74, containLabel:true },
      series:[{ type:"line", data:C.awareness.surveys.map(s=>s.score), smooth:true, symbol:"circle", symbolSize:8,
        lineStyle:{color:"#098A4E",width:3}, itemStyle:{color:"#098A4E"},
        label:{show:true, position:"top", fontFamily:"IBM Plex Sans Arabic", fontWeight:700, color:"#0B4028", formatter:p=>n(p.value)+"%"},
        areaStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:"rgba(9,138,78,.18)"},{offset:1,color:"rgba(9,138,78,0)"}]}},
        markLine:{ symbol:"none", lineStyle:{color:"#B8963E",type:"dashed",width:1.6},
          label:{formatter:`${t("المستهدف")} ${C.awareness.target}%`, fontFamily:"Cairo", color:"#9A7D33", position:"insideEndTop"},
          data:[{yAxis:C.awareness.target}] } }],
    }));
  },
};

/* ============================================================
   TAB: reports
   ============================================================ */
RENDER.reports = {
  html(){
    return `
    <div class="section-head"><h2>${t("إنشاء التقارير")}</h2>
      <span class="hint">${t("تقارير جاهزة للطباعة والرفع — تُبنى لحظياً من بيانات المنصة الحية")}</span></div>
    <div class="grid g4" style="grid-template-columns:repeat(auto-fit,minmax(250px,1fr))">
      ${[
        { id:"pillar", icon:"skep", t:t("تقرير جاهزية الركائز"), d:t("درجات المعايير والوثائق والفجوات لكل ركيزة — نموذج الرفع لدورة التقييم") },
        { id:"quarterly", icon:"file", t:t("التقرير الربع سنوي"), d:t("إنجازات الفريق والمبادرات والأثر المالي — للمسؤول الأول ونسخة لإكسبرو") },
        { id:"annual", icon:"book", t:t("التقرير السنوي 2026"), d:t("الحصاد السنوي الشامل لكفاءة الإنفاق في الهيئة") },
        { id:"expro", icon:"doc", t:t("حزمة منصة فرق كفاءة الإنفاق"), d:t("ملخص الرفع الدوري: مبادرات، وفورات، مؤشرات، حالة الركائز") },
      ].map(r=>`
        <div class="card lift" style="cursor:pointer;padding:22px 20px" data-report="${r.id}">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px">
            <div style="width:38px;height:38px;border-radius:11px;background:var(--green-soft);display:flex;align-items:center;justify-content:center;color:var(--green);flex:0 0 auto">${svgi(r.icon)}</div>
            <h3>${r.t}</h3>
          </div>
          <div class="mini-note">${r.d}</div>
          <div style="margin-top:14px;font-family:var(--ff-d);font-weight:600;font-size:12px;color:var(--green)">${t("إنشاء التقرير")} ${ARROW()}</div>
        </div>`).join("")}
    </div>

    <div class="section-head"><h2>${t("سجل التقارير")}</h2></div>
    <div class="card">
      <div class="tblwrap"><table>
        <thead><tr><th>${t("التقرير")}</th><th>${t("النوع")}</th><th>${t("الفترة")}</th><th>${t("الاستحقاق")}</th><th>${t("الحالة")}</th></tr></thead>
        <tbody>
          ${S.data.reports.map(r=>`
            <tr>
              <td><b style="font-family:var(--ff-d);font-size:12px">${esc(r.name)}</b></td>
              <td><span class="st navy">${esc(r.type)}</span></td>
              <td>${esc(r.period)}</td>
              <td>${fmtDate(r.due)}</td>
              <td><span class="st ${r.status==="معتمد"||r.status==="مرفوع"?"ok":r.status==="قيد الإعداد"?"info":"mut"}">${esc(r.status)}</span></td>
            </tr>`).join("")}
        </tbody>
      </table></div>
    </div>
    <div id="reportview"></div>`;
  },
  mount(){
    APP.querySelectorAll("[data-report]").forEach(el=>el.addEventListener("click",()=>buildReport(el.dataset.report)));
  },
};
function hideReport(){
  const rv = document.getElementById("reportview");
  if(rv) rv.classList.remove("on");
  document.body.classList.remove("report-open");
}
function buildReport(type){
  const rv = document.getElementById("reportview");
  const asOf = fmtDate(S.data.meta.asOf);
  const it = impactTotals();
  const ist = iniStats();
  const evs = evStats(allCriteria());
  let title="", body="";
  if(type==="pillar"){
    title = t("تقرير جاهزية برنامج ركائز استدامة كفاءة الإنفاق");
    body = S.data.pillars.map(p=>`
      <h2>${esc(p.name)} — ${n(pillarScore(p,"self"),2)} ${t("من 5")} (${t(gradeOf(pillarScore(p,"self")))})</h2>
      <table><thead><tr><th>${t("المعيار")}</th><th>${t("ذاتي")}</th><th>${t("محاكاة")}</th><th>${t("الدورة 6")}</th><th>${t("الوثائق")}</th><th>${t("الإجراءات")}</th></tr></thead><tbody>
        ${p.criteria.map(c=>`<tr>
          <td>${esc(c.code)} — ${esc(c.name)}</td>
          <td class="num">${n(c.selfScore)}</td><td class="num">${n(c.simScore)}</td><td class="num">${n(c.prevScore)}</td>
          <td>${c.evidence.map(e=>`${esc(e.name)} (${esc(e.status)})`).join(isAR()? "؛ " : "; ")}</td>
          <td>${c.actions.map(a=>esc(a.name)).join(isAR()? "؛ " : "; ")||"—"}</td>
        </tr>`).join("")}
      </tbody></table>`).join("");
  } else if(type==="quarterly"){
    title = t("التقرير الربع سنوي لأعمال فريق كفاءة الإنفاق");
    body = `
      <h2>${t("الملخص التنفيذي")}</h2>
      <p>${t("بلغ التقييم الذاتي الشامل")} ${n(overallScore("self"),1)} ${t("من 5")} (${t(gradeOf(overallScore("self")))})${t("، وبلغ الأثر المالي المحقق التراكمي")} ${n(it.realized)} ${t("مليون ريال (منه")} ${n(it.documented)} ${t("مليون ريال موثق بالإقفال)، فيما بلغت نسبة الالتزام بالمبادرات")} ${n(ist.commitment,1)}%.</p>
      <h2>${t("المبادرات حسب المرحلة")}</h2>
      <table><thead><tr><th>${t("المرحلة")}</th><th>${t("العدد")}</th></tr></thead><tbody>
        ${INI_STAGES.map(s=>`<tr><td>${t(s)}</td><td class="num">${n(statusCount()[s])}</td></tr>`).join("")}
      </tbody></table>
      <h2>${t("المبادرات المتأخرة والمتعثرة")}</h2>
      <table><thead><tr><th>${t("المبادرة")}</th><th>${t("الحالة")}</th><th>${t("الإجراء")}</th></tr></thead><tbody>
        ${S.data.initiatives.filter(i=>i.flag).map(i=>`<tr><td>${esc(i.name)}</td><td>${esc(i.flag)}</td><td>${esc(i.note||"—")}</td></tr>`).join("")||`<tr><td colspan="3">${t("لا توجد")}</td></tr>`}
      </tbody></table>
      <h2>${t("مؤشرات الأداء الرئيسية")}</h2>
      <table><thead><tr><th>${t("المؤشر")}</th><th>${t("القيمة")}</th><th>${t("المستهدف")}</th><th>${t("الحالة")}</th></tr></thead><tbody>
        ${S.data.kpis.slice(0,10).map(k=>`<tr><td>${esc(k.name)}</td><td class="num">${n(kpiLatest(k),kpiLatest(k)%1?1:0)} ${esc(k.unit)}</td><td class="num">${n(k.target,k.target%1?1:0)}</td><td>${kpiStatus(k)==="ok"?t("ضمن المستهدف"):kpiStatus(k)==="warn"?t("قريب"):t("حرج")}</td></tr>`).join("")}
      </tbody></table>`;
  } else if(type==="annual"){
    title = t("التقرير السنوي لكفاءة الإنفاق في الهيئة — 2026");
    body = `
      <h2>${t("أبرز النتائج")}</h2>
      <table><tbody>
        <tr><td>${t("التقييم الذاتي الشامل (الدورة السابعة")})</td><td class="num">${n(overallScore("self"),1)} / 5 — ${t(gradeOf(overallScore("self")))}</td></tr>
        <tr><td>${t("تقييم الدورة السادسة")}</td><td class="num">${n(overallScore("prev"),1)} / 5</td></tr>
        <tr><td>${t("الأثر المالي المحدد (إجمالي الفرص)")}</td><td class="num">${n(it.identified)} ${t("مليون ريال")}</td></tr>
        <tr><td>${t("الأثر المعتمد من الشؤون المالية")}</td><td class="num">${n(it.approved)} ${t("مليون ريال")}</td></tr>
        <tr><td>${t("الأثر المحقق التراكمي")}</td><td class="num">${n(it.realized)} ${t("مليون ريال")}</td></tr>
        <tr><td>${t("اكتمال الوثائق الداعمة")}</td><td class="num">${evs.coverage}%</td></tr>
        <tr><td>${t("عدد المبادرات")}</td><td class="num">${n(ist.total)}</td></tr>
      </tbody></table>
      <h2>${t("نضج الركائز")}</h2>
      <table><thead><tr><th>${t("الركيزة")}</th><th>${t("ذاتي")}</th><th>${t("محاكاة")}</th><th>${t("الدورة 6")}</th><th>${t("المالك")}</th></tr></thead><tbody>
        ${S.data.pillars.map(p=>`<tr><td>${esc(p.name)}</td><td class="num">${n(pillarScore(p,"self"),2)}</td><td class="num">${n(pillarScore(p,"sim"),2)}</td><td class="num">${n(pillarScore(p,"prev"),2)}</td><td>${esc(p.owner)}</td></tr>`).join("")}
      </tbody></table>
      <h2>${t("قصص النجاح")}</h2>
      ${S.data.initiatives.filter(i=>i.status==="مقفلة").map(i=>`<p><b>${esc(i.name)}:</b> ${esc(i.wasteSource)} — ${t("عولج مصدر الهدر عبر")} ${esc(i.treatment)}${t("، بأثر موثق قدره")} ${n(i.realizedImpact)} ${t("مليون ريال")}.</p>`).join("")}`;
  } else {
    title = t("حزمة الرفع الدوري — منصة فرق كفاءة الإنفاق");
    body = `
      <h2>${t("ملخص الرفع")}</h2>
      <table><tbody>
        <tr><td>${t("الجهة")}</td><td>${esc(S.data.meta.entity)}</td></tr>
        <tr><td>${t("الفترة")}</td><td>${t("الربع الثالث 2026 (حتى")} ${asOf})</td></tr>
        <tr><td>${t("الأثر المحقق 2026")}</td><td class="num">${n(S.data.impact.monthly2026.reduce((s,m)=>s+m.real,0))} ${t("مليون ريال")}</td></tr>
        <tr><td>${t("نسبة الالتزام بالمبادرات")}</td><td class="num">${n(ist.commitment,1)}%</td></tr>
        <tr><td>${t("حالة التقييم الذاتي")}</td><td>${t("قيد الاستكمال — الاستحقاق")} ${fmtDate(S.data.assessmentCycle.selfDue)}</td></tr>
      </tbody></table>
      <h2>${t("المبادرات النشطة")} (${n(S.data.initiatives.filter(i=>["تنفيذ","قياس الأثر"].includes(i.status)).length)})</h2>
      <table><thead><tr><th>${t("المبادرة")}</th><th>${t("المرحلة")}</th><th>${t("معتمد")}</th><th>${t("محقق")}</th><th>${t("الإنجاز")}</th></tr></thead><tbody>
        ${S.data.initiatives.filter(i=>["تنفيذ","قياس الأثر"].includes(i.status)).map(i=>`<tr><td>${esc(i.name)}</td><td>${esc(i.status)}</td><td class="num">${n(i.approvedImpact)}</td><td class="num">${n(i.realizedImpact)}</td><td class="num">${n(i.progress)}%</td></tr>`).join("")}
      </tbody></table>
      <h2>${t("الوثائق الداعمة للركائز")}</h2>
      <p>${t("متوفرة")}: ${n(evs.ready)} · ${t("قيد الإعداد")}: ${n(evs.prep)} · ${t("غير متوفرة")}: ${n(evs.missing)} — ${t("نسبة الاكتمال")} ${evs.coverage}%.</p>`;
  }
  rv.innerHTML = `
    <div class="rv-head">
      <div style="display:flex;align-items:center;gap:18px;min-width:0">
        <img src="__LOGO_FULL__" alt="${t("شعار الهيئة الملكية لمدينة الرياض")}" style="height:72px;flex:0 0 auto">
        <div style="min-width:0">
          <h1>${title}</h1>
          <div class="rv-meta">${esc(S.data.meta.entity)} — ${t("فريق كفاءة الإنفاق · تاريخ الإصدار")}: ${asOf} · ${S.data.meta.demo? t("بيانات تجريبية لأغراض العرض"):""}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px" class="no-print">
        <button class="btn primary" id="rv-print">${t("طباعة / PDF")}</button>
        <button class="btn ghost" id="rv-close">${t("إغلاق")}</button>
      </div>
    </div>
    ${body}`;
  rv.classList.add("on");
  document.body.classList.add("report-open");
  rv.scrollIntoView({behavior: REDUCED? "auto":"smooth"});
  document.getElementById("rv-print").addEventListener("click",()=>window.print());
  document.getElementById("rv-close").addEventListener("click",()=>hideReport());
}

/* ---------------- drawer / modal / toast ---------------- */
const OV = document.getElementById("overlay");
const DR = document.getElementById("drawer");
function openDrawer(title, body){
  document.getElementById("drawer-title").innerHTML = title;
  document.getElementById("drawer-body").innerHTML = body;
  DR.classList.add("on"); OV.classList.add("on");
  document.getElementById("drawer-x").focus();
}
function closeDrawer(){ DR.classList.remove("on"); OV.classList.remove("on"); }
document.getElementById("drawer-x").addEventListener("click",closeDrawer);
OV.addEventListener("click",()=>{ closeDrawer(); closeModal(); closeMoreSheet(); });
addEventListener("keydown",e=>{ if(e.key==="Escape"){ closeDrawer(); closeModal(); closeMoreSheet(); } });

const MO = document.getElementById("modal");
function openModal(title, body, buttons){
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").innerHTML = body;
  document.getElementById("modal-foot").innerHTML = buttons.map((b,i)=>`<button class="btn ${b.cls}" data-mb="${i}">${t(b.label)}</button>`).join("");
  MO.classList.add("on"); OV.classList.add("on");
  buttons.forEach((b,i)=>document.querySelector(`[data-mb="${i}"]`).addEventListener("click",b.fn));
  const first = document.querySelector("#modal-body input,#modal-body select,#modal-body textarea");
  if(first) first.focus();
}
function closeModal(){ MO.classList.remove("on"); if(!DR.classList.contains("on")) OV.classList.remove("on"); }
document.getElementById("modal-x").addEventListener("click",closeModal);

let toastT=null;
function toast(msg){
  const el = document.getElementById("toast");
  document.getElementById("toast-msg").textContent = t(msg);
  el.hidden = false; el.classList.add("on");
  clearTimeout(toastT);
  toastT = setTimeout(()=>{ el.classList.remove("on"); }, 2600);
}

/* ---------------- export / import / print / reset ---------------- */
function doExport(){
  const blob = new Blob([JSON.stringify(S.data,null,1)],{type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `rcrc-spending-efficiency-${S.data.meta.asOf}.json`;
  a.click(); URL.revokeObjectURL(a.href);
  toast("تم تصدير البيانات");
}
function doImport(){ document.getElementById("import-file").click(); }
document.getElementById("btn-export").addEventListener("click",doExport);
document.getElementById("btn-import").addEventListener("click",doImport);
document.getElementById("import-file").addEventListener("change",e=>{
  const f = e.target.files[0]; if(!f) return;
  const rd = new FileReader();
  rd.onload = ()=>{
    try{
      const d = JSON.parse(rd.result);
      if(!d.pillars || !d.initiatives) throw new Error("bad");
      S.data = d; save(); refresh(); toast("تم استيراد البيانات بنجاح");
    }catch(err){ toast("ملف غير صالح — تعذر الاستيراد"); }
  };
  rd.readAsText(f); e.target.value = "";
});
document.getElementById("btn-print").addEventListener("click",()=>window.print());
document.getElementById("btn-reset").addEventListener("click",resetData);

/* ---------------- boot ---------------- */
document.documentElement.dir = isAR() ? "rtl" : "ltr";
document.documentElement.lang = LANG;
applyStaticI18n();
if(!S.data.meta.demo) document.getElementById("demo-chip").style.display="none";
const BL = document.getElementById("btn-lang");
if(BL) BL.addEventListener("click",()=>setLang(LANG==="ar" ? "en" : "ar"));
const initTab = (location.hash||"").replace("#","");
if(TABS.some(t=>t.id===initTab)) S.tab = initTab;
addEventListener("hashchange",()=>{
  const h = (location.hash||"").replace("#","");
  if(TABS.some(t=>t.id===h) && h!==S.tab){ S.tab=h; refresh(); }
});
refresh();
