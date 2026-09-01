const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html.replace(/<script src=[^>]+><\/script>/g,''),{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window; w.__calls=[]; w.__sel={};
w.eval(`
window.scrollTo=()=>{};
window.__mkQuery=(t)=>{const q={_t:t,_op:'select',_p:null,_eq:{},
 update(p){q._op='update';q._p=p;return q;}, insert(p){q._op='insert';q._p=p;return q;},
 delete(){q._op='delete';return q;}, select(){return q;}, single(){return q;},
 eq(c,v){q._eq[c]=v;return q;}, neq(){return q;}, not(){return q;}, is(){return q;}, or(){return q;}, gte(){return q;}, lte(){return q;}, lt(){return q;}, in(){return q;}, order(){return q;}, limit(){return q;},
 then(r,j){window.__calls.push({table:t,op:q._op,payload:q._p,eq:{...q._eq}});
  let data;
  if(q._op==='insert') data=(Array.isArray(q._p)?q._p:[q._p]).map((x,i)=>({...x,id:'seed'+i}));
  else data = window.__sel[t]||[];
  return Promise.resolve({data,count:(window.__sel[t]||[]).length,error:null}).then(r,j);}};return q;};
window.supabase={createClient:()=>({from:window.__mkQuery,
 auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{}}})},
 storage:{from:()=>({})},functions:{}})};`);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
// JSDOM outside-only mode doesn't run inline onclick — call the function directly
const driver=String.raw`window.__run=async function(){const r={};try{
 Object.assign(S,{me:{id:'me',role:'admin',full_name:'April Niramol'},route:{view:'home'},company:{name:'CREA'},
  profiles:[{id:'me',full_name:'April Niramol',role:'admin',active:true,email:'a@a',avatar_color:'#0F766E'},
            {id:'u2',full_name:'Prim Vora',role:'internal',active:true,email:'p@a',avatar_color:'#3E5C95'}],
  workspaces:[{id:'w1',name:'Creative',color:'#7D3C55',description:''}],
  projects:[{id:'p1',workspace_id:'w1',name:'Creative Queue',status:'active',color:'#08e'}],
  requestTypes:[{id:'rt1',name:'Artwork',sla_hours:24}]});

 // A. csvCell escaping
 r.cellComma   = csvCell('a,b')==='"a,b"';
 r.cellQuote   = csvCell('say "hi"')==='"say ""hi"""';
 r.cellNewline = csvCell('line1\nline2')==='"line1\nline2"';
 r.cellThai    = csvCell('สวัสดีครับ')==='สวัสดีครับ';
 r.cellNumber  = csvCell(42)==='42';
 r.cellSpace   = csvCell(' x')==='" x"';
 r.cellNull    = csvCell(null)==='';

 // B. downloadCSV: BOM + CRLF + csv blob, via stubbed URL/click
 let blobCap=null, urlMade=0, urlRevoked=0, clicks=0;
 const RealBlob=window.Blob;
 window.Blob=function(parts,opts){ blobCap={parts:parts,opts:opts}; return new RealBlob(parts,opts); };
 window.URL.createObjectURL=()=>{ urlMade++; return 'blob:x'; };
 window.URL.revokeObjectURL=()=>{ urlRevoked++; };
 window.HTMLAnchorElement.prototype.click=function(){ clicks++; };
 downloadCSV('t.csv', [['a','b'],['c,d','e']]);
 const s = blobCap.parts[0];
 r.dlBOM  = s.charCodeAt(0)===0xFEFF;
 r.dlCRLF = s.slice(1)==='a,b\r\n"c,d",e';
 r.dlType = /text\/csv/.test(blobCap.opts.type);
 r.dlLifecycle = clicks===1 && urlMade===1 && urlRevoked===1;

 // from here on, capture instead of downloading
 let dl=null;
 window.downloadCSV=(fn,rows)=>{ dl={fn:fn,rows:rows}; };

 // C. board export
 S._groups=[{id:'g1',name:'Case Open',color:'#123'}];
 S._fields=[
  {id:'f1',label:'Qty',ftype:'number',options:[]},
  {id:'f2',label:'Stage',ftype:'select',options:['A','B']},
  {id:'f3',label:'Approved',ftype:'checkbox',options:[]},
  {id:'f4',label:'Total',ftype:'formula',options:{expr:'{Qty} * 2'}},
  {id:'f5',label:'Bad',ftype:'formula',options:{expr:'{Nope}'}},
 ];
 const t1={id:'t1',project_id:'p1',title:'Banner set',status:'in_progress',priority:'urgent',assignee_id:'u2',
           due_date:'2026-09-05',group_id:'g1',position:1,created_at:'2026-08-20T00:00:00Z',custom:{f1:'12',f2:'A',f3:true}};
 const t2={id:'t2',project_id:'p1',title:'Copy deck',status:'todo',priority:'normal',assignee_id:null,
           due_date:null,group_id:null,position:2,created_at:'2026-08-21T00:00:00Z',custom:{}};
 S._tasks=[t1,t2]; S._lastRowSet=[t1,t2];
 exportBoardCSV('p1');
 const head=dl.rows[0];
 r.boardHeader = head.join('|')==='Task|Group|Status|Priority|Assignee|Due date|Qty|Stage|Approved|Total|Bad|Created';
 r.boardFile = /^Creative Queue - \d{4}-\d{2}-\d{2}\.csv$/.test(dl.fn);
 const row1=dl.rows[1], row2=dl.rows[2];
 r.boardStatusLabel = row1[2]==='In Progress' && row2[2]==='To Do';
 r.boardPrioLabel = row1[3]==='Urgent';
 r.boardAssigneeName = row1[4]==='Prim Vora' && row2[4]==='';
 r.boardGroupName = row1[1]==='Case Open' && row2[1]==='';
 r.boardFormula = row1[head.indexOf('Total')]==='24';
 r.boardFormulaErrEmpty = row1[head.indexOf('Bad')]==='';
 r.boardCheckbox = row1[head.indexOf('Approved')]==='Yes' && row2[head.indexOf('Approved')]==='No';
 r.boardSelectRaw = row1[head.indexOf('Stage')]==='A';
 r.boardCreated = row1[head.length-1]==='2026-08-20';
 // filtered rowSet respected: 1 visible row -> 1 data row
 S._lastRowSet=[t2];
 exportBoardCSV('p1');
 r.boardFilteredRows = dl.rows.length===2 && dl.rows[1][0]==='Copy deck';
 S._lastRowSet=[t1,t2];

 // D. staff gating + placement on the filter bar (buttons live at the end, after the count)
 const bar = filterBarHTML('p1');
 r.barExportStaff = /Export Excel/.test(bar) && /Import Excel/.test(bar);
 r.barButtonsAtEnd = bar.indexOf('bf-count') < bar.indexOf('Import Excel')
   && bar.indexOf('Import Excel') < bar.indexOf('Export Excel')
   && bar.indexOf('Export Excel') < bar.indexOf('Activity');
 S.me.role='requester';
 r.barExportRequesterHidden = !/Export Excel/.test(filterBarHTML('p1')) && !/Import Excel/.test(filterBarHTML('p1'));
 S.me.role='admin';

 // D2. Excel import: header mapping, labels -> keys, names -> ids, dates, checkboxes
 const aoa = [
  ['ignore me'],
  ['Task','Group','Status','Priority','Assignee','Due date','Qty','Approved','Total','Mystery'],
  ['Imported one','Case Open','In Progress','Urgent','Prim Vora', new Date('2026-09-03T00:00:00Z'),'7','Yes','x','?'],
  ['Imported two','No such group','done','high','Nobody Real','2026-09-04','','no','',''],
  ['', '', '', '', '', '', '', '', '', ''],
 ];
 const mi = mapImportRows(aoa,'p1');
 r.impCount = mi.tasks.length===2 && mi.skipped===1;
 const m1=mi.tasks[0], m2=mi.tasks[1];
 r.impStatus = m1.status==='in_progress' && m2.status==='done';
 r.impPrio = m1.priority==='urgent' && m2.priority==='high';
 r.impAssignee = m1.assignee_id==='u2' && m2.assignee_id===null;
 r.impGroup = m1.group_id==='g1' && m2.group_id===null;
 r.impDates = m1.due_date==='2026-09-03' && m2.due_date==='2026-09-04';
 r.impCustom = m1.custom.f1==='7' && m1.custom.f3===true && m2.custom.f3===false;
 r.impFormulaSkipped = !('f4' in m1.custom) && mi.warnings.some(w=>/Formula/.test(w));
 r.impUnknownWarn = mi.warnings.some(w=>/Mystery/.test(w));
 r.impMissWarn = mi.warnings.some(w=>/didn't match/.test(w));
 r.impNoHeader = mapImportRows([['a','b'],['c','d']],'p1').tasks.length===0;
 // preview -> insert stamps board, creator and appended positions
 renderProject=()=>{};
 importPreviewModal('p1', mi);
 r.impPreview = /2 tasks ready/.test(document.querySelector('.modal-body').textContent)
   && /Imported one/.test(document.querySelector('.modal-body').textContent);
 window.__calls.length=0;
 await doImportExcel();
 const impIns = window.__calls.find(c=>c.table==='tasks'&&c.op==='insert');
 r.impInsert = impIns && impIns.payload.length===2
   && impIns.payload.every(t=>t.project_id==='p1' && t.created_by==='me')
   && impIns.payload[0].position===3 && impIns.payload[1].position===4;   // after t1(pos1), t2(pos2)
 closeModals();

 // E. requests queue export
 window.__sel['requests']=[
  {id:'r1',ticket_no:101,title:'Artwork for sale',request_type_id:'rt1',status:'pending_info',priority:'high',
   submitted_by:'me',assigned_to:'u2',created_at:'2026-08-25T10:00:00Z',sla_due_at:'2026-08-26T10:00:00Z',sla_paused_at:'2026-08-25T12:00:00Z'},
  {id:'r2',ticket_no:102,title:'Guest request',request_type_id:'rt1',status:'submitted',priority:'normal',
   submitted_by:null,guest_name:'Khun Bee',guest_email:'b@x',assigned_to:null,created_at:'2026-08-26T10:00:00Z',sla_due_at:null},
 ];
 reqTab='all';
 await renderRequests();
 r.reqExportBtn = /Export Excel/.test(document.querySelector('.page-head').innerHTML);
 exportRequestsCSV();
 r.reqHeader = dl.rows[0].join('|')==='WO|Title|Type|Status|Priority|Submitted by|Assigned to|Created|SLA due|Paused';
 r.reqWO = dl.rows[1][0]==='WO-101';
 r.reqType = dl.rows[1][2]==='Artwork';
 r.reqStatusLabel = dl.rows[1][3]==='Pending Information';
 r.reqPrioLabel = dl.rows[1][4]==='High';
 r.reqSubmitter = dl.rows[1][5]==='April Niramol' && dl.rows[2][5]==='Khun Bee';
 r.reqAssignee = dl.rows[1][6]==='Prim Vora';
 r.reqPaused = dl.rows[1][9]==='Yes' && dl.rows[2][9]==='No';
 S.me.role='requester';
 await renderRequests();
 r.reqExportRequesterHidden = !/Export Excel/.test(document.querySelector('.page-head').innerHTML);
 S.me.role='admin';

 // F. widget + report export
 S._widgets=[{id:'wg1',wtype:'donut',title:'Tasks by status',config:{entity:'tasks',groupBy:'status'},position:0}];
 S._dashCtx={tasks:[{status:'todo'},{status:'todo'},{status:'done'}],open:[],requests:[]};
 exportWidgetCSV('wg1');
 r.widgetHeader = dl.rows[0].join('|')==='Label|Count';
 r.widgetRows = dl.rows.slice(1).map(x=>x.join(':')).join('|')==='To Do:2|Done:1';
 r.widgetFile = /^Tasks by status - \d{4}-\d{2}-\d{2}\.csv$/.test(dl.fn);
 S._reportStats=[['Open tasks',3],['Overdue',1]]; S._reportName='Creative report';
 exportReportCSV();
 r.reportStacked = dl.rows[0].join('|')==='Label|Value' && dl.rows[1].join('|')==='Open tasks|3'
   && dl.rows[3].length===0 && dl.rows[4][0]==='Tasks by status' && dl.rows[5].join('|')==='Label|Count'
   && dl.rows[6].join('|')==='To Do|2';
 r.widgetCsvStaff = /exportWidgetCSV/.test(widgetCard(S._widgets[0]));
 S.me.role='requester';
 r.widgetCsvRequesterHidden = !/exportWidgetCSV/.test(widgetCard(S._widgets[0]));
 S.me.role='admin';

 // G. role-tiered home: admin/management land with the company pulse; others don't
 window.__sel['tasks']=[
  {id:'h1',project_id:'p1',title:'Soon task',status:'in_progress',priority:'high',assignee_id:'me',due_date:'2020-01-01',created_at:'2026-08-01'},
  {id:'h2',project_id:'p1',title:'Later task',status:'todo',priority:'normal',assignee_id:'me',due_date:'2026-09-10',created_at:'2026-08-01'},
 ];
 window.__sel['requests']=[]; window.__sel['approvals']=[];
 S.me.role='admin';
 await renderHome();
 let c=document.querySelector('#content');
 r.homeAdminPulse = c.innerHTML.includes('Company pulse') && c.innerHTML.includes('Open tickets')
   && c.innerHTML.includes('Open dashboard') && c.innerHTML.includes('SLA breached');
 r.homeAdminKeepsPersonal = c.innerHTML.includes('My tasks') && c.innerHTML.includes('Soon task');
 S.me.role='management';
 await renderHome();
 r.homeMgmtPulse = document.querySelector('#content').innerHTML.includes('Company pulse');
 S.me.role='internal';
 await renderHome();
 c=document.querySelector('#content');
 r.homeInternalNoPulse = !c.innerHTML.includes('Company pulse');
 r.homeInternalKeepsPersonal = c.innerHTML.includes('My tasks') && c.innerHTML.includes('Soon task');
 S.me.role='requester';
 await renderHome();
 r.homeRequesterNoPulse = !document.querySelector('#content').innerHTML.includes('Company pulse');
 // overdue due-badges in Home tables now read red (the .tbl .due.over rule)
 r.homeOverdueRed = /due over/.test(document.querySelector('#content').innerHTML);
 S.me.role='admin';
}catch(e){r.error=e.message+' | '+(e.stack||'').split('\n').slice(0,4).join(' / ');}return r;};`;
try{w.eval(scripts.join('\n')+'\n'+driver);}catch(e){console.log('EVAL ERROR:',e.message);}
(async()=>{try{console.log(JSON.stringify(await w.eval('window.__run()'),null,2));}catch(e){console.log('RUN ERROR:',e.message);}process.exit(0);})();
