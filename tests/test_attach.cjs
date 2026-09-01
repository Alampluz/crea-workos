const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html.replace(/<script src=[^>]+><\/script>/g,''),{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window; w.__calls=[]; w.__sel={}; w.__storage=[];
w.eval(`
window.scrollTo=()=>{}; window.URL.createObjectURL=()=>'blob:x';
window.__mkQuery=(t)=>{const q={_t:t,_op:'select',_p:null,_eq:{},
 update(p){q._op='update';q._p=p;return q;}, insert(p){q._op='insert';q._p=p;return q;},
 delete(){q._op='delete';return q;}, select(){return q;}, single(){q._single=true;return q;},
 eq(c,v){q._eq[c]=v;return q;}, is(){return q;}, in(){return q;}, order(){return q;}, limit(){return q;},
 then(r,j){window.__calls.push({table:t,op:q._op,payload:q._p,eq:{...q._eq}});
  let data;
  if(q._op==='insert'){
    const rows=(Array.isArray(q._p)?q._p:[q._p]).map((x,i)=>({...x,id:(t==='comments'?'c':'a')+(window.__calls.length)+i,created_at:new Date().toISOString()}));
    data = q._single? rows[0] : rows;
  } else data = window.__sel[t]||[];
  return Promise.resolve({data,count:0,error:null}).then(r,j);}};return q;};
window.supabase={createClient:()=>({from:window.__mkQuery,
 auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{}}})},
 storage:{from:()=>({
   upload:async(path,file)=>{ window.__storage.push({path,name:file.name,size:file.size}); return {data:{path},error:null}; },
   remove:async(paths)=>({data:paths,error:null}),
   getPublicUrl:(p)=>({data:{publicUrl:'https://cdn.test/'+p}}),
 })},
 functions:{}})};`);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const driver=`window.__run=async function(){const r={};try{
 Object.assign(S,{me:{id:'me',role:'admin',full_name:'April'},route:{view:'project',id:'p1'},
  workspaces:[{id:'w1',name:'W',color:'#0F766E'}],
  projects:[{id:'p1',workspace_id:'w1',name:'B',status:'active',color:'#08e'}],
  profiles:[{id:'me',full_name:'April',role:'admin',active:true,email:'a@a',avatar_color:'#0F766E'},
            {id:'u2',full_name:'Prim V',role:'management',active:true,email:'p@a',avatar_color:'#358'}]});
 const mkFile=(n,size,type)=>{const f=new File([new Blob(['x'.repeat(size)])],n,{type:type||''});Object.defineProperty(f,'size',{value:size});return f;};

 // A. attachment chips: image -> thumbnail, other -> file chip with size
 const img={id:'a1',file_name:'kv.png',storage_path:'task/t1/kv.png',size_bytes:2048};
 const pdf={id:'a2',file_name:'brief.pdf',storage_path:'task/t1/brief.pdf',size_bytes:3*1024*1024};
 const host=document.createElement('div'); document.body.appendChild(host);
 host.innerHTML = attListHTML([img,pdf], true);
 r.imgIsThumb = !!host.querySelector('.att-img img');
 r.imgSrc = host.querySelector('.att-img img')?.getAttribute('src');
 r.fileChip = host.querySelector('.att-file .att-n')?.textContent;
 r.fileSizeShown = host.querySelector('.att-file .att-s')?.textContent;
 r.removeButtons = host.querySelectorAll('.att-x').length;      // 2 when canRemove
 host.innerHTML = attListHTML([img,pdf], false);
 r.noRemoveWhenReadOnly = host.querySelectorAll('.att-x').length; // 0
 host.innerHTML = attListHTML([], true);
 r.emptyText = host.textContent.trim();

 // B. drop zone uploads on pick — no second button
 const zoneHost=document.createElement('div'); document.body.appendChild(zoneHost);
 zoneHost.innerHTML = '<div id="L">'+attListHTML([],true)+'</div>'+attachZoneHTML('dz');
 const listEl = zoneHost.querySelector('#L');
 r.noUploadButton = !zoneHost.querySelector('button');
 wireAttachZone(zoneHost,'dz','task','t1',listEl);
 window.__storage.length=0; window.__calls.length=0;
 const dz = zoneHost.querySelector('#dz');
 dz.ondrop({preventDefault(){}, dataTransfer:{files:[mkFile('shot.png',1000,'image/png')]}});
 await new Promise(x=>setTimeout(x,80));
 r.uploadedToStorage = window.__storage.map(s=>s.name);
 const ai = window.__calls.find(c=>c.table==='attachments'&&c.op==='insert');
 r.attRowEntity = ai? [ai.payload.entity_type, ai.payload.entity_id] : null;
 r.listGrewWithoutReload = listEl.querySelectorAll('.att').length;   // 1
 r.thumbAppeared = !!listEl.querySelector('.att-img img');

 // C. oversize file is rejected, nothing uploaded
 window.__storage.length=0;
 const big = await uploadFiles('task','t1',[mkFile('huge.zip',30*1024*1024)]);
 r.oversizeRejected = big.length===0 && window.__storage.length===0;

 // D. comment composer: clip + paste + staged tray
 const cHost=document.createElement('div'); document.body.appendChild(cHost);
 cHost.innerHTML = commentComposerHTML('tv');
 const cIn = wireComposer(cHost,'tv');
 r.hasClip = !!cHost.querySelector('.cmp-clip');
 cIn._staged.push(mkFile('paste.png',500,'image/png'), mkFile('notes.txt',80,'text/plain'));
 cIn._redrawStaged();
 r.stagedChips = [...cHost.querySelectorAll('.stg-n')].map(x=>x.textContent);
 r.stagedTrayVisible = !cHost.querySelector('#tv-staged').classList.contains('hidden');
 cHost.querySelector('.stg-x').click();
 r.afterRemoveOne = cIn._staged.map(f=>f.name);

 // E. sending a comment uploads its files against the comment id
 window.__storage.length=0; window.__calls.length=0;
 cIn.value = 'here is the KV';
 const box=document.createElement('div'); document.body.appendChild(box);
 const posted = await postComment('task','t1','Banner task', cIn, box);
 const cIns = window.__calls.find(c=>c.table==='comments'&&c.op==='insert');
 const aIns = window.__calls.find(c=>c.table==='attachments'&&c.op==='insert');
 r.commentBody = cIns? cIns.payload.body : null;
 r.commentFileEntity = aIns? aIns.payload.entity_type : null;
 r.commentFileParent = aIns && posted ? (aIns.payload.entity_id===posted.id) : null;
 r.stagedClearedAfterSend = cIn._staged.length;
 r.commentShowsFile = /att-list in-comment/.test(box.innerHTML);

 // F. a comment with only a file and no text still sends
 window.__calls.length=0;
 cIn.value=''; cIn._staged.push(mkFile('only.png',300,'image/png'));
 const p2 = await postComment('task','t1','Banner task', cIn, box);
 r.fileOnlyCommentSent = !!p2;
 // and an empty comment with nothing at all does not
 const p3 = await postComment('task','t1','Banner task', cIn, box);
 r.emptyCommentBlocked = p3===null;
}catch(e){r.error=e.message+' | '+(e.stack||'').split('\\n').slice(0,4).join(' / ');}return r;};`;
try{w.eval(scripts.join('\n')+'\n'+driver);}catch(e){console.log('EVAL ERROR:',e.message);}
(async()=>{try{console.log(JSON.stringify(await w.eval('window.__run()'),null,2));}catch(e){console.log('RUN ERROR:',e.message);}process.exit(0);})();
