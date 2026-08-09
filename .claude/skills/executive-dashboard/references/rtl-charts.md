# RTL chart grammar (ECharts)

RTL is not `dir="rtl"` — canvas charts ignore it. Every chart needs explicit RTL decisions,
and getting them wrong produces clipped labels and left-to-right reading order that native
users feel instantly. These recipes are battle-tested; deviations were the single largest
source of visual bugs in the reference build.

## Axis helpers — copy these

```js
const AX_LINE="rgba(17,24,21,.1)", AX_SPLIT="rgba(17,24,21,.055)",
      AX_LBL="#93A099", AX_CAT="#6B7870";

/* vertical charts (lines, columns): time/category reads RIGHT→LEFT, values on the right */
function catXAxis(data, extra){ return Object.assign({ type:"category", data, inverse:true,
  axisLine:{lineStyle:{color:AX_LINE}}, axisTick:{show:false},
  axisLabel:{color:AX_CAT, fontFamily:"Cairo", fontSize:11} }, extra||{}); }
function valAxis(fmt){ return { type:"value", position:"right",
  splitLine:{lineStyle:{color:AX_SPLIT}},
  axisLabel:{color:AX_LBL, fontFamily:"IBM Plex Sans Arabic", fontSize:10.5, formatter:fmt} }; }

/* horizontal bars: bars grow RIGHT→LEFT, category labels on the RIGHT, first item on TOP */
function hxAxis(fmt, max){ const a={ type:"value", inverse:true,
  splitLine:{lineStyle:{color:AX_SPLIT}},
  axisLabel:{color:AX_LBL, fontFamily:"IBM Plex Sans Arabic", fontSize:10.5, formatter:fmt} };
  if(max!=null) a.max=max; return a; }
function hyAxis(data, labelWidth){ return { type:"category", data, position:"right", inverse:true,
  axisLine:{lineStyle:{color:"transparent"}}, axisTick:{show:false},
  axisLabel:{color:AX_CAT, fontFamily:"Cairo", fontSize:11,
    width:labelWidth||null, overflow:labelWidth?"truncate":"none"} }; }
```

Horizontal-bar specifics: rounded tip is the LEFT end → `borderRadius:[6,0,0,6]`; value
labels `position:"left"` (the growing tip); reserve grid `right:` for category labels
(≈90–190px by name length) and `left:` for value labels. Long Arabic names truncate
mid-word and look broken — provide short aliases in the data (`short` field) for axis use
and keep full names for tables/tooltips.

## Tooltips (dark HUD)

```js
const TT={ trigger:"item", backgroundColor:"#131D17", borderWidth:0,
  textStyle:{color:"#F1F5F2", fontFamily:"Cairo", fontSize:12},
  extraCssText:"direction:rtl;text-align:right;box-shadow:0 14px 40px rgba(10,20,15,.35);border-radius:13px;padding:11px 15px;" };
function ttRow(k,v,color){ return `<div style="display:flex;justify-content:space-between;gap:18px;align-items:center;margin:2px 0">
  <span style="color:#A9B6AE">${color?`<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};margin-left:6px"></span>`:""}${k}</span>
  <b style="font-family:'IBM Plex Sans Arabic';color:#FFF">${v}</b></div>`; }
```

Force RTL via `extraCssText` — the tooltip is HTML, so it CAN honor direction, unlike canvas.
Every tooltip goes through `ttRow` so all ~25 charts read identically.
**Arabic counted nouns in dynamic tooltips need real agreement** — see the pluralization
pattern in `arabic-language.md` («8 مبادرات» not «8 مبادرة», «مبادرتان» not «2 مبادرات»).

## Legends & series color

Legend swatches come from SERIES-level `color`, not per-datum `itemStyle`. If you color
per-datum, the legend falls back to the default palette and lies about the chart:

```js
{ name:"محقق", type:"bar", stack:"s", color:"#098A4E", data:[...] }              // ✓
{ name:"محقق", type:"bar", data:[{value:5, itemStyle:{color:"#098A4E"}}] }       // ✗ legend breaks
```
Keep per-datum `itemStyle` only for `borderRadius`. One hue per measure — no positional ramps.

## markLines (targets)

Gold dashed, width 1.6–2, `symbol:"none"`. Label positions that survive inverse axes:
`insideStartTop` / `insideEndTop` — test both; a rotated or clipped Arabic markline label
is a recurring bug. If the target may exceed the data range, extend the axis or the line
silently disappears:

```js
yAxis: Object.assign(valAxis(fmt), { max:v=>Math.max(v.max, target)*1.08 })
```

## Radar

`indicator:[{name, max:5}...]`, current series = accent filled 14% + 2.5px line; comparison
= deep thin; historical = NEUTRAL GRAY dashed (never gold — gold is the target's color).
Use short pillar names for indicators.

## Scatter

Value axes read LTR by default — add `inverse:true` on the x-axis for consistency with the
rest of an RTL page, and pad `grid`/`nameGap` so Arabic axis titles don't clip at edges.

## Charts to avoid

Circular gauges (template tell — build the linear journey meter from the design reference
instead), donut/pie walls, funnels, and "waterfalls" whose floating bars confuse — a
grounded decomposition (all bars from 0: total → subsets) reads better and prints better.

## Lifecycle

Registry + dispose-on-replaced-DOM + debounced resize + post-render rAF resize (see
architecture.md §4). Set `animationDuration:300` in shared base options; `animation:false`
for any chart whose value appears in print/screenshots.
