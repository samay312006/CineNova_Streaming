"use client";

import { useState, useEffect } from "react";
import { getCineNovaData, searchMovies } from "../lib/tmdb";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeTrailer, setActiveTrailer] = useState<string | null>(null);

  useEffect(() => {
    getCineNovaData().then(setData);
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (searchQuery.length > 2) {
        setIsSearching(true);
        const results = await searchMovies(searchQuery);
        setSearchResults(results);
      } else {
        setIsSearching(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  if (!data || !data.hero) {
    return (
      <div className="bg-[#0D0C11] min-h-screen flex items-center justify-center">
        <div className="text-purple-600 text-4xl font-black animate-pulse italic">CineNova</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0D0C11] text-white overflow-x-hidden">
      
      {/* 🎬 VIDEO PLAYER - ONLY RENDERS WHEN ACTIVE TO PREVENT CLICK BLOCKING */}
      {activeTrailer && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 md:p-10 pointer-events-auto">
          <button 
            onClick={(e) => { e.stopPropagation(); setActiveTrailer(null); }} 
            className="absolute top-10 right-10 text-4xl text-white/50 hover:text-white z-[10000] cursor-pointer"
          >
            ✕
          </button>
          <div className="w-full max-w-5xl aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            <iframe 
              width="100%" 
              height="100%" 
              src={`https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(activeTrailer)}&autoplay=1`}
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}

      {/* 🧭 NAVIGATION */}
      <nav className="fixed top-0 w-full z-[100] flex items-center justify-between px-8 md:px-16 py-6 bg-gradient-to-b from-black/90 to-transparent pointer-events-auto">
        <div className="text-3xl font-black text-purple-600 tracking-tighter cursor-pointer" onClick={() => setSearchQuery("")}>CineNova</div>
        <input 
          type="text" 
          placeholder="Search..." 
          className="bg-gray-900/80 border border-white/10 px-8 py-2.5 rounded-full w-64 md:w-96 focus:w-[400px] focus:outline-none focus:border-purple-600 transition-all z-[101] relative cursor-text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </nav>

      <div className="relative z-10">
        {isSearching ? (
          <div className="pt-32 px-16 min-h-screen">
            <h2 className="text-2xl font-bold mb-10 tracking-tight">Results for "{searchQuery}"</h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
              {searchResults.map((m) => (
                <div key={m.id} className="group cursor-pointer relative z-20" onClick={() => setActiveTrailer(m.videoSearch)}>
                  <div className="aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 group-hover:border-purple-600 transition-all shadow-lg">
                    <img src={m.poster_path} className="w-full h-full object-cover" alt={m.title} />
                  </div>
                  <h3 className="mt-4 font-bold text-sm truncate">{m.title}</h3>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <header className="relative w-full h-[85vh] flex flex-col justify-end px-8 md:px-16 pb-20">
              <img src={data.hero.poster_path} className="absolute inset-0 w-full h-full object-cover opacity-20 blur-sm -z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0C11] to-transparent -z-10" />
              <div className="relative z-20 max-w-3xl">
                <h1 className="text-7xl font-black mb-4 tracking-tighter uppercase leading-none">{data.hero.title}</h1>
                <p className="text-gray-400 text-lg mb-8 line-clamp-3">{data.hero.description}</p>
                <button 
                  onClick={() => setActiveTrailer(data.hero.videoSearch)} 
                  className="relative z-30 bg-white text-black px-12 py-4 rounded-xl font-black hover:bg-purple-600 hover:text-white transition-all shadow-xl cursor-pointer"
                >
                  ▶ PLAY TRAILER
                </button>
              </div>
            </header>

            <div className="space-y-20 pb-20 -mt-16 relative z-20">
              <MovieRow title="Trending Now" movies={data.trending} onPlay={setActiveTrailer} />
              <MovieRow title="Global Top 10" movies={data.top10} onPlay={setActiveTrailer} />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

function MovieRow({ title, movies, onPlay }: any) {
  return (
    <div className="px-8 md:px-16 relative z-20">
      <h2 className="text-2xl font-black mb-8 italic flex items-center gap-3">
        <div className="w-1.5 h-8 bg-purple-600 rounded-full" /> {title}
      </h2>
      <div className="flex gap-7 overflow-x-auto pb-8 scrollbar-hide">
        {movies.map((movie: any, idx: number) => (
          <div key={movie.id || idx} onClick={() => onPlay(movie.videoSearch)} className="flex-shrink-0 group cursor-pointer w-[340px] relative z-30">
            <div className="aspect-[2/3] rounded-3xl overflow-hidden border border-white/5 group-hover:scale-105 group-hover:border-purple-600 transition-all duration-500 shadow-lg">
              <img src={movie.poster_path} alt={movie.title} className="w-full h-full object-cover" />
            </div>
            <h3 className="mt-4 font-bold text-sm truncate">{movie.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}