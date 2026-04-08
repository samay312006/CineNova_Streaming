"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await axios.post("/api/auth/signup", { name, email, password });
      if (response.status === 201) {
        console.log("Signup successful");
        router.push("/login");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "An error occurred during signup.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0D0C11] text-white flex flex-col selection:bg-green-500/30">
      
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-green-600/20 blur-[120px] rounded-full pointer-events-none" />

      {/* 🧭 NAVIGATION */}
      <nav className="absolute top-0 w-full z-[100] flex items-center px-8 md:px-16 py-8">
        <Link href="/">
          <div className="text-4xl font-black text-green-600 tracking-tighter cursor-pointer hover:opacity-80 transition-opacity">
            CineNova
          </div>
        </Link>
      </nav>

      {/* 📝 SIGN UP FORM */}
      <div className="flex-1 flex items-center justify-center p-4 relative z-10 my-24">
        <div className="w-full max-w-lg bg-white/5 backdrop-blur-3xl border border-white/10 p-10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          <h1 className="text-4xl font-black mb-2 tracking-tight uppercase">Join CineNova</h1>
          <p className="text-gray-400 mb-8 font-medium">Create an account and start watching your favorite content today.</p>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 px-4 py-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                className="w-full bg-gray-900/60 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl focus:outline-none focus:border-green-500 transition-all duration-300 placeholder:text-gray-600 text-white shadow-inner"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Email Address</label>
              <input 
                type="email" 
                placeholder="you@example.com" 
                className="w-full bg-gray-900/60 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl focus:outline-none focus:border-green-500 transition-all duration-300 placeholder:text-gray-600 text-white shadow-inner"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-gray-900/60 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl focus:outline-none focus:border-green-500 transition-all duration-300 placeholder:text-gray-600 text-white shadow-inner"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-2 uppercase tracking-wider">Confirm</label>
                <input 
                  type="password" 
                  placeholder="••••••••" 
                  className="w-full bg-gray-900/60 backdrop-blur-md border border-white/10 px-6 py-4 rounded-2xl focus:outline-none focus:border-green-500 transition-all duration-300 placeholder:text-gray-600 text-white shadow-inner"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-white text-black px-6 py-5 rounded-2xl font-black text-lg hover:bg-green-600 hover:text-white transition-all transform active:scale-95 shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:shadow-[0_20px_50px_rgba(147,51,234,0.3)] mt-6 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/10 text-center font-medium">
            <span className="text-gray-400">Already have an account? </span>
            <Link href="/login">
              <span className="text-green-500 hover:text-green-400 font-bold transition-colors cursor-pointer">Sign in.</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
