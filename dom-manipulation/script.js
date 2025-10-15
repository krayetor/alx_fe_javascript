// Array of quotes objects
let quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "In the middle of every difficulty lies opportunity.", category: "Wisdom" },
    { text: "Creativity is intelligence having fun.", category: "Inspiration" },
    { text: "AI will never replace developers. It'll just make debugging twice as confusing.", category: "Inspiration"},
];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const addQuoteBtn = document.getElementById("addQuoteBtn");

//  Functions to show a random quote
function showRandomQuote() {
    if (quotes.length === 0) {
        quoteDisplay.innerHTML = "<p>No quotes available. Please add one!</p>";
        return;
    }

    const randomIndex = Math.floor(Math.random() * quotes.length);
    const { text, category } = quotes[randomIndex];

    // Clear old quote
    quoteDisplay.innerHTML = "";

    // Create quote elements dynamically
    const quoteTextEl = document.createElement("p");
    quoteTextEl.textContent = `${text}"`;

    const categoryEl = document.createElement("p");
    categoryEl.className = "category";
    categoryEl.textContent = `Category: ${category}`;

    // Append new elements
    quoteDisplay.appendChild(quoteTextEl);
    quoteDisplay.appendChild(categoryEl);
}

// Function to add a new quote dynamically
function addQuote() {
    const newQuoteText = document.getElementById("newQuoteText").value.trim();
    const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

    if (!newQuoteText || !newQuoteCategory) {
        alert("Please enter both a quote and a category.");
        return;
    }

    // Add new quote to the array
    quotes.push({ text: newQuoteText, category: newQuoteCategory });

    // Clear inputs
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";

    alert("New quote added successfully!");
}

// Event listeners
newQuoteBtn.addEventListener("click", showRandomQuote);
addQuoteBtn.addEventListener("click", addQuote);

// Display a quote when the page loads
showRandomQuote();