import { Filter, ChevronDown, CheckCircle2 } from "lucide-react";
import { cn } from "../lib/utils";

interface FilterSidebarProps {
  activeFilters: {
    category: string;
    store: string;
    discount: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      category: string;
      store: string;
      discount: string;
    }>
  >;
}

const FILTERS = [
  {
    key: "discount",
    name: "Discount Range",
    options: ["Any", "20%+ OFF", "50%+ OFF", "75%+ OFF"],
  },
  {
    key: "store",
    name: "Store",
    options: ["All Stores", "Amazon", "Best Buy", "Walmart", "Target"],
  },
  {
    key: "category",
    name: "Category",
    options: [
      "All Categories",
      "Electronics",
      "Fashion",
      "Home",
      "Gaming",
      "Health",
      "Outdoor",
      "Kitchen",
    ],
  },
];

export function FilterSidebar({
  activeFilters,
  setFilters,
}: FilterSidebarProps) {
  const handleFilterClick = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <aside className="w-72 hidden lg:flex flex-col gap-6 p-6 h-[calc(100vh-120px)] sticky top-28 overflow-y-auto custom-scrollbar">
      <div className="flex items-center gap-2 mb-2">
        <Filter size={18} className="text-indigo-600" />
        <h2 className="font-display font-bold text-lg uppercase tracking-wider text-slate-900">
          Refine Deals
        </h2>
      </div>

      {FILTERS.map((filter) => (
        <div key={filter.name} className="space-y-3">
          <div className="flex justify-between items-center group cursor-pointer">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest group-hover:text-slate-600 transition-colors">
              {filter.name}
            </span>
            <ChevronDown size={14} className="text-slate-300" />
          </div>

          <div className="space-y-2">
            {filter.options.map((option) => {
              const isActive = (activeFilters as any)[filter.key] === option;

              return (
                <label
                  key={option}
                  onClick={() => handleFilterClick(filter.key, option)}
                  className={cn(
                    "flex items-center justify-between group cursor-pointer p-2 rounded-lg transition-all",
                    isActive
                      ? "bg-indigo-50 border border-indigo-100"
                      : "hover:bg-slate-100",
                  )}
                >
                  <span
                    className={cn(
                      "text-sm",
                      isActive
                        ? "text-indigo-700 font-bold"
                        : "text-slate-500 group-hover:text-slate-800",
                    )}
                  >
                    {option}
                  </span>
                  {isActive && (
                    <CheckCircle2 size={14} className="text-indigo-600" />
                  )}
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {/* Trust Context in Sidebar */}
      <div className="mt-auto bg-indigo-50 border border-indigo-100 rounded-2xl p-4 py-6 shadow-sm shadow-indigo-50">
        <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-[0.2em] mb-2 text-center">
          Pro Price Tracking
        </p>
        <p className="text-xs text-slate-500 text-center leading-relaxed font-medium">
          Prices updated every 15 minutes. Verified by Gemini 2.5 Flash
          analysis.
        </p>
      </div>
    </aside>
  );
}
