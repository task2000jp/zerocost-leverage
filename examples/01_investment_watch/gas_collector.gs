// ============================================================
// 投資監視エンジン（エンジン①の投資特化版）
// ⚠️ 情報集約のみ。投資助言・売買執行には使用しないこと。
// ============================================================
// セットアップ: スクリプトプロパティに GROQ_API_KEY を設定
// ============================================================

const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

const CONFIG = {
  // 監視銘柄・テーマ（差し替えOK）
  WATCHLIST: ['Toyota', 'NVIDIA', 'Bitcoin', 'S&P500', 'Japanese Yen'],
  // 重要度がこの値以上なら Gmail通知（0-10）
  NOTIFY_THRESHOLD: 8,

  RSS_FEEDS: [
    'https://news.google.com/rss/search?q=stock+market+japan&hl=en&gl=US&ceid=US:en',
    'https://news.google.com/rss/search?q=cryptocurrency+bitcoin&hl=en&gl=US&ceid=US:en',
    'https://feeds.finance.yahoo.com/rss/2.0/headline?s=^N225&region=US&lang=en-US',
  ],
};

// ─────────────────────────────────────────────
// メインエントリー（毎朝7時に自動実行）
// ─────────────────────────────────────────────

function runAll() {
  runStrategyLoop();
  Utilities.sleep(2000);
  runExecutionLoop();
}

// ─────────────────────────────────────────────
// 1. 模索ループ: Groqが「今日調べること」を生成
// ─────────────────────────────────────────────

function runStrategyLoop() {
  const today = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd');
  const watchlistStr = CONFIG.WATCHLIST.join(', ');

  const prompt = `
You are a financial research assistant monitoring: ${watchlistStr}

Today is ${today}. Generate 10 search queries for market research.

Categories:
- market_news: 4 queries (price movements, earnings, macro events)
- fundamentals: 3 queries (company/asset fundamentals, analysis)
- academic: 3 queries (financial research papers, quantitative methods)

Rules:
- source must be exactly "rss", "wikipedia", or "arxiv"
- queries must be in English
- Return ONLY this JSON, no explanation:
{"date":"${today}","queries":[{"category":"market_news","query":"NVIDIA earnings Q2 2026","source":"rss"}]}
`;

  const result = callGroq(prompt);
  if (!result) return;

  try {
    const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
    const data = JSON.parse(cleaned);
    saveStrategiesToSheet(data);
    Logger.log('Strategy loop done: ' + data.queries.length + ' queries');
  } catch (e) {
    Logger.log('Strategy loop error: ' + e.message + '\nRaw: ' + result.substring(0, 300));
  }
}

function saveStrategiesToSheet(data) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName('クエリログ');
  if (!sheet) sheet = ss.insertSheet('クエリログ');

  if (sheet.getRange('A1').getValue() !== '日付') {
    sheet.clearContents();
    sheet.appendRow(['日付', 'カテゴリ', '検索クエリ', 'ソース', 'ステータス', '実行日時']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
  }
  data.queries.forEach(q => {
    sheet.appendRow([data.date, q.category, q.query, q.source, '未実行', '']);
  });
}

// ─────────────────────────────────────────────
// 2. 実行ループ: 検索を実行してDBに保存
// ─────────────────────────────────────────────

function runExecutionLoop() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const stratSheet = ss.getSheetByName('クエリログ');
  if (!stratSheet || stratSheet.getLastRow() < 2) return;

  const data = stratSheet.getDataRange().getValues();
  const headers = data[0];
  const cols = {
    status:   headers.indexOf('ステータス'),
    query:    headers.indexOf('検索クエリ'),
    category: headers.indexOf('カテゴリ'),
    source:   headers.indexOf('ソース'),
    execTime: headers.indexOf('実行日時'),
  };

  let executed = 0;
  for (let i = 1; i < data.length; i++) {
    if (data[i][cols.status] !== '未実行') continue;
    if (executed >= 5) break;

    const query    = data[i][cols.query];
    const category = data[i][cols.category];
    const source   = data[i][cols.source];

    let results = [];
    if (source === 'arxiv')     results = searchArxiv(query);
    else if (source === 'rss')  results = searchRSS(query);
    else                        results = searchWikipedia(query);

    const now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm');
    if (results.length > 0) {
      saveResults(ss, category, query, results);
      stratSheet.getRange(i + 1, cols.status + 1).setValue('完了');
    } else {
      stratSheet.getRange(i + 1, cols.status + 1).setValue('結果なし');
    }
    stratSheet.getRange(i + 1, cols.execTime + 1).setValue(now);
    executed++;
    Utilities.sleep(1500);
  }
  Logger.log('Execution loop done: ' + executed + ' queries');
}

// ─────────────────────────────────────────────
// 検索ソース（全て無料）
// ─────────────────────────────────────────────

function searchWikipedia(query) {
  try {
    const url = 'https://en.wikipedia.org/w/api.php?action=query&list=search'
      + '&srsearch=' + encodeURIComponent(query) + '&format=json&srlimit=3&origin=*';
    const json = JSON.parse(UrlFetchApp.fetch(url, { muteHttpExceptions: true }).getContentText());
    return (json.query?.search || []).map(item => ({
      title: item.title,
      url: 'https://en.wikipedia.org/wiki/' + encodeURIComponent(item.title.replace(/ /g, '_')),
      snippet: item.snippet.replace(/<[^>]+>/g, '').substring(0, 300),
      source: 'Wikipedia'
    }));
  } catch (e) { Logger.log('Wikipedia error: ' + e.message); return []; }
}

function searchArxiv(query) {
  try {
    const url = 'https://export.arxiv.org/api/query?search_query=all:'
      + encodeURIComponent(query) + '&start=0&max_results=3';
    const text = UrlFetchApp.fetch(url, { muteHttpExceptions: true }).getContentText();
    const entries = text.match(/<entry>([\s\S]*?)<\/entry>/g) || [];
    return entries.slice(0, 3).map(entry => ({
      title: (entry.match(/<title>([\s\S]*?)<\/title>/) || [])[1]?.trim() || '',
      url:   (entry.match(/<id>([\s\S]*?)<\/id>/)       || [])[1]?.trim() || '',
      snippet: (entry.match(/<summary>([\s\S]*?)<\/summary>/) || [])[1]?.trim().replace(/\n/g, ' ').substring(0, 300) || '',
      source: 'arXiv'
    })).filter(r => r.title);
  } catch (e) { Logger.log('arXiv error: ' + e.message); return []; }
}

function searchRSS(query) {
  const results = [];
  const keyword = query.toLowerCase().split(' ')[0];
  CONFIG.RSS_FEEDS.forEach(feedUrl => {
    try {
      const text = UrlFetchApp.fetch(feedUrl, { muteHttpExceptions: true }).getContentText();
      const items = text.match(/<item>([\s\S]*?)<\/item>/g) || [];
      items.slice(0, 10).forEach(item => {
        const title = ((item.match(/<title><!\[CDATA\[([\s\S]*?)\]\]>/) ||
                        item.match(/<title>([\s\S]*?)<\/title>/) || [])[1] || '').trim();
        const link  = ((item.match(/<link>([\s\S]*?)<\/link>/) || [])[1] || '').trim();
        if (title && title.toLowerCase().includes(keyword))
          results.push({ title, url: link, snippet: '', source: 'RSS:' + feedUrl.split('/')[2] });
      });
    } catch (e) {}
  });
  return results.slice(0, 3);
}

// ─────────────────────────────────────────────
// Groq API（無料・クレカ不要）
// ─────────────────────────────────────────────

function callGroq(prompt) {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GROQ_API_KEY');
  if (!apiKey) { Logger.log('ERROR: GROQ_API_KEY 未設定'); return null; }

  try {
    const res = UrlFetchApp.fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'post', contentType: 'application/json',
      headers: { 'Authorization': 'Bearer ' + apiKey },
      payload: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7, max_tokens: 2048
      }),
      muteHttpExceptions: true
    });
    const json = JSON.parse(res.getContentText());
    if (json.error) { Logger.log('Groq error: ' + JSON.stringify(json.error)); return null; }
    return json.choices?.[0]?.message?.content || null;
  } catch (e) { Logger.log('Groq fetch error: ' + e.message); return null; }
}

// ─────────────────────────────────────────────
// 結果保存 + 高スコア通知
// ─────────────────────────────────────────────

function saveResults(ss, category, query, results) {
  let sheet = ss.getSheetByName(category);
  if (!sheet) { sheet = ss.insertSheet(category); }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['日付', '検索クエリ', 'タイトル', 'URL', '概要', 'ソース']);
    sheet.getRange(1, 1, 1, 6).setFontWeight('bold');
  }
  const today = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd');
  results.forEach(r => sheet.appendRow([today, query, r.title, r.url, r.snippet, r.source]));
}

// ─────────────────────────────────────────────
// トリガー設定（初回のみ手動実行）
// ─────────────────────────────────────────────

function setupTriggers() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('runAll').timeBased().everyDays(1).atHour(7).create();
  Logger.log('完了: 毎朝7時に runAll() が自動実行されます');
}
