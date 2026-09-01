/* Dates must always carry the year — "3 Sept" is ambiguous across a year end. */
const fs=require('fs'),{JSDOM}=require('jsdom');
const html=fs.readFileSync('index.html','utf8');
const dom=new JSDOM(html,{runScripts:'outside-only'});
const w=dom.window;
const grab=(name)=>{ const i=html.indexOf(name); if(i<0) throw new Error('missing '+name); return i; };
grab('const DATE_FMT');
const end = html.indexOf('\n', html.indexOf('function fmtDateTime'));
w.eval(html.slice(grab('const DATE_FMT'), end)
  + `\nwindow.fmtDate=fmtDate;window.fmtDateTime=fmtDateTime;window.DATE_FMT=DATE_FMT;`);
const tv=html.slice(grab('function tvFmtDate'), grab('function tvChip'));
w.eval(tv+`\nwindow.tvFmtDate=tvFmtDate;`);
let pass=0,fail=0; const ok=(n,c)=>{ c?pass++:(fail++,console.log('FAIL: '+n)); };
ok('fmtDate shows the year',            /^3 Sept? 2026$/.test(w.fmtDate('2026-09-03')));
ok('fmtDate shows it for this year too',/2026/.test(w.fmtDate(new Date().toISOString())));
ok('fmtDate shows it for other years',  /2025/.test(w.fmtDate('2025-12-31')));
ok('tvFmtDate matches the same format', w.tvFmtDate('2026-08-31')===w.fmtDate('2026-08-31T00:00:00'));
ok('tvFmtDate shows day, month, year',  /^31 Aug 2026$/.test(w.tvFmtDate('2026-08-31')));
ok('tvFmtDate does not slip a day',     /^1 Jan 2026$/.test(w.tvFmtDate('2026-01-01')));
ok('fmtDateTime keeps the time',        /2026/.test(w.fmtDateTime('2026-08-31T14:05:00Z')) && /\d\d:\d\d/.test(w.fmtDateTime('2026-08-31T14:05:00Z')));
ok('empty in, empty out',               w.fmtDate('')==='' && w.tvFmtDate('')==='' && w.fmtDateTime('')==='');
ok('rubbish does not render Invalid Date', w.fmtDate('not-a-date')==='' && !/Invalid/.test(w.tvFmtDate('nope')));
console.log(`dates: ${pass} passed, ${fail} failed`);
process.exit(fail?1:0);
