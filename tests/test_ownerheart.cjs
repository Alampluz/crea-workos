/* The owner heart: outline = not an owner, filled = owner, click toggles both ways. */
const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html,{runScripts:'outside-only'});
const w=dom.window;
const from=html.indexOf('const HEART_PATH'), to=html.indexOf('const ownerName');
if(from<0||to<0||to<from){ console.log('FAIL: could not locate the heart helpers'); process.exit(1); }
w.eval(`window.esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));`
 + html.slice(from,to) + `\nwindow.ownerHeartHTML=ownerHeartHTML;window.HEART_FILL=HEART_FILL;window.HEART_LINE=HEART_LINE;`);
let pass=0,fail=0; const ok=(n,c)=>{ c?pass++:(fail++,console.log('FAIL: '+n)); };
const H=(owner,can)=>w.ownerHeartHTML(owner,can,"doThing('x')",'board');

ok('owner renders the filled heart',      H(true,true).includes('fill="currentColor"'));
ok('non-owner renders the outline heart', H(false,true).includes('fill="none"') && H(false,true).includes('stroke='));
ok('owner carries the on class',          /class="heart on/.test(H(true,true)));
ok('non-owner does not',                  !/class="heart on/.test(H(false,true)));
ok('both states are clickable when allowed', H(true,true).includes('onclick') && H(false,true).includes('onclick'));
ok('filled heart says it removes',        /click to remove/.test(H(true,true)));
ok('outline heart says it makes an owner',/Make board owner/.test(H(false,true)));
ok('no click handler without permission', !H(true,false).includes('onclick') && !H(false,false).includes('onclick'));
ok('read-only owner still reads as owner',/board owner/.test(H(true,false)) && /class="heart on/.test(H(true,false)));
ok('read-only non-owner is labelled',     /Not an owner/.test(H(false,false)));
ok('no cursor class without permission',  !/heart[^"]*can/.test(H(true,false)));
ok('same path in both states',            w.HEART_FILL.includes('M12 20.6') && w.HEART_LINE.includes('M12 20.6'));
ok('title is escaped',                    !w.ownerHeartHTML(false,true,"f()",'a"b').includes('a"b'));
console.log(`owner heart: ${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
