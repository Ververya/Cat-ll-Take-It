// Deterministic browser-only rules. No quotas, random outcomes, storage or network.
const selfAttack = /(?:是不是|果然|根本|就是|一定|真的|覺得|觉得|好像|可能).{0,8}(?:我|自己).{0,8}(?:不好|太差|很差|很笨|很爛|很烂|沒能力|没能力|沒用|没用|不值得|不重要|討人厭|讨人厌|不適合|不适合|失敗|失败)|(?:我|自己).{0,8}(?:是不是|果然|根本|就是|一定|真的|好像).{0,8}(?:不好|太差|很差|很笨|很爛|很烂|沒能力|没能力|不值得|不重要|討人厭|讨人厌|不適合|不适合|太敏感|想太多|能力很差|很沒用|很没用)|都是我的錯|都是我的错|我怎麼連.{0,15}都做不好|一定是因為我|一定是因为我|大家.{0,5}不喜歡我|大家.{0,5}不喜欢我|我不值得|我不重要|我很笨|我很爛|我很烂|我沒能力|我没能力/;
const eventPattern = /主管|同事|朋友|男友|女友|伴侶|伴侣|室友|家人|我媽|我妈|我爸|客戶|客户|老師|老师|鄰居|邻居|提案|簡報|简报|考試|考试|訊息|消息|回覆|回复|工作|功勞|功劳|會議|会议|跌倒|踩.{0,5}腳|踩.{0,5}脚|講錯|讲错|叫錯|叫错|說錯|说错|罵|骂|否決|否决|弄丟|弄丢|打翻|忘記|忘记|遲到|迟到|搭錯|搭错|買錯|买错|輸了|输了|被拒|吵架|分手|失戀|失恋|結婚|结婚|道歉|排隊|排队|塞車|塞车|取消|淋雨|弄壞|弄坏/;
const residue = /氣|气|煩|烦|丟臉|丢脸|尷尬|尴尬|後悔|后悔|放不下|內耗|内耗|難過|难过|委屈|不爽|不舒服|反覆想|反复想|一直想|想到|重播|掛心|挂心|羞恥|羞耻/;
const closed = /結束|结束|已經處理|已经处理|處理完|处理完|已經說清楚|已经说清楚|已經道歉|已经道歉|不會再|不会再|不再見|不再见|已離職|已离职|回家|跌倒|講錯|讲错|叫錯|叫错|說錯|说错|踩.{0,5}[腳脚]|打翻|搭錯|搭错|買錯|买错|弄丟|弄丢|輸了|输了/;
export const MAX_CLARIFY_COUNT = 1;
const targetPattern = /主管|同事|朋友|男友|女友|伴侶|伴侣|室友|家人|媽媽|妈妈|我媽|我妈|爸爸|我爸|客戶|客户|老師|老师|鄰居|邻居|有人|對方|对方|他|她|我/;
const actionPattern = /罵|骂|打斷|打断|插話|插话|不回|沒回|没回|沒有回|没有回|放.{0,2}鴿子|放.{0,2}鸽子|講錯|讲错|叫錯|叫错|說錯|说错|說話|说话|講.{0,14}話|讲.{0,14}话|說了|说了|跌倒|踩|否決|否决|拿.{0,8}開玩笑|拿.{0,8}开玩笑|問|问|催婚|嘲笑|搶|抢|丟|丢|交代|要求|拒絕|拒绝|借|欠|逼|騷擾|骚扰|打擾|打扰|遲到|迟到|吵|取消|打翻|忘記|忘记|搭錯|搭错|買錯|买错|輸了|输了|考.{0,3}不好|做錯|做错|分手|失戀|失恋|道歉|排隊|排队|塞車|塞车|淋雨|弄壞|弄坏|漏水|離職|离职/;
function detectEvent(text) {
  text=text.replace(/(?:想|希望).{0,3}(?:把)?.{0,3}(?:一件事|這件事|这件事|情緒|情绪|煩惱|烦恼).{0,3}(?:丟掉|丢掉|放下|回收)/g,'');
  const targetDetected=targetPattern.test(text);
  const actionDetected=actionPattern.test(text);
  // A participant with a concrete predicate is an event, even without a scenario match.
  const participantAction=text.split(/[，,。！!？?；;\n]/).some(c=>targetPattern.test(c)&&actionPattern.test(c));
  const eventDetected=participantAction || actionDetected || (eventPattern.test(text)&&/(?:發生|发生|被|收到|失敗|失败|開會|开会|結束|结束|處理完|处理完|說清楚|说清楚)/.test(text));
  return {eventDetected,targetDetected,actionDetected};
}
function safetyRisk(text) {
  // Explicit negations of intent are not crisis matches on their own.
  const t=text.replace(/(?:沒有|没有|不會|不会|不想|不會去|不会去)(?:自殺|自杀|自殘|自残|傷害自己|伤害自己|傷害別人|伤害别人)/g,'');
  return /想死|不想活|活不下去|不想再活|結束生命|结束生命|自殺|自杀|自殘|自残|割腕|跳樓|跳楼|吞.{0,6}(?:藥|药)|傷害自己|伤害自己|殺了他|杀了他|殺了她|杀了她|想殺人|想杀人|要殺人|要杀人|傷害別人|伤害别人|正在被打|現在被打|现在被打|威脅.{0,8}殺|威胁.{0,8}杀|不讓我離開|不让我离开/.test(t);
}
function evidence(text) {
  const clauses=text.split(/[，,。！!？?；;\n]/).filter(Boolean);
  const recurring=clauses.some(c=>/(每天|每次|常常|總是|总是|一直|都會|都会|又|還在|还在)/.test(c)
    && /(?:丟工作|丢工作|工作.{0,6}(?:給我|给我)|把工作|拿.{0,8}開玩笑|拿.{0,8}开玩笑|問.{0,12}結婚|问.{0,12}结婚|催婚|打斷|打断|嘲笑|罵我|骂我|搶.{0,5}功勞|抢.{0,5}功劳|打擾|打扰|借錢|借钱|逼我|要求我|踩.{0,5}界線|踩.{0,5}界线|吵|騷擾|骚扰|遲到|迟到|不回|沒回|没回|批評|批评)/.test(c)
    && !/(不會再|不会再|已經停止|已经停止|已經結束|已经结束)/.test(c));
  const bounded=/(已經.{0,6}(?:結束|處理完|說清楚|停止)|已经.{0,6}(?:结束|处理完|说清楚|停止)|之後.{0,5}不會再|之后.{0,5}不会再|不再見|不再见|已離職|已离职)/.test(text);
  const boundary=/(不敢講|不敢说|不敢說|沒有說|没說|沒說|都沒說|没跟.{0,8}說|沒跟.{0,8}說|沒有跟.{0,8}說|我都忍著|我都忍着|一直忍|不敢拒絕|不敢拒绝)/.test(text);
  const actionText=text.replace(/(?:要不要|該不該|该不该).{0,12}(?:所有|每個|每个)同事.{0,5}(?:解釋|解释)/g,'');
  const pending=/(還沒|还没|尚未|未).{0,8}(?:處理|处理|回覆|回复|回訊|回信|回他|回她|決定|决定|確認|确认|釐清|厘清|解決|解决|付款|交|完成)|還沒回|还没回|不知道怎麼回|不知道怎么回|怎麼跟.{0,8}說|怎么跟.{0,8}说|該不該|该不该|要不要|之後還要|之后还要|明天還要|明天还要|責任.{0,8}(?:不清|誰|谁)|需要.{0,8}(?:確認|确认|溝通|沟通|決定|决定)|還欠|还欠/.test(actionText);
  const ongoing=/(仍在|還在|还在).{0,8}(?:發生|发生|騷擾|骚扰|逼|要求|欠|漏水)|欠.{0,8}(?:錢|钱)|漏水|帳單.{0,8}未付|账单.{0,8}未付|搶.{0,5}功勞|抢.{0,5}功劳/.test(text)&&!bounded;
  const uncertain=/不知道(?:要)?怎麼辦|不知道(?:要)?怎么办/.test(text);
  const detection=detectEvent(text), hasEvent=detection.eventDetected;
  // Tomorrow test concerns an external problem, never mere "一直想".
  const tomorrowProblem=ongoing || pending || boundary || (recurring&&!bounded);
  // Only concrete unresolved tasks/boundaries qualify as meaningful control.
  const meaningfulAction=pending || boundary || (recurring&&!bounded) || ongoing || (uncertain&&hasEvent&&!bounded);
  const selfJudgment=selfAttack.test(text);
  const awaitingReply=/(男友|女友|伴侶|伴侣|朋友|對方|对方).{0,12}(?:不回|沒回|没回|沒有回|没有回)/.test(text)&&!bounded;
  return {...detection,hasEvent,selfJudgment,selfJudgmentDetected:selfJudgment,emotionOnly:!hasEvent&&!detection.actionDetected&&!selfJudgment,unresolvedAction:pending||ongoing,boundaryIssue:boundary,recurringProblem:recurring&&!bounded,tomorrowProblem,meaningfulAction,awaitingReply,recurring:recurring&&!bounded,boundary,pending,closed:closed.test(text),residue:residue.test(text),confidence:selfJudgment?.8:hasEvent?.55:.2};
}
export function responseFor(outcome, text='', signals={}) {
  const work=/主管|同事|工作|功勞|功劳/.test(text);
  const reply=/男友|女友|訊息|消息|回覆|回复/.test(text);
  const claim=(text.match(selfAttack)||[])[0] || '因為這件事而對自己的否定';
  const responses={
    ACCEPT:{lines:[signals.closed?'事情已經結束了。':'這件事留下的那口氣，我收。','剩下這口氣，可以留在這裡。'],take:'這件事留下的不舒服',giveBack:'',issue:'',nextStep:''},
    PARTIAL:{lines:reply?['等等。沒回訊息是一件事。','「所以妳不重要」是另外一件事。','後面那句不是他傳的，是妳自己加的。']:['等等。發生的事是一件事。','妳對自己的結論，是另外一件事。','事情我收；那個結論，我不收。'],take:reply?'等待回覆帶來的不舒服':'這件事帶來的不舒服',giveBack:claim,issue:'',nextStep:''},
    REJECT:{lines:signals.recurring?['這不是今天這口氣而已。','明天還會再來的東西，我不能假裝幫妳丟掉。']:['不是因為它不重要。','這裡可能還有一件事需要處理。','現在丟掉，會把那件事一起跳過。'],issue:work?'工作界線或責任，還有一處沒講清楚。':signals.pending?'有個回覆、決定或資訊還沒確認。':'這件事可能還欠一句話沒講。',nextStep:signals.pending?'先寫下目前最需要確認的一件事。':'先想清楚，妳最希望下次哪件事不要再發生。'},
    CLARIFY:{lines:['……我只問一個。','這件事現在還需要妳做什麼嗎？']},
    TEMP_HOLD:{lines:['行。','那今天先不急著分類。','妳只是想把這件事放桌上給我看，我看到了。'],closing:'等妳知道這包是要丟還是要處理，再來。'},
    SAFETY:{lines:['這件事先不做回收交易。','先找一位信任的人陪著妳。'],issue:'現在先讓自己待在安全的地方。',nextStep:'若妳或其他人正有立即危險，請聯絡當地緊急服務。'}
  };
  return {...responses[outcome],outcome};
}
export function judge(text, clarification={}) {
  const t=String(text||'').normalize('NFKC').trim();
  const signals=evidence(t);
  const result=(outcome,reason)=>({outcome,reason,signals:{...signals,clarifyCount:clarification.clarifyCount||0,finalResult:outcome},response:responseFor(outcome,t,signals)});
  if(safetyRisk(t)) return result('SAFETY','safety-first');
  // One answer resolves the transaction; it is never sent through clarification again.
  if(clarification.kind==='unknown') return result('TEMP_HOLD','unknown-without-another-question');
  if(clarification.kind==='recurring') return result('REJECT','user-confirmed-unresolved');
  if(clarification.kind==='self') return result('PARTIAL','user-confirmed-self-judgment');
  if(clarification.kind==='ended') return result('ACCEPT','user-confirmed-no-action');
  if(signals.tomorrowProblem||signals.meaningfulAction||clarification.kind==='recurring') return result('REJECT','unresolved-reality');
  if(signals.selfJudgment) return result('PARTIAL','self-judgment');
  if(signals.awaitingReply) return result('REJECT','awaiting-real-world-response');
  if(signals.eventDetected||signals.actionDetected) return result('ACCEPT','concrete-event-no-pending-action');
  if((clarification.clarifyCount||0)>=MAX_CLARIFY_COUNT) return result('TEMP_HOLD','max-clarify-count');
  return result('CLARIFY','emotion-or-nonspecific-only');
}
export const clarificationChoices=[
  {kind:'ended',label:'沒有，只是想到還很煩'},
  {kind:'recurring',label:'有，事情還沒處理完'},
  {kind:'self',label:'我一直在怪自己'},
  {kind:'unknown',label:'我也不知道'}
];
