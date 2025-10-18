// Initial state: An array of quote objects
let quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Work" },
  { text: "Strive not to be a success, but rather to be of value.", category: "Motivation" },
  { text: "If you can dreamit, you can achieve it.", category: "Inspiration" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", category: "Dreams" },
  { text: "Simplicity is the soul efficiency.", category: "Development" }
];

// Get references to the DOM elements we'll manipulate
const quoteDisplay  = document.getElementById('quoteDisplay');
const newQuoteButton = document.getElementById('newQuote');
const addQuoteFormContainer = document.getElementById('addQuoteForm');

function showRandomQuote() {
  // Get a random index
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  // Clear existing content in the display container
  quoteDisplay.innerHTML = '';

  // Advanced DOM: Create the new elements
  const quoteTextElement = document.createElement('p');
  quoteTextElement.id = 'quoteCategory';
  quoteTextElement.textContent = `"${quote.text}"`;

  const quoteCategoryElement = document.createElement('p');
  quoteCategoryElement.id = 'quoteCategory';
  quoteCategoryElement.textContent = 'Category: ${quote.catgory}';

  quoteDisplay.appendChild(quoteTextElement);
  quote.appendChild(quoteCategoryElement);
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

function addQuote() {
  // get values from the dynamically created inputs
  const newText = document.getElementById('newQuoteText').value.trim();
  const newCategory = document.getElementById('newQuoteCategory').value.trim();

  if (newText && newCategory) {
    // update the data (the quotes array)
    quotes.push({ text: newText, category: newCategory });

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

// intialization

// attach the event listener to the "show new quote" button
newQuoteButton.addEventListener('click', showRandomQuote);

// run the two main functions on paage load:
showRandomQuote();
createAddQuoteForm();