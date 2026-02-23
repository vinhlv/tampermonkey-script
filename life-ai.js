// ==UserScript==
// @name         LifeAI
// @namespace    http://tampermonkey.net/
// @version      v1.2
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

    // Helper function để thay setTimeout
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    function setInputValue(element, value) {
        const setter = Object.getOwnPropertyDescriptor(element.__proto__,'value').set;

        setter.call(element, value);

        element.dispatchEvent(new Event('input', { bubbles: true }));
    }

    let isScanning = false;

    // Hàm tìm và click button QUESTS
    function clickQuestsButton() {
      const questsButton = Array.from(document.querySelectorAll('button')).find(btn => {
        return btn.textContent?.trim() === 'QUESTS' && btn.classList.contains('text-life-6');
      });
      if (questsButton) {
        questsButton.click();
        return true;
      }
      return false;
    }

    function clickStakeButton() {
      const stakeButton = Array.from(document.querySelectorAll('button')).find(btn => {
        return btn.textContent?.trim() === 'STAKE' && btn.classList.contains('text-life-6');
      });
      if (stakeButton) {
        stakeButton.click();
        return true;
      }
      return false;
    }

    async function scanDom() {
      if (isScanning) return;
      isScanning = true;

      // Tìm và click button Reward
      const rewardButton = Array.from(document.querySelectorAll('button')).find(btn => {
        const spanText = btn.querySelector('span')?.textContent?.trim();
        return spanText === 'Reward' && btn.classList.contains('border-[#4ADE80]');
      });
      if (rewardButton) {
        rewardButton.click();
        
        // Chờ 1s rồi tìm button Epoch Rewards
        await sleep(1000);
        const epochRewardsButton = Array.from(document.querySelectorAll('button')).find(btn => {
          return btn.textContent?.includes('Epoch Rewards') && btn.classList.contains('hover:text-[#57BA46]');
        });
        if (epochRewardsButton) {
          epochRewardsButton.click();
          
          // Chờ 1s rồi check Total Available Reward
          await sleep(1000);
          const rewardDiv = Array.from(document.querySelectorAll('div')).find(div => {
            return div.textContent?.includes('Total Available Reward');
          });
          
          if (rewardDiv) {
            const rewardValueSpan = rewardDiv.querySelector('span.text-\\[\\#57BA46\\]');
            const rewardValue = parseFloat(rewardValueSpan?.textContent || '0');
            
            if (rewardValue > 0) {
              const claimAllButton = Array.from(document.querySelectorAll('button')).find(btn => {
                return btn.textContent?.trim() === 'Claim All' && btn.classList.contains('bg-[#57BA46]');
              });
              if (claimAllButton && !claimAllButton.disabled) {
                claimAllButton.click();
                await sleep(2000);
                clickQuestsButton();
              }
            }
          }
        }
      }

      // Check số token trong div
      const tokenDiv = Array.from(document.querySelectorAll('div')).find(div => {
        return div.classList.contains('flex') && 
               div.classList.contains('items-center') && 
               div.classList.contains('gap-1') &&
               div.classList.contains('text-white') &&
               div.classList.contains('font-semibold') &&
               div.textContent?.includes('img');
      });

      if (tokenDiv) {
        const tokenText = tokenDiv.textContent?.match(/^\d+/)?.[0];
        const tokenValue = parseInt(tokenText || '0');

        if (tokenValue == 0) {
          clickStakeButton();
          
          // Chờ 1s rồi tìm div content và click button
          await sleep(1000);
          const contentDiv = document.querySelector('div.content.p-5');
          
          if (contentDiv) {
            const arrowButton = contentDiv.querySelector('button.w-10.h-10.bg-\\[rgba\\(15,23,42,0\\.50\\)\\].border.border-\\[\\#57BA46\\]');
            if (arrowButton) {
              arrowButton.click();
            }
          }
        }
      }

      /*
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

          await sleep(500);
          const buttonX = document.querySelector('.login-method-button');
          buttonX?.click();

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
      }*/

      isScanning = false;
    }

    async function scheduleScan(delayMs = 300) {
      await sleep(delayMs);
      await scanDom();
    }

    const observer = new MutationObserver(() => scheduleScan(2000));
    observer.observe(document.body, { childList: true, subtree: true });

    scheduleScan(3000);
    console.log('LifeAI script started ver v1.2');
})();