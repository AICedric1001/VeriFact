  // ARCHIVE MODAL FUNCTIONALITY (populate from sidebar, open item, delete, clear)
  document.addEventListener('DOMContentLoaded', function() {
    const openBtn = document.getElementById('openArchiveModal');
    const archiveModal = document.getElementById('archiveModal');
    const archiveAccordion = document.getElementById('archiveAccordion');
    const archiveClearAll = document.getElementById('archiveClearAll');
    const exportAllBtn = document.getElementById('archiveExportAll');
    const exportSelectedBtn = document.getElementById('archiveExportSelected');
    const selectAllCheckbox = document.getElementById('archiveSelectAll');
    const selectedArchiveIds = new Set();

    if (!openBtn || !archiveModal || !archiveAccordion) return;

    const escapeForDoc = (text = '') => {
      if (typeof window !== 'undefined' && typeof window.escapeHtml === 'function') {
        return window.escapeHtml(text);
      }
      const div = document.createElement('div');
      div.textContent = text ?? '';
      return div.innerHTML;
    };

    const escapeAttr = (text = '') => {
      const div = document.createElement('div');
      div.textContent = text ?? '';
      return div.innerHTML.replace(/'/g, '&#39;');
    };

    const escapeAttrForDoc = (text = '') => escapeForDoc(text).replace(/'/g, '&#39;');

    const formatSourceListItem = (source) => {
      if (!source) return '';
      if (typeof source === 'string') {
        return `<li>${escapeHtml(source)}</li>`;
      }
      const label = escapeHtml(source.label || source.url || 'Source');
      if (source.url) {
        return `<li><a href="${escapeAttr(source.url)}" target="_blank" rel="noopener">${label}</a></li>`;
      }
      return `<li>${label}</li>`;
    };

    const formatSourceForDoc = (source) => {
      if (!source) return '';
      if (typeof source === 'string') {
        return `<li>${escapeForDoc(source)}</li>`;
      }
      const label = escapeForDoc(source.label || source.url || 'Source');
      if (source.url) {
        return `<li><a href="${escapeAttrForDoc(source.url)}">${label}</a></li>`;
      }
      return `<li>${label}</li>`;
    };

    const getArchivedResponses = () => {
      if (typeof window.readArchivedResponses === 'function') {
        return window.readArchivedResponses();
      }
      try {
        const raw = localStorage.getItem('verifact_archived_responses');
        return raw ? JSON.parse(raw) : [];
      } catch (err) {
        console.warn('Failed to read archived responses (fallback)', err);
        return [];
      }
    };

    const persistArchivedResponses = (entries = []) => {
      if (typeof window.writeArchivedResponses === 'function') {
        window.writeArchivedResponses(entries);
        return;
      }
      localStorage.setItem('verifact_archived_responses', JSON.stringify(entries || []));
    };

    function updateExportButtonsState() {
      const archived = getArchivedResponses();
      if (exportAllBtn) {
        exportAllBtn.disabled = archived.length === 0;
      }
      if (exportSelectedBtn) {
        exportSelectedBtn.disabled = selectedArchiveIds.size === 0;
      }
      if (selectAllCheckbox) {
        const hasItems = archived.length > 0;
        selectAllCheckbox.disabled = !hasItems;
        if (!hasItems) {
          selectAllCheckbox.checked = false;
          selectAllCheckbox.indeterminate = false;
        }
      }
    }

    function syncSelectAllCheckbox() {
      if (!selectAllCheckbox) return;
      const checkboxes = archiveAccordion.querySelectorAll('.archive-select');
      const total = checkboxes.length;
      if (!total) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.disabled = true;
        return;
      }
      selectAllCheckbox.disabled = false;
      if (selectedArchiveIds.size === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
        return;
      }
      if (selectedArchiveIds.size === total) {
        selectAllCheckbox.checked = true;
        selectAllCheckbox.indeterminate = false;
      } else {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = true;
      }
    }

    function exportResponsesToWord(entries, filenamePrefix = 'VeriFact-archive') {
      if (!entries || entries.length === 0) {
        alert('No archived responses to export.');
        return;
      }

      const sections = entries.map((entry, index) => {
        const title = escapeForDoc(entry.title || `Response ${index + 1}`);
        const summary = escapeForDoc(entry.summary || 'No summary provided.').replace(/\n/g, '<br>');
        const timestamp = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Timestamp unavailable';
        const sources = Array.isArray(entry.sources) && entry.sources.length > 0
          ? `<ol>${entry.sources.map(src => formatSourceForDoc(src)).join('')}</ol>`
          : '<p><em>No sources saved.</em></p>';

        return `
          <article style="margin-bottom:24px;">
            <h2 style="margin-bottom:6px;">${title}</h2>
            <p style="font-size:12px; color:#555;"><strong>Saved:</strong> ${escapeForDoc(timestamp)}</p>
            <p>${summary}</p>
            <h3 style="margin-bottom:4px;">Sources</h3>
            ${sources}
          </article>
          <hr style="margin:24px 0; border:none; border-top:1px solid #ccc;">
        `;
      }).join('');

      const docContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>VeriFact Archived Responses</title>
            <style>
              body { font-family: Arial, Helvetica, sans-serif; line-height: 1.5; color: #222; }
              h1 { text-align:center; margin-bottom: 24px; }
              ol { padding-left: 20px; }
            </style>
          </head>
          <body>
            <h1>VeriFact Archived Responses</h1>
            ${sections}
          </body>
        </html>
      `;

      const blob = new Blob(['\ufeff', docContent], { type: 'application/msword' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.href = url;
      link.download = `${filenamePrefix}-${timestamp}.doc`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }

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
      selectedArchiveIds.clear();
      const archived = getArchivedResponses();
      updateExportButtonsState();
      
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

        const sourcesHtml = (archiveData.sources || []).map(source => formatSourceListItem(source)).join('');

        item.innerHTML = `
          <div class="accordion-header">
            <label class="archive-select-wrapper" aria-label="Select archived response">
              <input class="archive-select" type="checkbox" data-archive-id="${id}" aria-label="Select archived response" />
            </label>
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

      syncSelectAllCheckbox();
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
          // Remove from storage
          const archived = getArchivedResponses();
          const filtered = archived.filter(item => item.id !== id);
          persistArchivedResponses(filtered);
          selectedArchiveIds.delete(id);
          // Remove from modal
          const modalItem = archiveAccordion.querySelector(`.accordion-item[data-archive-id="${id}"]`);
          if (modalItem && modalItem.parentNode) modalItem.parentNode.removeChild(modalItem);
          if (!archiveAccordion.querySelector('.accordion-item')) {
            archiveAccordion.innerHTML = '<div class="placeholder" style="padding:12px">No archived responses.</div>';
          }
          confirmationBox.remove();
          updateExportButtonsState();
          syncSelectAllCheckbox();
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
          persistArchivedResponses([]);
          archiveAccordion.innerHTML = '<div class="placeholder" style="padding:12px">No archived responses.</div>';
          selectedArchiveIds.clear();
          updateExportButtonsState();
          syncSelectAllCheckbox();
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

    document.addEventListener('verifact:archive-user-changed', () => {
      selectedArchiveIds.clear();
      updateExportButtonsState();
      if (archiveModal.classList.contains('open')) {
        populateArchiveList();
      }
    });

    archiveAccordion.addEventListener('change', function(e) {
      const checkbox = e.target.closest('.archive-select');
      if (!checkbox) return;
      const id = checkbox.dataset.archiveId;
      if (!id) return;
      if (checkbox.checked) {
        selectedArchiveIds.add(id);
      } else {
        selectedArchiveIds.delete(id);
      }
      updateExportButtonsState();
      syncSelectAllCheckbox();
    });

    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', function() {
        const checkboxes = archiveAccordion.querySelectorAll('.archive-select');
        const shouldSelectAll = selectAllCheckbox.checked;
        selectAllCheckbox.indeterminate = false;
        checkboxes.forEach(cb => {
          cb.checked = shouldSelectAll;
          const id = cb.dataset.archiveId;
          if (!id) return;
          if (shouldSelectAll) {
            selectedArchiveIds.add(id);
          } else {
            selectedArchiveIds.delete(id);
          }
        });
        updateExportButtonsState();
      });
    }

    if (exportAllBtn) {
      exportAllBtn.addEventListener('click', function() {
        const archived = getArchivedResponses();
        exportResponsesToWord(archived, 'VeriFact-archive-all');
      });
    }

    if (exportSelectedBtn) {
      exportSelectedBtn.addEventListener('click', function() {
        if (selectedArchiveIds.size === 0) {
          alert('Select at least one archived response to export.');
          return;
        }
        const archived = getArchivedResponses();
        const selected = archived.filter(item => selectedArchiveIds.has(item.id));
        exportResponsesToWord(selected, 'VeriFact-archive-selected');
      });
    }

    updateExportButtonsState();
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
  