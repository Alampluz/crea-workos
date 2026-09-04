/* Email settings: the bell panel offers them, the modal mirrors the profile, and
   Save writes exactly email_notify + email_muted_kinds back to the person's own row. */
const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html.replace(/<script src=[^>]+><\/script>/g,''),{runScripts:'outside-only',pretendToBeVisual:true});
const w=dom.window; w.__calls=[]; w.__sel={};
w.eval(`
window.scrollTo=()=>{};
window.__mkQuery=(t)=>{const q={_t:t,_op:'select',_p:null,_eq:{},
 update(p){q._op='update';q._p=p;return q;}, insert(p){q._op='insert';q._p=p;return q;},
 delete(){q._op='delete';return q;}, select(){return q;}, single(){return q;},
 eq(c,v){q._eq[c]=v;return q;}, neq(){return q;}, not(){return q;}, is(){return q;}, or(){return q;}, gte(){return q;}, lte(){return q;}, lt(){return q;}, in(){return q;}, order(){return q;}, limit(){return q;},
 then(r,j){window.__calls.push({table:t,op:q._op,payload:q._p,eq:{...q._eq}});
  return Promise.resolve({data:window.__sel[t]||[],count:0,error:null}).then(r,j);}};return q;};
window.supabase={createClient:()=>({from:window.__mkQuery,
 auth:{getSession:async()=>({data:{session:null}}),onAuthStateChange:()=>({data:{subscription:{}}})},
 storage:{from:()=>({})},functions:{}})};`);
const scripts=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m=>m[1]);

const driver=`window.__run=async function(){const r={};try{
 Object.assign(S,{me:{id:'me',role:'internal',full_name:'Vee',email:'vee@example.test',email_notify:true,email_muted_kinds:['overdue']},
  profiles:[{id:'me',full_name:'Vee',role:'internal',active:true}], _notifs:[]});

 // 1. the bell panel links to the settings
 r.panelHasLink = /emailSettingsModal\\(\\)/.test(notifPanelHTML()) && /Email settings/.test(notifPanelHTML());
 r.kindCount = EMAIL_KINDS.length;                                    // 10, one per notification kind
 r.kindsMatchNotifKinds = ['assigned','review','request','sla_warning','sla_breach','overdue','mention','automation','approval','approval_decided']
   .every(k=>EMAIL_KINDS.some(([kk])=>kk===k));

 // 2. the modal mirrors the profile: master on, 'overdue' unticked, everything else ticked
 emailSettingsModal();
 const boxes=[...document.querySelectorAll('#es-kinds input[data-kind]')];
 r.rows = boxes.length;
 r.overdueUnticked = !boxes.find(b=>b.dataset.kind==='overdue').checked;
 r.othersTicked = boxes.filter(b=>b.dataset.kind!=='overdue').every(b=>b.checked);
 r.masterOn = document.getElementById('es-on').checked;
 r.showsAddress = /vee@example\\.test/.test(document.body.textContent);

 // 3. untick two more, save: the update carries exactly the muted set to the person's own row
 boxes.find(b=>b.dataset.kind==='automation').checked=false;
 boxes.find(b=>b.dataset.kind==='review').checked=false;
 window.__calls.length=0;
 await saveEmailSettings();
 const upd=window.__calls.find(c=>c.table==='profiles'&&c.op==='update');
 r.updateSent = !!upd;
 r.updateTarget = upd && upd.eq.id;                                   // 'me'
 r.updateKeys = upd && Object.keys(upd.payload).sort().join(',');     // email_muted_kinds,email_notify
 r.mutedSaved = upd && [...upd.payload.email_muted_kinds].sort().join(',');   // automation,overdue,review
 r.stateUpdated = (S.me.email_muted_kinds||[]).length===3;
 r.modalClosed = !document.querySelector('#es-kinds');

 // 4. master off: kinds are irrelevant, email_notify false goes out
 emailSettingsModal();
 document.getElementById('es-on').checked=false;
 window.__calls.length=0;
 await saveEmailSettings();
 const upd2=window.__calls.find(c=>c.table==='profiles'&&c.op==='update');
 r.masterOffSaved = upd2 && upd2.payload.email_notify===false;
}catch(e){r.error=e.message+' | '+(e.stack||'').split('\\n').slice(0,3).join(' / ');}return r;};`;

try{w.eval(scripts.join('\n')+'\n'+driver);}catch(e){console.log('EVAL ERROR:',e.message);process.exit(1);}
w.eval('window.__run()').then(r=>{
  if(r.error){ console.log('DRIVER ERROR:',r.error); process.exit(1); }
  let pass=0, fail=0; const ok=(n,c)=>{ if(c) pass++; else { fail++; console.log('FAIL:',n); } };
  ok('bell panel offers Email settings', r.panelHasLink);
  ok('one row per notification kind', r.kindCount===10 && r.kindsMatchNotifKinds && r.rows===10);
  ok('modal mirrors the profile (overdue muted, rest on, master on)', r.overdueUnticked && r.othersTicked && r.masterOn);
  ok('modal names the address mail goes to', r.showsAddress);
  ok('save writes only email_notify + email_muted_kinds to own row', r.updateSent && r.updateTarget==='me' && r.updateKeys==='email_muted_kinds,email_notify');
  ok('muted set is exactly the unticked kinds', r.mutedSaved==='automation,overdue,review' && r.stateUpdated);
  ok('modal closes after save', r.modalClosed);
  ok('master off saves email_notify=false', r.masterOffSaved);
  console.log(`email: ${pass} passed, ${fail} failed`);
  process.exit(fail?1:0);
});
