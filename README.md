# 爛情緒回收所 · Phase 1

Mobile-first、純前端 Prototype。以原生 JavaScript ES modules 分離攤位視覺、交易狀態和本機紀錄，無套件、後端、LLM 或 API。

## 開啟

在此資料夾執行 `python -m http.server 5173`，瀏覽 `http://localhost:5173`。請使用靜態 HTTP 伺服器，直接以 file:// 開啟不支援模組。

## 測試三條流程

一般網址使用 V2 本機規則判定，不再預設「收」。只有直接執行原始碼的本機 development environment，可用 `http://localhost:5173/?dev=1` 測試 Demo 結果；安全判定不能被 Demo 覆蓋。Production 建置會將 compile-time `DEVELOPMENT` 設為 false，並移除所有 Developer Panel、Debug 與結果覆寫程式碼；任何正式網址 query parameter 都不能啟用。

HOME → INPUT → SUBMITTED → INSPECTING → ACCEPTED / PARTIAL / REJECTED → ENDING → HOME。

只有情緒或非具體描述才進入 CLARIFY，以同款紙張提供一次選擇題。四個答案直接走 ACCEPT／REJECT／PARTIAL／TEMP_HOLD，不再重新鑑定或提供自由輸入框。每筆交易 `MAX_CLARIFY_COUNT = 1`，引擎及畫面都有 guard；「我也不知道」可先放桌上蓋「暫放」小章，再離開，不計款或成功次數。SAFETY 直接停止交易，不蓋拒收章、不丟紙、不計款。台灣安心專線來源：[衛生福利部](https://dep.mohw.gov.tw/DOMHAOH/cp-4906-54077-107.html)。

鑑定約 2.5 秒，後續文案與紙張動畫依序播放。成功與部分回收各累積 $1，拒收不計數。離開後清除輸入。歷年欠款、件數、今日件數、百件彩蛋旗標存在 `bad-mood-recycling-v1` localStorage；文字內容從不寫入儲存或傳出。禁用 localStorage 時會顯示保存失敗提示。

首次達到 100 件顯示一次彩蛋；Escape 或按鈕可關閉。點擊右上欠款可檢視帳本。今日件數依瀏覽器本地日期計算。

## 目前視覺版本與 Review 範圍

目前唯一視覺標準是使用者提供的「貓老闆的爛情緒回收所.png」。已改為有木紋、紙燈籠、暖光、景深夜色與紙本招牌的分層攤位；過去胖貓素材已不再引用。角色以設定圖中的營業中／抬頭表情裁切後透過內建 imagegen 去背或補齊，保留該原型的灰毛、圓臉與琥珀眼睛。透明素材為本地 WebP，PNG 作為原始素材保存。

第一階段 A–I 與後續三種交易動畫已實作：首頁攤位、角色、夜景、兩塊招牌、價目表、紙標籤 CTA、Camera Push-in、桌面回收單、提交折紙向前滑動與肉球壓紙。約 0.8 秒眨眼後才出現首頁對話；切換狀態會取消未完成的首頁動畫，尊重 reduced-motion。

角色另有鑑定、思考、接受、狐疑、拒收、伸掌與轉身素材。結果依序播放實體印章位移、紅色印記、撕紙、揉紙／紙團拋入箱子、退紙、硬幣滑出；欠款在硬幣抵達後才累加。拒收的待處理單保持在桌面直到玩家離開，拒收不出硬幣。這是透明角色姿勢切換加 CSS 微動畫，尚非骨架角色動畫。

進場先等圖像載入，再開始眨眼。點擊 CTA 後鏡頭先推近、貓抬頭，約 650ms 後才滑入可操作的回收紙。手機 textarea 字級為 16px；鍵盤縮小 visualViewport 時，回收單會保持在可視區域。鍵盤關閉或提交後恢復一般場景配置。430px 可視區域已用 Chrome 模擬驗證，實體手機仍需人工確認。

`presentation.js` 分離視覺狀態與角色素材切換；`visual.css` 分離畫面與鏡頭；`transaction-animation.js`、`transaction.css` 處理紙／印章／硬幣的動作。判定／計數／彩蛋仍在原有模組。整張參考圖沒有直接當背景。素材架構與完整生成提示詞見 `assets/README.md`、`assets/redesign-prompts.json`、`assets/result-animation-prompts.json`。

V2 修正前實際上只有三種結果 Demo，正常網址固定接受。現在 `judgment.js` 以安全 → 尚未處理的現實問題 → 自我攻擊 → 可回收事件 → CLARIFY fallback 為優先序。人物與行為組合、具體動作可構成事件，無字數門檻，也不要求一定出現情緒或結束字眼。Confidence 只供除錯參考，不控制釐清。明天測試與控制權測試保存於回傳的 signals。沒有配額或隨機判定。正式遊玩不使用 AI API，runtime AI token cost 為 $0。

規則是中文詞句 heuristic，無法完整理解否定、引述、諷刺或所有情境；不明確的事件會釐清，而非自動接受。輸入、釐清答案與 signals 只存在記憶體，不寫入 localStorage。安全偵測為保守的明確詞句篩選，非專業風險評估。

回歸測試：`judgment-cases.json` 含 79 組事件（包含兩次修正指定的案例），`verify-judgment.py` 產出 `judgment-qa-report.json`，若接受比率超過 70% 會警告，並不改變結果。另有 `verify-judgment-flow.py` 驗證正常網址的自動判定、四種釐清路線、最多一次提問、選完不再進入鑑定、暫放不計款、安全路徑與計款。測試不蒐集玩家輸入。

本機 Development Mode 的 Judgment Debug 可查看判定 signals；Production artifact 不包含這個面板與結果覆寫。

Phase 2 可將 `transact()` 的結果來源替換為獨立鑑定服務，保留三個結果狀態；本版本不連接服務。

現有 Ma Shan Zheng、Noto Sans TC、Noto Serif TC 字型使用本地 WOFF2 與 `@font-face`，不連線到 Google Fonts；字型與原本字重、font-display 設定相同，fallback 使用原有系統字型。授權與來源見 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。角色、攤位、夜景與道具為本地圖像；招牌、價目表、輸入、紙條與對話是 DOM。

## 已驗證

後續細節修正：音效改為本機 Web Audio 合成的纸張摩擦、短促落章／落箱和硬幣泛音；首頁點擊即解鎖音訊，沒有音效下載。較矮手機（320 × 568、375 × 667）另有攤位縮放與較短回收單，首頁和送出按鈕均在可視範圍。減少動態效果時取消反覆眨眼並縮短物件動畫等待，保留閱讀文案的時間。

以本機 Chrome 驗證三種完整交易、獨立結果狀態、輸入安全顯示與不寫入儲存、成功／部分回收計數、拒收不計數、帳本開啟、100 件彩蛋僅觸發一次，以及一般網址不顯示 Developer Control。390 × 844 首頁與輸入沒有水平溢出，主要按鈕在畫面內；1440px 桌面舞台維持 520px 寬。新畫面逐项比對結果見 `VISUAL_REVIEW.md`。

`preview-mobile.png` 與 `preview-desktop.png` 為實際 Chrome 截圖。`verify.py` 為免第三方套件的 CDP 驗證工具，需要本機 Chrome 開啟 remote debugging port 9222；只應搭配獨立測試瀏覽器 profile 使用，會清除該 profile 中本站測試紀錄。測試加速動畫等待時間，以驗證狀態與資料；實際音效與動畫節奏仍需人工體驗。

## Production Build

執行 `python scripts/build_site.py`，再執行 `python -m unittest discover -s tests -v`。正式版本只由 `dist/` 部署，不能直接發布開發用 repository 根目錄。可用 `python -m http.server 5174 --directory dist` 本機檢查 production artifact。

建置只複製明確指定的 runtime 檔案、final WebP、本地 fonts 與政策文件；不包含 QA reports、audit scripts、regression tests、browser profiles、原始照片或開發 prompt。Regression tests 保留；完整 QA 輸出與本機 audit 目錄在 `.gitignore` 排除。

## Copyright & Usage

This repository is publicly visible for portfolio and
demonstration purposes.

It is NOT an open-source project.

Unless explicitly stated otherwise, no permission is granted
to copy, modify, redistribute, commercially use, sublicense,
or create derivative works from the source code or original
assets.

© 2026 Ververya. All rights reserved.

Third-party fonts retain their own licenses, as described in
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Privacy by Design

Cat'll Take It processes emotional text locally in the
user's browser.

The current production version does not send emotional text
to OpenAI, Claude, Gemini, or another AI service.

No account is required.

No remote database is used to store emotional input.

See [PRIVACY.md](PRIVACY.md) for local storage and hosting details.
