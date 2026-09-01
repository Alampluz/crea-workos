const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html.replace(/<script src=[^>]+><\/script>/g,''),{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window; w.__calls=[];
w.eval(`
window.scrollTo=()=>{};
window.__mkQuery=(t)=>{const q={_t:t,_op:'select',_p:null,_eq:{},_single:false,
 update(p){q._op='update';q._p=p;return q;}, insert(p){q._op='insert';q._p=p;return q;},
 delete(){q._op='delete';return q;}, select(){return q;}, single(){q._single=true;return q;},
 eq(c,v){q._eq[c]=v;return q;}, in(){return q;}, order(){return q;}, limit(){return q;},
 then(r,j){window.__calls.push({table:t,op:q._op,payload:q._p});
  let data = q._op==='insert'? (Array.isArray(q._p)?q._p:[q._p]).map((x,i)=>({...x,id:'n'+i,status:x.status||'todo'})) : [];
  if(q._single) data=data[0]||null;
  return Promise.resolve({data,error:null}).then(r,j);}};return q;};
window.supabase={createClient:()=>({from:window.__mkQuery,
 auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{}}})},
 storage:{from:()=>({})},functions:{}, rpc:async()=>({data:{},error:null})})};`);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const driver=String.raw`window.__run=async function(){const r={};try{
 Object.assign(S,{me:{id:'me',role:'admin',full_name:'April'},route:{view:'project',id:'p1'},
  profiles:[{id:'me',full_name:'April',role:'admin',active:true,avatar_color:'#0F766E'}]});

 // A. line splitting strips bullets, numbering, checkbox glyphs, blanks
 r.split = JSON.stringify(splitPasteLines('- Brief\n2) Design\n• Review\n✓ Ship\n\n   \nPlain'))
   === JSON.stringify(['Brief','Design','Review','Ship','Plain']);
 r.splitThai = splitPasteLines('ทำแบนเนอร์\nส่งลูกค้า').length===2;
 r.splitOne = splitPasteLines('just one line').length===1;

 // B. bulk subtask insert: positions continue after existing rows, rows appended, toast
 const m=document.createElement('div');
 m.innerHTML='<div class="strow"></div><div class="strow"></div><div id="tv-subs"></div><input id="tv-sub-new" value="x"><div id="tv-chk"><div></div></div><input id="tv-chk-new" value="y"><div id="tv-subprog"></div>';
 document.body.appendChild(m);
 window.__calls.length=0;
 await addSubtasksBulk('t1', ['A','B','C'], m);
 const si=window.__calls.find(c=>c.table==='subtasks'&&c.op==='insert');
 r.subPayload = si && si.payload.length===3 && si.payload[0].position===3 && si.payload[2].position===5
   && si.payload.every(x=>x.task_id==='t1' && x.created_by==='me');
 r.subRows = m.querySelectorAll('#tv-subs .strow').length===3;
 r.subCleared = m.querySelector('#tv-sub-new').value==='';
 r.subToast = /3 subtasks added/.test(document.querySelector('#toasts')?.textContent||'');

 // C. bulk checklist insert continues after existing children
 window.__calls.length=0;
 await addChecklistBulk('t1', ['ก','ข'], m);
 const ci=window.__calls.find(c=>c.table==='task_checklist'&&c.op==='insert');
 r.chkPayload = ci && ci.payload.length===2 && ci.payload[0].position===2 && ci.payload[1].label==='ข';
 r.chkCleared = m.querySelector('#tv-chk-new').value==='';

 // D. paste wiring: multi-line intercepted, single line passes through
 let got=null;
 const inp=document.createElement('input'); document.body.appendChild(inp);
 wireListPaste(inp, lines=>{ got=lines; });
 const ev=new window.Event('paste',{cancelable:true});
 ev.clipboardData={getData:()=> 'one\ntwo\nthree'};
 inp.dispatchEvent(ev);
 r.pasteMulti = JSON.stringify(got)===JSON.stringify(['one','two','three']) && ev.defaultPrevented;
 got=null;
 const ev2=new window.Event('paste',{cancelable:true});
 ev2.clipboardData={getData:()=> 'single line'};
 inp.dispatchEvent(ev2);
 r.pasteSingleNormal = got===null && !ev2.defaultPrevented;
}catch(e){r.error=e.message+' | '+(e.stack||'').split('\n').slice(0,4).join(' / ');}return r;};`;
try{w.eval(scripts.join('\n')+'\n'+driver);}catch(e){console.log('EVAL ERROR:',e.message);}
(async()=>{try{console.log(JSON.stringify(await w.eval('window.__run()'),null,2));}catch(e){console.log('RUN ERROR:',e.message);}process.exit(0);})();
