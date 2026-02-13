import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import {
  Trash2,
  ExternalLink,
  Check,
  X,
  RefreshCw,
  Layers,
} from "lucide-react";
import { cn } from "../lib/utils";

export default function ProductList() {
  const [products, setProducts] = useState<Schema["Product"]["type"][]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const client = generateClient<Schema>();
      const { data } = await client.models.Product.list();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const client = generateClient<Schema>();
      await client.models.Product.delete({ id });
      setProducts((prev) => prev.filter((p) => p.id !== id));
      setConfirmingDelete(null);
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-3">
          <Layers className="text-indigo-600" size={20} />
          <h4 className="text-lg font-display font-bold text-slate-800 uppercase tracking-wider">
            Inventory Hub
          </h4>
        </div>
        <button
          onClick={fetchProducts}
          disabled={isLoading}
          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={cn(isLoading && "animate-spin")} />
        </button>
      </div>

      {isLoading && products.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-slate-400 font-medium">Syncing content...</p>
        </div>
      ) : products.length === 0 ? (
        <div className="p-20 text-center border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
          <p className="text-slate-400 font-display font-bold text-xl uppercase tracking-widest">
            Empty Vault
          </p>
          <p className="text-slate-400/60 mt-2">
            Generate or add products to see them here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="p-6 bg-white border border-slate-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group hover:border-indigo-100 hover:bg-slate-50/50 transition-all duration-300 shadow-sm"
            >
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3">
                  <h5 className="font-display font-bold text-slate-900 text-xl leading-none">
                    {product.name}
                  </h5>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                      product.status === "PUBLISHED"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-slate-100 text-slate-500",
                    )}
                  >
                    {product.status}
                  </span>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed shrink-0">
                  {product.description}
                </p>
                <div className="flex items-center gap-4">
                  <a
                    href={product.affiliateLink || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors uppercase tracking-widest"
                  >
                    <ExternalLink size={12} />
                    View Live Link
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {confirmingDelete === product.id ? (
                  <div className="flex items-center gap-2 bg-red-50 p-2 rounded-xl border border-red-100">
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md"
                    >
                      <Check size={18} />
                    </button>
                    <button
                      onClick={() => setConfirmingDelete(null)}
                      className="p-2 text-slate-400 rounded-lg hover:bg-slate-100"
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmingDelete(product.id)}
                    className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    title="Evict Product"
                  >
                    <Trash2 size={20} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
