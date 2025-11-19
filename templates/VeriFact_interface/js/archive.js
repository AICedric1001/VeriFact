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

  // ARCHIVE SEARCH FUNCTIONALITY
  document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('archiveSearchInput');
    const searchBtn = document.getElementById('archiveSearchBtn');
    const archiveAccordion = document.getElementById('archiveAccordion');
    if (!searchInput || !searchBtn || !archiveAccordion) return;

    function performSearch() {
      const query = searchInput.value.trim().toLowerCase();
      const items = archiveAccordion.querySelectorAll('.accordion-item');
      if (query === '') {
        // Show all items if search is empty
        items.forEach(item => {
          item.style.display = '';
        });
        return;
      }
      items.forEach(item => {
        const title = item.querySelector('.item-title') ? item.querySelector('.item-title').textContent.toLowerCase() : '';
        const summary = item.querySelector('.sidebar-summary') ? item.querySelector('.sidebar-summary').textContent.toLowerCase() : '';
        if (title.includes(query) || summary.includes(query)) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    }

    searchBtn.addEventListener('click', performSearch);
    searchInput.addEventListener('input', performSearch);
  });
  