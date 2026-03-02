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
let isClick = false;
let clickCount = 0;
const handledButtons = new WeakSet();
const handledImages = new WeakSet();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/* ================= API CALLS ================= */

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

async function processDomChanges() {
    document.querySelectorAll("button")[6]?.click();
    clickCount++;
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
    const openButtons = [...document.querySelectorAll("button")].filter(b => b.textContent.trim() === "OPEN SUPER CAPS");
    openButtons.forEach(btn => {
      if (handledButtons.has(btn)) return;
      handledButtons.add(btn);

      btn.addEventListener("click", async () => {
        await delay(2000);
        clickCanvas(0.4, 0.6);
        await delay(4000);
        isClick = true;
        const clickInterval = setInterval(() => clickCanvas(), 100);
        clickCount = 0;
        setTimeout(() => {
            clearInterval(clickInterval);
            isClick = false;
        }, 6000);
      });

      setTimeout(() => btn.click(), 2000);
    });

    if (clickCount > 90) {
        setTimeout(() => location.reload(), 1000);
        return;
    }
    checkStartClick();
    await delay(2000);
    await processDomChanges();
}

processDomChanges();


/*
const claimButtons = [...document.querySelectorAll("button")]
      .filter(b => /claim/i.test(b.innerText));
setInterval(() => {
    claimButtons[0].click()
}, 2000);
*/