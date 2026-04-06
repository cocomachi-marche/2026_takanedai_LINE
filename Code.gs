/**
 * 🏮 ココまちマルシェ：バックエンド心臓部 (Code.gs)
 * フェーズ3：ショップリスト完全自動化
 */

const SS_ID = "1kdSyafGgFiPUuJW1LpObMlQ6CEWVH9BSqodhscqospo";
const FOLDER_ID = "1Whxg3bzeXV0t0RFIJaXfpagKxTKyoeOP"; // ヒデさん指定のフォルダ

/**
 * 既存の店舗固定データ
 */
const FIXED_DATA = {
  "369": { "店名": "洋食堂バル369", "紹介タイトル": "寄り道したくなるお店", "スマホ紹介文": "高根公団駅近のアットホームな飲食店", address: "千葉県船橋市高根台1-8-2", hours: "11:00〜14:30、18:00〜23:00", holiday: "月曜日、木曜日、不定休", phone: "047-407-1369", hp: "https://yoshokudobar369.owst.jp/", sns: "https://www.instagram.com/yoshokudobar_369/", tags: "#飲食,#ランチ,#ディナー,#お酒,#バル,#レストラン,#お食事,#日本酒,#食べる 飲む" },
  "mnm": { "店名": "はんどめいど　みんみ", "紹介タイトル": "編みぐるみ販売", "スマホ紹介文": "かぎ針編みで制作した編みぐるみ販売", address: "-", hours: "-", holiday: "-", phone: "-", hp: "-", sns: "https://www.instagram.com/handmade_minmi", tags: "#ハンドメイド,#編み物,#編みぐるみ,#日常生活,#ギフト" },
  "szk": { "店名": "スズキオート京葉株式会社", "紹介タイトル": "創業55年地域密着企業", "スマホ紹介文": "地域密着の車屋さんです。みんな相談に来てね！", address: "千葉県船橋市芝山2-8-1", hours: "9:00〜18:00", holiday: "第2第4月曜日、年末年始", phone: "047-463-2101", hp: "https://suzuki-auto-keiyo.jp/", sns: "https://www.instagram.com/suzuki_auto_keiyo", tags: "#車,#整備,#地域密着,#日常生活,#お悩み解決" },
  "knr": { "店名": "Cafe Kinari", "紹介タイトル": "静かなご褒美 食べる 飲む", "スマホ紹介文": "心ほどける小さなカフェ", address: "千葉県船橋市高根台6-2-21-2F", hours: "11:00〜16:00", holiday: "水曜日、土曜日", phone: "-", hp: "-", sns: "https://www.instagram.com/cafe_kinari", tags: "#バインミー,#アサイーボウル,#コーヒー,#カフェ,#耳ツボジュエリー,#食べる 飲む,#美容 健康" },
  "oyk": { "店名": "お好み焼き　きんいろ", "紹介タイトル": "自家製出汁たっぷり", "スマホ紹介文": "たっぷりキャベツのふわっふわお好み焼き", address: "千葉県船橋市大穴南1-40-12", hours: "12:00~15:00、17:00~22:00", holiday: "火曜日", phone: "047-404-3820", hp: "-", sns: "https://www.instagram.com/okonomiyaki_kin.iro", tags: "#飲食,#お好み焼き,#滝不動,#昼飲み,#自家製出出し,#食べる 飲む" },
  "tmp": { "店名": "田中美穂ピアノ教室", "紹介タイトル": "みんな音楽家", "スマホ紹介文": "リズム遊びをしながら楽器に触れてみよう", address: "船橋市七林町114-61", hours: "14時〜20時", holiday: "-", phone: "090-3067-5899", hp: "https://www.miho-piano.site/", sns: "https://www.facebook.com/田中美穂ピアノ教室", tags: "#教育,#ピアノ,#ヴァイオリン,#学ぶ,#ベビーキッズ歓迎" },
  "yknr": { "店名": "耳つぼジュエリー Kinari", "紹介タイトル": "ピアス感覚で健康に", "スマホ紹介文": "耳つぼに貼るだけで体感できます。", address: "千葉県船橋市高根台6-2-21-2F", hours: "11:00〜16:00", holiday: "水曜日、土曜日", phone: "-", hp: "-", sns: "https://www.instagram.com/cafe_kinari", tags: "#眼精疲労,#ダイエット,#肩こり腰痛,#リフトアップ,#健康,#美容,#耳ツボジュエリー,#美容 健康,#お悩み解決" },
  "mypl": { "店名": "まいぷれ船橋", "紹介タイトル": "地域情報満載", "スマホ紹介文": "船橋の今を届ける地域情報サイト", address: "船橋市西船4-19-3 西船成島ビル8階", hours: "9:00～18:00", holiday: "土曜日、日曜日、祝日", phone: "047-495-0521", hp: "https://funabashi.mypl.net/", sns: "https://www.instagram.com/mypl_funabashi/", tags: "#メディア,#広告,#地域情報,#日常生活" },
  "mld": { "店名": "えむらぼデザイン", "紹介タイトル": "想いをカタチに", "スマホ紹介文": "船橋の小さなデザイン事務所", address: "-", hours: "5:00〜22:00", holiday: "-", phone: "090-4606-3061", hp: "https://www.mmihodesign.com/", sns: "https://www.instagram.com/funabashi_designmlabo", tags: "#クリエイティブ,#SNS,#デザイン,#お悩み解決" },
  "akh": { "店名": "旭化成ホームズ株式会社", "紹介タイトル": "長く、共に歩む住まい", "スマホ紹介文": "住宅展示場で理想の暮らしを体験", address: "千葉県船橋市本町1-3-1 船橋フェイスビル12階", hours: "9:00～18:00", holiday: "水曜、日曜、祝日", phone: "080-5643-1908", hp: "https://www.asahi-kasei.co.jp/hebel/", sns: "https://www.instagram.com/hebelhaus_official/", tags: "#住宅,#リフォーム,#賃貸経営,#お悩み解決,#バリアフリー" },
  "yud": { "店名": "稀石浴　温どこ", "紹介タイトル": "芯から温まる岩盤浴", "スマホ紹介文": "心も体もリラックスできる癒しの空間", address: "千葉県船橋市南三咲3-15-5", hours: "10:00〜20:00", holiday: "年末年始", phone: "047-494-9989", hp: "https://www.ondoko.com", sns: "-", tags: "#岩盤浴,#健康,#美容,#美容 健康" },
  "lpc": { "店名": "ル・プチ・カフェ", "紹介タイトル": "手作りスイーツとランチ", "スマホ紹介文": "心地よい時間が流れる隠れ家カフェ", address: "千葉県船橋市高根台6-8-1", hours: "11:00〜16:30", holiday: "日曜日、月曜日", phone: "047-404-8522", hp: "-", sns: "https://www.instagram.com/lepetitcafe_chiba", tags: "#飲食,#カフェ,#スイーツ,#手作り,#ランチ,#食べる 飲む,#ベビーキッズ歓迎" },
  "usk": { "店名": "U-SUKE", "紹介タイトル": "心躍るイラストの世界", "スマホ紹介文": "絵本やグッズ、ワークショップを展開", address: "東京都", hours: "10時～15時", holiday: "-", phone: "-", hp: "https://u-suke-art.sakura.ne.jp/", sns: "https://www.instagram.com/usuke_works/", tags: "#イラスト,#絵本,#グッズ,#ワークショップ,#学ぶ,#ギフト" },
  "uchu": { "店名": "魚人+", "紹介タイトル": "本鮪と炭火焼の店", "スマホ紹介文": "美味しいお酒と旬の厳選素材を堪能", address: "千葉県船橋市高根台7-13-16", hours: "17:00～24:00", holiday: "基本日曜日", phone: "047-779-0696", hp: "-", sns: "-", tags: "#飲食,#居酒屋,#本鮪,#食べる 飲む" },
  "npi": { "店名": "Natural Portrait", "紹介タイトル": "わんこと家族の写真撮影", "スマホ紹介文": "自然な表情を残す出張撮影サービス", address: "千葉県船橋市", hours: "10:00〜20:00", holiday: "なし", phone: "090-1607-4046", hp: "https://hi-photo.jp/", sns: "https://www.instagram.com/dog.naturalportrait/", tags: "#家族写真,#わんこ,#撮影,#出張,#ギフト,#ベビーキッズ歓迎" },
  "fnt": { "店名": "ふなたび", "紹介タイトル": "船橋の魅力を再発見", "スマホ紹介文": "街の魅力を届ける地域メディア", address: "船橋市", hours: "-", holiday: "年中無休", phone: "090-5829-7010", hp: "https://www.instagram.com/funabashi._.funatabi/", sns: "https://www.instagram.com/funabashi._.funatabi/", tags: "#船橋,#地域メディア,#日常生活" },
  "pal": { "店名": "パルシステム千葉", "紹介タイトル": "安心食材を玄関まで", "スマホ紹介文": "暮らしに彩りを添える食材宅配サービス", address: "千葉県", hours: "9:00～20:00", holiday: "日曜日", phone: "0120-868-014", hp: "https://www.palsystem-chiba.coop/", sns: "-", tags: "#宅配,#食品,#雑貨,#ミールキット,#デリバリー,#日常生活" },
  "khe": { "店名": "K＊Heart", "紹介タイトル": "アロマと癒しのエステ", "スマホ紹介文": "心も体も輝けるパーソナルケア", address: "千葉県船橋市米ヶ﨑町", hours: "10:00〜19:30", holiday: "-", phone: "-", hp: "http://www.k-heart-beauty.com/", sns: "https://www.instagram.com/kheart1118", tags: "#エステ,#アロマ,#癒し,#美容 健康" },
  "ust": { "店名": "Ｕ-studio", "紹介タイトル": "初心者歓迎のヨガスタジオ", "スマホ紹介文": "呼吸と体、自分を整える穏やかな時間", address: "千葉県船橋市習志野台 2-6-15 2F", hours: "10:00～21:00", holiday: "不定休", phone: "090-5772-3512", hp: "https://www.u-studio.yoga/#top", sns: "https://www.instagram.com/u_studio_ekam_yoga?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==", tags: "#骨盤ヨガ,#リラックスヨガ,#赤ちゃん連れママヨガ,#椅子ヨガ,#パーソナルレッスン,#美容 健康,#学ぶ" }
};

/**
 * HTML側からのデータ取得リクエスト (GET)
 */
function doGet(e) {
  const type = (e && e.parameter) ? e.parameter.type : "list";
  
  // 1. 【看板第一主義】まずは看板データを土台として用意する（スプレッドシート接続前に行う）
  const mergedData = {};
  Object.keys(FIXED_DATA).forEach(id => {
    mergedData[id] = { ...FIXED_DATA[id], "店舗ID": id };
  });

  try {
    const ss = SpreadsheetApp.openById(SS_ID);
    const allSheets = ss.getSheets();
    let headers = [];

    // 2. スプレッドシート内のすべてのシートを巡回して「更新データ」を集める
    allSheets.forEach(sheet => {
      const name = sheet.getName();
      const values = sheet.getDataRange().getValues();
      
      if (name === "投稿原本" || /^\d+月$/.test(name)) {
        if (values.length < 2) return;
        
        let sheetData = [];
        if (name === "投稿原本") {
          if (values.length >= 4) {
            if (headers.length === 0) headers = values[3];
            sheetData = values.slice(4);
          }
        } else {
          if (headers.length === 0) headers = values[0];
          sheetData = values.slice(1);
        }
        
        // 3. 土台に最新情報をマージ
        sheetData.forEach(row => {
          if (!(row[0] instanceof Date)) return;
          
          let obj = {};
          headers.forEach((header, index) => {
            if (header && index < row.length) obj[header] = row[index];
          });
          
          const id = obj["店舗ID"];
          if (!id || !mergedData[id]) return;
          
          if (row[9]) obj["deliveryTimestamp"] = row[9];

          const currentTime = new Date(obj["タイムスタンプ"]).getTime();
          const existingTime = mergedData[id]["タイムスタンプ"] ? new Date(mergedData[id]["タイムスタンプ"]).getTime() : 0;
          
          if (currentTime > existingTime) {
            mergedData[id] = { ...mergedData[id], ...obj };
          }
        });
      }
    });
  } catch (err) {
    console.error("Spreadsheet Sync Error:", err);
    // スプレッドシートエラーが起きても、看板データ（mergedData）はそのまま返却される
  }

  // 4. 配列化
  const finalData = Object.values(mergedData);

  if (type === "detail") {
    const targetId = e.parameter.id;
    const detail = finalData.find(d => d["店舗ID"] == targetId);
    return ContentService.createTextOutput(JSON.stringify(detail || {})).setMimeType(ContentService.MimeType.JSON);
  }

  // 5. ショップリスト一括返却
  return ContentService.createTextOutput(JSON.stringify(finalData)).setMimeType(ContentService.MimeType.JSON);
}

/**
 * 店名から店舗IDをあいまい検索（スペース無視など）して特定する
 * @param {string} inputName 入力された店名
 * @return {string} 特定された店舗ID（見つからない場合は空文字）
 */
function getStoreIdByFuzzyName(inputName) {
  if (!inputName) return "";
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const dashSheet = ss.getSheetByName("ダッシュボード（管理画面）");
  if (!dashSheet) return "";

  const data = dashSheet.getDataRange().getValues();
  const normInput = inputName.replace(/[\s　]/g, ""); // スペース除去
  
  // 5行目（インデックス4）から探索
  for (let i = 4; i < data.length; i++) {
    const dbName = data[i][1].toString(); // B列：店名
    const dbId = data[i][2].toString();   // C列：店舗ID
    const normDb = dbName.replace(/[\s　]/g, "");
    
    // 完全一致、またはどちらかが含まれている場合にマッチとみなす
    if (normInput === normDb || normDb.indexOf(normInput) !== -1 || normInput.indexOf(normDb) !== -1) {
      return dbId;
    }
  }
  return ""; // 見つからない場合
}

/**
 * 投稿フォームからのPOSTデータを受信
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName("投稿原本");
    
    // 店名から店舗IDを自動特定
    const storeName = data.storeName || "";
    const fixedStoreId = getStoreIdByFuzzyName(storeName);
    console.log(`店名「${storeName}」からID「${fixedStoreId}」を特定しました。`);

    // 画像の保存とURL取得
    const imageUrls = [];
    if (data.images && data.images.length > 0) {
      const folder = DriveApp.getFolderById(FOLDER_ID);
      data.images.forEach((base64, index) => {
        if (!base64) return;
        const contentType = base64.split(",")[0].split(":")[1].split(";")[0];
        const bytes = Utilities.base64Decode(base64.split(",")[1]);
        const fileName = `${fixedStoreId || "unknown"}_${new Date().getTime()}_${index+1}.png`;
        const file = folder.createFile(Utilities.newBlob(bytes, contentType, fileName));
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        imageUrls.push(`https://drive.google.com/uc?id=${file.getId()}`);
      });
    }

    // スプレッドシートへの記録 (B:店名, C:店舗ID の構成)
    sheet.appendRow([
      new Date(),        // タイムスタンプ (A)
      storeName,         // 店名 (B)
      fixedStoreId,      // 店舗ID (C)
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
