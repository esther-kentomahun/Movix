const API_KEY = "998b0792ed9e0fb0ce76f7dc242fc4e3";
const BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

const searchMovie = document.getElementById("searchMovie");
const searchInput = document.getElementById("searchInput");
const movieGrid = document.getElementById("movieGrid");
async function getMixedMovies() {
  try {
    //define both endpoints
    const globalUrl = `${BASE_URL}/movie/popular?api_key=${API_KEY}`;
    const nollywoodUrl = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_origin_country=NG&sort_by=popularity.desc`;
    //fetch both requests concurrently
    const [globalResponse, nollywoodResponse] = await Promise.all([
      fetch(globalUrl),
      fetch(nollywoodUrl),
    ]);
    const globalData = await globalResponse.json();
    const nollywoodData = await nollywoodResponse.json();
    const globalMovies = globalData.results || [];
    const nollywoodMovies = nollywoodData.results || [];
    // Interleave the arrays (1 Nollywood, 1 Global)
    const mixedMovies = [];
    const maxLength = Math.max(globalMovies.length, nollywoodMovies.length);
    for (let i = 0; i < maxLength; i++) {
      if (nollywoodMovies[i]) mixedMovies.push(nollywoodMovies[i]);
      if (globalMovies[i]) mixedMovies.push(globalMovies[i]);
    }
    // Call displayMovies with the mixed list
    displayMovies(mixedMovies.slice(0, 20));
  } catch (error) {
    console.error("Error fetching movies:", error);
  }
}
getMixedMovies();
function displayMovies(movies) {
  movieGrid.innerHTML = "";
  //loop through each movie object in the array
  movies.forEach((movie) => {
    const posterPath = movie.poster_path
      ? `${IMAGE_BASE_URL}${movie.poster_path}`
      : "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='500' height='750' viewBox='0 0 500 750'><rect width='100%' height='100%' fill='%231e293b'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='%2394a3b8' font-family='sans-serif' font-size='28' font-weight='600'>No Poster Available</text></svg>";
    //getting the released year
    const releaseYear = movie.release_date
      ? movie.release_date.split("-")[0]
      : "N / A";
    //movie cards sections
    const card = document.createElement("div");
    card.className =
      "group cursor-pointer overflow-hidden rounded-xl bg-slate-700/50 border border-slate-800 transition-all duration-300 hover:bg-slate-800 hover:shadow-2xl";
    //card movie data
    card.innerHTML = `
        <div class="relative aspect-[2/3] overflow-hiden bg-slate-800">
            <img src="${posterPath}"
                alt="{$movie.title}"
                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
            />
        </div>
        <div class="p-3">
          <h3 class="font-semibold text-slate-200 truncate group-hover:text-white transition-colors">
            ${movie.title}
          </h3>
          <div class="mt-1 flex items-center gap-1 text-slate-300 bg-slate-700/50 px-2 py-1 rounded-full">
            <span>⭐️</span>
            <span>${movie.vote_average.toFixed(1)}</span>
          </div>
          <button class="mt-3 w-full rounded-lg bg-red-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-red-700">Watch Stream</button>
        </div>
    `;
    card.addEventListener("click", () => openWatchProvider(movie.id));
    movieGrid.appendChild(card);
  });
}
//function to search movie via TMDB API
async function searchMovies(query) {
  try {
    //search query for the search endpoint
    const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`;
    const response = await fetch(url);
    const data = await response.json();
    // update the header title
    const sectionTitle = document.getElementById("sectionTitle");
    if (sectionTitle) {
      sectionTitle.innerText = `Search Results for "${query}"`;
    }
    displayMovies(data.results);
  } catch (error) {
    console.error("Error searching movies:", error);
  }
}
if (searchMovie) {
  searchMovie.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (query) {
      searchMovies(query);
      searchInput.value = "";
    } else {
      getMixedMovies();
    }
  });
}
async function openWatchProvider(movieId) {
  try {
    const response = await fetch(`${BASE_URL}/movie/${movieId}/watch/providers?api_key=${API_KEY}`);
    const data = await response.json();
    // Check for Nigerian availability first ('NG'), or fallback to US ('US')
    const providerData = data.results?.NG || data.results?.US;
    if (providerData && providerData.link) {
      // Opens the official streaming page in a new browser tab
      window.open(providerData.link, "_blank");
    } else {
      alert("No direct streaming provider found for this title.");
    }
  } catch (error) {
    console.error("Error loading watch providers:", error);
  }
}
openWatchProvider();