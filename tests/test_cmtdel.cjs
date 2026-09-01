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
  let data;
  if(q._op==='update' && t==='comments') data = Object.assign({}, window.__row||{}, q._p);
  else if(t==='activity_log') data = window.__hist||[];
  else data = [];
  return Promise.resolve({data,error:null}).then(r,j);}};return q;};
window.supabase={createClient:()=>({from:window.__mkQuery,
 auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{}}})},
 storage:{from:()=>({getPublicUrl:p=>({data:{publicUrl:'https://cdn/'+p}})})},functions:{}})};`);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const driver=`window.__run=async function(){const r={};try{
 Object.assign(S,{me:{id:'me',role:'admin',full_name:'April'},route:{view:'project',id:'p1'},
  profiles:[{id:'me',full_name:'April Niramol',role:'admin',active:true,avatar_color:'#0F766E'},
            {id:'u2',full_name:'Prim V',role:'management',active:true,avatar_color:'#3E5C95'}]});
 const mine   = {id:'c1',author_id:'me',body:'my note',mentions:[],created_at:'2026-08-29T10:00:00Z',atts:[{id:'a1',file_name:'kv.png',storage_path:'x/kv.png',size_bytes:10}]};
 const theirs = {id:'c2',author_id:'u2',body:'their note',mentions:[],created_at:'2026-08-29T11:00:00Z'};
 S._commentCache = {c1:Object.assign({},mine), c2:Object.assign({},theirs)};
 S._histEntity = 't1'; S._taskHist = [];

 // the modal's containers
 const box=document.createElement('div'); box.id='tv-comments'; document.body.appendChild(box);
 const hist=document.createElement('div'); hist.id='tv-history'; document.body.appendChild(hist);
 renderCommentsBox();

 // A. author gets Edit+Remove on own; admin gets Remove (not Edit) on others'
 const acts = id => [...document.querySelectorAll(\`.comment[data-cid="\${id}"] .cmt-act\`)].map(b=>b.textContent);
 r.mineActs = acts('c1');            // Edit, Remove
 r.theirsActsAsAdmin = acts('c2');   // Remove only

 // B. removing hides the comment from the thread entirely (no placeholder)
 window.__row = S._commentCache.c1;
 window.__hist = [{id:'h1',actor_id:'me',action:'comment_deleted',detail:{excerpt:'my note',comment_id:'c1'},created_at:new Date().toISOString()}];
 window.__calls.length=0;
 await deleteComment('c1');
 r.softDeleted = (()=>{const u=window.__calls.find(c=>c.table==='comments'&&c.op==='update');return u&&('deleted_at' in u.payload)&&u.payload.deleted_by==='me';})();
 r.noPlaceholder = !document.querySelector('.comment.gone') && !/Comment removed/.test(box.textContent);
 r.threadOnlyShowsTheirs = box.querySelectorAll('.comment').length===1 && /their note/.test(box.textContent);
 // toast carries an Undo
 r.toastUndoShown = !!document.querySelector('.toast-undo');

 // C. the Undo lives on the history row
 await new Promise(x=>setTimeout(x,80));
 r.histSaysRemoved = /removed a comment/.test(hist.textContent);
 r.histHasUndo = !!hist.querySelector('.hist-undo');

 // D. clicking it restores the comment (with its file) and the history refreshes
 window.__row = S._commentCache.c1;
 window.__hist = [{id:'h2',actor_id:'me',action:'comment_restored',detail:{excerpt:'my note',comment_id:'c1'},created_at:new Date().toISOString()},
                  {id:'h1',actor_id:'me',action:'comment_deleted',detail:{excerpt:'my note',comment_id:'c1'},created_at:new Date().toISOString()}];
 // JSDOM outside-only mode doesn't run inline onclick — call what the button calls
 await undoDeleteComment('c1');
 await new Promise(x=>setTimeout(x,120));
 r.commentBack = /my note/.test(box.textContent);
 r.fileBack = !!box.querySelector('.att-list.in-comment');
 r.undoGoneAfterRestore = !hist.querySelector('.hist-undo');
 r.histSaysRestored = /restored a comment/.test(hist.textContent);

 // E. editing swaps to an input; Enter saves body + edited_at
 editComment('c1');
 const inp = box.querySelector('.cmt-editbox');
 r.editorOpened = !!inp && inp.value==='my note';
 inp.value='my corrected note';
 window.__row = S._commentCache.c1; window.__calls.length=0;
 window.__hist = [{id:'h3',actor_id:'me',action:'comment_edited',detail:{excerpt:'my corrected note',comment_id:'c1'},created_at:new Date().toISOString()}];
 inp.onkeydown({key:'Enter'});
 await new Promise(x=>setTimeout(x,120));
 const eu = window.__calls.find(c=>c.table==='comments'&&c.op==='update');
 r.editSaved = eu && eu.payload.body==='my corrected note' && !!eu.payload.edited_at;
 r.newTextShown = /my corrected note/.test(box.textContent);
 r.editedMarker = /· edited/.test(box.textContent);
 r.histSaysEdited = /edited a comment/.test(hist.textContent);

 // F. escape cancels without a write
 editComment('c1');
 const inp2 = box.querySelector('.cmt-editbox');
 inp2.value='scrap this';
 window.__calls.length=0;
 inp2.onkeydown({key:'Escape'});
 r.cancelNoWrite = !window.__calls.some(c=>c.op==='update');
 r.oldTextKept = /my corrected note/.test(box.textContent) && !/scrap this/.test(box.textContent);

 // G. a requester can edit their own but not remove others'
 S.me = {id:'u2', role:'requester', full_name:'Prim V'};
 renderCommentsBox();
 r.requesterOwnActs = acts('c2');    // Edit, Remove
 r.requesterOtherActs = acts('c1');  // none
 r.histLineEdited = histLine({action:'comment_edited',detail:{excerpt:'x'}}).replace(/<[^>]+>/g,'');
}catch(e){r.error=e.message+' | '+(e.stack||'').split('\\n').slice(0,4).join(' / ');}return r;};`;
try{w.eval(scripts.join('\n')+'\n'+driver);}catch(e){console.log('EVAL ERROR:',e.message);}
(async()=>{try{console.log(JSON.stringify(await w.eval('window.__run()'),null,2));}catch(e){console.log('RUN ERROR:',e.message);}process.exit(0);})();
