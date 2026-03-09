/*
(async () => {
    const url = "https://raw.githubusercontent.com/vinhlv/tampermonkey-script/main/konnex-train.js";

    const res = await fetch(url);
    const code = await res.text();

    const script = document.createElement("script");
    script.textContent = code;
    document.documentElement.appendChild(script);
})();
*/

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function setInputValue(element, value) {
    const setter = Object.getOwnPropertyDescriptor(element.__proto__,'value').set;
    setter.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
}

async function scanDom() {
  // Lấy địa chỉ ví từ URL
  await sleep(2000);
  const urlParams = new URLSearchParams(window.location.search);
  const walletAddress = urlParams.get('walletAddress');
  console.log('[Konnex] Wallet Address:', walletAddress);

  const submitButton = Array.from(document.querySelectorAll('button')).find(btn => {
    return btn.textContent?.trim() === 'Submit';
  });

  const walletInput = document.querySelector('input[placeholder="Wallet"]');
  
  if (walletInput && walletAddress) {
    console.log('[Konnex] Found Wallet input, filling with:', walletAddress);
    setInputValue(walletInput, walletAddress);    
    await sleep(3000);
  }

  if (submitButton && !submitButton.disabled) {
    console.log('[Konnex] Found Submit button, clicking...');
    submitButton.click();
  }

  const submitFeedbackButton = Array.from(document.querySelectorAll('button')).find(btn => {
    return btn.textContent?.trim() === 'Submit Feedback';
  });

  const doneButton = Array.from(document.querySelectorAll('button')).find(btn => {
    return btn.textContent?.includes('Done');
  });

  if (submitFeedbackButton && !submitFeedbackButton.disabled) {
    console.log('[Konnex] Found Submit Feedback button, clicking...');
    submitFeedbackButton.click();
  }

  if (doneButton) {
    console.log('[Konnex] Found Done button, closing window...');
    window.close();
    return;
  }
  

  await sleep(1000);
  await scanDom();
}
scanDom();