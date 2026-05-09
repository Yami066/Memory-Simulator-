/* ========== APP DEFINITIONS ========== */
const APPS = [
  {id:1, name:'Chrome',   icon:'🌐', color:'#3b82f6', bg:'rgba(59,130,246,0.12)', border:'rgba(59,130,246,0.3)'},
  {id:2, name:'VS Code',  icon:'🟦', color:'#06b6d4', bg:'rgba(6,182,212,0.12)',  border:'rgba(6,182,212,0.3)'},
  {id:3, name:'Spotify',  icon:'🎧', color:'#22c55e', bg:'rgba(34,197,94,0.12)',  border:'rgba(34,197,94,0.3)'},
  {id:4, name:'Discord',  icon:'👾', color:'#818cf8', bg:'rgba(129,140,248,0.12)',border:'rgba(129,140,248,0.3)'},
  {id:5, name:'Terminal', icon:'💻', color:'#94a3b8', bg:'rgba(148,163,184,0.1)', border:'rgba(148,163,184,0.25)'},
  {id:6, name:'Mail',     icon:'📧', color:'#ef4444', bg:'rgba(239,68,68,0.12)',  border:'rgba(239,68,68,0.3)'},
  {id:7, name:'Settings', icon:'⚙️', color:'#64748b', bg:'rgba(100,116,139,0.1)', border:'rgba(100,116,139,0.25)'}
];
function getApp(id){ return APPS.find(a=>a.id===id); }

/* ========== STATE ========== */
const state = {
  refString:[], frames:[], frameCount:3, algo:'FIFO',
  speed:900, running:false, paused:false, stepIndex:0,
  faults:0, hits:0, fifoQueue:[], lruOrder:[], mruOrder:[],
  pageTable:new Map(), simStarted:false,
  loadOrder:[], loadCounter:0, stepHistory:[], eventLog:[]
};

const $=id=>document.getElementById(id);

/* ========== PANEL TOGGLE ========== */
window.togglePanel=function(id){
  const p=document.getElementById(id);
  const c=p.classList.toggle('collapsed');
  p.querySelector('.panel-toggle').textContent=c?'+':'−';
};

/* ========== BUILD TASKBAR ========== */
function buildTaskbar(){
  const bar=$('taskbar-inner');
  APPS.forEach(app=>{
    const b=document.createElement('button');
    b.className='app-btn'; b.dataset.appId=app.id;
    b.innerHTML=`<span class="app-icon">${app.icon}</span><span class="app-label">${app.name}</span>`;
    b.addEventListener('click',()=>onAppClick(app.id));
    bar.appendChild(b);
  });
}

/* ========== BUILD RAM SLOTS ========== */
function buildRAM(count){
  const c=$('ram-slots'); c.innerHTML='';
  for(let i=0;i<count;i++){
    const s=document.createElement('div');
    s.className='ram-slot empty'; s.id='slot-'+i;
    s.innerHTML=`<span class="slot-frame">F${i}</span><span class="slot-placeholder">⬜</span>`;
    c.appendChild(s);
  }
}

function updateSlot(idx, appId, animType){
  const s=$('slot-'+idx);
  if(!s) return;
  // Remove old anim classes
  s.classList.remove('anim-hit','anim-miss','anim-enter','anim-evict','empty');
  if(appId<0){
    s.innerHTML=`<span class="slot-frame">F${idx}</span><span class="slot-placeholder">⬜</span>`;
    s.style.background=''; s.style.borderColor='';
    s.classList.add('empty');
    return;
  }
  const app=getApp(appId);
  if(!app) return;
  if(animType==='fault'){
    // Evict animation first
    s.classList.add('anim-evict');
    setTimeout(()=>{
      s.classList.remove('anim-evict');
      s.innerHTML=`<span class="slot-frame">F${idx}</span><span class="slot-icon">${app.icon}</span><span class="slot-name" style="color:${app.color}">${app.name}</span>`;
      s.style.background=app.bg; s.style.borderColor=app.border;
      s.classList.add('anim-miss','anim-enter');
      setTimeout(()=>s.classList.remove('anim-miss','anim-enter'),600);
    },200);
  } else {
    s.innerHTML=`<span class="slot-frame">F${idx}</span><span class="slot-icon">${app.icon}</span><span class="slot-name" style="color:${app.color}">${app.name}</span>`;
    s.style.background=app.bg; s.style.borderColor=app.border;
    s.classList.add('anim-hit');
    setTimeout(()=>s.classList.remove('anim-hit'),600);
  }
}

/* ========== MINI DESKTOP WINDOWS ========== */
const MINI_POSITIONS=[
  {top:'6%',left:'2%'},{top:'15%',left:'10%'},
  {top:'4%',left:'64%'},{top:'14%',left:'72%'},
  {top:'42%',left:'1%'},{top:'44%',left:'72%'}
];
const miniWindows=new Map();

function openMiniWindow(appId,frameIdx){
  if(miniWindows.has(appId)){pulseMiniWindow(appId);return;}
  const app=getApp(appId); if(!app) return;
  const desktop=$('desktop-area');
  const pos=MINI_POSITIONS[frameIdx%MINI_POSITIONS.length];
  const w=document.createElement('div');
  w.className='mini-window'; w.dataset.appId=appId;
  w.style.top=pos.top; w.style.left=pos.left;
  w.innerHTML=`<div class="mini-titlebar"><div class="mini-tb-left"><span class="mini-tb-icon">${app.icon}</span><span class="mini-tb-name">${app.name}</span></div><div class="mini-tb-controls"><span>─</span><span>□</span><span>✕</span></div></div><div class="mini-body" style="background:${app.bg}"><span class="mini-body-icon">${app.icon}</span></div>`;
  desktop.appendChild(w);
  miniWindows.set(appId,w);
  requestAnimationFrame(()=>{
    w.classList.add('opening');
    w.addEventListener('animationend',()=>{w.classList.remove('opening');w.classList.add('visible');},{once:true});
  });
}

function closeMiniWindow(appId){
  const w=miniWindows.get(appId); if(!w) return;
  miniWindows.delete(appId);
  w.classList.remove('visible'); w.classList.add('closing');
  w.addEventListener('animationend',()=>w.remove(),{once:true});
}

function pulseMiniWindow(appId){
  const w=miniWindows.get(appId); if(!w) return;
  w.classList.remove('pulse'); void w.offsetWidth;
  w.classList.add('pulse');
  w.addEventListener('animationend',()=>w.classList.remove('pulse'),{once:true});
}

function clearAllMiniWindows(){
  miniWindows.forEach(w=>w.remove()); miniWindows.clear();
  const d=$('desktop-area'); if(d) d.innerHTML='';
}

/* ========== QUEUE CHIPS ========== */
function buildQueueChips(){
  const c=$('queue-chips'); c.innerHTML='';
  state.refString.forEach((id,i)=>{
    const app=getApp(id);
    const d=document.createElement('div');
    d.className='q-chip'; d.dataset.idx=i;
    d.textContent=app?app.icon:id;
    d.title=app?app.name:'Page '+id;
    if(app) d.style.borderColor=app.border;
    c.appendChild(d);
  });
}

function updateQueueChips(){
  const chips=$('queue-chips').querySelectorAll('.q-chip');
  chips.forEach((c,i)=>{
    c.classList.remove('done','active');
    if(i<state.stepIndex) c.classList.add('done');
    else if(i===state.stepIndex) c.classList.add('active');
  });
}

/* ========== STATS ========== */
function updateStats(){
  const t=state.faults+state.hits;
  $('stat-accesses').textContent=t;
  $('stat-faults').textContent=state.faults;
  $('stat-hits').textContent=state.hits;
  $('stat-rate').textContent=t?(state.faults/t*100).toFixed(1)+'%':'0%';
  $('stat-algo').textContent=state.algo;
  $('stat-step').textContent=state.stepIndex+'/'+state.refString.length;
}

/* ========== PAGE TABLE ========== */
function updatePageTable(){
  const b=$('page-table-body'); b.innerHTML='';
  state.pageTable.forEach((frame,page)=>{
    const app=getApp(page);
    const tr=document.createElement('tr');
    const ico=app?app.icon+' ':'';
    const nm=app?app.name:'P'+page;
    const col=app?app.color:'#818cf8';
    const valid=state.frames[frame]===page;
    tr.innerHTML=`<td style="color:${col};font-weight:600">${ico}${nm}</td><td>F${frame}</td><td style="color:${valid?'var(--hit)':'var(--miss)'};font-size:13px">${valid?'●':'○'}</td>`;
    b.appendChild(tr);
  });
}

/* ========== EVENT LOG ========== */
function addLog(msg, type){
  state.eventLog.push({msg,type});
  const c=$('event-log');
  const d=document.createElement('div');
  d.className='log-entry '+type; d.textContent=msg;
  c.appendChild(d);
  c.scrollTop=c.scrollHeight;
  // Keep last 50
  if(c.children.length>50) c.removeChild(c.firstChild);
}

/* ========== ALGORITHM CORE (preserved) ========== */
function runAlgoStep(page,index,frames,frameCount,algo,fifoQ,lruOrd,refStr,loadOrd,loadCtr,mruOrd){
  const fi=frames.indexOf(page);
  if(fi!==-1){
    if(algo==='LRU'){lruOrd.splice(lruOrd.indexOf(page),1);lruOrd.push(page);}
    if(algo==='MRU'){mruOrd.splice(mruOrd.indexOf(page),1);mruOrd.push(page);}
    return{hit:true,frameIdx:fi,victim:-1,loadCtr};
  }
  let victim=-1, frameIdx=frames.indexOf(-1);
  if(frameIdx===-1){
    if(algo==='FIFO'){victim=fifoQ.shift();frameIdx=frames.indexOf(victim);}
    else if(algo==='LRU'){victim=lruOrd.shift();frameIdx=frames.indexOf(victim);}
    else if(algo==='MRU'){victim=mruOrd.pop();frameIdx=frames.indexOf(victim);}
    else{
      let distances=[];
      for(let f=0;f<frameCount;f++){let nx=refStr.slice(index+1).indexOf(frames[f]);distances.push(nx===-1?Infinity:nx);}
      let maxD=Math.max(...distances);
      let cands=[];
      for(let f=0;f<frameCount;f++){if(distances[f]===maxD)cands.push(f);}
      if(cands.length===1) frameIdx=cands[0];
      else frameIdx=cands.reduce((best,f)=>(loadOrd[f]<loadOrd[best])?f:best,cands[0]);
      victim=frames[frameIdx];
    }
  }
  frames[frameIdx]=page;
  fifoQ.push(page);
  if(algo==='LRU') lruOrd.push(page);
  if(algo==='MRU') mruOrd.push(page);
  if(loadOrd) loadOrd[frameIdx]=loadCtr;
  return{hit:false,frameIdx,victim,loadCtr:loadCtr+1};
}

function silentRun(refStr,frameCount,algo){
  const frames=Array(frameCount).fill(-1);
  const fifoQ=[],lruOrd=[],mruOrd=[];
  const loadOrd=Array(frameCount).fill(0);
  let loadCtr=0, faults=0;
  refStr.forEach((page,idx)=>{
    const r=runAlgoStep(page,idx,frames,frameCount,algo,fifoQ,lruOrd,refStr,loadOrd,loadCtr,mruOrd);
    loadCtr=r.loadCtr!==undefined?r.loadCtr:loadCtr;
    if(!r.hit) faults++;
  });
  return faults;
}

/* ========== SIMULATION ========== */
function initSim(){
  const fc=Math.max(1,Math.min(6,parseInt($('inp-frames').value)||3));
  const algo=$('sel-algo').value;
  const speed=parseInt($('sel-speed').value);
  if(!state.refString.length) return false;
  state.frameCount=fc; state.algo=algo; state.speed=speed;
  state.frames=Array(fc).fill(-1);
  state.fifoQueue=[]; state.lruOrder=[]; state.mruOrder=[];
  state.loadOrder=Array(fc).fill(0); state.loadCounter=0;
  state.faults=0; state.hits=0; state.stepIndex=0;
  state.pageTable.clear(); state.simStarted=true;
  state.stepHistory=[]; state.eventLog=[];
  $('event-log').innerHTML='';
  clearAllMiniWindows();
  buildRAM(fc);
  buildQueueChips();
  updateStats();
  return true;
}

async function executeStep(i){
  const page=state.refString[i];
  const app=getApp(page);
  const name=app?app.name:'P'+page;
  state.stepIndex=i+1;
  updateQueueChips();
  const result=runAlgoStep(page,i,state.frames,state.frameCount,state.algo,state.fifoQueue,state.lruOrder,state.refString,state.loadOrder,state.loadCounter,state.mruOrder);
  if(result.loadCtr!==undefined) state.loadCounter=result.loadCtr;
  if(result.hit){
    state.hits++;
    updateSlot(result.frameIdx,page,'hit');
    addLog(`HIT: ${name} found in F${result.frameIdx}`,'hit');
    pulseMiniWindow(page);
  } else {
    state.faults++;
    const victimApp=result.victim>0?getApp(result.victim):null;
    const vname=victimApp?victimApp.name:(result.victim>0?'P'+result.victim:'—');
    if(result.victim>0) closeMiniWindow(result.victim);
    updateSlot(result.frameIdx,page,'fault');
    addLog(`FAULT: ${name} → F${result.frameIdx}`+(result.victim>0?` (evicted ${vname})`:''),'fault');
    const delay=result.victim>0?250:50;
    setTimeout(()=>openMiniWindow(page,result.frameIdx),delay);
  }
  state.pageTable.set(page,result.frameIdx);
  state.stepHistory.push({step:i+1,page,frames:[...state.frames],hit:result.hit});
  updatePageTable(); updateStats();
}

async function runSimulation(){
  if(!state.simStarted&&!initSim()) return;
  state.running=true; state.paused=false;
  $('btn-run').textContent='⏸ PAUSE';
  $('btn-run').classList.add('running');
  setTaskbarDisabled(true);
  for(let i=state.stepIndex;i<state.refString.length;i++){
    if(!state.running) break;
    while(state.paused) await new Promise(r=>setTimeout(r,100));
    if(!state.running) break;
    await executeStep(i);
    await new Promise(r=>setTimeout(r,state.speed));
  }
  state.running=false;
  $('btn-run').textContent='▶ RUN';
  $('btn-run').classList.remove('running');
  if(state.stepIndex>=state.refString.length) state.simStarted=false;
  setTaskbarDisabled(false);
}

async function stepOnce(){
  if(!state.simStarted&&!initSim()) return;
  if(state.stepIndex>=state.refString.length) return;
  await executeStep(state.stepIndex);
  if(state.stepIndex>=state.refString.length) state.simStarted=false;
}

function setTaskbarDisabled(d){
  document.querySelectorAll('.app-btn').forEach(b=>{
    if(d) b.classList.add('disabled'); else b.classList.remove('disabled');
  });
}

/* ========== APP CLICK HANDLER ========== */
function onAppClick(appId){
  if(state.running) return;
  state.refString.push(appId);
  buildQueueChips();
  // Clear sim state so next RUN starts fresh with new queue
  if(state.simStarted){ state.simStarted=false; }
}

/* ========== CONTROLS ========== */
function doReset(){
  state.running=false; state.paused=false; state.simStarted=false;
  state.faults=0; state.hits=0; state.stepIndex=0;
  state.frames=[]; state.fifoQueue=[]; state.lruOrder=[]; state.mruOrder=[];
  state.loadOrder=[]; state.loadCounter=0;
  state.stepHistory=[]; state.eventLog=[]; state.refString=[];
  state.pageTable.clear();
  $('page-table-body').innerHTML=''; $('event-log').innerHTML='';
  $('queue-chips').innerHTML='';
  clearAllMiniWindows();
  buildRAM(parseInt($('inp-frames').value)||3);
  $('btn-run').textContent='▶ RUN';
  $('btn-run').classList.remove('running');
  setTaskbarDisabled(false);
  updateStats();
}

function generateRandom(){
  const len=10+Math.floor(Math.random()*6);
  const arr=[];
  for(let i=0;i<len;i++) arr.push(1+Math.floor(Math.random()*7));
  state.refString=arr;
  if(state.simStarted){state.simStarted=false;}
  state.faults=0;state.hits=0;state.stepIndex=0;
  state.frames=[];state.stepHistory=[];state.eventLog=[];
  state.pageTable.clear();
  $('page-table-body').innerHTML='';$('event-log').innerHTML='';
  clearAllMiniWindows();
  buildRAM(parseInt($('inp-frames').value)||3);
  buildQueueChips();
  $('btn-run').textContent='▶ RUN';
  updateStats();
}

/* ========== CHART ========== */
let chart=null;
function initChart(data=[0,0,0,0]){
  const ctx=document.getElementById('compare-chart').getContext('2d');
  if(chart) chart.destroy();
  chart=new Chart(ctx,{
    type:'bar',
    data:{labels:['FIFO','LRU','MRU','Optimal'],datasets:[{label:'Page Faults',data,backgroundColor:['#3b82f6','#818cf8','#f97316','#22c55e'],borderWidth:0,borderRadius:6}]},
    options:{responsive:true,maintainAspectRatio:false,
      scales:{y:{beginAtZero:true,ticks:{color:'#64748b',stepSize:1,precision:0},grid:{color:'rgba(255,255,255,0.04)'}},x:{ticks:{color:'#e2e8f0',font:{family:'Inter'}},grid:{color:'rgba(255,255,255,0.04)'}}},
      plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>'Faults: '+c.raw}}}
    },
    plugins:[{id:'dl',afterDatasetsDraw(c){const m=c.getDatasetMeta(0);const x=c.ctx;x.save();x.font='bold 12px Inter';x.textAlign='center';x.fillStyle='#e2e8f0';m.data.forEach((b,i)=>{x.fillText(c.data.datasets[0].data[i],b.x,b.y-8)});x.restore();}}]
  });
}

function compareAll(){
  if(!state.refString.length) return;
  const fc=Math.max(1,Math.min(6,parseInt($('inp-frames').value)||3));
  const rs=[...state.refString];
  initChart([silentRun(rs,fc,'FIFO'),silentRun(rs,fc,'LRU'),silentRun(rs,fc,'MRU'),silentRun(rs,fc,'OPT')]);
  $('bottom-panel').classList.add('show');
  chart.options.scales.y.max=rs.length+1; chart.update();
}

/* ========== BELADY'S ANOMALY ========== */
function checkBelady(){
  if(!state.refString.length) return;
  const fc=Math.max(1,Math.min(6,parseInt($('inp-frames').value)||3));
  if(fc>=6) return;
  const rs=[...state.refString];
  const fN=silentRun(rs,fc,'FIFO');
  const fN1=silentRun(rs,fc+1,'FIFO');
  const banner=$('belady-banner');
  if(fN1>=fN){
    banner.className='';
    banner.innerHTML=`<div class="bel-icon">⚠️</div><div class="bel-title">SYSTEM ALERT: BELADY'S ANOMALY</div>FIFO with ${fc} frames = <b>${fN}</b> faults<br>FIFO with ${fc+1} frames = <b>${fN1}</b> faults<br><br>More frames did NOT reduce faults!`;
  } else {
    banner.className='no-anomaly';
    banner.innerHTML=`<div class="bel-icon">✅</div><div class="bel-title">SYSTEM CHECK PASSED</div>No Belady's Anomaly detected.<br>FIFO: ${fc} frames = ${fN} faults, ${fc+1} frames = ${fN1} faults`;
  }
  banner.style.display='block';
  setTimeout(()=>banner.style.display='none',5000);
}

/* ========== EVENT BINDINGS ========== */
$('btn-run').addEventListener('click',()=>{
  if(state.running&&!state.paused){state.paused=true;$('btn-run').textContent='▶ RESUME';$('btn-run').classList.remove('running');}
  else if(state.running&&state.paused){state.paused=false;$('btn-run').textContent='⏸ PAUSE';$('btn-run').classList.add('running');}
  else runSimulation();
});
$('btn-step').addEventListener('click',()=>{
  if(state.running){state.running=false;state.paused=false;}
  stepOnce();
});
$('btn-reset').addEventListener('click',doReset);
$('btn-compare').addEventListener('click',compareAll);
$('btn-belady').addEventListener('click',checkBelady);
$('btn-random').addEventListener('click',generateRandom);
$('close-chart').addEventListener('click',()=>$('bottom-panel').classList.remove('show'));
document.addEventListener('keydown',e=>{if(e.key==='Escape')$('bottom-panel').classList.remove('show');});

/* ========== INIT ========== */
buildTaskbar();
buildRAM(3);
initChart();
updateStats();
