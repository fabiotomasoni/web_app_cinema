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
if __name__=='__main__':unittest.main()
