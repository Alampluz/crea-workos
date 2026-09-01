const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html.replace(/<script src=[^>]+><\/script>/g,''),{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window; w.__calls=[]; w.__sel={};
w.eval(`
window.scrollTo=()=>{};
window.__mkQuery=(t)=>{const q={_t:t,_op:'select',_p:null,_eq:{},
 update(p){q._op='update';q._p=p;return q;}, insert(p){q._op='insert';q._p=p;return q;},
 delete(){q._op='delete';return q;}, select(){return q;}, single(){return q;},
 eq(c,v){q._eq[c]=v;return q;}, in(){return q;}, order(){return q;}, limit(){return q;},
 then(r,j){window.__calls.push({table:t,op:q._op,payload:q._p});
  const one = q._t==='comments' && q._op==='insert';
  const data = one ? {id:'c1', author_id:'me', body:q._p.body, mentions:q._p.mentions, created_at:new Date().toISOString()} : (window.__sel[t]||[]);
  return Promise.resolve({data,count:0,error:null}).then(r,j);}};return q;};
window.supabase={createClient:()=>({from:window.__mkQuery,
 auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{}}})},
 storage:{from:()=>({})},functions:{}})};`);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const driver=`window.__run=async function(){const r={};try{
 Object.assign(S,{me:{id:'me',role:'admin',full_name:'April Niramol'},route:{view:'project',id:'p1'},
  workspaces:[{id:'w1',name:'W',color:'#0F766E',description:''}],
  projects:[{id:'p1',workspace_id:'w1',name:'Board',status:'active',color:'#08e',visibility:'collaborate'}],
  profiles:[{id:'me',full_name:'April Niramol',role:'admin',active:true,email:'a@example.test'},
            {id:'u2',full_name:'Prim V',role:'management',active:true,email:'prim@example.test'},
            {id:'u3',full_name:'Vee Thitiphong',role:'management',active:true,email:'vee@example.test'},
            {id:'u4',full_name:'Ko',role:'admin',active:true,email:'ko@example.test'}],
  _tasks:[], _tasksAll:[], _groups:[], _fields:[], _subs:{}});

 // A. mentionables excludes yourself
 r.mentionables = mentionables().map(p=>p.full_name).sort();

 // B. typing @pr opens a menu filtered to Prim
 const inp=document.createElement('input'); document.body.appendChild(inp);
 wireMentions(inp);
 inp.value='hey @pr'; inp.selectionStart=inp.value.length;
 inp.dispatchEvent(new window.Event('input'));
 r.menuShown = !!document.querySelector('.mention-menu');
 r.menuNames = [...document.querySelectorAll('.mention-menu .mopt')].map(o=>o.textContent.trim().split(' ')[0]+' '+o.textContent.trim().split(' ')[1]);
 // pick the first
 document.querySelector('.mention-menu .mopt').dispatchEvent(new window.MouseEvent('mousedown',{bubbles:true,cancelable:true}));
 r.afterPick = inp.value;
 r.pickedIds = extractMentions(inp);

 // C. a name typed by hand but never picked does NOT ping anyone
 const inp2=document.createElement('input'); document.body.appendChild(inp2); wireMentions(inp2);
 inp2.value='cc @Vee Thitiphong please look';
 r.handTypedMentions = extractMentions(inp2);

 // D. posting sends the comment AND one notification per tagged person
 window.__calls.length=0;
 const box=document.createElement('div'); document.body.appendChild(box);
 await postComment('task','t1','Fix the banner', inp, box);
 const ci=window.__calls.find(c=>c.table==='comments'&&c.op==='insert');
 const ni=window.__calls.find(c=>c.table==='notifications'&&c.op==='insert');
 r.commentMentions = ci? ci.payload.mentions : null;
 r.notifRows = ni? ni.payload.map(n=>({to:n.user_id, actor:n.actor_id, kind:n.kind, entity:n.entity_type, title:n.title})) : null;
 r.inputCleared = inp.value==='';
 r.commentRendered = /mention/.test(box.innerHTML) && /Prim V/.test(box.innerHTML);

 // E. no tags -> no notification insert at all
 window.__calls.length=0;
 const inp3=document.createElement('input'); document.body.appendChild(inp3); wireMentions(inp3);
 inp3.value='just a note';
 await postComment('task','t1','Fix the banner', inp3, box);
 r.noTagNoNotif = !window.__calls.some(c=>c.table==='notifications');

 // F. bell badge counts unread only
 window.__sel['notifications']=[{id:'n1',actor_id:'u2',entity_type:'task',entity_id:'t1',title:'Fix the banner',body:'@April Niramol look',created_at:new Date().toISOString(),read_at:null},
                                {id:'n2',actor_id:'u3',entity_type:'task',entity_id:'t2',title:'Other',body:'hi',created_at:new Date().toISOString(),read_at:new Date().toISOString()}];
 await refreshNotifs();
 r.badge = document.querySelector('#bell-count').textContent;
 r.badgeVisible = !document.querySelector('#bell-count').classList.contains('hidden');
 r.badgeIsDotAt1 = !document.querySelector('#bell-count').classList.contains('hidden') && document.querySelector('#bell-count').textContent==='';
 r.bellMarkedUnread = document.querySelector('#bell').classList.contains('has-unread');
 r.bellIsSvg = !!document.querySelector('#bell svg') && !/🔔/.test(document.querySelector('#bell').textContent);
 // 12 unread -> numeral
 window.__sel['notifications'] = Array.from({length:12},(_,i)=>({id:'x'+i,actor_id:'u2',entity_type:'task',entity_id:'t1',title:'T',body:'b',created_at:new Date().toISOString(),read_at:null}));
 await refreshNotifs();
 r.badgeAt12 = document.querySelector('#bell-count').textContent;
 r.badgeManyClass = document.querySelector('#bell').title;
 // back to 0 -> hidden
 window.__sel['notifications'] = [];
 await refreshNotifs();
 r.badgeHiddenAt0 = document.querySelector('#bell-count').classList.contains('hidden');
 r.bellCleanAt0 = !document.querySelector('#bell').classList.contains('has-unread');
 r.timeAgo = [timeAgo(new Date(Date.now()-30*1000)), timeAgo(new Date(Date.now()-45*60*1000)), timeAgo(new Date(Date.now()-5*3600*1000))];
 window.__sel['notifications']=[{id:'n1',actor_id:'u2',entity_type:'task',entity_id:'t1',title:'Fix the banner',body:'@April Niramol look',created_at:new Date().toISOString(),read_at:null},
                                {id:'n2',actor_id:'u3',entity_type:'task',entity_id:'t2',title:'Other',body:'hi',created_at:new Date().toISOString(),read_at:new Date().toISOString()}];
 await refreshNotifs();
 toggleNotifPanel();
 r.panelItems = document.querySelectorAll('#notif-panel .np-item').length;
 r.unreadItems = document.querySelectorAll('#notif-panel .np-item.unread').length;
 r.panelText = document.querySelector('#notif-panel .np-item').textContent.replace(/\\s+/g,' ').slice(0,60);
 document.querySelector('#notif-panel').remove();
}catch(e){r.error=e.message+' | '+(e.stack||'').split('\\n').slice(0,4).join(' / ');}return r;};`;
try{w.eval(scripts.join('\n')+'\n'+driver);}catch(e){console.log('EVAL ERROR:',e.message);}
(async()=>{try{console.log(JSON.stringify(await w.eval('window.__run()'),null,2));}catch(e){console.log('RUN ERROR:',e.message);}process.exit(0);})();
