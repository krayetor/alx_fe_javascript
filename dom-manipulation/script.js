// Initial state: An array of quote objects
let quotes = [];

// key for local storage
const localStorageKey = 'dynamicQuotes';
const localStorageFilterKey = 'lastSelectedFilter';
const sessionStorageKey = 'lastViewedQuote';

// Get references to the DOM elements we'll manipulate
const quoteDisplay  = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const addQuoteFormContainer = document.getElementById('addQuoteForm');
const categoryFilter = document.getElementById('categoryFilter');


// web storage integration
function loadQuotes() {
  const defaultQuotes = [
    { text: "The only way to do great work is to love what you do.", category: "Work" },
    { text: "Strive not to be a success, but rather to be of value.", category: "Motivation" },
    { text: "If you can dream it, you can achieve it.", category: "Inspiration" },
    { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
    { text: "Simplicity is the soul efficiency.", category: "Development" }
  ];

  const storedQuotes = localStorage.getItem(localStorageKey);
  quotes = storedQuotes ? JSON.parse(storedQuotes) : defaultQuotes;
}

function saveQuotes() {
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

function addQuote() {
  // get values from the dynamically created inputs
  const newText = document.getElementById('newQuoteText').value.trim();
  const newCategory = document.getElementById('newQuoteCategory').value.trim();

  if (newText && newCategory) {
    // update the data (the quotes array)
    quotes.push({ text: newText, category: newCategory });

    saveQuotes();

    populateCategories();

    // update the DOM (clear inputs)
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';

    categoryFilter.value = newCategory;
    filterQuotes();

    alert(`Quote added and filter set to ${newCategory}!`)
  } else {
    alert("Please enter both a quote and a category!");
  }
}

function createAddQuoteForm() {
  // prevent the form from being created multiple times
  if (addQuoteFormContainer.innerHTML !== '') return;

  // advanced DOM: Create a container for the form input and button
  const formDiv = document.createElement('div');

  // advanced DOM:create  the quote text input field
  const textInput = document.createElement('input');
  textInput.id = 'newQuoteText';
  textInput.type = 'text';
  textInput.placeholder = 'Enter a new quote';

  const categoryInput = document.createElement('input');
  categoryInput.id = 'newQuoteCategory';
  categoryInput.type = 'text';
  categoryInput.placeholder = 'Enter quote Category';

  // create the add quote button
  const addButton = document.createElement('button');
  addButton.textContent = 'Add Quote';
  // attaching the 'addQuote' function directly here!
  addButton.onclick = addQuote;

  // append all new elements
  formDiv.appendChild(textInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addButton);

  // inject the entire form into the main container
  addQuoteFormContainer.appendChild(formDiv);
}

function exportToJsonFile() {
  // convert the quote to a sJSON string
  const dataStr = JSON.stringify(quotes, null, 2);

  // advanced DOM: create a blob (binary large object) of type JSON
  const blob = new Blob([dataStr], { type: 'application/json' });

  // Create a temporary url for the blob
  const url = URL.createObjectURL(blob);

  // create a temporary download link
  const link = document.createElement('a');
  link.href = url; 
  link.download = 'quotes_export.json';

  // simulate a click on the link to start the download
  document.body.appendChild(link);
  link.click();

  // clean up the temporary elements and url
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  alert('Quotes exported successfully!');
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();

  fileReader.onload = function(event) {
    try {
      // parse the json string from the file content
      const importedQuotes = JSON.parse(event.target.result);

      quotes.push(...importedQuotes);

      saveQuotes();

      showRandomQuote();

      alert(`Quotes imported successfully! Total quotes now: ${quotes.length}`);
    } catch {
      alert('Error importing filr. Please ensure it is a valid JSON format.');
      console.error(e);
    }
  };

  if (event.target.file.length > 0) {
    fileReader.readAsText(event.target.files[0]);
  }
}

// intialization

loadQuotes();

populateCategories();

// attach the event listener to the "show new quote" button
newQuoteButton.addEventListener('click', filterQuotes);

// run the two main functions on paage load:
createAddQuoteForm();

filterQuotes();