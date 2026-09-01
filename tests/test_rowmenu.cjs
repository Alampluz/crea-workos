const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html.replace(/<script src=[^>]+><\/script>/g,''),{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window; w.__calls=[];
w.eval(`
window.scrollTo=()=>{};
window.__mkQuery=(t)=>{const q={_t:t,_op:'select',_p:null,_eq:{},
 update(p){q._op='update';q._p=p;return q;}, insert(p){q._op='insert';q._p=p;return q;},
 delete(){q._op='delete';return q;}, select(){return q;}, single(){return q;},
 eq(c,v){q._eq[c]=v;return q;}, in(){return q;}, order(){return q;}, limit(){return q;},
 then(r,j){window.__calls.push({table:t,op:q._op,payload:q._p,eq:{...q._eq}});
  const data = q._op==='insert' ? Object.assign({id:'dup1'},Array.isArray(q._p)?q._p[0]:q._p) : [];
  return Promise.resolve({data,error:null}).then(r,j);}};return q;};
window.supabase={createClient:()=>({from:window.__mkQuery,
 auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{}}})},
 storage:{from:()=>({})},functions:{}})};`);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const driver=`window.__run=async function(){const r={};try{
 Object.assign(S,{me:{id:'me',role:'admin',full_name:'April'},route:{view:'project',id:'p1'},
  workspaces:[{id:'w1',name:'W',color:'#0F766E'}],
  projects:[{id:'p1',workspace_id:'w1',name:'CS Inquiries',status:'active',color:'#08e'},
            {id:'p2',workspace_id:'w1',name:'Escalations',status:'active',color:'#e80'}],
  profiles:[{id:'me',full_name:'April',role:'admin',active:true,avatar_color:'#0F766E'}],
  _groups:[{id:'g1',name:'Case Open',color:'#2273C9',position:0},{id:'g2',name:'Solved',color:'#12915E',position:1}],
  _fields:[], _subs:{},
  _tasksAll:[{id:'t1',project_id:'p1',title:'Ticket A',status:'todo',priority:'normal',group_id:'g1',custom:{},position:3},
             {id:'t2',project_id:'p1',title:'Ticket B',status:'todo',priority:'normal',group_id:'g1',custom:{},position:1}]});
 S._tasks=S._tasksAll.slice();
 document.getElementById('content').innerHTML='<div id="board-body"></div>';
 boardMode='table'; renderBoardBody('p1');
 r.dotsRendered = document.querySelectorAll('.tv-dots').length;      // 2
 const a=document.querySelector('.tv-dots');
 rowMenu(a,'t1');
 r.adminMenu=[...document.querySelectorAll('#tvmenu .opt')].map(o=>o.textContent.trim());
 document.getElementById('tvmenu').remove();
 // move to top: position must go below the current minimum
 window.__calls.length=0;
 await taskMoveTop('t1');
 const up=window.__calls.find(c=>c.table==='tasks'&&c.op==='update');
 r.topPos = up && up.payload.position;                               // 0 (min(0,1)-1 = -1? peers pos 1 -> min(0,1)=0-1=-1) 
 // duplicate copies fields
 window.__calls.length=0;
 await taskDuplicate('t2');
 const ins=window.__calls.find(c=>c.table==='tasks'&&c.op==='insert');
 r.dupTitle = ins && ins.payload.title;
 r.dupKeepsGroup = ins && ins.payload.group_id==='g1';
 // move to board clears the group and removes it locally
 window.__calls.length=0;
 const a2=document.createElement('span'); document.body.appendChild(a2);
 taskMoveBoard(a2,'t1');
 const opts=[...document.querySelectorAll('#tvmenu .opt')].map(o=>o.textContent.trim());
 r.boardChoices = opts;
 const pick=[...document.querySelectorAll('#tvmenu .opt')].find(o=>/Escalations/.test(o.textContent));
 pick.dispatchEvent(new window.MouseEvent('mousedown',{bubbles:true,cancelable:true}));
 await new Promise(x=>setTimeout(x,80));
 const mv=window.__calls.find(c=>c.table==='tasks'&&c.op==='update');
 r.movedToBoard = mv && mv.payload.project_id==='p2' && mv.payload.group_id===null;
 r.removedLocally = !S._tasksAll.some(t=>t.id==='t1');
 // requester sees only open + copy link
 S.me={id:'u9',role:'requester',full_name:'R'};
 rowMenu(a,'t2');
 r.requesterMenu=[...document.querySelectorAll('#tvmenu .opt')].map(o=>o.textContent.trim());
 document.getElementById('tvmenu')?.remove();
}catch(e){r.error=e.message+' | '+(e.stack||'').split('\\n').slice(0,4).join(' / ');}return r;};`;
try{w.eval(scripts.join('\n')+'\n'+driver);}catch(e){console.log('EVAL ERROR:',e.message);}
(async()=>{try{console.log(JSON.stringify(await w.eval('window.__run()'),null,2));}catch(e){console.log('RUN ERROR:',e.message);}process.exit(0);})();
