import { scene } from './scene.js';
import { readStats, recycle } from './storage.js';
import { presentState, dialogue, revealInput, setPose, prepareResults, selectEndingQuote } from './presentation.js';
import { playStamp, discardPaper, tearPaper, returnPaper, pushCoin } from './transaction-animation.js';
import { sound, unlockAudio } from './audio.js';
import { judge, responseFor, clarificationChoices, MAX_CLARIFY_COUNT } from './judgment.js';
import { routeCatIntent, selectCatResponse } from './cat-intent-router.js';

const app = document.querySelector('#app');
app.innerHTML = `<div class="game" data-state="HOME"><header><a class="wordmark" href="./">夜裡的小生意<span>OPEN AFTER DARK</span></a><button class="debt" aria-label="查看本喵歷年欠款">本喵欠款 <b>$0</b> <span>↗</span></button></header>${scene()}<section class="interaction" aria-live="polite"></section><footer><span class="open-dot"></span> 深夜營業中 <i>・</i> 隨時可以離開</footer><div class="exit-overlay" hidden><span>今天剩下的時間，是你的。</span></div></div><dialog class="ledger"></dialog>`;
const game = app.querySelector('.game');
const panel = app.querySelector('.interaction');
const ledger = app.querySelector('.ledger');
const pick = items => items[Math.floor(Math.random() * items.length)];
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
let state = 'HOME', input = '', running = false, clarificationRound = 0;
let stats = readStats();
// Compile-time flag: build_site.py sets false and removes DEVELOPMENT sections.
const DEVELOPMENT = true;
// #if DEVELOPMENT
let result = '';
const isDev = DEVELOPMENT && new URLSearchParams(location.search).get('dev') === '1';
// #endif
const lines = ['……有事？', '妳站很久了。', '先說好，太麻煩的不一定收。', '今天人類好多事。'];
const placeholders = ['今天真的有一件很煩的事……','我知道可能很小事，但就是很煩……','有個人今天講了一句讓我很不爽的話……','有件事我到現在還一直想到……'];
function setState(next) { state = next; game.dataset.state = next; presentState(next); }
function debt() { app.querySelector('.debt b').textContent = `$${stats.debt}`; }
function home() {
  running = false; input = ''; clarificationRound = 0; setState('HOME'); game.classList.remove('inspect','shake','departing'); debt();
  panel.innerHTML = `<div class="cat-line"><span>貓老闆</span><p>${pick(lines)}</p></div><button class="primary" id="start">我有東西要賣 <span>→</span></button><p class="quiet">一件爛情緒，一塊錢。先讓本喵看看。</p>`;
  panel.querySelector('#start').onclick = showInput;
}
function showInput() {
  unlockAudio();
  setState('INPUT');
  panel.innerHTML = `<form class="paper input-paper"><div class="paper-top">爛情緒回收所 <span>回收單 / 001</span></div><p class="boss-note">「放桌上。」</p><label for="trouble">今天不想帶回家的，<br>是什麼？</label><details class="privacy-notice"><summary><span class="privacy-title">🔒 放心罵，本喵不告密。</span><span class="privacy-subtitle">只在你的裝置處理・不保存・不上傳・我媽也看不到</span></summary><div class="privacy-explanation"><p>你的爛事只有你知道。</p><p>不用登入，也不保存你輸入的內容。<br>所有判斷都在你的裝置上完成，<br>不會把你輸入的內容傳給 AI、<br>網站擁有者或其他第三方服務。</p><p>關掉頁面後，本喵也不記得你罵過誰。</p><p>我媽叫我累積功德，沒叫我蒐集八卦。</p></div></details><textarea id="trouble" maxlength="800" placeholder="${pick(placeholders)}" required></textarea><div class="form-bottom"><span>寫一件就好。<b id="length">0 / 800</b></span><button class="primary" type="submit">放到桌上 <span>↑</span></button></div></form>`;
  const area = panel.querySelector('textarea');
  const form = panel.querySelector('form');
  area.oninput = () => { panel.querySelector('#length').textContent = `${area.value.length} / 800`; area.setCustomValidity(''); };
  form.onsubmit = event => { event.preventDefault(); if (form.inert) return; if (!area.value.trim()) { area.setCustomValidity('先在紙上寫下一件事。'); area.reportValidity(); return; } input = area.value.trim(); area.blur(); transact(); };
  revealInput(form).then(revealed => { if (revealed) sound('paper'); });
}
function note() {
  panel.innerHTML = `<div class="paper submitted-paper"><div class="paper-top">爛情緒回收所 <span>待鑑定</span></div><p class="user-note"></p><div class="result-stamp"></div></div><div class="progress"><span class="status-label">老闆鑑定中……</span><p id="dialogue"></p></div>`;
  panel.querySelector('.user-note').textContent = input;
  app.querySelector('.counter-note').replaceChildren(panel.querySelector('.submitted-paper'));
}
function say(text) { panel.querySelector('#dialogue').textContent = text; dialogue(text); }
async function stamp(text) {
  await playStamp(text, sound);
}
async function transact(clarification = {}) {
  if (running) return; running = true;
  if (!clarification.kind) {
    const routed = routeCatIntent(input);
    if (routed.route === 'CAT_CHAT') {
      input = '';
      panel.replaceChildren();
      const response = selectCatResponse(routed.intent);
      for (const line of response.lines) { dialogue(line); await wait(1500); }
      home();
      return;
    }
  }
  const judgment = judge(input, {...clarification,clarifyCount:clarificationRound});
  // #if DEVELOPMENT
  // Safety always takes priority over a developer demo override.
  if (judgment.outcome !== 'SAFETY' && isDev && result) {
    judgment.outcome = {ACCEPTED:'ACCEPT',PARTIAL:'PARTIAL',REJECTED:'REJECT'}[result];
    judgment.response = responseFor(judgment.outcome,input,judgment.signals);
    judgment.reason = 'developer-override';
  }
  // #endif
  const chosen = {ACCEPT:'ACCEPTED',REJECT:'REJECTED'}[judgment.outcome] || judgment.outcome;
  // #if DEVELOPMENT
  updateDebug(judgment);
  // #endif
  if (chosen === 'SAFETY') { showSafety(judgment.response); return; }
  if (chosen === 'TEMP_HOLD') { showHold(judgment.response); return; }
  if (!clarification.kind) {
  setState('SUBMITTED'); note(); sound('paper'); await Promise.all([wait(950),prepareResults()]);
  setState('INSPECTING'); game.classList.add('inspect');
  sound('thud');
  for (const [index,text] of ['聞聞……','這什麼東西……','分析爛度……','思考值不值 $1……', pick(['好像不能吃。','嗯……'])].entries()) { if(index===3)setPose('thinking'); say(text); await wait(500); }
  game.classList.remove('inspect');
  } else { note(); }
  if (chosen === 'CLARIFY') { showClarify(judgment); return; }
  setState(chosen);
  panel.querySelector('.status-label').textContent = '貓老闆的鑑定';
  if (chosen === 'ACCEPTED') {
    await stamp('收'); for(const line of judgment.response.lines){ say(line); await wait(1500); }
    await discard(); say('成交。'); await award(); await wait(1000); say('今天不要再撿回去。');
  } else if (chosen === 'PARTIAL') {
    say('等等。妳是不是塞了兩件東西進來？'); await wait(1800); await stamp('部分回收'); await wait(700);
    await tearPaper(sound,judgment.response);
    for(const line of judgment.response.lines){ say(line); await wait(1500); }
    say('不要趁我做功德的時候偷塞。'); await wait(1600);
    await discardPaper(game.querySelector('.take'),sound); await returnPaper(game.querySelector('.return'),sound); await award();
  } else {
    say('……'); await wait(1000); await returnPaper(game.querySelector('.submitted-paper'),sound); await stamp('本喵拒收');
    for (const text of judgment.response.lines) { say(text); await wait(1500); }
    game.querySelector('.submitted-paper').outerHTML = `<div class="paper action-paper"><div class="paper-top">退還給你 <span>待處理單</span></div><small>真正卡住你的：</small><p>有件事情還需要被說清楚。</p><small>先做一件事：</small><p>把真正讓你不舒服的地方講出來。</p><div class="small-stamp">本喵拒收</div></div>`;
    const task = game.querySelectorAll('.action-paper p'); task[0].textContent=judgment.response.issue; task[1].textContent=judgment.response.nextStep;
    say('處理完還氣，再拿來。'); await wait(1600); say('那時候我收。');
  }
  input = ''; await wait(2000); setState('ENDING');
  panel.innerHTML = `<div class="cat-line final-line"><span>交易結束</span><p>${chosen === 'REJECTED' ? '待處理單，記得帶走。' : '好了。去過你的晚上。'}</p></div><button class="primary" id="leave">離開攤子 <span>↗</span></button>`;
  panel.querySelector('#leave').onclick = leave;
  dialogue(chosen === 'REJECTED' ? '待處理單，記得帶走。' : '好了。去過你的晚上。');
}
function showClarify(judgment) {
  if(clarificationRound>=MAX_CLARIFY_COUNT){showHold(responseFor('TEMP_HOLD'));return;}
  running=false; clarificationRound++; setState('CLARIFY'); setPose('thinking');
  // #if DEVELOPMENT
  updateDebug(judgment);
  // #endif
  game.querySelector('.counter-note').replaceChildren();
  dialogue('……我只問一個。');
  panel.innerHTML='<form class="paper input-paper clarification-paper"><div class="paper-top">爛情緒回收所 <span>只問一次</span></div><p class="clarify-prompt"></p><div class="clarify-choices"></div></form>';
  panel.querySelector('.clarify-prompt').textContent='這件事現在還需要妳做什麼嗎？';
  const form=panel.querySelector('form'); form.onsubmit=e=>e.preventDefault();
  for(const choice of clarificationChoices){
    const button=document.createElement('button');button.className='primary';button.type='button';button.textContent=choice.label;
    button.onclick=()=>{if(running)return;button.disabled=true;transact({kind:choice.kind});};panel.querySelector('.clarify-choices').append(button);
  }
  const exit=document.createElement('button');exit.className='close-transaction';exit.type='button';exit.textContent='先離開攤子';exit.onclick=()=>{if(!running){running=true;input='';leave();}};form.append(exit);
}
// #if DEVELOPMENT
function updateDebug(judgment){
  if(!isDev)return;
  const debug=app.querySelector('.judgment-debug');if(!debug)return;
  const info={...judgment.signals,clarifyCount:clarificationRound,finalResult:judgment.outcome};
  debug.textContent=['eventDetected','targetDetected','actionDetected','emotionOnly','selfJudgmentDetected','unresolvedAction','boundaryIssue','recurringProblem','clarifyCount','confidence','finalResult'].map(key=>`${key}: ${info[key]}`).join('\n')+'\nreason: '+judgment.reason;
}
// #endif
function showHold(response){
  setState('TEMP_HOLD');setPose('thinking');game.querySelector('.counter-note').replaceChildren();
  panel.innerHTML='<div class="paper input-paper clarification-paper"><div class="paper-top">爛情緒回收所 <span>今天先不分類</span></div><p class="clarify-prompt"></p><button class="primary" id="hold">先放桌上</button></div>';
  panel.querySelector('.clarify-prompt').textContent=response.lines.join(' ');
  dialogue('行。那今天先不急著分類。');
  panel.querySelector('#hold').onclick=()=>{
    input='';const ink=document.createElement('div');ink.className='small-stamp';ink.textContent='暫放';panel.querySelector('.paper').append(ink);
    panel.querySelector('.clarify-prompt').textContent=response.closing;dialogue('我看到了。');
    const button=panel.querySelector('#hold');button.id='leave';button.textContent='離開攤子';button.onclick=leave;
  };
}
function showSafety(response) {
  setState('SAFETY'); setPose('listening'); input='';
  game.querySelector('.counter-note').replaceChildren();
  panel.innerHTML='<div class="paper input-paper safety-paper"><div class="paper-top">先停一下 <span>這件事先不交易</span></div><p class="safety-message"></p><p class="safety-step"></p><button class="primary" id="leave">離開攤子</button></div>';
  panel.querySelector('.safety-message').textContent=response.lines.join(' ');
  panel.querySelector('.safety-step').textContent=response.issue+' '+response.nextStep;
  const support=document.createElement('p');support.className='safety-step';support.append('若妳在台灣，也可以找 ');
  const link=document.createElement('a');link.href='tel:1925';link.textContent='1925 安心專線';support.append(link,' 陪妳說說。');panel.querySelector('.safety-step').after(support);
  dialogue('先有人陪著妳，比這筆交易重要。');
  panel.querySelector('#leave').onclick=leave;
}
async function discard() { await discardPaper(game.querySelector('.submitted-paper'),sound); }
async function award() {
  await pushCoin(sound);
  const saved = recycle(); stats = saved.stats; debt(); await wait(900);
  if (!saved.persisted) { const warning = document.createElement('p'); warning.className = 'quiet'; warning.textContent = '瀏覽器無法保存紀錄，這筆欠款僅保留在本次畫面。'; panel.append(warning); }
  if (saved.easter) { ledger.innerHTML = `<div class="paper ledger-paper"><small>⚠ SYSTEM WARNING</small><h2>本店累計支出<br>已突破 $100</h2><p>老闆目前沒有倒閉，<br>但已經開始後悔開店。</p><p>「我媽只叫我累積功德。」<br>「沒說會這麼花錢。」</p><button class="primary">讓老闆靜一靜</button></div>`; ledger.showModal(); await new Promise(resolve => { ledger.querySelector('button').onclick = () => ledger.close(); ledger.addEventListener('close', resolve, { once: true }); }); }
}
async function leave() {
  if (game.classList.contains('departing')) return;
  const shownLines = Array.from(game.querySelector('.shop-dialogue').children, line => line.textContent);
  const lines = shownLines.length === 2 ? shownLines : selectEndingQuote().lines;
  game.classList.add('departing');
  await wait(900);
  const overlay = app.querySelector('.exit-overlay');
  const text = overlay.querySelector('span');
  text.replaceChildren();
  lines.forEach((line, index) => {
    if (index) text.append(document.createElement('br'));
    text.append(document.createTextNode(line));
  });
  overlay.hidden = false;
  await wait(1800);
  overlay.hidden = true;
  home();
}
app.querySelector('.debt').onclick = () => { ledger.innerHTML = `<div class="paper ledger-paper"><button class="close" aria-label="關閉">×</button><small>一本不太想打開的帳</small><h2>本喵歷年欠款</h2><div class="total">$${stats.debt}</div><p>你曾經決定，<br>不再繼續帶走 ${stats.count} 件事。</p><p class="ledger-cat">「……妳事情真的很多。」</p><small>今日回收 ${stats.today} 件</small></div>`; ledger.showModal(); ledger.querySelector('.close').onclick = () => ledger.close(); };
ledger.addEventListener('click', event => { if (event.target === ledger) ledger.close(); });
// #if DEVELOPMENT
if (isDev) { const dev = document.createElement('aside'); dev.className = 'dev'; dev.innerHTML = `<label>Developer · 下一筆結果 <select><option value="">本機判定</option><option value="ACCEPTED">收</option><option value="PARTIAL">收一半</option><option value="REJECTED">本喵拒收</option></select></label><details><summary>Judgment Debug</summary><pre class="judgment-debug">尚未交易</pre></details>`; app.append(dev); dev.querySelector('select').onchange = event => result = event.target.value; }
// #endif
home();
