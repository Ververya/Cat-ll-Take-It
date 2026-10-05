// Local Web Audio synthesis: no audio download or external service.
let context;
export function unlockAudio() {
  try {
    context ||= new (window.AudioContext || window.webkitAudioContext)();
    return context.resume().catch(() => {});
  } catch { return Promise.resolve(); }
}
function envelope(duration, volume) {
  const gain=context.createGain(), now=context.currentTime;
  gain.gain.setValueAtTime(.0001,now);
  gain.gain.exponentialRampToValueAtTime(volume,now+.008);
  gain.gain.exponentialRampToValueAtTime(.0001,now+duration);
  gain.connect(context.destination);
  return {gain,now};
}
function tone(frequency, duration, volume, end=frequency) {
  const {gain,now}=envelope(duration,volume), oscillator=context.createOscillator();
  oscillator.type='sine'; oscillator.frequency.setValueAtTime(frequency,now);
  oscillator.frequency.exponentialRampToValueAtTime(end,now+duration);
  oscillator.connect(gain); oscillator.start(now); oscillator.stop(now+duration+.02);
  oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
}
export async function sound(type) {
  try {
    await unlockAudio();
    if (!context || context.state!=='running') return;
    if(type==='coin') {
      tone(1760,.42,.025); tone(2816,.22,.012); tone(4224,.12,.005);
    } else if(type==='paper') {
      const duration=.38, {gain,now}=envelope(duration,.055);
      const buffer=context.createBuffer(1,Math.ceil(context.sampleRate*duration),context.sampleRate);
      const samples=buffer.getChannelData(0);
      for(let i=0;i<samples.length;i++) samples[i]=(Math.random()*2-1)*(.45+.55*Math.sin(i/context.sampleRate*38)**2);
      const source=context.createBufferSource(), filter=context.createBiquadFilter();
      filter.type='bandpass';filter.frequency.value=1450;filter.Q.value=.7;
      source.buffer=buffer;source.connect(filter);filter.connect(gain);source.start(now);
      source.onended=()=>{source.disconnect();filter.disconnect();gain.disconnect();};
    } else {
      tone(type==='stamp'?145:95,.16,.055,45); tone(330,.035,.012,130);
    }
  } catch { /* The physical interaction remains usable without sound. */ }
}
