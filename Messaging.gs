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
      if (values.length > 0) {
        const headers = values[0];
        const dateColIndex = headers.indexOf("配信実行日時");
        
        if (dateColIndex !== -1) {
          // 「配信実行日時」列が今日の日付であるデータを抽出
          targetData = values.slice(1).filter(row => {
            const d = row[dateColIndex];
            return d instanceof Date && 
                   d.getFullYear() === today.getFullYear() && 
                   d.getMonth() === today.getMonth() && 
                   d.getDate() === today.getDate();
          });
        } else {
          // ヘッダーが見つからない場合は、予備として従来のJ列（インデックス9）を使用
          targetData = values.slice(1).filter(row => {
            const d = row[9];
            return d instanceof Date && 
                   d.getFullYear() === today.getFullYear() && 
                   d.getMonth() === today.getMonth() && 
                   d.getDate() === today.getDate();
          });
        }
      }
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

/**
 * 昨日（25日）の配信し損ねた分を今すぐ強制配信する
 */
function sendEmergencyBroadcast25() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName((new Date().getMonth() + 1) + "月");
  if (!sheet) {
    console.log("今月のシートが見つかりません。");
    return;
  }

  const values = sheet.getDataRange().getValues();
  const headers = values[0];
  const dateColIndex = headers.indexOf("配信実行日時");
  
  if (dateColIndex === -1) {
    console.log("「配信実行日時」列が見つかりません。");
    return;
  }

  // 1. 「25日」のデータだけを抽出
  const targetData = values.slice(1).filter(row => {
    const d = row[dateColIndex];
    return d instanceof Date && d.getDate() === 25;
  });

  if (targetData.length === 0) {
    console.log("昨日（25日）のアーカイブデータが見当たらないため、終了します。");
    return;
  }

  // 2. 配信内容（文章・画像）を取得
  const deliveryContent = getBroadcastContentFixedDate(25);
  if (!deliveryContent.success) {
    console.log("「テキスト」シートに25日の内容が見当たりません。");
    return;
  }
  
  const messages = [];
  if (deliveryContent.imageUrl) {
    messages.push({ "type": "image", "originalContentUrl": deliveryContent.imageUrl, "previewImageUrl": deliveryContent.imageUrl });
  }
  messages.push({ "type": "text", "text": "【再配信】\n" + deliveryContent.text });

  // 3. LINEへ一斉配信
  const LINE_ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty("LINE_ACCESS_TOKEN");
  const url = "https://api.line.me/v2/bot/message/broadcast";
  const options = {
    "method": "post",
    "headers": { "Content-Type": "application/json", "Authorization": "Bearer " + LINE_ACCESS_TOKEN },
    "payload": JSON.stringify({ "messages": messages })
  };

  const response = UrlFetchApp.fetch(url, options);
  console.log("緊急配信完了: " + response.getContentText());
}

/**
 * 特定の日付の内容を「テキスト」シートから取得する補助関数
 */
function getBroadcastContentFixedDate(targetDay) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("テキスト");
  const data = sheet.getDataRange().getValues();
  
  for (let i = 3; i < data.length; i++) {
    const rowDateRaw = data[i][0];
    if (rowDateRaw instanceof Date) {
      if (rowDateRaw.getDate() == targetDay) {
        const text = data[i][1];
        const imageUrl = convertDriveUrl(data[i][2]);
        return { text, imageUrl, success: true };
      }
    } else if (rowDateRaw == targetDay) {
      const text = data[i][1];
      const imageUrl = convertDriveUrl(data[i][2]);
      return { text, imageUrl, success: true };
    }
  }
  return { success: false };
}
