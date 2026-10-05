// Local UI only. This flag is the sole session value written by this module.
const ACKNOWLEDGED_KEY = 'privacyNoticeAcknowledged';
let acknowledgedInMemory = false;

export function privacyNoticeAcknowledged() {
  try { return acknowledgedInMemory || sessionStorage.getItem(ACKNOWLEDGED_KEY) === 'true'; }
  catch { return acknowledgedInMemory; }
}

export function showPrivacyRulePaper({ game, panel, onContinue, reopen = false }) {
  if (panel.querySelector('.privacy-rule-paper')) return;
  // Preserve the actual input nodes/listeners, including unsent text and selection.
  const previous = document.createDocumentFragment();
  while (panel.firstChild) previous.append(panel.firstChild);
  game.classList.add('privacy-rule-open');
  const paper = document.createElement('article');
  paper.className = 'paper privacy-rule-paper';
  paper.setAttribute('aria-label', '本店保密規則');
  paper.innerHTML = `<div class="paper-top">🔒 本店保密規則</div><h2 tabindex="-1">放心罵，本喵不告密。</h2><p>你寫的爛事，只留在你的裝置。</p><p class="privacy-rule-promise">不保存・不上傳・不傳給 AI・我媽也看不到</p><p>關掉頁面，本喵就忘了。</p><p class="privacy-rule-cat">我媽叫我累積功德，<br>沒叫我蒐集八卦。</p><button class="primary" type="button">知道了，讓我賣</button>`;
  panel.append(paper);
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  paper.animate([
    { transform: 'translateY(-38px) rotate(-2deg)', opacity: 0 },
    { transform: 'translateY(0) rotate(-2deg)', opacity: 1 },
  ], { duration: reducedMotion ? 0 : 650, easing: 'ease-out' });
  paper.querySelector('h2').focus({ preventScroll: true });
  paper.querySelector('button').onclick = async event => {
    event.currentTarget.disabled = true;
    acknowledgedInMemory = true;
    try { sessionStorage.setItem(ACKNOWLEDGED_KEY, 'true'); } catch { /* Session-memory fallback. */ }
    const retract = paper.animate([
      { transform: 'translateY(0) rotate(-2deg)', opacity: 1 },
      { transform: 'translateY(-65px) rotate(-3deg)', opacity: 0 },
    ], { duration: reducedMotion ? 0 : 320, easing: 'ease-in', fill: 'forwards' });
    await retract.finished.catch(() => {});
    await new Promise(resolve => setTimeout(resolve, 120));
    paper.remove();
    game.classList.remove('privacy-rule-open');
    if (reopen) {
      panel.append(previous);
      panel.querySelector('.privacy-rule-link')?.focus({ preventScroll: true });
    } else {
      onContinue();
    }
  };
}
