export function scene() {
  return `<div class="night" aria-hidden="true"></div>
  <div class="scene-camera">
    <div class="stall" aria-label="深夜紙燈籠下，貓老闆經營的木製爛情緒回收攤">
      <img class="stall-shell" src="assets/environment/stall.webp" alt="" fetchpriority="high" draggable="false">
      <h1 class="shop-title">爛情緒回收所</h1>
      <p class="mom-sign">我媽叫我累積功德</p>
      <img class="lantern" src="assets/environment/lantern.webp" alt="暖黃色紙燈籠" draggable="false">
      <img class="recycle-box" src="assets/props/recycle-box.webp" alt="寫著人類不要的東西的回收紙箱" draggable="false">
      <div class="cat"><img class="cat-portrait" src="assets/cat/cat-idle.webp" alt="設定圖中的灰色英短貓老闆，趴在櫃台上，半睜著琥珀色眼睛" draggable="false" fetchpriority="high"></div>
      <img class="cat-paws" src="assets/cat/cat-idle.webp" alt="" draggable="false">
      <img class="wood-counter" src="assets/environment/wood-counter.webp" alt="" draggable="false">
      <img class="coin-jar" src="assets/props/coin-jar.webp" alt="零錢罐" draggable="false">
      <img class="paper-stack" src="assets/props/paper-stack.webp" alt="一疊回收單" draggable="false">
      <img class="stamp-tool" src="assets/props/stamp.webp" alt="木柄紅印章" draggable="false">
      <img class="table-coin" src="assets/props/coin.webp" alt="一元硬幣" draggable="false">
      <div class="price"><span>今日收購價</span><p>爛情緒 <strong>$1</strong> / 件</p><hr><small>本喵有權拒收。</small></div>
      <div class="shop-dialogue" aria-live="polite"></div>
      <div class="counter-note" aria-label="放在桌面上的回收紙條"></div>
      <div class="ritual-layer" aria-hidden="true"></div>
    </div>
  </div>`;
}
