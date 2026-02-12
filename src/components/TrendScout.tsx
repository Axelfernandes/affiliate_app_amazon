import { useState } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Check, Bookmark, Search, Cpu, Zap, ExternalLink } from "lucide-react";
import { cn } from "../lib/utils";

type Suggestion = {
  productName: string;
  sourceUrl: string;
  reasonForSuggestion: string;
};

export default function TrendScout() {
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [savedIndices, setSavedIndices] = useState<Set<number>>(new Set());

  const handleFindTrends = async () => {
    if (!searchQuery) return;
    setIsLoading(true);
    setSuggestions([]);
    setSavedIndices(new Set());
    try {
      const client = generateClient<Schema>();
      const { data, errors } = await client.queries.findTrends({
        query: searchQuery,
      });
      if (data) {
        let trends = typeof data === "string" ? JSON.parse(data) : data;
        setSuggestions(trends);
      }
      if (errors) console.error("Error finding trends:", errors);
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestionAsProduct = async (
    suggestion: Suggestion,
    index: number,
  ) => {
    if (savedIndices.has(index)) return;

    try {
      const client = generateClient<Schema>();
      await client.models.Suggestion.create({
        productName: suggestion.productName,
        sourceUrl: suggestion.sourceUrl,
        reasonForSuggestion: suggestion.reasonForSuggestion,
      });
      setSavedIndices((prev) => new Set(prev).add(index));
    } catch (e) {
      console.error("Error saving suggestion:", e);
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col items-center justify-center p-12 bg-indigo-50/50 border border-indigo-100 rounded-3xl text-center gap-8">
        <div className="p-4 bg-indigo-600/10 rounded-full animate-pulse">
          <Zap className="text-indigo-600" size={32} />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-display font-black text-slate-900">
            AI TREND SCANNER
          </h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto font-medium">
            Steer Gemini 2.5 Flash to discover high-velocity products in any
            niche.
          </p>
        </div>

        <div className="w-full max-w-lg relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search
              size={18}
              className="text-slate-400 group-focus-within:text-indigo-600 transition-colors"
            />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleFindTrends()}
            placeholder="e.g. tech gadgets, kitchen gear, outdoor essentials..."
            className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-slate-900 placeholder:text-slate-300 focus:border-indigo-400 outline-hidden transition-all shadow-sm"
          />
        </div>

        <button
          onClick={handleFindTrends}
          disabled={isLoading || !searchQuery}
          className="btn-premium bg-indigo-600 text-white px-10 py-4 font-black shadow-lg shadow-indigo-100 hover:scale-105 active:scale-95 disabled:grayscale"
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Cpu className="animate-spin" size={20} />
              ANALYZING MARKETS...
            </div>
          ) : (
            "START SCAN"
          )}
        </button>
      </div>

      {suggestions.length > 0 && (
        <div className="space-y-6 animate-in slide-in-from-bottom-8 duration-700">
          <div className="flex items-center gap-3">
            <div className="h-px bg-slate-100 flex-1" />
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">
              Scout Results
            </h4>
            <div className="h-px bg-slate-100 flex-1" />
          </div>

          <div className="grid gap-4">
            {suggestions.map((suggestion, i) => {
              const isSaved = savedIndices.has(i);
              return (
                <div
                  key={i}
                  className="p-6 bg-white border border-slate-100 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:border-indigo-100 hover:bg-slate-50/50 transition-all shadow-sm"
                >
                  <div className="flex-1 space-y-2">
                    <p className="font-display font-black text-slate-900 text-xl">
                      {suggestion.productName}
                    </p>
                    <p className="text-sm text-slate-500 leading-relaxed font-medium">
                      {suggestion.reasonForSuggestion}
                    </p>
                    <a
                      href={suggestion.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] font-bold text-indigo-600/60 hover:text-indigo-600 inline-flex items-center gap-1 uppercase tracking-widest transition-colors"
                    >
                      <ExternalLink size={12} />
                      Verify Source
                    </a>
                  </div>
                  <button
                    onClick={() => handleAddSuggestionAsProduct(suggestion, i)}
                    disabled={isSaved}
                    className={cn(
                      "shrink-0 btn-premium flex items-center gap-2 px-6 py-3",
                      isSaved
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default"
                        : "bg-white text-slate-900 border border-slate-200 hover:bg-emerald-600 hover:text-white hover:border-transparent",
                    )}
                  >
                    {isSaved ? <Check size={18} /> : <Bookmark size={18} />}
                    <span className="text-xs uppercase font-black">
                      {isSaved ? "COLLECTED" : "SAVE TO INBOX"}
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
