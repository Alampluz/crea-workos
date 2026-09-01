const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html.replace(/<script src=[^>]+><\/script>/g,''),{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window; w.__calls=[];
w.eval(`
window.scrollTo=()=>{};
window.__mkQuery=(t)=>{const q={_t:t,_op:'select',_p:null,_eq:{},
 update(p){q._op='update';q._p=p;return q;}, insert(p){q._op='insert';q._p=p;return q;},
 delete(){q._op='delete';return q;}, select(){return q;}, single(){return q;},
 eq(c,v){q._eq[c]=v;return q;}, neq(){return q;}, not(){return q;}, is(){return q;}, or(){return q;}, gte(){return q;}, lte(){return q;}, gt(){return q;}, lt(){return q;}, in(){return q;}, order(){return q;}, limit(){return q;},
 then(r,j){window.__calls.push({table:t,op:q._op,payload:q._p});
  const data = q._op==='insert'? {id:'nf', ...(Array.isArray(q._p)?q._p[0]:q._p)} : [];
  return Promise.resolve({data,error:null}).then(r,j);}};return q;};
window.supabase={createClient:()=>({from:window.__mkQuery,
 auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{}}})},
 storage:{from:()=>({})},functions:{}})};`);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const driver=String.raw`window.__run=async function(){const r={};try{
 Object.assign(S,{me:{id:'me',role:'admin',full_name:'April'},route:{view:'project',id:'p1'},
  profiles:[{id:'me',full_name:'April Niramol',role:'admin',active:true,avatar_color:'#0F766E'}],
  _groups:[{id:'g1',name:'Case Open'}],
  _fields:[
   {id:'f1',label:'Brand',ftype:'brand',options:[]},
   {id:'f2',label:'Qty',ftype:'number',options:[]},
   {id:'f3',label:'Unit price',ftype:'number',options:[]},
   {id:'f4',label:'Total',ftype:'formula',options:{expr:'{Qty} * {Unit price}'}},
  ]});
 const t = {id:'t1',title:'Banner set',status:'in_progress',priority:'urgent',assignee_id:'me',
            due_date:'2026-09-05',group_id:'g1',created_at:'2026-08-20T00:00:00Z',
            custom:{f1:'Nivea',f2:'12',f3:'2.5'}};

 // A. the language itself
 const cases = [
  ['{Qty} * {Unit price}', 30],
  ['CONCATENATE({Brand}, " — ", {Name})', 'Nivea — Banner set'],
  ['{Brand} & "@example.test"', 'Nivea@example.test'],
  ['UPPER(LEFT({Brand}, 3))', 'NIV'],
  ['IF({Status} = "In Progress", "working", "idle")', 'working'],
  ['IF({Qty} > 10, "bulk", "small")', 'bulk'],
  ['ROUND({Unit price} * 1.07, 2)', 2.68],
  ['SUM({Qty}, {Unit price}, 5)', 19.5],
  ['DAYS({Due date}, "2026-09-01")', 4],
  ['LEN({Brand})', 5],
  ['{Qty} + {Unit price}', 14.5],
  ['NOT({Status} = "Done")', true],
  ['{Total} * 2', 60],                       // formula referencing a formula
 ];
 r.results = cases.map(([e,want])=>{
   try{ const got=fxEval(e,t); return (got===want || Math.abs(got-want)<1e-9)? 'ok' : 'GOT '+got+' WANT '+want; }
   catch(err){ return 'THREW '+err.message; }
 });

 // B. errors are caught, named, and never eval'd
 r.badField = (()=>{try{fxEval('{Nope}+1',t);return 'no';}catch(e){return /Unknown field/.test(e.message);}})();
 r.badFn    = (()=>{try{fxEval('HACK(1)',t);return 'no';}catch(e){return /not a known function/.test(e.message);}})();
 r.noEval   = (()=>{try{fxEval('alert(1)',t);return 'no';}catch(e){return true;}})();
 r.loopStops= (()=>{ S._fields.push({id:'f5',label:'Loop',ftype:'formula',options:{expr:'{Loop}+1'}});
   try{fxEval('{Loop}',t);return 'no';}catch(e){ S._fields.pop(); return /loop/i.test(e.message);}})();

 // C. the cell renders read-only computed value; errors show ⚠ with the reason
 r.cellHTML = /tv-fxv/.test(tvCell(t, S._fields[3])) && /30/.test(tvCell(t, S._fields[3]));
 const broken = {id:'fb',label:'Bad',ftype:'formula',options:{expr:'{Missing}'}};
 r.cellError = /tv-fxerr/.test(tvCell(t, broken)) && /Unknown field/.test(tvCell(t, broken));

 // D. the builder: type picker gains Formula, chips insert, preview computes live
 S._tasks=[t];
 columnModal('p1');
 const sel=document.querySelector('#cf-type');
 r.hasFormulaType = [...sel.options].some(o=>o.value==='formula');
 sel.value='formula'; sel.onchange({target:sel});
 r.builderShown = document.querySelector('#cf-fx-wrap').style.display==='block';
 r.chips = [...document.querySelectorAll('.fx-chip')].map(c=>c.textContent).slice(0,4);
 const fxIn=document.querySelector('#cf-fx');
 fxIn.value='{Qty} * {Unit price}'; fxIn.oninput();
 r.livePreview = /Preview: /.test(document.querySelector('#cf-fx-prev').textContent) && /30/.test(document.querySelector('#cf-fx-prev').textContent);
 fxIn.value='{Nope}'; fxIn.oninput();
 r.previewError = /Unknown field/.test(document.querySelector('#cf-fx-prev').textContent);
 // chip insertion at cursor
 fxIn.value=''; fxIn.selectionStart=fxIn.selectionEnd=0;
 document.querySelectorAll('.fx-chip')[0].onclick();
 r.chipInserted = fxIn.value==='{Name}';
 // save stores {expr}
 document.querySelector('#cf-label').value='Line total';
 fxIn.value='{Qty} * {Unit price}';
 window.__calls.length=0;
 document.querySelector('#cf-save').onclick();
 await new Promise(x=>setTimeout(x,60));
 const ins=window.__calls.find(c=>c.table==='project_fields'&&c.op==='insert');
 r.savedExpr = ins && ins.payload.ftype==='formula' && ins.payload.options.expr==='{Qty} * {Unit price}';
 closeModals();
}catch(e){r.error=e.message+' | '+(e.stack||'').split('\n').slice(0,4).join(' / ');}return r;};`;
try{w.eval(scripts.join('\n')+'\n'+driver);}catch(e){console.log('EVAL ERROR:',e.message);}
(async()=>{try{console.log(JSON.stringify(await w.eval('window.__run()'),null,2));}catch(e){console.log('RUN ERROR:',e.message);}process.exit(0);})();
