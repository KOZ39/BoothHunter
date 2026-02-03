import { memo } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import type { BoothItem } from "../../lib/types";
import { UI_TEXT } from "../../lib/constants";
import FavoriteButton from "../favorites/FavoriteButton";

interface Props {
  item: BoothItem;
  favorited: boolean;
  onAddFavorite: (item: BoothItem) => Promise<void>;
  onRemoveFavorite: (itemId: number) => Promise<void>;
}

export default memo(function ItemCard({ item, favorited, onAddFavorite, onRemoveFavorite }: Props) {
  const thumbnail = item.images[0] || "";
  const priceText =
    item.price === 0 ? UI_TEXT.item.free : `¥${item.price.toLocaleString()}`;

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
      <Link to={`/item/${item.id}`} className="block">
        <div className="aspect-square bg-gray-100 relative overflow-hidden">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={item.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              No Image
            </div>
          )}
        </div>
      </Link>
      <div className="p-3">
        <div className="flex items-start justify-between gap-1">
          <Link
            to={`/item/${item.id}`}
            className="text-sm font-medium text-gray-900 line-clamp-2 hover:text-indigo-600 flex-1"
          >
            {item.name}
          </Link>
          <FavoriteButton
            item={item}
            favorited={favorited}
            onAdd={onAddFavorite}
            onRemove={onRemoveFavorite}
          />
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span
            className={`text-sm font-bold ${item.price === 0 ? "text-green-600" : "text-gray-900"}`}
          >
            {priceText}
          </span>
          {item.shop_name && (
            <span className="text-xs text-gray-500 truncate max-w-[120px]">
              {item.shop_name}
            </span>
          )}
        </div>
        <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
          {item.category_name && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
              {item.category_name}
            </span>
          )}
          {item.wish_lists_count != null && (
            <span className="flex items-center gap-0.5 text-xs text-pink-500">
              <Heart className="w-3 h-3" fill="currentColor" />
              {item.wish_lists_count.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}, (prev, next) =>
  prev.item.id === next.item.id &&
  prev.item.name === next.item.name &&
  prev.item.price === next.item.price &&
  prev.item.shop_name === next.item.shop_name &&
  prev.item.category_name === next.item.category_name &&
  prev.item.wish_lists_count === next.item.wish_lists_count &&
  prev.favorited === next.favorited,
);
