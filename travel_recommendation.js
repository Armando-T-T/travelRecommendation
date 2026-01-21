// travel_recommendation.js

document.addEventListener("DOMContentLoaded", () => {
  const searchForm = document.getElementById("searchForm");
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const clearBtn = document.getElementById("clearBtn");
  const resultsContainer = document.getElementById("results");

  // Prevent form submission (results must show only after clicking Search button)
  searchForm.addEventListener("submit", (e) => e.preventDefault());

  searchBtn.addEventListener("click", handleSearch);
  clearBtn.addEventListener("click", clearResults);

  async function handleSearch() {
    const keywordRaw = searchInput.value.trim();
    const keyword = keywordRaw.toLowerCase();

    // Only proceed on Search click
    clearResults(false); // clear previous results but keep input unless user hits Clear

    if (!keyword) {
      renderMessage("Please enter a keyword: beach, temple, or country.");
      return;
    }

    const category = getCategoryFromKeyword(keyword);
    if (!category) {
      renderMessage('No matches. Try: "beach", "temple", or "country".');
      return;
    }

    try {
      const data = await fetchData();

      let recommendations = [];

      if (category === "beaches") {
        recommendations = (data.beaches || []).map(item => ({
          name: item.name,
          imageUrl: item.imageUrl,
          description: item.description
        }));
      }

      if (category === "temples") {
        recommendations = (data.temples || []).map(item => ({
          name: item.name,
          imageUrl: item.imageUrl,
          description: item.description
        }));
      }

      if (category === "countries") {
        // Requirement: show cities (name, image, description)
        // Flatten all cities from all countries
        const countries = data.countries || [];
        const allCities = countries.flatMap(c => c.cities || []);
        recommendations = allCities.map(city => ({
          name: city.name,
          imageUrl: city.imageUrl,
          description: city.description
        }));
      }

      if (!recommendations || recommendations.length < 2) {
        renderMessage("Not enough recommendations found (minimum 2 required).");
        return;
      }

      renderRecommendations(recommendations);
    } catch (err) {
      console.error(err);
      renderMessage("Error loading recommendations. Please check your JSON file path.");
    }
  }

  function getCategoryFromKeyword(keyword) {
    // Accept variations and cases (already lowercased)
    const beachKeywords = ["beach", "beaches"];
    const templeKeywords = ["temple", "temples"];
    const countryKeywords = ["country", "countries"];

    if (beachKeywords.includes(keyword)) return "beaches";
    if (templeKeywords.includes(keyword)) return "temples";
    if (countryKeywords.includes(keyword)) return "countries";

    return null;
  }

  async function fetchData() {
    // Local file fetch
    const response = await fetch("travel_recommendation_api.json");
    if (!response.ok) {
      throw new Error(`Failed to fetch JSON: ${response.status}`);
    }
    return await response.json();
  }

  function renderRecommendations(items) {
    // Column of blocks: image on top, text below
    resultsContainer.innerHTML = "";

    items.forEach((item) => {
      const card = document.createElement("div");
      card.className = "rec-card";

      const imgWrap = document.createElement("div");
      imgWrap.className = "rec-image";

      const img = document.createElement("img");
      img.src = item.imageUrl;
      img.alt = item.name;

      // Optional fallback if an image path is missing/broken
      img.onerror = () => {
        img.src = "nueva-york.jpg";
      };

      imgWrap.appendChild(img);

      const content = document.createElement("div");
      content.className = "rec-content";

      const title = document.createElement("h3");
      title.textContent = item.name;

      const desc = document.createElement("p");
      desc.textContent = item.description;

      content.appendChild(title);
      content.appendChild(desc);

      card.appendChild(imgWrap);
      card.appendChild(content);

      resultsContainer.appendChild(card);
    });
  }

  function renderMessage(message) {
    resultsContainer.innerHTML = `<p class="results-message">${message}</p>`;
  }

  function clearResults(clearInput = true) {
    resultsContainer.innerHTML = "";
    if (clearInput) searchInput.value = "";
  }
});
