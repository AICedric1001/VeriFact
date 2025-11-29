//SOURCES
  const SOURCE_DOMAIN_FALLBACKS = [
    'reuters.com',
    'associatedpress.com',
    'example.com',
    'factcheck.org',
    'who.int'
  ];

  function buildSourcesForTopic(topic = '') {
    const safeTopic = topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'reference';

    return SOURCE_DOMAIN_FALLBACKS.map((domain, index) => ({
      label: `${domain} — reference ${index + 1}`,
      url: `https://${domain}/search?q=${encodeURIComponent(safeTopic)}`
    }));
  }

  function updateSourcesList(sources = []) {
    const list = document.getElementById('sourcesList');
    if (!list) return;

    list.innerHTML = '';

    if (Array.isArray(sources)) {
      window.__verifactLatestSources = sources.map(source => {
        if (!source || typeof source !== 'object') return source;
        return { ...source };
      });
    } else {
      window.__verifactLatestSources = [];
    }

    if (!sources.length) {
      const placeholder = document.createElement('li');
      placeholder.className = 'placeholder';
      placeholder.textContent = 'No sources yet.';
      window.__verifactLatestSources = [];
      list.appendChild(placeholder);
      return;
    }

    sources.forEach((source) => {
      const item = document.createElement('li');
    if (source.label) {
      item.dataset.label = source.label;
    } else {
      delete item.dataset.label;
    }
    if (source.url) {
      item.dataset.url = source.url;
    } else {
      delete item.dataset.url;
    }
    if (source.is_trusted !== undefined) {
      item.dataset.isTrusted = source.is_trusted ? 'true' : 'false';
    } else {
      delete item.dataset.isTrusted;
    }
      if (source.url) {
        const link = document.createElement('a');
        link.href = source.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        // Add visual trust indicator if available
        if (source.is_trusted !== undefined) {
          const icon = document.createElement('i');
          icon.className = source.is_trusted ? 'fa fa-check-circle' : 'fa fa-exclamation-triangle';
          icon.style.cssText = source.is_trusted 
            ? 'color:#4caf50; margin-right: 8px;' 
            : 'color:#e53935; margin-right: 8px;';
          icon.title = source.is_trusted ? 'Trusted Source' : 'Unverified Source';
          link.appendChild(icon);
        }
        // Extract domain from URL for display format: "sitename - title"
        let displayText = source.label;
        try {
          const urlObj = new URL(source.url);
          const domain = urlObj.hostname.replace('www.', ''); // Remove www. prefix
          const title = source.label || source.title || 'Untitled';
          displayText = `${domain} - ${title}`;
        } catch (e) {
          // If URL parsing fails, just use the label as-is
          displayText = source.label || source.title || 'Unknown Source';
        }
        // Add text content
        link.appendChild(document.createTextNode(displayText));
        item.appendChild(link);
      } else {
        item.textContent = source.label;
      }
      list.appendChild(item);
    });
  }