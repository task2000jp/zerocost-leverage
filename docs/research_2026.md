# 調査記録：Claude Code × MCP × 無料枠でのスケール最大化（2026-05-31）

ユーザーの問い：芸術制作に限らず、投資・ビジネス方面でも Claude Code + MCP を
無料で最大活用してスケールさせる方法は？

---

## 1. MCPエコシステムの現状（2026年）

- Smithery だけで 7,000+ サーバー、MCP.Directory に 1,864+ 登録
- **無料・オープンソース比率が極めて高い**（MIT/Apache）。「課金なしで強力なAIワークフローが組める」
- 2026年最多インストール：GitHub / Figma Dev Mode / Notion
- 2026年にリモートHTTP化が進行（Atlassian/HubSpot/Linear/Slack/Vercel等）

→ [Best Free MCP Servers 2026 (Toolradar)](https://toolradar.com/blog/free-mcp-servers)
→ [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)
→ [K2view: Top MCP servers 2026](https://www.k2view.com/blog/awesome-mcp-servers)

---

## 2. 主要な無料MCPサーバー

| カテゴリ | サーバー | 無料枠・備考 |
|---|---|---|
| 開発 | GitHub MCP | 無料アカウントで5,000 req/h。最多インストール |
| 知識ベース | Notion MCP | ページ/DB/ブロックをツール化 |
| Google一括 | Google Workspace MCP | Gmail/Docs/Sheets/Drive/Calendar をOAuth1回で |
| バックエンド | Supabase MCP | DB/認証/storage/edge functions を1接続で |
| DB | Postgres / SQLite MCP | 公式リファレンス、読み書き対応 |
| Web検索 | DuckDuckGo / Brave Search | **キー不要**（DDG）/ Brave無料枠 |
| ブラウザ自動化 | Playwright / Puppeteer | スクレイピング・操作の定番 |
| 統合ハブ | Composio | 250+プラットフォームを束ねる |

---

## 3. 無料の金融・市場データ（調査・監視用）

⚠️ 高頻度取引は不可。日次〜時間次の監視・リサーチ用途。

| 分野 | ソース | 無料枠 |
|---|---|---|
| 株式 | yfinance | 非公式・実質無制限 |
| 株式 | Alpha Vantage | 25 req/日、ニュース＋センチメントAPI付き |
| 株式 | Finnhub | リアルタイム株/為替/暗号資産、企業ファンダ |
| 株式 | Financial Datasets MCP | 損益/BS/CF/株価/ニュースを10ツールで |
| 暗号資産 | CoinGecko | キー不要、月1万-3万call |
| 暗号資産 | Binance MCP / CoinStats MCP | リアルタイム・ポートフォリオ追跡 |
| バックテスト | QuantConnect | 無料 |
| ニュース | Google News RSS | 無料 |
| AI処理 | Gemini API | 無料枠 |

→ [Alpha Vantage](https://www.alphavantage.co/)
→ [Financial Datasets MCP](https://github.com/financial-datasets/mcp-server)
→ [TensorBlock: finance/crypto MCP一覧](https://github.com/TensorBlock/awesome-mcp-servers/blob/main/docs/finance--crypto.md)

---

## 4. Claude Code のビジネス自動化（2026）

- 既存サブスクがあれば**追加自動化の限界費用はゼロ**（日次実行回数の上限まで）
- 「指示・文脈・ワークフローを再利用可能な資産に変える」のが本質
- CLAUDE.md（プロジェクト指示）と .claude/skills/ が**永続メモリ**として機能
- 契約レビュー・請求催促・キャッシュフロー予測・リード選別等の定型を自動化
- 「$5K/月の外注を置き換える」事例多数

→ [Claude Code business workflows (Apify)](https://use-apify.com/blog/claude-code-business-workflows)
→ [Claude Code hacks to automate your business](https://govanator.com/claude-code-hacks-to-automate-your-business-2026/)

---

## 5. 戦略的結論

**汎用スパイン（背骨）を1回作り、ドメインごとに使い回すのが最大レバレッジ。**

```
Claude Code（司令塔）+ MCP + 無料API + GAS定期 + Sheets/Supabase + GitHub
```

動画 → 投資監視 → 業界リサーチ → マイクロSaaS、と同じ構造を差し替えるだけ。
ユーザーの強み（AI感度・ゼロコスト設計・明確なミッション）と完全に噛み合う。

ボトルネックへの効果：
- 「手動ステップ多い」→ GAS定期実行で自動化
- 「収益化が手前」→ マイクロSaaS/受託で直結

---

## 出典まとめ
- [Best Free MCP Servers 2026](https://toolradar.com/blog/free-mcp-servers)
- [awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers)
- [K2view MCP](https://www.k2view.com/blog/awesome-mcp-servers)
- [Alpha Vantage](https://www.alphavantage.co/)
- [Financial Datasets MCP](https://github.com/financial-datasets/mcp-server)
- [Claude Code business workflows](https://use-apify.com/blog/claude-code-business-workflows)
