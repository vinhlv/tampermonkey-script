// ==UserScript==
// @name         Auto Confirm
// @namespace    http://tampermonkey.net/
// @version      2025-10-16
// @updateURL    https://raw.githubusercontent.com/vinhlv/tampermonkey-script/refs/heads/main/incentiv.js
// @downloadURL  https://raw.githubusercontent.com/vinhlv/tampermonkey-script/refs/heads/main/incentiv.js
// @description  try to take over the world!
// @author       You
// @match        https://portal.incentiv.io/dapp*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=incentiv.io
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let clicked = false;
    let timer = null;

    const tryClick = () => {
        const btn = [...document.querySelectorAll("button")]
        .find(b =>
              /submit transaction/i.test(b.textContent || "") &&
              !b.disabled
             );

        if (!btn || clicked) return;

        // đợi UI ổn định thêm 300ms cho chắc
        timer = setTimeout(() => {
            if (!btn.disabled) {
                console.log("Auto click Submit transaction");
                btn.click();
                clicked = true;
            }
        }, 300);
    };

    const observer = new MutationObserver(() => {
        clearTimeout(timer);
        tryClick();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });



})();