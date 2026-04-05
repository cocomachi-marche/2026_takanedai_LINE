/**
 * 🏮 ココまちマルシェ：バックエンド心臓部 (Code.gs)
 * フェーズ3：ショップリスト完全自動化
 */

const SS_ID = "1kdSyafGgFiPUuJW1LpObMlQ6CEWVH9BSqodhscqospo";
const FOLDER_ID = "1djDPnT1caz3Lji0-YpKgQ_3CdIpFdBWA"; // ヒデさん指定のフォルダ

/**
 * 既存の店舗固定データ (HTMLから抽出)
 */
const FIXED_DATA = {
  "369": { address: "千葉県船橋市高根台1-8-2", hours: "11:00〜14:30、18:00〜23:00", holiday: "月曜日、木曜日、不定休", phone: "047-407-1369", hp: "https://yoshokudobar369.owst.jp/", sns: "https://www.instagram.com/yoshokudobar_369/", tags: "#飲食,#ランチ,#ディナー,#お酒,#バル,#レストラン,#お食事,#日本酒" },
  "mnm": { address: "-", hours: "-", holiday: "-", phone: "-", hp: "-", sns: "https://www.instagram.com/handmade_minmi", tags: "#ハンドメイド,#編み物,#編みぐるみ" },
  "szk": { address: "千葉県船橋市芝山2-8-1", hours: "9:00〜18:00", holiday: "第2第4月曜日、年末年始", phone: "047-463-2101", hp: "https://suzuki-auto-keiyo.jp/", sns: "https://www.instagram.com/suzuki_auto_keiyo", tags: "#車,#整備,#地域密着" },
  "knr": { address: "千葉県船橋市高根台6-2-21-2F", hours: "11:00〜16:00", holiday: "水曜日、土曜日", phone: "-", hp: "-", sns: "https://www.instagram.com/cafe_kinari", tags: "#バインミー,#アサイーボウル,#コーヒー,#カフェ,#耳ツボジュエリー" },
  "oyk": { address: "千葉県船橋市大穴南1-40-12", hours: "12:00~15:00、17:00~22:00", holiday: "火曜日", phone: "047-404-3820", hp: "-", sns: "https://www.instagram.com/okonomiyaki_kin.iro", tags: "#飲食,#お好み焼き,#滝不動,#昼飲み,#自家製出汁" },
  "tmp": { address: "船橋市七林町114-61", hours: "14時〜20時", holiday: "-", phone: "090-3067-5899", hp: "https://www.miho-piano.site/", sns: "https://www.facebook.com/田中美穂ピアノ教室-100051468146037/", tags: "#教育,#ピアノ,#ピアノ教室,#ヴァイオリン" },
  "yknr": { address: "千葉県船橋市高根台6-2-21-2F", hours: "11:00〜16:00", holiday: "水曜日、土曜日", phone: "-", hp: "-", sns: "https://www.instagram.com/cafe_kinari", tags: "#眼精疲労,#ダイエット,#肩こり腰痛,#リフトアップ,#健康,#美容,#耳ツボジュエリー" },
  "mypl": { address: "船橋市西船4-19-3 西船成島ビル8階", hours: "9:00～18:00", holiday: "土曜日、日曜日、祝日", phone: "047-495-0521", hp: "https://funabashi.mypl.net/", sns: "https://www.instagram.com/mypl_funabashi/", tags: "#メディア,#広告,#地域情報" },
  "mld": { address: "-", hours: "5:00〜22:00", holiday: "-", phone: "090-4606-3061", hp: "https://www.mmihodesign.com/", sns: "https://www.instagram.com/funabashi_designmlabo", tags: "#クリエイティブ,#SNS,#デザイン" },
  "akh": { address: "千葉県船橋市本町1-3-1船橋フェイスビル12階", hours: "9:00～18:00", holiday: "水曜日、日曜日、祝日", phone: "080-5643-1908", hp: "https://www.asahi-kasei.co.jp/hebel/index.html/", sns: "https://www.instagram.com/hebelhaus_official/", tags: "#住宅,#リフォーム,#賃貸経営" },
  "ydk": { address: "千葉県船橋市南三咲3-15-5", hours: "月〜金10:00〜20:00など", holiday: "年末年始のみ", phone: "047-494-9989", hp: "https://www.ondoko.com", sns: "-", tags: "#岩盤浴,#健康,#美容" },
  "lpc": { address: "千葉県船橋市高根台6-8-1", hours: "11:00〜16:30", holiday: "日曜日、月曜日", phone: "047-404-8522", hp: "-", sns: "https://www.instagram.com/lepetitcafe_chiba", tags: "#飲食,#カフェ,#スイーツ,#手作り,#ランチ" },
  "usk": { address: "東京都", hours: "10時～15時", holiday: "-", phone: "-", hp: "https://u-suke-art.sakura.ne.jp/", sns: "https://www.instagram.com/usuke_works/", tags: "#イラスト,#絵本,#グッズ,#ワークショップ" },
  "uchu": { address: "千葉県船橋市高根台7-13-16", hours: "17:00～24:00", holiday: "基本日曜日", phone: "047-779-0696", hp: "-", sns: "-", tags: "#飲食,#居酒屋,#本鮪" },
  "npi": { address: "千葉県船橋市", hours: "10:00〜20:00", holiday: "なし", phone: "090-1607-4046", hp: "https://hi-photo.jp/", sns: "https://www.instagram.com/dog.naturalportrait/", tags: "#家族写真,#わんこ,#撮影,#出張" },
  "fnt": { address: "船橋市", hours: "-", holiday: "年中無休", phone: "090-5829-7010", hp: "https://www.instagram.com/funabashi._.funatabi/", sns: "https://www.instagram.com/funabashi._.funatabi/", tags: "#船橋,#地域メディア" },
  "pal": { address: "千葉県", hours: "月～金 9:00～20:00", holiday: "日曜日", phone: "0120-868-014", hp: "https://www.palsystem-chiba.coop/", sns: "-", tags: "#宅配,#食品,#雑貨,#ミールキット" },
  "khe": { address: "千葉県船橋市米ヶ﨑町", hours: "10:00〜19:30", holiday: "-", phone: "-", hp: "http://www.k-heart-beauty.com/", sns: "https://www.instagram.com/kheart1118", tags: "#エステ,#アロマ,#癒し" },
  "ust": { address: "千葉県船橋市習志野台２丁目６−１５ 2F", hours: "10:00～21:00", holiday: "不定休", phone: "090-5772-3512", hp: "https://www.u-studio.yoga/#top", sns: "https://www.instagram.com/u_studio_ekam_yoga?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==", tags: "#骨盤ヨガ,#リラックスヨガ,#赤ちゃん連れママヨガ,#椅子ヨガ,#パーソナルレッスン" }
};

/**
 * HTML側からのデータ取得リクエスト (GET)
 */
function doGet(e) {
  const type = e.parameter.type || "list";
  const ss = SpreadsheetApp.openById(SS_ID);
  const sheet = ss.getSheetByName("投稿原本"); // シート名を「投稿原本」に修正
  const allValues = sheet.getDataRange().getValues();
  // 5行目以降にデータがない場合は空配列を返す
  if (allValues.length < 5) return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);

  const headers = allValues[3]; // 4行目（インデックス3）をヘッダーとする
  const values = allValues.slice(4); // 5行目（インデックス4）からデータ

  // データをオブジェクト配列に変換
  const data = values.map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      if (header) obj[header] = row[index];
    });
    return obj;
  });

  // 最新の1件を優先してマージ
  const mergedData = {};
  data.forEach(item => {
    const id = item["店舗ID"];
    if (!id) return;
    // A列がタイムスタンプに変更されたため、それに基づいてマージ
    if (!mergedData[id] || new Date(item["タイムスタンプ"]) > new Date(mergedData[id]["タイムスタンプ"])) {
      mergedData[id] = item;
    }
  });

  // 固定データを合体
  const finalData = Object.keys(mergedData).map(id => {
    const dynamic = mergedData[id];
    const fixed = FIXED_DATA[id] || {};
    return { ...fixed, ...dynamic };
  });

  if (type === "detail") {
    const targetId = e.parameter.id;
    const detail = finalData.find(d => d["店舗ID"] == targetId);
    return ContentService.createTextOutput(JSON.stringify(detail)).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify(finalData)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 投稿フォームからのPOSTデータを受信
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SS_ID);
    const sheet = ss.getSheetByName("投稿原本"); // シート名を「投稿原本」に修正
    
    // 画像の保存とURL取得 (Drive直リンク化)
    const imageUrls = [];
    if (data.images && data.images.length > 0) {
      const folder = DriveApp.getFolderById(FOLDER_ID);
      data.images.forEach((base64, index) => {
        if (!base64) return;
        const contentType = base64.split(",")[0].split(":")[1].split(";")[0];
        const bytes = Utilities.base64Decode(base64.split(",")[1]);
        const fileName = `${data.storeId}_${new Date().getTime()}_${index+1}.png`;
        const file = folder.createFile(Utilities.newBlob(bytes, contentType, fileName));
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        imageUrls.push(`https://drive.google.com/uc?id=${file.getId()}`);
      });
    }

    // スプレッドシートへの記録 (A:タイムスタンプ, B:店舗ID ... )
    sheet.appendRow([
      new Date(),        // タイムスタンプ (A)
      data.storeId,       // 店舗ID (B)
      data.storeName,    // 店名 (C)
      data.title,        // 紹介タイトル (D)
      data.introShort,   // スマホ紹介文 (E)
      data.description,  // 詳細本文 (F)
      imageUrls[0] || "", // メイン写真 (G)
      imageUrls[1] || "", // 追加写真1 (H)
      imageUrls[2] || ""  // 追加写真2 (I)
    ]);

    return ContentService.createTextOutput("OK").setMimeType(ContentService.MimeType.TEXT);
  } catch (err) {
    return ContentService.createTextOutput("Error: " + err.message).setMimeType(ContentService.MimeType.TEXT);
  }
}

