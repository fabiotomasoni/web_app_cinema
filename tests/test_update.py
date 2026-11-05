import importlib.util, unittest
from datetime import datetime
from zoneinfo import ZoneInfo
from pathlib import Path
spec=importlib.util.spec_from_file_location('update',Path(__file__).resolve().parents[1]/'scripts/update.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
class UpdateTests(unittest.TestCase):
 def raw(self,start):
  p={'PerformanceId':1,'StartTime':start}
  return {'Status':{'Success':True},'userdata':{'StatusOk':True},'DS':{'Scheduling':{'LocalId':5363,'Events':[{'Title':'Film','EventId':1,'Days':[{'Performances':[p,p]}]}]}}}
 def test_duplicate(self):self.assertEqual(len(m.normalize(self.raw('2026-11-05T20:00:00'),'5363')),1)
 def test_timezone(self):
  for date,offset in [('2026-01-01','+01:00'),('2026-07-01','+02:00')]:self.assertTrue(m.normalize(self.raw(date+'T20:00:00'),'5363')[0]['start'].endswith(offset))
 def test_bad_cinema(self):
  with self.assertRaises(ValueError):m.normalize(self.raw('2026-01-01T20:00:00'),'5641')
 def test_error(self):
  with self.assertRaises(ValueError):m.normalize({'Status':{'Success':False}},'5363')
 def test_unpublished(self):
  r=self.raw('2026-01-01T20:00:00');r['DS']['Scheduling']['Events']=[];self.assertEqual(m.normalize(r,'5363'),[])
 def test_uci_checkout_uses_event_and_performance(self):
  raw=self.raw('2026-11-05T22:10:00')
  film=raw['DS']['Scheduling']['Events'][0]
  film.update(Title='Se Domani Non Torno',EventId=5331)
  film['Days'][0]['Performances'][0]['PerformanceId']=284592
  self.assertEqual(m.normalize(raw,'5363')[0]['booking'],'https://ucicinemas.it/movies/se-domani-non-torno/acquista/5363/5331/284592')
 def test_romano_and_missing_event_use_webtic(self):
  self.assertTrue(m.booking_url('5641',{'Title':'Film','EventId':1},{'PerformanceId':2}).endswith('localId=5641'))
  self.assertTrue(m.booking_url('5363',{'Title':'Film'},{'PerformanceId':2}).endswith('localId=5363'))
 def test_local_time_after_midnight_is_preserved(self):
  show=m.normalize(self.raw('2026-11-05T23:01:00Z'),'5363')[0]
  self.assertEqual((show['date'],show['time']),('2026-11-06','00:01'))
if __name__=='__main__':unittest.main()
