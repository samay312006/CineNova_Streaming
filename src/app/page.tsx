"use client"; // 👈 This allows for clicking and state!

import { useState, useEffect } from "react";
import { getCineNovaData, Movie } from "../lib/tmdb";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [activeTrailer, setActiveTrailer] = useState<string | null>(null);

  // Fetch data on load since we are now a Client Component
  useEffect(() => {
    getCineNovaData().then(setData);
  }, []);

  if (!data) return <div className="bg-black min-h-screen flex items-center justify-center text-purple-500">Loading CineNova...</div>;

  const { hero, trending, top10 } = data;

  return (
    <main className="min-h-screen bg-[#0D0C11] text-white font-sans overflow-x-hidden">
      
      {/* 🎬 TRAILER MODAL OVERLAY */}
      {activeTrailer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-20">
          <button 
            onClick={() => setActiveTrailer(null)}
            className="absolute top-10 right-10 text-white text-4xl hover:text-purple-500 transition"
          >
            ✕
          </button>
          <div className="w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(147,51,234,0.4)] border border-purple-500/30">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${activeTrailer}?autoplay=1`}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* 1. NAVBAR */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-8 py-4 bg-gradient-to-b from-black/90 to-transparent">
        <div className="text-2xl font-bold flex items-center gap-1 text-purple-400">
           CineNova
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <div className="relative w-full h-[85vh]">
        <div className="absolute inset-0">
          <img src={hero.backdrop_path} alt="Hero" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0C11] via-transparent to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-16 max-w-3xl pt-20">
          <h1 className="text-6xl font-extrabold mb-4 uppercase tracking-tighter">
            The Last <span className="text-purple-500">Horizon</span>
          </h1>
          <p className="text-gray-300 text-lg mb-8 max-w-xl">{hero.description}</p>
          
          <div className="flex gap-4">
            <button 
              onClick={() => setActiveTrailer(hero.trailerId)}
              className="bg-white text-black px-8 py-3 rounded font-bold flex items-center gap-2 hover:bg-purple-500 hover:text-white transition-all duration-300"
            >
              <span>▶</span> Play Trailer
            </button>
          </div>
        </div>
      </div>

      {/* 3. MOVIE ROWS */}
      <div className="space-y-16 pb-20 -mt-20 relative z-20">
        <MovieRow title="Trending Now" movies={trending} onPlay={setActiveTrailer} />
        <MovieRow title="Top 10 Today" movies={top10} onPlay={setActiveTrailer} isRanked={true} />
      </div>
    </main>
  );
}

function MovieRow({ title, movies, onPlay, isRanked = false }: { title: string, movies: any[], onPlay: (id: string) => void, isRanked?: boolean }) {
  return (
    <div className="px-8 md:px-16">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <div className="w-1 h-8 bg-purple-600 rounded-full" /> {title}
      </h2>
      <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide">
        {movies.map((movie, index) => (
          <div 
            key={movie.id} 
            onClick={() => movie.trailerId && onPlay(movie.trailerId)}
            className="flex-shrink-0 group cursor-pointer"
          >
            <div className="relative w-[320px] h-[480px] md:w-[400px] md:h-[600px] rounded-xl overflow-hidden bg-gray-900 border border-white/5 transition-all duration-500 group-hover:scale-105 group-hover:border-purple-500/50">
              <img
                src={movie.poster_path.startsWith('http') ? movie.poster_path : `https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="w-full h-full object-cover group-hover:opacity-40 transition-opacity"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                    ▶
                 </div>
              </div>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-gray-400 group-hover:text-white transition-colors">{movie.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}