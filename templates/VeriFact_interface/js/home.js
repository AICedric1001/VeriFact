 // Send Message
          function sendMessage() {
            const input = document.getElementById("userInput");
            const chatBox = document.getElementById("chatBox");
            const chatInput = document.getElementById("chatInput");

            if (input.value.trim() === "") return;

            // Move chat input to bottom if centered
            chatInput.classList.remove("centered");
            chatInput.classList.add("bottom");

            // User bubble
            const userMsg = document.createElement("div");
            userMsg.className = "user-message";
            userMsg.innerText = input.value;
            chatBox.appendChild(userMsg);

            // Bot accordion bubble - generate 5 bot messages
            for (let i = 1; i <= 5; i++) {
              setTimeout(() => {
                const botMsg = document.createElement("div");
                botMsg.className = "bot-message";
                botMsg.innerHTML = `
                  <div class="accordion-item">
                    <div class="accordion-header">
                      <div class="url-row">
                        <strong>URL:</strong> 
                        <a href="https://example.com/${i}" target="_blank">example.com/${i}</a>
                        <i class="fa fa-check-circle"></i>
                      </div>
                      <button class="accordion-toggle"><i class="fa fa-angle-double-down"></i></button>
                    </div>
                    <div class="accordion-content">
                      <p>This is summary #${i} of the article. It explains whether the information is accurate or misleading.</p>
                    </div>
                  </div>
                `;
                chatBox.appendChild(botMsg);
                chatBox.scrollTop = chatBox.scrollHeight; // auto scroll

                // Enable toggle for this specific accordion
                const toggleBtn = botMsg.querySelector(".accordion-toggle");
                const accordionItem = botMsg.querySelector(".accordion-item");
                toggleBtn.addEventListener("click", () => {
                  accordionItem.classList.toggle("open");
                });

              }, i * 500); // delay each bot message by 0.5 sec
            }

            // Clear input
            input.value = "";
            input.style.height = "auto"; // reset textarea height
          }

          //Accordion Card
        (function(){
            var items = document.querySelectorAll('.accordion-item');
            items.forEach(function(item){
                var toggle = item.querySelector('.accordion-toggle');
                if (!toggle) return;
                toggle.addEventListener('click', function(){
                    item.classList.toggle('open');
                    var isOpen = item.classList.contains('open');
                    toggle.setAttribute('aria-expanded', isOpen);
                });
            });
        })();



        // Settings dropdown (topbar)
        document.getElementById("settingsBtn").addEventListener("click", function() {
          document.getElementById("settingsMenu").classList.toggle("show");
        });
        window.addEventListener("click", function(e) {
          if (!e.target.closest(".dropdown")) {
            document.getElementById("settingsMenu").classList.remove("show");
          }
        });

        document.querySelectorAll(".dropdown .icon-btn").forEach(btn => {
          btn.addEventListener("click", (e) => {
            const parent = btn.closest(".dropdown");
            parent.classList.toggle("open");
            document.querySelectorAll(".dropdown").forEach(d => {
              if (d !== parent) d.classList.remove("open");
            });
            e.stopPropagation();
          });
        });
        document.addEventListener("click", () => {
          document.querySelectorAll(".dropdown").forEach(d => d.classList.remove("open"));
        });



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

        // Tab functionality
        document.querySelectorAll('.tabs .tab').forEach((tab, idx) => {
            tab.addEventListener('click', function() {
                // Remove active from all tabs
                document.querySelectorAll('.tabs .tab').forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-selected', 'true');
                });
                // Set active on clicked tab
                tab.classList.add('active');
                tab.setAttribute('aria-selected', 'false');

                // Show/hide content
                document.getElementById('history-content').style.display = idx === 0 ? '' : 'none';
                document.getElementById('chat-content').style.display = idx === 1 ? '' : 'none';
            });
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
            document.querySelector('.accuracy-bar .true').style.width = truePercent + "%";
            document.querySelector('.accuracy-bar .false').style.width = falsePercent + "%";
            document.querySelector('.accuracy-bar .true-label').textContent = truePercent + "%";
            document.querySelector('.accuracy-bar .false-label').textContent = falsePercent + "%";
          }


          // Reset All button functionality
          document.addEventListener('DOMContentLoaded', function() {
            const resetAllBtn = document.querySelector('button[aria-label="Reset All"]');
            if (resetAllBtn) {
              resetAllBtn.addEventListener('click', function() {
                
                  const chatBox = document.getElementById('chatBox');
                  const chatInput = document.getElementById('chatInput');
                  
                  // Clear all messages
                  chatBox.innerHTML = '';
                  
                  // Reset chat input to centered position
                  chatInput.classList.remove('bottom');
                  chatInput.classList.add('centered');
                  
                  // Reset accuracy bar
                  updateAccuracy(0, 0);
                  
                  showNotification('Chat reset successfully!', 'success');
                
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
                  // Create a custom confirmation popup
                  const confirmationBox = document.createElement('div');
                  confirmationBox.className = 'custom-confirmation';
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

                  // Handle Yes
                  confirmationBox.querySelector('.confirm-yes').addEventListener('click', () => {
                    checkedBoxes.forEach(checkbox => {
                      const accordionItem = checkbox.closest('.accordion-item');
                      accordionItem.remove();
                    });

                    // Reset "select all" checkbox
                    const selectAllCheckbox = document.querySelector('.section-header .checkbox input');
                    if (selectAllCheckbox) {
                      selectAllCheckbox.checked = false;
                      selectAllCheckbox.indeterminate = false;
                    }

                    showNotification(`${checkedBoxes.length} item(s) deleted successfully!`, 'success');
                    confirmationBox.remove();
                  });

                  // Handle No
                  confirmationBox.querySelector('.confirm-no').addEventListener('click', () => {
                    confirmationBox.remove();
                  });

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
              const accordionItems = document.querySelectorAll('#history-content .accordion-item');
              
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
            const selectAllCheckbox = document.querySelector('.section-header .checkbox input');
            const itemCheckboxes = document.querySelectorAll('.accordion-item .checkbox input');
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
              const checkedBoxes = document.querySelectorAll('.accordion-item .checkbox input:checked');
              
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
              const checkedBoxes = document.querySelectorAll('.accordion-item .checkbox input:checked');
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
              const checkedBoxes = document.querySelectorAll('.accordion-item .checkbox input:checked');
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
              const selectAllCheckbox = document.querySelector('.section-header .checkbox input');
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

                // Simulate save operation
                setTimeout(() => {
                  const chatBox = document.getElementById('chatBox');
                  const chatMessages = chatBox.querySelectorAll('.bot-message, .user-message');

                  if (chatMessages.length === 0) {
                    removeLoading();
                    showNotification('No messages to save!', 'warning'); // 👈 replaced alert
                    return;
                  }

                  // Create a data object with all chat messages
                  const chatData = {
                    timestamp: new Date().toISOString(),
                    messages: Array.from(chatMessages).map(msg => ({
                      type: msg.classList.contains('user-message') ? 'user' : 'bot',
                      content: msg.textContent || msg.innerText,
                      timestamp: new Date().toISOString()
                    }))
                  };

                  // Save to localStorage (you could also send to server)
                  const savedChats = JSON.parse(localStorage.getItem('verifact_chats') || '[]');
                  savedChats.push(chatData);
                  localStorage.setItem('verifact_chats', JSON.stringify(savedChats));

                  removeLoading();
                  showNotification('Chat saved successfully!', 'success');
                }, 1000); // Simulate network delay
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