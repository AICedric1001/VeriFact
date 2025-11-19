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



//Empty state
function handleEmptyState() {
  const chatBox = document.getElementById('chatBox');
  const emptyState = document.querySelector('.empty-state');
  if (!chatBox || !emptyState) return;
  if (chatBox.textContent.trim() === '') {
    emptyState.style.display = 'flex';
  } else {
    emptyState.style.display = 'none';
  }
}

window.addEventListener('resize', handleEmptyState);
window.addEventListener('DOMContentLoaded', handleEmptyState);

<<<<<<< HEAD
=======
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
        // Add visual trust indicator if available
        if (source.is_trusted !== undefined) {
          const icon = document.createElement('i');
          icon.className = source.is_trusted ? 'fa fa-check-circle' : 'fa fa-exclamation-triangle';
          icon.style.cssText = source.is_trusted 
            ? 'color:#4caf50; margin-right: 8px;' 
            : 'color:#e53935; margin-right: 8px;';
          icon.title = source.is_trusted ? 'Trusted Source' : 'Unverified Source';
          link.appendChild(icon);
        }
        // Extract domain from URL for display format: "sitename - title"
        let displayText = source.label;
        try {
          const urlObj = new URL(source.url);
          const domain = urlObj.hostname.replace('www.', ''); // Remove www. prefix
          const title = source.label || source.title || 'Untitled';
          displayText = `${domain} - ${title}`;
        } catch (e) {
          // If URL parsing fails, just use the label as-is
          displayText = source.label || source.title || 'Unknown Source';
        }
        // Add text content
        link.appendChild(document.createTextNode(displayText));
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
              // Refresh trending topics after a new search
              loadTrendingTopics();
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
    loadTrendingTopics();
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

  // Store trending topics data for filtering
  let trendingTopicsData = [];

  // Load trending topics from database
  function loadTrendingTopics() {
    fetch('/api/trending', {
      method: 'GET',
      credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
      const trendingList = document.getElementById('trendingList');
      if (!trendingList) return;

      if (data.status === 'success' && data.trending && data.trending.length > 0) {
        // Store the data for filtering
        trendingTopicsData = data.trending;
        
        // Render trending topics
        renderTrendingTopics(data.trending);
      } else {
        // Show placeholder if no trending topics
        trendingList.innerHTML = '<li class="placeholder">No trending topics yet.</li>';
        trendingTopicsData = [];
      }
    })
    .catch(error => {
      console.error('Error loading trending topics:', error);
      const trendingList = document.getElementById('trendingList');
      if (trendingList) {
        trendingList.innerHTML = '<li class="placeholder">Failed to load trending topics.</li>';
      }
      trendingTopicsData = [];
    });
  }

  // Render trending topics to the list
  function renderTrendingTopics(topics) {
    const trendingList = document.getElementById('trendingList');
    if (!trendingList) return;

    // Clear existing items
    trendingList.innerHTML = '';
    
    if (!topics || topics.length === 0) {
      trendingList.innerHTML = '<li class="placeholder">No matching topics.</li>';
      return;
    }
    
    // Add trending topics
    topics.forEach(item => {
      const li = document.createElement('li');
      li.style.cursor = 'pointer';
      li.title = `${item.category} (${item.count} search${item.count !== 1 ? 'es' : ''})`;
      
      // Category text
      const categoryText = document.createElement('span');
      categoryText.textContent = item.category;
      categoryText.style.flex = '1';
      categoryText.style.wordBreak = 'break-word';
      
      // Count badge
      const countBadge = document.createElement('span');
      countBadge.textContent = item.count;
      countBadge.className = 'trending-count-badge';
      countBadge.style.marginLeft = '8px';
      countBadge.style.flexShrink = '0';
      
      li.appendChild(categoryText);
      li.appendChild(countBadge);
      
      // Make it clickable to search for that topic
      li.addEventListener('click', function() {
        const userInput = document.getElementById('userInput');
        if (userInput) {
          userInput.value = item.category;
          // Trigger input event to resize textarea
          userInput.dispatchEvent(new Event('input'));
          // Focus on the input
          userInput.focus();
        }
      });
      
      trendingList.appendChild(li);
    });
  }

  // Add search functionality for trending topics
  document.addEventListener('DOMContentLoaded', function() {
    const trendingSearchInput = document.getElementById('trendingSearchInput');
    const trendingSearchBtn = trendingSearchInput ? trendingSearchInput.nextElementSibling : null;
    
    function filterTrendingTopics() {
      if (!trendingSearchInput) return;
      
      const searchTerm = trendingSearchInput.value.toLowerCase().trim();
      
      if (searchTerm === '') {
        // Show all topics if search is empty
        renderTrendingTopics(trendingTopicsData);
        return;
      }
      
      // Filter topics based on search term
      const filtered = trendingTopicsData.filter(item => 
        item.category.toLowerCase().includes(searchTerm)
      );
      
      renderTrendingTopics(filtered);
    }
    
    if (trendingSearchInput) {
      trendingSearchInput.addEventListener('input', filterTrendingTopics);
      trendingSearchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          filterTrendingTopics();
        }
      });
    }
    
    if (trendingSearchBtn) {
      trendingSearchBtn.addEventListener('click', filterTrendingTopics);
    }
  });

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
>>>>>>> 1163b99b3cfafb70dcf82623d30dc56252fd926d



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
    // Get sources from sources panel instead of chat message
    const sourcesList = document.getElementById('sourcesList');
    const sourcesEls = sourcesList ? sourcesList.querySelectorAll('li:not(.placeholder)') : [];
    const sources = Array.from(sourcesEls).map(li => {
      const link = li.querySelector('a');
      return link ? link.textContent.trim() : li.textContent.trim();
    }).slice(0, 5);

    const archived = JSON.parse(localStorage.getItem('verifact_archived_responses') || '[]');
    const archiveId = 'arch-' + Date.now();
    archived.push({id: archiveId, title: title, summary: summary, sources: sources, timestamp: new Date().toISOString()});
    localStorage.setItem('verifact_archived_responses', JSON.stringify(archived));
  }

  function saveResponseToSidebar(botMsg) {
    if (!botMsg) return;

    const title = botMsg.querySelector('.resp-title-text') ? botMsg.querySelector('.resp-title-text').textContent.trim() : (botMsg.querySelector('.response-title') ? botMsg.querySelector('.response-title').textContent.trim() : 'Untitled');
    const summary = botMsg.querySelector('.resp-summary') ? botMsg.querySelector('.resp-summary').textContent.trim() : '';
    // Get sources from sources panel instead of chat message
    const sourcesList = document.getElementById('sourcesList');
    const sourcesEls = sourcesList ? sourcesList.querySelectorAll('li:not(.placeholder)') : [];
    const sources = Array.from(sourcesEls).map(li => {
      const link = li.querySelector('a');
      return link ? link.textContent.trim() : li.textContent.trim();
    }).slice(0, 5);

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

  
  // Helper function to escape HTML and prevent XSS
  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }


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
