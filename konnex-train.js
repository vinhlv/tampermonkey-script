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



async function scanDom() {
  // Lấy địa chỉ ví từ URL
  const urlParams = new URLSearchParams(window.location.search);
  const walletAddress = urlParams.get('walletAddress');
  console.log('[Konnex] Wallet Address:', walletAddress);

  const submitButton = Array.from(document.querySelectorAll('button')).find(btn => {
    return btn.textContent?.trim() === 'Submit';
  });

  const walletInput = document.querySelector('input[placeholder="Wallet"]');
  
  if (walletInput && walletAddress && !walletInput.value) {
    console.log('[Konnex] Found Wallet input, filling with:', walletAddress);
    walletInput.value = walletAddress;
    
    // Trigger events để React/Vue nhận được thay đổi
    walletInput.dispatchEvent(new Event('input', { bubbles: true }));
    walletInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    await sleep(1000);
  }

  if (submitButton && !submitButton.disabled) {
    console.log('[Konnex] Found Submit button, clicking...');
    submitButton.click();
  }

  const submitFeedbackButton = Array.from(document.querySelectorAll('button')).find(btn => {
    return btn.textContent?.trim() === 'Submit Feedback';
  });

  if (submitFeedbackButton && !submitFeedbackButton.disabled) {
    console.log('[Konnex] Found Submit Feedback button, clicking...');
    submitFeedbackButton.click();
    
    await sleep(10000);
    console.log('[Konnex] Closing window...');
    window.close();
    return;
  }

  await sleep(3000);
  await scanDom();
}
scanDom();