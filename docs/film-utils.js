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
 '2001 a space odyssey 4k':'2001: Odissea Nello Spazio 4k',
 'ebenezer':'Scrooge E Gli Spiriti Del Natale',
 'fockerinlaw':'Ti Presento I Fotter'
};
function titleKey(title){return title.toLocaleLowerCase('it').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'')}
function canonicalTitle(title){const clean=filmName(title),key=titleKey(clean);for(const [alias,value] of Object.entries(filmAliases))if(titleKey(alias)===key)return value;return clean}
function filmKey(show){return titleKey(canonicalTitle(show.originalTitle||show.title))+(show.year?':'+show.year:'')}
function filmGroups(rows,mode){const groups=new Map();for(const s of rows){const key=mode==='films'?filmKey(s):s.cinema+':'+s.id;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(s)}const lists=[...groups.values()];return mode==='films'?lists.sort((a,b)=>b.length-a.length||canonicalTitle(a[0].title).localeCompare(canonicalTitle(b[0].title),'it')):lists.sort((a,b)=>a[0].start.localeCompare(b[0].start))}
function variantLabels(show){const value=show.version+' '+show.title, labels=[];if(/imax/i.test(value))labels.push('IMAX');if(/\bxl\b/i.test(value))labels.push('XL');if(/\b3d\b/i.test(value))labels.push('3D');const flags={EN:'🇬🇧 ENG',ENG:'🇬🇧 ENG',JP:'🇯🇵 JPN',JA:'🇯🇵 JPN',CN:'🇨🇳 ZHO',CH:'🇨🇳 ZHO',ZH:'🇨🇳 ZHO',KOR:'🇰🇷 KOR',KO:'🇰🇷 KOR',FR:'🇫🇷 FRA',DE:'🇩🇪 DEU',ES:'🇪🇸 SPA',IT:'🇮🇹 ITA'};const parts=show.version.split(' · ');let language=parts.find(p=>flags[p]);if(!language){const m=show.title.match(/^\((JP|Ch|Kor|Eng?)\)/i);if(m)language=m[1].toUpperCase()}if(language)labels.push(flags[language]);else if(/O\.?V\.?/i.test(value))labels.push('Lingua originale');for(const p of parts)if(/^(SUB-|VM|\d+\+|LIVE)/.test(p))labels.push(p.replace('SUB-IT','Sott. IT').replace('SUB-EN','Sott. ENG'));return [...new Set(labels)]}

const NIGHT_CUTOFF = '03:00';
function shiftDate(date, days) {
 const value = new Date(date+'T12:00:00Z');
 value.setUTCDate(value.getUTCDate()+days);
 return value.toISOString().slice(0,10);
}
function programmingDay(date, time) {
 return time<NIGHT_CUTOFF ? shiftDate(date,-1) : date;
}
const romeClock = new Intl.DateTimeFormat('en-GB', {
 timeZone:'Europe/Rome', year:'numeric', month:'2-digit', day:'2-digit',
 hour:'2-digit', minute:'2-digit', hourCycle:'h23'
});
function currentProgrammingDay(now = new Date()) {
 const parts = Object.fromEntries(romeClock.formatToParts(now).map(p=>[p.type,p.value]));
 return programmingDay(`${parts.year}-${parts.month}-${parts.day}`,`${parts.hour}:${parts.minute}`);
}

function filmSearchIndex(rows){
 const index=new Map();
 for(const show of rows){const key=filmKey(show);let names=index.get(key)||'';
 for(const name of [show.title,show.originalTitle||'',canonicalTitle(show.title),canonicalTitle(show.originalTitle||show.title)])names+=' '+titleKey(name);
 for(const [alias,title] of Object.entries(filmAliases))if(titleKey(canonicalTitle(show.title))===titleKey(title))names+=' '+titleKey(alias)+' '+titleKey(title);
 index.set(key,names);
 }return index;
}
function filmMatches(show,query,index){return !titleKey(query)||(index.get(filmKey(show))||'').includes(titleKey(query))}

function matchesFormat(show,format){const labels=variantLabels(show);return format==='all'||(format==='standard'?!labels.some(x=>['IMAX','XL','3D'].includes(x)):labels.includes(format))}
function shareMessage(show,cinema){
 const date=new Intl.DateTimeFormat('it-IT',{weekday:'long',day:'numeric',month:'long',year:'numeric',timeZone:'Europe/Rome'}).format(new Date(show.start));
 return `${canonicalTitle(show.title)}\n${cinema} · ${date}, ore ${show.time}\n${show.version||''}\nPrenotazione: ${show.booking}`;
}
function calendarEvent(show,cinema,now=new Date()){
 const escape=text=>String(text).replace(/\\/g,'\\\\').replace(/\r?\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');
 const stamp=date=>date.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
 const start=new Date(show.start),match=(show.duration||'').match(/^(\d+):(\d{2})$/);
 const minutes=match?Number(match[1])*60+Number(match[2]):0;
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Cineming BG//Spettacoli//IT','CALSCALE:GREGORIAN','BEGIN:VEVENT',`UID:${show.cinema}-${show.id}@cineming-bg`,`DTSTAMP:${stamp(now)}`,`DTSTART:${stamp(start)}`];
 if(minutes>0)lines.push(`DTEND:${stamp(new Date(start.getTime()+minutes*60000))}`);
 lines.push(`SUMMARY:${escape(canonicalTitle(show.title))}`,`LOCATION:${escape(cinema+' · '+(show.screen||''))}`,`DESCRIPTION:${escape(shareMessage(show,cinema)+'\nDurata indicativa del film; pubblicità e intervallo esclusi.')}`,`URL:${show.booking}`,'END:VEVENT','END:VCALENDAR');
 const encoder=new TextEncoder();
 return lines.map(line=>{let folded='',bytes=0;for(const ch of line){const size=encoder.encode(ch).length;if(bytes+size>75){folded+='\r\n ';bytes=1}folded+=ch;bytes+=size}return folded}).join('\r\n')+'\r\n';
}
