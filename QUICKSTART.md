# QUICKSTART — 最初の一歩

このフォルダで `claude` を起動すれば `CLAUDE.md` を読んで文脈を即把握できる。

## 読む順番
1. `CLAUDE.md` — 背骨の思想
2. `docs/research_2026.md` — 調査の全記録
3. `docs/engines.md` — 4エンジンの具体スタック
4. `docs/free_resources.md` — 無料API/MCP一覧

## 最初に試すべきこと：自律リサーチエンジン（エンジン①）

最もインパクトが大きく、すぐ作れる。

```
1. Google Sheets を新規作成
2. 拡張機能 → Apps Script を開く
3. templates/gas_research_engine.gs を貼り付け
4. CONFIG.SOURCES を監視したいテーマのRSSに差し替え
   （例: Google News で "あなたの業界キーワード"）
5. スクリプトプロパティに GEMINI_API_KEY を登録（無料取得）
6. setupTrigger() を1回実行 → 毎朝6時に自動収集開始
```

→ 1週間で「あなたの関心領域の生きたDB」が Sheets に育つ。
→ Claude Code に「research_log を分析して」と頼めば深掘りレポートになる。

## 投資監視に使う場合（⚠️助言ではなく情報集約）
CONFIG.SOURCES に CoinGecko や Alpha Vantage、関連ニュースRSSを追加。
「ウォッチリストの値動き＋関連ニュースの日次サマリー」が自動で蓄積される。
※ 売買判断・執行は必ず自分で行う。

## 横展開のしかた
新ドメインごとに gas_research_engine.gs をコピー＆CONFIG差し替え。
背骨は同じ。これが「1回作って使い回す」レバレッジの実体。
