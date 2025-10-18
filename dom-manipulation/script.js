// Initial state: An array of quote objects
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Work" },
  { text: "Strive not to be a success, but rather to be of value.", category: "Motivation" },
  { text: "If you can dream it, you can achieve it.", category: "Inspiration" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
  { text: "Simplicity is the soul efficiency.", category: "Development" }
];

// key for local storage
const localStorageKey = 'dynamicQuotes';
const sessionStorageKey = 'lastViewedQuote';

// Get references to the DOM elements we'll manipulate
const quoteDisplay  = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const addQuoteFormContainer = document.getElementById('addQuoteForm');


// web storage integration
function loadQuotes() {
  const storedQuotes = localStorage.getItem(localStorageKey);

  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

function saveQuotes() {
  // before saving it to localStorage.
  localStorage.setItem(localStorageKey, JSON.stringify(quotes)); 
}

function saveLastViewedQuote() {
  sessionStorage.setItem(sessionStorageKey, quoteText);
  console.log(`Session Storage: Last viewed quote saved: ${quoteText}`);
}


function showRandomQuote() {
  if (quotes.length === 0) {
    quoteDisplay.innerHTML = '<p id="quoteText">No quotes available. Add one!</p>';
    return;
  }

  // Get a random index
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  // Clear existing content in the display container
  quoteDisplay.innerHTML = '';

  // Advanced DOM: Create the new elements
  const quoteTextElement = document.createElement('p');
  quoteTextElement.id = 'quoteText';
  quoteTextElement.textContent = `"${quote.text}"`;

  const quoteCategoryElement = document.createElement('p');
  quoteCategoryElement.id = 'quoteCategory';
  quoteCategoryElement.textContent = 'Category: ${quote.catgory}';

  quoteDisplay.appendChild(quoteTextElement);
  quote.appendChild(quoteCategoryElement);

  saveLastViewedQuote(quote.text);
}

function addQuote() {
  // get values from the dynamically created inputs
  const newText = document.getElementById('newQuoteText').value.trim();
  const newCategory = document.getElementById('newQuoteCategory').value.trim();

  if (newText && newCategory) {
    // update the data (the quotes array)
    quotes.push({ text: newText, category: newCategory });

    saveQuotes();

    // update the DOM (clear inputs)
    document.getElementById('newQuoteText').value = '';
    document.getElementById('newQuoteCategory').value = '';

    console.log("New quote added successfully! Array size:", quotes.length);

    //  optional: show the newly added quote immediately
    showRandomQuote();
    alert(`Quote added! Your app now has ${quotes.length}`)
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
  category.placeholder = 'Enter quote Category';

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

// attach the event listener to the "show new quote" button
newQuoteButton.addEventListener('click', showRandomQuote);

// run the two main functions on paage load:
showRandomQuote();
createAddQuoteForm();