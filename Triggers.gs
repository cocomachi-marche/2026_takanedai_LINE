/**
 * 🏮 ココまちマルシェ：自動実行トリガー (Triggers.gs)
 * 役割：5, 15, 25日のスケジュール管理
 */

/**
 * 毎日1回（朝など）に実行するように設定する関数
 * 今日が 5日, 15日, 25日 であれば配信処理を実行する
 */
function dailyTriggerCheck() {
  const today = new Date();
  const date = today.getDate();

  if (date === 5 || date === 15 || date === 25) {
    console.log(`${date}日です。自動配信を開始します。`);
    sendLineBroadcast(); // Messaging.gs から呼び出し
  } else {
    console.log(`今日は${date}日です。配信予定日ではありません。`);
  }
}

/**
 * 初回設定用の関数（手動で一度だけ実行）
 * 毎日 午前8時〜9時の間にチェックを行うように設定
 */
function setupDailyTrigger() {
  // 既存のトリガーがあれば削除（重複防止）
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === "dailyTriggerCheck") {
      ScriptApp.deleteTrigger(trigger);
    }
  });

  // 毎日 8時ちょうど（付近）に実行
  ScriptApp.newTrigger("dailyTriggerCheck")
    .timeBased()
    .everyDays(1)
    .atHour(8)
    .nearMinute(0)
    .create();
    
  console.log("毎日午前8時台のチェックトリガーを設定しました。");
}
