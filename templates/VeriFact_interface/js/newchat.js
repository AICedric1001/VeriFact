function escapeHtml(str = '') {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Enhanced ChatManager - Replace the existing ChatManager class in newchat.js

class ChatManager {
  constructor() {
    this.conversations = {}; // Store by search_id
    this.currentConversationId = null;
    this.selectedConversations = new Set();
    this.pendingMessage = null;
  }

  // Load conversations from server
  async loadFromServer() {
    try {
      const response = await fetch('/api/chat/history', {
        method: 'GET',
        credentials: 'same-origin'
      });
      
      const data = await response.json();
      
      if (data.status === 'success' && data.conversations) {
        // Clear existing conversations
        this.conversations = {};
        
        // Store each conversation
        data.conversations.forEach(conv => {
          this.conversations[conv.search_id] = conv;
        });
        
        // Render sidebar
        this.renderChatHistory();
        
        // If we have conversations and none is currently active, load the most recent
        if (Object.keys(this.conversations).length > 0 && !this.currentConversationId) {
          const firstConvId = Object.keys(this.conversations)[0];
          this.loadConversation(firstConvId);
        }
      }
    } catch (error) {
      console.error('Error loading conversations from server:', error);
    }
  }

  // Start a new chat
  async newChat() {
    // Save current conversation if it exists and has messages
    if (this.currentConversationId) {
      await this.saveCurrentConversation();
    }

    // Clear the chat box
    const chatBox = document.getElementById('chatBox');
    if (chatBox) {
      chatBox.innerHTML = '';
    }

    // Show empty state
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) {
      emptyState.style.display = 'flex';
    }

    // Clear sources
    const sourcesList = document.getElementById('sourcesList');
    if (sourcesList) {
      sourcesList.innerHTML = '<li class="placeholder">No sources yet.</li>';
    }

    // Reset to null (will be set when first message is sent)
    this.currentConversationId = null;

    // Reset chat input to centered
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
      chatInput.classList.remove('bottom');
      chatInput.classList.add('centered');
      
      // Clear and focus input
      const textarea = chatInput.querySelector('textarea');
      if (textarea) {
        textarea.value = '';
        textarea.focus();
      }
    }

    // Update active state in sidebar
    this.updateActiveConversation();
  }

  // Save current conversation (called before switching or creating new)
  async saveCurrentConversation() {
    if (!this.currentConversationId) return;

    const chatBox = document.getElementById('chatBox');
    if (!chatBox) return;

    // Extract messages from current chat box
    const messages = Array.from(chatBox.children)
      .filter(el => el.classList.contains('user-message') || el.classList.contains('bot-message'))
      .map(el => ({
        role: el.classList.contains('user-message') ? 'user' : 'bot',
        content: el.innerText || ''
      }));

    if (messages.length === 0) return;

    // Send to backend
    try {
      await fetch('/api/chat/save_history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          search_id: this.currentConversationId,
          messages: messages
        })
      });
    } catch (error) {
      console.error('Error saving conversation:', error);
    }
  }

  // Load a conversation from history
  loadConversation(searchId) {
    const conversation = this.conversations[searchId];
    if (!conversation) return;

    this.currentConversationId = searchId;

    const chatBox = document.getElementById('chatBox');
    if (!chatBox) return;

    // Hide empty state
    const emptyState = document.querySelector('.empty-state');
    if (emptyState) {
      emptyState.style.display = 'none';
    }

    // Clear chat box
    chatBox.innerHTML = '';

    // Rebuild messages
    conversation.messages.forEach(msg => {
      if (msg.role === 'user') {
        // User message
        const userMsg = document.createElement('div');
        userMsg.className = 'user-message';
        userMsg.textContent = msg.content;
        chatBox.appendChild(userMsg);
      } else {
        // Bot message with full UI reconstruction
        const botMsg = this.buildBotMessage(msg);
        chatBox.appendChild(botMsg);
      }
    });

    // Update sources panel if we have sources from the first bot message
    const firstBotMsg = conversation.messages.find(m => m.role === 'bot');
    if (firstBotMsg && firstBotMsg.sources) {
      updateSourcesList(firstBotMsg.sources);
    }

    // Move chat input to bottom
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
      chatInput.classList.remove('centered');
      chatInput.classList.add('bottom');
    }

    // Scroll to bottom
    chatBox.scrollTop = chatBox.scrollHeight;

    // Update active state
    this.updateActiveConversation();

    if (this.pendingMessage) {
      const { text, inputRef } = this.pendingMessage;
      requestAnimationFrame(() => {
    if (inputRef) {
      inputRef.value = text;
      inputRef.dispatchEvent(new Event('input'));
    }
    if (typeof sendMessage === 'function') {
      sendMessage(true);
    }
        this.pendingMessage = null;
      });
    }
  }

  hydrateFromServerHistory(conversationsList = []) {
    this.conversations = {};
    conversationsList.forEach(conv => {
      if (!conv.messages) return;
      conv.messages = conv.messages.map(msg => {
        if (msg.role === 'bot' && !msg.sources && msg.summary && (!msg.accuracy || msg.accuracy.total_count === 0)) {
          return {
            role: 'bot',
            content: msg.summary,
            followup: true
          };
        }
        return msg;
      });
      this.conversations[conv.search_id] = conv;
    });
    this.renderChatHistory();
  }

  // Build bot message with full UI (summary, sources, accuracy)
  buildBotMessage(messageData) {
    const botMsg = document.createElement('div');
    botMsg.className = 'bot-message';

    // Determine if this is a rich message (has summary + sources) or simple follow-up
    const isRichMessage = messageData.summary && messageData.sources;

    if (isRichMessage) {
      // Rich message with accordion, summary, accuracy, sources
      botMsg.innerHTML = `
        <div class="accordion-item">
          <div class="accordion-header">
            <div class="url-row">
              <strong>Response</strong>
              <span class="response-title">${escapeHtml(messageData.summary.substring(0, 50) + '...')}</span>
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
              <strong>Analysis</strong>
              <p class="resp-analysis">According to the analysis, this information is <strong>${messageData.accuracy.true_percent}% credible</strong> based on source reliability.</p>

              <!-- Accuracy Card -->
              <div class="accuracy-card response-accuracy-card">
                <div class="accuracy-bar">
                  <span class="true-label">
                    <i class="fa fa-check-circle"></i> 
                    <span class="true-percent">${messageData.accuracy.true_percent}</span>%
                  </span>
                  <div class="bar range-bar">
                    <div class="true" style="width: ${messageData.accuracy.true_percent}%"></div>
                    <div class="false" style="width: ${messageData.accuracy.false_percent}%"></div>
                  </div>
                  <span class="false-label">
                    <span class="false-percent">${messageData.accuracy.false_percent}</span>% 
                    <i class="fa fa-exclamation-triangle"></i>
                  </span>
                </div>
              </div>

              <hr>
              <strong>Key Findings:</strong>
              <ul class="resp-keyfindings">
                <li>${messageData.accuracy.trusted_count} out of ${messageData.accuracy.total_count} sources are from verified outlets</li>
                <li>${messageData.accuracy.total_count - messageData.accuracy.trusted_count} unverified source${messageData.accuracy.total_count - messageData.accuracy.trusted_count !== 1 ? 's' : ''}</li>
                ${messageData.accuracy.true_percent >= 80 ? '<li style="color:#4caf50;">High confidence in information accuracy</li>' : ''}
                ${messageData.accuracy.true_percent < 50 ? '<li style="color:#e53935;">⚠️ Exercise caution - limited verified sources</li>' : ''}
              </ul>
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
    } else {
      // Simple follow-up message (no sources/accuracy)
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

      // Wire up accordion for simple messages too
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
    }

    return botMsg;
  }

  // Render chat history in sidebar
  renderChatHistory() {
    const historyContainer = document.querySelector('.chat-history');
    if (!historyContainer) return;

    // Sort conversations by timestamp (newest first)
    const sortedConversations = Object.values(this.conversations)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (sortedConversations.length === 0) {
      historyContainer.innerHTML = '<div class="no-chats">No chat history</div>';
      return;
    }

    // Generate chat items
    const chatItemsHtml = sortedConversations.map(conv => `
      <div class="chat-history-item ${this.currentConversationId === conv.search_id ? 'active' : ''}" 
           data-conversation-id="${conv.search_id}">
        <div class="card-left">
          <i class="fa fa-comment"></i>
          <span class="chat-title">${conv.title}</span>
        </div>
        <div class="card-right">
          <label class="checkbox" aria-label="Select">
            <input type="checkbox" class="chat-checkbox-input" value="${conv.search_id}" 
                   ${this.selectedConversations.has(conv.search_id) ? 'checked' : ''}>
            <span></span>
          </label>
        </div>
      </div>
    `).join('');

    historyContainer.innerHTML = chatItemsHtml;

    // Attach event listeners
    this.attachHistoryItemListeners();
    this.attachCheckboxListeners();
  }

  // Attach click handlers to history items
  attachHistoryItemListeners() {
    document.querySelectorAll('.chat-history-item').forEach(item => {
      item.addEventListener('click', (event) => {
        // Don't trigger if clicking checkbox
        if (event.target.closest('.chat-checkbox-input')) {
          return;
        }

        const conversationId = item.getAttribute('data-conversation-id');
        if (conversationId) {
          this.loadConversation(parseInt(conversationId));
        }
      });
    });
  }

  // Attach checkbox event listeners
  attachCheckboxListeners() {
    const selectAllCheckbox = document.getElementById('select-all-chats');
    const chatCheckboxes = document.querySelectorAll('.chat-checkbox-input');
    const deleteSelectedBtn = document.getElementById('deleteSelectedChats');

    // Select All functionality
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        const isChecked = e.target.checked;
        chatCheckboxes.forEach(checkbox => {
          checkbox.checked = isChecked;
          const convId = parseInt(checkbox.value);
          if (isChecked) {
            this.selectedConversations.add(convId);
          } else {
            this.selectedConversations.delete(convId);
          }
        });
        if (deleteSelectedBtn) {
          deleteSelectedBtn.disabled = !isChecked;
        }
      });
    }

    // Individual checkbox functionality
    chatCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const convId = parseInt(e.target.value);
        if (e.target.checked) {
          this.selectedConversations.add(convId);
        } else {
          this.selectedConversations.delete(convId);
        }
        
        // Update delete button state
        if (deleteSelectedBtn) {
          deleteSelectedBtn.disabled = this.selectedConversations.size === 0;
        }
        
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
      deleteSelectedBtn.addEventListener('click', async () => {
        if (this.selectedConversations.size === 0) return;

        if (confirm(`Delete ${this.selectedConversations.size} selected conversation(s)?`)) {
          // Delete from server
          try {
            for (const convId of this.selectedConversations) {
              await fetch(`/api/chat/delete/${convId}`, {
                method: 'DELETE',
                credentials: 'same-origin'
              });
              
              // Remove from local state
              delete this.conversations[convId];
            }

            // Check if current conversation was deleted
            if (this.selectedConversations.has(this.currentConversationId)) {
              this.newChat();
            }

            this.selectedConversations.clear();
            this.renderChatHistory();
            
            if (typeof showNotification === 'function') {
              showNotification('Conversations deleted successfully', 'success');
            }
          } catch (error) {
            console.error('Error deleting conversations:', error);
            if (typeof showNotification === 'function') {
              showNotification('Failed to delete conversations', 'error');
            }
          }
        }
      });
    }
  }

  // Update active conversation styling
  updateActiveConversation() {
    document.querySelectorAll('.chat-history-item').forEach(item => {
      const convId = parseInt(item.getAttribute('data-conversation-id'));
      item.classList.toggle('active', convId === this.currentConversationId);
    });
  }
}

// Initialize chat manager
const chatManager = new ChatManager();
window.chatManager = chatManager;

// Helper function
function escapeHtml(text = '') {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
  // Load conversations from server
  await chatManager.loadFromServer();

  // If no conversations exist, start a new chat
  if (Object.keys(chatManager.conversations).length === 0) {
    chatManager.newChat();
  }

  // Wire up New Chat button
  const newChatBtn = document.querySelector('button[aria-label="New Chat"]');
  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => chatManager.newChat());
  }

  // Wire up sidebar New Chat button
  const sidebarNewChatBtn = document.getElementById('sidebarNewChatBtn');
  if (sidebarNewChatBtn) {
    sidebarNewChatBtn.addEventListener('click', () => chatManager.newChat());
  }
});

window.chatManagerSendMessage = function(forceSend = false) {
  const input = document.getElementById('userInput');
  const value = input ? input.value.trim() : '';

  if (!value) return;

  if (chatManager && (forceSend || chatManager.currentConversationId)) {
    if (typeof sendMessage === 'function') {
      sendMessage(forceSend);
    }
  } else {
    chatManager.pendingMessage = { text: value, inputRef: input };
    chatManager.newChat();
  }
};

