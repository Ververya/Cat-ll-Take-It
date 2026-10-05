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
export function presentState(state) {
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
  }
}
