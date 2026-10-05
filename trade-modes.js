// No input, inference, persistence or remote services in the silent route.
import { dialogue, setPose } from './presentation.js';

export const SILENT_CHOICES = Object.freeze([
  { id: 'NO_ACTION', label: '沒有，只是想到還很煩', outcome: 'ACCEPT', response: {
    lines: ['行。', '這種可以丟。'], take: '', giveBack: '', issue: '', nextStep: '',
  } },
  { id: 'UNRESOLVED', label: '有，事情還沒處理完', outcome: 'REJECT', response: {
    lines: ['這個先不收。', '事情都還沒完，丟什麼丟。'],
    issue: '這件事還有一步沒處理完。', nextStep: '先把妳下一步要做的事弄清楚。',
  } },
  { id: 'SELF_JUDGMENT', label: '我一直在怪自己', outcome: 'PARTIAL', response: {
    lines: ['喔。', '原來妳還多塞了一件。', '事情可以留下。', '一直罵自己的那段，拿回去。'],
    take: '那件事帶來的不舒服', giveBack: '一直責怪自己的那段', issue: '', nextStep: '',
  } },
  { id: 'UNKNOWN', label: '我也不知道', outcome: 'TEMP_HOLD', response: {
    lines: ['……行。', '那先放旁邊。'], closing: '等妳知道這包是要丟還是要處理，再來。',
  } },
].map(choice => Object.freeze({ ...choice, response: Object.freeze({
  ...choice.response, lines: Object.freeze(choice.response.lines),
}) })));

export function silentResultFor(id) {
  const choice = SILENT_CHOICES.find(item => item.id === id);
  if (!choice) throw new Error('Unknown silent option');
  return { silentMode: true, outcome: choice.outcome, response: choice.response };
}

const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

const silentModeIntroResponses = Object.freeze([
  ['不想講？', '太好了，本喵也不想聽。'],
  ['不用交代案情。', '本店只負責估價。'],
  ['不用跟本喵說。', '我媽又沒叫我做客服。'],
  ['想著就好。', '本喵不需要知道妳全部的人生。'],
  ['不用說。', '本喵沒有那麼好奇。'],
  ['行。', '本喵也沒有很想知道。'],
  ['用想的就好。', '省得本喵還要看。'],
  ['不說也行。', '省一點彼此的時間。'],
].map(lines => Object.freeze(lines)));
let lastSilentIntro;

export function showTradeModes({ game, panel, revealInput, sound, onWrite, onResult }) {
  game.classList.add('trade-mode-open');
  panel.innerHTML = `<article class="paper input-paper trade-mode-paper"><div class="paper-top">爛情緒回收所 <span>一件就好</span></div><button class="primary mode-option" id="write-mode" type="button">寫下來</button><button class="primary mode-option" id="silent-mode" type="button">不想講，用想的</button></article>`;
  const paper = panel.querySelector('.trade-mode-paper');
  let selected = false;
  const choose = action => {
    if (selected || paper.inert) return;
    selected = true;
    game.classList.remove('trade-mode-open');
    action();
  };
  panel.querySelector('#write-mode').onclick = () => choose(onWrite);
  panel.querySelector('#silent-mode').onclick = () => choose(() => showSilentMode({ game, panel, onResult }));
  revealInput(paper).then(revealed => { if (revealed) sound('paper'); });
}

async function showSilentMode({ game, panel, onResult }) {
  game.classList.add('silent-mode');
  const candidates = silentModeIntroResponses.filter(lines => lines !== lastSilentIntro);
  const intro = candidates[Math.floor(Math.random() * candidates.length)];
  lastSilentIntro = intro;
  panel.innerHTML = `<article class="paper input-paper silent-think-paper"><div class="paper-top">爛情緒回收所 <span>不用寫</span></div><p class="silent-prompt"></p><button class="primary" id="silent-ready" type="button" hidden>嗯，想好了</button></article>`;
  dialogue(intro[0]);
  panel.querySelector('.silent-prompt').textContent = intro[0];
  await pause(900);
  dialogue(intro[1]);
  panel.querySelector('.silent-prompt').textContent = intro[1];
  await pause(900);
  dialogue('想好了再叫我。');
  panel.querySelector('.silent-prompt').textContent = '想好了再叫我。';
  const ready = panel.querySelector('#silent-ready');
  ready.hidden = false;
  ready.onclick = async () => {
    if (ready.disabled) return;
    ready.disabled = true;
    setPose('thinking');
    await pause(350);
    dialogue('……我只問一個。');
    await pause(500);
    panel.innerHTML = `<article class="paper input-paper clarification-paper silent-question-paper"><div class="paper-top">爛情緒回收所 <span>只問這一個</span></div><p class="silent-prompt">這件事現在還需要妳做什麼嗎？</p><div class="clarify-choices"></div></article>`;
    dialogue('這件事現在還需要妳做什麼嗎？');
    let answered = false;
    for (const choice of SILENT_CHOICES) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'primary'; button.textContent = choice.label;
      button.dataset.silentOption = choice.id;
      button.onclick = () => {
        if (answered) return;
        answered = true;
        for (const option of panel.querySelectorAll('button')) option.disabled = true;
        game.classList.remove('silent-mode');
        onResult(silentResultFor(choice.id));
      };
      panel.querySelector('.clarify-choices').append(button);
    }
  };
}
