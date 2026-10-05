from pathlib import Path
import json
import time
exec(Path('verify.py').read_text(encoding='utf-8').split("call('Emulation.setDeviceMetricsOverride'")[0])
call('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True})
call('Page.navigate',{'url':'http://localhost:5173/'})
time.sleep(2)
script=r'''(async()=>{
 const passed=[], original=setTimeout;
 window.setTimeout=(fn,ms,...args)=>original(fn,Math.min(ms,15),...args);
 const pause=()=>new Promise(r=>original(r,15));
 const state=()=>document.querySelector('.game').dataset.state;
 const check=(ok,label)=>{if(!ok)throw Error(label);passed.push(label);};
 async function until(fn){for(let n=0;n<700;n++){if(fn())return;await pause();}throw Error('timeout '+state());}
 let history=[];
 new MutationObserver(()=>history.push(state())).observe(document.querySelector('.game'),{attributes:true,attributeFilter:['data-state']});
 async function submit(text){history=[];document.querySelector('#start').click();await until(()=>!document.querySelector('form').inert);document.querySelector('textarea').value=text;document.querySelector('form').requestSubmit();}
 async function leave(){document.querySelector('#leave, .close-transaction').click();await until(()=>state()==='HOME');}
 const count=()=>JSON.parse(localStorage.getItem('bad-mood-recycling-v1')||'{"count":0}').count;
 localStorage.removeItem('bad-mood-recycling-v1');
 let credits=0;
 for(const [text,outcome] of CASES.slice(0,12)){
   await submit(text);
   const expected={ACCEPT:'ACCEPTED',REJECT:'REJECTED'}[outcome]||outcome;
   await until(()=>state()===expected);
   check(state()===expected,'automatic '+outcome+' '+text);
   if(outcome==='CLARIFY'){check(document.querySelectorAll('.clarify-choices button').length===4,'four clarification choices');await leave();continue;}
   await until(()=>state()==='ENDING');
   if(outcome==='ACCEPT'||outcome==='PARTIAL')credits++;
   check(count()===credits,'correct payout '+outcome);
   if(outcome==='PARTIAL')check(!document.querySelector('.result-stamp'),'partial renders split paper');
   if(outcome==='REJECT')check(document.querySelector('.action-paper p').textContent.length>0,'contextual task');
   await leave();
 }
 for(const [index,expected] of [[0,'ACCEPTED'],[1,'REJECTED'],[2,'PARTIAL'],[3,'TEMP_HOLD']]){
   await submit('今天超煩。');await until(()=>state()==='CLARIFY');
   document.querySelectorAll('.clarify-choices button')[index].click();
   await until(()=>state()===expected);
   check(state()===expected,'clarification route '+index);
   check(!document.querySelector('textarea'),'no second free-text input');
   check(history.filter(s=>s==='CLARIFY').length===1,'at most one clarification');
   check(!history.slice(history.indexOf('CLARIFY')+1).includes('INSPECTING'),'choice goes straight to result');
   if(index===3){
     check(!document.querySelector('.paid-coin'),'hold has no reward');
     document.querySelector('#hold').click();check(document.querySelector('.small-stamp')?.textContent==='暫放','hold stamp');
     check(count()===credits,'hold payout unchanged');await leave();continue;
   }
   await until(()=>state()==='ENDING');if(index===0||index===2)credits++;
   check(count()===credits,'clarification payout '+index);await leave();
 }
 await submit('我想傷害自己。');check(state()==='SAFETY','safety bypasses transaction');
 check(!document.querySelector('.paid-coin')&&!document.querySelector('.result-stamp'),'no stamp or reward in safety');
 check(count()===credits,'safety adds nothing');await leave();
 check(!localStorage.getItem('bad-mood-recycling-v1').includes('主管'),'no input in storage');
 localStorage.removeItem('bad-mood-recycling-v1');
 return passed;
})()'''
cases=json.loads(Path('judgment-cases.json').read_text(encoding='utf-8'))
results=evaluate(script.replace('CASES',json.dumps(cases,ensure_ascii=True)))
Path('judgment-flow-qa.json').write_text(json.dumps(results,ensure_ascii=False,indent=2),encoding='utf-8')
print('PASS:',len(results),'browser flow checks')
