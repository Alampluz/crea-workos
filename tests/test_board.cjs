const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html.replace(/<script src=[^>]+><\/script>/g,''),{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window; w.__calls=[]; w.__delRows=[{id:'p1'}];
w.eval(`
window.scrollTo=()=>{};
window.__mkQuery=(t)=>{const q={_t:t,_op:'select',_p:null,_eq:{},
 update(p){q._op='update';q._p=p;return q;}, insert(p){q._op='insert';q._p=p;return q;},
 delete(){q._op='delete';return q;}, select(){return q;}, single(){return q;},
 eq(c,v){q._eq[c]=v;return q;}, in(){return q;}, order(){return q;},
 then(r,j){window.__calls.push({table:t,op:q._op,payload:q._p,eq:{...q._eq}});
  const data = q._op==='delete' ? window.__delRows : [];
  return Promise.resolve({data,count:12,error:null}).then(r,j);}};return q;};
window.supabase={createClient:()=>({from:window.__mkQuery,
 auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{}}})},
 storage:{from:()=>({})},functions:{}})};`);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);
const driver=`window.__run=async function(){const r={};try{
 Object.assign(S,{me:{id:'me',role:'admin',full_name:'April'},route:{view:'ws',id:'w1'},company:{name:'CREA'},
  workspaces:[{id:'w1',name:'Creative Team',color:'#7D3C55',description:''}],
  projects:[{id:'p1',workspace_id:'w1',name:'Creative Queue',status:'active',color:'#0984E3',description:'d',due_date:null}],
  profiles:[{id:'me',full_name:'April',role:'admin',active:true,email:'a@a'}]});
 refreshCore=async()=>{}; renderSidebar=()=>{}; renderWorkspace=async()=>{}; renderProject=async()=>{};

 // A. board menu exists with Delete for admin
 const a=document.createElement('span'); document.body.appendChild(a);
 projMenu(a,'p1');
 r.adminMenu=[...document.querySelectorAll('#tvmenu .opt')].map(o=>o.textContent.trim());
 document.getElementById('tvmenu').remove();

 // B. management can delete a board too
 S.me.role='management'; projMenu(a,'p1');
 r.mgmtMenu=[...document.querySelectorAll('#tvmenu .opt')].map(o=>o.textContent.trim());
 document.getElementById('tvmenu').remove();

 // C. internal staff can edit but not delete
 S.me.role='internal'; projMenu(a,'p1');
 r.internalMenu=[...document.querySelectorAll('#tvmenu .opt')].map(o=>o.textContent.trim());
 document.getElementById('tvmenu').remove();
 S.me.role='admin';

 // D. edit modal saves
 editProjectModal('p1');
 r.editOpened=!!document.querySelector('#ep-save');
 document.querySelector('#ep-name').value='Creative Queue 2026';
 document.querySelector('#ep-status').value='archived';
 window.__calls.length=0; document.querySelector('#ep-save').click();
 await new Promise(x=>setTimeout(x,60));
 const up=window.__calls.find(c=>c.table==='projects'&&c.op==='update');
 r.editPayload=up?{name:up.payload.name,status:up.payload.status}:null;
 closeModals();

 // E. delete modal: typed name guard + task count + archive option
 await deleteProjectModal('p1');
 const go=document.querySelector('#dp-go'), inp=document.querySelector('#dp-confirm');
 r.delOpened=!!go; r.delDisabled=go.disabled;
 r.showsCount=/12/.test(document.querySelector('.modal-body').textContent);
 r.hasArchiveOption=!!document.querySelector('#dp-arch');
 inp.value='creative'; inp.oninput(); r.stillDisabledPartial=go.disabled;
 inp.value='Creative Queue'; inp.oninput(); r.enabledOnName=!go.disabled;
 window.__calls.length=0; go.click(); await new Promise(x=>setTimeout(x,60));
 const del=window.__calls.find(c=>c.table==='projects'&&c.op==='delete');
 r.deleteCalled=!!del; r.deleteEq=del&&del.eq;
 closeModals();

 // F. a silently-blocked delete must NOT claim success
 window.__delRows=[];
 await deleteProjectModal('p1');
 const go2=document.querySelector('#dp-go'), inp2=document.querySelector('#dp-confirm');
 inp2.value='Creative Queue'; inp2.oninput(); go2.click();
 await new Promise(x=>setTimeout(x,60));
 r.modalStaysOpenOnZeroRows=!!document.querySelector('#dp-go');
 r.buttonReenabled=!document.querySelector('#dp-go').disabled;
 closeModals();
}catch(e){r.error=e.message+' | '+(e.stack||'').split('\\n').slice(0,4).join(' / ');}return r;};`;
try{w.eval(scripts.join('\n')+'\n'+driver);}catch(e){console.log('EVAL ERROR:',e.message);}
(async()=>{try{console.log(JSON.stringify(await w.eval('window.__run()'),null,2));}catch(e){console.log('RUN ERROR:',e.message);}process.exit(0);})();
