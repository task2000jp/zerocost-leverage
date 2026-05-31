# Zero-Cost Leverage Engine

Claude Code × MCP × 無料枠で、**あらゆるドメインにスケールする汎用レバレッジエンジン**。
動画制作（blessing_documentary / documentary_gpu）で確立した構造を、
投資監視・業界リサーチ・マイクロSaaS など任意の分野に横展開するための設計集。

> 2026-05-31、Opus 4.8 で調査・記録。根拠は `docs/research_2026.md`。

---

## 核心思想

> 最大のレバレッジは「背骨を1回作って、ドメインごとに使い回す」こと。
> 本質はツールではなく、**再利用可能なワークフロー設計**。

```
Claude Code（司令塔・分析・執筆）
  + MCP（無料コネクタ：GitHub / Google / Notion / Supabase / Playwright …）
  + 無料API（データ源：yfinance / CoinGecko / RSS / Gemini …）
  + GAS（クラウド定期実行・無料）
  + Sheets or Supabase（蓄積DB・無料枠）
  + GitHub（版管理・配布）
```

この背骨は、動画でも投資でもビジネスでも**同じ**。差し替えるのはデータ源と出力だけ。

---

## ⚠️ 重要な境界線（投資・金融）

- **できる**：情報収集・監視・ユーザーが定めたルールでのスクリーニング・分析レポート自動化・バックテスト調査
- **できない**：個別の投資助言（何を買うべき等）・売買執行・送金 → これらはユーザー自身が行う

この境界は厳守する。AIは「情報優位を作る道具」であり「助言者・執行者」ではない。

---

## 4つのゼロコスト・エンジン（詳細は docs/engines.md）

| # | エンジン | 一言 |
|---|---|---|
| ① | 自律リサーチエンジン | GAS定期 + 無料API + Gemini要約 → Sheets蓄積。「Grok級ループ」の汎用版 |
| ② | ゼロコスト・バックエンド/マイクロSaaS | Supabase無料 or GAS+Sheets + GitHub Pages。サーバー代ゼロ |
| ③ | ナレッジ/コンテンツOps | Notion+Drive+GitHub MCP。多言語・版管理付き制作配布 |
| ④ | 意思決定ダッシュボード | 無料データ→Sheets可視化→GAS定期メール |

---

## フォルダ構成

```
zerocost_leverage/
├── CLAUDE.md                      # このファイル
├── QUICKSTART.md                  # 最初の一歩
├── docs/
│   ├── research_2026.md           # ★調査の全記録＋出典
│   ├── engines.md                 # 4エンジンの具体スタック
│   └── free_resources.md          # 無料API・MCPサーバー一覧
├── templates/
│   ├── gas_research_engine.gs     # ★背骨のコード実体（GAS定期リサーチ）
│   └── mcp.json.example           # MCP設定テンプレ
└── examples/                      # ドメイン別の適用例（随時追加）
```

## 使い方

新しいドメインに適用するとき：
1. `docs/engines.md` で該当エンジンを選ぶ
2. `templates/gas_research_engine.gs` をコピーし、データ源URL・キーワードを差し替え
3. Sheets を1枚用意して GAS をデプロイ（clasp）
4. Claude Code が蓄積データを参照して分析・執筆

## 関連プロジェクト
- `blessing_documentary` — 元になった動画制作（MCP拡張Phase 1-5）
- `documentary_gpu` — 次世代動画（同じ背骨の応用例）
- このプロジェクト — 背骨そのものを汎用資産化
