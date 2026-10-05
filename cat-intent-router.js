// Browser-only routing and character lines. Unknown input always goes to judgment.
// Reserved pipeline position: a future safety layer belongs before this router.
// This module adds no safety responses and leaves existing judgment safety intact.
const definitions = [
  ['GREETING', /^(?:你好|您好|嗨|哈囉|哈啰|早安|午安|晚安|安安|hi|hello)$/, [
    ['嗯。', '有事放桌上。'], ['晚點也算上班。'], ['招呼收到了。'], ['嗨。', '本喵沒睡。'], ['門開著。', '不是特地等妳。']]],
  ['COMPLIMENT_CAT', /^(?:你|妳|你好|妳好)?(?:好)?(?:可愛|可爱|帥|帅|漂亮)(?:死了)?$|^(?:好)?喜歡你的臉$/, [
    ['本喵知道。'], ['眼光不錯。'], ['不用一直講。', '本喵會當真。'], ['本喵只屬於我媽。'], ['這張臉不打折。']]],
  ['LOVE_CAT', /^(?:我愛你|我爱你|我喜歡你|我喜欢你|好喜歡你|好喜欢你|我好喜歡你)$/, [
    ['這麼突然？', '我媽知道嗎？'], ['先不要。', '我們才認識幾秒。'], ['愛可以。', '罐罐先來。'], ['收到。', '不代表批准。'], ['本喵目前只跟午睡交往。']]],
  ['WANT_CAT', /^(?:我可以養你嗎|我可以养你吗|可以養你嗎|跟我回家|我要帶你回家|我要带你回家)$/, [
    ['不行。', '我有媽。'], ['帶不走。', '本喵有編制。'], ['妳先問我媽。'], ['本喵不是收購品。'], ['家裡有暖桌嗎？', '問問而已。']]],
  ['MARRY_CAT', /^(?:嫁給我|嫁给我|娶我|跟我結婚|跟我结婚)$/, [
    ['不行。', '我媽管很嚴。'], ['聘金是罐罐嗎？'], ['本店不辦婚姻登記。'], ['先排隊。', '不是這個隊。'], ['本喵沒有這項業務。']]],
  ['ASK_NAME', /^(?:你|妳)?叫什麼(?:名字)?$|^(?:你|妳)的名字(?:是什麼)?$/, [
    ['叫老闆。'], ['本喵。', '招牌沒寫履歷。'], ['名字不影響收購價。'], ['我媽叫我上班。', '妳叫我老闆就好。'], ['值班的那隻。']]],
  ['ASK_OWNER', /^(?:你|妳)(?:媽|媽媽)(?:是誰|呢|在哪|在哪裡|在嗎)$/, [
    ['我媽叫我來累積功德。'], ['她不在這。', '妳寫的也不傳給她。'], ['我媽不值夜班。'], ['她只交代開店。', '沒交代收八卦。'], ['找她有事？', '本店不代傳。']]],
  ['ASK_AGE', /^(?:你|妳)?(?:幾歲|几岁)(?:了)?$/, [
    ['夠大了。', '可以自己趴著。'], ['年齡不列入價目表。'], ['上班讓貓顯成熟。'], ['我媽知道。', '本喵懶得算。'], ['換算成人類歲數很麻煩。']]],
  ['ASK_GENDER', /^(?:你|妳)(?:是)?(?:男生|女生|公的|母的)(?:嗎)?$|^公的母的$/, [
    ['本喵是老闆。'], ['上班不用填這格。'], ['這跟妳那包有關嗎？'], ['先看職稱。', '老闆。'], ['本店只分類回收物。']]],
  ['ASK_JOB', /^(?:你|妳)(?:在幹嘛|在干嘛|在做什麼|在工作嗎|有工作嗎)$/, [
    ['上班。', '很明顯吧。'], ['收人類不要的東西。'], ['工作內容？', '聽你們抱怨。'], ['累積功德。', '兼損失睡眠。'], ['看起來像在休息。', '其實也是。']]],
  ['ASK_SALARY', /^(?:你|妳)(?:薪水多少|賺多少|赚多少|有錢嗎|有钱吗)$/, [
    ['一件一塊。', '妳覺得呢。'], ['不要問。', '會傷感情。'], ['本喵是付款的那邊。'], ['帳本看了會醒。'], ['功德目前不能領現。']]],
  ['ASK_STORE', /^(?:這裡|这里)(?:是什麼|在幹嘛|在干嘛|做什麼)$|^(?:你|妳)(?:賣什麼|卖什么)$/, [
    ['爛情緒回收所。', '招牌那麼大。'], ['收購。', '不是販賣。'], ['不用帶垃圾袋。', '寫在紙上就好。'], ['收人類不想帶回家的東西。'], ['我媽安排的夜班。']]],
  ['ASK_PRICE', /^(?:多少錢|多少钱|真的一塊嗎|真的一块吗|為什麼只有一塊|为什么只有一块|一件多少錢)$/, [
    ['一塊。'], ['嫌少？', '那妳拿回去。'], ['情緒二手價不好。'], ['價目表沒有小字陷阱。'], ['一件一塊。', '不是一字一塊。']]],
  ['THANK_CAT', /^(?:謝謝(?:你|妳)?|谢谢(?:你|妳)?|謝啦|谢谢啦|感謝你|感谢你|多謝)$/, [
    ['嗯。'], ['不用。', '下次少帶一點來。'], ['謝我媽。', '她叫我累積功德。'], ['收到。', '謝意不用裝箱。'], ['行了。', '晚餐別忘了。']]],
  ['APOLOGY_CAT', /^(?:對不起|对不起|抱歉|不好意思)$/, [
    ['嗯。', '不用寫檢討。'], ['本喵還沒說什麼。'], ['先把肩膀放下。'], ['這句不收錢。'], ['沒事。', '桌子沒倒。']]],
  ['GOODBYE', /^(?:掰掰|拜拜|再見|再见|我要走了|bye|goodbye)$/, [
    ['走好。'], ['嗯。', '門不用替本喵關。'], ['下班路上別重播。'], ['本喵就不送了。'], ['去吧。', '外面還有妳的晚上。']]],
  ['CAT_SOUND', /^(?:喵+|喵嗚|喵呜|meow|miao)$/, [
    ['？'], ['口音很重。'], ['妳不是本地貓吧。'], ['本喵聽到了。', '不必擴音。'], ['這句不用翻譯。']]],
  ['PET_CAT', /^(?:可以摸你嗎|我可以摸你嗎|摸摸|給我摸|给我摸|想摸你)$/, [
    ['手先放下。'], ['交易歸交易。', '不要動手動腳。'], ['看可以。', '摸另計。'], ['本喵不是觸控螢幕。'], ['先保持一個肉球的距離。']]],
  ['HUG_CAT', /^(?:抱抱|可以抱你嗎|我可以抱你嗎|想抱你)$/, [
    ['不要。'], ['我們還沒有熟到這種程度。'], ['本喵正在上班。'], ['櫃台不提供抱枕。'], ['心意收到。', '手不用過來。']]],
  ['KISS_CAT', /^(?:親親|亲亲|可以親你嗎|可以亲你吗|啾咪|想親你)$/, [
    ['……保全。'], ['冷靜。'], ['妳是不是沒有別的事了。'], ['本喵的臉不是印章。'], ['留給妳家的枕頭。']]],
  ['FEED_CAT', /^(?:要吃罐罐嗎|給你罐罐|给你罐罐|請你吃飯|请你吃饭|要吃小魚乾嗎)$/, [
    ['什麼口味？'], ['先放桌上。'], ['這個可以談。'], ['功德以外的收入。'], ['本喵突然有精神了。']]],
  ['ASK_FOOD', /^(?:你|妳)(?:喜歡吃什麼|喜欢吃什么|吃什麼|吃什么)$|^想吃什麼$/, [
    ['罐罐。', '不用猜太久。'], ['能吃的。', '紙不算。'], ['小魚乾。', '不是情緒口味。'], ['我媽準備的。'], ['先別拿人類煩惱當菜單。']]],
  ['INSULT_CAT', /^(?:臭貓|臭猫|爛貓|烂猫|胖貓|胖猫|笨貓|笨猫)$/, [
    ['說完了嗎？'], ['嗯。', '下一位。'], ['妳是來賣情緒還是製造情緒？'], ['本喵不採納這份鑑定。'], ['招牌沒有開放改名。']]],
  ['CHALLENGE_CAT', /^(?:你|妳)?(?:很跩|好跩)(?:欸)?$|^跩什麼$|^(?:你|妳)?態度很差$/, [
    ['有嗎？'], ['服務費只有一塊。', '態度差不多就這樣。'], ['本喵沒有績效壓力。'], ['耳朵有聽。', '臉懶得配合。'], ['這已經是營業用表情。']]],
  ['ASK_FEELING', /^(?:你|妳)(?:今天心情好嗎|心情好嗎|開心嗎|开心吗|累嗎|累吗)$/, [
    ['還行。', '人類少一點會更行。'], ['累。', '趴著也算值班。'], ['心情沒有列入庫存。'], ['看罐罐供應情況。'], ['本喵需要的不是訪談。', '是午睡。']]],
  ['ASK_ADVICE', /^(?:我該怎麼辦|我该怎么办|你覺得呢|妳覺得呢|你觉得呢|怎麼辦|怎么办)$/, [
    ['哪件事？', '本喵沒有讀心。'], ['先有事情。', '才有怎麼辦。'], ['空白紙不好鑑定。'], ['把事情寫一件就好。'], ['本喵只看桌上的。']]],
  ['BORED', /^(?:好無聊|好无聊|陪我聊天|跟我講話|跟我讲话)$/, [
    ['去散步。'], ['本店不提供陪聊。'], ['本喵也無聊。', '但本喵要上班。'], ['看貓不用解說。'], ['妳可以發呆。', '這個不收費。']]],
  ['TEST_CAT', /^(?:你|妳)(?:是真的嗎|是ai嗎|聽得懂嗎|听得懂吗|是不是機器人|是不是机器人)$/, [
    ['本喵是值班的。'], ['這裡沒有呼叫 AI。', '只有貓的台詞。'], ['聽得懂一些。', '不代表想加班。'], ['這間店靠本地規則營業。'], ['測試不用一直戳貓。']]],
  ['PRAISE_STORE', /^(?:這網站好可愛|这网站好可爱|這裡好可愛|这里好可爱|好喜歡這個網站|好喜欢这个网站)$/, [
    ['嗯。', '我媽弄的。'], ['喜歡可以常來。', '最好不要常有爛事。'], ['招牌有擦。', '算妳有看到。'], ['可愛不另外加價。'], ['店小。', '貓有用心趴著。']]],
  ['RANDOM_CAT_CHAT', /^(?:今天星期幾|今天星期几|你睡了嗎|妳睡了嗎|你會不會講話|你会不会讲话|你為什麼不理我|你为什么不理我)$/, [
    ['本喵的日曆只有值班和睡覺。'], ['眼睛閉著。', '耳朵還在。'], ['會。', '但不包無限次。'], ['有聽。', '正在省電。'], ['問題很多。', '罐罐很少。']]],
];

export const CAT_INTENTS = Object.freeze(definitions.map(([id, pattern, replies]) => Object.freeze({
  id, pattern, responses: Object.freeze(replies.map((lines, index) => Object.freeze({
    id: `${id.toLowerCase()}-${index + 1}`, lines: Object.freeze(lines),
  }))),
})));

function normalize(text) {
  return String(text || '').normalize('NFKC').toLowerCase().trim();
}

function matchClause(clause) {
  const text = clause.replace(/\s+/g, '').replace(/^(?:貓老闆|猫老板|老闆|老板)[啊呀]?/, '')
    .replace(/^請問/, '').replace(/[~～]+$/g, '');
  // Score complete phrases, never keywords embedded in an unrelated event.
  const matches = CAT_INTENTS.filter(intent => intent.pattern.test(text) || intent.pattern.test(text.replace(/[啊呀啦喔哦欸]+$/g, '')));
  if (matches.length) return { intent: matches[0].id, score: 100 };
  // Only clearly cat-directed, benign unknown questions receive a character reply.
  if (/^(?:你|妳)(?:會跳舞嗎|會唱歌嗎|會做鬼臉嗎|會握手嗎|有尾巴嗎|喜歡曬太陽嗎)$/.test(text)) {
    return { intent: 'RANDOM_CAT_CHAT', score: 60 };
  }
  return null;
}

export function routeCatIntent(text) {
  const normalized = normalize(text);
  const clauses = normalized.split(/[，,。.!！?？;；\n]+/).map(value => value.trim())
    .filter(value => value && !/^(?:貓老闆|猫老板|老闆|老板)[啊呀]?$/.test(value));
  // Every clause must be a recognized cat interaction. Any event, emotion,
  // self-judgment, crisis content or uncertainty falls through unchanged.
  const matches = clauses.map(matchClause);
  if (!matches.length || matches.some(match => !match)) return { route: 'EMOTIONAL_EVENT', intent: null };
  const chosen = matches.reduce((best, item) => item.score >= best.score ? item : best);
  return { route: 'CAT_CHAT', intent: chosen.intent };
}

let recentMemory = [];
const responseIds = new Set(CAT_INTENTS.flatMap(intent => intent.responses.map(response => response.id)));

export function selectCatResponse(intentId) {
  const intent = CAT_INTENTS.find(item => item.id === intentId);
  if (!intent) throw new Error('Unknown cat intent');
  let recent = recentMemory;
  try {
    const stored = JSON.parse(localStorage.getItem('recentCatResponses') || '[]');
    if (Array.isArray(stored)) recent = stored.filter(id => responseIds.has(id)).slice(-10);
  } catch { /* Memory-only fallback when browser storage is unavailable. */ }
  let candidates = intent.responses.filter(response => !recent.includes(response.id));
  if (!candidates.length) candidates = intent.responses.filter(response => response.id !== recent.at(-1));
  const response = candidates[Math.floor(Math.random() * candidates.length)];
  recentMemory = [...recent, response.id].slice(-10);
  try { localStorage.setItem('recentCatResponses', JSON.stringify(recentMemory)); } catch { /* IDs only. */ }
  return response;
}
