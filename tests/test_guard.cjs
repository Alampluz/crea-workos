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
  const q = { _table:table, _op:null, _payload:null, _ids:null, _count:0,
    update(p){ q._op='update'; q._payload=p; return q; },
    insert(p){ q._op='insert'; q._payload=p; return q; },
    delete(){ q._op='delete'; return q; },
    select(c,o){ if(o&&o.head){ q._op='count'; } return q; }, single(){ return q; }, eq(){ return q; },
    in(c, ids){ q._ids=ids; return q; }, order(){ return q; },
    then(res, rej){ window.__calls.push({table:q._table, op:q._op, payload:q._payload, ids:q._ids});
      return Promise.resolve({data:{id:'new1'}, count:7, error:null}).then(res, rej); }
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
  const r = {};
  try {
    Object.assign(S, {
      me:{id:'me', role:'admin', full_name:'April'},
      route:{view:'admin', id:null},
      company:{name:'CREA'},
      profiles:[{id:'me', full_name:'April', role:'admin', active:true, email:'a@a'}],
      workspaces:[{id:'w1', name:'test', color:'#6E56B8', description:'scratch'},
                  {id:'w2', name:'Commercial Team', color:'#0F766E', description:''}],
      projects:[{id:'p1', workspace_id:'w1', name:'Sandbox', status:'active'}],
      _tasksAll:[
        {id:'t1', project_id:'p1', title:'Task 1', status:'todo', priority:'normal', group_id:'g1', custom:{}, position:1},
        {id:'t2', project_id:'p1', title:'Task 2', status:'review', priority:'high', group_id:'g1', custom:{}, position:2},
        {id:'t3', project_id:'p1', title:'Old task', status:'done', priority:'low', group_id:'g1', custom:{}, position:3, archived_at:'2026-01-01T00:00:00Z'},
      ],
      _fields:[], _groups:[{id:'g1', name:'Campaigns', color:'#2273C9', position:0}], _subs:{},
    });
    tvApplyArch();

    // ---- 1. archived rows hidden by default, bar shows
    renderProjectTableView('p1');
    r.rowsVisible = document.querySelectorAll('tr.tv-row').length;         // expect 2
    r.archBar = (document.querySelector('.tv-archbar')||{}).textContent?.trim();
    tvToggleArch();
    r.rowsWithArchived = document.querySelectorAll('tr.tv-row').length;    // expect 3
    r.archRowMarked = document.querySelectorAll('tr.tv-arch').length;      // expect 1
    r.restoreLink = document.querySelectorAll('.tv-restore').length;       // expect 1
    tvToggleArch();

    // ---- 2. bulk bar now offers Archive + Delete
    tvSelToggle('t1', true); tvSelToggle('t2', true);
    r.bulkButtons = [...document.querySelectorAll('#tvbulk button')].map(b=>b.textContent.trim());

    // ---- 3. Delete opens a guarded modal, button disabled until number typed
    tvBulkDelete();
    const go = document.querySelector('#bd-go'), inp = document.querySelector('#bd-confirm');
    r.modalOpened = !!go;
    r.disabledInitially = go.disabled;
    inp.value = '1'; inp.oninput();
    r.disabledOnWrongNumber = go.disabled;                                 // expect true
    inp.value = '2'; inp.oninput();
    r.enabledOnRightNumber = !go.disabled;                                 // expect true
    r.hasArchiveInstead = !!document.querySelector('#bd-archive');
    // click "Archive instead" -> soft delete, no delete call
    document.querySelector('#bd-archive').click();
    await new Promise(x=>setTimeout(x,80));
    r.archiveCall = window.__calls.filter(c=>c.table==='tasks').map(c=>({op:c.op, ids:c.ids, payload:c.payload}));
    r.t1Archived = !!S._tasksAll.find(t=>t.id==='t1').archived_at;
    r.rowsAfterArchive = document.querySelectorAll('tr.tv-row').length;    // expect 0 (t1,t2 archived, t3 already)
    closeModals();

    // ---- 4. workspace menu
    window.__calls.length = 0;
    renderSidebar && S.route && (S.route.view='home');
    const holder = document.createElement('div');
    holder.innerHTML = '<span class="ws-menu">x</span>';
    document.body.appendChild(holder);
    wsMenu(holder.firstChild, 'w1');
    r.wsMenuItems = [...document.querySelectorAll('#tvmenu .opt')].map(o=>o.textContent.trim());

    // ---- 5. workspace delete guard
    document.getElementById('tvmenu')?.remove();
    await deleteWorkspaceModal('w1');
    const dgo = document.querySelector('#dw-go'), dinp = document.querySelector('#dw-confirm');
    r.wsModalOpened = !!dgo;
    r.wsDisabledInitially = dgo.disabled;
    dinp.value = 'tes'; dinp.oninput();
    r.wsDisabledOnPartial = dgo.disabled;                                  // expect true
    dinp.value = 'TEST'; dinp.oninput();
    r.wsEnabledOnName = !dgo.disabled;                                     // case-insensitive, expect true
    r.wsShowsCounts = /1[\\s\\S]*board/.test(document.querySelector('.modal-body').textContent);
    closeModals();

    // ---- 6. requester must not see the menu or the delete button
    S.me.role = 'requester';
    r.requesterCanEdit = canEdit();                                        // expect false
    tvSel.clear(); tvApplyArch(); renderProjectTableView('p1');
    tvSel.add('t1'); tvBulkBar();
    r.requesterBulkButtons = [...document.querySelectorAll('#tvbulk button')].map(b=>b.textContent.trim());
    // ---- 7. non-admin staff: archive yes, delete no
    S.me.role = 'internal'; tvBulkBar();
    r.internalBulkButtons = [...document.querySelectorAll('#tvbulk button')].map(b=>b.textContent.trim());
  } catch(e){ r.error = e.message+' | '+(e.stack||'').split('\\n').slice(0,4).join(' / '); }
  return r;
};`;
try { w.eval(scripts.join('\n') + '\n' + driver); } catch(e){ console.log('EVAL ERROR:', e.message); }
(async ()=>{
  try {
    const res = await w.eval('window.__run()');
    console.log(JSON.stringify(res, null, 2));
  } catch(e){ console.log('RUN ERROR:', e.message); }
  process.exit(0);
})();
