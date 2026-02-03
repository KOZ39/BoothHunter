import { useState } from "react";
import { Filter, X, Heart } from "lucide-react";
import { clsx } from "clsx";
import { UI_TEXT, SORT_OPTIONS } from "../../lib/constants";
import type { SearchParams } from "../../lib/types";

interface Props {
  params: SearchParams;
  onFilterChange: (filters: Partial<SearchParams>) => void;
  isEnriching?: boolean;
}

export default function FilterPanel({ params, onFilterChange, isEnriching }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [priceMin, setPriceMin] = useState(
    params.price_min?.toString() ?? "",
  );
  const [priceMax, setPriceMax] = useState(
    params.price_max?.toString() ?? "",
  );
  const [wishMin, setWishMin] = useState(
    params.min_wish_count?.toString() ?? "",
  );

  const handleApplyPrice = () => {
    const clampPrice = (val: string) => {
      const num = parseInt(val, 10);
      if (isNaN(num) || num < 0) return undefined;
      return Math.min(num, 999_999_999);
    };
    const min = priceMin ? clampPrice(priceMin) : undefined;
    const max = priceMax ? clampPrice(priceMax) : undefined;
    onFilterChange({
      price_min: min,
      price_max: max !== undefined && min !== undefined && max < min ? min : max,
    });
  };

  const handleApplyWish = () => {
    const num = parseInt(wishMin, 10);
    onFilterChange({
      min_wish_count: !isNaN(num) && num > 0 ? num : undefined,
    });
  };

  const handleReset = () => {
    setPriceMin("");
    setPriceMax("");
    setWishMin("");
    onFilterChange({
      category: undefined,
      sort: undefined,
      only_free: undefined,
      price_min: undefined,
      price_max: undefined,
      min_wish_count: undefined,
    });
  };

  return (
    <div>
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border transition-colors",
            isOpen
              ? "bg-indigo-50 border-indigo-300 text-indigo-700"
              : "bg-white border-gray-300 text-gray-600 hover:bg-gray-50",
          )}
        >
          <Filter className="w-3.5 h-3.5" />
          {UI_TEXT.filter.filter}
        </button>

        {/* Sort dropdown inline */}
        <select
          value={params.sort ?? ""}
          onChange={(e) =>
            onFilterChange({ sort: e.target.value || undefined })
          }
          className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">{UI_TEXT.filter.sort}</option>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Free toggle */}
        <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-gray-300 bg-white text-gray-600 cursor-pointer hover:bg-gray-50">
          <input
            type="checkbox"
            checked={params.only_free ?? false}
            onChange={(e) =>
              onFilterChange({
                only_free: e.target.checked || undefined,
              })
            }
            className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
          />
          {UI_TEXT.filter.freeOnly}
        </label>

        {/* Active filter indicators */}
        {(params.category || params.price_min || params.price_max || params.min_wish_count) && (
          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-700"
          >
            <X className="w-3 h-3" />
            {UI_TEXT.filter.reset}
          </button>
        )}
      </div>

      {isOpen && (
        <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200 space-y-4">
          {/* Price range */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {UI_TEXT.filter.priceRange}
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="¥ 최소"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-gray-400">~</span>
              <input
                type="number"
                placeholder="¥ 최대"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={handleApplyPrice}
                className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
              >
                {UI_TEXT.filter.apply}
              </button>
            </div>
          </div>

          {/* Wish count filter */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-pink-500" />
              {UI_TEXT.filter.minWishCount}
              {isEnriching && (
                <span className="text-xs text-gray-400 font-normal ml-1">
                  (로딩 중...)
                </span>
              )}
            </h4>
            <div className="flex items-center gap-2">
              <input
                type="number"
                placeholder="0"
                min="0"
                value={wishMin}
                onChange={(e) => setWishMin(e.target.value)}
                className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <span className="text-xs text-gray-500">개 이상</span>
              <button
                onClick={handleApplyWish}
                className="px-3 py-1 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700"
              >
                {UI_TEXT.filter.apply}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
