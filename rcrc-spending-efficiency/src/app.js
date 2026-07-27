/* ============================================================
   منصة استدامة كفاءة الإنفاق — الهيئة الملكية لمدينة الرياض
   Vanilla JS + ECharts. RTL. localStorage persistence.
   ============================================================ */
"use strict";

/* ---------------- state & persistence ---------------- */
const SEED = window.DATA;
const LS_KEY = "rcrcSE.v1";
const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  if(!confirm("سيتم استرجاع بيانات العرض الأصلية وفقدان كل التعديلات المحلية. المتابعة؟")) return;
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
  if(Math.abs(m) >= 1000) return `${ltr(n(m/1000,2))} مليار ريال`;
  return `${ltr(n(m))} مليون ريال`;
}
function moneyShort(m){
  if(Math.abs(m) >= 1000) return `${ltr(n(m/1000,1))} مليار`;
  return `${ltr(n(m))} م.ر`;
}
function pct(x,d){ return `${ltr(n(x, d==null?0:d)+"%")}`; }
function esc(s){ return String(s==null?"":s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;"); }
const AR_MONTHS = {"01":"يناير","02":"فبراير","03":"مارس","04":"أبريل","05":"مايو","06":"يونيو","07":"يوليو","08":"أغسطس","09":"سبتمبر","10":"أكتوبر","11":"نوفمبر","12":"ديسمبر"};
function fmtDate(iso){
  if(!iso) return "—";
  const [y,m,d] = iso.split("-");
  return `${parseInt(d||1)} ${AR_MONTHS[m]||""} ${y}`;
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
  return lv ? lv.color : "#5D6B7E";
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
function progName(id){ const p = S.data.programs.find(p=>p.id===id); return p? p.name : id; }
function progShort(id){ const p = S.data.programs.find(p=>p.id===id); return p? (p.short||p.name) : id; }

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
    A.push({sev:"bad", t:`مبادرة متعثرة: ${i.name}`, d:i.note||"تتطلب قراراً من اللجنة الإشرافية.", tab:"initiatives"}));
  S.data.initiatives.filter(i=>i.flag==="متأخرة").forEach(i=>
    A.push({sev:"warn", t:`مبادرة متأخرة عن الخط الزمني: ${i.name}`, d:i.note||"يلزم تحديث خطة المعالجة.", tab:"initiatives"}));
  S.data.fundingRequests.filter(r=>r.stage==="معاد للاستكمال").forEach(r=>
    A.push({sev:"warn", t:`طلب تمويل معاد للاستكمال: ${r.name}`, d:r.note||"استكمال المتطلبات قبل إعادة الرفع.", tab:"funding"}));
  const missing = allCriteria().filter(c=>c.evidence.some(e=>e.status==="غير متوفر"));
  if(missing.length)
    A.push({sev:"warn", t:`${n(missing.length)} معايير تنقصها وثائق داعمة`, d:"استكمال الوثائق شرط أساسي لدرجة «متميز» في التقييم.", tab:"skep"});
  const weak = allCriteria().filter(c=>c.simScore<=2);
  weak.forEach(c=>A.push({sev:"bad", t:`معيار منخفض في تقييم المحاكاة: ${c.code} ${c.name}`, d:"يتطلب خطة معالجة عاجلة قبل التقييم النهائي.", tab:"skep"}));
  const dLeft = daysBetween(asOf, S.data.assessmentCycle.selfDue);
  A.push({sev: dLeft<=45?"warn":"info", t:`${n(dLeft)} يوماً حتى موعد التقييم الذاتي للدورة السابعة`,
          d:`آخر موعد للتقييم الذاتي ${fmtDate(S.data.assessmentCycle.selfDue)} ورفع الوثائق ${fmtDate(S.data.assessmentCycle.docsDue)}.`, tab:"skep"});
  return A;
}

/* ---------------- ECharts helpers ---------------- */
const CH = {};
const PALETTE = ["#0A2A4A","#0F7A8A","#C7A34F","#3A6EA5","#149AAD","#8A7A2E","#5D6B7E","#2E7D6B"];
function ramp(i, total){
  // navy -> teal interpolation
  const a=[10,42,74], b=[20,154,173];
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
const TT = {
  trigger:"item", backgroundColor:"#FFFFFF", borderColor:"#DFE6EF", borderWidth:1,
  textStyle:{ color:"#16212E", fontFamily:"Cairo", fontSize:12 },
  extraCssText:"direction:rtl;text-align:right;box-shadow:0 8px 24px rgba(10,42,74,.14);border-radius:10px;padding:10px 14px;",
};
function ttRow(k, v, color){
  return `<div style="display:flex;justify-content:space-between;gap:18px;align-items:center;margin:2px 0">
    <span style="color:#5D6B7E">${color?`<span style="display:inline-block;width:9px;height:9px;border-radius:50%;background:${color};margin-left:6px"></span>`:""}${k}</span>
    <b style="font-family:'IBM Plex Sans Arabic'">${v}</b></div>`;
}
function base(extra){
  return Object.assign({
    animation: !REDUCED,
    animationDuration: 300,          // short: printed/captured views always show final values
    textStyle:{ fontFamily:"Cairo" },
    grid:{ top:30, bottom:28, right:14, left:52, containLabel:false },
  }, extra);
}
function catAxis(data){
  return { type:"category", data, inverse:true,
    axisLine:{ lineStyle:{ color:"#DFE6EF" } }, axisTick:{ show:false },
    axisLabel:{ color:"#5D6B7E", fontFamily:"Cairo", fontSize:11 } };
}
function valAxis(fmt){
  return { type:"value", position:"right",
    splitLine:{ lineStyle:{ color:"#EDF1F7" } }, axisLabel:{ color:"#8B98A9", fontFamily:"IBM Plex Sans Arabic", fontSize:10.5, formatter:fmt } };
}
/* RTL horizontal bars: bars grow right<-left, category labels on the RIGHT */
function hxAxis(fmt, max){
  const a = { type:"value", inverse:true,
    splitLine:{ lineStyle:{ color:"#EDF1F7" } },
    axisLabel:{ color:"#8B98A9", fontFamily:"IBM Plex Sans Arabic", fontSize:10.5, formatter:fmt } };
  if(max!=null) a.max = max;
  return a;
}
function hyAxis(data, labelWidth){
  return { type:"category", data, position:"right", inverse:true,
    axisLine:{ lineStyle:{ color:"#DFE6EF" } }, axisTick:{ show:false },
    axisLabel:{ color:"#5D6B7E", fontFamily:"Cairo", fontSize:11,
      width: labelWidth||null, overflow: labelWidth? "truncate":"none" } };
}
/* RTL vertical charts: category x-axis reads right -> left */
function catXAxis(data, extra){
  return Object.assign({ type:"category", data, inverse:true,
    axisLine:{ lineStyle:{ color:"#DFE6EF" } }, axisTick:{ show:false },
    axisLabel:{ color:"#5D6B7E", fontFamily:"Cairo", fontSize:11 } }, extra||{});
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
  { id:"skep", name:"ركائز الاستدامة", icon:"skep" },
  { id:"initiatives", name:"المبادرات", icon:"bulb" },
  { id:"impact", name:"الأثر المالي", icon:"coins" },
  { id:"funding", name:"طلبات التمويل", icon:"doc" },
  { id:"studies", name:"الدراسات", icon:"book" },
  { id:"services", name:"الخدمات", icon:"gridic" },
  { id:"budget", name:"الميزانية والمراجعة", icon:"pie" },
  { id:"kpis", name:"مؤشرات الأداء", icon:"chartic" },
  { id:"governance", name:"الحوكمة", icon:"shield" },
  { id:"capability", name:"القدرات والثقافة", icon:"users" },
  { id:"reports", name:"التقارير", icon:"file" },
];
function renderTabbar(){
  document.getElementById("tabbar-inner").innerHTML = TABS.map(t=>
    `<button class="tab ${S.tab===t.id?"on":""}" data-tab="${t.id}" ${S.tab===t.id?'aria-current="page"':""}>${svgi(t.icon)}${t.name}</button>`
  ).join("");
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
  APP.innerHTML = R.html();
  R.mount && R.mount();
  resizeAll();
}

/* ============================================================
   TAB: home
   ============================================================ */
function kpiTile(icon, iconCls, label, value, foot){
  return `<div class="kpi lift">
    <div class="icn ${iconCls||""}">${svgi(icon)}</div>
    <div class="lbl">${label}</div>
    <div class="val">${value}</div>
    <div class="foot">${foot||""}</div>
  </div>`;
}
const RENDER = {};

RENDER.home = {
  html(){
    const ov = overallScore("self");
    const ovSim = overallScore("sim");
    const g = gradeOf(ov);
    const it = impactTotals();
    const ist = iniStats();
    const evs = evStats(allCriteria());
    const alerts = buildAlerts();
    const dLeft = daysBetween(S.data.meta.asOf, S.data.assessmentCycle.selfDue);
    const m2026 = S.data.impact.monthly2026;
    const real2026 = m2026.reduce((s,m)=>s+m.real,0);
    const tgt = S.data.meta.impactTarget2026;
    return `
    <div class="grid g4">
      ${kpiTile("skep","n","التقييم الذاتي الشامل — الدورة السابعة",
        `${ltr(n(ov,1))} <small>من 5</small>`,
        `<span class="grade" style="background:${gradeColor(g)}22;color:${gradeColor(g)}">${g}</span>
         <span>المحاكاة المستقلة: ${ltr(n(ovSim,1))}</span>`)}
      ${kpiTile("coins","","الأثر المالي المحقق 2026",
        `${ltr(n(real2026))} <small>مليون ريال</small>`,
        `<span class="st ${real2026/tgt>=0.58?"ok":"warn"}">${pct(real2026/tgt*100)} من المستهدف</span><span>المستهدف السنوي ${moneyShort(tgt)}</span>`)}
      ${kpiTile("bulb","g","الالتزام بالمبادرات التحسينية",
        `${pct(ist.commitment,1)}`,
        `<span class="st ${ist.commitment>=92?"ok":"warn"}">المستهدف ${pct(92)}</span><span>${n(ist.total)} مبادرة — ${n(ist.flagged)} متأخرة/متعثرة</span>`)}
      ${kpiTile("doc","n","اكتمال الوثائق الداعمة للركائز",
        `${pct(evs.coverage)}`,
        `<span>${n(evs.ready)} من ${n(evs.total)} وثيقة متوفرة</span>`)}
    </div>

    <div class="grid g21 mt">
      <div class="card">
        <h3>مسار الأثر المالي 2026</h3>
        <div class="subt">المخطط مقابل المحقق شهرياً (مليون ريال) — المستهدف السنوي ${moneyShort(tgt)}</div>
        <div id="ch-home-monthly" class="chart ch-290"></div>
      </div>
      <div class="card">
        <h3>الجاهزية نحو «متميز»</h3>
        <div class="subt">التقييم الذاتي مقابل مستهدف الدرجة ${ltr(n(S.data.maturity.targetScore,1))} — المنطقة الذهبية هي نطاق «متميز»</div>
        <div id="ch-home-gauge" class="chart ch-290"></div>
      </div>
    </div>

    <div class="grid g3 mt">
      <div class="card">
        <h3>نضج الركائز السبع</h3>
        <div class="subt">ذاتي / محاكاة / الدورة السادسة</div>
        <div id="ch-home-radar" class="chart ch-300"></div>
      </div>
      <div class="card">
        <h3>خط أنابيب المبادرات</h3>
        <div class="subt">عدد المبادرات في كل مرحلة من دورة الحياة</div>
        <div id="ch-home-pipe" class="chart ch-300"></div>
      </div>
      <div class="card">
        <h3>تنبيهات تتطلب الانتباه</h3>
        <div class="subt">مشتقة آلياً من بيانات المنصة</div>
        <div style="max-height:300px;overflow-y:auto">
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
        <h3>قراءة تنفيذية</h3>
        <div class="subt">أبرز الملاحظات المستخلصة من الوضع الراهن</div>
        ${homeInsights()}
      </div>
      <div class="card goldrule" style="border-top:3px solid var(--gold)">
        <h3>دورة التقييم السابعة</h3>
        <div class="subt">${esc(S.data.assessmentCycle.name)}</div>
        <div class="countdown" style="margin:10px 0 14px">
          <div class="cd-box"><b>${n(dLeft)}</b><span>يوماً للتقييم الذاتي</span></div>
          <div class="cd-box"><b>${n(daysBetween(S.data.meta.asOf, S.data.assessmentCycle.docsDue))}</b><span>يوماً لرفع الوثائق</span></div>
        </div>
        <div class="fld"><b>التقييم الذاتي</b><span>${fmtDate(S.data.assessmentCycle.selfDue)}</span></div>
        <div class="fld"><b>رفع الوثائق الداعمة</b><span>${fmtDate(S.data.assessmentCycle.docsDue)}</span></div>
        <div class="fld"><b>النتائج المتوقعة</b><span>${fmtDate(S.data.assessmentCycle.resultsExpected)}</span></div>
        <div class="fld"><b>جهة التقييم الرسمية</b><span>${esc(S.data.assessmentCycle.committee)}</span></div>
        <div class="fld"><b>محاكاة التقييم</b><span>${esc(S.data.assessmentCycle.simulation||"")}</span></div>
        <button class="btn primary mt" data-goto="skep" style="width:100%;justify-content:center">فتح لوحة الركائز</button>
      </div>
    </div>`;
  },
  mount(){
    APP.querySelectorAll("[data-goto]").forEach(el=>el.addEventListener("click",()=>go(el.dataset.goto)));
    // monthly line
    const m = S.data.impact.monthly2026;
    chart("ch-home-monthly").setOption(base({
      tooltip: Object.assign({},TT,{trigger:"axis", formatter: ps=>{
        let h = `<b>${ps[0].axisValue}</b>`;
        ps.forEach(p=>h+=ttRow(p.seriesName, `${n(p.value)} م.ر`, p.color));
        return h; }}),
      legend:{ icon:"circle", itemWidth:9, itemHeight:9, textStyle:{fontFamily:"Cairo",fontSize:11,color:"#5D6B7E"}, top:0 },
      xAxis: catXAxis(m.map(x=>x.m)),
      yAxis: valAxis(v=>n(v)),
      grid:{ top:34, bottom:26, right:46, left:12 },
      series:[
        { name:"المخطط", type:"line", data:m.map(x=>x.plan), smooth:true, symbol:"circle", symbolSize:6,
          lineStyle:{color:"#C7A34F",width:2.5,type:"dashed"}, itemStyle:{color:"#C7A34F"} },
        { name:"المحقق", type:"line", data:m.map(x=>x.real), smooth:true, symbol:"circle", symbolSize:6,
          lineStyle:{color:"#0F7A8A",width:3}, itemStyle:{color:"#0F7A8A"},
          areaStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:"rgba(15,122,138,.22)"},{offset:1,color:"rgba(15,122,138,0)"}]}} },
      ],
    }));
    // gauge
    mountScoreGauge("ch-home-gauge", overallScore("self"), gradeOf(overallScore("self")));
    // radar
    mountRadar("ch-home-radar");
    // pipeline
    const sc = statusCount();
    chart("ch-home-pipe").setOption(base({
      tooltip: Object.assign({},TT,{formatter: p=>ttRow(p.name, `${n(p.value)} مبادرة`, p.color)}),
      xAxis: hxAxis(v=>n(v)),
      yAxis: hyAxis(INI_STAGES),
      grid:{ top:12, bottom:26, right:86, left:34 },
      series:[{ type:"bar", data: INI_STAGES.map((s,i)=>({value:sc[s], itemStyle:{color:ramp(i,6), borderRadius:[6,0,0,6]}})),
        barWidth:16, label:{show:true, position:"left", fontFamily:"IBM Plex Sans Arabic", color:"#5D6B7E", formatter:p=>n(p.value)} }],
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
    <div class="insight navy">التقييم الذاتي الشامل ${ltr(n(overallScore("self"),1))} ومحاكاة التقييم المستقل ${ltr(n(overallScore("sim"),1))} من 5 — الفجوة الواقعية إلى «متميز» تُقاس على المحاكاة (${ltr(n(Math.max(0,S.data.maturity.targetScore-overallScore("sim")),1))} نقطة)، ويتركز الجهد المطلوب في ركيزتي <b>قياس الأثر</b> و<b>الأصول والمرافق</b>.</div>
    <div class="insight">تحقق ${pct(real2026/tgt*100)} من مستهدف الأثر المالي لعام 2026 حتى نهاية يوليو، مع خط أنابيب معتمد بقيمة ${money(it.approved)} يدعم بلوغ المستهدف قبل نهاية العام.</div>
    <div class="insight gold">${n(gaps)} معياراً دون درجة «متمكن» في تقييم المحاكاة المستقلة — معالجة هذه المعايير مع رفع اكتمال الوثائق (حالياً ${pct(evs.coverage)}) هي أقصر طريق لدرجة «متميز».</div>
    <div class="insight">جودة طلبات التمويل داخل سلسلة المراجعة عند ${pct(fr)} من حيث اكتمال الدراسات الخمس ودراسات السعة والطلب قبل الرفع لوزارة المالية.</div>`;
}
function mountScoreGauge(id, val, grade){
  const c = chart(id); if(!c) return;
  const tgt = S.data.maturity.targetScore;
  const sim = overallScore("sim");
  c.setOption({
    animation:false,   // stills/prints must always show the final value
    series:[{
      type:"gauge", startAngle:205, endAngle:-25, min:0, max:5, radius:"96%", center:["50%","58%"], splitNumber:5,
      progress:{ show:true, width:16, roundCap:true, itemStyle:{ color:{type:"linear",x:0,y:0,x2:1,y2:0,colorStops:[{offset:0,color:"#0A2A4A"},{offset:1,color:"#149AAD"}]} } },
      axisLine:{ lineStyle:{ width:16, color:[[tgt/5,"#EDF1F7"],[1,"rgba(199,163,79,.38)"]] } },
      pointer:{ show:true, length:"58%", width:4, itemStyle:{color:"#0A2A4A"} },
      anchor:{ show:true, size:8, itemStyle:{color:"#0A2A4A"} },
      axisTick:{ distance:-24, length:4, lineStyle:{color:"#B9C4D2"} },
      splitLine:{ distance:-28, length:8, lineStyle:{color:"#B9C4D2",width:1.5} },
      axisLabel:{ distance:-14, color:"#8B98A9", fontSize:10, fontFamily:"IBM Plex Sans Arabic" },
      detail:{ valueAnimation:false, offsetCenter:[0,"30%"],
        formatter:v=>`{v|${v.toFixed(1)}}\n{g|${grade}}\n{s|المحاكاة المستقلة ${sim.toFixed(1)} — ${gradeOf(sim)}}`,
        rich:{ v:{fontSize:30,fontWeight:700,fontFamily:"IBM Plex Sans Arabic",color:"#0A2A4A"},
               g:{fontSize:13,fontFamily:"IBM Plex Sans Arabic",fontWeight:600,color:gradeColor(grade),padding:[6,0,0,0]},
               s:{fontSize:11,fontFamily:"Cairo",color:"#5D6B7E",padding:[7,0,0,0]} } },
      data:[{value:val}],
      title:{show:false},
    }],
  });
}
function mountRadar(id){
  const c = chart(id); if(!c) return;
  const P = S.data.pillars;
  c.setOption({
    animation:!REDUCED,
    tooltip: Object.assign({},TT),
    legend:{ icon:"circle", itemWidth:9, itemHeight:9, bottom:0, textStyle:{fontFamily:"Cairo",fontSize:11,color:"#5D6B7E"} },
    radar:{
      indicator:P.map(p=>({name:p.short, max:5})),
      radius:"64%", center:["50%","47%"], splitNumber:5,
      axisName:{ color:"#5D6B7E", fontFamily:"Cairo", fontSize:11.5 },
      splitArea:{ areaStyle:{ color:["#FFFFFF","#F5F8FB"] } },
      splitLine:{ lineStyle:{ color:"#E4EAF2" } }, axisLine:{ lineStyle:{ color:"#DFE6EF" } },
    },
    series:[{ type:"radar", symbolSize:4,
      data:[
        { name:"الذاتي", value:P.map(p=>pillarScore(p,"self")), lineStyle:{color:"#0F7A8A",width:2.5}, itemStyle:{color:"#0F7A8A"}, areaStyle:{color:"rgba(15,122,138,.14)"} },
        { name:"المحاكاة", value:P.map(p=>pillarScore(p,"sim")), lineStyle:{color:"#0A2A4A",width:2}, itemStyle:{color:"#0A2A4A"} },
        { name:"الدورة 6", value:P.map(p=>pillarScore(p,"prev")), lineStyle:{color:"#C7A34F",width:1.6,type:"dashed"}, itemStyle:{color:"#C7A34F"} },
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
      <div class="pillbar" role="tablist" aria-label="وضع التقييم">
        <button class="pill ${mode==="self"?"on":""}" data-mode="self">التقييم الذاتي</button>
        <button class="pill ${mode==="sim"?"on":""}" data-mode="sim">محاكاة التقييم المستقل</button>
      </div>
      <span class="mini-note">اضغط على أي ركيزة لفتح معاييرها وتحديث الدرجات والوثائق</span>
      <div class="spacer"></div>
      <span class="grade" style="background:${gradeColor(g)}18;color:${gradeColor(g)}">الشامل: ${ltr(n(ov,1))} — ${g}</span>
    </div>

    <div class="grid g21">
      <div class="card">
        <h3>خريطة نضج الركائز السبع</h3>
        <div class="subt">درجة كل ركيزة (${mode==="self"?"التقييم الذاتي":"محاكاة التقييم المستقل"}) — الخط الذهبي المتقطع: مستهدف «متميز» ${ltr(n(S.data.maturity.targetScore,1))}</div>
        <div id="ch-skep-bars" class="chart ch-340"></div>
      </div>
      <div class="card">
        <h3>مقارنة الدورات</h3>
        <div class="subt">ذاتي / محاكاة / الدورة السادسة</div>
        <div id="ch-skep-radar" class="chart ch-340"></div>
      </div>
    </div>

    <div class="section-head"><h2>الركائز السبع — دورة حياة الإنفاق</h2>
      <span class="hint">الوثائق الداعمة: ${n(evs.ready)} متوفرة · ${n(evs.prep)} قيد الإعداد · ${n(evs.missing)} غير متوفرة</span></div>
    <div class="grid g4" style="grid-template-columns:repeat(auto-fit,minmax(205px,1fr))">
      ${S.data.pillars.map((p,i)=>{
        const s = pillarScore(p,mode); const pg = gradeOf(s);
        const pe = evStats(p.criteria);
        return `<div class="card pillar-card lift" data-pillar="${p.id}" style="border-top-color:${ramp(i,7)}">
          <div class="ph"><div class="picon">${svgi(p.icon)}</div><div><h3>${esc(p.name)}</h3><span class="owner-tag">${esc(p.owner)}</span></div></div>
          <div class="pillar-row">
            <span class="pscore">${ltr(n(s,2))}<small> / 5</small></span>
            <span class="st" style="background:${gradeColor(pg)}18;color:${gradeColor(pg)}">${pg}</span>
          </div>
          <div class="bar-mini" style="margin-top:8px"><i style="width:${s/5*100}%"></i></div>
          <div class="pillar-row"><span class="mini-note">${n(p.criteria.length)} معايير</span>
            <span class="mini-note">وثائق: ${pct(pe.coverage)}</span></div>
        </div>`;}).join("")}
    </div>

    <div class="grid g21 mt">
      <div class="card">
        <h3>مصفوفة المعايير</h3>
        <div class="subt">درجة كل معيار في وضع «${mode==="self"?"الذاتي":"المحاكاة"}» — اضغط أي خلية للتفاصيل</div>
        <div style="overflow-x:auto">${heatmapHTML(mode)}</div>
        <div class="legend-dots">${S.data.maturity.levels.map(l=>`<span><i style="background:${l.color}"></i>${l.name} (${l.n})</span>`).join("")}</div>
        <div class="mini-note" style="margin-top:6px">سلّم نضج استرشادي قابل للتهيئة — تُعاير المسميات والحدود وفق الدليل الإرشادي المعتمد لدورة التقييم.</div>
      </div>
      <div class="card">
        <h3>فجوات الوصول إلى «متميز»</h3>
        <div class="subt">المعايير دون ${ltr(n(S.data.maturity.targetScore,1))} مرتبة من الأدنى (${n(gaps.length)} معياراً)</div>
        <div style="max-height:420px;overflow-y:auto">
        ${gaps.slice(0,14).map(c=>`
          <div class="alert ${critScore(c,mode)<=2?"bad":critScore(c,mode)<4?"warn":"info"}" data-pillar="${c.pillar.id}" style="cursor:pointer">
            <div class="ai">${svgi("alertT")}</div>
            <div style="flex:1"><b>${esc(c.code)} — ${esc(c.name)}</b>
              <div class="at">${esc(c.pillar.name)} · الدرجة الحالية ${ltr(n(critScore(c,mode)))} · ${c.actions.length? esc(c.actions[0].name) : "لا توجد إجراءات مسجلة — أضف إجراء معالجة"}</div>
            </div>
            <span class="pscore" style="font-size:18px">${ltr(n(critScore(c,mode)))}</span>
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
      tooltip: Object.assign({},TT,{formatter:p=> {
        const pl = P[p.dataIndex];
        return `<b>${pl.name}</b>` + ttRow("الدرجة", n(p.value,2), p.color) + ttRow("الدورة السادسة", n(pillarScore(pl,"prev"),2)) + ttRow("عدد المعايير", n(pl.criteria.length));
      }}),
      xAxis: hxAxis(v=>n(v), 5),
      yAxis: hyAxis(P.map(p=>p.short)),
      grid:{ top:14, bottom:26, right:96, left:44 },
      series:[
        { type:"bar", barWidth:18,
          data: P.map((p,i)=>({ value:pillarScore(p,mode), itemStyle:{ color:ramp(i,7), borderRadius:[9,0,0,9] } })),
          label:{ show:true, position:"left", formatter:p=>n(p.value,2), fontFamily:"IBM Plex Sans Arabic", fontWeight:700, color:"#5D6B7E" },
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
  let h = `<table style="min-width:520px"><thead><tr><th>الركيزة</th>`;
  for(let i=0;i<maxC;i++) h+=`<th style="text-align:center">معيار ${i+1}</th>`;
  h += `</tr></thead><tbody>`;
  P.forEach(p=>{
    h += `<tr><td style="font-family:var(--ff-d);font-weight:600;white-space:nowrap">${esc(p.short)}</td>`;
    for(let i=0;i<maxC;i++){
      const c = p.criteria[i];
      if(!c){ h+=`<td style="padding:4px 5px"><div class="heat-cell" style="background:var(--line2);color:var(--faint)">—</div></td>`; continue; }
      const s = critScore(c,mode);
      const lv = S.data.maturity.levels.find(l=>l.n===Math.round(s)) || S.data.maturity.levels[0];
      h += `<td style="padding:4px 5px"><div class="heat-cell" data-pillar="${p.id}" title="${esc(c.code)} ${esc(c.name)}" style="background:${lv.color};cursor:pointer">${n(s)}</div></td>`;
    }
    h += `</tr>`;
  });
  return h + `</tbody></table>`;
}
function openPillar(pid){
  const p = S.data.pillars.find(x=>x.id===pid); if(!p) return;
  const mode = S.skepMode;
  const body = `
    <div class="fld"><b>الوصف</b><span>${esc(p.desc)}</span></div>
    <div class="fld"><b>مالك الركيزة</b><span>${esc(p.owner)}</span></div>
    <div class="fld"><b>الدرجات</b><span>ذاتي: ${ltr(n(pillarScore(p,"self"),2))} · محاكاة: ${ltr(n(pillarScore(p,"sim"),2))} · الدورة السادسة: ${ltr(n(pillarScore(p,"prev"),2))}</span></div>
    <div class="dsec"><h4>المعايير (${n(p.criteria.length)}) — اضغط الدرجة لتعديلها في وضع «${mode==="self"?"الذاتي":"المحاكاة"}»</h4>
      ${p.criteria.map((c,ci)=>`
        <div class="card" style="padding:12px 14px;margin-bottom:10px">
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
            <div><b style="font-family:var(--ff-d)">${esc(c.code)} — ${esc(c.name)}</b></div>
            <div class="score-chips" data-crit="${ci}">
              ${[1,2,3,4,5].map(v=>`<button class="sc ${critScore(c,mode)===v?"on":""}" data-score="${v}" aria-label="الدرجة ${v}">${v}</button>`).join("")}
            </div>
          </div>
          <div class="mini-note" style="margin:4px 0 8px">ذاتي: ${ltr(n(c.selfScore))} · محاكاة: ${ltr(n(c.simScore))} · الدورة السادسة: ${ltr(n(c.prevScore))} · المستهدف: ${ltr(n(c.target))}</div>
          <div class="cklist">
            ${c.evidence.map((e,ei)=>`
              <button class="ck ${e.status==="متوفر"?"y":"n"}" data-ev="${ci}:${ei}" title="اضغط لتغيير الحالة">
                <span class="box">${e.status==="متوفر"?"✓":""}</span>
                <span style="flex:1;text-align:right">${esc(e.name)}${e.updated?`<span class="owner-tag" style="display:block">نسخة ${esc(e.version||"1.0")} · ${fmtDate(e.updated)} · ${esc(e.owner||"")}</span>`:""}</span>
                <span class="st ${e.status==="متوفر"?"ok":e.status==="قيد الإعداد"?"warn":"bad"}">${e.status}</span>
              </button>`).join("")}
          </div>
          ${c.actions.length? `<div class="dsec"><h4>إجراءات المعالجة</h4>
            ${c.actions.map(a=>`<div class="fld"><b>${esc(a.name)}</b><span><span class="st ${a.status==="مكتمل"?"ok":a.status==="قيد التنفيذ"?"info":"mut"}">${esc(a.status)}</span> ${esc(a.owner)} · ${fmtDate(a.due)}</span></div>`).join("")}
          </div>`:""}
        </div>`).join("")}
    </div>`;
  openDrawer(`${p.name} — ${ltr(n(pillarScore(p,mode),2))} من 5`, body);
  const DB = document.getElementById("drawer-body");
  DB.querySelectorAll("[data-crit] [data-score]").forEach(btn=>{
    btn.addEventListener("click",()=>{
      const ci = +btn.closest("[data-crit]").dataset.crit;
      p.criteria[ci][MODES[mode]] = +btn.dataset.score;
      save(); refresh(); openPillar(pid);
      toast(`تم تحديث درجة المعيار ${p.criteria[ci].code}`);
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
    <div class="grid g4">
      ${kpiTile("bulb","","إجمالي المبادرات", `${ltr(n(ist.total))}`, `<span>${n(sc["تنفيذ"]+sc["قياس الأثر"])} قيد التنفيذ والقياس</span>`)}
      ${kpiTile("check","","نسبة الالتزام بالخط الزمني", pct(ist.commitment,1),
        `<span class="delta ${ist.commitment>=90?"up":"dn"}">المستهدف ${pct(92)}</span><span>${n(ist.flagged)} متأخرة/متعثرة</span>`)}
      ${kpiTile("coins","g","الأثر المقدر للمحفظة", `${ltr(n(it.identified))} <small>مليون ريال</small>`, `<span>المعتمد ${moneyShort(it.approved)}</span>`)}
      ${kpiTile("doc","n","متوسط طلبات التغيير", `${ltr(n(ist.crAvg,2))}`, `<span>لكل مبادرة — المستهدف: ${ltr("0.5")} أو أقل</span>`)}
    </div>

    <div class="section-head"><h2>دورة حياة المبادرات</h2>
      <span class="hint">وفق منهجية هيئة كفاءة الإنفاق: بطاقة الفرصة ← الدراسة ← الميثاق والاعتماد ← التنفيذ ← قياس الأثر ← الإقفال</span></div>
    <div class="kanban">
      ${INI_STAGES.map((st,si)=>`
        <div class="kcol"><h4>${st}<span class="cnt">${n(sc[st])}</span></h4>
          ${S.data.initiatives.filter(i=>i.status===st).map(i=>`
            <div class="kcard" data-ini="${i.id}">
              <div class="kn">${esc(i.name)}</div>
              <div class="km">
                <span>${esc(progShort(i.program))}</span>
                <span class="kv">${moneyShort(i.status==="فرصة"||i.status==="دراسة"? i.estImpact : (i.realizedImpact||i.approvedImpact||i.estImpact))}</span>
              </div>
              ${i.flag? `<div style="margin-top:5px"><span class="st ${i.flag==="متعثرة"?"bad":"warn"}">${i.flag}</span></div>`:""}
            </div>`).join("") || '<div class="mini-note" style="padding:8px 4px;text-align:center">—</div>'}
        </div>`).join("")}
    </div>

    <div class="section-head"><h2>سجل المبادرات</h2></div>
    <div class="card">
      <div class="toolbar">
        <input class="fsearch" id="ini-q" placeholder="بحث بالاسم أو الفئة أو المالك…" value="${esc(f.iniQ)}">
        <select class="fsel" id="ini-status">
          ${["الكل",...INI_STAGES,"متأخرة/متعثرة"].map(s=>`<option ${f.iniStatus===s?"selected":""}>${s}</option>`).join("")}
        </select>
        <select class="fsel" id="ini-program">
          <option ${f.iniProgram==="الكل"?"selected":""} value="الكل">كل البرامج</option>
          ${S.data.programs.map(p=>`<option value="${p.id}" ${f.iniProgram===p.id?"selected":""}>${esc(p.name)}</option>`).join("")}
        </select>
        <div class="spacer"></div>
        <button class="btn primary" id="ini-add">${svgi("bulb")} مبادرة جديدة</button>
      </div>
      <div class="tblwrap">
        <table>
          <thead><tr><th>الرمز</th><th>المبادرة</th><th>البرنامج</th><th>الفئة</th><th>نوع الأثر</th><th>المرحلة</th><th>الأثر المقدر</th><th>المحقق</th><th>التقدم</th></tr></thead>
          <tbody>
            ${list.map(i=>`
              <tr class="clickable" data-ini="${i.id}">
                <td class="num">${esc(i.id)}</td>
                <td style="max-width:280px"><b style="font-family:var(--ff-d);font-size:12px">${esc(i.name)}</b>${i.flag?` <span class="st ${i.flag==="متعثرة"?"bad":"warn"}">${i.flag}</span>`:""}</td>
                <td>${esc(progName(i.program))}</td>
                <td>${esc(i.category)}</td>
                <td><span class="st ${i.impactType==="وفر مباشر"?"teal":i.impactType==="تجنب تكلفة"?"navy":"gold"}">${esc(i.impactType)}</span></td>
                <td><span class="st ${i.status==="مقفلة"?"ok":i.status==="تنفيذ"||i.status==="قياس الأثر"?"info":"mut"}">${esc(i.status)}</span></td>
                <td class="num">${n(i.estImpact)}</td>
                <td class="num">${n(i.realizedImpact)}</td>
                <td><div class="bar-mini"><i style="width:${i.progress}%"></i></div></td>
              </tr>`).join("") || `<tr><td colspan="9" class="empty">لا توجد نتائج مطابقة</td></tr>`}
          </tbody>
        </table>
      </div>
      <div class="mini-note mt">القيم بالمليون ريال. المبادرات المقفلة اعتُمد أثرها المالي من الشؤون المالية واللجنة التوجيهية.</div>
    </div>

    <div class="section-head"><h2>قاعدة بيانات مبادرات الجهات الحكومية (مرجعية)</h2>
      <span class="hint">المخرج الخامس — ممارسات مطبقة مصنفة حسب الفئات مع مصادر الهدر وآلية احتساب الأثر (أنواع الجهات معمّاة للعرض)</span></div>
    <div class="card">
      <div class="tblwrap">
        <table>
          <thead><tr><th>الفئة</th><th>نوع الجهة</th><th>المبادرة</th><th>مصدر الهدر</th><th>آلية المعالجة</th><th>آلية احتساب الأثر</th><th>الأثر المرجعي</th></tr></thead>
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
      ${INI_STAGES.map((st,k)=>`<div class="step ${k<si?"done":k===si?"cur":""}"><div class="dotp">${k<si?"✓":k+1}</div><span>${st}</span></div>`).join("")}
    </div>
    ${i.flag? `<div class="alert ${i.flag==="متعثرة"?"bad":"warn"}"><div class="ai">${svgi("alertT")}</div><div><b>${i.flag}</b><div class="at">${esc(i.note||"")}</div></div></div>`:""}
    <div class="fld"><b>البرنامج</b><span>${esc(progName(i.program))}</span></div>
    <div class="fld"><b>الفئة / نوع الأثر</b><span>${esc(i.category)} · ${esc(i.impactType)}</span></div>
    <div class="fld"><b>المالك</b><span>${esc(i.owner)}</span></div>
    <div class="fld"><b>الفترة</b><span>${fmtDate(i.start)} ← ${fmtDate(i.end)}</span></div>
    <div class="fld"><b>نسبة الإنجاز</b><span>${pct(i.progress)}</span></div>
    <div class="dsec"><h4>بطاقة الفرصة</h4>
      <div class="fld"><b>مصدر الهدر</b><span>${esc(i.wasteSource)}</span></div>
      <div class="fld"><b>آلية المعالجة</b><span>${esc(i.treatment)}</span></div>
      <div class="fld"><b>خط الأساس</b><span>${esc(i.baselineMethod)}</span></div>
    </div>
    <div class="dsec"><h4>الأثر المالي (مليون ريال)</h4>
      <div class="fld"><b>المقدر</b><span class="num">${n(i.estImpact)}</span></div>
      <div class="fld"><b>المعتمد من المالية</b><span class="num">${n(i.approvedImpact)}</span></div>
      <div class="fld"><b>المحقق</b><span class="num">${n(i.realizedImpact)}</span></div>
      <div class="fld"><b>التحقق المالي</b><span><span class="st ${i.financeValidated?"ok":"warn"}">${i.financeValidated?"معتمد من الشؤون المالية":"بانتظار التحقق المالي"}</span></span></div>
      <div class="fld"><b>طلبات التغيير</b><span class="num">${n(i.changeRequests)}</span></div>
    </div>
    ${i.charter? `<div class="dsec"><h4>ميثاق المبادرة</h4>
      <div class="fld"><b>الهدف</b><span>${esc(i.charter.objective)}</span></div>
      <div class="fld"><b>الأنشطة الرئيسية</b><span>${i.charter.activities.map(esc).join("؛ ")}</span></div>
      <div class="fld"><b>المخاطر</b><span>${esc(i.charter.risks)}</span></div>
      <div class="fld"><b>البيانات المطلوبة</b><span>${esc(i.charter.dataNeeded)}</span></div>
      <div class="fld"><b>آلية قياس الأثر</b><span>${esc(i.charter.mechanism)}</span></div>
    </div>`:""}
    ${i.docs? `<div class="dsec"><h4>وثائق المبادرة</h4>
      <div class="cklist">${i.docs.map(d=>`
        <div class="ck ${d.status==="متوفر"?"y":"n"}"><span class="box">${d.status==="متوفر"?"✓":""}</span>
        <span style="flex:1">${esc(d.name)}</span>
        <span class="st ${d.status==="متوفر"?"ok":d.status==="قيد الإعداد"?"warn":"bad"}">${d.status}</span></div>`).join("")}
      </div>
    </div>`:""}
    ${i.note && !i.flag? `<div class="dsec"><h4>ملاحظات</h4><div class="mini-note">${esc(i.note)}</div></div>`:""}
    <div class="dsec" style="display:flex;gap:8px;flex-wrap:wrap">
      ${canAdvance? `<button class="btn primary" id="d-advance" ${gateBlocked?"disabled style='opacity:.5;cursor:not-allowed'":""}>ترقية إلى «${nextStage}»</button>`:""}
      ${!i.financeValidated? `<button class="btn ghost" id="d-validate">تأكيد التحقق المالي</button>`:""}
      <button class="btn ghost" id="d-edit">تعديل البيانات</button>
      ${i.flag? `<button class="btn ghost" id="d-unflag">إزالة راية «${i.flag}»</button>`:""}
    </div>
    ${gateBlocked? `<div class="mini-note mt">⚠ ${gateMsg}</div>`:""}`;
  openDrawer(`${i.id} — ${i.name}`, body);
  const el = id2=>document.getElementById(id2);
  if(el("d-advance")) el("d-advance").addEventListener("click",()=>{
    if(gateBlocked) return;
    i.status = nextStage;
    if(nextStage==="مقفلة") i.progress = 100;
    save(); refresh(); openIni(id); toast(`تم ترقية المبادرة إلى «${nextStage}»`);
  });
  if(el("d-validate")) el("d-validate").addEventListener("click",()=>{
    i.financeValidated = true;
    if(!i.approvedImpact && i.estImpact) i.approvedImpact = Math.round(i.estImpact*0.9);
    save(); refresh(); openIni(id); toast("تم تسجيل التحقق المالي");
  });
  if(el("d-unflag")) el("d-unflag").addEventListener("click",()=>{
    i.flag = null; save(); refresh(); openIni(id); toast("تمت إزالة الراية");
  });
  if(el("d-edit")) el("d-edit").addEventListener("click",()=>{ closeDrawer(); iniForm(i); });
}
function iniForm(i){
  const isNew = !i;
  const d = i || { id:nextIniId(), name:"", program:S.data.programs[0].id, category:"مشتريات", impactType:"وفر مباشر",
    status:"فرصة", flag:null, estImpact:0, approvedImpact:0, realizedImpact:0, financeValidated:false,
    changeRequests:0, progress:0, owner:"", wasteSource:"", treatment:"", baselineMethod:"",
    start:S.data.meta.asOf, end:"", note:"" };
  openModal(isNew? "مبادرة جديدة — بطاقة الفرصة" : `تعديل ${d.id}`, `
    <div class="frow one"><div class="fgrp"><label>اسم المبادرة *</label><input id="f-name" value="${esc(d.name)}"></div></div>
    <div class="frow">
      <div class="fgrp"><label>البرنامج</label><select id="f-program">${S.data.programs.map(p=>`<option value="${p.id}" ${d.program===p.id?"selected":""}>${esc(p.name)}</option>`).join("")}</select></div>
      <div class="fgrp"><label>الفئة</label><select id="f-cat">${["مشتريات","مشاريع","أصول ومرافق","خدمات","طاقة وموارد","رقمنة","إيرادات"].map(c=>`<option ${d.category===c?"selected":""}>${c}</option>`).join("")}</select></div>
    </div>
    <div class="frow">
      <div class="fgrp"><label>نوع الأثر</label><select id="f-itype">${["وفر مباشر","تجنب تكلفة","تعظيم إيراد"].map(c=>`<option ${d.impactType===c?"selected":""}>${c}</option>`).join("")}</select></div>
      <div class="fgrp"><label>المرحلة</label><select id="f-status">${INI_STAGES.map(c=>`<option ${d.status===c?"selected":""}>${c}</option>`).join("")}</select></div>
    </div>
    <div class="frow">
      <div class="fgrp"><label>الأثر المقدر (م.ر)</label><input id="f-est" type="number" min="0" value="${d.estImpact}"></div>
      <div class="fgrp"><label>المالك</label><input id="f-owner" value="${esc(d.owner)}"></div>
    </div>
    <div class="frow">
      <div class="fgrp"><label>تاريخ البداية (يوم / شهر / سنة)</label><input id="f-start" type="date" value="${d.start}"></div>
      <div class="fgrp"><label>تاريخ النهاية (يوم / شهر / سنة)</label><input id="f-end" type="date" value="${d.end}"></div>
    </div>
    <div class="frow one"><div class="fgrp"><label>مصدر الهدر</label><input id="f-waste" value="${esc(d.wasteSource)}"></div></div>
    <div class="frow one"><div class="fgrp"><label>آلية المعالجة</label><input id="f-treat" value="${esc(d.treatment)}"></div></div>
    <div class="frow one"><div class="fgrp"><label>خط الأساس وطريقة الاحتساب</label><input id="f-base" value="${esc(d.baselineMethod)}"></div></div>
    <div class="frow one"><div class="fgrp"><label>ملاحظات</label><textarea id="f-note">${esc(d.note||"")}</textarea></div></div>
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
        toast(isNew? `تمت إضافة المبادرة ${d.id}` : "تم حفظ التعديلات");
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
    <div class="grid g4">
      ${kpiTile("bulb","","أثر محدد (خط الأنابيب)", `${ltr(n(it.identified))} <small>مليون ريال</small>`, `<span>${n(S.data.initiatives.length)} مبادرة وفرصة</span>`)}
      ${kpiTile("check","","أثر معتمد من المالية", `${ltr(n(it.approved))} <small>مليون ريال</small>`, `<span>${pct(it.identified? it.approved/it.identified*100:0)} من المحدد</span>`)}
      ${kpiTile("coins","g","أثر محقق تراكمي", `${ltr(n(it.realized))} <small>مليون ريال</small>`, `<span>منه ${moneyShort(it.documented)} موثق بالإقفال</span>`)}
      ${kpiTile("gauge","n","نسبة الأثر من الميزانية المعتمدة 2026", pct(share,1), `<span>محقق 2026: ${moneyShort(real2026)} من ميزانية ${moneyShort(S.data.meta.budgetApproved)}</span>`)}
    </div>

    <div class="grid g21 mt">
      <div class="card">
        <h3>شلال بناء الأثر المالي</h3>
        <div class="subt">من الأثر المحدد إلى الموثق (مليون ريال) — منهجية: وفر مباشر، تجنب تكلفة، تعظيم إيراد</div>
        <div id="ch-imp-water" class="chart ch-340"></div>
      </div>
      <div class="card">
        <h3>الأثر حسب النوع</h3>
        <div class="subt">محقق مقابل محدد</div>
        <div id="ch-imp-type" class="chart ch-340"></div>
      </div>
    </div>

    <div class="grid g2 mt">
      <div class="card">
        <h3>الأثر حسب البرنامج</h3>
        <div class="subt">محقق ومتبقٍ من المحدد (مليون ريال)</div>
        <div id="ch-imp-prog" class="chart ch-300"></div>
      </div>
      <div class="card">
        <h3>الأثر حسب الفئة</h3>
        <div class="subt">محقق ومتبقٍ من المحدد (مليون ريال)</div>
        <div id="ch-imp-cat" class="chart ch-300"></div>
      </div>
    </div>

    <div class="section-head"><h2>سجل الوفورات المعتمد</h2>
      <span class="hint">لا يُدرج أثر إلا بعد التحقق المالي — خفض مستوى الخدمة لا يُعد وفراً</span></div>
    <div class="card">
      <div class="tblwrap">
        <table>
          <thead><tr><th>المبادرة</th><th>النوع</th><th>خط الأساس</th><th>معتمد</th><th>محقق</th><th>التحقق المالي</th><th>الحالة</th></tr></thead>
          <tbody>
            ${S.data.initiatives.filter(i=>i.approvedImpact>0 || i.realizedImpact>0).map(i=>`
              <tr class="clickable" data-ini="${i.id}">
                <td style="max-width:300px"><b style="font-family:var(--ff-d);font-size:12px">${esc(i.name)}</b></td>
                <td><span class="st ${i.impactType==="وفر مباشر"?"teal":i.impactType==="تجنب تكلفة"?"navy":"gold"}">${esc(i.impactType)}</span></td>
                <td style="max-width:220px;font-size:11.5px;color:var(--muted)">${esc(i.baselineMethod)}</td>
                <td class="num">${n(i.approvedImpact)}</td>
                <td class="num"><b>${n(i.realizedImpact)}</b></td>
                <td>${i.financeValidated? '<span class="st ok">معتمد</span>':'<span class="st warn">قيد التحقق</span>'}</td>
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
      { name:"الأثر المحدد", base:0, val:identified, color:"#5D6B7E" },
      { name:"قيد الدراسة/الاعتماد", base:approved, val:identified-approved, color:"#B9C4D2" },
      { name:"المعتمد", base:0, val:approved, color:"#0A2A4A" },
      { name:"المحقق", base:0, val:realized, color:"#0F7A8A" },
      { name:"الموثق بالإقفال", base:0, val:doc, color:"#C7A34F" },
    ];
    chart("ch-imp-water").setOption(base({
      tooltip: Object.assign({},TT,{formatter:p=> p.seriesIndex===1? `<b>${p.name}</b>`+ttRow("القيمة",`${n(steps[p.dataIndex].val)} م.ر`, steps[p.dataIndex].color):""}),
      xAxis: catXAxis(steps.map(s=>s.name), { axisLabel:{color:"#5D6B7E",fontFamily:"Cairo",fontSize:11,interval:0} }),
      yAxis: valAxis(v=>n(v)),
      grid:{ top:24, bottom:30, right:50, left:14 },
      series:[
        { type:"bar", stack:"w", itemStyle:{color:"transparent"}, emphasis:{itemStyle:{color:"transparent"}}, data:steps.map(s=>s.base), barWidth:44, silent:true },
        { type:"bar", stack:"w", data:steps.map(s=>({value:s.val, itemStyle:{color:s.color, borderRadius:[7,7,0,0]}})),
          label:{show:true, position:"top", fontFamily:"IBM Plex Sans Arabic", fontWeight:700, color:"#5D6B7E", formatter:p=>n(steps[p.dataIndex].val)} },
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
      tooltip: Object.assign({},TT,{trigger:"axis", formatter:ps=>{
        let h=`<b>${ps[0].axisValue}</b>`; ps.forEach(p=>h+=ttRow(p.seriesName,`${n(p.value)} م.ر`,p.color)); return h; }}),
      legend:{ icon:"circle", itemWidth:9, itemHeight:9, top:0, textStyle:{fontFamily:"Cairo",fontSize:11,color:"#5D6B7E"} },
      xAxis: hxAxis(v=>n(v)),
      yAxis: hyAxis(types),
      grid:{ top:34, bottom:26, right:90, left:20 },
      series:[
        { name:"محقق", type:"bar", stack:"t", barWidth:20, color:"#0F7A8A", data:types.map(t=>bt[t].realized) },
        { name:"متبقٍ من المحدد", type:"bar", stack:"t", color:"#DCE5EE", data:types.map(t=>({value:Math.max(0,bt[t].identified-bt[t].realized), itemStyle:{borderRadius:[6,0,0,6]}})) },
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
        tooltip: Object.assign({},TT,{trigger:"axis", formatter:ps=>{
          let h=`<b>${ps[0].axisValue}</b>`; ps.forEach(p=>h+=ttRow(p.seriesName,`${n(p.value)} م.ر`,p.color)); return h; }}),
        legend:{ icon:"circle", itemWidth:9, itemHeight:9, top:0, textStyle:{fontFamily:"Cairo",fontSize:11,color:"#5D6B7E"} },
        xAxis: hxAxis(v=>n(v)),
        yAxis: hyAxis(rows.map(r=>r[0]), 155),
        grid:{ top:34, bottom:26, right:168, left:20 },
        series:[
          { name:"محقق", type:"bar", stack:"s", barWidth:13, color:"#0F7A8A", data:rows.map(r=>r[1].realized) },
          { name:"متبقٍ", type:"bar", stack:"s", color:"#DCE5EE", data:rows.map(r=>({value:Math.max(0,r[1].identified-r[1].realized), itemStyle:{borderRadius:[6,0,0,6]}})) },
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
    <div class="grid g4">
      ${kpiTile("doc","","طلبات التمويل المسجلة", `${ltr(n(FR.length))}`, `<span>بقيمة إجمالية ${money(total)}</span>`)}
      ${kpiTile("check","","اكتمال متطلبات الطلبات المسجلة", pct(comp), `<span class="st ${comp>=80?"ok":"warn"}">جودة الاستلام</span><span>بوابة الدخول تضمن 100% داخل سلسلة المراجعة</span>`)}
      ${kpiTile("clock","g","طلبات معادة للاستكمال", `${ltr(n(returned))}`, `<span>تتطلب استيفاء الملاحظات قبل إعادة الدخول</span>`)}
      ${kpiTile("coins","n","طلبات معتمدة", `${ltr(n(approved))}`, `<span>${money(FR.filter(r=>r.stage==="معتمد").reduce((s,r)=>s+r.amount,0))}</span>`)}
    </div>

    <div class="section-head"><h2>لائحة التعقب — سلسلة المراجعة الرباعية</h2>
      <span class="hint">المقيّم ← قائد الفريق ← الشؤون المالية ← المسؤول الأول، مع بوابة اكتمال الدراسات</span>
      <button class="btn primary" id="fr-add">${svgi("doc")} طلب تمويل جديد</button></div>
    <div class="card">
      <div class="tblwrap">
        <table>
          <thead><tr><th>الرمز</th><th>الطلب</th><th>البرنامج</th><th>النوع</th><th>القيمة (م.ر)</th><th>اكتمال الدراسات</th><th>المرحلة</th></tr></thead>
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
      <div class="mini-note mt">بوابة الاكتمال: لا يدخل الطلب سلسلة المراجعة إلا باكتمال الدراسات الخمس (الاستراتيجية، الاقتصادية، التجارية، المالية، الإدارية) ودراسة السعة والطلب ووثيقتي النطاق والقيمة — وفق تعليمات تنفيذ الميزانية ومتطلبات هيئة كفاءة الإنفاق والمشروعات الحكومية.
      مرحلة «مرفوع لوزارة المالية» امتداد خاص بالهيئة لطلبات الميزانية الجديدة؛ وبعد الاعتماد يُؤرشف الطلب وتُحدَّث لائحة التعقب وفق النموذج التشغيلي.</div>
    </div>`;
  },
  mount(){
    APP.querySelectorAll("[data-fr]").forEach(el=>el.addEventListener("click",()=>openFR(el.dataset.fr)));
    document.getElementById("fr-add").addEventListener("click",()=>{
      openModal("طلب تمويل جديد", `
        <div class="frow one"><div class="fgrp"><label>اسم الطلب *</label><input id="nf-name"></div></div>
        <div class="frow">
          <div class="fgrp"><label>البرنامج</label><select id="nf-program">${S.data.programs.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("")}</select></div>
          <div class="fgrp"><label>النوع</label><select id="nf-type"><option>رأسمالي</option><option>تشغيلي</option></select></div>
        </div>
        <div class="frow one"><div class="fgrp"><label>القيمة (مليون ريال) *</label><input id="nf-amount" type="number" min="1"></div></div>
        <div class="mini-note">يُسجل الطلب في مرحلة «الإعداد»؛ وتُستكمل الدراسات الخمس ودراسة السعة والطلب من بطاقة الطلب قبل دخول سلسلة المراجعة.</div>
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
    ...Object.entries(r.fiveStudies).map(([k,v])=>({key:`fs:${k}`, label:`الدراسة ال${k}`, val:v})),
    {key:"cd", label:"دراسة السعة والطلب", val:r.cdStudy},
    {key:"scope", label:"وثيقة نطاق العمل", val:r.scopeDoc},
    {key:"value", label:"قيمة التمويل ومبرراتها", val:r.valueDoc},
  ];
  const body = `
    <div class="stepper" style="margin-bottom:14px">
      ${FR_CHAIN.map((st,k)=>`<div class="step ${chainIdx>k?"done":chainIdx===k?"cur":""}"><div class="dotp">${chainIdx>k?"✓":k+1}</div><span>${st}</span></div>`).join("")}
    </div>
    ${r.stage==="معاد للاستكمال"? `<div class="alert bad"><div class="ai">${svgi("alertT")}</div><div><b>معاد للاستكمال</b><div class="at">${esc(r.note||"")}</div></div></div>`:""}
    <div class="fld"><b>البرنامج</b><span>${esc(progName(r.program))}</span></div>
    <div class="fld"><b>النوع</b><span>${esc(r.type)}</span></div>
    <div class="fld"><b>القيمة</b><span>${money(r.amount)}</span></div>
    ${r.note && r.stage!=="معاد للاستكمال"? `<div class="fld"><b>ملاحظات</b><span>${esc(r.note)}</span></div>`:""}
    <div class="dsec"><h4>بوابة اكتمال المتطلبات — اضغط لتحديث الحالة</h4>
      <div class="cklist">
        ${checks.map(c=>`<button class="ck ${c.val?"y":"n"}" data-ck="${c.key}"><span class="box">${c.val?"✓":""}</span><span style="flex:1;text-align:right">${c.label}</span></button>`).join("")}
      </div>
    </div>
    <div class="dsec" style="display:flex;gap:8px;flex-wrap:wrap">
      ${r.stage==="الإعداد"||r.stage==="معاد للاستكمال" ?
        `<button class="btn primary" id="fr-submit" ${!complete?"disabled style='opacity:.5;cursor:not-allowed' title='استكمال المتطلبات أولاً'":""}>إدخال في سلسلة المراجعة</button>`:
       chainIdx>=1 && chainIdx<FR_CHAIN.length-1 ?
        `<button class="btn primary" id="fr-advance">ترقية إلى «${FR_CHAIN[chainIdx+1]}»</button>
         <button class="btn danger" id="fr-return">إعادة للاستكمال</button>`:""}
    </div>
    ${!complete && (r.stage==="الإعداد"||r.stage==="معاد للاستكمال")? `<div class="mini-note mt">⚠ البوابة مغلقة: يجب اكتمال المتطلبات الثمانية قبل دخول سلسلة المراجعة.</div>`:""}`;
  openDrawer(`${r.id} — ${r.name}`, body);
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
    save(); refresh(); openFR(id); toast("دخل الطلب سلسلة المراجعة");
  });
  if(el("fr-advance")) el("fr-advance").addEventListener("click",()=>{
    if(!frComplete(r)){ toast("لا يمكن الترقية — أعد الطلب للاستكمال لمعالجة النواقص"); return; }
    r.stage = FR_CHAIN[chainIdx+1];
    save(); refresh(); openFR(id); toast(`تمت الترقية إلى «${r.stage}»`);
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
    const avg = t=>{
      const l = S.data.studies.filter(s=>t==="الكل"||s.type===t);
      return l.length? Math.round(l.reduce((x,s)=>x+s.completeness,0)/l.length):0;
    };
    return `
    <div class="grid g4">
      ${kpiTile("book","","إجمالي الدراسات", `${ltr(n(S.data.studies.length))}`, `<span>${n(S.data.studies.filter(s=>s.status==="معتمدة"||s.status==="مكتملة").length)} معتمدة/مكتملة</span>`)}
      ${kpiTile("gauge","","متوسط اكتمال دراسات السعة والطلب", pct(avg("سعة وطلب")), `<span>منهجية السبع خطوات حسب فئة الأصول</span>`)}
      ${kpiTile("doc","n","متوسط اكتمال الدراسات الخمس", pct(avg("الدراسات الخمس")), `<span>النموذج الخماسي للجدوى</span>`)}
      ${kpiTile("bulb","g","دراسات الهندسة القيمية", `${ltr(n(S.data.studies.filter(s=>s.type==="هندسة قيمية").length))}`, `<span>وفق منهجية SAVE ومراحل العمل الثماني</span>`)}
    </div>

    <div class="section-head"><h2>سجل الدراسات</h2>
      <span class="hint">أتمتة إعداد ومتابعة دراسات السعة والطلب والدراسات الخمس — المسار الثالث من نطاق العمل</span></div>
    <div class="card">
      <div class="toolbar">
        <div class="pillbar">
          ${types.map(t=>`<button class="pill ${f===t?"on":""}" data-stype="${t}">${t}</button>`).join("")}
        </div>
      </div>
      <div class="tblwrap">
        <table>
          <thead><tr><th>الرمز</th><th>الدراسة</th><th>النوع</th><th>فئة الأصول</th><th>البرنامج</th><th>الاكتمال</th><th>الحالة</th></tr></thead>
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
        <h3>تغطية الدراسات حسب فئة الأصول</h3>
        <div class="subt">عدد الدراسات لكل فئة</div>
        <div id="ch-st-class" class="chart ch-260"></div>
      </div>
      <div class="card">
        <h3>مكتبة المنهجيات والأدلة الاسترشادية</h3>
        <div class="subt">المسار الثاني — 13 منهجية معتمدة أو قيد التطوير مع أدلتها التفصيلية</div>
        <div class="cklist" style="margin-top:6px;max-height:300px;overflow-y:auto">
          ${(S.data.methodologies||[]).map(m=>`
            <div class="ck ${m.status==="مفعّلة"?"y":"n"}"><span class="box">${m.status==="مفعّلة"?"✓":""}</span>
            <span style="flex:1">${esc(m.name)}<span class="owner-tag" style="display:block">نسخة ${esc(m.version)} · ${esc(m.guide)}</span></span>
            <span class="st ${m.status==="مفعّلة"?"ok":"warn"}">${esc(m.status)}</span></div>`).join("")}
        </div>
      </div>
    </div>

    <div class="section-head"><h2>المقارنات المعيارية بمساعدة الذكاء الاصطناعي</h2>
      <span class="hint">نموذج أولي — المسار الثالث: توظيف الذكاء الاصطناعي في إعداد المقارنات المعيارية واحتساب السعة والطلب وتحديد مصادر البيانات</span></div>
    <div class="card goldrule">
      <div class="insight gold" style="margin-bottom:12px">${esc((S.data.aiBenchmarks||{}).note||"")}</div>
      <div class="tblwrap">
        <table>
          <thead><tr><th>فئة الأصول</th><th>البند المرجعي</th><th>متوسط تكلفة الوحدة بالهيئة</th><th>النطاق المرجعي</th><th>مصدر البيانات</th></tr></thead>
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
      <div class="mini-note mt">المخرجات المولدة بمساعدة الذكاء الاصطناعي مسودات استرشادية — الاعتماد النهائي للمختصين وفريق كفاءة الإنفاق.</div>
    </div>`;
  },
  mount(){
    APP.querySelectorAll("[data-stype]").forEach(b=>b.addEventListener("click",()=>{ S.filters.studyType=b.dataset.stype; refresh(); }));
    const m = {};
    S.data.studies.forEach(s=>{ m[s.assetClass]=(m[s.assetClass]||0)+1; });
    const rows = Object.entries(m).sort((a,b)=>b[1]-a[1]);
    chart("ch-st-class").setOption(base({
      tooltip: Object.assign({},TT,{formatter:p=>ttRow(p.name,`${n(p.value)} دراسات`,p.color)}),
      xAxis: hxAxis(v=>n(v)),
      yAxis: hyAxis(rows.map(r=>r[0]), 130),
      grid:{ top:12, bottom:26, right:142, left:34 },
      series:[{ type:"bar", barWidth:14, data:rows.map((r,i)=>({value:r[1], itemStyle:{color:ramp(i,rows.length), borderRadius:[6,0,0,6]}})),
        label:{show:true, position:"left", fontFamily:"IBM Plex Sans Arabic", color:"#5D6B7E", formatter:p=>n(p.value)} }],
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
    <div class="grid g4">
      ${kpiTile("gridic","","خدمات الدليل المعتمد", `${ltr(n(S.data.services.length))}`, `<span>تكلفة سنوية ${money(totalCost)}</span>`)}
      ${kpiTile("check","","متوسط جودة الخدمة", `${ltr(n(avgQ))} <small>/ 100</small>`, `<span class="delta ${avgQ>=85?"up":"fl"}">المستهدف ${ltr("85")}</span>`)}
      ${kpiTile("chartic","n","النسبة الرقمية المرجحة", pct(digital), `<span>من إجمالي المعاملات</span>`)}
      ${kpiTile("alertT","g","خدمات تحتاج تحسيناً", `${ltr(n(needs))}`, `<span>ضمن خطة الارتقاء بتصنيف الجودة</span>`)}
    </div>

    <div class="grid g21 mt">
      <div class="card">
        <h3>التكلفة مقابل الجودة</h3>
        <div class="subt">كل نقطة خدمة — الحجم يمثل التكلفة الإجمالية، اضغط نقطة للتفاصيل</div>
        <div id="ch-svc-scatter" class="chart ch-340"></div>
      </div>
      <div class="card">
        <h3>تصنيف جودة الخدمات</h3>
        <div class="subt">وفق منهجية مراجعة الخدمات</div>
        <div id="ch-svc-class" class="chart ch-340"></div>
      </div>
    </div>

    <div class="section-head"><h2>دليل الخدمات والتكاليف</h2>
      <span class="hint">تطوير دليل خدمات الهيئة واحتساب تكلفتها — متطلب أساسي في المسار الأول</span></div>
    <div class="card">
      <div class="toolbar">
        <input class="fsearch" id="svc-q" placeholder="بحث في الخدمات…" value="${esc(S.filters.svcQ)}">
      </div>
      <div class="tblwrap">
        <table>
          <thead><tr><th>الخدمة</th><th>القطاع</th><th>القناة</th><th>تكلفة المعاملة (ألف ريال)</th><th>الحجم السنوي</th><th>التكلفة الإجمالية (م.ر)</th><th>الجودة</th><th>نقاط المراجعة</th><th>التصنيف</th></tr></thead>
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
      <div class="mini-note mt">كل مؤشر تكلفة وحدة مقرون بمؤشر جودة — خفض التكلفة مع تراجع الجودة لا يُحتسب تحسناً وفق إطار جودة الإنفاق.</div>
    </div>`;
  },
  mount(){
    const q = document.getElementById("svc-q");
    q.addEventListener("input",()=>{ S.filters.svcQ=q.value; refreshKeepFocus("svc-q"); });
    const cls = {"ممتاز":"#1E7F5C","جيد":"#3A6EA5","يحتاج تحسين":"#C88A16"};
    chart("ch-svc-scatter").setOption(base({
      tooltip: Object.assign({},TT,{formatter:p=>{
        const s = S.data.services[p.dataIndex];
        return `<b>${s.name}</b>` + ttRow("تكلفة المعاملة",`${n(s.unitCost,1)} ألف ريال`) + ttRow("الجودة",n(s.qualityScore)) + ttRow("التكلفة الإجمالية",`${n(s.totalCost,1)} م.ر`) + ttRow("التصنيف",s.classification);
      }}),
      xAxis: Object.assign(valAxis(v=>n(v)), { name:"الجودة", inverse:true, nameLocation:"start", nameGap:8, nameTextStyle:{fontFamily:"Cairo",color:"#8B98A9"}, min:60, max:100, position:"bottom" }),
      yAxis: Object.assign(valAxis(v=>n(v)), { name:"تكلفة المعاملة (ألف ريال)", nameGap:16, nameTextStyle:{fontFamily:"Cairo",color:"#8B98A9",align:"left"} }),
      grid:{ top:44, bottom:44, right:64, left:24 },
      series:[{ type:"scatter",
        data:S.data.services.map(s=>({ value:[s.qualityScore, s.unitCost], symbolSize:Math.max(10,Math.sqrt(s.totalCost)*4),
          itemStyle:{ color:cls[s.classification]+"CC", borderColor:cls[s.classification], borderWidth:1.5 } })) }],
    }));
    const cc = {"ممتاز":0,"جيد":0,"يحتاج تحسين":0};
    S.data.services.forEach(s=>cc[s.classification]++);
    chart("ch-svc-class").setOption(base({
      tooltip: Object.assign({},TT,{formatter:p=>ttRow(p.name,`${n(p.value)} خدمات`,p.color)}),
      xAxis: hxAxis(v=>n(v)),
      yAxis: hyAxis(Object.keys(cc)),
      grid:{ top:12, bottom:26, right:110, left:34 },
      series:[{ type:"bar", barWidth:22,
        data:Object.entries(cc).map(([k,v])=>({value:v, itemStyle:{color:cls[k], borderRadius:[7,0,0,7]}})),
        label:{show:true, position:"left", fontFamily:"IBM Plex Sans Arabic", fontWeight:700, color:"#5D6B7E", formatter:p=>n(p.value)} }],
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
    <div class="grid g4">
      ${kpiTile("pie","","الميزانية المعتمدة 2026", `${ltr(n(total/1000,1))} <small>مليار ريال</small>`, `<span>${n(B.length)} أبواب رئيسية</span>`)}
      ${kpiTile("chartic","","نسبة المنصرف حتى تاريخه", pct(spent/total*100), `<span>${money(spent)} حتى ${fmtDate(S.data.meta.asOf)}</span>`)}
      ${kpiTile("book","n","تغطية مراجعات الإنفاق", `${ltr(n(reviewed))} <small>من ${n(B.length)}</small>`, `<span>وفق منهجية هيئة كفاءة الإنفاق</span>`)}
      ${kpiTile("bulb","g","فرص كفاءة محددة من المراجعات", `${ltr(n(opp))} <small>م.ر</small>`, `<span>تغذي خط أنابيب المبادرات</span>`)}
    </div>

    <div class="grid g21 mt">
      <div class="card">
        <h3>الأبواب: المعتمد مقابل المنصرف</h3>
        <div class="subt">مليون ريال — مع فرص الكفاءة المحددة لكل باب</div>
        <div id="ch-bud-bars" class="chart ch-340"></div>
      </div>
      <div class="card">
        <h3>عوامل التكلفة ومسببات الطلب</h3>
        <div class="subt">دراسة بنود الميزانية — تصنيف إداري داخلي مواءم مع أبواب الميزانية</div>
        <div style="max-height:380px;overflow-y:auto;padding-bottom:4px">
          ${B.map(c=>`
            <div style="padding:9px 0;border-bottom:1px dashed var(--line2)">
              <b style="font-family:var(--ff-d);font-size:12.5px">${esc(c.name)}</b>
              <div style="display:flex;flex-wrap:wrap;gap:5px;margin-top:5px">
                ${c.costDrivers.map(d=>`<span class="st navy">${esc(d)}</span>`).join("")}
                ${c.demandDrivers.map(d=>`<span class="st gold">${esc(d)}</span>`).join("")}
              </div>
            </div>`).join("")}
        </div>
        <div class="legend-dots mt"><span><i style="background:var(--navy)"></i>عوامل تكلفة</span><span><i style="background:var(--gold)"></i>مسببات طلب</span></div>
      </div>
    </div>

    <div class="section-head"><h2>سجل مراجعات الإنفاق</h2>
      <span class="hint">خدمة مراجعة الإنفاق تُنفذ بالتكامل مع هيئة كفاءة الإنفاق وتُختم بفرص محددة ودروس مستفادة</span></div>
    <div class="grid g2">
      ${S.data.spendingReviews.map(r=>`
        <div class="card lift">
          <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
            <h3 style="font-size:13.5px">${esc(r.scope)}</h3>
            <span class="st ${r.status==="مكتملة"?"ok":r.status==="قيد التنفيذ"?"info":"mut"}">${esc(r.status)}</span>
          </div>
          <div class="subt">دورة ${esc(r.period)}</div>
          <div style="display:flex;flex-wrap:wrap;gap:5px;margin:8px 0">
            ${r.axes.map(a=>`<span class="st teal">${esc(a)}</span>`).join("")}
          </div>
          ${r.opportunities.length? `<div class="divider"></div>
            ${r.opportunities.map(o=>`<div class="fld"><b>فرصة ${esc(o.type)}${o.value?` — ${moneyShort(o.value)}`:""}</b><span><span class="st ${o.status==="معتمدة"?"ok":"info"}">${esc(o.status)}</span></span></div>`).join("")}`:""}
          ${r.lessons? `<div class="insight" style="margin-top:10px">${esc(r.lessons)}</div>`:""}
        </div>`).join("")}
    </div>`;
  },
  mount(){
    const B = S.data.budgetChapters;
    chart("ch-bud-bars").setOption(base({
      tooltip: Object.assign({},TT,{trigger:"axis", formatter:ps=>{
        const c = B[ps[0].dataIndex];
        let h=`<b>${c.name}</b>`;
        h+=ttRow("المعتمد",`${n(c.approved)} م.ر`,"#0A2A4A");
        h+=ttRow("المنصرف",`${n(c.spent)} م.ر`,"#0F7A8A");
        h+=ttRow("فرص الكفاءة",`${n(c.opportunities)} م.ر`,"#C7A34F");
        h+=ttRow("حالة المراجعة",c.reviewStatus);
        return h; }}),
      legend:{ icon:"circle", itemWidth:9, itemHeight:9, top:0, textStyle:{fontFamily:"Cairo",fontSize:11,color:"#5D6B7E"} },
      xAxis: hxAxis(v=>n(v)),
      yAxis: hyAxis(B.map(c=>c.name), 175),
      grid:{ top:34, bottom:26, right:188, left:20 },
      series:[
        { name:"المعتمد", type:"bar", barGap:"-100%", barWidth:16, color:"#E2E9F2", data:B.map(c=>({value:c.approved, itemStyle:{borderRadius:[8,0,0,8]}})), silent:true },
        { name:"المنصرف", type:"bar", barWidth:16, color:"#0F7A8A", data:B.map(c=>({value:c.spent, itemStyle:{borderRadius:[8,0,0,8]}})) },
        { name:"فرص الكفاءة", type:"scatter", symbol:"diamond", symbolSize:12, color:"#C7A34F", data:B.map(c=>c.opportunities) },
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
          <div class="lbl">${fs.fam}</div>
          <div class="val">${ltr(n(fs.ok))} <small>من ${n(fs.total)} ضمن المستهدف</small></div>
          <div class="foot"><span class="st ${fs.near?"warn":"mut"}">${n(fs.near)} قريب من المستهدف</span><div class="bar-mini" style="flex:1"><i style="width:${fs.total? (fs.ok+fs.near*0.5)/fs.total*100:0}%"></i></div></div>
        </div>`).join("")}
    </div>

    <div class="section-head"><h2>مؤشرات إدارة الأداء ${f!=="الكل"?`— ${f}`:""}</h2>
      <span class="hint">العائلات الأربع وفق النموذج التشغيلي لفرق كفاءة الإنفاق (القسم 2.7) — اضغط أي مؤشر للاتجاه الزمني</span>
      ${f!=="الكل"?`<button class="btn ghost" id="kpi-all">عرض الكل</button>`:""}</div>
    <div class="grid g3" style="grid-template-columns:repeat(auto-fill,minmax(330px,1fr))">
      ${KP.map(k=>{
        const st = kpiStatus(k);
        const v = kpiLatest(k), pv = kpiPrev(k);
        const better = pv==null? null : (k.direction==="up"? v>=pv : v<=pv);
        const progress = k.direction==="up"? Math.min(100, v/k.target*100) : Math.min(100, k.target/Math.max(v,0.0001)*100);
        return `<div class="card lift" data-kpi="${k.id}" style="cursor:pointer">
          <div style="display:flex;justify-content:space-between;gap:8px;align-items:flex-start">
            <h3 style="font-size:12.5px;line-height:1.5;flex:1">${esc(k.name)}${k.extra?` <span class="st gold" style="font-size:10px">مؤشر إضافي خاص بالهيئة</span>`:""}</h3>
            <span class="st ${st}">${st==="ok"?"ضمن المستهدف":st==="warn"?"قريب":"حرج"}</span>
          </div>
          <div style="display:flex;align-items:baseline;gap:9px;margin-top:6px">
            <span class="pscore" style="font-size:24px">${ltr(n(v, v%1?1:0))}</span>
            <span class="mini-note">${esc(k.unit)} · المستهدف ${ltr(n(k.target, k.target%1?1:0))} ${k.direction==="down"?"(أقل أفضل)":""}</span>
            ${better!=null? `<span class="delta ${better?"up":"dn"}">${better?"تحسن":"تراجع"}</span>`:""}
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
    <div class="fld"><b>العائلة</b><span>${esc(k.family)}</span></div>
    <div class="fld"><b>الدورية</b><span>${esc(k.freq)}</span></div>
    <div class="fld"><b>الاتجاه</b><span>${k.direction==="up"?"أعلى أفضل":"أقل أفضل"}</span></div>
    <div class="fld"><b>المستهدف</b><span class="num">${n(k.target, k.target%1?1:0)} ${esc(k.unit)}</span></div>
    <div class="fld"><b>المالك</b><span>${esc(k.owner)}</span></div>
    ${k.formula? `<div class="fld"><b>المعادلة</b><span>${esc(k.formula)}</span></div>`:""}
    <div class="dsec"><h4>الاتجاه الزمني</h4><div id="ch-kpi-trend" class="chart ch-220"></div></div>`;
  openDrawer(k.name, body);
  requestAnimationFrame(()=>{
    const c = chart("ch-kpi-trend"); if(!c) return;
    c.setOption(base({
      tooltip: Object.assign({},TT,{trigger:"axis", formatter:ps=>`<b>${ps[0].axisValue}</b>`+ttRow("القيمة",`${n(ps[0].value, ps[0].value%1?1:0)} ${k.unit}`,"#0F7A8A")}),
      xAxis: catXAxis(k.series.map(s=>s.p), { axisLabel:{color:"#5D6B7E",fontFamily:"Cairo",fontSize:10, interval:0, rotate:k.series.length>4?26:0} }),
      yAxis: Object.assign(valAxis(v=>n(v)), {
        max: v=>Math.max(v.max, k.target)*1.08,
        min: v=>Math.min(v.min, k.direction==="down"? k.target : v.min)*0.9,
      }),
      grid:{ top:20, bottom:44, right:50, left:16, containLabel:true },
      series:[{ type:"line", data:k.series.map(s=>s.v), smooth:true, symbol:"circle", symbolSize:7,
        lineStyle:{color:"#0F7A8A",width:3}, itemStyle:{color:"#0F7A8A"},
        areaStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:"rgba(15,122,138,.2)"},{offset:1,color:"rgba(15,122,138,0)"}]}},
        markLine:{ symbol:"none", lineStyle:{color:"#C7A34F",type:"dashed",width:2},
          label:{formatter:`المستهدف ${n(k.target,k.target%1?1:0)}`, fontFamily:"Cairo", color:"#A98A3C", position:"insideStartTop"},
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
        <h3>النموذج التشغيلي — ${esc(G.model)}</h3>
        <div class="subt">وفق النموذج التشغيلي لفرق كفاءة الإنفاق الصادر عن هيئة كفاءة الإنفاق والمشروعات الحكومية</div>
        <div class="grid" style="gap:10px;margin-top:10px">
          <div class="org-box head"><b>${esc(G.reportsTo)}</b><span style="font-size:11px;opacity:.8">المرجعية المباشرة للفريق</span></div>
          <div class="org-box head" style="background:var(--teal)"><b>${esc(G.leader)}</b><span style="font-size:11px;opacity:.85">نقطة التواصل الوحيدة مع إكسبرو</span></div>
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
        <h3>سلم التصعيد مع هيئة كفاءة الإنفاق والمشروعات الحكومية</h3>
        <div class="subt">ضوابط التفاعل ثلاثية المستويات (إكسبرو)</div>
        ${G.escalation.map(e=>`
          <div class="esc-row">
            <div class="esc-lvl">${e.level}</div>
            <div style="flex:1"><b style="font-family:var(--ff-d);font-size:12.5px">${esc(e.entity)}</b>
              <div class="mini-note">${esc(e.expro)}</div></div>
            <span class="esc-arrow">⇄</span>
          </div>`).join("")}
        <div class="mini-note mt">التصعيد وطلب الدعم يتجهان لأعلى، والقرارات والتوجيهات تعود لأسفل — القنوات: الاجتماعات والتقارير والبريد الرسمي.</div>
      </div>
    </div>

    <div class="section-head"><h2>ملاك الركائز</h2><span class="hint">كل ركيزة يملكها قسم مسؤول عن خطتها التصحيحية وتقاريرها</span></div>
    <div class="card">
      <div class="tblwrap"><table>
        <thead><tr><th>الركيزة</th><th>المالك</th><th>الدرجة الذاتية</th><th>درجة المحاكاة</th><th>وثائق متوفرة</th></tr></thead>
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

    <div class="section-head"><h2>سجل السياسات والتكليفات المعممة</h2>
      <span class="hint">المرجع النظامي لمؤشر الالتزام بالسياسات — أوامر سامية وتعليمات وأدلة وطنية</span></div>
    <div class="card">
      <div class="tblwrap"><table>
        <thead><tr><th>المرجع</th><th>النوع</th><th>الموضوع</th><th>حالة الالتزام</th><th>شاهد الالتزام</th></tr></thead>
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
      <div class="mini-note mt">يغذي هذا السجل مؤشر «نسبة الالتزام بالسياسات والتكليفات المعممة» وفق آلية الاحتساب المعتمدة من هيئة كفاءة الإنفاق والمشروعات الحكومية.</div>
    </div>

    <div class="section-head"><h2>اللجان والاجتماعات</h2></div>
    <div class="grid g21">
      <div class="card">
        <div class="toolbar" style="margin-bottom:8px">
          <h3 style="margin:0">سجل الاجتماعات والقرارات</h3>
          <div class="spacer"></div>
          <button class="btn primary" id="mtg-add">تسجيل اجتماع</button>
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
            <div class="fld"><b>الرئيس</b><span>${esc(c.chair)}</span></div>
            <div class="fld"><b>الأعضاء</b><span class="num">${n(c.members)}</span></div>
            <div class="mini-note" style="margin-top:6px">${esc(c.mandate)}</div>
          </div>`).join("")}
      </div>
    </div>`;
  },
  mount(){
    APP.querySelectorAll("[data-pillar]").forEach(el=>el.addEventListener("click",()=>{ go("skep"); setTimeout(()=>openPillar(el.dataset.pillar),80); }));
    document.getElementById("mtg-add").addEventListener("click",()=>{
      openModal("تسجيل اجتماع جديد", `
        <div class="frow">
          <div class="fgrp"><label>اللجنة</label><select id="m-comm">${S.data.governance.committees.map(c=>`<option>${esc(c.name)}</option>`).join("")}</select></div>
          <div class="fgrp"><label>التاريخ</label><input id="m-date" type="date" value="${S.data.meta.asOf}"></div>
        </div>
        <div class="frow one"><div class="fgrp"><label>القرارات (سطر لكل قرار)</label><textarea id="m-dec" rows="4"></textarea></div></div>
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
    <div class="grid g4">
      ${kpiTile("users","","تغطية مصفوفة المهارات", pct(C.skillsCoverage), `<span class="delta ${C.skillsCoverage>=C.skillsTarget?"up":"dn"}">المستهدف ${pct(C.skillsTarget)}</span>`)}
      ${kpiTile("check","","نسبة الوعي بكفاءة الإنفاق", pct(last.score), `<span>آخر قياس: ${esc(last.label)} (${n(last.respondents)} مشاركاً)</span>`)}
      ${kpiTile("book","n","البرامج التدريبية", `${ltr(n(done))} <small>من ${n(C.trainings.length)} مكتملة</small>`, `<span>${n(C.trainings.reduce((s,t)=>s+t.hours,0))} ساعة تدريبية</span>`)}
      ${kpiTile("flag","g","مستوى تبني كفاءة الإنفاق", `${esc(C.adoption.current)}`, `<span>المستهدف «${esc(C.adoption.target)}» 2026–2027</span>`)}
    </div>

    <div class="grid g21 mt">
      <div class="card">
        <h3>منحنى الوعي بكفاءة الإنفاق</h3>
        <div class="subt">حلقة القياس المغلقة: قياس ← فجوات ← تدخلات ← إعادة قياس (المستهدف ${pct(C.awareness.target)})</div>
        <div id="ch-cap-aw" class="chart ch-260"></div>
      </div>
      <div class="card">
        <h3>سلم التبني</h3>
        <div class="subt">خطة إدارة التغيير وآلية التحفيز</div>
        <div class="stepper" style="margin-top:16px">
          ${C.adoption.levels.map((l,i)=>`
            <div class="step ${i<C.adoption.currentIndex?"done":i===C.adoption.currentIndex?"cur":""}">
              <div class="dotp">${i<C.adoption.currentIndex?"✓":i+1}</div>
              <span style="font-weight:${i===C.adoption.targetIndex?700:400};${i===C.adoption.targetIndex?"color:var(--gold2)":""}">${l}${i===C.adoption.targetIndex?" ◈":""}</span>
            </div>`).join("")}
        </div>
        <div class="insight gold mt">${esc(C.adoption.note)}</div>
        <div class="dsec"><h4>آلية التحفيز</h4>
          ${C.incentives.map(x=>`<div class="fld"><b>${esc(x.name)}</b><span><span class="st ${x.status==="مفعّلة"?"ok":"warn"}">${esc(x.status)}</span></span></div>`).join("")}
        </div>
        ${C.nominations? `<div class="dsec"><h4>دورة الترشيح والتكريم (ترشيح ← تقييم اللجنة الإشرافية ← إعلان)</h4>
          ${C.nominations.map(x=>`<div class="fld"><b style="max-width:60%">${esc(x.nominee)}</b><span><span class="st ${x.stage.startsWith("إعلان")?"ok":x.stage.startsWith("تقييم")?"info":"mut"}">${esc(x.stage)}</span> ${esc(x.criterion)}</span></div>`).join("")}
        </div>`:""}
      </div>
    </div>

    ${C.succession? `<div class="grid g2 mt">
      <div class="card">
        <h3>خطة التعاقب الوظيفي</h3>
        <div class="subt">تغطية الأدوار الحرجة: ${pct(C.succession.coverage)} — المستهدف ${pct(C.succession.target)}</div>
        <div class="bar-mini" style="margin:8px 0 12px"><i style="width:${C.succession.coverage}%"></i></div>
        ${C.succession.roles.map(r=>`<div class="fld"><b>${esc(r.role)}</b><span><span class="st ${r.status==="مغطى"?"ok":"warn"}">${esc(r.status)}</span> ${n(r.ready)} ${r.ready>1?"مرشحان جاهزان":"مرشح جاهز"}</span></div>`).join("")}
        <div class="mini-note mt">${esc(C.succession.note)}</div>
      </div>
      <div class="card">
        <h3>منظومة إدارة المعرفة</h3>
        <div class="subt">مستودع موحد للمنهجيات والدروس المستفادة وقصص النجاح</div>
        ${C.knowledge.assets.map(a=>`<div class="fld"><b>${esc(a.name)}</b><span><span class="st ${a.status==="محدّث"?"ok":"warn"}">${esc(a.status)}</span></span></div>`).join("")}
        <div class="mini-note mt">${esc(C.knowledge.note)}</div>
      </div>
    </div>`:""}

    <div class="grid g21 mt">
      <div class="card">
        <h3>الخطة التدريبية ونقل المعرفة</h3>
        <div class="subt">مرتبطة بفجوات مصفوفة المهارات — تشمل ورش نقل المعرفة من الاستشاريين</div>
        <div class="tblwrap"><table>
          <thead><tr><th>البرنامج</th><th>الفئة المستهدفة</th><th>الساعات</th><th>المشاركون</th><th>الموعد</th><th>الحالة</th></tr></thead>
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
        <h3>الفعاليات والحملات</h3>
        <div class="subt">بما يشمل يوم كفاءة الإنفاق على مستوى الهيئة</div>
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
      tooltip: Object.assign({},TT,{trigger:"axis", formatter:ps=>`<b>${ps[0].axisValue}</b>`+ttRow("نسبة الوعي",pct(ps[0].value),"#0F7A8A")}),
      xAxis: catXAxis(C.awareness.surveys.map(s=>s.label)),
      yAxis: Object.assign(valAxis(v=>n(v)+"%"), {max:100}),
      grid:{ top:22, bottom:28, right:46, left:12 },
      series:[{ type:"line", data:C.awareness.surveys.map(s=>s.score), smooth:true, symbol:"circle", symbolSize:8,
        lineStyle:{color:"#0F7A8A",width:3}, itemStyle:{color:"#0F7A8A"},
        label:{show:true, position:"top", fontFamily:"IBM Plex Sans Arabic", fontWeight:700, color:"#0A2A4A", formatter:p=>n(p.value)+"%"},
        areaStyle:{color:{type:"linear",x:0,y:0,x2:0,y2:1,colorStops:[{offset:0,color:"rgba(15,122,138,.18)"},{offset:1,color:"rgba(15,122,138,0)"}]}},
        markLine:{ symbol:"none", lineStyle:{color:"#C7A34F",type:"dashed",width:2},
          label:{formatter:`المستهدف ${C.awareness.target}%`, fontFamily:"Cairo", color:"#A98A3C", position:"insideStartTop"},
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
    <div class="section-head"><h2>مولّد التقارير</h2>
      <span class="hint">تقارير جاهزة للطباعة والرفع — تُبنى لحظياً من بيانات المنصة الحية</span></div>
    <div class="grid g4" style="grid-template-columns:repeat(auto-fit,minmax(250px,1fr))">
      ${[
        { id:"pillar", icon:"skep", t:"تقرير جاهزية الركائز", d:"درجات المعايير والوثائق والفجوات لكل ركيزة — نموذج الرفع لدورة التقييم" },
        { id:"quarterly", icon:"file", t:"التقرير الربع سنوي", d:"إنجازات الفريق والمبادرات والأثر المالي — للمسؤول الأول ونسخة لإكسبرو" },
        { id:"annual", icon:"book", t:"التقرير السنوي 2026", d:"الحصاد السنوي الشامل لكفاءة الإنفاق في الهيئة" },
        { id:"expro", icon:"doc", t:"حزمة منصة فرق كفاءة الإنفاق", d:"ملخص الرفع الدوري: مبادرات، وفورات، مؤشرات، حالة الركائز" },
      ].map(r=>`
        <div class="card lift" style="cursor:pointer;text-align:center;padding:26px 18px" data-report="${r.id}">
          <div style="width:52px;height:52px;border-radius:15px;background:var(--tintN);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;color:var(--navy)">${svgi(r.icon)}</div>
          <h3>${r.t}</h3>
          <div class="mini-note" style="margin-top:6px">${r.d}</div>
          <button class="btn primary mt" style="margin-top:14px">إنشاء التقرير</button>
        </div>`).join("")}
    </div>

    <div class="section-head"><h2>سجل التقارير</h2></div>
    <div class="card">
      <div class="tblwrap"><table>
        <thead><tr><th>التقرير</th><th>النوع</th><th>الفترة</th><th>الاستحقاق</th><th>الحالة</th></tr></thead>
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
    title = "تقرير جاهزية برنامج ركائز استدامة كفاءة الإنفاق";
    body = S.data.pillars.map(p=>`
      <h2>${esc(p.name)} — ${n(pillarScore(p,"self"),2)} من 5 (${gradeOf(pillarScore(p,"self"))})</h2>
      <table><thead><tr><th>المعيار</th><th>ذاتي</th><th>محاكاة</th><th>الدورة 6</th><th>الوثائق</th><th>الإجراءات</th></tr></thead><tbody>
        ${p.criteria.map(c=>`<tr>
          <td>${esc(c.code)} — ${esc(c.name)}</td>
          <td class="num">${n(c.selfScore)}</td><td class="num">${n(c.simScore)}</td><td class="num">${n(c.prevScore)}</td>
          <td>${c.evidence.map(e=>`${esc(e.name)} (${e.status})`).join("؛ ")}</td>
          <td>${c.actions.map(a=>esc(a.name)).join("؛ ")||"—"}</td>
        </tr>`).join("")}
      </tbody></table>`).join("");
  } else if(type==="quarterly"){
    title = "التقرير الربع سنوي لأعمال فريق كفاءة الإنفاق";
    body = `
      <h2>الملخص التنفيذي</h2>
      <p>بلغ التقييم الذاتي الشامل ${n(overallScore("self"),1)} من 5 (${gradeOf(overallScore("self"))})، وبلغ الأثر المالي المحقق التراكمي ${n(it.realized)} مليون ريال (منه ${n(it.documented)} مليون موثق بالإقفال)، بنسبة التزام بالمبادرات ${n(ist.commitment,1)}%.</p>
      <h2>المبادرات حسب المرحلة</h2>
      <table><thead><tr><th>المرحلة</th><th>العدد</th></tr></thead><tbody>
        ${INI_STAGES.map(s=>`<tr><td>${s}</td><td class="num">${n(statusCount()[s])}</td></tr>`).join("")}
      </tbody></table>
      <h2>المبادرات المتأخرة والمتعثرة</h2>
      <table><thead><tr><th>المبادرة</th><th>الحالة</th><th>الإجراء</th></tr></thead><tbody>
        ${S.data.initiatives.filter(i=>i.flag).map(i=>`<tr><td>${esc(i.name)}</td><td>${i.flag}</td><td>${esc(i.note||"—")}</td></tr>`).join("")||'<tr><td colspan="3">لا توجد</td></tr>'}
      </tbody></table>
      <h2>مؤشرات الأداء الرئيسية</h2>
      <table><thead><tr><th>المؤشر</th><th>القيمة</th><th>المستهدف</th><th>الحالة</th></tr></thead><tbody>
        ${S.data.kpis.slice(0,10).map(k=>`<tr><td>${esc(k.name)}</td><td class="num">${n(kpiLatest(k),kpiLatest(k)%1?1:0)} ${esc(k.unit)}</td><td class="num">${n(k.target,k.target%1?1:0)}</td><td>${kpiStatus(k)==="ok"?"ضمن المستهدف":kpiStatus(k)==="warn"?"قريب":"حرج"}</td></tr>`).join("")}
      </tbody></table>`;
  } else if(type==="annual"){
    title = "التقرير السنوي لكفاءة الإنفاق في الهيئة — 2026";
    body = `
      <h2>أبرز النتائج</h2>
      <table><tbody>
        <tr><td>التقييم الذاتي الشامل (الدورة السابعة)</td><td class="num">${n(overallScore("self"),1)} / 5 — ${gradeOf(overallScore("self"))}</td></tr>
        <tr><td>تقييم الدورة السادسة</td><td class="num">${n(overallScore("prev"),1)} / 5</td></tr>
        <tr><td>الأثر المالي المحدد (خط الأنابيب)</td><td class="num">${n(it.identified)} مليون ريال</td></tr>
        <tr><td>الأثر المعتمد من الشؤون المالية</td><td class="num">${n(it.approved)} مليون ريال</td></tr>
        <tr><td>الأثر المحقق التراكمي</td><td class="num">${n(it.realized)} مليون ريال</td></tr>
        <tr><td>اكتمال الوثائق الداعمة</td><td class="num">${evs.coverage}%</td></tr>
        <tr><td>عدد المبادرات</td><td class="num">${n(ist.total)}</td></tr>
      </tbody></table>
      <h2>نضج الركائز</h2>
      <table><thead><tr><th>الركيزة</th><th>ذاتي</th><th>محاكاة</th><th>الدورة 6</th><th>المالك</th></tr></thead><tbody>
        ${S.data.pillars.map(p=>`<tr><td>${esc(p.name)}</td><td class="num">${n(pillarScore(p,"self"),2)}</td><td class="num">${n(pillarScore(p,"sim"),2)}</td><td class="num">${n(pillarScore(p,"prev"),2)}</td><td>${esc(p.owner)}</td></tr>`).join("")}
      </tbody></table>
      <h2>قصص النجاح</h2>
      ${S.data.initiatives.filter(i=>i.status==="مقفلة").map(i=>`<p><b>${esc(i.name)}:</b> ${esc(i.wasteSource)} — عولجت عبر ${esc(i.treatment)}، بأثر موثق ${n(i.realizedImpact)} مليون ريال.</p>`).join("")}`;
  } else {
    title = "حزمة الرفع الدوري — منصة فرق كفاءة الإنفاق";
    body = `
      <h2>ملخص الرفع</h2>
      <table><tbody>
        <tr><td>الجهة</td><td>${esc(S.data.meta.entity)}</td></tr>
        <tr><td>الفترة</td><td>الربع الثالث 2026 (حتى ${asOf})</td></tr>
        <tr><td>الأثر المحقق 2026</td><td class="num">${n(S.data.impact.monthly2026.reduce((s,m)=>s+m.real,0))} مليون ريال</td></tr>
        <tr><td>نسبة الالتزام بالمبادرات</td><td class="num">${n(ist.commitment,1)}%</td></tr>
        <tr><td>حالة التقييم الذاتي</td><td>قيد الاستكمال — الاستحقاق ${fmtDate(S.data.assessmentCycle.selfDue)}</td></tr>
      </tbody></table>
      <h2>المبادرات النشطة (${n(S.data.initiatives.filter(i=>["تنفيذ","قياس الأثر"].includes(i.status)).length)})</h2>
      <table><thead><tr><th>المبادرة</th><th>المرحلة</th><th>معتمد</th><th>محقق</th><th>الإنجاز</th></tr></thead><tbody>
        ${S.data.initiatives.filter(i=>["تنفيذ","قياس الأثر"].includes(i.status)).map(i=>`<tr><td>${esc(i.name)}</td><td>${i.status}</td><td class="num">${n(i.approvedImpact)}</td><td class="num">${n(i.realizedImpact)}</td><td class="num">${n(i.progress)}%</td></tr>`).join("")}
      </tbody></table>
      <h2>الوثائق الداعمة للركائز</h2>
      <p>متوفرة: ${n(evs.ready)} · قيد الإعداد: ${n(evs.prep)} · غير متوفرة: ${n(evs.missing)} — نسبة الاكتمال ${evs.coverage}%.</p>`;
  }
  rv.innerHTML = `
    <div class="rv-head">
      <div style="display:flex;align-items:center;gap:18px;min-width:0">
        <img src="__LOGO_FULL__" alt="شعار الهيئة الملكية لمدينة الرياض" style="height:72px;flex:0 0 auto">
        <div style="min-width:0">
          <h1>${title}</h1>
          <div class="rv-meta">${esc(S.data.meta.entity)} — فريق كفاءة الإنفاق · تاريخ الإصدار: ${asOf} · ${S.data.meta.demo? "بيانات تجريبية لأغراض العرض":""}</div>
        </div>
      </div>
      <div style="display:flex;gap:8px" class="no-print">
        <button class="btn primary" id="rv-print">طباعة / PDF</button>
        <button class="btn ghost" id="rv-close">إغلاق</button>
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
OV.addEventListener("click",()=>{ closeDrawer(); closeModal(); });
addEventListener("keydown",e=>{ if(e.key==="Escape"){ closeDrawer(); closeModal(); } });

const MO = document.getElementById("modal");
function openModal(title, body, buttons){
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-body").innerHTML = body;
  document.getElementById("modal-foot").innerHTML = buttons.map((b,i)=>`<button class="btn ${b.cls}" data-mb="${i}">${b.label}</button>`).join("");
  MO.classList.add("on"); OV.classList.add("on");
  buttons.forEach((b,i)=>document.querySelector(`[data-mb="${i}"]`).addEventListener("click",b.fn));
  const first = document.querySelector("#modal-body input,#modal-body select,#modal-body textarea");
  if(first) first.focus();
}
function closeModal(){ MO.classList.remove("on"); if(!DR.classList.contains("on")) OV.classList.remove("on"); }
document.getElementById("modal-x").addEventListener("click",closeModal);

let toastT=null;
function toast(msg){
  const t = document.getElementById("toast");
  document.getElementById("toast-msg").textContent = msg;
  t.hidden = false; t.classList.add("on");
  clearTimeout(toastT);
  toastT = setTimeout(()=>{ t.classList.remove("on"); }, 2600);
}

/* ---------------- export / import / print / reset ---------------- */
document.getElementById("btn-export").addEventListener("click",()=>{
  const blob = new Blob([JSON.stringify(S.data,null,1)],{type:"application/json"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `rcrc-spending-efficiency-${S.data.meta.asOf}.json`;
  a.click(); URL.revokeObjectURL(a.href);
  toast("تم تصدير البيانات");
});
document.getElementById("btn-import").addEventListener("click",()=>document.getElementById("import-file").click());
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
document.getElementById("mast-sub").textContent = S.data.meta.subtitle;
document.getElementById("asof-chip").textContent = `محدثة حتى ${fmtDate(S.data.meta.asOf)}`;
if(!S.data.meta.demo) document.getElementById("demo-chip").style.display="none";
const initTab = (location.hash||"").replace("#","");
if(TABS.some(t=>t.id===initTab)) S.tab = initTab;
addEventListener("hashchange",()=>{
  const h = (location.hash||"").replace("#","");
  if(TABS.some(t=>t.id===h) && h!==S.tab){ S.tab=h; refresh(); }
});
refresh();
