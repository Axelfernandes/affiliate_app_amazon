import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Sparkles, Save, ShieldCheck } from "lucide-react";
import { cn } from "../lib/utils";

interface AddProductFormProps {
  initialData?: any;
  onSuccess?: () => void;
}

export default function AddProductForm({
  initialData,
  onSuccess,
}: AddProductFormProps) {
  const [productName, setProductName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState({
    title: "",
    description: "",
    whyBuy: [] as string[],
    currentPrice: 0,
    originalPrice: 0,
    images: [] as string[],
    category: "Other",
    store: "Other",
  });

  const [selectedImageIndices, setSelectedImageIndices] = useState<number[]>(
    [],
  );

  useEffect(() => {
    if (initialData) {
      setProductName(initialData.productName || "");
      setProductUrl(initialData.sourceUrl || "");
      if (initialData.category || initialData.store) {
        setGeneratedContent((prev) => ({
          ...prev,
          category: initialData.category || prev.category,
          store: initialData.store || prev.store,
        }));
      }
    }
  }, [initialData]);

  const toggleImageSelection = (index: number) => {
    setSelectedImageIndices((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      if (prev.length >= 4) return prev;
      return [...prev, index];
    });
  };

  const handleGenerateContent = async () => {
    if (!productName) return;
    setIsLoading(true);
    setSelectedImageIndices([]); // Reset selection on new fetch
    try {
      const client = generateClient<Schema>();
      const { data, errors } = await client.mutations.generateProductContent({
        productName: productName,
        productUrl: productUrl,
      });
      if (data) {
        let content = typeof data === "string" ? JSON.parse(data) : data;
        setGeneratedContent({
          ...content,
          currentPrice: content.currentPrice || 0,
          originalPrice: content.originalPrice || 0,
          images: content.images || [],
          category: content.category || "Other",
          store: content.store || "Other",
        });
      }
      if (errors) console.error("Error generating content:", errors);
    } catch (e) {
      console.error("Error:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddProduct = async () => {
    if (!productName || !generatedContent.title) return;
    try {
      // Reorder images based on selection
      let finalImages = [...generatedContent.images];
      if (selectedImageIndices.length > 0) {
        const selected = selectedImageIndices.map(
          (i) => generatedContent.images[i],
        );
        const remaining = generatedContent.images.filter(
          (_, i) => !selectedImageIndices.includes(i),
        );
        finalImages = [...selected, ...remaining];
      }

      const client = generateClient<Schema>();
      await (client.models.Product as any).create({
        name: generatedContent.title,
        affiliateLink: productUrl,
        description: generatedContent.description,
        aiReview: generatedContent.whyBuy.join("\n"),
        currentPrice: generatedContent.currentPrice,
        originalPrice: generatedContent.originalPrice,
        images: finalImages,
        category: generatedContent.category,
        store: generatedContent.store,
        priceHistory: JSON.stringify([
          {
            date: new Date().toISOString(),
            price: generatedContent.currentPrice,
          },
        ]),
        status: "PUBLISHED",
      });

      if (initialData?.id) {
        await client.models.Suggestion.delete({ id: initialData.id });
      }

      if (onSuccess) onSuccess();
    } catch (e) {
      console.error("Error adding product:", e);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-1 border-b border-slate-100 pb-8">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
            Initial Intel
          </label>
          <input
            type="text"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-300 focus:border-indigo-400 focus:bg-white transition-all outline-hidden shadow-sm"
            placeholder="Product name or topic..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
            Affiliate Destination
          </label>
          <input
            type="text"
            value={productUrl}
            onChange={(e) => setProductUrl(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 placeholder:text-slate-300 focus:border-indigo-400 focus:bg-white transition-all outline-hidden shadow-sm"
            placeholder="https://www.amazon.com/..."
          />
        </div>
      </div>

      <button
        onClick={handleGenerateContent}
        disabled={isLoading || !productName}
        className="w-full btn-premium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-3 py-4 shadow-lg shadow-indigo-100"
      >
        <Sparkles size={20} className={cn(isLoading && "animate-spin")} />
        {isLoading ? "AI FORGING DATA..." : "FORGE CONTENT WITH AI"}
      </button>

      {generatedContent.title && (
        <div className="space-y-6 animate-in slide-in-from-bottom-6 duration-700">
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] text-indigo-900">
              <Sparkles size={80} />
            </div>

            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-indigo-600" />
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                  AI Output Verified
                </span>
              </div>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.1em]">
                Click images to set display order (Max 4)
              </span>
            </div>

            {generatedContent.images.length > 0 && (
              <div className="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-indigo-100 scrollbar-track-transparent">
                {generatedContent.images.map((img, i) => {
                  const selectionIndex = selectedImageIndices.indexOf(i);
                  const isSelected = selectionIndex !== -1;

                  return (
                    <div
                      key={i}
                      onClick={() => toggleImageSelection(i)}
                      className={cn(
                        "relative group shrink-0 cursor-pointer transition-all duration-300",
                        isSelected ? "scale-95" : "hover:scale-[1.02]",
                      )}
                    >
                      <img
                        src={img}
                        alt={`Product ${i}`}
                        className={cn(
                          "w-48 h-48 object-cover rounded-2xl border transition-all shadow-sm",
                          isSelected
                            ? "border-indigo-500 ring-4 ring-indigo-500/20 shadow-indigo-100"
                            : "border-indigo-100 border-dashed hover:border-indigo-300",
                        )}
                      />
                      {isSelected ? (
                        <div className="absolute top-3 left-3 bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shadow-xl animate-in zoom-in-50 duration-300">
                          {selectionIndex + 1}
                        </div>
                      ) : (
                        <div className="absolute top-3 left-3 bg-white/40 backdrop-blur-md text-indigo-900/40 w-8 h-8 rounded-full flex items-center justify-center font-black text-sm border border-white/40 opacity-0 group-hover:opacity-100 transition-opacity">
                          +
                        </div>
                      )}
                      <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-0.5 rounded-md text-[10px] font-bold text-indigo-600 shadow-sm border border-indigo-50">
                        {isSelected
                          ? `Display #${selectionIndex + 1}`
                          : `Option ${i + 1}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="grid gap-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Engineered Title
                  </span>
                  <input
                    type="text"
                    value={generatedContent.title}
                    onChange={(e) =>
                      setGeneratedContent((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-2 text-lg font-display font-black text-slate-900 focus:border-indigo-400 outline-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Store
                    </span>
                    <select
                      value={generatedContent.store}
                      onChange={(e) =>
                        setGeneratedContent((prev) => ({
                          ...prev,
                          store: e.target.value,
                        }))
                      }
                      className="w-full bg-white border border-indigo-100 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-indigo-400"
                    >
                      {["Amazon", "Best Buy", "Walmart", "Target", "Other"].map(
                        (s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ),
                      )}
                    </select>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Category
                    </span>
                    <select
                      value={generatedContent.category}
                      onChange={(e) =>
                        setGeneratedContent((prev) => ({
                          ...prev,
                          category: e.target.value,
                        }))
                      }
                      className="w-full bg-white border border-indigo-100 rounded-xl px-3 py-2 text-sm font-bold text-slate-700 outline-none focus:border-indigo-400"
                    >
                      {[
                        "Electronics",
                        "Fashion",
                        "Home",
                        "Gaming",
                        "Health",
                        "Outdoor",
                        "Kitchen",
                        "Other",
                      ].map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Persuasive Logic
                </span>
                <textarea
                  value={generatedContent.description}
                  onChange={(e) =>
                    setGeneratedContent((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full bg-white border border-indigo-100 rounded-xl px-4 py-3 text-sm text-slate-600 leading-relaxed font-medium outline-none focus:border-indigo-400 h-24 resize-none"
                />
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Why Buy Context
                </span>
                <ul className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {generatedContent.whyBuy.map((point, i) => (
                    <li
                      key={i}
                      className="bg-white p-3 rounded-xl border border-indigo-50 shadow-sm text-xs text-indigo-700 font-semibold leading-tight"
                    >
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex items-center gap-6 pt-4 border-t border-indigo-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Captured Price
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-display font-black text-slate-900">
                      ${generatedContent.currentPrice}
                    </span>
                    {generatedContent.originalPrice >
                      generatedContent.currentPrice && (
                      <span className="text-sm text-slate-400 line-through font-medium">
                        ${generatedContent.originalPrice}
                      </span>
                    )}
                  </div>
                </div>
                <div className="h-10 w-px bg-slate-200" />
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Savings Delta
                  </span>
                  <p className="text-lg font-display font-black text-emerald-600">
                    {generatedContent.originalPrice > 0
                      ? `${Math.round((1 - generatedContent.currentPrice / generatedContent.originalPrice) * 100)}% OFF`
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddProduct}
            className="w-full btn-premium bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-2 py-4 shadow-lg shadow-emerald-100"
          >
            <Save size={20} />
            DEPLOY TO STOREFRONT
          </button>
        </div>
      )}
    </div>
  );
}
