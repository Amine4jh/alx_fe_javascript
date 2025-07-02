// Initial quote data
const quotes = [
    { text: "The only limit to our realization of tomorrow is our doubts of today.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  ];
  
  const quoteDisplay = document.getElementById("quoteDisplay");
  const categorySelect = document.getElementById("categorySelect");
  const newQuoteBtn = document.getElementById("newQuote");
  const quoteForm = document.getElementById("quoteForm");
  const quoteText = document.getElementById("quoteText");
  const quoteCategory = document.getElementById("quoteCategory");
  
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
    const filteredQuotes = quotes.filter(q => q.category === selectedCategory);
  
    if (filteredQuotes.length === 0) {
      quoteDisplay.textContent = "No quotes available in this category.";
      return;
    }
  
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    quoteDisplay.textContent = `"${filteredQuotes[randomIndex].text}"`;
  }
  
  // Add new quote from form
  function handleAddQuote(e) {
    e.preventDefault();
  
    const newQuote = quoteText.value.trim();
    const newCategory = quoteCategory.value.trim();
  
    if (!newQuote || !newCategory) return;
  
    quotes.push({ text: newQuote, category: newCategory });
  
    // Update UI
    populateCategorySelect();
    quoteForm.reset();
    alert("Quote added successfully!");
  }
  
  // Initialize app
  function init() {
    populateCategorySelect();
    newQuoteBtn.addEventListener("click", showRandomQuote);
    quoteForm.addEventListener("submit", handleAddQuote);
  }
  
  document.addEventListener("DOMContentLoaded", init);
  