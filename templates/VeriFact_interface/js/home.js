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
  const searchInput = document.querySelector('#sidebarSearchInput');
  
  const searchBtn = document.querySelector('#sidebarSearchBtn');
  
  function performSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    // Target chat history items instead of accordion items
    const chatHistory = document.querySelector('.chat-history');
    if (!chatHistory) return;
    const items = chatHistory.children;
    
    if (searchTerm === '') {
      // Show all items if search is empty
      Array.from(items).forEach(item => {
        item.style.display = '';
      });
      return;
    }
    
    Array.from(items).forEach(item => {
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
  // Make showNotification globally available
  window.showNotification = function(message, type = 'info') {
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

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.classList.add('hide');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

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
            // Clear chat manager state
            if (window.chatManager) {
              window.chatManager.conversations = {};
              window.chatManager.currentConversationId = null;
              window.chatManager.selectedConversations.clear();
              window.chatManager.pendingMessage = null;
            }
            
            // Clear chat UI
            const chatBox = document.getElementById('chatBox');
            if (chatBox) chatBox.innerHTML = '';
            
            // Show empty state
            const emptyState = document.querySelector('.empty-state');
            if (emptyState) emptyState.style.display = 'flex';
            
            // Reset chat input
            const chatInput = document.getElementById('chatInput');
            if (chatInput) {
              chatInput.classList.remove('bottom');
              chatInput.classList.add('centered');
              const textarea = chatInput.querySelector('textarea');
              if (textarea) textarea.value = '';
            }
            
            // Clear sources
            const sourcesList = document.getElementById('sourcesList');
            if (sourcesList) {
              sourcesList.innerHTML = '<li class="placeholder">No sources yet.</li>';
            }
            
            // Clear sidebar
            const chatHistory = document.querySelector('.chat-history');
            if (chatHistory) {
              chatHistory.innerHTML = '<div class="no-chats">No chat history</div>';
            }
            
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

  // Add Enter key functionality to send message
textarea.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault(); // Prevent new line
        const sendEvent = new Event('click');
        sendBtn.dispatchEvent(sendEvent); // Trigger the send button click
    }
});

  // ensure sync at startup
  syncChatInputHeight();
});

// New chat button interactions are handled centrally in newchat.js so that
// chatManager can persist conversations before clearing the UI.
