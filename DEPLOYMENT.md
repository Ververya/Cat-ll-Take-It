# GitHub Pages

此專案是純靜態網站，手機開啟部署網址即可遊玩，不需要電腦維持 localhost。

`.github/workflows/pages.yml` 在 main push 後建立 `dist/` 並部署 GitHub Pages。工作流遵循 [GitHub 自訂 Pages 工作流文件](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。儲存庫的 Settings → Pages → Source 必須設為 GitHub Actions。

本機建置：`python scripts/build_site.py`。產物只有網站模組、樣式與 WebP 遊戲素材；不包含原始參考照片、PNG 製作母檔、瀏覽器 profile、log 或測試畫面。一般專案網址格式是 `https://帳號.github.io/儲存庫名稱/`，所有遊戲路徑維持相對引用以支援此子路徑。

欠款紀錄存在每台裝置與每個網站來源自己的 localStorage。localhost 原有紀錄不會自動移到 GitHub Pages；手機與電腦不會同步。玩家文字只存在本次頁面，不上傳；判定與音效仍在瀏覽器執行，沒有 LLM API 或 AI Token 費用。
