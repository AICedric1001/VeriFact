// Send Message

function sendMessage(force = false) {
  const input = document.getElementById("userInput");
  const chatBox = document.getElementById("chatBox");
  const chatInput = document.getElementById("chatInput");

  if (!input || input.value.trim() === "") return;

  const message = input.value.trim();
  
  // Hide empty state
  const emptyState = document.querySelector('.empty-state');
  if (emptyState) {
    emptyState.style.display = 'none';
  }
  
  // Hide disclaimer when user sends a message
  const disclaimer = document.querySelector('.ai-disclaimer-banner');
  if (disclaimer) {
    disclaimer.style.display = 'none';
  }
  
  // Move chat input to bottom
  if (chatInput) {
    chatInput.classList.remove("centered");
    chatInput.classList.add("bottom");
  }

  // Display user message
  const userMsg = document.createElement("div");
  userMsg.className = "user-message";
  userMsg.innerText = message;
  chatBox.appendChild(userMsg);

  // Clear input
  input.value = "";
  input.style.height = "auto";

  // Prepare payload
  const payload = { message: message };
  if (window.chatManager && window.chatManager.currentConversationId) {
    payload.search_id = window.chatManager.currentConversationId;
  }

  console.log('📤 Sending message with payload:', payload);

  // Send to backend
  fetch('/api/chat/send', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin',
    body: JSON.stringify(payload)
  })
  .then(response => {
    console.log('📥 Response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('📥 Response data:', data);
    
    if (data.status === 'success') {
      // Update conversation ID
      if (window.chatManager && data.search_id) {
        window.chatManager.currentConversationId = data.search_id;
        if (typeof window.chatManager.updateActiveConversation === 'function') {
          window.chatManager.updateActiveConversation();
        }
      }

      if (data.is_first_message) {
        console.log('🆕 First message - triggering scrape');
        const firstChatId = data.chat_id;
        
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

        // Trigger scraping with the message as query
        fetch('/api/scrape', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ 
            query: message,
            search_id: data.search_id 
          })
        })
        .then(res => {
          console.log('📥 Scrape response status:', res.status);
          return res.json();
        })
        .then(scrape => {
          console.log('📥 Scrape data:', scrape);
          
          // Remove loading message
          if (loadingMsg && loadingMsg.parentNode) {
            loadingMsg.parentNode.removeChild(loadingMsg);
          }
          
          if (scrape && scrape.status === 'success') {
            console.log('✅ Scrape successful, fetching bot response for result_id:', scrape.result_id);
            
            // Fetch and display bot response
            fetch(`/api/get-bot-response/${scrape.result_id}`, {
              method: 'GET',
              credentials: 'same-origin'
            })
            .then(response => {
              console.log('📥 Bot response status:', response.status);
              return response.json();
            })
            .then(botData => {
              console.log('📥 Bot data:', botData);
              
              if (botData.status === 'success') {
                // Build rich bot message
                const botMsg = buildRichBotMessage(botData);
                chatBox.appendChild(botMsg);
                chatBox.scrollTop = chatBox.scrollHeight;
                
                if (firstChatId) {
                  updateChatResponse(firstChatId, botData.summary);
                }
                
                // Update sources panel
                if (typeof updateSourcesList === 'function') {
                  updateSourcesList(botData.sources);
                }
                
                // Refresh trending topics
                if (typeof loadTrendingTopics === 'function') {
                  loadTrendingTopics();
                }
                
                // Reload conversations
                if (window.chatManager && typeof window.chatManager.loadFromServer === 'function') {
                  window.chatManager.loadFromServer();
                }
              } else {
                console.error('❌ Bot response error:', botData);
                showNotification('Failed to generate response: ' + (botData.message || 'Unknown error'), 'error');
              }
            })
            .catch(err => {
              console.error('❌ Error fetching bot response:', err);
              showNotification('Error generating response', 'error');
            });
          } else if (scrape && scrape.status === 'blocked') {
            // Harmful/illegal query was detected by backend safety filter
            console.warn('⚠️ Scrape blocked for safety:', scrape.message);

            // Show a clear chat message explaining why nothing was scraped
            const warningText = scrape.message || 'This query cannot be processed because it violates safety guidelines.';
            const botMsg = buildFollowupBotMessage(warningText);
            chatBox.appendChild(botMsg);
            chatBox.scrollTop = chatBox.scrollHeight;

            if (typeof showNotification === 'function') {
              showNotification(warningText, 'error');
            }

            // Start a fresh conversation so the next message can run a normal scrape
            if (window.chatManager && typeof window.chatManager.newChat === 'function') {
              window.chatManager.newChat();
            }
          } else {
            console.error('❌ Scrape failed:', scrape);
            showNotification('Failed to scrape sources: ' + (scrape && scrape.message ? scrape.message : 'Unknown error'), 'error');
          }
        })
        .catch(err => {
          console.error('❌ Error triggering scrape:', err);
          if (loadingMsg && loadingMsg.parentNode) {
            loadingMsg.parentNode.removeChild(loadingMsg);
          }
          showNotification('Error scraping sources. Please try again.', 'error');
        });
        
      } else {
        console.log('💬 Follow-up message - generating response');
        
        // Show loading indicator
        const loadingMsg = document.createElement('div');
        loadingMsg.className = 'bot-message';
        loadingMsg.innerHTML = `
          <div style="text-align:center; padding:30px;">
            <i class="fa fa-spinner fa-spin" style="font-size:32px; color:#f9c229;"></i>
            <p style="margin-top:15px; color:#a0adb3;">Referencing earlier findings...</p>
          </div>
        `;
        chatBox.appendChild(loadingMsg);
        chatBox.scrollTop = chatBox.scrollHeight;

        fetch('/api/chat/followup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({
            message: message,
            search_id: data.search_id
          })
        })
        .then(res => res.json())
        .then(followup => {
          console.log('📥 Followup data:', followup);
          
          if (loadingMsg && loadingMsg.parentNode) {
            loadingMsg.parentNode.removeChild(loadingMsg);
          }

          if (followup.status === 'success' && followup.response) {
            const payload = followup.response;
            const followupText = payload.summary || payload.answer || 'No response available.';
            const botMsg = buildFollowupBotMessage(followupText);
            chatBox.appendChild(botMsg);
            chatBox.scrollTop = chatBox.scrollHeight;

            if (Array.isArray(payload.sources) && typeof updateSourcesList === 'function') {
              updateSourcesList(payload.sources);
            }

            updateChatResponse(data.chat_id, followupText);

            if (window.chatManager && typeof window.chatManager.loadFromServer === 'function') {
              window.chatManager.loadFromServer();
            }
          } else {
            console.error('❌ Follow-up generation failed:', followup);
            showNotification(followup.message || 'Failed to generate follow-up response', 'error');
          }
        })
        .catch(err => {
          console.error('❌ Error generating follow-up:', err);
          if (loadingMsg && loadingMsg.parentNode) {
            loadingMsg.parentNode.removeChild(loadingMsg);
          }
          showNotification('Error generating follow-up response. Please try again.', 'error');
        });
      }
    } else {
      console.error('❌ Failed to save message:', data.message);
      showNotification('Failed to save message: ' + (data.message || 'Unknown error'), 'error');
    }
  })
  .catch(error => {
    console.error('❌ Error sending message:', error);
    showNotification('Error sending message: ' + error.message, 'error');
  });
}









// Helper to build rich bot message with summary, sources, and accuracy
function buildRichBotMessage(data) {
  const botMsg = document.createElement('div');
  botMsg.className = 'bot-message';

  const sourcesForArchive = Array.isArray(data.sources) ? data.sources : [];
  botMsg._sourcesForArchive = sourcesForArchive;

  // ✅ Get article count from the correct location
  const articleCount = data.article_count || 0;
  const maxCount = 10; // Maximum expected count

  // Calculate the donut chart fill (282.7 is the circumference of the circle)
  const fillPercentage = (articleCount / maxCount) * 282.7;

  console.log('📥 Article count:', articleCount);
  console.log('📥 Fill percentage:', fillPercentage);

  botMsg.innerHTML = `
    <div class="accordion-item" open>
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
        <button class="accordion-toggle" aria-expanded="true"><i class="fa fa-angle-double-down"></i></button>
      </div>
      <div class="accordion-content">
        <div class="response-section">
          <strong>Summary:</strong>
          <p class="resp-summary">${escapeHtml(data.summary)}</p>
          <hr>
          <strong>Source Coverage</strong>
          <div class="donut-chart-wrapper">
            <svg width="80" height="80" viewBox="0 0 120 120" class="donut-chart">
              <circle cx="60" cy="60" r="45" fill="none" stroke="#e0e0e0" stroke-width="16"></circle>
              <circle cx="60" cy="60" r="45" fill="none" stroke="#4caf50" stroke-width="16" 
                      stroke-dasharray="${fillPercentage} 282.7" 
                      stroke-dashoffset="0" transform="rotate(-90 60 60)"></circle>
              <text x="60" y="65" text-anchor="middle" font-size="20" font-weight="bold" fill="currentColor">
                ${articleCount}/${maxCount}
              </text>
            </svg>
            <div class="coverage-info">
              <p class="coverage-line-1">${articleCount} verified sources found</p>
              <p class="coverage-line-2">${(data.accuracy && data.accuracy.status_message) ? data.accuracy.status_message : 'Source coverage analysis'}</p>
            </div>
          </div>
          <hr>
         
        </div>
      </div>
    </div>
  `;
  
  // Wire up accordion toggle
  const toggleBtn = botMsg.querySelector('.accordion-toggle');
  const accordionItem = botMsg.querySelector('.accordion-item');
  if (toggleBtn && accordionItem) {
    toggleBtn.addEventListener('click', () => {
      if (accordionItem.classList.contains('open')) {
        closeAccordion(accordionItem);
        toggleBtn.setAttribute('aria-expanded', 'false');
      } else {
        openAccordion(accordionItem);
        toggleBtn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  // Wire up save button
  const saveBtn = botMsg.querySelector('.save-response-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      saveResponseToArchive(botMsg, sourcesForArchive);
      saveBtn.classList.add('saved');
      saveBtn.title = 'Saved';
      showNotification('Saved response to Archive', 'success');
    });
  }
  
  return botMsg;
}

// Helper to build simple bot message (for follow-ups without full scraping)
function buildSimpleBotMessage(content) {
  const botMsg = document.createElement('div');
  botMsg.className = 'bot-message';
  
  botMsg.innerHTML = `
    <div class="accordion-item">
      <div class="accordion-header">
        <div class="url-row">
          <strong>Response</strong>
        </div>
        <button class="accordion-toggle"><i class="fa fa-angle-double-down"></i></button>
      </div>
      <div class="accordion-content">
        <p>${escapeHtml(content)}</p>
      </div>
    </div>
  `;
  
  // Wire up accordion toggle
  const toggleBtn = botMsg.querySelector('.accordion-toggle');
  const accordionItem = botMsg.querySelector('.accordion-item');
  if (toggleBtn && accordionItem) {
    toggleBtn.addEventListener('click', () => {
      if (accordionItem.classList.contains('open')) {
        closeAccordion(accordionItem);
        toggleBtn.setAttribute('aria-expanded', 'false');
      } else {
        openAccordion(accordionItem);
        toggleBtn.setAttribute('aria-expanded', 'true');
      }
    });
  }
  
  return botMsg;
}

function buildFollowupBotMessage(content) {
  const botMsg = document.createElement('div');
  botMsg.className = 'bot-message followup-message';
  const bubble = document.createElement('div');
  bubble.className = 'followup-bubble';
  bubble.textContent = content;
  botMsg.appendChild(bubble);
  return botMsg;
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
    const generatedSources = buildSourcesForTopic(responseTopic);
    updateSourcesList(generatedSources);
    botMsg._sourcesForArchive = generatedSources;

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
        saveResponseToArchive(botMsg, generatedSources);
        // mark as saved
        saveBtn.classList.add('saved');
        saveBtn.title = 'Saved';
        showNotification('Saved response to Archive', 'success');
      });
    }

    // Update the response in the database
    const responseText = `Analysis of sources completed.`;
    
    if (isFirstMessage) {
      console.log('First message saved to searches table');
    } else {
      updateChatResponse(id, responseText);
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
    if (data.status === 'success') {
      // Keep the main chat panel blank on load but retain history data for future use
      window.serverChatHistory = data.conversations || data.messages || [];

      const chatBox = document.getElementById('chatBox');
      if (chatBox) {
        chatBox.innerHTML = '';
      }

      const chatInput = document.getElementById('chatInput');
      if (chatInput) {
        chatInput.classList.remove('bottom');
        chatInput.classList.add('centered');
      }

      const sourcesList = document.getElementById('sourcesList');
      if (sourcesList) {
        sourcesList.innerHTML = '<li class="placeholder">No sources yet.</li>';
      }

      if (window.chatManager && typeof window.chatManager.hydrateFromServerHistory === 'function') {
        window.chatManager.hydrateFromServerHistory(window.serverChatHistory);
      }
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
      if (typeof window.setArchiveUserContext === 'function') {
        const uuid = data.user.uuid || (data.user.id ? `user-${data.user.id}` : null);
        window.setArchiveUserContext(uuid || 'guest');
      }
      window.__verifactCurrentUsername = data.user.username || '';
    } else {
      // User not logged in or error occurred
      console.log('User not logged in or error:', data.message);
      if (typeof window.setArchiveUserContext === 'function') {
        window.setArchiveUserContext('guest');
      }
      window.__verifactCurrentUsername = '';
      // Keep "Sign In" as default
    }
  })
  .catch(error => {
    console.error('Error loading user info:', error);
    // Keep "Sign In" as default on error
    if (typeof window.setArchiveUserContext === 'function') {
      window.setArchiveUserContext('guest');
    }
    window.__verifactCurrentUsername = '';
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
      if (loadingMsg && loadingMsg.parentNode) {
        loadingMsg.parentNode.removeChild(loadingMsg);
      }

      if (data.status === 'success') {
        const botMsg = document.createElement("div");
        botMsg.className = "bot-message";
        
        const sourcesForPanel = data.sources.map((source) => {
          return {
            label: source.title,
            title: source.title,
            url: source.url,
            is_trusted: source.is_trusted
          };
        });

        updateSourcesList(sourcesForPanel);
        botMsg._sourcesForArchive = sourcesForPanel;

        // ✅ Get article count from the correct location
        const articleCount = data.article_count || 0;
        const maxCount = 10;
        const fillPercentage = (articleCount / maxCount) * 282.7;

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
                <strong>Source Coverage</strong>
                <div class="donut-chart-wrapper">
                  <svg width="80" height="80" viewBox="0 0 120 120" class="donut-chart">
                    <circle cx="60" cy="60" r="45" fill="none" stroke="#e0e0e0" stroke-width="16"></circle>
                    <circle cx="60" cy="60" r="45" fill="none" stroke="#4caf50" stroke-width="16"
                            stroke-dasharray="${fillPercentage} 282.7"
                            stroke-dashoffset="0" transform="rotate(-90 60 60)"></circle>
                    <text x="60" y="65" text-anchor="middle" font-size="20" font-weight="bold" fill="currentColor">
                      ${articleCount}/${maxCount}
                    </text>
                  </svg>
                  <div class="coverage-info">
                    <p class="coverage-line-1">${articleCount} verified sources found</p>
                    <p class="coverage-line-2">${data.accuracy.status_message || 'Source coverage analysis'}</p>
                  </div>
                </div>
                <hr>
              
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
            saveResponseToArchive(botMsg, sourcesForPanel);
            saveBtn.classList.add('saved');
            saveBtn.title = 'Saved';
            showNotification('Saved response to Archive', 'success');
          });
        }

        if (!isFirstMessage) {
          updateChatResponse(id, data.summary);
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

  // Add this helper function to chatfunction.js to ensure donut chart displays correctly

function buildDonutChart(accuracy, articleCount) {
  // Ensure articleCount defaults to accuracy data if not provided
  const count = articleCount || accuracy.true_count || 0;
  const maxCount = 10;
  
  // Calculate fill percentage for the donut chart
  // Use article_count if available, otherwise use true_count from accuracy
  const fillPercentage = (count / maxCount) * 282.7;
  
  // Determine status message based on accuracy data
  let statusMessage = accuracy.status_message || '';
  
  // Override status based on accuracy percentages
  if (accuracy.true_percent === 0 && accuracy.false_percent === 100) {
    statusMessage = accuracy.status_message || '❌ No verified sources or claim not confirmed';
  } else if (accuracy.true_percent === 50 && accuracy.false_percent === 50) {
    statusMessage = accuracy.status_message || '⚠️ Insufficient data';
  } else if (count === 0) {
    statusMessage = '❌ No verified sources found';
  } else {
    statusMessage = statusMessage || `${count} verified source${count !== 1 ? 's' : ''} analyzed`;
  }
  
  return `
    <div class="donut-chart-wrapper">
      <svg width="80" height="80" viewBox="0 0 120 120" class="donut-chart">
        <circle cx="60" cy="60" r="45" fill="none" stroke="#e0e0e0" stroke-width="16"></circle>
        <circle cx="60" cy="60" r="45" fill="none" stroke="${count > 0 ? '#4caf50' : '#9e9e9e'}" stroke-width="16" 
                stroke-dasharray="${fillPercentage} 282.7" 
                stroke-dashoffset="0" transform="rotate(-90 60 60)"></circle>
        <text x="60" y="65" text-anchor="middle" font-size="20" font-weight="bold" fill="currentColor">
          ${count}/${maxCount}
        </text>
      </svg>
      <div class="coverage-info">
        <p class="coverage-line-1">${count} verified source${count !== 1 ? 's' : ''} found</p>
        <p class="coverage-line-2">${statusMessage}</p>
      </div>
    </div>
  `;
}

// Update buildRichBotMessage to use the new helper
function buildRichBotMessage(data) {
  const botMsg = document.createElement('div');
  botMsg.className = 'bot-message';

  const sourcesForArchive = Array.isArray(data.sources) ? data.sources : [];
  botMsg._sourcesForArchive = sourcesForArchive;

  // ✅ Get article count with proper fallback
  const articleCount = data.article_count || (data.accuracy ? data.accuracy.true_count : 0) || 0;
  
  // Generate donut chart HTML
  const donutChartHtml = buildDonutChart(data.accuracy || {}, articleCount);

  botMsg.innerHTML = `
    <div class="accordion-item" open>
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
        <button class="accordion-toggle" aria-expanded="true"><i class="fa fa-angle-double-down"></i></button>
      </div>
      <div class="accordion-content">
        <div class="response-section">
          <strong>Summary:</strong>
          <p class="resp-summary">${escapeHtml(data.summary)}</p>
          <hr>
          <strong>Source Coverage</strong>
          ${donutChartHtml}
          <hr>
        </div>
      </div>
    </div>
  `;
  
  // Wire up accordion toggle
  const toggleBtn = botMsg.querySelector('.accordion-toggle');
  const accordionItem = botMsg.querySelector('.accordion-item');
  if (toggleBtn && accordionItem) {
    toggleBtn.addEventListener('click', () => {
      if (accordionItem.classList.contains('open')) {
        closeAccordion(accordionItem);
        toggleBtn.setAttribute('aria-expanded', 'false');
      } else {
        openAccordion(accordionItem);
        toggleBtn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  // Wire up save button
  const saveBtn = botMsg.querySelector('.save-response-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      saveResponseToArchive(botMsg, sourcesForArchive);
      saveBtn.classList.add('saved');
      saveBtn.title = 'Saved';
      showNotification('Saved response to Archive', 'success');
    });
  }
  
  return botMsg;
}

// Update buildBotMessageForHistory function (around line 520-600)
function buildBotMessageForHistory(messageData) {
   // 🐛 DEBUG: Log the entire messageData to see its structure
  console.log('🐛 buildBotMessageForHistory received:', messageData);
  console.log('🐛 article_count:', messageData.article_count);
  console.log('🐛 coverage_count:', messageData.coverage_count);
  console.log('🐛 accuracy:', messageData.accuracy);

  const botMsg = document.createElement('div');
  botMsg.className = 'bot-message';

  // Determine if this is a rich message (has summary + sources) or simple follow-up
 const isRichMessage = messageData.summary && messageData.sources;

  if (isRichMessage) {
    // ✅ FIX: Get article count from the correct location - top level, not inside accuracy
    const articleCount = messageData.article_count || messageData.coverage_count || (messageData.accuracy ? messageData.accuracy.true_count : 0) || 0;
    console.log('🐛 Final articleCount:', articleCount);
    const donutChartHtml = buildDonutChart(messageData.accuracy || {}, articleCount);

    // Rich message with accordion, summary, accuracy, sources
    botMsg.innerHTML = `
      <div class="accordion-item">
        <div class="accordion-header">
          <div class="url-row">
            <strong>Response</strong>
            <span class="response-title">${escapeHtml((messageData.summary || '').substring(0, 50) + '...')}</span>
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
            <p class="resp-summary">${escapeHtml(messageData.summary)}</p>
            <hr>
            <strong>Source Coverage</strong>
            ${donutChartHtml}
            <hr>
          </div>
        </div>
      </div>
    `;

    const sourcesForArchive = Array.isArray(messageData.sources) ? messageData.sources : [];
    botMsg._sourcesForArchive = sourcesForArchive;

    // Wire up save button
    const saveBtn = botMsg.querySelector('.save-response-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof saveResponseToArchive === 'function') {
          saveResponseToArchive(botMsg, sourcesForArchive);
        }
        saveBtn.classList.add('saved');
        saveBtn.title = 'Saved';
        if (typeof showNotification === 'function') {
          showNotification('Saved response to Archive', 'success');
        }
      });
    }
  } else {
    // Simple follow-up message
    botMsg.innerHTML = `
      <div class="accordion-item">
        <div class="accordion-header">
          <div class="url-row">
            <strong>Response</strong>
          </div>
          <button class="accordion-toggle"><i class="fa fa-angle-double-down"></i></button>
        </div>
        <div class="accordion-content">
          <p>${escapeHtml(messageData.content)}</p>
        </div>
      </div>
    `;
  }

  // Wire up accordion toggle
  const toggleBtn = botMsg.querySelector('.accordion-toggle');
  const accordionItem = botMsg.querySelector('.accordion-item');
  if (toggleBtn && accordionItem) {
    toggleBtn.addEventListener('click', () => {
      if (accordionItem.classList.contains('open')) {
        closeAccordion(accordionItem);
        toggleBtn.setAttribute('aria-expanded', 'false');
      } else {
        openAccordion(accordionItem);
        toggleBtn.setAttribute('aria-expanded', 'true');
      }
    });
  }

  return botMsg;
}