const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function autoBuyAndOpen() {


  const nextBtn = [...document.querySelectorAll("button")]
    .find(b => b.textContent.trim().includes("Open Next"));

  const collectBt = [...document.querySelectorAll("button")]
    .find(b => b.textContent.trim().includes("Collect All"));

  const openPackBt = [...document.querySelectorAll("button")]
    .find(b => b.textContent.trim().includes("Open Pack Now"));

  if (collectBt) {
    collectBt.click();
    await delay(2000);
    const buyPack = [...document.querySelectorAll("button")]
    .find(b => b.textContent.trim().includes("Buy Pack"));
    buyPack?.click();
    await delay(1000);
    
    // Tìm button plus và click 7 lần
    const plusBtn = [...document.querySelectorAll("button")]
      .find(b => b.querySelector('.lucide-plus'));
    
    if (plusBtn) {
      for (let i = 0; i < 6; i++) {
        plusBtn.click();
        await delay(100);
      }
      await delay(500);
      
      // Tìm và click button "Buy 7 Packs"
      const buy7PacksBtn = [...document.querySelectorAll("button")]
        .find(b => b.textContent.trim().includes("Buy 7 Packs"));
      
      if (buy7PacksBtn) {
        buy7PacksBtn.click();
        await delay(1000);
      }
    }
    
    await autoBuyAndOpen();
    return;
  }

  if (nextBtn) {
    nextBtn.click();
    await delay(1000);
    await autoBuyAndOpen();
    return;
  }
  if (openPackBt) {
    openPackBt.click();
    await delay(1000);
    await autoBuyAndOpen();
    return;
  }

  await delay(2000);
  await autoBuyAndOpen();
}


autoBuyAndOpen();