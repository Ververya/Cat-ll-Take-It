"""Local Chrome CDP verification; standard library only. Run with Chrome on port 9222."""
import base64
import json
import os
import socket
import struct
import time
import urllib.request

pages = json.load(urllib.request.urlopen('http://localhost:9222/json'))
page = next(p for p in pages if p['type'] == 'page' and 'localhost:5173' in p['url'])
from urllib.parse import urlparse
url = urlparse(page['webSocketDebuggerUrl'])
s = socket.create_connection((url.hostname, url.port))
s.settimeout(30)
key = base64.b64encode(os.urandom(16)).decode()
s.sendall(f'GET {url.path} HTTP/1.1\r\nHost: {url.netloc}\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n'.encode())
response = b''
while not response.endswith(b'\r\n\r\n'):
    response += s.recv(1)
assert b'101' in response
seq = 0

def exact(n):
    data = b''
    while len(data) < n:
        data += s.recv(n - len(data))
    return data

def call(method, params=None):
    global seq
    seq += 1
    data = json.dumps({'id': seq, 'method': method, 'params': params or {}}).encode()
    mask = os.urandom(4)
    length = len(data)
    header = bytes([129, 128 | length]) if length < 126 else bytes([129, 254]) + struct.pack('!H', length)
    s.sendall(header + mask + bytes(v ^ mask[i % 4] for i, v in enumerate(data)))
    while True:
        first, second = exact(2)
        length = second & 127
        if length == 126: length = struct.unpack('!H', exact(2))[0]
        if length == 127: length = struct.unpack('!Q', exact(8))[0]
        payload = exact(length)
        if first & 15 == 1:
            result = json.loads(payload)
            if result.get('id') == seq:
                assert 'error' not in result, result
                return result.get('result', {})

def evaluate(expression):
    result = call('Runtime.evaluate', {'expression': expression, 'awaitPromise': True, 'returnByValue': True})
    assert 'exceptionDetails' not in result, result
    return result['result'].get('value')

call('Emulation.setDeviceMetricsOverride', {'width': 390, 'height': 844, 'deviceScaleFactor': 1, 'mobile': True})
evaluate("localStorage.removeItem('bad-mood-recycling-v1')")
call('Page.navigate', {'url': 'http://localhost:5173/?dev=1'})
time.sleep(2)
shot = call('Page.captureScreenshot', {'format': 'png'})
open('preview-mobile.png', 'wb').write(base64.b64decode(shot['data']))
print('Mobile:', evaluate("JSON.stringify({width:innerWidth,body:document.body.scrollWidth,cta:document.querySelector('#start').getBoundingClientRect().bottom,footer:document.querySelector('footer').getBoundingClientRect().bottom})"))
expression = r'''(async () => {
 const passed = [];
 const assert = (condition, label) => { if (!condition) throw Error(label); passed.push(label); };
 const original = window.setTimeout;
 window.setTimeout = (fn, ms, ...args) => original(fn, Math.min(ms, 15), ...args);
 const sleep = ms => new Promise(r => original(r, ms));
 const until = async (fn) => { for(let n=0;n<300;n++){if(fn())return;await sleep(15);} throw Error('State timeout: '+document.querySelector('.game').dataset.state); };
 const state = () => document.querySelector('.game').dataset.state;
 const before = JSON.parse(localStorage.getItem('bad-mood-recycling-v1') || '{"count":0}').count;
 for (const outcome of ['ACCEPTED','PARTIAL','REJECTED']) {
   const select = document.querySelector('.dev select'); select.value = outcome; select.dispatchEvent(new Event('change'));
   document.querySelector('#start').click();
   assert(state()==='INPUT', outcome+' input');
   await until(()=>!document.querySelector('form').inert);
   const area = document.querySelector('textarea'); area.value = '<script>private_test</script> 今天很煩';
   document.querySelector('form').requestSubmit();
   assert(state()==='SUBMITTED',outcome+' physical paper');
   assert(document.querySelector('.user-note').textContent.includes('<script>'),outcome+' safe text rendering');
   await until(()=>state()==='INSPECTING');
   assert(state()==='INSPECTING',outcome+' inspecting');
   await until(()=>state()===outcome);
   assert(state()===outcome,outcome+' independent state');
   await until(()=>state()==='ENDING');
   assert(document.querySelector('.game').dataset.pose==='idle',outcome+' returns to idle pose');
   assert(!document.querySelector('.flight-ball')&&!document.querySelector('.paid-coin'),outcome+' clears transaction props');
   if(outcome==='REJECTED') assert(document.querySelector('.action-paper')?.textContent.includes('先做一件事'),'rejected task remains readable until departure');
   assert(!localStorage.getItem('bad-mood-recycling-v1').includes('private_test'),outcome+' input not stored');
   document.querySelector('#leave').click(); await until(()=>state()==='HOME');
   assert(!document.querySelector('.counter-note').children.length,outcome+' clears paper after leaving');
 }
 const data = JSON.parse(localStorage.getItem('bad-mood-recycling-v1'));
 assert(data.count===before+2 && data.debt===before+2,'accepted and partial add $1; rejected adds nothing');
 document.querySelector('.debt').click();
 assert(document.querySelector('dialog').open,'ledger opens'); document.querySelector('.close').click();
 return passed;
})()'''
print('Flows:', json.dumps(evaluate(expression), ensure_ascii=False))
# Seed 99 and reload to verify the threshold and one-time flag.
evaluate("localStorage.setItem('bad-mood-recycling-v1',JSON.stringify({count:99,today:0,easterSeen:false}));")
call('Page.navigate', {'url': 'http://localhost:5173/?dev=1'})
time.sleep(1)
print('Easter egg:', evaluate(r'''(async()=>{
 const original = setTimeout; window.setTimeout=(fn,ms,...a)=>original(fn,Math.min(ms,15),...a);
 const sleep=()=>new Promise(r=>original(r,15));
 async function until(fn){for(let i=0;i<300;i++){if(fn())return;await sleep();}throw Error('timeout');}
 async function submit(){const select=document.querySelector('.dev select');select.value='ACCEPTED';select.dispatchEvent(new Event('change'));document.querySelector('#start').click();await until(()=>!document.querySelector('form').inert);document.querySelector('textarea').value='test';document.querySelector('form').requestSubmit();}
 await submit(); await until(()=>document.querySelector('dialog').open);
 if(!document.querySelector('dialog').textContent.includes('SYSTEM WARNING'))throw Error('missing egg');
 document.querySelector('dialog button').click(); await until(()=>document.querySelector('#leave'));document.querySelector('#leave').click();await until(()=>document.querySelector('#start'));
 await submit(); await until(()=>document.querySelector('#leave'));
 if(document.querySelector('dialog').open)throw Error('egg repeated');
 const s=JSON.parse(localStorage.getItem('bad-mood-recycling-v1'));if(s.count!==101||!s.easterSeen)throw Error('wrong stats');
 return '100 triggers once; 101 does not repeat';
})()'''))
evaluate("localStorage.removeItem('bad-mood-recycling-v1')")
call('Page.navigate', {'url': 'http://localhost:5173/'})
time.sleep(1)
assert evaluate("!document.querySelector('.dev')"), 'Developer control exposed'
shot = call('Page.captureScreenshot', {'format': 'png'})
open('preview-mobile.png', 'wb').write(base64.b64decode(shot['data']))
call('Emulation.setDeviceMetricsOverride', {'width': 1440, 'height': 1000, 'deviceScaleFactor': 1, 'mobile': False})
time.sleep(.5)
shot = call('Page.captureScreenshot', {'format': 'png'})
open('preview-desktop.png', 'wb').write(base64.b64decode(shot['data']))
print('Desktop:', evaluate("JSON.stringify({width:innerWidth,stage:document.querySelector('.game').getBoundingClientRect().width,devHidden:!document.querySelector('.dev')})"))
s.close()
