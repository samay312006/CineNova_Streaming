// src/lib/movieApi.ts
const API_KEY = "40ea9b31"; 
const BASE_URL = 'https://www.omdbapi.com/';

export const getCineNovaData = async () => {
  const trendingTitles = ["Dune: Part Two", "Civil War", "Godzilla x Kong", "The Fall Guy", "Challengers"];
  const top10Titles = ["Avatar", "Oppenheimer", "Interstellar", "The Dark Knight", "Inception"];

  const fetchMovies = async (list: string[]) => {
    const results = await Promise.all(
      list.map(async (title) => {
        try {
          const res = await fetch(`${BASE_URL}?t=${encodeURIComponent(title)}&apikey=${API_KEY}`);
          const data = await res.json();
          if (data.Response === "True") {
            return {
              id: data.imdbID, 
              title: data.Title,
              poster_path: data.Poster !== "N/A" ? data.Poster : "https://via.placeholder.com/500x750?text=No+Poster",
              description: data.Plot || "Plot not available.",
              year: data.Year,
              rating: data.imdbRating,
              match: Math.floor(Math.random() * 15) + 85,
              videoSearch: `${data.Title} ${data.Year} official trailer`
            };
          }
          return null;
        } catch (err) { return null; }
      })
    );
    return results.filter((m) => m !== null);
  };

  const [trending, top10] = await Promise.all([fetchMovies(trendingTitles), fetchMovies(top10Titles)]);
  return { hero: trending[0] || null, trending: trending || [], top10: top10 || [] };
};

export const searchMovies = async (query: string) => {
  if (!query) return [];
  try {
    const res = await fetch(`${BASE_URL}?s=${encodeURIComponent(query)}&apikey=${API_KEY}`);
    const data = await res.json();
    if (data.Response === "True") {
      return data.Search.map((m: any) => ({
        id: m.imdbID,
        title: m.Title,
        poster_path: m.Poster !== "N/A" ? m.Poster : "https://via.placeholder.com/500x750?text=No+Poster",
        year: m.Year,
        videoSearch: `${m.Title} ${m.Year} official trailer`
      }));
    }
    return [];
  } catch (err) { return []; }
};