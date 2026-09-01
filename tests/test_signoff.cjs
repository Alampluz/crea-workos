const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html.replace(/<script src=[^>]+><\/script>/g,''),{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window; w.__calls=[]; w.__sel={};
w.eval(`
window.scrollTo=()=>{};
window.__failNext=null;
window.__mkQuery=(t)=>{const q={_t:t,_op:'select',_p:null,_eq:{},_single:false,
 update(p){q._op='update';q._p=p;return q;}, insert(p){q._op='insert';q._p=p;return q;},
 upsert(p){q._op='upsert';q._p=p;return q;},
 delete(){q._op='delete';return q;}, select(){return q;}, single(){q._single=true;return q;},
 eq(c,v){q._eq[c]=v;return q;}, neq(){return q;}, not(){return q;}, is(){return q;}, or(){return q;},
 lt(){return q;}, gte(){return q;}, lte(){return q;}, in(){return q;}, order(){return q;}, limit(){return q;},
 then(r,j){window.__calls.push({table:t,op:q._op,payload:q._p,eq:{...q._eq},single:q._single});
  if(window.__failNext && window.__failNext.table===t && window.__failNext.op===q._op){
    const msg=window.__failNext.msg; window.__failNext=null;
    return Promise.resolve({data:null,count:0,error:{message:msg}}).then(r,j);}
  let data = window.__sel[t]||[];
  if(t==='approvals' && q._eq.task_id) data = data.filter(x=>x.task_id===q._eq.task_id);
  if(q._op==='insert') data=(Array.isArray(q._p)?q._p:[q._p]).map((x,i)=>({...x,id:'nw'+i}));
  if(q._op==='update') data = data.filter(x=>x.id===q._eq.id).map(x=>({...x,...q._p}));
  if(q._single) data = data[0]||null;
  return Promise.resolve({data,count:0,error:null}).then(r,j);}};return q;};
window.supabase={createClient:()=>({from:window.__mkQuery,
 auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{}}})},
 storage:{from:()=>({})},functions:{},
 rpc:(name,args)=>{window.__calls.push({rpc:name,args:args});return Promise.resolve({data:null,error:null});}})};`);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const driver=String.raw`window.__run=async function(){const r={};try{
 Object.assign(S,{me:{id:'me',role:'admin',full_name:'April',company_id:'co1'},route:{view:'project',id:'p1'},
  workspaces:[{id:'w1',name:'CS',color:'#111'}],
  projects:[{id:'p1',workspace_id:'w1',name:'CS Inquiries',status:'active',color:'#08e',visibility:'collaborate',
    approval_gate:{on:true,status:'done',approvers:['u2','me']}}],
  profiles:[{id:'me',full_name:'April Niramol',role:'admin',active:true,avatar_color:'#0F766E',email:'april@example.test'},
   {id:'u2',full_name:'Ploy Chan',role:'internal',active:true,avatar_color:'#0984E3',email:'ploy@example.test'},
   {id:'u3',full_name:'Mai Suwan',role:'management',active:true,avatar_color:'#6C5CE7',email:'mai@example.test'},
   {id:'u4',full_name:'Beam Req',role:'requester',active:true,avatar_color:'#E17055',email:'beam@example.test'}],
  _groups:[], _fields:[], _tasks:[], _tasksAll:[]});
 renderProject=()=>{}; refreshCore=async()=>{}; renderSidebar=()=>{};

 // A. edit-board modal: gate section for admin, save payload carries approval_gate
 editProjectModal('p1');
 let body=document.querySelector('.modal-body');
 r.gateSectionAdmin = /Require sign-off/.test(body.textContent) && !!body.querySelector('#ep-gate-on');
 r.gateToggleOn = body.querySelector('#ep-gate-on').checked===true && body.querySelector('#ep-gate-appr').hidden===false;
 r.gateStatusDefault = body.querySelector('#ep-gate-status').value==='done';
 const boxes=[...body.querySelectorAll('#ep-gate-appr input[data-gapp]')];
 r.gatePoolStaffOnly = boxes.length===3 && !boxes.some(b=>b.dataset.gapp==='u4');
 r.gateApproverPrechecked = boxes.find(b=>b.dataset.gapp==='u2').checked===true
   && boxes.find(b=>b.dataset.gapp==='u3').checked===false;
 body.querySelector('#ep-gate-status').value='review';
 window.__calls.length=0;
 await document.querySelector('#ep-save').onclick();
 const upd=window.__calls.find(c=>c.table==='projects'&&c.op==='update');
 r.savePayload = !!upd && upd.payload.approval_gate
   && upd.payload.approval_gate.on===true
   && upd.payload.approval_gate.status==='review'
   && upd.payload.approval_gate.approvers.includes('u2')
   && upd.payload.approval_gate.approvers.includes('me');
 closeModals();

 // hidden for internal staff
 S.me.role='internal';
 editProjectModal('p1');
 r.gateHiddenInternal = !/Require sign-off/.test(document.querySelector('.modal-body').textContent);
 closeModals(); S.me.role='admin';

 // B. task drawer: sign-off section, chips, Approve/Reject only on my pending row
 window.__sel.tasks=[{id:'t1',project_id:'p1',title:'Design banner',description:'',status:'in_progress',
   priority:'normal',assignee_id:null,due_date:null,tags:[],created_by:'me',created_at:'2026-08-30T05:00:00Z'}];
 window.__sel.approvals=[
  {id:'a1',task_id:'t1',request_id:null,title:'Design banner',approver_id:'me',requested_by:'u2',
   status:'pending',note:null,created_at:'2026-08-30T06:00:00Z'},
  {id:'a2',task_id:'t1',request_id:null,title:'Design banner',approver_id:'u2',requested_by:'me',
   status:'approved',note:'looks good',created_at:'2026-08-30T07:00:00Z'}];
 window.__sel.comments=[]; window.__sel.attachments=[]; window.__sel.subtasks=[];
 window.__sel.task_checklist=[]; window.__sel.activity_log=[];
 await openTask('t1');
 body=document.querySelector('.modal-body');
 const so=document.getElementById('tv-signoff');
 r.signoffSection = !!so && /Sign-off/.test(body.textContent);
 r.rowChips = /pending/.test(so.textContent) && /approved/.test(so.textContent) && /looks good/.test(so.textContent);
 const decideBtns=[...so.querySelectorAll('button')].filter(b=>/decideTaskApproval/.test(b.outerHTML));
 r.decideOnlyMyPending = decideBtns.length===2 && decideBtns.every(b=>b.outerHTML.includes("'a1'"));
 r.completeLine = /Sign-off complete/.test(so.textContent) && /Done/.test(so.textContent);
 r.requestBtn = [...so.querySelectorAll('button')].some(b=>/requestSignoffModal/.test(b.outerHTML));
 r.apprQuery = window.__calls.some(c=>c.table==='approvals'&&c.op==='select'&&c.eq.task_id==='t1');
 closeModals();

 // C. request sign-off modal: picker excludes me; insert payload is right
 await requestSignoffModal('t1');
 const sel=document.getElementById('so-approver');
 const optVals=[...sel.querySelectorAll('option')].map(o=>o.value);
 r.pickerExcludesMe = !optVals.includes('me') && optVals.includes('u2');
 sel.value='u2';
 document.getElementById('so-note').value='please check colours';
 window.__calls.length=0;
 await document.getElementById('so-send').onclick();
 const ins=window.__calls.find(c=>c.table==='approvals'&&c.op==='insert');
 r.insertPayload = !!ins && ins.payload.task_id==='t1' && ins.payload.title==='Design banner'
   && ins.payload.approver_id==='u2' && ins.payload.requested_by==='me'
   && ins.payload.note==='please check colours';
 closeModals();
 // empty note must go up as '' — the column is NOT NULL, null would be rejected by the DB
 await requestSignoffModal('t1');
 document.getElementById('so-approver').value='u2';
 window.__calls.length=0;
 await document.getElementById('so-send').onclick();
 const ins2=window.__calls.find(c=>c.table==='approvals'&&c.op==='insert');
 r.emptyNoteNotNull = !!ins2 && ins2.payload.note==='';
 closeModals();

 // maker-cannot-be-checker comes back from the DB as a plain toast
 window.__failNext={table:'approvals',op:'insert',msg:'maker cannot be checker'};
 await requestSignoffModal('t1');
 document.getElementById('so-approver').value='u2';
 const toasts1=[]; const _toast=toast; toast=(m,e)=>{toasts1.push({m,e});_toast(m,e);};
 await document.getElementById('so-send').onclick();
 toast=_toast;
 r.insertErrorToasted = toasts1.some(x=>x.m==='maker cannot be checker' && x.e===true);
 closeModals();

 // D. decideTaskApproval sends the decision update
 window.__calls.length=0;
 await decideTaskApproval('a1','approved','t1');
 const dec=window.__calls.find(c=>c.table==='approvals'&&c.op==='update');
 r.decideUpdate = !!dec && dec.eq.id==='a1' && dec.payload.status==='approved' && !!dec.payload.decided_at;
 closeModals();

 // E. approvalTable renders a task deep link
 const tbl=approvalTable([{id:'a9',task_id:'t7',request_id:null,title:'Sign this',requested_by:'u2',created_at:'2026-08-30T06:00:00Z'}]);
 r.taskViewLink = tbl.includes("location.hash='#/task/t7'");
 const tbl2=approvalTable([{id:'a8',task_id:null,request_id:'r1',title:'Req',requested_by:'u2',created_at:'2026-08-30T06:00:00Z'}]);
 r.requestViewKept = tbl2.includes("openRequest('r1')") && !tbl2.includes('#/task/');

 // F. notification lines
 const ploy={full_name:'Ploy Chan'};
 r.notifApproval = notifLine({kind:'approval',title:'Design banner'},ploy)
   .includes('asked you to sign off on') && notifLine({kind:'approval',title:'Design banner'},ploy).includes('Ploy Chan');
 r.notifApproved = notifLine({kind:'approval_decided',title:'Design banner',body:'approved'},ploy)
   .includes('approved your sign-off');
 const nr=notifLine({kind:'approval_decided',title:'Design banner',body:'rejected — too dark'},ploy);
 r.notifRejected = nr.includes('declined your sign-off') && nr.includes('too dark');

 // G. history lines
 r.histRequested = histLine({action:'signoff_requested',detail:{title:'Design banner',approver:'u2'}})
   .includes('requested a sign-off from <b>Ploy Chan</b>');
 r.histApproved = histLine({action:'signoff_approved',detail:{title:'Design banner',note:'looks good'}})
   .includes('approved the sign-off') && histLine({action:'signoff_approved',detail:{note:'looks good'}}).includes('looks good');
 r.histRejected = histLine({action:'signoff_rejected',detail:{note:'too dark'}})
   .includes('rejected the sign-off') && histLine({action:'signoff_rejected',detail:{}})==='rejected the sign-off';

 // H. a blocked status change surfaces the DB error as a toast and reverts
 S._tasks=[{id:'t1',project_id:'p1',title:'Design banner',status:'in_progress'}];
 window.__failNext={table:'tasks',op:'update',msg:'This board needs a sign-off before a task can be marked Done'};
 const toasts2=[]; const _t2=toast; toast=(m,e)=>{toasts2.push({m,e});};
 await tvCore('t1','status','done');
 toast=_t2;
 r.blockToasted = toasts2.some(x=>/needs a sign-off/.test(x.m) && x.e===true);
 r.blockReverted = S._tasks[0].status==='in_progress';
}catch(e){r.error=e.message+' | '+(e.stack||'').split('\n').slice(0,4).join(' / ');}return r;};`;
try{w.eval(scripts.join('\n')+'\n'+driver);}catch(e){console.log('EVAL ERROR:',e.message);}
(async()=>{try{console.log(JSON.stringify(await w.eval('window.__run()'),null,2));}catch(e){console.log('RUN ERROR:',e.message);}process.exit(0);})();
