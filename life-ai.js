/*
(async () => {
    const url = "https://raw.githubusercontent.com/vinhlv/tampermonkey-script/main/life-ai.js";

    const res = await fetch(url);
    const code = await res.text();

    const script = document.createElement("script");
    script.textContent = code;
    document.documentElement.appendChild(script);
})();
*/
let isScanning = false;

function setAction(value) {
  if (value) {
    localStorage.setItem('lifeai_action', value);
  } else {
    localStorage.removeItem('lifeai_action');
  }
}

function getAction() {
  const action = localStorage.getItem('lifeai_action') || '';
  return action;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function setInputValue(element, value) {
    const setter = Object.getOwnPropertyDescriptor(element.__proto__,'value').set;
    setter.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
}

function goToQuest() {
  location.href = 'https://testnet.lifeai.io/vi/quests';
}

function goToStake() {
  location.href = 'https://testnet.lifeai.io/vi/stake?selected_validator=0x76Cc712f78f05e797970cA06Ca2F72e0018b94C7&stake_view=detail';
}

function clickCloseButton() {
  const closeButton = Array.from(document.querySelectorAll('button')).find(btn => {
    return btn.classList.contains('absolute') && 
            btn.classList.contains('right-4') && 
            btn.classList.contains('top-4') &&
            btn.querySelector('svg.lucide-x');
  });
  if (closeButton) {
    closeButton.click();
    return true;
  }
  return false;
}

function checkHaveStakeToken() {
  const assetsButton = Array.from(document.querySelectorAll('button')).find(btn => {
    return btn.getAttribute('aria-haspopup') === 'dialog' &&
            btn.getAttribute('data-variant') === 'ghost' &&
            btn.classList.contains('hover:cursor-pointer');
  });
  if (assetsButton) {
    const buttonText = assetsButton.textContent?.trim() || 'No text found';
    console.log('[LifeAI] Assets button text: ' + buttonText);
    
    const commaCount = (buttonText.match(/,/g) || []).length;        
    return commaCount === 2;
  } else {
    console.log('[LifeAI] Assets button not found');
    return false;
  }
}

async function scanDom() {
  const action = getAction();

  // Tìm và click button Log in/Sign up with
  const loginButton = Array.from(document.querySelectorAll('button')).find(btn => {
    return btn.textContent?.includes('Log in/Sign up with') && 
            btn.classList.contains('welcome-hero-login-button');
  });

  if (!action && window.location.href === 'https://testnet.lifeai.io/vi' && !loginButton) {
    goToQuest();
    return;
  }

  if (action === 'login' && !loginButton) {
    console.log('[LifeAI] login Success...');
    setAction('');
    await sleep(2000);
    goToQuest();
  }
  
  if (loginButton) {
    loginButton.click();
    setAction('login');
    
    await sleep(1000);
    const loginMethodButton = document.querySelector('.login-method-button');
    if (loginMethodButton) {
      loginMethodButton.click();
    }
  }

  // Tìm và click button Reward
  const rewardButton = Array.from(document.querySelectorAll('button')).find(btn => {
    const spanText = btn.querySelector('span')?.textContent?.trim();
    const hasRedDot = !!btn.querySelector('span.absolute.animate-pulse');
    return spanText === 'Reward' && btn.classList.contains('border-[#4ADE80]') && hasRedDot;
  });
  console.log('[LifeAI] Scanning for Reward button with red-reward class...', rewardButton);
  if (rewardButton) {
    console.log('[LifeAI] Found Reward button with red-reward class, clicking...');
    rewardButton.click();
    
    await sleep(1000);
    const epochRewardsButton = Array.from(document.querySelectorAll('button')).find(btn => {
      return btn.textContent?.includes('Epoch Rewards') && btn.classList.contains('hover:text-[#57BA46]');
    });
    if (epochRewardsButton) {
      console.log('[LifeAI] Found Epoch Rewards button, clicking...');
      epochRewardsButton.click();
      
      await sleep(1000);
      const rewardDiv = Array.from(document.querySelectorAll('div')).find(div => {
        return div.textContent?.includes('Total Available Reward');
      });
      
      if (rewardDiv) {
        const rewardValueSpan = rewardDiv.querySelector('span.text-\\[\\#57BA46\\]');
        const rewardValue = parseFloat(rewardValueSpan?.textContent || '0');
        console.log('[LifeAI] Reward value: ' + rewardValue);
        
        if (rewardValue > 0) {
          const claimAllButton = Array.from(document.querySelectorAll('button')).find(btn => {
            return btn.textContent?.trim() === 'Claim All' && btn.classList.contains('bg-[#57BA46]');
          });
          if (claimAllButton && !claimAllButton.disabled) {
            claimAllButton.click();
            await sleep(2000);
            clickCloseButton();
            await sleep(1000);
            goToQuest();
          }
        } else {
          clickCloseButton();
          console.log('No rewards to claim, navigating to quests');
        }
      }
    } 
  }

  

  if (checkHaveStakeToken()) {
    if (!action) {
      setAction('stake');
      goToStake();
    }
  }

  if (action === 'stake') {
    await sleep(3000);
    
    const maxButton = Array.from(document.querySelectorAll('button')).find(btn => {
      return btn.textContent?.trim() === 'Max'
    });
    
    if (maxButton && !maxButton.disabled) {
      console.log('[LifeAI] Found Max button, clicking...');
      maxButton.click();
    }
    await sleep(2000);

    const stakeButton = Array.from(document.querySelectorAll('button')).find(btn => {
      return btn.textContent?.trim() === 'STAKE' &&
              btn.type === 'submit';
    });
    
    if (stakeButton && !stakeButton.disabled) {
      console.log('[LifeAI] Found STAKE button, clicking...');
      stakeButton.click();
      await sleep(5000);
    }
    setAction();
    goToQuest();
  }


  const taskDivs = Array.from(document.querySelectorAll('div.grid.grid-cols-\\[1fr_180px_180px\\]'));
  for (const taskDiv of taskDivs) {
    const title = taskDiv.querySelector('h3');
    if (title && title.textContent?.includes('X post with @LifeNetwork_AI')) {
      const doTaskButton = taskDiv.querySelector('button');
      if (doTaskButton && doTaskButton.textContent?.trim() === 'DO TASK') {
        doTaskButton.click();
        
        await sleep(2000);
        const postButton = Array.from(document.querySelectorAll('button')).find(btn => {
          return btn.textContent?.trim() === 'Post';
        });
        
        if (postButton && !postButton.disabled) {
          setAction('post');
          postButton.click();
        }
        break;
      }
    }
    if (title && title.textContent?.includes('Comment on X')) {
      const doTaskButton = taskDiv.querySelector('button');
      if (doTaskButton && doTaskButton.textContent?.trim() === 'DO TASK') {
        doTaskButton.click();
        setAction('comment');
        await sleep(3000);
        const textareas = document.querySelectorAll('textarea[name="comment"]');
        setInputValue(textareas[0], 'LifeAI is future!');
        
        await sleep(1000);
        const replyButton = Array.from(document.querySelectorAll('button')).find(btn => {
          return btn.textContent?.trim() === 'Reply';
        });
        
        if (replyButton && !replyButton.disabled) {
          replyButton.click();
        }
        
        break;
      }
    }
    if (title && title.textContent?.includes('Like on X')) {
      const doTaskButton = taskDiv.querySelector('button');
      if (doTaskButton && doTaskButton.textContent?.trim() === 'DO TASK') {
        doTaskButton.click();
        await sleep(3000);
        const heartButton = Array.from(document.querySelectorAll('button'))
        .find(btn => btn.querySelector('svg path[d^="M12 4.595"]'));
        heartButton?.click();
        break;
      }
    }

    if (title && title.textContent?.includes('Repost on X')) {
      const doTaskButton = taskDiv.querySelector('button');
      if (doTaskButton && doTaskButton.textContent?.trim() === 'DO TASK') {
        doTaskButton.click();
        await sleep(3000);
        const repostButton = Array.from(document.querySelectorAll('button'))
        .find(btn => btn.querySelector('svg path[d^="M12 5.25"]'));
        repostButton?.click();
        break;
      }
    }
    if (title && title.textContent?.includes('Share on X')) {
      const doTaskButton = taskDiv.querySelector('button');
      if (doTaskButton && doTaskButton.textContent?.trim() === 'DO TASK') {
        doTaskButton.click();
        await sleep(3000);
        const shareButton = Array.from(document.querySelectorAll('button'))
        .find(btn => btn.querySelector('svg path[d^="M5.5 15"]'));
        shareButton?.click();
        break;
      }
    }
  }

  const continueButton = Array.from(document.querySelectorAll('button')).find(btn => {
    return btn.textContent?.trim() === 'Continue';
  });

  if (continueButton && !continueButton.disabled) {
    continueButton.click();
    await sleep(10000);
    setAction('');
    goToQuest();
  }
  await sleep(3000);
  await scanDom();
}
scanDom();