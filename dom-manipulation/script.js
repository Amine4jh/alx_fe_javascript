// Local Storage Keys
const QUOTES_KEY = "dynamicQuotes";
const LAST_QUOTE_KEY = "lastViewedQuote";

// Main data
let quotes = [];

// DOM elements
const quoteDisplay = document.getElementById("quoteDisplay");
const categorySelect = document.getElementById("categorySelect");
const newQuoteBtn = document.getElementById("newQuote");
const exportBtn = document.getElementById("exportBtn");
const importFile = document.getElementById("importFile");

// Load quotes from local storage or use default
function loadQuotes() {
  const stored = localStorage.getItem(QUOTES_KEY);
  if (stored) {
    try {
      quotes = JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse quotes from storage:", e);
      quotes = [];
    }
  } else {
    quotes = [
      { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
    ];
    saveQuotes();
  }
}

// Save quotes to local storage
function saveQuotes() {
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

// Get unique categories
function getUniqueCategories() {
  const categories = new Set();
  quotes.forEach(q => categories.add(q.category));
  return Array.from(categories);
}

// Populate category dropdown
function populateCategorySelect() {
  categorySelect.innerHTML = "";
  getUniqueCategories().forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// Show random quote from selected category
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filtered = quotes.filter(q => q.category === selectedCategory);
  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }
  const quote = filtered[Math.floor(Math.random() * filtered.length)];
  quoteDisplay.textContent = `"${quote.text}"`;

  // Save to session storage
  sessionStorage.setItem(LAST_QUOTE_KEY, quote.text);
}

// Restore last viewed quote from session
function loadLastViewedQuote() {
  const last = sessionStorage.getItem(LAST_QUOTE_KEY);
  if (last) {
    quoteDisplay.textContent = `"${last}"`;
  }
}

// Create form dynamically
function createAddQuoteForm() {
  const formTitle = document.createElement("h2");
  formTitle.textContent = "Add a New Quote";
  document.body.appendChild(formTitle);

  const form = document.createElement("form");

  const inputQuote = document.createElement("input");
  inputQuote.type = "text";
  inputQuote.id = "quoteText";
  inputQuote.placeholder = "Enter quote";
  inputQuote.required = true;

  const inputCategory = document.createElement("input");
  inputCategory.type = "text";
  inputCategory.id = "quoteCategory";
  inputCategory.placeholder = "Enter category";
  inputCategory.required = true;

  const addBtn = document.createElement("button");
  addBtn.type = "submit";
  addBtn.textContent = "Add Quote";

  form.appendChild(inputQuote);
  form.appendChild(document.createElement("br"));
  form.appendChild(inputCategory);
  form.appendChild(document.createElement("br"));
  form.appendChild(addBtn);

  document.body.appendChild(form);

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const newText = inputQuote.value.trim();
    const newCat = inputCategory.value.trim();

    if (!newText || !newCat) return;

    quotes.push({ text: newText, category: newCat });
    saveQuotes();
    populateCategorySelect();
    form.reset();
    alert("Quote added!");
  });
}

// Export quotes to JSON file
function exportQuotesToJson() {
  const data = JSON.stringify(quotes, null, 2);
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// Import quotes from uploaded JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategorySelect();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch (e) {
      alert("Failed to parse file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// App initialization
function init() {
  loadQuotes();
  populateCategorySelect();
  loadLastViewedQuote();
  createAddQuoteForm();

  newQuoteBtn.addEventListener("click", showRandomQuote);
  exportBtn.addEventListener("click", exportQuotesToJson);
  importFile.addEventListener("change", importFromJsonFile);
}

document.addEventListener("DOMContentLoaded", init);
