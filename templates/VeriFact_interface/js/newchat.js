class ChatManager {
  constructor() {
    this.chatHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    this.currentChatId = null;
    this.chats = JSON.parse(localStorage.getItem('chats') || '{}');
    this.selectedChats = new Set();
  }

  // Save the current chat to history
  saveCurrentChat() {
    if (!this.currentChatId) return;

    const chatBox = document.getElementById('chatBox');
    if (!chatBox) return;

    const messages = Array.from(chatBox.children).map(el => ({
      role: el.classList.contains('user-message') ? 'user' : 'bot',
      content: el.innerText
    }));

    if (messages.length === 0) return;

    // Update or add chat
    this.chats[this.currentChatId] = {
      id: this.currentChatId,
      title: this.getChatTitle(messages),
      messages,
      timestamp: new Date().toISOString()
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
        msgEl.textContent = msg.content;
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

  // Update the chat history content
  historyContainer.innerHTML = sortedChats.length > 0 ? chatItemsHtml : '<div class="no-chats">No chat history</div>';
  
  // Add event listeners
  this.attachCheckboxListeners();
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
}

// Initialize chat manager
const chatManager = new ChatManager();

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

