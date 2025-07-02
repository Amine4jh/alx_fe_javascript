const quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  ];
  
  const quoteDisplay = document.getElementById("quoteDisplay");
  const categorySelect = document.getElementById("categorySelect");
  const newQuoteBtn = document.getElementById("newQuote");
  
  function getUniqueCategories() {
    const categories = new Set();
    quotes.forEach(q => categories.add(q.category));
    return Array.from(categories);
  }
  
  function populateCategorySelect() {
    categorySelect.innerHTML = "";
    getUniqueCategories().forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      categorySelect.appendChild(option);
    });
  }
  
  function showRandomQuote() {
    const selectedCategory = categorySelect.value;
    const filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  
    if (filteredQuotes.length === 0) {
      quoteDisplay.textContent = "No quotes available in this category.";
      return;
    }
  
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    quoteDisplay.textContent = `"${filteredQuotes[randomIndex].text}"`;
  }
  
  function createAddQuoteForm() {
    const formTitle = document.createElement("h2");
    formTitle.textContent = "Add a New Quote";
    document.body.appendChild(formTitle);
  
    const form = document.createElement("form");
    form.id = "quoteForm";
  
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
  
    const addButton = document.createElement("button");
    addButton.type = "submit";
    addButton.textContent = "Add Quote";
  
    form.appendChild(inputQuote);
    form.appendChild(document.createElement("br"));
    form.appendChild(inputCategory);
    form.appendChild(document.createElement("br"));
    form.appendChild(addButton);
    document.body.appendChild(form);
  
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const text = inputQuote.value.trim();
      const category = inputCategory.value.trim();
  
      if (!text || !category) return;
  
      quotes.push({ text, category });
  
      populateCategorySelect();
      form.reset();
      alert("Quote added successfully!");
    });
  }
  
  function init() {
    populateCategorySelect();
    newQuoteBtn.addEventListener("click", showRandomQuote);
    createAddQuoteForm();
  }
  
  document.addEventListener("DOMContentLoaded", init);
  