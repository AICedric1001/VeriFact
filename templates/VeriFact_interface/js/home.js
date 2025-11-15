// Hide section header and lift accuracy card at 300% and 400% zoom
function handleSectionHeaderAndAccuracyCardZoom() {
  const sectionHeader = document.querySelector('.section-header');
  const accuracyCard = document.querySelector('.accuracy-card');
  if (!sectionHeader) return;
  if (window.devicePixelRatio >= 4) {
    sectionHeader.style.display = 'none';
    if (accuracyCard) accuracyCard.style.marginTop = '2px';
  } else if (window.devicePixelRatio >= 3) {
    sectionHeader.style.display = 'none';
    if (accuracyCard) accuracyCard.style.marginTop = '10px';
  } else {
    sectionHeader.style.display = '';
    if (accuracyCard) accuracyCard.style.marginTop = '';
  }
}

window.addEventListener('resize', handleSectionHeaderAndAccuracyCardZoom);
window.addEventListener('DOMContentLoaded', handleSectionHeaderAndAccuracyCardZoom);
// Hide topbar at 250%+ zoom scaling
function handleTopbarZoomHide() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;
  // Use window.devicePixelRatio as a proxy for zoom level
  if (window.devicePixelRatio >= 2.5) {
    topbar.style.display = 'none';
  } else {
    topbar.style.display = '';
  }
}

window.addEventListener('resize', handleTopbarZoomHide);
window.addEventListener('DOMContentLoaded', handleTopbarZoomHide);






//SOURCES
  const SOURCE_DOMAIN_FALLBACKS = [
    'reuters.com',
    'associatedpress.com',
    'example.com',
    'factcheck.org',
    'who.int'
  ];

  function buildSourcesForTopic(topic = '') {
    const safeTopic = topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'reference';

    return SOURCE_DOMAIN_FALLBACKS.map((domain, index) => ({
      label: `${domain} — reference ${index + 1}`,
      url: `https://${domain}/search?q=${encodeURIComponent(safeTopic)}`
    }));
  }

  function updateSourcesList(sources = []) {
    const list = document.getElementById('sourcesList');
    if (!list) return;

    list.innerHTML = '';

    if (!sources.length) {
      const placeholder = document.createElement('li');
      placeholder.className = 'placeholder';
      placeholder.textContent = 'No sources yet.';
      list.appendChild(placeholder);
      return;
    }

    sources.forEach((source) => {
      const item = document.createElement('li');
      if (source.url) {
        const link = document.createElement('a');
        link.href = source.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = source.label;
        item.appendChild(link);
      } else {
        item.textContent = source.label;
      }
      list.appendChild(item);
    });
  }






 
  // Send Message
  function sendMessage() {
    const input = document.getElementById("userInput");
    const chatBox = document.getElementById("chatBox");
    const chatInput = document.getElementById("chatInput");
  
    if (input.value.trim() === "") return;
  
    const message = input.value.trim();
    
    // Move chat input to bottom
    chatInput.classList.remove("centered");
    chatInput.classList.add("bottom");
  
    // Display user message
    const userMsg = document.createElement("div");
    userMsg.className = "user-message";
    userMsg.innerText = message;
    chatBox.appendChild(userMsg);
  
    // Clear input
    input.value = "";
    input.style.height = "auto";
  
    // Send to backend
    fetch('/api/chat/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ message: message })
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success') {
        if (data.is_first_message) {
          // First message - trigger scraping
          const loadingMsg = document.createElement('div');
          loadingMsg.className = 'bot-message';
          loadingMsg.textContent = 'Searching and scraping sources…';
          chatBox.appendChild(loadingMsg);
          chatBox.scrollTop = chatBox.scrollHeight;
  
          fetch('/api/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify({})  // Query is pulled from latest search
          })
          .then(res => res.json())
          .then(scrape => {
            if (loadingMsg && loadingMsg.parentNode) {
              loadingMsg.parentNode.removeChild(loadingMsg);
            }
            if (scrape && scrape.status === 'success') {
              // Generate bot response with the result_id
              generateBotResponses(scrape.result_id, chatBox, true);
            } else {
              console.error('Scrape failed:', scrape);
              showNotification('Failed to scrape sources. Please try again.', 'error');
            }
          })
          .catch(err => {
            if (loadingMsg && loadingMsg.parentNode) {
              loadingMsg.parentNode.removeChild(loadingMsg);
            }
            console.error('Error triggering scrape:', err);
            showNotification('Error scraping sources. Please try again.', 'error');
          });
        } else {
          // Follow-up message - use chat_id
          generateBotResponses(data.chat_id, chatBox, false);
        }
      } else {
        console.error('Failed to save message:', data.message);
        showNotification('Failed to save message. Please try again.', 'error');
      }
    })
    .catch(error => {
      console.error('Error sending message:', error);
      showNotification('Error sending message. Please try again.', 'error');
    });
  }

  // Generate bot responses (NEW COMPACT VERSION)
  function generateBotResponses(id, chatBox, isFirstMessage) {
    // Create one compact container instead of 5 separate ones
    setTimeout(() => {
      const botMsg = document.createElement("div");
      botMsg.className = "bot-message";
        botMsg.innerHTML = `
          <div class="accordion-item">
          <div class="accordion-header">
            <div class="url-row">
              <strong>Response</strong>
              <span class="response-title">${message}</span>
            </div>
            <div class="card-right">
              <button class="icon-btn save-response-btn" type="button" title="Save response"><i class="fa fa-save"></i></button>
            </div>
            <button class="accordion-toggle"><i class="fa fa-angle-double-down"></i></button>
          </div>
          <div class="accordion-content">
            <strong>Summary:</strong>
            <p class="resp-summary">This is a summary for \"${message}\".</p>
            <hr>
            <strong>Analysis</strong>
            <p class="resp-analysis">According to the summary this is <strong>75% accurate</strong></p>
            <div class="accuracy-card response-accuracy-card">
              <div class="accuracy-bar">
                <span class="true-label"><i class="fa fa-check-circle"></i> <span class="true-percent">75</span>%</span>
                <div class="bar range-bar">
                  <div class="true" style="width: 75%"></div>
                  <div class="false" style="width: 25%"></div>
                </div>
                <span class="false-label"><span class="false-percent">25</span>% <i class="fa fa-exclamation-triangle"></i></span>
              </div>
            </div>
            <hr>
            <strong>Key findings:</strong>
            <ul class="resp-keyfindings">
              <li>3 out of five articles provide accurate information</li>
              <li>2 out of five articles provide inaccurate information</li>
            </ul>
          </div>
        </div>
      `;
      
      chatBox.appendChild(botMsg);
      chatBox.scrollTop = chatBox.scrollHeight; // auto scroll
      const responseTopic = botMsg.querySelector('.resp-title-text')?.textContent || 'analysis';
      updateSourcesList(buildSourcesForTopic(responseTopic));

      // Enable toggle for this accordion
      const toggleBtn = botMsg.querySelector(".accordion-toggle");
      const accordionItem = botMsg.querySelector(".accordion-item");
      toggleBtn.addEventListener("click", () => {
        if (accordionItem.classList.contains('open')) {
          closeAccordion(accordionItem);
          toggleBtn.setAttribute('aria-expanded', 'false');
        } else {
          openAccordion(accordionItem);
          toggleBtn.setAttribute('aria-expanded', 'true');
        }
      });

      // Wire save button for this bot response
      const saveBtn = botMsg.querySelector('.save-response-btn');
      if (saveBtn) {
        saveBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          saveResponseToArchive(botMsg);
          // mark as saved
          saveBtn.classList.add('saved');
          saveBtn.title = 'Saved';
          showNotification('Saved response to Archive', 'success');
        });
      }

      // Update the response in the database
      const responseText = `Comprehensive analysis of 5 sources completed. Overall credibility: 75%. 3 sources highly credible, 1 mixed, 1 questionable. Consensus: Information is mostly accurate.`;
      
      if (isFirstMessage) {
        console.log('First message saved to searches table');
      } else {
        updateChatResponse(id, responseText);
      }
      
      // Find the accuracy card inside this bot message and initialize scoped update function
      const accCard = botMsg.querySelector('.response-accuracy-card');
      if (accCard) {
        // Example: set to 75/25 as in responseText
        scopedUpdateAccuracy(accCard, 75, 25);
      }
    }, 1000); // Single delay instead of multiple
  }

  // Update chat response in database
  function updateChatResponse(chatId, response) {
    fetch(`/api/chat/update/${chatId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'same-origin',
      body: JSON.stringify({ response: response })
    })
    .then(response => response.json())
    .then(data => {
      if (data.status !== 'success') {
        console.error('Failed to update response:', data.message);
      }
    })
    .catch(error => {
      console.error('Error updating response:', error);
    });
  }

  // Load chat history when page loads
  function loadChatHistory() {
    fetch('/api/chat/history', {
      method: 'GET',
      credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success' && data.messages.length > 0) {
        const chatBox = document.getElementById('chatBox');
        const chatInput = document.getElementById('chatInput');
        
        // Move chat input to bottom if there are messages
        chatInput.classList.remove("centered");
        chatInput.classList.add("bottom");
        
        // Load each message
        data.messages.forEach(msg => {
          // Add user message
          if (msg.query_text) {
            const userMsg = document.createElement("div");
            userMsg.className = "user-message";
            userMsg.innerText = msg.query_text;
            chatBox.appendChild(userMsg);
          }
          
          // Add bot response if available (only for chat messages, not search messages)
          if (msg.response_text && msg.type === 'chat') {
            const botMsg = document.createElement("div");
            botMsg.className = "bot-message";
              botMsg.innerHTML = `
                <div class="accordion-item">
                      <div class="accordion-header">
                        <div class="url-row">
                          <strong>Response:</strong> 
                          <span>AI Analysis Complete</span>
                          <i class="fa fa-check-circle"></i>
                        </div>
                        <div class="card-right">
                          <button class="icon-btn save-response-btn" type="button" title="Save response"><i class="fa fa-save"></i></button>
                        </div>
                        <button class="accordion-toggle"><i class="fa fa-angle-double-down"></i></button>
                      </div>
                  <div class="accordion-content">
                    <hr>
                    <strong>Title:</strong> <span class="resp-title-text">${msg.title || 'earthquake'}</span>
                    <hr>
                    <strong>Summary:</strong>
                    <p class="resp-summary">${msg.response_text}</p>
                    <hr>
    
                    <strong>Analysis</strong>
                    <p class="resp-analysis">According to the summary this is <strong>75% accurate</strong></p>
                    <div class="accuracy-card response-accuracy-card">
                      <div class="accuracy-bar">
                        <span class="true-label"><i class="fa fa-check-circle"></i> <span class="true-percent">75</span>%</span>
                        <div class="bar range-bar">
                          <div class="true" style="width: 75%"></div>
                          <div class="false" style="width: 25%"></div>
                        </div>
                        <span class="false-label"><span class="false-percent">25</span>% <i class="fa fa-exclamation-triangle"></i></span>
                      </div>
                    </div>
                    <hr>
                    <strong>Key findings:</strong>
                    <ul class="resp-keyfindings">
                      <li>3 out of five articles provide accurate information</li>
                      <li>2 out of five articles provide inaccurate information</li>
                    </ul>
                  </div>
                </div>
              `;
            chatBox.appendChild(botMsg);
            
            // Enable toggle for this accordion
              const toggleBtn = botMsg.querySelector(".accordion-toggle");
              const accordionItem = botMsg.querySelector(".accordion-item");
              toggleBtn.addEventListener("click", () => {
                if (accordionItem.classList.contains('open')) {
                  closeAccordion(accordionItem);
                  toggleBtn.setAttribute('aria-expanded', 'false');
                } else {
                  openAccordion(accordionItem);
                  toggleBtn.setAttribute('aria-expanded', 'true');
                }
              });
            // Initialize scoped accuracy for restored message (defaults to 0/0)
            const restoredAcc = botMsg.querySelector('.response-accuracy-card');
            if (restoredAcc) {
              scopedUpdateAccuracy(restoredAcc, 0, 0);
            }
            // Wire save button for restored message
            const restoredSaveBtn = botMsg.querySelector('.save-response-btn');
            if (restoredSaveBtn) {
              restoredSaveBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                saveResponseToArchive(botMsg);
                restoredSaveBtn.classList.add('saved');
                restoredSaveBtn.title = 'Saved';
                showNotification('Saved response to Archive', 'success');
              });
            }
          }
        });
        
        // Scroll to bottom
        chatBox.scrollTop = chatBox.scrollHeight;
      }
    })
    .catch(error => {
      console.error('Error loading chat history:', error);
    });
  }

  // Load user information and chat history when page loads
  document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    loadChatHistory();
  });

  // Load current user information
  function loadUserInfo() {
    fetch('/api/user', {
      method: 'GET',
      credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 'success' && data.user) {
        // Update the username display
        const userDisplayName = document.getElementById('userDisplayName');
        if (userDisplayName) {
          userDisplayName.textContent = data.user.username;
        }
      } else {
        // User not logged in or error occurred
        console.log('User not logged in or error:', data.message);
        // Keep "Sign In" as default
      }
    })
    .catch(error => {
      console.error('Error loading user info:', error);
      // Keep "Sign In" as default on error
    });
  }

  //Accordion Card
  // Accordion helpers that auto-size to content
  function openAccordion(item) {
    if (!item) return;
    const content = item.querySelector('.accordion-content');
    if (!content) return;
    // measure natural height
    content.style.display = 'block';
    const natural = content.scrollHeight;
    // set max-height to natural height to allow transition
    content.style.maxHeight = natural + 'px';
    item.classList.add('open');
    // cleanup after transition so content can grow naturally if images load
    const cleanup = () => {
    content.style.maxHeight = 'none';
    content.removeEventListener('transitionend', cleanup);
    };
    content.addEventListener('transitionend', cleanup);
  }

  function closeAccordion(item) {
    if (!item) return;
    const content = item.querySelector('.accordion-content');
    if (!content) return;
    // To animate closing from natural height, set explicit height then zero
    const natural = content.scrollHeight;
    content.style.maxHeight = natural + 'px';
    // Force reflow to ensure transition
    // eslint-disable-next-line no-unused-expressions
    content.offsetHeight;
    content.style.maxHeight = '0px';
    item.classList.remove('open');
  }

  (function(){
    var items = document.querySelectorAll('.accordion-item');
    items.forEach(function(item){
      var toggle = item.querySelector('.accordion-toggle');
      if (!toggle) return;
      toggle.addEventListener('click', function(){
        if (item.classList.contains('open')) {
          closeAccordion(item);
          toggle.setAttribute('aria-expanded', 'false');
        } else {
          openAccordion(item);
          toggle.setAttribute('aria-expanded', 'true');
        }
      });
      // Ensure restored server-side open state (if any) is correctly sized
      if (item.classList.contains('open')) {
        // small timeout to let layout settle
        setTimeout(() => openAccordion(item), 50);
      }
    });
  })();

  // Sidebar toggle functionality: use root class to trigger push behavior
  document.getElementById("sidebarToggle").addEventListener("click", function() {
    const app = document.querySelector('.app');
    const overlay = document.getElementById("sidebarOverlay");
    const sidebar = document.getElementById('sidebar');
    const toggleIcon = this.querySelector('i'); // get icon inside button
  
    const willOpen = !app.classList.contains('sidebar-open');
    if (willOpen) {
      app.classList.add('sidebar-open');
      // show overlay only on small screens
      if (window.matchMedia('(max-width: 900px)').matches) {
        overlay.classList.add('show');
      } else {
        overlay.classList.remove('show');
      }
  
      // change icon to "close"
      toggleIcon.classList.remove('fa-bars');
      toggleIcon.classList.add('fa-times');
  
    } else {
      app.classList.remove('sidebar-open');
      overlay.classList.remove('show');
  
      // revert icon to "hamburger"
      toggleIcon.classList.remove('fa-times');
      toggleIcon.classList.add('fa-bars');
    }
  });
  
  // Close sidebar when clicking overlay
  document.getElementById("sidebarOverlay").addEventListener("click", function() {
    const app = document.querySelector('.app');
    const toggleIcon = document.getElementById("sidebarToggle").querySelector('i');
  
    if (app) app.classList.remove('sidebar-open');
    this.classList.remove('show');
  
    // revert icon to hamburger
    toggleIcon.classList.remove('fa-times');
    toggleIcon.classList.add('fa-bars');
  });
  
  // Close sidebar with Escape key
  document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
      const app = document.querySelector('.app');
      const overlay = document.getElementById('sidebarOverlay');
      const toggleIcon = document.getElementById("sidebarToggle").querySelector('i');
  
      if (app.classList.contains('sidebar-open')) {
        app.classList.remove('sidebar-open');
        if (overlay) overlay.classList.remove('show');
  
        // revert icon to hamburger
        toggleIcon.classList.remove('fa-times');
        toggleIcon.classList.add('fa-bars');
      }
    }
  });

// Settings dropdown (topbar) — render as fixed popup attached to <body> to avoid clipping
document.addEventListener('DOMContentLoaded', function() {
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsMenu = document.getElementById('settingsMenu');
  const dropdownWrapper = settingsBtn ? settingsBtn.closest('.dropdown') : null;

  if (!settingsBtn || !settingsMenu) return;

  function openSettingsMenu() {
    // Attach to body so it's not constrained by parents
    if (settingsMenu.parentElement !== document.body) {
      document.body.appendChild(settingsMenu);
    }
    // Make visible off-screen to measure
    settingsMenu.style.visibility = 'hidden';
    settingsMenu.style.display = 'block';
    settingsMenu.style.position = 'fixed';
    settingsMenu.style.zIndex = '5000';

    const rect = settingsBtn.getBoundingClientRect();
    const menuWidth = settingsMenu.offsetWidth;
    const gap = 6;

    let left = rect.right - menuWidth; // right align under the gear
    let top = rect.bottom + gap;
    // Keep within viewport horizontally
    if (left < 8) left = 8;
    if (left + menuWidth > window.innerWidth - 8) {
      left = window.innerWidth - menuWidth - 8;
    }
    // Keep within viewport vertically
    const menuHeight = settingsMenu.offsetHeight;
    if (top + menuHeight > window.innerHeight - 8) {
      // place above the button if there is not enough space below
      top = Math.max(8, rect.top - gap - menuHeight);
    }

    settingsMenu.style.left = left + 'px';
    settingsMenu.style.top = top + 'px';
    settingsMenu.style.visibility = 'visible';
    settingsMenu.dataset.open = 'true';
    if (dropdownWrapper) dropdownWrapper.classList.add('open');
  }

  function closeSettingsMenu() {
    settingsMenu.style.display = 'none';
    settingsMenu.style.visibility = '';
    settingsMenu.style.left = '';
    settingsMenu.style.top = '';
    settingsMenu.style.position = '';
    settingsMenu.dataset.open = 'false';
    if (dropdownWrapper) dropdownWrapper.classList.remove('open');
  }

  settingsBtn.addEventListener('click', function(e) {
    e.preventDefault();
    e.stopPropagation();
    if (settingsMenu.dataset.open === 'true') {
      closeSettingsMenu();
    } else {
      openSettingsMenu();
    }
  });

  // Close on outside click / ESC / resize / scroll
  window.addEventListener('click', function(e) {
    if (settingsMenu.dataset.open === 'true' && !e.target.closest('#settingsMenu') && e.target !== settingsBtn) {
      closeSettingsMenu();
    }
  });
  window.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && settingsMenu.dataset.open === 'true') closeSettingsMenu();
  });
  window.addEventListener('scroll', function() {
    if (settingsMenu.dataset.open === 'true') closeSettingsMenu();
  }, true);
  window.addEventListener('resize', function() {
    if (settingsMenu.dataset.open === 'true') closeSettingsMenu();
  });
});

// Generic dropdown handler removed - settings dropdown has its own specific handler above



// Floating dropdown for More actions
const floatingDropdown = document.getElementById('floatingDropdown');
document.querySelectorAll('.more-btn').forEach((btn, idx) => {
    btn.dataset.btnId = idx; // assign unique id if not present
    btn.addEventListener('click', function(e) {
        e.stopPropagation();
        const dropdown = document.getElementById('floatingDropdown');
        // If already open for this button, close it
        if (dropdown.style.display === 'flex' && dropdown.dataset.currentBtn === btn.dataset.btnId) {
            dropdown.style.display = 'none';
            dropdown.dataset.currentBtn = '';
            return;
        }
        const rect = btn.getBoundingClientRect();

        // Temporarily show dropdown off-screen to measure width
        dropdown.style.visibility = 'hidden';
        dropdown.style.display = 'flex';
        dropdown.style.left = '-9999px';
        dropdown.style.top = '-9999px';

        const dropdownWidth = dropdown.offsetWidth;

        // Now calculate the correct position
        let left = window.scrollX + rect.left;
        let top = window.scrollY + rect.bottom + 4;

        if (left + dropdownWidth > window.innerWidth - 8) {
            left = window.scrollX + rect.right - dropdownWidth;
            if (left < 8) left = 8;
        }

        // Set the correct position and show it
        dropdown.style.left = left + 'px';
        dropdown.style.top = top + 'px';
        dropdown.style.visibility = 'visible';
        dropdown.style.display = 'flex';
        dropdown.dataset.currentBtn = btn.dataset.btnId;
    });
});
document.addEventListener('click', function(e) {
    if (!floatingDropdown.contains(e.target)) {
        floatingDropdown.style.display = 'none';
    }
});
window.addEventListener('scroll', () => {
    floatingDropdown.style.display = 'none';
});
window.addEventListener('resize', () => {
    floatingDropdown.style.display = 'none';
});



//textarea
const textarea = document.querySelector('.chat-input textarea');
  textarea.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = this.scrollHeight + 'px';
  });

  const sendBtn = document.querySelector(".chat-input .send-btn");
  const chatInput = document.querySelector(".chat-input");

  // Start with centered
  chatInput.classList.add("centered");

  sendBtn.addEventListener("click", () => {
    const message = textarea.value.trim();
    if (message !== "") {
      // Here you would normally append the message to the chat
      
      // Move chat input to bottom
      chatInput.classList.remove("centered");
      chatInput.classList.add("bottom");

      // Clear textbox
      textarea.value = "";
    }
  });



  //Accuracy 
  function updateAccuracy(truePercent, falsePercent) {
    // Backwards-compatible global update (if any accuracy card exists globally)
    const globalAcc = document.querySelector('.accuracy-card .accuracy-bar');
    if (!globalAcc) return;
    const trueEl = globalAcc.querySelector('.true');
    const falseEl = globalAcc.querySelector('.false');
    const trueLabel = globalAcc.querySelector('.true-label');
    const falseLabel = globalAcc.querySelector('.false-label');
    if (trueEl) trueEl.style.width = truePercent + "%";
    if (falseEl) falseEl.style.width = falsePercent + "%";
    if (trueLabel) trueLabel.textContent = truePercent + "%";
    if (falseLabel) falseLabel.textContent = falsePercent + "%";
  }

  // Scoped accuracy updater - updates only a provided accuracy card element
  function scopedUpdateAccuracy(cardElement, truePercent, falsePercent) {
    if (!cardElement) return;
    const bar = cardElement.querySelector('.accuracy-bar');
    if (!bar) return;
    const trueEl = bar.querySelector('.true');
    const falseEl = bar.querySelector('.false');
    const truePct = bar.querySelector('.true-percent');
    const falsePct = bar.querySelector('.false-percent');
    const trueLabel = bar.querySelector('.true-label');
    const falseLabel = bar.querySelector('.false-label');
    if (trueEl) trueEl.style.width = truePercent + "%";
    if (falseEl) falseEl.style.width = falsePercent + "%";
    if (truePct) truePct.textContent = truePercent;
    if (falsePct) falsePct.textContent = falsePercent;
    if (trueLabel) trueLabel.innerHTML = `<i class="fa fa-check-circle"></i>${truePercent}%`;
    if (falseLabel) falseLabel.innerHTML = `${falsePercent}%<i class="fa fa-exclamation-triangle"></i>`;
  }

  // Counter for assigning unique more-btn ids for dynamically added items
  let nextMoreBtnId = (function(){
    const existing = document.querySelectorAll('.more-btn');
    return existing ? existing.length : 0;
  })();

  // Save a bot response into the Archived Modal (UI + optional backend)
  function saveResponseToArchive(botMsg) {
    if (!botMsg) return;

    const title = botMsg.querySelector('.resp-title-text') ? botMsg.querySelector('.resp-title-text').textContent.trim() : (botMsg.querySelector('.response-title') ? botMsg.querySelector('.response-title').textContent.trim() : 'Untitled');
    const summary = botMsg.querySelector('.resp-summary') ? botMsg.querySelector('.resp-summary').textContent.trim() : '';
    const sourcesEls = botMsg.querySelectorAll('.resp-sources li');
    const sources = Array.from(sourcesEls).map(li => li.textContent.trim()).slice(0,5);

    const archived = JSON.parse(localStorage.getItem('verifact_archived_responses') || '[]');
    const archiveId = 'arch-' + Date.now();
    archived.push({id: archiveId, title: title, summary: summary, sources: sources, timestamp: new Date().toISOString()});
    localStorage.setItem('verifact_archived_responses', JSON.stringify(archived));
  }

  function saveResponseToSidebar(botMsg) {
    if (!botMsg) return;

    const title = botMsg.querySelector('.resp-title-text') ? botMsg.querySelector('.resp-title-text').textContent.trim() : (botMsg.querySelector('.response-title') ? botMsg.querySelector('.response-title').textContent.trim() : 'Untitled');
    const summary = botMsg.querySelector('.resp-summary') ? botMsg.querySelector('.resp-summary').textContent.trim() : '';
    const sourcesEls = botMsg.querySelectorAll('.resp-sources li');
    const sources = Array.from(sourcesEls).map(li => li.textContent.trim()).slice(0,5);

    // Create sidebar accordion item
    const accordion = document.querySelector('.sidebar-content .accordion');
    if (!accordion) return;

    const item = document.createElement('div');
    item.className = 'accordion-item';
    item.innerHTML = `
      <div class="accordion-header">
        <div class="card-left">
          <div class="mini-icon" aria-hidden="true"><i class="fa fa-file-text-o"></i></div>
          <span class="item-title">${escapeHtml(title)}</span>
        </div>
        <button class="accordion-toggle" aria-expanded="false" aria-label="Toggle"><i class="fa fa-angle-double-down"></i></button>
        <div class="card-right">
          <button class="icon-btn more-btn" aria-label="More" type="button"><i class="fa fa-ellipsis-v"></i></button>
          <label class="checkbox" aria-label="Select"><input type="checkbox"><span></span></label>
        </div>
      </div>
      <div class="accordion-content">
        <p class="sidebar-summary">${escapeHtml(summary)}</p>
        <ul class="sidebar-sources">
          ${sources.map(s => `<li>${escapeHtml(s)}</li>`).join('')}
        </ul>
      </div>
    `;

    // Insert at top
    // Assign a stable archive id and insert at top
    const archiveId = 'arch-' + Date.now();
    item.dataset.archiveId = archiveId;
    accordion.insertBefore(item, accordion.firstChild);



    // Wire up toggle for new item using auto-sizing helpers
    const toggle = item.querySelector('.accordion-toggle');
    if (toggle) {
      toggle.addEventListener('click', () => {
        if (item.classList.contains('open')) {
          closeAccordion(item);
          toggle.setAttribute('aria-expanded', 'false');
        } else {
          openAccordion(item);
          toggle.setAttribute('aria-expanded', 'true');
        }
      });
    }

    // Init other interactions (more button, checkbox)
    initSidebarItem(item);

    // Optionally send to backend (best-effort)
    fetch('/api/sidebar/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ title: title, summary: summary, sources: sources })
    }).then(res => res.json()).then(resp => {
      // ignore result; could mark item with remote id
      if (resp && resp.status === 'success' && resp.id) {
        item.dataset.remoteId = resp.id;
      }
    }).catch(err => {
      // silent fail - UI already updated
      console.warn('Failed to save sidebar item to backend', err);
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"]+/g, function(match) {
      switch(match) {
        case '&': return '&amp;';
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '"': return '&quot;';
        default: return match;
      }
    });
  }

  // Initialize interactions for a newly added sidebar accordion item
  function initSidebarItem(item) {
    if (!item) return;
    const moreBtn = item.querySelector('.more-btn');
    if (moreBtn) {
      // assign a unique dataset id so the floating dropdown works
      moreBtn.dataset.btnId = nextMoreBtnId++;
      moreBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const btn = this;
        const dropdown = document.getElementById('floatingDropdown');
        const rect = btn.getBoundingClientRect();
        dropdown.style.visibility = 'hidden';
        dropdown.style.display = 'flex';
        dropdown.style.left = '-9999px';
        dropdown.style.top = '-9999px';
        const dropdownWidth = dropdown.offsetWidth;
        let left = window.scrollX + rect.left;
        let top = window.scrollY + rect.bottom + 4;
        if (left + dropdownWidth > window.innerWidth - 8) {
          left = window.scrollX + rect.right - dropdownWidth;
          if (left < 8) left = 8;
        }
        dropdown.style.left = left + 'px';
        dropdown.style.top = top + 'px';
        dropdown.style.visibility = 'visible';
        dropdown.style.display = 'flex';
        dropdown.dataset.currentBtn = btn.dataset.btnId;
      });
    }

    const checkbox = item.querySelector('.checkbox input');
    if (checkbox) {
      checkbox.addEventListener('change', () => {
        // refresh delete button state to account for this change
        refreshSidebarDeleteState();
      });
    }
    // ensure delete button state is correct after insertion
    refreshSidebarDeleteState();
  }

  // Refresh the Delete All button state based on current checked boxes
  function refreshSidebarDeleteState() {
    const deleteAllBtn = document.querySelector('button[aria-label="Delete All"]');
    const checkedBoxes = document.querySelectorAll('.sidebar-content .accordion-item .checkbox input:checked');
    if (deleteAllBtn) {
      deleteAllBtn.disabled = !(checkedBoxes.length > 0);
    }
  }


  // Reset All button functionality
  document.addEventListener('DOMContentLoaded', function() {
    const resetAllBtn = document.querySelector('button[aria-label="Reset All"]');
    if (resetAllBtn) {
      resetAllBtn.addEventListener('click', function() {
        // Clear chat history from database
        fetch('/api/chat/clear', {
          method: 'DELETE',
          credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(data => {
          const chatBox = document.getElementById('chatBox');
          const chatInput = document.getElementById('chatInput');
          
          // Clear all messages from UI
          chatBox.innerHTML = '';
          
          // Reset chat input to centered position
          chatInput.classList.remove('bottom');
          chatInput.classList.add('centered');
          
          // Reset accuracy bar
          updateAccuracy(0, 0);
          
          if (data.status === 'success') {
            showNotification('Chat reset successfully!', 'success');
          } else {
            showNotification('Failed to reset chat. Please try again.', 'error');
          }
        })
        .catch(error => {
          console.error('Error resetting chat:', error);
          showNotification('Error resetting chat. Please try again.', 'error');
        });
      });
    }
  });

  // Delete Selected button functionality
  document.addEventListener('DOMContentLoaded', function() {
    const deleteAllBtn = document.querySelector('button[aria-label="Delete All"]');
    if (deleteAllBtn) {
      deleteAllBtn.addEventListener('click', function() {
        const checkedBoxes = document.querySelectorAll('.accordion-item .checkbox input:checked');

        if (checkedBoxes.length > 0) {
          // Create a custom confirmation popup (accessible dialog)
          const confirmationBox = document.createElement('div');
          confirmationBox.className = 'custom-confirmation';
          confirmationBox.setAttribute('role', 'dialog');
          confirmationBox.setAttribute('aria-modal', 'true');
          confirmationBox.innerHTML = `
            <div class="confirmation-content">
              <p>Are you sure you want to delete <strong>${checkedBoxes.length}</strong> selected item(s)?</p>
              <div class="confirmation-buttons">
                <button class="confirm-yes">Yes</button>
                <button class="confirm-no">No</button>
              </div>
            </div>
          `;
          document.body.appendChild(confirmationBox);

          // Make content focusable and move focus to the primary action
          const content = confirmationBox.querySelector('.confirmation-content');
          if (content) content.setAttribute('tabindex', '-1');
          const yesBtn = confirmationBox.querySelector('.confirm-yes');
          const noBtn = confirmationBox.querySelector('.confirm-no');
          if (yesBtn) yesBtn.focus();

          // Handle Yes
          confirmationBox.querySelector('.confirm-yes').addEventListener('click', () => {
            checkedBoxes.forEach(checkbox => {
              const accordionItem = checkbox.closest('.accordion-item');
              if (accordionItem) accordionItem.remove();
            });

            // Reset "select all" checkbox
            const selectAllCheckbox = document.querySelector('.sidebar-header .checkbox input');
            if (selectAllCheckbox) {
              selectAllCheckbox.checked = false;
              selectAllCheckbox.indeterminate = false;
            }

            showNotification(`${checkedBoxes.length} item(s) deleted successfully!`, 'success');
            confirmationBox.remove();
          });

          // Handle No
          if (noBtn) {
            noBtn.addEventListener('click', () => {
              confirmationBox.remove();
            });
          }

          // Close on Escape key while the dialog is open
          const escHandler = (e) => {
            if (e.key === 'Escape') {
              confirmationBox.remove();
              document.removeEventListener('keydown', escHandler);
            }
          };
          document.addEventListener('keydown', escHandler);

        } else {
          // Nothing selected → just show a message
          showNotification('Please select at least one item to delete.', 'warning');
        }
      });
    }
  });



  // Search functionality
  document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-box input');
    const searchBtn = document.querySelector('.search-box button');
    
    function performSearch() {
      const searchTerm = searchInput.value.toLowerCase().trim();
      const accordionItems = document.querySelectorAll('.sidebar-content .accordion-item');
      
      if (searchTerm === '') {
        // Show all items if search is empty
        accordionItems.forEach(item => {
          item.style.display = '';
        });
        return;
      }
      
      accordionItems.forEach(item => {
        const content = item.textContent.toLowerCase();
        if (content.includes(searchTerm)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    }
    
    if (searchInput) {
      searchInput.addEventListener('input', performSearch);
      searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          performSearch();
        }
      });
    }
    
    if (searchBtn) {
      searchBtn.addEventListener('click', performSearch);
    }
  });

  // Checkbox selection functionality
  document.addEventListener('DOMContentLoaded', function() {
    const selectAllCheckbox = document.querySelector('.sidebar-header .checkbox input');
    const itemCheckboxes = document.querySelectorAll('.sidebar-content .accordion-item .checkbox input');
    const deleteAllBtn = document.querySelector('button[aria-label="Delete All"]');

    // Select all functionality
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', function() {
        const isChecked = this.checked;
        itemCheckboxes.forEach(checkbox => {
          checkbox.checked = isChecked;
        });
        updateDeleteButtonState();
      });
    }

    // Individual checkbox functionality
    itemCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        updateDeleteButtonState();
        updateSelectAllState();
      });
    });

    function updateDeleteButtonState() {
      const checkedBoxes = document.querySelectorAll('.sidebar-content .accordion-item .checkbox input:checked');
      
      if (deleteAllBtn) {
        if (checkedBoxes.length > 0) {
          // Enable trash button (keep icon, no text change)
          deleteAllBtn.disabled = false;
        } else {
          // Disable trash button when nothing is selected
          deleteAllBtn.disabled = true;
        }
      }
    }

    function updateSelectAllState() {
      const checkedBoxes = document.querySelectorAll('.sidebar-content .accordion-item .checkbox input:checked');
      const totalBoxes = itemCheckboxes.length;

      if (selectAllCheckbox) {
        if (checkedBoxes.length === 0) {
          selectAllCheckbox.checked = false;
          selectAllCheckbox.indeterminate = false;
        } else if (checkedBoxes.length === totalBoxes) {
          selectAllCheckbox.checked = true;
          selectAllCheckbox.indeterminate = false;
        } else {
          selectAllCheckbox.checked = false;
          selectAllCheckbox.indeterminate = true;
        }
      }
    }

    // Initialize state on page load
    updateDeleteButtonState();
  });


  // Floating dropdown actions
  document.addEventListener('DOMContentLoaded', function() {
    const floatingDropdown = document.getElementById('floatingDropdown');

    
    // Rename functionality (inline)
    const renameBtn = floatingDropdown.querySelector('button[type="button"]:first-child');
    if (renameBtn) {
      renameBtn.addEventListener('click', function() {
        const currentBtn = floatingDropdown.dataset.currentBtn;
        const accordionItem = document.querySelector(`.more-btn[data-btn-id="${currentBtn}"]`).closest('.accordion-item');
        const titleElement = accordionItem.querySelector('.card-left .item-title');

        if (!titleElement) return;

        // Make editable
        titleElement.contentEditable = "true";
        titleElement.focus();

        // Select all text for convenience
        document.execCommand('selectAll', false, null);

        // Save on Enter key or blur
        const saveChanges = () => {
          titleElement.contentEditable = "false";
          if (titleElement.textContent.trim() === "") {
            titleElement.textContent = "Untitled";
          }
    
        };

        titleElement.addEventListener('blur', saveChanges, { once: true });

        titleElement.addEventListener('keydown', (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            titleElement.blur();
          }
        });

        floatingDropdown.style.display = 'none';
      });
    }
  
    // Archive functionality
    const archiveBtn = floatingDropdown.querySelector('button[type="button"]:last-child');
    if (archiveBtn) {
      archiveBtn.addEventListener('click', function() {
        const currentBtn = floatingDropdown.dataset.currentBtn;
        const accordionItem = document.querySelector(`.more-btn[data-btn-id="${currentBtn}"]`).closest('.accordion-item');
        
          // Add archived class for styling
          accordionItem.classList.add('archived');
          accordionItem.style.opacity = '0.6';
          
          // You could also move it to an archive section or remove it entirely
          showNotification('Item archived successfully!', 'success');
        
        floatingDropdown.style.display = 'none';
      });
    }
  });

  // Notification system
  function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
      <i class="fa-solid fa-${type === 'success' ? 'circle-check' : type === 'error' ? 'circle-exclamation' : 'circle-info'}"></i>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 3s
    setTimeout(() => {
      notification.classList.add('hide');
      setTimeout(() => notification.remove(), 300);
    }, 3000);


    
    // Add animation keyframes
    if (!document.querySelector('#notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    // Auto remove after 2 seconds
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.2s ease-in';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 200);
    }, 2000);
  }

  // Keyboard shortcuts
  document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + S to save all
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      const saveAllBtn = document.querySelector('button[aria-label="Save All"]');
      if (saveAllBtn && !saveAllBtn.disabled) {
        saveAllBtn.click();
      }
    }
    
    // Ctrl/Cmd + R to reset all (only in chat tab)
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
      e.preventDefault();
      const resetAllBtn = document.querySelector('button[aria-label="Reset All"]');
      if (resetAllBtn && !resetAllBtn.disabled) {
        resetAllBtn.click();
      }
    }
    
    // Delete key to delete selected items
    if (e.key === 'Delete' && !e.target.matches('input, textarea')) {
      const checkedBoxes = document.querySelectorAll('.sidebar-content .accordion-item .checkbox input:checked');
      if (checkedBoxes.length > 0) {
        const deleteAllBtn = document.querySelector('button[aria-label="Delete All"]');
        if (deleteAllBtn) {
          deleteAllBtn.click();
        }
      }
    }
    
    // Ctrl/Cmd + A to select all items
    if ((e.ctrlKey || e.metaKey) && e.key === 'a' && !e.target.matches('input, textarea')) {
      e.preventDefault();
      const selectAllCheckbox = document.querySelector('.sidebar-header .checkbox input');
      if (selectAllCheckbox) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.dispatchEvent(new Event('change'));
      }
    }
  });

  // Theme mode switching
  document.addEventListener('DOMContentLoaded', function() {
    const root = document.documentElement; // <html>
    const LIGHT = 'light';
    const DARK = 'dark';
    const DISPLAY = 'display';
    const STORAGE_KEY = 'verifact_theme';

    function applyTheme(mode) {
      if (mode === LIGHT) {
        root.setAttribute('data-theme', 'light');
      } else if (mode === DARK) {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
    }

    // Restore saved theme or default to display
    const saved = localStorage.getItem(STORAGE_KEY) || DISPLAY;
    applyTheme(saved);

    const lightBtn = document.getElementById('lightModeBtn');
    const darkBtn = document.getElementById('darkModeBtn');
    const displayBtn = document.getElementById('displayModeBtn');

    if (lightBtn) {
      lightBtn.addEventListener('click', function() {
        applyTheme(LIGHT);
        localStorage.setItem(STORAGE_KEY, LIGHT);
        
      });
    }

    if (darkBtn) {
      darkBtn.addEventListener('click', function() {
        applyTheme(DARK);
        localStorage.setItem(STORAGE_KEY, DARK);
        
      });
    }

    if (displayBtn) {
      displayBtn.addEventListener('click', function() {
        applyTheme(DISPLAY);
        localStorage.setItem(STORAGE_KEY, DISPLAY);
        
      });
    }
  });

  // Add loading states to buttons (spinner only)
  function addLoadingState(button) {
    const originalContent = button.innerHTML;
    button.innerHTML = `<i class="fa fa-spinner fa-spin"></i>`;
    button.disabled = true;
    
    return function removeLoadingState() {
      button.innerHTML = originalContent;
      button.disabled = false;
    };
  }

  // Enhanced Save All with loading state
  document.addEventListener('DOMContentLoaded', function() {
    const saveAllBtn = document.querySelector('button[aria-label="Save All"]');
    if (saveAllBtn) {
      saveAllBtn.addEventListener('click', function() {
        const removeLoading = addLoadingState(saveAllBtn, 'Saving...');

        // Check if there are messages to save
        const chatBox = document.getElementById('chatBox');
        const chatMessages = chatBox.querySelectorAll('.bot-message, .user-message');

        if (chatMessages.length === 0) {
          removeLoading();
          showNotification('No messages to save!', 'warning');
          return;
        }

        // Since messages are already saved to database when sent,
        // this function now just confirms the save status
        setTimeout(() => {
          removeLoading();
          showNotification('All messages are already saved to the database!', 'success');
        }, 500);
      });
    }
  });


  // Add tooltips to buttons
  document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.icon-btn');
    buttons.forEach(button => {
      const ariaLabel = button.getAttribute('aria-label');
      if (ariaLabel) {
        button.title = ariaLabel;
      }
    });
  });

  // Sign Out functionality
  document.addEventListener('DOMContentLoaded', function() {
    const signOutBtn = document.getElementById('signOutBtn');
    if (signOutBtn) {
      signOutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Call logout API
        fetch('/api/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin'
        }).then(function(res) {
          return res.json().then(function(json) { return { ok: res.ok, json: json }; });
        }).then(function(result) {
          if (result.ok) {
            // Reset username display
            const userDisplayName = document.getElementById('userDisplayName');
            if (userDisplayName) {
              userDisplayName.textContent = 'Sign In';
            }
            
            // Redirect to auth page after successful logout
            window.location.href = '/auth';
          } else {
            alert('Logout failed. Please try again.');
          }
        }).catch(function(err) {
          console.error('Logout error:', err);
          
          // Reset username display even if API call fails
          const userDisplayName = document.getElementById('userDisplayName');
          if (userDisplayName) {
            userDisplayName.textContent = 'Sign In';
          }
          
          // Still redirect even if API call fails
          window.location.href = '/auth';
        });
      });
    }
  });

  // Feedback Modal functionality
  document.addEventListener('DOMContentLoaded', function() {
    const feedbackModal = document.getElementById('feedbackModal');
    const openFeedbackBtn = document.getElementById('openFeedbackModal');
    const closeFeedbackBtns = document.querySelectorAll('[data-close]');
    const sendFeedbackBtn = document.getElementById('sendFeedbackBtn');
    const feedbackTextarea = document.getElementById('feedbackTextarea');
    const charCount = document.getElementById('charCount');

    // Open modal
    if (openFeedbackBtn) {
      openFeedbackBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        // Close the dropdown menu first
        const settingsMenu = document.getElementById('settingsMenu');
        if (settingsMenu) {
          settingsMenu.classList.remove('show');
        }
        openModal(feedbackModal);
      });
    }

    // Close modal
    closeFeedbackBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        closeModal(feedbackModal);
      });
    });

    // Close modal when clicking outside
    if (feedbackModal) {
      feedbackModal.addEventListener('click', function(e) {
        if (e.target === feedbackModal) {
          closeModal(feedbackModal);
        }
      });
    }

    // Character count
    if (feedbackTextarea && charCount) {
      feedbackTextarea.addEventListener('input', function() {
        const count = this.value.length;
        charCount.textContent = count;
        // Change color when approaching limit
        if (count > 900) {
          charCount.style.color = '#ef4444';
        } else if (count > 800) {
          charCount.style.color = '#f59e0b';
        } else {
          charCount.style.color = '#9ca3af';
        }
      });
    }

    // Send feedback functionality
    if (sendFeedbackBtn) {
      sendFeedbackBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const feedback = feedbackTextarea.value.trim();
        if (feedback === '') {
          alert('Please enter your feedback before sending.');
          feedbackTextarea.focus();
          return;
        }
        if (feedback.length < 10) {
          alert('Please provide more detailed feedback (at least 10 characters).');
          feedbackTextarea.focus();
          return;
        }

        // Add loading state
        const originalContent = sendFeedbackBtn.innerHTML;
        sendFeedbackBtn.innerHTML = '<i class="fa fa-spinner fa-spin"></i> Sending...';
        sendFeedbackBtn.disabled = true;

        // Simulate sending feedback (replace with actual API call)
        setTimeout(() => {
          // Save feedback to localStorage (you could send to server instead)
          const feedbacks = JSON.parse(localStorage.getItem('verifact_feedbacks') || '[]');
          feedbacks.push({
            message: feedback,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          });
          localStorage.setItem('verifact_feedbacks', JSON.stringify(feedbacks));

          // Reset button
          sendFeedbackBtn.innerHTML = originalContent;
          sendFeedbackBtn.disabled = false;


          // Clear textarea and close modal
          feedbackTextarea.value = '';
          charCount.textContent = '0';
          charCount.style.color = '#9ca3af';
          closeModal(feedbackModal);
          showNotification('Thank you for your feedback! We appreciate your input.', 'success');
        }, 1500);
      });
    }

    // Auto-resize textarea
    if (feedbackTextarea) {
      feedbackTextarea.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
      });
    }

    // Keyboard shortcuts for modal
    document.addEventListener('keydown', function(e) {
      if (feedbackModal && feedbackModal.classList.contains('open')) {
        // Escape key to close modal
        if (e.key === 'Escape') {
          closeModal(feedbackModal);
        }
        // Ctrl/Cmd + Enter to send feedback
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          if (sendFeedbackBtn && !sendFeedbackBtn.disabled) {
            sendFeedbackBtn.click();
          }
        }
      }
    });

    // Modal utility functions
    function openModal(modal) {
      if (!modal) return;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      // Focus on textarea
      setTimeout(() => {
        if (feedbackTextarea) {
          feedbackTextarea.focus();
        }
      }, 100);
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }
    function closeModal(modal) {
      if (!modal) return;
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      // Restore body scroll
      document.body.style.overflow = '';
      // Clear textarea
      if (feedbackTextarea) {
        feedbackTextarea.value = '';
        feedbackTextarea.style.height = 'auto';
        if (charCount) {
          charCount.textContent = '0';
          charCount.style.color = '#9ca3af';
        }
      }
    }
  });

  // Generate bot responses by fetching real data from backend
  function generateBotResponses(id, chatBox, isFirstMessage) {
    // Show loading indicator
    const loadingMsg = document.createElement('div');
    loadingMsg.className = 'bot-message';
    loadingMsg.innerHTML = `
      <div style="text-align:center; padding:30px;">
        <i class="fa fa-spinner fa-spin" style="font-size:32px; color:#f9c229;"></i>
        <p style="margin-top:15px; color:#a0adb3;">Analyzing sources and generating summary...</p>
      </div>
    `;
    chatBox.appendChild(loadingMsg);
    chatBox.scrollTop = chatBox.scrollHeight;
  
    // Fetch real bot response from backend
    fetch(`/api/get-bot-response/${id}`, {
      method: 'GET',
      credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
      // Remove loading message
      if (loadingMsg && loadingMsg.parentNode) {
        loadingMsg.parentNode.removeChild(loadingMsg);
      }
  
      if (data.status === 'success') {
        const botMsg = document.createElement("div");
        botMsg.className = "bot-message";
        
        // Build sources HTML with trust indicators
        const sourcesHTML = data.sources.map((source, idx) => {
          const icon = source.is_trusted 
            ? '<i class="fa fa-check-circle" style="color:#4caf50;" title="Trusted Source"></i>' 
            : '<i class="fa fa-exclamation-triangle" style="color:#e53935;" title="Unverified Source"></i>';
          return `<li>${icon} <a href="${source.url}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.title)}</a></li>`;
        }).join('');
  
        botMsg.innerHTML = `
          <div class="accordion-item">
            <div class="accordion-header">
              <div class="url-row">
                <strong>Response</strong>
                <span class="response-title">${escapeHtml(data.query)}</span>
              </div>
              <div class="card-right">
                <button class="icon-btn save-response-btn" type="button" title="Save response">
                  <i class="fa fa-save"></i>
                </button>
              </div>
              <button class="accordion-toggle"><i class="fa fa-angle-double-down"></i></button>
            </div>
            <div class="accordion-content">
              <div class="response-section">
                <strong>Summary:</strong>
                <p class="resp-summary">${escapeHtml(data.summary)}</p>
                <hr>
                <strong>Top ${data.total_count} Sources:</strong>
                <ol class="resp-sources">${sourcesHTML}</ol>
                <hr>
                <strong>Analysis</strong>
                <p class="resp-analysis">According to the analysis, this information is <strong>${data.accuracy.true_percent}% credible</strong> based on source reliability.</p>
  
                <!-- Accuracy Card -->
                <div class="accuracy-card response-accuracy-card">
                  <div class="accuracy-bar">
                    <span class="true-label">
                      <i class="fa fa-check-circle"></i> 
                      <span class="true-percent">${data.accuracy.true_percent}</span>%
                    </span>
                    <div class="bar range-bar">
                      <div class="true" style="width: ${data.accuracy.true_percent}%"></div>
                      <div class="false" style="width: ${data.accuracy.false_percent}%"></div>
                    </div>
                    <span class="false-label">
                      <span class="false-percent">${data.accuracy.false_percent}</span>% 
                      <i class="fa fa-exclamation-triangle"></i>
                    </span>
                  </div>
                </div>
  
                <hr>
                <strong>Key Findings:</strong>
                <ul class="resp-keyfindings">
                  <li>${data.trusted_count} out of ${data.total_count} sources are from verified outlets</li>
                  <li>${data.total_count - data.trusted_count} unverified source${data.total_count - data.trusted_count !== 1 ? 's' : ''}</li>
                  ${data.accuracy.true_percent >= 80 ? '<li style="color:#4caf50;">High confidence in information accuracy</li>' : ''}
                  ${data.accuracy.true_percent < 50 ? '<li style="color:#e53935;">⚠️ Exercise caution - limited verified sources</li>' : ''}
                </ul>
              </div>
            </div>
          </div>
        `;
      
        chatBox.appendChild(botMsg);
        chatBox.scrollTop = chatBox.scrollHeight;
  
        // Wire up accordion toggle
        const toggleBtn = botMsg.querySelector(".accordion-toggle");
        const accordionItem = botMsg.querySelector(".accordion-item");
        toggleBtn.addEventListener("click", () => {
          if (accordionItem.classList.contains('open')) {
            closeAccordion(accordionItem);
            toggleBtn.setAttribute('aria-expanded', 'false');
          } else {
            openAccordion(accordionItem);
            toggleBtn.setAttribute('aria-expanded', 'true');
          }
        });
  
        // Wire save button
        const saveBtn = botMsg.querySelector('.save-response-btn');
        if (saveBtn) {
          saveBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            saveResponseToArchive(botMsg);
            saveBtn.classList.add('saved');
            saveBtn.title = 'Saved';
            showNotification('Saved response to Archive', 'success');
          });
        }
  
        // Update chat response in database (for follow-up messages)
        if (!isFirstMessage) {
          const responseText = `${data.summary}\n\nSources: ${data.sources.map(s => s.url).join(', ')}`;
          updateChatResponse(id, responseText);
        }
        
      } else {
        showNotification('Failed to generate response: ' + (data.message || 'Unknown error'), 'error');
        console.error('Backend error:', data);
      }
    })
    .catch(error => {
      console.error('Error fetching bot response:', error);
      if (loadingMsg && loadingMsg.parentNode) {
        loadingMsg.parentNode.removeChild(loadingMsg);
      }
      
      // Show error message in chat
      const errorMsg = document.createElement('div');
      errorMsg.className = 'bot-message';
      errorMsg.innerHTML = `
        <div style="padding:20px; color:#e53935; text-align:center;">
          <i class="fa fa-exclamation-circle" style="font-size:24px;"></i>
          <p>Failed to generate response. Please try again.</p>
        </div>
      `;
      chatBox.appendChild(errorMsg);
      showNotification('Error generating response. Please try again.', 'error');
    });
  }
  
  // Helper function to escape HTML and prevent XSS
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }





  

  // ARCHIVE MODAL FUNCTIONALITY (populate from sidebar, open item, delete, clear)
  document.addEventListener('DOMContentLoaded', function() {
    const openBtn = document.getElementById('openArchiveModal');
    const archiveModal = document.getElementById('archiveModal');
    const archiveAccordion = document.getElementById('archiveAccordion');
    const archiveClearAll = document.getElementById('archiveClearAll');

    if (!openBtn || !archiveModal || !archiveAccordion) return;

    function closeArchive() {
      archiveModal.classList.remove('open');
      archiveModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    function openArchive() {
      populateArchiveList();
      archiveModal.classList.add('open');
      archiveModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      // Auto-scroll modal-body to the bottom
      const modalBody = archiveModal.querySelector('.modal-body');
      if (modalBody && modalBody.scrollHeight > modalBody.clientHeight) {
        modalBody.scrollTop = modalBody.scrollHeight;
      }
    }

    function populateArchiveList() {
      archiveAccordion.innerHTML = '';
      const archived = JSON.parse(localStorage.getItem('verifact_archived_responses') || '[]');
      
      if (!archived || archived.length === 0) {
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder';
        placeholder.style.padding = '12px';
        placeholder.textContent = 'No archived responses.';
        archiveAccordion.appendChild(placeholder);
        return;
      }

      archived.forEach(archiveData => {
        const id = archiveData.id;

        // Create accordion item from archived data
        const item = document.createElement('div');
        item.className = 'accordion-item';
        item.dataset.archiveId = id;

        const sourcesHtml = (archiveData.sources || []).map(s => `<li>${escapeHtml(s)}</li>`).join('');

        item.innerHTML = `
          <div class="accordion-header">
            <div class="card-left">
              <div class="mini-icon" aria-hidden="true"><i class="fa fa-file-text-o"></i></div>
              <span class="item-title">${escapeHtml(archiveData.title || 'Untitled')}</span>
            </div>
            <button class="accordion-toggle" aria-expanded="false" aria-label="Toggle"><i class="fa fa-angle-double-down"></i></button>
            <div class="card-right">
              <button class="btn-secondary archive-delete-btn" data-archive-id="${id}" type="button">Delete</button>
            </div>
          </div>
          <div class="accordion-content">
            <p class="sidebar-summary">${escapeHtml(archiveData.summary || '')}</p>
            ${sourcesHtml ? `<ul class="sidebar-sources">${sourcesHtml}</ul>` : ''}
          </div>
        `;

        // Wire toggle for accordion
        const toggleBtn = item.querySelector('.accordion-toggle');
        if (toggleBtn) {
          toggleBtn.addEventListener('click', () => {
            if (item.classList.contains('open')) {
              closeAccordion(item);
              toggleBtn.setAttribute('aria-expanded', 'false');
            } else {
              openAccordion(item);
              toggleBtn.setAttribute('aria-expanded', 'true');
            }
          });
        }

        archiveAccordion.appendChild(item);
      });
    }

    // Delegated handlers inside archive accordion
    archiveAccordion.addEventListener('click', function(e) {
      const delTarget = e.target.closest('.archive-delete-btn');
      if (delTarget) {
        const id = delTarget.dataset.archiveId;
        // Show confirmation dialog for single delete
        const confirmationBox = document.createElement('div');
        confirmationBox.className = 'custom-confirmation';
        confirmationBox.setAttribute('role', 'dialog');
        confirmationBox.setAttribute('aria-modal', 'true');
        confirmationBox.innerHTML = `
          <div class="confirmation-content">
            <p>Are you sure you want to delete this item?</p>
            <div class="confirmation-buttons">
              <button class="confirm-yes">Yes</button>
              <button class="confirm-no">No</button>
            </div>
          </div>
        `;
        document.body.appendChild(confirmationBox);
        const yesBtn = confirmationBox.querySelector('.confirm-yes');
        const noBtn = confirmationBox.querySelector('.confirm-no');
        if (yesBtn) yesBtn.focus();
        yesBtn.addEventListener('click', () => {
          // Remove from localStorage
          const archived = JSON.parse(localStorage.getItem('verifact_archived_responses') || '[]');
          const filtered = archived.filter(item => item.id !== id);
          localStorage.setItem('verifact_archived_responses', JSON.stringify(filtered));
          // Remove from modal
          const modalItem = archiveAccordion.querySelector(`.accordion-item[data-archive-id="${id}"]`);
          if (modalItem && modalItem.parentNode) modalItem.parentNode.removeChild(modalItem);
          if (!archiveAccordion.querySelector('.accordion-item')) {
            archiveAccordion.innerHTML = '<div class="placeholder" style="padding:12px">No archived responses.</div>';
          }
          confirmationBox.remove();
        });
        noBtn.addEventListener('click', () => confirmationBox.remove());
        // ESC support
        const escHandler = (e) => { if (e.key === 'Escape') { confirmationBox.remove(); document.removeEventListener('keydown', escHandler); } };
        document.addEventListener('keydown', escHandler);
        return;
      }
    });

    openBtn.addEventListener('click', function() {
      openArchive();
    });

    archiveModal.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', closeArchive));

    if (archiveClearAll) {
      archiveClearAll.addEventListener('click', function(){
        // Show confirmation dialog for clear all
        const confirmationBox = document.createElement('div');
        confirmationBox.className = 'custom-confirmation';
        confirmationBox.setAttribute('role', 'dialog');
        confirmationBox.setAttribute('aria-modal', 'true');
        confirmationBox.innerHTML = `
          <div class="confirmation-content">
            <p>Are you sure you want to clear all the items?</p>
            <div class="confirmation-buttons">
              <button class="confirm-yes">Yes</button>
              <button class="confirm-no">No</button>
            </div>
          </div>
        `;
        document.body.appendChild(confirmationBox);
        const yesBtn = confirmationBox.querySelector('.confirm-yes');
        const noBtn = confirmationBox.querySelector('.confirm-no');
        if (yesBtn) yesBtn.focus();
        yesBtn.addEventListener('click', () => {
          localStorage.setItem('verifact_archived_responses', JSON.stringify([]));
          archiveAccordion.innerHTML = '<div class="placeholder" style="padding:12px">No archived responses.</div>';
          confirmationBox.remove();
        });
        noBtn.addEventListener('click', () => confirmationBox.remove());
        // ESC support
        const escHandler = (e) => { if (e.key === 'Escape') { confirmationBox.remove(); document.removeEventListener('keydown', escHandler); } };
        document.addEventListener('keydown', escHandler);
      });
    }

    archiveModal.addEventListener('click', function(e) {
      if (e.target === archiveModal) closeArchive();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && archiveModal.classList.contains('open')) closeArchive();
    });
  });





  // Chat textarea autosize and sync chat-input height into CSS variable
function syncChatInputHeight() {
  const textarea = document.querySelector('.chat-input textarea');
  const chatInput = document.querySelector('.chat-input');
  if (!textarea || !chatInput) return;

  // Reset then measure scrollHeight
  textarea.style.height = 'auto';
  const max = 180; // max height for textarea before internal scrolling
  const target = Math.min(textarea.scrollHeight, max);
  textarea.style.height = target + 'px';

  // toggle internal scrollbar when exceeding max
  if (textarea.scrollHeight > max) textarea.style.overflowY = 'auto';
  else textarea.style.overflowY = 'hidden';

  // compute full chat-input height and expose as CSS var
  const rect = chatInput.getBoundingClientRect();
  const total = Math.ceil(rect.height);
  document.documentElement.style.setProperty('--chat-input-height', total + 'px');
}

// Set up listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const textarea = document.querySelector('.chat-input textarea');
  const sendBtn = document.querySelector('.chat-input .send-btn');
  const chatInput = document.querySelector('.chat-input');
  if (!textarea || !sendBtn || !chatInput) return;

  // initial class state
  chatInput.classList.add('centered');

  // input auto-resize
  textarea.addEventListener('input', () => {
    syncChatInputHeight();
  });

  // also sync on images/fonts/load+resize to keep padding accurate
  window.addEventListener('resize', syncChatInputHeight);
  window.addEventListener('load', syncChatInputHeight);

  // when sending, clear and ensure input moves to bottom
  sendBtn.addEventListener('click', () => {
    const message = textarea.value.trim();
    if (message !== '') {
      // move input to bottom
      chatInput.classList.remove('centered');
      chatInput.classList.add('bottom');

      // clear and reset
      textarea.value = '';
      textarea.style.height = 'auto';
      syncChatInputHeight();
    }
  });

  // ensure sync at startup
  syncChatInputHeight();
});

document.addEventListener('DOMContentLoaded', function() {
  // New Chat button functionality
  const newChatBtn = document.querySelector('button[aria-label="New Chat"]');
  if (newChatBtn) {
    newChatBtn.addEventListener('click', function () {
      // Clear messages in chat area
      const chatBox = document.getElementById('chatBox');
      if (chatBox) chatBox.innerHTML = '';
      // Optionally clear sources panel
      const sourcesList = document.getElementById('sourcesList');
      if (sourcesList) {
        sourcesList.innerHTML = '<li class="placeholder">No sources yet.</li>';
      }
      // Reset chat input to centered
      const chatInput = document.getElementById('chatInput');
      if (chatInput) {
        chatInput.classList.remove('bottom');
        chatInput.classList.add('centered');
      }
      // Clear the textarea/input
      const textarea = document.querySelector('.chat-input textarea');
      if (textarea) {
        textarea.value = '';
        textarea.style.height = 'auto';
      }
      // (Future) Multi-session support stub: save current session if desired
      // and start a new session, keeping sidebar/history visible.
      //
      // Example:
      // saveCurrentSessionToHistory();
      // createNewSession();
      // updateSidebarSessions();
    });
  }
});
