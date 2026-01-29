"use client";
import Link from "next/link";
import Image from "next/image";
import { useAlert } from "./alert";
import { Product } from "../../../lib/product";
import { useFavorite } from "./favoritecontext";
import { AiOutlineHeart, AiFillHeart } from "react-icons/ai";

export function ProductCard({ product }: { product: Product }) {
  const { favoriteIds, toggleFavorite } = useFavorite();
  const { showAlert } = useAlert();
  const isFavorite = favoriteIds.includes(product.id);

  const hasDiscount = product.discount && product.discount > 0;
  const discountedPrice = hasDiscount
    ? product.price * (1 - product.discount! / 100)
    : product.price;

  const handleWishlistToggle = () => {
    const wasInWishlist = isFavorite;
    toggleFavorite(product.id);
    
    showAlert(
      wasInWishlist ? "Dihapus dari wishlist" : "Ditambahkan ke wishlist",
      wasInWishlist ? "error" : "success"
    );
  };

  return (
    <div className="w-full group/card relative">
      <Link href={`/user/product/${product.id}`}>
        <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-gray-300 transition-all duration-300 group">
          <Image
            src={product.imageUrl || "/placeholder.jpg"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 250px"
            className="object-cover group-hover:scale-105 transition duration-300"
            priority={false}
          />

          {hasDiscount && (
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded shadow-md">
              -{product.discount}%
            </div>
          )}
        </div>

        <div className="py-2 sm:py-3 space-y-0.5 sm:space-y-1">
          <p className="text-xs sm:text-sm lg:text-[15px] line-clamp-2 leading-snug">
            {product.name}
          </p>
          <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap">
            <h1 className="font-semibold text-sm sm:text-base lg:text-lg">
              Rp {discountedPrice.toLocaleString("id-ID")}
            </h1>
            {hasDiscount && (
              <h1 className="text-[10px] sm:text-xs lg:text-sm line-through text-gray-400">
                Rp {product.price.toLocaleString("id-ID")}
              </h1>
            )}
          </div>
        </div>
      </Link>

      <button
        onClick={handleWishlistToggle}
        className="w-full cursor-pointer bg-white border border-gray-300 rounded-full py-1.5 sm:py-2 mt-1 flex items-center justify-center gap-1.5 sm:gap-2 hover:bg-gray-50 active:scale-95 transition-all duration-200"
        aria-label={isFavorite ? "Remove from wishlist" : "Add to wishlist"}
      >
        {isFavorite ? (
          <AiFillHeart className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-red-500" />
        ) : (
          <AiOutlineHeart className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
        )}
        <span className="text-[11px] sm:text-sm font-medium">Wishlist</span>
      </button>
    </div>
  );
}