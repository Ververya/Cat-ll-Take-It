// Browser integration tests against the existing game, not a mock form.
export async function runPrivacyRuleTests() {
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  const until = async check => {
    for (let i = 0; i < 300; i++) { if (check()) return; await sleep(20); }
    throw new Error('Privacy rule flow timed out');
  };
  let assertions = 0;
  const assert = (condition, message) => { assertions++; if (!condition) throw new Error(message); };
  const game = document.querySelector('.game');
  const initialStats = localStorage.getItem('bad-mood-recycling-v1');
  const initialEndings = localStorage.getItem('recentEndingQuoteIds');
  await document.fonts.ready;
  await sleep(300);
  const initialResources = performance.getEntriesByType('resource').length;
  document.querySelector('#start').click();
  const paper = document.querySelector('.privacy-rule-paper');
  assert(!!paper && !document.querySelector('textarea'), 'First visit must show rules before input');
  assert(game.dataset.state === 'HOME', 'Do not enter input state before confirmation');
  for (const text of [
    '📜 爛情緒買賣須知', '第一次來？', '先看一下，本店有規矩。',
    '① 收購價格', '本店收購爛情緒，一件 $1。', '值不值得收，', '本喵說了算。',
    '② 保密規則', '🔒 放心罵，本喵不告密。', '你寫的爛事，只留在你的裝置。',
    '不保存・不上傳・不傳給 AI・我媽也看不到',
    '③ 本喵有權拒收', '有些東西不是垃圾。', '是妳還沒處理完的事。',
    '我媽叫我累積功德，', '沒叫我蒐集八卦。', '知道了，讓我賣',
  ]) assert(paper.textContent.includes(text), 'Required wording missing: ' + text);
  await sleep(750);
  assert(performance.getEntriesByType('resource').length === initialResources, 'Rule appearance requested resources');
  paper.querySelector('button').click();
  await until(() => !!document.querySelector('textarea') && !document.querySelector('form').inert);
  assert(sessionStorage.getItem('privacyNoticeAcknowledged') === 'true', 'Session acknowledgement missing');
  assert(game.dataset.state === 'INPUT', 'Original input state not resumed');
  assert(document.querySelector('.shop-dialogue').textContent === '放桌上。', 'Original input dialogue changed');
  assert(!document.querySelector('.privacy-notice'), 'Old full notice remains');
  assert(document.querySelector('.privacy-rule-link').textContent === '🔒 本喵不告密', 'Small entry missing');

  // A non-transaction cat interaction returns home without changing debt/ending.
  document.querySelector('textarea').value = '你好可愛';
  document.querySelector('form').requestSubmit();
  await until(() => game.dataset.state === 'HOME');
  document.querySelector('#start').click();
  assert(!document.querySelector('.privacy-rule-paper') && !!document.querySelector('textarea'), 'Same-session transaction should skip rules');
  await until(() => !document.querySelector('form').inert);

  const input = document.querySelector('textarea');
  const form = document.querySelector('form');
  const marker = 'PRIVATE_TEST_948731_不要上傳';
  input.value = marker;
  input.setSelectionRange(3, 8);
  input.dispatchEvent(new Event('input'));
  await document.fonts.ready;
  await sleep(300);
  const reopenResources = performance.getEntriesByType('resource').length;
  const pose = document.querySelector('.cat-portrait').src;
  document.querySelector('.privacy-rule-link').click();
  assert(!!document.querySelector('.privacy-rule-paper'), 'Reopen failed');
  assert(!document.querySelector('textarea'), 'Original input was not set aside');
  await sleep(750);
  document.querySelector('.privacy-rule-paper button').click();
  await until(() => !!document.querySelector('textarea'));
  await sleep(100);
  assert(document.querySelector('form') === form && document.querySelector('textarea') === input, 'Original DOM/listeners replaced');
  assert(input.value === marker && input.selectionStart === 3 && input.selectionEnd === 8, 'Draft or caret changed');
  assert(!form.inert && game.dataset.state === 'INPUT', 'Input did not resume');
  assert(document.querySelector('.cat-portrait').src === pose, 'Reopen changed cat pose');
  assert(performance.getEntriesByType('resource').length === reopenResources, 'Reopen/close requested resources');
  assert(!JSON.stringify(localStorage).includes(marker) && !JSON.stringify(sessionStorage).includes(marker), 'Raw text persisted');
  assert(localStorage.getItem('bad-mood-recycling-v1') === initialStats, 'Debt/count changed');
  assert(localStorage.getItem('recentEndingQuoteIds') === initialEndings, 'Ending history changed');
  assert(Object.keys(sessionStorage).every(key => key === 'privacyNoticeAcknowledged'), 'Unexpected session data');
  input.value = '';
  input.dispatchEvent(new Event('input'));
  return { assertions, firstVisit: true, sameSessionSkip: true, reopen: true, draftPreserved: true, noRuleTracking: true };
}
