function escapeHtml(str = '') {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

class ChatManager {
  constructor() {
    this.chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    this.currentChatId = null;
    this.chats = JSON.parse(localStorage.getItem('chats') || '{}');
    this.selectedChats = new Set();
  }

  // Ingest server-provided conversation history into local state
  hydrateFromServerHistory(messages = []) {
    if (!Array.isArray(messages) || messages.length === 0) {
      return;
    }

    // Remove previously hydrated server entries to avoid duplicates
    Object.keys(this.chats).forEach(chatId => {
      if (this.chats[chatId]?.source === 'server') {
        delete this.chats[chatId];
      }
    });

    const imported = {};

    messages.forEach(msg => {
      const id = msg?.id;
      const type = msg?.type;

      // Skip search rows for now; sidebar should show stored conversations only
      if (type !== 'chat') {
        return;
      }

      const query = (msg?.query_text || '').trim();
      const response = (msg?.response_text || '').trim();
      const timestamp = msg?.timestamp || new Date().toISOString();

      if (!id || !type || !query) {
        return;
      }

      const chatId = `${type}-${id}`;
      if (imported[chatId]) {
        return;
      }

      const messageList = [{ role: 'user', content: query, html: null }];

      if (type === 'chat' && response) {
        messageList.push({
          role: 'bot',
          content: response,
          html: this.buildBotHistoryHtml(response, msg?.title || query)
        });
      }

      imported[chatId] = {
        id: chatId,
        title: this.getChatTitle(messageList),
        messages: messageList,
        timestamp,
        source: 'server'
      };
    });

    if (Object.keys(imported).length === 0) {
      return;
    }

    this.chats = { ...imported, ...this.chats };
    this.saveToLocalStorage();
    this.renderChatHistory();
  }

  buildBotHistoryHtml(summaryText = '', topic = 'AI Analysis') {
    const safeSummary = escapeHtml(summaryText || 'Summary unavailable.');
    const safeTopic = escapeHtml(topic || 'Analysis');

    return `
      <div class="accordion-item">
        <div class="accordion-header">
          <div class="url-row">
            <strong>Response</strong>
            <span class="resp-title-text">${safeTopic}</span>
          </div>
          <div class="card-right">
            <button class="icon-btn save-response-btn" type="button" title="Save response">
              <i class="fa fa-save"></i>
            </button>
          </div>
          <button class="accordion-toggle" aria-expanded="false">
            <i class="fa fa-angle-double-down"></i>
          </button>
        </div>
        <div class="accordion-content">
          <strong>Summary:</strong>
          <p class="resp-summary">${safeSummary}</p>
        </div>
      </div>
    `;
  }

  // Derive a lightweight title for the sidebar card
  getChatTitle(messages) {
    if (!Array.isArray(messages) || messages.length === 0) {
      return 'Untitled chat';
    }

    const firstUserMessage = messages.find(msg => msg.role === 'user');
    const basis = (firstUserMessage ? firstUserMessage.content : messages[0].content || '').trim();

    if (!basis) {
      return 'Untitled chat';
    }

    return basis.length > 60 ? basis.slice(0, 57).trim() + '...' : basis;
  }

  // Save the current chat to history
  saveCurrentChat() {
    if (!this.currentChatId) return;

    const chatBox = document.getElementById('chatBox');
    if (!chatBox) return;

    const messages = Array.from(chatBox.children).map(el => {
      const role = el.classList.contains('user-message') ? 'user' : 'bot';
      return {
        role,
        content: el.innerText,
        html: el.innerHTML
      };
    });

    if (messages.length === 0) return;

    const serverPayload = messages.map(({ role, content }) => ({ role, content }));
    const chatTitle = this.getChatTitle(messages);

    fetch('/api/chat/save_history', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'same-origin',
      body: JSON.stringify({
        chatId: this.currentChatId,
        title: chatTitle,
        messages: serverPayload
      })
    })
      .then(response => {
        if (!response.ok) {
          console.error('Failed to save history to server.');
        }
      })
      .catch(error => {
        console.error('Network error saving history:', error);
      });

    // Update or add chat
    this.chats[this.currentChatId] = {
      id: this.currentChatId,
      title: chatTitle,
      messages,
      timestamp: new Date().toISOString(),
      source: this.chats[this.currentChatId]?.source || 'local'
    };

    this.saveToLocalStorage();
    this.renderChatHistory();
  }

  // Start a new chat
newChat() {
  // Check if there are any messages in the current chat
  const chatBox = document.getElementById('chatBox');
  const hasMessages = chatBox && Array.from(chatBox.children).some(el => 
    el.classList.contains('user-message') || 
    el.classList.contains('bot-message')
  );

  if (hasMessages) {
    // Save the current chat before starting a new one
    this.saveCurrentChat();
  }

  // Clear the chat box
  if (chatBox) {
    chatBox.innerHTML = '';
  }

  // Clear sources
  const sourcesList = document.getElementById('sourcesList');
  if (sourcesList) {
    sourcesList.innerHTML = '<li class="placeholder">No sources yet.</li>';
  }

  // Save the current chat ID before generating a new one
  const previousChatId = this.currentChatId;
  
  // Generate new chat ID
  this.currentChatId = 'chat-' + Date.now();

  // Reset chat input
  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.classList.remove('bottom');
    chatInput.classList.add('centered');
    chatInput.focus();
  }

  // Clear any selected chats
  this.selectedChats.clear();

  // Always save and render to ensure the chat history is updated
  this.saveToLocalStorage();
  this.renderChatHistory();

  // Scroll to top of chat
  if (chatBox) {
    chatBox.scrollTop = 0;
  }

  return this.currentChatId;
}


  // Load a chat from history
  loadChat(chatId) {
    const chat = this.chats[chatId];
    if (!chat) return;

    this.saveCurrentChat();
    this.currentChatId = chatId;

    // Clear and repopulate chat
    const chatBox = document.getElementById('chatBox');
    if (chatBox) {
      chatBox.innerHTML = '';
      chat.messages.forEach(msg => {
        const msgEl = document.createElement('div');
        msgEl.className = msg.role + '-message';

        if (msg.role === 'bot' && msg.html) {
          msgEl.innerHTML = msg.html;
          this.initializeBotMessageInteractions(msgEl);
        } else {
          msgEl.textContent = msg.content;
        }

        chatBox.appendChild(msgEl);
      });
      chatBox.scrollTop = chatBox.scrollHeight;
    }

    this.updateActiveChat();
  }

  // Delete a chat (kept for backward compatibility, but not used in UI anymore)
  deleteChat(chatId, event) {
    if (event) event.stopPropagation();
    
    if (confirm('Are you sure you want to delete this chat?')) {
      delete this.chats[chatId];
      this.selectedChats.delete(chatId);
      if (this.currentChatId === chatId) {
        this.currentChatId = null;
      }
      this.saveToLocalStorage();
      this.renderChatHistory();
      
      // If we deleted the current chat, start a new one
      if (this.currentChatId === chatId) {
        this.newChat();
      }
    }
  }

  // Render chat history in sidebar with checkboxes
renderChatHistory() {
  const historyContainer = document.querySelector('.chat-history');
  if (!historyContainer) return;

  // Sort chats by timestamp (newest first)
  const sortedChats = Object.values(this.chats)
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  // Generate chat items with checkboxes
  const chatItemsHtml = sortedChats.map(chat => `
    <div class="chat-history-item ${this.currentChatId === chat.id ? 'active' : ''}" 
         data-chat-id="${chat.id}">
      <div class="card-left">
        <i class="fa fa-comment"></i>
        <span class="chat-title">${chat.title}</span>
      </div>
      <div class="card-right">
        <label class="checkbox" aria-label="Select">
          <input type="checkbox" class="chat-checkbox-input" value="${chat.id}" 
                 ${this.selectedChats.has(chat.id) ? 'checked' : ''}>
          <span></span>
        </label>
      </div>
    </div>
  `).join('');

  // Update the sidebar header if it doesn't exist
  const sidebarHeader = document.querySelector('.sidebar .sidebar-header');
  if (!sidebarHeader) {
    const sidebar = document.querySelector('.sidebar');
    const headerHtml = `
      <div class="sidebar-header">
        <div class="title">
          <span class="title-icon" aria-hidden="true"><i class="fa fa-history"></i></span>
          <span>HISTORY</span>
        </div>
        <div class="actions">
          <button class="icon-btn" id="sidebarNewChatBtn" aria-label="New Chat">
            <i class="fa fa-pen-to-square"></i>
          </button>
          <div class="search-box">
            <input type="text" placeholder="Search..." />
            <button><i class="fas fa-search"></i></button>
          </div>
          <button class="icon-btn" id="deleteSelectedChats" aria-label="Delete All">
            <i class="fa fa-trash"></i>
          </button>
          <label class="checkbox" aria-label="Select All">
            <input type="checkbox" id="select-all-chats" ${sortedChats.length === 0 ? 'disabled' : ''}>
            <span></span>
          </label>
        </div>
      </div>
    `;
    sidebar.insertAdjacentHTML('afterbegin', headerHtml);
  }

  const sidebarNewChatBtn = document.getElementById('sidebarNewChatBtn');
  if (sidebarNewChatBtn && !sidebarNewChatBtn.dataset.bound) {
    sidebarNewChatBtn.addEventListener('click', () => this.newChat());
    sidebarNewChatBtn.dataset.bound = 'true';
  }

  // Update the chat history content
  historyContainer.innerHTML = sortedChats.length > 0 ? chatItemsHtml : '<div class="no-chats">No chat history</div>';
  
  // Add event listeners
  this.attachCheckboxListeners();
  this.attachHistoryItemListeners();
}

  // Update active chat styling
  updateActiveChat() {
    document.querySelectorAll('.chat-history-item').forEach(item => {
      item.classList.toggle(
        'active', 
        item.getAttribute('data-chat-id') === this.currentChatId
      );
    });
  }

  // Save data to localStorage
  saveToLocalStorage() {
    localStorage.setItem('chats', JSON.stringify(this.chats));
  }

  // Attach event listeners to checkboxes
  attachCheckboxListeners() {
    // Select All checkbox
    const selectAllCheckbox = document.getElementById('select-all-chats');
    const chatCheckboxes = document.querySelectorAll('.chat-checkbox-input');
    const deleteSelectedBtn = document.getElementById('deleteSelectedChats');

    // Select All functionality
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        chatCheckboxes.forEach(checkbox => {
          checkbox.checked = isChecked;
          if (isChecked) {
            this.selectedChats.add(checkbox.value);
          } else {
            this.selectedChats.delete(checkbox.value);
          }
        });
        deleteSelectedBtn.disabled = !isChecked;
      });
    }

    // Individual checkbox functionality
    chatCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const chatId = e.target.value;
        if (e.target.checked) {
          this.selectedChats.add(chatId);
        } else {
          this.selectedChats.delete(chatId);
        }
        
        // Update delete button state
        deleteSelectedBtn.disabled = this.selectedChats.size === 0;
        
        // Update select all checkbox
        if (selectAllCheckbox) {
          const allChecked = chatCheckboxes.length > 0 && 
                           Array.from(chatCheckboxes).every(cb => cb.checked);
          selectAllCheckbox.checked = allChecked;
        }
      });
    });

    // Delete selected functionality
    if (deleteSelectedBtn) {
      deleteSelectedBtn.addEventListener('click', () => {
        if (this.selectedChats.size > 0 && 
            confirm(`Are you sure you want to delete ${this.selectedChats.size} selected chat(s)?`)) {
          
          const wasCurrentChatDeleted = Array.from(this.selectedChats).some(id => id === this.currentChatId);
          
          // Delete all selected chats
          this.selectedChats.forEach(chatId => {
            delete this.chats[chatId];
          });
          
          this.selectedChats.clear();
          this.saveToLocalStorage();
          
          if (wasCurrentChatDeleted) {
            this.currentChatId = null;
            this.newChat();
          } else {
            this.renderChatHistory();
          }
        }
      });
    }
  }

  // Attach click handlers to load chats when history items are clicked
  attachHistoryItemListeners() {
    document.querySelectorAll('.chat-history-item').forEach(item => {
      if (item.dataset.bound === 'true') {
        return;
      }

      item.addEventListener('click', (event) => {
        const interactedCheckbox = event.target.closest('.chat-checkbox-input');
        if (interactedCheckbox) {
          return;
        }

        const chatId = item.getAttribute('data-chat-id');
        if (chatId) {
          this.loadChat(chatId);
        }
      });

      item.dataset.bound = 'true';
    });
  }

  initializeBotMessageInteractions(botMsg) {
    if (!botMsg) return;

    const toggleBtn = botMsg.querySelector(".accordion-toggle");
    const accordionItem = botMsg.querySelector(".accordion-item");
    if (toggleBtn && accordionItem) {
      toggleBtn.addEventListener("click", () => {
        if (accordionItem.classList.contains('open')) {
          closeAccordion(accordionItem);
          toggleBtn.setAttribute('aria-expanded', 'false');
        } else {
          openAccordion(accordionItem);
          toggleBtn.setAttribute('aria-expanded', 'true');
        }
      });
    }

    const saveBtn = botMsg.querySelector('.save-response-btn');
    if (saveBtn) {
      saveBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (typeof saveResponseToArchive === 'function') {
          saveResponseToArchive(botMsg);
        }
        saveBtn.classList.add('saved');
        saveBtn.title = 'Saved';
        if (typeof showNotification === 'function') {
          showNotification('Saved response to Archive', 'success');
        }
      });
    }
  }
}

// Initialize chat manager
const chatManager = new ChatManager();
window.chatManager = chatManager;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  // Initialize new chat if none exists
  if (!chatManager.currentChatId) {
    chatManager.newChat();
  } else {
    chatManager.renderChatHistory();
  }
  // Update New Chat button
  const newChatBtn = document.querySelector('button[aria-label="New Chat"]');
  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => chatManager.newChat());
  }
});

