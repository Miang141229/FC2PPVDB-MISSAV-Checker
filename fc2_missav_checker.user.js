// ==UserScript==
// @name         FC2PPVDB MISSAV 檢查器
// @name:en      FC2PPVDB MISSAV Checker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  自動在 FC2PPVDB 文章頁面顯示 missav123.com 上的搜尋結果。
// @description:en Automatically displays search results from missav123.com on FC2PPVDB article pages.
// @author       
// @match        https://fc2ppvdb.com/articles/*
// @grant        GM_xmlhttpRequest
// @connect      missav123.com
// @license MIT
// ==/UserScript==

(function () {
    'use strict';

    // 確保腳本只在 FC2PPVDB 文章頁面執行
    if (window.location.href.startsWith('https://fc2ppvdb.com/articles/')) {
        const fc2Url = window.location.href; // 獲取當前網頁的 URL
        const match = fc2Url.match(/articles\/(\d+)/); // 提取文章 ID

        if (match && match[1]) {
            const articleId = match[1];
            const missavSearchUrl = `https://missav123.com/search/${articleId}`;

            // 創建一個顯示結果的元素，並將其添加到頁面中
            const resultDisplay = document.createElement('div');
            resultDisplay.id = 'missav-checker-result'; // 給它一個 ID 以便樣式化和識別
            resultDisplay.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background-color: #007bff; /* 藍色背景，表示正在處理 */
                color: white;
                padding: 10px 15px;
                border-radius: 8px;
                box-shadow: 0 4px 8px rgba(0,0,0,0.2);
                font-size: 16px;
                font-weight: bold;
                z-index: 99999; /* 確保在最上層 */
                max-width: 300px;
                text-align: center;
                opacity: 0.9;
                transition: opacity 0.3s ease-in-out;
            `;
            resultDisplay.textContent = `正在檢查 MISSAV 關於 ${articleId} 的結果...`;
            document.body.appendChild(resultDisplay);

            // 使用 GM_xmlhttpRequest 發送跨域請求
            // 這是 Greasemonkey/Tampermonkey 推薦的方式，用來繞過 CORS 限制
            GM_xmlhttpRequest({
                method: "GET",
                url: missavSearchUrl,
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    "Referer": "https://missav123.com/" // 模擬從 missav123.com 跳轉過去
                },
                onload: function (response) {
                    // 請求成功，處理響應內容
                    const html = response.responseText;
                    let resultMessage = '';

                    // 判斷 MISSAV 頁面是否有結果的邏輯
                    // 根據您提供的範例和之前的討論進行調整
                    const noResultsText = 'No results found.'; // 假設無結果時頁面中會包含這段文字
                    const hasResultsIndicator = `fc2-ppv-${articleId}`; // 檢查是否包含 "fc2-ppv-ID" 的字串

                    if (html.includes(noResultsText)) {
                        resultMessage = `MISSAV 上沒有找到 ID 為 ${articleId} 的結果。`;
                    } else if (html.includes(hasResultsIndicator)) {
                        resultMessage = `MISSAV 上可能找到 ID 為 ${articleId} 的結果！${missavSearchUrl}`;
                    } else {
                        // 如果兩者都沒找到，可能是頁面結構未知或載入不完整
                        resultMessage = `MISSAV 頁面結構未知，無法精確判斷結果。請手動檢查：${missavSearchUrl}`;
                    }

                    updateResultDisplay(resultMessage);
                },
                onerror: function (error) {
                    // 請求失敗，處理錯誤
                    console.error('檢查 MISSAV 頁面時發生錯誤:', error);
                    updateResultDisplay(`檢查 MISSAV 失敗，錯誤：${error.statusText || error.responseText || error}`);
                }
            });

            // 更新顯示結果的函數 (與 content.js 中的函數相同)
            function updateResultDisplay(message) {
                let bgColor = '#28a745'; // 預設綠色

                if (message.includes('沒有找到')) {
                    bgColor = '#dc3545'; // 紅色 (無結果)
                } else if (message.includes('可能找到')) {
                    bgColor = '#ffc107'; // 黃色 (可能找到)
                    // 如果是「可能找到」，將連結轉化為可點擊的
                    // 注意這裡的網址也應匹配 missav123.com
                    const link = message.match(/(https:\/\/missav123\.com\/search\/\d+)/);
                    if (link && link[1]) {
                        const url = link[1];
                        message = message.replace(url, `<a href="${url}" target="_blank" style="color: white; text-decoration: underline;">點此查看</a>`);
                    }
                } else {
                    bgColor = '#6c757d'; // 灰色 (未知或錯誤)
                }

                resultDisplay.style.backgroundColor = bgColor;
                resultDisplay.innerHTML = message;
                resultDisplay.style.opacity = '1'; // 確保結果顯示時是完全可見的

                // 讓結果顯示一段時間後自動淡出消失 (可選)
                setTimeout(() => {
                    resultDisplay.style.opacity = '0';
                    setTimeout(() => resultDisplay.remove(), 500); // 在淡出動畫後移除元素
                }, 10000); // 顯示 10 秒
            }
        }
    }
})();