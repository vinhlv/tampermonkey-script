const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function autoMergeAndForge() {
  
  // Kiểm tra lỗi "Merge Failed" và reload trang nếu tìm thấy
  const mergeFailedMessage = [...document.querySelectorAll("h2")]
    .find(h => h.textContent.trim().includes("Merge Failed"));

  if (mergeFailedMessage) {
    await delay(10000);
    location.reload();
    return;
  }

  const mergeBtn = [...document.querySelectorAll("button")]
    .find(b => b.textContent.trim().includes("Merge Cards"));

  const collectBtn = [...document.querySelectorAll("button")]
    .find(b => b.textContent.trim().includes("Collect Asset"));
  
  if (collectBtn) {
    collectBtn.click();
    await delay(1000);
    await autoMergeAndForge();
    return;
  }

  if (mergeBtn) {
    mergeBtn.click();
    
    // Chờ 1s
    await delay(1000);
    
    // Bước 2: Loại 2 phần tử cuối cùng rồi click 3 phần tử cuối cùng còn lại
    const items = [...document.querySelectorAll("div.cursor-pointer.rounded-xl")];
    const trimmedItems = items.slice(0, -2);
    const last3 = trimmedItems.slice(-3);
    last3.forEach(el => el.click());
    
    // Chờ 1s
    await delay(1000);
    
    // Bước 3: Tìm và click button "Forge"
    const forgeBtn = [...document.querySelectorAll("button")]
      .find(b => b.textContent.trim().includes("Forge"));
    
    if (forgeBtn) {
      forgeBtn.click();
    
      // Gọi đệ quy tiếp tục
      await autoMergeAndForge();
    } else {
      // Nếu không còn button Forge, lặp lại từ bước 1
      await delay(1000);
      await autoMergeAndForge();
    }
  } else {
    await delay(2000);
    await autoMergeAndForge();
  }
}

// Bắt đầu chạy
const portfolioBtn = [...document.querySelectorAll("button")]
  .find(b => b.textContent.trim().includes("Portfolio"));

portfolioBtn?.click();
autoMergeAndForge();