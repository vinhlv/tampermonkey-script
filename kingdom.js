// ==UserScript==
// @name         Kingdom
// @namespace    http://tampermonkey.net/
// @version      2025-10-20
// @updateURL    https://raw.githubusercontent.com/vinhlv/tampermonkey-script/refs/heads/main/kingdom.js
// @downloadURL  https://raw.githubusercontent.com/vinhlv/tampermonkey-script/refs/heads/main/kingdom.js
// @description  try to take over the world!
// @author       You
// @match        https://forthekingdom.xyz/game
// @icon         https://www.google.com/s2/favicons?sz=64&domain=forthekingdom.xyz
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
  const playerDataByWallet = {
    "0x25833b16a7caa9b12c95b430c671e38b173c0ced1b304c1c232e440b5fb07ada": { 
      playerID: "98410",//main
      autoAsh: false,
    },
    "0x87e6746f66cdd0ff3d9d565265f2cfbd6f6b5e03446469d6609b26bcd4047252": {
      playerID: "98809",//appca
      autoAsh: false,
    },
  };
  const sessionWallet = localStorage.getItem('session-wallet');

  let playerID = playerDataByWallet[sessionWallet]?.playerID || "";
  let autoAsh = playerDataByWallet[sessionWallet]?.autoAsh || false;

  let autoContribute = false;
  let autoKillMonster = false;
  let resourceName = "";
  let resourceTier = 1;
  let currentPosition = "";
  let monsterName = "";
  const resource = {
    wood: {t1:{ id: 1, toolId: 21, name: "sylvan wood (tier 1)" },t3:{ id: 3, toolId: 169, name: "ironbark wood (tier 3)" }, t6:{ id: 73, toolId: 184, name: "stormwood (tier 6)" }, toolIdAvailable: []},
    stone: {t1: { id: 6, toolId: 23, name: "rough stone (tier 1)" },t6:{ id: 81, toolId: 190, name: "basaltcore (tier 6)" }, toolIdAvailable: []},
    fish: {t1: { id: 8, toolId: 25, name: "stream fish (tier 1)" },t6:{ id: 89, toolId: 196, name: "demon catfish (tier 6)" }, toolIdAvailable: []},
    ore: {t1:{ id: 10, toolId: 27, name: "iron ore (tier 1)" },t3:{ id: 94, toolId: 172, name: "nickel ore (tier 3)" },t6:{ id: 97, toolId: 202, name: "mithril ore (tier 6)" }, toolIdAvailable: []},
    wheat: {t1: { id: 12, toolId: 29, name: "common wheat (tier 1)" },t6:{ id: 113, toolId: 208, name: "amberwave wheat (tier 6)" }, toolIdAvailable: []},
    berries: {t1: { id: 14, toolId: 31, name: "wild berries (tier 1)" },t6:{ id: 105, toolId: 214, name: "fireberry (tier 6)" }, toolIdAvailable: []},
  };

  function setResourceValues(value) {
    const label = Array.from(document.querySelectorAll('label'))
    .find(l => l.textContent.trim() === 'Resource');
    console.log('label', label);
    if (label) {
      const combo = label.parentElement.querySelector('div[role="combobox"]');
      if (combo) {
        const evt = new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window });
        combo.dispatchEvent(evt);
        setTimeout(() => {
          Array.from(document.querySelectorAll('li'))
          .find(li => li.textContent.trim().toLowerCase() === value.toLowerCase())
          ?.click();
        }, 100);
      }
    }
  }
  function setMonsterFight() {
    const label = Array.from(document.querySelectorAll('label'))
    .find(l => l.textContent.trim() === 'Monster');
    if (label) {
      const combo = label.parentElement.querySelector('div[role="combobox"]');
      if (combo) {
        const evt = new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window });
        combo.dispatchEvent(evt);
        setTimeout(() => {
          Array.from(document.querySelectorAll('li'))
          .find(li => li.textContent.trim().toLowerCase() === "kill any monsters")
          ?.click();
        }, 100);
      }
      setTimeout(() => {
          const checkbox = document.querySelectorAll('.MuiSwitch-input');
          if (checkbox[1] && !checkbox[1].checked) {
            checkbox[1].click();
          }
          if (checkbox[2] && !checkbox[2].checked) {
            checkbox[2].click();
          }
      }, 500);
    }
  }

  function clickModalCloseButtons() {
    const closeButtons = Array.from(document.querySelectorAll('.modal__content-x[bis_skin_checked="1"]'));
    closeButtons.forEach((btn, index) => {
      console.log(`Clicking modal close button ${index + 1}/${closeButtons.length}`);
      btn?.click();
    });
  }
  function isFarming() {
    const match = Array.from(document.querySelectorAll('.success-text'))
      .find(el => el.textContent.trim() === 'Farming...');
    return match || null;
  }
  async function setAutoCollectMonsterItem(name) {
    autoKillMonster = true;
    monsterName = name;
    currentPosition = document.querySelector('.player-info__position span').innerText;
    clickModalCloseButtons();
    await new Promise(resolve => setTimeout(resolve, 1000));
    clickAutomationPanel();
    await new Promise(resolve => setTimeout(resolve, 1000));
    if (isFarming()) {
      console.log('Already farming, skipping setting monster item.');
      return;
    }
    const label = Array.from(document.querySelectorAll('label'))
    .find(l => l.textContent.trim() === 'Monster');
    if (label) {
      const combo = label.parentElement.querySelector('div[role="combobox"]');
      if (combo) {
        const evt = new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window });
        combo.dispatchEvent(evt);
        await new Promise(resolve => setTimeout(resolve, 500));
        Array.from(document.querySelectorAll('li'))
        .find(li => li.textContent.trim().toLowerCase().includes(name.toLowerCase()))
        ?.click();
      }
      await new Promise(resolve => setTimeout(resolve, 500));
      const checkbox = document.querySelectorAll('.MuiSwitch-input');
      if (checkbox[2] && !checkbox[2].checked) {
        checkbox[2].click();
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
      clickStartAutomation();
    }
  }
  async function moveTo(position) {
    clickAutomationPanel();
    await new Promise(resolve => setTimeout(resolve, 1000));
    const moveTab = Array.from(document.querySelectorAll('.tab2__item span'))
    .find(span => span.textContent === 'Move')
    ?.closest('.tab2__item')
    ?.click();
    await new Promise(resolve => setTimeout(resolve, 1000));
    const xValue = position.match(/x:\s*([-\d.]+)/)[1];
    const yValue = position.match(/y:\s*([-\d.]+)/)[1];

    const inputs = document.querySelectorAll('.MuiOutlinedInput-root input');
    const xInput = Array.from(inputs).find(input => 
      input.closest('.MuiOutlinedInput-root').querySelector('legend span')?.textContent === 'x'
    );
    const yInput = Array.from(inputs).find(input => 
      input.closest('.MuiOutlinedInput-root').querySelector('legend span')?.textContent === 'y'
    );

    function setInputValue(element, value) {
      const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
      descriptor.set.call(element, value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }

    if (xInput) setInputValue(xInput, xValue);
    if (yInput) setInputValue(yInput, yValue);

    console.log(`Set x = ${xValue}, y = ${yValue}`);
    await new Promise(resolve => setTimeout(resolve, 1000));
    clickStartAutomation();
  }
  function clickAutomationPanel() {
    const event = new KeyboardEvent('keydown', {
        key: 'a',
        code: 'KeyA',
        keyCode: 65,
        which: 65,
        bubbles: true
    });

    document.dispatchEvent(event);
  }
  function clickStartAutomation() {
    const btn = Array.from(document.querySelectorAll('div.btn'))
      .find(el => el.textContent.trim() === 'Start');
    if (btn) btn.click();
  }
  async function setAuto(name) {
    autoContribute = true;
    clickAutomationPanel();
    await new Promise(resolve => setTimeout(resolve, 1000));
    setResourceValues(name);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setMonsterFight();
    await new Promise(resolve => setTimeout(resolve, 1000));
    clickStartAutomation();
  }
  document.addEventListener('click', async function (event) {
    const el = event.target;
    let text = el?.innerText?.trim();
    if (/^Find Iron Ore$/i.test(text)) {
      resourceName = "ore";
      resourceTier = 1;
      await setAuto("iron ore (tier 1)");
    }
    if (/^Find Sylvan Wood$/i.test(text)) {
      resourceName = "wood";
      resourceTier = 1;
      await setAuto("sylvan wood (tier 1)");
    }
    if (/^Find Stream Fish$/i.test(text)) {
      resourceName = "fish";
      resourceTier = 1;
      await setAuto("stream fish (tier 1)");
    }
    if (/^Find Rough Stone$/i.test(text)) {
      resourceName = "stone";
      resourceTier = 1;
      await setAuto("rough stone (tier 1)");
    }
    if (/^Find Common Wheat$/i.test(text)) {
      resourceName = "wheat";
      resourceTier = 1;
      await setAuto("common wheat (tier 1)");
    }
    if (/^Find Wild Berries$/i.test(text)) {
      resourceName = "berries";
      resourceTier = 1;
      await setAuto("wild berries (tier 1)");
    }
    if (/^Find Birch Wood$/i.test(text)) {
      resourceName = "wood";
      resourceTier = 2;
      await setAuto("birch wood (tier 2)");
    }
    if (/^Find Marker Stone$/i.test(text)) {
      resourceName = "stone";
      resourceTier = 2;
      await setAuto("marker stone (tier 2)");
    }
    if (/^Find Marsh Fish$/i.test(text)) {
      resourceName = "fish";
      resourceTier = 2;
      await setAuto("marsh fish (tier 2)");
    }
    if (/^Find Copper Ore$/i.test(text)) {
      resourceName = "ore";
      resourceTier = 2;
      await setAuto("copper ore (tier 2)");
    }
    if (/^Find Hearty Wheat$/i.test(text)) {
      resourceName = "wheat";
      resourceTier = 2;
      await setAuto("hearty wheat (tier 2)");
    }
    if (/^Find Bramble Berries$/i.test(text)) {
      resourceName = "berries";
      resourceTier = 2;
      await setAuto("bramble berries (tier 2)");
    }
    if (/^Find Ironbark Wood$/i.test(text)) {
      resourceName = "wood";
      resourceTier = 3;
      await setAuto("ironbark wood (tier 3)");
    }
    if (/^Find Flintrock$/i.test(text)) {
      resourceName = "stone";
      resourceTier = 3;
      await setAuto("flintrock (tier 3)");
    }
    if (/^Find Bluegill$/i.test(text)) {
      resourceName = "fish";
      resourceTier = 3;
      await setAuto("bluegill (tier 3)");
    }
    if (/^Find Nickel Ore$/i.test(text)) {
      resourceName = "ore";
      resourceTier = 3;
      await setAuto("nickel ore (tier 3)");
    }
    if (/^Find Robust Wheat$/i.test(text)) {
      resourceName = "wheat";
      resourceTier = 3;
      await setAuto("robust wheat (tier 3)");
    }
    if (/^Find Strawberry$/i.test(text)) {
      resourceName = "berries";
      resourceTier = 3;
      await setAuto("strawberry (tier 3)");
    }
    if (/^Find Heartcore Wood$/i.test(text)) {
      resourceName = "wood";
      resourceTier = 4;
      await setAuto("heartcore wood (tier 4)");
    }
    if (/^Find Ironstone$/i.test(text)) {
      resourceName = "stone";
      resourceTier = 4;
      await setAuto("ironstone (tier 4)");
    }
    if (/^Find Golden Fish$/i.test(text)) {
      resourceName = "fish";
      resourceTier = 4;
      await setAuto("golden fish (tier 4)");
    }
    if (/^Find Emerald Ore$/i.test(text)) {
      resourceName = "ore";
      resourceTier = 4;
      await setAuto("emerald ore (tier 4)");
    }
    if (/^Find Golden Wheat$/i.test(text)) {
      resourceName = "wheat";
      resourceTier = 4;
      await setAuto("golden wheat (tier 4)");
    }
    if (/^Find Mulberry$/i.test(text)) {
      resourceName = "berries";
      resourceTier = 4;
      await setAuto("mulberry (tier 4)");
    }
    if (/^Find Enchanted Wood$/i.test(text)) {
      resourceName = "wood";
      resourceTier = 5;
      await setAuto("enchanted wood (tier 5)");
    }
    if (/^Find Graniteheart$/i.test(text)) {
      resourceName = "stone";
      resourceTier = 5;
      await setAuto("graniteheart (tier 5)");
    }
    if (/^Find Piranha$/i.test(text)) {
      resourceName = "fish";
      resourceTier = 5;
      await setAuto("piranha (tier 5)");
    }
    if (/^Find Adamantite Ore$/i.test(text)) {
      resourceName = "ore";
      resourceTier = 5;
      await setAuto("adamantite ore (tier 5)");
    }
    if (/^Find Rubyfield Wheat$/i.test(text)) {
      resourceName = "wheat";
      resourceTier = 5;
      await setAuto("rubyfield wheat (tier 5)");
    }
    if (/^Find Verdant Grape$/i.test(text)) {
      resourceName = "berries";
      resourceTier = 5;
      await setAuto("verdant grape (tier 5)");
    }
    if (/^Find Stormwood$/i.test(text)) {
      resourceName = "wood";
      resourceTier = 6;
      await setAuto("stormwood (tier 6)");
    }
    if (/^Find Basaltcore$/i.test(text)) {
      resourceName = "stone";
      resourceTier = 6;
      await setAuto("basaltcore (tier 6)");
    }
    if (/^Find Demon Catfish$/i.test(text)) {
      resourceName = "fish";
      resourceTier = 6;
      await setAuto("demon catfish (tier 6)");
    }
    if (/^Find Mithril Ore$/i.test(text)) {
      resourceName = "ore";
      resourceTier = 6;
      await setAuto("mithril ore (tier 6)");
    }
    if (/^Find Amberwave Wheat$/i.test(text)) {
      resourceName = "wheat";
      resourceTier = 6;
      await setAuto("amberwave wheat (tier 6)");
    }
    if (/^Find Fireberry$/i.test(text)) {
      resourceName = "berries";
      resourceTier = 6;
      await setAuto("fireberry (tier 6)");
    }
  });

  function isHome() {
    const pos = document.querySelector('.player-info__position span').innerText;
    return pos == "x: 37, y: -33";
  }

  function clickOpenField() {
    const fieldElement = document.querySelector('[aria-label="Open Field (F)"]');
    if (fieldElement) {
      console.log('Found Open Field element, clicking...');
      fieldElement.click();
    } else {
      console.log('Open Field element not found');
    }
  }

  function clickOpenInventory() {
    const fieldElement = document.querySelector('[aria-label="Open Inventory (I)"]');
    if (fieldElement) {
      console.log('Found Open Inventory element, clicking...');
      fieldElement.click();
    } else {
      console.log('Open Inventory element not found');
    }
  }

  async function clickStorage() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const storageElement = Array.from(document.querySelectorAll('.list-card__name'))
      .find(el => el.textContent.trim() === 'Storage')
      ?.closest('.list-card--clickable');
    if (storageElement) {
      console.log('Found Storage element, clicking...');
      storageElement.click();
    } else {
      console.log('Storage element not found');
    }
  }

  async function rightClickItem(itemId) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const element = document.getElementById(itemId);
    if (element) {
      console.log(`Found item ${itemId}`);

      const targetElement = element.querySelector('.item-icon');

      if (targetElement) {
        console.log('Found inventory__item, right-clicking...');
        console.log('Element:', targetElement);
        targetElement.focus();
        const contextMenuEvent = new MouseEvent('contextmenu', {
          bubbles: true,
          cancelable: true,
          view: window,
          button: 2,
          buttons: 2
        });
        await new Promise(resolve => setTimeout(resolve, 100));
        targetElement.dispatchEvent(contextMenuEvent);
      } else {
        console.log('inventory__item not found');
      }
    } else {
      console.log(`Item ${itemId} not found`);
    }
  }
  async function clickConfirmButton() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const confirmBtns = [...document.querySelectorAll('div.btn')].filter(el => el.textContent == 'Confirm');
    const lastConfirmBtn = confirmBtns[confirmBtns.length - 1];
    if (lastConfirmBtn) {
      console.log('Found last Confirm button, clicking...', lastConfirmBtn);
      lastConfirmBtn.click();
    } else {
      console.log('Confirm button not found');
    }
  }

  async function clickSaveButton() {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const saveBtn = Array.from(document.querySelectorAll('div.btn'))
      .find(el => el.textContent.trim() === 'Save');
    if (saveBtn) {
      console.log('Found Save button, clicking...');
      saveBtn.click();
    } else {
      console.log('Save button not found');
    }

  }

  function clickCloseButton() {
      const closeButtons = Array.from(document.querySelectorAll('div.btn.btn--gray'))
          .filter(el => el.textContent.trim() === 'Close');

      if (closeButtons.length > 0) {
          console.log(`Found ${closeButtons.length} Close buttons, clicking them...`);
          let delay = 0;
          closeButtons.forEach((btn, index) => {
              setTimeout(() => {
                  console.log(`Clicking Close button ${index + 1}/${closeButtons.length}...`);
                  btn.click();
              }, delay);
              delay += 500; // Delay 500ms giữa các click
          });
      } else {
          console.log('Close button not found');
      }
  }

  async function clickDiscardButton() {
    await new Promise(resolve => setTimeout(resolve, 2000));
    const discardBtn = Array.from(document.querySelectorAll('div.btn'))
      .find(el => el.textContent.trim() == 'Discard');
    if (discardBtn) {
      console.log('Found Discard button, clicking...');
      discardBtn.click();
    } else {
      console.log('Discard button not found');
    }

  }

  function checkInventoryItem(inventory, itemId, minAmount) {
    if (inventory) {
      const item = inventory.find(item => item.id == itemId);
      if (item && item.amount >= minAmount) {
        console.log(`Found item ${itemId} with amount ${item.amount} (> ${minAmount})`);
        return true;
      }
    }
    return false;
  }

  function checkInventoryTool(inventory) {
    if (inventory?.tools?.length) {
      const toolIds = inventory.tools
        .filter(item => item.durability < 3)
        .map(item => item.id);
      return toolIds;
    }
    return [];
  }

  async function clickDiscardItems() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const discardSvg = document.querySelector('[aria-label="Discard items"]');
    if (discardSvg) {
      console.log('Clickable parent not found, trying to simulate on SVG...');
      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      discardSvg.dispatchEvent(mousedownEvent);
      setTimeout(() => {
        discardSvg.dispatchEvent(clickEvent);
      }, 50);
    } else {
      console.log('Discard items element not found');
    }
  }

  async function clickAshVault() {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const discardSvg = document.querySelector('[aria-label="Ash Vault"]');
    if (discardSvg) {
      console.log('Clickable parent not found, trying to simulate on SVG...');
      const mousedownEvent = new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      });
      discardSvg.dispatchEvent(mousedownEvent);
      setTimeout(() => {
        discardSvg.dispatchEvent(clickEvent);
      }, 50);
    } else {
      console.log('Ash Vault element not found');
    }
  }

  async function getToolList() {
    try {
      const response = await fetch('https://api.forthekingdom.xyz/v0/api/storage/'+playerID+'?cityId=4', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'referer': 'https://forthekingdom.xyz/'
        }
      });

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const tools = data.data[0]?.tools || [];
        console.log('Tools in storage:', data.data[0]);
        resource[resourceName].toolIdAvailable = tools
          .filter(item => item.item_id == resource[resourceName][`t${resourceTier}`].toolId && item.durability >= 3)
          .map(item => item.id);
        console.log('Wood tool IDs with sufficient durability:', resource[resourceName].toolIdAvailable);
      }

    } catch (error) {
      console.error('Error:', error);
    }
  }

  async function getCharacter() {
    try {
      const response = await fetch('https://api.forthekingdom.xyz/v0/api/character?ids='+playerID+'&includeInventory=true', {
        method: 'GET',
        headers: {
          'accept': 'application/json',
          'referer': 'https://forthekingdom.xyz/'
        }
      });

      const data = await response.json();
      clickCloseButton();
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Kiểm tra position
      if (data.data && data.data.length > 0) {
        const character = data.data[0];
        console.log('Character data:', character);
        const inventory = character.inventory;
        console.log('is at Town', isHome());

        if (!autoKillMonster) {

          const toolBreakIds = checkInventoryTool(inventory);
          if (toolBreakIds.length > 0) {
            clickOpenInventory();
            await clickDiscardItems();
            for (const toolId of toolBreakIds) {
              await rightClickItem(`inventory_tool-${toolId}`);
            }
            await clickDiscardButton();
            return;
          }
          if (checkInventoryItem(inventory?.other_items, resource[resourceName][`t${resourceTier}`].id, 50) && isHome()) {
            if (autoAsh) {
              clickOpenInventory();
              await clickAshVault();
              await rightClickItem(`inventory_other-${resource[resourceName][`t${resourceTier}`].id}`);
              await clickConfirmButton();
              await clickConfirmButton();
              return;
            } else {
              clickOpenField();
              await clickStorage();
              await rightClickItem(`inventory_other-${resource[resourceName][`t${resourceTier}`].id}`);
              await clickConfirmButton();
              await clickSaveButton();
              return;
            }
          }
          if (isHome() && (inventory?.tools?.length < 2 || !inventory?.tools) && resource[resourceName].toolIdAvailable?.length > 0) {
            clickOpenField();
            await clickStorage();
            await rightClickItem(`extra_tool-${resource[resourceName].toolIdAvailable[0]}`);
            await clickSaveButton();
            return;
          }
          if (isHome() && character.current_weight < 100 && inventory?.tools?.length == 2) {
            await setAuto(resource[resourceName][`t${resourceTier}`].name);
            await new Promise(resolve => setTimeout(resolve, 5000));
            return;
          }
        }
      
        if (autoKillMonster && isHome()) {
          if (autoAsh) {
            clickOpenInventory();
            await clickAshVault();
            if (inventory?.other_items) {
              for (const item of inventory.other_items) {
                await rightClickItem(`inventory_other-${item.id}`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                await clickConfirmButton();
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
            await clickConfirmButton();
          } else {
            clickOpenField();
            await clickStorage();
            if (inventory?.other_items) {
              for (const item of inventory.other_items) {
                await rightClickItem(`inventory_other-${item.id}`);
                await new Promise(resolve => setTimeout(resolve, 1000));
                await clickConfirmButton();
                await new Promise(resolve => setTimeout(resolve, 1000));
              }
            }
            await clickSaveButton();
          }
          
          clickCloseButton();
          await moveTo(currentPosition);
          return;
        }
        
      }

    } catch (error) {
      console.error('Error:', error);
    }
  }

  let isGettingCharacter = false;
  let lastCharacterCheck = 0;

  const mainInterval = setInterval(async () => {
    // Tránh API calls stack up
    if (isGettingCharacter) return;
    
    console.log('autoKillMonster:', autoKillMonster);
    console.log('save position:', currentPosition);
    console.log('currentPosition:', document.querySelector('.player-info__position span').innerText);
    
    if (autoKillMonster && !isHome() && document.querySelector('.player-info__position span').innerText == currentPosition) {
      console.log('Arrived at target position, start collecting monster item:', monsterName);
      await setAutoCollectMonsterItem(monsterName);
    }
    
    if ((!autoContribute && !autoKillMonster) || !isHome()) return;
    
    isGettingCharacter = true;
    try {
      if (autoContribute) {
        await getToolList();
      }
      await getCharacter();
    } finally {
      isGettingCharacter = false;
      lastCharacterCheck = Date.now();
    }
  }, 15000);

  const huntButtonsTracked = new Map();

  function setupHuntButtonsListener() {
    const huntButtons = Array.from(document.querySelectorAll('.btn--small.btn--medium')).filter(btn => 
      btn.textContent.includes('Hunt')
    );

    huntButtons.forEach((btn) => {
      if (!huntButtonsTracked.has(btn)) {
        const clickHandler = async function(e) {
          const listCard = btn.closest('.list-card');
          const nameElement = listCard?.querySelector('.list-card__name');
          const nameMonster = nameElement?.textContent.trim();
          console.log('Click thành công! Monster name:', nameMonster);
          await setAutoCollectMonsterItem(nameMonster);
        };
        
        huntButtonsTracked.set(btn, clickHandler);
        btn.addEventListener('click', clickHandler, { once: true });
      }
    });

    // Clean up dead references (nếu button bị remove khỏi DOM)
    if (huntButtonsTracked.size > 50) {
      for (const [btn, handler] of huntButtonsTracked) {
        if (!document.contains(btn)) {
          huntButtonsTracked.delete(btn);
        }
      }
    }
  }

  setupHuntButtonsListener();
  const huntInterval = setInterval(setupHuntButtonsListener, 10000);

    /*setInterval(() => {
        const btn = Array.from(document.querySelectorAll('div.btn'))
        .find(el => el.textContent.trim() === 'Start');
        if (btn) btn.click();
    }, 10000);*/

    /*
    setInterval(() => {
     const buttons = document.querySelectorAll(
  'div.player-info__btn[aria-label="+10 Fame on kill"] .btn'
);

buttons.forEach(btn => {
  btn.dispatchEvent(new MouseEvent('click', {
    bubbles: true,
    cancelable: true,
    view: window
  }));
});
    }, 10000);
    */
// setInterval(() => {
//   const buttons = document.querySelectorAll('div.btn.btn--tiny.btn--full');
  
//   buttons.forEach(btn => {
//     if (btn.textContent.trim() === 'Collect') {
//       btn.dispatchEvent(
//         new MouseEvent('click', {
//           bubbles: true,
//           cancelable: true,
//           view: window
//         })
//       );
//     }
//   });
// }, 100);
    /*setInterval(() => {
        document.querySelector("#tutorial-14")?.click();
        document.querySelector("#tutorial-16")?.click();
    }, 500);*/


})();