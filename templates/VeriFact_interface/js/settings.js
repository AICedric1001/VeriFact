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

    // Function to show custom notifications
    function showNotification(message, type = 'info') {
      const notificationContainer = document.getElementById('notificationContainer');
      if (!notificationContainer) {
        console.error('Notification container not found');
        return;
      }

      const notification = document.createElement('div');
      notification.classList.add('notification', `notification-${type}`);
      notification.innerHTML = `
        <div class="notification-content">
          ${message}
        </div>
      `;

      notificationContainer.appendChild(notification);

      // Automatically hide after 3 seconds
      setTimeout(() => {
        notification.classList.add('hide');
        notification.addEventListener('transitionend', () => {
          notification.remove();
        });
      }, 3000);
    }

    // Send feedback functionality
    if (sendFeedbackBtn) {
      sendFeedbackBtn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const feedback = feedbackTextarea.value.trim();
        if (feedback === '') {
          showNotification('Please enter your feedback before sending.', 'warning');
          feedbackTextarea.focus();
          return;
        }
        if (feedback.length < 10) {
          showNotification('Please provide more detailed feedback (at least 10 characters).', 'warning');
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