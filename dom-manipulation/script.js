    // ----------------------
    // Data model & storage 
    // ----------------------

    // Default sample quotes
    const DEFAULT_QUOTES = [
      { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Inspiration", author: "Franklin D. Roosevelt" },
      { text: "Simplicity is the soul of efficiency.", category: "Design", author: "Unknown" },
      { text: "Programs must be written for people to read, and only incidentally for machines to execute.", category: "Programming", author: "Harold Abelson" },
      { text: "Design is not just what it looks like and feels like. Design is how it works.", category: "Design", author: "Steve Jobs" }
    ];

    // Keys for storage
    const LS_KEY = 'dqg_quotes_v1';
    const SESSION_KEY_LAST = 'dqg_last_viewed';

    // In-memory quotes array
    let quotes = [];

    // ----------------------
    // Storage helpers
    // ----------------------
    function saveQuotes() {
      try {
        localStorage.setItem(LS_KEY, JSON.stringify(quotes));
      } catch (e) {
        console.error('Failed to save quotes to localStorage', e);
        alert('Unable to save quotes: localStorage quota exceeded or not available.');
      }
      renderCategoryOptions();
      renderQuoteList();
    }

    function loadQuotes() {
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            quotes = parsed;
            return;
          }
        }
      } catch (e) {
        console.warn('Could not parse stored quotes, falling back to defaults.', e);
      }
      // fallback
      quotes = DEFAULT_QUOTES.slice();
      saveQuotes();
    }

    // ----------------------
    // Utility helpers
    // ----------------------
    function pickRandom(arr) {
      if (!arr || arr.length === 0) return null;
      return arr[Math.floor(Math.random() * arr.length)];
    }

    function getUniqueCategories() {
      const s = new Set();
      quotes.forEach(q => { if (q.category) s.add(q.category); });
      return Array.from(s).sort();
    }

    // ----------------------
    // Rendering functions
    // ----------------------
    function renderCategoryOptions() {
      const sel = document.getElementById('categoryFilter');
      const current = sel.value || 'all';
      // clear
      sel.innerHTML = '<option value="all">— All Categories —</option>';
      getUniqueCategories().forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat;
        sel.appendChild(opt);
      });
      // restore selection if still available
      if ([...sel.options].some(o => o.value === current)) sel.value = current;
    }

    function renderQuoteDisplay(q) {
      const disp = document.getElementById('quoteDisplay');
      const meta = document.getElementById('quoteMeta');
      if (!q) {
        disp.textContent = 'No quote found for the selected category.';
        meta.textContent = '';
        return;
      }
      disp.innerHTML = `<blockquote style="margin:0;padding:0;font-size:1.2rem">“${escapeHtml(q.text)}”</blockquote>`;
      meta.textContent = `${q.author ? q.author + ' — ' : ''}${q.category || 'Uncategorized'}`;
      // store last viewed into sessionStorage
      sessionStorage.setItem(SESSION_KEY_LAST, JSON.stringify(q));
    }

    // Render the full list of quotes with edit/delete
    function renderQuoteList() {
      const container = document.getElementById('quoteList');
      container.innerHTML = '';
      quotes.forEach((q, idx) => {
        const item = document.createElement('div');
        item.className = 'quote-item';

        const left = document.createElement('div');
        left.innerHTML = `<div><strong>${escapeHtml(q.text)}</strong></div><div class="meta">${escapeHtml(q.author || '')} ${q.author ? '—' : ''} ${escapeHtml(q.category || '')}</div>`;

        const actions = document.createElement('div');
        actions.className = 'actions';

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => openEditModal(idx);

        const delBtn = document.createElement('button');
        delBtn.textContent = 'Delete';
        delBtn.onclick = () => {
          if (confirm('Delete this quote?')) {
            quotes.splice(idx, 1);
            saveQuotes();
          }
        };

        const showBtn = document.createElement('button');
        showBtn.textContent = 'Show';
        showBtn.onclick = () => renderQuoteDisplay(q);

        actions.appendChild(showBtn);
        actions.appendChild(editBtn);
        actions.appendChild(delBtn);

        item.appendChild(left);
        item.appendChild(actions);
        container.appendChild(item);
      });
    }

    // ----------------------
    // Safe small helper
    // ----------------------
    function escapeHtml(str) {
      if (typeof str !== 'string') return '';
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // ----------------------
    // Core interactive functions
    // ----------------------
    function showRandomQuote() {
      const sel = document.getElementById('categoryFilter');
      const category = sel.value;
      let pool = quotes;
      if (category && category !== 'all') pool = quotes.filter(q => q.category === category);
      const q = pickRandom(pool);
      renderQuoteDisplay(q);
    }

    // This function builds and injects an "Add Quote" form dynamically into the DOM
    function createAddQuoteForm(containerId = 'addQuoteFormContainer') {
      const container = document.getElementById(containerId);
      container.innerHTML = ''; // reset

      const form = document.createElement('form');
      form.onsubmit = (ev) => { ev.preventDefault(); addQuoteFromForm(form); };

      const textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.placeholder = 'Enter a new quote';
      textInput.name = 'text';
      textInput.required = true;
      textInput.style = 'width:60%';

      const authorInput = document.createElement('input');
      authorInput.type = 'text';
      authorInput.placeholder = 'Author (optional)';
      authorInput.name = 'author';

      const categoryInput = document.createElement('input');
      categoryInput.type = 'text';
      categoryInput.placeholder = 'Enter quote category';
      categoryInput.name = 'category';

      const submit = document.createElement('button');
      submit.type = 'submit';
      submit.textContent = 'Add Quote';

      form.appendChild(textInput);
      form.appendChild(document.createTextNode(' '));
      form.appendChild(authorInput);
      form.appendChild(document.createTextNode(' '));
      form.appendChild(categoryInput);
      form.appendChild(document.createTextNode(' '));
      form.appendChild(submit);

      container.appendChild(form);
    }

    function addQuoteFromForm(form) {
      const text = form.elements['text'].value.trim();
      const author = form.elements['author'].value.trim();
      const category = form.elements['category'].value.trim() || 'Uncategorized';
      if (!text) return alert('Quote text is required.');
      addQuote({ text, author, category });
      form.reset();
    }

    // addQuote accepts an object and updates the model + storage
    function addQuote(q) {
      // Basic validation
      if (!q || !q.text) return;
      quotes.push({ text: q.text, author: q.author || '', category: q.category || 'Uncategorized' });
      saveQuotes();
      // show the newly added quote
      renderQuoteDisplay(quotes[quotes.length - 1]);
    }

    // ----------------------
    // Import / Export JSON
    // ----------------------
    function exportQuotesToJson() {
      const dataStr = JSON.stringify(quotes, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quotes-export.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    function importFromJsonFile(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          const imported = JSON.parse(e.target.result);
          if (!Array.isArray(imported)) throw new Error('Invalid format - expected an array of quotes.');

          // Basic validation for each imported item
          const valid = imported.filter(item => item && typeof item.text === 'string');
          if (valid.length === 0) return alert('No valid quote objects found in the file.');

          // Merge without duplicates (simple heuristic: text + author)
          const existingSet = new Set(quotes.map(q => (q.text + '||' + (q.author || ''))));
          let added = 0;
          valid.forEach(item => {
            const key = (item.text || '') + '||' + (item.author || '');
            if (!existingSet.has(key)) {
              quotes.push({ text: item.text, author: item.author || '', category: item.category || 'Uncategorized' });
              existingSet.add(key);
              added++;
            }
          });

          saveQuotes();
          alert('Imported ' + added + ' new quotes.');
          // reset the input so the same file can be re-imported if desired
          event.target.value = '';
        } catch (err) {
          console.error(err);
          alert('Failed to import: ' + err.message);
        }
      };
      reader.readAsText(file);
    }

    // ----------------------
    // Edit modal (simple inline edit)
    // ----------------------
    function openEditModal(index) {
      const q = quotes[index];
      const newText = prompt('Edit quote text:', q.text);
      if (newText === null) return; // cancelled
      const newAuthor = prompt('Edit author (leave blank for none):', q.author || '');
      if (newAuthor === null) return;
      const newCategory = prompt('Edit category:', q.category || 'Uncategorized');
      if (newCategory === null) return;
      q.text = newText.trim() || q.text;
      q.author = (newAuthor || '').trim();
      q.category = (newCategory || '').trim() || 'Uncategorized';
      saveQuotes();
    }

    // ----------------------
    // Misc controls
    // ----------------------
    function clearLocalStorage() {
      if (!confirm('This will remove all saved quotes and restore defaults. Continue?')) return;
      localStorage.removeItem(LS_KEY);
      loadQuotes();
      renderCategoryOptions();
      renderQuoteList();
      alert('Local storage cleared — default quotes restored.');
    }

    // ----------------------
    // Initialization & wiring
    // ----------------------
    function init() {
      loadQuotes();
      renderCategoryOptions();
      createAddQuoteForm();
      renderQuoteList();

      // show last viewed if available in sessionStorage
      const last = sessionStorage.getItem(SESSION_KEY_LAST);
      if (last) {
        try { renderQuoteDisplay(JSON.parse(last)); } catch(e) { /* ignore */ }
      }

      document.getElementById('newQuote').addEventListener('click', showRandomQuote);
      document.getElementById('randomByCategory').addEventListener('click', showRandomQuote);
      document.getElementById('exportBtn').addEventListener('click', exportQuotesToJson);
      document.getElementById('importFile').addEventListener('change', importFromJsonFile);
      document.getElementById('clearStorage').addEventListener('click', clearLocalStorage);
      document.getElementById('saveLastViewed').addEventListener('click', () => {
        const displayed = sessionStorage.getItem(SESSION_KEY_LAST);
        if (!displayed) return alert('No quote has been viewed this session yet.');
        alert('Last viewed quote saved in this browser session.');
      });

      // Update categories when the filter changes
      document.getElementById('categoryFilter').addEventListener('change', () => {
        // optionally show a sample quote when switching categories
        // but we'll keep it simple: update options and keep displayed quote
        renderCategoryOptions();
      });

      // Expose functions for debugging in the console (optional)
      window.showRandomQuote = showRandomQuote;
      window.createAddQuoteForm = createAddQuoteForm;
      window.addQuote = addQuote;
      window.exportQuotesToJson = exportQuotesToJson;
      window.importFromJsonFile = importFromJsonFile;
    }

    // Run the initializer when DOM is ready
    document.addEventListener('DOMContentLoaded', init);