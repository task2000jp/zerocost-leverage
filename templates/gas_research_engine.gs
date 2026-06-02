// ============================================================
// gas_research_engine.gs — 自律リサーチエンジン（汎用テンプレート）
// ============================================================
// documentary_gpu/gas/collector.gs の実績ある2ループ構造を汎用化。
//
// 【セットアップ】
//   1. GASプロジェクトを新規作成し、このファイルを貼り付け
//   2. スクリプトプロパティ → GROQ_API_KEY を設定（無料・クレカ不要）
//      https://console.groq.com でAPIキー取得
//   3. SPREADSHEET_ID を自分のSheetsのIDに変更
//   4. CONFIG.DOMAIN_CONTEXT を監視したいテーマに書き換え
//   5. setupTriggers() を一度だけ手動実行
//
// 【ループの仕組み】
//   毎朝7時 → runAll()
//     ① 模索ループ: Groq LLM が「今日何を調べるか」10件のクエリを生成 → Sheetsに保存
//     ② 実行ループ: 未実行クエリを5件取得 → Wikipedia/arXiv/RSS で検索 → 結果をSheetsに蓄積
//
// 【コスト】ゼロ（GAS無料 + Groq無料枠6000req/日 + データAPI無料）
// ============================================================

// ─────────────────────────────────────────────
// ★ここだけ差し替える
// ─────────────────────────────────────────────

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // SheetsのURLの /d/ 以降のID

const CONFIG = {
  // このエンジンが調査するドメインの説明（日本語でOK）
  // Groq LLMがこれを読んで検索クエリを自動生成する
  DOMAIN_CONTEXT: `
あなたは「（ここにプロジェクト名）」のリサーチャーです。

主要テーマ:
- （テーマ1）
- （テーマ2）
- （テーマ3）

例: 投資監視の場合 → 「米国株・日本株の市場動向、決算発表、マクロ経済指標、FRB政策」
例: 競合調査の場合 → 「SaaS業界の新製品発表、資金調達ニュース、技術トレンド」
例: 論文ウォッチの場合 → 「LLM・RAG・エージェント・マルチモーダルの最新研究」
  `,

  // 検索クエリのカテゴリ定義（変更可）
  CATEGORIES: [
    { name: 'メイン調査', count: 4 },  // ドメインのコア情報
    { name: '技術情報',   count: 3 },  // 関連技術・ツール
    { name: '素材・事例', count: 3 },  // 実例・ケーススタディ
  ],

  // RSS フィード（用途に合わせて差し替え）
  RSS_FEEDS: [
    'https://huggingface.co/blog/feed.xml',    // AI/ML ニュース
    'https://github.blog/feed/',               // GitHub 技術ブログ
    'https://paperswithcode.com/rss.xml',      // 機械学習論文
    // 投資用例: 'https://feeds.finance.yahoo.com/rss/2.0/headline?s=^N225&region=US&lang=en-US'
    // ニュース用例: 'https://news.google.com/rss/search?q=YOUR_KEYWORD&hl=ja&gl=JP&ceid=JP:ja'
  ],
};

// ─────────────────────────────────────────────
// メインエントリー（毎朝7時に自動実行）
// ─────────────────────────────────────────────

function runAll() {
  runSearchStrategyLoop();
  Utilities.sleep(2000);
  runSearchExecutionLoop();
}

// ─────────────────────────────────────────────
// 1. 模索ループ — LLMが「今日何を調べるか」を生成
// ─────────────────────────────────────────────

function runSearchStrategyLoop() {
  const today = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd');

  const categorySpec = CONFIG.CATEGORIES
    .map(c => `- ${c.name}: ${c.count}個`)
    .join('\n');

  const prompt = `
${CONFIG.DOMAIN_CONTEXT}

今日（${today}）調べるべき内容を生成してください。

以下のカテゴリで合計10個の検索クエリをJSON形式で生成:
${categorySpec}

【重要1】sourceは必ず以下の3種類のみ:
- "wikipedia" : 事実・人物・概念の調査
- "arxiv"     : 学術論文・技術研究の検索
- "rss"       : 最新ニュース・ブログ・OSS情報

【重要2】queryは必ず英語で書くこと（wikipedia・arxivは英語クエリのみヒットする）

必ずこのJSON形式のみで返す（説明文・コードブロック不要）:
{"date":"${today}","queries":[{"category":"カテゴリ名","query":"english search query","source":"wikipedia"}]}
`;

  const result = callGroq(prompt);
  if (!result) return;

  try {
    const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
    const data = JSON.parse(cleaned);
    saveStrategiesToSheet(data);
    Logger.log('模索ループ完了: ' + data.queries.length + '件のクエリを生成');
  } catch (e) {
    Logger.log('模索ループ JSONパースエラー: ' + e.message + '\nRaw: ' + result.substring(0, 300));
  }
}

function saveStrategiesToSheet(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('クエリログ');
  if (!sheet) {
    sheet = ss.insertSheet('クエリログ');
  }

  const a1 = sheet.getRange('A1').getValue();
  if (a1 !== '日付') {
    sheet.clearContents();
    sheet.appendRow(['日付', 'カテゴリ', '検索クエリ', 'ソース', 'ステータス', '実行日時']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
  }

  data.queries.forEach(q => {
    sheet.appendRow([data.date, q.category, q.query, q.source, '未実行', '']);
  });
}

// ─────────────────────────────────────────────
// 2. 実行ループ — 検索を実行してDBに保存
// ─────────────────────────────────────────────

function runSearchExecutionLoop() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const stratSheet = ss.getSheetByName('クエリログ');
  if (!stratSheet || stratSheet.getLastRow() < 2) return;

  const data = stratSheet.getDataRange().getValues();
  const headers = data[0];
  const colStatus   = headers.indexOf('ステータス');
  const colQuery    = headers.indexOf('検索クエリ');
  const colCategory = headers.indexOf('カテゴリ');
  const colSource   = headers.indexOf('ソース');
  const colExecTime = headers.indexOf('実行日時');

  let executed = 0;
  const MAX_PER_RUN = 5; // レート制限対策

  for (let i = 1; i < data.length; i++) {
    if (data[i][colStatus] !== '未実行') continue;
    if (executed >= MAX_PER_RUN) break;

    const query    = data[i][colQuery];
    const category = data[i][colCategory];
    const source   = data[i][colSource];

    let results = [];
    if (source === 'arxiv') {
      results = searchArxiv(query);
    } else if (source === 'rss') {
      results = searchRSS(query);
    } else {
      results = searchWikipedia(query);
    }

    const now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm');
    if (results.length > 0) {
      saveResultsToSheet(ss, category, query, results);
      stratSheet.getRange(i + 1, colStatus + 1).setValue('完了');
    } else {
      stratSheet.getRange(i + 1, colStatus + 1).setValue('結果なし');
    }
    stratSheet.getRange(i + 1, colExecTime + 1).setValue(now);

    executed++;
    Utilities.sleep(1500);
  }

  Logger.log('実行ループ完了: ' + executed + '件実行');
}

// ─────────────────────────────────────────────
// 検索ソース（全て無料・APIキー不要）
// ─────────────────────────────────────────────

function searchWikipedia(query) {
  try {
    const url = 'https://en.wikipedia.org/w/api.php?action=query&list=search'
      + '&srsearch=' + encodeURIComponent(query)
      + '&format=json&srlimit=3&origin=*';
    const res = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      headers: { 'User-Agent': 'zerocost-leverage-research/1.0 (research-engine)' }
    });
    const text = res.getContentText();
    if (!text.startsWith('{')) return [];
    const json = JSON.parse(text);
    return (json.query?.search || []).map(item => ({
      title: item.title,
      url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(item.title.replace(/ /g, '_')),
      snippet: item.snippet.replace(/<[^>]+>/g, '').substring(0, 300),
      source: 'Wikipedia'
    }));
  } catch (e) {
    Logger.log('Wikipedia error: ' + e.message);
    return [];
  }
}

function searchArxiv(query) {
  try {
    const url = 'https://export.arxiv.org/api/query?search_query=all:'
      + encodeURIComponent(query) + '&start=0&max_results=3';
    const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
    const text = res.getContentText();
    const results = [];
    const entries = text.match(/<entry>([\s\S]*?)<\/entry>/g) || [];
    entries.slice(0, 3).forEach(entry => {
      const title   = (entry.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '';
      const id      = (entry.match(/<id>([\s\S]*?)<\/id>/)       || [])[1] || '';
      const summary = (entry.match(/<summary>([\s\S]*?)<\/summary>/) || [])[1] || '';
      if (title) results.push({
        title: title.trim(),
        url: id.trim(),
        snippet: summary.trim().replace(/\n/g, ' ').substring(0, 300),
        source: 'arXiv'
      });
    });
    return results;
  } catch (e) {
    Logger.log('arXiv error: ' + e.message);
    return [];
  }
}

function searchRSS(query) {
  const results = [];
  const keyword = query.toLowerCase().split(' ')[0];

  CONFIG.RSS_FEEDS.forEach(feedUrl => {
    try {
      const res = UrlFetchApp.fetch(feedUrl, { muteHttpExceptions: true });
      const text = res.getContentText();
      const items = text.match(/<item>([\s\S]*?)<\/item>/g) || [];
      items.slice(0, 10).forEach(item => {
        const title = ((item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]>/) ||
                        item.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '').trim();
        const link  = ((item.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '').trim();
        if (title && title.toLowerCase().includes(keyword)) {
          results.push({ title, url: link, snippet: '', source: 'RSS:' + feedUrl.split('/')[2] });
        }
      });
    } catch (e) {
      Logger.log('RSS error: ' + feedUrl.split('/')[2] + ' - ' + e.message);
    }
  });

  return results.slice(0, 3);
}

// ─────────────────────────────────────────────
// Groq API（無料・クレカ不要・6000req/日）
// スクリプトプロパティ: GROQ_API_KEY
// https://console.groq.com でキー取得
// ─────────────────────────────────────────────

function callGroq(prompt) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GROQ_API_KEY');
  if (!apiKey) {
    Logger.log('ERROR: GROQ_API_KEY がスクリプトプロパティに未設定');
    return null;
  }

  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const payload = {
    model: 'llama-3.1-8b-instant',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 2048
  };

  try {
    const res = UrlFetchApp.fetch(url, {
      method: 'post',
      contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + apiKey },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    const json = JSON.parse(res.getContentText());
    if (json.error) {
      Logger.log('Groq API error: ' + JSON.stringify(json.error));
      return null;
    }
    return json.choices?.[0]?.message?.content || null;
  } catch (e) {
    Logger.log('Groq fetch error: ' + e.message);
    return null;
  }
}

// ─────────────────────────────────────────────
// 結果をカテゴリ別シートに保存
// ─────────────────────────────────────────────

function saveResultsToSheet(ss, category, query, results) {
  let sheet = ss.getSheetByName(category);
  if (!sheet) {
    sheet = ss.insertSheet(category);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['日付', '検索クエリ', 'タイトル', 'URL', '概要', 'ソース']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
  }

  const today = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd');
  results.forEach(r => {
    sheet.appendRow([today, query, r.title, r.url, r.snippet, r.source]);
  });
}

// ─────────────────────────────────────────────
// トリガー設定（初回のみ手動実行）
// ─────────────────────────────────────────────

function setupTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('runAll')
    .timeBased()
    .everyDays(1)
    .atHour(7)
    .create();
  Logger.log('完了: 毎朝7時に runAll() が自動実行されます');
}
