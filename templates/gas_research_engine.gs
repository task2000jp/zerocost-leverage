/**
 * gas_research_engine.gs — 自律リサーチエンジンの背骨（テンプレート）
 *
 * これをコピーし、CONFIG を差し替えるだけで任意ドメインの
 * 「定期収集 → AI要約 → Sheets蓄積 → 通知」が動く。
 *
 * セットアップ:
 *   1. clasp create --type sheets でGASプロジェクト作成
 *   2. スクリプトプロパティに GEMINI_API_KEY を設定
 *   3. setupTrigger() を1回実行（毎朝の定期実行を登録）
 *
 * ⚠️ 投資情報を扱う場合も、これは「情報集約」であり助言ではない。
 */

// ── 設定（ここだけ差し替える）──────────────────────────
const CONFIG = {
  SHEET_NAME: 'research_log',
  // 監視する RSS / API（無料）。用途に応じて差し替え
  SOURCES: [
    { name: 'GoogleNews', type: 'rss',
      url: 'https://news.google.com/rss/search?q=%E7%94%A3%E6%A5%AD%E9%9D%A9%E5%91%BD&hl=ja&gl=JP&ceid=JP:ja' },
    // { name: 'CoinGecko', type: 'json', url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=jpy' },
  ],
  // 重要度がこの値以上ならメール通知（0-10）
  NOTIFY_THRESHOLD: 7,
  NOTIFY_EMAIL: Session.getActiveUser().getEmail(),
};

// ── エントリ：定期実行で呼ばれる ────────────────────────
function runResearch() {
  const sheet = _getSheet();
  for (const src of CONFIG.SOURCES) {
    const items = (src.type === 'rss') ? _fetchRss(src.url) : _fetchJsonRaw(src.url, src.name);
    for (const item of items) {
      const analysis = _analyzeWithGemini(item.title, item.summary);
      sheet.appendRow([new Date(), src.name, item.title, item.link,
                       analysis.summary, analysis.score]);
      if (analysis.score >= CONFIG.NOTIFY_THRESHOLD) {
        GmailApp.sendEmail(CONFIG.NOTIFY_EMAIL,
          `[重要 ${analysis.score}] ${item.title}`,
          `${analysis.summary}\n\n${item.link}`);
      }
    }
  }
}

// ── RSS取得 ────────────────────────────────────────────
function _fetchRss(url) {
  const xml = UrlFetchApp.fetch(url).getContentText();
  const doc = XmlService.parse(xml);
  const items = doc.getRootElement().getChild('channel').getChildren('item');
  return items.slice(0, 10).map(it => ({
    title: it.getChildText('title'),
    link: it.getChildText('link'),
    summary: (it.getChildText('description') || '').replace(/<[^>]+>/g, '').slice(0, 500),
  }));
}

function _fetchJsonRaw(url, name) {
  const json = UrlFetchApp.fetch(url).getContentText();
  return [{ title: `${name} data`, link: url, summary: json.slice(0, 800) }];
}

// ── Gemini で要約＋重要度スコア（無料枠）──────────────────
function _analyzeWithGemini(title, body) {
  const key = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!key) return { summary: body.slice(0, 200), score: 5 };

  const prompt = `次の情報を日本語で2文に要約し、重要度を0-10で評価。` +
    `JSON {"summary":"...","score":N} のみ返す。\n\nタイトル:${title}\n本文:${body}`;
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' +
    'gemini-2.0-flash:generateContent?key=' + key;
  const res = UrlFetchApp.fetch(url, {
    method: 'post', contentType: 'application/json', muteHttpExceptions: true,
    payload: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  try {
    const text = JSON.parse(res.getContentText())
      .candidates[0].content.parts[0].text.replace(/```json|```/g, '');
    const obj = JSON.parse(text);
    return { summary: obj.summary, score: Number(obj.score) || 5 };
  } catch (e) {
    return { summary: body.slice(0, 200), score: 5 };
  }
}

// ── Sheets ─────────────────────────────────────────────
function _getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!s) {
    s = ss.insertSheet(CONFIG.SHEET_NAME);
    s.appendRow(['日時', 'ソース', 'タイトル', 'リンク', '要約', '重要度']);
    s.getRange(1, 1, 1, 6).setFontWeight('bold');
  }
  return s;
}

// ── 定期トリガー登録（1回だけ実行）─────────────────────
function setupTrigger() {
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('runResearch').timeBased().everyDays(1).atHour(6).create();
  Logger.log('毎朝6時の定期リサーチを登録しました');
}
