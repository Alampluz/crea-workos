const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html.replace(/<script src=[^>]+><\/script>/g,''),{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window; w.__calls=[]; w.__sel={};
w.eval(`
window.scrollTo=()=>{};
window.__mkQuery=(t)=>{const q={_t:t,_op:'select',_p:null,_eq:{},_single:false,
 update(p){q._op='update';q._p=p;return q;}, insert(p){q._op='insert';q._p=p;return q;},
 upsert(p){q._op='upsert';q._p=p;return q;},
 delete(){q._op='delete';return q;}, select(){return q;}, single(){q._single=true;return q;},
 eq(c,v){q._eq[c]=v;return q;}, is(){return q;}, in(){return q;}, order(){return q;}, limit(){return q;},
 then(r,j){window.__calls.push({table:t,op:q._op,payload:q._p,eq:{...q._eq},single:q._single});
  let data = window.__sel[t]||[];
  if(t==='activity_log' && q._eq.entity_type) data = data.filter(x=>x.entity_type===q._eq.entity_type);
  if(q._op==='insert') data=(Array.isArray(q._p)?q._p:[q._p]).map((x,i)=>({...x,id:'nw'+i}));
  if(q._op==='update') data = (window.__sel[t]||[]).filter(x=>x.id===q._eq.id).map(x=>({...x,...q._p}));
  if(q._single) data = data[0]||null;
  return Promise.resolve({data,error:null}).then(r,j);}};return q;};
window.supabase={createClient:()=>({from:window.__mkQuery,
 auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{}}})},
 storage:{from:()=>({})},functions:{}, rpc:async()=>({data:{},error:null})})};`);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const driver=String.raw`window.__run=async function(){const r={};try{
 Object.assign(S,{me:{id:'me',role:'admin',full_name:'April',company_id:'co1'},route:{view:'requests'},
  workspaces:[], projects:[], requestTypes:[{id:'rt1',name:'CS ticket',fields:[]}],
  profiles:[{id:'me',full_name:'April Niramol',role:'admin',active:true,avatar_color:'#0F766E'}]});
 window.__sel.requests=[{id:'r1',ticket_no:42,title:'Broken banner',status:'in_review',priority:'normal',
   request_type_id:'rt1',submitted_by:'me',assigned_to:null,data:{},created_at:'2026-08-30T05:00:00Z',
   sla_due_at:null,sla_paused_at:null,project_id:null}];
 window.__sel.comments=[{id:'c1',entity_type:'request',entity_id:'r1',body:'test',author_id:'me',
   created_at:'2026-08-30T06:29:00Z',deleted_at:null}];
 window.__sel.approvals=[]; window.__sel.attachments=[];
 window.__sel.activity_log=[
  {id:1,entity_type:'request',entity_id:'r1',actor_id:'me',action:'comment_edited',
   detail:{excerpt:'test v2',was:'test',comment_id:'c1'},created_at:'2026-08-30T06:31:00Z'},
  {id:2,entity_type:'request',entity_id:'r1',actor_id:'me',action:'comment_deleted',
   detail:{excerpt:'old note',comment_id:'c9'},created_at:'2026-08-30T06:30:00Z'},
  {id:3,entity_type:'request',entity_id:'r1',actor_id:'me',action:'updated',
   detail:{status:'in_review'},created_at:'2026-08-30T06:20:00Z'},
  {id:4,entity_type:'task',entity_id:'t9',actor_id:'me',action:'commented',
   detail:{excerpt:'task-side row, must not appear'},created_at:'2026-08-30T06:10:00Z'}];

 // A. the request drawer now carries a History section
 await openRequest('r1');
 const body = document.querySelector('.modal-body');
 r.histSection = /Activity log/.test(body.textContent) && !!document.getElementById('tv-history');
 // collapsed by default; the header click opens and closes it
 const histBox = document.getElementById('tv-history');
 r.histCollapsed = histBox.hidden === true;
 const histHead = document.querySelector('.hist-toggle');
 toggleHistoryPanel(histHead);                 // JSDOM outside-only mode doesn't run inline onclick
 r.histOpens = histBox.hidden === false && document.querySelector('.hist-chev').textContent === '▾';
 toggleHistoryPanel(histHead);
 r.histRecloses = histBox.hidden === true;
 toggleHistoryPanel(histHead);                 // leave open for the content checks below
 // the composer grew into a textarea
 r.composerTextarea = !!document.querySelector('textarea#rv-comment');
 r.histType = S._histType==='request' && S._histEntity==='r1';
 r.editShown = /edited a comment/.test(body.textContent) && /“test” → “test v2”/.test(document.getElementById('tv-history').textContent);
 r.removeShown = /removed a comment/.test(body.textContent) && /old note/.test(body.textContent);
 r.statusShown = /moved this ticket to/.test(body.textContent) && /In Review/.test(body.textContent);
 r.taskRowsExcluded = !/must not appear/.test(body.textContent);

 // B. removing a comment from the ticket refreshes the ticket's history, not a task's
 window.__calls.length=0;
 await deleteComment('c1');                   // JSDOM outside-only mode doesn't run inline onclick
 const hq = window.__calls.find(c=>c.table==='activity_log');
 r.refreshScoped = hq && hq.eq.entity_type==='request' && hq.eq.entity_id==='r1';

 // C. histLine wording holds on its own
 r.lineEdit = histLine({action:'comment_edited',detail:{was:'a',excerpt:'b'}})==='edited a comment — “a” → “b”';
 r.lineEditNoWas = /now “b”/.test(histLine({action:'comment_edited',detail:{excerpt:'b'}}));
 r.lineStatus = histLine({action:'updated',detail:{status:'done'}})==='moved this ticket to <b>Done</b>';
 closeModals();

 // D. the task drawer still scopes to tasks
 S._histType='task'; S._histEntity='t9';
 document.body.insertAdjacentHTML('beforeend','<div id="tv-history"></div>');
 window.__calls.length=0;
 await refreshTaskHistory();
 const tq = window.__calls.find(c=>c.table==='activity_log');
 r.taskScope = tq && tq.eq.entity_type==='task' && tq.eq.entity_id==='t9';
}catch(e){r.error=e.message+' | '+(e.stack||'').split('\n').slice(0,4).join(' / ');}return r;};`;
try{w.eval(scripts.join('\n')+'\n'+driver);}catch(e){console.log('EVAL ERROR:',e.message);}
(async()=>{try{console.log(JSON.stringify(await w.eval('window.__run()'),null,2));}catch(e){console.log('RUN ERROR:',e.message);}process.exit(0);})();
