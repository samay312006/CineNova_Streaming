import { getCineNovaData } from "../lib/tmdb";

export default async function Home() {
  const data = await getCineNovaData();
  const { hero, trending, top10 } = data;

  return (
    <main className="min-h-screen bg-[#0D0C11] text-white font-sans selection:bg-purple-500">
      
      {/* 1. NAVBAR */}
      <nav className="fixed top-0 w-full z-50 flex items-center justify-between px-8 py-4 bg-gradient-to-b from-black/90 to-transparent">
        <div className="flex items-center gap-8">
          <div className="text-2xl font-bold flex items-center gap-1 text-purple-400">
            <span className="text-3xl">▶</span> CineNova
          </div>
          <div className="hidden md:flex gap-6 text-gray-300 text-sm font-medium">
            <a href="#" className="hover:text-white transition">Home</a>
            <a href="#" className="hover:text-white transition">Movies</a>
            <a href="#" className="hover:text-white transition">Series</a>
            <a href="#" className="hover:text-white transition">My List</a>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold text-sm">
          U
        </div>
      </nav>

      {/* 2. HERO SECTION */}
      <div className="relative w-full h-[85vh]">
        <div className="absolute inset-0">
          <img 
            src={hero.backdrop_path} 
            alt="Hero" 
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D0C11] via-[#0D0C11]/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D0C11] via-[#0D0C11]/80 to-transparent" />
        </div>

        <div className="relative z-10 flex flex-col justify-center h-full px-8 md:px-16 max-w-3xl pt-20">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-4 leading-tight tracking-tight uppercase drop-shadow-lg">
            The Last <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
              Horizon
            </span>
          </h1>
          
          <div className="flex items-center gap-4 text-sm font-semibold mb-6 text-gray-300">
            <span className="text-green-400">{hero.match}% Match</span>
            <span>{hero.year}</span>
            <span className="border border-gray-500 px-1 text-xs rounded">{hero.age}</span>
            <span>{hero.duration}</span>
            <span className="text-xs border border-purple-500 text-purple-400 px-1 rounded">HD</span>
          </div>

          <p className="text-gray-300 text-lg mb-8 line-clamp-3 max-w-xl drop-shadow-md">
            {hero.description}
          </p>

          <div className="flex gap-4">
            <button className="bg-white text-black px-8 py-3 rounded font-bold flex items-center gap-2 hover:bg-gray-200 transition">
              <span>▶</span> Play
            </button>
            <button className="bg-gray-800/80 backdrop-blur-sm text-white px-8 py-3 rounded font-bold hover:bg-gray-700 transition">
              + My List
            </button>
          </div>
        </div>
      </div>

      {/* 3. MOOD PICKS */}
      <div className="px-8 md:px-16 mb-12 -mt-10 relative z-20">
        <h3 className="text-lg font-bold mb-4 text-gray-200">Mood Picks</h3>
        <div className="flex flex-wrap gap-4">
          {["😂 Happy", "😢 Sad", "🤯 Mind-Blowing", "❤️ Romantic", "🧘 Relaxed"].map((mood) => (
            <button key={mood} className="bg-gray-800/60 border border-gray-700 px-6 py-2 rounded-full text-sm font-medium hover:bg-purple-600 hover:border-purple-500 transition-all cursor-pointer backdrop-blur-md">
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* 4. HORIZONTAL ROWS */}
      <div className="space-y-12 pb-20">
        <MovieRow title="Trending Now" movies={trending} />
        <MovieRow title="Top 10 Today" movies={top10} isRanked={true} />
        <MovieRow title="Popular on CineNova" movies={trending} />
      </div>
    </main>
  );
}

// Fixed MovieRow Component
function MovieRow({ title, movies, isRanked = false }: { title: string, movies: any[], isRanked?: boolean }) {
  return (
    <div className="px-8 md:px-16">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
        <div className="w-1 h-6 bg-purple-600 rounded-full"></div> 
        {title}
      </h2>
      
      {/* Scroll Container */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {movies.map((movie, index) => {
          // Check for full link vs partial TMDB link
          const imageUrl = movie.poster_path?.startsWith("http") 
            ? movie.poster_path 
            : `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

          return (
            <div key={movie.id} className="group flex-shrink-0 cursor-pointer">
              
              {/* Image Container - STRICT DIMENSIONS (160px width x 240px height) */}
              <div className="relative w-[320px] h-[480px] md:w-[400px] md:h-[600px] rounded-lg overflow-hidden transition-transform duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] bg-gray-800">
                
                {/* Rank Number (Top 10 Only) */}
                {isRanked && (
                  <>
                    <span className="absolute bottom-0 left-0 text-[100px] font-black text-black leading-[0.8] z-20 translate-y-4 -translate-x-2">
                      {index + 1}
                    </span>
                    <span className="absolute bottom-0 left-0 text-[100px] font-black text-white leading-[0.8] z-10 translate-y-4 -translate-x-2 opacity-50 stroke-white">
                      {index + 1}
                    </span>
                  </>
                )}

                <img
                  src={imageUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover"
                />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-30">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/50">
                    ▶
                  </div>
                </div>
              </div>

              {/* Movie Title (Now Visible Below Image) */}
              <div className="mt-2 w-[160px] md:w-[240px]">
                <h3 className="text-gray-600 text-sm font-medium truncate group-hover:text-white transition-colors">
                  {movie.title}
                </h3>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}