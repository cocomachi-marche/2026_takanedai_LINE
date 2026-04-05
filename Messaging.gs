/**
 * 🏮 ココまちマルシェ：LINE配信機能 (Messaging.gs)
 * 役割：LINEへの一斉送信
 */

const LINE_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty("LINE_ACCESS_TOKEN");

/**
 * LINE 一斉配信 (Broadcast)
 */
function sendLineBroadcast() {
  const today = new Date();
  const date = today.getDate();
  let deadline = new Date(today);
  
  if (date === 5) {
    deadline = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
  } else if (date === 15) {
    deadline = new Date(today.getFullYear(), today.getMonth(), 10, 23, 59, 59);
  } else if (date === 25) {
    deadline = new Date(today.getFullYear(), today.getMonth(), 20, 23, 59, 59);
  } else {
    deadline.setHours(23, 59, 59);
  }

  // 1. まずアーカイブを実行（もし5:00に実行済みなら空が返る）
  const archiveData = archiveTargetData(deadline);
  
  // 2. もしアーカイブが空なら、すでにアーカイブ済みの「本日の配信分」を探す
  let targetData = archiveData;
  if (targetData.length === 0) {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName((today.getMonth() + 1) + "月");
    if (sheet) {
      const values = sheet.getDataRange().getValues();
      // J列（インデックス9）が「今日」のデータを抽出
      targetData = values.slice(1).filter(row => {
        const d = row[9];
        return d instanceof Date && 
               d.getFullYear() === today.getFullYear() && 
               d.getMonth() === today.getMonth() && 
               d.getDate() === today.getDate();
      });
    }
  }

  if (targetData.length === 0) {
    console.log("本日の配信対象データが見当たらないため、スキップしました。");
    return;
  }

  const deliveryContent = getBroadcastContent();
  if (!deliveryContent.success) {
    console.log("配信テキストが見当たらないため、スキップしました。");
    return;
  }
  
  const messages = [];
  if (deliveryContent.imageUrl) {
    messages.push({ "type": "image", "originalContentUrl": deliveryContent.imageUrl, "previewImageUrl": deliveryContent.imageUrl });
  }
  messages.push({ "type": "text", "text": deliveryContent.text });

  const url = "https://api.line.me/v2/bot/message/broadcast";
  const options = {
    "method": "post",
    "headers": { "Content-Type": "application/json", "Authorization": "Bearer " + LINE_ACCESS_TOKEN },
    "payload": JSON.stringify({ "messages": messages })
  };

  const response = UrlFetchApp.fetch(url, options);
  console.log("LINE 一斉配信完了: " + response.getContentText());

  // ダッシュボードへの記録
  logBroadcastToDashboard(targetData);
}

/**
 * テスト送信 (Push)
 */
function testDelivery() {
  const adminIdsRaw = PropertiesService.getScriptProperties().getProperty("ADMIN_USER_IDS");
  if (!adminIdsRaw) throw new Error("スクリプトプロパティに ADMIN_USER_IDS を設定してください。");

  const adminIds = adminIdsRaw.split(",").map(id => id.trim());
  
  const testContent = getBroadcastContent();
  
  if (!testContent.success) {
    throw new Error("「テキスト」シートに, 今日の日付の行が見つかりません。");
  }

  const messages = [];
  // 1. 画像があれば先に入れる
  if (testContent.imageUrl) {
    console.log("テスト送信する画像URL: " + testContent.imageUrl);
    messages.push({ "type": "image", "originalContentUrl": testContent.imageUrl, "previewImageUrl": testContent.imageUrl });
  }
  // 2. 次にテキストを入れる
  messages.push({ "type": "text", "text": "【テスト配信】\n\n" + testContent.text });

  adminIds.forEach(id => {
    const url = "https://api.line.me/v2/bot/message/push";
    const options = {
      "method": "post",
      "headers": { "Content-Type": "application/json", "Authorization": "Bearer " + LINE_ACCESS_TOKEN },
      "payload": JSON.stringify({ "to": id, "messages": messages })
    };
    UrlFetchApp.fetch(url, options);
    console.log("テスト送信完了: " + id);
  });
}
