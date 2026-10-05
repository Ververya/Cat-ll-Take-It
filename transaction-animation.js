// Physical presentation only. Persistence and outcomes stay in app.js.
import { setPose } from './presentation.js';
const wait = ms => new Promise(resolve => setTimeout(resolve, matchMedia('(prefers-reduced-motion: reduce)').matches ? Math.min(ms,80) : ms));
const game = () => document.querySelector('.game');
const stage = () => document.querySelector('.stall');
const layer = () => document.querySelector('.ritual-layer');
function point(element, x=.5, y=.5) {
  const r=element.getBoundingClientRect(), s=stage().getBoundingClientRect(), scale=s.width/stage().offsetWidth;
  return {x:(r.left+r.width*x-s.left)/scale,y:(r.top+r.height*y-s.top)/scale};
}
function vars(element, values) { for (const [key,value] of Object.entries(values)) element.style.setProperty('--'+key,value+'px'); }
const resultPose = () => ({ACCEPTED:'accept',PARTIAL:'partial',REJECTED:'reject'}[game().dataset.state] || 'idle');
export async function playStamp(text, sound) {
  const ink=game().querySelector('.result-stamp'), tool=game().querySelector('.stamp-tool');
  ink.textContent=text; ink.classList.add('ink-pending');
  const target=point(ink), origin=point(tool,.5,1);
  vars(tool,{'stamp-dx':target.x-origin.x,'stamp-dy':target.y-origin.y});
  game().dataset.phase='STAMP'; setPose('push-coin');
  await wait(390); ink.classList.remove('ink-pending'); ink.classList.add('stamp-visible');
  game().classList.add('shake'); sound('stamp'); await wait(280);
  game().classList.remove('shake'); delete game().dataset.phase; setPose(resultPose());
}
export async function discardPaper(paper, sound) {
  const start=point(paper), end=point(game().querySelector('.recycle-box'),.58,.24);
  game().dataset.phase='CRUMPLE'; paper.classList.add('crumple'); sound('paper'); await wait(650);
  setPose('discard'); game().dataset.phase='DISCARD'; paper.classList.add('gone');
  const ball=document.createElement('img'); ball.src='assets/props/paper-ball.webp'; ball.className='flight-ball'; ball.alt='';
  vars(ball,{'start-x':start.x,'start-y':start.y,'mid-x':(start.x+end.x)/2,'mid-y':Math.min(start.y,end.y)-65,'end-x':end.x,'end-y':end.y});
  layer().append(ball); await wait(950); ball.remove(); sound('thud');
  game().querySelector('.recycle-box').classList.add('box-settle'); await wait(350);
  game().querySelector('.recycle-box').classList.remove('box-settle'); delete game().dataset.phase; setPose(resultPose());
}
export async function tearPaper(sound,response) {
  game().querySelector('.submitted-paper').outerHTML='<div class="split-paper tearing"><div class="paper take"><small>本喵收走</small><p>今天發生的爛事</p></div><div class="paper return"><small>退還</small><p>因為這件事而<br>對自己的否定</p></div></div>';
  if(response){game().querySelector('.take p').textContent=response.take;game().querySelector('.return p').textContent=response.giveBack;}
  game().dataset.phase='TEAR'; sound('paper'); await wait(850);
  game().querySelector('.split-paper').classList.remove('tearing'); delete game().dataset.phase;
}
export async function returnPaper(paper, sound) {
  game().dataset.phase='RETURN'; paper.classList.add('returned'); sound('paper'); await wait(900); delete game().dataset.phase;
}
export async function pushCoin(sound) {
  setPose('push-coin'); game().dataset.phase='PUSH_COIN';
  const start=point(game().querySelector('.cat-portrait'),.31,.90), end={x:start.x+22,y:start.y+12};
  const coin=document.createElement('img'); coin.src='assets/props/coin.webp'; coin.alt=''; coin.className='paid-coin';
  vars(coin,{'start-x':start.x,'start-y':start.y,'end-x':end.x,'end-y':end.y}); layer().append(coin);
  await wait(1050); sound('coin');
  const label=document.createElement('span'); label.className='coin-label'; label.textContent='+$1'; label.style.left=(end.x+24)+'px'; label.style.top=(end.y-10)+'px'; layer().append(label);
  await wait(350); delete game().dataset.phase; setPose(resultPose());
}
