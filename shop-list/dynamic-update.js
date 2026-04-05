/**
 * 🏮 ココまちマルシェ：個別HTML自動更新スクリプト (dynamic-update.js)
 * 役割：常駐ページを指示された日時（配信サイクル）だけ最新投稿に書き換える
 */
(function() {
  const API_URL = "https://script.google.com/macros/s/AKfycbzyTldDuVAVMlIHZN98c4AFbVBvmxnf28JRWD3FZcxP2iVv16b2HsKfh-iLp5C0NTnQDw/exec";
  const STORE_ID = window.location.pathname.split('/').pop().replace('.html', '');

  async function checkUpdate() {
    try {
      const res = await fetch(`${API_URL}?type=detail&id=${STORE_ID}&t=${Date.now()}`);
      const shop = await res.json();

      if (shop && isNew(shop.deliveryTimestamp)) {
        console.log("🏮 最新の配信データが見つかりました。ページをアップデートします。");
        applyUpdate(shop);
      } else {
        console.log("🏮 通常モード（常駐コンテンツ）を表示しています。");
      }
    } catch (e) {
      console.error("Update check failed:", e);
    }
  }

  function isNew(date) {
    if (!date) return false;
    return (new Date() - new Date(date)) / (1000 * 60 * 60 * 24) <= 10;
  }

  function applyUpdate(shop) {
    // 1. タイトル（紹介タイトル）の更新
    const catchEl = document.querySelector('.shop-catch') || document.querySelector('.description');
    if (catchEl && shop["詳細本文"]) {
      catchEl.innerHTML = `<span style="display:block; color:#e67e22; font-weight:900; margin-bottom:8px;">★ 最新のお知らせ ★</span>${shop["詳細本文"]}`;
    }

    // 2. メインタイトルの下に「今回の見どころ」を追加
    const headEl = document.querySelector('.shop-head');
    if (headEl && shop["紹介タイトル"]) {
       const badge = document.createElement('div');
       badge.style = "background:#f1c40f; color:#000; font-weight:900; padding:4px 12px; border-radius:4px; display:inline-block; margin-bottom:12px; font-size:12px;";
       badge.textContent = "NEW UPDATE";
       headEl.prepend(badge);

       const titleEl = headEl.querySelector('p') || headEl;
       const subTitle = document.createElement('div');
       subTitle.style = "font-size:1.2em; font-weight:bold; color:#d35400; margin-bottom:12px;";
       subTitle.textContent = shop["紹介タイトル"];
       headEl.insertBefore(subTitle, titleEl);
    }

    // 3. 写真の差し替え（または追加）
    const heroImg = document.querySelector('.shop-hero img');
    if (heroImg && shop["メイン写真"]) {
      heroImg.src = shop["メイン写真"];
      heroImg.style.border = "3px solid #f1c40f"; // 更新中は枠線を目立たせる
    }
    
    const subImgs = document.querySelectorAll('.shop-hero img');
    if (subImgs[1] && shop["追加写真1"]) {
      subImgs[1].src = shop["追加写真1"];
    }
  }

  // ページ読み込み完了後に実行
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", checkUpdate);
  } else {
    checkUpdate();
  }
})();
