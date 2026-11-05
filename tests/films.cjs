const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync('docs/film-utils.js','utf8');
vm.runInNewContext(code+`
for(const [a,b] of [['(Sala XL) It Ends','It Ends'],['3d - Il Gatto Col Cappello','Il Gatto Col Cappello'],['(O.V.) Wild Horse Nine','Wild Horse Nine'],['Dune - Part Three','Dune - Parte Tre Sala Imax'],['(JP) Ken Il Guerriero -Il Film (40° Ann)','Ken Il Guerriero - Il Film (40° Ann)']])assert.equal(filmKey({title:a}),filmKey({title:b}));
const rows=[{title:'Zeta',cinema:'5363',id:'1',start:'20:00'},{title:'Alfa',cinema:'5363',id:'2',start:'19:00'},{title:'(Sala XL) Zeta',cinema:'5363',id:'3',start:'21:00'},{title:'Beta',cinema:'5641',id:'4',start:'22:00'}];
assert.equal(filmGroups(rows,'films')[0].length,2);
assert.equal(filmGroups(rows,'films')[1][0].title,'Alfa');
assert.equal(filmGroups(rows,'times')[0][0].start,'19:00');
assert.equal(variantLabels({title:'(Sala XL) Test',version:'EN · SUB-IT'}).join('|'),'XL|🇬🇧 ENG|Sott. IT');
`,{assert});console.log('9 verifiche raggruppamento, ordinamento e lingua superate');
