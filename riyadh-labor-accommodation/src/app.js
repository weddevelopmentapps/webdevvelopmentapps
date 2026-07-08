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
function countUp(node, to, {decimals=0, dur=1100, suffix=''}={}) {
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
const secOK = s => !S.sectors.size || S.sectors.has(s);
const typOK = t => !S.types.size || S.types.has(t);
const TYPES = ['مجمع سكني','مبنى سكني','كبائن متنقلة'];
const TYPE_COLORS = {'مجمع سكني':C.teal,'مبنى سكني':C.gold,'كبائن متنقلة':C.clay};
const STATUS_CHIP = {'مكتملة':'st-green','في المسار':'st-teal','متأخرة':'st-amber','متوقفة':'st-red'};
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

function drawMap(wrapId,{mode,sectorTip,onSector,dots,dotTip,onDot,hotspots}){
  const wrap = el(wrapId);
  const polys = D.sectors.map(sec=>{
    const g=D.geo[sec], sel=S.sectors.has(sec), dim=S.sectors.size&&!sel;
    return `<polygon class="sector-poly${sel?' sel':dim?' dim':''}" data-sec="${sec}"
      points="${g.poly.map(p=>p.join(',')).join(' ')}"></polygon>
      <text class="sector-label${sel?' sel':''}" x="${g.label[0]}" y="${g.label[1]}">${sec.replace('القطاع ','')}</text>`;
  }).join('');
  let dotSvg='';
  if(hotspots){
    dotSvg = D.hotspots.map((h,i)=>({h,i})).filter(x=>secOK(x.h.sector)).map(({h,i})=>{
      const col = h.density>60? C.red : h.density>35? C.amber : C.green2;
      return `<circle class="hot-dot" data-h="${i}" cx="${h.x}" cy="${h.y}" r="${(1+h.density/24).toFixed(1)}" fill="${col}" opacity="${(0.35+h.density/160).toFixed(2)}"></circle>`;
    }).join('');
  } else if(dots){
    dotSvg = dots.map(f=>{
      const r=(0.7+Math.sqrt(f.beds)/58).toFixed(2);
      return `<circle class="fac-dot" data-f="${f.id}" cx="${f.x}" cy="${f.y}" r="${r}" fill="${OCC_COLOR(f.occ_rate)}" fill-opacity=".82"></circle>`;
    }).join('');
  }
  wrap.innerHTML = `<svg viewBox="0 0 100 100" role="img" aria-label="خريطة قطاعات الرياض">
    <defs><filter id="soft-${wrapId}"><feDropShadow dx="0" dy=".6" stdDeviation=".7" flood-color="#0E5A43" flood-opacity=".18"/></filter></defs>
    <g filter="url(#soft-${wrapId})">${polys}</g><g>${dotSvg}</g></svg>`;
  wrap.querySelectorAll('.sector-poly').forEach(p=>{
    const sec=p.dataset.sec;
    p.addEventListener('mousemove',e=>showTip(sectorTip(sec),e.clientX,e.clientY));
    p.addEventListener('mouseleave',hideTip);
    p.addEventListener('click',()=>{hideTip(); onSector(sec);});
  });
  wrap.querySelectorAll('.fac-dot').forEach(c=>{
    const f=D.facilities.find(x=>x.id===c.dataset.f);
    c.addEventListener('mousemove',e=>showTip(dotTip(f),e.clientX,e.clientY));
    c.addEventListener('mouseleave',hideTip);
    c.addEventListener('click',e=>{e.stopPropagation(); hideTip(); onDot(f);});
  });
  wrap.querySelectorAll('.hot-dot').forEach(c=>{
    const h=D.hotspots[+c.dataset.h];
    c.addEventListener('mousemove',e=>showTip(
      `<b>نقطة ساخنة — ${h.sector}</b>${ttRow('كثافة المخالفات',h.density+' / 100')}${ttRow('التصنيف',h.density>60?'مرتفعة':h.density>35?'متوسطة':'منخفضة')}`,e.clientX,e.clientY));
    c.addEventListener('mouseleave',hideTip);
  });
}

/* ---------- facility drawer ---------- */
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
function sectorFacts(sec){
  const fs = D.facilities.filter(f=>(!sec||f.sector===sec)&&typOK(f.type));
  const beds = fs.reduce((a,f)=>a+f.beds,0), occ = fs.reduce((a,f)=>a+f.occupied,0);
  const demand = sec ? D.demand.sector.find(r=>r.name===sec).total : D.meta.totals.demand;
  return {fs,beds,occ,demand,gap:demand-beds,cov:beds?beds/demand*100:0,occr:beds?occ/beds*100:0};
}
function demandVal(row){ return S.collar==='ياقات زرقاء'? row.blue : S.collar==='ياقات بيضاء'? row.white : row.total; }
function demandScale(){ // proportional scaling for the selected sector scope
  if(!S.sectors.size) return 1;
  const sel=D.demand.sector.filter(r=>S.sectors.has(r.name)).reduce((a,r)=>a+r.total,0);
  return sel / D.meta.totals.demand;
}

function scopeFacts(){
  const fs = D.facilities.filter(f=>secOK(f.sector)&&typOK(f.type));
  const beds = fs.reduce((a,f)=>a+f.beds,0), occ = fs.reduce((a,f)=>a+f.occupied,0);
  const demand = S.sectors.size
    ? D.demand.sector.filter(r=>S.sectors.has(r.name)).reduce((a,r)=>a+r.total,0)
    : D.meta.totals.demand;
  return {fs,beds,occ,demand,gap:demand-beds,cov:beds?beds/demand*100:0,occr:beds?occ/beds*100:0};
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
  /* hero */
  countUp(el('hero-demand'), sf.demand);
  countUp(el('hero-supply'), sf.beds);
  countUp(el('hero-gap'), sf.gap);
  countUp(el('hero-cov'), sf.cov, {decimals:1});
  el('hero-demand-note').textContent = sec? `عامل وافد ضمن ${sec}` : 'عامل وافد ضمن نطاق أمانة منطقة الرياض';
  el('hero-supply-note').textContent = `سرير مرخص في ${fmt(sf.fs.length)} منشأة سكن عمالة`;
  el('bridge-cap').textContent = `التغطية ${fmt1(sf.cov)}٪ من إجمالي الطلب`;
  const covW = Math.max(2,Math.min(100,sf.cov));
  requestAnimationFrame(()=>{ el('bridge-fill').style.width=covW+'%';
    el('bridge-marker').style.insetInlineStart=`calc(${covW}% - 2px)`;
    el('bridge-gap').style.width=(100-covW)+'%'; });
  if(!REDUCED){ ['hero-demand','hero-supply'].forEach(id=>{ el(id).classList.remove('glow'); void el(id).offsetWidth; el(id).classList.add('glow'); }); }

  const k = demandScale();
  const hint = el('t1-demand-hint');
  hint.textContent = (sec? `تصفية حسب: ${sec} — توزيع تقديري تناسبي · ` : '') +
    (S.collar? `مصفّى على: ${S.collar} · انقر الشريحة مجدداً للإلغاء` : 'انقر شريحة الياقات لتصفية بقية الرسوم البيانية');

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
        {name:'ياقات زرقاء',value:Math.round(D.meta.totals.blue*k),itemStyle:{color:C.teal},selected:S.collar==='ياقات زرقاء'},
        {name:'ياقات بيضاء',value:Math.round(D.meta.totals.white*k),itemStyle:{color:C.gold},selected:S.collar==='ياقات بيضاء'},
      ]}],
  }));
  reClick(collar,p=>{ S.collar = S.collar===p.name? null : p.name; refresh(); });

  /* SSCO horizontal bars */
  let occRows = D.demand.occupation.filter(r=>!S.collar||r.collar===S.collar)
    .map(r=>({name:r.name,v:Math.round(r.count*k),collar:r.collar})).sort((a,b)=>a.v-b.v);
  const ssco = chart('c-ssco');
  ssco.setOption(base({
    grid:{containLabel:true,left:48,right:14,top:6,bottom:2},
    tooltip:Object.assign({},TT,{formatter:p=>`<b>${p.name}</b>${ttRow('عدد العمالة',fmt(p.value),p.color)}${ttRow('نوع الياقة',occRows[p.dataIndex].collar)}`}),
    xAxis:Object.assign({},AXV,{inverse:true}),
    yAxis:Object.assign({},AXC,{data:occRows.map(r=>r.name),position:'right',axisLabel:Object.assign({},AXC.axisLabel,{width:170,overflow:'truncate'})}),
    series:[{type:'bar',data:occRows.map(r=>r.v),barMaxWidth:18,
      itemStyle:{color:p=>occRows[p.dataIndex].collar==='ياقات بيضاء'?C.gold:C.teal,borderRadius:[6,0,0,6]},
      label:{show:true,position:'left',formatter:p=>fmtAx(p.value),fontSize:10.5,color:C.muted,fontFamily:'Cairo'}}],
  }));
  reClick(ssco,null);

  /* econ treemap */
  const econRows=[...D.demand.econ].map(r=>({r,v:demandScaledVal(r,k)})).sort((a,b)=>b.v-a.v);
  const ramp7=rampN(econRows.length);
  const staticRank=[...D.demand.econ].sort((a,b)=>b.total-a.total).map(r=>r.name);
  const econ=chart('c-econ');
  econ.setOption(base({
    tooltip:Object.assign({},TT,{formatter:p=>{ if(!p.name) return '';
      const tot=econRows.reduce((a,x)=>a+x.v,0)||1;
      return `<b>${p.name}</b>${ttRow('عدد العمالة',fmt(p.value))}${ttRow('النسبة من الطلب',(p.value/tot*100).toFixed(1)+'٪')}`;}}),
    series:[{type:'treemap',roam:false,nodeClick:false,breadcrumb:{show:false},
      left:0,right:0,top:0,bottom:0,
      itemStyle:{borderColor:'#fff',borderWidth:2,gapWidth:2},
      label:{fontFamily:'Cairo',fontWeight:'bold',fontSize:11.5,
        formatter:p=>`${p.name}\n${fmtAx(p.value)}`,lineHeight:17},
      levels:[{itemStyle:{borderColor:'#fff',borderWidth:2,gapWidth:2}}],
      data:econRows.map(x=>{const ri=staticRank.indexOf(x.r.name);
        return {name:x.r.name,value:x.v,
        itemStyle:{color:ramp7[staticRank.length-1-ri]},
        label:{color: ri<3? '#fff' : C.ink}};}),
    }],
  }));
  reClick(econ,p=>{ const row=D.demand.econ.find(r=>r.name===p.name); if(!row)return;
    openDrawer(row.name,'القطاع الاقتصادي — تفاصيل الطلب',
      fld('إجمالي العمالة',fmt(row.total))+fld('ياقات زرقاء',fmt(row.blue))+fld('ياقات بيضاء',fmt(row.white))+
      fld('النسبة من إجمالي الطلب',(row.total/D.meta.totals.demand*100).toFixed(1)+'٪'));
  });

  /* SME columns (ordinal ramp) */
  const smeOrder=['متناهية الصغر','صغيرة','متوسطة','كبيرة'];
  const smeRows=smeOrder.map(n=>D.demand.sme.find(r=>r.name===n));
  colChart('c-sme',smeRows.map(r=>r.name),smeRows.map(r=>Math.round(demandVal(r)*k)),rampN(4),
    (i)=>{const r=smeRows[i]; openDrawer(`منشآت ${r.name}`,'حجم المنشأة — تفاصيل الطلب',
      fld('إجمالي العمالة',fmt(r.total))+fld('ياقات زرقاء',fmt(r.blue))+fld('ياقات بيضاء',fmt(r.white)));});

  /* age columns (ordinal ramp) */
  const ageRows=D.demand.age;
  colChart('c-age',ageRows.map(r=>r.name),ageRows.map(r=>Math.round(demandVal(r)*k)),rampN(5),null);

  /* nationalities horizontal */
  const natRows=[...D.demand.nat].map(r=>({name:r.name,v:Math.round(demandVal(r)*k)})).sort((a,b)=>a.v-b.v);
  const nat=chart('c-nat');
  nat.setOption(base({
    grid:{containLabel:true,left:48,right:14,top:6,bottom:2},
    tooltip:Object.assign({},TT,{formatter:p=>`<b>${p.name}</b>${ttRow('عدد العمالة',fmt(p.value),C.teal)}`}),
    xAxis:Object.assign({},AXV,{inverse:true}),
    yAxis:Object.assign({},AXC,{data:natRows.map(r=>r.name),position:'right'}),
    series:[{type:'bar',data:natRows.map(r=>r.v),barMaxWidth:16,
      itemStyle:{color:C.teal,borderRadius:[6,0,0,6]},
      label:{show:true,position:'left',formatter:p=>fmtAx(p.value),fontSize:10.5,color:C.muted,fontFamily:'Cairo'}}],
  }));

  /* demand by municipal sector */
  const dsecRows=D.demand.sector;
  const dsec=chart('c-dsec');
  dsec.setOption(base({
    grid:{containLabel:true,left:8,right:8,top:14,bottom:2},
    tooltip:Object.assign({},TT,{formatter:p=>`<b>${p.name}</b>${ttRow('عدد العمالة',fmt(p.value),p.color)}${ttRow('','انقر للتصفية على هذا القطاع')}`}),
    xAxis:Object.assign({},AXC,{data:dsecRows.map(r=>r.name.replace('القطاع ','')),inverse:true}),
    yAxis:AXVY,
    series:[{type:'bar',data:dsecRows.map(r=>({value:demandVal(r),
      itemStyle:{color:S.sectors.has(r.name)?C.green:C.teal,borderRadius:[6,6,0,0],opacity:S.sectors.size&&!S.sectors.has(r.name)?0.35:1}})),
      barMaxWidth:24,label:{show:true,position:'top',formatter:p=>fmtAx(p.value),fontSize:10,color:C.muted,fontFamily:'Cairo'}}],
  }));
  reClick(dsec,p=>toggleSector(dsecRows[p.dataIndex].name));

  /* supply chips */
  countUp(document.querySelector('[data-count="occupancy"]'),sf.occr,{decimals:1});
  countUp(document.querySelector('[data-count="facilities"]'),sf.fs.length);
  el('chip-occ-note').textContent = sf.occr>91? 'إشغال مرتفع — قرب الطاقة القصوى' : 'ضمن النطاق التشغيلي';
  el('chip-occ-note').className = 'k-delta '+(sf.occr>93?'down':sf.occr>88?'flat':'up');
  const TYPE_PLURAL={'مجمع سكني':'مجمعات','مبنى سكني':'مبانٍ','كبائن متنقلة':'كبائن'};
  const byType = TYPES.map(t=>({t,n:sf.fs.filter(f=>f.type===t).length}));
  el('chip-fac-note').textContent = byType.map(x=>`${TYPE_PLURAL[x.t]}: ${x.n}`).join(' · ');
  const bySecOcc = D.sectors.map(s=>{const x=sectorFacts(s);return {s,occ:x.occr};}).sort((a,b)=>b.occ-a.occ)[0];
  el('chip-topsec').textContent = bySecOcc.s;
  el('chip-topsec-note').textContent = `إشغال ${fmt1(bySecOcc.occ)}٪`;

  /* stacked bar by type */
  const typeAgg = TYPES.map(t=>sf.fs.filter(f=>f.type===t).reduce((a,f)=>a+f.beds,0));
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
  const supRows=D.sectors.map(s=>({s,beds:sectorFacts(s).beds,dem:D.demand.sector.find(r=>r.name===s).total}));
  sup.setOption(base({
    grid:{containLabel:true,left:8,right:8,top:30,bottom:2},
    legend:{top:0,icon:'circle',itemWidth:9,textStyle:{fontFamily:'Cairo',fontSize:11}},
    tooltip:Object.assign({},TT,{trigger:'axis',axisPointer:{type:'shadow'},formatter:ps=>{
      const r=supRows[ps[0].dataIndex];
      return `<b>${r.s}</b>${ttRow('العمالة (الطلب)',fmt(r.dem),C.gold)}${ttRow('الأسرّة المرخصة',fmt(r.beds),C.teal)}${ttRow('نسبة التغطية',(r.beds/r.dem*100).toFixed(1)+'٪')}`;}}),
    xAxis:Object.assign({},AXC,{data:supRows.map(r=>r.s.replace('القطاع ','')),inverse:true}),
    yAxis:AXVY,
    series:[
      {name:'العمالة (الطلب)',type:'bar',data:supRows.map(r=>r.dem),barMaxWidth:20,itemStyle:{color:C.gold,borderRadius:[6,6,0,0]}},
      {name:'الأسرّة المرخصة',type:'bar',data:supRows.map(r=>r.beds),barMaxWidth:20,itemStyle:{color:C.teal,borderRadius:[6,6,0,0]}},
    ],
  }));
  reClick(sup,p=>toggleSector(supRows[p.dataIndex].s));

  /* map + side panel */
  drawMap('map1',{
    mode:'supply',
    sectorTip:s=>{const x=sectorFacts(s);
      return `<b>${s}</b>${ttRow('الأسرّة المرخصة',fmt(x.beds))}${ttRow('معدل الإشغال',fmt1(x.occr)+'٪')}${ttRow('عدد المنشآت',fmt(x.fs.length))}${ttRow('العمالة (الطلب)',fmt(x.demand))}${ttRow('نسبة التغطية',fmt1(x.cov)+'٪')}`;},
    onSector:toggleSector,
    dots:D.facilities.filter(f=>secOK(f.sector)&&typOK(f.type)),
    dotTip:f=>`<b>${f.name}</b>${ttRow('النوع',f.type)}${ttRow('الأسرّة المرخصة',fmt(f.beds))}${ttRow('معدل الإشغال',fmt1(f.occ_rate)+'٪',OCC_COLOR(f.occ_rate))}${ttRow('حالة الترخيص',f.lic_status)}`,
    onDot:facilityDrawer,
  });
  renderMap1Side(sec,sf);

  /* facilities table */
  T1FACS=sf.fs;
  const facCols=[
    {k:'name',l:'المنشأة'},{k:'sector',l:'القطاع',f:v=>v.replace('القطاع ','')},{k:'district',l:'الحي'},{k:'type',l:'النوع'},
    {k:'beds',l:'الأسرّة المرخصة',f:fmt,sort:true},{k:'occupied',l:'المشغولة',f:fmt},
    {k:'occ_rate',l:'الإشغال',f:v=>`<span class="st ${v>95?'st-red':v>85?'st-amber':'st-green'}">${fmt1(v)}٪</span>`},
    {k:'compliance',l:'الامتثال'},{k:'risk',l:'الخطورة',f:v=>`<span class="st ${RISK_CHIP[v]}">${v}</span>`},
    {k:'lic_status',l:'الترخيص',f:v=>`<span class="st ${v==='ساري'?'st-green':'st-amber'}">${v}</span>`},
  ];
  facTable=makeTable('tbl-fac',facCols,filterFacs(),{onRow:facilityDrawer,sortKey:'beds'});
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
  const top5=[...sf.fs].sort((a,b)=>b.beds-a.beds).slice(0,5);
  side.innerHTML=`
    <div class="ms-title">${sec||'كل القطاعات — نظرة عامة'}</div>
    <div class="ms-stats">
      <div class="ms-stat"><div class="l">الأسرّة المرخصة</div><div class="v">${fmt(sf.beds)}</div></div>
      <div class="ms-stat"><div class="l">العمالة (الطلب)</div><div class="v">${fmt(sf.demand)}</div></div>
      <div class="ms-stat"><div class="l">عدد المنشآت</div><div class="v">${fmt(sf.fs.length)}</div></div>
      <div class="ms-stat"><div class="l">نسبة التغطية</div><div class="v">${fmt1(sf.cov)}٪</div></div>
    </div>
    <div class="gauge sm" id="side-gauge"></div>
    <div><b style="font-size:12px">أكبر 5 منشآت${sec?' في القطاع':''}</b>
      <div class="tblwrap" style="margin-top:8px;max-height:210px" id="side-top5"></div></div>`;
  const g=chart('side-gauge');
  g.setOption(gaugeOption({name:'معدل الإشغال',unit:'٪',actual:+sf.occr.toFixed(1),target:88,dir:'أقل أفضل',max:100,compact:true}));
  reClick(g,null);
  makeTable('side-top5',[
    {k:'name',l:'المنشأة'},{k:'beds',l:'الأسرّة',f:fmt,sort:true},
    {k:'occ_rate',l:'الإشغال',f:v=>fmt1(v)+'٪'},
  ],top5,{onRow:facilityDrawer,sortKey:'beds'});
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
  const constr=agg('constr'),ops=agg('ops'),reqIn=agg('req_in'),reqCl=agg('req_closed');
  const daysC=rows.length?rows.reduce((a,r)=>a+r.days_constr,0)/rows.length:0;
  const daysO=rows.length?rows.reduce((a,r)=>a+r.days_ops,0)/rows.length:0;
  const all=D.licenses.filter(r=>secOK(r.sector)&&typOK(r.type));
  const y1=all.filter(r=>r.month<M24[12]).reduce((a,r)=>a+r.constr+r.ops,0);
  const y2=all.filter(r=>r.month>=M24[12]).reduce((a,r)=>a+r.constr+r.ops,0);
  const yoy=y1? (y2/y1-1)*100 : 0;
  const beds=D.facilities.filter(f=>secOK(f.sector)&&typOK(f.type)).reduce((a,f)=>a+f.beds,0);
  const closeRate=reqIn? reqCl/reqIn*100 : 0;

  el('t2-kpis').innerHTML =
    kpiCard('إجمالي الأسرّة المرخصة',`<span id="k2-beds">0</span><small>سرير</small>`,`${ltr('+'+fmt1(D.facts.bedsYoY)+'٪')} نمو سنوي`,'up')+
    kpiCard('نمو الرخص (سنوي)',`<span id="k2-yoy">0</span><small>٪</small>`,'مقارنة بالاثني عشر شهراً السابقة','up')+
    kpiCard('رخص البناء الصادرة',`<span id="k2-constr">0</span><small>رخصة</small>`,`خلال آخر ${S.range} شهراً`,'flat')+
    kpiCard('رخص التشغيل الصادرة',`<span id="k2-ops">0</span><small>رخصة</small>`,`خلال آخر ${S.range} شهراً`,'flat')+
    kpiCard('متوسط إصدار رخصة البناء',`<span id="k2-dc">0</span><small>يوم</small>`,'اتجاه متحسّن','up')+
    kpiCard('متوسط إصدار رخصة التشغيل',`<span id="k2-do">0</span><small>يوم</small>`,'اتجاه متحسّن','up')+
    kpiCard('الطلبات المستلمة',`<span id="k2-req">0</span><small>طلب</small>`,`${fmt(reqCl)} طلب مغلق`,'flat')+
    kpiCard('نسبة إغلاق الطلبات',`<span id="k2-close">0</span><small>٪</small>`,closeRate>=85?'أعلى من المستهدف (85٪)':'دون المستهدف (85٪)',closeRate>=85?'up':'down');
  countUp(el('k2-beds'),beds); countUp(el('k2-yoy'),yoy,{decimals:1});
  countUp(el('k2-constr'),constr); countUp(el('k2-ops'),ops);
  countUp(el('k2-dc'),daysC,{decimals:1}); countUp(el('k2-do'),daysO,{decimals:1});
  countUp(el('k2-req'),reqIn); countUp(el('k2-close'),closeRate,{decimals:1});

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
    const m=byM[p.dataIndex]; if(!m)return;
    const det=D.sectors.filter(secOK).map(s=>{
      const rs=D.licenses.filter(r=>r.month===m.m&&r.sector===s&&typOK(r.type));
      return {s,c:rs.reduce((a,r)=>a+r.constr,0),o:rs.reduce((a,r)=>a+r.ops,0),
        q:rs.reduce((a,r)=>a+r.req_in,0),cl:rs.reduce((a,r)=>a+r.req_closed,0)};
    });
    openDrawer(`تفاصيل ${m.lbl}`,'الإصدار حسب القطاع البلدي',
      `<div class="tblwrap" id="dr-month-tbl"></div>`,
      ()=>makeTable('dr-month-tbl',[
        {k:'s',l:'القطاع',f:v=>v.replace('القطاع ','')},{k:'c',l:'بناء',sort:true},{k:'o',l:'تشغيل'},
        {k:'q',l:'مستلمة'},{k:'cl',l:'مغلقة'},
      ],det,{sortKey:'c'}));
  });

  /* by sector grouped */
  const bySec=D.sectors.filter(secOK).map(s=>{
    const rs=rows.filter(r=>r.sector===s);
    return {s,c:rs.reduce((a,r)=>a+r.constr,0),o:rs.reduce((a,r)=>a+r.ops,0)};
  });
  const licsec=chart('c-licsec');
  licsec.setOption(base({
    grid:{containLabel:true,left:8,right:8,top:30,bottom:2},
    legend:{top:0,icon:'circle',itemWidth:9,textStyle:{fontFamily:'Cairo',fontSize:11}},
    tooltip:Object.assign({},TT,{trigger:'axis',axisPointer:{type:'shadow'},
      formatter:ps=>`<b>${bySec[ps[0].dataIndex].s}</b>`+ps.map(p=>ttRow(p.seriesName,fmt(p.value),p.color)).join('')}),
    xAxis:Object.assign({},AXC,{data:bySec.map(r=>r.s.replace('القطاع ','')),inverse:true}),
    yAxis:AXVY,
    series:[
      {name:'رخص البناء',type:'bar',data:bySec.map(r=>r.c),barMaxWidth:18,itemStyle:{color:C.teal,borderRadius:[6,6,0,0]}},
      {name:'رخص التشغيل',type:'bar',data:bySec.map(r=>r.o),barMaxWidth:18,itemStyle:{color:C.gold,borderRadius:[6,6,0,0]}},
    ],
  }));
  reClick(licsec,p=>{
    const s=bySec[p.dataIndex].s;
    const rs=rows.filter(r=>r.sector===s);
    openDrawer(s,'ملخص الترخيص للفترة المحددة',
      fld('رخص البناء',fmt(rs.reduce((a,r)=>a+r.constr,0)))+
      fld('رخص التشغيل',fmt(rs.reduce((a,r)=>a+r.ops,0)))+
      fld('الطلبات المستلمة',fmt(rs.reduce((a,r)=>a+r.req_in,0)))+
      fld('الطلبات المغلقة',fmt(rs.reduce((a,r)=>a+r.req_closed,0)))+
      fld('متوسط مدة رخصة البناء',fmt1(rs.reduce((a,r)=>a+r.days_constr,0)/rs.length)+' يوم')+
      fld('متوسط مدة رخصة التشغيل',fmt1(rs.reduce((a,r)=>a+r.days_ops,0)/rs.length)+' يوم'));
  });

  /* ops by type donut — click filters */
  const byType=TYPES.map(t=>({t,v:D.licenses.filter(r=>inWin(r.month)&&secOK(r.sector)&&r.type===t).reduce((a,r)=>a+r.ops,0)}));
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

  /* funnel — monotone pipeline: استلام ← إغلاق ← إصدار */
  const fun=chart('c-funnel');
  const pending=reqIn-reqCl;
  fun.setOption(base({
    tooltip:Object.assign({},TT,{trigger:'item',formatter:p=>`<b>${p.name}</b>${ttRow('العدد',fmt(p.value),p.color)}${ttRow('من المستلمة',(p.value/Math.max(reqIn,1)*100).toFixed(1)+'٪')}`}),
    series:[{type:'funnel',left:'6%',right:'6%',top:16,bottom:38,sort:'descending',gap:4,minSize:'30%',
      label:{position:'inside',fontFamily:'Cairo',fontWeight:'bold',fontSize:12,color:'#fff',
        formatter:p=>`${p.name}\n${fmt(p.value)}`,lineHeight:18},
      itemStyle:{borderColor:'#fff',borderWidth:2,borderRadius:4},
      data:[
        {name:'الطلبات المستلمة',value:reqIn,itemStyle:{color:C.ramp5[2]}},
        {name:'طلبات مغلقة',value:reqCl,itemStyle:{color:C.ramp5[3]}},
        {name:'رخص صادرة',value:constr+ops,itemStyle:{color:C.ramp5[4]}},
      ]}],
    graphic:[{type:'text',left:'center',bottom:2,style:{
      text:`قيد المعالجة: ${fmt(pending)} طلب  ·  نسبة الإغلاق: ${fmt1(closeRate)}٪`,
      font:'700 12.5px "IBM Plex Sans Arabic"',fill:C.green}}],
  }));
  reClick(fun,null);

  /* sparklines */
  sparkline('c-spark1',byM.map(r=>r.lbl),byM.map(r=>+r.dc.toFixed(1)),'spark1-delta');
  sparkline('c-spark2',byM.map(r=>r.lbl),byM.map(r=>+r.do_.toFixed(1)),'spark2-delta');

  /* monthly table */
  T2ROWS=[];
  mons.forEach(m=>D.sectors.filter(secOK).forEach(s=>{
    const rs=rows.filter(r=>r.month===m&&r.sector===s); if(!rs.length)return;
    T2ROWS.push({m,lbl:MLBL[m],s,c:rs.reduce((a,r)=>a+r.constr,0),o:rs.reduce((a,r)=>a+r.ops,0),
      q:rs.reduce((a,r)=>a+r.req_in,0),cl:rs.reduce((a,r)=>a+r.req_closed,0),
      dc:+(rs.reduce((a,r)=>a+r.days_constr,0)/rs.length).toFixed(1),
      do_:+(rs.reduce((a,r)=>a+r.days_ops,0)/rs.length).toFixed(1)});
  }));
  licTable=makeTable('tbl-lic',[
    {k:'lbl',l:'الشهر'},{k:'s',l:'القطاع',f:v=>v.replace('القطاع ','')},
    {k:'c',l:'رخص البناء',sort:true},{k:'o',l:'رخص التشغيل'},{k:'q',l:'الطلبات المستلمة'},{k:'cl',l:'المغلقة'},
    {k:'dc',l:'مدة البناء (يوم)'},{k:'do_',l:'مدة التشغيل (يوم)'},
  ],filterLic(),{sortKey:'c'});
}
let T2ROWS=[],licTable=null;
function filterLic(){ const q=S.licSearch.trim();
  return T2ROWS.filter(r=>!q||r.lbl.includes(q)||r.s.includes(q)); }
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
  const fines=rows.reduce((a,r)=>a+r.fines,0), clos=rows.reduce((a,r)=>a+r.closures,0);
  const insps=D.inspectors.filter(i=>secOK(i.sector));
  const nInsp=insps.length||1;
  const scaleWin = S.range===12 ? 0.5 : 1; // inspectors hold 24-month totals
  const avgViol=insps.reduce((a,i)=>a+i.violations,0)*scaleWin/nInsp;
  const avgDist=insps.reduce((a,i)=>a+i.distance,0)*scaleWin/nInsp;
  const compl=visits? (1-viol/visits)*100 : 0;

  el('t3-kpis').innerHTML =
    kpiCard('الزيارات الميدانية',`<span id="k3-v">0</span>`,`خلال آخر ${S.range} شهراً`,'flat')+
    kpiCard('المخالفات المحررة',`<span id="k3-w">0</span>`,`${fmt1(viol/visits*100)}٪ من الزيارات`,'flat')+
    kpiCard('الغرامات المحصلة',`<span id="k3-f">0</span><small>مليون ريال</small>`,fmtSAR(fines),'flat')+
    kpiCard('المنشآت المغلقة',`<span id="k3-c">0</span><small>منشأة</small>`,'إغلاق إداري','flat')+
    kpiCard('متوسط المخالفات لكل مفتش',`<span id="k3-avw">0</span>`,nounCount(nInsp,'مفتشاً ميدانياً','مفتشين ميدانيين'),'flat')+
    kpiCard('متوسط المسافة لكل مفتش',`<span id="k3-avd">0</span><small>كم</small>`,'إجمالي الفترة','flat');
  countUp(el('k3-v'),visits); countUp(el('k3-w'),viol);
  countUp(el('k3-f'),fines/1e6,{decimals:1}); countUp(el('k3-c'),clos);
  countUp(el('k3-avw'),avgViol,{decimals:0}); countUp(el('k3-avd'),avgDist,{decimals:0});

  /* map (monitor / hotspot) */
  const secAgg=s=>{const rs=rows.filter(r=>r.sector===s);
    return {v:rs.reduce((a,r)=>a+r.visits,0),w:rs.reduce((a,r)=>a+r.violations,0),
      f:rs.reduce((a,r)=>a+r.fines,0),c:rs.reduce((a,r)=>a+r.closures,0)};};
  el('map2-title').textContent = S.hotspot? 'خريطة النقاط الساخنة — كثافة المخالفات' : 'خريطة الرقابة — القطاعات البلدية';
  el('map2-sub').textContent = S.hotspot? 'حجم الدائرة ولونها يعكسان كثافة المخالفات في الموقع' : 'مؤشرات الجولات والمخالفات لكل قطاع — انقر قطاعاً للتفاصيل';
  drawMap('map2',{
    mode:'monitor',
    sectorTip:s=>{const a=secAgg(s);
      return `<b>${s}</b>${ttRow('الزيارات الميدانية',fmt(a.v))}${ttRow('المخالفات',fmt(a.w))}${ttRow('الغرامات',fmtSAR(a.f))}${ttRow('الإغلاقات',fmt(a.c))}`;},
    onSector:toggleSector,
    dots:S.hotspot? null : D.facilities.filter(f=>secOK(f.sector)&&typOK(f.type)),
    dotTip:f=>`<b>${f.name}</b>${ttRow('درجة الامتثال',f.compliance+' / 100')}${ttRow('مستوى الخطورة',f.risk)}${ttRow('آخر زيارة',fmtDate(f.last_visit))}`,
    onDot:facilityDrawer,
    hotspots:S.hotspot,
  });
  el('map2-legend').innerHTML = S.hotspot?
    `<span class="li"><span class="sw" style="background:${C.red}"></span>أحمر = كثافة مخالفات مرتفعة</span>
     <span class="li"><span class="sw" style="background:${C.amber}"></span>متوسطة</span>
     <span class="li"><span class="sw" style="background:${C.green2}"></span>أخضر = منخفضة</span>`:
    `<span class="li"><span class="sw" style="background:${C.green2}"></span>منشأة منخفضة الخطورة (إشغال ≤ 85٪)</span>
     <span class="li"><span class="sw" style="background:${C.amber}"></span>85–95٪</span>
     <span class="li"><span class="sw" style="background:${C.red}"></span>&gt; 95٪</span>`;
  const sSel=S.sectors.size===1?[...S.sectors][0]:null;
  const aSel=sSel? secAgg(sSel) : {v:visits,w:viol,f:fines,c:clos};
  el('map2-side').innerHTML=`
    <div class="ms-title">${sSel||'كل القطاعات — نظرة عامة'}</div>
    <div class="ms-stats">
      <div class="ms-stat"><div class="l">الزيارات الميدانية</div><div class="v">${fmt(aSel.v)}</div></div>
      <div class="ms-stat"><div class="l">المخالفات المحررة</div><div class="v">${fmt(aSel.w)}</div></div>
      <div class="ms-stat"><div class="l">الغرامات المحصلة</div><div class="v" style="font-size:15px">${fmtSAR(aSel.f)}</div></div>
      <div class="ms-stat"><div class="l">المنشآت المغلقة</div><div class="v">${fmt(aSel.c)}</div></div>
    </div>
    <div><b style="font-size:12px">توزيع المخالفات بين القطاعات</b><div class="chart short" id="side-viol"></div></div>`;
  const sv=chart('side-viol');
  const svRows=D.sectors.map(s=>({s,w:secAgg(s).w}));
  sv.setOption(base({
    grid:{containLabel:true,left:44,right:10,top:6,bottom:2},
    tooltip:Object.assign({},TT,{formatter:p=>`<b>${svRows[p.dataIndex].s}</b>${ttRow('المخالفات',fmt(p.value),p.color)}`}),
    xAxis:Object.assign({},AXV,{inverse:true}),
    yAxis:Object.assign({},AXC,{data:svRows.map(r=>r.s.replace('القطاع ','')),position:'right'}),
    series:[{type:'bar',data:svRows.map(r=>({value:r.w,itemStyle:{color:S.sectors.has(r.s)?C.green:C.teal,opacity:S.sectors.size&&!S.sectors.has(r.s)?0.4:1,borderRadius:[6,0,0,6]}})),
      barMaxWidth:14,label:{show:true,position:'left',formatter:p=>fmt(p.value),fontSize:10,color:C.muted}}],
  }));
  reClick(sv,p=>toggleSector(svRows[p.dataIndex].s));

  /* violation categories */
  const winRatio = viol / (D.inspections.filter(r=>secOK(r.sector)).reduce((a,r)=>a+r.violations,0)||1);
  const catRows=D.violCats.map(c=>{
    const base_=S.sectors.size? [...S.sectors].reduce((a,s)=>a+c.by_sector[s],0) : c.count;
    return {c,v:Math.round(base_*winRatio)};
  }).sort((a,b)=>a.v-b.v);
  const vc=chart('c-violcat');
  vc.setOption(base({
    grid:{containLabel:true,left:48,right:14,top:6,bottom:2},
    tooltip:Object.assign({},TT,{formatter:p=>`<b>${p.name}</b>${ttRow('المخالفات',fmt(p.value),C.teal)}${ttRow('','انقر لعرض التفاصيل')}`}),
    xAxis:Object.assign({},AXV,{inverse:true}),
    yAxis:Object.assign({},AXC,{data:catRows.map(r=>r.c.name),position:'right',axisLabel:Object.assign({},AXC.axisLabel,{width:185,overflow:'truncate'})}),
    series:[{type:'bar',data:catRows.map(r=>r.v),barMaxWidth:18,itemStyle:{color:C.teal,borderRadius:[6,0,0,6]},
      label:{show:true,position:'left',formatter:p=>fmt(p.value),fontSize:10.5,color:C.muted}}],
  }));
  reClick(vc,p=>{
    const cat=catRows[p.dataIndex].c;
    openDrawer(cat.name,'فئة المخالفة — التفاصيل',
      fld('إجمالي المخالفات (24 شهراً)',fmt(cat.count))+
      fld('إجمالي الغرامات',fmtSAR(cat.fines))+
      fld('متوسط الغرامة',fmtSAR(cat.fines/cat.count))+
      `<div style="margin-top:14px"><b style="font-size:12px">التوزيع حسب القطاع البلدي</b><div class="dr-chart" id="dr-cat-sec"></div></div>
       <div style="margin-top:8px"><b style="font-size:12px">التوزيع حسب حجم المنشأة</b><div class="dr-chart" id="dr-cat-sme"></div></div>`,
      ()=>{
        const c1=chart('dr-cat-sec');
        const secArr=D.sectors.map(s=>({s:s.replace('القطاع ',''),v:cat.by_sector[s]}));
        c1.setOption(base({grid:{containLabel:true,left:44,right:10,top:6,bottom:2},
          tooltip:Object.assign({},TT,{formatter:p=>ttRow(p.name,fmt(p.value),C.teal)}),
          xAxis:Object.assign({},AXV,{inverse:true}),yAxis:Object.assign({},AXC,{data:secArr.map(r=>r.s),position:'right'}),
          series:[{type:'bar',data:secArr.map(r=>r.v),barMaxWidth:13,itemStyle:{color:C.teal,borderRadius:[5,0,0,5]},
            label:{show:true,position:'left',formatter:p=>fmt(p.value),fontSize:10,color:C.muted}}]})); c1.resize();
        const c2=chart('dr-cat-sme');
        const smeArr=['متناهية الصغر','صغيرة','متوسطة','كبيرة'].map((n,i)=>({n,v:cat.sme[n],col:rampN(4)[i]}));
        c2.setOption(base({grid:{containLabel:true,left:4,right:4,top:10,bottom:2},
          tooltip:Object.assign({},TT,{formatter:p=>ttRow(p.name,fmt(p.value),p.color)}),
          xAxis:Object.assign({},AXC,{data:smeArr.map(r=>r.n),inverse:true}),yAxis:AXVY,
          series:[{type:'bar',data:smeArr.map(r=>({value:r.v,itemStyle:{color:r.col,borderRadius:[5,5,0,0]}})),barMaxWidth:22,
            label:{show:true,position:'top',formatter:p=>fmt(p.value),fontSize:10,color:C.muted}}]})); c2.resize();
      });
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
    xAxis:Object.assign({},AXC,{data:byM.map(r=>r.lbl),inverse:true,axisLabel:Object.assign({},AXC.axisLabel,{rotate:S.range===24?38:0})}),
    yAxis:AXVY,
    series:[
      {name:'الزيارات الميدانية',type:'line',data:byM.map(r=>r.v),smooth:.35,symbol:'circle',symbolSize:6,
        lineStyle:{width:2,color:C.teal},itemStyle:{color:C.teal,borderColor:'#fff',borderWidth:2},areaStyle:{color:C.teal,opacity:.08}},
      {name:'المخالفات المحررة',type:'line',data:byM.map(r=>r.w),smooth:.35,symbol:'circle',symbolSize:6,
        lineStyle:{width:2,color:C.clay},itemStyle:{color:C.clay,borderColor:'#fff',borderWidth:2}},
    ],
  }));

  /* violations by SME size (scaled to the filtered window total) */
  const allCatTotal=D.violCats.reduce((a,c)=>a+c.count,0)||1;
  const smeScale=viol/allCatTotal;
  const smeTot=['متناهية الصغر','صغيرة','متوسطة','كبيرة'].map((n,i)=>({n,col:rampN(4)[i],
    v:Math.round(D.violCats.reduce((a,c)=>a+c.sme[n],0)*smeScale)}));
  colChart3('c-violsme',smeTot);

  /* compliance ring */
  const ring=chart('c-compring');
  ring.setOption(gaugeOption({name:'نسبة الامتثال',unit:'٪',actual:+compl.toFixed(1),target:88,dir:'أعلى أفضل',max:100}));
  reClick(ring,null);

  /* auto insights */
  const worst=D.sectors.map(s=>{const a=secAgg(s);return {s,rate:a.v? a.w/a.v:0};}).sort((a,b)=>b.rate-a.rate)[0];
  const topCat=[...catRows].sort((a,b)=>b.v-a.v)[0];
  const busiest=[...insps].sort((a,b)=>b.visits-a.visits)[0];
  const highRisk=D.facilities.filter(f=>secOK(f.sector)&&f.risk==='مرتفع').length;
  const ic=`<svg viewBox="0 0 24 24"><path d="M12 3l8 3v6c0 4.5-3.2 7.6-8 9-4.8-1.4-8-4.5-8-9V6l8-3z"/></svg>`;
  el('t3-insights').innerHTML=[
    {b:'القطاع الأكثر حاجة لحملة رقابية',s:`${worst.s} — ${fmt1(worst.rate*100)}٪ من زياراته تسفر عن مخالفة`},
    {b:'أكثر مخالفة تكراراً',s:`${topCat.c.name} (${fmt(topCat.v)} مخالفة خلال الفترة)`},
    {b:'المفتش الأعلى عبئاً',s:`${busiest.name} — ${fmt(busiest.visits)} جولة في ${busiest.sector}`},
    {b:'مواقع مرشحة للمتابعة خلال 30 يوماً',s:`${nounCount(highRisk,'منشأة عالية الخطورة','منشآت عالية الخطورة')} تستدعي زيارة تحقق`},
  ].map(x=>`<div class="mini-ins"><div class="mi-ic">${ic}</div><div><b>${x.b}</b><span>${x.s}</span></div></div>`).join('');

  /* inspectors scatter + table */
  const sc=chart('c-insp');
  sc.setOption(base({
    grid:{containLabel:true,left:8,right:16,top:16,bottom:8},
    tooltip:Object.assign({},TT,{formatter:p=>{const i=insps[p.dataIndex];
      return `<b>${i.name}</b>${ttRow('القطاع',i.sector)}${ttRow('الجولات',fmt(i.visits))}${ttRow('المخالفات',fmt(i.violations))}${ttRow('المسافة',fmt(i.distance)+' كم')}`;}}),
    xAxis:Object.assign({},AXV,{inverse:true,name:'الجولات',nameTextStyle:{fontFamily:'Cairo',color:C.muted},nameLocation:'start'}),
    yAxis:Object.assign({},AXVY,{name:'المخالفات',nameTextStyle:{fontFamily:'Cairo',color:C.muted}}),
    series:[{type:'scatter',data:insps.map(i=>[i.visits,i.violations]),
      symbolSize:(v,params)=>10+(insps[params.dataIndex]?.distance||0)/1600,
      itemStyle:{color:C.teal,opacity:.82,borderColor:'#fff',borderWidth:2}}],
  }));
  reClick(sc,p=>inspectorDrawer(insps[p.dataIndex]));
  makeTable('tbl-insp',[
    {k:'name',l:'المفتش'},{k:'sector',l:'القطاع',f:v=>v.replace('القطاع ','')},
    {k:'visits',l:'الجولات',f:fmt,sort:true},{k:'violations',l:'المخالفات',f:fmt},
    {k:'distance',l:'المسافة (كم)',f:fmt},
    {k:'id',l:'مخالفات/جولة',f:(v,r)=>fmt1(r.violations/r.visits)},
  ],insps,{onRow:inspectorDrawer,sortKey:'visits'});

  el('hot-toggle').classList.toggle('on',S.hotspot);
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
  const by=s=>inis.filter(i=>i.status===s).length;
  const due90=inis.filter(i=>i.end>D.meta.today&&i.end<='2026-10-06'&&i.status!=='مكتملة').length;
  const avg=inis.reduce((a,i)=>a+i.completion,0)/inis.length;
  el('t4-kpis').innerHTML =
    kpiCard('إجمالي المبادرات',`<span id="k4-n">0</span>`,'عبر 7 ركائز استراتيجية','flat')+
    kpiCard('متوسط نسبة الإنجاز',`<span id="k4-avg">0</span><small>٪</small>`,'المستهدف 70٪','flat')+
    kpiCard('في المسار',`<span id="k4-on">0</span>`,'تسير وفق الخطة','up')+
    kpiCard('متأخرة',`<span id="k4-late">0</span>`,'تحتاج تدخلاً','down')+
    kpiCard('مكتملة',`<span id="k4-done">0</span>`,'أُغلقت رسمياً','up')+
    kpiCard('مستحقة خلال 90 يوماً',`<span id="k4-due">0</span>`,'حتى 6 أكتوبر 2026','flat');
  countUp(el('k4-n'),inis.length); countUp(el('k4-avg'),avg,{decimals:1});
  countUp(el('k4-on'),by('في المسار')); countUp(el('k4-late'),by('متأخرة'));
  countUp(el('k4-done'),by('مكتملة')); countUp(el('k4-due'),due90);

  /* pillar cards */
  el('pillar-grid').innerHTML = D.pillars.map(p=>{
    const ps=inis.filter(i=>i.pillar===p);
    const pavg=Math.round(ps.reduce((a,i)=>a+i.completion,0)/ps.length);
    const late=ps.filter(i=>i.status==='متأخرة'||i.status==='متوقفة').length;
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
      <div class="pc-meta">${ps.length} مبادرات · ${late? `<span style="color:${C.amber}">${late} متعثرة</span>`:'لا تعثّر'}</div>
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
  const list=inis.filter(i=>(!S.pillar||i.pillar===S.pillar)&&(!q||i.name.includes(q)||i.owner.includes(q)));
  el('ini-list-title').textContent = S.pillar? `مبادرات ركيزة: ${S.pillar}` : 'جميع المبادرات';
  el('ini-list').innerHTML = list.map((i,idx)=>`
    <div class="ini-row" data-id="${i.id}">
      <div><div class="in">${i.name}</div><div class="own">${i.pillar} — ${i.owner}</div></div>
      <div><div class="pbar"><i data-w="${i.completion}" style="background:${i.status==='متوقفة'?C.red:i.status==='متأخرة'?C.amber:C.green2}"></i></div>
        <div style="font-size:10.5px;color:var(--muted);font-weight:700;margin-top:3px">${i.completion}٪</div></div>
      <div><span class="st ${STATUS_CHIP[i.status]}">${i.status}</span></div>
      <div class="ini-date cell-hide">الاستحقاق: ${fmtDate(i.end)}</div>
      <div class="cell-hide"><span class="st ${RISK_CHIP[i.risk]}">${i.risk}</span></div>
    </div>`).join('') || '<div style="padding:24px;text-align:center;color:var(--muted)">لا توجد نتائج مطابقة</div>';
  els('.ini-row').forEach(r=>r.onclick=()=>initiativeDrawer(D.initiatives.find(i=>i.id===r.dataset.id)));
  requestAnimationFrame(()=>els('.ini-row .pbar i').forEach(b=>b.style.width=b.dataset.w+'%'));

  /* gantt by target quarter */
  const qtr=d=>{const [y,m]=d.split('-').map(Number);return `${y} Q${Math.ceil(m/3)}`;};
  const quarters=['2025 Q3','2025 Q4','2026 Q1','2026 Q2','2026 Q3','2026 Q4','2027 Q1','2027 Q2'];
  el('gantt').innerHTML=quarters.map(qt=>{
    const qs=inis.filter(i=>qtr(i.end)===qt&&(!S.pillar||i.pillar===S.pillar));
    const QN={'1':'الأول','2':'الثاني','3':'الثالث','4':'الرابع'};
    const [qy,qq]=qt.split(' ');
    return `<div class="gq"><div class="gq-h">الربع ${QN[qq.replace('Q','')]} ${qy}</div>${
      qs.map(i=>`<div class="gi ${i.status==='متأخرة'?'st-late':i.status==='مكتملة'?'st-done':i.status==='متوقفة'?'st-stop':''}"
        title="${i.name} — ${i.status} — ${i.completion}٪" data-id="${i.id}">${i.name}</div>`).join('')||'<div style="text-align:center;color:#B8C4BE;font-size:10px">—</div>'
    }</div>`;
  }).join('');
  els('.gi').forEach(g=>g.onclick=()=>initiativeDrawer(D.initiatives.find(i=>i.id===g.dataset.id)));
}
function initiativeDrawer(i){
  const t0=new Date(i.start).getTime(), t1=new Date(i.end).getTime(), now=new Date(D.meta.today).getTime();
  const pos=Math.max(0,Math.min(100,(now-t0)/(t1-t0)*100));
  openDrawer(i.name,`${i.pillar} — ${i.id}`,
    fld('الجهة المسؤولة',i.owner)+
    fld('الحالة',`<span class="st ${STATUS_CHIP[i.status]}">${i.status}</span>`)+
    fld('نسبة الإنجاز',i.completion+'٪')+
    fld('الميزانية',fmtSAR(i.budget))+
    fld('مستوى المخاطر',`<span class="st ${RISK_CHIP[i.risk]}">${i.risk}</span>`)+
    fld('المعلم القادم',i.milestone)+
    fld('الأثر المتوقع',i.impact)+
    `<div class="tl">
      <div class="tl-track"><div class="tl-fill" style="width:${i.completion}%"></div>
      <div class="tl-today" style="inset-inline-start:${pos}%" title="اليوم"></div></div>
      <div class="tl-caps"><span>البداية: ${fmtDate(i.start)}</span><span style="color:var(--gold);font-weight:700">▲ اليوم</span><span>الاستحقاق: ${fmtDate(i.end)}</span></div>
    </div>
    <div style="font-size:11px;color:var(--muted);font-weight:600;margin-top:6px">الشريط الأخضر = نسبة الإنجاز، العلامة الذهبية = موقع اليوم ضمن الجدول الزمني</div>`);
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
      {type:'gauge',startAngle:205,endAngle:-25,min:0,max:mx,
        axisLine:{show:false},axisTick:{show:false},splitLine:{show:false},axisLabel:{show:false},detail:{show:false},
        pointer:{length:'82%',width:3,icon:'rect',itemStyle:{color:C.goldUi}},anchor:{show:false},
        data:[{value:target}],silent:true,z:1},
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
  const s=k.series, first3=(s[0]+s[1]+s[2])/3, last3=(s[9]+s[10]+s[11])/3;
  const improving = k.dir==='أقل أفضل'? last3<first3 : last3>first3;
  const hit = s.filter(v=> k.dir==='أقل أفضل'? v<=k.target : v>=k.target).length;
  let t = improving? 'تحسّن مستمر خلال الأشهر الأخيرة' : 'اتجاه متراجع يستدعي المتابعة';
  t += hit>0? ` مع تجاوز المستهدف في ${hit===1?'شهر واحد':hit===2?'شهرين':hit<=10?fmt(hit)+' أشهر':fmt(hit)+' شهراً'} من أصل 12.` : ' ولم يُلامَس المستهدف خلال الفترة.';
  return t;
}
function kpiDrawer(k){
  openDrawer(k.name,`${k.level} · ${k.dir} · الوحدة: ${k.unit}`,
    fld('المتحقق',fmt1(k.actual)+' '+k.unit)+fld('المستهدف',fmt1(k.target)+' '+k.unit)+
    fld('الحالة',`<span class="st ${kpiStatus(k)==='green'?'st-green':kpiStatus(k)==='amber'?'st-amber':'st-red'}">${kpiStatus(k)==='green'?'على المسار':kpiStatus(k)==='amber'?'يحتاج متابعة':'حرج'}</span>`)+
    `<div class="dr-chart" id="dr-kpi-chart" style="height:230px"></div>
     <div style="background:var(--tint2);border-radius:10px;padding:10px 14px;font-size:12px;font-weight:600;margin-top:10px">💡 ${kpiCommentary(k)}</div>`,
    ()=>{const c=chart('dr-kpi-chart');
      c.setOption(base({
        grid:{containLabel:true,left:6,right:6,top:14,bottom:4},
        tooltip:Object.assign({},TT,{trigger:'axis',formatter:ps=>`<b>${ps[0].name}</b>${ttRow('القيمة',fmt1(ps[0].value)+' '+k.unit,ps[0].color)}${ttRow('المستهدف',fmt1(k.target)+' '+k.unit)}`}),
        xAxis:Object.assign({},AXC,{data:D.kpiMonths,inverse:true,axisLabel:Object.assign({},AXC.axisLabel,{rotate:38,fontSize:9})}),
        yAxis:Object.assign({},AXVY,{min:v=>Math.floor(Math.min(v.min,k.target)*0.92),max:v=>Math.ceil(Math.max(v.max,k.target)*1.06)}),
        series:[{type:'line',data:k.series,smooth:.35,symbol:'circle',symbolSize:6,
          lineStyle:{width:2,color:C.teal},itemStyle:{color:C.teal,borderColor:'#fff',borderWidth:2},
          areaStyle:{color:C.teal,opacity:.08},
          markLine:{symbol:'none',lineStyle:{color:C.goldUi,width:2,type:'dashed'},
            label:{formatter:'المستهدف',fontFamily:'Cairo',color:'#8A6D24',position:'insideStartTop'},
            data:[{yAxis:k.target}]}}],
      })); c.resize();});
}

/* ============================================================
   TAB 6 — التوقعات المستقبلية
   ============================================================ */
function renderT6(){
  const F=D.forecast[S.scenario];
  const at6=F[5], atEnd=F[11];
  const highRisk=D.facilities.filter(f=>f.risk==='مرتفع').length;
  el('t6-kpis').innerHTML =
    kpiCard('الطلب المتوقع بعد 6 أشهر',`<span id="k6-d">0</span>`,`${MLBL[at6.month]||at6.month_ar}`,'flat')+
    kpiCard('العرض المتوقع بعد 6 أشهر',`<span id="k6-s">0</span><small>سرير</small>`,'وفق وتيرة الترخيص الحالية','flat')+
    kpiCard('الفجوة المتوقعة بعد 6 أشهر',`<span id="k6-g">0</span><small>سرير</small>`,S.scenario==='متفائل'?'أفضل السيناريوهات':'اتساع مستمر',S.scenario==='متفائل'?'up':'down')+
    kpiCard('القطاع الأعلى خطورة',`<span style="font-size:22px">الجنوبي</span>`,`كثافة نقاط ساخنة ${D.facts.southDensity}/100`,'down')+
    kpiCard('مبادرات مستحقة قريباً',`<span id="k6-i">0</span>`,'خلال 90 يوماً','flat')+
    kpiCard('مواقع مرشحة للتفتيش',`<span id="k6-r">0</span><small>منشأة</small>`,'عالية الخطورة حالياً','down');
  countUp(el('k6-d'),at6.demand); countUp(el('k6-s'),at6.supply); countUp(el('k6-g'),at6.gap);
  countUp(el('k6-i'),D.facts.closing90.length); countUp(el('k6-r'),highRisk);

  el('fc-sub').innerHTML=`الفجوة المتوقعة بنهاية الفترة (${atEnd.month_ar}): <b style="color:var(--red)">~${fmt(atEnd.gap)} سرير</b> — السيناريو: ${S.scenario}`;
  const labels=F.map(r=>r.month_ar);
  const fc=chart('c-forecast');
  const bandSeries=(rows,lo,hi,color)=>[
    {name:'_lo',type:'line',data:rows.map(r=>r[lo]),stack:color,symbol:'none',lineStyle:{opacity:0},tooltip:{show:false}},
    {name:'_band',type:'line',data:rows.map(r=>r[hi]-r[lo]),stack:color,symbol:'none',lineStyle:{opacity:0},
      areaStyle:{color,opacity:.22},tooltip:{show:false}},
  ];
  fc.setOption(base({
    grid:{containLabel:true,left:64,right:10,top:38,bottom:4},
    legend:{top:0,icon:'circle',itemWidth:9,textStyle:{fontFamily:'Cairo',fontSize:11},data:['الطلب المتوقع','العرض المتوقع']},
    tooltip:Object.assign({},TT,{trigger:'axis',formatter:ps=>{
      const i=ps[0].dataIndex,r=F[i];
      return `<b>${r.month_ar}</b>${ttRow('الطلب المتوقع',fmt(r.demand),C.gold)}${ttRow('نطاق الثقة (طلب)',fmtAx(r.d_lo)+' — '+fmtAx(r.d_hi))}${ttRow('العرض المتوقع',fmt(r.supply),C.teal)}${ttRow('الفجوة',fmt(r.gap),C.red)}`;}}),
    xAxis:Object.assign({},AXC,{data:labels,inverse:true,boundaryGap:false,axisLabel:Object.assign({},AXC.axisLabel,{rotate:32})}),
    yAxis:Object.assign({},AXVY,{min:v=>Math.floor(v.min*0.97)}),
    series:[
      ...bandSeries(F,'d_lo','d_hi',C.gold),
      ...bandSeries(F,'s_lo','s_hi',C.teal),
      {name:'الطلب المتوقع',type:'line',data:F.map(r=>r.demand),smooth:.3,symbol:'circle',symbolSize:6,
        lineStyle:{width:2,color:C.gold,type:'dashed'},itemStyle:{color:C.gold,borderColor:'#fff',borderWidth:2},
        endLabel:{show:true,formatter:()=>fmtAx(atEnd.demand),fontFamily:'Cairo',fontWeight:'bold',color:'#8A6D24',offset:[4,0]}},
      {name:'العرض المتوقع',type:'line',data:F.map(r=>r.supply),smooth:.3,symbol:'circle',symbolSize:6,
        lineStyle:{width:2,color:C.teal,type:'dashed'},itemStyle:{color:C.teal,borderColor:'#fff',borderWidth:2},
        endLabel:{show:true,formatter:()=>fmtAx(atEnd.supply),fontFamily:'Cairo',fontWeight:'bold',color:C.green,offset:[4,0]}},
    ],
  }),true);

  /* monthly gap bars */
  el('gap-sub').textContent=`وفق السيناريو: ${S.scenario}`;
  const gp=chart('c-gapbar');
  gp.setOption(base({
    grid:{containLabel:true,left:8,right:8,top:14,bottom:4},
    tooltip:Object.assign({},TT,{formatter:p=>`<b>${F[p.dataIndex].month_ar}</b>${ttRow('الفجوة المتوقعة',fmt(p.value)+' سرير',p.color)}`}),
    xAxis:Object.assign({},AXC,{data:labels,inverse:true,axisLabel:Object.assign({},AXC.axisLabel,{rotate:32,fontSize:9})}),
    yAxis:Object.assign({},AXVY,{min:v=>Math.floor(v.min*0.97)}),
    series:[{type:'bar',data:F.map(r=>r.gap),barMaxWidth:16,
      itemStyle:{color:C.gold,borderRadius:[5,5,0,0]},
      label:{show:false}}],
  }));

  /* what changed */
  const m1=M24[M24.length-1],m0=M24[M24.length-2];
  const li=m=>D.licenses.filter(r=>r.month===m).reduce((a,r)=>a+r.constr+r.ops,0);
  const iv=(m,k)=>D.inspections.filter(r=>r.month===m).reduce((a,r)=>a+r[k],0);
  const rowsWC=[
    {l:'الرخص الصادرة (بناء + تشغيل)',v0:li(m0),v1:li(m1),goodUp:true},
    {l:'الزيارات الميدانية',v0:iv(m0,'visits'),v1:iv(m1,'visits'),goodUp:true},
    {l:'المخالفات المحررة',v0:iv(m0,'violations'),v1:iv(m1,'violations'),goodUp:false},
    {l:'الغرامات المحصلة (ريال)',v0:iv(m0,'fines'),v1:iv(m1,'fines'),goodUp:true},
    {l:'المنشآت المغلقة',v0:iv(m0,'closures'),v1:iv(m1,'closures'),goodUp:false},
  ];
  el('what-changed').innerHTML=rowsWC.map(r=>{
    const d=r.v1-r.v0, pct=r.v0? d/r.v0*100 : 0, up=d>=0;
    const good=up===r.goodUp;
    return `<div class="mini-ins" style="background:#fff">
      <div class="mi-ic" style="color:${good?C.green2:C.red}">${up?'▲':'▼'}</div>
      <div style="flex:1"><b>${r.l}</b><span>${fmt(r.v0)} ← ${fmt(r.v1)}</span></div>
      <span class="st ${good?'st-green':'st-red'}">${ltr((up?'+':'-')+fmt1(Math.abs(pct))+'٪')}</span></div>`;
  }).join('');

  /* alert cards */
  const prCls={'عالية':'pr-high','متوسطة':'','منخفضة':'pr-low'};
  const prChip={'عالية':'st-red','متوسطة':'st-amber','منخفضة':'st-green'};
  const tabOf={'طلب وعرض':'t1','رقابة':'t3','تراخيص':'t2','مبادرات':'t4'};
  const ordered=[...D.predictions].sort((a,b)=>({'عالية':0,'متوسطة':1,'منخفضة':2}[a.priority]-{'عالية':0,'متوسطة':1,'منخفضة':2}[b.priority]));
  el('alert-cards').innerHTML=ordered.slice(0,6).map((p,i)=>`
    <div class="card alert-card ${prCls[p.priority]} ${!S.t6shown&&!REDUCED?'shimmer-in':''}" style="animation-delay:${i*80}ms">
      <div class="a-head"><span class="st ${prChip[p.priority]}">أولوية ${p.priority}</span>
        <span class="a-cat">${p.cat}</span><span class="a-cat">الأفق: ${p.horizon}</span>
        <span class="grow" style="flex:1"></span>
        <button class="pill" data-nav="${tabOf[p.cat]}">فتح التبويب ←</button></div>
      <p>${p.text}</p>
      <div class="conf">مستوى الثقة <span class="cbar"><i style="width:${p.conf}%"></i></span> ${p.conf}٪</div>
    </div>`).join('');
  els('#alert-cards [data-nav]').forEach(b=>b.onclick=()=>go(b.dataset.nav));

  /* recommendations */
  el('reco-list').innerHTML=ordered.slice(0,7).map((p,i)=>`
    <div class="reco" data-nav="${tabOf[p.cat]}">
      <div class="r-n">${i+1}</div>
      <p>${p.rec}<br><span class="r-link">${p.cat} · ثقة ${p.conf}٪ · انتقل إلى التبويب ←</span></p>
    </div>`).join('');
  els('#reco-list .reco').forEach(r=>r.onclick=()=>go(r.dataset.nav));
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

els('.rail-tab').forEach(b=>b.onclick=()=>go(b.dataset.tab));
el('btn-ai').onclick=()=>go('t6');
el('updated-at').textContent=D.meta.updated;

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
  bar.querySelector('[data-role="sectors"]').innerHTML=D.sectors.map(s=>`<button class="pill" data-v="${s}">${s.replace('القطاع ','')}</button>`).join('');
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
  if(x==='fac') dlCSV('facilities.csv',['رقم المنشأة','الاسم','النوع','القطاع','الحي','الأسرّة','المشغولة','الإشغال٪','الامتثال','الخطورة'],
    D.facilities.map(f=>[f.id,f.name,f.type,f.sector,f.district,f.beds,f.occupied,f.occ_rate,f.compliance,f.risk]));
  if(x==='kpi') dlCSV('kpis.csv',['المؤشر','النوع','الوحدة','المستهدف','المتحقق','الاتجاه'],
    D.kpis.map(k=>[k.name,k.level,k.unit,k.target,k.actual,k.dir]));
});

/* resize */
let rzT=null;
addEventListener('resize',()=>{clearTimeout(rzT); rzT=setTimeout(()=>Object.values(CH).forEach(c=>{try{c.resize();}catch(e){}}),150);});

/* boot */
syncFilterUI();
renderT1();
