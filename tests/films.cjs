const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync('docs/film-utils.js','utf8');
vm.runInNewContext(code+`
for(const [a,b] of [['(Sala XL) It Ends','It Ends'],['3d - Il Gatto Col Cappello','Il Gatto Col Cappello'],['(O.V.) Wild Horse Nine','Wild Horse Nine'],['Dune - Part Three','Dune - Parte Tre Sala Imax'],['(JP) Ken Il Guerriero -Il Film (40° Ann)','Ken Il Guerriero - Il Film (40° Ann)']])assert.equal(filmKey({title:a}),filmKey({title:b}));
const rows=[{title:'Zeta',cinema:'5363',id:'1',start:'20:00'},{title:'Alfa',cinema:'5363',id:'2',start:'19:00'},{title:'(Sala XL) Zeta',cinema:'5363',id:'3',start:'21:00'},{title:'Beta',cinema:'5641',id:'4',start:'22:00'}];
assert.equal(filmGroups(rows,'films')[0].length,2);
assert.equal(filmGroups(rows,'films')[1][0].title,'Alfa');
assert.equal(filmGroups(rows,'times')[0][0].start,'19:00');
assert.equal(variantLabels({title:'(Sala XL) Test',version:'EN · SUB-IT'}).join('|'),'XL|🇬🇧 ENG|Sott. IT');
assert.equal(programmingDay('2026-11-06','00:01'),'2026-11-05');
assert.equal(programmingDay('2027-01-01','02:59'),'2026-12-31');
assert.equal(programmingDay('2026-11-06','03:00'),'2026-11-06');
assert.equal(currentProgrammingDay(new Date('2026-11-05T23:01:00Z')),'2026-11-05');
assert.equal(currentProgrammingDay(new Date('2026-11-06T02:00:00Z')),'2026-11-06');
const evening=[{title:'Film',cinema:'5363',id:'1',start:'2026-11-06T00:01:00+01:00'},{title:'Film',cinema:'5363',id:'2',start:'2026-11-05T22:30:00+01:00'}];
assert.equal(filmGroups(evening,'times')[1][0].id,'1');
`,{assert});console.log('15 verifiche del programma superate');
