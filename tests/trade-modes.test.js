// Run against the production build in an isolated browser profile.
export async function runTradeModeTests() {
  const original = window.setTimeout;
  window.setTimeout = (fn, ms, ...args) => original(fn, Math.min(ms, 15), ...args);
  const sleep = ms => new Promise(resolve => original(resolve, ms));
  const game = document.querySelector('.game');
  const until = async check => {
    for (let i = 0; i < 750; i++) { if (check()) return; await sleep(20); }
    throw Error('Timeout in ' + game.dataset.state);
  };
  let assertions = 0;
  const assert = (ok, message) => { assertions++; if (!ok) throw Error(message); };
  const results = [];
  const introPairs = [
    ['不想講？', '太好了，本喵也不想聽。'],
    ['不用交代案情。', '本店只負責估價。'],
    ['不用跟本喵說。', '我媽又沒叫我做客服。'],
    ['想著就好。', '本喵不需要知道妳全部的人生。'],
    ['不用說。', '本喵沒有那麼好奇。'],
    ['行。', '本喵也沒有很想知道。'],
    ['用想的就好。', '省得本喵還要看。'],
    ['不說也行。', '省一點彼此的時間。'],
  ];
  let previousIntro;
  let textareasCreated = 0;
  const observer = new MutationObserver(records => {
    for (const record of records) for (const node of record.addedNodes) {
      if (node.nodeType === 1 && (node.matches('textarea') || node.querySelector('textarea'))) textareasCreated++;
    }
  });
  observer.observe(document.querySelector('.interaction'), {childList:true, subtree:true});
  const openModes = async () => {
    document.querySelector('#start').click();
    if (document.querySelector('.privacy-rule-paper')) document.querySelector('.privacy-rule-paper button').click();
    await until(() => document.querySelector('#silent-mode') && !document.querySelector('.trade-mode-paper').inert);
    assert(!document.querySelector('textarea'), 'Mode entry must precede free text');
    assert(document.querySelector('#write-mode').textContent === '寫下來', 'Write entry missing');
    assert(document.querySelector('#silent-mode').textContent === '不想講，用想的', 'Silent entry missing');
  };
  for (const [id, outcome, paid] of [
    ['NO_ACTION', 'ACCEPTED', 1], ['UNRESOLVED', 'REJECTED', 0],
    ['SELF_JUDGMENT', 'PARTIAL', 1], ['UNKNOWN', 'TEMP_HOLD', 0],
  ]) {
    const before = JSON.parse(localStorage.getItem('bad-mood-recycling-v1') || '{"count":0,"debt":0}');
    await openModes();
    document.querySelector('#silent-mode').click();
    const prompt = document.querySelector('.silent-prompt');
    const intro = introPairs.find(pair => pair[0] === prompt.textContent);
    assert(!!intro, 'Opening line outside the eight approved pairs');
    assert(intro !== previousIntro, 'Consecutive intro repeated');
    previousIntro = intro;
    assert(document.querySelector('#silent-ready').hidden, 'Ready button appeared before intro');
    const observed = [];
    const introObserver = new MutationObserver(() => observed.push(prompt.textContent));
    introObserver.observe(prompt, {childList:true});
    await until(() => !document.querySelector('#silent-ready').hidden);
    introObserver.disconnect();
    assert(observed.includes(intro[1]), 'Second intro line missing or mismatched');
    assert(prompt.textContent === '想好了再叫我。', 'Shared closing line missing');
    document.querySelector('#silent-ready').click();
    await until(() => document.querySelectorAll('[data-silent-option]').length === 4);
    const buttons = [...document.querySelectorAll('[data-silent-option]')];
    assert(buttons.map(button => button.textContent).join('|') === '沒有，只是想到還很煩|有，事情還沒處理完|我一直在怪自己|我也不知道', 'Choices changed');
    assert(buttons.every(button => button.getBoundingClientRect().height >= 44), 'Tap targets too small');
    const visited = [];
    const states = new MutationObserver(() => visited.push(game.dataset.state));
    states.observe(game, {attributes:true, attributeFilter:['data-state']});
    const button = document.querySelector(`[data-silent-option="${id}"]`);
    button.click(); button.click(); // A second click cannot award twice.
    await until(() => game.dataset.state === outcome || game.dataset.state === 'ENDING');
    if (outcome === 'TEMP_HOLD') {
      assert(!!document.querySelector('#hold'), 'Existing hold UI not reused');
      document.querySelector('#hold').click();
      assert(document.querySelector('.small-stamp').textContent === '暫放', 'Hold stamp missing');
    } else {
      await until(() => game.dataset.state === 'ENDING');
      if (outcome === 'REJECTED') assert(document.querySelector('.action-paper').textContent.includes('先把妳下一步要做的事弄清楚。'), 'Reject must use generic next step');
      assert(game.dataset.pose === 'idle', 'Existing ending idle pose not reused');
    }
    states.disconnect();
    assert(!visited.some(state => ['CLARIFY','SUBMITTED','INSPECTING'].includes(state)), 'Silent route ran text inspection or clarify');
    const after = JSON.parse(localStorage.getItem('bad-mood-recycling-v1') || '{"count":0,"debt":0}');
    assert(after.count - before.count === paid && after.debt - before.debt === paid, 'Existing reward accounting changed');
    assert(!document.querySelector('textarea'), 'Silent flow created raw text UI');
    document.querySelector('#leave').click(); await until(() => game.dataset.state === 'HOME');
    results.push({id, outcome, paid, visited});
  }
  observer.disconnect();
  assert(textareasCreated === 0, 'Silent flow briefly created a textarea');
  assert(Object.keys(sessionStorage).every(key => key === 'privacyNoticeAcknowledged'), 'Silent options persisted');
  assert(!document.cookie && !(await indexedDB.databases()).length, 'Unexpected persistence');
  window.setTimeout = original;
  return {assertions, results, textareasCreated};
}
