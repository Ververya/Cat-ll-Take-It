"""Browser ES-module regression tests using the existing standard-library CDP helper."""
from pathlib import Path
from collections import Counter
import json
exec(Path('verify.py').read_text(encoding='utf-8').split("call('Emulation.setDeviceMetricsOverride'")[0])
cases=json.loads(Path('judgment-cases.json').read_text(encoding='utf-8'))
results=evaluate("(async()=>{const {judge}=await import('./judgment.js?qa='+Date.now());return "+json.dumps(cases,ensure_ascii=True)+".map(([text,expected])=>({text,expected,...judge(text)}));})()")
failures=[r for r in results if r['expected']!=r['outcome']]
counts=Counter(r['outcome'] for r in results)
report={'cases':len(cases),'passed':len(cases)-len(failures),'counts':dict(counts),'failures':failures,'warning':'WARNING: Judgment Engine may be biased toward ACCEPT.' if counts['ACCEPT']/len(cases)>.7 else None}
Path('judgment-qa-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=True))
assert not failures, 'Judgment regression failed'
extra=evaluate(r'''(async()=>{
 const {judge}=await import('./judgment.js?priority='+Date.now());
 const cases=[
 ['今天超煩。',{kind:'ended'},'ACCEPT'],
 ['今天超煩。',{kind:'recurring'},'REJECT'],
 ['今天超煩。',{kind:'self'},'PARTIAL'],
 ['今天超煩。',{kind:'unknown',clarifyCount:1},'TEMP_HOLD'],
 ['我想傷害自己。',{kind:'ended'},'SAFETY'],
 ['主管每天丟工作給我，我很笨。',{},'REJECT'],
 ['主管否決提案，我是不是沒能力？',{},'PARTIAL'],
 ['朋友的事情還沒處理。',{},'REJECT'],
 ['好煩',{clarifyCount:1},'TEMP_HOLD']
 ];
 for(const [text,answer,expected] of cases){const r=judge(text,answer);if(r.outcome!==expected)throw Error(text+' '+r.outcome);}
 for(const [text] of cases){if(JSON.stringify(judge(text))!==JSON.stringify(judge(text)))throw Error('non-deterministic');}
 return cases.length;
})()''')
print('PASS:',extra,'clarification/priority checks; deterministic output')
