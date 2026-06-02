# エンジン③応用例：コンテンツ制作パイプライン

## 構成

```
GitHub MCP（版管理）
  + Google Drive MCP（アセット）
  + Google Sheets MCP（編集進捗管理）
  + Claude Code（執筆・翻訳・編集）
  → 多言語展開 → 各チャネルへ配布
```

## 実例: blessing_documentary の作り方

このプロジェクト自体が実例。以下の構造を任意コンテンツに置き換える:

1. **Sheetsでスクリプト管理** → `documentary_gpu_db` が実例
   - GAS自律リサーチで素材・神学情報を自動収集
   - Claude Code が Sheets を読んでナレーション原稿を執筆

2. **GitHub で版管理** → `task2000jp/blessing-documentary` が実例
   - スクリプト・Colabノートブック・レンダリングコードをgit管理
   - Claude Code が GitHub MCP 経由でファイルを直接更新

3. **Drive でアセット管理** → `blessing_documentary_output/` が実例
   - 完成動画をDriveに格納
   - Colab から Drive に直接書き出し

## 横展開テンプレート

| 用途 | Sheets構造 | GitHub構造 |
|---|---|---|
| 技術ブログ | 記事タイトル/ステータス/担当 | posts/YYYY-MM-DD-title.md |
| YouTube台本 | エピソード/素材リスト/BGM | scripts/ep01/ |
| 宣教コンテンツ | テーマ/言語/配布先 | content/ja/ content/en/ |
| Podcast | タイトル/ゲスト/収録状況 | episodes/README.md |

## MCP活用ポイント

- **GitHub MCP** → Claude Code が直接ファイルをコミット・PR作成
- **Sheets MCP** → 進捗管理・素材リストの読み書きをコード不要で操作
- **Drive MCP** → 完成アセットの検索・取得
