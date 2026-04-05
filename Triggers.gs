/**
 * 🏮 ココまちマルシェ：自動実行トリガー (Triggers.gs)
 * 役割：5:00 ウェブ一斉更新 ＆ 8:00 LINE一斉配信
 */

/**
 * 毎日 5:00 に実行：ウェブサイトの内容を最新化する（アーカイブ処理）
 */
function prepareWebsiteUpdate() {
  const today = new Date();
  const date = today.getDate();
  
  // 配信予定日（5, 15, 25日）のみ処理を実行
  if (date === 5 || date === 15 || date === 25) {
    console.log(`${date}日 5:00 です。ウェブサイトの一斉更新を開始します...`);
    
    // 締切日の計算
    let deadline = new Date(today);
    if (date === 5) {
      deadline = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
    } else if (date === 15) {
      deadline = new Date(today.getFullYear(), today.getMonth(), 10, 23, 59, 59);
    } else if (date === 25) {
      deadline = new Date(today.getFullYear(), today.getMonth(), 20, 23, 59, 59);
    }
    
    // アーカイブ処理を実行（これでウェブにNEWが点灯します）
    archiveTargetData(deadline);
  } else {
    console.log("今日は定期配信日ではありません。");
  }
}

/**
 * 毎日 8:00 に実行：LINEの一斉配信を行う
 */
function dailyTriggerCheck() {
  const today = new Date();
  const date = today.getDate();

  if (date === 5 || date === 15 || date === 25) {
    console.log(`${date}日 8:00 です。LINE一斉配信を開始します。`);
    sendLineBroadcast(); // Messaging.gs の処理を実行
  }
}

/**
 * 初回設定用：5:00 と 8:00 のトリガーをセットする
 */
function setupDailyTrigger() {
  // 既存のトリガーを全削除
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));

  // 1. ウェブ更新用（5:00）
  ScriptApp.newTrigger("prepareWebsiteUpdate")
    .timeBased()
    .everyDays(1)
    .atHour(5)
    .nearMinute(0)
    .create();

  // 2. LINE配信用（8:00）
  ScriptApp.newTrigger("dailyTriggerCheck")
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .nearMinute(0)
    .create();
    
  console.log("5:00（ウェブ更新）と 8:00（LINE配信）の予約設定が完了しました。");
}
