"""Raccolta limitata a due richieste per esecuzione, senza credenziali."""
import json, pathlib, re, unicodedata, urllib.request, urllib.robotparser
from datetime import datetime
from zoneinfo import ZoneInfo
ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/data/schedule.json'
ENDPOINT = 'https://restapi.webtic.it/Webtic/CallOldWebtic'
CINEMAS = {'5363': 'UCI Orio', '5641': 'Starplex Romano'}
ROME = ZoneInfo('Europe/Rome')

def booking_url(cinema, film, performance):
    fallback = f'https://www.webtic.it/index.htm#/home?action=loadLocal&localId={cinema}'
    event = str(film.get('EventId', ''))
    show = str(performance.get('PerformanceId', ''))
    if cinema != '5363' or not (event.isascii() and event.isdecimal() and show.isascii() and show.isdecimal()):
        return fallback
    title = re.sub(r'<[^>]*>', '', film['Title']).strip()
    title = re.sub(r'^\((?:sala\s+xl|xl(?:-kor)?|o\.?v\.?|eng?|jp|ch|kor)\)\s*|^3d\s*[-–:]?\s*', '', title, flags=re.I)
    title = re.sub(r'\s+(?:sala\s+)?imax$|\s+infinity(?:\s+vision)?$', '', title, flags=re.I)
    ascii_title = unicodedata.normalize('NFKD', title).encode('ascii', 'ignore').decode().lower()
    slug = re.sub(r'[^a-z0-9]+', '-', ascii_title).strip('-')
    return f'https://ucicinemas.it/movies/{slug}/acquista/{cinema}/{event}/{show}' if slug else fallback

def normalize(raw, cinema):
    if not raw.get('Status', {}).get('Success') or not raw.get('userdata', {}).get('StatusOk'):
        raise ValueError('La fonte segnala un errore')
    schedule = raw['DS']['Scheduling']
    if str(schedule['LocalId']) != cinema: raise ValueError('Cinema inatteso')
    rows = {}
    for film in schedule['Events']:
        for day in film.get('Days', []):
            for show in day.get('Performances', []):
                start = datetime.fromisoformat(show['StartTime'])
                start = start.replace(tzinfo=ROME) if start.tzinfo is None else start.astimezone(ROME)
                key = str(show['PerformanceId'])
                rows[key] = dict(id=key, cinema=cinema, title=film['Title'], titleId=str(film.get('TitleId') or film['Title']).casefold(), start=start.isoformat(), date=start.date().isoformat(), time=start.strftime('%H:%M'), screen=show.get('Screen',''), duration=film.get('Duration',''), genre=film.get('Category',''), version=' · '.join(film.get('Properties', [])), poster='https://secure.webtic.it/' + film.get('Picture',''), booking=booking_url(cinema, film, show))
    return sorted(rows.values(), key=lambda x:x['start'])
def main():
    old = json.loads(OUT.read_text()) if OUT.exists() else {'cinemas':{}}
    now = datetime.now(ZoneInfo('Europe/Rome')).isoformat()
    result = {'checkedAt':now, 'cinemas':{}}
    for cid, name in CINEMAS.items():
        previous = old.get('cinemas',{}).get(cid,{})
        try:
            robot = urllib.robotparser.RobotFileParser('https://restapi.webtic.it/robots.txt')
            try: robot.read()
            except Exception as exc: raise RuntimeError('Impossibile verificare robots.txt') from exc
            if not robot.can_fetch('CinemaHubBG', ENDPOINT): raise RuntimeError('Accesso escluso da robots.txt')
            payload = {'OldWebticRequest':{'meta':{'QueryParams':{'wtid':'getFullScheduling','localid':int(cid),'trackid':33}}}}
            req = urllib.request.Request(ENDPOINT, data=json.dumps(payload).encode(), headers={'Content-Type':'application/json','User-Agent':'CinemaHubBG/1.0'})
            with urllib.request.urlopen(req, timeout=40) as response: rows=normalize(json.load(response),cid)
            result['cinemas'][cid] = dict(name=name,status='ok' if rows else 'unpublished',updatedAt=now,shows=rows,error=None)
            print(name, len(rows), 'spettacoli')
        except Exception as exc:
            result['cinemas'][cid] = dict(name=name,status='error',updatedAt=previous.get('updatedAt'),shows=previous.get('shows',[]),error=str(exc))
            print(name, str(exc))
    OUT.parent.mkdir(parents=True,exist_ok=True)
    temp=OUT.with_suffix('.tmp');temp.write_text(json.dumps(result,ensure_ascii=False));temp.replace(OUT)
if __name__ == '__main__': main()
