/* ============================================================
   لوحة معلومات سكن العمالة — أمانة منطقة الرياض
   Vanilla JS + Apache ECharts 5 — all state in memory (no storage)
   ============================================================ */
'use strict';
const D = window.DATA;
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- palette (validated) ---------- */
const C = {
  green:'#0E5A43', green2:'#177A5B', teal:'#1B8563', gold:'#A8842F', goldUi:'#C4A24D',
  clay:'#B0603C', red:'#C0392B', amber:'#D68910', ink:'#1E2B26', muted:'#6B7A74',
  line:'#E4EAE7', tint:'#E8F3EE',
  ramp5:['#8FBFA8','#67AC8E','#419573','#24805D','#0E5A43'],
};
function rampN(n){ // interpolate the validated 5-step green ramp to n steps
  if(n<=5) return C.ramp5.slice(5-n);
  const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
  const a=C.ramp5.map(hex), out=[];
  for(let i=0;i<n;i++){const t=i/(n-1)*(a.length-1),j=Math.floor(t),f=t-j,b=a[Math.min(j+1,a.length-1)];
    out.push('#'+a[j].map((v,k)=>Math.round(v+(b[k]-v)*f).toString(16).padStart(2,'0')).join(''));}
  return out;
}
const OCC_COLOR = r => r>95 ? C.red : (r>85 ? C.amber : C.green2);

/* ---------- formatting (Latin digits, thousands separators) ---------- */
const fmt  = n => Math.round(n).toLocaleString('en-US');
const fmt1 = n => (Math.round(n*10)/10).toLocaleString('en-US',{minimumFractionDigits:1,maximumFractionDigits:1});
const fmtAx = v => Math.abs(v)>=1e6 ? (v/1e6).toLocaleString('en-US',{maximumFractionDigits:1})+' مليون'
              : Math.abs(v)>=1e3 ? (v/1e3).toLocaleString('en-US',{maximumFractionDigits:1})+' ألف' : fmt(v);
const fmtSAR = v => Math.abs(v)>=1e6 ? (v/1e6).toLocaleString('en-US',{maximumFractionDigits:1})+' مليون ريال'
              : fmt(v)+' ريال';
const el = id => document.getElementById(id);
const els = s => [...document.querySelectorAll(s)];

/* ---------- count-up ---------- */
/* سجل العدّادات — يُستخدم لتثبيت القيم النهائية قبل الطباعة حتى لا تُلتقط قيمة وسط الحركة */
const COUNTERS=new Map();
addEventListener('beforeprint',()=>COUNTERS.forEach((v,node)=>{
  node.textContent=(v.decimals? fmt1(v.to) : fmt(v.to))+v.suffix;
}));
function countUp(node, to, {decimals=0, dur=620, suffix=''}={}) {
  if(node) COUNTERS.set(node,{to,decimals,suffix});
  const f = v => (decimals? v.toLocaleString('en-US',{minimumFractionDigits:decimals,maximumFractionDigits:decimals}) : fmt(v)) + suffix;
  if (REDUCED || dur<=0) { node.textContent = f(to); return; }
  const t0 = performance.now();
  (function step(t){
    const p = Math.min(1,(t-t0)/dur), e = 1-Math.pow(1-p,3);
    node.textContent = f(to*e);
    if (p<1) requestAnimationFrame(step); else node.textContent = f(to);
  })(t0);
}

/* ---------- ECharts base ---------- */
const CH = {};
function chart(id){
  const dom = el(id); if(!dom) return null;
  if(CH[id] && CH[id].getDom()!==dom){ try{CH[id].dispose();}catch(e){} delete CH[id]; }
  let c = echarts.getInstanceByDom(dom);
  if(!c) c = echarts.init(dom);
  CH[id]=c; return c;
}
const TT = {
  backgroundColor:'#fff', borderColor:C.line, borderWidth:1, padding:[9,13],
  textStyle:{fontFamily:'Cairo',fontSize:12,color:C.ink}, confine:true,
  extraCssText:'direction:rtl;text-align:right;box-shadow:0 8px 24px rgba(14,90,67,.14);border-radius:10px;',
};
function base(opt){
  return Object.assign({
    animation:!REDUCED, animationDuration:700, animationEasing:'cubicOut',
    textStyle:{fontFamily:'Cairo',color:C.ink},
    tooltip:Object.assign({},TT),
  },opt);
}
const AXV = {type:'value',axisLabel:{formatter:fmtAx,color:C.muted,fontSize:10.5,fontFamily:'Cairo'},
  splitLine:{lineStyle:{color:'#EFF3F0'}},axisLine:{show:false},axisTick:{show:false}};
const AXC = {type:'category',axisLabel:{color:C.muted,fontSize:10.5,fontFamily:'Cairo'},
  axisLine:{lineStyle:{color:C.line}},axisTick:{show:false}};
const AXVY = Object.assign({},AXV,{position:'right'}); // RTL: value axis on the right for vertical charts
const AR_MONTH_NAMES=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
function fmtDate(iso){ if(!iso||iso==='—')return iso;
  const [y,m,d]=iso.split('-').map(Number);
  return `${d} ${AR_MONTH_NAMES[m-1]} ${y}`; }
const ltr = s => `<span dir="ltr">${s}</span>`;
const nounCount=(n,sing,plur)=> (n>=3&&n<=10)? `${fmt(n)} ${plur}` : `${fmt(n)} ${sing}`;
function ttRow(k,v,sw){return `<div class="row"><span>${sw?`<span style="display:inline-block;width:9px;height:9px;border-radius:3px;background:${sw};margin-inline-start:2px;margin-inline-end:6px"></span>`:''}${k}</span><span>${v}</span></div>`;}
function reClick(c,fn){ c.off('click'); if(fn) c.on('click',fn); }

/* ---------- global state (memory only) ---------- */
const S = {
  tab:'t1', range:12,
  sectors:new Set(), types:new Set(),   // empty = الكل
  collar:null, pillar:null, scenario:'أساسي',
  hotspot:false, kpiWeak:false, t6shown:false,
  facSearch:'', licSearch:'', iniSearch:'', inspSortK:'visits',
};
const M24 = [...new Set(D.licenses.map(r=>r.month))].sort();
const MLBL = {}; D.licenses.forEach(r=>MLBL[r.month]=r.month_ar);
const winMonths = () => M24.slice(-S.range);
const inWin = m => winMonths().includes(m);
/* السلاسل الشهرية في المصدر على مستوى المدينة (sector/type = null)،
   فتمر دون تأثر بالتصفية بدل أن تُفرَّغ منها. */
const secOK = s => s==null || !S.sectors.size || S.sectors.has(s);
const typOK = t => t==null || !S.types.size || S.types.has(t);
/* هل التصفية الحالية غير قابلة للتطبيق على سلسلة مدينة-المستوى؟ */
const cityOnlyNote = () => (S.sectors.size||S.types.size)
  ? '<span class="scope-note">هذه السلسلة على مستوى المدينة في المصدر — لا تتأثر بتصفية القطاع أو نوع السكن</span>' : '';
const TYPES = ['مجمع سكني','مبنى سكني','كبائن متنقلة'];
const TYPE_COLORS = {'مجمع سكني':C.teal,'مبنى سكني':C.gold,'كبائن متنقلة':C.clay};
const STATUS_CHIP = {'منجزة':'st-green','جاري العمل':'st-teal','متأخرة':'st-amber','لم تبدأ بعد':'st-grey'};
const STATUS_COLOR = {'منجزة':C.green2,'جاري العمل':C.teal,'متأخرة':C.amber,'لم تبدأ بعد':'#9AA8A2'};
const RISK_CHIP = {'منخفض':'st-green','متوسط':'st-amber','مرتفع':'st-red'};

function anyFilter(){ return S.sectors.size||S.types.size||S.collar||S.range!==12; }
function syncFilterUI(){
  el('g-sector').value = S.sectors.size===1 ? [...S.sectors][0] : '';
  el('g-type').value   = S.types.size===1 ? [...S.types][0] : '';
  el('g-range').value  = String(S.range);
  el('g-reset').classList.toggle('show', !!anyFilter());
  ['fb2','fb3'].forEach(fb=>{
    const bar = el(fb);
    bar.querySelectorAll('[data-role="range"] .pill').forEach(p=>p.classList.toggle('on',+p.dataset.v===S.range));
    bar.querySelectorAll('[data-role="sectors"] .pill').forEach(p=>p.classList.toggle('on',S.sectors.has(p.dataset.v)));
    bar.querySelectorAll('[data-role="types"] .pill').forEach(p=>p.classList.toggle('on',S.types.has(p.dataset.v)));
    bar.querySelector('[data-role="reset"]').classList.toggle('show', !!(S.sectors.size||S.types.size||S.range!==12));
  });
  el('t1-reset').classList.toggle('show', !!(S.collar||S.sectors.size));
}
function refresh(){ syncFilterUI(); renderTab(S.tab); }
function toggleSector(sec){
  if(S.sectors.size===1 && S.sectors.has(sec)) S.sectors.clear();
  else { S.sectors.clear(); S.sectors.add(sec); }
  refresh();
}
function resetAll(){ S.sectors.clear(); S.types.clear(); S.collar=null; S.range=12; refresh(); }

/* ---------- drawer ---------- */
function openDrawer(title, sub, html, after){
  el('dr-title').textContent = title; el('dr-sub').textContent = sub||'';
  el('dr-body').innerHTML = html;
  el('drawer').classList.add('open'); el('overlay').classList.add('open');
  el('drawer').setAttribute('aria-hidden','false');
  if(after) after(el('dr-body'));
}
function closeDrawer(){
  el('drawer').classList.remove('open'); el('overlay').classList.remove('open');
  el('drawer').setAttribute('aria-hidden','true');
}
el('dr-close').onclick = closeDrawer; el('overlay').onclick = closeDrawer;
addEventListener('keydown',e=>{ if(e.key==='Escape') closeDrawer(); });
const fld = (l,v)=>`<div class="fld"><span class="l">${l}</span><span class="v">${v}</span></div>`;
const fldNA = l=>`<div class="fld"><span class="l">${l}</span><span class="v na-txt">لا تتوفر بيانات فعلية</span></div>`;

/* ============================================================
   توفر البيانات — الرسوم التي لا مصدر فعلي لها تُعرض بحالة صريحة
   ============================================================ */
const AV = D.avail;
const gapOf = k => (D.gaps.find(g=>g.key===k)) || {title:'لا تتوفر بيانات فعلية',need:''};
/* يستبدل محتوى الحاوية ببطاقة «لا تتوفر بيانات فعلية» ويتخلص من أي رسم سابق فيها */
function noData(id,key){
  const node=el(id); if(!node) return;
  if(CH[id]){ try{CH[id].dispose();}catch(e){} delete CH[id]; }
  const g=gapOf(key);
  node.innerHTML=`<div class="nodata">
    <svg viewBox="0 0 24 24"><path d="M3 3v18h18"/><path d="M7 15l3.5-3.5 3 3L20 8"/><path d="M4 4l16 16" stroke-dasharray="2 2.5"/></svg>
    <div class="nd-t">${g.title}</div>
    <div class="nd-d">لا يوجد لهذا الرسم مصدر بيانات فعلي في مصنّف البيانات الرئيسي — لم تُعرض أي قيم تقديرية.</div>
    <div class="nd-n"><b>المطلوب لتفعيله:</b> ${g.need}</div>
  </div>`;
}
const NA_CHIP = '<span class="na-chip">لا تتوفر بيانات فعلية</span>';
const naCard = (label,ico)=>kpiCard(label,'<span class="na-val">—</span>',NA_CHIP,'na',ico);

/* ---------- sortable/searchable table ---------- */
function makeTable(containerId, cols, rows, {onRow, sortKey, desc=true, max}={}) {
  const cont = el(containerId); let sk = sortKey||cols.find(c=>c.sort)?.k, sd = desc;
  function draw(){
    let rs=[...rows];
    if(sk) rs.sort((a,b)=>{const x=a[sk],y=b[sk];return (typeof x==='number'? x-y : String(x).localeCompare(String(y),'ar'))*(sd?-1:1);});
    if(max) rs=rs.slice(0,max);
    cont.innerHTML = `<table class="tbl"><thead><tr>${cols.map(c=>
      `<th data-k="${c.k}">${c.l}${sk===c.k?`<span class="arr">${sd?'▼':'▲'}</span>`:''}</th>`).join('')}</tr></thead><tbody>${
      rs.map((r,i)=>`<tr data-i="${rows.indexOf(r)}">${cols.map(c=>`<td>${c.f? c.f(r[c.k],r) : r[c.k]}</td>`).join('')}</tr>`).join('')
    }</tbody></table>`;
    cont.querySelectorAll('th').forEach(th=>th.onclick=()=>{const k=th.dataset.k; if(sk===k) sd=!sd; else {sk=k;sd=true;} draw();});
    if(onRow) cont.querySelectorAll('tbody tr').forEach(tr=>tr.onclick=()=>onRow(rows[+tr.dataset.i]));
  }
  draw();
  return {redraw:(newRows)=>{ if(newRows) rows=newRows; draw(); }};
}

/* ---------- Riyadh SVG map component ---------- */
const tip = el('map-tip');
function showTip(html,x,y){
  tip.innerHTML=html; tip.style.display='block';
  const w=tip.offsetWidth,h=tip.offsetHeight;
  tip.style.left=Math.min(innerWidth-w-14,Math.max(8,x-w/2))+'px';
  tip.style.top=(y-h-16<8? y+18 : y-h-16)+'px';
}
function hideTip(){ tip.style.display='none'; }

/* ============================================================
   خريطة القطاعات المسطّحة — Leaflet بلا بلاطات أساس
   تُرسم حدود القطاعات الخمسة وحدها بتعبئة متدرّجة، فلا يصدر عن الخريطة
   أي طلب شبكي وتظهر متطابقة دون اتصال.
   ============================================================ */
const LMAP = {};

/* تدرّج أخضر يعكس قيمة المقياس داخل حدود القطاع */
function shadeFill(t){
  const a=[228,240,234], b=[93,159,127], k=Math.max(0,Math.min(1,t));
  return `rgb(${a.map((v,i)=>Math.round(v+(b[i]-v)*k)).join(',')})`;
}

/* ============================================================
   خريطة مسطّحة عبر Leaflet — حدود القطاعات الخمسة مرقمنة من خريطة
   القطاعات الرسمية للأمانة، بلا خريطة أساس.
   ============================================================ */
function drawMap(wrapId, {metric, metricLabel, sectorTip, onSector, fmtV}){
  const wrap = el(wrapId);
  if(!wrap || typeof L === 'undefined' || typeof SECTORS_GEO === 'undefined') return;
  let M = LMAP[wrapId];

  if(!M || !wrap.contains(M.getContainer())){
    wrap.innerHTML = '';
    /* خريطة مسطّحة بهوية الأمانة — بلا بلاطات خارجية، فتعمل دون اتصال */
    M = L.map(wrap, {
      center:[24.68,46.72], zoom:10,
      scrollWheelZoom:false, dragging:true, doubleClickZoom:false,
      zoomControl:false, attributionControl:false, zoomSnap:.25, minZoom:8, maxZoom:14,
    });
    LMAP[wrapId] = M;
    M._marks = L.layerGroup().addTo(M);
    M._fitted = false;
  }
  M._marks.clearLayers();

  const vals = {};
  D.sectors.forEach(sec => { vals[sec] = metric(sec); });
  const mx = Math.max(...Object.values(vals)), mn = Math.min(...Object.values(vals));
  const norm = v => mx===mn ? .55 : .14 + .86*((v-mn)/(mx-mn));

  const layer = L.geoJSON(SECTORS_GEO, {
    style: f => {
      const sec = f.properties.name, v = vals[sec];
      const selected = S.sectors.has(sec), dimmed = S.sectors.size && !selected;
      return {
        color: '#FFFFFF',
        weight: selected? 2.8 : 1.4,
        opacity: 1,
        fillColor: v==null? '#DCE7E1' : shadeFill(norm(v)),
        fillOpacity: dimmed? .38 : 1,      /* تعبئة مسطّحة كاملة */
        className: 'sec-poly-l',
      };
    },
    onEachFeature: (f, lyr) => {
      const sec = f.properties.name;
      lyr.bindTooltip(sectorTip(sec), {sticky:true, direction:'top', className:'map-tip-l'});
      lyr.on('click', ()=>onSector(sec));
      lyr.on('mouseover', e=>e.target.setStyle({fillOpacity:.9, weight:2.6}));
      lyr.on('mouseout',  e=>layer.resetStyle(e.target));
    },
  }).addTo(M._marks);

  /* تسمية القطاع وقيمته عند نقطة داخل حدوده */
  SECTORS_GEO.features.forEach(f => {
    const sec = f.properties.name, v = vals[sec];
    if(v==null) return;
    const dark = norm(v) > .52;
    L.marker(f.properties.labelAt, {interactive:false, keyboard:false, icon:L.divIcon({
      className:'sec-lab'+(dark?' on-dark':''),
      html:`<span class="sl-n">${sec.replace(/^(ال)?قطاع /,'')}</span>`+
           `<span class="sl-v">${fmtV? fmtV(v) : fmtAx(v)}</span>`,
      iconSize:[0,0],
    })}).addTo(M._marks);
  });

  if(!M._fitted){ M.fitBounds(layer.getBounds(), {padding:[16,16]}); M._fitted = true; }
  requestAnimationFrame(()=>{ try{ M.invalidateSize(false); }catch(e){} });
}

function facilityDrawer(f){
  openDrawer(f.name, `${f.sector} — حي ${f.district}`, `
    ${fld('رقم المنشأة',f.id)}
    ${fld('نوع السكن',f.type)}
    ${fld('الأسرّة المرخصة',fmt(f.beds))}
    ${fld('الأسرّة المشغولة',fmt(f.occupied))}
    ${fld('معدل الإشغال',`<span class="st ${f.occ_rate>95?'st-red':f.occ_rate>85?'st-amber':'st-green'}">${fmt1(f.occ_rate)}٪</span>`)}
    ${fld('درجة الامتثال',f.compliance+' / 100')}
    ${fld('مستوى الخطورة',`<span class="st ${RISK_CHIP[f.risk]}">${f.risk}</span>`)}
    ${fld('حالة الترخيص',`<span class="st ${f.lic_status==='ساري'?'st-green':'st-amber'}">${f.lic_status}</span>`)}
    ${fld('تاريخ الترخيص',fmtDate(f.lic_date))}
    ${fld('آخر زيارة رقابية',fmtDate(f.last_visit))}
    <div class="dr-chart" id="dr-fac-chart"></div>`,
    ()=>{ const c=chart('dr-fac-chart'); c.setOption(base({
      title:{text:'الإشغال مقابل الطاقة',textStyle:{fontSize:12,fontFamily:'IBM Plex Sans Arabic',color:C.muted},right:0},
      grid:{containLabel:true,left:6,right:6,top:34,bottom:0},
      xAxis:Object.assign({},AXV,{max:f.beds,inverse:true}),
      yAxis:Object.assign({},AXC,{data:['الأسرّة'],position:'right'}),
      series:[{type:'bar',data:[f.occupied],barWidth:22,itemStyle:{color:OCC_COLOR(f.occ_rate),borderRadius:[6,0,0,6]},
        showBackground:true,backgroundStyle:{color:'#EDF1EE',borderRadius:6},
        label:{show:true,position:'insideRight',formatter:()=>fmt(f.occupied)+' / '+fmt(f.beds),color:'#fff',fontWeight:'bold'}}],
      tooltip:Object.assign({},TT,{formatter:()=>`<b>${f.name}</b>${ttRow('الأسرّة المشغولة',fmt(f.occupied))}${ttRow('الأسرّة الشاغرة',fmt(f.beds-f.occupied))}${ttRow('معدل الإشغال',fmt1(f.occ_rate)+'٪')}`}),
    })); c.resize(); });
}

/* ============================================================
   TAB 1 — العرض والطلب
   ============================================================ */
let facTable=null;
/* الطاقة المرخصة والطلب لكل قطاع — من ورقتَي 04 و08 مباشرة */
function sectorFacts(sec){
  const rs = D.capSector.filter(r=>!sec||r.name===sec);
  const beds = rs.reduce((a,r)=>a+r.beds,0);
  const demand = sec ? (D.demand.sector.find(r=>r.name===sec)||{total:0}).total : D.meta.totals.demand;
  return {rs,beds,demand,gap:demand-beds,cov:beds?beds/demand*100:0,
    opLic:rs.reduce((a,r)=>a+r.opLic,0), buildLic:rs.reduce((a,r)=>a+r.buildLic,0)};
}
/* المصدر لا يفصّل الياقات على القطاعات أو المجموعات المهنية، فلا تُشتق قيم
   تناسبية: تُعرض أرقام المدينة كما هي مع تنبيه على النطاق. */
function demandVal(row){ return row.total; }

function scopeFacts(){
  const rs = D.capSector.filter(r=>secOK(r.name));
  const beds = rs.reduce((a,r)=>a+r.beds,0);
  const demand = S.sectors.size
    ? D.demand.sector.filter(r=>S.sectors.has(r.name)).reduce((a,r)=>a+r.total,0)
    : D.meta.totals.demand;
  return {rs,beds,demand,gap:demand-beds,cov:beds?beds/demand*100:0,
    opLic:rs.reduce((a,r)=>a+r.opLic,0), buildLic:rs.reduce((a,r)=>a+r.buildLic,0)};
}
function scopeLabel(){
  const n=S.sectors.size;
  if(!n) return null;
  if(n===1) return [...S.sectors][0];
  return n===2? 'قطاعين محددين' : `${n} قطاعات محددة`;
}
function renderT1(){
  const sec = scopeLabel();
  const sf = scopeFacts();
  /* hero — العرض · الفجوة · الطلب */
  countUp(el('hero-demand'), sf.demand);
  countUp(el('hero-supply'), sf.beds);
  countUp(el('hero-gap'), sf.gap);
  const covPct = sf.cov, gapPct = 100 - covPct;
  el('hero-cov').textContent = fmt1(covPct)+'٪';
  el('hero-mult').innerHTML = ltr(fmt1(sf.beds? sf.demand/sf.beds : 0)+'×');
  el('gb-lab').textContent = `الفجوة ${fmt1(gapPct)}٪`;
  el('gb-sup').textContent = `العرض ${fmt1(covPct)}٪`;
  el('gb-dem').textContent = `إجمالي الطلب: ${fmt(sf.demand)}`;
  requestAnimationFrame(()=>{ el('bridge-fill').style.width = Math.max(0.6, covPct)+'%'; });
  if(!REDUCED){ ['hero-demand','hero-supply'].forEach(id=>{
    el(id).classList.remove('glow'); void el(id).offsetWidth; el(id).classList.add('glow'); }); }

  const k = 1;
  el('t1-demand-hint').innerHTML =
    'إجمالي العمالة حسب أبعاد التصنيف المتاحة في المصدر' +
    (sec? ` <span class="scope-note">تركيبة الطلب (الياقات والمجموعات المهنية) متاحة على مستوى المدينة فقط — لا تتأثر بتصفية ${sec}</span>` : '');

  /* donut — collar */
  const collar = chart('c-collar');
  collar.setOption(base({
    tooltip:Object.assign({},TT,{trigger:'item',formatter:p=>`<b>${p.name}</b>${ttRow('عدد العمالة',fmt(p.value),p.color)}${ttRow('النسبة',p.percent+'٪')}`}),
    legend:{bottom:0,icon:'circle',itemWidth:9,textStyle:{fontFamily:'Cairo',fontSize:11}},
    series:[{type:'pie',radius:['52%','76%'],center:['50%','44%'],
      itemStyle:{borderColor:'#fff',borderWidth:2,borderRadius:6},
      label:{show:true,formatter:p=>`${Math.round(p.percent)}٪`,fontFamily:'IBM Plex Sans Arabic',fontWeight:'bold',fontSize:13,color:C.ink},
      emphasis:{scaleSize:6},
      data:[
        {name:'ياقات زرقاء',value:D.meta.totals.blue,itemStyle:{color:C.teal}},
        {name:'ياقات بيضاء',value:D.meta.totals.white,itemStyle:{color:C.gold}},
      ]}],
  }));
  /* لا يوفر المصدر تصنيف الياقة داخل المجموعات المهنية، فلا يمكن للشريحة تصفية بقية الرسوم */
  reClick(collar,null);

  /* SSCO horizontal bars */
  let occRows = D.demand.occupation
    .map(r=>({name:r.name,v:r.count})).sort((a,b)=>a.v-b.v);
  const ssco = chart('c-ssco');
  ssco.setOption(base({
    grid:{containLabel:true,left:48,right:14,top:6,bottom:2},
    tooltip:Object.assign({},TT,{formatter:p=>`<b>${p.name}</b>${ttRow('عدد العمالة',fmt(p.value),C.teal)}${ttRow('من إجمالي الطلب',(p.value/D.meta.totals.demand*100).toFixed(1)+'٪')}`}),
    xAxis:Object.assign({},AXV,{inverse:true}),
    yAxis:Object.assign({},AXC,{data:occRows.map(r=>r.name),position:'right',axisLabel:Object.assign({},AXC.axisLabel,{width:170,overflow:'truncate'})}),
    series:[{type:'bar',data:occRows.map(r=>r.v),barMaxWidth:18,
      itemStyle:{color:C.teal,borderRadius:[6,0,0,6]},
      label:{show:true,position:'left',formatter:p=>fmtAx(p.value),fontSize:10.5,color:C.muted,fontFamily:'Cairo'}}],
  }));
  reClick(ssco,null);

  /* القطاع الاقتصادي · حجم المنشأة · الفئات العمرية · الجنسيات
     أبعاد غير موجودة في مصنّف البيانات الرئيسي — تُعرض بحالة صريحة */
  noData('c-econ','econ');
  noData('c-sme','sme');
  noData('c-age','age');
  noData('c-nat','nat');

  /* demand by municipal sector */
  const dsecRows=D.demand.sector;
  const dsec=chart('c-dsec');
  dsec.setOption(base({
    grid:{containLabel:true,left:8,right:8,top:14,bottom:2},
    tooltip:Object.assign({},TT,{formatter:p=>`<b>${p.name}</b>${ttRow('عدد العمالة',fmt(p.value),p.color)}${ttRow('','انقر للتصفية على هذا القطاع')}`}),
    xAxis:Object.assign({},AXC,{data:dsecRows.map(r=>r.name.replace(/^(ال)?قطاع /,'')),inverse:true}),
    yAxis:AXVY,
    series:[{type:'bar',data:dsecRows.map(r=>({value:demandVal(r),
      itemStyle:{color:S.sectors.has(r.name)?C.green:C.teal,borderRadius:[6,6,0,0],opacity:S.sectors.size&&!S.sectors.has(r.name)?0.35:1}})),
      barMaxWidth:24,label:{show:true,position:'top',formatter:p=>fmtAx(p.value),fontSize:10,color:C.muted,fontFamily:'Cairo'}}],
  }));
  reClick(dsec,p=>toggleSector(dsecRows[p.dataIndex].name));

  /* بطاقات المعروض — المصدر لا يتضمن إشغالاً فعلياً ولا سجل منشآت */
  const occCard=document.querySelector('[data-count="occupancy"]');
  occCard.textContent='—'; occCard.classList.add('na-val');
  el('chip-occ-note').innerHTML=NA_CHIP; el('chip-occ-note').className='k-delta na';
  countUp(document.querySelector('[data-count="facilities"]'),sf.opLic);
  el('chip-fac-note').textContent=`${fmt(sf.buildLic)} رخصة بناء · ${fmt(sf.beds)} سرير مرخص`;
  el('chip-fac-note').className='k-delta up';
  const topCap=[...D.capSector].sort((a,b)=>b.beds-a.beds)[0];
  el('chip-topsec').textContent=topCap.name;
  el('chip-topsec-note').textContent=`${fmt(topCap.beds)} سرير · تغطية ${fmt1(topCap.cov)}٪`;
  el('chip-topsec-note').className='k-delta flat';

  /* stacked bar by type */
  /* الطاقة حسب نوع السكن — ورقة 09 (على مستوى المدينة؛ المصدر لا يوزعها قطاعياً) */
  const typeAgg = TYPES.map(t=>{
    const r=D.licType.find(x=>x.name===t);
    return (r && typOK(t)) ? r.beds : 0;
  });
  const typeTotal = typeAgg.reduce((a,b)=>a+b,0)||1;
  const ct = chart('c-type');
  ct.setOption(base({
    grid:{containLabel:true,left:8,right:8,top:8,bottom:26},
    legend:{bottom:0,icon:'circle',itemWidth:9,textStyle:{fontFamily:'Cairo',fontSize:11}},
    tooltip:Object.assign({},TT,{formatter:p=>`<b>${p.seriesName}</b>${ttRow('الأسرّة',fmt(p.value),p.color)}${ttRow('النسبة',(p.value/typeTotal*100).toFixed(1)+'٪')}`}),
    xAxis:Object.assign({},AXV,{inverse:true,max:typeTotal}),
    yAxis:Object.assign({},AXC,{data:['الأسرّة'],position:'right',axisLabel:{show:false},axisLine:{show:false}}),
    series:TYPES.map((t,i)=>({name:t,type:'bar',stack:'a',data:[typeAgg[i]],barWidth:34,
      itemStyle:{color:TYPE_COLORS[t],borderColor:'#fff',borderWidth:2,borderRadius:4},
      label:{show:typeAgg[i]/typeTotal>0.08,formatter:()=>`${fmtAx(typeAgg[i])} · ${(typeAgg[i]/typeTotal*100).toFixed(0)}٪`,
        color:'#fff',fontFamily:'Cairo',fontWeight:'bold',fontSize:11}})),
  }));

  /* supply vs demand per sector */
  const sup=chart('c-supsec');
  const supRows=D.capSector.map(r=>({s:r.name,beds:r.beds,dem:r.demand}))
    .sort((a,b)=>b.dem-a.dem);            /* الأكبر إلى اليمين في الاتجاه العربي */
  sup.setOption(base({
    grid:{containLabel:true,left:10,right:10,top:44,bottom:2},
    legend:{top:0,right:0,icon:'rect',itemWidth:13,itemHeight:13,itemGap:16,
      textStyle:{fontFamily:'Cairo',fontSize:12,color:C.ink},data:['العرض','الطلب']},
    graphic:[{type:'text',left:6,top:6,style:{text:'سرير',font:'600 11px Cairo',fill:C.muted}}],
    tooltip:Object.assign({},TT,{trigger:'axis',axisPointer:{type:'shadow'},formatter:ps=>{
      const r=supRows[ps[0].dataIndex];
      return `<b>${r.s}</b>${ttRow('الطلب',fmt(r.dem),'#A8C6B5')}${ttRow('العرض',fmt(r.beds),'#1E5B44')}`+
        ttRow('نسبة التغطية',(r.beds/r.dem*100).toFixed(2)+'٪');}}),
    xAxis:Object.assign({},AXC,{data:supRows.map(r=>r.s),inverse:true,
      axisLabel:Object.assign({},AXC.axisLabel,{fontSize:12,color:C.ink})}),
    yAxis:Object.assign({},AXVY,{splitNumber:5}),
    series:[
      {name:'الطلب',type:'bar',data:supRows.map(r=>r.dem),barMaxWidth:34,barGap:'12%',
        itemStyle:{color:'#A8C6B5',borderRadius:[3,3,0,0]},
        label:{show:true,position:'top',formatter:p=>fmtAx(p.value),fontSize:11.5,
          fontWeight:'bold',color:C.ink,fontFamily:'Cairo'}},
      {name:'العرض',type:'bar',data:supRows.map(r=>r.beds),barMaxWidth:34,
        itemStyle:{color:'#1E5B44',borderRadius:[3,3,0,0]},
        label:{show:true,position:'top',formatter:p=>fmtAx(p.value),fontSize:11.5,
          fontWeight:'bold',color:'#1E5B44',fontFamily:'Cairo'}},
    ],
  }));
  reClick(sup,p=>toggleSector(supRows[p.dataIndex].s));

  /* map + side panel */
  /* خريطة فعلية للرياض؛ القطاعات كدوائر متناسبة — لا إحداثيات منشآت في المصدر */
  drawMap('map1',{
    sectorTip:s=>{const x=sectorFacts(s);
      return `<b>${s}</b>${ttRow('الأسرّة المرخصة',fmt(x.beds))}${ttRow('الرخص التشغيلية',fmt(x.opLic))}${ttRow('رخص البناء',fmt(x.buildLic))}${ttRow('العمالة (الطلب)',fmt(x.demand))}${ttRow('نسبة التغطية',fmt1(x.cov)+'٪')}`;},
    onSector:toggleSector,
    metric:s=>(D.capSector.find(r=>r.name===s)||{beds:0}).beds,
    metricLabel:'الأسرّة المرخصة',
  });
  renderMap1Side(sec,sf);

  /* سجل المنشآت — غير موجود في المصدر */
  noData('tbl-fac','facilities');
  el('fac-search').style.display='none';
  T1FACS=[];
  if(false){
  const facCols=[
    {k:'name',l:'المنشأة'},{k:'sector',l:'القطاع',f:v=>v.replace(/^(ال)?قطاع /,'')},{k:'district',l:'الحي'},{k:'type',l:'النوع'},
    {k:'beds',l:'الأسرّة المرخصة',f:fmt,sort:true},{k:'occupied',l:'المشغولة',f:fmt},
    {k:'occ_rate',l:'الإشغال',f:v=>`<span class="st ${v>95?'st-red':v>85?'st-amber':'st-green'}">${fmt1(v)}٪</span>`},
    {k:'compliance',l:'الامتثال'},{k:'risk',l:'الخطورة',f:v=>`<span class="st ${RISK_CHIP[v]}">${v}</span>`},
    {k:'lic_status',l:'الترخيص',f:v=>`<span class="st ${v==='ساري'?'st-green':'st-amber'}">${v}</span>`},
  ];
  facTable=makeTable('tbl-fac',facCols,filterFacs(),{onRow:facilityDrawer,sortKey:'beds'});
  }
}
let T1FACS=[];
function filterFacs(){ const q=S.facSearch.trim();
  return T1FACS.filter(f=>!q||f.name.includes(q)||f.district.includes(q)); }
function demandScaledVal(row,k){ return Math.round(demandVal(row)*k); }
function colChart(id,cats,vals,colors,onClick){
  const c=chart(id);
  c.setOption(base({
    grid:{containLabel:true,left:8,right:8,top:14,bottom:2},
    tooltip:Object.assign({},TT,{formatter:p=>`<b>${p.name}</b>${ttRow('عدد العمالة',fmt(p.value),p.color)}`}),
    xAxis:Object.assign({},AXC,{data:cats,inverse:true}),
    yAxis:AXVY,
    series:[{type:'bar',data:vals.map((v,i)=>({value:v,itemStyle:{color:colors[i],borderRadius:[6,6,0,0]}})),
      barMaxWidth:26,label:{show:true,position:'top',formatter:p=>fmtAx(p.value),fontSize:10,color:C.muted,fontFamily:'Cairo'}}],
  }));
  reClick(c,onClick? p=>onClick(p.dataIndex):null);
}
function renderMap1Side(sec,sf){
  const side=el('map1-side');
  const rows=[...sf.rs].sort((a,b)=>b.beds-a.beds);
  side.innerHTML=`
    <div class="ms-title">${sec||'كل القطاعات — نظرة عامة'}</div>
    <div class="ms-stats">
      <div class="ms-stat"><div class="l">الأسرّة المرخصة</div><div class="v">${fmt(sf.beds)}</div></div>
      <div class="ms-stat"><div class="l">العمالة (الطلب)</div><div class="v">${fmt(sf.demand)}</div></div>
      <div class="ms-stat"><div class="l">الرخص التشغيلية</div><div class="v">${fmt(sf.opLic)}</div></div>
      <div class="ms-stat"><div class="l">نسبة التغطية</div><div class="v">${fmt1(sf.cov)}٪</div></div>
    </div>
    <div><b style="font-size:12px">الطاقة المرخصة حسب القطاع</b>
      <div class="chart short" id="side-cap"></div></div>
    <div style="font-size:11px;color:var(--muted);font-weight:600;line-height:1.6">
      يتضمن المصدر ${fmt(D.unassigned.constr)} رخصة بناء غير مصنفة قطاعياً بطاقة صفرية — محتسبة في الإجمالي وغير منسوبة لأي قطاع.
    </div>`;
  const c=chart('side-cap');
  c.setOption(base({
    grid:{containLabel:true,left:44,right:52,top:6,bottom:2},
    tooltip:Object.assign({},TT,{formatter:p=>`<b>${rows[p.dataIndex].name}</b>${ttRow('الأسرّة المرخصة',fmt(p.value),C.teal)}${ttRow('نسبة التغطية',fmt1(rows[p.dataIndex].cov)+'٪')}`}),
    xAxis:Object.assign({},AXV,{inverse:true}),
    yAxis:Object.assign({},AXC,{data:rows.map(r=>r.name.replace('قطاع ','')),position:'right'}),
    series:[{type:'bar',data:rows.map(r=>({value:r.beds,itemStyle:{
        color:S.sectors.has(r.name)?C.green:C.teal,
        opacity:S.sectors.size&&!S.sectors.has(r.name)?0.4:1,borderRadius:[6,0,0,6]}})),
      barMaxWidth:14,label:{show:true,position:'left',formatter:p=>fmtAx(p.value),fontSize:10,color:C.muted}}],
  }));
  reClick(c,p=>toggleSector(rows[p.dataIndex].name));
}

/* ============================================================
   TAB 2 — التراخيص
   ============================================================ */
function licWin(){ return D.licenses.filter(r=>inWin(r.month)&&secOK(r.sector)&&typOK(r.type)); }
function kpiCard(label,valHTML,delta,cls,ico){
  return `<div class="card kpi">${ico?`<div class="k-ico">${ico}</div>`:''}
    <div class="k-label">${label}</div><div class="k-val">${valHTML}</div>
    ${delta?`<span class="k-delta ${cls||'flat'}">${delta}</span>`:''}</div>`;
}
function renderT2(){
  const rows=licWin();
  const agg=key=>rows.reduce((a,r)=>a+r[key],0);
  const constr=agg('constr'), ops=agg('ops'), bedsAdded=agg('beds_added');
  const sf=scopeFacts();
  const L=D.licDelta;
  /* النمو مقابل خط الأساس المعلن في ورقة 06 (أغسطس 2025) */
  const baseTot=L.constr.baseline+L.ops.baseline, curTot=L.constr.current+L.ops.current;
  const yoy=baseTot? (curTot/baseTot-1)*100 : 0;

  el('t2-kpis').innerHTML =
    kpiCard('إجمالي الأسرّة المرخصة',`<span id="k2-beds">0</span><small>سرير</small>`,
      `${ltr('+'+fmt1(D.facts.bedsYoY)+'٪')} مقابل خط الأساس`,'up')+
    kpiCard('نمو الرخص مقابل خط الأساس',`<span id="k2-yoy">0</span><small>٪</small>`,
      `${fmt(baseTot)} ← ${fmt(curTot)} رخصة`,'up')+
    kpiCard('رخص البناء الصادرة',`<span id="k2-constr">0</span><small>رخصة</small>`,
      `خلال ${nounCount(rows.length,'شهر','أشهر')} مسجلة`,'flat')+
    kpiCard('رخص التشغيل الصادرة',`<span id="k2-ops">0</span><small>رخصة</small>`,
      `خلال ${nounCount(rows.length,'شهر','أشهر')} مسجلة`,'flat')+
    kpiCard('الطاقة المضافة خلال الفترة',`<span id="k2-added">0</span><small>سرير</small>`,
      `الرصيد التراكمي ${fmt(D.meta.totals.beds)}`,'up')+
    kpiCard('متوسط الإضافة الشهرية',`<span id="k2-avg">0</span><small>سرير</small>`,
      `محسوب على ${nounCount(D.foresight.activeMonths,'شهر بإضافة فعلية','أشهر بإضافة فعلية')}`,'flat')+
    naCard('متوسط مدة إصدار الرخصة')+
    naCard('الطلبات المستلمة ونسبة إغلاقها');
  countUp(el('k2-beds'),sf.beds); countUp(el('k2-yoy'),yoy,{decimals:1});
  countUp(el('k2-constr'),constr); countUp(el('k2-ops'),ops);
  countUp(el('k2-added'),bedsAdded); countUp(el('k2-avg'),D.foresight.avgBeds);

  /* monthly aggregation */
  const mons=winMonths();
  const byM=mons.map(m=>{
    const rs=rows.filter(r=>r.month===m);
    return {m,lbl:MLBL[m],constr:rs.reduce((a,r)=>a+r.constr,0),ops:rs.reduce((a,r)=>a+r.ops,0),
      dc:rs.length?rs.reduce((a,r)=>a+r.days_constr,0)/rs.length:0,
      do_:rs.length?rs.reduce((a,r)=>a+r.days_ops,0)/rs.length:0};
  });
  const trend=chart('c-lictrend');
  trend.setOption(base({
    grid:{containLabel:true,left:8,right:8,top:38,bottom:4},
    legend:{top:0,icon:'circle',itemWidth:9,textStyle:{fontFamily:'Cairo',fontSize:11}},
    tooltip:Object.assign({},TT,{trigger:'axis',axisPointer:{type:'cross',label:{fontFamily:'Cairo'}},
      formatter:ps=>`<b>${ps[0].name}</b>`+ps.map(p=>ttRow(p.seriesName,fmt(p.value),p.color)).join('')+ttRow('','انقر لعرض تفاصيل الشهر')}),
    xAxis:Object.assign({},AXC,{data:byM.map(r=>r.lbl),inverse:true,axisLabel:Object.assign({},AXC.axisLabel,{rotate:S.range===24?38:0})}),
    yAxis:AXVY,
    series:[
      {name:'رخص البناء',type:'line',data:byM.map(r=>r.constr),smooth:.35,symbol:'circle',symbolSize:7,
        lineStyle:{width:2,color:C.teal},itemStyle:{color:C.teal,borderColor:'#fff',borderWidth:2},areaStyle:{color:C.teal,opacity:.1}},
      {name:'رخص التشغيل',type:'line',data:byM.map(r=>r.ops),smooth:.35,symbol:'circle',symbolSize:7,
        lineStyle:{width:2,color:C.gold},itemStyle:{color:C.gold,borderColor:'#fff',borderWidth:2},areaStyle:{color:C.gold,opacity:.1}},
    ],
  }));
  reClick(trend,p=>{
    const row=D.licenses.find(r=>r.month_ar===byM[p.dataIndex].lbl); if(!row)return;
    openDrawer(`تفاصيل ${row.month_ar}`,'الإصدار الشهري — مستوى المدينة',
      fld('رخص البناء الجديدة',fmt(row.constr))+
      fld('الرخص التشغيلية الجديدة',fmt(row.ops))+
      fld('الطاقة الاستيعابية المضافة',fmt(row.beds_added)+' سرير')+
      fld('رصيد رخص البناء التراكمي',fmt(row.cum_constr))+
      fld('رصيد الرخص التشغيلية التراكمي',fmt(row.cum_ops))+
      fld('رصيد الطاقة التراكمي',fmt(row.cum_beds)+' سرير')+
      fldNA('الطلبات المستلمة والمغلقة')+
      fldNA('متوسط مدة الإصدار')+
      `<div class="dr-note">المصدر يسجل الإصدار الشهري على مستوى المدينة ولا يفصّله على القطاعات البلدية.</div>`);
  });

  /* by sector grouped */
  /* الرصيد القطاعي من ورقة 08 — لقطة حالية لا سلسلة زمنية */
  const bySec=D.licSector.filter(r=>secOK(r.name)).map(r=>({s:r.name,c:r.constr,o:r.ops,b:r.beds}));
  const licsec=chart('c-licsec');
  licsec.setOption(base({
    grid:{containLabel:true,left:8,right:8,top:30,bottom:2},
    legend:{top:0,icon:'circle',itemWidth:9,textStyle:{fontFamily:'Cairo',fontSize:11}},
    tooltip:Object.assign({},TT,{trigger:'axis',axisPointer:{type:'shadow'},
      formatter:ps=>`<b>${bySec[ps[0].dataIndex].s}</b>`+ps.map(p=>ttRow(p.seriesName,fmt(p.value),p.color)).join('')}),
    xAxis:Object.assign({},AXC,{data:bySec.map(r=>r.s.replace(/^(ال)?قطاع /,'')),inverse:true}),
    yAxis:AXVY,
    series:[
      {name:'رخص البناء',type:'bar',data:bySec.map(r=>r.c),barMaxWidth:18,itemStyle:{color:C.teal,borderRadius:[6,6,0,0]}},
      {name:'رخص التشغيل',type:'bar',data:bySec.map(r=>r.o),barMaxWidth:18,itemStyle:{color:C.gold,borderRadius:[6,6,0,0]}},
    ],
  }));
  reClick(licsec,p=>{
    const r=bySec[p.dataIndex];
    const cap=D.capSector.find(x=>x.name===r.s)||{};
    openDrawer(r.s,'رصيد التراخيص الحالي — ورقة 08',
      fld('رخص البناء',fmt(r.c))+
      fld('الرخص التشغيلية',fmt(r.o))+
      fld('إجمالي الرخص',fmt(r.c+r.o))+
      fld('الطاقة الاستيعابية',fmt(r.b)+' سرير')+
      fld('العمالة (الطلب)',fmt(cap.demand))+
      fld('نسبة التغطية',fmt1(cap.cov)+'٪')+
      fldNA('الطلبات ومدة الإصدار')+
      `<div class="dr-note">رخص البناء مصدرها الإدارة العامة للتراخيص؛ أما الرخص التشغيلية والطاقة الاستيعابية فجهتها المنتجة غير محددة في المصدر بعد.</div>`);
  });

  /* ops by type donut — click filters */
  const byType=TYPES.map(t=>({t,v:(D.licType.find(x=>x.name===t)||{ops:0}).ops}));
  const lt=chart('c-lictype');
  lt.setOption(base({
    tooltip:Object.assign({},TT,{trigger:'item',formatter:p=>`<b>${p.name}</b>${ttRow('رخص التشغيل',fmt(p.value),p.color)}${ttRow('النسبة',p.percent+'٪')}${ttRow('','انقر للتصفية')}`}),
    legend:{bottom:0,icon:'circle',itemWidth:9,textStyle:{fontFamily:'Cairo',fontSize:11}},
    series:[{type:'pie',radius:['50%','74%'],center:['50%','44%'],
      itemStyle:{borderColor:'#fff',borderWidth:2,borderRadius:6},
      label:{show:true,formatter:p=>`${Math.round(p.percent)}٪`,fontFamily:'IBM Plex Sans Arabic',fontWeight:'bold',fontSize:12,color:C.ink},
      data:byType.map(x=>({name:x.t,value:x.v,itemStyle:{color:TYPE_COLORS[x.t],opacity:S.types.size&&!S.types.has(x.t)?0.35:1}})),
    }],
  }));
  reClick(lt,p=>{ if(S.types.has(p.name)) S.types.delete(p.name); else {S.types.clear(); S.types.add(p.name);} refresh(); });

  /* مسار الطلبات ومدة الإصدار — غير موجودين في المصدر */
  noData('c-funnel','licRequests');
  noData('c-spark1','licDays');
  noData('c-spark2','licDays');
  el('spark1-delta').innerHTML=NA_CHIP; el('spark1-delta').className='';
  el('spark2-delta').innerHTML=NA_CHIP; el('spark2-delta').className='';

  /* ── مخططات شلالية: خط الأساس ← الإضافات الشهرية ← الرصيد الحالي ── */
  const WF=[
    {id:'c-wf-constr', add:'constr', cum:'cum_constr'},
    {id:'c-wf-ops',    add:'ops',    cum:'cum_ops'},
    {id:'c-wf-beds',   add:'beds_added', cum:'cum_beds'},
  ];
  WF.forEach(w=>{
    const b0=D.licBaseline[w.cum];
    const ms=D.licenses.filter(r=>inWin(r.month));
    const cats=['الأساس',...ms.map(r=>r.month_ar.replace(/\s+\d{4}$/,'')),'الإجمالي'];
    const total=ms.length? ms[ms.length-1][w.cum] : b0;
    /* عمود شفاف يرفع كل إضافة إلى مستوى الرصيد السابق */
    const pad=[0], val=[b0], kind=['base'];
    let run=b0;
    ms.forEach(r=>{ pad.push(run); val.push(r[w.add]); kind.push('add'); run=r[w.cum]; });
    pad.push(0); val.push(total); kind.push('total');
    const c=chart(w.id);
    c.setOption(base_wf({
      grid:{containLabel:true,left:8,right:8,top:26,bottom:2},
      tooltip:Object.assign({},TT,{trigger:'axis',axisPointer:{type:'shadow'},formatter:ps=>{
        const i=ps[0].dataIndex;
        if(kind[i]==='add') return `<b>${ms[i-1].month_ar}</b>`+
          ttRow('المضاف',ltr('+'+fmt(val[i])),C.green2)+ttRow('الرصيد بعده',fmt(ms[i-1][w.cum]));
        return `<b>${cats[i]}</b>`+ttRow(kind[i]==='base'?'رصيد خط الأساس':'الرصيد الحالي',fmt(val[i]),C.green);
      }}),
      xAxis:Object.assign({},AXC,{data:cats,inverse:true,
        axisLabel:Object.assign({},AXC.axisLabel,{fontSize:9.5,interval:0})}),
      yAxis:Object.assign({},AXVY,{max:v=>v.max*1.18}),
      series:[
        {type:'bar',stack:'w',silent:true,itemStyle:{color:'transparent'},data:pad,tooltip:{show:false}},
        {type:'bar',stack:'w',barMaxWidth:26,data:val.map((v,i)=>({value:v,itemStyle:{
            color: kind[i]==='base'? '#C9D6CF' : kind[i]==='total'? C.green : C.green2,
            borderRadius:[3,3,0,0]}})),
         label:{show:true,position:'top',fontSize:10,fontFamily:'Cairo',fontWeight:'bold',
           color:p=>kind[p.dataIndex]==='add'? C.green2 : C.ink,
           formatter:p=>kind[p.dataIndex]==='add'? (p.value? fmtAx(p.value)+'+' : '') : fmtAx(p.value)}},
      ],
    }));
    reClick(c,null);
  });

  /* monthly table */
  /* ord = مفتاح ترتيب رقمي (YYYYMM) حتى يفرز عمود الشهر زمنياً لا أبجدياً */
  T2ROWS=D.licenses.filter(r=>inWin(r.month)).map(r=>({
    ord:+r.month.replace('-',''), lbl:r.month_ar,
    c:r.constr, o:r.ops, b:r.beds_added, cb:r.cum_beds, co:r.cum_ops
  }));
  licTable=makeTable('tbl-lic',[
    {k:'ord',l:'الشهر',f:(v,r)=>r.lbl,sort:true},
    {k:'c',l:'رخص البناء',f:fmt,sort:true},{k:'o',l:'رخص التشغيل',f:fmt},
    {k:'b',l:'الطاقة المضافة',f:fmt},
    {k:'co',l:'الرصيد التراكمي للرخص',f:fmt},{k:'cb',l:'الرصيد التراكمي للطاقة',f:fmt},
  ],filterLic(),{sortKey:'ord',desc:true});
}
let T2ROWS=[],licTable=null;
function filterLic(){ const q=S.licSearch.trim();
  return T2ROWS.filter(r=>!q||r.lbl.includes(q)); }
/* الشلال: حركة قصيرة حتى لا تُلتقط القيم وهي معلّقة فوق العمود الشفاف */
function base_wf(o){ const b=base(o); b.animationDuration=260; return b; }
function sparkline(id,labels,vals,deltaId){
  const first=vals[0],last=vals[vals.length-1],improving=last<first;
  const dEl=el(deltaId);
  dEl.textContent=`${improving?'▼':'▲'} ${fmt1(Math.abs(last-first))} يوم`;
  dEl.className='st '+(improving?'st-green':'st-red');
  const c=chart(id);
  c.setOption(base({
    grid:{left:4,right:4,top:8,bottom:4},
    tooltip:Object.assign({},TT,{trigger:'axis',formatter:ps=>`<b>${ps[0].name}</b>${ttRow('المدة',fmt1(ps[0].value)+' يوم',ps[0].color)}`}),
    xAxis:Object.assign({},AXC,{data:labels,inverse:true,axisLabel:{show:false},axisLine:{show:false}}),
    yAxis:{type:'value',show:false,min:v=>v.min*0.9},
    series:[{type:'line',data:vals,smooth:.4,symbol:'none',
      lineStyle:{width:2,color:improving?C.teal:C.clay},
      areaStyle:{color:improving?C.teal:C.clay,opacity:.1},
      markPoint:{symbol:'circle',symbolSize:8,itemStyle:{color:improving?C.teal:C.clay,borderColor:'#fff',borderWidth:2},
        data:[{coord:[labels.length-1,last]}],label:{show:false}}}],
  }));
}

/* ============================================================
   TAB 3 — الرقابة والامتثال
   ============================================================ */
function inspWin(){ return D.inspections.filter(r=>inWin(r.month)&&secOK(r.sector)); }
function renderT3(){
  const rows=inspWin();
  const visits=rows.reduce((a,r)=>a+r.visits,0), viol=rows.reduce((a,r)=>a+r.violations,0);
  /* التصفية القطاعية تنطبق على الأرقام القطاعية (ورقة 11) لا على السلسلة الشهرية */
  const secRows=D.inspSector.filter(r=>secOK(r.name));
  const secVisits=secRows.reduce((a,r)=>a+r.visits,0);
  const secViol=secRows.reduce((a,r)=>a+r.violations,0);
  const nInsp=secRows.reduce((a,r)=>a+r.inspectors,0);
  const compl=secVisits? (1-secViol/secVisits)*100 : 0;
  const perInsp=nInsp? secVisits/nInsp : 0;

  el('t3-kpis').innerHTML =
    kpiCard('الزيارات الرقابية',`<span id="k3-v">0</span>`,'خلال آخر 12 شهراً','flat')+
    kpiCard('المخالفات المرصودة',`<span id="k3-w">0</span>`,
      `${fmt1(secVisits?secViol/secVisits*100:0)}٪ من الزيارات`,'flat')+
    kpiCard('نسبة الامتثال',`<span id="k3-cp">0</span><small>٪</small>`,
      'زيارات بلا مخالفة ÷ إجمالي الزيارات','up')+
    kpiCard('عدد المراقبين',`<span id="k3-n">0</span><small>مراقباً</small>`,
      `${fmt(perInsp)} زيارة لكل مراقب`,'flat')+
    naCard('الغرامات المحصلة')+
    naCard('المنشآت المغلقة');
  countUp(el('k3-v'),secVisits); countUp(el('k3-w'),secViol);
  countUp(el('k3-cp'),compl,{decimals:1}); countUp(el('k3-n'),nInsp);

  /* map (monitor / hotspot) */
  const secAgg=name=>{const r=D.inspSector.find(x=>x.name===name)||{};
    return {v:r.visits||0,w:r.violations||0,i:r.inspectors||0};};
  el('map2-title').textContent='خريطة الرقابة — القطاعات البلدية';
  el('map2-sub').textContent='الزيارات والمخالفات لكل قطاع بلدي — انقر قطاعاً للتفاصيل';
  /* لا إحداثيات منشآت في المصدر، فلا نقاط ولا خريطة كثافة */
  drawMap('map2',{
    sectorTip:s=>{const a=secAgg(s);
      return `<b>${s}</b>${ttRow('الزيارات الرقابية',fmt(a.v))}${ttRow('المخالفات',fmt(a.w))}${ttRow('المراقبون',fmt(a.i))}${ttRow('معدل المخالفة',fmt1(a.v?a.w/a.v*100:0)+'٪')}`;},
    onSector:toggleSector,
    metric:s=>(D.inspSector.find(r=>r.name===s)||{violations:0}).violations,
    metricLabel:'المخالفات',
    fmtV:v=>fmt(v),
  });
  el('map2-legend').innerHTML=
    `<span class="li"><span class="sw" style="background:linear-gradient(to left,#E8F3EE,#0E5A43)"></span>مخالفات أقل ← مخالفات أكثر</span>
     <span class="li" style="margin-inline-start:auto">الحدود مرقمنة من خريطة القطاعات الرسمية للأمانة — تقريبية للعرض</span>`;
  const sSel=S.sectors.size===1?[...S.sectors][0]:null;
  const aSel=sSel? secAgg(sSel) : {v:secVisits,w:secViol,i:nInsp};
  el('map2-side').innerHTML=`
    <div class="ms-title">${sSel||'كل القطاعات — نظرة عامة'}</div>
    <div class="ms-stats">
      <div class="ms-stat"><div class="l">الزيارات الرقابية</div><div class="v">${fmt(aSel.v)}</div></div>
      <div class="ms-stat"><div class="l">المخالفات المرصودة</div><div class="v">${fmt(aSel.w)}</div></div>
      <div class="ms-stat"><div class="l">عدد المراقبين</div><div class="v">${fmt(aSel.i)}</div></div>
      <div class="ms-stat"><div class="l">معدل المخالفة</div><div class="v">${fmt1(aSel.v?aSel.w/aSel.v*100:0)}٪</div></div>
    </div>
    <div><b style="font-size:12px">توزيع المخالفات بين القطاعات</b><div class="chart short" id="side-viol"></div></div>
    <div style="flex:1;min-height:0;display:flex;flex-direction:column">
      <b style="font-size:12px">أعلى الأحياء تسجيلاً للمخالفات
        <span class="scope-note" style="margin-inline-start:4px">بيانات عينة</span></b>
      <div class="tblwrap" style="margin-top:8px;flex:1;min-height:120px" id="side-nb"></div></div>`;
  const sv=chart('side-viol');
  const svRows=D.inspSector.map(r=>({s:r.name,w:r.violations}));
  sv.setOption(base({
    grid:{containLabel:true,left:44,right:10,top:6,bottom:2},
    tooltip:Object.assign({},TT,{formatter:p=>`<b>${svRows[p.dataIndex].s}</b>${ttRow('المخالفات',fmt(p.value),p.color)}`}),
    xAxis:Object.assign({},AXV,{inverse:true}),
    yAxis:Object.assign({},AXC,{data:svRows.map(r=>r.s.replace(/^(ال)?قطاع /,'')),position:'right'}),
    series:[{type:'bar',data:svRows.map(r=>({value:r.w,itemStyle:{color:S.sectors.has(r.s)?C.green:C.teal,opacity:S.sectors.size&&!S.sectors.has(r.s)?0.4:1,borderRadius:[6,0,0,6]}})),
      barMaxWidth:14,label:{show:true,position:'left',formatter:p=>fmt(p.value),fontSize:10,color:C.muted}}],
  }));
  reClick(sv,p=>toggleSector(svRows[p.dataIndex].s));
  makeTable('side-nb',[
    {k:'name',l:'الحي'},
    {k:'sector',l:'القطاع',f:v=>(v||'').replace(/^(ال)?قطاع /,'')},
    {k:'violations',l:'المخالفات',f:fmt,sort:true},
  ],D.neighborhoods.filter(x=>!S.sectors.size||S.sectors.has(x.sector)),{sortKey:'violations',max:8});

  /* فئات المخالفات — ورقة 12 (أعداد فقط؛ لا غرامات ولا توزيع قطاعي في المصدر) */
  const catRows=D.violCats.map(c=>({c,v:c.count})).sort((a,b)=>a.v-b.v);
  const violTot=D.meta.totals.violations||1;
  const vc=chart('c-violcat');
  vc.setOption(base({
    grid:{containLabel:true,left:48,right:14,top:6,bottom:2},
    tooltip:Object.assign({},TT,{formatter:p=>`<b>${p.name}</b>${ttRow('المخالفات',fmt(p.value),C.teal)}${ttRow('من الإجمالي',(p.value/violTot*100).toFixed(1)+'٪')}${ttRow('','انقر لعرض التفاصيل')}`}),
    xAxis:Object.assign({},AXV,{inverse:true}),
    yAxis:Object.assign({},AXC,{data:catRows.map(r=>r.c.name),position:'right',axisLabel:Object.assign({},AXC.axisLabel,{width:185,overflow:'truncate'})}),
    series:[{type:'bar',data:catRows.map(r=>r.v),barMaxWidth:18,itemStyle:{color:C.teal,borderRadius:[6,0,0,6]},
      label:{show:true,position:'left',formatter:p=>fmt(p.value),fontSize:10.5,color:C.muted}}],
  }));
  reClick(vc,p=>{
    const cat=catRows[p.dataIndex].c;
    openDrawer(cat.name,'فئة المخالفة — التفاصيل',
      fld('عدد المخالفات (آخر 12 شهراً)',fmt(cat.count))+
      fld('النسبة من إجمالي المخالفات',(cat.count/violTot*100).toFixed(1)+'٪')+
      fld('الترتيب',`${cat.rank} من ${D.violCats.length}`)+
      fldNA('إجمالي الغرامات ومتوسطها')+
      fldNA('التوزيع على القطاعات البلدية')+
      fldNA('التوزيع حسب حجم المنشأة')+
      `<div class="dr-note">ورقة 12 في المصدر تسجل عدد المخالفات لكل فئة فقط. إضافة الغرامات والتوزيع القطاعي وحجم المنشأة تفعّل هذه الحقول تلقائياً.</div>`);
  });

  /* visits vs violations trend */
  const mons=winMonths();
  const byM=mons.map(m=>{const rs=rows.filter(r=>r.month===m);
    return {lbl:MLBL[m],v:rs.reduce((a,r)=>a+r.visits,0),w:rs.reduce((a,r)=>a+r.violations,0)};});
  const vv=chart('c-vv');
  vv.setOption(base({
    grid:{containLabel:true,left:8,right:8,top:38,bottom:4},
    legend:{top:0,icon:'circle',itemWidth:9,textStyle:{fontFamily:'Cairo',fontSize:11}},
    tooltip:Object.assign({},TT,{trigger:'axis',formatter:ps=>`<b>${ps[0].name}</b>`+ps.map(p=>ttRow(p.seriesName,fmt(p.value),p.color)).join('')}),
    xAxis:Object.assign({},AXC,{data:byM.map(r=>r.lbl),inverse:true,axisLabel:Object.assign({},AXC.axisLabel,{rotate:38,fontSize:9.5})}),
    /* مقياسان: المخالفات نحو 300 مقابل زيارات نحو 1,600 — بمحور واحد يصبح الخطان مسطّحين */
    yAxis:[AXVY,Object.assign({},AXVY,{position:'left',splitLine:{show:false}})],
    series:[
      {name:'الزيارات الرقابية',type:'line',yAxisIndex:0,data:byM.map(r=>r.v),smooth:.35,symbol:'circle',symbolSize:6,
        lineStyle:{width:2,color:C.teal},itemStyle:{color:C.teal,borderColor:'#fff',borderWidth:2},areaStyle:{color:C.teal,opacity:.08}},
      {name:'المخالفات المرصودة',type:'line',yAxisIndex:1,data:byM.map(r=>r.w),smooth:.35,symbol:'circle',symbolSize:6,
        lineStyle:{width:2,color:C.clay},itemStyle:{color:C.clay,borderColor:'#fff',borderWidth:2}},
    ],
  }));

  /* المخالفات حسب حجم المنشأة — غير موجودة في المصدر */
  noData('c-violsme','violBySme');

  /* نسبة الامتثال — محسوبة من الزيارات والمخالفات الفعلية وتطابق القيمة المعلنة */
  const ring=chart('c-compring');
  ring.setOption(gaugeOption({name:'نسبة الامتثال',unit:'٪',actual:+compl.toFixed(1),
    target:88,dir:'أعلى أفضل',max:100}));
  reClick(ring,null);

  /* قراءات مولّدة من بيانات الفترة */
  const worst=[...D.inspSector].map(r=>({s:r.name,rate:r.visits?r.violations/r.visits:0}))
    .sort((a,b)=>b.rate-a.rate)[0];
  const topCat=[...catRows].sort((a,b)=>b.v-a.v)[0];
  const topNb=[...D.neighborhoods].sort((a,b)=>b.violations-a.violations)[0];
  const worstCov=[...D.capSector].sort((a,b)=>a.cov-b.cov)[0];
  const ic=`<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 4.5-3.2 7.6-8 9-4.8-1.4-8-4.5-8-9V6l8-3z"/></svg>`;
  el('t3-insights').innerHTML=[
    {b:'القطاع الأعلى معدل مخالفات',s:`${worst.s} — ${fmt1(worst.rate*100)}٪ من زياراته تسفر عن مخالفة`},
    {b:'أكثر فئات المخالفات تكراراً',s:`${topCat.c.name} (${fmt(topCat.v)} مخالفة)`},
    {b:'أعلى الأحياء تسجيلاً للمخالفات',s:`${topNb.name} — ${fmt(topNb.violations)} مخالفة (بيانات عينة)`},
    {b:'القطاع الأدنى تغطيةً',s:`${worstCov.name} — ${fmt1(worstCov.cov)}٪ فقط من طلبه مغطّى بأسرّة مرخصة`},
  ].map(x=>`<div class="mini-ins"><div class="mi-ic">${ic}</div><div><b>${x.b}</b><span>${x.s}</span></div></div>`).join('');

  /* أداء المفتشين فردياً — المصدر يوفر أعدادهم حسب القطاع فقط */
  noData('c-insp','inspectors');
  noData('tbl-insp','inspectors');

  el('hot-toggle').style.display='none';
}
function colChart3(id,rows){
  const c=chart(id);
  c.setOption(base({
    grid:{containLabel:true,left:8,right:8,top:14,bottom:2},
    tooltip:Object.assign({},TT,{formatter:p=>`<b>${p.name}</b>${ttRow('المخالفات',fmt(p.value),p.color)}`}),
    xAxis:Object.assign({},AXC,{data:rows.map(r=>r.n),inverse:true}),
    yAxis:AXVY,
    series:[{type:'bar',data:rows.map(r=>({value:r.v,itemStyle:{color:r.col,borderRadius:[6,6,0,0]}})),barMaxWidth:26,
      label:{show:true,position:'top',formatter:p=>fmt(p.value),fontSize:10,color:C.muted}}],
  }));
}
function inspectorDrawer(i){
  const rate=i.violations/i.visits;
  openDrawer(i.name,'ملف أداء المفتش — إجمالي 24 شهراً',
    fld('القطاع البلدي',i.sector)+
    fld('عدد الجولات',fmt(i.visits))+
    fld('المخالفات المحررة',fmt(i.violations))+
    fld('معدل المخالفات لكل جولة',fmt1(rate))+
    fld('المسافة المقطوعة',fmt(i.distance)+' كم')+
    fld('متوسط شهري',fmt(Math.round(i.visits/24))+' جولة / شهر')+
    fld('التقييم',rate<0.16?'<span class="st st-green">أداء متوازن</span>':rate>0.24?'<span class="st st-amber">تركّز مخالفات مرتفع</span>':'<span class="st st-teal">ضمن المتوسط</span>'));
}

/* ============================================================
   TAB 4 — المبادرات
   ============================================================ */
function renderT4(){
  const inis=D.initiatives;
  const by=st=>inis.filter(i=>i.status===st).length;
  const horizon=new Date(new Date(D.meta.today).getTime()+90*864e5).toISOString().slice(0,10);
  const due90=inis.filter(i=>i.end&&i.end>D.meta.today&&i.end<=horizon&&i.status!=='منجزة').length;
  const maxLate=Math.max(0,...inis.filter(i=>i.overdue!=null).map(i=>i.overdue));
  el('t4-kpis').innerHTML =
    kpiCard('إجمالي المبادرات',`<span id="k4-n">0</span>`,'موزعة على 4 أهداف','flat')+
    kpiCard('منجزة',`<span id="k4-done">0</span>`,'حالة صريحة في المصدر','up')+
    kpiCard('جاري العمل',`<span id="k4-on">0</span>`,'ضمن الفترة المخططة','up')+
    kpiCard('متأخرة',`<span id="k4-late">0</span>`,`أقصى تأخر ${fmt(maxLate)} يوماً`,'down')+
    kpiCard('مستحقة خلال 90 يوماً',`<span id="k4-due">0</span>`,`حتى ${fmtDate(horizon)}`,'flat')+
    naCard('متوسط نسبة الإنجاز والميزانيات');
  countUp(el('k4-n'),inis.length); countUp(el('k4-done'),by('منجزة'));
  countUp(el('k4-on'),by('جاري العمل')); countUp(el('k4-late'),by('متأخرة'));
  countUp(el('k4-due'),due90);

  /* pillar cards */
  el('pillar-grid').innerHTML = D.pillars.map(p=>{
    const ps=inis.filter(i=>i.pillar===p);
    /* الحلقة تعرض نسبة المبادرات المنجزة — قيمة محسوبة من الحالات الفعلية،
       وليست متوسط إنجاز (غير موجود في المصدر). */
    const pavg=Math.round(ps.filter(i=>i.status==='منجزة').length/ps.length*100);
    const late=ps.filter(i=>i.status==='متأخرة').length;
    const sel=S.pillar===p;
    const circ=2*Math.PI*30;
    return `<div class="card pillar-card${sel?' sel':''}" data-p="${p}">
      <div class="pc-name">${p}</div>
      <div class="ring"><svg width="72" height="72">
        <circle cx="36" cy="36" r="30" fill="none" stroke="#EDF1EE" stroke-width="7"/>
        <circle class="ring-arc" cx="36" cy="36" r="30" fill="none" stroke="${pavg>=70?C.green2:pavg>=50?C.goldUi:C.amber}" stroke-width="7"
          stroke-linecap="round" stroke-dasharray="${circ}" stroke-dashoffset="${REDUCED? circ*(1-pavg/100) : circ}"
          data-off="${circ*(1-pavg/100)}"/></svg>
        <div class="ring-val">${pavg}٪</div></div>
      <div class="pc-cap">نسبة المنجزة</div>
      <div class="pc-meta">${nounCount(ps.length,'مبادرة','مبادرات')} · ${late? `<span style="color:${C.amber}">${late} متأخرة</span>`:'لا تأخر'}</div>
    </div>`;
  }).join('');
  els('.pillar-card').forEach(pc=>pc.onclick=()=>{
    S.pillar = S.pillar===pc.dataset.p? null : pc.dataset.p;
    els('.pillar-card').forEach(x=>x.classList.toggle('sel',x.dataset.p===S.pillar));
    el('t4-reset').classList.toggle('show',!!S.pillar);
    renderIniList();
  });
  if(!REDUCED) requestAnimationFrame(()=>els('.ring-arc').forEach(a=>{
    a.style.transition='stroke-dashoffset 1.1s cubic-bezier(.25,.8,.3,1)';
    a.style.strokeDashoffset=a.dataset.off;
  }));
  el('t4-reset').classList.toggle('show',!!S.pillar);
  renderIniList();
}
function renderIniList(){
  const inis=D.initiatives;
  const q=S.iniSearch.trim();
  const list=inis.filter(i=>(!S.pillar||i.pillar===S.pillar)&&(!q||i.name.includes(q)||i.num.includes(q)));
  el('ini-list-title').textContent = S.pillar? `مبادرات ${S.pillar}` : 'جميع المبادرات';
  el('ini-list').innerHTML = list.map(i=>`
    <div class="ini-row" data-id="${i.id}">
      <div><div class="in"><span class="ini-num">${i.num}</span>${i.name}</div>
        <div class="own">${i.pillar} — ${i.goalDesc}</div></div>
      <div class="ini-span">${i.start? fmtDate(i.start):'—'} ← ${i.end? fmtDate(i.end):'—'}</div>
      <div><span class="st ${STATUS_CHIP[i.status]}">${i.status}</span></div>
      <div class="ini-date cell-hide">${i.overdue!=null? `<span style="color:${C.amber};font-weight:700">متأخرة ${fmt(i.overdue)} يوماً</span>`:'ضمن الخطة'}</div>
      <div class="cell-hide na-txt">نسبة الإنجاز غير متوفرة</div>
    </div>`).join('') || '<div style="padding:24px;text-align:center;color:var(--muted)">لا توجد نتائج مطابقة</div>';
  els('.ini-row').forEach(r=>r.onclick=()=>initiativeDrawer(D.initiatives.find(i=>i.id===r.dataset.id)));

  /* gantt by target quarter */
  const qtr=d=>{const [y,m]=d.split('-').map(Number);return `${y} Q${Math.ceil(m/3)}`;};
  const quarters=[...new Set(inis.filter(i=>i.end).map(i=>qtr(i.end)))].sort();
  el('gantt').innerHTML=quarters.map(qt=>{
    const qs=inis.filter(i=>i.end&&qtr(i.end)===qt&&(!S.pillar||i.pillar===S.pillar));
    const QN={'1':'الأول','2':'الثاني','3':'الثالث','4':'الرابع'};
    const [qy,qq]=qt.split(' ');
    return `<div class="gq"><div class="gq-h">الربع ${QN[qq.replace('Q','')]} ${qy}</div>${
      qs.map(i=>`<div class="gi ${i.status==='متأخرة'?'st-late':i.status==='منجزة'?'st-done':''}"
        title="${i.num} · ${i.name} — ${i.status}" data-id="${i.id}">${i.name}</div>`).join('')||'<div style="text-align:center;color:#B8C4BE;font-size:10px">—</div>'
    }</div>`;
  }).join('');
  els('.gi').forEach(g=>g.onclick=()=>initiativeDrawer(D.initiatives.find(i=>i.id===g.dataset.id)));
}
function initiativeDrawer(i){
  const hasSpan=i.start&&i.end;
  const t0=hasSpan? new Date(i.start).getTime():0, t1=hasSpan? new Date(i.end).getTime():0;
  const now=new Date(D.meta.today).getTime();
  const pos=hasSpan? Math.max(0,Math.min(100,(now-t0)/(t1-t0)*100)) : 0;
  openDrawer(i.name,`مبادرة رقم ${i.num} — ${i.pillar}`,
    fld('الهدف',`${i.pillar} — ${i.goalDesc}`)+
    fld('الحالة',`<span class="st ${STATUS_CHIP[i.status]}">${i.status}</span>`)+
    fld('الحالة المسجلة في الملف', i.statusInFile? i.statusInFile
      : '<span class="na-txt">غير مسجلة — محتسبة زمنياً</span>')+
    (i.overdue!=null? fld('التأخر عن تاريخ الانتهاء',`<span style="color:var(--amber);font-weight:700">${fmt(i.overdue)} يوماً</span>`):'')+
    fld('تاريخ البدء', i.start? fmtDate(i.start):'<span class="na-txt">غير محدد</span>')+
    fld('تاريخ الانتهاء', i.end? fmtDate(i.end):'<span class="na-txt">غير محدد</span>')+
    fld('المدة المخططة', hasSpan? `${fmt((t1-t0)/864e5)} يوماً` : '—')+
    fldNA('نسبة الإنجاز')+ fldNA('الميزانية')+ fldNA('الجهة المسؤولة')+
    fldNA('المعلم القادم ومستوى المخاطر')+
    (hasSpan? `<div class="tl">
      <div class="tl-track"><div class="tl-today" style="inset-inline-start:${pos}%" title="اليوم"></div></div>
      <div class="tl-caps"><span>البداية: ${fmtDate(i.start)}</span><span style="color:var(--gold);font-weight:700">▲ اليوم</span><span>الاستحقاق: ${fmtDate(i.end)}</span></div>
    </div>`:'')+
    `<div class="dr-note">يسجل المصدر لكل مبادرة الحالة والتواريخ فقط (ورقتا 14 و15). إضافة نسبة الإنجاز والميزانية والجهة المسؤولة تفعّل هذه الحقول تلقائياً.</div>`);
}

/* ============================================================
   TAB 5 — مؤشرات الأداء
   ============================================================ */
function kpiStatus(k){
  const r = k.dir==='أقل أفضل'? k.target/Math.max(k.actual,0.001) : k.actual/Math.max(k.target,0.001);
  return r>=0.975? 'green' : r>=0.85? 'amber' : 'red';
}
function gaugeOption({name,unit,actual,target,dir,max,compact}){
  const mx = max || Math.max(dir==='أقل أفضل'? target*2 : target*1.4, actual*1.2);
  const bands = dir==='أقل أفضل'
    ? [[target/mx,'#177A5B'],[Math.min(1,target*1.15/mx),'#D68910'],[1,'#C0392B']]
    : [[target*0.85/mx,'#C0392B'],[target/mx,'#D68910'],[1,'#177A5B']];
  return base({
    tooltip:Object.assign({},TT,{formatter:()=>`<b>${name}</b>${ttRow('المتحقق',fmt1(actual)+' '+unit)}${ttRow('المستهدف',fmt1(target)+' '+unit)}${ttRow('الاتجاه',dir)}`}),
    series:[
      {type:'gauge',startAngle:205,endAngle:-25,min:0,max:mx,
        axisLine:{lineStyle:{width:compact?9:13,color:bands.map(b=>[b[0],b[1]+'33'])}},
        progress:{show:true,width:compact?9:13,itemStyle:{color:kpiStatus({actual,target,dir})==='green'?'#177A5B':kpiStatus({actual,target,dir})==='amber'?'#D68910':'#C0392B'}},
        pointer:{length:'58%',width:4,itemStyle:{color:C.ink}},anchor:{show:true,size:8,itemStyle:{color:C.ink}},
        axisTick:{show:false},splitLine:{show:false},
        axisLabel:{show:false},
        detail:{valueAnimation:!REDUCED,offsetCenter:[0,'62%'],fontSize:compact?16:21,fontFamily:'IBM Plex Sans Arabic',
          fontWeight:'bold',color:C.ink,formatter:v=>fmt1(v)},
        data:[{value:actual}],title:{show:false}},
    ],
  });
}
function renderT5(){
  const groups=[['kpi-strategic','استراتيجي',false],['kpi-operational','تشغيلي',true]];
  groups.forEach(([gid,level,compact])=>{
    const ks=D.kpis.filter(k=>k.level===level).filter(k=>!S.kpiWeak||kpiStatus(k)!=='green');
    el(gid).innerHTML=ks.map(k=>{
      const st=kpiStatus(k);
      const diff=k.dir==='أقل أفضل'? k.target-k.actual : k.actual-k.target;
      const good=diff>=0;
      return `<div class="card gauge-card" data-k="${k.id}">
        <div class="g-name">${k.name}</div>
        <div class="gauge${compact?' sm':''}" id="g-${k.id}"></div>
        <div class="g-meta"><span class="gv">${fmt1(k.actual)}</span><span class="gu">${k.unit}</span>
          <span class="st ${st==='green'?'st-green':st==='amber'?'st-amber':'st-red'}">${ltr((diff>=0?'+':'-')+fmt1(Math.abs(diff)))} مقابل المستهدف</span></div>
        <div class="c-sub" style="margin:4px 0 0">المستهدف: ${fmt1(k.target)} ${k.unit} · ${k.dir}</div>
      </div>`;
    }).join('')||'<div class="card" style="grid-column:1/-1;text-align:center;color:var(--muted)">كل المؤشرات ضمن المستهدف ✓</div>';
    ks.forEach(k=>{
      const g=chart('g-'+k.id);
      g.setOption(gaugeOption({name:k.name,unit:k.unit,actual:k.actual,target:k.target,dir:k.dir,
        max:k.unit==='٪'?100:null,compact}));
      reClick(g,null);
    });
    els(`#${gid} .gauge-card`).forEach(c=>{
      c.style.cursor='pointer';
      c.onclick=()=>kpiDrawer(D.kpis.find(k=>k.id===c.dataset.k));
    });
  });
  el('kpi-weak').classList.toggle('on',S.kpiWeak);
}
function kpiCommentary(k){
  const span=k.target-k.baseline, done=k.progress;
  if(done==null) return 'لا يمكن احتساب قطع المسافة لعدم اكتمال خط الأساس أو المستهدف في المصدر.';
  const rem=k.target-k.actual;
  return `قُطع ${fmt1(done)}٪ من المسافة بين خط الأساس (${fmt1(k.baseline)} ${k.unit}) `+
    `والمستهدف (${fmt1(k.target)} ${k.unit})، ويتبقى ${fmt1(Math.abs(rem))} ${k.unit} لبلوغه.`;
}
function kpiDrawer(k){
  openDrawer(k.name,`${k.pillar} · ${k.level} · ${k.dir}`,
    fld('خط الأساس',fmt1(k.baseline)+' '+k.unit)+
    fld('القيمة الحالية',fmt1(k.actual)+' '+k.unit)+
    fld('المستهدف',`<span style="color:var(--gold);font-weight:700">${fmt1(k.target)} ${k.unit}</span>`)+
    fld('قطع المسافة', k.progress!=null? fmt1(k.progress)+'٪' : '—')+
    fld('المتبقي للمستهدف',fmt1(Math.abs(k.target-k.actual))+' '+k.unit)+
    fld('الحالة',`<span class="st ${kpiStatus(k)==='green'?'st-green':kpiStatus(k)==='amber'?'st-amber':'st-red'}">${kpiStatus(k)==='green'?'على المسار':kpiStatus(k)==='amber'?'يحتاج متابعة':'حرج'}</span>`)+
    fld('جودة البيانات',`<span class="st st-amber">${k.quality}</span>`)+
    fld('المصدر',k.source||'—')+
    fld('حالة المصدر',k.srcStatus||'—')+
    `<div class="kpi-meter">
       <div class="km-track"><div class="km-fill" style="width:${Math.max(0,Math.min(100,k.progress||0))}%"></div></div>
       <div class="km-caps"><span>خط الأساس ${fmt1(k.baseline)}</span><span style="color:var(--gold);font-weight:700">المستهدف ${fmt1(k.target)}</span></div>
     </div>
     <div style="background:var(--tint2);border-radius:10px;padding:10px 14px;font-size:12px;font-weight:600;margin-top:10px">💡 ${kpiCommentary(k)}</div>`+
    `<div class="dr-note">لا توفر ورقة 16 سلسلة شهرية لهذا المؤشر — خط الأساس والمستهدف من وثيقة خطة العمل، والقيمة الحالية مصنّفة تقديريةً للعرض حتى ترد الفعلية من جهتها.</div>`);
}

/* ============================================================
   TAB 6 — التوقعات المستقبلية
   ============================================================ */
function renderT6(){
  const F=D.projection, PJ=D.foresight;
  const at6=F[5], atEnd=F[F.length-1];
  const horizon=new Date(new Date(D.meta.today).getTime()+90*864e5).toISOString().slice(0,10);
  const due90=D.initiatives.filter(i=>i.end&&i.end>D.meta.today&&i.end<=horizon&&i.status!=='منجزة').length;

  el('t6-kpis').innerHTML =
    kpiCard('متوسط الإضافة الشهرية',`<span id="k6-a">0</span><small>سرير</small>`,
      `محسوب على ${nounCount(PJ.activeMonths,'شهر بإضافة فعلية','أشهر بإضافة فعلية')}`,'flat')+
    kpiCard('الطاقة المتوقعة بعد 6 أشهر',`<span id="k6-s">0</span><small>سرير</small>`,at6.month_ar,'flat')+
    kpiCard('الفجوة المتوقعة بعد 6 أشهر',`<span id="k6-g">0</span><small>سرير</small>`,
      'وفق الوتيرة الحالية','down')+
    kpiCard('المتبقي لبلوغ مستهدف الأسرّة',`<span id="k6-r">0</span><small>سرير</small>`,
      `المستهدف المعتمد ${fmt(PJ.bedsTarget)}`,'flat')+
    kpiCard('الزمن اللازم بالوتيرة الحالية',`<span id="k6-m">0</span><small>شهراً</small>`,
      `أي نحو ${PJ.targetDate}`,'flat')+
    kpiCard('مبادرات مستحقة خلال 90 يوماً',`<span id="k6-i">0</span>`,`حتى ${fmtDate(horizon)}`,'flat');
  countUp(el('k6-a'),PJ.avgBeds); countUp(el('k6-s'),at6.supply);
  countUp(el('k6-g'),at6.gap); countUp(el('k6-r'),PJ.bedsRemaining);
  countUp(el('k6-m'),PJ.monthsToTarget,{decimals:1}); countUp(el('k6-i'),due90);

  el('fc-sub').innerHTML=`الخط المتصل = مسجّل فعلياً · المتقطع = امتداد خطي محتسب · الذهبي = المستهدف المعتمد (${fmt(PJ.bedsTarget)} سرير)`;

  /* الفعلي ثم الإسقاط — سلسلة واحدة متصلة */
  const hist=D.licenses;
  const labels=[...hist.map(r=>r.month_ar),...F.map(r=>r.month_ar)];
  const actual=[...hist.map(r=>r.cum_beds),...F.map(()=>null)];
  const proj=[...hist.map((r,i)=>i===hist.length-1?r.cum_beds:null),...F.map(r=>r.supply)];
  const fc=chart('c-forecast');
  fc.setOption(base({
    grid:{containLabel:true,left:64,right:14,top:38,bottom:4},
    legend:{top:0,icon:'circle',itemWidth:9,textStyle:{fontFamily:'Cairo',fontSize:11},data:['مسجّل فعلياً','إسقاط خطي محتسب']},
    tooltip:Object.assign({},TT,{trigger:'axis',formatter:ps=>{
      const p=ps.find(x=>x.value!=null); if(!p) return '';
      return `<b>${p.name}</b>${ttRow('الطاقة الاستيعابية',fmt(p.value),p.color)}`+
        ttRow('نسبة تغطية الطلب',(p.value/D.meta.totals.demand*100).toFixed(2)+'٪')+
        ttRow('من المستهدف',(p.value/PJ.bedsTarget*100).toFixed(0)+'٪');}}),
    xAxis:Object.assign({},AXC,{data:labels,inverse:true,boundaryGap:false,
      axisLabel:Object.assign({},AXC.axisLabel,{rotate:34,fontSize:9,interval:1})}),
    yAxis:Object.assign({},AXVY,{max:Math.ceil(Math.max(PJ.supplyIn12,PJ.bedsTarget)*1.08/50000)*50000}),
    series:[
      {name:'مسجّل فعلياً',type:'line',data:actual,smooth:false,symbol:'circle',symbolSize:5,
        lineStyle:{width:2.4,color:C.teal},itemStyle:{color:C.teal,borderColor:'#fff',borderWidth:2},
        areaStyle:{color:C.teal,opacity:.09},connectNulls:false},
      {name:'إسقاط خطي محتسب',type:'line',data:proj,smooth:false,symbol:'none',connectNulls:true,
        lineStyle:{width:2,color:C.gold,type:'dashed'},itemStyle:{color:C.gold},
        markLine:{symbol:'none',lineStyle:{color:C.goldUi,width:2,type:'dashed'},
          label:{formatter:`المستهدف ${fmt(PJ.bedsTarget)}`,fontFamily:'Cairo',color:'#8A6D24',position:'insideStartTop'},
          data:[{yAxis:PJ.bedsTarget}]}},
    ],
  }),true);

  /* الفجوة المتوقعة شهرياً */
  el('gap-sub').textContent='محتسبة: الطلب المسجّل − الطاقة المتوقعة';
  const gp=chart('c-gapbar');
  gp.setOption(base({
    grid:{containLabel:true,left:8,right:8,top:14,bottom:4},
    tooltip:Object.assign({},TT,{formatter:p=>`<b>${F[p.dataIndex].month_ar}</b>${ttRow('الفجوة المتوقعة',fmt(p.value)+' سرير',p.color)}${ttRow('نسبة التغطية',fmt1(F[p.dataIndex].cov)+'٪')}`}),
    xAxis:Object.assign({},AXC,{data:F.map(r=>r.month_ar),inverse:true,axisLabel:Object.assign({},AXC.axisLabel,{rotate:32,fontSize:9})}),
    yAxis:Object.assign({},AXVY,{min:v=>Math.floor(v.min*0.999),
      axisLabel:Object.assign({},AXVY.axisLabel,{
        formatter:v=>(v/1e6).toFixed(2)+' مليون'})}),
    series:[{type:'bar',data:F.map(r=>r.gap),barMaxWidth:16,
      itemStyle:{color:C.gold,borderRadius:[5,5,0,0]},label:{show:false}}],
  }));

  /* ماذا تغيّر — آخر شهرين مسجلين */
  const posted=hist.filter(r=>(r.constr+r.ops+r.beds_added)>0);
  const l1=posted[posted.length-1], l0=posted[posted.length-2];
  const i1=D.inspections.find(r=>r.month===l1.month)||D.inspections[D.inspections.length-1];
  const i0=D.inspections.find(r=>r.month===l0.month)||D.inspections[D.inspections.length-2];
  const unposted=hist.filter(r=>r.month>l1.month);
  const rowsWC=[
    {l:'الرخص الصادرة (بناء + تشغيل)',v0:l0.constr+l0.ops,v1:l1.constr+l1.ops,goodUp:true},
    {l:'الطاقة الاستيعابية المضافة',v0:l0.beds_added,v1:l1.beds_added,goodUp:true},
    {l:'الزيارات الرقابية',v0:i0.visits,v1:i1.visits,goodUp:true},
    {l:'المخالفات المرصودة',v0:i0.violations,v1:i1.violations,goodUp:false},
  ];
  el('fc-changed-sub').textContent=`${l1.month_ar} مقابل ${l0.month_ar}`;
  el('what-changed').innerHTML=
    (unposted.length? `<div class="wc-cap">آخر شهر مُرحَّل في المصدر هو ${l1.month_ar}؛ `+
      `${unposted.map(r=>r.month_ar).join(' و')} لم تُرحَّل بياناته بعد.</div>` : '')+
    rowsWC.map(r=>{
      const d=r.v1-r.v0, pct=r.v0? d/r.v0*100 : 0, up=d>=0, good=up===r.goodUp;
      return `<div class="mini-ins" style="background:#fff">
        <div class="mi-ic" style="color:${d===0?C.muted:good?C.green2:C.red}">${d===0?'=':up?'▲':'▼'}</div>
        <div style="flex:1"><b>${r.l}</b><span>${fmt(r.v0)} ← ${fmt(r.v1)}</span></div>
        <span class="st ${d===0?'st-grey':good?'st-green':'st-red'}">${d===0?'بلا تغيّر':ltr((up?'+':'-')+fmt1(Math.abs(pct))+'٪')}</span></div>`;
    }).join('');

  /* السيناريوهات والتنبؤات — لا نموذج معتمد في المصدر */
  el('alert-cards').innerHTML=
    `<div class="card" style="grid-column:1/-1"><div id="na-predict"></div></div>`;
  noData('na-predict','forecastScenarios');
  el('reco-list').innerHTML=
    `<div class="reco-note">قاعدة الاحتساب المعلنة: ${PJ.rule}<br><br>
      هذا امتداد حسابي لوتيرة سابقة وليس نموذجاً تنبؤياً معتمداً: لا يأخذ في الحسبان الموسمية
      ولا أثر المبادرات ولا الطاقة قيد الإنشاء، ويثبّت الطلب عند قيمته المسجلة لعدم توفر سلسلة
      زمنية له في المصدر.</div>`;
  els('#scen-chips').forEach&&0;
  const sc=el('scen-chips');
  if(sc){ sc.style.display='none';
    const lbl=sc.previousElementSibling;
    if(lbl && lbl.classList.contains('f-cap')) lbl.style.display='none'; }
  S.t6shown=true;
}

/* ============================================================
   router + skeleton + wiring
   ============================================================ */
const RENDER={t1:renderT1,t2:renderT2,t3:renderT3,t4:renderT4,t5:renderT5,t6:renderT6};
let skelTimer=null;
function renderNow(tab){
  el('tab-'+tab).classList.add('active');
  RENDER[tab]();
  syncSecNav();
  requestAnimationFrame(()=>Object.values(CH).forEach(c=>{try{c.resize();}catch(e){}}));
}
function go(tab){
  if(S.tab===tab){ return; }
  S.tab=tab;
  els('.rail-tab').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab));
  els('.tab').forEach(t=>t.classList.remove('active'));
  clearTimeout(skelTimer);
  window.scrollTo({top:0,behavior:REDUCED?'auto':'smooth'});
  if(REDUCED){ renderNow(tab); }
  else { el('skel').classList.add('show');
    skelTimer=setTimeout(()=>{ el('skel').classList.remove('show'); renderNow(tab); },460); }
}
function renderTab(tab){ renderNow(tab); }

/* ---------- التنقل بين الأقسام: السابق / التالي + نقاط + لوحة المفاتيح ---------- */
const TABS=['t1','t2','t3','t4','t5','t6'];
const TAB_NAME={t1:'العرض والطلب',t2:'التراخيص',t3:'الرقابة والامتثال',
  t4:'المبادرات',t5:'مؤشرات الأداء',t6:'التوقعات المستقبلية'};
function tabIdx(){ return TABS.indexOf(S.tab); }
function syncSecNav(){
  const i=tabIdx(), prev=TABS[i-1], next=TABS[i+1];
  el('sn-prev').disabled=!prev; el('sn-next').disabled=!next;
  el('sn-prev-t').textContent=prev? TAB_NAME[prev] : 'بداية اللوحة';
  el('sn-next-t').textContent=next? TAB_NAME[next] : 'نهاية اللوحة';
  els('#sn-dots .sn-dot').forEach(d=>{
    d.classList.toggle('on',d.dataset.t===S.tab);
    d.setAttribute('aria-selected',d.dataset.t===S.tab);
  });
}
el('sn-dots').innerHTML=TABS.map(t=>
  `<button class="sn-dot" role="tab" data-t="${t}" title="${TAB_NAME[t]}" aria-label="${TAB_NAME[t]}"></button>`).join('');
els('#sn-dots .sn-dot').forEach(d=>d.onclick=()=>go(d.dataset.t));
el('sn-prev').onclick=()=>{const p=TABS[tabIdx()-1]; if(p) go(p);};
el('sn-next').onclick=()=>{const nx=TABS[tabIdx()+1]; if(nx) go(nx);};
/* في العربية: السهم الأيسر يتقدم، والأيمن يرجع */
addEventListener('keydown',e=>{
  const t=e.target.tagName;
  if(t==='INPUT'||t==='SELECT'||t==='TEXTAREA') return;
  if(el('drawer').classList.contains('open')&&e.key==='Escape'){ closeDrawer(); return; }
  if(e.key==='ArrowLeft'||e.key==='PageDown'){ const nx=TABS[tabIdx()+1]; if(nx){e.preventDefault(); go(nx);} }
  if(e.key==='ArrowRight'||e.key==='PageUp'){ const p=TABS[tabIdx()-1]; if(p){e.preventDefault(); go(p);} }
});

els('.rail-tab').forEach(b=>b.onclick=()=>go(b.dataset.tab));
el('btn-ai').onclick=()=>go('t6');
/* الشعار الرسمي والصور مضمّنة كـ data URI عبر build.py — لا طلبات خارجية */
if(typeof BRAND!=='undefined' && BRAND.mark) el('rail-logo').src=BRAND.mark;
if(typeof IMAGES!=='undefined'){
  el('img-t2').style.backgroundImage=`url('${IMAGES.lic}')`;
  el('img-t3').style.backgroundImage=`url('${IMAGES.ctl}')`;
}
el('img-t2-d').textContent=
  `خلال اثني عشر شهراً ارتفعت الطاقة الاستيعابية المرخصة من ${fmt(D.licDelta.beds.baseline)} `+
  `إلى ${fmt(D.licDelta.beds.current)} سرير — بزيادة قدرها ${fmt1(D.licDelta.beds.pct)}٪.`;
el('img-t3-d').textContent=
  `${fmt(D.meta.totals.visits)} زيارة رقابية رصدت ${fmt(D.meta.totals.violations)} مخالفة، `+
  `بنسبة امتثال ${fmt1(D.meta.totals.compliance)}٪.`;

el('updated-at').textContent=D.meta.updated;
el('page-foot').innerHTML=
  `المصدر: ${D.meta.source} · فترة العرض: ${D.meta.asOf} · تاريخ اليوم المرجعي: ${fmtDate(D.meta.today)}`+
  `<br>الرسوم التي لا يتوفر لها مصدر فعلي معروضة بحالة «لا تتوفر بيانات فعلية» — وعددها `+
  `${nounCount(D.gaps.length,'رسم','رسوم')}؛ يمكن تنزيل سجلها من قائمة التصدير.`;

/* header filters */
el('g-range').onchange=e=>{S.range=+e.target.value; refresh();};
el('g-sector').onchange=e=>{S.sectors.clear(); if(e.target.value) S.sectors.add(e.target.value); refresh();};
el('g-type').onchange=e=>{S.types.clear(); if(e.target.value) S.types.add(e.target.value); refresh();};
el('g-reset').onclick=resetAll;
el('t1-reset').onclick=()=>{S.collar=null;S.sectors.clear();refresh();};
el('t4-reset').onclick=()=>{S.pillar=null; renderT4();};
D.sectors.forEach(s=>{const o=document.createElement('option');o.value=s;o.textContent=s;el('g-sector').append(o);});

/* filter bars (tabs 2/3) */
['fb2','fb3'].forEach(fb=>{
  const bar=el(fb);
  bar.querySelector('[data-role="sectors"]').innerHTML=D.sectors.map(s=>`<button class="pill" data-v="${s}">${s.replace(/^(ال)?قطاع /,'')}</button>`).join('');
  bar.querySelector('[data-role="types"]').innerHTML=TYPES.map(t=>`<button class="pill" data-v="${t}">${t}</button>`).join('');
  bar.querySelectorAll('[data-role="range"] .pill').forEach(p=>p.onclick=()=>{S.range=+p.dataset.v; refresh();});
  bar.querySelectorAll('[data-role="sectors"] .pill').forEach(p=>p.onclick=()=>{
    S.sectors.has(p.dataset.v)? S.sectors.delete(p.dataset.v):S.sectors.add(p.dataset.v); refresh();});
  bar.querySelectorAll('[data-role="types"] .pill').forEach(p=>p.onclick=()=>{
    S.types.has(p.dataset.v)? S.types.delete(p.dataset.v):S.types.add(p.dataset.v); refresh();});
  bar.querySelector('[data-role="reset"]').onclick=()=>{S.sectors.clear();S.types.clear();S.range=12;refresh();};
});

/* hotspot toggle + weak KPIs + scenario */
el('hot-toggle').onclick=()=>{S.hotspot=!S.hotspot; renderT3();};
el('kpi-weak').onclick=()=>{S.kpiWeak=!S.kpiWeak; renderT5();};
els('#scen-chips .pill').forEach(p=>p.onclick=()=>{
  S.scenario=p.dataset.v;
  els('#scen-chips .pill').forEach(x=>x.classList.toggle('on',x.dataset.v===S.scenario));
  renderT6();
});

/* searches — redraw the target table/list only */
el('fac-search').oninput=e=>{S.facSearch=e.target.value; if(facTable) facTable.redraw(filterFacs());};
el('lic-search').oninput=e=>{S.licSearch=e.target.value; if(licTable) licTable.redraw(filterLic());};
el('ini-search').oninput=e=>{S.iniSearch=e.target.value; renderIniList();};

/* export */
el('btn-export').onclick=e=>{e.stopPropagation(); el('export-menu').classList.toggle('open');};
document.addEventListener('click',()=>el('export-menu').classList.remove('open'));
function dlCSV(name,head,rows){
  const bom='﻿';
  const csv=bom+[head.join(','),...rows.map(r=>r.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');
  const a=document.createElement('a');
  a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));
  a.download=name; a.click(); URL.revokeObjectURL(a.href);
}
els('#export-menu button').forEach(b=>b.onclick=()=>{
  const x=b.dataset.x;
  if(x==='print') window.print();
  if(x==='sec') dlCSV('sectors.csv',
    ['القطاع','الطلب','الطاقة المرخصة','الفجوة','نسبة التغطية٪','رخص البناء','الرخص التشغيلية','المراقبون','الزيارات','المخالفات'],
    D.capSector.map(r=>{const c=D.inspSector.find(x=>x.name===r.name)||{};
      return [r.name,r.demand,r.beds,r.gap,r.cov.toFixed(2),r.buildLic,r.opLic,c.inspectors,c.visits,c.violations];}));
  if(x==='kpi') dlCSV('kpis.csv',['المؤشر','الهدف','النوع','الوحدة','خط الأساس','القيمة الحالية','المستهدف','قطع المسافة٪','جودة البيانات'],
    D.kpis.map(k=>[k.name,k.pillar,k.level,k.unit,k.baseline,k.actual,k.target,k.progress,k.quality]));
  if(x==='gap') dlCSV('data-gaps.csv',['المفتاح','التبويب','الرسم','المطلوب لتفعيله'],
    D.gaps.map(g=>[g.key,g.tab,g.title,g.need]));
});

/* resize */
let rzT=null;
addEventListener('resize',()=>{clearTimeout(rzT); rzT=setTimeout(()=>Object.values(CH).forEach(c=>{try{c.resize();}catch(e){}}),150);});

/* boot */
syncFilterUI();
renderT1();
