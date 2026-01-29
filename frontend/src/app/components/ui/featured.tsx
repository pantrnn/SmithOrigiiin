"use client";
import Link from "next/link";
import api from "../../../lib/axios";
import { motion } from "framer-motion";
import { AxiosError } from "axios";
import { ProductCard } from "./productcard";
import { ChevronRight, PackageX } from "lucide-react";
import { Product } from "../../../lib/product";
import React, { useState, useEffect } from "react";

interface Category {
  id: number;
  name: string;
  imageUrl: string | null;
  _count?: { products: number };
}

interface ProductsByCategory {
  [categoryId: number]: Product[];
}

interface ApiResponse<T> {
  data: T;
}

function ProductSkeleton() {
  return (
    <div className="flex flex-col gap-2 animate-pulse">
      <div className="relative w-full aspect-square bg-gray-200 rounded-lg overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/40 to-transparent animate-[shimmer_1.5s_infinite]" />
      </div>
      <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
      <div className="h-3 w-1/2 bg-gray-200 rounded"></div>
      <div className="h-4 w-2/3 bg-gray-200 rounded"></div>
    </div>
  );
}

function SkeletonGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
      {[...Array(12)].map((_, i) => (
        <ProductSkeleton key={i} />
      ))}
    </div>
  );
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function FeaturedProduct() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productsByCategory, setProductsByCategory] =
    useState<ProductsByCategory>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [activeTab, setActiveTab] = useState<
    "all" | "best-seller" | "new-product"
  >("all");

  const PRODUCTS_PER_ROW = 6;
  const MAX_ROWS = 7;
  const MAX_PRODUCTS = PRODUCTS_PER_ROW * MAX_ROWS;

  const tabItems: {
    id: "all" | "best-seller" | "new-product";
    label: string;
  }[] = [
    { id: "all", label: "All" },
    { id: "best-seller", label: "Best Seller" },
    { id: "new-product", label: "New Product" },
  ];

  useEffect(() => {
    void fetchData();
  }, []);

  const fetchData = async (): Promise<void> => {
    setLoading(true);
    setError("");
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get<ApiResponse<Product[]>>("/products?limit=100"),
        api.get<ApiResponse<Category[]>>("/categories"),
      ]);

      const products = productsRes.data.data;
      const cats = categoriesRes.data.data;

      const shuffledProducts = shuffleArray(products);
      setAllProducts(shuffledProducts);
      setCategories(cats);

      const grouped: ProductsByCategory = {};
      for (const p of shuffledProducts) {
        if (typeof p.categoryId !== "number") continue;
        if (!grouped[p.categoryId]) grouped[p.categoryId] = [];
        grouped[p.categoryId].push(p);
      }

      setProductsByCategory(grouped);
    } catch (e) {
      const err = e as AxiosError<{ message?: string }>;
      setError(err.response?.data?.message || "Gagal memuat produk");
      console.error("Failed to fetch data:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = (() => {
    switch (activeTab) {
      case "best-seller":
        return allProducts.filter((p) => p.isBestSeller);

      case "new-product":
        return [...allProducts].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

      default:
        return allProducts;
    }
  })();

  return (
    <div
      className="space-y-8 sm:space-y-10 lg:space-y-12"
      id="featured-product"
    >
      <h1 className="font-bold text-xl sm:text-2xl mb-2 px-4 sm:px-0">
        Featured Product
      </h1>

      {error ? (
        <div className="flex flex-col items-center gap-3 py-8">
          <p className="text-red-500 text-base md:text-lg">{error}</p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide px-4 sm:px-0">
              <div className="flex gap-4 sm:gap-6 min-w-max sm:min-w-0">
                {tabItems.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`pb-2 sm:pb-3 cursor-pointer relative text-sm sm:text-base font-medium transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "text-red-800"
                        : "text-gray-500 hover:text-red-800"
                    }`}
                    whileHover={{ scale: 1.05 }}
                  >
                    {tab.label}

                    {activeTab === tab.id && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-800"
                        layoutId="activeTab"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="px-4 sm:px-0">
                <SkeletonGrid />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="flex flex-col items-center gap-3 mt-20">
                <PackageX className="w-10 h-10 text-gray-300" />
                <p className="text-gray-500 text-base md:text-lg">
                  Tidak ada produk tersedia
                </p>
              </div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 px-4 sm:px-0"
              >
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            )}
          </div>

          <div className="space-y-8 sm:space-y-10 lg:space-y-12">
            {!loading &&
              categories.map((category) => {
                const products = productsByCategory[category.id] || [];
                if (products.length === 0) return null;

                const showAll = products.length > MAX_PRODUCTS;
                const visibleProducts = products.slice(0, MAX_PRODUCTS);

                return (
                  <div key={category.id} className="space-y-4 sm:space-y-6">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 px-4 sm:px-0">
                      {category.name}
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5 px-4 sm:px-0">
                      {visibleProducts.map((product) => (
                        <ProductCard key={product.id} product={product} />
                      ))}
                    </div>

                    {showAll && (
                      <div className="mt-6 sm:mt-8 text-center px-4 sm:px-0">
                        <Link href={`/user/store/category/${category.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-red-800 text-white rounded-full hover:bg-red-900 transition-colors font-semibold text-sm sm:text-base flex items-center justify-center gap-2 mx-auto"
                          >
                            <span>
                              View All {products.length} {category.name}
                            </span>
                            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                          </motion.button>
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
}