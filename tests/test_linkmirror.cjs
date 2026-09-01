const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html.replace(/<script src=[^>]+><\/script>/g,''),{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window; w.__calls=[]; w.__sel={};
w.eval(`
window.scrollTo=()=>{};
window.__failNext=null;
window.__mkQuery=(t)=>{const q={_t:t,_op:'select',_p:null,_eq:{},_in:null,_single:false,
 update(p){q._op='update';q._p=p;return q;}, insert(p){q._op='insert';q._p=p;return q;},
 upsert(p){q._op='upsert';q._p=p;return q;},
 delete(){q._op='delete';return q;}, select(){return q;}, single(){q._single=true;return q;},
 eq(c,v){q._eq[c]=v;return q;}, neq(){return q;}, not(){return q;}, is(){return q;}, or(){return q;},
 lt(){return q;}, gte(){return q;}, lte(){return q;}, in(c,v){q._in={c:c,v:v};return q;}, order(){return q;}, limit(){return q;},
 then(r,j){window.__calls.push({table:t,op:q._op,payload:q._p,eq:{...q._eq},inq:q._in,single:q._single});
  if(window.__failNext && window.__failNext.table===t && window.__failNext.op===q._op){
    const msg=window.__failNext.msg; window.__failNext=null;
    return Promise.resolve({data:null,count:0,error:{message:msg}}).then(r,j);}
  let data = window.__sel[t]||[];
  if(q._op==='select'){
    Object.entries(q._eq).forEach(([k,v])=>{ data=data.filter(x=>x[k]===v); });
    if(q._in) data=data.filter(x=>(q._in.v||[]).includes(x[q._in.c]));
  }
  if(q._op==='insert') data=(Array.isArray(q._p)?q._p:[q._p]).map((x,i)=>({...x,id:'nw'+i}));
  if(q._op==='update') data = data.filter(x=>x.id===q._eq.id).map(x=>({...x,...q._p}));
  if(q._single) data = Array.isArray(data)? (data[0]||null) : data;
  return Promise.resolve({data,count:0,error:null}).then(r,j);}};return q;};
window.supabase={createClient:()=>({from:window.__mkQuery,
 auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{}}})},
 storage:{from:()=>({})},functions:{},
 rpc:(name,args)=>{window.__calls.push({rpc:name,args:args});return Promise.resolve({data:null,error:null});}})};`);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const driver=String.raw`window.__run=async function(){const r={};try{
 Object.assign(S,{me:{id:'me',role:'admin',full_name:'April',company_id:'co1'},route:{view:'project',id:'p1'},
  workspaces:[{id:'w1',name:'CS',color:'#111'}],
  projects:[{id:'p1',workspace_id:'w1',name:'Creative Queue',status:'active',color:'#08e',visibility:'collaborate'},
            {id:'p2',workspace_id:'w1',name:'BD Pipeline',status:'active',color:'#0a4',visibility:'collaborate'}],
  profiles:[{id:'me',full_name:'April Niramol',role:'admin',active:true,avatar_color:'#0F766E',email:'april@example.test'},
   {id:'u2',full_name:'Prim Vora',role:'internal',active:true,avatar_color:'#0984E3',email:'prim@example.test'}],
  _groups:[], _deps:[], _subs:{},
  _fields:[
   {id:'fL',label:'Deal',ftype:'link',options:{project_id:'p2'}},
   {id:'fM',label:'Deal status',ftype:'mirror',options:{via:'fL',show:'status'}},
   {id:'fMu',label:'Deal note',ftype:'mirror',options:{via:'fL',show:'rf1'}},
  ]});
 renderProject=()=>{}; refreshCore=async()=>{}; renderSidebar=()=>{};
 const t1={id:'t1',project_id:'p1',title:'Banner set',status:'todo',priority:'normal',assignee_id:null,due_date:null,group_id:null,position:1,created_at:'2026-08-20T00:00:00Z',custom:{fL:'lt1'}};
 const t2={id:'t2',project_id:'p1',title:'Copy deck',status:'todo',priority:'normal',assignee_id:null,due_date:null,group_id:null,position:2,created_at:'2026-08-21T00:00:00Z',custom:{}};
 const t3={id:'t3',project_id:'p1',title:'Broken row',status:'todo',priority:'normal',assignee_id:null,due_date:null,group_id:null,position:3,created_at:'2026-08-22T00:00:00Z',custom:{fL:'ltGone'}};
 S._tasks=[t1,t2,t3]; S._tasksAll=[t1,t2,t3]; S._lastRowSet=[t1,t2,t3];
 const fL=S._fields[0], fM=S._fields[1], fMu=S._fields[2];

 // A. loadLinkedData: skips when no link fields; one .in() query per table otherwise
 window.__calls.length=0;
 await loadLinkedData(S._tasksAll, [{id:'x',ftype:'text',options:[]}]);
 r.loadSkipsNoLink = window.__calls.length===0 && Object.keys(S._linkedTasks).length===0;
 window.__sel.tasks=[
  {id:'lt1',title:'Acme deal negotiation Q3 renewal',status:'in_progress',priority:'high',assignee_id:'u2',due_date:'2026-09-05',group_id:null,project_id:'p2',custom:{rf1:'Note text'}},
  {id:'ltOther',title:'Unrelated',status:'todo',priority:'low',assignee_id:null,due_date:null,group_id:null,project_id:'p9',custom:{}}];
 window.__sel.project_fields=[
  {id:'rf1',label:'Note',ftype:'text',options:[],project_id:'p2'},
  {id:'rfX',label:'Elsewhere',ftype:'text',options:[],project_id:'p9'}];
 window.__calls.length=0;
 await loadLinkedData(S._tasksAll, S._fields);
 const tq=window.__calls.find(c=>c.table==='tasks'&&c.op==='select');
 const fq=window.__calls.find(c=>c.table==='project_fields'&&c.op==='select');
 r.loadOneTaskQuery = !!tq && tq.inq && tq.inq.c==='id' && tq.inq.v.includes('lt1') && tq.inq.v.includes('ltGone')
   && window.__calls.filter(c=>c.table==='tasks').length===1;
 r.loadFieldsQuery = !!fq && fq.inq && fq.inq.c==='project_id' && fq.inq.v.length===1 && fq.inq.v[0]==='p2';
 r.loadCaches = S._linkedTasks.lt1 && !S._linkedTasks.ltOther && S._linkedFields.rf1 && !S._linkedFields.rfX;

 // B. tvCell rendering
 const linkHtml = tvCell(t1, fL);
 r.linkChip = /tv-linkchip/.test(linkHtml) && linkHtml.includes("location.hash='#/task/lt1'")
   && linkHtml.includes('event.stopPropagation()')
   && linkHtml.includes('Acme deal negotiation Q3…') && !linkHtml.includes('Q3 renewal</span>');
 r.linkCellOpensPicker = linkHtml.includes("tvLinkPick(this,'t1','fL')");
 r.linkEmptyDash = /tv-empty/.test(tvCell(t2, fL)) && !/tv-linkchip/.test(tvCell(t2, fL));
 r.linkBrokenDash = /tv-empty/.test(tvCell(t3, fL)) && !/tv-linkchip/.test(tvCell(t3, fL));
 const mirHtml = tvCell(t1, fM);
 r.mirrorStatusChip = mirHtml.includes('In Progress') && /tv-mirror/.test(mirHtml) && !/tvEdit|tvLinkPick/.test(mirHtml);
 r.mirrorUuidText = tvCell(t1, fMu).includes('Note text');
 r.mirrorBrokenDash = /tv-empty/.test(tvCell(t3, fM)) && /tv-empty/.test(tvCell(t2, fM));

 // C. export: link -> linked task title, mirror -> resolved display text
 let dl=null; window.downloadXLSX=(fn,rows)=>{ dl={fn:fn,rows:rows}; };
 exportBoardCSV('p1');
 const head=dl.rows[0];
 r.expHeader = head.join('|')==='Task|Group|Status|Priority|Assignee|Due date|Deal|Deal status|Deal note|Created';
 const iL=head.indexOf('Deal'), iM=head.indexOf('Deal status'), iU=head.indexOf('Deal note');
 r.expLinkTitle = dl.rows[1][iL]==='Acme deal negotiation Q3 renewal' && dl.rows[2][iL]==='' && dl.rows[3][iL]==='';
 r.expMirror = dl.rows[1][iM]==='In Progress' && dl.rows[1][iU]==='Note text' && dl.rows[3][iM]==='';

 // D. import mapping skips link + mirror with a warning
 const mi = mapImportRows([['Task','Deal','Deal status','Deal note'],['New row','whatever','In Progress','x']],'p1');
 r.impSkipsLinkMirror = mi.tasks.length===1 && !('fL' in mi.tasks[0].custom) && !('fM' in mi.tasks[0].custom)
   && !('fMu' in mi.tasks[0].custom) && mi.warnings.some(w=>/Link, Mirror and File/.test(w));

 // E. link picker: target-board list, pick writes custom via the normal update, Clear empties
 const anchor=document.createElement('div'); document.body.appendChild(anchor);
 window.__sel.tasks=[{id:'lt1',title:'Acme deal negotiation Q3 renewal',project_id:'p2',status:'in_progress',priority:'high',assignee_id:'u2',due_date:'2026-09-05',group_id:null,custom:{rf1:'Note text'}},
  {id:'lt2',title:'Beta deal',project_id:'p2',status:'todo',priority:'low',assignee_id:null,due_date:null,group_id:null,custom:{}}];
 window.__calls.length=0;
 await tvLinkPick(anchor,'t1','fL');
 let menu=document.getElementById('tvmenu');
 const pickOpts=[...menu.querySelectorAll('.opt:not(.clear)')];
 r.pickerLists = !!menu && pickOpts.length===2 && !!menu.querySelector('.opt.clear')
   && window.__calls.some(c=>c.table==='tasks'&&c.op==='select'&&c.eq.project_id==='p2');
 window.__calls.length=0;
 await pickOpts.find(o=>o.dataset.v==='lt2').onmousedown({preventDefault:()=>{}});
 const updL=window.__calls.find(c=>c.table==='tasks'&&c.op==='update');
 r.pickWritesCustom = !!updL && updL.eq.id==='t1' && updL.payload.custom && updL.payload.custom.fL==='lt2';
 r.pickCachesRow = (S._linkedTasks.lt2||{}).title==='Beta deal';
 // Clear
 await tvLinkPick(anchor,'t1','fL');
 menu=document.getElementById('tvmenu');
 window.__calls.length=0;
 await menu.querySelector('.opt.clear').onmousedown({preventDefault:()=>{}});
 const updC=window.__calls.find(c=>c.table==='tasks'&&c.op==='update');
 r.clearEmpties = !!updC && updC.eq.id==='t1' && updC.payload.custom && !('fL' in updC.payload.custom);
 t1.custom={fL:'lt1'};   // restore for later checks

 // F. columnModal: new types + save payloads
 columnModal('p1', null);
 let typeSel=document.querySelector('#cf-type');
 const typeVals=[...typeSel.querySelectorAll('option')].map(o=>o.value);
 r.modalTypes = typeVals.includes('link') && typeVals.includes('mirror');
 typeSel.value='link'; typeSel.onchange({target:{value:'link'}});
 r.linkWrapShown = document.querySelector('#cf-link-wrap').style.display==='block';
 const bOpts=[...document.querySelectorAll('#cf-link-board option')].map(o=>o.value);
 r.linkBoardExcludesSelf = !bOpts.includes('p1') && bOpts.includes('p2');
 document.querySelector('#cf-label').value='Deal 2';
 document.querySelector('#cf-link-board').value='p2';
 window.__calls.length=0;
 await document.querySelector('#cf-save').onclick();
 const insL=window.__calls.find(c=>c.table==='project_fields'&&c.op==='insert');
 r.linkSavePayload = !!insL && insL.payload.ftype==='link' && insL.payload.options.project_id==='p2';
 closeModals();
 // mirror
 columnModal('p1', null);
 await new Promise(res=>setTimeout(res,15));   // let the target-field fetch land
 typeSel=document.querySelector('#cf-type');
 typeSel.value='mirror'; typeSel.onchange({target:{value:'mirror'}});
 r.mirrorWrapShown = document.querySelector('#cf-mirror-wrap').style.display==='block';
 const viaVals=[...document.querySelectorAll('#cf-mirror-via option')].map(o=>o.value);
 const showVals=[...document.querySelectorAll('#cf-mirror-show option')].map(o=>o.value);
 r.mirrorViaListsLinks = viaVals.includes('fL');
 r.mirrorShowOpts = ['status','priority','assignee','due_date'].every(v=>showVals.includes(v)) && showVals.includes('rf1');
 document.querySelector('#cf-label').value='Deal stage';
 document.querySelector('#cf-mirror-via').value='fL';
 document.querySelector('#cf-mirror-show').value='status';
 window.__calls.length=0;
 await document.querySelector('#cf-save').onclick();
 const insM=window.__calls.find(c=>c.table==='project_fields'&&c.op==='insert');
 r.mirrorSavePayload = !!insM && insM.payload.ftype==='mirror'
   && insM.payload.options.via==='fL' && insM.payload.options.show==='status';
 closeModals();
 // hint when the board has no link column yet
 const savedFields=S._fields; S._fields=[{id:'ft',label:'Plain',ftype:'text',options:[]}];
 columnModal('p1', null);
 r.mirrorHintNoLink = /Link to board/.test(document.querySelector('#cf-mirror-wrap').textContent)
   && !document.querySelector('#cf-mirror-via');
 closeModals(); S._fields=savedFields;

 // G. status/priority popover: dots, current marked, same update, revert on error
 tvBuildOpts(S._fields);
 const cell=document.createElement('div');
 cell.dataset.kind='status'; cell.dataset.tid='t1'; cell.dataset.field='status'; cell.dataset.cust='0';
 document.body.appendChild(cell);
 tvEdit(cell,{});
 menu=document.getElementById('tvmenu');
 let sOpts=[...menu.querySelectorAll('.opt')];
 r.statusPopover = sOpts.length===5 && sOpts.every(o=>o.querySelector('.opt-dot')) && !menu.querySelector('.opt.clear');
 r.statusDotColors = sOpts[4].innerHTML.includes('#12915E') && sOpts[0].innerHTML.includes('#8E93A8');
 r.statusCurrentMarked = !!sOpts[0].querySelector('.opt-cur') && sOpts.filter(o=>o.querySelector('.opt-cur')).length===1;
 window.__calls.length=0;
 await sOpts[4].onmousedown({preventDefault:()=>{}});
 const updS=window.__calls.find(c=>c.table==='tasks'&&c.op==='update');
 r.statusPickUpdates = !!updS && updS.eq.id==='t1' && updS.payload.status==='done' && t1.status==='done';
 // optimistic revert on a DB error, same as before
 window.__failNext={table:'tasks',op:'update',msg:'blocked by sign-off'};
 const toasts=[]; const _t=toast; toast=(m,e)=>{toasts.push({m,e});};
 tvEdit(cell,{});
 await [...document.getElementById('tvmenu').querySelectorAll('.opt')][0].onmousedown({preventDefault:()=>{}});
 toast=_t;
 r.statusRevertOnError = t1.status==='done' && toasts.some(x=>/sign-off/.test(x.m)&&x.e===true);
 // priority popover
 const pcell=document.createElement('div');
 pcell.dataset.kind='priority'; pcell.dataset.tid='t1'; pcell.dataset.field='priority'; pcell.dataset.cust='0';
 document.body.appendChild(pcell);
 tvEdit(pcell,{});
 const pOpts=[...document.getElementById('tvmenu').querySelectorAll('.opt')];
 r.prioPopover = pOpts.length===4 && pOpts.every(o=>o.querySelector('.opt-dot'));
 tvCloseMenu();
 // requester gets no popover at all — the cell is read-only
 S.me.role='requester';
 const roCell = tvPickHTML('status','t1','status',false,'todo');
 r.requesterNoPopover = /\bro\b/.test(roCell) && !/tvEdit/.test(roCell);
 S.me.role='admin';

 // I. two-way mirror: editing the mirror updates the LINKED task
 S._linkedTasks={lt1:{id:'lt1',title:'Acme deal',status:'in_progress',priority:'high',assignee_id:'u2',due_date:'2026-09-05',project_id:'p2',custom:{rf1:'Note text'}}};
 S._linkedFields={rf1:{id:'rf1',label:'Note',ftype:'text',options:[]},
                  rf2:{id:'rf2',label:'Stage',ftype:'select',options:['Lead','Signed']},
                  rf3:{id:'rf3',label:'Calc',ftype:'formula',options:{expr:'1'}}};
 // editable mirror cell is clickable; broken link stays read-only
 r.twMirrorClickable = /tvMirrorEdit/.test(tvMirrorCell(t1, fM));
 r.twBrokenReadonly = !/tvMirrorEdit/.test(tvMirrorCell(t3, fM));
 // formula mirror stays read-only
 r.twFormulaReadonly = !/tvMirrorEdit/.test(tvMirrorCell(t1, {id:'fMf',ftype:'mirror',options:{via:'fL',show:'rf3'}}));
 // status edit writes to the REMOTE task id
 const mAnchor=document.createElement('div'); document.body.appendChild(mAnchor);
 window.__calls.length=0;
 await tvMirrorEdit(mAnchor,'t1','fM');
 const mOpts=[...document.getElementById('tvmenu').querySelectorAll('.opt')];
 r.twStatusMenu = mOpts.length===5 && mOpts.some(o=>o.querySelector('.opt-cur'));
 await mOpts.find(o=>o.dataset.v==='done').onmousedown({preventDefault:()=>{}});
 const ru = window.__calls.find(c=>c.table==='tasks'&&c.op==='update');
 r.twStatusRemote = ru && ru.eq.id==='lt1' && ru.payload.status==='done' && S._linkedTasks.lt1.status==='done';
 // remote select field: options come from the remote board's column, saved into remote custom
 const fSel={id:'fSel',label:'Deal stage',ftype:'mirror',options:{via:'fL',show:'rf2'}};
 S._fields.push(fSel);
 window.__calls.length=0;
 await tvMirrorEdit(mAnchor,'t1','fSel');
 const selOpts=[...document.getElementById('tvmenu').querySelectorAll('.opt:not(.clear)')];
 r.twRemoteSelectOpts = selOpts.map(o=>o.dataset.v).join('|')==='Lead|Signed';
 await selOpts[1].onmousedown({preventDefault:()=>{}});
 const ru2 = window.__calls.find(c=>c.table==='tasks'&&c.op==='update');
 r.twRemoteSelectSave = ru2 && ru2.eq.id==='lt1' && ru2.payload.custom.rf2==='Signed' && ru2.payload.custom.rf1==='Note text';
 // text mirror opens the one-field editor and saves into remote custom
 window.__calls.length=0;
 await tvMirrorEdit(mAnchor,'t1','fMu');
 const miEl=document.getElementById('mi-val');
 r.twTextEditor = !!miEl && miEl.value==='Note text';
 miEl.value='Updated note';
 document.getElementById('mi-save').onclick();
 await new Promise(x=>setTimeout(x,30));
 const ru3 = window.__calls.find(c=>c.table==='tasks'&&c.op==='update');
 r.twTextSave = ru3 && ru3.eq.id==='lt1' && ru3.payload.custom.rf1==='Updated note';
 // requester: mirror never clickable
 S.me.role='requester';
 r.twRequesterReadonly = !/tvMirrorEdit/.test(tvMirrorCell(t1, fM));
 S.me.role='admin';
}catch(e){r.error=e.message+' | '+(e.stack||'').split('\n').slice(0,4).join(' / ');}return r;};`;
try{w.eval(scripts.join('\n')+'\n'+driver);}catch(e){console.log('EVAL ERROR:',e.message);}
(async()=>{try{console.log(JSON.stringify(await w.eval('window.__run()'),null,2));}catch(e){console.log('RUN ERROR:',e.message);}process.exit(0);})();
