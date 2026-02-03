import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SearchProvider } from "./lib/SearchContext";
import ErrorBoundary from "./components/common/ErrorBoundary";
import AppLayout from "./components/layout/AppLayout";
import SearchPage from "./pages/SearchPage";
import FavoritesPage from "./pages/FavoritesPage";
import StatsPage from "./pages/StatsPage";
import ItemDetailPage from "./pages/ItemDetailPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <SearchProvider>
          <BrowserRouter>
            <AppLayout>
              <Routes>
                <Route path="/" element={<SearchPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="/item/:id" element={<ItemDetailPage />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </SearchProvider>
      </ErrorBoundary>
    </QueryClientProvider>
  );
}

export default App;
