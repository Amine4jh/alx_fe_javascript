/* DOM Manipulation - Dynamic Quote Generator */

// ---------- Constants ----------
const QUOTES_KEY = "dynamicQuotes";
const LAST_FILTER_KEY = "lastSelectedCategory";
const LAST_QUOTE_KEY = "lastViewedQuote";
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";
const SYNC_INTERVAL = 30000;

// ---------- State ----------
let quotes = [];

// ---------- DOM Elements ----------
const quoteDisplay = document.getElementById("quoteDisplay");
const categoryFilter =
  document.getElementById("categoryFilter") || createCategoryFilter();
const notificationBox =
  document.getElementById("syncNotification") || createNotificationBox();

// ---------- Setup DOM if Needed ----------
function createCategoryFilter() {
  const select = document.createElement("select");
  select.id = "categoryFilter";
  select.onchange = filterQuotes;
  document.body.insertBefore(select, quoteDisplay);
  return select;
}

function createNotificationBox() {
  const div = document.createElement("div");
  div.id = "syncNotification";
  div.style.display = "none";
  div.style.backgroundColor = "#ffffcc";
  div.innerHTML = `Quotes updated from server. <button onclick=\"dismissNotification()\">Dismiss</button>`;
  document.body.insertBefore(div, quoteDisplay);
  return div;
}

// ---------- Quote Management ----------
function saveQuotes() {
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const data = localStorage.getItem(QUOTES_KEY);
  quotes = data ? JSON.parse(data) : [];

  if (quotes.length === 0) {
    quotes = [
      { text: "Believe in yourself.", category: "Motivation" },
      { text: "Never stop learning.", category: "Education" },
      { text: "You are stronger than you think.", category: "Inspiration" },
    ];
    saveQuotes();
  }
}

function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
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
  sessionStorage.setItem(LAST_QUOTE_KEY, quote.text);
}

function populateCategories() {
  const categories = [...new Set(quotes.map((q) => q.category))];
  categoryFilter.innerHTML = `<option value=\"all\">All Categories</option>`;
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const last = localStorage.getItem(LAST_FILTER_KEY);
  if (last) categoryFilter.value = last;
}

function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem(LAST_FILTER_KEY, selectedCategory);
  showRandomQuote();
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) return alert("Both quote and category are required.");

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  filterQuotes();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  // ✅ POST to mock server
  fetch(SERVER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(newQuote),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Posted to server:", data);
    })
    .catch((err) => {
      console.error("Server POST error:", err);
    });
}

// ---------- Import / Export ----------
function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      quotes.push(...importedQuotes);
      saveQuotes();
      populateCategories();
      filterQuotes();
      alert("Quotes imported successfully!");
    } catch {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

function exportQuotes() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ---------- Server Sync ----------
async function fetchQuotesFromServer() {
  try {
    const res = await fetch(SERVER_URL);
    const posts = await res.json();
    const serverQuotes = posts
      .slice(0, 5)
      .map((p) => ({ text: p.title, category: "Server" }));
    let changed = false;

    serverQuotes.forEach((sq) => {
      const existing = quotes.find((q) => q.text === sq.text);
      if (!existing) {
        quotes.push(sq);
        changed = true;
      } else if (existing.category !== sq.category) {
        existing.category = sq.category; // Server wins
        changed = true;
      }
    });

    if (changed) {
      saveQuotes();
      populateCategories();
      filterQuotes();
      showNotification();
    }
  } catch (err) {
    console.error("Sync error:", err);
  }
}

function showNotification() {
  notificationBox.style.display = "block";
}

function dismissNotification() {
  notificationBox.style.display = "none";
}

// ---------- Initialization ----------
function init() {
  loadQuotes();
  populateCategories();
  filterQuotes();
  showRandomQuote();
  fetchQuotesFromServer();
  setInterval(fetchQuotesFromServer, SYNC_INTERVAL);
}

document.addEventListener("DOMContentLoaded", init);

document.getElementById("newQuote")?.addEventListener("click", showRandomQuote);

document
  .getElementById("importFile")
  ?.addEventListener("change", importFromJsonFile);
document
  .getElementById("exportButton")
  ?.addEventListener("click", exportQuotes);
document.getElementById("addQuoteButton")?.addEventListener("click", addQuote);
