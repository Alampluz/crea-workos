const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html.replace(/<script src=[^>]+><\/script>/g,''),{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window; w.__calls=[]; w.__sel={};
w.eval(`
window.scrollTo=()=>{};
window.__mkQuery=(t)=>{const q={_t:t,_op:'select',_p:null,_eq:{},
 update(p){q._op='update';q._p=p;return q;}, insert(p){q._op='insert';q._p=p;return q;},
 delete(){q._op='delete';return q;}, select(){return q;}, single(){return q;},
 eq(c,v){q._eq[c]=v;return q;}, is(){return q;}, in(){return q;}, order(){return q;}, limit(){return q;},
 then(r,j){window.__calls.push({table:t,op:q._op,payload:q._p,eq:{...q._eq}});
  return Promise.resolve({data:(window.__sel[t]||[]),count:0,error:null}).then(r,j);}};return q;};
window.supabase={createClient:()=>({from:window.__mkQuery,
 rpc:(fn)=>{window.__calls.push({rpc:fn});return Promise.resolve({data:{sla_warning:1,sla_breach:0,task_overdue:2},error:null});},
 auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{}}})},
 storage:{from:()=>({})},functions:{}})};`);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const driver=`window.__run=async function(){const r={};try{
 Object.assign(S,{me:{id:'me',role:'admin',full_name:'April'},route:{view:'admin',id:null},company:{name:'CREA'},
  workspaces:[{id:'w1',name:'Customer Service Team',color:'#0F766E',description:''}],
  projects:[], profiles:[{id:'me',full_name:'April',role:'admin',active:true,email:'a@a',avatar_color:'#0F766E'},
                         {id:'u2',full_name:'Prim V',role:'management',active:true,email:'p@a',avatar_color:'#358'}]});
 const B=document.createElement('div'); document.body.appendChild(B);

 // A. all 8 rules render, default on
 autoWs='';
 window.__sel['automation_rules']=[];
 window.__sel['automation_runs']=[{id:1,rule_key:'task_assigned',entity_type:'task',entity_id:'t1',status:'ok',detail:{},created_at:new Date().toISOString()}];
 await renderAutomationsTab(B);
 r.rules = B.querySelectorAll('tbody tr').length - 1;              // 8 rules + 1 run row... separate tables
 r.ruleRows = B.querySelectorAll('.sw').length;                    // 8 switches
 r.allOnByDefault = [...B.querySelectorAll('.sw input')].every(i=>i.checked);
 r.runLogShows = /Assignee is notified/.test(B.textContent) && /ok/.test(B.textContent);
 r.noResetColumnGlobally = !/inherited/.test(B.textContent);

 // B. a global off row unchecks its switch
 window.__sel['automation_rules']=[{id:'r1',rule_key:'sla_breach',workspace_id:null,enabled:false}];
 await renderAutomationsTab(B);
 const states = {}; [...B.querySelectorAll('tbody tr')].forEach(tr=>{
   const sw=tr.querySelector('.sw input'); if(sw) states[tr.children[1].textContent.trim()]=sw.checked; });
 r.breachOff = states['SLA breach escalates']===false;
 r.othersOn = states['Assignee is notified']===true;

 // C. workspace view: inherited state + custom override shows Reset
 autoWs='w1';
 window.__sel['automation_rules']=[{id:'r1',rule_key:'sla_breach',workspace_id:null,enabled:false},
                                   {id:'r2',rule_key:'task_overdue',workspace_id:'w1',enabled:false}];
 await renderAutomationsTab(B);
 r.wsInheritedTags = (B.textContent.match(/inherited/g)||[]).length;   // 7 inherited, 1 custom
 r.wsHasReset = /Reset/.test(B.textContent);
 const st2 = {}; [...B.querySelectorAll('tbody tr')].forEach(tr=>{
   const sw=tr.querySelector('.sw input'); if(sw) st2[tr.children[1].textContent.trim()]=sw.checked; });
 r.wsInheritsGlobalOff = st2['SLA breach escalates']===false;
 r.wsCustomOff = st2['Overdue task nudges its owner']===false;

 // D. toggling writes the right row
 window.__calls.length=0; renderAdmin=async()=>{};
 S._autoRules = window.__sel['automation_rules'];
 await setAutoRule('task_assigned', false);                            // no row yet -> insert scoped to w1
 const ins = window.__calls.find(c=>c.table==='automation_rules'&&c.op==='insert');
 r.insertScoped = ins && ins.payload.workspace_id==='w1' && ins.payload.enabled===false && ins.payload.rule_key==='task_assigned';
 window.__calls.length=0;
 await setAutoRule('task_overdue', true);                              // existing w1 row -> update
 const up = window.__calls.find(c=>c.table==='automation_rules'&&c.op==='update');
 r.updateExisting = up && up.payload.enabled===true && up.eq.id==='r2';
 window.__calls.length=0;
 await clearAutoRule('task_overdue');                                  // reset deletes the ws row
 r.resetDeletes = window.__calls.some(c=>c.table==='automation_rules'&&c.op==='delete'&&c.eq.id==='r2');

 // E. Run now calls the sweep and reports
 window.__calls.length=0;
 const btn=document.createElement('button'); document.body.appendChild(btn);
 await runSweepNow(btn);
 r.sweepCalled = window.__calls.some(c=>c.rpc==='run_automation_sweep');
 r.sweepToast = [...document.querySelectorAll('.toast')].some(t=>/3 alerts sent/.test(t.textContent));

 // F. notification lines per kind
 const who={full_name:'Prim V'};
 r.lines = ['assigned','review','request','sla_warning','sla_breach','overdue','mention'].map(k=>
   notifLine({kind:k,title:'WO-12 · Fix banner'}, k==='mention'||k==='assigned'? who:null).replace(/<[^>]+>/g,''));
}catch(e){r.error=e.message+' | '+(e.stack||'').split('\\n').slice(0,4).join(' / ');}return r;};`;
try{w.eval(scripts.join('\n')+'\n'+driver);}catch(e){console.log('EVAL ERROR:',e.message);}
(async()=>{try{console.log(JSON.stringify(await w.eval('window.__run()'),null,2));}catch(e){console.log('RUN ERROR:',e.message);}process.exit(0);})();
