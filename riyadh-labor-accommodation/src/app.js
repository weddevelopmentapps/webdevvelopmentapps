/* ============================================================
   لوحة معلومات السكن الجماعي للأفراد بمدينة الرياض
   عرض تنفيذي تفاعلي قائم على المشاهد — أمانة منطقة الرياض
   ============================================================ */
'use strict';
const D = window.DATA;
const RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------------------------------------------------------- الألوان
   انضباط اللون: الأخضر = بيانات وإجراء · الذهبي = المستهدف حصراً
   الأحمر = حالة إشكالية حصراً · الأزرق = قيمة محتسبة/مُسقَطة       */
const C = {
  ink:'#111815', ink2:'#39453F', mut:'#6B7870', faint:'#95A19A',
  accent:'#0E6B39', accent2:'#12854A', accent3:'#3FA06B', soft:'#EDF4EF',
  deep:'#0A3D22', gold:'#B8963E', goldSoft:'#F3E7C9',
  ok:'#0E8345', warn:'#B77A12', bad:'#B3402F', info:'#33628F', slate:'#7C8A82',
  gapFill:'#E4DCCC', line:'rgba(17,24,21,.10)', split:'rgba(17,24,21,.055)'
};

/* ---------------------------------------------------------- تنسيق */
const fmt   = n => (n == null || isNaN(n)) ? '—' : Math.round(n).toLocaleString('en-US');
const fmt1  = n => (n == null || isNaN(n)) ? '—' : (Math.round(n*10)/10).toLocaleString('en-US',{minimumFractionDigits:1,maximumFractionDigits:1});
const pc    = (v,d=1) => v == null ? '—' : (v*100).toFixed(d).replace(/\.0$/,'') + '٪';
const pcRaw = (v,d=1) => v == null ? '—' : (v*100).toFixed(d).replace(/\.0$/,'');
const axK   = v => Math.abs(v) >= 1e6 ? (v/1e6).toLocaleString('en-US',{maximumFractionDigits:1})+' مليون'
                 : Math.abs(v) >= 1000 ? (v/1000).toLocaleString('en-US',{maximumFractionDigits:0})+' ألف'
                 : fmt(v);
/* أقرب سقف «مريح» للمحور — يمنع تكدّس تسمية القيمة القصوى فوق ما قبلها */
function niceMax(v){
  if(!v || !isFinite(v)) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(Math.abs(v))));
  for(const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]){
    if(m*p >= v) return m*p;
  }
  return 10*p;
}
const el  = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ltr = s => `<span class="ltr">${s}</span>`;

/* اتفاق العدد مع المعدود بالعربية */
function cnt(n, one, two, few, many){
  if(n === 1) return one;
  if(n === 2) return two;
  if(n >= 3 && n <= 10) return `${fmt(n)} ${few}`;
  return `${fmt(n)} ${many}`;
}

/* أسماء الأشهر تُعرض كما وردت في المصدر — أي إعادة تشكيل للرقم تُفسد ترتيب
   الاتجاهين داخل تسمية محور مُدارة، فتظهر السنة مبعثرة. */
const AR_MONTH_SHORT = m => (m || '').replace(/^ما قبل /, 'قبل ');
function fmtDate(s){
  if(!s) return '—';
  const M = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const [y,m,d] = s.split('-');
  return `${+d} ${M[+m-1]} ${y}`;
}

/* ---------------------------------------------------------- الحالة */
const S = {
  tab: 't1',
  scene: 0,          // فهرس المشهد ضمن كل المشاهد
  sector: '',        // معرف القطاع المحدد أو فراغ
  goal: '',          // تصفية المبادرات حسب الهدف
  areaSector: '',
};
const SEC = () => S.sector ? D.sectors.find(s => s.id === S.sector) : null;
const SECNAME = () => { const s = SEC(); return s ? s.name : 'كل القطاعات'; };

/* نطاق الأرقام حسب التصفية القطاعية */
function scope(){
  const s = SEC();
  if(!s) return {
    demand:D.totals.demand, supply:D.totals.supply, gap:D.totals.gap, coverage:D.totals.coverage,
    buildLic:D.totals.buildingLic, opLic:D.totals.operationalLic,
    inspectors:D.totals.inspectors, visits:D.totals.visits, violations:D.totals.violations,
    label:'إجمالي مدينة الرياض', national:true
  };
  return {
    demand:s.demand, supply:s.capacity, gap:s.gap, coverage:s.coverage,
    buildLic:s.buildLic, opLic:s.opLic,
    inspectors:s.inspectors, visits:s.visits, violations:s.violations,
    label:s.name, national:false
  };
}

/* ---------------------------------------------------------- الرسوم */
const CH = {};
function chart(id){
  const node = el(id);
  if(!node) return null;
  if(CH[id]){ try{ CH[id].dispose(); }catch(e){} }
  const c = echarts.init(node, null, {renderer:'canvas'});
  CH[id] = c;
  return c;
}
function resizeAll(){ Object.values(CH).forEach(c => { try{ c.resize(); }catch(e){} }); }
let rzT; addEventListener('resize', () => { clearTimeout(rzT); rzT = setTimeout(resizeAll, 120); });

const TT = {
  backgroundColor:'#0F1A14', borderWidth:0,
  textStyle:{color:'#F1F5F2', fontFamily:'Cairo', fontSize:11.5},
  extraCssText:'direction:rtl;text-align:right;border-radius:12px;padding:10px 14px;box-shadow:0 14px 40px rgba(10,20,15,.34);'
};
const ttHead = t => `<div style="font-family:'IBM Plex Sans Arabic';font-weight:700;font-size:12.5px;margin-bottom:6px;padding-bottom:5px;border-bottom:1px solid rgba(255,255,255,.14)">${t}</div>`;
const ttRow  = (k,v,sw) => `<div style="display:flex;justify-content:space-between;gap:18px;margin:2.5px 0">
  <span style="color:#A9B6AE">${sw?`<span style="display:inline-block;width:8px;height:8px;border-radius:2px;background:${sw};margin-inline-end:6px"></span>`:''}${k}</span>
  <b style="font-family:'IBM Plex Sans Arabic';color:#fff;font-weight:600">${v}</b></div>`;

function base(o){
  return Object.assign({
    animation: !RM, animationDuration: 320,
    textStyle:{fontFamily:'Cairo'},
    grid:{top:16, right:18, bottom:22, left:18, containLabel:true}
  }, o);
}
/* محور فئوي رأسي — الزمن يقرأ من اليمين إلى اليسار */
const catX = (data, extra) => Object.assign({
  type:'category', data, inverse:true,
  axisLine:{lineStyle:{color:C.line}}, axisTick:{show:false},
  axisLabel:{color:C.mut, fontSize:10, fontFamily:'Cairo', interval:0}
}, extra || {});
/* محور قيمي رأسي — القيم على اليمين */
const valY = (fmtF, extra) => Object.assign({
  type:'value', position:'right', splitLine:{lineStyle:{color:C.split}},
  axisLabel:{color:C.faint, fontSize:10, fontFamily:'IBM Plex Sans Arabic', formatter:fmtF || axK}
}, extra || {});
/* أشرطة أفقية — تنمو من اليمين إلى اليسار */
/* الأشرطة الأفقية تحمل تسمية القيمة عند طرفها، فلا حاجة لتسمية الحد الأقصى —
   إظهارها يُنتج تكراراً بصرياً عند سقف غير مستدير (10 و10.4 مثلاً). */
const barX = (fmtF, extra) => Object.assign({
  type:'value', inverse:true, splitLine:{lineStyle:{color:C.split}},
  axisLabel:{color:C.faint, fontSize:10, fontFamily:'IBM Plex Sans Arabic',
    showMaxLabel:false, formatter:fmtF || axK}
}, extra || {});
const barY = (data, w) => ({
  type:'category', data, position:'right', inverse:true,
  axisLine:{lineStyle:{color:'transparent'}}, axisTick:{show:false},
  axisLabel:{color:C.ink2, fontSize:10.5, fontFamily:'Cairo', interval:0,
    width:w||null, overflow:w?'truncate':'none'}
});
const LBL = (fmtF, extra) => Object.assign({
  show:true, position:'left', color:C.ink2, fontFamily:'IBM Plex Sans Arabic',
  fontSize:10.5, fontWeight:600, formatter:fmtF
}, extra || {});

/* ---------------------------------------------------------- عناصر واجهة */
const TAG = {
  real:  '<span class="tag t-real">بيانات فعلية</span>',
  calc:  '<span class="tag t-calc">قيمة محتسبة</span>',
  sample:'<span class="tag t-sample">بيانات عينة</span>',
  none:  '<span class="tag t-none">لا تتوفر بيانات فعلية</span>'
};
function noData(key){
  const g = D.gaps.find(x => x.key === key) || {title:'لا تتوفر بيانات فعلية', need:''};
  return `<div class="nodata">
    <svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 15l3.5-3.5 3 3L20 8"/><path d="M4 4l16 16" stroke-dasharray="2 2.5"/></svg>
    <div class="nd-t">${esc(g.title)}</div>
    <div class="nd-d">لا يوجد لهذا الرسم مصدر بيانات فعلي في مصنّف البيانات الرئيسي — لم تُعرض أي قيم تقديرية.</div>
    <div class="nd-n"><b>المطلوب لتفعيله:</b> ${esc(g.need)}</div>
  </div>`;
}
function railCell(label, value, unit, foot, cls){
  return `<div class="cell">
    <div class="c-l">${label}</div>
    <div class="c-v ${cls||''}">${value}${unit?`<small>${unit}</small>`:''}</div>
    ${foot ? `<div class="c-f">${foot}</div>` : ''}
  </div>`;
}
const rail = (cells) => `<div class="rail" style="grid-template-columns:repeat(${cells.length},minmax(0,1fr))">${cells.join('')}</div>`;

function panel(title, sub, bodyHTML, opts){
  const o = opts || {};
  return `<div class="panel ${o.cls||''}" ${o.style?`style="${o.style}"`:''}>
    ${title ? `<div class="p-head"><h3>${title}</h3>${sub?`<div class="p-sub">${sub}</div>`:''}${o.tag?`<div class="p-tag">${o.tag}</div>`:''}</div>` : ''}
    <div class="p-body ${o.bodyCls||''}">${bodyHTML}</div>
  </div>`;
}
const chartBody = id => `<div class="chart" id="${id}"></div>`;

function imghead(kicker, title, desc, img){
  return `<div class="imghead" style="min-height:0">
    <div class="ih-img" style="background-image:url('${IMAGES[img]}')"></div>
    <div class="ih-veil"></div>
    <div class="ih-c"><div class="ih-k">${kicker}</div><div class="ih-t">${title}</div>
      <div class="ih-d">${desc}</div></div>
  </div>`;
}

/* عدّاد تصاعدي للأرقام البطولية */
function countUp(node, to, {dec=0, dur=520, suffix=''} = {}){
  if(!node) return;
  if(RM){ node.textContent = (dec ? fmt1(to) : fmt(to)) + suffix; return; }
  const t0 = performance.now();
  (function step(t){
    const p = Math.min(1, (t - t0)/dur);
    const e = 1 - Math.pow(1 - p, 3);
    node.textContent = (dec ? fmt1(to*e) : fmt(to*e)) + suffix;
    if(p < 1) requestAnimationFrame(step);
  })(performance.now());
}

/* ---------------------------------------------------------- الدرج */
function openDrawer(title, sub, html){
  el('dr-t').innerHTML = title;
  el('dr-s').innerHTML = sub || '';
  el('dr-b').innerHTML = html;
  el('drawer').classList.add('on');
  el('drawer').setAttribute('aria-hidden','false');
  el('veil').classList.add('on');
}
function closeDrawer(){
  el('drawer').classList.remove('on');
  el('drawer').setAttribute('aria-hidden','true');
  el('veil').classList.remove('on');
}
const fld = (l,v) => `<div class="fld"><span class="l">${l}</span><span class="v">${v}</span></div>`;
const drSec = t => `<div class="dr-sec">${t}</div>`;

/* ---------------------------------------------------------- تلميح الخريطة */
const mtip = () => el('maptip');
function showTip(html, x, y){
  const t = mtip();
  t.innerHTML = html; t.style.display = 'block';
  const r = t.getBoundingClientRect();
  t.style.left = Math.max(8, Math.min(innerWidth - r.width - 8, x - r.width/2)) + 'px';
  t.style.top  = Math.max(8, y - r.height - 14) + 'px';
}
const hideTip = () => { mtip().style.display = 'none'; };

/* ============================================================
   الخريطة التخطيطية للقطاعات البلدية
   مخطط توضيحي لترتيب القطاعات — ليس خريطة GIS بحدود فعلية
   ============================================================ */
const GEO = {
  sector_north : {poly:[[14,6],[86,6],[88,30],[62,34],[38,33],[12,29]],  at:[50,19]},
  sector_east  : {poly:[[62,34],[88,30],[93,62],[70,70],[62,52]],        at:[76,50]},
  sector_center: {poly:[[38,33],[62,34],[62,52],[70,70],[46,66],[36,52]],at:[51,49]},
  sector_west  : {poly:[[12,29],[38,33],[36,52],[46,66],[22,72],[7,50]], at:[24,50]},
  sector_south : {poly:[[22,72],[46,66],[70,70],[74,92],[40,96],[20,90]],at:[46,82]}
};
/* تدرّج أخضر من فاتح إلى غامق حسب قيمة المقياس */
function ramp(t){
  const a = [237,244,239], b = [14,107,57];
  const k = Math.max(0, Math.min(1, t));
  return `rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*k)).join(',')})`;
}
function drawMap(wrapId, {metric, label, fmtV}){
  const wrap = el(wrapId);
  if(!wrap) return;
  const vals = D.sectors.map(metric);
  const mx = Math.max(...vals), mn = Math.min(...vals);
  const norm = v => mx === mn ? .55 : .16 + .84*((v - mn)/(mx - mn));

  wrap.innerHTML = `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
    ${D.sectors.map(s => {
      const v = metric(s), f = ramp(norm(v));
      const on = S.sector === s.id;
      return `<polygon class="sec-poly${on?' sel':''}" data-sec="${s.id}"
        points="${GEO[s.id].poly.map(p=>p.join(',')).join(' ')}" style="fill:${f}"></polygon>`;
    }).join('')}
    ${D.sectors.map(s => {
      const v = metric(s), dark = norm(v) > .55;
      const [x,y] = GEO[s.id].at;
      return `<text class="sec-lbl" x="${x}" y="${y-1.2}" style="fill:${dark?'#fff':'#111815'};stroke:${dark?'rgba(10,40,25,.5)':'rgba(255,255,255,.8)'}">${esc(s.short)}</text>
              <text class="sec-val" x="${x}" y="${y+3.4}" style="fill:${dark?'#fff':'#0E6B39'};stroke:${dark?'rgba(10,40,25,.5)':'rgba(255,255,255,.85)'}">${fmtV(v)}</text>`;
    }).join('')}
  </svg>`;

  wrap.querySelectorAll('.sec-poly').forEach(p => {
    const s = D.sectors.find(x => x.id === p.dataset.sec);
    p.addEventListener('mousemove', e => showTip(
      ttHead(esc(s.name)) +
      ttRow('الطلب', fmt(s.demand)) +
      ttRow('الطاقة المرخصة', fmt(s.capacity)) +
      ttRow('نسبة التغطية', pc(s.coverage,2)) +
      ttRow('الرخص التشغيلية', fmt(s.opLic)) +
      ttRow('المخالفات', fmt(s.violations)),
      e.clientX, e.clientY));
    p.addEventListener('mouseleave', hideTip);
    p.addEventListener('click', () => { hideTip(); setSector(S.sector === s.id ? '' : s.id); });
  });
}

/* ============================================================
   سجل المشاهد
   ============================================================ */
const TABS = [
  {id:'t1', name:'العرض والطلب'},
  {id:'t2', name:'التراخيص'},
  {id:'t3', name:'الرقابة والامتثال'},
  {id:'t4', name:'المبادرات'},
  {id:'t5', name:'مؤشرات الأداء'},
  {id:'t6', name:'التوقعات'},
  {id:'t7', name:'حوكمة البيانات'}
];

const SCENES = [
  /* ---------------- 1 — العرض والطلب ---------------- */
  {id:'s1_gap', tab:'t1', kick:'العرض والطلب', title:'فجوة الإيواء',
   sub:'المسافة بين إجمالي الطلب والطاقة الاستيعابية المرخصة', build:sc_gap},
  {id:'s1_demand', tab:'t1', kick:'العرض والطلب', title:'تركيبة الطلب',
   sub:'توزيع العمالة حسب نوع الياقة والمجموعة المهنية', build:sc_demand},
  {id:'s1_supply', tab:'t1', kick:'العرض والطلب', title:'المعروض المرخص وتوزيعه',
   sub:'الطاقة الاستيعابية حسب القطاع البلدي ونوع السكن', build:sc_supply},

  /* ---------------- 2 — التراخيص ---------------- */
  {id:'s2_overview', tab:'t2', kick:'التراخيص', title:'الأداء مقابل خط الأساس',
   sub:'رخص البناء والرخص التشغيلية والطاقة الاستيعابية — أغسطس 2025 إلى أغسطس 2026', build:sc_licOverview},
  {id:'s2_flow', tab:'t2', kick:'التراخيص', title:'المسار الشهري للإصدار',
   sub:'الإضافات الشهرية والرصيد التراكمي للطاقة الاستيعابية والرخص', build:sc_licFlow},
  {id:'s2_dist', tab:'t2', kick:'التراخيص', title:'التوزيع القطاعي وأنواع المساكن',
   sub:'الرخص والطاقة الاستيعابية حسب القطاع البلدي ونوع السكن', build:sc_licDist},

  /* ---------------- 3 — الرقابة والامتثال ---------------- */
  {id:'s3_overview', tab:'t3', kick:'الرقابة والامتثال', title:'منظومة الرقابة',
   sub:'المراقبون والجولات والمخالفات ونسبة الامتثال — آخر 12 شهراً', build:sc_ctlOverview},
  {id:'s3_trend', tab:'t3', kick:'الرقابة والامتثال', title:'الاتجاه الشهري',
   sub:'الزيارات الرقابية والمخالفات ومعدل المخالفة لكل زيارة', build:sc_ctlTrend},
  {id:'s3_violations', tab:'t3', kick:'الرقابة والامتثال', title:'أنواع المخالفات',
   sub:'تركيبة المخالفات حسب النوع وتوزيعها على القطاعات', build:sc_ctlViol},
  {id:'s3_areas', tab:'t3', kick:'الرقابة والامتثال', title:'سجل الأحياء',
   sub:'الرخص والطاقة والمخالفات على مستوى الحي', build:sc_ctlAreas},

  /* ---------------- 4 — المبادرات ---------------- */
  {id:'s4_status', tab:'t4', kick:'المبادرات', title:'حالة المبادرات',
   sub:'18 مبادرة موزعة على أربعة أهداف — الحالة محتسبة بتاريخ اليوم المرجعي', build:sc_iniStatus},
  {id:'s4_timeline', tab:'t4', kick:'المبادرات', title:'الجدول الزمني',
   sub:'فترات التنفيذ المخططة لكل مبادرة مقابل تاريخ اليوم', build:sc_iniTimeline},
  {id:'s4_register', tab:'t4', kick:'المبادرات', title:'سجل المبادرات',
   sub:'القائمة الكاملة — انقر أي مبادرة لعرض تفاصيلها', build:sc_iniRegister},

  /* ---------------- 5 — مؤشرات الأداء ---------------- */
  {id:'s5_goals', tab:'t5', kick:'مؤشرات الأداء', title:'قطع المسافة نحو المستهدف',
   sub:'موقع كل مؤشر بين خط الأساس والمستهدف المعتمد', build:sc_kpiGoals},
  {id:'s5_register', tab:'t5', kick:'مؤشرات الأداء', title:'بطاقات المؤشرات',
   sub:'المؤشرات الأربعة عشر — انقر أي مؤشر لعرض تفاصيله', build:sc_kpiCards},

  /* ---------------- 6 — التوقعات ---------------- */
  {id:'s6_projection', tab:'t6', kick:'التوقعات', title:'الإسقاط المحتسب للطاقة الاستيعابية',
   sub:'امتداد خطي لمتوسط الإضافة الشهرية الفعلية — ليس نموذجاً تنبؤياً معتمداً', build:sc_projection},

  /* ---------------- 7 — حوكمة البيانات ---------------- */
  {id:'s7_sources', tab:'t7', kick:'حوكمة البيانات', title:'سجل المصادر والملكية',
   sub:'الجهة المنتجة لكل مجموعة بيانات وحالة اعتمادها', build:sc_sources},
  {id:'s7_gaps', tab:'t7', kick:'حوكمة البيانات', title:'فجوات البيانات',
   sub:'الرسوم المعطّلة لعدم توفر مصدر فعلي — وما يلزم لتفعيل كل منها', build:sc_gaps}
];
const sceneIdx = id => SCENES.findIndex(s => s.id === id);
const tabScenes = t => SCENES.filter(s => s.tab === t);

/* ============================================================
   بناء المشاهد
   ============================================================ */

/* ---------------- 1.1 فجوة الإيواء ---------------- */
function sc_gap(host){
  const q = scope();
  const mult = q.supply ? q.demand / q.supply : null;
  host.innerHTML = `
    ${rail([
      railCell('إجمالي الطلب', `<span id="k-dem">0</span>`, 'فرد', `${esc(q.label)} — ${esc(D.meta.asOf)}`),
      railCell('الطاقة الاستيعابية المرخصة', `<span id="k-sup">0</span>`, 'سرير',
        `${fmt(q.opLic)} رخصة تشغيلية سارية`),
      railCell('فجوة الإيواء', `<span id="k-gap">0</span>`, 'سرير',
        `<b class="delta dn">${pc(1-q.coverage,1)}</b> من الطلب غير مغطّى`),
      railCell('مضاعف الطلب مقابل العرض', `<span id="k-mul">0</span>`, 'مرة',
        `لكل سرير مرخص ${ltr(fmt1(mult))} فرد ضمن الطلب`)
    ])}
    <div class="sc-body g-23" style="grid-template-rows:minmax(0,1fr)">
      ${panel('الطاقة المرخصة مقابل الطلب حسب القطاع البلدي',
        'الجزء الأخضر هو المغطّى فعلياً — والباقي هو الفجوة',
        chartBody('c-gapsec'), {tag:TAG.real})}
      <div class="stack">
        ${panel('نسبة تغطية الطلب', 'الطاقة المرخصة ÷ الطلب — لكل قطاع', chartBody('c-cov'), {tag:TAG.real})}
        ${panel('', '', `
          <div class="bridge">
            <div style="display:flex;align-items:baseline;gap:10px;margin-bottom:11px">
              <div class="hero-num lg" id="k-cov">0</div>
              <div style="font-size:11.5px;color:var(--mut);font-weight:600;line-height:1.5">
                نسبة التغطية الحالية<br>${esc(q.label)}
              </div>
            </div>
            <div class="bg-track">
              <div class="bg-fill" id="bg-fill" style="width:0%"></div>
              <div class="bg-mark" id="bg-mark" style="inset-inline-start:0%"></div>
            </div>
            <div class="bg-leg">
              <span class="lg"><span class="sw" style="background:linear-gradient(to left,#0E6B39,#12854A)"></span>
                مغطّى — ${ltr(fmt(q.supply))} سرير</span>
              <span class="lg"><span class="sw" style="background:repeating-linear-gradient(-45deg,#F3EEE1 0 4px,#FAF6EC 4px 8px);border:1px solid var(--hair)"></span>
                فجوة — ${ltr(fmt(q.gap))} سرير</span>
            </div>
            <div class="note" style="margin-top:12px">
              كل سرير مرخص واحد يقابله ${ltr(fmt1(mult))} فرد ضمن الطلب المسجل. سدّ الفجوة بالكامل
              يستلزم ${ltr(fmt(q.gap))} سرير إضافي — أي نحو ${ltr(fmt1(q.gap/q.supply))} ضعف الطاقة المرخصة القائمة.
            </div>
          </div>`, {cls:'tint fit'})}
      </div>
    </div>`;

  countUp(el('k-dem'), q.demand);
  countUp(el('k-sup'), q.supply);
  countUp(el('k-gap'), q.gap);
  countUp(el('k-mul'), mult, {dec:1});
  const covNode = el('k-cov');
  if(RM){ covNode.textContent = pcRaw(q.coverage,2)+'٪'; }
  else {
    const t0 = performance.now();
    (function st(t){ const p = Math.min(1,(t-t0)/900), e = 1-Math.pow(1-p,3);
      covNode.textContent = (q.coverage*100*e).toFixed(2)+'٪'; if(p<1) requestAnimationFrame(st); })(performance.now());
  }
  requestAnimationFrame(() => {
    el('bg-fill').style.width = Math.max(0.4, q.coverage*100) + '%';
    el('bg-mark').style.insetInlineStart = Math.max(0.4, q.coverage*100) + '%';
  });

  /* شريط مكدّس: المغطّى + الفجوة = الطلب */
  const secs = D.sectors;
  const c1 = chart('c-gapsec');
  c1 && c1.setOption(base({
    tooltip:Object.assign({}, TT, {trigger:'axis', axisPointer:{type:'shadow'}, formatter:ps => {
      const s = secs.find(x => x.name === ps[0].name);
      return ttHead(esc(s.name)) + ttRow('الطلب', fmt(s.demand)) +
        ttRow('الطاقة المرخصة', fmt(s.capacity), C.accent) +
        ttRow('الفجوة', fmt(s.gap), C.gapFill) +
        ttRow('نسبة التغطية', pc(s.coverage,2));
    }}),
    legend:{data:['الطاقة المرخصة','الفجوة'], bottom:0, textStyle:{color:C.mut, fontSize:11, fontFamily:'Cairo'},
      itemWidth:11, itemHeight:11, itemGap:16},
    grid:{top:12, right:96, bottom:34, left:56, containLabel:true},
    xAxis:barX(axK), yAxis:barY(secs.map(s => s.name), 74),
    series:[
      /* الشريحة الخضراء أضيق من أن تحمل تسمية داخلية — نسبة التغطية معروضة كاملةً في اللوح المجاور */
      {name:'الطاقة المرخصة', type:'bar', stack:'g', color:C.accent,
       data:secs.map(s => s.capacity)},
      {name:'الفجوة', type:'bar', stack:'g', color:C.gapFill,
       data:secs.map(s => s.gap), itemStyle:{borderRadius:[6,0,0,6]},
       label:LBL(p => fmt(secs[p.dataIndex].demand))}
    ]
  }));
  c1 && c1.on('click', p => setSector(secs.find(s => s.name === p.name).id));

  const c2 = chart('c-cov');
  const covSorted = [...secs].sort((a,b) => b.coverage - a.coverage);
  c2 && c2.setOption(base({
    tooltip:Object.assign({}, TT, {trigger:'item', formatter:p => {
      const s = covSorted[p.dataIndex];
      return ttHead(esc(s.name)) + ttRow('نسبة التغطية', pc(s.coverage,2), C.accent) +
        ttRow('الطاقة المرخصة', fmt(s.capacity)) + ttRow('الطلب', fmt(s.demand));
    }}),
    grid:{top:8, right:74, bottom:26, left:52, containLabel:true},
    xAxis:barX(v => pcRaw(v,0)+'٪', {max:Math.max(...secs.map(s=>s.coverage))*1.25}),
    yAxis:barY(covSorted.map(s => s.short), 46),
    series:[{
      type:'bar', color:C.accent, barWidth:'54%',
      data:covSorted.map(s => s.coverage), itemStyle:{borderRadius:[6,0,0,6]},
      label:LBL(p => pc(p.value,2)),
      markLine:{silent:true, symbol:'none', lineStyle:{color:C.gold, type:'dashed', width:1.6},
        data:[{xAxis:D.totals.coverage, label:{formatter:'متوسط المدينة', color:C.gold, fontSize:9.5,
          fontFamily:'Cairo', position:'insideEndTop', rotate:0}}]}
    }]
  }));
  c2 && c2.on('click', p => setSector(covSorted[p.dataIndex].id));
}

/* ---------------- 1.2 تركيبة الطلب ---------------- */
function sc_demand(host){
  const T = D.totals;
  const s = SEC();
  const scopeNote = s
    ? `<div class="note warn" style="margin-top:10px">تركيبة الطلب (الياقات والمجموعات المهنية) متاحة في المصدر على مستوى المدينة فقط — الأرقام أدناه لكامل الرياض وليست للقطاع «${esc(s.name)}».</div>`
    : '';
  host.innerHTML = `
    ${rail([
      railCell('إجمالي الطلب', fmt(T.demand), 'فرد', 'مجموع الياقات ومجموع المجموعات المهنية'),
      railCell('الياقات الزرقاء', fmt(T.blue), 'فرد', `<b class="delta flat">${pc(T.blue/T.demand,1)}</b> من الطلب`),
      railCell('الياقات البيضاء', fmt(T.white), 'فرد', `<b class="delta flat">${pc(T.white/T.demand,1)}</b> من الطلب`),
      railCell('أكبر مجموعة مهنية', fmt(D.activities[0].demand), 'فرد', esc(D.activities[0].name))
    ])}
    <div class="sc-body g-23" style="grid-template-rows:minmax(0,1fr)">
      ${panel('المجموعات المهنية', 'التصنيف المهني لإجمالي العمالة', chartBody('c-act'), {tag:TAG.real})}
      <div class="stack">
        ${panel('نوع الياقة', 'الياقات الزرقاء مقابل البيضاء', chartBody('c-collar'), {tag:TAG.real})}
        ${panel('أبعاد تصنيف إضافية', 'الجنسية · الفئة العمرية · حجم المنشأة', noData('demandProfile'), {tag:TAG.none})}
      </div>
    </div>
    ${scopeNote}`;

  const acts = [...D.activities].sort((a,b) => b.demand - a.demand);
  const c1 = chart('c-act');
  c1 && c1.setOption(base({
    tooltip:Object.assign({}, TT, {trigger:'item', formatter:p => {
      const a = acts[p.dataIndex];
      return ttHead(esc(a.name)) + ttRow('عدد العمالة', fmt(a.demand), C.accent) +
        ttRow('من إجمالي الطلب', pc(a.demand/T.demand,1));
    }}),
    grid:{top:10, right:196, bottom:20, left:88, containLabel:true},
    xAxis:barX(axK, {max:acts[0].demand*1.22}),
    yAxis:barY(acts.map(a => a.name), 186),
    series:[{
      type:'bar', color:C.accent, barWidth:'56%',
      data:acts.map(a => a.demand), itemStyle:{borderRadius:[6,0,0,6]},
      label:LBL(p => `${fmt(p.value)}  ·  ${pc(p.value/T.demand,1)}`)
    }]
  }));

  const c2 = chart('c-collar');
  const cd = [{name:'ياقات زرقاء', value:T.blue}, {name:'ياقات بيضاء', value:T.white}];
  c2 && c2.setOption(base({
    tooltip:Object.assign({}, TT, {trigger:'item', formatter:p =>
      ttHead(esc(p.name)) + ttRow('عدد العمالة', fmt(p.value), p.color) + ttRow('النسبة', pc(p.value/T.demand,1))}),
    grid:{top:6, right:80, bottom:16, left:40, containLabel:true},
    xAxis:barX(axK, {max:T.blue*1.3}),
    yAxis:barY(cd.map(x => x.name), 68),
    series:[{
      type:'bar', barWidth:'46%',
      data:cd.map((x,i) => ({value:x.value, itemStyle:{color:i ? C.accent3 : C.accent, borderRadius:[6,0,0,6]}})),
      label:LBL(p => `${fmt(p.value)} · ${pc(p.value/T.demand,1)}`)
    }]
  }));
}

/* ---------------- 1.3 المعروض المرخص ---------------- */
function sc_supply(host){
  const q = scope();
  const avg = q.opLic ? q.supply/q.opLic : null;
  host.innerHTML = `
    ${rail([
      railCell('الطاقة الاستيعابية', fmt(q.supply), 'سرير', esc(q.label)),
      railCell('الرخص التشغيلية', fmt(q.opLic), 'رخصة', 'رخص سارية في نطاق العرض'),
      railCell('رخص البناء', fmt(q.buildLic), 'رخصة', 'مصدرها الإدارة العامة للتراخيص'),
      railCell('متوسط الأسرّة لكل رخصة تشغيلية', fmt(avg), 'سرير', 'الطاقة ÷ عدد الرخص التشغيلية')
    ])}
    <div class="sc-body g-32" style="grid-template-rows:minmax(0,1fr)">
      <div class="stack">
        ${panel('الطاقة الاستيعابية حسب نوع السكن', 'عدد الرخص ومتوسط الأسرّة لكل رخصة',
          chartBody('c-htype'), {tag:TAG.real})}
        ${panel('معدل الإشغال وسجل المنشآت', 'الأسرّة المشغولة فعلياً ومواقع المنشآت',
          noData('occupancy'), {tag:TAG.none})}
      </div>
      ${panel('القطاعات البلدية — الطاقة الاستيعابية المرخصة',
        'كثافة اللون تعكس حجم الطاقة. انقر قطاعاً لتصفية اللوحة بالكامل.', `
        <div class="mapwrap" id="map-supply"></div>
        <div class="map-leg">
          <span class="lg"><span class="sw" style="background:linear-gradient(to left,#EDF4EF,#0E6B39)"></span>طاقة أقل ← طاقة أعلى</span>
          <span class="lg" style="margin-inline-start:auto">مخطط توضيحي لترتيب القطاعات — ليس خريطة حدود فعلية</span>
        </div>`, {tag:TAG.real, bodyCls:'', cls:''})}
    </div>`;

  drawMap('map-supply', {metric:s => s.capacity, label:'الطاقة', fmtV:v => axK(v)});

  const H = D.housingTypes;
  const c = chart('c-htype');
  c && c.setOption(base({
    tooltip:Object.assign({}, TT, {trigger:'item', formatter:p => {
      const h = H[p.dataIndex];
      return ttHead(esc(h.name)) + ttRow('الطاقة الاستيعابية', fmt(h.capacity), C.accent) +
        ttRow('عدد الرخص', fmt(h.licenses)) + ttRow('متوسط الأسرّة لكل رخصة', fmt1(h.avgBeds)) +
        ttRow('من إجمالي الطاقة', pc(h.capacity/D.totals.supply,1));
    }}),
    grid:{top:8, right:150, bottom:18, left:56, containLabel:true},
    xAxis:barX(axK, {max:Math.max(...H.map(h=>h.capacity))*1.34}),
    yAxis:barY(H.map(h => h.name), 84),
    series:[{
      type:'bar', color:C.accent, barWidth:'50%',
      data:H.map(h => h.capacity), itemStyle:{borderRadius:[6,0,0,6]},
      label:LBL(p => `${fmt(p.value)} سرير · ${fmt(H[p.dataIndex].licenses)} رخصة`)
    }]
  }));
}

/* ---------------- 2.1 التراخيص — مقابل خط الأساس ---------------- */
function sc_licOverview(host){
  const L = D.licDelta;
  const card = (k, key, unit) => {
    const d = L[key];
    /* الجهة المنتجة غير المحددة لا تُوسم بلون البيانات المعتمدة */
    const owned = d.owner && !d.owner.includes('غير محدد');
    return `<div class="panel">
      <div class="p-head"><h3>${esc(d.label)}</h3>
        <div class="p-tag"><span class="tag ${owned ? 't-real' : 't-sample'}">${esc(d.owner||'—')}</span></div></div>
      <div class="p-body">
        <div style="display:flex;align-items:baseline;gap:12px">
          <div class="hero-num lg num">${fmt(d.current)}</div>
          <div style="font-size:11px;color:var(--mut);font-weight:600">${esc(unit)}<br>
            <span class="delta up">+${fmt(d.change)} (${pc(d.pct,0)})</span></div>
        </div>
        <div style="font-size:11px;color:var(--faint);margin-top:6px">
          خط الأساس ${ltr(fmt(d.baseline))} في ${fmtDate(d.baselineDate)}
        </div>
        <div class="chart" id="lo-c-${key}" style="flex:1;min-height:96px;margin-top:6px"></div>
      </div>
    </div>`;
  };
  host.innerHTML = `
    <div class="sc-body" style="grid-template-rows:minmax(120px,.85fr) minmax(0,1.9fr)">
      ${imghead('التراخيص', 'من خط الأساس إلى الوضع الحالي',
        `خلال اثني عشر شهراً ارتفعت الطاقة الاستيعابية المرخصة من ${ltr(fmt(L.capacity.baseline))} إلى ${ltr(fmt(L.capacity.current))} سرير — بزيادة قدرها ${pc(L.capacity.pct,0)}.`,
        'lic')}
      <div class="sc-body g-3" style="grid-template-rows:minmax(0,1fr)">
        ${card('', 'building', 'رخصة')}
        ${card('', 'operational', 'رخصة')}
        ${card('', 'capacity', 'سرير')}
      </div>
    </div>`;

  ['building','operational','capacity'].forEach(key => {
    const d = L[key];
    const c = chart('lo-c-'+key);
    c && c.setOption(base({
      tooltip:Object.assign({}, TT, {trigger:'axis', axisPointer:{type:'shadow'}, formatter:ps =>
        ttHead(esc(ps[0].name)) + ttRow(esc(d.label), fmt(ps[0].value), ps[0].color)}),
      grid:{top:16, right:14, bottom:20, left:14, containLabel:true},
      xAxis:catX(['خط الأساس','الحالي'], {axisLabel:{color:C.mut, fontSize:10.5, fontFamily:'Cairo'}}),
      yAxis:valY(axK, {max:niceMax(d.current*1.2)}),
      series:[{
        type:'bar', barWidth:'40%',
        data:[
          {value:d.baseline, itemStyle:{color:'#D8DDD8', borderRadius:[5,5,0,0]}},
          {value:d.current,  itemStyle:{color:C.accent,  borderRadius:[5,5,0,0]}}
        ],
        label:{show:true, position:'top', color:C.ink2, fontFamily:'IBM Plex Sans Arabic',
          fontSize:10.5, fontWeight:600, formatter:p => fmt(p.value)}
      }]
    }));
  });
}

/* ---------------- 2.2 المسار الشهري ---------------- */
function sc_licFlow(host){
  const M = D.licMonthly.filter(m => !m.isBaseline);
  const base0 = D.licMonthly.find(m => m.isBaseline);
  const best = M.reduce((a,b) => b.newCap > a.newCap ? b : a);
  host.innerHTML = `
    ${rail([
      railCell('الطاقة المضافة خلال الفترة', fmt(D.licDelta.capacity.change), 'سرير',
        `على مدى ${cnt(M.length,'شهر واحد','شهرين','أشهر','شهراً')} من سبتمبر 2025`),
      railCell('أعلى شهر إضافةً', fmt(best.newCap), 'سرير', esc(best.label)),
      railCell('متوسط الإضافة الشهرية', fmt(D.foresight.avgMonthlyCapacity), 'سرير',
        `محسوب على ${cnt(D.foresight.activeMonths,'شهر','شهرين','أشهر','شهراً')} بإضافة فعلية`),
      railCell('الرصيد التراكمي الحالي', fmt(D.totals.supply), 'سرير', 'يطابق الطاقة الاستيعابية المعلنة')
    ])}
    <div class="sc-body g-23" style="grid-template-rows:minmax(0,1fr)">
      ${panel('الإضافات الشهرية والرصيد التراكمي للطاقة الاستيعابية',
        'الأعمدة = المضاف شهرياً · الخط = الرصيد التراكمي', chartBody('c-licflow'), {tag:TAG.real})}
      <div class="stack">
        ${panel('الرصيد التراكمي للرخص', 'رخص البناء مقابل الرخص التشغيلية', chartBody('c-liccum'), {tag:TAG.real})}
        ${panel('مسار الطلبات ومدة الإصدار', 'الطلبات المستلمة والمغلقة ومتوسط أيام المعالجة',
          noData('licDuration'), {tag:TAG.none})}
      </div>
    </div>`;

  const c1 = chart('c-licflow');
  c1 && c1.setOption(base({
    tooltip:Object.assign({}, TT, {trigger:'axis', axisPointer:{type:'shadow'}, formatter:ps => {
      const m = M.find(x => x.label === ps[0].name);
      return ttHead(esc(m.label)) + ttRow('الطاقة المضافة', fmt(m.newCap), C.accent) +
        ttRow('الرصيد التراكمي', fmt(m.cumCap), C.gold) +
        ttRow('رخص تشغيلية جديدة', fmt(m.newOp)) + ttRow('رخص بناء جديدة', fmt(m.newBuild));
    }}),
    legend:{data:['الطاقة المضافة شهرياً','الرصيد التراكمي'], bottom:0,
      textStyle:{color:C.mut, fontSize:11, fontFamily:'Cairo'}, itemWidth:11, itemHeight:11, itemGap:16},
    grid:{top:16, right:52, bottom:46, left:52, containLabel:true},
    xAxis:catX(M.map(m => AR_MONTH_SHORT(m.label)), {axisLabel:{color:C.mut, fontSize:9.5,
      fontFamily:'Cairo', interval:0, rotate:34}}),
    yAxis:[
      valY(axK),
      Object.assign(valY(axK), {position:'left', splitLine:{show:false},
        axisLabel:{color:C.faint, fontSize:9.5, fontFamily:'IBM Plex Sans Arabic', formatter:axK}})
    ],
    series:[
      {name:'الطاقة المضافة شهرياً', type:'bar', color:C.accent, yAxisIndex:0,
       data:M.map(m => m.newCap), barWidth:'46%', itemStyle:{borderRadius:[5,5,0,0]}},
      {name:'الرصيد التراكمي', type:'line', color:C.gold, yAxisIndex:1, smooth:true,
       symbol:'circle', symbolSize:5, lineStyle:{width:2.2},
       data:M.map(m => m.cumCap)}
    ]
  }));

  const c2 = chart('c-liccum');
  c2 && c2.setOption(base({
    tooltip:Object.assign({}, TT, {trigger:'axis', formatter:ps =>
      ttHead(esc(ps[0].name)) + ps.map(p => ttRow(p.seriesName, fmt(p.value), p.color)).join('')}),
    legend:{data:['الرخص التشغيلية','رخص البناء'], bottom:0,
      textStyle:{color:C.mut, fontSize:10.5, fontFamily:'Cairo'}, itemWidth:10, itemHeight:10, itemGap:14},
    grid:{top:12, right:44, bottom:44, left:16, containLabel:true},
    xAxis:catX([base0, ...M].map(m => AR_MONTH_SHORT(m.label)),
      {axisLabel:{color:C.mut, fontSize:9, fontFamily:'Cairo', interval:1, rotate:34}}),
    yAxis:valY(axK),
    series:[
      {name:'الرخص التشغيلية', type:'line', color:C.accent, smooth:true, symbol:'circle', symbolSize:4,
       lineStyle:{width:2.2}, areaStyle:{color:'rgba(14,107,57,.08)'},
       data:[base0, ...M].map(m => m.cumOp)},
      {name:'رخص البناء', type:'line', color:C.slate, smooth:true, symbol:'circle', symbolSize:4,
       lineStyle:{width:1.8}, data:[base0, ...M].map(m => m.cumBuild)}
    ]
  }));
}

/* ---------------- 2.3 التوزيع القطاعي ---------------- */
function sc_licDist(host){
  const U = D.unassigned;
  host.innerHTML = `
    <div class="sc-body" style="grid-template-rows:minmax(0,1fr) auto">
      <div class="sc-body g-3" style="grid-template-rows:minmax(0,1fr)">
        ${panel('الرخص حسب القطاع البلدي', 'رخص البناء مقابل الرخص التشغيلية',
          chartBody('c-licsec'), {tag:TAG.real})}
        ${panel('الطاقة الاستيعابية حسب القطاع', 'عدد الأسرّة المرخصة', chartBody('c-capsec'), {tag:TAG.real})}
        ${panel('أنواع المساكن', 'الرخص والطاقة ومتوسط السعة', `
          <div class="tw"><table>
            <thead><tr><th>نوع السكن</th><th class="n">الرخص</th><th class="n">الطاقة</th><th class="n">متوسط السعة</th></tr></thead>
            <tbody>${D.housingTypes.map(h => `<tr>
              <td class="nm">${esc(h.name)}</td>
              <td class="n">${fmt(h.licenses)}</td>
              <td class="n">${fmt(h.capacity)}</td>
              <td class="n">${fmt1(h.avgBeds)}</td></tr>`).join('')}
              <tr><td class="nm" style="color:var(--mut)">الإجمالي</td>
                <td class="n">${fmt(D.totals.operationalLic)}</td>
                <td class="n">${fmt(D.totals.supply)}</td>
                <td class="n">${fmt1(D.totals.supply/D.totals.operationalLic)}</td></tr>
            </tbody></table></div>`, {tag:TAG.real})}
      </div>
      <div class="note warn">
        <b>بند يحتاج قراراً:</b> يتضمن المصدر صف «${esc(U.name)}» بـ ${cnt(U.buildLic,'رخصة بناء واحدة','رخصتَي بناء','رخص بناء','رخصة بناء')}
        وبطاقة استيعابية صفرية. ${esc(U.note)}
        هذه الرخص محتسبة ضمن إجمالي رخص البناء (${fmt(D.totals.buildingLic)}) وغير محتسبة في أي قطاع.
      </div>
    </div>`;

  const secs = D.sectors;
  const c1 = chart('c-licsec');
  c1 && c1.setOption(base({
    tooltip:Object.assign({}, TT, {trigger:'axis', axisPointer:{type:'shadow'}, formatter:ps => {
      const s = secs.find(x => x.short === ps[0].name);
      return ttHead(esc(s.name)) + ttRow('الرخص التشغيلية', fmt(s.opLic), C.accent) +
        ttRow('رخص البناء', fmt(s.buildLic), C.slate) + ttRow('إجمالي الرخص', fmt(s.totalLic));
    }}),
    legend:{data:['الرخص التشغيلية','رخص البناء'], bottom:0,
      textStyle:{color:C.mut, fontSize:10.5, fontFamily:'Cairo'}, itemWidth:10, itemHeight:10, itemGap:14},
    grid:{top:12, right:60, bottom:38, left:20, containLabel:true},
    xAxis:barX(v => fmt(v)), yAxis:barY(secs.map(s => s.short), 44),
    series:[
      {name:'الرخص التشغيلية', type:'bar', color:C.accent, data:secs.map(s => s.opLic),
       itemStyle:{borderRadius:[5,0,0,5]}, label:LBL(p => fmt(p.value))},
      {name:'رخص البناء', type:'bar', color:C.slate, data:secs.map(s => s.buildLic),
       itemStyle:{borderRadius:[5,0,0,5]}, label:LBL(p => p.value ? fmt(p.value) : '')}
    ]
  }));
  c1 && c1.on('click', p => { const s = secs.find(x => x.short === p.name); s && setSector(s.id); });

  const capSorted = [...secs].sort((a,b) => b.capacity - a.capacity);
  const c2 = chart('c-capsec');
  c2 && c2.setOption(base({
    tooltip:Object.assign({}, TT, {trigger:'item', formatter:p => {
      const s = capSorted[p.dataIndex];
      return ttHead(esc(s.name)) + ttRow('الطاقة الاستيعابية', fmt(s.capacity), C.accent) +
        ttRow('من إجمالي الطاقة', pc(s.capacity/D.totals.supply,1)) +
        ttRow('الرخص التشغيلية', fmt(s.opLic));
    }}),
    grid:{top:10, right:96, bottom:20, left:20, containLabel:true},
    xAxis:barX(axK, {max:capSorted[0].capacity*1.3}), yAxis:barY(capSorted.map(s => s.short), 44),
    series:[{type:'bar', color:C.accent, barWidth:'56%', data:capSorted.map(s => s.capacity),
      itemStyle:{borderRadius:[6,0,0,6]},
      label:LBL(p => `${fmt(p.value)} · ${pc(p.value/D.totals.supply,0)}`)}]
  }));
  c2 && c2.on('click', p => setSector(capSorted[p.dataIndex].id));
}

/* ---------------- 3.1 منظومة الرقابة ---------------- */
function sc_ctlOverview(host){
  const q = scope();
  const rate = q.visits ? q.violations/q.visits : null;
  const perInspector = q.inspectors ? q.visits/q.inspectors : null;
  host.innerHTML = `
    <div class="sc-body" style="grid-template-rows:minmax(96px,.62fr) auto minmax(0,1.5fr)">
      ${imghead('الرقابة والامتثال', 'جولات ميدانية على مدى اثني عشر شهراً',
        `${fmt(D.totals.visits)} زيارة رقابية رصدت ${fmt(D.totals.violations)} مخالفة، بنسبة امتثال معلنة قدرها ${pc(D.totals.compliance,1)}.`,
        'ctl')}
      ${rail([
        railCell('عدد المراقبين', fmt(q.inspectors), 'مراقب', esc(q.label)),
        railCell('الزيارات الرقابية', fmt(q.visits), 'زيارة', `${fmt(perInspector)} زيارة لكل مراقب`),
        railCell('المخالفات المرصودة', fmt(q.violations), 'مخالفة',
          `<b class="delta dn">${pc(rate,1)}</b> معدل المخالفة لكل زيارة`),
        railCell('نسبة الامتثال', pc(D.totals.compliance,1), '',
          scope().national ? 'قيمة معلنة على مستوى المدينة' : 'قيمة معلنة على مستوى المدينة — غير مفصّلة قطاعياً')
      ])}
      <div class="sc-body g-3" style="grid-template-rows:minmax(0,1fr)">
        ${panel('الزيارات والمخالفات حسب القطاع', 'حجم النشاط الرقابي ومخرجاته',
          chartBody('c-ctlsec'), {tag:TAG.real})}
        ${panel('معدل المخالفة لكل زيارة', 'المخالفات ÷ الزيارات — لكل قطاع',
          chartBody('c-ctlrate'), {tag:TAG.calc})}
        ${panel('الإغلاقات', 'عدد المنشآت المغلقة إدارياً', noData('closures'), {tag:TAG.none})}
      </div>
    </div>`;

  const secs = D.sectors;
  const c1 = chart('c-ctlsec');
  c1 && c1.setOption(base({
    tooltip:Object.assign({}, TT, {trigger:'axis', axisPointer:{type:'shadow'}, formatter:ps => {
      const s = secs.find(x => x.short === ps[0].name);
      return ttHead(esc(s.name)) + ttRow('الزيارات', fmt(s.visits), C.accent) +
        ttRow('المخالفات', fmt(s.violations), C.bad) +
        ttRow('المراقبون', fmt(s.inspectors)) +
        ttRow('معدل المخالفة', pc(s.violations/s.visits,1));
    }}),
    legend:{data:['الزيارات','المخالفات'], bottom:0,
      textStyle:{color:C.mut, fontSize:10.5, fontFamily:'Cairo'}, itemWidth:10, itemHeight:10, itemGap:14},
    grid:{top:12, right:66, bottom:38, left:20, containLabel:true},
    xAxis:barX(axK), yAxis:barY(secs.map(s => s.short), 44),
    series:[
      {name:'الزيارات', type:'bar', color:C.accent, data:secs.map(s => s.visits),
       itemStyle:{borderRadius:[5,0,0,5]}, label:LBL(p => fmt(p.value))},
      {name:'المخالفات', type:'bar', color:C.bad, data:secs.map(s => s.violations),
       itemStyle:{borderRadius:[5,0,0,5]}, label:LBL(p => fmt(p.value))}
    ]
  }));
  c1 && c1.on('click', p => { const s = secs.find(x => x.short === p.name); s && setSector(s.id); });

  const rt = [...secs].map(s => ({...s, r:s.violations/s.visits})).sort((a,b) => b.r - a.r);
  const c2 = chart('c-ctlrate');
  c2 && c2.setOption(base({
    tooltip:Object.assign({}, TT, {trigger:'item', formatter:p => {
      const s = rt[p.dataIndex];
      return ttHead(esc(s.name)) + ttRow('معدل المخالفة', pc(s.r,1), C.bad) +
        ttRow('المخالفات', fmt(s.violations)) + ttRow('الزيارات', fmt(s.visits));
    }}),
    grid:{top:10, right:66, bottom:20, left:20, containLabel:true},
    xAxis:barX(v => pcRaw(v,0)+'٪', {max:rt[0].r*1.28}), yAxis:barY(rt.map(s => s.short), 44),
    series:[{type:'bar', color:C.bad, barWidth:'56%', data:rt.map(s => s.r),
      itemStyle:{borderRadius:[6,0,0,6]}, label:LBL(p => pc(p.value,1)),
      markLine:{silent:true, symbol:'none', lineStyle:{color:C.gold, type:'dashed', width:1.6},
        data:[{xAxis:D.totals.violations/D.totals.visits, label:{formatter:'متوسط المدينة',
          color:C.gold, fontSize:9.5, fontFamily:'Cairo', position:'insideEndTop', rotate:0}}]}}]
  }));
  c2 && c2.on('click', p => setSector(rt[p.dataIndex].id));
}

/* ---------------- 3.2 الاتجاه الشهري ---------------- */
function sc_ctlTrend(host){
  const M = D.inspMonthly;
  const maxV = M.reduce((a,b) => b.visits > a.visits ? b : a);
  const maxX = M.reduce((a,b) => b.violations > a.violations ? b : a);
  const avgR = D.totals.violations/D.totals.visits;
  const first = M[0], last = M[M.length-1];
  const dV = (last.visits - first.visits)/first.visits;
  host.innerHTML = `
    ${rail([
      railCell('متوسط الزيارات الشهرية', fmt(D.totals.visits/M.length), 'زيارة',
        `على مدى ${cnt(M.length,'شهر','شهرين','أشهر','شهراً')}`),
      railCell('أعلى شهر زيارات', fmt(maxV.visits), 'زيارة', esc(maxV.label)),
      railCell('أعلى شهر مخالفات', fmt(maxX.violations), 'مخالفة', esc(maxX.label)),
      railCell('التغير في الزيارات', `${dV>=0?'+':''}${pcRaw(dV,1)}٪`, '',
        `${esc(last.label)} مقابل ${esc(first.label)}`, dV>=0?'':'mut')
    ])}
    <div class="sc-body g-23" style="grid-template-rows:minmax(0,1fr)">
      ${panel('الزيارات الرقابية والمخالفات شهرياً', 'الأعمدة = الزيارات · الخط = المخالفات',
        chartBody('c-trend'), {tag:TAG.real})}
      <div class="stack">
        ${panel('معدل المخالفة لكل زيارة', 'شهرياً — الخط الذهبي هو متوسط الفترة',
          chartBody('c-rate'), {tag:TAG.calc})}
        ${panel('', '', `<div class="note">
          <b>قراءة الفترة:</b> ارتفعت الزيارات من ${ltr(fmt(first.visits))} في ${esc(first.label)}
          إلى ${ltr(fmt(last.visits))} في ${esc(last.label)}، بينما بقي معدل المخالفة لكل زيارة
          في نطاق ضيق حول ${pc(avgR,1)} — أي أن الزيادة في المخالفات المرصودة تتبع اتساع التغطية
          الرقابية أكثر من كونها تدهوراً في الامتثال.
        </div>`, {cls:'bare'})}
      </div>
    </div>`;

  const c1 = chart('c-trend');
  c1 && c1.setOption(base({
    tooltip:Object.assign({}, TT, {trigger:'axis', axisPointer:{type:'shadow'}, formatter:ps => {
      const m = M.find(x => AR_MONTH_SHORT(x.label) === ps[0].name);
      return ttHead(esc(m.label)) + ttRow('الزيارات', fmt(m.visits), C.accent) +
        ttRow('المخالفات', fmt(m.violations), C.bad) + ttRow('معدل المخالفة', pc(m.rate,1));
    }}),
    legend:{data:['الزيارات الرقابية','المخالفات'], bottom:0,
      textStyle:{color:C.mut, fontSize:11, fontFamily:'Cairo'}, itemWidth:11, itemHeight:11, itemGap:16},
    grid:{top:16, right:50, bottom:46, left:46, containLabel:true},
    xAxis:catX(M.map(m => AR_MONTH_SHORT(m.label)),
      {axisLabel:{color:C.mut, fontSize:9.5, fontFamily:'Cairo', interval:0, rotate:34}}),
    yAxis:[valY(axK), Object.assign(valY(axK), {position:'left', splitLine:{show:false}})],
    series:[
      {name:'الزيارات الرقابية', type:'bar', color:C.accent, yAxisIndex:0,
       data:M.map(m => m.visits), barWidth:'48%', itemStyle:{borderRadius:[5,5,0,0]}},
      {name:'المخالفات', type:'line', color:C.bad, yAxisIndex:1, smooth:true,
       symbol:'circle', symbolSize:5, lineStyle:{width:2.2}, data:M.map(m => m.violations)}
    ]
  }));

  const c2 = chart('c-rate');
  c2 && c2.setOption(base({
    tooltip:Object.assign({}, TT, {trigger:'axis', formatter:ps => {
      const m = M.find(x => AR_MONTH_SHORT(x.label) === ps[0].name);
      return ttHead(esc(m.label)) + ttRow('معدل المخالفة', pc(m.rate,2), C.info);
    }}),
    grid:{top:14, right:44, bottom:40, left:14, containLabel:true},
    xAxis:catX(M.map(m => AR_MONTH_SHORT(m.label)),
      {axisLabel:{color:C.mut, fontSize:9, fontFamily:'Cairo', interval:1, rotate:34}}),
    yAxis:valY(v => pcRaw(v,0)+'٪'),
    series:[{type:'line', color:C.info, smooth:true, symbol:'circle', symbolSize:4,
      lineStyle:{width:2.2}, areaStyle:{color:'rgba(51,98,143,.07)'}, data:M.map(m => m.rate),
      markLine:{silent:true, symbol:'none', lineStyle:{color:C.gold, type:'dashed', width:1.6},
        data:[{yAxis:avgR, label:{formatter:'متوسط الفترة', color:C.gold, fontSize:9.5,
          fontFamily:'Cairo', position:'insideEndTop', rotate:0}}]}}]
  }));
}

/* ---------------- 3.3 أنواع المخالفات ---------------- */
function sc_ctlViol(host){
  const V = D.violTypes, T = D.totals.violations;
  const top3 = V.slice(0,3).reduce((a,v) => a+v.count, 0);
  host.innerHTML = `
    ${rail([
      railCell('إجمالي المخالفات', fmt(T), 'مخالفة', 'آخر 12 شهراً'),
      railCell('أعلى فئة مخالفة', fmt(V[0].count), 'مخالفة', esc(V[0].name)),
      railCell('تركّز الفئات الثلاث الأعلى', pc(top3/T,1), '', 'من إجمالي المخالفات'),
      railCell('عدد فئات المخالفات', fmt(V.length), 'فئة', 'وفق تصنيف المصدر')
    ])}
    <div class="sc-body g-23" style="grid-template-rows:minmax(0,1fr)">
      ${panel('المخالفات حسب النوع', 'ترتيب الفئات حسب عدد المخالفات المرصودة',
        chartBody('c-violtype'), {tag:TAG.real})}
      <div class="stack">
        ${panel('توزيع المخالفات على القطاعات', 'إجمالي المخالفات لكل قطاع بلدي',
          chartBody('c-violsec'), {tag:TAG.real})}
        ${panel('الغرامات وأداء المراقبين', 'المبالغ المحصّلة وأداء كل مراقب على حدة',
          noData('fines'), {tag:TAG.none})}
      </div>
    </div>`;

  const c1 = chart('c-violtype');
  c1 && c1.setOption(base({
    tooltip:Object.assign({}, TT, {trigger:'item', formatter:p => {
      const v = V[p.dataIndex];
      return ttHead(esc(v.name)) + ttRow('عدد المخالفات', fmt(v.count), C.bad) +
        ttRow('من الإجمالي', pc(v.count/T,1));
    }}),
    grid:{top:10, right:200, bottom:18, left:60, containLabel:true},
    xAxis:barX(v => fmt(v), {max:V[0].count*1.24}),
    yAxis:barY(V.map(v => v.name), 190),
    series:[{type:'bar', color:C.bad, barWidth:'54%', data:V.map(v => v.count),
      itemStyle:{borderRadius:[6,0,0,6]},
      label:LBL(p => `${fmt(p.value)} · ${pc(p.value/T,1)}`)}]
  }));

  const vs = [...D.sectors].sort((a,b) => b.violations - a.violations);
  const c2 = chart('c-violsec');
  c2 && c2.setOption(base({
    tooltip:Object.assign({}, TT, {trigger:'item', formatter:p => {
      const s = vs[p.dataIndex];
      return ttHead(esc(s.name)) + ttRow('المخالفات', fmt(s.violations), C.bad) +
        ttRow('من الإجمالي', pc(s.violations/T,1)) + ttRow('الزيارات', fmt(s.visits));
    }}),
    grid:{top:10, right:76, bottom:18, left:20, containLabel:true},
    xAxis:barX(v => fmt(v), {max:vs[0].violations*1.3}), yAxis:barY(vs.map(s => s.short), 44),
    series:[{type:'bar', color:C.bad, barWidth:'56%', data:vs.map(s => s.violations),
      itemStyle:{borderRadius:[6,0,0,6]},
      label:LBL(p => `${fmt(p.value)} · ${pc(p.value/T,0)}`)}]
  }));
  c2 && c2.on('click', p => setSector(vs[p.dataIndex].id));
}

/* ---------------- 3.4 سجل الأحياء ---------------- */
function sc_ctlAreas(host){
  const all = D.neighborhoods;
  const list = () => all.filter(n => !S.sector || n.sectorId === S.sector);
  const N = list();
  const totV = N.reduce((a,n) => a+n.violations, 0);
  const totC = N.reduce((a,n) => a+n.capacity, 0);
  const top = [...N].sort((a,b) => b.violations - a.violations).slice(0,10);
  const mxV = Math.max(...N.map(n => n.violations), 1);

  host.innerHTML = `
    ${rail([
      railCell('عدد الأحياء في السجل', fmt(N.length), 'حي', esc(SECNAME())),
      railCell('الطاقة الاستيعابية المسجلة', fmt(totC), 'سرير', 'مجموع أحياء السجل'),
      railCell('المخالفات المسجلة', fmt(totV), 'مخالفة', 'مجموع أحياء السجل'),
      railCell('أعلى الأحياء مخالفات', fmt(top[0] ? top[0].violations : 0), 'مخالفة',
        top[0] ? esc(top[0].name) : '—')
    ])}
    <div class="sc-body g-32" style="grid-template-rows:minmax(0,1fr)">
      <div class="stack">
        ${panel('أعلى الأحياء مخالفاتٍ', 'الأحياء العشرة الأولى في السجل',
          chartBody('c-areas'), {tag:TAG.sample})}
        ${panel('خريطة النقاط الساخنة', 'توطين المخالفات جغرافياً',
          noData('hotspots'), {tag:TAG.none})}
      </div>
      ${panel('سجل الأحياء', `${fmt(N.length)} حياً — انقر أي صف لعرض تفاصيله`, `
        <div class="tw"><table>
          <thead><tr><th>الحي</th><th>القطاع</th><th class="n">رخص البناء</th>
            <th class="n">التشغيلية</th><th class="n">الطاقة</th><th class="n">المخالفات</th></tr></thead>
          <tbody>${N.map(n => `<tr data-nb="${n.id}" style="cursor:pointer">
            <td class="nm">${esc(n.name)}</td>
            <td style="color:var(--mut)">${esc(n.sector)}</td>
            <td class="n">${fmt(n.buildLic)}</td>
            <td class="n">${fmt(n.opLic)}</td>
            <td class="n">${fmt(n.capacity)}</td>
            <td class="n bar-cell"><span class="bc" style="width:${(n.violations/mxV*100).toFixed(1)}%"></span>
              <span>${fmt(n.violations)}</span></td></tr>`).join('')}
          </tbody></table></div>`, {tag:TAG.sample})}
    </div>
    <div class="note warn">
      <b>تنبيه على الجودة:</b> يصنّف المصدر بيانات الأحياء بأنها «عينة» لم تُحدَّث، وعمودا خط العرض
      وخط الطول فارغان — لذلك تُعرض هنا كسجل جدولي فقط، ولا تُبنى عليها خريطة أو أي رقم في المشاهد الأخرى.
    </div>`;

  host.querySelectorAll('tr[data-nb]').forEach(tr => {
    tr.onclick = () => {
      const n = all.find(x => x.id === tr.dataset.nb);
      openDrawer(esc(n.name), esc(n.sector),
        drSec('التراخيص والطاقة') +
        fld('رخص البناء', fmt(n.buildLic)) +
        fld('الرخص التشغيلية', fmt(n.opLic)) +
        fld('الطاقة الاستيعابية', fmt(n.capacity) + ' سرير') +
        drSec('الرقابة') +
        fld('المخالفات المسجلة', fmt(n.violations)) +
        fld('الزيارات الرقابية', n.visits == null ? '<span style="color:var(--faint)">غير متوفرة</span>' : fmt(n.visits)) +
        drSec('الإحداثيات') +
        fld('خط العرض', n.lat == null ? '<span style="color:var(--faint)">غير متوفر</span>' : n.lat) +
        fld('خط الطول', n.lng == null ? '<span style="color:var(--faint)">غير متوفر</span>' : n.lng) +
        drSec('المصدر') +
        fld('جودة البيانات', `<span class="st st-warn">${esc(n.quality)}</span>`) +
        fld('الورقة', '13_الأحياء'));
    };
  });

  const c = chart('c-areas');
  c && c.setOption(base({
    tooltip:Object.assign({}, TT, {trigger:'item', formatter:p => {
      const n = top[p.dataIndex];
      return ttHead(esc(n.name)) + ttRow('المخالفات', fmt(n.violations), C.bad) +
        ttRow('القطاع', esc(n.sector)) + ttRow('الطاقة', fmt(n.capacity));
    }}),
    grid:{top:8, right:66, bottom:18, left:20, containLabel:true},
    xAxis:barX(v => fmt(v), {max:(top[0]?top[0].violations:1)*1.28}),
    yAxis:barY(top.map(n => n.name), 92),
    series:[{type:'bar', color:C.bad, barWidth:'62%', data:top.map(n => n.violations),
      itemStyle:{borderRadius:[5,0,0,5]}, label:LBL(p => fmt(p.value))}]
  }));
}

/* ---------------- 4.1 حالة المبادرات ---------------- */
const ST_COLOR = {'منجزة':C.ok, 'جاري العمل':C.info, 'متأخرة':C.bad, 'لم تبدأ بعد':C.slate};
const ST_CLASS = {'منجزة':'st-ok', 'جاري العمل':'st-run', 'متأخرة':'st-late', 'لم تبدأ بعد':'st-wait'};
const ST_ORDER = ['منجزة','جاري العمل','متأخرة','لم تبدأ بعد'];

function sc_iniStatus(host){
  const I = D.initiatives;
  const byS = st => I.filter(x => x.status === st).length;
  const late = I.filter(x => x.status === 'متأخرة');
  host.innerHTML = `
    <div class="sc-body" style="grid-template-rows:auto auto minmax(0,1fr)">
      ${rail([
        railCell('إجمالي المبادرات', fmt(I.length), 'مبادرة', 'موزعة على أربعة أهداف'),
        railCell('منجزة', fmt(byS('منجزة')), 'مبادرة', `${pc(byS('منجزة')/I.length,0)} من الإجمالي`),
        railCell('جاري العمل', fmt(byS('جاري العمل')), 'مبادرة', `${pc(byS('جاري العمل')/I.length,0)} من الإجمالي`),
        railCell('متأخرة', fmt(byS('متأخرة')), 'مبادرة',
          `<b class="delta dn">${pc(byS('متأخرة')/I.length,0)}</b> تجاوزت تاريخ الانتهاء`)
      ])}
      <div class="sc-body g-4" style="grid-template-rows:auto">
        ${D.goals.map(g => {
          const gi = I.filter(x => x.goalId === g.id);
          const done = gi.filter(x => x.status === 'منجزة').length;
          return `<div class="goal-card${S.goal===g.id?' on':''}" data-goal="${g.id}">
            <div class="gc-k">${esc(g.name)}</div>
            <div class="gc-t">${esc(g.desc)}</div>
            <div class="gc-b">
              <div class="gc-v">${fmt(gi.length)}</div>
              <div class="gc-s">${cnt(gi.length,'مبادرة واحدة','مبادرتان','مبادرات','مبادرة').replace(/^[\d,]+\s/,'')} · ${fmt(done)} منجزة</div>
            </div>
            <div class="gc-bar">${ST_ORDER.map(s => {
              const n = gi.filter(x => x.status === s).length;
              return n ? `<i style="flex:${n};background:${ST_COLOR[s]}"></i>` : '';
            }).join('')}</div>
          </div>`;
        }).join('')}
      </div>
      <div class="sc-body g-23" style="grid-template-rows:minmax(0,1fr)">
        ${panel('المبادرات حسب الهدف والحالة', 'التوزيع التفصيلي لكل هدف',
          chartBody('c-inigoal'), {tag:TAG.real})}
        <div class="stack">
          ${panel('المبادرات المتأخرة', `${cnt(late.length,'مبادرة واحدة','مبادرتان','مبادرات','مبادرة')} تجاوزت تاريخ الانتهاء المخطط`, `
            <div class="scroll">${late.sort((a,b) => b.overdueDays - a.overdueDays).map(x => `
              <div class="list-row" data-ini="${x.id}" style="cursor:pointer">
                <span class="lr-n">${esc(x.num)}</span>
                <span class="lr-t">${esc(x.name)}</span>
                <span class="lr-d" style="color:var(--bad);font-weight:700">${fmt(x.overdueDays)} يوماً</span>
              </div>`).join('')}</div>`, {tag:TAG.real})}
          ${panel('نسب الإنجاز والميزانيات', 'نسبة إنجاز وميزانية ومعلم قادم لكل مبادرة',
            noData('iniProgress'), {tag:TAG.none})}
        </div>
      </div>
    </div>`;

  host.querySelectorAll('[data-goal]').forEach(g => {
    g.onclick = () => { S.goal = S.goal === g.dataset.goal ? '' : g.dataset.goal; goScene(sceneIdx('s4_register')); };
  });
  host.querySelectorAll('[data-ini]').forEach(r => {
    r.onclick = () => iniDrawer(D.initiatives.find(x => x.id === r.dataset.ini));
  });

  const c = chart('c-inigoal');
  c && c.setOption(base({
    tooltip:Object.assign({}, TT, {trigger:'axis', axisPointer:{type:'shadow'}, formatter:ps => {
      const g = D.goals.find(x => x.name === ps[0].name);
      return ttHead(`${esc(g.name)} — ${esc(g.desc)}`) +
        ps.filter(p => p.value).map(p => ttRow(p.seriesName, fmt(p.value), p.color)).join('') +
        ttRow('الإجمالي', fmt(D.initiatives.filter(x => x.goalId === g.id).length));
    }}),
    legend:{data:ST_ORDER, bottom:0, textStyle:{color:C.mut, fontSize:10.5, fontFamily:'Cairo'},
      itemWidth:10, itemHeight:10, itemGap:14},
    grid:{top:12, right:52, bottom:38, left:20, containLabel:true},
    xAxis:barX(v => fmt(v)), yAxis:barY(D.goals.map(g => g.name), 52),
    series:ST_ORDER.map((st,i) => ({
      name:st, type:'bar', stack:'s', color:ST_COLOR[st],
      data:D.goals.map(g => D.initiatives.filter(x => x.goalId === g.id && x.status === st).length),
      itemStyle:{borderRadius:i === ST_ORDER.length-1 ? [5,0,0,5] : 0},
      label:{show:true, position:'inside', color:'#fff', fontSize:10, fontFamily:'IBM Plex Sans Arabic',
        fontWeight:600, formatter:p => p.value || ''}
    }))
  }));
}

/* ---------------- 4.2 الجدول الزمني ---------------- */
function sc_iniTimeline(host){
  const I = D.initiatives.filter(x => x.start && x.end);
  const noDates = D.initiatives.filter(x => !x.start || !x.end);
  const t0 = Math.min(...I.map(x => +new Date(x.start)));
  const t1 = Math.max(...I.map(x => +new Date(x.end)));
  const span = t1 - t0;
  const today = +new Date(D.meta.today);
  const pos = t => ((t - t0)/span)*100;

  /* أرباع السنة الممتدة على المدى */
  const quarters = [];
  let d = new Date(t0); d.setDate(1); d.setMonth(Math.floor(d.getMonth()/3)*3);
  while(+d <= t1){
    const nx = new Date(d); nx.setMonth(nx.getMonth()+3);
    quarters.push({label:`الربع ${Math.floor(d.getMonth()/3)+1} · ${d.getFullYear()}`, a:+d, b:Math.min(+nx,t1)});
    d = nx;
  }

  host.innerHTML = `
    <div class="sc-body" style="grid-template-rows:minmax(0,1fr) auto">
      ${panel('المخطط الزمني للمبادرات', `${fmt(I.length)} مبادرة ذات تواريخ محددة — الخط الرأسي هو تاريخ اليوم المرجعي ${fmtDate(D.meta.today)}`, `
        <div class="gantt">
          <div class="gt-scale" style="margin-inline-start:0">
            <div style="width:230px;flex:0 0 auto"></div>
            <div style="flex:1;display:flex;position:relative">
              ${quarters.map(q => `<div class="q" style="flex:${q.b-q.a}">${esc(q.label)}</div>`).join('')}
            </div>
          </div>
          <div class="gt-rows">
            ${I.map(x => {
              const a = pos(+new Date(x.start)), b = pos(+new Date(x.end));
              return `<div class="gt-row" data-ini="${x.id}" style="cursor:pointer">
                <div class="gt-name" title="${esc(x.name)}"><i>${esc(x.num)}</i>${esc(x.name)}</div>
                <div class="gt-lane">
                  <div class="gl" style="inset-inline-start:${a}%;width:${Math.max(0.8,b-a)}%;background:${ST_COLOR[x.status]}"
                    title="${fmtDate(x.start)} ← ${fmtDate(x.end)}"></div>
                  <div class="gt-today" style="inset-inline-start:${pos(today)}%"></div>
                </div>
              </div>`;
            }).join('')}
          </div>
          <div class="gt-legend">
            ${ST_ORDER.filter(s => I.some(x => x.status === s)).map(s =>
              `<span class="lg" style="display:flex;align-items:center;gap:6px">
                 <span style="width:14px;height:8px;border-radius:3px;background:${ST_COLOR[s]};display:inline-block"></span>${s}</span>`).join('')}
            <span class="lg" style="display:flex;align-items:center;gap:6px;margin-inline-start:auto">
              <span style="width:2px;height:12px;background:var(--ink);opacity:.42;display:inline-block"></span>
              تاريخ اليوم المرجعي</span>
          </div>
        </div>`, {tag:TAG.real})}
      ${noDates.length ? `<div class="note">
        ${cnt(noDates.length,'مبادرة واحدة','مبادرتان','مبادرات','مبادرة')} بلا تواريخ في المصدر ولا تظهر في المخطط
        (${noDates.map(x => esc(x.name)).join(' · ')}) — حالتها مسجلة صراحةً بأنها «منجزة».
      </div>` : ''}
    </div>`;

  host.querySelectorAll('[data-ini]').forEach(r => {
    r.onclick = () => iniDrawer(D.initiatives.find(x => x.id === r.dataset.ini));
  });
}

/* ---------------- 4.3 سجل المبادرات ---------------- */
function sc_iniRegister(host){
  const g = S.goal;
  const I = D.initiatives.filter(x => !g || x.goalId === g);
  const goal = D.goals.find(x => x.id === g);
  host.innerHTML = `
    <div class="sc-body" style="grid-template-rows:auto minmax(0,1fr)">
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <div class="pillset" id="goal-pills">
          <button class="pl${!g?' on':''}" data-g="">كل الأهداف</button>
          ${D.goals.map(x => `<button class="pl${g===x.id?' on':''}" data-g="${x.id}">${esc(x.name)}</button>`).join('')}
        </div>
        <input class="tsearch" id="ini-q" placeholder="ابحث باسم المبادرة…">
        <span style="margin-inline-start:auto;font-size:11.5px;color:var(--mut)">
          ${goal ? `${esc(goal.name)} — ${esc(goal.desc)} · ` : ''}${cnt(I.length,'مبادرة واحدة','مبادرتان','مبادرات','مبادرة')}
        </span>
      </div>
      ${panel('', '', `
        <div class="tw"><table>
          <thead><tr><th style="width:44px">الرقم</th><th>المبادرة</th><th style="width:96px">الهدف</th>
            <th style="width:108px">الحالة</th><th style="width:104px">البدء</th><th style="width:104px">الانتهاء</th></tr></thead>
          <tbody id="ini-tb"></tbody></table></div>`, {cls:'', bodyCls:'', tag:''})}
    </div>`;

  const tb = el('ini-tb');
  function draw(q){
    const rowsI = I.filter(x => !q || x.name.includes(q) || x.num.includes(q));
    tb.innerHTML = rowsI.length ? rowsI.map(x => `<tr data-ini="${x.id}" style="cursor:pointer">
      <td class="n" style="color:var(--faint);font-weight:700">${esc(x.num)}</td>
      <td class="nm">${esc(x.name)}</td>
      <td style="color:var(--mut)">${esc(x.goal)}</td>
      <td><span class="st ${ST_CLASS[x.status]}">${esc(x.status)}</span></td>
      <td class="n" style="color:var(--mut)">${x.start ? fmtDate(x.start) : '—'}</td>
      <td class="n" style="color:var(--mut)">${x.end ? fmtDate(x.end) : '—'}</td></tr>`).join('')
      : `<tr><td colspan="6" style="text-align:center;color:var(--faint);padding:26px">لا توجد مبادرات مطابقة</td></tr>`;
    tb.querySelectorAll('[data-ini]').forEach(r => {
      r.onclick = () => iniDrawer(D.initiatives.find(x => x.id === r.dataset.ini));
    });
  }
  draw('');
  el('ini-q').oninput = e => draw(e.target.value.trim());
  host.querySelectorAll('#goal-pills .pl').forEach(b => {
    b.onclick = () => { S.goal = b.dataset.g; renderScene(true); };
  });
}

function iniDrawer(x){
  if(!x) return;
  const p = D.plan.find(y => y.initiativeId === x.id);
  openDrawer(esc(x.name), `مبادرة رقم ${esc(x.num)} · ${esc(x.goal)}`,
    drSec('الحالة') +
    fld('الحالة المعروضة', `<span class="st ${ST_CLASS[x.status]}">${esc(x.status)}</span>`) +
    fld('الحالة المسجلة في الملف', x.statusInFile
      ? esc(x.statusInFile)
      : '<span style="color:var(--faint)">غير مسجلة — محتسبة زمنياً</span>') +
    (x.overdueDays != null ? fld('التأخر عن تاريخ الانتهاء', `<span style="color:var(--bad)">${fmt(x.overdueDays)} يوماً</span>`) : '') +
    drSec('الجدول الزمني') +
    fld('تاريخ البدء', x.start ? fmtDate(x.start) : '<span style="color:var(--faint)">غير محدد</span>') +
    fld('تاريخ الانتهاء', x.end ? fmtDate(x.end) : '<span style="color:var(--faint)">غير محدد</span>') +
    fld('المدة المخططة', x.start && x.end
      ? `${fmt((new Date(x.end) - new Date(x.start))/864e5)} يوماً` : '—') +
    drSec('الهدف الاستراتيجي') +
    fld('الهدف', esc(x.goal)) +
    fld('الوصف', esc((D.goals.find(g => g.id === x.goalId)||{}).desc || '—')) +
    drSec('خطة التنفيذ') +
    fld('عدد الأنشطة المسجلة', p ? '1' : '0') +
    fld('الجهة المسؤولة', x.owner ? esc(x.owner) : '<span style="color:var(--faint)">غير محددة في المصدر</span>') +
    `<div class="note" style="margin-top:16px">نسبة الإنجاز والميزانية والمعلم القادم غير متوفرة لهذه المبادرة —
      المصدر يسجل الحالة والتواريخ فقط.</div>`);
}

/* ---------------- 5.1 قطع المسافة نحو المستهدف ---------------- */
function sc_kpiGoals(host){
  const K = D.kpis;
  const withP = K.filter(k => k.progress != null);
  const avg = withP.reduce((a,k) => a+k.progress, 0)/withP.length;
  const met = K.filter(k => k.current >= k.target).length;
  const low = withP.filter(k => k.progress < .5).length;
  const sorted = [...withP].sort((a,b) => b.progress - a.progress);

  host.innerHTML = `
    ${rail([
      railCell('عدد المؤشرات', fmt(K.length), 'مؤشراً', 'موزعة على أربعة أهداف'),
      railCell('متوسط قطع المسافة', pc(avg,0), '', 'من خط الأساس إلى المستهدف'),
      railCell('بلغت المستهدف', fmt(met), 'مؤشراً', met ? 'من إجمالي المؤشرات' : 'لم يبلغ أي مؤشر مستهدفه بعد'),
      railCell('دون منتصف المسافة', fmt(low), 'مؤشراً',
        `<b class="delta dn">${pc(low/withP.length,0)}</b> من المؤشرات`)
    ])}
    <div class="sc-body g-23" style="grid-template-rows:minmax(0,1fr)">
      ${panel('قطع المسافة نحو المستهدف — لكل مؤشر',
        'الشريط = ما قُطع من المسافة بين خط الأساس والمستهدف · الخط الذهبي = المستهدف',
        chartBody('c-kpiprog'), {tag:TAG.real})}
      <div class="stack">
        ${panel('متوسط قطع المسافة حسب الهدف', 'أي الأهداف أقرب إلى مستهدفاته',
          chartBody('c-kpigoal'), {tag:TAG.calc})}
        ${panel('السلاسل الشهرية للمؤشرات', 'تتبّع القيمة شهرياً لكل مؤشر',
          noData('kpiSeries'), {tag:TAG.none})}
      </div>
    </div>`;

  const c1 = chart('c-kpiprog');
  c1 && c1.setOption(base({
    tooltip:Object.assign({}, TT, {trigger:'item', formatter:p => {
      const k = sorted[p.dataIndex];
      const v = x => k.unit === 'نسبة' ? pc(x,0) : fmt(x);
      return ttHead(esc(k.name)) + ttRow('قطع المسافة', pc(k.progress,0), C.accent) +
        ttRow('خط الأساس', v(k.baseline)) + ttRow('القيمة الحالية', v(k.current)) +
        ttRow('المستهدف', v(k.target), C.gold) + ttRow('الهدف', esc(k.goal));
    }}),
    grid:{top:10, right:216, bottom:20, left:52, containLabel:true},
    xAxis:barX(v => pcRaw(v,0)+'٪', {max:1.12}),
    yAxis:barY(sorted.map(k => k.name), 206),
    series:[{
      type:'bar', color:C.accent, barWidth:'58%', data:sorted.map(k => k.progress),
      itemStyle:{borderRadius:[5,0,0,5]}, label:LBL(p => pc(p.value,0)),
      markLine:{silent:true, symbol:'none', lineStyle:{color:C.gold, type:'dashed', width:1.8},
        data:[{xAxis:1, label:{formatter:'المستهدف', color:C.gold, fontSize:10,
          fontFamily:'Cairo', position:'insideEndTop', rotate:0}}]}
    }]
  }));
  c1 && c1.on('click', p => kpiDrawer(sorted[p.dataIndex]));

  const gs = D.goals.map(g => {
    const gk = withP.filter(k => k.goalId === g.id);
    return {g, v:gk.length ? gk.reduce((a,k) => a+k.progress, 0)/gk.length : 0, n:gk.length};
  }).sort((a,b) => b.v - a.v);
  const c2 = chart('c-kpigoal');
  c2 && c2.setOption(base({
    tooltip:Object.assign({}, TT, {trigger:'item', formatter:p => {
      const x = gs[p.dataIndex];
      return ttHead(`${esc(x.g.name)} — ${esc(x.g.desc)}`) +
        ttRow('متوسط قطع المسافة', pc(x.v,0), C.accent) +
        ttRow('عدد المؤشرات', fmt(x.n));
    }}),
    grid:{top:10, right:92, bottom:18, left:20, containLabel:true},
    xAxis:barX(v => pcRaw(v,0)+'٪', {max:1}),
    yAxis:barY(gs.map(x => x.g.name), 86),
    series:[{type:'bar', color:C.accent, barWidth:'54%', data:gs.map(x => x.v),
      itemStyle:{borderRadius:[5,0,0,5]}, label:LBL(p => pc(p.value,0))}]
  }));
}

/* ---------------- 5.2 بطاقات المؤشرات ---------------- */
function sc_kpiCards(host){
  const K = D.kpis;
  const val = k => k.unit === 'نسبة' ? pc(k.current,0) : fmt(k.current);
  const tgt = k => k.unit === 'نسبة' ? pc(k.target,0) : fmt(k.target);
  host.innerHTML = `
    <div class="sc-body" style="grid-template-rows:minmax(0,1fr)">
      <div class="scroll">
        <div class="sc-body g-4" style="grid-auto-rows:min-content;padding-bottom:6px">
          ${K.map(k => {
            const p = Math.max(0, Math.min(1, k.progress == null ? 0 : k.progress));
            return `<div class="kpi-card" data-kpi="${k.id}">
              <div class="k-n">${esc(k.name)}</div>
              <div class="k-row">
                <div class="k-v">${val(k)}</div>
                <div class="k-t">المستهدف <b>${tgt(k)}</b></div>
              </div>
              <div class="meter">
                <div class="m-track">
                  <div class="m-goal" style="inset-inline-start:${(0.88*100).toFixed(0)}%;width:12%"></div>
                  <div class="m-fill" style="width:${(p*100).toFixed(1)}%"></div>
                  <div class="m-dot" style="inset-inline-start:${(p*100).toFixed(1)}%"></div>
                </div>
                <div class="m-scale">
                  <span>خط الأساس ${k.unit === 'نسبة' ? pc(k.baseline,0) : fmt(k.baseline)}</span>
                  <span><b>${pc(k.progress,0)}</b> من المسافة</span>
                </div>
              </div>
              <div class="k-g">${esc(k.goal)} · ${esc(k.quality)}</div>
            </div>`;
          }).join('')}
        </div>
      </div>
    </div>`;
  host.querySelectorAll('[data-kpi]').forEach(c => {
    c.onclick = () => kpiDrawer(K.find(k => k.id === c.dataset.kpi));
  });
}

function kpiDrawer(k){
  if(!k) return;
  const v = x => k.unit === 'نسبة' ? pc(x,1) : `${fmt(x)} ${k.unit}`;
  openDrawer(esc(k.name), `${esc(k.goal)} · ${esc(k.period)}`,
    drSec('القيم') +
    fld('خط الأساس', v(k.baseline)) +
    fld('القيمة الحالية', v(k.current)) +
    fld('المستهدف', `<span style="color:var(--gold)">${v(k.target)}</span>`) +
    fld('قطع المسافة', pc(k.progress,0)) +
    fld('المتبقي للمستهدف', v(k.target - k.current)) +
    drSec('التعريف') +
    fld('نوع المؤشر', esc(k.type)) +
    fld('اتجاه الأداء', esc(k.direction)) +
    fld('الوحدة', esc(k.unit)) +
    drSec('المصدر والجودة') +
    fld('جودة البيانات', `<span class="st st-warn">${esc(k.quality)}</span>`) +
    fld('المصدر', esc(k.source || '—')) +
    fld('حالة المصدر', esc(k.sourceStatus || '—')) +
    `<div class="note" style="margin-top:16px">خط الأساس والمستهدف مأخوذان من وثيقة خطة العمل.
      القيمة الحالية مصنّفة في المصدر بأنها تقديرية للعرض وتُستبدل بالقيمة الفعلية عند ورودها من جهتها.
      لا تتوفر سلسلة شهرية لهذا المؤشر.</div>`);
}

/* ---------------- 6.1 الإسقاط المحتسب ---------------- */
function sc_projection(host){
  const F = D.foresight;
  const hist = D.licMonthly.filter(m => !m.isBaseline);
  const proj = D.projection;
  const labels = [...hist.map(m => AR_MONTH_SHORT(m.label)), ...proj.map(p => AR_MONTH_SHORT(p.label))];
  const actual = [...hist.map(m => m.cumCap), ...proj.map(() => null)];
  /* وصل الخطين عند آخر نقطة فعلية حتى لا تظهر فجوة */
  const projected = [...hist.map((m,i) => i === hist.length-1 ? m.cumCap : null), ...proj.map(p => p.capacity)];
  const target = F.bedsTarget;

  host.innerHTML = `
    ${rail([
      railCell('متوسط الإضافة الشهرية', fmt(F.avgMonthlyCapacity), 'سرير',
        `محسوب على ${cnt(F.activeMonths,'شهر','شهرين','أشهر','شهراً')} بإضافة فعلية`),
      railCell('الطاقة المتوقعة بعد 24 شهراً', fmt(F.capacityIn24), 'سرير',
        `نسبة تغطية ${pc(F.coverageIn24,2)} من الطلب الحالي`),
      railCell('المتبقي لبلوغ مستهدف الأسرّة', fmt(F.bedsRemaining), 'سرير',
        `المستهدف المعتمد ${ltr(fmt(target))} سرير`),
      railCell('الزمن اللازم بالوتيرة الحالية', fmt1(F.monthsToTarget), 'شهراً',
        `أي نحو ${esc(F.targetDate)}`)
    ])}
    <div class="sc-body g-23" style="grid-template-rows:minmax(0,1fr)">
      ${panel('الطاقة الاستيعابية — الفعلي والإسقاط الخطي',
        'الخط المتصل = مسجّل فعلياً · المتقطع = امتداد خطي · الذهبي = المستهدف المعتمد',
        chartBody('c-proj'), {tag:TAG.calc})}
      <div class="stack">
        ${panel('', '', `<div class="note">
          <b>قاعدة الاحتساب المعلنة:</b> ${esc(F.rule)}
          <br><br>هذا امتداد حسابي لوتيرة سابقة وليس نموذجاً تنبؤياً معتمداً: لا يأخذ في الحسبان
          الموسمية ولا أثر المبادرات ولا الطاقة قيد الإنشاء. كل قيمة في هذا المشهد موسومة
          «قيمة محتسبة» لتمييزها عن الأرقام المسجلة في المصدر.
        </div>`, {cls:'bare'})}
        ${panel('السيناريوهات ونطاقات الثقة', 'سيناريو متحفظ وأساسي ومتفائل بنطاقات ثقة',
          noData('scenarios'), {tag:TAG.none})}
      </div>
    </div>`;

  const c = chart('c-proj');
  c && c.setOption(base({
    tooltip:Object.assign({}, TT, {trigger:'axis', formatter:ps => {
      const p = ps.find(x => x.value != null);
      if(!p) return '';
      const isProj = p.seriesName === 'إسقاط خطي';
      return ttHead(esc(p.name) + (isProj ? ' — إسقاط' : '')) +
        ttRow('الطاقة الاستيعابية', fmt(p.value), p.color) +
        ttRow('نسبة تغطية الطلب', pc(p.value/D.totals.demand,2)) +
        ttRow('من المستهدف', pc(p.value/target,0));
    }}),
    legend:{data:['مسجّل فعلياً','إسقاط خطي'], bottom:0,
      textStyle:{color:C.mut, fontSize:11, fontFamily:'Cairo'}, itemWidth:14, itemHeight:10, itemGap:16},
    grid:{top:24, right:54, bottom:48, left:20, containLabel:true},
    xAxis:catX(labels, {axisLabel:{color:C.mut, fontSize:9, fontFamily:'Cairo', interval:2, rotate:38}}),
    yAxis:valY(axK, {max:niceMax(Math.max(F.capacityIn24, target)*1.06)}),
    series:[
      {name:'مسجّل فعلياً', type:'line', color:C.accent, smooth:false, symbol:'circle', symbolSize:4,
       lineStyle:{width:2.6}, areaStyle:{color:'rgba(14,107,57,.08)'}, data:actual, connectNulls:false},
      {name:'إسقاط خطي', type:'line', color:C.info, smooth:false, symbol:'none',
       lineStyle:{width:2.2, type:'dashed'}, data:projected, connectNulls:true,
       markLine:{silent:true, symbol:'none', lineStyle:{color:C.gold, type:'dashed', width:1.8},
         data:[{yAxis:target, label:{formatter:`المستهدف ${fmt(target)}`, color:C.gold, fontSize:10,
           fontFamily:'Cairo', position:'insideStartTop', rotate:0}}]}}
    ]
  }));
}

/* ---------------- 7.1 سجل المصادر ---------------- */
const SS_CLASS = {'معتمد':'st-ok', 'أولي':'st-warn', 'يحتاج مراجعة':'st-warn', 'غير محدد':'st-late'};
function sc_sources(host){
  const SRC = D.sources;
  const byStatus = {};
  SRC.forEach(s => { byStatus[s.status] = (byStatus[s.status]||0)+1; });
  const known = SRC.filter(s => s.owner && !s.owner.includes('غير محدد')).length;

  host.innerHTML = `
    ${rail([
      railCell('مجموعات البيانات', fmt(SRC.length), 'مجموعة', 'وفق سجل المصادر في المصنّف'),
      railCell('محددة الجهة المنتجة', fmt(known), 'مجموعة',
        `${fmt(SRC.length-known)} مجموعة جهتها غير محددة بعد`),
      railCell('حالة المصدر «أولي»', fmt(byStatus['أولي']||0), 'مجموعة', 'تحتاج اعتماداً رسمياً'),
      railCell('حالة المصدر «غير محدد»', fmt(byStatus['غير محدد']||0), 'مجموعة',
        '<b class="delta dn">أعلى أولوية للاستكمال</b>')
    ])}
    <div class="sc-body g-32" style="grid-template-rows:minmax(0,1fr)">
      <div class="stack">
        ${panel('حالة المصادر', 'توزيع مجموعات البيانات حسب حالة اعتماد المصدر',
          chartBody('c-srcstat'), {tag:TAG.real})}
        ${panel('', '', `<div class="note">
          <b>مبدأ الفصل:</b> تصنيف المؤشر داخل اللوحة لا يعني أن جهة واحدة تنتج كل بياناته.
          الإدارة العامة للتراخيص مسؤولة عن <b>رخص البناء فقط</b>؛ أما الرخص التشغيلية والطاقة
          الاستيعابية وأنواع المساكن فلا تُنسب إليها، وجهتها المنتجة تحتاج تحديداً.
        </div>`, {cls:'bare'})}
      </div>
      ${panel('سجل مصادر البيانات', 'المرجع الحاكم لملكية كل مجموعة بيانات', `
        <div class="tw"><table>
          <thead><tr><th>البند</th><th style="width:120px">القسم في اللوحة</th>
            <th style="width:180px">الجهة المنتجة</th><th style="width:110px">حالة المصدر</th></tr></thead>
          <tbody>${SRC.map(s => `<tr data-src="${s.id}" style="cursor:pointer">
            <td class="nm">${esc(s.item)}</td>
            <td style="color:var(--mut)">${esc(s.section)}</td>
            <td style="color:${s.owner && s.owner.includes('غير محدد') ? 'var(--faint)' : 'var(--ink2)'}">${esc(s.owner)}</td>
            <td><span class="st ${SS_CLASS[s.status]||'st-wait'}">${esc(s.status)}</span></td></tr>`).join('')}
          </tbody></table></div>`, {tag:TAG.real})}
    </div>`;

  host.querySelectorAll('[data-src]').forEach(r => {
    r.onclick = () => {
      const s = SRC.find(x => x.id === r.dataset.src);
      openDrawer(esc(s.item), esc(s.section),
        drSec('الملكية') +
        fld('الجهة المنتجة', esc(s.owner)) +
        fld('المصدر', esc(s.source || '—')) +
        fld('حالة المصدر', `<span class="st ${SS_CLASS[s.status]||'st-wait'}">${esc(s.status)}</span>`) +
        drSec('الموضع في المصنّف') +
        fld('الورقة / العمود', esc(s.sheet)) +
        fld('القسم في اللوحة', esc(s.section)) +
        (s.notes ? `<div class="note" style="margin-top:16px">${esc(s.notes)}</div>` : ''));
    };
  });

  const order = ['معتمد','أولي','يحتاج مراجعة','غير محدد'].filter(k => byStatus[k]);
  const col = {'معتمد':C.ok, 'أولي':C.warn, 'يحتاج مراجعة':C.warn, 'غير محدد':C.bad};
  const c = chart('c-srcstat');
  c && c.setOption(base({
    tooltip:Object.assign({}, TT, {trigger:'item', formatter:p =>
      ttHead(esc(p.name)) + ttRow('عدد مجموعات البيانات', fmt(p.value), p.color) +
      ttRow('من الإجمالي', pc(p.value/SRC.length,0))}),
    grid:{top:10, right:60, bottom:18, left:20, containLabel:true},
    xAxis:barX(v => fmt(v), {max:Math.max(...order.map(k => byStatus[k]))*1.3}),
    yAxis:barY(order, 84),
    series:[{type:'bar', barWidth:'52%', barMaxWidth:38,
      data:order.map(k => ({value:byStatus[k], itemStyle:{color:col[k], borderRadius:[5,0,0,5]}})),
      label:LBL(p => fmt(p.value))}]
  }));
}

/* ---------------- 7.2 فجوات البيانات ---------------- */
function sc_gaps(host){
  const G = D.gaps;
  const bySec = {};
  G.forEach(g => { (bySec[g.section] = bySec[g.section] || []).push(g); });
  host.innerHTML = `
    ${rail([
      railCell('رسوم معطّلة لعدم توفر بيانات', fmt(G.length), 'رسماً',
        'معروضة في مواضعها بحالة «لا تتوفر بيانات فعلية»'),
      railCell('الأقسام المتأثرة', fmt(Object.keys(bySec).length), 'أقسام',
        Object.keys(bySec).join(' · ')),
      railCell('أعلى قسم تأثراً', fmt(Math.max(...Object.values(bySec).map(a => a.length))), 'رسوم',
        esc(Object.entries(bySec).sort((a,b) => b[1].length - a[1].length)[0][0])),
      railCell('قيم تقديرية معروضة', '0', 'قيمة',
        '<b class="delta up">لم يُعرض أي رقم غير مستند إلى المصدر</b>')
    ])}
    <div class="sc-body" style="grid-template-rows:minmax(0,1fr)">
      ${panel('سجل فجوات البيانات', 'ما ينقص لتفعيل كل رسم — مرتباً حسب القسم', `
        <div class="scroll">
          ${Object.entries(bySec).map(([s, arr]) => `
            <div class="dr-sec" style="margin-top:14px">${esc(s)} · ${cnt(arr.length,'رسم واحد','رسمان','رسوم','رسماً')}</div>
            ${arr.map(g => `<div class="gap-row">
              <div><div class="gr-t">${esc(g.title)}</div><div class="gr-s">المشهد: ${esc(sceneTitle(g.scene))}</div></div>
              <div class="gr-n">${esc(g.need)}</div>
              <div><button class="nv-btn" data-goto="${esc(g.scene)}" style="padding:6px 12px;font-size:11px">
                الانتقال للمشهد</button></div>
            </div>`).join('')}
          `).join('')}
        </div>`, {tag:TAG.real})}
    </div>`;

  host.querySelectorAll('[data-goto]').forEach(b => {
    b.onclick = () => { const i = sceneIdx(b.dataset.goto); if(i >= 0) goScene(i); };
  });
}
const sceneTitle = id => { const s = SCENES.find(x => x.id === id); return s ? s.title : id; };

/* ============================================================
   التنقل بين المشاهد
   ============================================================ */
function buildTabs(){
  el('tabs').innerHTML = TABS.map((t,i) =>
    `<button class="tab-btn" data-tab="${t.id}" role="tab"><span class="tnum">${i+1}</span>${esc(t.name)}</button>`).join('');
  el('tabs').querySelectorAll('[data-tab]').forEach(b => {
    b.onclick = () => { const sc = tabScenes(b.dataset.tab); goScene(sceneIdx(sc[0].id)); };
  });
}
function buildDots(){
  el('dots').innerHTML = TABS.map(t => {
    const sc = tabScenes(t.id);
    return `<div class="dgroup" data-tab="${t.id}">
      <span class="dg-l">${esc(t.name)}</span>
      ${sc.map(s => `<button class="dot" data-scene="${s.id}" role="tab"
        title="${esc(s.title)}" aria-label="${esc(s.title)}"></button>`).join('')}
    </div>`;
  }).join('');
  el('dots').querySelectorAll('[data-scene]').forEach(d => {
    d.onclick = () => goScene(sceneIdx(d.dataset.scene));
  });
}

let lastIdx = -1;
function goScene(i, force){
  const n = SCENES.length;
  i = Math.max(0, Math.min(n-1, i));
  if(i === S.scene && !force) return;
  const dir = i > S.scene ? 'next' : 'prev';
  S.scene = i;
  S.tab = SCENES[i].tab;
  renderScene(false, dir);
}

function renderScene(keep, dir){
  const sc = SCENES[S.scene];
  const stage = el('stage');

  /* تخلص من الرسوم السابقة قبل استبدال الحاوية */
  Object.keys(CH).forEach(k => { try{ CH[k].dispose(); }catch(e){} delete CH[k]; });

  const sec = document.createElement('section');
  sec.className = 'scene live' + (RM ? '' : (dir === 'prev' ? ' enter-prev' : ' enter-next'));
  sec.id = 'scene-' + sc.id;
  sec.innerHTML = `
    <div class="sc-head">
      <div class="sh-main">
        <div class="sc-kick">${esc(sc.kick)}</div>
        <h2>${esc(sc.title)}</h2>
        <div class="sh-sub">${esc(sc.sub)}${S.sector ? ` — <b style="color:var(--accent)">${esc(SECNAME())}</b>` : ''}</div>
      </div>
      <div class="sc-tools" id="sc-tools"></div>
    </div>`;
  stage.innerHTML = '';
  stage.appendChild(sec);

  const host = document.createElement('div');
  host.style.cssText = 'flex:1;min-height:0;display:flex;flex-direction:column;gap:14px';
  sec.appendChild(host);
  sc.build(host);

  /* تحديث الشريط العلوي والتنقل */
  el('tabs').querySelectorAll('[data-tab]').forEach(b => b.classList.toggle('on', b.dataset.tab === S.tab));
  el('dots').querySelectorAll('[data-scene]').forEach(d => d.classList.toggle('on', d.dataset.scene === sc.id));
  el('dots').querySelectorAll('.dgroup').forEach(g => g.classList.toggle('on', g.dataset.tab === S.tab));
  el('nv-i').textContent = S.scene + 1;
  el('nv-n').textContent = SCENES.length;
  el('nv-title').textContent = sc.title;
  el('nv-prev').disabled = S.scene === 0;
  el('nv-next').disabled = S.scene === SCENES.length - 1;

  const act = el('dots').querySelector('[data-scene].on');
  act && act.scrollIntoView({block:'nearest', inline:'center', behavior:RM?'auto':'smooth'});

  requestAnimationFrame(() => requestAnimationFrame(resizeAll));
  lastIdx = S.scene;
}

function setSector(id){
  S.sector = (S.sector === id) ? '' : id;
  el('f-sector').value = S.sector;
  renderScene(true);
}

/* ============================================================
   الإقلاع
   ============================================================ */
function boot(){
  /* الغلاف */
  el('cv-img').style.backgroundImage = `url('${IMAGES.cover}')`;
  countUp(el('cv-demand'), D.totals.demand);
  countUp(el('cv-supply'), D.totals.supply);
  el('cv-cov').textContent = pc(D.totals.coverage, 2);
  el('cv-note').innerHTML =
    `المصدر: ${esc(D.meta.source)} · فترة العرض: ${esc(D.meta.asOf)} · تاريخ اليوم المرجعي: ${fmtDate(D.meta.today)}<br>` +
    `الرسوم التي لا يتوفر لها مصدر فعلي معروضة بحالة «لا تتوفر بيانات فعلية» — ` +
    `وعددها ${cnt(D.gaps.length,'رسم واحد','رسمان','رسوم','رسماً')}، مفصّلة في قسم حوكمة البيانات.`;
  el('tp-asof').textContent = D.meta.asOf;

  /* التصفية القطاعية */
  const fs = el('f-sector');
  D.sectors.forEach(s => {
    const o = document.createElement('option');
    o.value = s.id; o.textContent = s.name; fs.appendChild(o);
  });
  fs.onchange = () => { S.sector = fs.value; renderScene(true); };

  buildTabs();
  buildDots();

  /* أزرار التنقل */
  el('nv-next').onclick = () => goScene(S.scene + 1);
  el('nv-prev').onclick = () => goScene(S.scene - 1);
  el('btn-home').onclick = () => {
    const cv = el('cover');
    cv.style.display = '';
    requestAnimationFrame(() => cv.classList.remove('gone'));
    el('app').classList.remove('ready');
  };
  el('btn-print').onclick = () => print();
  el('btn-fs').onclick = () => {
    const b = el('btn-fs');
    if(!document.fullscreenElement){ document.documentElement.requestFullscreen && document.documentElement.requestFullscreen(); }
    else { document.exitFullscreen && document.exitFullscreen(); }
    setTimeout(() => { b.classList.toggle('on', !!document.fullscreenElement); resizeAll(); }, 220);
  };
  addEventListener('fullscreenchange', () => {
    el('btn-fs').classList.toggle('on', !!document.fullscreenElement);
    setTimeout(resizeAll, 160);
  });

  /* الدرج */
  el('dr-x').onclick = closeDrawer;
  el('veil').onclick = closeDrawer;

  /* لوحة المفاتيح — في العربية: اليسار = التالي، اليمين = السابق */
  addEventListener('keydown', e => {
    if(e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
    if(!el('cover').classList.contains('gone')){
      if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); enter(); }
      return;
    }
    switch(e.key){
      case 'ArrowLeft': case 'PageDown': e.preventDefault(); goScene(S.scene + 1); break;
      case 'ArrowRight': case 'PageUp': e.preventDefault(); goScene(S.scene - 1); break;
      case 'Home': e.preventDefault(); goScene(0); break;
      case 'End': e.preventDefault(); goScene(SCENES.length - 1); break;
      case 'Escape': closeDrawer(); break;
      case 'f': case 'F': el('btn-fs').click(); break;
    }
  });

  /* الدخول من الغلاف */
  function enter(target){
    const cv = el('cover');
    cv.classList.add('gone');
    el('app').classList.add('ready');
    goScene(typeof target === 'number' ? target : 0, true);
    setTimeout(resizeAll, 420);
    /* إخفاؤه فعلياً بعد التلاشي: يوقف حركة الغلاف ويمنعه من التأثير في عرض المستند */
    setTimeout(() => { if(cv.classList.contains('gone')) cv.style.display = 'none'; }, 780);
  }
  el('cv-enter').onclick = () => enter(0);
  el('cv-gov').onclick = () => enter(sceneIdx('s7_sources'));

  /* تحضير المشهد الأول خلف الغلاف حتى يظهر جاهزاً */
  renderScene(true);
}

if(document.readyState === 'loading') addEventListener('DOMContentLoaded', boot);
else boot();
