"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  PLATFORMS,
  GENRES,
  getPlatformData,
  searchMovies,
  fetchMoviesByIds,
  type Platform,
  type Movie,
} from "../../lib/tmdb";
import ConnectionModal from "@/components/ConnectionModal";
import axios from "axios";
import { useRouter } from "next/navigation";

/* ═══════════════════════════════════════════════════════════ */
/* 🔮 AMBIENT BACKGROUND                                      */
/* ═══════════════════════════════════════════════════════════ */
function AmbientGlow({ color }: { color: string }) {
  return (
    <>
      <div className="fixed top-[-200px] left-[-200px] w-[700px] h-[700px] rounded-full blur-[150px] pointer-events-none transition-colors duration-1000 opacity-10" style={{ backgroundColor: color }} />
      <div className="fixed bottom-[-300px] right-[-200px] w-[600px] h-[600px] rounded-full blur-[150px] pointer-events-none transition-colors duration-1000 opacity-5" style={{ backgroundColor: color }} />
    </>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* 🚀 ONBOARDING SCREEN                                       */
/* ═══════════════════════════════════════════════════════════ */
function OnboardingScreen({ onComplete }: { onComplete: (ids: string[]) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => { setTimeout(() => setAnimateIn(true), 100); }, []);

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleContinue = async () => {
    if (selected.size === 0) return;
    const ids = Array.from(selected);
    try {
      const res = await fetch("/api/user/platforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platforms: ids }),
      });
      if (!res.ok) throw new Error("Failed to save platforms");
      onComplete(ids);
    } catch (err) {
      console.error("Failed to save platforms", err);
      // Fallback to local storage or show error
      onComplete(ids);
    }
  };

  return (
    <div className="min-h-screen bg-[#0D0C11] text-white flex flex-col items-center justify-center px-6 selection:bg-green-500/30 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-600/10 rounded-full blur-[200px] pointer-events-none" />
      <div className={`relative z-10 max-w-3xl w-full text-center transition-all duration-1000 ${animateIn ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div className="text-4xl md:text-5xl font-black text-green-600 tracking-tighter mb-3">CineNova</div>
        <div className="text-xs font-black uppercase tracking-[0.4em] text-gray-500 mb-12">Your Streaming Hub</div>
        <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-4 leading-tight">
          Connect Your <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">Subscriptions</span>
        </h1>
        <p className="text-gray-400 text-base md:text-lg mb-12 max-w-lg mx-auto leading-relaxed">
          Select the platforms you subscribe to. We&apos;ll bring all your movies and shows into one unified experience.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12">
          {PLATFORMS.map((p) => {
            const isSelected = selected.has(p.id);
            return (
              <button key={p.id} onClick={() => toggle(p.id)}
                className={`group relative rounded-2xl p-5 md:p-6 border transition-all duration-500 text-left ${isSelected ? "bg-[#1E1D25] border-green-500/30 scale-[1.02]" : "bg-[#18171F] border-white/5 hover:bg-[#1C1B22] hover:border-white/10"}`}
                style={{ boxShadow: isSelected ? `0 0 30px ${p.color}20` : "none" }}>
                <div className={`absolute top-3 right-3 w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs transition-all duration-300 ${isSelected ? "border-green-400 bg-green-400/20 text-green-400" : "border-white/10 opacity-40"}`}>
                  {isSelected && "✓"}
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg transition-all duration-500 ${isSelected ? "scale-110" : "opacity-70 group-hover:opacity-100"}`} style={{ backgroundColor: p.color }}>{p.icon}</div>
                  <div>
                    <div className="font-black text-base">{p.name}</div>
                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{p.tagline}</div>
                  </div>
                </div>
                <div className={`h-0.5 rounded-full transition-all duration-700 ${isSelected ? "bg-green-400 w-full" : "bg-white/5 w-0"}`} />
              </button>
            );
          })}
        </div>
        <button onClick={handleContinue} disabled={selected.size === 0}
          className={`px-14 py-5 rounded-2xl font-black text-lg uppercase tracking-wider transition-all transform active:scale-95 ${selected.size > 0 ? "bg-green-600 text-white hover:bg-green-500 shadow-[0_20px_60px_rgba(147,51,234,0.3)]" : "bg-white/5 text-gray-600 border border-white/5 cursor-not-allowed"}`}>
          {selected.size === 0 ? "Select at least one platform" : `Continue with ${selected.size} platform${selected.size > 1 ? "s" : ""}`}
        </button>
        <p className="text-gray-600 text-xs font-bold mt-4">You can change this anytime in settings</p>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* 📋 MOVIE DETAIL PANEL                                       */
/* ═══════════════════════════════════════════════════════════ */
function MovieDetailPanel({ movie, onClose, onPlay, platform, isWatchlisted, onToggleWatchlist }: { movie: Movie; onClose: () => void; onPlay: (m: Movie) => void; platform?: Platform; isWatchlisted?: boolean; onToggleWatchlist?: (m: Movie) => void }) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8" onClick={onClose}>
      <div className="absolute inset-0 bg-black/90" />
      <div className="relative z-10 max-w-5xl w-full bg-[#151419] border border-white/10 rounded-[2rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] flex flex-col md:flex-row" onClick={(e) => e.stopPropagation()}>
        <div className="relative w-full md:w-[300px] flex-shrink-0">
          <img src={movie.poster_path} alt={movie.title} className="w-full h-full object-cover min-h-[280px]" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#151419] hidden md:block" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#151419] to-transparent md:hidden" />
        </div>
        <div className="p-8 md:p-10 flex-1 flex flex-col justify-center">
          <button onClick={onClose} className="absolute top-5 right-5 text-gray-500 hover:text-white text-xl transition-colors">✕</button>
          {platform && (
            <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full border w-fit mb-4" style={{ borderColor: platform.color + "50", color: platform.color }}>
              <span className="w-3 h-3 rounded-sm text-[8px] flex items-center justify-center text-white" style={{ backgroundColor: platform.color }}>{platform.icon}</span>
              {platform.name}
            </span>
          )}
          <h2 className="text-3xl md:text-4xl font-black tracking-tight uppercase leading-tight mb-3">{movie.title}</h2>
          <div className="flex items-center gap-4 mb-5 text-sm font-bold text-gray-400 flex-wrap">
            <span>{movie.year}</span>
            {movie.runtime && movie.runtime !== "N/A" && <span>{movie.runtime}</span>}
            {movie.rating && movie.rating !== "N/A" && <span>⭐ {movie.rating}</span>}
          </div>
          {movie.genre && (
            <div className="flex flex-wrap gap-2 mb-5">
              {movie.genre.split(", ").map((g, i) => (
                <span key={i} className="text-xs font-bold text-gray-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">{g}</span>
              ))}
            </div>
          )}
          <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-4">{movie.description || "No description available."}</p>
          <div className="flex gap-4">
            <button onClick={() => onPlay(movie)} className="bg-white text-black px-8 py-3.5 rounded-xl font-black text-sm hover:bg-green-600 hover:text-white transition-all transform active:scale-95 uppercase tracking-wider flex items-center gap-2">
              ▶ Watch Trailer
            </button>
            {onToggleWatchlist && (
              <button 
                onClick={() => onToggleWatchlist(movie)}
                className={`px-6 py-3.5 rounded-xl font-black text-sm border transition-all ${isWatchlisted ? 'bg-green-600/20 text-green-400 border-green-500/30 hover:bg-green-600/30' : 'bg-[#18171F] text-white border-white/5 hover:bg-[#1C1B22]'}`}
              >
                {isWatchlisted ? "✓ In Watchlist" : "+ My List"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* 🃏 MOVIE CARD                                               */
/* ═══════════════════════════════════════════════════════════ */
function MovieCard({ movie, onPlay, onSelect, platformColor, large = false }: { movie: Movie; onPlay: (m: Movie) => void; onSelect: (m: Movie) => void; platformColor: string; large?: boolean }) {
  return (
    <div className={`flex-shrink-0 group cursor-pointer transition-all duration-500 snap-start ${large ? "w-full" : "w-[200px] md:w-[230px]"}`}>
      <div className="relative aspect-[2/3] rounded-xl md:rounded-2xl overflow-hidden border border-white/5 group-hover:border-white/20 transition-all duration-700 shadow-xl group-hover:shadow-2xl" onClick={() => onSelect(movie)}>
        <img src={movie.poster_path} alt={movie.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" loading="lazy" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl text-white transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 shadow-xl" style={{ backgroundColor: platformColor }} onClick={(e) => { e.stopPropagation(); onPlay(movie); }}>▶</div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500">
          <h3 className="font-black text-xs truncate text-white">{movie.title}</h3>
        </div>
        {movie.rating && movie.rating !== "N/A" && (
          <div className="absolute top-2 right-2 bg-black/80 px-2 py-0.5 rounded-md text-[10px] font-black flex items-center gap-1 border border-white/10">
            <span style={{ color: platformColor }}>★</span> {movie.rating}
          </div>
        )}
      </div>
      <div className="mt-3 px-0.5">
        <h3 className="font-bold text-xs truncate text-gray-300 group-hover:text-white transition-colors">{movie.title}</h3>
        <span className="text-[10px] font-bold text-gray-600">{movie.year}</span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* 🎥 SCROLLABLE MOVIE ROW                                    */
/* ═══════════════════════════════════════════════════════════ */
function MovieRow({ title, movies, onPlay, onSelect, platformColor, platform }: { title: string; movies: Movie[]; onPlay: (m: Movie) => void; onSelect: (m: Movie) => void; platformColor: string; platform?: Platform }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    el?.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => { el?.removeEventListener("scroll", checkScroll); window.removeEventListener("resize", checkScroll); };
  }, [movies, checkScroll]);

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "left" ? -600 : 600, behavior: "smooth" });
  };

  if (!movies.length) return null;

  return (
    <div className="relative group/row">
      <div className="px-6 md:px-14 mb-4 flex items-center justify-between">
        <h2 className="text-base md:text-lg font-black flex items-center gap-3 tracking-tight">
          {platform && <div className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[9px] font-black" style={{ backgroundColor: platform.color }}>{platform.icon}</div>}
          <div className="w-1 h-5 rounded-full" style={{ backgroundColor: platformColor, boxShadow: `0 0 15px ${platformColor}60` }} />
          {title}
          <span className="text-[10px] text-gray-500 font-bold ml-1">{movies.length} titles</span>
        </h2>
        <div className="flex gap-1.5">
          <button onClick={() => scroll("left")} className={`w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs transition-all hover:bg-white/10 ${!canScrollLeft ? "opacity-20" : ""}`}>←</button>
          <button onClick={() => scroll("right")} className={`w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs transition-all hover:bg-white/10 ${!canScrollRight ? "opacity-20" : ""}`}>→</button>
        </div>
      </div>
      <div ref={scrollRef} className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x scroll-smooth px-6 md:px-14">
        {movies.map((movie, idx) => (
          <MovieCard key={movie.id || idx} movie={movie} onPlay={onPlay} onSelect={onSelect} platformColor={platformColor} />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* ⚙️ SETTINGS MODAL                                          */
/* ═══════════════════════════════════════════════════════════ */
function PlatformSettings({ connectedIds, onSave, onClose, onConnectNew, onSignOut, onDeleteAccount }: { connectedIds: string[]; onSave: (ids: string[]) => void; onClose: () => void; onConnectNew: (p: Platform, currentIds: string[]) => void; onSignOut: () => void; onDeleteAccount: () => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set(connectedIds));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const toggle = (id: string) => { setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; }); };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/90" />
      <div className="relative z-10 max-w-lg w-full bg-[#151419] border border-white/10 rounded-[2rem] p-8 shadow-[0_40px_100px_rgba(0,0,0,0.8)]" onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-5 right-5 text-gray-500 hover:text-white text-xl transition-colors">✕</button>
        <h2 className="text-2xl font-black tracking-tight mb-2">Manage Platforms</h2>
        <p className="text-gray-500 text-sm mb-6">Toggle your streaming subscriptions.</p>
        <div className="space-y-3 mb-8">
          {PLATFORMS.map((p) => {
            const isOn = selected.has(p.id);
            return (
              <div key={p.id} className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${isOn ? "bg-[#1E1D25] border-green-500/30" : "bg-[#18171F] border-white/5 opacity-70"}`}>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-sm" style={{ backgroundColor: p.color }}>{p.icon}</div>
                  <div className="text-left"><div className="font-black text-sm">{p.name}</div><div className="text-[10px] text-gray-500 font-bold">{p.tagline}</div></div>
                </div>
                {isOn ? (
                   <button onClick={() => toggle(p.id)} className="w-10 h-6 rounded-full bg-green-500 flex items-center justify-end px-1 transition-all"><div className="w-4 h-4 rounded-full bg-white shadow-sm" /></button>
                ) : (
                   <button onClick={() => onConnectNew(p, Array.from(selected))} className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-lg hover:bg-green-600 transition-colors">Connect</button>
                )}
              </div>
            );
          })}
        </div>
        <button onClick={() => onSave(Array.from(selected))}
          className="w-full py-4 rounded-xl font-black text-sm uppercase tracking-wider transition-all bg-green-600 text-white hover:bg-green-500 shadow-[0_10px_30px_rgba(34,197,94,0.2)]">
          Save Changes ({selected.size} connected)
        </button>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={onSignOut} className="py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white">
            Sign Out
          </button>
          {!confirmDelete ? (
            <button onClick={() => setConfirmDelete(true)} className="py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-red-500/20 text-red-500/60 hover:bg-red-500/10 hover:text-red-500">
              Delete Account
            </button>
          ) : (
            <button onClick={onDeleteAccount} className="py-3.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all bg-red-600 text-white shadow-[0_10px_20px_rgba(220,38,38,0.3)] animate-pulse">
              Confirm Delete
            </button>
          )}
        </div>
        {confirmDelete && (
          <p className="mt-4 text-[9px] font-bold text-red-500/50 text-center uppercase tracking-tighter">Warning: This action is permanent and cannot be undone.</p>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════ */
/* 🏠 MAIN HOME PAGE                                          */
/* ═══════════════════════════════════════════════════════════ */
export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [connectedIds, setConnectedIds] = useState<string[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [activeGenre, setActiveGenre] = useState<string>("All");
  const [platformData, setPlatformData] = useState<Record<string, { trending: Movie[]; popular: Movie[]; newReleases: Movie[] }>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedMoviePlatform, setSelectedMoviePlatform] = useState<Platform | undefined>();
  const [scrollY, setScrollY] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [watchlistIds, setWatchlistIds] = useState<Set<string>>(new Set());
  const [watchlistMovies, setWatchlistMovies] = useState<Movie[]>([]);

  const [connectingPlatform, setConnectingPlatform] = useState<Platform | null>(null);
  const [currentModalPlatforms, setCurrentModalPlatforms] = useState<string[]>([]);
  const router = useRouter();

  // Check onboarding and fetch profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get("/api/user/profile");
        if (res.data.user) {
          const platforms = res.data.user.connectedPlatforms || [];
          setConnectedIds(platforms);
          setShowOnboarding(platforms.length === 0);
          if (res.data.user.watchlist) {
            setWatchlistIds(new Set(res.data.user.watchlist));
          }
        }
      } catch (err: any) {
        if (err.response?.status === 401) {
          router.push("/login");
        } else {
          setShowOnboarding(true);
        }
      }
    };
    fetchUser();
  }, [router]);

  // Load Watchlist movies
  useEffect(() => {
    const fetchWatchlist = async () => {
      if (watchlistIds.size > 0) {
        const movies = await fetchMoviesByIds(Array.from(watchlistIds));
        setWatchlistMovies(movies);
      } else {
        setWatchlistMovies([]);
      }
    };
    fetchWatchlist();
  }, [watchlistIds]);

  // Fetch platform data
  const loadPlatformData = useCallback(async (ids: string[]) => {
    setLoading(true);
    const data: Record<string, { trending: Movie[]; popular: Movie[]; newReleases: Movie[] }> = {};
    await Promise.all(ids.map(async (id) => {
      const result = await getPlatformData(id);
      if (result) data[id] = result;
    }));
    setPlatformData(data);
    setLoading(false);
  }, []);

  useEffect(() => { if (connectedIds.length > 0) loadPlatformData(connectedIds); }, [connectedIds, loadPlatformData]);

  // Search
  useEffect(() => {
    const t = setTimeout(async () => {
      if (searchQuery.length > 2) { setIsSearching(true); setSearchResults(await searchMovies(searchQuery)); }
      else setIsSearching(false);
    }, 500);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Scroll
  useEffect(() => {
    const h = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const handleOnboardingComplete = (ids: string[]) => { setConnectedIds(ids); setShowOnboarding(false); };
  
  const handleUpdatePlatforms = async (ids: string[]) => { 
    try {
      const res = await fetch("/api/user/platforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platforms: ids }),
      });
      
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      
      setConnectedIds(ids); 
      setShowSettings(false); 
      setActiveFilter("all"); 
    } catch (err) {
      console.error("Failed to update platforms:", err);
      alert("Connection failed. Please check your internet or try again later.");
    }
  };

  const handleConnectPlatform = (platform: Platform, currentIds: string[]) => {
    setConnectingPlatform(platform);
    setCurrentModalPlatforms(currentIds);
  };

  const onConnectionSuccess = async () => {
    if (!connectingPlatform) return;
    const newIds = [...new Set([...currentModalPlatforms, connectingPlatform.id])];
    await handleUpdatePlatforms(newIds);
    setConnectingPlatform(null);
    setCurrentModalPlatforms([]);
  };

  const handleDeleteAccount = async () => {
    try {
      await axios.delete("/api/user/delete");
      router.push("/login");
    } catch (err) {
      console.error("Failed to delete account", err);
    }
  };

  const handleSignOut = async () => {
    try {
      await axios.post("/api/auth/signout");
      router.push("/login");
    } catch (err) {
      console.error("Failed to sign out", err);
    }
  };

  const handleToggleWatchlist = async (movie: Movie) => {
    try {
      if (watchlistIds.has(movie.id)) {
        await axios.delete("/api/user/watchlist", { data: { movieId: movie.id } });
        setWatchlistIds((prev) => {
          const next = new Set(prev);
          next.delete(movie.id);
          return next;
        });
      } else {
        await axios.post("/api/user/watchlist", { movieId: movie.id });
        setWatchlistIds((prev) => new Set(prev).add(movie.id));
      }
    } catch (err) {
      console.error("Failed to toggle watchlist", err);
    }
  };

  // Play logic: links to actual platform when possible
  const playTrailer = (movie: Movie, platform?: Platform) => {
    setSelectedMovie(null);
    if (platform) {
      // Dynamic link generation for real platform playback
      let url = "";
      const query = encodeURIComponent(movie.title);
      switch(platform.id) {
        case "netflix": url = `https://www.netflix.com/search?q=${query}`; break;
        case "disney": url = `https://www.disneyplus.com/search?q=${query}`; break;
        case "prime": url = `https://www.amazon.com/s?k=${query}&i=instant-video`; break;
        case "hbo": url = `https://www.max.com/search/${query}`; break;
        case "hulu": url = `https://www.hulu.com/search?q=${query}`; break;
        case "apple": url = `https://tv.apple.com/search?term=${query}`; break;
        default: url = movie.trailerUrl;
      }
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      window.open(movie.trailerUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Genre filter helper
  const filterByGenre = (movies: Movie[]) => {
    if (activeGenre === "All") return movies;
    return movies.filter((m) => m.genre.toLowerCase().includes(activeGenre.toLowerCase()));
  };

  // Collect all unique genres from loaded data
  const allGenresInData = new Set<string>();
  Object.values(platformData).forEach((d) => {
    [...d.trending, ...d.popular, ...d.newReleases].forEach((m) => {
      m.genre.split(", ").forEach((g) => { if (g.trim()) allGenresInData.add(g.trim()); });
    });
  });

  if (showOnboarding) return <OnboardingScreen onComplete={handleOnboardingComplete} />;

  const connectedPlatforms = PLATFORMS.filter((p) => connectedIds.includes(p.id));
  const activePlatform = activeFilter !== "all" ? PLATFORMS.find((p) => p.id === activeFilter) : undefined;
  const activeColor = activePlatform?.color || "#9333EA";
  const navOpacity = Math.min(scrollY / 200, 0.95);
  const heroMovie = Object.values(platformData)?.[0]?.trending?.[0];
  const visiblePlatforms = activeFilter === "all" ? connectedIds : [activeFilter];

  return (
    <main className="min-h-screen bg-[#0D0C11] text-white overflow-x-hidden selection:bg-green-500/30">
      <AmbientGlow color={activeColor} />

      {/* Detail panel */}
      {selectedMovie && (
        <MovieDetailPanel movie={selectedMovie} onClose={() => setSelectedMovie(null)} onPlay={playTrailer} platform={selectedMoviePlatform} isWatchlisted={watchlistIds.has(selectedMovie.id)} onToggleWatchlist={handleToggleWatchlist} />
      )}

      {/* Settings */}
      {showSettings && (
        <PlatformSettings 
          connectedIds={connectedIds} 
          onSave={handleUpdatePlatforms} 
          onClose={() => setShowSettings(false)} 
          onConnectNew={handleConnectPlatform} 
          onSignOut={handleSignOut} 
          onDeleteAccount={handleDeleteAccount}
        />
      )}

      {/* Connection Handshake */}
      {connectingPlatform && (
        <ConnectionModal 
          platform={connectingPlatform} 
          onSuccess={onConnectionSuccess} 
          onCancel={() => setConnectingPlatform(null)} 
        />
      )}

      {/* Nav */}
      <nav className="fixed top-0 w-full z-[100] flex items-center justify-between px-6 md:px-14 py-4 transition-all duration-500" style={{ backgroundColor: `rgba(13,12,17,${navOpacity > 0.5 ? 0.95 : navOpacity})` }}>
        <div className="flex items-center gap-5">
          <div className="text-2xl md:text-3xl font-black text-green-600 tracking-tighter cursor-pointer hover:opacity-80 transition-opacity" onClick={() => { setSearchQuery(""); setIsSearching(false); }}>CineNova</div>
          <div className="hidden md:flex items-center gap-1.5">
            {connectedPlatforms.map((p) => (
              <div key={p.id} className="w-5 h-5 rounded-sm flex items-center justify-center text-white text-[8px] font-black opacity-50 hover:opacity-100 transition-opacity cursor-pointer" style={{ backgroundColor: p.color }} onClick={() => setActiveFilter(p.id)} />
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs">🔍</div>
            <input type="text" placeholder="Search..." className="bg-[#18171F] border border-white/5 pl-9 pr-4 py-2.5 rounded-xl w-44 md:w-72 focus:w-56 md:focus:w-96 focus:outline-none focus:border-green-500/50 transition-all duration-500 placeholder:text-gray-600 text-sm" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
          <button onClick={() => setShowSettings(true)} className="w-9 h-9 rounded-xl bg-[#18171F] border border-white/5 flex items-center justify-center text-sm hover:bg-[#1E1D25] transition-all" title="Manage platforms">⚙</button>
        </div>
      </nav>

      <div className="relative z-10">
        {isSearching ? (
          <div className="pt-32 px-6 md:px-14 min-h-screen">
            <h2 className="text-xl font-black mb-8 text-gray-400">Results for <span className="text-white">&quot;{searchQuery}&quot;</span></h2>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
              {searchResults.map((m) => (
                <MovieCard key={m.id} movie={m} onPlay={playTrailer} onSelect={(mov) => { setSelectedMovie(mov); setSelectedMoviePlatform(undefined); }} platformColor={activeColor} large />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Hero */}
            {heroMovie && (
              <header className="relative w-full h-[70vh] md:h-[78vh] flex flex-col justify-end px-6 md:px-14 pb-20">
                <img src={heroMovie.poster_path} className="absolute inset-0 w-full h-full object-cover opacity-15 blur-sm" alt="" style={{ transform: `scale(1.05) translateY(${scrollY * 0.08}px)` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0C11] via-[#0D0C11]/70 to-[#0D0C11]/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#0D0C11]/80 via-transparent to-transparent" />
                <div className="relative z-20 max-w-2xl" style={{ transform: `translateY(${scrollY * -0.04}px)` }}>
                  <div className="flex items-center gap-2 mb-4">
                    {connectedPlatforms.slice(0, 3).map((p) => (
                      <div key={p.id} className="w-5 h-5 rounded-sm flex items-center justify-center text-white text-[8px] font-black" style={{ backgroundColor: p.color }}>{p.icon}</div>
                    ))}
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 ml-1">Now Streaming</span>
                  </div>
                  <h1 className="text-4xl sm:text-5xl md:text-7xl font-black mb-4 tracking-tighter uppercase leading-[0.85]">{heroMovie.title}</h1>
                  <div className="flex items-center gap-4 mb-5 text-sm font-bold text-gray-300 flex-wrap">
                    <span>{heroMovie.year}</span>
                    {heroMovie.runtime && heroMovie.runtime !== "N/A" && <span>{heroMovie.runtime}</span>}
                    {heroMovie.rating && heroMovie.rating !== "N/A" && <span>⭐ {heroMovie.rating}</span>}
                  </div>
                  <p className="text-gray-400 text-sm md:text-base mb-8 line-clamp-2 max-w-xl">{heroMovie.description}</p>
                  <div className="flex gap-3">
                    <button onClick={() => playTrailer(heroMovie, PLATFORMS.find(p => p.id === Object.keys(platformData)[0]))} className="bg-white text-black px-8 md:px-12 py-3.5 rounded-xl font-black text-sm hover:bg-green-600 hover:text-white transition-all transform active:scale-95 shadow-lg uppercase tracking-wider">▶ Play</button>
                    <button onClick={() => { setSelectedMovie(heroMovie); setSelectedMoviePlatform(connectedPlatforms[0]); }} className="bg-[#18171F] text-white px-8 md:px-12 py-3.5 rounded-xl font-black text-sm border border-white/5 hover:bg-[#1E1D25] transition-all uppercase tracking-wider">ⓘ Info</button>
                  </div>
                </div>
              </header>
            )}

            {/* Platform + Genre filter bar */}
            <div className="sticky top-[56px] z-[90] bg-[#0D0C11]/95 border-b border-white/5">
              {/* Platform filters */}
              <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide px-6 md:px-14 pt-3 pb-2">
                <button onClick={() => setActiveFilter("all")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all flex-shrink-0 border ${activeFilter === "all" ? "bg-green-600 border-green-500 text-white" : "bg-[#18171F] border-white/5 text-gray-500 hover:text-white hover:bg-[#1C1B22]"}`}>
                  <span className="w-5 h-5 rounded-md bg-green-500 flex items-center justify-center text-white text-[8px]">🌐</span>
                  All ({connectedIds.length})
                </button>
                <div className="w-px h-5 bg-white/10 flex-shrink-0 mx-0.5" />
                {connectedPlatforms.map((p) => (
                  <button key={p.id} onClick={() => setActiveFilter(activeFilter === p.id ? "all" : p.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs transition-all flex-shrink-0 border whitespace-nowrap ${activeFilter === p.id ? "bg-[#1E1D25] border-white/20 text-white shadow-md relative" : "bg-[#18171F] border-white/5 text-gray-500 hover:text-white hover:bg-[#1E1D25]"}`}
                    style={activeFilter === p.id ? { boxShadow: `0 0 15px ${p.color}20` } : {}}>
                    <span className="w-5 h-5 rounded-md flex items-center justify-center text-white text-[8px] font-black" style={{ backgroundColor: p.color }}>{p.icon}</span>
                    {p.name}
                  </button>
                ))}
              </div>

              {/* Genre filters */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide px-6 md:px-14 pb-3">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 mr-2 flex-shrink-0">Genre</span>
                <button onClick={() => setActiveGenre("All")}
                  className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all flex-shrink-0 border ${activeGenre === "All" ? "bg-white/10 border-white/15 text-white" : "bg-transparent border-transparent text-gray-500 hover:text-white"}`}>
                  All
                </button>
                {GENRES.filter((g) => allGenresInData.has(g)).map((g) => (
                  <button key={g} onClick={() => setActiveGenre(activeGenre === g ? "All" : g)}
                    className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all flex-shrink-0 border whitespace-nowrap ${activeGenre === g ? "bg-white/10 border-white/15 text-white" : "bg-transparent border-transparent text-gray-500 hover:text-white"}`}>
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Movie content */}
            <div className="space-y-8 py-8">
              {activeFilter === "all" && watchlistMovies.length > 0 && (
                 <MovieRow title="My Watchlist" movies={watchlistMovies} onPlay={(m) => playTrailer(m)} onSelect={(m) => { setSelectedMovie(m); setSelectedMoviePlatform(undefined); }} platformColor="#10B981" />
              )}
              {loading ? (
                <div className="px-6 md:px-14 space-y-10">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-white/5 rounded-full w-48 mb-5" />
                      <div className="flex gap-4 overflow-hidden">
                        {Array.from({ length: 8 }).map((_, j) => (
                          <div key={j} className="flex-shrink-0 w-[200px]">
                            <div className="aspect-[2/3] rounded-2xl bg-white/[0.03] border border-white/5" />
                            <div className="mt-3 h-3 bg-white/5 rounded-full w-3/4" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                visiblePlatforms.map((pId) => {
                  const p = PLATFORMS.find((pl) => pl.id === pId);
                  const d = platformData[pId];
                  if (!p || !d) return null;

                  const trendingFiltered = filterByGenre(d.trending);
                  const popularFiltered = filterByGenre(d.popular);
                  const newFiltered = filterByGenre(d.newReleases);

                  return (
                    <div key={pId}>
                      {trendingFiltered.length > 0 && (
                        <MovieRow title={`${p.name} — Trending`} movies={trendingFiltered} onPlay={(m) => playTrailer(m, p)} onSelect={(m) => { setSelectedMovie(m); setSelectedMoviePlatform(p); }} platformColor={p.color} platform={p} />
                      )}
                      {popularFiltered.length > 0 && (
                        <MovieRow title={`${p.name} — Popular`} movies={popularFiltered} onPlay={(m) => playTrailer(m, p)} onSelect={(m) => { setSelectedMovie(m); setSelectedMoviePlatform(p); }} platformColor={p.color} platform={p} />
                      )}
                      {newFiltered.length > 0 && (
                        <MovieRow title={`${p.name} — New Releases`} movies={newFiltered} onPlay={(m) => playTrailer(m, p)} onSelect={(m) => { setSelectedMovie(m); setSelectedMoviePlatform(p); }} platformColor={p.color} platform={p} />
                      )}
                    </div>
                  );
                })
              )}

              {/* No results for genre filter */}
              {!loading && activeGenre !== "All" && visiblePlatforms.every((pId) => {
                const d = platformData[pId];
                if (!d) return true;
                return filterByGenre(d.trending).length === 0 && filterByGenre(d.popular).length === 0 && filterByGenre(d.newReleases).length === 0;
              }) && (
                <div className="text-center py-20">
                  <div className="text-4xl mb-4">🎬</div>
                  <h3 className="text-xl font-black text-gray-400 mb-2">No {activeGenre} titles found</h3>
                  <p className="text-gray-600 text-sm">Try a different genre or platform filter</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <footer className="border-t border-white/5 py-10 px-6 md:px-14 relative z-30">
              <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="text-xl font-black text-green-600 tracking-tighter">CineNova</div>
                <div className="flex items-center gap-2">
                  {connectedPlatforms.map((p) => (<div key={p.id} className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[9px] font-black opacity-40" style={{ backgroundColor: p.color }}>{p.icon}</div>))}
                </div>
                <p className="text-gray-600 text-xs font-bold">© 2026 CineNova. {connectedIds.length} platforms connected.</p>
              </div>
            </footer>
          </>
        )}
      </div>
    </main>
  );
}