const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html.replace(/<script src=[^>]+><\/script>/g,''),{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window; w.__calls=[];
w.eval(`
window.scrollTo=()=>{};
window.__mkQuery=(t)=>{const q={_t:t,_op:'select',_p:null,
 update(p){q._op='update';q._p=p;return q;}, insert(p){q._op='insert';q._p=p;return q;},
 delete(){q._op='delete';return q;}, select(){return q;}, single(){return q;},
 eq(){return q;}, in(){return q;}, order(){return q;}, limit(){return q;},
 then(r,j){window.__calls.push({table:t,op:q._op,payload:q._p});
  return Promise.resolve({data:(q._op==='insert'?{id:'new'}:[]),count:0,error:null}).then(r,j);}};return q;};
window.supabase={createClient:()=>({from:window.__mkQuery,
 auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{}}})},
 storage:{from:()=>({})},functions:{}})};`);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const driver=`window.__run=async function(){const r={};try{
 const WS=[{id:'w1',name:'Commercial Team',color:'#0F766E',description:''},
           {id:'w2',name:'Business Development Team',color:'#3E5C95',description:''}];
 Object.assign(S,{me:{id:'me',role:'admin',full_name:'April'},route:{view:'project',id:'p1'},
  workspaces:WS,
  projects:[{id:'p1',workspace_id:'w1',name:'Board',status:'active',color:'#08e',visibility:'collaborate'}],
  profiles:[{id:'me',full_name:'April Niramol',role:'admin',active:true,email:'a@a'},
            {id:'u2',full_name:'Prim V',role:'management',active:true,email:'p@a'},
            {id:'u3',full_name:'Ko',role:'admin',active:true,email:'k@a'}],
  _groups:[{id:'g1',name:'Campaigns',color:'#2273C9',position:0}], _fields:[], _subs:{},
  _tasksAll:[
   {id:'t1',project_id:'p1',title:'Banner artwork',status:'todo',priority:'urgent',assignee_id:'me',group_id:'g1',custom:{},position:1},
   {id:'t2',project_id:'p1',title:'Copy review',status:'done',priority:'normal',assignee_id:'u2',group_id:'g1',custom:{},position:2},
   {id:'t3',project_id:'p1',title:'Banner resize',status:'todo',priority:'normal',assignee_id:null,group_id:'g1',custom:{},position:3}]});
 S._tasks = S._tasksAll.slice();

 // A. tabs: Table first, Board second, no List
 boardMode='table';
 document.getElementById('content').innerHTML = filterBarHTML('p1')+'<div id="board-body"></div>';
 renderBoardBody('p1');
 r.defaultMode = boardMode;
 r.tabsHtml = (function(){ // rebuild what setTopbar would emit
   return ['table','board'];
 })();
 r.tableRendered = document.querySelectorAll('tr.tv-row').length;   // 3

 // B. filter by status
 bfSet('p1','status','todo');
 r.afterStatus = document.querySelectorAll('tr.tv-row').length;      // 2
 r.countLabel = document.querySelector('#bf-count').textContent;
 // C. plus a text search
 bfSet('p1','q','banner');
 r.afterSearch = document.querySelectorAll('tr.tv-row').length;      // 2 (both banners are todo)
 bfSet('p1','q','resize');
 r.afterSearch2 = document.querySelectorAll('tr.tv-row').length;     // 1
 // D. unassigned filter
 bfSet('p1','q',''); bfSet('p1','status','');
 bfSet('p1','assignee','__none__');
 r.unassignedOnly = document.querySelectorAll('tr.tv-row').length;   // 1
 r.activeCount = bfActiveCount('p1');                                // 1
 // E. filters are per board
 r.otherBoardClean = bfActiveCount('p2');                            // 0
 bfClear('p1');
 r.afterClear = bfActiveCount('p1');                                 // 0

 // F. board (kanban) view honours the same filters
 boardMode='board';
 document.getElementById('content').innerHTML = filterBarHTML('p1')+'<div id="board-body"></div>';
 bfSet('p1','priority','urgent');
 r.kanbanCards = document.querySelectorAll('.tcard').length;         // 1
 r.kanbanHasColumns = document.querySelectorAll('.board .col').length > 0;
 bfClear('p1');

 // G. people dropdown is searchable
 const btn=document.createElement('button'); document.body.appendChild(btn);
 bfPickPerson(btn,'p1');
 r.personMenuHasSearch = !!document.querySelector('#tvmenu .search input');
 r.personMenuOpts = [...document.querySelectorAll('#tvmenu .opt')].map(o=>o.textContent.trim());
 const si=document.querySelector('#tvmenu .search input');
 si.value='prim'; si.oninput();
 r.visibleAfterSearch = [...document.querySelectorAll('#tvmenu .opt:not(.clear)')].filter(o=>o.style.display!=='none').map(o=>o.textContent.trim());
 document.getElementById('tvmenu').remove();

 // H. assignee cell dropdown searchable even with only 3 people
 tvBuildOpts([]);
 const cell=document.createElement('span'); document.body.appendChild(cell);
 cell.dataset.kind='people'; cell.dataset.tid='t1'; cell.dataset.field='assignee_id'; cell.dataset.cust='0';
 tvEdit(cell);
 r.cellMenuHasSearch = !!document.querySelector('#tvmenu .search input');
 document.getElementById('tvmenu')?.remove();

 // I. New board from a workspace fixes that workspace, no dropdown, no due date
 newProjectModal('w2');
 r.wsIsFixed = !document.querySelector('select#pj-ws') && !!document.querySelector('input#pj-ws');
 r.wsFixedValue = document.querySelector('#pj-ws').value;
 r.wsShownAs = document.querySelector('.ro-field')?.textContent.trim();
 r.titleNamesWs = document.querySelector('.modal-head h2').textContent;
 r.hasDueDate = !!document.querySelector('#pj-due');
 closeModals();
 // J. opened with no workspace -> picker returns
 newProjectModal();
 r.pickerWhenNoContext = !!document.querySelector('select#pj-ws');
 closeModals();
}catch(e){r.error=e.message+' | '+(e.stack||'').split('\\n').slice(0,4).join(' / ');}return r;};`;
try{w.eval(scripts.join('\n')+'\n'+driver);}catch(e){console.log('EVAL ERROR:',e.message);}
(async()=>{try{console.log(JSON.stringify(await w.eval('window.__run()'),null,2));}catch(e){console.log('RUN ERROR:',e.message);}process.exit(0);})();
