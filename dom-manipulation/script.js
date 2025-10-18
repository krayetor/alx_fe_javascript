
// Dynamic Quote Generator — single-file implementation.
// Storage keys
const LS_KEY = 'dqg_quotes_v1';
const LS_FILTER_KEY = 'dqg_lastFilter_v1';
const SESSION_LAST_QUOTE = 'dqg_lastQuoteIndex';

// Default quotes (used only if no saved data exists)
const defaultQuotes = [
  { text: "The only limit to our realization of tomorrow is our doubts of today.", category: 'inspiration' },
  { text: "Simplicity is the soul of efficiency.", category: 'productivity' },
  { text: "Write code as if the person who maintains it is a violent psychopath who knows where you live.", category: 'dev' },
  { text: "Small daily improvements are the key to staggering long-term results.", category: 'habit' },
];

let quotes = [];

// Initialize app
function init() {
  loadQuotes();
  populateCategories();

  // restore last filter
  const lastFilter = localStorage.getItem(LS_FILTER_KEY) || 'all';
  const select = document.getElementById('categoryFilter');
  select.value = lastFilter;

  // restore last viewed quote index from sessionStorage (if any)
  const lastIndex = sessionStorage.getItem(SESSION_LAST_QUOTE);
  if (lastIndex !== null) {
    const i = Number(lastIndex);
    if (!Number.isNaN(i) && quotes[i]) {
      displayQuote(quotes[i]);
      document.getElementById('lastViewed').textContent = `#${i}`;
    }
  }

      renderAllQuotesList();
    }

    // Load quotes from localStorage or use defaults
    function loadQuotes(){
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) { quotes = parsed; return; }
        }
      } catch(e){ console.warn('Failed to load saved quotes:', e); }
      quotes = [...defaultQuotes];
      saveQuotes();
    }

    function saveQuotes(){
      try { localStorage.setItem(LS_KEY, JSON.stringify(quotes)); }
      catch(e) { console.error('Failed to save quotes', e); }
      populateCategories();
      renderAllQuotesList();
    }

    function populateCategories(){
      const sel = document.getElementById('categoryFilter');
      const selected = sel.value || 'all';
      const categories = Array.from(new Set(quotes.map(q => q.category || 'uncategorized'))).sort();
      // clear options (except first)
      sel.innerHTML = '<option value="all">All Categories</option>';
      categories.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat;
        opt.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        sel.appendChild(opt);
      });
      // restore selection if possible
      if ([...sel.options].some(o => o.value === selected)) sel.value = selected;
    }

    function filterQuotes(){
      const sel = document.getElementById('categoryFilter');
      const value = sel.value;
      localStorage.setItem(LS_FILTER_KEY, value);
      renderAllQuotesList();
    }

    function getFilteredQuotes(){
      const filter = document.getElementById('categoryFilter').value || 'all';
      if (filter === 'all') return quotes;
      return quotes.filter(q => (q.category || 'uncategorized') === filter);
    }

    function showRandomQuote(){
      const list = getFilteredQuotes();
      if (!list.length){
        displayQuote({text: 'No quotes available for this category.', category: ''});
        return;
      }
      const idx = Math.floor(Math.random()*list.length);
      // we need actual index in quotes array to save as session info
      const globalIndex = quotes.indexOf(list[idx]);
      displayQuote(list[idx]);
      sessionStorage.setItem(SESSION_LAST_QUOTE, String(globalIndex));
      document.getElementById('lastViewed').textContent = `#${globalIndex}`;
    }

    function displayQuote(q){
      document.getElementById('quoteText').textContent = q.text;
      document.getElementById('quoteMeta').textContent = q.category ? `Category: ${q.category}` : '';
    }

    function addQuoteFromForm(){
      const txt = document.getElementById('newQuoteText');
      const cat = document.getElementById('newQuoteCategory');
      const text = txt.value && txt.value.trim();
      const category = cat.value && cat.value.trim().toLowerCase();
      if (!text) return alert('Please enter quote text.');
      if (!category) return alert('Please enter a category.');
      const newQ = { text, category };
      quotes.push(newQ);
      saveQuotes();
      txt.value = '';
      cat.value = '';
      populateCategories();
      // Show the newly added quote
      displayQuote(newQ);
    }

    // Render list of all quotes (respecting filter)
    function renderAllQuotesList(){
      const container = document.getElementById('allQuotesList');
      container.innerHTML = '';
      const list = getFilteredQuotes();
      if (!list.length) { container.innerHTML = '<div class="muted">No quotes to show.</div>'; return; }
      list.forEach(q => {
        const globalIndex = quotes.indexOf(q);
        const row = document.createElement('div');
        row.className = 'quote-row';
        row.innerHTML = `
          <div style="flex:1">
            <div style="font-weight:600">${escapeHtml(q.text)}</div>
            <div class="muted" style="font-size:0.85rem">#${globalIndex} — ${escapeHtml(q.category||'uncategorized')}</div>
          </div>
        `;
        const btns = document.createElement('div');
        btns.className = 'flex';
        const viewBtn = document.createElement('button');
        viewBtn.className = 'small';
        viewBtn.textContent = 'View';
        viewBtn.onclick = () => { displayQuote(q); sessionStorage.setItem(SESSION_LAST_QUOTE, String(globalIndex)); document.getElementById('lastViewed').textContent = `#${globalIndex}`; };
        const delBtn = document.createElement('button');
        delBtn.className = 'small';
        delBtn.textContent = 'Delete';
        delBtn.onclick = () => { if (confirm('Delete this quote?')) { quotes.splice(globalIndex,1); saveQuotes(); } };
        btns.appendChild(viewBtn);
        btns.appendChild(delBtn);
        row.appendChild(btns);
        container.appendChild(row);
      });
    }

    // Export quotes as JSON file
    function exportQuotesAsJson(){
      const dataStr = JSON.stringify(quotes, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'quotes.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    // Import JSON from file (expects array of objects {text, category})
    function importFromJsonFile(event){
      const file = event.target.files && event.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(e){
        try {
          const parsed = JSON.parse(e.target.result);
          if (!Array.isArray(parsed)) return alert('Imported JSON must be an array of quote objects.');
          // sanitize and append
          const sanitized = parsed.map(item => {
            return {
              text: (item.text || '').toString(),
              category: (item.category || 'uncategorized').toString().toLowerCase()
            };
          }).filter(it => it.text.trim());
          if (!sanitized.length) return alert('No valid quotes found in the file.');
          quotes.push(...sanitized);
          saveQuotes();
          alert(`Imported ${sanitized.length} quotes.`);
          // clear file input (so same file can be re-imported later if needed)
          event.target.value = '';
        } catch(err){
          console.error(err);
          alert('Failed to import JSON — file may be malformed.');
        }
      };
      reader.readAsText(file);
    }

    // small utility to escape text for innerHTML use
    function escapeHtml(str){
      return String(str).replace(/&/g, '&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }

    // initialize after DOM ready
    document.addEventListener('DOMContentLoaded', init);

