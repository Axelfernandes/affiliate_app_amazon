import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

import ProductCard from "./ProductCard";

interface PublicProductGridProps {
  activeFilters: {
    category: string;
    store: string;
    discount: string;
  };
}

export default function PublicProductGrid({
  activeFilters,
}: PublicProductGridProps) {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const client = generateClient<Schema>();
    // Fetch only PUBLISHED products
    const sub = client.models.Product.observeQuery({
      filter: {
        status: { eq: "PUBLISHED" },
      },
    }).subscribe(({ items }) => {
      setProducts(items);
    });

    return () => sub.unsubscribe();
  }, []);

  const filteredProducts = products.filter((product) => {
    // 1. Category Filter
    if (
      activeFilters.category !== "All Categories" &&
      product.category !== activeFilters.category
    ) {
      return false;
    }

    // 2. Store Filter
    if (
      activeFilters.store !== "All Stores" &&
      product.store !== activeFilters.store
    ) {
      return false;
    }

    // 3. Discount Filter
    if (activeFilters.discount !== "Any") {
      const current = product.currentPrice || 0;
      const original = product.originalPrice || 0;
      const discount =
        original > 0 ? ((original - current) / original) * 100 : 0;

      if (activeFilters.discount === "20%+ OFF" && discount < 20) return false;
      if (activeFilters.discount === "50%+ OFF" && discount < 50) return false;
      if (activeFilters.discount === "75%+ OFF" && discount < 75) return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
        {/* Placeholder cards for a full layout feel if empty */}
        {filteredProducts.length === 0 && products.length > 0 && (
          <div className="col-span-full py-20 text-center">
            <p className="text-slate-400 font-medium">
              No deals match your current filters. Try broadening your search!
            </p>
          </div>
        )}
        {products.length === 0 &&
          Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`placeholder-${i}`}
              className="bg-white border border-slate-100 rounded-3xl animate-pulse h-96 flex flex-col gap-4 p-6 shadow-sm"
            >
              <div className="h-8 w-3/4 bg-slate-50 rounded-lg" />
              <div className="h-12 w-1/2 bg-slate-50 rounded-lg" />
              <div className="mt-auto h-12 w-full bg-slate-50 rounded-lg" />
            </div>
          ))}
      </div>
    </div>
  );
}
