import { useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { clsx } from "clsx";
import type { BoothItem } from "../../lib/types";

interface Props {
  item: BoothItem;
  favorited: boolean;
  onAdd: (item: BoothItem) => Promise<void>;
  onRemove: (itemId: number) => Promise<void>;
}

export default function FavoriteButton({ item, favorited, onAdd, onRemove }: Props) {
  const [isPending, setIsPending] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isPending) return;
    setIsPending(true);
    try {
      if (favorited) {
        await onRemove(item.id);
      } else {
        await onAdd(item);
      }
    } catch (err) {
      console.error("Favorite operation failed:", err);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={clsx(
        "p-1 rounded-md transition-colors shrink-0",
        isPending && "opacity-50 cursor-not-allowed",
        favorited
          ? "text-red-500 hover:text-red-600"
          : "text-gray-300 hover:text-red-400",
      )}
      title={favorited ? "즐겨찾기 제거" : "즐겨찾기 추가"}
      aria-label={favorited ? "즐겨찾기 제거" : "즐겨찾기 추가"}
    >
      {isPending ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Heart
          className="w-4 h-4"
          fill={favorited ? "currentColor" : "none"}
        />
      )}
    </button>
  );
}
