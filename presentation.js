// Presentation only: judgment, counters and result behavior remain in app.js.
const poses = { idle: 'assets/cat/cat-idle.webp', listening: 'assets/cat/cat-listening.webp', blink: 'assets/cat/cat-blink.webp' };
const posesReady = Promise.all(Object.values(poses).map(src => { const image = new Image(); image.src = src; return image.decode().catch(() => {}); }));
for (const name of ['inspecting','thinking','accept','partial','reject','push-coin','discard']) poses[name] = `assets/cat/cat-${name}.webp`;
let resultReady;
export function prepareResults() {
  return resultReady ||= Promise.all([...Object.values(poses),'assets/props/paper-ball.webp','assets/props/coin.webp'].map(src => { const image = new Image(); image.src = src; return image.decode().catch(() => {}); }));
}
export function setPose(name) {
  document.querySelector('.game').dataset.pose = name;
  changePose(poses[name] || poses.idle);
  document.querySelector('.cat-paws').src = poses[name] || poses.idle;
}
let revision = 0;
let idleTimer;
let currentState;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const cat = () => document.querySelector('.cat-portrait');
export function dialogue(text) { document.querySelector('.shop-dialogue').textContent = text; }
function reducedMotion() { return matchMedia('(prefers-reduced-motion: reduce)').matches; }
function changePose(src) {
  const portrait = cat();
  portrait.parentElement.querySelector('.cat-pose-before')?.remove();
  if (portrait.getAttribute('src') === src) return;
  if (!reducedMotion() && portrait.complete) {
    const previous = portrait.cloneNode();
    previous.className = 'cat-pose-before';
    previous.alt = '';
    previous.setAttribute('aria-hidden', 'true');
    portrait.parentElement.append(previous);
    previous.addEventListener('animationend', () => previous.remove(), { once: true });
  }
  portrait.src = src;
}
function syncKeyboard() {
  const game = document.querySelector('.game');
  if (!game) return;
  const viewport = window.visualViewport;
  const keyboardOpen = ['INPUT','CLARIFY'].includes(currentState) && innerWidth < 760 && document.activeElement?.tagName === 'TEXTAREA' && viewport && viewport.height < innerHeight * .78;
  game.classList.toggle('keyboard-open', Boolean(keyboardOpen));
  if (keyboardOpen) {
    game.style.setProperty('--visible-height', `${Math.round(viewport.height)}px`);
    game.style.setProperty('--visible-top', `${Math.round(viewport.offsetTop)}px`);
  } else {
    game.style.removeProperty('--visible-height');
    game.style.removeProperty('--visible-top');
  }
}
window.visualViewport?.addEventListener('resize', syncKeyboard);
window.visualViewport?.addEventListener('scroll', syncKeyboard);
window.addEventListener('resize', syncKeyboard);
document.addEventListener('focusin', () => requestAnimationFrame(syncKeyboard));
document.addEventListener('focusout', () => requestAnimationFrame(syncKeyboard));
export async function revealInput(form) {
  const token = revision;
  const game = document.querySelector('.game');
  game.classList.add('approaching');
  form.inert = true;
  form.setAttribute('aria-hidden', 'true');
  await posesReady;
  await sleep(reducedMotion() ? 0 : 180);
  if (token !== revision || currentState !== 'INPUT') return false;
  setPose('listening');
  dialogue('放桌上。');
  await sleep(reducedMotion() ? 0 : 470);
  if (token !== revision || currentState !== 'INPUT') return false;
  game.classList.remove('approaching');
  form.inert = false;
  form.removeAttribute('aria-hidden');
  return true;
}
async function blink(token) {
  if (token !== revision || currentState !== 'HOME') return;
  cat().src = poses.blink;
  await sleep(140);
  if (token === revision && currentState === 'HOME') cat().src = poses.idle;
}
function scheduleBlink(token) {
  idleTimer = setTimeout(async () => { await blink(token); if (token === revision) scheduleBlink(token); }, 10000 + Math.random() * 6000);
}

// Static, local ending-only content. IDs remain stable so only IDs need storage.
export const ENDING_QUOTES = Object.freeze([
  ['不要一直檢討自己。', '沒人有時間關注你。'],
  ['事情處理不完。', '妳可以先處理晚餐。'],
  ['別想了。', '妳的大腦今天已經加班了。'],
  ['有些事明天再煩。', '也不會收利息。'],
  ['下班了。', '沒下班的問題是它自己的事。'],
  ['別重播了。', '這又不是什麼得獎作品。'],
  ['今天到這。', '人生又沒有全勤獎。'],
  ['妳可以走了。', '問題不一定要一起走。'],
  ['今天的份量夠了。', '爛事不用吃到飽。'],
  ['有些話聽過就算了。', '不用替它保存精裝版。'],
  ['別人的表情很難猜。', '本喵自己的都懶得管理。'],
  ['不是每句話都有深意。', '有些人只是嘴巴還沒下班。'],
  ['今天已經夠長了。', '回想不算加薪。'],
  ['那一幕已經過了。', '不用守著片尾字幕。'],
  ['別人的腦袋不開放參觀。', '妳猜到天亮也沒有門票。'],
  ['沒回覆就是還沒回覆。', '暫時不用替沉默配旁白。'],
  ['今天不必交出所有答案。', '本店也沒有考卷。'],
  ['有些誤會還需要一句話。', '但不必在腦中排練一整夜。'],
  ['事情有它的麻煩。', '不必再加一份妳很差。'],
  ['不舒服已經很累了。', '再罵自己不會打折。'],
  ['這口氣先放著。', '不用帶它去刷牙。'],
  ['今天沒有表現完美。', '本喵也沒有。'],
  ['每個人的注意力都很忙。', '妳不用替他們加班看自己。'],
  ['有些尷尬只有一下。', '不用替它租長期套房。'],
  ['腦袋開太多視窗了。', '今晚不用每個都讀完。'],
  ['那句話不必收藏。', '又不是限量版。'],
  ['不是所有事情都要今晚定案。', '本店的印章也會休息。'],
  ['妳今天已經在場了。', '不用半夜再演一次。'],
  ['有些人說完就忘了。', '妳不用當他的逐字稿。'],
  ['今天的事有今天的長度。', '不必把它拉成一輩子。'],
  ['想清楚跟想很久不一樣。', '本喵看得出來。'],
  ['需要處理的就留一小步。', '不用順便留一整晚。'],
  ['別人的一句評語。', '還沒資格替妳寫自傳。'],
  ['這件事很煩。', '但它不必當今晚的主角。'],
  ['今天不是每件事都有道理。', '本喵開店也是。'],
  ['不喜歡就是不喜歡。', '不用附三頁理由。'],
  ['有些問題先等一句回覆。', '不是等妳把自己想壞。'],
  ['今晚不必開檢討會。', '出席的只有妳，很不划算。'],
  ['事情暫時沒答案。', '不代表答案是妳不好。'],
  ['這段回憶播放太久了。', '本喵都聽膩了。'],
  ['今天不想笑也行。', '本店沒有服務態度評分。'],
  ['難過不用附收據。', '本喵看到了。'],
  ['有些話還沒說清楚。', '不等於妳整個人說不清楚。'],
  ['今天的爛事不值得加班。', '妳的晚上還有別的用途。'],
  ['到這裡就先停。', '本店不做深夜續攤。'],
  ['想不通就先不要通。', '又不是水管。'],
  ['這件事已經夠煩了。', '不用再替它寫續集。'],
  ['腦內會議散了吧。', '反正也沒人做會議紀錄。'],
  ['別替別人猜台詞。', '猜錯了也沒稿費。'],
  ['今天的重播到此為止。', '遙控器還在妳手上。'],
  ['這口氣不用隨身攜帶。', '它又沒有行動支付。'],
  ['尷尬不會幫妳洗衣服。', '先把它放旁邊。'],
  ['別在腦裡養這件事了。', '飼料很貴。'],
  ['今晚沒有頒獎典禮。', '不用競選最會責怪自己。'],
  ['妳不是客服中心。', '不必二十四小時接住所有事。'],
  ['別人的心情很難翻譯。', '本喵也沒帶字典。'],
  ['今天講錯的那句話。', '沒有辦法靠重播修音。'],
  ['有些事不值得夜間施工。', '鄰居的大腦也要睡。'],
  ['這件事不是連續劇。', '不用每天準時收看。'],
  ['煩惱也不是收藏品。', '不用湊齊全套。'],
  ['事情先放這。', '別拿回去當枕頭。'],
  ['腦袋不是烤箱。', '不用把那句話一直回溫。'],
  ['今天沒有滿分。', '又不是買便當集點。'],
  ['晚上的時間有限。', '爛事不必佔最佳座位。'],
  ['那個尷尬場面。', '沒有必要升級成導演版。'],
  ['人類很愛猜別人怎麼想。', '本喵比較想猜晚餐在哪。'],
  ['先把肩膀放下來。', '它沒領主管津貼。'],
  ['今天不必整理好整個人生。', '桌子有一小塊空位就行。'],
  ['煩的事先別加熱了。', '越煮也不會變好吃。'],
  ['不是每件事都值得追究到底。', '有些底下只有灰塵。'],
  ['先不替沉默編故事。', '本店不收長篇小說。'],
  ['今天到此收工。', '腦袋打卡機也拔掉吧。'],
  ['別把一句話裝成整箱。', '本喵搬不動。'],
  ['這件事暫時放旁邊。', '它不會搶走妳的棉被。'],
  ['那口氣不用留到早餐。', '放隔夜也不會變香。'],
  ['今晚不是辯論賽。', '不用在浴室補上最佳答辯。'],
  ['問題可以排隊。', '晚餐不用讓位。'],
  ['不必替所有人保持滿意。', '本喵連罐頭都會挑。'],
  ['那句話的保固過了。', '不用一直送回腦袋維修。'],
  ['本店今天不延長營業。', '內耗也沒有會員優惠。'],
  ['今天辛苦了。', '這句沒有附帶任務。'],
  ['不用急著恢復正常。', '今晚只是今晚。'],
  ['這件事讓妳不舒服。', '本喵沒有當作沒看到。'],
  ['有些話可以慢一點說。', '不必先在心裡打自己。'],
  ['今天的妳已經很累了。', '剩下那句責怪先省下。'],
  ['這次沒做好一件事。', '不是整個妳都沒做好。'],
  ['不想再想也可以。', '本喵先替妳看著這張桌子。'],
  ['今晚不用證明什麼。', '坐一下也算有來過。'],
  ['難受沒有比較表。', '本店不問別人有多慘。'],
  ['有些事還需要時間。', '不用把時間都怪到自己身上。'],
  ['今天到這裡可以了。', '本喵不是隨便敷衍妳。'],
  ['先留一點力氣給自己。', '剩下的話不急著接。'],
  ['這口氣有人看到了。', '不用再放大一次。'],
  ['妳不必現在就有答案。', '本喵也還沒想好晚餐。'],
  ['還需要處理的事慢慢排。', '不需要順便判自己有罪。'],
  ['好了，退下吧。', '本喵也要下班。'],
  ['紙條看完了。', '現在輪到本喵閉眼。'],
  ['今天的功德差不多了。', '我媽有意見叫她來上班。'],
  ['人類的事情真多。', '本喵的事情只有這塊暖桌子。'],
  ['妳的這筆交易結束了。', '本喵的午睡即將開始。'],
].map((lines, index) => Object.freeze({ id: `ending-${String(index + 1).padStart(3, '0')}`, lines: Object.freeze(lines) })));

export function selectEndingQuote() {
  let recent = [];
  try {
    const saved = JSON.parse(localStorage.getItem('recentEndingQuoteIds') || '[]');
    if (Array.isArray(saved)) recent = saved.filter(id => ENDING_QUOTES.some(quote => quote.id === id)).slice(-10);
  } catch { /* Storage can be unavailable; preserve this visit's recent quotes. */ }
  recent = [...new Set([...endingQuoteMemory, ...recent])].slice(-10);
  const available = ENDING_QUOTES.filter(quote => !recent.includes(quote.id));
  const quote = available[Math.floor(Math.random() * available.length)];
  endingQuoteMemory = [...recent, quote.id].slice(-10);
  try { localStorage.setItem('recentEndingQuoteIds', JSON.stringify(endingQuoteMemory)); } catch { /* No storage requirement to finish a transaction. */ }
  return quote;
}
let endingQuoteMemory = [];
let endingQuoteCleanup;

async function playEndingQuote(token) {
  // Let the existing transaction finish setting its Ending text first.
  await Promise.resolve();
  const active = () => token === revision && currentState === 'ENDING' && !document.querySelector('.game').classList.contains('departing');
  if (!active()) return;
  const box = document.querySelector('.shop-dialogue');
  box.replaceChildren();
  await sleep(500);
  if (!active()) return;
  const quote = selectEndingQuote();
  const animations = [];
  let previousEyes;
  endingQuoteCleanup = () => { animations.forEach(animation => animation.cancel()); previousEyes?.remove(); box.replaceChildren(); };
  const reveal = text => {
    const line = document.createElement('span');
    line.style.display = 'block';
    line.textContent = text;
    box.append(line);
    animations.push(line.animate([{ opacity: 0 }, { opacity: 1 }], { duration: reducedMotion() ? 0 : 500, fill: 'both', easing: 'ease-out' }));
  };
  reveal(quote.lines[0]);
  await sleep(500);
  if (!active()) return;
  reveal(quote.lines[1]);
  await sleep(500);
  if (!active()) return;
  const portrait = cat();
  previousEyes = portrait.cloneNode();
  previousEyes.classList.add('ending-eye-before');
  previousEyes.alt = '';
  previousEyes.setAttribute('aria-hidden', 'true');
  previousEyes.style.inset = '0';
  portrait.parentElement.append(previousEyes);
  portrait.src = poses.blink;
  const closing = previousEyes.animate([{ opacity: 1 }, { opacity: 0 }], { duration: reducedMotion() ? 0 : 1000, fill: 'forwards', easing: 'ease-in-out' });
  animations.push(closing);
  await closing.finished.catch(() => {});
  previousEyes.remove();
}

export function presentState(state) {
  endingQuoteCleanup?.();
  endingQuoteCleanup = undefined;
  const previousState = currentState;
  currentState = state;
  const token = ++revision;
  clearTimeout(idleTimer);
  document.querySelector('.game').classList.remove('approaching');
  syncKeyboard();
  if (['HOME', 'INPUT', 'ENDING'].includes(state)) {
    document.querySelector('.ritual-layer').replaceChildren();
    delete document.querySelector('.game').dataset.phase;
    if (state !== 'ENDING' || previousState !== 'REJECTED') document.querySelector('.counter-note').replaceChildren();
  }
  if (state === 'HOME') {
    setPose('idle');
    cat().src = poses.idle;
    dialogue('');
    (async () => {
      await Promise.all([posesReady, ...Array.from(document.querySelectorAll('.stall img'), image => image.decode().catch(() => {}))]);
      if (token !== revision) return;
      await sleep(800);
      if (!reducedMotion()) await blink(token);
      await sleep(200);
      if (token !== revision) return;
      dialogue('……有事？');
      if (!reducedMotion()) scheduleBlink(token);
    })();
  } else if (state === 'INPUT') {
    prepareResults();
    dialogue('');
  } else if (state === 'SUBMITTED') {
    setPose('listening');
    dialogue('讓我看看。');
  } else if (state === 'INSPECTING') {
    setPose('inspecting');
  } else if (['ACCEPTED','PARTIAL','REJECTED'].includes(state)) {
    setPose({ACCEPTED:'accept',PARTIAL:'partial',REJECTED:'reject'}[state]);
  } else if (state === 'ENDING') {
    setPose('idle');
    playEndingQuote(token);
  }
}
