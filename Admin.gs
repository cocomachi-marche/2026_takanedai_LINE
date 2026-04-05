/**
 * 🏮 ココまちマルシェ：管理・アーカイブ機能 (Admin.gs)
 * 役割：月次保存、配信データの整理（日付フィルタ付き）
 */

/**
 * 配信対象となるデータを抽出し、アーカイブへ移動する
 * @param {Date} deadline 締切日（この日までのデータをアーカイブ・配信対象とする）
 */
function archiveTargetData(deadline) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sourceSheet = ss.getSheetByName("投稿原本");
  const allValues = sourceSheet.getDataRange().getValues();
  
  if (allValues.length < 5) return [];

  const fixedHeaders = allValues.slice(0, 4); // 1〜4行目を保護
  const headers = allValues[3]; // 4行目を月別シートのヘッダーに使用
  const dataRows = allValues.slice(4); // 5行目からが移動対象
  
  const archiveData = [];
  const remainingData = [...fixedHeaders];
  
  // 日付でフィルタリング（A列: タイムスタンプ を参照）
  dataRows.forEach(row => {
    const postDate = new Date(row[0]); // A列
    if (postDate <= deadline) {
      archiveData.push(row);
    } else {
      remainingData.push(row);
    }
  });

  if (archiveData.length > 0) {
    // アーカイブ先（投稿日時の月）のシートに保存
    const targetMonth = deadline.getMonth() + 1;
    const targetSheetName = `${targetMonth}月`;
    let targetSheet = ss.getSheetByName(targetSheetName);
    if (!targetSheet) {
      targetSheet = ss.insertSheet(targetSheetName);
      targetSheet.appendRow(headers);
    }
    targetSheet.getRange(targetSheet.getLastRow() + 1, 1, archiveData.length, archiveData[0].length).setValues(archiveData);

    // 投稿原本を更新（未配信分だけ残す）
    sourceSheet.clear();
    sourceSheet.getRange(1, 1, remainingData.length, remainingData[0].length).setValues(remainingData);
    console.log(`${archiveData.length} 件を配信対象としてアーカイブしました。`);
  }

  return archiveData; // 配信で使うためにデータを返す
}

/**
 * 「テキスト」シートから、今日の日付に対応する行を探して配信内容を取得する
 */
function getBroadcastContent() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("テキスト");
  if (!sheet) throw new Error("「テキスト」シートが見つかりません。");
  
  const today = new Date();
  const date = today.getDate(); // 今日が「何日」か (5, 15, 25など)
  const data = sheet.getDataRange().getValues();
  
  // 4行目（インデックス3）から順に探す
  for (let i = 3; i < data.length; i++) {
    const rowDateRaw = data[i][0]; // A列（配信日）
    
    // 判定ロジック：
    // 1. セルが「日付形式」の場合：年・月・日がすべて今日と一致するか
    if (rowDateRaw instanceof Date) {
      if (rowDateRaw.getFullYear() == today.getFullYear() &&
          rowDateRaw.getMonth() == today.getMonth() &&
          rowDateRaw.getDate() == today.getDate()) {
        const text = data[i][1];
        const imageUrl = convertDriveUrl(data[i][2]); // ここで変換！
        if (text) return { text, imageUrl, success: true };
      }
    } 
    // 2. セルが「数字」の場合：今日の「日にち」と一致するか（毎月用）
    else if (rowDateRaw == date) {
      const text = data[i][1];
      const imageUrl = convertDriveUrl(data[i][2]); // ここで変換！
      if (text) return { text, imageUrl, success: true };
    }
  }
  
  // 該当日付が見つからない場合
  return { text: "", imageUrl: "", success: false };
}

/**
 * Googleドライブの共有リンクを、LINEで表示可能な「直リンク」に変換する
 */
function convertDriveUrl(url) {
  if (!url || typeof url !== "string") return url || "";
  const trimmedUrl = url.trim(); // 余計な空白を削除
  if (trimmedUrl.indexOf("drive.google.com") === -1) return trimmedUrl;
  
  // URLの中からファイルID（25文字以上の英数字記号）を抽出
  const idMatch = trimmedUrl.match(/[-\w]{25,}/);
  if (idMatch) {
    const fileId = idMatch[0];
    // LINEで表示されやすいサムネイル表示形式（w1000 = 幅1000px）を試す
    return "https://drive.google.com/thumbnail?id=" + fileId + "&sz=w1000";
  }
  return trimmedUrl;
}
