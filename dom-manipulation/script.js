// Initial state: An array of quote objects
let quotes = [];

// key for local storage
const localStorageKey = 'dynamicQuotes';
const localStorageFilterKey = 'lastSelectedFilter';
const sessionStorageKey = 'lastViewedQuote';

const SERVER_API_URL = 'https://jsonplaceholder.typicode.com/posts?_limit=10';
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

    category: `Post Title: ${item.title.substring(0, 15)}...`,

    id: `server-${item.id}`
  }));
}

async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_API_URL);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const serverData = await response.json();
    return mapServerDataTOQuotes(serverData);
  } catch {
    console.error('Server fetch failed:', error);
    throw  error;
  }
}

async function syncQuotes() {
   syncStatus.textContent = 'Sync Status: Syncing... 🔄';

  try {

    const serverQuotes = await fetchQuotesFromServer();

    const serverIds = new Set(serverQuotes.map(q => q.id));

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

async function addQuote() {
  const newText = document.getElementById('newQuoteText').value.trim();
  const newCategory = document.getElementById('newQuoteCategory').value.trim();

  if (newText && newCategory) {
    // prepare the new quote object
    const newQuote = {
      text: newText,
      category: newCategory,
      id: `local-${Date.now()}` // temporary local ID
    };

    // 1. simulate POST request to the server
    try {
      const postResponse = await fetch('https://jsonplaceholder.typicode.com/posts', {
        // required: set the request method to POST
        method: 'POST',
        // required: specify that we are sending JSON data
        headers: {
          'Content-Type': 'application/json',
        },
        // send the data as a string
        body: JSON.stringify({
          title: newText,   // map text to 'title' for the mock API
          userId: 1,        // required by the mock API
        }),
      });

      // note: in a real quote app, you would use the server's response to update the local ID
      // for now, we just ensure the request was successful
      if (postResponse.ok) {
        console.log('Quote successfully posted to mock server.');
        syncStatus.textContent = 'Sync Status: Quote posted. ✅';
      } else {
        console.warn('Quote posted locally, but server response failed.', postResponse.status);
        syncStatus.textContent = 'Sync Status: Post failed (local saved). ⚠️';
      }
    } catch (error) {
      console.error('Error during Post request:', error);
      syncStatus.textContent = 'Sync Status: Post failed (local saved). ⚠️';
    }

    // 2. update the local state
    quotes.push(newQuote);

    saveQuotes();
    populateCategories();

    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';

    categoryFilter.value = newCategory;
    filterQuotes();

    alert(`Quote added and filter set to ${newCategory}!`);
  } else {
    alert("Please enter both quote and a category!");
  }
}

function createAddQuoteForm() {
  if (addQuoteFormContainer.innerHTML !== '') return;

  const formDiv = document.createElement('div');
  const textInput = document.createElement('input');
  textInput.id = 'newQuoteText';
  textInput.type = 'text';
  textInput.placeholder = 'Enter a new quote';

  const categoryInput = document.createElement('input');
  categoryInput.id = 'newQuoteCategory';
  categoryInput.type = 'text';
  categoryInput.placeholder = 'Enter quote Category';
  
  const addButton = document.createElement('button');
  addButton.textContent = 'Add Quote';
  addButton.onclick = addQuote;

  formDiv.appendChild(textInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addButton);

  addQuoteFormContainer.appendChild(formDiv);
}

function exportToJsonFile() {

  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'quotes_export.json';
  document.body.appendChild(link);

  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  alert('Quotes exported successfully!');
}

function importFromJsonFile() {
  const fileReader = new FileReader();
  fileReader.onload = function(event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      quotes.push(...importedQuotes);

      saveQuotes();
      populateCategories();
      filterQuotes();

      alert(`Quotes imported successfully! Total quotes now: ${quotes.length}`);
    } catch (e) {
      alert('Error importing file. Please ensure it is a valid JSON format.');
      console.error(e);
    }
  };
  if (event.target.files && event,target.files.length > 0) {
    fileReader.readAsText(event.target.files[0]);
  }
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