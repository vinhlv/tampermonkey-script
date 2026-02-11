// ==UserScript==
// @name         LifeAI
// @namespace    http://tampermonkey.net/
// @version      20260211-01
// @updateURL    https://raw.githubusercontent.com/vinhlv/tampermonkey-script/refs/heads/main/life-ai.js
// @downloadURL  https://raw.githubusercontent.com/vinhlv/tampermonkey-script/refs/heads/main/life-ai.js
// @description  try to take over the world!
// @author       You
// @match        https://testnet.lifeai.io/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=lifeai.io
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let isReply = false;
    let doReply = false;
    let isPost = false;
    let finishText = "Your comment has been posted and recorded on-chain!";

    function setInputValue(element, value) {
        const setter = Object.getOwnPropertyDescriptor(element.__proto__,'value').set;

        setter.call(element, value);

        element.dispatchEvent(new Event('input', { bubbles: true }));
    }

    let scanTimer = null;
    let isScanning = false;

    function scanDom() {
      if (isScanning) return;
      isScanning = true;

      try {
        const buttons = [...document.querySelectorAll('button')];
        const btDoTask = buttons.filter(btn => btn.textContent.trim() === 'DO TASK');

        if (btDoTask.length === 4 && !isPost) {
          btDoTask[2]?.click();
          isPost = true;
        }

        if (btDoTask.length === 3 && !isReply) {
          btDoTask[2]?.click();
          isReply = true;
        }

        for (const btn of buttons) {
          const text = btn.textContent.trim();

          if (text === 'Log in/Sign up with') {
            btn.click();

            setTimeout(() => {
              const buttonX = document.querySelector('.login-method-button');
              buttonX?.click();
            }, 500);

            return;
          }
          if (text === 'Continue') {
            btn.click();
          }

          if (text === 'Post') {
            btn.click();
          }
          if (text === 'Reply' && !doReply) {
            const textareas = document.querySelectorAll('textarea[name="comment"]');
            setInputValue(textareas[0], '123');
            btn.click();
            doReply = true;
          }
        }

        const isHome = ((window.location.href === 'https://testnet.lifeai.io/vi') || (window.location.href === 'https://testnet.lifeai.io/en')) && !document.querySelector('.login-method-button');
        const isQuiz = ((window.location.pathname === '/vi/quiz') || (window.location.pathname === '/en/quiz'));

        if (isQuiz) {
          const buttonAction = document.querySelectorAll('button');
          const skipClasses = ['text-red-400', 'text-blue-400', 'text-green-400'];

          [7, 8, 9].forEach(index => {
            const btn = buttonAction?.[index];
            if (btn && !skipClasses.some(cls => btn.classList.contains(cls))) {
              btn.click();
            }
          });
        }

        if (document.body.textContent.includes(finishText) || isHome) {
          window.location = 'https://testnet.lifeai.io/en/quests';
        }
      } finally {
        isScanning = false;
      }
    }

    function scheduleScan(delayMs = 300) {
      if (scanTimer) clearTimeout(scanTimer);
      scanTimer = setTimeout(scanDom, delayMs);
    }

    const observer = new MutationObserver(() => scheduleScan(300));
    observer.observe(document.body, { childList: true, subtree: true });

    scheduleScan(0);
    setInterval(scanDom, 5000);

})();