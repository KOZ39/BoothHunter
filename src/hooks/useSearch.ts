import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  searchBooth,
  cacheItems,
  saveSearchHistory,
  enrichWithWishCount,
} from "../lib/booth-api";
import type { SearchParams, BoothItem } from "../lib/types";

export function useSearch() {
  const [params, setParams] = useState<SearchParams | null>(null);
  const [enrichedItems, setEnrichedItems] = useState<BoothItem[]>([]);
  const [isEnriching, setIsEnriching] = useState(false);
  const enrichAbort = useRef<AbortController | null>(null);

  const query = useQuery({
    queryKey: ["search", params],
    queryFn: async () => {
      if (!params) throw new Error("No params");
      const result = await searchBooth(params);
      // Fire-and-forget DB side effects (non-blocking)
      cacheItems(result.items).catch((e) =>
        console.error("Failed to cache items:", e),
      );
      saveSearchHistory(params.keyword).catch((e) =>
        console.error("Failed to save search history:", e),
      );
      return result;
    },
    enabled: !!params,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });

  // Run wish count enrichment when search results arrive
  useEffect(() => {
    const items = query.data?.items;
    if (!items || items.length === 0) {
      setEnrichedItems([]);
      setIsEnriching(false);
      return;
    }

    // Show results immediately (without wish counts)
    setEnrichedItems(items);

    // Skip enrichment if all items already have wish counts
    const needsEnrichment = items.some((i) => i.wish_lists_count == null);
    if (!needsEnrichment) {
      setIsEnriching(false);
      return;
    }

    // Abort any in-flight enrichment
    enrichAbort.current?.abort();
    const controller = new AbortController();
    enrichAbort.current = controller;

    setIsEnriching(true);
    enrichWithWishCount(items, (updated) => {
      if (!controller.signal.aborted) {
        setEnrichedItems(updated);
      }
    })
      .then((final) => {
        if (!controller.signal.aborted) {
          setEnrichedItems(final);
          // Re-cache items with wish counts
          cacheItems(final).catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsEnriching(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [query.data?.items]);

  // Client-side wish count filter
  const minWishCount = params?.min_wish_count;
  const filteredItems =
    minWishCount != null && minWishCount > 0
      ? enrichedItems.filter(
          (item) =>
            item.wish_lists_count != null &&
            item.wish_lists_count >= minWishCount,
        )
      : enrichedItems;

  const search = useCallback(
    (keyword: string, extra?: Partial<SearchParams>) => {
      setParams({ keyword, page: 1, ...extra });
    },
    [],
  );

  const setPage = useCallback((page: number) => {
    setParams((prev) => (prev ? { ...prev, page } : null));
  }, []);

  const updateFilters = useCallback((filters: Partial<SearchParams>) => {
    setParams((prev) => {
      if (prev) {
        // min_wish_count is client-side only, don't reset page for it
        if (
          Object.keys(filters).length === 1 &&
          "min_wish_count" in filters
        ) {
          return { ...prev, ...filters };
        }
        return { ...prev, ...filters, page: 1 };
      }
      return { keyword: "", page: 1, ...filters };
    });
  }, []);

  return {
    search,
    setPage,
    updateFilters,
    items: filteredItems,
    totalCount: query.data?.total_count ?? null,
    currentPage: query.data?.current_page ?? 1,
    isLoading: query.isLoading || query.isFetching,
    isEnriching,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : String(query.error)
      : null,
    hasSearched: !!params,
    currentParams: params,
  };
}
