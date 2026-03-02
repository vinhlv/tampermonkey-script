/*
(async () => {
    const url = "https://raw.githubusercontent.com/vinhlv/tampermonkey-script/main/veggia.js";

    const res = await fetch(url);
    const code = await res.text();

    const script = document.createElement("script");
    script.textContent = code;
    document.documentElement.appendChild(script);
})();
*/
let isAuto = localStorage.getItem('veggia_auto_mode') === 'true';
let isClick = false;
let clickCount = 0;
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

function clickCanvas(xRatio = 0.5, yRatio = 0.5) {
    const canvas = document.querySelector('#home-canvas-container canvas');
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = rect.left + rect.width * xRatio;
    const y = rect.top + rect.height * yRatio;
    ["pointerdown", "mousedown"].forEach(type => canvas.dispatchEvent(new MouseEvent(type, {
        clientX: x,
        clientY: y,
        bubbles: true
    })));
    ["pointerup", "mouseup", "click"].forEach(type => canvas.dispatchEvent(new MouseEvent(type, {
        clientX: x,
        clientY: y,
        bubbles: true
    })));
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
      const clickInterval = setInterval(() => clickCanvas(), 100);
      setTimeout(() => {
        clearInterval(clickInterval);
        isClick = false;
      }, 6000);
  }
}

/* ================= DOM OBSERVER ================= */

function processDomChanges() {
    document.querySelectorAll("button")[6]?.click();
    /* ---- Continue ---- */
    const continueButtons = [...document.querySelectorAll("button")]
      .filter(b => /continue/i.test(b.innerText));
    continueButtons.forEach(btn => {
      if (handledButtons.has(btn)) return;
      handledButtons.add(btn);
      setTimeout(() => btn.click(), 4000);
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

      btn.addEventListener("click", async () => {
        clickCount++;
        console.log('Click count:', clickCount);
        
        if (clickCount >= 6) {
          setTimeout(() => location.reload(), 1000);
          return;
        }
        await delay(2000);
        clickCanvas(0.4, 0.6);
        await delay(2000);
        isClick = true;
        const clickInterval = setInterval(() => clickCanvas(), 100);
        setTimeout(() => {
          clearInterval(clickInterval);
          isClick = false;
        }, 6000);
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
        localStorage.setItem('veggia_auto_mode', 'true');
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


/*
const claimButtons = [...document.querySelectorAll("button")]
      .filter(b => /claim/i.test(b.innerText));
setInterval(() => {
    claimButtons[0].click()
}, 2000);
*/