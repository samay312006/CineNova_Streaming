"use client";

import { useState, useEffect } from "react";
import { Platform } from "@/lib/tmdb";
import { LucideShieldCheck, LucideLoader2, LucideCheckCircle2, LucideZap } from "lucide-react";

interface ConnectionModalProps {
  platform: Platform;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ConnectionModal({ platform, onSuccess, onCancel }: ConnectionModalProps) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    { label: "Initiating Handshake", sub: "Establishing secure tunnel to " + platform.name },
    { label: "Authenticating", sub: "Verifying credentials with premium node sync" },
    { label: "Syncing Watchlist", sub: "Aggregating personalized content library" },
    { label: "Optimizing Playback", sub: "Configuring high-bitrate streaming routes" },
    { label: "Finalizing", sub: "Integrating with CineNova Hub" }
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step < steps.length) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setStep((s) => s + 1);
            return 0;
          }
          return prev + (Math.random() * 20);
        });
      }, 300);
    } else {
      setTimeout(onSuccess, 1500);
    }
    return () => clearInterval(interval);
  }, [step, onSuccess, steps.length]);

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/90 backdrop-blur-2xl" />
      
      <div className="relative z-10 w-full max-w-lg bg-[#151419] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_0_100px_rgba(34,197,94,0.1)]">
        {/* Progress Bar Background */}
        <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
          <div 
            className="h-full transition-all duration-300 ease-out"
            style={{ 
              width: `${(step / steps.length) * 100}%`,
              backgroundColor: platform.color,
              boxShadow: `0 0 20px ${platform.color}`
            }}
          />
        </div>

        <div className="p-10 text-center">
          {/* Platform Icon */}
          <div className="relative mx-auto w-24 h-24 mb-8">
            <div 
              className="absolute inset-0 rounded-3xl blur-2xl opacity-40 animate-pulse"
              style={{ backgroundColor: platform.color }}
            />
            <div 
              className="relative w-full h-full rounded-3xl flex items-center justify-center text-4xl font-black text-white shadow-2xl transition-transform duration-500 hover:scale-110"
              style={{ backgroundColor: platform.color }}
            >
              {platform.icon}
            </div>
            {step < steps.length ? (
              <div className="absolute -bottom-2 -right-2 bg-gray-900 border border-white/10 p-2 rounded-xl text-green-500 animate-spin">
                <LucideLoader2 size={20} />
              </div>
            ) : (
              <div className="absolute -bottom-2 -right-2 bg-green-500 p-2 rounded-xl text-white animate-bounce">
                <LucideCheckCircle2 size={20} />
              </div>
            )}
          </div>

          {step < steps.length ? (
            <>
              <h2 className="text-3xl font-black tracking-tight mb-2 uppercase italic text-white">
                Connecting <span style={{ color: platform.color }}>{platform.name}</span>
              </h2>
              <p className="text-gray-400 font-medium mb-10 h-6">
                {steps[step].label}...
              </p>

              <div className="space-y-4 mb-2 text-left">
                {steps.map((s, i) => (
                  <div key={i} className={`flex items-start gap-4 transition-all duration-500 ${i === step ? "opacity-100 translate-x-2" : i < step ? "opacity-40" : "opacity-10"}`}>
                    <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${i <= step ? "border-green-500 bg-green-500/10" : "border-white/10"}`}>
                      {i < step && <LucideCheckCircle2 size={12} className="text-green-500" />}
                      {i === step && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />}
                    </div>
                    <div>
                      <div className="text-sm font-bold text-gray-200">{s.label}</div>
                      {i === step && <div className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">{s.sub}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-10 animate-in zoom-in-95 duration-700">
              <div className="mb-6 inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-500 px-6 py-2 rounded-full text-xs font-black tracking-widest uppercase">
                <LucideZap size={14} /> Link Secured
              </div>
              <h2 className="text-5xl font-black tracking-tighter mb-4 text-white">READY TO HUB</h2>
              <p className="text-gray-400 font-medium max-w-xs mx-auto leading-relaxed">
                Your {platform.name} catalog is now unified with CineNova. Enjoy your movies.
              </p>
            </div>
          )}

          <div className="mt-10 flex gap-4">
            {step < steps.length ? (
              <button 
                onClick={onCancel}
                className="flex-1 bg-white/5 border border-white/10 text-gray-400 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all"
              >
                Cancel Link
              </button>
            ) : (
              <button 
                className="flex-1 bg-green-600 text-white py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_10px_30px_rgba(34,197,94,0.3)] animate-pulse"
              >
                Entering CineNova...
              </button>
            )}
          </div>
          
          <div className="mt-6 flex items-center justify-center gap-2 text-gray-600">
            <LucideShieldCheck size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">End-to-End Encrypted Tunnel</span>
          </div>
        </div>
      </div>
    </div>
  );
}
