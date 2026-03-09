/*
(async () => {
    const url = "https://raw.githubusercontent.com/vinhlv/tampermonkey-script/main/konnex.js";

    const res = await fetch(url);
    const code = await res.text();

    const script = document.createElement("script");
    script.textContent = code;
    document.documentElement.appendChild(script);
})();
*/
let isClickTrain = false;
let isScrollDown = false;
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scanDom() {
  if (!isScrollDown) {
    await sleep(4000);
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      left: 0,
      behavior: "smooth",
    });
    isScrollDown = true;
  }
  const connectXContainer = Array.from(document.querySelectorAll('div')).find(div => {
    return div.textContent?.includes('Connect X');
  });

  const claimButton = connectXContainer
    ? Array.from(connectXContainer.querySelectorAll('button')).find(btn => {
      return btn.textContent?.trim() === 'Claim';
    })
    : null;

  const isClaimDisabled = !!claimButton && (
    claimButton.hasAttribute('disabled') ||
    claimButton.getAttribute('aria-disabled') === 'true' ||
    claimButton.classList.contains('disabled')
  );

  if (claimButton && !isClaimDisabled) {
    console.log('[Konnex] Found Claim button, clicking...');
    claimButton.click();
    await sleep(5000);
  }
  const checkInButton = Array.from(document.querySelectorAll('button')).find(btn => {
    return btn.textContent?.trim() === 'Check in';
  });

  if (checkInButton && !checkInButton.disabled) {
    console.log('[Konnex] Found Check in button, clicking...');
    checkInButton.click();
    await sleep(5000);
  }

  const signUpLink = Array.from(document.querySelectorAll('a')).find(link => {
    return link.textContent?.trim() === 'Sign Up';
  });

  if (signUpLink && !isClickTrain) {
    console.log('[Konnex] Found Sign Up link, clicking...');
    signUpLink.click();
    isClickTrain = true;
    await sleep(20000);
    location.reload();
    return;
  }

  await sleep(1000);
  await scanDom();
}
scanDom();