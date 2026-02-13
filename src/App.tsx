import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { useState, useEffect } from "react";

import AdminDashboard from "./components/AdminDashboard";
import PublicProductGrid from "./components/PublicProductGrid";
import PublicHeader from "./components/PublicHeader";
import { FilterSidebar } from "./components/FilterSidebar";
import AboutPage from "./components/AboutPage";

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentPage, setCurrentPage] = useState("home"); // home, about
  const [filters, setFilters] = useState({
    category: "All Categories",
    store: "All Stores",
    discount: "Any",
  });

  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      setIsAdmin(hash === "#admin");
      if (hash === "#about") setCurrentPage("about");
      else if (hash === "#home" || !hash) setCurrentPage("home");
    };
    window.addEventListener("hashchange", checkHash);
    checkHash(); // Check on initial load
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  const handleNavClick = (page: string) => {
    if (page === "drops") {
      setFilters((prev) => ({ ...prev, discount: "50%+ OFF" }));
      setCurrentPage("home");
      window.location.hash = "#home";
    } else if (page === "categories") {
      setCurrentPage("home");
      window.location.hash = "#home";
      // Smooth scroll to filter sidebar on smaller screens or just ensure it's visible
      document.querySelector("aside")?.scrollIntoView({ behavior: "smooth" });
    } else if (page === "home") {
      setFilters({
        category: "All Categories",
        store: "All Stores",
        discount: "Any",
      });
      setCurrentPage("home");
      window.location.hash = "#home";
    } else if (page === "about") {
      setCurrentPage("about");
      window.location.hash = "#about";
    }
  };

  if (isAdmin) {
    return (
      <Authenticator>
        {({ signOut, user }) => (
          <AdminDashboard signOut={signOut} user={user} />
        )}
      </Authenticator>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen selection:bg-indigo-100 selection:text-indigo-900">
      <PublicHeader
        onAdminClick={() => (window.location.hash = "#admin")}
        onNavClick={handleNavClick}
      />

      <main className="max-w-[1440px] mx-auto min-h-[70vh]">
        {currentPage === "home" ? (
          <div className="flex gap-4 pt-4">
            <FilterSidebar activeFilters={filters} setFilters={setFilters} />

            <div className="flex-1">
              {/* Hero / Page Info */}
              <div className="px-6 mb-8 mt-6">
                <h1 className="text-4xl md:text-5xl font-display font-black mb-2 text-slate-900">
                  Today's <span className="text-indigo-600">Best-in-Class</span>{" "}
                  Deals
                </h1>
                <p className="text-slate-500 max-w-xl text-sm leading-relaxed font-medium">
                  Real-time monitoring from Amazon, Best Buy, and Walmart.
                  Verified prices backed by historical data and AI analysis.
                </p>
              </div>

              <PublicProductGrid activeFilters={filters} />
            </div>
          </div>
        ) : (
          <AboutPage />
        )}
      </main>

      {/* Footer / FTC Disclosure Global */}
      <footer className="py-12 border-t border-slate-200 text-center mt-20">
        <div className="inline-flex bg-white border border-slate-200 px-4 py-2 rounded-full items-center gap-2 shadow-sm">
          <span className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold">
            Affiliate Disclosure: Earns commissions on qualified purchases
          </span>
        </div>
      </footer>
    </div>
  );
}

export default App;
