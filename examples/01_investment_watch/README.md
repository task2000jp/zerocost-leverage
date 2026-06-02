# エンジン①応用例：投資監視エンジン

⚠️ これは「情報集約」であり投資助言ではない。売買判断・執行は必ず自分で行うこと。

## 何をするか

毎朝7時に自動実行：
1. Groq LLMがウォッチリストに関連する「今日調べること」を生成
2. Yahoo Finance RSS / Google News RSS / arXiv（金融工学）を自動収集
3. Google Sheetsに蓄積（1週間で生きたDBが育つ）
4. 重要スコアが高い情報だけ Gmail 通知

## セットアップ（15分）

### 1. Google Sheets を新規作成してIDをコピー
```
SheetsのURL: https://docs.google.com/spreadsheets/d/【ここがID】/edit
```

### 2. GASプロジェクトを作成
Google Sheets → 拡張機能 → Apps Script → `gas_collector.gs` を貼り付け

### 3. `SPREADSHEET_ID` と `WATCHLIST` を設定
```javascript
const SPREADSHEET_ID = 'YOUR_SHEETS_ID';
const CONFIG = {
  WATCHLIST: ['Toyota', 'NVIDIA', 'Bitcoin', 'SP500'],
  ...
};
```

### 4. スクリプトプロパティに GROQ_API_KEY を設定
Apps Script → プロジェクトの設定 → スクリプトプロパティ
- キー: `GROQ_API_KEY`
- 値: Groq Console (console.groq.com) で取得したキー（無料・クレカ不要）

### 5. `setupTriggers()` を一度だけ手動実行

## Claude Code との連携

Sheets に1週間データが蓄積したら：
```
「investment_watch シートを分析して、先週の注目トレンドをサマリーして」
```

## コスト：ゼロ
- GAS: 無料（実行時間制限あり）
- Groq: 無料枠 6,000 req/日（クレカ不要）
- Yahoo Finance RSS / Google News: 無料
