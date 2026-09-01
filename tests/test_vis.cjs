const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html.replace(/<script src=[^>]+><\/script>/g,''),{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window; w.__calls=[]; w.__sel={};
w.eval(`
window.scrollTo=()=>{}; window.confirm=()=>true;
window.__mkQuery=(t)=>{const q={_t:t,_op:'select',_p:null,_eq:{},
 update(p){q._op='update';q._p=p;return q;}, insert(p){q._op='insert';q._p=p;return q;},
 delete(){q._op='delete';return q;}, select(){return q;}, single(){return q;},
 eq(c,v){q._eq[c]=v;return q;}, in(){return q;}, order(){return q;},
 then(r,j){window.__calls.push({table:t,op:q._op,payload:q._p,eq:{...q._eq}});
  return Promise.resolve({data:(window.__sel[t]||[]),count:3,error:null}).then(r,j);}};return q;};
window.supabase={createClient:()=>({from:window.__mkQuery,
 auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{}}})},
 storage:{from:()=>({})},functions:{}})};`);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const driver=`window.__run=async function(){const r={};try{
 Object.assign(S,{me:{id:'me',role:'admin',full_name:'A'},route:{view:'ws',id:'w1'},
  workspaces:[{id:'w1',name:'Customer Service Team',color:'#0F766E',description:''}],
  projects:[{id:'p1',workspace_id:'w1',name:'Escalations',status:'active',color:'#0984E3',description:'',visibility:'collaborate'},
            {id:'p2',workspace_id:'w1',name:'Guest Board',status:'active',color:'#E17055',description:'',visibility:'shareable'},
            {id:'p3',workspace_id:'w1',name:'Secret',status:'active',color:'#D63031',description:'',visibility:'private'}],
  profiles:[{id:'me',full_name:'A',role:'admin',active:true,email:'a@a'},
            {id:'x1',full_name:'Ext Partner',role:'partner',active:true,email:'p@x.com'}]});
 refreshCore=async()=>{}; renderSidebar=()=>{}; renderWorkspace=async()=>{}; renderProject=async()=>{};

 // A. New board modal: no due date, has visibility picker defaulting to collaborate
 newProjectModal('w1');
 r.newHasDueDate = !!document.querySelector('#pj-due');
 r.newVisOptions = [...document.querySelectorAll('#pj-vis .vis-opt')].map(o=>o.dataset.v);
 r.newVisDefault = document.querySelector('#pj-vis').dataset.sel;
 document.querySelector('#pj-vis .vis-opt[data-v=private]').click();
 r.afterClickPrivate = document.querySelector('#pj-vis').dataset.sel;
 document.querySelector('#pj-name').value='New Board';
 window.__calls.length=0; document.querySelector('#pj-save').click();
 await new Promise(x=>setTimeout(x,60));
 const ins=window.__calls.find(c=>c.table==='projects'&&c.op==='insert');
 r.insertPayload = ins? {visibility:ins.payload.visibility, hasDue:('due_date' in ins.payload)} : null;
 closeModals();

 // B. Edit board modal: no due date, picker reflects current value
 editProjectModal('p3');
 r.editHasDueDate = !!document.querySelector('#ep-due');
 r.editVisSelected = document.querySelector('#ep-vis').dataset.sel;
 document.querySelector('#ep-vis .vis-opt[data-v=shareable]').click();
 window.__calls.length=0; document.querySelector('#ep-save').click();
 await new Promise(x=>setTimeout(x,60));
 const up=window.__calls.find(c=>c.table==='projects'&&c.op==='update');
 r.editPayload = up? {visibility:up.payload.visibility, hasDue:('due_date' in up.payload)} : null;
 closeModals();

 // C. narrowing away from shareable warns about stranded guests
 window.__sel['project_members']=[{user_id:'x1'}];
 editProjectModal('p2');
 document.querySelector('#ep-vis .vis-opt[data-v=private]').click();
 let warned=false; window.confirm=(msg)=>{warned=/Ext Partner/.test(msg)&&/removes their access/.test(msg); return true;};
 document.querySelector('#ep-save').click();
 await new Promise(x=>setTimeout(x,80));
 r.warnedOnNarrowing = warned;
 closeModals(); window.confirm=()=>true;

 // D. Partner access blocked unless Shareable
 window.__sel['project_members']=[];
 await projectMembersModal('p1');   // collaborate
 r.collab_saveDisabled = document.querySelector('#pm-save').disabled;
 r.collab_boxesDisabled = [...document.querySelectorAll('input[data-uid]')].every(i=>i.disabled);
 r.collab_hasMakeShareable = !!document.querySelector('#pm-tovis');
 closeModals();
 await projectMembersModal('p2');   // shareable
 r.share_saveEnabled = !document.querySelector('#pm-save').disabled;
 r.share_boxesEnabled = [...document.querySelectorAll('input[data-uid]')].every(i=>!i.disabled);
 r.share_noNotice = !document.querySelector('#pm-tovis');
 closeModals();

 // E. badges: collaborate is unlabelled, the other two show
 r.chipCollab = visChip('collaborate');
 r.chipPrivate = /Private/.test(visChip('private'));
 r.chipShare = /Shareable/.test(visChip('shareable'));
}catch(e){r.error=e.message+' | '+(e.stack||'').split('\\n').slice(0,4).join(' / ');}return r;};`;
try{w.eval(scripts.join('\n')+'\n'+driver);}catch(e){console.log('EVAL ERROR:',e.message);}
(async()=>{try{console.log(JSON.stringify(await w.eval('window.__run()'),null,2));}catch(e){console.log('RUN ERROR:',e.message);}process.exit(0);})();
