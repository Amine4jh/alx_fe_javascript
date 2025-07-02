const QUOTES_KEY = "dynamicQuotes";
const LAST_FILTER_KEY = "lastSelectedCategory";
let quotes = [];

const categoryFilter = document.getElementById("categoryFilter");
const filteredQuotesDisplay = document.getElementById("filteredQuotesDisplay");

// Load quotes from storage or default
function loadQuotes() {
  const stored = localStorage.getItem(QUOTES_KEY);
  if (stored) {
    try {
      quotes = JSON.parse(stored);
    } catch {
      quotes = [];
    }
  } else {
    quotes = [
      {
        text: "The only limit to our realization of tomorrow is our doubts of today.",
        category: "Motivation",
      },
      {
        text: "Life is what happens when you're busy making other plans.",
        category: "Life",
      },
      {
        text: "In the middle of difficulty lies opportunity.",
        category: "Inspiration",
      },
    ];
    saveQuotes();
  }
}

// Save quotes to storage
function saveQuotes() {
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

// Populate dropdown with unique categories
function populateCategories() {
  const categories = [...new Set(quotes.map((q) => q.category))];

  // Clear existing except "All"
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });

  // Restore last selected filter
  const savedFilter = localStorage.getItem(LAST_FILTER_KEY);
  if (savedFilter) {
    categoryFilter.value = savedFilter;
    filterQuotes(); // Apply filter on load
  }
}

// Filter quotes by selected category
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem(LAST_FILTER_KEY, selectedCategory);

  const filtered =
    selectedCategory === "all"
      ? quotes
      : quotes.filter((q) => q.category === selectedCategory);

  if (filtered.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filtered.length);
  const quote = filtered[randomIndex];
  quoteDisplay.textContent = `"${quote.text}" (${quote.category})`;

  // Save last viewed quote
  sessionStorage.setItem("lastViewedQuote", quote.text);
}

// Display filtered quotes
function displayQuotes(quoteList) {
  filteredQuotesDisplay.innerHTML = "";

  if (quoteList.length === 0) {
    filteredQuotesDisplay.textContent = "No quotes available.";
    return;
  }

  quoteList.forEach((q) => {
    const p = document.createElement("p");
    p.textContent = `"${q.text}" (${q.category})`;
    filteredQuotesDisplay.appendChild(p);
  });
}

// Dynamically create Add Quote form
function createAddQuoteForm() {
  const formTitle = document.createElement("h2");
  formTitle.textContent = "Add a New Quote";
  document.body.appendChild(formTitle);

  const form = document.createElement("form");

  const inputQuote = document.createElement("input");
  inputQuote.type = "text";
  inputQuote.placeholder = "Enter quote";
  inputQuote.required = true;

  const inputCat = document.createElement("input");
  inputCat.type = "text";
  inputCat.placeholder = "Enter category";
  inputCat.required = true;

  const addBtn = document.createElement("button");
  addBtn.type = "submit";
  addBtn.textContent = "Add Quote";

  form.appendChild(inputQuote);
  form.appendChild(document.createElement("br"));
  form.appendChild(inputCat);
  form.appendChild(document.createElement("br"));
  form.appendChild(addBtn);
  document.body.appendChild(form);

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const newText = inputQuote.value.trim();
    const newCat = inputCat.value.trim();

    if (!newText || !newCat) return;

    quotes.push({ text: newText, category: newCat });
    saveQuotes();
    populateCategories();
    filterQuotes();
    form.reset();
    alert("Quote added!");
  });
}

// Export quotes to JSON file
function createExportImportButtons() {
  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export Quotes";
  exportBtn.onclick = () => {
    const data = JSON.stringify(quotes, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quotes.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.accept = ".json";
  importInput.onchange = (event) => {
    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          quotes.push(...imported);
          saveQuotes();
          populateCategories();
          filterQuotes();
          alert("Quotes imported successfully.");
        } else {
          alert("Invalid JSON format.");
        }
      } catch {
        alert("Error reading file.");
      }
    };
    reader.readAsText(event.target.files[0]);
  };

  document.body.appendChild(document.createElement("hr"));
  document.body.appendChild(exportBtn);
  document.body.appendChild(importInput);
}

// Initialize app
function init() {
  function loadLastViewedQuote() {
    const lastQuote = sessionStorage.getItem("lastViewedQuote");
    if (lastQuote) {
      quoteDisplay.textContent = `"${lastQuote}"`;
    }
  }

  loadQuotes();
  populateCategories();
  filterQuotes(); // Also restores previous filter
  loadLastViewedQuote();
  createAddQuoteForm();
  createExportImportButtons();
  simulateServerFetchAndSync();
}

document.addEventListener("DOMContentLoaded", init);

const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";
const SYNC_INTERVAL_MS = 30000;

function simulateServerFetchAndSync() {
  fetch(SERVER_URL)
    .then((response) => response.json())
    .then((serverData) => {
      const serverQuotes = serverData.slice(0, 5).map((post) => ({
        text: post.title,
        category: "Server",
      }));

      let localChanged = false;

      serverQuotes.forEach((serverQuote) => {
        const localQuote = quotes.find((q) => q.text === serverQuote.text);
        if (!localQuote) {
          quotes.push(serverQuote);
          localChanged = true;
        } else {
          // Conflict: same quote text but different category
          if (localQuote.category !== serverQuote.category) {
            // Conflict Resolution Strategy: Server Wins
            localQuote.category = serverQuote.category;
            localChanged = true;
            // Optionally: show manual conflict dialog
            showConflictResolutionDialog(localQuote, serverQuote);
          }
        }
      });

      if (localChanged) {
        saveQuotes();
        populateCategories();
        filterQuotes();
        showNotification();
      }
    })
    .catch((err) => {
      console.error("Server sync failed:", err);
    });
}

// Periodic sync
setInterval(simulateServerFetchAndSync, SYNC_INTERVAL_MS);

function showNotification() {
  const box = document.getElementById("syncNotification");
  box.style.display = "block";
}

function dismissNotification() {
  document.getElementById("syncNotification").style.display = "none";
}
