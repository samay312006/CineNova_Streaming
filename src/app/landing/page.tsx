"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

/* ─── PARTICLE SYSTEM (client-only to avoid hydration mismatch) ─── */
function FloatingParticles() {
  const [particles, setParticles] = useState<Array<{ w: number; h: number; left: number; top: number; dur: number; delay: number; opacity: number }>>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 40 }).map(() => ({
        w: Math.random() * 4 + 1,
        h: Math.random() * 4 + 1,
        left: Math.random() * 100,
        top: Math.random() * 100,
        dur: Math.random() * 20 + 15,
        delay: Math.random() * 10,
        opacity: Math.random() * 0.6 + 0.2,
      }))
    );
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-green-500/20"
          style={{
            width: `${p.w}px`,
            height: `${p.h}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animation: `floatParticle ${p.dur}s linear infinite`,
            animationDelay: `${p.delay}s`,
            opacity: p.opacity,
          }}
        />
      ))}
    </div>
  );
}

/* ─── ANIMATED COUNTER ─── */
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let current = 0;
    const increment = target / 60;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, 25);
    return () => clearInterval(timer);
  }, [started, target]);

  return (
    <div ref={ref} className="text-5xl md:text-6xl font-black text-white tracking-tight">
      {count.toLocaleString()}{suffix}
    </div>
  );
}

/* ─── SCROLL REVEAL WRAPPER ─── */
function ScrollReveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setVisible(true), delay);
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delay]);

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"} ${className}`}
    >
      {children}
    </div>
  );
}

/* ─── FEATURE CARD ─── */
function FeatureCard({ icon, title, description, delay }: { icon: string; title: string; description: string; delay: number }) {
  return (
    <ScrollReveal delay={delay}>
      <div className="group relative bg-[#18171F] border border-white/5 rounded-[2rem] p-8 md:p-10 hover:bg-[#1E1D25] hover:border-green-500/30 transition-all duration-700 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(34,197,94,0.1)]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-2xl shadow-[0_10px_30px_rgba(34,197,94,0.3)] group-hover:scale-110 transition-transform duration-500">
          {icon}
        </div>
        <h3 className="text-xl md:text-2xl font-black mt-6 mb-4 tracking-tight uppercase group-hover:text-green-400 transition-colors duration-500">{title}</h3>
        <p className="text-gray-400 leading-relaxed text-base">{description}</p>
      </div>
    </ScrollReveal>
  );
}

/* ─── PLATFORM CARD ─── */
function PlatformCard({ name, color, icon, delay }: { name: string; color: string; icon: string; delay: number }) {
  const [connected, setConnected] = useState(false);
  return (
    <ScrollReveal delay={delay}>
      <div
        className={`group relative bg-[#18171F] border rounded-[2rem] p-6 md:p-8 transition-all duration-700 hover:-translate-y-2 cursor-pointer ${
          connected ? "border-green-500/40 shadow-[0_0_30px_rgba(34,197,94,0.15)]" : "border-white/5 hover:border-green-500/30 hover:bg-[#1E1D25]"
        }`}
        onClick={() => setConnected(!connected)}
      >
        <div className="flex items-center gap-4 mb-4">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg transition-transform duration-500 group-hover:scale-110"
            style={{ background: color }}
          >
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-black tracking-tight">{name}</h3>
            <span className={`text-xs font-bold uppercase tracking-wider ${connected ? "text-green-400" : "text-gray-500"}`}>
              {connected ? "✓ Connected" : "Click to connect"}
            </span>
          </div>
        </div>
        <div className={`h-1 rounded-full transition-all duration-700 ${connected ? "bg-green-500 w-full" : "bg-white/10 w-0 group-hover:w-full group-hover:bg-green-500/50"}`} />
      </div>
    </ScrollReveal>
  );
}

/* ─── MAIN LANDING PAGE ─── */
export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    const handleMouse = (e: MouseEvent) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20,
      });
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouse);
    };
  }, []);

  const navOpacity = Math.min(scrollY / 300, 0.95);

  return (
    <main className="min-h-screen bg-[#0D0C11] text-white overflow-x-hidden selection:bg-green-500/30">
      <FloatingParticles />

      {/* ═══════════════════════════════════════════════ */}
      {/* 🧭 STICKY NAVIGATION                           */}
      {/* ═══════════════════════════════════════════════ */}
      <nav
        className="fixed top-0 w-full z-[100] flex items-center justify-between px-8 md:px-16 py-6 transition-all duration-500"
        style={{ backgroundColor: `rgba(13,12,17,${navOpacity > 0.5 ? 0.95 : navOpacity})` }}
      >
        <div className="text-3xl md:text-4xl font-black text-green-600 tracking-tighter cursor-pointer hover:opacity-80 transition-opacity">
          CineNova
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/login">
            <button className="text-gray-300 hover:text-white font-bold px-4 md:px-6 py-2.5 rounded-xl transition-all hover:bg-white/5 text-sm md:text-base">
              Sign In
            </button>
          </Link>
          <Link href="/signup">
            <button className="bg-green-600 hover:bg-green-500 text-white font-black px-5 md:px-8 py-2.5 rounded-xl transition-all transform active:scale-95 shadow-[0_10px_30px_rgba(147,51,234,0.3)] text-sm md:text-base uppercase tracking-wider">
              Get Started
            </button>
          </Link>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════ */}
      {/* 🎬 HERO SECTION                                */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center justify-center px-8 md:px-16 overflow-hidden">
        {/* Animated background orbs */}
        <div
          className="absolute w-[700px] h-[700px] bg-green-600/15 rounded-full blur-[150px] pointer-events-none"
          style={{
            top: "20%",
            left: "20%",
            transform: `translate(${mousePos.x * 0.5}px, ${mousePos.y * 0.5}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />
        <div
          className="absolute w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"
          style={{
            bottom: "10%",
            right: "15%",
            transform: `translate(${mousePos.x * -0.3}px, ${mousePos.y * -0.3}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />
        <div
          className="absolute w-[300px] h-[300px] bg-pink-500/8 rounded-full blur-[100px] pointer-events-none"
          style={{
            top: "60%",
            left: "60%",
            transform: `translate(${mousePos.x * 0.7}px, ${mousePos.y * 0.7}px)`,
            transition: "transform 0.3s ease-out",
          }}
        />

        {/* Grid overlay effect */}
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: "linear-gradient(rgba(147,51,234,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(147,51,234,0.3) 1px, transparent 1px)",
          backgroundSize: "80px 80px"
        }} />

        <div className="relative z-10 text-center max-w-6xl mx-auto">
          <div
            className="inline-block mb-8"
            style={{ transform: `translateY(${scrollY * -0.1}px)` }}
          >
            <span className="text-green-500 font-black tracking-[0.5em] uppercase text-xs md:text-sm bg-green-500/10 border border-green-500/20 px-6 py-3 rounded-full">
              ✦ The Future of Streaming
            </span>
          </div>

          <h1
            className="text-6xl sm:text-7xl md:text-8xl lg:text-[10rem] font-black tracking-tighter uppercase leading-[0.85] mb-8"
            style={{ transform: `translateY(${scrollY * -0.15}px)` }}
          >
            <span className="block bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
              Cine
            </span>
            <span className="block bg-gradient-to-r from-green-400 via-green-600 to-emerald-700 bg-clip-text text-transparent">
              Nova
            </span>
          </h1>

          <p
            className="text-gray-400 text-lg md:text-2xl max-w-2xl mx-auto mb-12 leading-relaxed font-medium"
            style={{ transform: `translateY(${scrollY * -0.05}px)` }}
          >
            Connect all your streaming platforms in one place. Netflix, Disney+, Hulu, and more — unified in a single, stunning interface.
          </p>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-5"
            style={{ transform: `translateY(${scrollY * -0.02}px)` }}
          >
            <Link href="/signup">
              <button className="group relative bg-white text-black px-12 md:px-16 py-5 rounded-2xl font-black text-lg hover:bg-green-600 hover:text-white transition-all transform active:scale-95 shadow-[0_15px_40px_rgba(255,255,255,0.1)] hover:shadow-[0_20px_50px_rgba(34,197,94,0.3)] uppercase tracking-wider overflow-hidden">
                <span className="relative z-10">Start Watching Free</span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </button>
            </Link>
            <Link href="/login">
              <button className="bg-[#18171F] text-white px-12 md:px-16 py-5 rounded-2xl font-black text-lg border border-white/5 hover:bg-[#1E1D25] hover:border-green-500/30 transition-all uppercase tracking-wider">
                Sign In
              </button>
            </Link>
          </div>

          {/* Floating movie posters preview */}
          <div className="mt-20 md:mt-28 relative">
            <div className="flex items-end justify-center gap-3 md:gap-6 perspective-1000">
              {[
                { img: "https://m.media-amazon.com/images/M/MV5BMTM0MDgwNjMyMl5BMl5BanBnXkFtZTcwNTg3NzAzMw@@._V1_SX300.jpg", rotation: -8, y: 20 },
                { img: "https://m.media-amazon.com/images/M/MV5BNDE4OTMxMTctNmRhYy00NWE2LTg3YzItYTk3M2UwOTU5Njg4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg", rotation: -4, y: 0 },
                { img: "https://m.media-amazon.com/images/M/MV5BZjdkOTU3MDktN2IxOS00OGEyLWFmMjktY2FiMmZkNWIyODZiXkEyXkFqcGdeQXVyMTMxODk2OTU@._V1_SX300.jpg", rotation: 0, y: -10 },
                { img: "https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_SX300.jpg", rotation: 4, y: 0 },
                { img: "https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_SX300.jpg", rotation: 8, y: 20 },
              ].map((poster, i) => (
                <div
                  key={i}
                  className="w-28 md:w-44 lg:w-52 aspect-[2/3] rounded-2xl md:rounded-[2rem] overflow-hidden border border-white/10 shadow-2xl hover:scale-110 hover:z-10 hover:border-green-500/50 transition-all duration-700 cursor-pointer"
                  style={{
                    transform: `rotate(${poster.rotation}deg) translateY(${poster.y + scrollY * 0.03}px)`,
                    transition: "transform 0.5s ease-out",
                  }}
                >
                  <img
                    src={poster.img}
                    alt="Movie poster"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
            {/* Glowing reflection */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-40 bg-gradient-to-t from-[#0D0C11] via-[#0D0C11]/80 to-transparent z-10" />
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 animate-bounce">
          <span className="text-gray-500 text-xs font-bold uppercase tracking-[0.3em]">Scroll</span>
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-green-500 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 📊 STATS BAR                                   */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-8 md:px-16 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { value: 6, suffix: "+", label: "Major Networks" },
            { value: 0, suffix: " Ads", label: "Pure Streaming" },
            { value: 100, suffix: "%", label: "Unified Experience" },
            { value: 1, suffix: " Hub", label: "All Your Content" },
          ].map((stat, i) => (
            <ScrollReveal key={i} delay={i * 150}>
              <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              <p className="text-gray-500 mt-3 font-bold uppercase tracking-wider text-xs md:text-sm">{stat.label}</p>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* ✨ FEATURES SECTION                            */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative py-32 px-8 md:px-16">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-green-600/5 rounded-full blur-[200px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-24">
              <span className="text-green-500 font-black tracking-[0.4em] uppercase text-xs md:text-sm mb-6 block">Why CineNova</span>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
                All Your Streams<br />
                <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">One Hub</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-8 mt-16">
            <FeatureCard
              icon="🔗"
              title="Universal Connect"
              description="Link Netflix, Disney+, Hulu, HBO Max, Prime Video and more. All your subscriptions, one unified library."
              delay={0}
            />
            <FeatureCard
              icon="🔍"
              title="Universal Search"
              description="Search once, find everywhere. No more switching between apps to find that movie you're looking for."
              delay={150}
            />
            <FeatureCard
              icon="✨"
              title="Smart Watchlists"
              description="Create cross-platform watchlists. Track what to watch next regardless of which service it's on."
              delay={300}
            />
            <FeatureCard
              icon="🤖"
              title="AI Recommendations"
              description="Our AI analyzes your taste across all platforms and suggests hidden gems from any connected service."
              delay={450}
            />
            <FeatureCard
              icon="📊"
              title="Watch Analytics"
              description="See your viewing habits across every platform. Know exactly where your entertainment time goes."
              delay={600}
            />
            <FeatureCard
              icon="👥"
              title="Shared Profiles"
              description="Family members can have their own unified profiles, with separate recommendations and watchlists."
              delay={750}
            />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 🖥️ DEVICE SHOWCASE                             */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative py-32 px-8 md:px-16 overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal>
              <span className="text-green-500 font-black tracking-[0.4em] uppercase text-xs md:text-sm mb-6 block">Seamless Experience</span>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.9] mb-8">
                One Account.<br />
                <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">Every Device.</span>
              </h2>
              <p className="text-gray-400 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
                Start watching on your TV, pick up where you left off on your phone. CineNova syncs seamlessly across all your devices.
              </p>
              <div className="flex flex-wrap gap-4">
                {["📺 Smart TV", "💻 Laptop", "📱 Mobile", "🎮 Console"].map((device, i) => (
                  <span key={i} className="bg-white/5 border border-white/10 px-5 py-3 rounded-xl text-sm font-bold text-gray-300 hover:border-green-500/30 hover:bg-green-500/5 transition-all cursor-default">
                    {device}
                  </span>
                ))}
              </div>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <div className="relative">
                {/* Main "screen" mockup */}
                <div className="relative bg-[#18171F] rounded-[2rem] border border-white/5 overflow-hidden aspect-video shadow-[0_30px_60px_rgba(0,0,0,0.5)]">
                  <div className="absolute inset-0 bg-gradient-to-tr from-green-600/5 via-transparent to-emerald-600/5" />
                  <div className="p-6 md:p-8 relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-3 h-3 rounded-full bg-red-500/60" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                      <div className="w-3 h-3 rounded-full bg-green-500/60" />
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 bg-white/10 rounded-full w-3/4" />
                      <div className="h-4 bg-white/5 rounded-full w-1/2" />
                      <div className="mt-6 grid grid-cols-3 gap-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="aspect-[2/3] bg-[#1E1D25] rounded-xl border border-white/5" style={{ animationDelay: `${i * 0.5}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating phone mockup */}
                <div className="absolute -bottom-6 -right-6 md:-bottom-8 md:-right-8 w-28 md:w-36 bg-[#131217] rounded-3xl border border-white/10 p-2 md:p-3 shadow-2xl transform rotate-6 hover:rotate-0 transition-transform duration-700">
                  <div className="aspect-[9/16] bg-[#18171F] rounded-2xl overflow-hidden border border-white/5">
                    <div className="p-2 space-y-2 mt-4">
                      <div className="h-2 bg-white/10 rounded-full w-3/4" />
                      <div className="h-2 bg-white/5 rounded-full w-1/2" />
                      <div className="mt-3 aspect-video bg-[#1E1D25] rounded-lg" />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 🔗 CONNECT YOUR PLATFORMS SECTION               */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative py-32 px-8 md:px-16">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-green-500/30 to-transparent" />

        <div className="max-w-7xl mx-auto relative z-10">
          <ScrollReveal>
            <div className="text-center mb-8">
              <span className="text-green-500 font-black tracking-[0.4em] uppercase text-xs md:text-sm mb-6 block">Streaming Hub</span>
              <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
                Connect Your<br />
                <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">Platforms</span>
              </h2>
            </div>
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto text-center mb-16 leading-relaxed">
              Link your existing streaming subscriptions and browse everything in one beautiful interface. Click to try connecting!
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <PlatformCard name="Netflix" color="#E50914" icon="N" delay={0} />
            <PlatformCard name="Disney+" color="#113CCF" icon="D" delay={100} />
            <PlatformCard name="HBO Max" color="#5822B4" icon="H" delay={200} />
            <PlatformCard name="Amazon Prime" color="#00A8E1" icon="P" delay={300} />
            <PlatformCard name="Hulu" color="#1CE783" icon="h" delay={400} />
            <PlatformCard name="Apple TV+" color="#555555" icon="▶" delay={500} />
          </div>

          {/* How it works mini-flow */}
          <ScrollReveal delay={300}>
            <div className="mt-24 max-w-4xl mx-auto">
              <h3 className="text-2xl font-black text-center mb-12 uppercase tracking-tight text-gray-300">How It Works</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { step: "01", title: "Connect", desc: "Sign in to your existing streaming accounts through our secure OAuth integration." },
                  { step: "02", title: "Discover", desc: "Browse your entire library from all platforms in one unified, intelligent interface." },
                  { step: "03", title: "Enjoy", desc: "Click play and we'll launch the right app. Seamless, effortless entertainment." },
                ].map((item, i) => (
                  <div key={i} className="text-center group">
                    <div className="text-5xl font-black text-green-600/30 mb-4 group-hover:text-green-500/60 transition-colors">{item.step}</div>
                    <h4 className="text-xl font-black uppercase tracking-tight mb-3 group-hover:text-green-400 transition-colors">{item.title}</h4>
                    <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 💬 TESTIMONIALS                                */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative py-32 px-8 md:px-16">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-20">
              <span className="text-green-500 font-black tracking-[0.4em] uppercase text-xs md:text-sm mb-6 block">Our Promise</span>
              <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
                A Better <span className="bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">Way to Watch</span>
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "No Extra Fees",
                description: "CineNova acts as your unified remote control. There are no hidden fees. If you have the subscription, you have the content.",
                icon: "💳",
              },
              {
                title: "Privacy First",
                description: "We don't track what you watch to sell ads. Your watch history is securely stored to improve your own personalized recommendations.",
                icon: "🔒",
              },
              {
                title: "Always Ad-Free",
                description: "Our interface is 100% ad-free. We believe finding what to watch should be an enjoyable experience, not an advertising opportunity.",
                icon: "🚫",
              },
            ].map((feature, i) => (
              <ScrollReveal key={i} delay={i * 200}>
                <div className="bg-[#18171F] border border-white/5 rounded-[2rem] p-8 md:p-10 hover:border-green-500/30 transition-all duration-500 hover:-translate-y-2 h-full shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(34,197,94,0.1)]">
                  <div className="text-4xl mb-6">{feature.icon}</div>
                  <h3 className="font-black text-white text-xl tracking-tight mb-4 uppercase">{feature.title}</h3>
                  <p className="text-gray-400 text-base leading-relaxed">{feature.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 🚀 FINAL CTA                                  */}
      {/* ═══════════════════════════════════════════════ */}
      <section className="relative py-32 px-8 md:px-16 overflow-hidden">
        {/* CTA Background effects */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-900/10 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-600/15 rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <ScrollReveal>
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter uppercase leading-[0.85] mb-8">
              Ready to<br />
              <span className="bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent">Start Watching?</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl max-w-xl mx-auto mb-12 leading-relaxed">
              Join millions of users. Create your account in seconds, connect your platforms, and unify your streaming world.
            </p>
            <Link href="/signup">
              <button className="group relative bg-green-600 hover:bg-green-500 text-white px-16 py-6 rounded-2xl font-black text-xl uppercase tracking-wider transition-all transform active:scale-95 shadow-[0_15px_40px_rgba(34,197,94,0.3)] hover:shadow-[0_20px_50px_rgba(34,197,94,0.4)]">
                Create Account
                <span className="ml-3 inline-block group-hover:translate-x-1 transition-transform">→</span>
              </button>
            </Link>
            <p className="text-gray-600 text-sm mt-6 font-bold">Unify your streaming experience</p>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════ */}
      {/* 🏠 FOOTER                                      */}
      {/* ═══════════════════════════════════════════════ */}
      <footer className="border-t border-white/5 py-16 px-8 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="text-3xl font-black text-green-600 tracking-tighter mb-4">CineNova</div>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">Your ultimate streaming hub. Connect Netflix, Disney+, Hulu, and more — all in one beautiful interface.</p>
            </div>
            {[
              {
                title: "Company",
                links: ["About Us", "Careers", "Press", "Blog"],
              },
              {
                title: "Support",
                links: ["Help Center", "Contact Us", "Community", "Status"],
              },
              {
                title: "Legal",
                links: ["Privacy Policy", "Terms of Service", "Cookie Policy", "DMCA"],
              },
            ].map((section, i) => (
              <div key={i}>
                <h4 className="font-black text-sm uppercase tracking-[0.2em] text-gray-300 mb-5">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="text-gray-500 hover:text-green-400 text-sm font-medium transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-600 text-sm font-bold">© 2026 CineNova. All rights reserved.</p>
            <div className="flex items-center gap-6">
              {["Twitter", "Instagram", "YouTube", "Discord"].map((social, i) => (
                <a key={i} href="#" className="text-gray-600 hover:text-green-400 text-sm font-bold transition-colors">{social}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
