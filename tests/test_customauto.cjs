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
  let data;
  if(q._op==='insert') data=(Array.isArray(q._p)?q._p:[q._p]).map((x,i)=>({...x,id:'nw'+i}));
  else data = window.__sel[t]||[];
  return Promise.resolve({data,error:null}).then(r,j);}};return q;};
window.supabase={createClient:()=>({from:window.__mkQuery,
 auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{}}})},
 storage:{from:()=>({})},functions:{}, rpc:async()=>({data:{},error:null})})};`);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const driver=String.raw`window.__run=async function(){const r={};try{
 Object.assign(S,{me:{id:'me',role:'admin',full_name:'April'},route:{view:'admin'},
  workspaces:[{id:'w1',name:'CS Team',color:'#0F766E'}],
  projects:[{id:'p1',workspace_id:'w1',name:'CS Inquiries',status:'active',color:'#08e'}],
  profiles:[{id:'me',full_name:'April Niramol',role:'admin',active:true,avatar_color:'#0F766E'},
            {id:'u2',full_name:'Prim V',role:'internal',active:true,avatar_color:'#358'},
            {id:'u3',full_name:'Gone P',role:'internal',active:false,avatar_color:'#358'}]});
 renderAdmin=()=>{};

 // A. tab renders custom section: sentence, switch, scope chip, run-log name
 window.__sel.custom_automations=[{id:'c1',workspace_id:null,project_id:null,name:'When status changes to Done, notify the assignee',
   trigger_key:'status_changed',condition:{to:'done'},action_key:'notify_assignee',action_config:{},enabled:true,created_at:'2026-08-29'}];
 window.__sel.automation_rules=[];
 window.__sel.automation_runs=[{id:1,rule_key:'custom',entity_type:'task',entity_id:'t1',status:'ok',
   detail:{automation_id:'c1',name:'When status changes to Done, notify the assignee',action:'notify_assignee'},created_at:new Date().toISOString()}];
 const B=document.createElement('div'); document.body.appendChild(B);
 await renderAutomationsTab(B);
 r.section = /Your automations/.test(B.textContent) && /Built-in rules/.test(B.textContent);
 r.sentence = /When status changes to Done, notify the assignee/.test(B.textContent);
 r.scopeChip = /Everywhere/.test(B.textContent);
 r.addBtn = /Add automation/.test(B.textContent);
 r.runShowsName = (B.textContent.match(/When status changes to Done, notify the assignee/g)||[]).length >= 2;

 // B. builder: defaults, sentence preview, condition picker
 caModal();                                     // JSDOM outside-only mode doesn't run inline onclick
 r.modalWhen = !!document.querySelector('#ca-body select');
 r.preview = document.querySelector('#ca-preview').textContent;
 _ca.cond.to='done'; caDraw();
 r.previewCond = /When status changes to Done, notify the assignee/.test(document.querySelector('#ca-preview').textContent);

 // C. validation: person actions refuse to save without a person
 _ca.action='notify_person'; _ca.cfg={}; caDraw();
 window.__calls.length=0;
 await caSave();
 r.blockedNoPerson = !window.__calls.some(c=>c.table==='custom_automations');

 // D. save inserts the full recipe
 _ca.cfg.user_id='u2'; caDraw();
 window.__calls.length=0;
 await caSave();
 await new Promise(x=>setTimeout(x,40));
 const ins = window.__calls.find(c=>c.table==='custom_automations'&&c.op==='insert');
 r.insert = ins && ins.payload.trigger_key==='status_changed' && ins.payload.condition.to==='done'
   && ins.payload.action_key==='notify_person' && ins.payload.action_config.user_id==='u2'
   && ins.payload.workspace_id===null && ins.payload.project_id===null;
 r.insertName = ins && ins.payload.name==='When status changes to Done, notify Prim V';

 // E. inactive people are not offered
 caModal();
 _ca.action='assign_person'; _ca.cfg={}; caDraw();
 r.noInactive = ![...document.querySelectorAll('#ca-cfg option')].some(o=>/Gone P/.test(o.textContent));
 closeModals();

 // F. board scope: groups load from the board, save stamps project_id
 window.__sel.project_groups=[{id:'g1',name:'Case Open'},{id:'g2',name:'Solved'}];
 caModal();
 _ca.trigger='moved_to_group'; _ca.cond={}; _ca.action='move_to_group'; _ca.cfg={};
 r.needsBoard = (caDraw(), /Choose a board/.test(document.querySelector('#ca-body').textContent));
 _ca.scope='p:p1'; await caLoadGroups('p1');
 r.groupOpts = [...document.querySelectorAll('#ca-cfg option')].map(o=>o.textContent);
 _ca.cfg.group_id='g2'; _ca.cond.group_id='g1'; caDraw();
 window.__calls.length=0;
 await caSave();
 const ins2 = window.__calls.find(c=>c.table==='custom_automations'&&c.op==='insert');
 r.boardInsert = ins2 && ins2.payload.project_id==='p1' && ins2.payload.workspace_id===null
   && ins2.payload.condition.group_id==='g1' && ins2.payload.action_config.group_id==='g2';
 r.boardName = ins2 && ins2.payload.name==='When a task moves to Case Open, move it to Solved';

 // G. edit prefills and updates in place
 S._customAutos = window.__sel.custom_automations;
 caModal('c1');
 r.prefill = _ca.trigger==='status_changed' && _ca.cond.to==='done' && _ca.id==='c1';
 window.__calls.length=0;
 await caSave();
 const upd = window.__calls.find(c=>c.table==='custom_automations'&&c.op==='update');
 r.update = upd && upd.eq.id==='c1' && upd.payload.action_key==='notify_assignee';

 // H. toggle + delete
 window.__calls.length=0;
 await caToggle('c1', false);
 await caDelete('c1');
 r.toggle = window.__calls.some(c=>c.table==='custom_automations'&&c.op==='update'&&c.payload.enabled===false&&c.eq.id==='c1');
 r.del = window.__calls.some(c=>c.table==='custom_automations'&&c.op==='delete'&&c.eq.id==='c1');

 // J. each workspace hosts the same tab, pinned to itself
 S.me={id:'me',role:'admin',full_name:'April'};
 S.workspaces.push({id:'w2',name:'BD Team',color:'#333'});
 window.__sel.custom_automations=[
  {id:'c1',workspace_id:null,project_id:null,name:'Global rule',trigger_key:'task_created',condition:{},action_key:'notify_team',action_config:{},enabled:true,created_at:'2026-08-01'},
  {id:'c2',workspace_id:'w1',project_id:null,name:'CS rule',trigger_key:'task_created',condition:{},action_key:'notify_team',action_config:{},enabled:true,created_at:'2026-08-02'},
  {id:'c3',workspace_id:'w2',project_id:null,name:'Other ws rule',trigger_key:'task_created',condition:{},action_key:'notify_team',action_config:{},enabled:true,created_at:'2026-08-03'},
  {id:'c4',workspace_id:null,project_id:'p1',name:'Board rule',trigger_key:'task_created',condition:{},action_key:'notify_team',action_config:{},enabled:true,created_at:'2026-08-04'}];
 S.route={view:'ws',id:'w1',tab:'automations'};
 await renderWorkspaceAutomations('w1');
 const CT=document.getElementById('content');
 r.wsTabShown = /Rules for this workspace/.test(CT.textContent) && /Built-in rules/.test(CT.textContent);
 r.wsNoScopeSelector = !/Rules apply to/.test(CT.textContent);
 r.wsCustomsFiltered = ['Global rule','CS rule','Board rule'].every(n=>CT.textContent.includes(n)) && !CT.textContent.includes('Other ws rule');
 // built-in toggle from the ws tab writes a w1 override
 window.__calls.length=0;
 await setAutoRule('task_assigned', false);
 const arIns = window.__calls.find(c=>c.table==='automation_rules'&&c.op==='insert');
 r.wsPinnedRule = arIns && arIns.payload.workspace_id==='w1' && arIns.payload.enabled===false;
 // new recipe from the ws tab starts scoped to that workspace
 caModal(null,'w:w1');
 r.wsDefaultScope = _ca.scope==='w:w1';
 window.__calls.length=0;
 await caSave();
 const insW = window.__calls.find(c=>c.table==='custom_automations'&&c.op==='insert');
 r.wsInsertScoped = insW && insW.payload.workspace_id==='w1' && insW.payload.project_id===null;
 // management sees it read-only: no add button, switches disabled
 S.me={id:'u2',role:'management',full_name:'Prim V'};
 await renderWorkspaceAutomations('w1');
 r.mgmtNoAdd = !/Add automation/.test(document.getElementById('content').textContent);
 r.mgmtSwitchesOff = [...document.querySelectorAll('#ws-auto .sw input')].length>0
   && [...document.querySelectorAll('#ws-auto .sw input')].every(i=>i.disabled);
 // requesters are bounced back to the boards tab
 S.me={id:'u9',role:'requester',full_name:'R'};
 await renderWorkspaceAutomations('w1');
 r.requesterBounced = location.hash==='#/ws/w1';
 S.me={id:'me',role:'admin',full_name:'April'};

 // K. per-board status columns: "A column changes" trigger + "Set a column value" action
 S.me={id:'me',role:'admin',full_name:'April'};
 window._caFields={}; window._caGroups={};
 window.__sel.project_fields=[
   {id:'sf1',label:'Production Status',ftype:'select',options:['Pending','In-Progress','Resolved']},
   {id:'nf1',label:'GMV',ftype:'number',options:null}];    // number field must be filtered out
 caModal(null,'w:w1');
 _ca.trigger='field_changed'; _ca.cond={}; caDraw();
 r.fieldNeedsBoard = /Choose a board below first/.test(document.querySelector('#ca-body').textContent);
 _ca.scope='p:p1'; await caLoadGroups('p1');
 r.fieldColOnlySelect = [...document.querySelectorAll('#ca-cond option')].map(o=>o.textContent).filter(x=>x!=='Pick a column…');
 _ca.cond.field_id='sf1'; caDraw();
 r.fieldValueOpts = [...document.querySelectorAll('#ca-cond-v option')].map(o=>o.textContent);
 _ca.cond.to='Resolved';
 _ca.action='set_status'; _ca.cfg={status:'done'}; caDraw();
 r.fieldSentence = /When Production Status becomes Resolved, set status to Done/.test(document.querySelector('#ca-preview').textContent);
 window.__calls.length=0;
 await caSave();
 const insF = window.__calls.find(c=>c.table==='custom_automations'&&c.op==='insert');
 r.fieldInsert = insF && insF.payload.trigger_key==='field_changed'
   && insF.payload.condition.field_id==='sf1' && insF.payload.condition.to==='Resolved'
   && insF.payload.project_id==='p1';

 // set_field action mirrors a value onto a board column
 caModal(null,'p:p1'); await caLoadGroups('p1');
 _ca.trigger='status_changed'; _ca.cond={to:'done'};
 _ca.action='set_field'; _ca.cfg={}; caDraw();
 window.__calls.length=0; await caSave();
 r.setFieldNeedsValue = !window.__calls.some(c=>c.table==='custom_automations');
 _ca.cfg.field_id='sf1'; _ca.cfg.value='Resolved'; caDraw();
 window.__calls.length=0;
 await caSave();
 const insSF = window.__calls.find(c=>c.table==='custom_automations'&&c.op==='insert');
 r.setFieldInsert = insSF && insSF.payload.action_key==='set_field'
   && insSF.payload.action_config.field_id==='sf1' && insSF.payload.action_config.value==='Resolved';
 r.setFieldName = insSF && insSF.payload.name==='When status changes to Done, set Production Status to Resolved';
 closeModals();

 // I. the bell knows the new kind
 r.notif = notifLine({kind:'automation',title:'Banner set',body:'When status changes to Done, notify the assignee'},null);
 r.notifOk = /Banner set/.test(r.notif) && /notify the assignee/.test(r.notif);
 r.notifNoBody = /An automation flagged/.test(notifLine({kind:'automation',title:'X'},null));
}catch(e){r.error=e.message+' | '+(e.stack||'').split('\n').slice(0,4).join(' / ');}return r;};`;
try{w.eval(scripts.join('\n')+'\n'+driver);}catch(e){console.log('EVAL ERROR:',e.message);}
(async()=>{try{console.log(JSON.stringify(await w.eval('window.__run()'),null,2));}catch(e){console.log('RUN ERROR:',e.message);}process.exit(0);})();
