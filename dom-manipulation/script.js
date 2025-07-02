/* ----------  CONFIG  ---------- */
const QUOTES_KEY       = "dynamicQuotes";
const LAST_FILTER_KEY  = "lastSelectedCategory";
const LAST_QUOTE_KEY   = "lastViewedQuote";
const SERVER_URL       = "https://jsonplaceholder.typicode.com/posts"; // mock API
const SYNC_INTERVAL_MS = 30_000;                                       // 30 s

/* ----------  STATE  ---------- */
let quotes = [];

/* ----------  DOM  ---------- */
const categoryFilter  = document.getElementById("categoryFilter");
const quoteDisplay    = document.getElementById("quoteDisplay");
const notificationBox = document.getElementById("syncNotification");

/* ----------  STORAGE HELPERS  ---------- */
function saveQuotes() {
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const raw = localStorage.getItem(QUOTES_KEY);
  if (raw) {
    try { quotes = JSON.parse(raw) || []; }
    catch { quotes = []; }
  }
  if (quotes.length === 0) {                        // first run – seed with defaults
    quotes = [
      { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
    ];
    saveQuotes();
  }
}

/* ----------  CATEGORY FILTERING  ---------- */
function populateCategories() {
  const unique = [ ...new Set( quotes.map(q => q.category) ) ];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  unique.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  // restore last filter
  const last = localStorage.getItem(LAST_FILTER_KEY);
  if (last && [...categoryFilter.options].some(o => o.value === last)) {
    categoryFilter.value = last;
  }
}

function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem(LAST_FILTER_KEY, selectedCategory);

  const pool = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (pool.length === 0) {
    quoteDisplay.textContent = "No quotes available in this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  const { text, category } = pool[randomIndex];
  quoteDisplay.textContent = `"${text}" (${category})`;

  sessionStorage.setItem(LAST_QUOTE_KEY, text);
}

/* ----------  ADD‑QUOTE FORM (built dynamically)  ---------- */
function createAddQuoteForm() {
  const h2   = Object.assign(document.createElement("h2"), { textContent: "Add a New Quote" });
  const form = document.createElement("form");

  const textInput = Object.assign(document.createElement("input"), {
    type: "text", placeholder: "Enter quote", required: true
  });
  const catInput  = Object.assign(document.createElement("input"), {
    type: "text", placeholder: "Enter category", required: true
  });
  const btn       = Object.assign(document.createElement("button"), {
    type: "submit", textContent: "Add Quote"
  });

  form.append(textInput, document.createElement("br"), catInput,
              document.createElement("br"), btn);
  document.body.append(h2, form);

  form.addEventListener("submit", e => {
    e.preventDefault();
    quotes.push({ text: textInput.value.trim(), category: catInput.value.trim() });
    saveQuotes();
    populateCategories();
    filterQuotes();
    form.reset();
    alert("Quote added!");
  });
}

/* ----------  IMPORT / EXPORT  ---------- */
function createImportExportUI() {
  const exportBtn = Object.assign(document.createElement("button"), { textContent: "Export Quotes" });
  const importIn  = Object.assign(document.createElement("input"), { type: "file", accept: ".json" });
  document.body.append(document.createElement("hr"), exportBtn, importIn);

  exportBtn.onclick = () => {
    const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
    const url  = URL.createObjectURL(blob);
    Object.assign(document.createElement("a"), { href: url, download: "quotes.json" }).click();
    URL.revokeObjectURL(url);
  };

  importIn.onchange = e => {
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result);
        if (Array.isArray(data)) {
          quotes.push(...data);
          saveQuotes(); populateCategories(); filterQuotes();
          alert("Quotes imported successfully!");
        } else throw 0;
      } catch { alert("Invalid JSON file."); }
    };
    reader.readAsText(e.target.files[0]);
  };
}

/* ----------  SERVER SYNC  ---------- */
async function syncWithServer() {
  try {
    const res   = await fetch(SERVER_URL);
    const posts = await res.json();

    // take first 10 posts as mock "server quotes"
    const serverQuotes = posts.slice(0, 10).map(p => ({ text: p.title, category: "Server" }));
    let changed = false;

    serverQuotes.forEach(sq => {
      const local = quotes.find(q => q.text === sq.text);
      if (!local) {                       // new quote from server
        quotes.push(sq); changed = true;
      } else if (local.category !== sq.category) { // conflict → server wins
        local.category = sq.category; changed = true;
      }
    });

    if (changed) {
      saveQuotes(); populateCategories(); filterQuotes(); showNotification();
    }
  } catch (err) {
    console.error("Server sync failed:", err);
  }
}

function showNotification() { notificationBox.style.display = "block"; }
function dismissNotification() { notificationBox.style.display = "none"; }

/* ----------  INIT  ---------- */
function init() {
  loadQuotes();
  populateCategories();
  filterQuotes();
  const last = sessionStorage.getItem(LAST_QUOTE_KEY);
  if (last) quoteDisplay.textContent = `"${last}"`;

  createAddQuoteForm();
  createImportExportUI();

  syncWithServer();                       // immediate sync on load
  setInterval(syncWithServer, SYNC_INTERVAL_MS);
}

document.addEventListener("DOMContentLoaded", init);
categoryFilter.addEventListener("change", filterQuotes);
