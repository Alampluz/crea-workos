const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('index.html','utf8');
const cleaned = html.replace(/<script src=[^>]+><\/script>/g, '');
const dom = new JSDOM(cleaned, { runScripts:'outside-only', pretendToBeVisual:true });
const w = dom.window;

const calls = [];
w.__calls = calls;
w.eval(`
window.scrollTo = ()=>{};
window.__mkQuery = (table)=>{
  const q = { _table:table, _op:null, _payload:null, _ids:null,
    update(p){ q._op='update'; q._payload=p; return q; },
    insert(p){ q._op='insert'; q._payload=p; return q; },
    delete(){ q._op='delete'; return q; },
    select(){ return q; }, single(){ return q; }, eq(){ return q; },
    in(c, ids){ q._ids=ids; return q; }, order(){ return q; },
    then(res, rej){ window.__calls.push({table:q._table, op:q._op, payload:q._payload, ids:q._ids});
      return Promise.resolve({data:{id:'new1', title:q._payload?.title, status:'todo', priority:'normal', group_id:q._payload?.group_id, custom:{}, position:9}, error:null}).then(res, rej); }
  };
  return q;
};
window.supabase = { createClient: ()=>({
  from: window.__mkQuery,
  auth: { getSession: async()=>({data:{session:null}}), onAuthStateChange: ()=>({data:{subscription:{}}}), signInWithPassword: async()=>({}) },
  storage: { from: ()=>({}) }, functions: {},
}) };
`);

const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const driver = `
window.__run = async function(){
  const results = {};
  try {
    Object.assign(S, {
      me:{id:'me', role:'admin'},
      profiles:[{id:'me', full_name:'April', role:'admin', active:true, email:'a@a'}],
      brandsList:[{name:'BrandA', active:true}],
      _tasks:[
        {id:'t1', project_id:'p1', title:'Task 1', status:'todo', priority:'normal', group_id:'g1', custom:{}, position:1},
        {id:'t2', project_id:'p1', title:'Task 2', status:'review', priority:'high', group_id:'g1', custom:{}, position:2},
      ],
      _fields:[], _groups:[{id:'g1', name:'Campaigns', color:'#2273C9', position:0}], _subs:{},
    });
    renderProjectTableView('p1');
    results.rows = document.querySelectorAll('tr.tv-row').length;
    results.checkboxes = document.querySelectorAll('.tv-check input').length;
    tvSelToggle('t1', true); tvSelToggle('t2', true);
    results.bulkBarShown = !!document.getElementById('tvbulk');
    const btn = document.querySelector('#tvbulk button');
    tvBulkPick(btn, 'status');
    results.menuShown = !!document.getElementById('tvmenu');
    results.menuOpts = document.querySelectorAll('#tvmenu .opt').length;
    const opt = [...document.querySelectorAll('#tvmenu .opt')].find(o=>o.dataset.v==='done');
    opt.dispatchEvent(new MouseEvent('mousedown', {bubbles:true, cancelable:true}));
    await new Promise(r=>setTimeout(r,80));
    results.statusAfter = [S._tasks[0].status, S._tasks[1].status];
    results.dbCalls = window.__calls.map(c=>({op:c.op, ids:c.ids, payload:c.payload}));
    // quick add test
    const qa = document.querySelector('.tv-quickadd input');
    qa.value='New campaign';
    tvQuickAdd({key:'Enter', target:qa}, 'p1', 'g1');
    await new Promise(r=>setTimeout(r,80));
    results.tasksAfterQuickAdd = S._tasks.length;
  } catch(e){ results.error = e.message+' | '+ (e.stack||'').split('\\n').slice(0,3).join(' / '); }
  return results;
};`;
try { w.eval(scripts.join('\n') + '\n' + driver); } catch(e){ console.log('EVAL ERROR:', e.message); }
(async ()=>{
  try {
    const res = await w.eval('window.__run()');
    console.log(JSON.stringify(res, null, 2));
  } catch(e){ console.log('RUN ERROR:', e.message); }
  process.exit(0);
})();
