const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html.replace(/<script src=[^>]+><\/script>/g,''),{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window;
w.eval(`window.scrollTo=()=>{};
window.supabase={createClient:()=>({from:()=>({select:()=>({eq:()=>({eq:()=>({order:()=>({limit:()=>Promise.resolve({data:[]})})})})})}),
 auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{}}})},
 storage:{from:()=>({getPublicUrl:()=>({data:{publicUrl:''}})})},functions:{}})};`);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const driver=`window.__run=function(){const r={};try{
 Object.assign(S,{me:{id:'me',role:'admin',full_name:'April'},route:{view:'project',id:'p1'},
  projects:[{id:'p1',name:'Creative Queue'},{id:'p2',name:'Escalations'}],
  profiles:[{id:'me',full_name:'April Niramol',role:'admin',active:true,avatar_color:'#0F766E'},
            {id:'u2',full_name:'Prim V',role:'management',active:true,avatar_color:'#3E5C95'}],
  _groups:[{id:'g1',name:'Campaigns'},{id:'g2',name:'Brand Review'}],
  _fields:[{id:'f1',name:'Brand'}]});
 const T=(a,d,who)=>({id:Math.random(),actor_id:who||'u2',action:a,detail:d,created_at:new Date(Date.now()-3600000).toISOString()});

 const rows=[
  T('updated',{changes:[{field:'status',from:'todo',to:'in_progress'}]}),
  T('updated',{changes:[{field:'assignee',from:null,to:'me'}]}),
  T('updated',{changes:[{field:'priority',from:'normal',to:'urgent'}]}),
  T('updated',{changes:[{field:'due_date',from:null,to:'2026-09-05'}]}),
  T('updated',{changes:[{field:'group',from:'g1',to:'g2'}]}),
  T('updated',{changes:[{field:'board',from:'p1',to:'p2'}]}),
  T('updated',{changes:[{field:'title',from:'Old',to:'Banner set'}]}),
  T('updated',{changes:[{field:'description',from:null,to:null}]}),
  T('updated',{changes:[{field:'archived',to:'archived'}]}),
  T('updated',{changes:[{field:'archived',to:'restored'}]}),
  T('updated',{changes:[{field:'custom',key:'f1',from:null,to:'Nivea'}]}),
  T('updated',{changes:[{field:'status',from:'todo',to:'done'},{field:'priority',from:'urgent',to:'low'}]}),
  T('created',{title:'Banner set'}),
  T('commented',{excerpt:'please check the KV'}),
  T('file_added',{file:'kv.png'}),
  T('file_removed',{file:'old.png'}),
  T('subtask_added',{title:'Resize for Shopee'}),
  T('subtask_status',{title:'Resize for Shopee',to:'done'}),
  T('subtask_removed',{title:'Old step'}),
  T('status_changed',{from:'todo',to:'in_progress'}),
 ];
 r.lines = rows.map(a=>histLine(a).replace(/<[^>]+>/g,''));

 // rendering + the 8-row fold
 S._taskHist = rows;
 const host=document.createElement('div'); host.id='tv-history'; document.body.appendChild(host);
 host.innerHTML = historyHTML(rows);
 r.shownByDefault = host.querySelectorAll('.hist-row').length;      // 8
 r.hasShowAll = /Show all 20 events/.test(host.textContent);
 showAllHistory();
 r.shownAfterExpand = host.querySelectorAll('.hist-row').length;    // 20
 r.namesResolved = /Prim V/.test(host.textContent);
 r.hasRelativeTime = /1h ago/.test(host.textContent);
 host.innerHTML = historyHTML([]);
 r.emptyState = host.textContent.trim();
}catch(e){r.error=e.message+' | '+(e.stack||'').split('\\n').slice(0,3).join(' / ');}return r;};`;
try{w.eval(scripts.join('\n')+'\n'+driver);}catch(e){console.log('EVAL ERROR:',e.message);}
try{ console.log(JSON.stringify(w.eval('window.__run()'),null,2)); }catch(e){ console.log('RUN ERROR:',e.message); }
process.exit(0);
