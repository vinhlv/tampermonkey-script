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

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function scanDom() {
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

  if (signUpLink) {
    console.log('[Konnex] Found Sign Up link, clicking...');
    signUpLink.click();
  }

  await sleep(3000);
  await scanDom();
}
scanDom();