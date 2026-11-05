/* Normalizza solo marcatori di versione noti; conserva anni e sottotitoli. */
function filmName(title) {
 return title.replace(/<[^>]*>/g,'').replace(/^\((?:sala\s*xl|xl(?:-kor)?|o\.?v\.?|jp|ch|kor|eng?|fr|de|es)\)\s*/i,'').replace(/^3d\s*[-–:]?\s*/i,'').replace(/\s*(?:sala\s*)?imax\b/ig,'').replace(/\s+infinity(?:\s+vision)?\s*$/i,'').replace(/\s+anteprima\s*$/i,'').replace(/\s+vm\s*\d+\s*$/i,'').replace(/\s+/g,' ').trim();
}
const filmAliases = {
 'dune part three':'Dune - Parte Tre',
 'hunger games sunrise on the r':'Hunger Games: L’Alba sulla Mietitura',
 'hunger games lalba sulla miet':'Hunger Games: L’Alba sulla Mietitura',
 'hunger games lalba sulla mietitura':'Hunger Games: L’Alba sulla Mietitura',
 'george michael the faith t':'George Michael: The Faith Tour',
 'the further misadv of cliff':'Le Nuove Disavventure di Cliff B.',
 'fockerinlaw':'Ti Presento I Fotter'
};
function titleKey(title){return title.toLocaleLowerCase('it').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'')}
function canonicalTitle(title){const clean=filmName(title),key=titleKey(clean);for(const [alias,value] of Object.entries(filmAliases))if(titleKey(alias)===key)return value;return clean}
function filmKey(show){return titleKey(canonicalTitle(show.title))}
function filmGroups(rows,mode){const groups=new Map();for(const s of rows){const key=mode==='films'?filmKey(s):s.cinema+':'+s.id;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(s)}const lists=[...groups.values()];return mode==='films'?lists.sort((a,b)=>b.length-a.length||canonicalTitle(a[0].title).localeCompare(canonicalTitle(b[0].title),'it')):lists.sort((a,b)=>a[0].start.localeCompare(b[0].start))}
function variantLabels(show){const value=show.version+' '+show.title, labels=[];if(/imax/i.test(value))labels.push('IMAX');if(/\bxl\b/i.test(value))labels.push('XL');if(/\b3d\b/i.test(value))labels.push('3D');const flags={EN:'🇬🇧 ENG',ENG:'🇬🇧 ENG',JP:'🇯🇵 JPN',JA:'🇯🇵 JPN',CN:'🇨🇳 ZHO',CH:'🇨🇳 ZHO',ZH:'🇨🇳 ZHO',KOR:'🇰🇷 KOR',KO:'🇰🇷 KOR',FR:'🇫🇷 FRA',DE:'🇩🇪 DEU',ES:'🇪🇸 SPA',IT:'🇮🇹 ITA'};const parts=show.version.split(' · ');let language=parts.find(p=>flags[p]);if(!language){const m=show.title.match(/^\((JP|Ch|Kor|Eng?)\)/i);if(m)language=m[1].toUpperCase()}if(language)labels.push(flags[language]);else if(/O\.?V\.?/i.test(value))labels.push('Lingua originale');for(const p of parts)if(/^(SUB-|VM|\d+\+|LIVE)/.test(p))labels.push(p.replace('SUB-IT','Sott. IT').replace('SUB-EN','Sott. ENG'));return [...new Set(labels)]}
