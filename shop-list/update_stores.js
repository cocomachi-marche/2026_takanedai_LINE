const fs = require('fs');
const path = require('path');

// 今回の対象となる店舗フォルダのパス
const targetDir = 'd:/web/marche/cocomachi_official/takanedai_LINE/shop-list';

// 店舗IDに該当するHTMLファイルを抽出 (index, detail 以外)
const files = fs.readdirSync(targetDir).filter(file => {
  return /^[a-z0-9]+\.html$/.test(file) && file !== 'index.html' && file !== 'detail.html';
});

let updatedCount = 0;

files.forEach(file => {
  const filePath = path.join(targetDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // まだ魔法（dynamic-update.js）がかかっていない場合のみ追加
  if (!content.includes('dynamic-update.js')) {
    // </head> の直前にスクリプト読み込みを追加
    content = content.replace('</head>', '  <script src="dynamic-update.js"></script>\n</head>');
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Updated: ${file}`);
    updatedCount++;
  } else {
    console.log(`⏩ Skipped (Already updated): ${file}`);
  }
});

console.log(`\n🎉 作業完了！ 合計 ${updatedCount} 枚の看板を自動更新対応に強化しました。`);
