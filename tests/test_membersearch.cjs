/* Member search + team bulk-add. Pulls the helpers out of the bundle by their
   markers rather than by brace counting, so adding a function between them
   does not silently truncate what is under test. */
const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html.replace(/<script src=[^>]+><\/script>/g,''),{runScripts:'outside-only'});
const w=dom.window, d=w.document;
const from=html.indexOf('const searchBoxHTML'), to=html.indexOf('/* A heart marks the owner');
if(from<0||to<0||to<from) { console.log('FAIL: could not locate the search helpers in the bundle'); process.exit(1); }
const src=html.slice(from,to);
w.eval(`window.esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  window.toast=(m)=>{window.__toast=m;};
  window.S={teams:[],teamMembers:[]};`
 + src + `\nwindow.searchKey=searchKey;window.searchBoxHTML=searchBoxHTML;window.wireMemberSearch=wireMemberSearch;
  window.teamAddHTML=teamAddHTML;window.wireTeamAdd=wireTeamAdd;window.teamMemberIds=teamMemberIds;`);

let pass=0, fail=0;
const ok=(n,c)=>{ c?pass++:(fail++,console.log('FAIL: '+n)); };

const cs={id:'t1',name:'Customer Service'}, creative={id:'t2',name:'Creative'};
w.S.teams=[cs,creative];
w.S.teamMembers=[{team_id:'t1',user_id:'u1'},{team_id:'t1',user_id:'u2'},{team_id:'t2',user_id:'u3'}];

// --- searchKey
const k=w.searchKey({id:'u1',full_name:'Prim V',email:'prim.v@example.test',role:'requester'});
ok('name, email and role are searchable', k.includes('prim v')&&k.includes('prim.v@example.test')&&k.includes('requester'));
ok('team name is searchable', k.includes('customer service'));
ok('someone in no team still keys cleanly', !w.searchKey({id:'zz',full_name:'X',email:'',role:''}).includes('undefined'));
ok('quotes stripped so data-search cannot break out', !w.searchKey({id:'u1',full_name:'A "B"',email:'',role:''}).includes('"'));

// --- filtering
const root=d.createElement('div');
root.innerHTML=w.searchBoxHTML('q','Search')
  +`<div data-group="1"><div class="chk" data-search="vee thitiphong thitiphong.f@example.test internal creative"></div></div>`
  +`<div data-group="1"><div class="chk" data-search="prim v prim.v@example.test requester customer service"></div></div>`;
d.body.appendChild(root);
w.wireMemberSearch(root,'q');
const rows=[...root.querySelectorAll('[data-search]')], groups=[...root.querySelectorAll('[data-group]')];
const type=v=>{ const i=root.querySelector('#q'); i.value=v; i.dispatchEvent(new w.Event('input')); };
type('prim');            ok('name match hides the others', rows[0].hidden&&!rows[1].hidden);
                         ok('empty role heading folds away', groups[0].hidden&&!groups[1].hidden);
type('THITIPHONG.F@EXAMPLE.TEST'); ok('email match is case-insensitive', !rows[0].hidden&&rows[1].hidden);
type('customer service'); ok('searching a team name finds its people', !rows[1].hidden&&rows[0].hidden);
type('zzz');             ok('no-match line shows', !root.querySelector('#q-none').hidden);
type('');                ok('clearing restores everything', rows.every(r=>!r.hidden)&&groups.every(g=>!g.hidden));
                         ok('no-match line hides again', root.querySelector('#q-none').hidden);

// --- team bulk-add
const box=(uid,extra='')=>`<input type="checkbox" data-uid="${uid}" ${extra}>`;
const picker=d.createElement('div');
picker.innerHTML=w.teamAddHTML('team')+box('u1')+box('u2','checked')+box('u3')+box('u4');
d.body.appendChild(picker);
ok('team option shows its headcount', picker.querySelector('#team').innerHTML.includes('Customer Service · 2'));
w.wireTeamAdd(picker,'team');
let changes=0; picker.querySelectorAll('input').forEach(i=>i.addEventListener('change',()=>changes++));
const pick=v=>{ const s=picker.querySelector('#team'); s.value=v; s.onchange(); };
pick('t1');
const val=uid=>picker.querySelector(`input[data-uid="${uid}"]`).checked;
ok('ticks the team members', val('u1')&&val('u2'));
ok('leaves everyone else alone', !val('u3')&&!val('u4'));
ok('only fires change for boxes it actually ticked', changes===1);
ok('counts just the newly ticked', /Ticked 1 from Customer Service/.test(w.__toast));
ok('resets the select so the same team can be picked again', picker.querySelector('#team').value==='');
pick('t1');
ok('re-picking a fully ticked team says so', /already ticked/.test(w.__toast));

// a disabled box (e.g. a board that is not Shareable) must be reported, not silently skipped
const picker2=d.createElement('div');
picker2.innerHTML=w.teamAddHTML('team2')+box('u1','disabled')+box('u2');
d.body.appendChild(picker2); w.wireTeamAdd(picker2,'team2');
const s2=picker2.querySelector('#team2'); s2.value='t1'; s2.onchange();
ok('disabled rows are counted as not addable', /can't be added here/.test(w.__toast));
ok('and the addable one is still ticked', picker2.querySelector('input[data-uid="u2"]').checked);

console.log(`member search + teams: ${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
