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
  const headers = [...allValues[3], "配信実行日時"]; // 4行目のヘッダーに配信日時を追加
  const dataRows = allValues.slice(4); // 5行目からが移動対象
  
  const archiveData = [];
  const remainingData = [...fixedHeaders];
  const now = new Date(); // 【配信月基準】本日を基準にする
  
  // 日付でフィルタリング（A列: タイムスタンプ を参照）
  dataRows.forEach(row => {
    const postDate = new Date(row[0]); // A列
    if (postDate <= deadline) {
      // 配信タイミングのスタンプ（J列想定）を付加してアーカイブ
      archiveData.push([...row, now]);
    } else {
      remainingData.push(row);
    }
  });

  if (archiveData.length > 0) {
    // 【配信月基準】本日の月シートに保存
    const targetMonth = now.getMonth() + 1;
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
    console.log(`${archiveData.length} 件を「${targetSheetName}」へアーカイブ完了。ウェブサイトに反映されました。`);
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

/**
 * 配信実績を「ダッシュボード（管理画面）」シートに記録する
 * @param {Array[]} archiveData 配信対象となった行データの配列
 */
function logBroadcastToDashboard(archiveData) {
  if (!archiveData || archiveData.length === 0) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashSheet = ss.getSheetByName("ダッシュボード（管理画面）");
  if (!dashSheet) {
    console.log("「ダッシュボード（管理画面）」シートが見つからないため、記録をスキップしました。");
    return;
  }

  const today = new Date();
  const monthLabel = (today.getMonth() + 1) + "月"; // 例: "4月"
  const dayLabel = today.getDate() + "日";       // 例: "5日"

  const dashData = dashSheet.getDataRange().getValues();
  const headers = dashData[3]; // 4行目（インデックス3）をヘッダーとする
  
  // 今日の「月」に対応する列を探す
  let monthColIndex = -1;
  for (let c = 0; c < headers.length; c++) {
    if (headers[c].toString().indexOf(monthLabel) !== -1) {
      monthColIndex = c;
      break;
    }
  }

  if (monthColIndex === -1) {
    console.log(monthLabel + " の列がダッシュボードに見つかりません。");
    return;
  }

  // 店舗ID (C列, インデックス2) をキーにして行を探し、追記する
  archiveData.forEach(row => {
    const storeId = row[2]; // 投稿原本のC列（店舗ID）※最新レイアウト
    if (!storeId) return;

    for (let r = 4; r < dashData.length; r++) { // 5行目（インデックス4）から探索
      if (dashData[r][2] == storeId) { // C列（ID）が一致
        const cell = dashSheet.getRange(r + 1, monthColIndex + 1);
        const currentVal = cell.getValue().toString();
        
        if (currentVal.indexOf(dayLabel) === -1) { // まだその日の記録がなければ
          const newVal = currentVal ? currentVal + ", " + dayLabel : dayLabel;
          cell.setValue(newVal);
          console.log(storeId + " の " + monthLabel + " 実績に " + dayLabel + " を記録しました。");
        }
        break;
      }
    }
  });
}
