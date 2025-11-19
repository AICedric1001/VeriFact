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


  // Delete Selected button functionality
document.addEventListener('DOMContentLoaded', function() {
  const deleteAllBtn = document.getElementById('deleteSelectedChats');
  if (deleteAllBtn) {
    deleteAllBtn.addEventListener('click', function() {
      const checkedBoxes = document.querySelectorAll('.accordion-item .checkbox input:checked');

      if (checkedBoxes.length > 0) {
        // Custom confirmation dialog
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

        const yesBtn = confirmationBox.querySelector('.confirm-yes');
        const noBtn = confirmationBox.querySelector('.confirm-no');
        if (yesBtn) yesBtn.focus();

        yesBtn.addEventListener('click', () => {
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

        if (noBtn) {
          noBtn.addEventListener('click', () => {
            confirmationBox.remove();
          });
        }

        // Close on Escape key
        const escHandler = (e) => {
          if (e.key === 'Escape') {
            confirmationBox.remove();
            document.removeEventListener('keydown', escHandler);
          }
        };
        document.addEventListener('keydown', escHandler);

      } else {
        showNotification('Please select at least one item to delete.', 'warning');
      }
    });
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