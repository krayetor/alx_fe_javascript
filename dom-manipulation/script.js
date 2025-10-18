// Initial state: An array of quote objects
let quotes = [];

// key for local storage
const localStorageKey = 'dynamicQuotes';
const localStorageFilterKey = 'lastSelectedFilter';
const sessionStorageKey = 'lastViewedQuote';

const SERVER_API_URL = 'https://jsonplaceholder.typicode.com/todos?_limit=10';
const SYNC_INTERVAL = 30000;

// Get references to the DOM elements we'll manipulate
const quoteDisplay  = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const addQuoteFormContainer = document.getElementById('addQuoteForm');
const categoryFilter = document.getElementById('categoryFilter');
const syncStatus = document.getElementById('syncStatus');

function mapServerDataTOQuotes(severData) {
  return severData.map(item => ({

    text: item.title,

    category: `Server-${item.userId % 3 === 0 ? 'Classic' : 'Modern'}`,

    id: `server-${item.id}`
  }));
}

async function syncWithServer() {
  try {
    syncStatus.textContent = 'Sync Status: Syncing... 🔄';

    const response = await fetch(SERVER_API_URL);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const serverData = await response.json();
    const serverQuotes = mapServerDataTOQuotes(serverData);

    const serverIds = new Set(serverData.map(q => q.id));

    let mergedQuotes = quotes.filter(q => !serverIds.has(q.id));

    mergedQuotes.push(...serverQuotes);

    const isDataChanged = mergedQuotes.length !== quotes.length;
    quotes = mergedQuotes;

    saveQuotes();
    populateCategories();
    filterQuotes();

    if (isDataChanged) {
      syncStatus.textContent = `Sync Status: Success! Data merged (${quoteDisplay.length} total). ✅`;
    } else {
      syncStatus.textContent = 'Sync Status: UP to date. 🟢';
    }
  } catch {
    console.error('Server sync failed:', error);
    syncStatus.textContent = 'Sync Stauts: Failed. Check connection. 🔴';
  }
}

// web storage integration
function loadQuotes() {
 
  const storedQuotes = localStorage.getItem(localStorageKey);
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

function saveQuotes() {

  quotes = quotes.map((q, index) => ({
    ...q,
    id: q.id || `local-${Date.now()}-${index}`
  }));

  // before saving it to localStorage.
  localStorage.setItem(localStorageKey, JSON.stringify(quotes)); 
}

function populateCategories() {

  const uniqueCategories = new Set(quotes.map(quote => quote.category));

  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  uniqueCategories.forEach(category => {
    const option = document.createElement('option');
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  const lastFilter = localStorage.getItem(localStorageFilterKey);
  if (lastFilter) {
    categoryFilter.value = lastFilter;
  }
}

function filterQuotes() {

  const selectedCategory = categoryFilter.value;

  localStorage.setItem(localStorageFilterKey, selectedCategory);

  const filteredQuotes = selectedCategory === 'all'
    ? quotes
    : quotes.filter(quote => quote.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = `<p id="quoteText">No quotes found for category: ${selectedCategory}.</p>`;
    return;
  }

  // Get a random index
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const quote = filteredQuotes[randomIndex];

  // Clear existing content in the display container
  quoteDisplay.innerHTML = '';

  // Advanced DOM: Create the new elements
  const quoteTextElement = document.createElement('p');
  quoteTextElement.id = 'quoteText';
  quoteTextElement.textContent = `"${quote.text}"`;

  const quoteCategoryElement = document.createElement('p');
  quoteCategoryElement.id = 'quoteCategory';
  quoteCategoryElement.textContent = `Category: ${quote.category}`;

  quoteDisplay.appendChild(quoteTextElement);
  quoteDisplay.appendChild(quoteCategoryElement);

  sessionStorageKey.setItem(sessionStorageKey, quote.textContent);
}

async function initializeApp() {
  
  loadQuotes();

  await syncWithServer();

  populateCategories();
  filterQuotes();

  newQuoteButton.addEventListener('click',filterQuotes);
  createAddQuoteForm();

  setInterval(syncWithServer, SYNC_INTERVAL);
}

initializeApp();