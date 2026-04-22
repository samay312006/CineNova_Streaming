const API_KEY = "40ea9b31"; 
const BASE_URL = 'https://www.omdbapi.com/';

/* ═══════════════════════════════════════════════════════════ */
/* 🎛️ PLATFORM DEFINITIONS                                    */
/* ═══════════════════════════════════════════════════════════ */
export interface Platform {
  id: string;
  name: string;
  icon: string;
  color: string;
  gradient: string;
  tagline: string;
}

export const PLATFORMS: Platform[] = [
  { id: "netflix", name: "Netflix", icon: "N", color: "#E50914", gradient: "from-red-600 to-red-800", tagline: "Originals & Blockbusters" },
  { id: "disney", name: "Disney+", icon: "D", color: "#113CCF", gradient: "from-blue-600 to-indigo-800", tagline: "Magic & Marvel" },
  { id: "hbo", name: "HBO Max", icon: "H", color: "#5822B4", gradient: "from-purple-700 to-indigo-900", tagline: "Prestige Cinema" },
  { id: "prime", name: "Prime Video", icon: "P", color: "#00A8E1", gradient: "from-cyan-500 to-blue-700", tagline: "Included with Prime" },
  { id: "hulu", name: "Hulu", icon: "h", color: "#1CE783", gradient: "from-green-400 to-emerald-700", tagline: "Stream Your Way" },
  { id: "apple", name: "Apple TV+", icon: "▶", color: "#555555", gradient: "from-gray-500 to-gray-800", tagline: "Award-Winning Stories" },
];

/* ═══════════════════════════════════════════════════════════ */
/* 🎬 EXPANDED PLATFORM MOVIE CATALOGS                        */
/* ═══════════════════════════════════════════════════════════ */
export interface PlatformCatalog {
  trending: string[];
  popular: string[];
  newReleases: string[];
}

const PLATFORM_CATALOGS: Record<string, PlatformCatalog> = {
  netflix: {
    trending: ["Stranger Things", "Wednesday", "Glass Onion", "Don't Look Up", "The Queen's Gambit", "Squid Game", "All Quiet on the Western Front", "The Adam Project"],
    popular: ["The Witcher", "Red Notice", "Bird Box", "Extraction", "The Irishman", "Marriage Story", "The Trial of the Chicago 7", "Enola Holmes"],
    newReleases: ["Rebel Moon", "Leave the World Behind", "The Killer", "Pain Hustlers", "Heart of Stone", "Luther: The Fallen Sun", "Glass Onion", "Murder Mystery 2"],
  },
  disney: {
    trending: ["The Mandalorian", "Loki", "Ahsoka", "Wish", "Guardians of the Galaxy", "WandaVision", "Hawkeye", "Raya and the Last Dragon"],
    popular: ["Encanto", "Moana", "Black Panther", "Inside Out", "Frozen", "Coco", "Zootopia", "Big Hero 6"],
    newReleases: ["Elemental", "The Marvels", "Haunted Mansion", "Indiana Jones", "The Little Mermaid", "Ant-Man and the Wasp: Quantumania", "Peter Pan", "Disenchanted"],
  },
  hbo: {
    trending: ["The Last of Us", "Succession", "Euphoria", "House of the Dragon", "White Lotus", "True Detective", "Watchmen", "Mare of Easttown"],
    popular: ["The Batman", "Dune: Part Two", "Oppenheimer", "Barbie", "Joker", "Mad Max: Fury Road", "Wonder Woman", "Tenet"],
    newReleases: ["Wonka", "Aquaman", "Blue Beetle", "Godzilla x Kong", "The Flash", "Shazam", "Black Adam", "Meg 2: The Trench"],
  },
  prime: {
    trending: ["The Boys", "Reacher", "Fallout", "Citadel", "The Wheel of Time", "Invincible", "Jack Ryan", "The Peripheral"],
    popular: ["The Terminal List", "Lord of the Rings", "Tomorrow War", "Without Remorse", "Coming 2 America", "Borat", "The Big Sick", "Manchester by the Sea"],
    newReleases: ["Road House", "Saltburn", "Air", "The Covenant", "Creed III", "Expend4bles", "Gran Turismo", "The Beekeeper"],
  },
  hulu: {
    trending: ["The Bear", "Only Murders in the Building", "Shogun", "Prey", "Under the Banner of Heaven", "Dopesick", "The Dropout", "Pam and Tommy"],
    popular: ["No One Will Save You", "Nomadland", "Civil War", "Palm Springs", "The Banshees of Inisherin", "The Menu", "Triangle of Sadness", "Parasite"],
    newReleases: ["Challengers", "The Fall Guy", "Alien: Romulus", "Booksmart", "Fire Island", "Good Luck to You, Leo Grande", "Fresh", "Not Okay"],
  },
  apple: {
    trending: ["Ted Lasso", "The Morning Show", "Severance", "Silo", "Foundation", "Slow Horses", "Shrinking", "Pachinko"],
    popular: ["Killers of the Flower Moon", "Napoleon", "CODA", "Greyhound", "Finch", "Cherry", "The Banker", "Wolfwalkers"],
    newReleases: ["Argylle", "Tetris", "Emancipation", "Ghosted", "Sharper", "The Family Plan", "Flora and Son", "Finch"],
  },
};

/* ═══════════════════════════════════════════════════════════ */
/* 🏷️ GENRE LIST                                              */
/* ═══════════════════════════════════════════════════════════ */
export const GENRES = [
  "Action", "Adventure", "Animation", "Comedy", "Crime",
  "Drama", "Fantasy", "Horror", "Mystery", "Romance",
  "Sci-Fi", "Thriller",
];

/* ═══════════════════════════════════════════════════════════ */
/* 🔧 FETCH HELPER                                            */
/* ═══════════════════════════════════════════════════════════ */
export interface Movie {
  id: string;
  title: string;
  poster_path: string;
  description: string;
  year: string;
  rating: string;
  genre: string;
  runtime: string;
  videoSearch: string;
  trailerUrl: string;
}

const fetchMovies = async (list: string[]): Promise<Movie[]> => {
  const results = await Promise.all(
    list.map(async (title) => {
      try {
        const res = await fetch(`${BASE_URL}?t=${encodeURIComponent(title)}&apikey=${API_KEY}`);
        const data = await res.json();
        if (data.Response === "True") {
          const searchQuery = `${data.Title} ${data.Year} official trailer`;
          return {
            id: data.imdbID,
            title: data.Title,
            poster_path: data.Poster !== "N/A" ? data.Poster : "https://via.placeholder.com/500x750?text=No+Poster",
            description: data.Plot || "No description available.",
            year: data.Year,
            rating: data.imdbRating || "N/A",
            genre: data.Genre || "",
            runtime: data.Runtime || "",
            videoSearch: encodeURIComponent(searchQuery),
            trailerUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`,
          };
        }
        return null;
      } catch {
        return null;
      }
    })
  );
  return results.filter((m): m is Movie => m !== null);
};

export const fetchMoviesByIds = async (ids: string[]): Promise<Movie[]> => {
  const results = await Promise.all(
    ids.map(async (id) => {
      try {
        const res = await fetch(`${BASE_URL}?i=${encodeURIComponent(id)}&apikey=${API_KEY}`);
        const data = await res.json();
        if (data.Response === "True") {
          const searchQuery = `${data.Title} ${data.Year} official trailer`;
          return {
            id: data.imdbID,
            title: data.Title,
            poster_path: data.Poster !== "N/A" ? data.Poster : "https://via.placeholder.com/500x750?text=No+Poster",
            description: data.Plot || "No description available.",
            year: data.Year,
            rating: data.imdbRating || "N/A",
            genre: data.Genre || "",
            runtime: data.Runtime || "",
            videoSearch: encodeURIComponent(searchQuery),
            trailerUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`,
          };
        }
        return null;
      } catch {
        return null;
      }
    })
  );
  return results.filter((m): m is Movie => m !== null);
};

/* ═══════════════════════════════════════════════════════════ */
/* 📡 PUBLIC API                                               */
/* ═══════════════════════════════════════════════════════════ */

/** Fetch all category rows for a single platform */
export const getPlatformData = async (platformId: string) => {
  const catalog = PLATFORM_CATALOGS[platformId];
  if (!catalog) return null;

  const [trending, popular, newReleases] = await Promise.all([
    fetchMovies(catalog.trending),
    fetchMovies(catalog.popular),
    fetchMovies(catalog.newReleases),
  ]);

  return { trending, popular, newReleases };
};

export const searchMovies = async (query: string): Promise<Movie[]> => {
  if (!query) return [];
  try {
    const res = await fetch(`${BASE_URL}?s=${encodeURIComponent(query)}&apikey=${API_KEY}`);
    const data = await res.json();
    if (data.Response === "True") {
      return data.Search.map((m: any) => ({
        id: m.imdbID,
        title: m.Title,
        poster_path: m.Poster !== "N/A" ? m.Poster : "https://via.placeholder.com/500x750?text=No+Poster",
        description: "",
        year: m.Year,
        rating: "",
        genre: "",
        runtime: "",
        videoSearch: encodeURIComponent(`${m.Title} ${m.Year} official trailer`),
        trailerUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${m.Title} ${m.Year} official trailer`)}`,
      }));
    }
    return [];
  } catch {
    return [];
  }
};

/* ═══════════════════════════════════════════════════════════ */
/* 💾 LOCAL STORAGE                                            */
/* ═══════════════════════════════════════════════════════════ */
const STORAGE_KEY = "cinenova_connected_platforms";

export const getConnectedPlatforms = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const setConnectedPlatforms = (ids: string[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
};

export const hasCompletedOnboarding = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEY) !== null;
};