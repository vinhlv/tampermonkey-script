// ==UserScript==
// @name         Auto Veggia
// @namespace    http://tampermonkey.net/
// @version      1.4
// @updateURL    https://raw.githubusercontent.com/vinhlv/tampermonkey-script/refs/heads/main/veggia.js
// @downloadURL  https://raw.githubusercontent.com/vinhlv/tampermonkey-script/refs/heads/main/veggia.js
// @description  try to take over the world!
// @author       You
// @match        https://veggia.io/game
// @icon         https://www.google.com/s2/favicons?sz=64&domain=veggia.io
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    let isAuto = false;
    let isClick = false;
    const handledButtons = new WeakSet();
    const handledImages = new WeakSet();

    /* ================= API CALLS ================= */

    function startAutoClick() {
      fetch('http://localhost:5000/api/start-click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ x: 207, y: 620, interval: 0 })
      });

      setTimeout(() => { isClick = false; }, 4000);
    }

    function startClick() {
      fetch('http://localhost:5000/api/double-click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ x: 207, y: 640 })
      });

    }

    function startClick2() {
      fetch('http://localhost:5000/api/double-click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ x: 172, y: 731 })
      });

    }

    /* ================= CANVAS CHECK ================= */

    function checkStartClick() {
      if (isClick) return;

      const container = document.getElementById("home-canvas-container");
      if (!container) return;

      const children = Array.from(container.childNodes).filter(
          n => n.nodeType !== Node.TEXT_NODE || n.textContent.trim() !== ""
      );

      if (
          children.length === 1 &&
          children[0].tagName === "DIV" &&
          children[0].children.length === 1 &&
          children[0].children[0].tagName === "CANVAS"
      ) {
          isClick = true;
          setTimeout(() => startAutoClick(), 3000);
      }
    }

    /* ================= DOM OBSERVER ================= */

    function processDomChanges() {
        /* ---- Continue ---- */
        const continueButtons = [...document.querySelectorAll("button")]
          .filter(b => /continue/i.test(b.innerText));
        continueButtons.forEach(btn => {
          if (handledButtons.has(btn)) return;
          handledButtons.add(btn);
          setTimeout(() => btn.click(), 2000);
        });

        /* ---- Stop ---- */
        const stopButtons = [...document.querySelectorAll("button")]
          .filter(b => /stop/i.test(b.innerText));
        stopButtons.forEach(btn => {
          if (handledButtons.has(btn)) return;
          handledButtons.add(btn);
          btn.click();
        });

        /* ---- OPEN SUPER CAPS ---- */
        const openButtons = [...document.querySelectorAll("button")]
          .filter(b => b.textContent.trim() === "OPEN SUPER CAPS");
        openButtons.forEach(btn => {
          if (handledButtons.has(btn)) return;
          handledButtons.add(btn);

          btn.addEventListener("click", () => {
            setTimeout(() => startClick(), 2000);
            setTimeout(() => startClick2(), 3000);
            setTimeout(() => startAutoClick(), 15000);
          });

          // auto mode
          if (isAuto) {
            setTimeout(() => btn.click(), 2000);
          }
        });

        /* ---- IMG ---- */
        const imgs = [...document.querySelectorAll(
          'img[src="/animated-images/super-caps.png?v=27"]'
        )];
        imgs.forEach(img => {
          if (handledImages.has(img)) return;
          handledImages.add(img);
          img.addEventListener("click", () => {
            isAuto = true;
          });
        });
        console.log("DOM changes processed. Auto mode:", isAuto);
        checkStartClick();
    }

    const observer = new MutationObserver(processDomChanges);

    /* ================= START OBSERVE ================= */

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();