const $=id=>document.getElementById(id);let data,view='films';const prefs=(()=>{try{return JSON.parse(localStorage.getItem('cinemahub')||'{}')}catch{return {}}})();view=prefs.view||view;$('cinema').value=prefs.cinema||'all';document.body.classList.toggle('light',prefs.light===true);function save(){try{localStorage.setItem('cinemahub',JSON.stringify({view,cinema:$('cinema').value,light:document.body.classList.contains('light')}))}catch{}}function el(tag,text,cls){const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n}let calendarMonth='';const today=currentProgrammingDay;function render(){if(!data)return;save();$('results').classList.toggle('timeline',view==='times');$('films').setAttribute('aria-pressed',view==='films');$('times').setAttribute('aria-pressed',view==='times');$('films').classList.toggle('active',view==='films');$('times').classList.toggle('active',view==='times');let rows=Object.values(data.cinemas).flatMap(c=>c.shows).filter(s=>programmingDay(s.date,s.time)===$('day').value&&($('cinema').value==='all'||s.cinema===$('cinema').value)&&(s.title+' '+canonicalTitle(s.title)).toLocaleLowerCase('it').includes($('search').value.toLocaleLowerCase('it'))).sort((a,b)=>a.start.localeCompare(b.start));$('count').textContent=`${rows.length} spettacoli`;$('results').replaceChildren();if(!rows.length){$('results').append(el('p','Nessuno spettacolo disponibile per questi filtri. Consulta lo stato delle fonti sopra.','empty'));return}for(const list of filmGroups(rows,view)){const f=list[0],card=el('article',null,'movie'),img=el('img');img.src=f.poster;img.alt='';img.loading='lazy';img.onerror=()=>img.remove();card.append(img,el('h3',canonicalTitle(f.title)),el('p',[formatDuration(f.duration),f.genre].filter(Boolean).join(' · '),'meta'));const shows=el('div',null,'shows');for(const cid of ['5363','5641'].filter(cid=>list.some(s=>s.cinema===cid))){shows.append(el('div',data.cinemas[cid].name,'cinema-name'));for(const s of list.filter(s=>s.cinema===cid)){const passed=new Date(s.start)<new Date(),a=el('a',s.time,'slot '+(passed?'past':'next'));a.href=s.booking;a.target='_blank';a.rel='noopener noreferrer';a.title=`${s.title} · ${s.version} · ${s.screen} · Apri biglietteria ufficiale`;const badges=el('span',null,'badges');for(const label of variantLabels(s)){if(label==='IMAX'){const logo=el('img');logo.src='imax.png';logo.alt='IMAX';logo.className='imax-logo';badges.append(logo)}else badges.append(el('span',label,'badge'))}a.append(badges);shows.append(a)}}card.append(shows);$('results').append(card)}equalizeSlots()}let loading=false;
async function load(){if(loading)return;loading=true;try{const response=await fetch('data/schedule.json',{cache:'no-store'});if(!response.ok)throw Error();data=await response.json();updateCalendar();$('status').replaceChildren();if(response.headers.get('X-Cineming-Offline'))$('status').append(el('div','Connessione non disponibile · Mostro gli ultimi dati salvati'));Object.values(data.cinemas).forEach(c=>{const stale=c.updatedAt&&Date.now()-new Date(c.updatedAt)>21600000;const state=c.status==='error'?'Aggiornamento fallito':c.status==='unpublished'?'Programmazione non pubblicata':'Aggiornato';$('status').append(el('div',`${c.name} · ${state}${c.updatedAt?' '+new Date(c.updatedAt).toLocaleString('it-IT',{timeZone:'Europe/Rome'}):''}${!c.updatedAt?' · Dati non disponibili':stale?' · Ultimi dati disponibili (più di 6 ore fa)':''}`))});const links=el('div');for(const [cid,c] of Object.entries(data.cinemas)){const a=el('a',c.name+' · Sito ufficiale');a.href=cid==='5363'?'https://webtic.it/local/5363/proxySecure/locals':'https://www.romanodilombardia.starplex.it/romanodilombardia/programmazione';a.target='_blank';a.rel='noopener noreferrer';a.style.marginRight='16px';links.append(a)}const fallback=el('a','UCI Orio · Alternativa Webtic');fallback.href='https://www.webtic.it/index.htm#/home?action=loadLocal&localId=5363';fallback.target='_blank';fallback.rel='noopener noreferrer';links.append(fallback);$('status').append(links);render()}catch{$('status').textContent=data?'Aggiornamento non riuscito · Mostro gli ultimi dati caricati.':'Programmazione non disponibile. Riprova con una connessione attiva.'}finally{loading=false}}$('films').onclick=()=>{view='films';render()};$('times').onclick=()=>{view='times';render()};$('theme').onclick=()=>{document.body.classList.toggle('light');save()};$('cinema').addEventListener('change',()=>{updateCalendar();render()});$('search').addEventListener('input',render);load();setInterval(()=>{if(!document.hidden)load()},300000);document.addEventListener('visibilitychange',()=>{if(!document.hidden)load()});window.addEventListener('online',load);if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');

// Stessa misura per tutti gli orari, calcolata sul contenuto più ingombrante.
function equalizeSlots(){
 const root=$('results'), slots=[...root.querySelectorAll('.slot')];
 root.style.removeProperty('--slot-width');root.style.removeProperty('--slot-height');
 if(!slots.length)return;
 const available=Math.min(...[...root.querySelectorAll('.shows')].map(n=>n.clientWidth));
 const width=Math.min(available,Math.ceil(Math.max(...slots.map(n=>n.getBoundingClientRect().width))));
 root.style.setProperty('--slot-width',width+'px');
 const height=Math.ceil(Math.max(...slots.map(n=>n.getBoundingClientRect().height)));
 root.style.setProperty('--slot-height',height+'px');
}
window.addEventListener('resize',equalizeSlots);
document.fonts?.ready.then(equalizeSlots);

function formatDuration(value){const m=String(value||" ").match(/^(\d+):(\d{2})$/);return m?`${Number(m[1])} h ${Number(m[2])} min`:value||""}

function updateCalendar(){
 if(!$('day').value)$('day').value=today();
 if(!calendarMonth)calendarMonth=$('day').value.slice(0,7);
 const first=new Date(calendarMonth+'-01T12:00:00Z');
 $('month-title').textContent=new Intl.DateTimeFormat('it-IT',{month:'long',year:'numeric',timeZone:'UTC'}).format(first);
 const dates=new Set(Object.values(data?.cinemas||{}).flatMap(c=>c.shows).filter(s=>$('cinema').value==='all'||s.cinema===$('cinema').value).map(s=>programmingDay(s.date,s.time)));
 const grid=$('calendar-days');grid.replaceChildren();
 const offset=(first.getUTCDay()+6)%7;
 for(let i=0;i<offset;i++){const blank=el('span');blank.setAttribute('aria-hidden','true');grid.append(blank)}
 const days=new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+1,0)).getUTCDate();
 for(let day=1;day<=days;day++){
  const date=calendarMonth+'-'+String(day).padStart(2,'0');
  const button=el('button',String(day),'calendar-day');
  button.type='button';button.disabled=date<today();
  button.classList.toggle('has-shows',dates.has(date));
  button.classList.toggle('selected',date===$('day').value);
  button.setAttribute('aria-pressed',String(date===$('day').value));
  if(date===today())button.setAttribute('aria-current','date');
  button.setAttribute('aria-label',new Intl.DateTimeFormat('it-IT',{dateStyle:'full',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z'))+(dates.has(date)?', programmazione disponibile':', nessuna programmazione disponibile'));
  button.onclick=()=>{$('day').value=date;updateCalendar();render()};grid.append(button);
 }
 $('month-prev').disabled=calendarMonth<=today().slice(0,7);
}
function moveMonth(delta){
 const date=new Date(calendarMonth+'-01T12:00:00Z');date.setUTCMonth(date.getUTCMonth()+delta);
 calendarMonth=date.toISOString().slice(0,7);updateCalendar();
}
$('month-prev').onclick=()=>moveMonth(-1);
$('month-next').onclick=()=>moveMonth(1);
$('calendar-today').onclick=()=>{$('day').value=today();calendarMonth=today().slice(0,7);updateCalendar();render()};
updateCalendar();
