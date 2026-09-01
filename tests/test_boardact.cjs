const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html.replace(/<script src=[^>]+><\/script>/g,''),{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window; w.__calls=[]; w.__sel={};
w.eval(`
window.scrollTo=()=>{};
window.__mkQuery=(t)=>{const q={_t:t,_op:'select',_p:null,_eq:{},
 update(p){q._op='update';q._p=p;return q;}, insert(p){q._op='insert';q._p=p;return q;},
 delete(){q._op='delete';return q;}, select(){return q;}, single(){return q;},
 eq(c,v){q._eq[c]=v;return q;}, neq(){return q;}, not(){return q;}, is(){return q;}, lt(){return q;}, in(){return q;}, order(){return q;}, limit(){return q;},
 then(r,j){window.__calls.push({table:t,op:q._op,eq:{...q._eq}});
  return Promise.resolve({data:window.__sel[t]||[],count:0,error:null}).then(r,j);}};return q;};
window.supabase={createClient:()=>({from:window.__mkQuery,
 auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{}}})},
 storage:{from:()=>({})},functions:{},
 rpc:(name,args)=>{window.__calls.push({rpc:name,args:args});return Promise.resolve({data:'t9',error:null});}})};`);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const driver=String.raw`window.__run=async function(){const r={};try{
 Object.assign(S,{me:{id:'me',role:'admin',full_name:'April'},route:{view:'project',id:'p1'},
  workspaces:[{id:'w1',name:'CS',color:'#111'}],
  projects:[{id:'p1',workspace_id:'w1',name:'CS Inquiries',status:'active',color:'#08e'}],
  profiles:[{id:'me',full_name:'April Niramol',role:'admin',active:true,avatar_color:'#0F766E'}],
  _groups:[], _fields:[], _tasks:[{id:'t1',title:'Alive task'}], _tasksAll:[{id:'t1',title:'Alive task'}]});
 renderProject=()=>{};                          // stub redraws

 // A. staff see the Activity button in the board filter bar; requesters don't
 r.btnStaff = /boardActivityModal/.test(filterBarHTML('p1'));
 S.me.role='requester';
 r.btnRequesterHidden = !/boardActivityModal/.test(filterBarHTML('p1'));
 S.me.role='admin';

 // B. the modal: deleted-with-snapshot rows offer Restore; live tasks don't
 window.__sel.activity_log=[
  {id:11,entity_type:'task',entity_id:'t9',project_id:'p1',actor_id:'me',action:'deleted',
   detail:{title:'Removed banner',snapshot:{id:'t9',title:'Removed banner'}},created_at:'2026-08-30T07:00:00Z'},
  {id:12,entity_type:'task',entity_id:'t1',project_id:'p1',actor_id:'me',action:'deleted',
   detail:{title:'Alive task',snapshot:{id:'t1'}},created_at:'2026-08-30T06:00:00Z'},
  {id:13,entity_type:'task',entity_id:'t8',project_id:'p1',actor_id:'me',action:'deleted',
   detail:{title:'Old removal, no snapshot'},created_at:'2026-08-01T06:00:00Z'},
  {id:14,entity_type:'task',entity_id:'t1',project_id:'p1',actor_id:'me',action:'updated',
   detail:{title:'Alive task',changes:[{field:'status',from:'todo',to:'done'}]},created_at:'2026-08-30T05:00:00Z'}];
 await boardActivityModal('p1');
 const body=document.querySelector('.modal-body');
 r.modalTitleRow = /Removed banner/.test(body.textContent) && /deleted this task/.test(body.textContent);
 r.updateRow = /changed/.test(body.textContent) && /Done/.test(body.textContent);
 const restores=[...body.querySelectorAll('.hist-undo')];
 r.restoreOnlyWhenGone = restores.length===1 && restores[0].outerHTML.includes('restoreTask(11');
 r.queryScoped = window.__calls.some(c=>c.table==='activity_log'&&c.eq.project_id==='p1');

 // C. restore calls the definer rpc with the log row id
 window.__calls.length=0;
 await restoreTask(11,'p1');
 const rp=window.__calls.find(c=>c.rpc==='restore_deleted_task');
 r.rpc = rp && rp.args.log_id===11;
 closeModals();

 // D. requester sees the log rows but never a Restore button
 S.me.role='requester';
 await boardActivityModal('p1');
 r.requesterNoRestore = document.querySelectorAll('.modal-body .hist-undo').length===0;
 closeModals();
}catch(e){r.error=e.message+' | '+(e.stack||'').split('\n').slice(0,4).join(' / ');}return r;};`;
try{w.eval(scripts.join('\n')+'\n'+driver);}catch(e){console.log('EVAL ERROR:',e.message);}
(async()=>{try{console.log(JSON.stringify(await w.eval('window.__run()'),null,2));}catch(e){console.log('RUN ERROR:',e.message);}process.exit(0);})();
