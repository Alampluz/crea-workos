const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html.replace(/<script src=[^>]+><\/script>/g,''),{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window; w.__calls=[]; w.__sel={};
w.eval(`
window.scrollTo=()=>{};
window.__mkQuery=(t)=>{const q={_t:t,_op:'select',_p:null,_eq:{},
 update(p){q._op='update';q._p=p;return q;}, insert(p){q._op='insert';q._p=p;return q;},
 upsert(p){q._op='upsert';q._p=p;return q;},
 delete(){q._op='delete';return q;}, select(){return q;}, single(){return q;},
 eq(c,v){q._eq[c]=v;return q;}, is(){return q;}, in(){return q;}, order(){return q;}, limit(){return q;},
 then(r,j){window.__calls.push({table:t,op:q._op,payload:q._p,eq:{...q._eq}});
  let data;
  if(q._op==='insert') data=(Array.isArray(q._p)?q._p:[q._p]).map((x,i)=>({...x,id:'nw'+i}));
  else data = window.__sel[t]||[];
  return Promise.resolve({data,error:null}).then(r,j);}};return q;};
window.supabase={createClient:()=>({from:window.__mkQuery,
 auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{}}})},
 storage:{from:()=>({})},functions:{},
 rpc:(name)=>{window.__calls.push({rpc:name});return Promise.resolve({data:3,error:null});}})};`);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const driver=String.raw`window.__run=async function(){const r={};try{
 Object.assign(S,{me:{id:'me',role:'admin',full_name:'April',company_id:'co1'},route:{view:'admin'},
  workspaces:[], projects:[], profiles:[{id:'me',full_name:'April',role:'admin',active:true}]});
 renderAdmin=()=>{}; refreshCore=async()=>{};

 // A. defaults render when no settings row exists
 window.__sel.sla_settings=[];
 window.__sel.sla_holidays=[{id:'h1',day:'2026-04-13',name:'Songkran'},{id:'h2',day:'2026-12-05',name:"Father's Day"}];
 window.__sel.request_types=[{id:'rt1',name:'Design request',sla_hours:24,position:1},{id:'rt2',name:'CS ticket',sla_hours:8,position:2}];
 const B=document.createElement('div'); document.body.appendChild(B);
 await renderSlaTab(B);
 r.wtOff = !document.getElementById('sla-wt').checked;
 r.warnDefault = document.getElementById('sla-warn').value==='80';
 r.urgentDefault = document.querySelector('.sla-prio[data-p="urgent"]').value==='50';
 r.daysDefault = [...document.querySelectorAll('.sla-day:checked')].map(x=>x.dataset.d).join('')==='12345';
 r.holidaysListed = /Songkran/.test(B.textContent) && /Father/.test(B.textContent);
 r.typeHours = document.querySelector('.sla-th[data-id="rt1"]').value==='24';
 r.hasSave = /Save SLA settings/.test(B.textContent);
 r.pendingInfoOption = !!document.querySelector('.sla-pause[data-s="pending_info"]');
 r.pendingInfoDefaultOn = document.querySelector('.sla-pause[data-s="pending_info"]').checked;
 r.pendingInfoStatus = REQ_STATUSES.some(s=>s.k==='pending_info' && s.label==='Pending Information');

 // B. validation: work must start before it ends; at least one day
 document.getElementById('sla-ws').value='19:00'; document.getElementById('sla-we').value='09:00';
 window.__calls.length=0;
 await slaSave(document.querySelector('.btn-primary'));
 r.badHoursBlocked = !window.__calls.some(c=>c.table==='sla_settings');
 document.getElementById('sla-ws').value='08:30'; document.getElementById('sla-we').value='17:30';
 document.querySelectorAll('.sla-day').forEach(x=>x.checked=false);
 window.__calls.length=0;
 await slaSave(document.querySelector('.btn-primary'));
 r.noDaysBlocked = !window.__calls.some(c=>c.table==='sla_settings');

 // C. save: settings upsert + only changed type hours updated
 document.querySelectorAll('.sla-day').forEach(x=>{x.checked = ['1','2','3','4','5','6'].includes(x.dataset.d);});
 document.getElementById('sla-wt').checked=true;
 document.getElementById('sla-warn').value='70';
 document.querySelector('.sla-pause[data-s="in_review"]').checked=true;
 document.querySelector('.sla-prio[data-p="urgent"]').value='40';
 document.querySelector('.sla-th[data-id="rt2"]').value='12';
 window.__calls.length=0;
 await slaSave(document.querySelector('.btn-primary'));
 const up = window.__calls.find(c=>c.table==='sla_settings'&&c.op==='upsert');
 r.upsert = up && up.payload.company_id==='co1' && up.payload.use_working_time===true
   && up.payload.work_start==='08:30' && up.payload.work_days.join('')==='123456'
   && up.payload.warn_pct===70 && up.payload.pause_statuses.join(',')==='in_review,pending_info'
   && up.payload.prio_pct.urgent===40 && up.payload.prio_pct.normal===100;
 const tUpd = window.__calls.filter(c=>c.table==='request_types'&&c.op==='update');
 r.typeUpdates = tUpd.length===1 && tUpd[0].eq.id==='rt2' && tUpd[0].payload.sla_hours===12;

 // D. holidays: add requires a date; delete targets the row
 await renderSlaTab(B);
 window.__calls.length=0;
 await slaAddHoliday();
 r.addNeedsDate = !window.__calls.some(c=>c.table==='sla_holidays');
 document.getElementById('sla-hd').value='2026-03-03';
 document.getElementById('sla-hn').value='Makha Bucha Day';
 await slaAddHoliday();
 const hIns = window.__calls.find(c=>c.table==='sla_holidays'&&c.op==='insert');
 r.addHoliday = hIns && hIns.payload.day==='2026-03-03' && hIns.payload.name==='Makha Bucha Day';
 window.__calls.length=0;
 await slaDelHoliday('h1');
 r.delHoliday = window.__calls.some(c=>c.table==='sla_holidays'&&c.op==='delete'&&c.eq.id==='h1');

 // E. apply-to-open calls the recompute rpc
 await renderSlaTab(B);
 window.__calls.length=0;
 await slaApplyOpen(document.querySelectorAll('.btn-ghost')[document.querySelectorAll('.btn-ghost').length-1]);
 r.rpcCalled = window.__calls.some(c=>c.rpc==='recompute_open_slas');

 // F. saved settings render back (not defaults)
 window.__sel.sla_settings=[{company_id:'co1',use_working_time:true,work_start:'10:00:00',work_end:'19:00:00',
   work_days:[2,3,4],warn_pct:60,pause_statuses:['approved'],prio_pct:{urgent:30,high:75,normal:100,low:150},tz:'Asia/Bangkok'}];
 await renderSlaTab(B);
 r.loadedWt = document.getElementById('sla-wt').checked;
 r.loadedStart = document.getElementById('sla-ws').value==='10:00';
 r.loadedDays = [...document.querySelectorAll('.sla-day:checked')].map(x=>x.dataset.d).join('')==='234';
 r.loadedPause = document.querySelector('.sla-pause[data-s="approved"]').checked;
 r.loadedUrgent = document.querySelector('.sla-prio[data-p="urgent"]').value==='30';

 // G. non-admin staff: read-only, no buttons
 S.me={id:'u2',role:'management',full_name:'Prim',company_id:'co1'};
 await renderSlaTab(B);
 r.mgmtNoSave = !/Save SLA settings/.test(B.textContent) && !/Apply to open tickets/.test(B.textContent);
 r.mgmtDisabled = document.getElementById('sla-wt').disabled && document.querySelector('.sla-th').disabled;
 r.mgmtNoHolidayDelete = !/✕/.test(B.querySelectorAll('.card')[2].textContent);

 // H. the badge knows about paused tickets
 r.pausedBadge = /SLA paused/.test(slaBadge(new Date(Date.now()+3600000).toISOString(),'in_review','2026-08-30T00:00:00Z'));
 r.normalBadge = !/paused/.test(slaBadge(new Date(Date.now()+36e5*30).toISOString(),'in_progress',null));
}catch(e){r.error=e.message+' | '+(e.stack||'').split('\n').slice(0,4).join(' / ');}return r;};`;
try{w.eval(scripts.join('\n')+'\n'+driver);}catch(e){console.log('EVAL ERROR:',e.message);}
(async()=>{try{console.log(JSON.stringify(await w.eval('window.__run()'),null,2));}catch(e){console.log('RUN ERROR:',e.message);}process.exit(0);})();
