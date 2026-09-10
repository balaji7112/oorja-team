import{c as j,u as h,r as x,j as e,f as w,F as I,K as c,G as p,E as S}from"./index-Cjpjm3ba.js";import{T as W}from"./thermometer-DVjngqHK.js";import{W as L}from"./wind-sr--1TXw.js";/**
 * @license lucide-react v0.373.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=j("Droplets",[["path",{d:"M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z",key:"1ptgy4"}],["path",{d:"M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97",key:"1sl1rz"}]]);/**
 * @license lucide-react v0.373.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const D=j("Loader",[["line",{x1:"12",x2:"12",y1:"2",y2:"6",key:"gza1u7"}],["line",{x1:"12",x2:"12",y1:"18",y2:"22",key:"1qhbu9"}],["line",{x1:"4.93",x2:"7.76",y1:"4.93",y2:"7.76",key:"xae44r"}],["line",{x1:"16.24",x2:"19.07",y1:"16.24",y2:"19.07",key:"bxnmvf"}],["line",{x1:"2",x2:"6",y1:"12",y2:"12",key:"89khin"}],["line",{x1:"18",x2:"22",y1:"12",y2:"12",key:"pb8tfm"}],["line",{x1:"4.93",x2:"7.76",y1:"19.07",y2:"16.24",key:"1uxjnu"}],["line",{x1:"16.24",x2:"19.07",y1:"7.76",y2:"4.93",key:"6duxfx"}]]),k={SUNNY:"☀️",PARTLY_CLOUDY:"⛅",CLOUDY:"☁️",RAIN:"🌧️",NIGHT:"🌙"},b={SUNNY:"Sunny",PARTLY_CLOUDY:"Partly Cloudy",CLOUDY:"Cloudy",RAIN:"Rainy",NIGHT:"Clear Night"};function M(a){const{weather:r,solar:n,solarForecast:s,demandForecast:l}=a,m=new Date,u=m.toLocaleDateString("en-IN",{weekday:"long",year:"numeric",month:"long",day:"numeric"}),g=m.toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit",second:"2-digit"}),f=s.slice(0,12).map((o,v)=>{const d=l[v],C=new Date(o.timestamp).toLocaleTimeString("en-IN",{hour:"2-digit",minute:"2-digit"}),F=o.predicted.toFixed(2),z=d?d.predicted.toFixed(2):"—",$=o.lower.toFixed(2),A=o.upper.toFixed(2),y=o.actual!=null;return`
      <tr>
        <td>${C}</td>
        <td>${F} kW</td>
        <td>${$} – ${A} kW</td>
        <td>${z} kW</td>
        <td><span class="badge ${y?"badge-actual":"badge-forecast"}">${y?"Measured":"Forecast"}</span></td>
      </tr>`}).join(""),t=[];r.cloudCover>.5&&t.push(`☁️ High cloud cover (${Math.round(r.cloudCover*100)}%) — solar output is reduced significantly. Consider switching to battery or grid support.`),r.rainProbability>50&&t.push(`🌧️ Rain probability is ${r.rainProbability}% — ensure drainage around panel arrays and secure outdoor equipment.`),r.windSpeed>7&&t.push(`💨 Wind speed is elevated at ${r.windSpeed.toFixed(1)} m/s — wind turbine generation near peak efficiency.`),r.temperature>38&&t.push(`🌡️ High ambient temperature (${r.temperature}°C) — expect solar panel derating of ~${((r.temperature-25)*.4).toFixed(1)}%. Monitor battery thermal management.`),r.uvIndex>=7&&t.push(`☀️ UV Index is ${r.uvIndex} (High) — optimal solar irradiance conditions for peak generation.`),r.cloudCover<.2&&r.rainProbability<20&&t.push("✅ Excellent generation conditions — recommend scheduling EV charging and non-critical loads during solar peak hours."),t.length===0&&t.push("✅ Weather conditions are nominal. No special advisories at this time.");const i=[];return r.cloudCover>.4&&i.push("Pre-charge battery storage before cloud cover peaks to ensure uninterrupted campus supply."),r.rainProbability>40&&i.push("Defer panel cleaning operations until after rainfall to benefit from natural washing effect."),r.temperature>35&&i.push("Activate battery thermal management systems. Limit charge rate to reduce internal heating."),i.push("Schedule high-energy loads (Computer Lab, EV charging) to coincide with the forecast solar peak window."),i.push("Monitor grid import in real-time during cloud cover periods to avoid unplanned demand peaks."),`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Weather Forecast Report — OORJA SYNC</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
      background: #f5f7fa;
      color: #1a2a22;
      padding: 0;
    }
    @media print {
      body { background: #fff; }
      .no-print { display: none !important; }
      .page { box-shadow: none !important; }
    }
    .header {
      background: linear-gradient(135deg, #0d2418 0%, #143d25 100%);
      color: white;
      padding: 40px 48px 32px;
    }
    .header-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(32,214,123,0.15); border: 1px solid rgba(32,214,123,0.3);
      border-radius: 20px; padding: 4px 14px; font-size: 0.72rem;
      color: #20D67B; font-weight: 600; letter-spacing: 0.08em;
      text-transform: uppercase; margin-bottom: 16px;
    }
    .header h1 {
      font-size: 2rem; font-weight: 800; letter-spacing: -0.02em;
      color: #f4faf7; margin-bottom: 6px;
    }
    .header .sub {
      font-size: 0.92rem; color: rgba(244,250,247,0.6); margin-top: 4px;
    }
    .header-meta {
      margin-top: 20px; display: flex; gap: 32px; flex-wrap: wrap;
    }
    .header-meta .meta-item { font-size: 0.82rem; color: rgba(244,250,247,0.7); }
    .header-meta .meta-item strong { color: #f4faf7; display: block; font-size: 0.95rem; }

    .page { max-width: 1000px; margin: 0 auto; padding: 0 0 40px; }
    .content { padding: 0 48px; }

    .condition-strip {
      background: #fff; border-bottom: 1px solid #e8eed0;
      padding: 24px 48px; display: flex; align-items: center; gap: 24px;
      flex-wrap: wrap;
    }
    .condition-icon { font-size: 3.5rem; }
    .condition-text h2 { font-size: 1.4rem; font-weight: 700; color: #1a2a22; }
    .condition-text p { font-size: 0.85rem; color: #6a8a72; margin-top: 2px; }
    .metrics-row { display: flex; gap: 20px; flex-wrap: wrap; margin-left: auto; }
    .metric { text-align: center; background: #f0f7f3; border-radius: 10px; padding: 12px 18px; min-width: 90px; }
    .metric .val { font-size: 1.3rem; font-weight: 700; color: #0d5c36; }
    .metric .lbl { font-size: 0.68rem; color: #6a8a72; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }

    section { margin-top: 32px; }
    section h3 {
      font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em;
      text-transform: uppercase; color: #6a8a72;
      border-bottom: 1px solid #e0ebe4; padding-bottom: 8px; margin-bottom: 16px;
    }

    table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
    thead tr { background: #0d2418; color: #fff; }
    thead th { padding: 10px 14px; text-align: left; font-weight: 600; font-size: 0.78rem; letter-spacing: 0.04em; }
    tbody tr:nth-child(even) { background: #f5f9f6; }
    tbody td { padding: 9px 14px; border-bottom: 1px solid #e8eed0; color: #2a3a30; }
    .badge { display: inline-flex; padding: 2px 8px; border-radius: 20px; font-size: 0.68rem; font-weight: 600; }
    .badge-actual { background: rgba(32,214,123,0.12); color: #0d7a42; }
    .badge-forecast { background: rgba(74,158,224,0.12); color: #1a5c8a; }

    .insight-list { list-style: none; display: flex; flex-direction: column; gap: 10px; }
    .insight-list li {
      background: #f0f7f3; border-left: 3px solid #20D67B;
      padding: 10px 14px; border-radius: 0 8px 8px 0;
      font-size: 0.85rem; line-height: 1.6; color: #2a4a32;
    }

    .rec-list { list-style: none; counter-reset: rec-counter; display: flex; flex-direction: column; gap: 8px; }
    .rec-list li {
      counter-increment: rec-counter;
      display: flex; gap: 10px; align-items: flex-start;
      background: #fff; border: 1px solid #e0ebe4;
      padding: 10px 14px; border-radius: 8px; font-size: 0.85rem; color: #2a3a30; line-height: 1.5;
    }
    .rec-list li::before {
      content: counter(rec-counter);
      background: #0d5c36; color: #fff;
      font-weight: 700; font-size: 0.7rem;
      width: 20px; height: 20px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
      margin-top: 1px;
    }

    .solar-factors { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; }
    .factor-card {
      background: #fff; border: 1px solid #e0ebe4; border-radius: 10px; padding: 14px;
    }
    .factor-card .f-label { font-size: 0.72rem; color: #6a8a72; margin-bottom: 4px; }
    .factor-card .f-value { font-size: 1.1rem; font-weight: 700; color: #1a2a22; margin-bottom: 8px; }
    .factor-bar { height: 5px; background: #e0ebe4; border-radius: 3px; overflow: hidden; }
    .factor-fill { height: 100%; border-radius: 3px; }

    .footer {
      margin-top: 40px; padding: 20px 48px;
      background: #f0f7f3; border-top: 1px solid #e0ebe4;
      font-size: 0.72rem; color: #6a8a72;
      display: flex; justify-content: space-between; flex-wrap: wrap; gap: 8px;
    }

    .print-btn {
      position: fixed; top: 20px; right: 20px; z-index: 100;
      background: #0d5c36; color: #fff; border: none; border-radius: 8px;
      padding: 10px 20px; font-size: 0.85rem; font-weight: 600; cursor: pointer;
      box-shadow: 0 4px 16px rgba(0,0,0,0.2);
    }
    .print-btn:hover { background: #0a4a2c; }
  </style>
</head>
<body>
<button class="print-btn no-print" onclick="window.print()">🖨️ Print / Save PDF</button>
<div class="page">

  <!-- Header -->
  <div class="header">
    <div class="header-badge">⚡ OORJA SYNC · Energy Intelligence Platform</div>
    <h1>Weather Forecast Report</h1>
    <div class="sub">Energy & Climate Analysis — Smart Campus, Bhopal</div>
    <div class="header-meta">
      <div class="meta-item"><strong>${u}</strong>Report Date</div>
      <div class="meta-item"><strong>${g}</strong>Generated At</div>
      <div class="meta-item"><strong>Bhopal, Madhya Pradesh</strong>Location (23.25°N, 77.41°E)</div>
      <div class="meta-item"><strong>${b[r.condition]||r.condition}</strong>Current Condition</div>
    </div>
  </div>

  <!-- Current Condition Strip -->
  <div class="condition-strip">
    <div class="condition-icon">${k[r.condition]||"☀️"}</div>
    <div class="condition-text">
      <h2>${b[r.condition]||r.condition.replace("_"," ")}</h2>
      <p>Bhopal, Madhya Pradesh, India · Elevation 523 m · IST (UTC+5:30)</p>
    </div>
    <div class="metrics-row">
      <div class="metric"><div class="val">${r.temperature}°C</div><div class="lbl">Temperature</div></div>
      <div class="metric"><div class="val">${r.humidity}%</div><div class="lbl">Humidity</div></div>
      <div class="metric"><div class="val">${r.windSpeed.toFixed(1)} m/s</div><div class="lbl">Wind</div></div>
      <div class="metric"><div class="val">${Math.round(r.cloudCover*100)}%</div><div class="lbl">Cloud Cover</div></div>
      <div class="metric"><div class="val">${r.uvIndex}</div><div class="lbl">UV Index</div></div>
      <div class="metric"><div class="val">${r.rainProbability}%</div><div class="lbl">Rain Prob.</div></div>
    </div>
  </div>

  <div class="content">

    <!-- Solar Energy Factors -->
    <section>
      <h3>Solar Energy Factors</h3>
      <div class="solar-factors">
        <div class="factor-card">
          <div class="f-label">Solar Irradiance</div>
          <div class="f-value">${r.solarIrradiance} W/m²</div>
          <div class="factor-bar"><div class="factor-fill" style="width:${Math.min(100,r.solarIrradiance/10)}%;background:#FFB84D;"></div></div>
        </div>
        <div class="factor-card">
          <div class="f-label">Cloud Attenuation</div>
          <div class="f-value">${Math.round(r.cloudCover*100)}%</div>
          <div class="factor-bar"><div class="factor-fill" style="width:${Math.round(r.cloudCover*100)}%;background:#FF8A3D;"></div></div>
        </div>
        <div class="factor-card">
          <div class="f-label">Current Solar Output</div>
          <div class="f-value">${n.currentPower.toFixed(1)} kW</div>
          <div class="factor-bar"><div class="factor-fill" style="width:${Math.min(100,n.currentPower/25*100)}%;background:#20D67B;"></div></div>
        </div>
        <div class="factor-card">
          <div class="f-label">Solar Impact</div>
          <div class="f-value" style="color:${r.solarImpact<0?"#c0392b":"#0d5c36"}">${r.solarImpact>0?"+":""}${r.solarImpact}%</div>
          <div class="factor-bar"><div class="factor-fill" style="width:${Math.abs(r.solarImpact)}%;background:${r.solarImpact<0?"#FF5A5A":"#20D67B"};"></div></div>
        </div>
      </div>
    </section>

    <!-- Forecast Table -->
    <section>
      <h3>Energy Forecast — Next 12 Periods</h3>
      <p style="font-size:0.8rem;color:#6a8a72;margin-bottom:12px;">Solar generation forecast with 95% confidence interval and campus demand forecast. All values in kW.</p>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Solar Forecast</th>
            <th>Confidence Interval (95%)</th>
            <th>Demand Forecast</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${f}
        </tbody>
      </table>
    </section>

    <!-- Weather Insights -->
    <section>
      <h3>Weather Insights</h3>
      <ul class="insight-list">
        ${t.map(o=>`<li>${o}</li>`).join("")}
      </ul>
    </section>

    <!-- Recommendations -->
    <section>
      <h3>Recommendations</h3>
      <ul class="rec-list">
        ${i.map(o=>`<li>${o}</li>`).join("")}
      </ul>
    </section>

  </div><!-- /content -->

  <!-- Footer -->
  <div class="footer">
    <span>OORJA SYNC · Smart Energy Intelligence Platform · SIH 2026</span>
    <span>Generated: ${u}, ${g} IST</span>
    <span>Data: Simulation-based forecast · For demonstration purposes</span>
  </div>

</div><!-- /page -->
</body>
</html>`}function N(){const a=h(t=>t.weather),r=h(t=>t.solar),n=h(t=>t.solarForecast),s=h(t=>t.demandForecast),[l,m]=x.useState(!1),u=x.useMemo(()=>({backgroundColor:"transparent",grid:{top:24,right:16,bottom:40,left:50,containLabel:!1},xAxis:{type:"category",data:n.slice(0,24).map(t=>new Date(t.timestamp).toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})),axisLabel:{color:"#91AAA2",fontSize:10,rotate:30},axisLine:{lineStyle:{color:"rgba(255,255,255,0.08)"}}},yAxis:{type:"value",name:"kW",nameTextStyle:{color:"#91AAA2"},min:0,max:30,axisLabel:{color:"#91AAA2",fontSize:10},splitLine:{lineStyle:{color:"rgba(255,255,255,0.04)"}}},series:[{type:"line",name:"Solar Forecast",data:n.slice(0,24).map(t=>t.predicted),smooth:!0,symbol:"none",lineStyle:{color:"#FFB84D",width:2},areaStyle:{color:"rgba(255,184,77,0.1)"}},{type:"line",name:"Lower 95%",data:n.slice(0,24).map(t=>t.lower),smooth:!0,symbol:"none",lineStyle:{color:"rgba(255,184,77,0.25)",width:1,type:"dashed"}},{type:"line",name:"Upper 95%",data:n.slice(0,24).map(t=>t.upper),smooth:!0,symbol:"none",lineStyle:{color:"rgba(255,184,77,0.25)",width:1,type:"dashed"}},{type:"line",name:"Measured",data:n.slice(0,24).map(t=>t.actual??null),smooth:!0,symbolSize:4,lineStyle:{color:"#20D67B",width:2}}],legend:{data:["Solar Forecast","Measured","Lower 95%","Upper 95%"],textStyle:{color:"#91AAA2",fontSize:10}},tooltip:{trigger:"axis",backgroundColor:"rgba(9,20,17,0.95)",borderColor:"rgba(255,184,77,0.3)",textStyle:{color:"#F4FAF7",fontSize:11},formatter:t=>t.map(i=>`${i.seriesName}: ${i.value!=null?`${Number(i.value).toFixed(2)} kW`:"—"}`).join("<br/>")}}),[n]),g=x.useMemo(()=>({backgroundColor:"transparent",grid:{top:24,right:16,bottom:40,left:50,containLabel:!1},xAxis:{type:"category",data:s.slice(0,24).map(t=>new Date(t.timestamp).toLocaleTimeString("en",{hour:"2-digit",minute:"2-digit"})),axisLabel:{color:"#91AAA2",fontSize:10,rotate:30},axisLine:{lineStyle:{color:"rgba(255,255,255,0.08)"}}},yAxis:{type:"value",name:"kW",nameTextStyle:{color:"#91AAA2"},min:0,max:25,axisLabel:{color:"#91AAA2",fontSize:10},splitLine:{lineStyle:{color:"rgba(255,255,255,0.04)"}}},series:[{type:"line",name:"Demand Forecast",data:s.slice(0,24).map(t=>t.predicted),smooth:!0,symbol:"none",lineStyle:{color:"#27D7D0",width:2},areaStyle:{color:"rgba(39,215,208,0.08)"}},{type:"line",name:"Lower 95%",data:s.slice(0,24).map(t=>t.lower),smooth:!0,symbol:"none",lineStyle:{color:"rgba(39,215,208,0.25)",width:1,type:"dashed"}},{type:"line",name:"Upper 95%",data:s.slice(0,24).map(t=>t.upper),smooth:!0,symbol:"none",lineStyle:{color:"rgba(39,215,208,0.25)",width:1,type:"dashed"}}],legend:{data:["Demand Forecast","Lower 95%","Upper 95%"],textStyle:{color:"#91AAA2",fontSize:10}},tooltip:{trigger:"axis",backgroundColor:"rgba(9,20,17,0.95)",borderColor:"rgba(39,215,208,0.3)",textStyle:{color:"#F4FAF7",fontSize:11},formatter:t=>t.map(i=>`${i.seriesName}: ${i.value!=null?`${Number(i.value).toFixed(2)} kW`:"—"}`).join("<br/>")}}),[s]),f=x.useCallback(async()=>{m(!0),await new Promise(t=>setTimeout(t,400));try{const t=M({weather:a,solar:r,solarForecast:n,demandForecast:s}),i=new Blob([t],{type:"text/html;charset=utf-8"}),o=URL.createObjectURL(i);if(!window.open(o,"_blank")){const d=document.createElement("a");d.href=o,d.download=`weather-forecast-report-${Date.now()}.html`,d.click()}setTimeout(()=>URL.revokeObjectURL(o),6e4)}finally{m(!1)}},[a,r,n,s]);return e.jsxs("div",{style:{display:"flex",flexDirection:"column",gap:14},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4},children:[e.jsxs("div",{style:{display:"flex",alignItems:"center",gap:12},children:[e.jsx(w,{size:20,color:"var(--color-secondary)"}),e.jsx("h2",{style:{margin:0,fontFamily:"Space Grotesk",fontWeight:700,fontSize:"1.2rem"},children:"Weather Forecast"}),e.jsx("div",{className:"status-demo",children:"SIMULATED"})]}),e.jsx("button",{onClick:f,disabled:l,style:{display:"flex",alignItems:"center",gap:8,background:l?"rgba(32,214,123,0.06)":"rgba(32,214,123,0.12)",border:"1px solid rgba(32,214,123,0.3)",borderRadius:10,padding:"9px 18px",color:l?"var(--text-muted)":"var(--color-primary)",cursor:l?"not-allowed":"pointer",fontSize:"0.82rem",fontWeight:600,transition:"all 0.2s"},children:l?e.jsxs(e.Fragment,{children:[e.jsx(D,{size:14,style:{animation:"spin 1s linear infinite"}})," Generating…"]}):e.jsxs(e.Fragment,{children:[e.jsx(I,{size:14})," Generate Report"]})})]}),e.jsxs("div",{style:{display:"flex",gap:10,flexWrap:"wrap"},children:[e.jsx(c,{label:"Temperature",value:a.temperature,unit:"°C",icon:e.jsx(W,{size:13})}),e.jsx(c,{label:"Wind Speed",value:Number(a.windSpeed.toFixed(1)),unit:"m/s",icon:e.jsx(L,{size:13}),color:"var(--color-secondary)"}),e.jsx(c,{label:"Cloud Cover",value:Math.round(a.cloudCover*100),unit:"%",icon:e.jsx(w,{size:13})}),e.jsx(c,{label:"Humidity",value:a.humidity,unit:"%",icon:e.jsx(R,{size:13})}),e.jsx(c,{label:"UV Index",value:a.uvIndex,unit:""}),e.jsx(c,{label:"Rain Probability",value:a.rainProbability,unit:"%"})]}),e.jsxs("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14},children:[e.jsxs(p,{style:{display:"flex",flexDirection:"column",alignItems:"center",padding:28},children:[e.jsx("div",{style:{fontSize:"4.5rem",marginBottom:10},children:k[a.condition]||"☀️"}),e.jsx("div",{style:{fontFamily:"Space Grotesk",fontSize:"1.2rem",fontWeight:700},children:b[a.condition]||a.condition.replace("_"," ")}),e.jsx("div",{style:{fontSize:"0.8rem",color:"var(--text-muted)",marginTop:4},children:"Bhopal, Madhya Pradesh · 23.25°N, 77.41°E"}),e.jsxs("div",{style:{marginTop:14,padding:"8px 16px",background:a.solarImpact<0?"rgba(255,90,90,0.08)":"rgba(32,214,123,0.08)",border:`1px solid ${a.solarImpact<0?"rgba(255,90,90,0.2)":"rgba(32,214,123,0.2)"}`,borderRadius:8,fontSize:"0.8rem",color:a.solarImpact<0?"var(--color-critical)":"var(--color-primary)"},children:["Solar Impact: ",a.solarImpact>0?"+":"",a.solarImpact,"%",e.jsx("span",{style:{color:"var(--text-muted)",fontSize:"0.65rem",marginLeft:6},children:"ESTIMATED"})]})]}),e.jsxs(p,{children:[e.jsx("div",{style:{fontSize:"0.7rem",color:"var(--text-muted)",marginBottom:14,textTransform:"uppercase",letterSpacing:"0.06em"},children:"Solar Energy Factors"}),[{label:"Irradiance",value:`${a.solarIrradiance} W/m²`,bar:a.solarIrradiance/1e3,color:"var(--color-solar)"},{label:"Cloud Attenuation",value:`${Math.round(a.cloudCover*100)}%`,bar:a.cloudCover,color:"var(--color-critical)"},{label:"Temperature Derating",value:`${Math.max(0,(a.temperature-25)*.4).toFixed(1)}%`,bar:Math.max(0,a.temperature-25)/20,color:"var(--color-solar)"},{label:"Rain Probability",value:`${a.rainProbability}%`,bar:a.rainProbability/100,color:"var(--color-grid)"}].map(t=>e.jsxs("div",{style:{marginBottom:14},children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:4},children:[e.jsx("span",{style:{fontSize:"0.78rem",color:"var(--text-secondary)"},children:t.label}),e.jsx("span",{style:{fontSize:"0.78rem",fontWeight:600},children:t.value})]}),e.jsx("div",{style:{height:5,background:"rgba(255,255,255,0.06)",borderRadius:3},children:e.jsx("div",{style:{height:"100%",width:`${Math.min(100,t.bar*100)}%`,background:t.color,borderRadius:3,transition:"width 1s"}})})]},t.label))]})]}),e.jsxs(p,{children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:700,fontSize:"0.92rem",marginBottom:2},children:"Solar Generation Forecast"}),e.jsx("div",{style:{fontSize:"0.7rem",color:"var(--text-muted)"},children:"24-hour window · 95% confidence interval · Based on weather conditions & irradiance model"})]}),e.jsxs("div",{style:{fontSize:"0.65rem",color:"var(--text-muted)",textAlign:"right"},children:[e.jsx("div",{children:"MAE: 0.04 kW"}),e.jsx("div",{children:"R²: 0.9983"})]})]}),e.jsx(S,{option:u,style:{height:260},notMerge:!0})]}),e.jsxs(p,{children:[e.jsxs("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10},children:[e.jsxs("div",{children:[e.jsx("div",{style:{fontWeight:700,fontSize:"0.92rem",marginBottom:2},children:"Campus Demand Forecast"}),e.jsx("div",{style:{fontSize:"0.7rem",color:"var(--text-muted)"},children:"24-hour window · Accounts for academic schedule, occupancy, and weather-based loads"})]}),e.jsxs("div",{style:{fontSize:"0.65rem",color:"var(--text-muted)",textAlign:"right"},children:[e.jsx("div",{children:"MAE: 0.41 kW"}),e.jsx("div",{children:"R²: 0.9937"})]})]}),e.jsx(S,{option:g,style:{height:260},notMerge:!0})]}),e.jsxs(p,{children:[e.jsx("div",{style:{fontWeight:700,fontSize:"0.92rem",marginBottom:12},children:"Weather Insights"}),e.jsx("div",{style:{display:"flex",flexDirection:"column",gap:8},children:(()=>{const t=[];return a.cloudCover>.5&&t.push(`☁️ Cloud cover is high (${Math.round(a.cloudCover*100)}%) — solar output is reduced. Battery or grid backup recommended.`),a.rainProbability>50&&t.push(`🌧️ Rain probability at ${a.rainProbability}% — expect panel self-cleaning benefit post-rain.`),a.windSpeed>7&&t.push(`💨 Wind speed ${a.windSpeed.toFixed(1)} m/s — wind turbine near peak efficiency.`),a.temperature>38&&t.push(`🌡️ High temperature (${a.temperature}°C) — solar panel derating ~${((a.temperature-25)*.4).toFixed(1)}%. Monitor battery thermals.`),a.uvIndex>=7&&t.push(`☀️ UV Index ${a.uvIndex} — excellent irradiance conditions. Peak solar generation expected.`),a.cloudCover<.2&&a.rainProbability<20&&t.push("✅ Clear sky conditions — ideal for EV charging and high-load scheduling during solar peak."),t.length===0&&t.push("✅ Weather conditions are nominal. No special advisories at this time."),t.map((i,o)=>e.jsx("div",{style:{background:"rgba(32,214,123,0.05)",borderLeft:"3px solid var(--color-primary)",padding:"9px 12px",borderRadius:"0 8px 8px 0",fontSize:"0.82rem",lineHeight:1.6,color:"var(--text-secondary)"},children:i},o))})()})]}),e.jsx(p,{padding:"10px 16px",children:e.jsxs("div",{style:{fontSize:"0.7rem",color:"var(--text-muted)",lineHeight:1.6},children:[e.jsx("strong",{style:{color:"var(--text-secondary)"},children:"Forecast Methodology:"})," ","Solar forecast uses a RandomForestRegressor model (MAE 0.04 kW, R² 0.9983) trained on 90-day campus data. Demand forecast uses HistGradientBoosting (MAE 0.41 kW, R² 0.9937). Confidence intervals represent 95% prediction bands. Weather data is provided by the integrated demo simulator. All values are simulated for demonstration."]})}),e.jsx("style",{children:"@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }"})]})}export{N as default};
