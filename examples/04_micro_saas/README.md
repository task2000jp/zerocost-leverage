# エンジン②応用例：ゼロコスト・マイクロSaaS

## アーキテクチャ（サーバー代ゼロ）

```
選択肢A: Supabase（推奨）
  Supabase無料枠（500MB PostgreSQL + 認証 + storage + edge functions）
  + GitHub Pages（フロントエンド・無料ホスティング）
  + Claude Code が全部構築

選択肢B: GAS Web App（最速）
  GAS doGet/doPost → Sheets をDB代わり
  + GitHub Pages フロントエンド
  → API不要、完全無料
```

## GAS Web App テンプレート

```javascript
// GASをWeb Appとして公開するだけでAPIエンドポイントが完成
function doGet(e) {
  const action = e.parameter.action;
  if (action === 'list') return getItems();
  return ContentService.createTextOutput(JSON.stringify({ error: 'unknown action' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  // Sheetsに書き込み
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('data');
  sheet.appendRow([new Date(), data.user, data.content]);
  return ContentService.createTextOutput(JSON.stringify({ ok: true }))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 収益化パターン

| モデル | 実装 | コスト |
|---|---|---|
| フリーミアム | GAS無料層 + Supabase無料枠 | $0 |
| 有料プラン課金 | Stripe MCP でサブスク管理 | Stripe手数料のみ |
| B2B受託 | Claude Code で高速開発 | 開発時間のみ |

## セットアップ手順（Supabase版）

1. `supabase.com` でプロジェクト作成（無料）
2. Supabase MCP を `.mcp.json` に追加:
   ```json
   "supabase": {
     "command": "npx",
     "args": ["-y", "@supabase/mcp-server-supabase"],
     "env": { "SUPABASE_ACCESS_TOKEN": "<YOUR_TOKEN>" }
   }
   ```
3. Claude Code に「Supabase MCPを使ってユーザー管理テーブルを作って」と指示
4. `github.com/new` でリポジトリ作成 → GitHub Pages 有効化
5. Claude Code に「フロントエンドを作ってGitHub MCPでプッシュして」と指示
