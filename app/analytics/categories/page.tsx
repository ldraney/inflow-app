"use client";

import { useEffect, useState } from "react";

interface CategorySummary {
  category_id: string;
  category_name: string;
  is_active: number;
  product_count: number;
  total_on_hand: number;
  total_available: number;
  total_on_order: number;
  total_reserved: number;
}

function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(num));
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/analytics/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        const data = await res.json();
        setCategories(data);
      } catch (err) {
        setError("Failed to load category summary");
      } finally {
        setLoading(false);
      }
    }
    fetchCategories();
  }, []);

  const totalProducts = categories.reduce((sum, c) => sum + c.product_count, 0);
  const totalOnHand = categories.reduce((sum, c) => sum + c.total_on_hand, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading category summary...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Category Summary</h1>
          <p className="text-gray-500">Inventory breakdown by category</p>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {categories.length}
            </div>
            <div className="text-xs text-gray-500">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {formatNumber(totalProducts)}
            </div>
            <div className="text-xs text-gray-500">Products</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(totalOnHand)}
            </div>
            <div className="text-xs text-gray-500">Total Stock</div>
          </div>
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
          No categories found.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <div
              key={category.category_id}
              className="bg-white shadow rounded-lg p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {category.category_name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {category.product_count} products
                  </p>
                </div>
                {category.is_active === 1 ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-green-100 text-green-800">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                    Inactive
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(category.total_on_hand)}
                  </div>
                  <div className="text-xs text-gray-500">On Hand</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {formatNumber(category.total_available)}
                  </div>
                  <div className="text-xs text-gray-500">Available</div>
                </div>
                <div>
                  <div className="text-lg font-medium text-blue-600">
                    {formatNumber(category.total_on_order)}
                  </div>
                  <div className="text-xs text-gray-500">On Order</div>
                </div>
                <div>
                  <div className="text-lg font-medium text-orange-600">
                    {formatNumber(category.total_reserved)}
                  </div>
                  <div className="text-xs text-gray-500">Reserved</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
