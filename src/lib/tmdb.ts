// src/lib/tmdb.ts

export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  backdrop_path?: string;
  match?: number;
  year?: number;
  age?: string;
  duration?: string;
}

export const getCineNovaData = async () => {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    hero: {
      id: 0,
      title: "The Last Horizon",
      description: "A daring crew of space explorers embarks on a perilous mission to the edge of the galaxy. As they uncover ancient secrets, they must fight to save humanity from an impending doom.",
      // 👇 CHANGED: High-quality Unsplash Space Image (Reliable)
      backdrop_path: "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2894&auto=format&fit=crop",
      match: 98,
      year: 2024,
      age: "16+",
      duration: "2h 15m"
    },
    trending: [
      { id: 1, title: "Dune: Part Two", poster_path: "https://image.tmdb.org/t/p/w500/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg" },
      { id: 2, title: "Civil War", poster_path: "https://image.tmdb.org/t/p/w500/sh7Rg8Er3tFcN9BpKIPOMvALgZd.jpg" },
      // 👇 CHANGED: Using reliable placeholders for broken ones
      { id: 3, title: "Godzilla x Kong", poster_path: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=800&auto=format&fit=crop" }, 
      { id: 4, title: "Kung Fu Panda 4", poster_path: "https://image.tmdb.org/t/p/w500/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg" },
      { id: 5, title: "Arthur the King", poster_path: "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?q=80&w=800&auto=format&fit=crop" },
    ],
    top10: [
      { id: 6, title: "Avatar", poster_path: "https://image.tmdb.org/t/p/w500/kyeqWdyUXW608qlYkRqosgbbJyK.jpg" },
      { id: 7, title: "Avengers: Endgame", poster_path: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg" },
      // 👇 CHANGED: Reliable Unsplash images for Sci-Fi look
      { id: 8, title: "Inception", poster_path: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?q=80&w=800&auto=format&fit=crop" },
      { id: 9, title: "Interstellar", poster_path: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop" },
      { id: 10, title: "The Dark Knight", poster_path: "https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg" },
    ]
  };
};