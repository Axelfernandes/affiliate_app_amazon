import {
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Zap,
  BarChart3,
  Globe,
  Github,
  Linkedin,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      {/* Hero Section */}
      <div className="text-center mb-20">
        <div className="inline-flex bg-indigo-50 border border-indigo-100 p-4 rounded-3xl mb-8 shadow-sm shadow-indigo-50">
          <TrendingUp className="text-indigo-600" size={48} />
        </div>
        <h1 className="text-5xl md:text-6xl font-display font-black text-slate-900 mb-6 leading-tight">
          The Future of <span className="text-indigo-600">Smart Shopping</span>
        </h1>
        <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
          AutoNiche isn't just a deals site. It's a high-velocity intelligence
          engine designed to find, verify, and track the best value on the
          internet.
        </p>
      </div>

      {/* The AI Forge Logic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-indigo-50/50 transition-all duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-indigo-900 group-hover:scale-110 transition-transform duration-700">
            <Sparkles size={120} />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-indigo-600 p-2.5 rounded-xl">
              <Sparkles className="text-white" size={20} />
            </div>
            <h2 className="text-2xl font-display font-black text-slate-900">
              The AI Forge
            </h2>
          </div>
          <p className="text-slate-600 leading-relaxed font-medium mb-6">
            Every deal on our platform is "Forged" using Google Gemini 2.5
            Flash. We don't just copy-paste; our AI analyzes technical specs,
            compares historical data, and generates a factual, unbiased review
            for every single item.
          </p>
          <div className="flex flex-wrap gap-2">
            {["Factual Integrity", "Speed", "Precision"].map((tag) => (
              <span
                key={tag}
                className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-slate-100"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-10 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-emerald-50/50 transition-all duration-500">
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] text-emerald-900 group-hover:scale-110 transition-transform duration-700">
            <ShieldCheck size={120} />
          </div>
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-600 p-2.5 rounded-xl">
              <ShieldCheck className="text-white" size={20} />
            </div>
            <h2 className="text-2xl font-display font-black text-slate-900">
              Verified Delta
            </h2>
          </div>
          <p className="text-slate-600 leading-relaxed font-medium mb-6">
            Fake discounts are a plague. AutoNiche uses real-time API feeds from
            Amazon, Best Buy, and Walmart to track 1:1 price history. If we say
            it's 50% off, it's 50% off from the actual 30-day average.
          </p>
          <div className="flex flex-wrap gap-2">
            {["No Fake MSRP", "Real-Time Feeds", "Anti-Spam"].map((tag) => (
              <span
                key={tag}
                className="bg-emerald-50 text-emerald-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-100"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tech Stack Summary */}
      <div className="bg-slate-900 rounded-[3rem] p-12 text-white relative overflow-hidden border border-slate-800 shadow-2xl mb-24">
        <div className="absolute inset-0 bg-linear-to-br from-indigo-500/10 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h2 className="text-3xl font-display font-black">
              Built for Velocity
            </h2>
            <p className="text-slate-400 font-medium leading-relaxed">
              Our infrastructure is distributed across AWS Amplify's global edge
              network. From sub-60ms load times to real-time price drops, we
              leverage the most powerful cloud primitives available today.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Zap size={16} className="text-indigo-400" />
                <span className="text-sm font-bold text-slate-200">
                  Edge Optimized
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 size={16} className="text-indigo-400" />
                <span className="text-sm font-bold text-slate-200">
                  Recharts Visualization
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-indigo-400" />
                <span className="text-sm font-bold text-slate-200">
                  Multi-Retailer API
                </span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-indigo-400" />
                <span className="text-sm font-bold text-slate-200">
                  Real-Time Sync
                </span>
              </div>
            </div>
          </div>
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 p-2 rounded-[2rem] shadow-2xl">
            <div className="bg-white/10 p-8 rounded-[1.5rem] flex items-center justify-center">
              <TrendingUp size={64} className="text-indigo-400 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* The Builder Section */}
      <div className="bg-white border border-slate-100 rounded-[2.5rem] p-12 text-center shadow-sm relative overflow-hidden group">
        <div className="absolute -bottom-10 -left-10 p-8 opacity-[0.02] text-indigo-900 rotate-12 group-hover:rotate-0 transition-all duration-700">
          <TrendingUp size={200} />
        </div>

        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.4em] mb-4">
          Architected & Developed By
        </p>
        <h2 className="text-4xl font-display font-black text-slate-900 mb-8">
          Axel Fernandes
        </h2>

        <div className="flex justify-center gap-4 relative z-10">
          <a
            href="https://github.com/axelfernandes"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all hover:scale-105 shadow-lg shadow-slate-100"
          >
            <Github size={20} />
            <span className="text-sm font-bold">GitHub</span>
          </a>
          <a
            href="https://linkedin.com/in/axelfernandes"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-6 py-3 bg-[#0077b5] text-white rounded-2xl hover:bg-[#00669c] transition-all hover:scale-105 shadow-lg shadow-indigo-100"
          >
            <Linkedin size={20} />
            <span className="text-sm font-bold">LinkedIn</span>
          </a>
        </div>
      </div>

      {/* Footer Quote */}
      <div className="mt-20 text-center">
        <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.4em] mb-4">
          Established 2026
        </p>
        <p className="text-slate-400 italic font-medium">
          "The best deal is the one you can verify."
        </p>
      </div>
    </div>
  );
}
