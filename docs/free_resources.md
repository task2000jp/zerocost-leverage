# 無料リソース・リファレンス（2026-06版）

## 無料MCPサーバー（稼働確認済み）

| サーバー | 用途 | 無料枠 | 入手 |
|---|---|---|---|
| GitHub MCP | コード/Issue/PR | 5,000 req/h | `@modelcontextprotocol/server-github` |
| Google Sheets MCP | Sheets読み書き | 実質無制限（OAuth） | `mcp-google-sheets-full` |
| Google Drive MCP | Drive読み書き | 実質無制限（OAuth） | Claude Codeビルトイン |
| Groq Compound MCP | LLM + リアルタイム検索 | 6,000 req/日・クレカ不要 | `groq-compound-mcp-server` |
| Playwright MCP | ブラウザ自動化 | 無制限（ローカル） | `@playwright/mcp@latest` |

## 2026 Q1-Q2 新登場MCPサーバー

| サーバー | 用途 | 無料枠 | 備考 |
|---|---|---|---|
| **Exa MCP** | 意味検索（コード文脈に強い） | 10k queries/月 | `@modelcontextprotocol/server-exa` |
| **Firecrawl MCP** | URL→クリーンMarkdown変換 | 5k pages/月 | `@modelcontextprotocol/server-firecrawl` |
| ~~Alpaca MCP~~ | ~~npm未存在~~ | — | REST API直接利用で代替（下記参照） |
| **Stripe MCP** | 決済・請求（test mode） | 無制限（テスト） | `@modelcontextprotocol/server-stripe` |
| **n8n MCP** | ワークフロー自動化 | 無制限（セルフホスト） | `@modelcontextprotocol/server-n8n` |
| **Context7 MCP** | ライブドキュメント | 無制限・認証不要 | `@modelcontextprotocol/server-context7` |
| **Zapier MCP** | 5000+サービス連携 | 100 tasks/月 | `@modelcontextprotocol/server-zapier` |
| **Make.com MCP** | ビジュアルワークフロー | 1,000 ops/月 | `@modelcontextprotocol/server-make` |

索引: [punkpeye/awesome-mcp-servers](https://github.com/punkpeye/awesome-mcp-servers) /
[mcpservers.org](https://mcpservers.org/) / [Totalum 2026 picks](https://totalum.com)

## 無料データAPI

| 分野 | サービス | 無料枠 |
|---|---|---|
| 株式 | **Alpaca REST API** | リアルタイム株価・ペーパートレード・クレカ不要 |
| 株式 | yfinance | 実質無制限（非公式） |
| 株式 | Alpha Vantage | 25/日 + ニュース/センチメント |
| 株式 | Finnhub | リアルタイム+ファンダ |
| 暗号資産 | CoinGecko | キー不要・月1万-3万 |
| AI推論 | Groq API | 6,000 req/日・クレカ不要 |
| バックテスト | QuantConnect | 無料 |
| ニュース | Google News RSS | 無料 |
| 学術論文 | arXiv API | 完全無料 |
| 百科 | Wikipedia API | 完全無料 |

## 無料インフラ

| 用途 | サービス | 無料枠 |
|---|---|---|
| 定期実行 | Google Apps Script | 6min/実行・90min/日 |
| DB | Supabase | 500MB PostgreSQL |
| DB簡易 | Google Sheets | 実質DB代わり |
| ホスティング | GitHub Pages | 静的サイト無料 |
| 版管理 | GitHub | プライベートリポ無料 |
| GPU計算 | Google Colab | T4無料（時間制限） |
| AI LLM | Groq API | llama-3.1-8b-instant等 |
