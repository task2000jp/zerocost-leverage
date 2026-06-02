# エンジン①応用例：業界リサーチエンジン

## 何をするか

特定業界のニュース・論文・OSS動向を毎朝自動収集してSheetsに蓄積。
Claude Code が蓄積データを読んで競合分析・トレンドレポートを執筆。

## 差し替えるだけの設定

```javascript
const CONFIG = {
  DOMAIN_CONTEXT: `
    あなたは「SaaS業界リサーチャー」です。
    主要テーマ: AI SaaS製品、資金調達ニュース、Product Hunt新着
  `,
  RSS_FEEDS: [
    'https://news.ycombinator.com/rss',          // Hacker News
    'https://techcrunch.com/feed/',              // TechCrunch
    'https://www.producthunt.com/feed?category=artificial-intelligence',
  ],
};
```

## 適用例

| ドメイン | DOMAIN_CONTEXT のキーワード | RSS の差し替え先 |
|---|---|---|
| AI/SaaS | 資金調達・Product Hunt・新機能発表 | TechCrunch, HN |
| 不動産 | 地価・REITニュース・金利動向 | 国交省RSS・Yahoo不動産 |
| 医療 | 臨床試験・FDA承認・医療AI | PubMed RSS・ClinicalTrials |
| 宣教・神学 | 宗教改革史・福音主義・ミッション | Google News + Wikipedia |

GASファイルは `../templates/gas_research_engine.gs` をコピーして `DOMAIN_CONTEXT` と `RSS_FEEDS` だけ差し替えてください。
