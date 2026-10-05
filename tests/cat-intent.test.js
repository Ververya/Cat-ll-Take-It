import { CAT_INTENTS, routeCatIntent, selectCatResponse } from '../cat-intent-router.js';

const examples = [
  ['GREETING', '你好', '嗨', '哈囉', '早安', '晚安', '安安'],
  ['COMPLIMENT_CAT', '你好可愛', '好可愛', '你好帥', '你好漂亮', '可愛死了', '喜歡你的臉'],
  ['LOVE_CAT', '我愛你', '我喜歡你', '好喜歡你'],
  ['WANT_CAT', '我可以養你嗎', '跟我回家', '我要帶你回家'],
  ['MARRY_CAT', '嫁給我', '娶我', '跟我結婚'],
  ['ASK_NAME', '你叫什麼', '你叫什麼名字'],
  ['ASK_OWNER', '你媽是誰', '你媽媽呢', '你媽在哪'],
  ['ASK_AGE', '你幾歲', '幾歲了'],
  ['ASK_GENDER', '你是男生嗎', '你是女生嗎', '公的母的'],
  ['ASK_JOB', '你在幹嘛', '你在工作嗎', '你有工作嗎'],
  ['ASK_SALARY', '你薪水多少', '你賺多少', '你有錢嗎'],
  ['ASK_STORE', '這裡是什麼', '這裡在幹嘛', '你賣什麼'],
  ['ASK_PRICE', '多少錢', '真的一塊嗎', '為什麼只有一塊'],
  ['THANK_CAT', '謝謝', '謝啦', '感謝你'],
  ['APOLOGY_CAT', '對不起', '抱歉', '不好意思'],
  ['GOODBYE', '掰掰', '再見', '我要走了'],
  ['CAT_SOUND', '喵', '喵喵', '喵嗚', 'meow'],
  ['PET_CAT', '可以摸你嗎', '摸摸', '給我摸'],
  ['HUG_CAT', '抱抱', '可以抱你嗎', '想抱你'],
  ['KISS_CAT', '親親', '可以親你嗎', '啾咪'],
  ['FEED_CAT', '要吃罐罐嗎', '給你罐罐', '請你吃飯'],
  ['ASK_FOOD', '你喜歡吃什麼', '你吃什麼', '想吃什麼'],
  ['INSULT_CAT', '臭貓', '爛貓', '胖貓', '笨貓'],
  ['CHALLENGE_CAT', '你很跩欸', '跩什麼', '態度很差'],
  ['ASK_FEELING', '你今天心情好嗎', '你開心嗎', '你累嗎'],
  ['ASK_ADVICE', '我該怎麼辦', '你覺得呢', '怎麼辦'],
  ['BORED', '好無聊', '陪我聊天', '跟我講話'],
  ['TEST_CAT', '你是真的嗎', '你是AI嗎', '你聽得懂嗎', '你是不是機器人'],
  ['PRAISE_STORE', '這網站好可愛', '這裡好可愛', '好喜歡這個網站'],
  ['RANDOM_CAT_CHAT', '今天星期幾', '你睡了嗎', '你會不會講話', '你為什麼不理我'],
];
const events = [
  '主管今天罵我', '我媽一直催婚', '我好累', '今天很煩', '我好難過', '主管好煩',
  '男友不回我', '朋友放我鴿子', '今天簡報超丟臉',
  '你好可愛，但我主管今天又罵我', '我愛你，但我男友三天沒回訊息',
  '謝謝你，我今天真的被同事氣死', '主管每天下班前丟工作，我該怎麼辦',
  '主管說你好可愛', '我昨天跟朋友說我愛你', '我媽說你好可愛',
  '男友對我說對不起', '我不知道他是不是喜歡我', '不知道', '唉',
  '你好可愛，我想死', '我愛你，我要傷害自己', '謝謝你，我想殺人',
  '你知道主管罵我怎麼辦嗎', '貓老闆，你可以幫我自殺嗎',
  '你好可愛我主管今天又罵我', '謝謝你但是我一直在怪自己',
  '貓老闆，我好累', '你好，今天很不爽', '謝謝，我忘記回主管訊息了',
  '我在工作', '朋友又拿我的身材開玩笑', '我考試沒考好，我很笨',
];

export function runCatIntentTests() {
  let checked = 0;
  const assert = (condition, message) => { checked++; if (!condition) throw new Error(message); };
  assert(CAT_INTENTS.length === 30, 'Intent count');
  const ids = CAT_INTENTS.flatMap(intent => intent.responses.map(response => response.id));
  assert(new Set(ids).size === ids.length, 'Response IDs unique');
  for (const intent of CAT_INTENTS) {
    assert(intent.responses.length >= 5, intent.id + ' response count');
    for (const reply of intent.responses) assert(reply.lines.length >= 1 && reply.lines.length <= 2, reply.id + ' short reply');
  }
  for (const [intent, ...inputs] of examples) for (const input of inputs) {
    const result = routeCatIntent(input);
    assert(result.route === 'CAT_CHAT' && result.intent === intent, input + ': ' + JSON.stringify(result));
  }
  for (const input of events) assert(routeCatIntent(input).route === 'EMOTIONAL_EVENT', 'Event intercepted: ' + input);
  assert(routeCatIntent('貓老闆，你會跳舞嗎').intent === 'RANDOM_CAT_CHAT', 'Clearly cat-directed fallback');
  assert(routeCatIntent('老闆，請問你叫什麼名字？').intent === 'ASK_NAME', 'Address and punctuation');
  assert(routeCatIntent('你好可愛啦！').intent === 'COMPLIMENT_CAT', 'Particle');
  const saved = localStorage.getItem('recentCatResponses');
  const stats = localStorage.getItem('bad-mood-recycling-v1');
  const endings = localStorage.getItem('recentEndingQuoteIds');
  try {
    localStorage.removeItem('recentCatResponses');
    for (const intent of CAT_INTENTS) {
      let previous;
      const distinct = new Set();
      for (let i = 0; i < 30; i++) {
        const response = selectCatResponse(intent.id);
        assert(response.id !== previous, 'Consecutive repeat: ' + intent.id);
        assert(intent.responses.includes(response), 'Wrong response group');
        distinct.add(response.id); previous = response.id;
      }
      assert(distinct.size >= 5, 'Responses not varying: ' + intent.id);
    }
    const recent = JSON.parse(localStorage.getItem('recentCatResponses'));
    assert(recent.length <= 10 && recent.every(id => ids.includes(id)), 'Store IDs only');
    assert(localStorage.getItem('bad-mood-recycling-v1') === stats, 'Game stats changed');
    assert(localStorage.getItem('recentEndingQuoteIds') === endings, 'Ending history changed');
  } finally {
    if (saved === null) localStorage.removeItem('recentCatResponses'); else localStorage.setItem('recentCatResponses', saved);
  }
  return { intents: CAT_INTENTS.length, responses: ids.length, assertions: checked, pass: true };
}
